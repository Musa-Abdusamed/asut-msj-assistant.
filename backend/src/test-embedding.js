require("dotenv").config();

const {
  createEmbedding
} = require("./services/embedding.service");

async function testEmbedding() {
  const text = "Students must provide their GitHub username during registration.";

  const vector = await createEmbedding(text);

  console.log("Vector length:", vector.length);
  console.log("First 10 values:", vector.slice(0, 10));
}

testEmbedding();