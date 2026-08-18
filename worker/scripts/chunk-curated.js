// One-time script: turns the curated ASI docs (Verified Resources, Peer Practices)
// into retrieval-sized chunks, one chunk per numbered list item.
// Run: node worker/scripts/chunk-curated.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOCS = [
  {
    key: 'verified-resources',
    rawPath: path.join(__dirname, 'tmp', 'verified-resources.txt'),
    outPath: path.join(__dirname, '..', 'data', 'verified-resources-chunks.json'),
    type: 'resource'
  },
  {
    key: 'peer-practices',
    rawPath: path.join(__dirname, 'tmp', 'peer-practices.txt'),
    outPath: path.join(__dirname, '..', 'data', 'peer-practices-chunks.json'),
    type: 'practice'
  }
];

function chunkDoc(raw) {
  // Drop the title lines before the first numbered item, then split on "N. " at line start.
  const firstMatch = raw.search(/^\d+\.\s/m);
  const body = firstMatch > -1 ? raw.slice(firstMatch) : raw;
  const parts = body.split(/\n(?=\d+\.\s)/).map(p => p.trim()).filter(Boolean);
  return parts.map(text => text.replace(/\s+/g, ' ').trim());
}

for (const doc of DOCS) {
  const raw = fs.readFileSync(doc.rawPath, 'utf8').replace(/\r/g, '');
  const items = chunkDoc(raw);
  const chunks = items.map((text, i) => ({
    id: `${doc.key}-${i}`,
    source: doc.key,
    type: doc.type,
    asiApproved: true,
    text
  }));
  fs.mkdirSync(path.dirname(doc.outPath), { recursive: true });
  fs.writeFileSync(doc.outPath, JSON.stringify(chunks, null, 2));
  console.log(`Wrote ${chunks.length} chunks for ${doc.key} to ${doc.outPath}`);
}
