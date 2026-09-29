(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const set = (k, v) => $$(`[data-live="${k}"]`).forEach((el) => { el.textContent = v; });
  const getJSON = (u) => fetch(u, { signal: AbortSignal.timeout(7000) }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
  const facts = [];

  /* ---------- Live tiles ---------- */
  const lc = getJSON('/api/leetcode').catch(() => getJSON('/leetcode.json')).then((d) => {
    set('lc', d.solved.All);
    set('lcsub', `${d.solved.Easy} easy · ${d.solved.Medium} medium · ${d.solved.Hard} hard`);
    facts.push(`${d.solved.All} LeetCode problems solved`);
  }).catch(() => {});
  const stack = getJSON('/api/scores?game=stack').then(({ scores }) => {
    const t = scores[0];
    set('stack', t ? t.score : 0);
    set('stackby', t ? `by ${t.name} · can you beat it?` : 'No record yet. Set one.');
    if (t) facts.push(`Stack record: ${t.score} by ${t.name}`);
  }).catch(() => {});
  const type = getJSON('/api/scores?game=type').then(({ scores }) => {
    const t = scores[0];
    set('type', t ? t.score : 0);
    set('typeby', t ? `wpm by ${t.name}` : 'wpm · be the first');
    if (t) facts.push(`Typing record: ${t.score} wpm by ${t.name}`);
  }).catch(() => {});
  const guest = getJSON('/api/guestbook').then(({ entries }) => {
    const e = entries[0];
    if (!e) return;
    $('[data-live="guest"]').innerHTML = `<img src="${e.drawing}" alt="Drawing by ${esc(e.name)}" width="300" height="300">`;
    set('guestby', `by ${e.name}${e.message ? `: “${e.message}”` : ''}`);
    facts.push(`${entries.length} drawing${entries.length === 1 ? '' : 's'} on the guestbook wall`);
  }).catch(() => {});
  const votes = getJSON('/api/wyr/top').then((d) => {
    if (d.votes) facts.push(`${d.votes.toLocaleString('en-GB')} Would You Rather votes`);
    if (d.top[0]) facts.push(`Most loved game right now: ${d.top[0].game.replace(/-/g, ' ')}`);
  }).catch(() => {});

  /* ---------- Ticker ---------- */
  Promise.allSettled([lc, stack, type, guest, votes]).then(() => {
    const track = $('[data-ticker]');
    if (!track || !facts.length) return;
    const extra = facts.map((f) => `<span>${esc(f)}</span>`).join('');
    track.innerHTML = extra + track.innerHTML;
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Clocks ---------- */
  function times() {
    const T = window.TZ;
    if (!T) return;
    $$('[data-tzshort]').forEach((el) => { el.textContent = T.timeIn(el.dataset.tzshort === 'dev' ? T.DEV_TZ : T.VIEWER_TZ); });
    $$('[data-tzabbr-dev]').forEach((el) => { el.textContent = T.tzAbbr(T.DEV_TZ); });
    $$('[data-tzabbr-viewer]').forEach((el) => { el.textContent = T.tzAbbr(T.VIEWER_TZ); });
  }
  setTimeout(times, 50);
  setInterval(times, 10000);

  /* ---------- Would You Rather, on the home page ---------- */
  const box = $('[data-homewyr]');
  let games = [], pair = null, done = false;
  function nextPair() {
    let a, b;
    do { a = games[(Math.random() * games.length) | 0]; b = games[(Math.random() * games.length) | 0]; } while (a.id === b.id);
    pair = [a, b];
    done = false;
    box.classList.remove('is-voted');
    $$('.hv__opt', box).forEach((el, i) => {
      el.classList.remove('is-pick');
      el.querySelector('b').textContent = pair[i].t;
      el.querySelector('i').style.transform = 'scaleX(0)';
      el.querySelector('em').textContent = '';
      el.style.setProperty('--c1', pair[i].c[0]);
      el.style.setProperty('--c2', pair[i].c[1]);
    });
  }
  async function vote(side) {
    if (done || !pair) return;
    done = true;
    const pick = pair[side];
    box.classList.add('is-voted');
    $$('.hv__opt', box)[side].classList.add('is-pick');
    let counts = { [pick.id]: 1, [pair[1 - side].id]: 0 };
    try {
      const r = await fetch('/api/wyr', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a: pair[0].id, b: pair[1].id, pick: pick.id }) });
      if (r.ok) counts = (await r.json()).counts;
    } catch (e) { /* offline */ }
    const total = counts[pair[0].id] + counts[pair[1].id] || 1;
    $$('.hv__opt', box).forEach((el, i) => {
      const pct = Math.round((counts[pair[i].id] / total) * 100);
      el.querySelector('em').textContent = `${pct}%`;
      el.querySelector('i').style.transform = `scaleX(${pct / 100})`;
    });
    if (window.OS) window.OS.achieve('voter');
    setTimeout(() => { if (done) nextPair(); }, 2600);
  }
  if (box) {
    box.addEventListener('click', (e) => {
      const opt = e.target.closest('.hv__opt');
      if (opt) vote(Number(opt.dataset.side));
      if (e.target.closest('[data-hvnext]')) nextPair();
    });
    getJSON('/games.json').then((g) => { games = g; nextPair(); }).catch(() => {});
  }
})();
