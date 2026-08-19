// Gemini embedding lookups used only as a synonym-detection pass on top of
// exact-match scoring (see matchScore.js) — never as a standalone score.
const MODEL = 'gemini-embedding-001';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`;

const normalize = (value) => (value || '').trim().toLowerCase();

// Skill vocabularies are small and get reused across many match requests
// within the process's lifetime, so caching avoids re-embedding (and
// re-billing) the same string every time.
const cache = new Map();

const fetchEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: { parts: [{ text }] } }),
  });

  if (!res.ok) {
    throw new Error(`Gemini embedding request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.embedding.values;
};

// Returns a Map of normalized string -> embedding vector for every string
// requested. A string is simply absent from the result (not an error) if
// fetching it failed — callers must treat a missing embedding as "no
// synonym signal available" and fall back to exact-match-only behavior,
// since this is a side channel and must never break matching outright.
export const getEmbeddings = async (strings) => {
  const unique = [...new Set(strings.map(normalize).filter(Boolean))];
  const uncached = unique.filter((s) => !cache.has(s));

  if (uncached.length > 0) {
    const results = await Promise.allSettled(uncached.map((s) => fetchEmbedding(s)));
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        cache.set(uncached[i], result.value);
      } else {
        console.error(`Embedding fetch failed for "${uncached[i]}":`, result.reason.message);
      }
    });
  }

  const found = new Map();
  unique.forEach((s) => {
    if (cache.has(s)) found.set(s, cache.get(s));
  });
  return found;
};
