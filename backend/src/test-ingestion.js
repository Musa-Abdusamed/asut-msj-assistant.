require("dotenv").config();

const {
  ingestDocument
} = require("./services/ingestion.service");

const {
  getVectorStore
} = require("./services/search.service");

async function testIngestion() {
  await ingestDocument();

  const store = getVectorStore();

  console.log("\nVector store size:", store.length);

  console.log("\nFirst stored chunk:");
  console.log({
    id: store[0].id,
    section: store[0].section,
    source: store[0].source,
    text: store[0].text,
    vectorLength: store[0].embedding.length
  });
}

testIngestion();