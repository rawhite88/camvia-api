// camvia-api/src/tmdb.js  (CommonJS)
const express = require("express");
const router = express.Router();

const TMDB_API_KEY = (process.env.TMDB_API_KEY || "").trim();
const BASE = "https://api.themoviedb.org/3";

// helper: fetch JSON and forward upstream status/text on error
async function getJson(url) {
  const r = await fetch(url);
  const text = await r.text();
  if (!r.ok) {
    const err = new Error(text || `TMDb error ${r.status}`);
    err.status = r.status;
    err.body = text;
    throw err;
  }
  return JSON.parse(text);
}
const withKey = (pathAndQs) =>
  `${BASE}${pathAndQs}${
    pathAndQs.includes("?") ? "&" : "?"
  }api_key=${TMDB_API_KEY}`;

// ---- Trending ----
router.get("/trending/people", async (_req, res) => {
  try {
    const data = await getJson(withKey("/person/popular"));
    res.json(data.results || []);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

router.get("/trending/tv", async (_req, res) => {
  try {
    const data = await getJson(withKey("/tv/popular"));
    res.json(data.results || []);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

router.get("/movies/now_playing", async (_req, res) => {
  try {
    const data = await getJson(withKey("/movie/now_playing"));
    res.json(data.results || []);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

// ---- Person ----
router.get("/person/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await getJson(
      withKey(`/person/${id}?append_to_response=combined_credits`)
    );
    res.json(data);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

router.get("/person/:id/images", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await getJson(withKey(`/person/${id}/images`));
    res.json(data);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

router.get("/person/:id/combined_credits", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await getJson(withKey(`/person/${id}/combined_credits`));
    res.json(data);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

router.get("/person/imdb/:imdbId", async (req, res) => {
  try {
    const imdbId = req.params.imdbId;
    const find = await getJson(
      withKey(`/find/${encodeURIComponent(imdbId)}?external_source=imdb_id`)
    );
    const match = find.person_results?.[0];
    if (!match?.id) return res.status(404).json({ error: "not_found" });
    const details = await getJson(
      withKey(`/person/${match.id}?append_to_response=combined_credits`)
    );
    res.json(details);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

// ---- Search ----
router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.query || "").trim();
    const type = String(req.query.type || "multi");
    if (!q) return res.status(400).json({ error: "missing query" });
    if (!["person", "movie", "tv"].includes(type))
      return res.status(400).json({ error: "bad type" });

    const data = await getJson(
      withKey(`/search/${type}?query=${encodeURIComponent(q)}`)
    );
    res.json(data.results || []);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

router.get("/search/multi", async (req, res) => {
  try {
    const q = String(req.query.query || "").trim();
    if (!q) return res.status(400).json({ error: "missing query" });
    const data = await getJson(
      withKey(`/search/multi?query=${encodeURIComponent(q)}`)
    );
    res.json(data.results || []);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

// ---- Credits / Videos / Providers ----
router.get("/credits", async (req, res) => {
  try {
    const id = String(req.query.id || "").trim();
    const mediaType = String(req.query.media_type || "").trim(); // movie|tv
    if (!id || !["movie", "tv"].includes(mediaType))
      return res.status(400).json({ error: "bad params" });

    const data = await getJson(withKey(`/${mediaType}/${id}/credits`));
    res.json(data);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

router.get("/videos", async (req, res) => {
  try {
    const id = String(req.query.id || "").trim();
    const mediaType = String(req.query.media_type || "").trim();
    if (!id || !["movie", "tv"].includes(mediaType))
      return res.status(400).json({ error: "bad params" });

    const data = await getJson(withKey(`/${mediaType}/${id}/videos`));
    res.json(data);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

router.get("/movie/:movieId/watch/providers", async (req, res) => {
  try {
    const id = req.params.movieId;
    const data = await getJson(withKey(`/movie/${id}/watch/providers`));
    res.json(data);
  } catch (e) {
    res
      .status(e.status || 500)
      .type("application/json")
      .send(e.body || '{"error":"tmdb"}');
  }
});

module.exports = router;
