// src/index.js (ESM)
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import openaiRouter from "./openai.js";
import awsRouter from "./aws.js";
import tmdbRouter from "./tmdb.js";
import newsRouter from "./news.js";
import omdbRouter from "./omdb.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/openai", openaiRouter);
app.use("/aws", awsRouter);
app.use("/tmdb", tmdbRouter);
app.use("/news", newsRouter);
app.use("/omdb", omdbRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
