// camvia-api/src/tmdb.js (CommonJS)
const express = require("express");
const router = express.Router();

const V4_BEARER = (
  process.env.TMDB_BEARER ||
  process.env.TMDB_READ_TOKEN ||
  ""
).trim();
const V3_KEY = (process.env.TMDB_API_KEY || "").trim();

function buildUrl(path, params = {}) {
  const url = new URL("https://api.themoviedb.org/3" + path);
  if (!V4_BEARER && V3_KEY) url.searchParams.set("api_key", V3_KEY);
  for (const [k, v] of Object.entries(params))
    url.searchParams.set(k, String(v));
  return url.toString();
}

async function tmdbGet(path, params) {
  const headers = V4_BEARER ? { Authorization: `Bearer ${V4_BEARER}` } : {};
  const r = await fetch(buildUrl(path, params), { headers });
  const text = await r.text();
  if (!r.ok) return { status: r.status, text };
  return { json: JSON.parse(text) };
}

// routes
router.get("/person/:id", async (req, res) => {
  const out = await tmdbGet(`/person/${req.params.id}`, {
    append_to_response: "combined_credits",
  });
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

router.get("/person/:id/images", async (req, res) => {
  const out = await tmdbGet(`/person/${req.params.id}/images`);
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

router.get("/trending/people", async (_req, res) => {
  const out = await tmdbGet(`/person/popular`);
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

router.get("/trending/tv", async (_req, res) => {
  const out = await tmdbGet(`/tv/popular`, { language: "en-US", page: 1 });
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

router.get("/movies/now_playing", async (_req, res) => {
  const out = await tmdbGet(`/movie/now_playing`);
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

router.get("/search", async (req, res) => {
  const { query, type = "multi" } = req.query;
  const path = `/search/${type}`;
  const out = await tmdbGet(path, { query });
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

router.get("/person/imdb/:imdbId", async (req, res) => {
  const { imdbId } = req.params;
  const find = await tmdbGet(`/find/${imdbId}`, { external_source: "imdb_id" });
  if (find.status)
    return res.status(find.status).type("application/json").send(find.text);
  const match = find.json.person_results?.[0];
  if (!match?.id) return res.status(404).json({ error: "not-found" });
  const details = await tmdbGet(`/person/${match.id}`, {
    append_to_response: "combined_credits",
  });
  if (details.status)
    return res
      .status(details.status)
      .type("application/json")
      .send(details.text);
  res.json(details.json);
});

router.get("/credits", async (req, res) => {
  const { id, media_type } = req.query;
  const out = await tmdbGet(`/${media_type}/${id}/credits`, {
    language: "en-US",
  });
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

router.get("/videos", async (req, res) => {
  const { media_type, id } = req.query;
  const out = await tmdbGet(`/${media_type}/${id}/videos`, {
    language: "en-US",
  });
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

router.get("/movie/:id/watch/providers", async (req, res) => {
  const out = await tmdbGet(`/movie/${req.params.id}/watch/providers`);
  if (out.status)
    return res.status(out.status).type("application/json").send(out.text);
  res.json(out.json);
});

module.exports = router;
