const fs = require("fs/promises");
const path = require("path");
const { PDFParse } = require("pdf-parse");

async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function readDocument(filename = "knowledge.txt") {
  const filePath = path.join(__dirname, "../data", filename);
  const extension = path.extname(filename).toLowerCase();

  if (extension === ".pdf") {
    const buffer = await fs.readFile(filePath);
    return extractPdfText(buffer);
  }

  if (extension === ".txt") {
    return fs.readFile(filePath, "utf-8");
  }

  throw new Error("Unsupported document type. Use .txt or .pdf.");
}

function chunkDocument(text, source = "knowledge.txt") {
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
          source,
          section: currentSection
        });
      }

      currentSection = line.slice(2).trim();
      currentChunk = line;
    } else {
      currentChunk += "\n" + line;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: chunks.length + 1,
      text: currentChunk.trim(),
      source,
      section: currentSection
    });
  }

  return chunks;
}

module.exports = {
  readDocument,
  chunkDocument,
  extractPdfText
};