// camvia-api/src/omdb.js (ESM)
import { Router } from "express";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const { q, type, page = 1, y } = req.query;
    if (!q) return res.status(400).json({ error: "q required" });

    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", (process.env.OMDB_API_KEY || "").trim());
    url.searchParams.set("s", String(q));
    if (type) url.searchParams.set("type", String(type));
    if (y) url.searchParams.set("y", String(y));
    url.searchParams.set("page", String(page));

    const r = await fetch(url);
    const text = await r.text();
    return res.type("application/json").send(text);
  } catch (e) {
    console.error("OMDb search error:", e);
    res.status(500).json({ error: "omdb-search" });
  }
});

router.get("/title", async (req, res) => {
  try {
    const { i, t, y, plot = "short" } = req.query;

    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", (process.env.OMDB_API_KEY || "").trim());

    if (i) url.searchParams.set("i", String(i));
    else if (t) url.searchParams.set("t", String(t));
    else return res.status(400).json({ error: "i or t required" });

    if (y) url.searchParams.set("y", String(y));
    url.searchParams.set("plot", String(plot));

    const r = await fetch(url);
    const text = await r.text();
    return res.type("application/json").send(text);
  } catch (e) {
    console.error("OMDb title error:", e);
    res.status(500).json({ error: "omdb-title" });
  }
});

export default router;
