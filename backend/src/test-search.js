require("dotenv").config();

const {
  ingestDocument
} = require("./services/ingestion.service");

const {
  createEmbedding
} = require("./services/embedding.service");

const {
  searchSimilarChunks
} = require("./services/search.service");

async function testSearch() {
  await ingestDocument();

  const question =
    "What information do students need to provide during registration?";

  const questionEmbedding = await createEmbedding(question);

  const results = searchSimilarChunks(questionEmbedding, 3);

  console.log("\nQuestion:");
  console.log(question);

  console.log("\nSearch results:");

  for (const result of results) {
    console.log("\n--------------------");

    console.log("Section:", result.section);
    console.log("Score:", result.score);
    console.log("Text:", result.text);
  }
}

testSearch();