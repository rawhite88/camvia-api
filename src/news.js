// CommonJS
const express = require("express");
const router = express.Router();

router.get("/entertainment", async (req, res) => {
  try {
    const key = (process.env.NEWSDATA_API_KEY || "").trim();
    if (!key)
      return res.status(500).json({ error: "missing NEWSDATA_API_KEY" });

    const { language = "en", page = 1, q } = req.query;

    // Use the 'latest' endpoint and ALWAYS include q
    const url = new URL("https://newsdata.io/api/1/latest");
    url.searchParams.set("apikey", key);
    url.searchParams.set("language", String(language));
    url.searchParams.set("page", String(page));
    url.searchParams.set(
      "q",
      (q && String(q).trim()) ||
        "movie OR tv OR netflix OR trailer OR film OR streaming"
    );

    const r = await fetch(url);
    const text = await r.text();
    if (!r.ok) {
      console.error(
        "NewsData upstream error:",
        r.status,
        text,
        "URL:",
        url.toString()
      );
      return res.status(r.status).type("application/json").send(text);
    }
    return res.type("application/json").send(text);
  } catch (e) {
    console.error("NewsData error:", e);
    res.status(500).json({ error: "newsdata-error" });
  }
});

module.exports = router;
