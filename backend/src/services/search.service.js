const fs = require("fs/promises");
const path = require("path");

const vectorFilePath = path.join(
  __dirname,
  "../data/vectors.json"
);

let vectorStore = [];

async function loadVectorStore() {
  try {
    const data = await fs.readFile(
      vectorFilePath,
      "utf-8"
    );

    vectorStore = JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      vectorStore = [];
      await saveVectorStore();
    } else {
      throw error;
    }
  }
}

async function saveVectorStore() {
  await fs.writeFile(
    vectorFilePath,
    JSON.stringify(vectorStore, null, 2),
    "utf-8"
  );
}

async function addToVectorStore(chunk, embedding) {
  vectorStore.push({
    ...chunk,
    embedding
  });

  await saveVectorStore();
}

function getVectorStore() {
  return vectorStore;
}

function searchSimilarChunks(
  queryEmbedding,
  topK = 3,
  threshold = 0.65
) {
  const results = vectorStore
    .map((item) => {
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
    })
    .filter(
      (result) => result.score >= threshold
    );

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      "Vectors must have the same dimensions"
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (magnitudeA * magnitudeB)
  );
}

module.exports = {
  loadVectorStore,
  saveVectorStore,
  addToVectorStore,
  getVectorStore,
  searchSimilarChunks
};