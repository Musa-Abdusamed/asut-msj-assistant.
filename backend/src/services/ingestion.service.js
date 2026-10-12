const crypto = require("crypto");

const {
  readDocument,
  chunkDocument
} = require("./document.service");

const { createEmbedding } = require("./embedding.service");

const {
  loadVectorStore,
  getVectorStore,
  getDocumentHash,
  setDocumentHash,
  addToVectorStore,
  saveVectorStore
} = require("./search.service");

function createDocumentHash(text) {
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");
}

async function ingestDocument() {
  await loadVectorStore();

  const text = await readDocument("knowledge.txt");
  const currentHash = createDocumentHash(text);
  const existingHash = getDocumentHash();
  const existingVectors = getVectorStore();

  const defaultChunks = existingVectors.filter(
    (item) => item.source === "knowledge.txt"
  );

  if (
    existingHash === currentHash &&
    defaultChunks.length === chunkDocument(text).length
  ) {
    console.log("Default knowledge document is already indexed.");
    return;
  }

  console.log("Re-indexing default knowledge document...");

  const remainingVectors = existingVectors.filter(
    (item) => item.source !== "knowledge.txt"
  );

  existingVectors.splice(
    0,
    existingVectors.length,
    ...remainingVectors
  );

  setDocumentHash(currentHash);

  const chunks = chunkDocument(text, "knowledge.txt");

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.text);
    await addToVectorStore(chunk, embedding);

    console.log(`Embedded chunk: ${chunk.section}`);
  }

  await saveVectorStore();

  console.log(
    `Default knowledge document indexed: ${chunks.length} chunks.`
  );
}

module.exports = { ingestDocument };