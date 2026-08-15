// Turns the user's question into a vector using OpenAI's embedding model.
// Must stay the same model that embedded the chunks (text-embedding-3-small) -
// mixing models would make the cosine-similarity scores meaningless.
export async function embedQuery(text, env) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: text, model: 'text-embedding-3-small' })
  });
  if (!res.ok) throw new Error(`OpenAI embed error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding;
}
