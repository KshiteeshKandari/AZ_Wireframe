# AZ Companion — ADRD Case Management & AI Assistant

> A case management and AI-powered care coordination tool for Community Health Workers (CHWs) supporting families affected by Alzheimer's Disease and Related Dementias (ADRD).

---

## Overview

AZ Companion helps CHWs manage families across the full care lifecycle, from intake and case planning through to archiving closed cases. An integrated AI Chat assistant (backed by a Cloudflare Worker and GPT-5-nano) answers care-related questions using a curated ADRD knowledge base and can generate a real, personalized family report from the conversation.

---

## Features

- **Case Cards** — Track each family's phase, caregiver stress level, status, and timeline milestones. Maximize any card to edit intake info, resources, timeline, AI summary, and notes in one place.
- **Intake Editor** — Structured intake form (patient profile, caregiver profile, focus areas, AI goal) pre-populated when editing an existing family. Saves back to the case and reflects everywhere.
- **AI Chat Assistant** — RAG-powered chat over a curated knowledge base (the ADRD care manual, plus separately curated ASI Verified Resources and ASI Peer Practices docs), deployed as a Cloudflare Worker. Answers built from the ASI-curated sources are labeled **"ASI Approved"** in-chat.
- **Highlight-to-Notes** — Select any text in an AI Chat message and click the notes button in the chat header to add it straight to that family's Notes.
- **Notes Tab** — A dedicated, freely editable Notes tab in the maximized Case Card editor, populated by the highlight-to-notes button or typed directly.
- **Family Report Generation** — Generates a real, bilingual (EN/ES) report per family from the worker, synthesized from the family's Case Card info, CHW notes, and full AI Chat transcript, matching a fixed letter-style format (greeting, numbered action items, next check-up). A **Regenerate** action rebuilds the report on demand using any new info added since the last generation. Resources section updates live as resources are added via the AI Chat or the card editor.
- **Curated Resources** — Two-column library seeded from the ASI Verified Resources and ASI Peer Practices docs, each tagged "ASI Approved". Additional resources can be contributed when closing a case.
- **My Cases Dashboard** — Overview of all active families with quick stats, status filters, and one-click jump to a case card.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (no framework) |
| AI Chat Backend | Cloudflare Worker (ES Modules) |
| LLM | OpenAI GPT-5-nano (reasoning model) |
| Embeddings | OpenAI `text-embedding-3-small` |
| Rate Limiting | Cloudflare KV |
| Hosting | GitHub Pages |

---
> The AI Chat will run in **offline / mock mode** by default if the Worker URL is unreachable. To disable live AI and always use mock responses, set `CHAT_WORKER_URL = ''` on line 10 of `app.js`.

## Project Structure

```
AZ_Wireframe/
├── index.html          # Single-page app shell
├── app.js              # All application logic and state
├── styles.css          # All styles
└── worker/             # Cloudflare Worker (AI Chat backend)
    ├── src/
    │   ├── index.js                # Request handler, CORS, rate limiting, chat + report + close-summary routes
    │   ├── embed-query.js          # Embeds incoming user question
    │   ├── retrieval.js            # Cosine similarity retrieval, merged across manual + curated sources
    │   ├── prompt.js               # Chat system prompt builder (source-aware, ASI Approved labeling, family context)
    │   ├── report-prompt.js        # Family report system prompt builder (bilingual, structured letter format)
    │   ├── close-summary-prompt.js # Anonymized case study prompt for close-case archiving
    │   └── rate-limit.js           # Per-IP KV-based rate limiter
    ├── data/
    │   ├── manual-chunks.json                  # Chunked ADRD manual knowledge base
    │   ├── manual-embeddings.json               # Pre-computed embeddings
    │   ├── verified-resources-chunks.json       # Chunked ASI Verified Resources doc
    │   ├── verified-resources-embeddings.json   # Pre-computed embeddings
    │   ├── peer-practices-chunks.json           # Chunked ASI Peer Practices doc
    │   └── peer-practices-embeddings.json       # Pre-computed embeddings
    ├── scripts/
    │   ├── chunk-manual.js    # Preprocessing: manual text to chunks
    │   ├── embed-chunks.js    # Preprocessing: manual chunks to embeddings
    │   ├── chunk-curated.js   # Preprocessing: curated docs to chunks
    │   └── embed-curated.js   # Preprocessing: curated chunks to embeddings
    └── wrangler.toml
```
