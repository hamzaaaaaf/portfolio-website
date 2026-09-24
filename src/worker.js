// Serves /api/leetcode; everything else is a static file from public/.
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/leetcode') {
      try {
        return await leetcode(ctx);
      } catch (err) {
        return Response.json({ error: String(err.message || err) }, { status: 502 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
