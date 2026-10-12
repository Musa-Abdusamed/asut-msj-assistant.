
const {
  ingestDocument
} = require("../services/ingestion.service");

const {
  answerQuestionStream
} = require("../services/rag.service");

let isInitialized = false;

async function chat(req, res) {
  try {
    const { question, history = [] } = req.body;

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

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const result = await answerQuestionStream(
      question,
      history,
      (chunk) => {
        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            text: chunk
          })}\n\n`
        );
      }
    );

    res.write(
      `data: ${JSON.stringify({
        type: "sources",
        sources: result.sources
      })}\n\n`
    );

    res.write(
      `data: ${JSON.stringify({
        type: "done"
      })}\n\n`
    );

    res.end();
  } catch (error) {
    console.error("Chat error:", error);

    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message:
            error.status === 429
              ? "Gemini API quota exceeded. Please try again later."
              : error.status === 503
                ? "Gemini is temporarily unavailable. Please try again later."
                : "Failed to generate answer"
        })}\n\n`
      );

      return res.end();
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