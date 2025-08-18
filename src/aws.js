// camvia-api/src/aws.js
import express from "express";
import {
  RekognitionClient,
  DetectLabelsCommand,
  RecognizeCelebritiesCommand,
} from "@aws-sdk/client-rekognition";

const router = express.Router();

const client = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// helper: turn imageUrl or base64 into bytes
async function toBytes({ imageUrl, base64 }) {
  if (base64) return Buffer.from(base64, "base64");
  if (imageUrl) {
    const resp = await fetch(imageUrl);
    return new Uint8Array(await resp.arrayBuffer());
  }
  throw new Error("Provide imageUrl or base64");
}

// Detect generic labels
router.post("/rekognition/detect", async (req, res) => {
  try {
    const {
      imageUrl,
      base64,
      minConfidence = 70,
      maxLabels = 50,
    } = req.body || {};
    const bytes = await toBytes({ imageUrl, base64 });

    const out = await client.send(
      new DetectLabelsCommand({
        Image: { Bytes: bytes },
        MinConfidence: Number(minConfidence),
        MaxLabels: Number(maxLabels),
      })
    );
    res.json(out);
  } catch (e) {
    console.error("DetectLabels error:", e);
    res.status(500).json({ error: "rekognition-detect-failed" });
  }
});

// Recognize celebrities
router.post("/rekognition/recognize", async (req, res) => {
  try {
    const { imageUrl, base64 } = req.body || {};
    const bytes = await toBytes({ imageUrl, base64 });

    const out = await client.send(
      new RecognizeCelebritiesCommand({ Image: { Bytes: bytes } })
    );
    res.json(out);
  } catch (e) {
    console.error("RecognizeCelebrities error:", e);
    res.status(500).json({ error: "rekognition-recognize-failed" });
  }
});

export default router;
