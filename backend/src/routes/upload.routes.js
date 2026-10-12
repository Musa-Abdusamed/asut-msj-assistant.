const express = require("express");
const multer = require("multer");
const path = require("path");

const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");
const { chunkDocument, extractPdfText } = require("../services/document.service");
const { createEmbedding } = require("../services/embedding.service");
const {
  addToVectorStore,
  listDocuments,
  deleteDocument,
  loadVectorStore
} = require("../services/search.service");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (![".txt", ".pdf"].includes(extension)) {
      return callback(new Error("Only .txt and .pdf files are supported."));
    }

    callback(null, true);
  }
});

router.use(requireAuth, requireAdmin);

router.get("/documents", async (req, res) => {
  try {
    await loadVectorStore();

    return res.json({
      documents: listDocuments()
    });
  } catch (error) {
    console.error("List documents error:", error.message);

    return res.status(500).json({
      message: "Failed to load documents."
    });
  }
});

router.post("/", upload.single("document"), async (req, res) => {
  try {
    await loadVectorStore();

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a .txt or .pdf file."
      });
    }

    const filename = path.basename(req.file.originalname);
    const extension = path.extname(filename).toLowerCase();

    const text = (
      extension === ".pdf"
        ? await extractPdfText(req.file.buffer)
        : req.file.buffer.toString("utf-8")
    ).trim();

    if (!text) {
      return res.status(400).json({
        message: "The document contains no readable text."
      });
    }

    const chunks = chunkDocument(text, filename);

    if (chunks.length === 0) {
      return res.status(400).json({
        message: "No readable content was found."
      });
    }

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk.text);
      await addToVectorStore(chunk, embedding);
    }

    return res.status(201).json({
      message: "Document uploaded and indexed successfully.",
      filename,
      chunks: chunks.length
    });
  } catch (error) {
    console.error("Document upload error:", error);

    return res.status(500).json({
      message: "Failed to upload document."
    });
  }
});

router.delete("/documents/:filename", async (req, res) => {
  try {
    await loadVectorStore();

    const filename = path.basename(req.params.filename);
    const deletedChunks = await deleteDocument(filename);

    if (deletedChunks === 0) {
      return res.status(404).json({
        message: "Document not found."
      });
    }

    return res.json({
      message: "Document removed from the knowledge base.",
      filename,
      deletedChunks
    });
  } catch (error) {
    console.error("Document deletion error:", error.message);

    return res.status(500).json({
      message: "Failed to delete document."
    });
  }
});

module.exports = router;