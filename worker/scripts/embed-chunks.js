// One-time script: calls OpenAI to embed every manual chunk, writes vectors alongside the text.
// Run: npm run embed   (reads OPENAI_API_KEY from worker/.env)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHUNKS_PATH = path.join(__dirname, '..', 'data', 'manual-chunks.json');
const OUT_PATH = path.join(__dirname, '..', 'data', 'manual-embeddings.json');
const MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 100;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY. Copy worker/.env.example to worker/.env and fill it in.');
  process.exit(1);
}

async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: texts, model: MODEL })
  });
  if (!res.ok) {
    throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json.data.map(d => d.embedding);
}

async function main() {
  const chunks = JSON.parse(fs.readFileSync(CHUNKS_PATH, 'utf8'));
  const results = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embeddings = await embedBatch(batch.map(c => c.text));
    batch.forEach((chunk, j) => {
      results.push({ id: chunk.id, page: chunk.page, text: chunk.text, embedding: embeddings[j] });
    });
    console.log(`Embedded ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length}`);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(results));
  console.log(`Wrote ${results.length} embedded chunks to ${OUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
