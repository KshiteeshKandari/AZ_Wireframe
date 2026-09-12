import { embedQuery } from './embed-query.js';
import { retrieveSplitChunks, findAsiChunk } from './retrieval.js';
import { buildSystemPrompt } from './prompt.js';
import { buildReportSystemPrompt } from './report-prompt.js';
import { buildCloseSummaryPrompt } from './close-summary-prompt.js';
import { isRateLimited } from './rate-limit.js';

const MAX_QUESTION_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 4000;
const MAX_RETRIEVAL_HINT_LENGTH = 500;
const MAX_REPORT_CONTEXT_LENGTH = 12000;
const MAX_CLOSE_SUMMARY_CONTEXT_LENGTH = 12000;

// --- Model routing ---
// Fast (non-reasoning): used for factual lookups, case-fact questions, simple "what is X".
// No hidden reasoning tokens → responds in ~300-500ms with streaming.
const FAST_MODEL = 'gpt-4o-mini';
const FAST_MAX_TOKENS = 1500;
// Reasoning: used for care plans, multi-step strategy, synthesis across case + manual.
// reasoning_effort:'low' is the minimum reliable setting — 'minimal' produced self-contradictory
// answers. 3000 gives enough headroom that reasoning token variance doesn't crowd out the answer.
const REASONING_MODEL = 'gpt-5-nano';
const MAX_RESPONSE_TOKENS = 3000;
// Defense in depth: if reasoning ate the entire budget (empty visible output), retry once with
// more headroom. The streaming path detects this by counting emitted tokens.
const RETRY_RESPONSE_TOKENS = 4500;

const MAX_REPORT_RESPONSE_TOKENS = 3000;
const MAX_CLOSE_SUMMARY_RESPONSE_TOKENS = 800;
const ASI_RESOURCE_SCORE_THRESHOLD = 0.45;
const MAX_CITED_RESOURCES = 3;
const MANUAL_EXCERPT_COUNT = 5;

// Heuristic classifier: routes to the reasoning model when the question is long (>25 words) or
// explicitly asks for synthesis, planning, or multi-step analysis. Everything else goes to the
// fast model. Zero added latency — runs before any API call.
const REASONING_PATTERNS = /\b(create a|develop a|build a|generate a|design a|care plan|action plan|step[\s-]by[\s-]step|comprehensive|detailed|in[\s-]depth|full guide|action items|walk me through|analy[sz]e|compare|full assessment|everything about|guide me through|give me a plan|strategic plan|strategy)\b/i;
function requiresReasoning(question) {
  return REASONING_PATTERNS.test(question) ||
    question.trim().split(/\s+/).filter(Boolean).length > 25;
}

// CORS: echo back the request's Origin only if it's in the allow-list.
function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(o => o.trim());
  const origin = request.headers.get('Origin');
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// Vague follow-up detection: short questions with pronouns/continuations borrow the prior 2
// messages for retrieval enrichment (but NOT for the model prompt — the user's exact words stay).
const VAGUE_MAX_WORDS = 12;
const VAGUE_PATTERNS = [
  /\b(this|that|these|those|it)\b/i,
  /\b(more|else|further|elaborat\w*|expand)\b/i,
  /^\s*(and|so|okay|ok|what about|why|how (so|come))\b/i
];
function isVagueFollowUp(question) {
  const wordCount = question.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > VAGUE_MAX_WORDS) return false;
  return VAGUE_PATTERNS.some(re => re.test(question));
}

// Crisis override: the hotline chunk is too short to win cosine similarity — force it in if any
// crisis keywords appear in the question or recent context.
const CRISIS_PATTERNS = [
  /\bsuicid\w*/i,
  /\bkill(ing)?\s+(myself|herself|himself|themselves|yourself)\b/i,
  /\b(end|ending)\s+(my|her|his|their|your)\s+life\b/i,
  /\bnot\s+want(ing)?\s+to\s+live\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be here)\b/i,
  /\bwant(s|ing)?\s+to\s+die\b/i,
  /\bself[- ]harm\w*/i,
  /\bharm(ing)?\s+(myself|herself|himself|themselves|yourself)\b/i
];
function mentionsCrisisRisk(...texts) {
  return texts.some(t => t && CRISIS_PATTERNS.some(re => re.test(t)));
}

// Parses OpenAI's Server-Sent Events stream into plain JSON objects.
// Yields one parsed chunk per "data: {...}" line; stops on "[DONE]".
async function* parseSSEChunks(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') return;
        try { yield JSON.parse(payload); } catch { /* skip malformed SSE chunk */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Calls OpenAI with stream:true and returns the raw response body for parseSSEChunks.
async function fetchOpenAIStream(model, maxTokens, reasoningEffort, systemPrompt, question, env) {
  const body = {
    model,
    max_completion_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ]
  };
  if (reasoningEffort) body.reasoning_effort = reasoningEffort;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  return res.body;
}

// Non-streaming call used by generate_report and generate_close_summary (both need full JSON
// output before we can send anything — no benefit from streaming there).
async function callOpenAIJSON(model, maxTokens, reasoningEffort, systemPrompt, userContent, env, responseFormat) {
  const body = {
    model,
    max_completion_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ]
  };
  if (reasoningEffort) body.reasoning_effort = reasoningEffort;
  if (responseFormat) body.response_format = responseFormat;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices[0].message.content || '';
}

async function generateReport(reportContext, env) {
  const raw = await callOpenAIJSON(
    REASONING_MODEL, MAX_REPORT_RESPONSE_TOKENS, 'low',
    buildReportSystemPrompt(), reportContext, env,
    { type: 'json_object' }
  );
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { throw new Error('Report generation returned invalid JSON'); }
  if (!parsed || typeof parsed.en !== 'string' || typeof parsed.es !== 'string') {
    throw new Error('Report generation returned an unexpected shape');
  }
  return parsed;
}

async function generateCloseSummary(caseContext, env) {
  const raw = await callOpenAIJSON(
    REASONING_MODEL, MAX_CLOSE_SUMMARY_RESPONSE_TOKENS, 'low',
    buildCloseSummaryPrompt(), caseContext, env,
    { type: 'json_object' }
  );
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { throw new Error('Close summary generation returned invalid JSON'); }
  if (!parsed || typeof parsed.title !== 'string' || typeof parsed.content !== 'string') {
    throw new Error('Close summary generation returned an unexpected shape');
  }
  return parsed;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request, env) });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders(request, env) });
    }

    try {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (await isRateLimited(ip, env)) {
        return new Response(JSON.stringify({ error: 'Too many requests, please slow down.' }), {
          status: 429,
          headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }

      const body = await request.json();

      // --- generate_report (non-streaming JSON) ---
      if (body && body.action === 'generate_report') {
        const reportContext = typeof body.reportContext === 'string' ? body.reportContext.trim() : '';
        if (!reportContext) {
          return new Response(JSON.stringify({ error: 'Missing report context' }), {
            status: 400, headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
          });
        }
        const { en, es } = await generateReport(reportContext.slice(0, MAX_REPORT_CONTEXT_LENGTH), env);
        return new Response(JSON.stringify({ reportContent: en, reportContentEs: es }), {
          headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }

      // --- generate_close_summary (non-streaming JSON) ---
      if (body && body.action === 'generate_close_summary') {
        const caseContext = typeof body.caseContext === 'string' ? body.caseContext.trim() : '';
        if (!caseContext) {
          return new Response(JSON.stringify({ error: 'Missing case context' }), {
            status: 400, headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
          });
        }
        const { title, content } = await generateCloseSummary(caseContext.slice(0, MAX_CLOSE_SUMMARY_CONTEXT_LENGTH), env);
        return new Response(JSON.stringify({ title, content }), {
          headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }

      // --- Chat (streaming NDJSON) ---
      const { question, context, retrievalHint } = body;

      if (!question || typeof question !== 'string' || !question.trim()) {
        return new Response(JSON.stringify({ error: 'Missing question' }), {
          status: 400, headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }
      if (question.length > MAX_QUESTION_LENGTH) {
        return new Response(JSON.stringify({ error: 'Question too long' }), {
          status: 400, headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }

      const safeContext = typeof context === 'string' ? context.slice(0, MAX_CONTEXT_LENGTH) : '';
      const safeRetrievalHint = typeof retrievalHint === 'string' ? retrievalHint.slice(0, MAX_RETRIEVAL_HINT_LENGTH) : '';
      const retrievalQuery = (safeRetrievalHint && isVagueFollowUp(question))
        ? `${safeRetrievalHint}\n${question}`
        : question;

      // Retrieval (same split-lane design as before)
      const queryEmbedding = await embedQuery(retrievalQuery, env);
      const { manualChunks, asiChunks } = retrieveSplitChunks(queryEmbedding, {
        manualK: MANUAL_EXCERPT_COUNT,
        asiK: MAX_CITED_RESOURCES,
        asiThreshold: ASI_RESOURCE_SCORE_THRESHOLD
      });

      if (mentionsCrisisRisk(question, safeContext)) {
        const crisisChunk = findAsiChunk(/suicide prevention lifeline/i);
        if (crisisChunk && !asiChunks.some(c => c.id === crisisChunk.id)) {
          asiChunks.unshift(crisisChunk);
        }
      }

      const systemPrompt = buildSystemPrompt([...manualChunks, ...asiChunks], safeContext);

      // Model routing
      const useReasoning = requiresReasoning(question);
      const chatModel = useReasoning ? REASONING_MODEL : FAST_MODEL;
      const maxTok = useReasoning ? MAX_RESPONSE_TOKENS : FAST_MAX_TOKENS;
      const reasoningEffort = useReasoning ? 'low' : undefined;

      // Resources are ready now — send them to the client before waiting for the LLM
      const resources = asiChunks
        .slice(0, MAX_CITED_RESOURCES)
        .map(c => ({ id: c.id, source: c.source }));

      const encoder = new TextEncoder();
      const cors = corsHeaders(request, env);

      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Line 1: resources + which model was selected (client uses this for the badge)
            controller.enqueue(encoder.encode(
              JSON.stringify({ type: 'resources', data: resources, model: useReasoning ? 'reasoning' : 'fast' }) + '\n'
            ));

            // Stream the answer
            const sseBody = await fetchOpenAIStream(chatModel, maxTok, reasoningEffort, systemPrompt, question, env);
            let totalText = '';
            for await (const chunk of parseSSEChunks(sseBody)) {
              const delta = chunk.choices?.[0]?.delta?.content ?? '';
              if (delta) {
                totalText += delta;
                controller.enqueue(encoder.encode(JSON.stringify({ type: 'token', text: delta }) + '\n'));
              }
            }

            // Retry: reasoning model sometimes uses its entire token budget on hidden reasoning,
            // leaving zero visible tokens. Detect and retry with more headroom — transparently,
            // so the client just sees more tokens arriving after a short pause.
            if (!totalText.trim() && useReasoning) {
              const retryBody = await fetchOpenAIStream(REASONING_MODEL, RETRY_RESPONSE_TOKENS, 'low', systemPrompt, question, env);
              for await (const chunk of parseSSEChunks(retryBody)) {
                const delta = chunk.choices?.[0]?.delta?.content ?? '';
                if (delta) {
                  controller.enqueue(encoder.encode(JSON.stringify({ type: 'token', text: delta }) + '\n'));
                }
              }
            }

            controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'));
          } catch (err) {
            controller.enqueue(encoder.encode(
              JSON.stringify({ type: 'error', message: 'Something went wrong' }) + '\n'
            ));
          }
          controller.close();
        }
      });

      return new Response(readable, {
        headers: {
          ...cors,
          'Content-Type': 'application/x-ndjson',
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff'
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Something went wrong' }), {
        status: 500,
        headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
      });
    }
  }
};
