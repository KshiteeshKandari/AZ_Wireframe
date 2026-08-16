# AZ Companion — ADRD Case Management & AI Assistant

> A case management and AI-powered care coordination tool for Community Health Workers (CHWs) supporting families affected by Alzheimer's Disease and Related Dementias (ADRD).

---

## Overview

AZ Companion helps CHWs manage families across the full care lifecycle — from intake and case planning through to archiving closed cases. An integrated AI Chat assistant (backed by a Cloudflare Worker + GPT-5-nano) answers care-related questions using a curated ADRD knowledge base, and can surface relevant resources directly into a family's report.

---

## Features

- **Case Cards** — Track each family's phase, caregiver stress level, status, and timeline milestones. Maximize any card to edit intake info, resources, timeline, and AI summary in one place.
- **Intake Editor** — Structured intake form (patient profile, caregiver profile, focus areas, AI goal) pre-populated when editing an existing family. Saves back to the case and reflects everywhere.
- **AI Chat Assistant** — RAG-powered chat using a manually curated ADRD knowledge base, deployed as a Cloudflare Worker. Context-aware: pin a family to the chat and add AI-suggested resources directly to their Family Report.
- **Family Report** — Auto-generated bilingual (EN/ES) reports per family. Resources section updates live as resources are added via the AI Chat or the card editor.
- **Curated Resources** — Two-column library: ADRD Resources (book icon) and ASI General Recommended Practice (people icon). Resources can be added when closing a case.
- **Close Case Flow** — Guided archive dialog: auto-generates an anonymized case summary (editable before confirming), with clear options to close without saving, save to ADRD Resources, or save to ASI Practices.
- **My Cases Dashboard** — Overview of all active families with quick stats, status filters, and one-click jump to a case card.
- **Session Persistence** — App state persists across page refreshes via `sessionStorage`.

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

## Running Locally

No build step required — it's a static site.

```bash
# Clone the repo
git clone https://github.com/KshiteeshKandari/AZ_Wireframe.git
cd AZ_Wireframe

# Serve with any static server, e.g.:
npx serve .
# or
python -m http.server 5500
```

Open `http://localhost:5500` in your browser.

> The AI Chat will run in **offline / mock mode** by default if the Worker URL is unreachable. To disable live AI and always use mock responses, set `CHAT_WORKER_URL = ''` on line 10 of `app.js`.

## Project Structure

```
AZ_Wireframe/
├── index.html          # Single-page app shell
├── app.js              # All application logic and state
├── styles.css          # All styles
└── worker/             # Cloudflare Worker (AI Chat backend)
    ├── src/
    │   ├── index.js        # Request handler, CORS, rate limiting
    │   ├── embed-query.js  # Embeds incoming user question
    │   ├── retrieval.js    # Cosine similarity retrieval over chunks
    │   ├── prompt.js       # System prompt builder
    │   └── rate-limit.js   # Per-IP KV-based rate limiter
    ├── data/
    │   ├── manual-chunks.json      # Chunked ADRD knowledge base
    │   └── manual-embeddings.json  # Pre-computed embeddings
    ├── scripts/
    │   ├── chunk-manual.js   # Preprocessing: text → chunks
    │   └── embed-chunks.js   # Preprocessing: chunks → embeddings
    └── wrangler.toml
```
