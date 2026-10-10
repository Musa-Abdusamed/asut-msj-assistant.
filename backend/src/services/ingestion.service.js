const crypto = require("crypto");

const {
  readDocument,
  chunkDocument
} = require("./document.service");

const {
  createEmbedding
} = require("./embedding.service");

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

  const text = await readDocument();

  const currentHash = createDocumentHash(text);
  const existingHash = getDocumentHash();
  const existingVectors = getVectorStore();

  if (
    existingVectors.length > 0 &&
    existingHash === currentHash
  ) {
    console.log(
      `Vector store already contains ${existingVectors.length} chunks.`
    );

    return;
  }

  console.log(
    "Document changed or vector store is empty."
  );

  console.log("Rebuilding vector store...");

  existingVectors.length = 0;

  setDocumentHash(currentHash);

  const chunks = chunkDocument(text);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.text);

    await addToVectorStore(
      chunk,
      embedding
    );

    console.log(
      `Embedded chunk ${chunk.id}: ${chunk.section}`
    );
  }

  await saveVectorStore();

  console.log(
    "Document ingestion completed."
  );
}

module.exports = {
  ingestDocument
};