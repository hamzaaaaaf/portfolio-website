(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const set = (k, v) => $$(`[data-live="${k}"]`).forEach((el) => { el.textContent = v; });
  const getJSON = (u) => fetch(u, { signal: AbortSignal.timeout(7000) }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

  /* ---------- Widgets ---------- */
  getJSON('/api/leetcode').catch(() => getJSON('/leetcode.json')).then((d) => set('lc', d.solved.All)).catch(() => {});
  getJSON('/api/scores?game=stack').then(({ scores }) => {
    const t = scores[0];
    set('stack', t ? t.score : 0);
    set('stackby', t ? `by ${t.name}` : 'Set the first one');
  }).catch(() => {});
  getJSON('/api/scores?game=type').then(({ scores }) => {
    const t = scores[0];
    set('type', t ? t.score : 0);
    set('typeby', t ? `wpm by ${t.name}` : 'wpm');
  }).catch(() => {});
  getJSON('/api/guestbook').then(({ entries }) => {
    const e = entries[0];
    if (!e) return;
    $('[data-live="guest"]').innerHTML = `<img src="${e.drawing}" alt="Drawing by ${esc(e.name)}" width="300" height="300">`;
    set('guestby', `by ${e.name}`);
  }).catch(() => {});

  /* ---------- Desktop icons ---------- */
  // Click selects, double-click opens, drag moves. On touch a tap opens.
  const desk = $('[data-desktop]');
  const iconBox = $('.icons');
  const icons = $$('.dicon');
  const free = matchMedia('(min-width: 901px) and (min-height: 621px) and (pointer: fine)');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('icon-pos') || '{}'); } catch (e) { /* storage blocked */ }
  const place = (el, x, y) => { el.dataset.x = x; el.dataset.y = y; el.style.translate = `${x}px ${y}px`; };
  const unplace = (el) => { delete el.dataset.x; delete el.dataset.y; el.style.translate = ''; };
  const applySaved = () => icons.forEach((el) => {
    const p = saved[el.dataset.icon];
    if (free.matches && p) place(el, p[0], p[1]); else unplace(el);
  });
  applySaved();
  free.addEventListener('change', applySaved);
  const select = (list) => icons.forEach((el) => el.classList.toggle('is-selected', list.includes(el)));

  icons.forEach((el) => {
    let sx, sy, ox, oy, moved = false, down = false;
    el.addEventListener('pointerdown', (e) => {
      if (!free.matches || e.button !== 0) return;
      down = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      ox = Number(el.dataset.x || 0); oy = Number(el.dataset.y || 0);
      if (!el.classList.contains('is-selected')) select([el]);
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      el.classList.add('is-dragging');
      place(el, ox + dx, oy + dy);
    });
    const up = () => {
      if (!down) return;
      down = false;
      el.classList.remove('is-dragging');
      if (!moved) return;
      // Keep icons on the desktop and clear of the Dock.
      const r = el.getBoundingClientRect(), d = desk.getBoundingClientRect();
      const fx = Math.min(0, d.right - r.right) + Math.max(0, d.left - r.left);
      const fy = Math.min(0, d.bottom - 90 - r.bottom) + Math.max(0, d.top - r.top);
      place(el, Number(el.dataset.x) + fx, Number(el.dataset.y) + fy);
      saved[el.dataset.icon] = [Number(el.dataset.x), Number(el.dataset.y)];
      try { localStorage.setItem('icon-pos', JSON.stringify(saved)); } catch (err) { /* storage blocked */ }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', (e) => {
      // Keyboard activation (detail 0) and touch open straight away.
      if (!free.matches || e.detail === 0) return;
      e.preventDefault();
      if (moved) { moved = false; return; }
      if (e.detail >= 2) location.href = el.href;
    });
  });

  // Rubber-band selection on the empty desktop.
  if (desk) {
    let band = null, bx = 0, by = 0;
    desk.addEventListener('pointerdown', (e) => {
      if (!free.matches || e.button !== 0) return;
      if (e.target !== desk && e.target !== iconBox && !e.target.classList.contains('hero__field')) return;
      select([]);
      const d = desk.getBoundingClientRect();
      bx = e.clientX - d.left; by = e.clientY - d.top;
      band = document.createElement('div');
      band.className = 'marquee';
      desk.appendChild(band);
      desk.setPointerCapture(e.pointerId);
    });
    desk.addEventListener('pointermove', (e) => {
      if (!band) return;
      const d = desk.getBoundingClientRect();
      const x = e.clientX - d.left, y = e.clientY - d.top;
      const l = Math.min(x, bx), t = Math.min(y, by), w = Math.abs(x - bx), h = Math.abs(y - by);
      Object.assign(band.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px` });
      select(icons.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left < l + w + d.left && r.right > l + d.left && r.top < t + h + d.top && r.bottom > t + d.top;
      }));
    });
    const end = () => { if (band) { band.remove(); band = null; } };
    desk.addEventListener('pointerup', end);
    desk.addEventListener('pointercancel', end);
  }
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable], dialog')) return;
    const sel = icons.filter((el) => el.classList.contains('is-selected'));
    if (e.key === 'Enter' && sel.length === 1) location.href = sel[0].href;
    else if (e.key === 'Escape') select([]);
    else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && free.matches) { e.preventDefault(); select(icons); }
  });

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
