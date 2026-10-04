import { DurableObject } from 'cloudflare:workers';

// Serves /api/leetcode and /api/github; everything else is a static file
// from public/.
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

// The live-cursor Durable Object is retired. Preview builds can't apply class
// deletions (only production deploys can), so this empty class stays exported
// until a deleted_classes migration ships in a deploy of its own.
export class Room extends DurableObject {}

const json = (body, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/leetcode') return await leetcode(ctx);
      if (url.pathname === '/api/github') return await github(ctx);
    } catch (err) {
      return json({ error: String(err.message || err) }, 502);
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
};
