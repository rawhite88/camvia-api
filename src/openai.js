// src/openai.js (ESM)
import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const client = new OpenAI({
  apiKey: (process.env.OPENAI_API_KEY || "").trim(),
});

// POST /openai/chat  { messages: [...], model? }
router.post("/chat", async (req, res) => {
  try {
    const {
      messages,
      model = "gpt-4o-mini-2024-07-18",
      ...opts
    } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    const out = await client.chat.completions.create({
      model,
      messages,
      ...opts, // allow optional temperature, max_tokens, etc.
    });

    res.json(out);
  } catch (e) {
    const status = e?.status ?? 500;
    const detail = e?.message || "unknown";
    console.error("OpenAI chat error:", e?.response?.data || detail);
    res.status(status).json({ error: "openai-chat-failed", detail });
  }
});

export default router;
