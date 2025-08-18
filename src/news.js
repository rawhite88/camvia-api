// src/news.js
const express = require("express");
const router = express.Router();

router.get("/entertainment", async (req, res) => {
  try {
    const key = (process.env.NEWSDATA_API_KEY || "").trim();
    if (!key)
      return res.status(500).json({ error: "missing NEWSDATA_API_KEY" });

    const { language = "en", page, q } = req.query;

    // Use latest and ALWAYS include q
    const url = new URL("https://newsdata.io/api/1/latest");
    url.searchParams.set("apikey", key);
    url.searchParams.set("language", String(language));
    url.searchParams.set(
      "q",
      (q && String(q).trim()) ||
        "movie OR tv OR netflix OR trailer OR film OR streaming"
    );

    // Only include page if the client provided a nextPage token
    if (page && String(page).trim()) {
      url.searchParams.set("page", String(page).trim());
    }

    const r = await fetch(url);
    const text = await r.text();
    return res.status(r.status).type("application/json").send(text);
  } catch (e) {
    console.error("NewsData error:", e);
    res.status(500).json({ error: "newsdata-error" });
  }
});

module.exports = router;
