import embeddedChunks from '../data/manual-embeddings.json';

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Returns the topK chunks whose stored vector is closest to the question's vector.
export function retrieveTopChunks(queryEmbedding, topK = 5) {
  const scored = embeddedChunks.map(chunk => ({
    page: chunk.page,
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
