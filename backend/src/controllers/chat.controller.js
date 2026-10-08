const { ingestDocument } = require("../services/ingestion.service");
const { answerQuestion } = require("../services/rag.service");

let isInitialized = false;

async function chat(req, res) {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required"
      });
    }

    if (!isInitialized) {
      await ingestDocument();
      isInitialized = true;
    }

    const result = await answerQuestion(question);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to generate answer"
    });
  }
}

module.exports = {
  chat
};