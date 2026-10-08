const {
  createEmbedding
} = require("./embedding.service");

const {
  searchSimilarChunks
} = require("./search.service");

const {
  generateAnswer
} = require("./llm.service");

async function answerQuestion(question) {
  const questionEmbedding = await createEmbedding(question);

  const results = searchSimilarChunks(
    questionEmbedding,
    3
  );
  if (results.length === 0) {
  return {
    answer: "I don't have enough information in the provided documents.",
    sources: []
  };
}

  const context = results
    .map((result) => result.text)
    .join("\n\n");

  const answer = await generateAnswer(
    question,
    context
  );

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