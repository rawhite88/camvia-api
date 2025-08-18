// src/openai.js (CommonJS + OpenAI SDK)
const express = require("express");
const OpenAI = require("openai");
const router = express.Router();

const client = new OpenAI({
  apiKey: (process.env.OPENAI_API_KEY || "").trim(),
});

router.post("/chat", async (req, res) => {
  try {
    const { messages, model = "gpt-4o-mini-2024-07-18" } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }
    const out = await client.chat.completions.create({ model, messages });
    res.json(out);
  } catch (e) {
    console.error("OpenAI chat error:", e?.response?.data || e?.message || e);
    res
      .status(e?.status || 500)
      .json({ error: "openai-chat-failed", detail: e?.message || "unknown" });
  }
});

module.exports = router;
