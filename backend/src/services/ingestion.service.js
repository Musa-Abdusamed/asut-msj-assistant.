const {
  readDocument,
  chunkDocument
} = require("./document.service");

const {
  createEmbedding
} = require("./embedding.service");

const {
  addToVectorStore
} = require("./search.service");

async function ingestDocument() {
  const text = await readDocument();

  const chunks = chunkDocument(text);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.text);

    addToVectorStore(chunk, embedding);

    console.log(
      `Embedded chunk ${chunk.id}: ${chunk.section}`
    );
  }

  console.log("Document ingestion completed.");
}

module.exports = {
  ingestDocument
};