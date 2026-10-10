const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const embeddingCache = new Map();

async function createEmbedding(text) {
  const normalizedText = text.trim().toLowerCase();

  if (embeddingCache.has(normalizedText)) {
    console.log("Using cached embedding");
    return embeddingCache.get(normalizedText);
  }

  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text
  });

  const embedding = response.embeddings[0].values;

  embeddingCache.set(normalizedText, embedding);

  return embedding;
}

module.exports = {
  createEmbedding
};