import { GoogleGenerativeAI } from '@google/generative-ai';

// Built lazily (not at module load) since env vars aren't populated yet when
// this module is first evaluated during the server's ESM import chain.
// GEMINI_API_KEYS is a comma-separated list; falls back to GEMINI_API_KEY for a single key.
let models;
const getModels = () => {
  if (!models) {
    const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    models = keys.map((key) => {
      const genAI = new GoogleGenerativeAI(key);
      return genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    });
  }
  return models;
};

// Returns an embedding vector for the given text, or [] if text is empty.
// Tries each configured key in order, falling back to the next on rate-limit/quota/server errors.
export const generateEmbedding = async (text) => {
  const trimmed = (text || '').trim();
  if (!trimmed) return [];

  const candidateModels = getModels();
  if (candidateModels.length === 0) {
    throw new Error('No GEMINI_API_KEY(S) configured');
  }

  let lastError;

  for (const model of candidateModels) {
    try {
      const result = await model.embedContent(trimmed);
      return result.embedding.values;
    } catch (error) {
      lastError = error;
      const isRetryable = error?.status === 429 || error?.status >= 500;
      if (!isRetryable) throw error;
    }
  }

  throw lastError;
};
