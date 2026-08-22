import { embedQuery } from './embed-query.js';
import { retrieveSplitChunks, findAsiChunk } from './retrieval.js';
import { buildSystemPrompt } from './prompt.js';
import { buildReportSystemPrompt } from './report-prompt.js';
import { buildCloseSummaryPrompt } from './close-summary-prompt.js';
import { isRateLimited } from './rate-limit.js';

const MAX_QUESTION_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 4000; // app-generated (case info + recent chat), not raw user input - truncate rather than reject
const MAX_RETRIEVAL_HINT_LENGTH = 500; // app-generated (prior 2 messages), only ever used to enrich the retrieval embedding
const MAX_REPORT_CONTEXT_LENGTH = 12000; // report generation needs the full case + chat transcript, not just a tail
const MAX_CLOSE_SUMMARY_CONTEXT_LENGTH = 12000;
const OPENAI_CHAT_MODEL = 'gpt-5-nano';
// gpt-5-nano is a reasoning model: max_completion_tokens covers hidden reasoning tokens
// AND the visible answer. reasoning_effort 'minimal' avoided that but produced unreliable,
// occasionally self-contradictory answers; 'low' + a bigger budget is consistently clean.
const MAX_RESPONSE_TOKENS = 1500;
const MAX_REPORT_RESPONSE_TOKENS = 3000; // two full HTML letters (en + es) in one JSON response
const MAX_CLOSE_SUMMARY_RESPONSE_TOKENS = 800;
// Chunks below this cosine similarity aren't relevant enough to surface as a suggested
// resource card. Also used as the ASI-lane cutoff in retrieveSplitChunks - see retrieval.js.
// 0.45, not 0.3: once the ASI lane is ranked on its own (see retrieveSplitChunks) it no longer
// has to out-score manual chunks to pass this bar, so a lower threshold let same-domain noise
// through - e.g. an accusation-handling chunk scoring 0.44 against an unrelated sundowning
// question, purely from shared caregiving vocabulary. Live-tested across 5 queries: genuine
// top matches scored 0.49-0.54, the best (wrong) match on an off-topic query topped out at
// 0.44 - 0.45 cleanly separates the two.
const ASI_RESOURCE_SCORE_THRESHOLD = 0.45;
const MAX_CITED_RESOURCES = 3;
// How many manual chunks to pull into the answer's excerpts, ranked separately from the ASI
// lane - see retrieveSplitChunks in retrieval.js for why the two pools are kept apart. Kept at
// 5 (not trimmed to make room for the ASI lane) because the two pools are fully independent now
// - shrinking this doesn't help ASI surfacing, it only starves the model of grounding material
// and produces thinner answers. Answer richness depends on this number, so don't lower it to
// "balance" against asiK.
const MANUAL_EXCERPT_COUNT = 5;

// ALLOWED_ORIGIN is a comma-separated list (e.g. production + localhost for dev).
// Echo back the request's Origin only if it's on the list - never wildcard, and
// never trust an Origin that isn't an exact match.
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

// Guardrail for the retrieval-hint blend below: only treat a question as a vague follow-up
// (and worth borrowing the prior 2 messages for) when it's short AND leans on a pronoun/
// demonstrative or a bare continuation phrase with no topic of its own, e.g. "can you tell
// me more about this?" or "why?". Longer or self-contained questions carry their own topical
// signal and retrieve best standalone - blending in an unrelated prior turn can drag the
// embedding away from a chunk that would otherwise rank first (observed live: a doctor-visits
// follow-up buried its own top-ranked ASI resource this way once an unrelated hint was added).
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

// Safety guardrail, independent of retrieval ranking: the suicide/crisis hotline is a short,
// sparse chunk that can't win a cosine-similarity contest against long manual passages, so it
// can legitimately fall outside the top-5 pool the resource card is drawn from even when the
// question is explicitly about suicidal ideation. That's not acceptable for a crisis resource -
// if the message mentions suicide/self-harm, surface the hotline unconditionally rather than
// leaving it to embedding rank.
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

async function askOpenAI(systemPrompt, question, env) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      max_completion_tokens: MAX_RESPONSE_TOKENS,
      reasoning_effort: 'low',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices[0].message.content;
}

async function generateReport(reportContext, env) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      max_completion_tokens: MAX_REPORT_RESPONSE_TOKENS,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildReportSystemPrompt() },
        { role: 'user', content: reportContext }
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const raw = json.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error('Report generation returned invalid JSON');
  }
  if (!parsed || typeof parsed.en !== 'string' || typeof parsed.es !== 'string') {
    throw new Error('Report generation returned an unexpected shape');
  }
  return parsed;
}

async function generateCloseSummary(caseContext, env) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      max_completion_tokens: MAX_CLOSE_SUMMARY_RESPONSE_TOKENS,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildCloseSummaryPrompt() },
        { role: 'user', content: caseContext }
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const raw = json.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error('Close summary generation returned invalid JSON');
  }
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

      if (body && body.action === 'generate_report') {
        const reportContext = typeof body.reportContext === 'string' ? body.reportContext.trim() : '';
        if (!reportContext) {
          return new Response(JSON.stringify({ error: 'Missing report context' }), {
            status: 400,
            headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
          });
        }
        const safeReportContext = reportContext.slice(0, MAX_REPORT_CONTEXT_LENGTH);
        const { en, es } = await generateReport(safeReportContext, env);
        return new Response(JSON.stringify({ reportContent: en, reportContentEs: es }), {
          headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }

      if (body && body.action === 'generate_close_summary') {
        const caseContext = typeof body.caseContext === 'string' ? body.caseContext.trim() : '';
        if (!caseContext) {
          return new Response(JSON.stringify({ error: 'Missing case context' }), {
            status: 400,
            headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
          });
        }
        const safeCaseContext = caseContext.slice(0, MAX_CLOSE_SUMMARY_CONTEXT_LENGTH);
        const { title, content } = await generateCloseSummary(safeCaseContext, env);
        return new Response(JSON.stringify({ title, content }), {
          headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }

      const { question, context, retrievalHint } = body;

      if (!question || typeof question !== 'string' || !question.trim()) {
        return new Response(JSON.stringify({ error: 'Missing question' }), {
          status: 400,
          headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }
      if (question.length > MAX_QUESTION_LENGTH) {
        return new Response(JSON.stringify({ error: 'Question too long' }), {
          status: 400,
          headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
        });
      }

      // Per-family context window (case info + recent conversation) - optional, app-generated.
      const safeContext = typeof context === 'string' ? context.slice(0, MAX_CONTEXT_LENGTH) : '';

      // The last 2 messages before this question, used ONLY to enrich the retrieval
      // embedding - a vague follow-up like "can you tell me more about this?" has no
      // topical signal on its own, so folding in the prior turn gives retrieval something
      // to match against. The model-facing question below stays exactly what the user typed.
      const safeRetrievalHint = typeof retrievalHint === 'string' ? retrievalHint.slice(0, MAX_RETRIEVAL_HINT_LENGTH) : '';
      // Only blend the hint in when the question itself is too vague to retrieve well alone -
      // see isVagueFollowUp above.
      const retrievalQuery = (safeRetrievalHint && isVagueFollowUp(question))
        ? `${safeRetrievalHint}\n${question}`
        : question;

      const queryEmbedding = await embedQuery(retrievalQuery, env);
      // Manual and ASI chunks are ranked as separate pools so the 13 short ASI chunks don't
      // have to out-score the 291-chunk manual corpus to be surfaced - see retrieveSplitChunks
      // in retrieval.js for the full rationale.
      const { manualChunks, asiChunks } = retrieveSplitChunks(queryEmbedding, {
        manualK: MANUAL_EXCERPT_COUNT,
        asiK: MAX_CITED_RESOURCES,
        asiThreshold: ASI_RESOURCE_SCORE_THRESHOLD
      });

      // Crisis override: if the question or recent context signals suicidal ideation/self-harm,
      // force the crisis hotline chunk into the ASI lane ahead of whatever retrieval ranked -
      // see mentionsCrisisRisk above. Checked against the question and the app-supplied context
      // (recent conversation) so a same-turn disclosure is always caught. This still matters
      // even with the split lane: the hotline is short enough that it doesn't reliably win the
      // top-3 ASI-only ranking either (a longer, adjacent-topic peer practice can out-score it).
      if (mentionsCrisisRisk(question, safeContext)) {
        const crisisChunk = findAsiChunk(/suicide prevention lifeline/i);
        if (crisisChunk && !asiChunks.some(c => c.id === crisisChunk.id)) {
          asiChunks.unshift(crisisChunk);
        }
      }

      const systemPrompt = buildSystemPrompt([...manualChunks, ...asiChunks], safeContext);
      const answer = await askOpenAI(systemPrompt, question, env);

      // Resource cards come straight from the ASI lane, already score-gated and capped above -
      // no longer dependent on whether an ASI chunk also survived a merged top-K with manual
      // content.
      const resources = asiChunks
        .slice(0, MAX_CITED_RESOURCES)
        .map(c => ({ id: c.id, source: c.source }));

      return new Response(JSON.stringify({ answer, resources }), {
        headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Something went wrong' }), {
        status: 500,
        headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' }
      });
    }
  }
};
