// src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const openaiRouter = require("./openai");
const awsRouter = require("./aws");
const tmdbRouter = require("./tmdb");
const newsRouter = require("./news");
const omdbRouter = require("./omdb");

const app = express();

app.use(helmet());
app.use(cors()); // put CORS before routes
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/openai", openaiRouter);
app.use("/aws", awsRouter);
app.use("/tmdb", tmdbRouter);
app.use("/news", newsRouter);
app.use("/omdb", omdbRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on :${port}`));
