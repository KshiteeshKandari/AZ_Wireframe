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
