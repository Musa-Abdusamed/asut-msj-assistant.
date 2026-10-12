
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function buildPrompt(question, context, history = []) {
  const conversationHistory = history
    .map((message) => {
      const role =
        message.role === "assistant" ? "Assistant" : "User";

      return `${role}: ${message.content}`;
    })
    .join("\n");

  return `
You are a helpful assistant for the ASTU MSJ Bootcamp.

RULES:
1. Answer the current question using only the DOCUMENT CONTEXT.
2. Include all relevant details explicitly stated in the context.
3. If the question asks for a list of requirements, include every requirement.
4. Do not omit details simply because the conversation history mentions only some of them.
5. Use conversation history to understand the question, not to replace the document context.
6. Do not invent facts.
7. If the context does not contain the requested information, say:
"I don't have enough information in the provided documents."

CONVERSATION HISTORY:
${conversationHistory || "No previous messages."}

DOCUMENT CONTEXT:
${context}

CURRENT QUESTION:
${question}

DIRECT ANSWER:
`;
}

async function generateAnswer(question, context, history = []) {
  const prompt = buildPrompt(question, context, history);

  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: prompt
  });

  return response.text;
}

async function generateAnswerStream(
  question,
  context,
  history = [],
  onChunk
) {
  const prompt = buildPrompt(question, context, history);

  const response = await ai.models.generateContentStream({
    model: "gemini-3.7-flash",
    contents: prompt
  });

  let answer = "";

  for await (const chunk of response) {
    const text = chunk.text || "";

    if (text) {
      answer += text;
      onChunk(text);
    }
  }

  return answer;
}

module.exports = {
  generateAnswer,
  generateAnswerStream
};