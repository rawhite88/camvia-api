// camvia-api/src/tmdb.js (ESM)
import { Router } from "express";

const router = Router();

const TMDB_BASE = "https://api.themoviedb.org/3";
const V4 = (process.env.TMDB_V4_TOKEN || "").trim();
const V3 = (process.env.TMDB_V3_KEY || "").trim();

function buildUrl(path, params = {}) {
  const url = new URL(TMDB_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  // If no v4 token, fall back to v3 key
  if (!V4) url.searchParams.set("api_key", V3);
  return url.toString();
}

async function tmdbFetch(path, params = {}) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    headers: V4
      ? {
          Authorization: `Bearer ${V4}`,
          Accept: "application/json",
        }
      : { Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`TMDb ${res.status}: ${text}`);
  }
  return res.json();
}

// Normalize TMDb responses that might be either an array or { results: [...] }
function toResultsArray(resp, fallback = []) {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.results)) return resp.results;
  return fallback;
}

/* ------------------------------ Trending ------------------------------ */

router.get("/trending/people", async (_req, res) => {
  try {
    const data = await tmdbFetch("/trending/person/week");
    res.json(toResultsArray(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-trending-people" });
  }
});

router.get("/trending/tv", async (_req, res) => {
  try {
    const data = await tmdbFetch("/trending/tv/week");
    res.json(toResultsArray(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-trending-tv" });
  }
});

/* -------------------------------- Movies ------------------------------- */

router.get("/movies/now_playing", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await tmdbFetch("/movie/now_playing", { page, region: "GB" });
    res.json(toResultsArray(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-now-playing" });
  }
});

router.get("/movie/:id", async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-movie" });
  }
});

router.get("/movie/:id/external_ids", async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/external_ids`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-external-ids" });
  }
});

router.get("/movie/:id/watch/providers", async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/watch/providers`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-watch-providers" });
  }
});

/* ---------------------------------- TV --------------------------------- */

router.get("/tv/:id", async (req, res) => {
  try {
    const data = await tmdbFetch(`/tv/${req.params.id}`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-tv" });
  }
});

router.get("/tv/:id/external_ids", async (req, res) => {
  try {
    const data = await tmdbFetch(`/tv/${req.params.id}/external_ids`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-tv-external-ids" });
  }
});

router.get("/tv/:id/watch/providers", async (req, res) => {
  try {
    const data = await tmdbFetch(`/tv/${req.params.id}/watch/providers`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-tv-watch-providers" });
  }
});

/* ------------------------------- People -------------------------------- */

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

router.get("/person/popular", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await tmdbFetch("/person/popular", { page });
    res.json(toResultsArray(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-person-popular" });
  }
});

router.get("/person/:id/images", async (req, res) => {
  try {
    const data = await tmdbFetch(`/person/${req.params.id}/images`);
    res.json(data?.profiles ?? []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-person-images" });
  }
});

router.get("/person/:id/combined_credits", async (req, res) => {
  try {
    const data = await tmdbFetch(`/person/${req.params.id}/combined_credits`);
    res.json(data); // keep full object (has cast & crew)
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-combined-credits" });
  }
});

router.get("/person/:id/external_ids", async (req, res) => {
  try {
    const data = await tmdbFetch(`/person/${req.params.id}/external_ids`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-person-external-ids" });
  }
});

/* ------------------------------- Credits -------------------------------- */

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
    res.json(data); // return the full credits payload
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-credits" });
  }
});

/* -------------------------------- Search -------------------------------- */

router.get("/search", async (req, res) => {
  try {
    const { type = "multi", query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ error: "query required" });
    const data = await tmdbFetch(`/search/${type}`, { query, page });
    res.json(toResultsArray(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-search" });
  }
});

// Kept for compatibility with older clients
router.get("/search/multi", async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ error: "query required" });
    const data = await tmdbFetch(`/search/multi`, { query, page });
    res.json(toResultsArray(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-search-multi" });
  }
});

/* -------------------------------- Videos -------------------------------- */

router.get("/videos", async (req, res) => {
  try {
    const { media_type, id } = req.query; // media_type: movie|tv
    if (!media_type || !id)
      return res.status(400).json({ error: "media_type and id required" });
    const data = await tmdbFetch(`/${media_type}/${id}/videos`, {
      language: "en-US",
    });
    res.json(data); // keep full video object (contains results & metadata)
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tmdb-videos" });
  }
});

export default router;
