
const {
  createEmbedding
} = require("./embedding.service");

const {
  searchSimilarChunks
} = require("./search.service");

const {
  searchLocally
} = require("./local-search.service");

const {
  generateAnswer
} = require("./llm.service");

async function answerQuestion(question, history = []) {
  console.log("RAG TEST MODE:", process.env.RAG_TEST_MODE);

  const lastUserMessage = [...history]
    .reverse()
    .find((message) => message.role === "user");

  const isFollowUp =
    /\b(what about|and|that|those|it|their|them)\b/i.test(question);

  const searchQuestion = question;

  let results;

  if (process.env.RAG_TEST_MODE === "true") {
    results = searchLocally(searchQuestion, 3);
  } else {
    const questionEmbedding = await createEmbedding(searchQuestion);

    results = searchSimilarChunks(
  questionEmbedding,
  1,
  0.65,
  question
);
  }

  if (results.length === 0) {
    return {
      answer:
        "I don't have enough information in the provided documents.",
      sources: []
    };
  }

  const context = results
    .map((result) => result.text)
    .join("\n\n");

  let answer;

  if (process.env.RAG_TEST_MODE === "true") {
    answer = results[0].text
      .replace(/^# .+\n?/, "")
      .trim();
  } else {
    answer = await generateAnswer(
      question,
      context,
      history
    );
  }

  return {
    answer,
    sources: results.map((result) => ({
      section: result.section,
      source: result.source,
      score: result.score
    }))
  };
}

module.exports = {
  answerQuestion
};