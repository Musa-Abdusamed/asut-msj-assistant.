const { cosineSimilarity } = require("./vector.service");

const vectorStore = [];

function addToVectorStore(chunk, embedding) {
  vectorStore.push({
    ...chunk,
    embedding
  });
}

function getVectorStore() {
  return vectorStore;
}

function searchSimilarChunks(queryEmbedding, topK = 3) {
  const results = vectorStore.map((item) => {
    const score = cosineSimilarity(
      queryEmbedding,
      item.embedding
    );

    return {
      id: item.id,
      text: item.text,
      source: item.source,
      section: item.section,
      score
    };
  });

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

module.exports = {
  addToVectorStore,
  getVectorStore,
  searchSimilarChunks
};