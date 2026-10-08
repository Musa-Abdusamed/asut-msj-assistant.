require("dotenv").config();

const {
  generateAnswer
} = require("./services/llm.service");

async function testLLM() {
  const question =
    "What information do students need to provide during registration?";

  const context = `
# Registration Requirements

Students must provide their full name, email address,
department, academic year, GitHub username, and
Codeforces username.
`;

  const answer = await generateAnswer(question, context);

  console.log("\nQuestion:");
  console.log(question);

  console.log("\nAnswer:");
  console.log(answer);
}

testLLM();