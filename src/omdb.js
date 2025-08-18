// camvia-api/src/omdb.js
import express from "express";
const router = express.Router();

const OMDB_KEY = (process.env.OMDB_API_KEY || "").trim();

router.get("/search", async (req, res) => {
  try {
    const { q, type, page = 1, y } = req.query;
    if (!q) return res.status(400).json({ error: "q required" });

    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", OMDB_KEY);
    url.searchParams.set("s", String(q));
    if (type) url.searchParams.set("type", String(type));
    if (y) url.searchParams.set("y", String(y));
    url.searchParams.set("page", String(page));

    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error("OMDb search error:", e);
    res.status(500).json({ error: "omdb-search" });
  }
});

router.get("/title", async (req, res) => {
  try {
    const { i, t, y, plot = "short" } = req.query;
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", OMDB_KEY);
    if (i) url.searchParams.set("i", String(i));
    else if (t) url.searchParams.set("t", String(t));
    else return res.status(400).json({ error: "i or t required" });
    if (y) url.searchParams.set("y", String(y));
    url.searchParams.set("plot", String(plot));

    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error("OMDb title error:", e);
    res.status(500).json({ error: "omdb-title" });
  }
});

export default router;
