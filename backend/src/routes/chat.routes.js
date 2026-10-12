const express = require("express");

const { chat } = require("../controllers/chat.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, chat);

module.exports = router;