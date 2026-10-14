import { DurableObject } from 'cloudflare:workers';

// Serves /api/feed: live stats pulled from LeetCode, GitHub, Letterboxd,
// Steam, PlayStation Network and Valorant. A cron trigger refreshes them every
// six hours into KV, so a visit never waits on six other websites, and a
// source that fails keeps its last good copy. Everything else is a static
// file from public/.
//
// Secrets, set in Workers & Pages > portfolio-website > Settings > Variables
// and Secrets (any that are missing just leave their section out):
//   PSN_NPSSO        PlayStation sign-in token, from ca.account.sony.com/api/v1/ssocookie
//   HENRIK_API_KEY   HenrikDev Valorant API key
//   VALORANT_ID      Riot ID as name#tag, kept out of the repo and the page
//   VALORANT_REGION  eu, na, ap, kr, latam or br (eu if unset)
//   OMDB_API_KEY     OMDb key, for IMDb ratings
//   STEAM_API_KEY    Steam Web API key, for full library hours
//   GITHUB_TOKEN     optional; GitHub limits anonymous requests from shared IPs
//   FORTNITE_API_KEY fortnite-api.com key, for Fortnite stats
//   FORTNITE_NAME    Epic (or PSN) display name, kept out of the repo and the page
//   JINA_API_KEY     optional; a jina.ai key, so reading Letterboxd isn't rate limited
//
// /api/feed?refresh pulls everything again, at most once every ten minutes.

const LEETCODE_USER = 'hamza57';
const GITHUB_USER = 'hamzaaaaaf';
const LETTERBOXD_USER = 'hamzaaaaaf';
const STEAM_PROFILE = 'babakhan47';
const STALE_MS = 6 * 3600 * 1000;
const UA = 'Mozilla/5.0 (compatible; byhamza.dev)';

/* ---------- helpers ---------- */

class Skip extends Error {}
// One more go after a short wait, for hosts that sometimes turn Cloudflare away.
const retry = (fn) => fn().catch(() => new Promise((r) => setTimeout(r, 1500)).then(fn));
async function get(url, init = {}, type = 'json', ms = 8000) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(ms), headers: { 'user-agent': UA, ...init.headers } });
  // Only the host and the reply go in the error, never a URL that might carry a key.
  if (!res.ok) {
    const why = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 80);
    throw new Error(`${new URL(url).host} responded ${res.status}${why ? `: ${why}` : ''}`);
  }
  return type === 'json' ? res.json() : res.text();
}
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${name}>`));
  return m ? m[1].trim() : '';
};
const entities = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const hours = (min) => Math.round(min / 6) / 10;
const clean = (s) => String(s || '').replace(/[™®]/g, '').trim();

/* ---------- LeetCode ---------- */

const LEETCODE_QUERY = `query ($u: String!) {
  allQuestionsCount { difficulty count }
  matchedUser(username: $u) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    userCalendar { streak totalActiveDays }
  }
  recentAcSubmissionList(username: $u, limit: 15) { title titleSlug timestamp }
}`;

async function leetcode() {
  const { data } = await get('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', referer: `https://leetcode.com/u/${LEETCODE_USER}/` },
    body: JSON.stringify({ query: LEETCODE_QUERY, variables: { u: LEETCODE_USER } }),
  });
  if (!data || !data.matchedUser) throw new Error('no LeetCode user data');
  const seen = new Set();
  return {
    solved: Object.fromEntries(data.matchedUser.submitStatsGlobal.acSubmissionNum.map((d) => [d.difficulty, d.count])),
    totals: Object.fromEntries(data.allQuestionsCount.map((d) => [d.difficulty, d.count])),
    activeDays: data.matchedUser.userCalendar.totalActiveDays,
    streak: data.matchedUser.userCalendar.streak,
    recent: data.recentAcSubmissionList
      .filter((s) => !seen.has(s.titleSlug) && seen.add(s.titleSlug))
      .slice(0, 4)
      .map((s) => ({ title: s.title, ts: Number(s.timestamp) })),
  };
}

/* ---------- GitHub ---------- */

async function github(env) {
  const headers = { accept: 'application/vnd.github+json' };
  if (env.GITHUB_TOKEN) headers.authorization = `Bearer ${env.GITHUB_TOKEN}`;
  const repos = (await get(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, { headers })).filter((r) => !r.fork);
  // Share of repos by main language: one request, so the rate limit lasts.
  const count = {};
  for (const r of repos) if (r.language) count[r.language] = (count[r.language] || 0) + 1;
  const total = Object.values(count).reduce((x, y) => x + y, 0) || 1;
  return {
    repos: repos.length,
    stars: repos.reduce((n, r) => n + r.stargazers_count, 0),
    languages: Object.entries(count).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([name, c]) => [name, Math.round((c / total) * 100)]),
    latest: repos[0] ? { name: repos[0].name, pushed: repos[0].pushed_at } : null,
  };
}

/* ---------- Letterboxd, with IMDb ratings ---------- */

let imdbError = null;
async function letterboxd(env, imdb) {
  imdbError = null;
  const xml = await get(`https://letterboxd.com/${LETTERBOXD_USER}/rss/`, {}, 'text');
  const diary = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => ({
    title: entities(tag(it, 'letterboxd:filmTitle')),
    year: Number(tag(it, 'letterboxd:filmYear')) || null,
    rating: Number(tag(it, 'letterboxd:memberRating')) || null,
    liked: tag(it, 'letterboxd:memberLike') === 'Yes',
    watched: tag(it, 'letterboxd:watchedDate') || null,
    poster: (it.match(/<img src="([^"]+)"/) || [])[1] || null,
  })).filter((f) => f.title);
  const key = (f) => `${f.title}|${f.year}`;
  const seen = new Set();
  const logged = diary.filter((f) => !seen.has(key(f)) && seen.add(key(f)));

  // The RSS feed only has diary entries. Films that are just rated come from
  // the site; diary entries newer than the last read of it go on top.
  const site = await letterboxdSite(env).catch((err) => ({ errors: [String(err.message || err)] }));
  const fromDiary = (f) => logged.find((d) => key(d) === key(f)) || {};
  let recent = logged;
  if (site.rated && site.rated.length) {
    const newer = logged.filter((f) => f.watched && Date.parse(f.watched) > site.ratedAt - 2 * 864e5);
    const seenR = new Set();
    recent = [...newer, ...site.rated.map((f) => ({ ...fromDiary(f), ...f }))].filter((f) => !seenR.has(key(f)) && seenR.add(key(f)));
  }
  recent = recent.slice(0, 12);
  let favourites = site.favourites && site.favourites.length ? site.favourites.map((f) => ({ ...fromDiary(f), ...f }))
    : logged.filter((f) => f.rating >= 4.5 || f.liked).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
  favourites = favourites.map((f) => ({ ...f, poster: f.poster || fromDiary(f).poster || null }));

  // Without an OMDb key there's nothing to look up, so the lookups stop there.
  let lookups = env.OMDB_API_KEY ? 0 : Infinity;
  const rate = async (f) => {
    const k = key(f), hit = imdb[k];
    // Ratings keep for a month; misses are tried again the next day.
    const fresh = hit && hit.src === 'omdb' && Date.now() - hit.t < (hit.rating ? 30 : 1) * 864e5;
    if (!fresh && lookups++ < 12) {
      let r = null;
      try { r = await imdbRating(env, f); } catch (err) { imdbError = imdbError || String(err.message || err).slice(0, 100); }
      imdb[k] = { ...r, src: 'omdb', t: Date.now() };
    }
    const r = imdb[k] || {};
    return { ...f, imdb: r.rating || null, poster: f.poster || r.poster || null };
  };
  const out = {
    favourites: await Promise.all(favourites.map(rate)),
    recent: await Promise.all(recent.map(rate)),
    films: site.films || null,
    thisYear: site.thisYear || null,
    source: !site.favourites && !site.rated ? `RSS only (${site.errors.join('; ').slice(0, 120)})`
      : site.errors.length ? `letterboxd.com, saved copy (${site.errors.join('; ').slice(0, 120)})` : 'letterboxd.com',
  };
  out.ratings = !env.OMDB_API_KEY ? 'OMDB_API_KEY not set' : imdbError || `${[...out.favourites, ...out.recent].filter((f) => f.imdb).length} films rated`;
  return out;
}

// Letterboxd puts a browser check in front of requests from Cloudflare, so a
// page that gets turned away is fetched through the r.jina.ai reader instead.
// The reader limits busy addresses (Cloudflare's are shared), so a 429 waits
// as long as it asks and goes again; JINA_API_KEY gets a limit of its own.
// The selector keeps the reply to the parts that get used.
async function reader(url, env, selector) {
  const headers = { 'user-agent': UA, 'x-return-format': 'html', 'x-target-selector': selector };
  if (env.JINA_API_KEY) headers.authorization = `Bearer ${env.JINA_API_KEY}`;
  for (let i = 0; ; i++) {
    const res = await fetch(`https://r.jina.ai/${url}`, { headers, signal: AbortSignal.timeout(30000) });
    if (res.status === 429 && i < 4) {
      const wait = Number((await res.json().catch(() => ({}))).retryAfter) || 3;
      await new Promise((r) => setTimeout(r, Math.min(wait, 10) * 1000 + 500));
      continue;
    }
    if (!res.ok) throw new Error(`r.jina.ai responded ${res.status}`);
    return res.text();
  }
}
async function letterboxdPage(path, env, selector) {
  const url = `https://letterboxd.com/${LETTERBOXD_USER}/${path}`;
  const tries = [
    () => get(url, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', accept: 'text/html' } }, 'text'),
    () => reader(url, env, selector),
  ];
  let why = null;
  for (const t of tries) {
    try {
      const html = await t();
      if (html.includes('data-item-name="')) return html;
      why = 'letterboxd.com asked for a browser check';
    } catch (err) { why = String(err.message || err); }
  }
  throw new Error(why);
}
const lbFilms = (html) => html.split(/data-item-name="/).slice(1).map((chunk) => {
  const name = entities(chunk.slice(0, chunk.indexOf('"')));
  const m = name.match(/^(.*) \((\d{4})\)$/);
  const stars = chunk.match(/rated-(\d+)/);
  return { title: m ? m[1] : name, year: m ? Number(m[2]) : null, rating: stars ? Number(stars[1]) / 2 : null };
});
// Letterboxd's own pages: the four profile favourites, the film counts, and
// the films by date rated. Each keeps its last good read in KV, since the
// browser check comes and goes.
async function letterboxdSite(env) {
  const saved = JSON.parse((await env.FEED.get('letterboxd')) || '{}');
  const site = { ...saved };
  const errors = [];
  // One after the other, to stay under the reader's limit.
  const settle = (p) => p.then((value) => ({ status: 'fulfilled', value }), (reason) => ({ status: 'rejected', reason }));
  const profile = await settle(letterboxdPage('', env, '.profile-stats, #favourites'));
  const rated = await settle(letterboxdPage('films/by/rated-date/', env, '.poster-grid li.griditem:nth-child(-n+12)'));
  if (profile.status === 'fulfilled') {
    const html = profile.value;
    const stat = (label) => Number(((html.match(new RegExp(`<span class="value">([\\d,]+)</span>\\s*<span class="definition[^"]*">${label}</span>`)) || [])[1] || '').replace(/,/g, '')) || null;
    const favs = lbFilms((html.match(/<section[^>]*id="favourites"[\s\S]*?<\/section>/) || [''])[0]).slice(0, 4);
    if (favs.length) site.favourites = favs;
    site.films = stat('Films') || site.films || null;
    site.thisYear = stat('This year') || null;
  } else errors.push(`profile: ${profile.reason.message}`);
  if (rated.status === 'fulfilled') {
    const list = lbFilms(rated.value).filter((f) => f.rating);
    if (list.length) { site.rated = list.slice(0, 24); site.ratedAt = Date.now(); }
  } else errors.push(`rated: ${rated.reason.message}`);
  if (errors.length < 2) await env.FEED.put('letterboxd', JSON.stringify(site));
  return { ...site, errors };
}

// IMDb's own site blocks servers, so ratings come from OMDb.
async function imdbRating(env, f) {
  const q = new URLSearchParams({ apikey: env.OMDB_API_KEY, t: f.title, type: 'movie' });
  if (f.year) q.set('y', f.year);
  const d = await get(`https://www.omdbapi.com/?${q}`);
  if (d.Response === 'True' && d.imdbRating && d.imdbRating !== 'N/A') {
    return { rating: d.imdbRating, poster: d.Poster && d.Poster !== 'N/A' ? d.Poster : null };
  }
  return null;
}

/* ---------- Steam ---------- */

async function steam(env) {
  const xml = await get(`https://steamcommunity.com/id/${STEAM_PROFILE}/?xml=1`, {}, 'text');
  const id = tag(xml, 'steamID64');
  const out = {
    since: Number((tag(xml, 'memberSince').match(/\d{4}/) || [])[0]) || null,
    recent: [...xml.matchAll(/<mostPlayedGame>([\s\S]*?)<\/mostPlayedGame>/g)].map(([, g]) => ({
      name: clean(tag(g, 'gameName')),
      twoWeeks: Number(tag(g, 'hoursPlayed')) || 0,
      hours: Number(tag(g, 'hoursOnRecord').replace(/,/g, '')) || 0,
    })),
  };
  // The full library needs a Web API key, and "Game details" set to public.
  if (env.STEAM_API_KEY && id) {
    const q = new URLSearchParams({ key: env.STEAM_API_KEY, steamid: id, include_appinfo: '1', include_played_free_games: '1' });
    const d = await get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?${q}`).catch(() => null);
    const games = (d && d.response && d.response.games) || [];
    if (games.length) {
      out.games = games.length;
      out.totalHours = Math.round(games.reduce((n, g) => n + g.playtime_forever, 0) / 60);
      out.top = games.sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 6).map((g) => ({
        name: clean(g.name), hours: hours(g.playtime_forever),
        art: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      }));
    }
  }
  return out;
}

/* ---------- PlayStation Network ---------- */

const PSN_AUTH = 'https://ca.account.sony.com/api/authz/v3/oauth';
const PSN_APP = { client: '09515159-7237-4370-9b40-3806e67c0891', basic: 'Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=', redirect: 'com.scee.psxandroid.scecompcall://redirect', scope: 'psn:mobile.v2.core psn:clientapp' };

async function psnTokens(body) {
  const d = await get(`${PSN_AUTH}/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', authorization: PSN_APP.basic },
    body: new URLSearchParams({ token_format: 'jwt', ...body }).toString(),
  });
  if (!d.access_token) throw new Error('PSN sign-in failed');
  return d;
}

// The NPSSO token signs in once; after that the refresh token, kept in KV and
// renewed on every run, keeps the session going.
async function psnAccess(env) {
  const saved = JSON.parse((await env.FEED.get('psn-auth')) || 'null');
  if (saved && saved.access && saved.accessExp > Date.now() + 60000) return saved.access;
  let t = null;
  if (saved && saved.refresh && saved.refreshExp > Date.now()) {
    t = await psnTokens({ refresh_token: saved.refresh, grant_type: 'refresh_token', scope: PSN_APP.scope }).catch(() => null);
  }
  if (!t) {
    if (!env.PSN_NPSSO) throw new Skip('PSN_NPSSO not set');
    const q = new URLSearchParams({ access_type: 'offline', client_id: PSN_APP.client, redirect_uri: PSN_APP.redirect, response_type: 'code', scope: PSN_APP.scope });
    const res = await fetch(`${PSN_AUTH}/authorize?${q}`, { headers: { cookie: `npsso=${env.PSN_NPSSO}` }, redirect: 'manual', signal: AbortSignal.timeout(8000) });
    const code = new URLSearchParams((res.headers.get('location') || '').split('?')[1] || '').get('code');
    if (!code) throw new Error('PSN_NPSSO expired, get a new one');
    t = await psnTokens({ code, redirect_uri: PSN_APP.redirect, grant_type: 'authorization_code' });
  }
  const now = Date.now();
  await env.FEED.put('psn-auth', JSON.stringify({
    access: t.access_token,
    accessExp: now + (t.expires_in || 3600) * 1000,
    refresh: t.refresh_token || (saved && saved.refresh),
    refreshExp: t.refresh_token ? now + (t.refresh_token_expires_in || 5183999) * 1000 : (saved && saved.refreshExp),
  }));
  return t.access_token;
}

const duration = (iso) => {
  const m = String(iso || '').match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/) || [];
  return (Number(m[1] || 0) * 24 + Number(m[2] || 0) + Number(m[3] || 0) / 60);
};

async function psn(env) {
  if (!env.PSN_NPSSO && !(await env.FEED.get('psn-auth'))) throw new Skip('PSN_NPSSO not set');
  const auth = { authorization: `Bearer ${await psnAccess(env)}` };
  const api = 'https://m.np.playstation.com/api';
  const [summary, played] = await Promise.all([
    retry(() => get(`${api}/trophy/v1/users/me/trophySummary`, { headers: auth })),
    retry(() => get(`${api}/gamelist/v2/users/me/titles?categories=ps4_game,ps5_native_game&limit=200&offset=0`, { headers: auth })),
  ]);
  // One entry per game: the PS4 and PS5 versions of a game count together.
  // PSN reports many titles' platform as "unknown", so they're all just PlayStation.
  const byName = new Map();
  for (const g of played.titles || []) {
    const name = clean(g.localizedName || g.name).replace(/\s*\((?:PlayStation|PS)\s*[45]\)$/i, '');
    const t = byName.get(name) || { name, platform: 'PlayStation', hours: 0, first: null, last: null, art: g.imageUrl || null };
    t.hours += duration(g.playDuration);
    if (g.firstPlayedDateTime && (!t.first || g.firstPlayedDateTime < t.first)) t.first = g.firstPlayedDateTime;
    if (g.lastPlayedDateTime && (!t.last || g.lastPlayedDateTime > t.last)) t.last = g.lastPlayedDateTime;
    byName.set(name, t);
  }
  const titles = [...byName.values()].map((t) => ({ ...t, hours: Math.round(t.hours) }));
  // Peak years: the years the most-played hours started in.
  const byYear = {};
  for (const g of titles) if (g.first) byYear[g.first.slice(0, 4)] = (byYear[g.first.slice(0, 4)] || 0) + g.hours;
  const t = summary.earnedTrophies || {};
  return {
    level: Number(summary.trophyLevel) || null,
    progress: summary.progress || null,
    trophies: { platinum: t.platinum || 0, gold: t.gold || 0, silver: t.silver || 0, bronze: t.bronze || 0 },
    games: titles.length,
    totalHours: Math.round(titles.reduce((n, g) => n + g.hours, 0)),
    top: [...titles].sort((a, b) => b.hours - a.hours).slice(0, 6).map(({ name, platform, hours: h, art }) => ({ name, platform, hours: h, art })),
    recent: [...titles].sort((a, b) => String(b.last).localeCompare(String(a.last))).slice(0, 4).map(({ name, platform, last }) => ({ name, platform, last })),
    peakYears: Object.entries(byYear).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([year, h]) => ({ year: Number(year), hours: h })),
  };
}

/* ---------- Valorant (HenrikDev API) ---------- */

async function valorant(env) {
  if (!env.HENRIK_API_KEY || !env.VALORANT_ID) throw new Skip('HENRIK_API_KEY or VALORANT_ID not set');
  const [name, tagLine] = env.VALORANT_ID.split('#').map((s) => encodeURIComponent(s.trim()));
  const region = (env.VALORANT_REGION || 'eu').toLowerCase();
  const headers = { authorization: env.HENRIK_API_KEY };
  const [mmr, account, matches] = await Promise.all([
    get(`https://api.henrikdev.xyz/valorant/v3/mmr/${region}/pc/${name}/${tagLine}`, { headers }),
    get(`https://api.henrikdev.xyz/valorant/v2/account/${name}/${tagLine}`, { headers }).catch(() => null),
    get(`https://api.henrikdev.xyz/valorant/v4/matches/${region}/pc/${name}/${tagLine}?mode=competitive&size=10`, { headers }).catch(() => null),
  ]);
  const d = mmr.data || {};
  const seasons = d.seasonal || [];
  // Only the rank goes out: the Riot ID stays in the secret.
  return {
    rank: (d.current && d.current.tier && d.current.tier.name) || null,
    rr: d.current ? d.current.rr : null,
    peak: (d.peak && d.peak.tier && d.peak.tier.name) || null,
    peakSeason: (d.peak && d.peak.season && d.peak.season.short) || null,
    wins: seasons.reduce((n, s) => n + (s.wins || 0), 0),
    games: seasons.reduce((n, s) => n + (s.games || 0), 0),
    level: (account && account.data && account.data.account_level) || null,
    // Riot doesn't publish play time, so ranked hours are estimated from the
    // average length of the latest ranked games.
    hours: estimateHours(seasons.reduce((n, s) => n + (s.games || 0), 0), matches),
  };
}
function estimateHours(games, matches) {
  const lengths = ((matches && matches.data) || []).map((m) => m.metadata && m.metadata.game_length_in_ms).filter((ms) => ms > 5 * 60000);
  if (!games || !lengths.length) return null;
  return Math.round((games * lengths.reduce((a, b) => a + b, 0)) / lengths.length / 3600000);
}

/* ---------- Fortnite (fortnite-api.com) ---------- */

async function fortnite(env) {
  if (!env.FORTNITE_API_KEY || !env.FORTNITE_NAME) throw new Skip('FORTNITE_API_KEY or FORTNITE_NAME not set');
  const headers = { authorization: env.FORTNITE_API_KEY };
  let d = null, failed = null;
  for (const type of ['epic', 'psn']) {
    try {
      d = await get(`https://fortnite-api.com/v2/stats/br/v2?${new URLSearchParams({ name: env.FORTNITE_NAME, accountType: type })}`, { headers });
      break;
    } catch (err) { failed = failed || err; }
  }
  if (!d) throw failed;
  const o = d.data.stats.all.overall;
  // Only the numbers go out: the account name stays in the secret.
  return {
    wins: o.wins, kills: o.kills, matches: o.matches,
    kd: Math.round(o.kd * 100) / 100, winRate: Math.round(o.winRate * 10) / 10,
    hours: Math.round((o.minutesPlayed || 0) / 60),
    level: (d.data.battlePass && d.data.battlePass.level) || null,
  };
}

/* ---------- the feed ---------- */

async function refresh(env) {
  const prev = JSON.parse((await env.FEED.get('feed')) || '{}');
  const imdb = JSON.parse((await env.FEED.get('imdb')) || '{}');
  const jobs = {
    leetcode: () => leetcode(),
    github: () => github(env),
    movies: () => letterboxd(env, imdb),
    steam: () => steam(env),
    psn: () => psn(env),
    valorant: () => valorant(env),
    fortnite: () => fortnite(env),
  };
  const out = { updated: Date.now(), status: {} };
  await Promise.all(Object.entries(jobs).map(async ([k, job]) => {
    try {
      out[k] = await job();
      out.status[k] = 'ok';
    } catch (err) {
      // Keep the last good copy, unless the source has been switched off.
      out[k] = err instanceof Skip ? null : prev[k] || null;
      out.status[k] = String(err.message || err).slice(0, 100);
    }
  }));
  await Promise.all([env.FEED.put('feed', JSON.stringify(out)), env.FEED.put('imdb', JSON.stringify(imdb))]);
  return out;
}

async function feed(env, ctx, force) {
  let data = JSON.parse((await env.FEED.get('feed')) || 'null');
  if (!data || (force && Date.now() - data.updated > 10 * 60000)) data = await refresh(env);
  else if (Date.now() - data.updated > STALE_MS && !(await env.FEED.get('refreshing'))) {
    // Serve what's there now and refresh in the background, once.
    ctx.waitUntil(env.FEED.put('refreshing', '1', { expirationTtl: 300 }).then(() => refresh(env)));
  }
  return Response.json(data, { headers: { 'cache-control': 'public, max-age=300' } });
}

// The live-cursor Durable Object is retired. Preview builds can't apply class
// deletions (only production deploys can), so this empty class stays exported
// until a deleted_classes migration ships in a deploy of its own.
export class Room extends DurableObject {}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/feed') {
      try {
        return await feed(env, ctx, url.searchParams.has('refresh'));
      } catch (err) {
        return Response.json({ error: String(err.message || err) }, { status: 502, headers: { 'cache-control': 'no-store' } });
      }
    }
    if (url.pathname.startsWith('/api/')) return Response.json({ error: 'Not found' }, { status: 404 });
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refresh(env));
  },
};
