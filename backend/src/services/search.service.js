const fs = require("fs/promises");
const path = require("path");

const vectorFilePath = path.join(
  __dirname,
  "../data/vectors.json"
);

let vectorStore = [];
let documentHash = null;

async function loadVectorStore() {
  try {
    const data = await fs.readFile(
      vectorFilePath,
      "utf-8"
    );

    const parsedData = JSON.parse(data);

    vectorStore = parsedData.vectors || [];
    documentHash = parsedData.documentHash || null;
  } catch (error) {
    if (error.code === "ENOENT") {
      vectorStore = [];
      documentHash = null;

      await saveVectorStore();
    } else {
      throw error;
    }
  }
}

async function saveVectorStore() {
  const data = {
    documentHash,
    vectors: vectorStore
  };

  await fs.writeFile(
    vectorFilePath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

function getVectorStore() {
  return vectorStore;
}

function getDocumentHash() {
  return documentHash;
}

function setDocumentHash(hash) {
  documentHash = hash;
}

async function addToVectorStore(chunk, embedding) {
  vectorStore.push({
    ...chunk,
    embedding
  });

  await saveVectorStore();
}
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function keywordSimilarity(question, chunk) {
  const stopWords = new Set([
    "what", "which", "who", "when", "where", "why", "how",
    "do", "does", "did", "is", "are", "was", "were",
    "the", "a", "an", "for", "to", "of", "in", "on",
    "and", "or", "should", "can", "could", "would",
    "students", "student", "need", "needs", "their", "they",
    "must", "submit", "provide", "information"
  ]);

  const questionWords = new Set(
    tokenize(question).filter(
      (word) => !stopWords.has(word)
    )
  );

  const chunkWords = new Set(
    tokenize(`${chunk.section} ${chunk.text}`)
  );

  if (questionWords.size === 0) {
    return 0;
  }

  const matches = [...questionWords].filter(
    (word) => chunkWords.has(word)
  ).length;

  return matches / questionWords.size;
}
function searchSimilarChunks(
  queryEmbedding,
  topK = 3,
  threshold = 0.65,
  question = ""
) {
  const scoredChunks = vectorStore.map((item) => {
    const semanticScore = cosineSimilarity(
      queryEmbedding,
      item.embedding
    );

    const keywordScore = keywordSimilarity(
      question,
      item
    );

const score =
  semanticScore +
  keywordScore * 0.05;

    return {
      id: item.id,
      text: item.text,
      source: item.source,
      section: item.section,
      score,
      semanticScore,
      keywordScore
    };
  });

  console.log("\n--- RETRIEVAL DIAGNOSTICS ---");

  scoredChunks
    .slice()
    .sort((a, b) => b.score - a.score)
    .forEach((item) => {
      console.log({
        section: item.section,
        combinedScore: Number(item.score.toFixed(4)),
        semanticScore: Number(item.semanticScore.toFixed(4)),
        keywordScore: Number(item.keywordScore.toFixed(4)),
        passedThreshold: item.score >= threshold
      });
    });

  const results = scoredChunks
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  console.log("Chunks retrieved:", results.length);
  console.log("--- END DIAGNOSTICS ---\n");

  return results.map(
    ({ semanticScore, keywordScore, ...item }) => item
  );
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
  getVectorStore,
  getDocumentHash,
  setDocumentHash,
  addToVectorStore,
  searchSimilarChunks
};