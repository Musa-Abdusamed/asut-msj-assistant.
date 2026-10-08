const fs = require("fs/promises");
const path = require("path");

async function readDocument() {
  const filePath = path.join(__dirname, "../data/knowledge.txt");

  const text = await fs.readFile(filePath, "utf-8");

  return text;
}
function chunkDocument(text) {
  const lines = text.split(/\r?\n/);

  const chunks = [];
  let currentChunk = "";
  let currentSection = "";

  for (const line of lines) {
    if (line.startsWith("# ")) {
      if (currentChunk.trim()) {
        chunks.push({
          id: chunks.length + 1,
          text: currentChunk.trim(),
          source: "knowledge.txt",
          section: currentSection
        });
      }

      currentSection = line.replace("# ", "").trim();
      currentChunk = line;
    } else {
      currentChunk += "\n" + line;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: chunks.length + 1,
      text: currentChunk.trim(),
      source: "knowledge.txt",
      section: currentSection
    });
  }

  return chunks;

}

module.exports = {
  readDocument,
  chunkDocument
};