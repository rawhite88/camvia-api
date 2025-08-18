import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import openaiRouter from "./openai.js";
import awsRouter from "./aws.js";
import tmdbRouter from "./tmdb.js";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use("/openai", openaiRouter);
app.use("/aws", awsRouter);
app.use("/tmdb", tmdbRouter);

// Allow all origins for now (simplest while testing)
app.use(cors());

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on :${port}`));
