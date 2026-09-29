import { DurableObject } from 'cloudflare:workers';

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

// Each game has its own board and its own sane score range.
const GAMES = { stack: { max: 400 }, type: { max: 250 } };

async function topScores(env, game) {
  const { results } = await env.DB.prepare(
    'SELECT name, MAX(score) AS score, MIN(created) AS created FROM scores WHERE game = ?1 GROUP BY name ORDER BY score DESC, created ASC LIMIT 10',
  ).bind(game).all();
  return results;
}

async function scores(request, env) {
  const game = new URL(request.url).searchParams.get('game') || 'stack';
  if (!GAMES[game]) return json({ error: 'Unknown game' }, 400);
  if (request.method === 'GET') return json({ scores: await topScores(env, game) });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }
  const name = String(body.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const score = Number(body.score);
  if (name.length !== 3) return json({ error: 'Use three letters or numbers.' }, 400);
  if (BLOCKED.has(name)) return json({ error: 'Pick different initials.' }, 400);
  if (!Number.isInteger(score) || score < 1 || score > GAMES[game].max) return json({ error: 'That score looks off.' }, 400);

  const who = await visitor(request);
  if (await limited(env, who, 'score', 5, 60000)) return json({ error: 'Slow down a little.' }, 429);
  await env.DB.prepare('INSERT INTO scores (name, score, created, who, game) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(name, score, Date.now(), who, game).run();
  return json({ ok: true, scores: await topScores(env, game) });
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

/* ---------- Guestbook (D1, pre-moderated) ---------- */

// Words and patterns that are rejected outright. Everything else still waits
// for approval before anyone else can see it.
const BAD_WORDS = ['fuck', 'shit', 'cunt', 'bitch', 'nigg', 'fag', 'retard', 'whore', 'slut', 'rape', 'nazi', 'kys', 'dick', 'pussy', 'cock', 'porn', 'sex', 'penis', 'vagina', 'hitler'];
const clean = (s) => {
  const t = s.toLowerCase().replace(/[^a-z]/g, '').replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's');
  if (BAD_WORDS.some((w) => t.includes(w))) return false;
  if (/(https?:|www\.|\.com|\.net|\.org|\.gg|\.io|@\w)/i.test(s)) return false;
  return true;
};
const MAX_DRAWING = 120000;

async function guestbook(request, env, url) {
  const admin = url.pathname.startsWith('/api/guestbook/review');
  if (admin) {
    const key = request.headers.get('x-admin-key') || '';
    if (!env.ADMIN_KEY) return json({ error: 'Set an ADMIN_KEY secret on the Worker first.' }, 503);
    if (key !== env.ADMIN_KEY) return json({ error: 'Wrong key.' }, 401);
    if (request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id, name, message, drawing, created, approved FROM guestbook WHERE approved = 0 ORDER BY created ASC LIMIT 50').all();
      return json({ pending: results });
    }
    const body = await request.json().catch(() => ({}));
    const id = Number(body.id);
    if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
    if (body.action === 'approve') await env.DB.prepare('UPDATE guestbook SET approved = 1 WHERE id = ?1').bind(id).run();
    else if (body.action === 'delete') await env.DB.prepare('DELETE FROM guestbook WHERE id = ?1').bind(id).run();
    else return json({ error: 'Bad action' }, 400);
    return json({ ok: true });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT id, name, message, drawing, created FROM guestbook WHERE approved = 1 ORDER BY created DESC LIMIT 60').all();
    return json({ entries: results });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Bad JSON' }, 400);
  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  const message = String(body.message || '').trim().replace(/\s+/g, ' ').slice(0, 140);
  const drawing = String(body.drawing || '');
  if (!name) return json({ error: 'Add your name.' }, 400);
  if (!clean(name) || !clean(message)) return json({ error: 'Keep it friendly, and no links please.' }, 400);
  if (!drawing.startsWith('data:image/png;base64,') || drawing.length > MAX_DRAWING) return json({ error: 'That drawing could not be saved.' }, 400);
  const who = await visitor(request);
  if (await limited(env, who, 'guestbook', 3, 3600000)) return json({ error: 'You have signed a few times already. Try again later.' }, 429);
  const res = await env.DB.prepare('INSERT INTO guestbook (name, message, drawing, created, who, approved) VALUES (?1, ?2, ?3, ?4, ?5, 0)')
    .bind(name, message, drawing, Date.now(), who).run();
  return json({ ok: true, id: res.meta.last_row_id, pending: true });
}

/* ---------- Live cursors (one Durable Object per page) ---------- */

const ADJ = ['Sunny', 'Golden', 'Swift', 'Quiet', 'Brave', 'Lucky', 'Cosy', 'Bright', 'Clever', 'Mellow'];
const ANIMAL = ['Fox', 'Otter', 'Panda', 'Owl', 'Koala', 'Lynx', 'Robin', 'Tiger', 'Whale', 'Bee'];
const COLOURS = ['#ff5f57', '#0a64e8', '#28c840', '#ff8a5c', '#a259ff', '#e5484d', '#12a4a4', '#d99a00', '#ff7aa2', '#3d97f2'];

export class Room extends DurableObject {
  async fetch(request) {
    if (request.headers.get('upgrade') !== 'websocket') return new Response('Expected a websocket', { status: 426 });
    const sockets = this.ctx.getWebSockets();
    if (sockets.length >= 40) return new Response('Room is full', { status: 429 });
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const me = { id: crypto.randomUUID().slice(0, 8), c: pick(COLOURS), n: `${pick(ADJ)} ${pick(ANIMAL)}` };
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(me);
    server.send(JSON.stringify({ t: 'hi', ...me, count: sockets.length + 1 }));
    this.broadcast({ t: 'count', count: sockets.length + 1 }, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(msg, except) {
    const out = JSON.stringify(msg);
    for (const ws of this.ctx.getWebSockets()) if (ws !== except) { try { ws.send(out); } catch (e) { /* closed */ } }
  }

  webSocketMessage(ws, raw) {
    if (typeof raw !== 'string' || raw.length > 200) return;
    let d;
    try { d = JSON.parse(raw); } catch { return; }
    const me = ws.deserializeAttachment();
    if (d.t === 'm') {
      const x = Math.max(0, Math.min(1, Number(d.x) || 0));
      const y = Math.max(0, Math.min(100000, Math.round(Number(d.y) || 0)));
      this.broadcast({ t: 'm', id: me.id, c: me.c, n: me.n, x, y }, ws);
    } else if (d.t === 'bye') {
      this.broadcast({ t: 'bye', id: me.id }, ws);
    }
  }

  webSocketClose(ws) {
    const me = ws.deserializeAttachment();
    const count = this.ctx.getWebSockets().filter((w) => w !== ws).length;
    this.broadcast({ t: 'bye', id: me.id, count }, ws);
  }

  webSocketError(ws) { this.webSocketClose(ws); }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/leetcode') return await leetcode(ctx);
      if (url.pathname === '/api/github') return await github(ctx);
      if (url.pathname === '/api/scores') return await scores(request, env);
      if (url.pathname === '/api/sparks') return await sparks(request, env);
      if (url.pathname.startsWith('/api/guestbook')) return await guestbook(request, env, url);
      if (url.pathname === '/api/live') {
        const room = (url.searchParams.get('room') || '/').replace(/[^a-z/]/g, '').slice(0, 20) || '/';
        return env.ROOMS.get(env.ROOMS.idFromName(room)).fetch(request);
      }
    } catch (err) {
      return json({ error: String(err.message || err) }, 502);
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
};
