require("dotenv").config();

const {
  ingestDocument
} = require("./services/ingestion.service");

const {
  answerQuestion
} = require("./services/rag.service");

async function testRAG() {
  await ingestDocument();

  const question =
"Who can students contact when they need help?";

  const result = await answerQuestion(question);

  console.log("\nQuestion:");
  console.log(question);

  console.log("\nAnswer:");
  console.log(result.answer);

  console.log("\nSources:");

  for (const source of result.sources) {
    console.log({
      section: source.section,
      source: source.source,
      score: source.score
    });
  }
}

testRAG();