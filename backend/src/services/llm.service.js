const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateAnswer(question, context) {
  const prompt = `
You are a helpful assistant for the ASTU MSJ Bootcamp.

Answer the user's question using ONLY the provided context.

If the answer is not contained in the context, say:
"I don't have enough information in the provided documents."

Context:
${context}

Question:
${question}

Answer:
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: prompt
  });

  return response.text;
}

module.exports = {
  generateAnswer
};