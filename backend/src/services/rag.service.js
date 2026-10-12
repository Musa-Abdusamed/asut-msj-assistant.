
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
  generateAnswer,
  generateAnswerStream
} = require("./llm.service");

async function retrieveContext(question) {
  let results;

  if (process.env.RAG_TEST_MODE === "true") {
    results = searchLocally(question, 3);
  } else {
    const questionEmbedding = await createEmbedding(question);

    results = searchSimilarChunks(
      questionEmbedding,
      3,
      0.45,
      question
    );
  }

  return results;
}

async function answerQuestion(question, history = []) {
  const results = await retrieveContext(question);

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

async function answerQuestionStream(
  question,
  history = [],
  onChunk
) {
  const results = await retrieveContext(question);

  if (results.length === 0) {
    const answer =
      "I don't have enough information in the provided documents.";

    onChunk(answer);

    return {
      answer,
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

    onChunk(answer);
  } else {
    answer = await generateAnswerStream(
      question,
      context,
      history,
      onChunk
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
  answerQuestion,
  answerQuestionStream
};