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
  addToVectorStore
} = require("./search.service");

async function ingestDocument() {
  await loadVectorStore();

  const existingVectors = getVectorStore();

  if (existingVectors.length > 0) {
    console.log(
      `Vector store already contains ${existingVectors.length} chunks.`
    );

    return;
  }

  const text = await readDocument();

  const chunks = chunkDocument(text);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.text);

    await addToVectorStore(chunk, embedding);

    console.log(
      `Embedded chunk ${chunk.id}: ${chunk.section}`
    );
  }

  console.log("Document ingestion completed.");
}

module.exports = {
  ingestDocument
};