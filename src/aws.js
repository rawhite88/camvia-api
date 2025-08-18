import express from "express";
import {
  RekognitionClient,
  DetectLabelsCommand,
} from "@aws-sdk/client-rekognition";

const router = express.Router();

const client = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

router.post("/rekognition/detect", async (req, res) => {
  try {
    const { imageUrl, minConfidence = 70, maxLabels = 50 } = req.body || {};
    if (!imageUrl) return res.status(400).json({ error: "imageUrl required" });

    const resp = await fetch(imageUrl);
    const bytes = new Uint8Array(await resp.arrayBuffer());

    const out = await client.send(
      new DetectLabelsCommand({
        Image: { Bytes: bytes },
        MinConfidence: Number(minConfidence),
        MaxLabels: Number(maxLabels),
      })
    );
    res.json(out);
  } catch (e) {
    console.error("Rekognition error:", e);
    res.status(500).json({ error: "rekognition-failed" });
  }
});

export default router;
