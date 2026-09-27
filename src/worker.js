// Serves /api/* (LeetCode and GitHub stats, Stack leaderboard, sparks); everything
// else is a static file from public/.
// LeetCode's API doesn't allow browser requests from other sites, so the
// Worker fetches it server-side and caches the result for an hour.

const LEETCODE_USER = 'hamza57';
const CACHE_SECONDS = 3600;

const QUERY = `query ($u: String!) {
  allQuestionsCount { difficulty count }
  matchedUser(username: $u) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    userCalendar { streak totalActiveDays submissionCalendar }
  }
  recentAcSubmissionList(username: $u, limit: 20) { title titleSlug timestamp }
}`;

async function leetcode(ctx) {
  const cache = caches.default;
  const key = new Request('https://byhamza.dev/api/leetcode?v=1');
  const hit = await cache.match(key);
  if (hit) return hit;

  const res = await fetch('https://leetcode.com/graphql', {
    signal: AbortSignal.timeout(6000),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      referer: `https://leetcode.com/u/${LEETCODE_USER}/`,
      'user-agent': 'Mozilla/5.0 (byhamza.dev portfolio)',
    },
    body: JSON.stringify({ query: QUERY, variables: { u: LEETCODE_USER } }),
  });
  if (!res.ok) throw new Error(`LeetCode responded ${res.status}`);
  const { data } = await res.json();
  if (!data || !data.matchedUser) throw new Error('No LeetCode user data');

  const solved = Object.fromEntries(
    data.matchedUser.submitStatsGlobal.acSubmissionNum.map((d) => [d.difficulty, d.count]),
  );
  const totals = Object.fromEntries(data.allQuestionsCount.map((d) => [d.difficulty, d.count]));
  const seen = new Set();
  const recent = data.recentAcSubmissionList
    .filter((s) => !seen.has(s.titleSlug) && seen.add(s.titleSlug))
    .slice(0, 6)
    .map((s) => ({ title: s.title, slug: s.titleSlug, ts: Number(s.timestamp) }));

  const body = {
    username: LEETCODE_USER,
    solved,
    totals,
    activeDays: data.matchedUser.userCalendar.totalActiveDays,
    calendar: JSON.parse(data.matchedUser.userCalendar.submissionCalendar || '{}'),
    recent,
    updated: Math.floor(Date.now() / 1000),
  };

  const out = new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${CACHE_SECONDS}`,
    },
  });
  ctx.waitUntil(cache.put(key, out.clone()));
  return out;
}

/* ---------- GitHub (public repos and languages) ---------- */

const GITHUB_USER = 'hamzaaaaaf';

async function github(ctx) {
  const cache = caches.default;
  const key = new Request('https://byhamza.dev/api/github?v=1');
  const hit = await cache.match(key);
  if (hit) return hit;

  const headers = { 'user-agent': 'byhamza.dev', accept: 'application/vnd.github+json' };
  const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, { headers, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
  const repos = (await res.json()).filter((r) => !r.fork);

  // Byte counts per language, summed across repos.
  const languages = {};
  await Promise.all(repos.map(async (r) => {
    const l = await fetch(r.languages_url, { headers, signal: AbortSignal.timeout(6000) }).catch(() => null);
    if (!l) return;
    if (!l.ok) return;
    for (const [name, bytes] of Object.entries(await l.json())) languages[name] = (languages[name] || 0) + bytes;
  }));

  const body = {
    repos: repos.map((r) => ({ name: r.name, url: r.html_url, language: r.language, pushed: r.pushed_at, stars: r.stargazers_count })),
    languages,
    updated: Math.floor(Date.now() / 1000),
  };
  const out = new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${CACHE_SECONDS}` },
  });
  ctx.waitUntil(cache.put(key, out.clone()));
  return out;
}

/* ---------- Stack leaderboard and sparks (D1) ---------- */

const json = (body, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

// A daily-rotating hash of IP + user agent. Enough to rate limit without
// storing anything that identifies a visitor.
async function visitor(request) {
  const day = new Date().toISOString().slice(0, 10);
  const raw = `${request.headers.get('cf-connecting-ip') || ''}|${request.headers.get('user-agent') || ''}|${day}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// True if this visitor did `action` more than `max` times in `windowMs`.
async function limited(env, who, action, max, windowMs) {
  const now = Date.now();
  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM hits WHERE who = ?1 AND action = ?2 AND ts > ?3')
    .bind(who, action, now - windowMs).first();
  if (n >= max) return true;
  await env.DB.batch([
    env.DB.prepare('INSERT INTO hits (who, action, ts) VALUES (?1, ?2, ?3)').bind(who, action, now),
    env.DB.prepare('DELETE FROM hits WHERE ts < ?1').bind(now - 86400000),
  ]);
  return false;
}

const BLOCKED = new Set(['ASS', 'FUK', 'FUC', 'FCK', 'SEX', 'CUM', 'DIK', 'DIC', 'KKK', 'NIG', 'FAG', 'TIT', 'POO', 'WTF', 'GAY', 'JEW', 'NAZ', 'HOE', 'CNT', 'KYS']);

async function topScores(env) {
  const { results } = await env.DB.prepare(
    'SELECT name, MAX(score) AS score, MIN(created) AS created FROM scores GROUP BY name ORDER BY score DESC, created ASC LIMIT 10',
  ).all();
  return results;
}

async function scores(request, env) {
  if (request.method === 'GET') return json({ scores: await topScores(env) });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }
  const name = String(body.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const score = Number(body.score);
  if (name.length !== 3) return json({ error: 'Use three letters or numbers.' }, 400);
  if (BLOCKED.has(name)) return json({ error: 'Pick different initials.' }, 400);
  if (!Number.isInteger(score) || score < 1 || score > 400) return json({ error: 'That score looks off.' }, 400);

  const who = await visitor(request);
  if (await limited(env, who, 'score', 5, 60000)) return json({ error: 'Slow down a little.' }, 429);
  await env.DB.prepare('INSERT INTO scores (name, score, created, who) VALUES (?1, ?2, ?3, ?4)')
    .bind(name, score, Date.now(), who).run();
  return json({ ok: true, scores: await topScores(env) });
}

async function sparks(request, env) {
  if (request.method === 'POST') {
    const who = await visitor(request);
    if (!(await limited(env, who, 'spark', 40, 86400000))) {
      await env.DB.prepare("UPDATE counters SET value = value + 1 WHERE key = 'sparks'").run();
    }
  } else if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }
  const row = await env.DB.prepare("SELECT value FROM counters WHERE key = 'sparks'").first();
  return json({ count: row ? row.value : 0 });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/leetcode') return await leetcode(ctx);
      if (url.pathname === '/api/github') return await github(ctx);
      if (url.pathname === '/api/scores') return await scores(request, env);
      if (url.pathname === '/api/sparks') return await sparks(request, env);
    } catch (err) {
      return json({ error: String(err.message || err) }, 502);
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
};
