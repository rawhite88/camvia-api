// src/openai.js
import express from "express";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      // Frontend can send { model, messages, ... } — we pass it through
      body: JSON.stringify({
        model: "gpt-4o-mini",
        ...req.body,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI proxy failed" });
  }
});

export default router;
