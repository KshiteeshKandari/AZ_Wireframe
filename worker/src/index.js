import { embedQuery } from './embed-query.js';
import { retrieveTopChunks } from './retrieval.js';
import { buildSystemPrompt } from './prompt.js';
import { buildReportSystemPrompt } from './report-prompt.js';
import { buildCloseSummaryPrompt } from './close-summary-prompt.js';
import { isRateLimited } from './rate-limit.js';

const MAX_QUESTION_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 4000; // app-generated (case info + recent chat), not raw user input - truncate rather than reject
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
// resource card, even if they're ASI-flagged and happened to land in the top-K.
const ASI_RESOURCE_SCORE_THRESHOLD = 0.3;
const MAX_CITED_RESOURCES = 3;

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

      const { question, context } = body;

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

      const queryEmbedding = await embedQuery(question, env);
      const topChunks = retrieveTopChunks(queryEmbedding, 5);
      const systemPrompt = buildSystemPrompt(topChunks, safeContext);
      const answer = await askOpenAI(systemPrompt, question, env);

      // Surface every ASI-flagged chunk that was actually retrieved for this question
      // (not just ones the model happened to quote) so the frontend can offer a resource
      // card + "Add to Family Report" for anything relevant - capped so the chat doesn't
      // get cluttered with marginal matches.
      const resources = topChunks
        .filter(c => c.asiApproved && c.score >= ASI_RESOURCE_SCORE_THRESHOLD)
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
