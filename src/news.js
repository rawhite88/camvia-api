// src/news.js  (CommonJS)
const express = require("express");
const router = express.Router();

router.get("/entertainment", async (req, res) => {
  try {
    const key = (process.env.NEWSDATA_API_KEY || "").trim();
    if (!key) {
      return res.status(500).json({ error: "missing NEWSDATA_API_KEY" });
    }

    const { country = "gb", language = "en", page = 1, q } = req.query;

    const url = new URL("https://newsdata.io/api/1/news");
    url.searchParams.set("apikey", key);
    url.searchParams.set("language", String(language));
    url.searchParams.set("page", String(page));

    // country is usually fine, but leave it optional
    if (country) url.searchParams.set("country", String(country));

    // Provide a default query to avoid 422
    const query =
      (q && String(q).trim()) ||
      "movie OR tv OR netflix OR trailer OR film OR streaming";
    url.searchParams.set("q", query);

    // (deliberately NOT setting category to avoid finicky combos)

    const r = await fetch(url);
    const text = await r.text();
    // pass through upstream status/body so you can see the real error if any
    return res.status(r.status).type("application/json").send(text);
  } catch (e) {
    console.error("NewsData error:", e);
    res.status(500).json({ error: "newsdata-error" });
  }
});

module.exports = router;
