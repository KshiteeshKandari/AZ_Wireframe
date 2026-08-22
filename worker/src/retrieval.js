import manualChunks from '../data/manual-embeddings.json';
import verifiedResourcesChunks from '../data/verified-resources-embeddings.json';
import peerPracticesChunks from '../data/peer-practices-embeddings.json';

// Manual chunks have no explicit source/asiApproved tag - default them here so every
// chunk in the merged pool has a consistent shape for the prompt builder.
const ALL_CHUNKS = [
  ...manualChunks.map(c => ({ ...c, source: 'manual', asiApproved: false })),
  ...verifiedResourcesChunks,
  ...peerPracticesChunks
];

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Returns the topK chunks whose stored vector is closest to the question's vector,
// pooled across the manual and the two ASI-curated docs (verified resources, peer practices).
export function retrieveTopChunks(queryEmbedding, topK = 5) {
  const scored = ALL_CHUNKS.map(chunk => ({
    id: chunk.id,
    page: chunk.page,
    text: chunk.text,
    source: chunk.source,
    type: chunk.type,
    asiApproved: !!chunk.asiApproved,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// Ranks the manual chunks and the ASI-curated chunks (verified-resources + peer-practices)
// as two SEPARATE pools instead of one flat merged ranking. The 13 ASI chunks are short and
// terse (often just a name/phone number + a sentence) and structurally can't out-score long,
// descriptive manual passages on cosine similarity - in a merged top-K, a genuinely relevant
// ASI resource routinely loses to a longer manual excerpt that's merely adjacent in topic.
// Splitting the pools means ASI content only has to compete against the other 12 ASI chunks,
// not against the entire 291-chunk manual corpus, so it gets a fair shot at being surfaced.
export function retrieveSplitChunks(queryEmbedding, { manualK = 3, asiK = 3, asiThreshold = 0.3 } = {}) {
  const scored = ALL_CHUNKS.map(chunk => ({
    id: chunk.id,
    page: chunk.page,
    text: chunk.text,
    source: chunk.source,
    type: chunk.type,
    asiApproved: !!chunk.asiApproved,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  const manualChunks = scored
    .filter(c => !c.asiApproved)
    .sort((a, b) => b.score - a.score)
    .slice(0, manualK);

  const asiChunks = scored
    .filter(c => c.asiApproved && c.score >= asiThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, asiK);

  return { manualChunks, asiChunks };
}

// Looks up an ASI-approved chunk by content rather than a hardcoded id, so safety-critical
// lookups (e.g. the crisis guardrail in index.js) survive re-chunking/re-embedding the source
// docs. Returns the same shape as retrieveTopChunks entries, or null if nothing matches.
export function findAsiChunk(textPattern) {
  const chunk = ALL_CHUNKS.find(c => c.asiApproved && textPattern.test(c.text));
  if (!chunk) return null;
  return {
    id: chunk.id,
    page: chunk.page,
    text: chunk.text,
    source: chunk.source,
    type: chunk.type,
    asiApproved: true,
    score: 1 // force-included, not ranked - see caller
  };
}
