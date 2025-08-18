// camvia-api/src/news.js
const express = require("express");
const router = express.Router();

router.get("/entertainment", async (req, res) => {
  try {
    const { country = "gb", language = "en", page = 1 } = req.query;
    const url = new URL("https://newsdata.io/api/1/news");
    url.searchParams.set("apikey", (process.env.NEWSDATA_API_KEY || "").trim());
    url.searchParams.set("category", "entertainment");
    url.searchParams.set("country", String(country));
    url.searchParams.set("language", String(language));
    url.searchParams.set("page", String(page));
    // Optional keyword filter like your app:
    // url.searchParams.set("q", "movie OR tv OR netflix OR trailer");

    const r = await fetch(url);
    const text = await r.text();
    if (!r.ok) {
      console.error("NewsData upstream error:", r.status, text);
      return res.status(r.status).type("application/json").send(text);
    }
    return res.type("application/json").send(text);
  } catch (e) {
    console.error("NewsData error:", e);
    res.status(500).json({ error: "newsdata-error" });
  }
});

module.exports = router;
