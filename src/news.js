// src/news.js (ESM)
import { Router } from "express";

const router = Router();

router.get("/entertainment", async (req, res) => {
  try {
    const { country, language, size } = req.query;

    const url = new URL("https://newsdata.io/api/1/latest");
    url.searchParams.set("apikey", (process.env.NEWSDATA_API_KEY || "").trim());
    url.searchParams.set(
      "q",
      "movie OR tv OR netflix OR trailer OR film OR streaming"
    );

    if (country) url.searchParams.set("country", String(country));
    if (language) url.searchParams.set("language", String(language));
    if (size) url.searchParams.set("size", String(size)); // e.g. 20 or 30

    // Only forward `page` when it's a real nextPage token
    const token = req.query.page;
    if (typeof token === "string" && /^[A-Za-z0-9_-]+$/.test(token)) {
      url.searchParams.set("page", token);
    }

    console.log("[news] GET", url.toString());

    const r = await fetch(url);
    const text = await r.text();
    if (!r.ok) {
      console.error("[news] upstream", r.status, text);
      return res.status(r.status).type("application/json").send(text);
    }
    return res.type("application/json").send(text);
  } catch (e) {
    console.error("[news] error:", e);
    res.status(500).json({ status: "error", message: "newsdata-proxy-failed" });
  }
});

export default router;
