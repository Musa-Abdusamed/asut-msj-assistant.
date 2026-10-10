const {
  ingestDocument
} = require("../services/ingestion.service");

const {
  answerQuestion
} = require("../services/rag.service");

let isInitialized = false;

async function chat(req, res) {
  try {
    const { question } = req.body;

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        message: "Question is required"
      });
    }

    if (!isInitialized) {
      await ingestDocument();
      isInitialized = true;
    }

    const { history = [] } = req.body;

const result = await answerQuestion(question, history);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Chat error:", error);

    if (res.headersSent) {
      return;
    }

    if (error.status === 429) {
      return res.status(429).json({
        message:
          "Gemini API quota exceeded. Please try again later."
      });
    }

    if (error.status === 503) {
      return res.status(503).json({
        message:
          "Gemini is temporarily unavailable. Please try again later."
      });
    }

    return res.status(500).json({
      message: "Failed to generate answer"
    });
  }
}

module.exports = {
  chat
};