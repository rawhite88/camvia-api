// camvia-api/src/tmdb.js
const express = require("express");
const router = express.Router();

const TMDB_BASE = "https://api.themoviedb.org/3";
const V4 = (process.env.TMDB_V4_TOKEN || "").trim();
const V3 = (process.env.TMDB_V3_KEY || "").trim();

function buildUrl(path, params = {}) {
  const url = new URL(TMDB_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  if (!V4) url.searchParams.set("api_key", V3); // v3 fallback
  return url.toString();
}

async function tmdbFetch(path, params = {}) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    headers: V4 ? { Authorization: `Bearer ${V4}` } : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDb ${res.status}: ${text}`);
  }
  return res.json();
}

// Trending
router.get("/trending/people", async (_req, res) => {
  try {
    const data = await tmdbFetch("/trending/person/week");
    res.json(data?.results ?? []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-trending-people" });
  }
});
router.get("/trending/tv", async (_req, res) => {
  try {
    const data = await tmdbFetch("/trending/tv/week");
    res.json(data?.results ?? []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-trending-tv" });
  }
});

// Movies
router.get("/movies/now_playing", async (req, res) => {
  try {
    const page = req.query.page ?? 1;
    const data = await tmdbFetch("/movie/now_playing", { page, region: "GB" });
    res.json(data?.results ?? []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-now-playing" });
  }
});

// Person
router.get("/person/:id", async (req, res) => {
  try {
    const data = await tmdbFetch(`/person/${req.params.id}`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-person" });
  }
});
router.get("/person/imdb/:imdbId", async (req, res) => {
  try {
    const imdbId = req.params.imdbId;
    const data = await tmdbFetch(`/find/${imdbId}`, {
      external_source: "imdb_id",
    });
    res.json(data?.person_results?.[0] ?? null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-find-person" });
  }
});

// Search + credits
router.get("/search", async (req, res) => {
  try {
    const { type = "multi", query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ error: "query required" });
    const data = await tmdbFetch(`/search/${type}`, { query, page });
    res.json(data?.results ?? []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-search" });
  }
});
router.get("/credits", async (req, res) => {
  try {
    const { media_type, id } = req.query;
    if (!media_type || !id)
      return res.status(400).json({ error: "media_type and id required" });
    const path =
      media_type === "movie"
        ? `/movie/${id}/credits`
        : `/tv/${id}/aggregate_credits`;
    const data = await tmdbFetch(path);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-credits" });
  }
});

module.exports = router;
