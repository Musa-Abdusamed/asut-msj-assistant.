
const {
  getVectorStore
} = require("./search.service");

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function searchLocally(question, topK = 3) {
  const stopWords = new Set([
    "what", "which", "who", "when", "where",
    "why", "how", "do", "does", "did",
    "is", "are", "was", "were", "the",
    "a", "an", "for", "to", "of", "in",
    "on", "and", "or", "should", "can",
    "could", "would", "students", "student",
    "need", "needs", "their", "they"
  ]);

  const questionWords = new Set(
    tokenize(question).filter(
      (word) => !stopWords.has(word)
    )
  );

  const results = getVectorStore().map((chunk) => {
    const chunkWords = new Set(
      tokenize(`${chunk.section} ${chunk.text}`)
    );

    const matches = [...questionWords].filter(
      (word) => chunkWords.has(word)
    ).length;

    const score =
      questionWords.size === 0
        ? 0
        : matches / questionWords.size;

    return {
      id: chunk.id,
      text: chunk.text,
      source: chunk.source,
      section: chunk.section,
      score
    };
  });

  return results
    .filter((result) => result.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

module.exports = {
  searchLocally
};