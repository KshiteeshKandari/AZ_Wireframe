// One-time script: calls OpenAI to embed the curated ASI chunks (Verified Resources, Peer Practices).
// Run: node --env-file=.env scripts/embed-curated.js   (reads OPENAI_API_KEY from worker/.env)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 100;

const DOCS = [
  {
    chunksPath: path.join(__dirname, '..', 'data', 'verified-resources-chunks.json'),
    outPath: path.join(__dirname, '..', 'data', 'verified-resources-embeddings.json')
  },
  {
    chunksPath: path.join(__dirname, '..', 'data', 'peer-practices-chunks.json'),
    outPath: path.join(__dirname, '..', 'data', 'peer-practices-embeddings.json')
  }
];

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
  for (const doc of DOCS) {
    const chunks = JSON.parse(fs.readFileSync(doc.chunksPath, 'utf8'));
    const results = [];
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(batch.map(c => c.text));
      batch.forEach((chunk, j) => {
        results.push({ ...chunk, embedding: embeddings[j] });
      });
      console.log(`Embedded ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} for ${path.basename(doc.chunksPath)}`);
    }
    fs.writeFileSync(doc.outPath, JSON.stringify(results));
    console.log(`Wrote ${results.length} embedded chunks to ${doc.outPath}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
