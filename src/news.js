// camvia-api/src/news.js
import express from "express";
const router = express.Router();

const NEWSDATA_KEY = (process.env.NEWSDATA_API_KEY || "").trim();

router.get("/entertainment", async (req, res) => {
  try {
    const { country = "gb", language = "en", page = 1 } = req.query;
    const url = new URL("https://newsdata.io/api/1/news");
    url.searchParams.set("apikey", NEWSDATA_KEY);
    url.searchParams.set("category", "entertainment");
    url.searchParams.set("country", String(country));
    url.searchParams.set("language", String(language));
    url.searchParams.set("page", String(page));

    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: "newsdata-bad-status" });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error("NewsData error:", e);
    res.status(500).json({ error: "newsdata-error" });
  }
});

export default router;
