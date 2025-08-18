// src/aws.js  (CommonJS)
const express = require("express");
const {
  RekognitionClient,
  RecognizeCelebritiesCommand,
  DetectLabelsCommand,
} = require("@aws-sdk/client-rekognition");

const router = express.Router();

const client = new RekognitionClient({
  region: process.env.AWS_REGION || "eu-west-1",
  credentials: {
    accessKeyId: (process.env.AWS_ACCESS_KEY_ID || "").trim(),
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || "").trim(),
  },
});

// POST /aws/recognize  { base64 }
router.post("/recognize", async (req, res) => {
  try {
    const { base64 } = req.body || {};
    if (!base64) return res.status(400).json({ error: "Missing image" });

    const bytes = Buffer.from(base64, "base64");
    const out = await client.send(
      new RecognizeCelebritiesCommand({ Image: { Bytes: bytes } })
    );
    res.json(out);
  } catch (e) {
    console.error("rekognition recognize error:", e);
    res.status(500).json({ error: "rekognition-recognize-failed" });
  }
});

// POST /aws/detect-labels-by-url { url, minConfidence? }
router.post("/detect-labels-by-url", async (req, res) => {
  try {
    const { url, minConfidence = 80 } = req.body || {};
    if (!url) return res.status(400).json({ error: "Missing url" });

    const r = await fetch(url);
    if (!r.ok) {
      return res.status(400).json({ error: "fetch-failed", status: r.status });
    }
    const buf = Buffer.from(await r.arrayBuffer());

    const out = await client.send(
      new DetectLabelsCommand({
        Image: { Bytes: buf },
        MinConfidence: Number(minConfidence) || 80,
      })
    );
    res.json(out);
  } catch (e) {
    console.error("rekognition detect-labels error:", e);
    res.status(500).json({ error: "rekognition-detect-labels-failed" });
  }
});

module.exports = router;
