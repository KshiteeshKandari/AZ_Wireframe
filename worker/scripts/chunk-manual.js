// One-time script: turns the extracted manual text into retrieval-sized chunks.
// Run: node worker/scripts/chunk-manual.js
const fs = require('fs');
const path = require('path');

const RAW_TEXT_PATH = path.join(__dirname, 'tmp', 'manual.txt');
const OUT_PATH = path.join(__dirname, '..', 'data', 'manual-chunks.json');
const TARGET_CHARS = 2400; // ~600 tokens per chunk
const OVERLAP_CHARS = 300; // keep some context continuity between chunks

const FOOTER_PATTERN = /^.?2002.2022 University of Minnesota and Savvy Systems, LLC\.? ?U?s?e? ?w?i?t?h? ?P?e?r?m?i?s?s?i?o?n? ?O?n?l?y?\.? ?All Rights Reserved\.?$/i;

function stripBoilerplate(pageText) {
  return pageText
    .split('\n')
    .filter(line => !FOOTER_PATTERN.test(line.trim()) && !/^\d{1,3}$/.test(line.trim()))
    .join('\n');
}

function chunkPageText(pageText, pageNum, chunks) {
  const paragraphs = pageText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  let buffer = '';
  for (const para of paragraphs) {
    if (buffer.length + para.length > TARGET_CHARS && buffer.length > 0) {
      chunks.push({ page: pageNum, text: buffer.trim() });
      const tail = buffer.slice(-OVERLAP_CHARS);
      const wordBoundary = tail.indexOf(' '); // avoid starting the overlap mid-word
      buffer = wordBoundary > -1 ? tail.slice(wordBoundary + 1) : tail;
    }
    buffer += (buffer ? '\n\n' : '') + para;
  }
  if (buffer.trim()) {
    chunks.push({ page: pageNum, text: buffer.trim() });
  }
}

const raw = fs.readFileSync(RAW_TEXT_PATH, 'utf8');
const pages = raw.split('\f');

const chunks = [];
pages.forEach((pageText, idx) => {
  const cleaned = stripBoilerplate(pageText.replace(/\r/g, '')).trim();
  if (cleaned.length < 40) return; // skip near-empty pages (covers, blank separators)
  chunkPageText(cleaned, idx + 1, chunks);
});

chunks.forEach((c, i) => { c.id = i; });

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(chunks, null, 2));

console.log(`Wrote ${chunks.length} chunks from ${pages.length} raw page segments to ${OUT_PATH}`);
console.log('Avg chunk length (chars):', Math.round(chunks.reduce((s, c) => s + c.text.length, 0) / chunks.length));
