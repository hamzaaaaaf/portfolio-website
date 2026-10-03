// byhamza.dev dashboard, after the Xbox 360 "Metro" dashboard.
// Tabs, tiles, the Guide, achievements, sounds and controller support.
// Apps open full screen over the dashboard; the page never changes.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const OS = window.OS || { prefs: () => ({}), setPref() {}, achieve() {}, achieved: () => ({}), ACHIEVEMENTS: [], toggleTheme() {} };
  const prefs = () => OS.prefs();
  const reduce = () => root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nested = window.top !== window.self;
  const depth = Number(new URLSearchParams(location.search).get('d')) || 0;
  const getJSON = (u) => fetch(u, { signal: AbortSignal.timeout(8000) }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

  /* ---------- Sounds (synthesised, nothing downloaded) ---------- */
  let ac = null;
  const audio = () => {
    if (prefs().sound === false) return null;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) { return null; }
  };
  function tone(f0, f1, dur, { type = 'sine', vol = 0.06, at = 0 } = {}) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.8);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function whoosh(from, to, dur, vol = 0.05) {
    const a = audio(); if (!a) return;
    const t = a.currentTime, len = Math.ceil(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(from, t); bp.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(a.destination); src.start(t); src.stop(t + dur);
  }
  const sfx = {
    nav: () => { tone(2200, 1600, 0.045, { vol: 0.035 }); },
    select: () => { tone(880, 880, 0.08, { vol: 0.05 }); tone(1320, 1320, 0.12, { vol: 0.05, at: 0.05 }); },
    back: () => { tone(1320, 1320, 0.07, { vol: 0.045 }); tone(784, 784, 0.12, { vol: 0.045, at: 0.05 }); },
    tab: () => { whoosh(700, 2600, 0.18, 0.06); tone(1500, 1900, 0.05, { vol: 0.02 }); },
    guide: () => { whoosh(3000, 900, 0.22, 0.05); tone(660, 990, 0.16, { type: 'triangle', vol: 0.04 }); },
    nope: () => { tone(180, 150, 0.12, { type: 'square', vol: 0.03 }); },
    ach: () => {
      tone(520, 1040, 0.22, { vol: 0.08 });
      tone(1046, 1046, 0.5, { type: 'triangle', vol: 0.045, at: 0.12 });
      tone(1568, 1568, 0.6, { vol: 0.03, at: 0.2 });
      tone(2093, 2093, 0.7, { vol: 0.02, at: 0.26 });
    },
    boot: () => {
      const a = audio(); if (!a) return;
      [196, 293.7, 392, 587.3].forEach((f, i) => {
        const t = a.currentTime + i * 0.05, o = a.createOscillator(), g = a.createGain();
        o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
        o.connect(g).connect(a.destination); o.start(t); o.stop(t + 3.3);
      });
      whoosh(400, 5000, 1.2, 0.04);
      [1174.7, 1568, 2349.3, 3136].forEach((f, i) => tone(f, f, 0.6, { vol: 0.025, at: 1.1 + i * 0.12 }));
    },
  };

  /* ---------- Input mode: focus rings only for keyboard and controller ---------- */
  let inputMode = 'pointer';
  const markFocus = (el) => { $$('.is-focus').forEach((x) => x !== el && x.classList.remove('is-focus')); if (el && inputMode !== 'pointer') el.classList.add('is-focus'); };
  addEventListener('pointerdown', () => { inputMode = 'pointer'; markFocus(null); audio(); }, true);
  document.addEventListener('focusin', (e) => markFocus(e.target));

  /* ---------- Tabs ---------- */
  const TABS = $$('.pivot').map((b) => b.dataset.tab);
  const panes = $('#panes');
  let tab = 0;
  $$('.pane').forEach((p) => $$('.tile', p).forEach((t, i) => t.style.setProperty('--n', i)));
  function setTab(i, { sound = true, focus = false, url = true } = {}) {
    i = Math.max(0, Math.min(TABS.length - 1, i));
    const changed = i !== tab;
    tab = i;
    panes.style.setProperty('--i', i);
    $$('.pivot').forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    $$('.pane').forEach((p, k) => { p.classList.toggle('is-active', k === i); p.inert = k !== i; });
    if (changed && sound) sfx.tab();
    if (focus === 'pivot') $$('.pivot')[i].focus({ preventScroll: true });
    else if (focus === 'tile') { const t = $('.pane.is-active .tile'); if (t) focusEl(t); }
    if (url && !app.open) history.replaceState(null, '', `${location.pathname}${location.search}#${TABS[i]}`);
    if (TABS[i] === 'games') OS.achieve('gamer');
  }
  $$('.pivot').forEach((b, k) => b.addEventListener('click', () => setTab(k)));

  // Wheel scrolls a tab sideways, like flicking the stick.
  $$('.pane').forEach((p) => p.addEventListener('wheel', (e) => {
    if (innerWidth <= 700 || p.scrollWidth <= p.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    p.scrollLeft += e.deltaY; e.preventDefault();
  }, { passive: false }));
  // Swipe between tabs on touch screens.
  let sx = 0, sy = 0;
  panes.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  panes.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    const p = $('.pane.is-active');
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5 || (p && p.scrollWidth > p.clientWidth + 4)) return;
    setTab(tab + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Spatial navigation ---------- */
  function focusEl(el, sound) {
    if (!el) return;
    el.focus({ preventScroll: true });
    markFocus(el);
    const pane = el.closest('.pane, .app__native, .guide__panel');
    if (pane) {
      const r = el.getBoundingClientRect(), pr = pane.getBoundingClientRect();
      const pad = 40;
      if (pane.classList.contains('pane') && innerWidth > 700) {
        if (r.right > pr.right - pad) pane.scrollBy({ left: r.right - pr.right + pad + 80, behavior: reduce() ? 'auto' : 'smooth' });
        else if (r.left < pr.left + pad) pane.scrollBy({ left: r.left - pr.left - pad - 80, behavior: reduce() ? 'auto' : 'smooth' });
      } else el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce() ? 'auto' : 'smooth' });
    }
    if (sound) sfx.nav();
  }
  function items() {
    if (guideOpen()) return $$('.guide__list button');
    if (app.open) return app.native ? $$('[tabindex="0"], a, button', app.native) : [];
    return [...$$('.pane.is-active .tile'), ...$$('.pivot'), $('.me__card')];
  }
  function move(dir) {
    const list = items();
    if (!list.length) return;
    const cur = document.activeElement;
    if (!list.includes(cur)) { focusEl(guideOpen() || app.open ? list[0] : ($('.pane.is-active .tile') || list[0]), true); return; }
    if (!guideOpen() && !app.open && cur.classList.contains('pivot')) {
      if (dir === 'left' || dir === 'right') { setTab(tab + (dir === 'left' ? -1 : 1), { focus: 'pivot' }); return; }
      if (dir === 'down') { const t = $('.pane.is-active .tile'); if (t) focusEl(t, true); return; }
    }
    const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, score = Infinity;
    for (const el of list) {
      if (el === cur) continue;
      const b = el.getBoundingClientRect();
      if (!b.width) continue;
      const bx = b.left + b.width / 2, by = b.top + b.height / 2;
      let main, side;
      if (dir === 'right') { if (b.left < a.right - 6) continue; main = b.left - a.right; side = Math.abs(by - ay); }
      if (dir === 'left') { if (b.right > a.left + 6) continue; main = a.left - b.right; side = Math.abs(by - ay); }
      if (dir === 'down') { if (b.top < a.bottom - 6) continue; main = b.top - a.bottom; side = Math.abs(bx - ax); }
      if (dir === 'up') { if (b.bottom > a.top + 6) continue; main = a.top - b.bottom; side = Math.abs(bx - ax); }
      const s = main + side * 2;
      if (s < score) { score = s; best = el; }
    }
    if (!best && dir === 'up' && !guideOpen() && !app.open) best = $$('.pivot')[tab];
    if (best) focusEl(best, true); else nope(cur);
  }

  /* ---------- "Can't do that": shake, never a pop-up ---------- */
  let bPresses = 0;
  function nope(el) {
    sfx.nope();
    if (window.nope && el) { window.nope(el); return; }
    const t = el || $('.pane.is-active .tiles');
    if (!t) return;
    t.classList.remove('nope'); void t.offsetWidth; t.classList.add('nope');
    setTimeout(() => t.classList.remove('nope'), 450);
  }
  function backOnDashboard() {
    nope($('.pane.is-active .tiles'));
    if (++bPresses >= 3) OS.achieve('persistent');
  }

  /* ---------- Apps ---------- */
  const APPS = {
    about: { t: 'Hamza', u: '/about' },
    work: { t: 'Projects', u: '/work' },
    stats: { t: 'Stats', u: '/stats' },
    play: { t: 'Stack', u: '/play' },
    type: { t: 'Typing Test', u: '/type' },
    arcade: { t: 'Arcade', u: '/arcade' },
    snake: { t: 'Snake', u: '/arcade#snake' },
    breakout: { t: 'Breakout', u: '/arcade#breakout' },
    wyr: { t: 'Would You Rather', u: '/wyr' },
    draw: { t: 'Kaleidoscope', u: '/draw' },
    terminal: { t: 'Terminal', u: '/terminal' },
    guestbook: { t: 'Guestbook', u: '/guestbook' },
    ie: { t: 'Internet Explorer · byhamza.dev', u: () => `/?d=${depth + 1}` },
    achievements: { t: 'Achievements', native: renderAchievements },
    library: { t: "Hamza's games", native: renderLibrary },
    system: { t: 'System info', native: renderSystem },
  };
  const appEl = $('.app'), appBody = $('.app__body');
  const app = { open: null, native: null, frame: null, from: null, pushed: false };
  const parseHash = () => { const [id, sub] = decodeURIComponent(location.hash.slice(1)).split('/'); return { id, sub }; };

  function openApp(id, sub, origin) {
    const A = APPS[id];
    if (!A) return;
    if (app.open === id + (sub || '')) return;
    closeApp({ instant: true });
    app.open = id + (sub || '');
    app.from = origin || null;
    $('.app__title').textContent = A.t;
    appEl.hidden = false;
    appEl.classList.remove('is-loaded');
    if (A.native) {
      const box = document.createElement('div');
      box.className = 'app__native';
      appBody.appendChild(box);
      app.native = box;
      A.native(box);
      appEl.classList.add('is-loaded');
      setTimeout(() => { const f = $('[tabindex="0"], a, button', box); if (f && inputMode !== 'pointer') focusEl(f); else $('[data-back]').focus({ preventScroll: true }); }, 60);
    } else {
      const f = document.createElement('iframe');
      f.title = A.t;
      f.allow = 'gamepad; fullscreen; clipboard-write';
      f.src = (typeof A.u === 'function' ? A.u() : A.u) + (sub ? `#${sub}` : '');
      f.addEventListener('load', () => { appEl.classList.add('is-loaded'); try { f.contentWindow.focus(); } catch (e) { /* not ready */ } });
      appBody.appendChild(f);
      app.frame = f;
    }
    // Zoom out of the tile it came from.
    if (!reduce()) {
      const r = origin && origin.getBoundingClientRect();
      const from = r && r.width ? `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)` : 'inset(8% 8% 8% 8%)';
      appEl.animate([{ clipPath: from, opacity: r ? 1 : 0 }, { clipPath: 'inset(0px 0px 0px 0px)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    }
  }
  function closeApp({ instant = false } = {}) {
    if (!app.open) return;
    const done = () => {
      appEl.hidden = true;
      if (app.frame) app.frame.remove();
      if (app.native) app.native.remove();
      const from = app.from;
      Object.assign(app, { open: null, native: null, frame: null, from: null });
      if (from && document.contains(from) && inputMode !== 'pointer') focusEl(from);
    };
    if (instant || reduce()) { done(); return; }
    const r = app.from && app.from.getBoundingClientRect();
    const to = r && r.width ? `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)` : 'inset(8% 8% 8% 8%)';
    const anim = appEl.animate([{ clipPath: 'inset(0px 0px 0px 0px)', opacity: 1 }, { clipPath: to, opacity: r ? 1 : 0 }], { duration: 300, easing: 'cubic-bezier(0.4, 0, 1, 1)' });
    anim.finished.then(done, done);
  }
  // Opening an app adds a history entry, so the browser's back button closes it.
  function launch(id, sub, origin) {
    if (!APPS[id]) return;
    sfx.select();
    pendingOrigin = origin || null;
    app.pushed = true;
    location.hash = sub ? `${id}/${sub}` : id;
  }
  let pendingOrigin = null;
  function back() {
    if (guideOpen()) { closeGuide(); return; }
    if (app.open) {
      sfx.back();
      if (app.pushed) { app.pushed = false; history.back(); } else { closeApp(); history.replaceState(null, '', `#${TABS[tab]}`); }
      return;
    }
    backOnDashboard();
  }
  // Straight to a tab, closing any app without waiting on history.
  function goTab(name) {
    if (app.open) { closeApp(); app.pushed = false; }
    history.replaceState(null, '', `#${name}`);
    setTab(TABS.indexOf(name), { focus: inputMode === 'pointer' ? false : 'tile' });
  }
  function route(first) {
    const { id, sub } = parseHash();
    if (APPS[id]) {
      openApp(id, sub, pendingOrigin);
      pendingOrigin = null;
      if (first) app.pushed = false;
      return;
    }
    closeApp();
    const t = TABS.indexOf(id);
    if (t >= 0) setTab(t, { sound: !first });
  }
  addEventListener('hashchange', () => route(false));

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); if (guideOpen()) closeGuide(true); const [id, sub] = o.dataset.open.split('/'); launch(id, sub, o.classList.contains('tile') ? o : null); return; }
    const g = e.target.closest('[data-go]');
    if (g) { closeGuide(true); goTab(g.dataset.go); return; }
    if (e.target.closest('[data-back]')) { back(); return; }
    if (e.target.closest('[data-guide]')) { toggleGuide(); return; }
    if (e.target.closest('[data-poweroff]')) { closeGuide(true); powerOff(); return; }
    const s = e.target.closest('[data-set]');
    if (s) changeSetting(s.dataset.set);
    if (e.target.closest('a.tile[target="_blank"], a.tile[href^="mailto"]')) sfx.select();
  });

  // The old page addresses all land here (see the redirect in each page).
  window.X360 = {
    go(href) {
      const u = new URL(href, location.origin);
      if (u.origin !== location.origin) { window.open(u.href, '_blank', 'noopener'); return; }
      let k = u.pathname.replace(/\.html$/, '').replace(/^\/|\/$/g, '') || 'home';
      if (k === 'finder') k = 'games';
      if (APPS[k]) launch(k, u.hash ? u.hash.slice(1) : '');
      else if (TABS.includes(k)) goTab(k);
    },
  };

  // Messages from apps running inside the dashboard.
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || !e.data.x360) return;
    const d = e.data;
    if (d.t === 'ach') { if (nested) { try { parent.postMessage(d, location.origin); } catch (err) { /* no parent */ } } else showAchievement(d.id); refreshScore(); }
    else if (d.t === 'toast') toast(d.m);
    else if (d.t === 'go') window.X360.go(d.href);
    else if (d.t === 'close') back();
  });

  /* ---------- Guide ---------- */
  const guideEl = $('.guide');
  const guideOpen = () => !guideEl.hidden;
  let guideReturn = null;
  function openGuide() {
    guideReturn = document.activeElement;
    guideEl.hidden = false;
    sfx.guide();
    OS.achieve('spotlight');
    setTimeout(() => focusEl($('.guide__list button')), 30);
  }
  function closeGuide(silent) {
    if (!guideOpen()) return;
    guideEl.hidden = true;
    if (!silent) sfx.back();
    if (guideReturn && document.contains(guideReturn) && !silent) focusEl(guideReturn);
  }
  const toggleGuide = () => (guideOpen() ? closeGuide() : openGuide());
  guideEl.addEventListener('click', (e) => { if (e.target === guideEl) closeGuide(); });

  /* ---------- Toasts ---------- */
  const toaster = $('.toaster');
  const queue = [];
  let showing = false, held = true;
  function pump() {
    if (showing || held || !queue.length) return;
    showing = true;
    const { html, cls, sound } = queue.shift();
    const t = document.createElement('div');
    t.className = `toast ${cls}`;
    t.innerHTML = html;
    toaster.appendChild(t);
    if (sound) sound();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => { t.remove(); showing = false; pump(); }, 450); }, 4600);
  }
  function showAchievement(id) {
    const a = OS.ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    queue.push({ cls: 'toast--ach', sound: sfx.ach, html: `<span class="toast__orb">${a.i}</span><span class="toast__text"><small>Achievement unlocked</small><b>${a.g}G · ${esc(a.t)}</b></span>` });
    pump();
  }
  function toast(m) {
    queue.push({ cls: 'toast--msg', sound: () => tone(1046, 1318, 0.12, { vol: 0.04 }), html: `<span class="toast__orb">h</span><span class="toast__text"><small>byhamza.dev</small><b>${esc(m)}</b></span>` });
    pump();
  }
  window.toast = toast;
  addEventListener('achievement', (e) => { if (!nested) showAchievement(e.detail); refreshScore(); });

  function refreshScore() {
    const got = OS.achieved();
    const list = OS.ACHIEVEMENTS;
    const g = list.reduce((s, a) => s + (got[a.id] ? a.g : 0), 0);
    $$('[data-gs]').forEach((el) => { el.textContent = g.toLocaleString('en-GB'); });
    $$('[data-achcount]').forEach((el) => { el.textContent = list.filter((a) => got[a.id]).length; });
    $$('[data-achtotal]').forEach((el) => { el.textContent = list.length; });
    return g;
  }

  /* ---------- Native apps ---------- */
  function renderAchievements(box) {
    const got = OS.achieved(), list = OS.ACHIEVEMENTS;
    const g = refreshScore(), total = list.reduce((s, a) => s + a.g, 0), n = list.filter((a) => got[a.id]).length;
    const when = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const sorted = [...list].sort((a, b) => (got[b.id] ? 1 : 0) - (got[a.id] ? 1 : 0) || (got[b.id] || 0) - (got[a.id] || 0));
    box.innerHTML = `<div class="ach-head"><span class="pic"><i>h</i></span><div><h2>byhamza.dev</h2><p>${n} of ${list.length} unlocked · <span class="gs"><i>G</i>${g} / ${total}</span></p></div><div class="ach-bar"><i style="transform:scaleX(${n / list.length})"></i></div></div>
      <ul class="ach-list">${sorted.map((a) => {
        const on = !!got[a.id], hide = a.secret && !on;
        return `<li class="ach${on ? '' : ' is-locked'}" tabindex="0"><span class="ach__i">${hide ? '?' : a.i}</span><span class="ach__t"><b>${hide ? 'Secret achievement' : esc(a.t)}</b><span>${hide ? 'Keep exploring to unlock this one.' : esc(a.d)}${on ? ` · ${when(got[a.id])}` : ''}</span></span><span class="ach__g">${a.g}G</span></li>`;
      }).join('')}</ul>`;
  }
  let GAMES = null;
  const games = () => (GAMES ? Promise.resolve(GAMES) : getJSON('/games.json').then((g) => (GAMES = g)));
  const cover = (g) => `<div class="cover cover--game" style="--c1:${g.c[0]};--c2:${g.c[1]};--c3:${g.c[2]}"><span class="cover__band">${esc(g.g)} · ${g.y}</span><span class="cover__g">${g.i}</span><span class="cover__t">${esc(g.t)}</span></div>`;
  function renderLibrary(box) {
    box.innerHTML = '<h2 class="native-title">Games I grew up on, and still play</h2><div class="lib">Loading…</div>';
    games().then((list) => {
      $('.lib', box).innerHTML = list.filter((g) => g.h).map((g) => `<figure tabindex="0">${cover(g)}<figcaption>${esc(g.t)} · ${g.y}</figcaption></figure>`).join('');
    }).catch(() => { $('.lib', box).textContent = 'Offline.'; });
  }
  function renderSystem(box) {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    const rows = [
      ['Console', 'byhamza.dev'],
      ['Dashboard', 'Metro, after the 2011 Xbox 360 update'],
      ['Built with', 'HTML, CSS and JavaScript. No framework, no build step'],
      ['Hosting', 'Cloudflare Workers'],
      ['Storage', 'D1 for leaderboards, votes and the guestbook'],
      ['Live presence', 'A Durable Object relaying WebSockets'],
      ['Sounds', 'Synthesised in the browser with Web Audio'],
      ['Controller', pads.length ? esc(pads[0].id.split('(')[0].trim()) : 'None connected. Plug one in and press a button'],
      ['Gamerscore', `${refreshScore()} / 1000`],
      ['Source', '<a href="https://github.com/hamzaaaaaf/portfolio-website" target="_blank" rel="noopener">github.com/hamzaaaaaf/portfolio-website ↗</a>'],
    ];
    box.innerHTML = `<h2 class="native-title">System info</h2><dl class="sys">${rows.map(([k, v]) => `<div tabindex="0"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  }

  /* ---------- Settings ---------- */
  function settingLabels() {
    const p = prefs();
    const v = {
      theme: root.dataset.theme === 'dark' ? 'Dark' : 'Light',
      skin: root.dataset.skin === 'yellow' ? 'Yellow' : 'Green',
      sound: p.sound === false ? 'Off' : 'On',
      motion: root.dataset.motion === 'reduce' ? 'Reduced' : 'Full',
      live: p.live === false ? 'Off' : 'On',
    };
    $$('[data-setval]').forEach((el) => { el.textContent = v[el.dataset.setval]; });
  }
  function changeSetting(k) {
    const p = prefs();
    if (k === 'theme') { OS.toggleTheme(); setTimeout(settingLabels, 50); }
    if (k === 'skin') { const s = root.dataset.skin === 'yellow' ? 'green' : 'yellow'; OS.setPref('skin', s); root.dataset.skin = s; OS.achieve('decorator'); }
    if (k === 'sound') { OS.setPref('sound', p.sound === false); }
    if (k === 'motion') { OS.setPref('motion', root.dataset.motion === 'reduce' ? 'full' : 'reduce'); }
    if (k === 'live') { OS.setPref('live', p.live === false); toast('Takes effect next time you turn on.'); }
    sfx.select();
    settingLabels();
  }
  addEventListener('themechange', settingLabels);
  settingLabels();

  /* ---------- Live tiles ---------- */
  const set = (k, v) => $$(`[data-live="${k}"]`).forEach((el) => { el.textContent = v; });
  getJSON('/api/leetcode').catch(() => getJSON('/leetcode.json')).then((d) => set('lc', d.solved.All)).catch(() => set('lc', '–'));
  getJSON('/api/scores?game=stack').then(({ scores }) => { set('stack', scores[0] ? scores[0].score : 0); set('stackby', scores[0] ? `· ${scores[0].name}` : ''); }).catch(() => {});
  getJSON('/api/scores?game=type').then(({ scores }) => set('type', scores[0] ? scores[0].score : 0)).catch(() => {});
  getJSON('/api/guestbook').then(({ entries }) => {
    const e = entries[0];
    if (!e) return;
    const img = `<img src="${e.drawing}" alt="Drawing by ${esc(e.name)}" width="300" height="300">`;
    $$('[data-live="guest"], [data-live="guest2"]').forEach((el) => { el.innerHTML = img; });
    set('guestby', `Guestbook · latest by ${e.name}`);
  }).catch(() => {});
  games().then((list) => {
    const a = list[(Math.random() * list.length) | 0];
    let b = a; while (b.id === a.id) b = list[(Math.random() * list.length) | 0];
    const [ea, eb] = [$('[data-live="wyr-a"]'), $('[data-live="wyr-b"]')];
    [[ea, a], [eb, b]].forEach(([el, g]) => { if (el) { el.textContent = g.t; el.style.setProperty('--c1', g.c[0]); el.style.setProperty('--c2', g.c[1]); } });
    const fan = $('[data-libfan]');
    if (fan) fan.innerHTML = list.filter((g) => g.h).slice(0, 5).map((g, k) => cover(g).replace('class="cover cover--game"', `class="cover cover--game" style="--k:${k}"`).replace('" style="--c1', ';--c1')).join('');
  }).catch(() => {});
  addEventListener('presence', (e) => {
    const n = e.detail || 1;
    $$('[data-online-n]').forEach((el) => { el.textContent = n; });
    const live = $('[data-online]');
    if (live) { live.hidden = n < 2; live.textContent = `${n - 1} other${n === 2 ? '' : 's'} online`; }
  });

  /* ---------- Clock ---------- */
  function clock() {
    const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    $$('[data-clock]').forEach((el) => { el.textContent = t; });
  }
  clock(); setInterval(clock, 15000);

  /* ---------- Keyboard ---------- */
  const typing = (e) => e.target.closest && e.target.closest('input, textarea, [contenteditable]');
  addEventListener('keydown', (e) => {
    if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!powerEl.hidden || !bootEl.hidden) { if (!powerEl.hidden) { e.preventDefault(); powerOn(); } else skipBoot(); return; }
    const dirs = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (dirs[e.key]) {
      if (app.open && !app.native) return;
      e.preventDefault(); inputMode = 'key'; move(dirs[e.key]); return;
    }
    if (e.key === 'Escape') { e.preventDefault(); inputMode = 'key'; if (guideOpen() || app.open) back(); else openGuide(); return; }
    if (e.key === 'Backspace' && !app.open && !guideOpen()) { e.preventDefault(); backOnDashboard(); return; }
    if ((e.key === '[' || e.key === 'PageUp') && !app.open && !guideOpen()) { e.preventDefault(); setTab(tab - 1, { focus: inputMode === 'pointer' ? false : 'tile' }); }
    if ((e.key === ']' || e.key === 'PageDown') && !app.open && !guideOpen()) { e.preventDefault(); setTab(tab + 1, { focus: inputMode === 'pointer' ? false : 'tile' }); }
    if (e.key === 'Tab') inputMode = 'key';
  });

  /* ---------- Controller ---------- */
  const held_ = {};
  let padUsed = false, repeatAt = {}, padLoop = 0;
  const DIR = { 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
  function press(b) {
    inputMode = 'pad';
    if (!padUsed) { padUsed = true; OS.achieve('tidy'); }
    if (!powerEl.hidden) { powerOn(); return; }
    if (!bootEl.hidden) { skipBoot(); return; }
    if (b === 16 || b === 9 || b === 8) { toggleGuide(); return; }
    if (b === 1) { back(); return; }
    if (app.open && !app.native) return;
    if (DIR[b]) { move(DIR[b]); return; }
    if (b === 0) { const el = document.activeElement; if (el && el !== document.body && items().includes(el)) el.click(); else move('down'); return; }
    if (b === 4 && !guideOpen()) setTab(tab - 1, { focus: 'tile' });
    if (b === 5 && !guideOpen()) setTab(tab + 1, { focus: 'tile' });
  }
  function poll(t) {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    if (!pads.length) { padLoop = 0; return; }
    const p = pads[0];
    const state = {};
    p.buttons.forEach((btn, i) => { state[i] = btn.pressed || btn.value > 0.5; });
    const [x = 0, y = 0] = p.axes;
    if (y < -0.55) state[12] = true; if (y > 0.55) state[13] = true; if (x < -0.55) state[14] = true; if (x > 0.55) state[15] = true;
    for (const k of Object.keys(state)) {
      const b = Number(k);
      if (state[b] && !held_[b]) { press(b); repeatAt[b] = t + 380; }
      else if (state[b] && DIR[b] && t > repeatAt[b]) { press(b); repeatAt[b] = t + 130; }
      held_[b] = state[b];
    }
    padLoop = requestAnimationFrame(poll);
  }
  addEventListener('gamepadconnected', (e) => { if (!padLoop) padLoop = requestAnimationFrame(poll); toast(`Controller connected`); });
  if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) padLoop = requestAnimationFrame(poll);

  /* ---------- Power and boot ---------- */
  const powerEl = $('.power'), bootEl = $('.boot');
  let bootTimer = 0;
  function enter() {
    bootEl.hidden = true;
    held = false; pump();
    document.body.classList.add('is-entering');
    setTimeout(() => document.body.classList.remove('is-entering'), 1400);
    try { sessionStorage.setItem('x360-on', '1'); } catch (e) { /* storage blocked */ }
  }
  function powerOn() {
    powerEl.hidden = true;
    if (reduce()) { enter(); return; }
    bootEl.hidden = false;
    bootEl.style.animation = 'none'; void bootEl.offsetWidth; bootEl.style.animation = '';
    sfx.boot();
    bootTimer = setTimeout(enter, 4000);
  }
  function skipBoot() { clearTimeout(bootTimer); enter(); }
  function powerOff() {
    sfx.back();
    if (app.open) { closeApp({ instant: true }); history.replaceState(null, '', '#home'); }
    held = true;
    powerEl.hidden = false;
    powerEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    $('.power__btn').focus({ preventScroll: true });
  }
  powerEl.addEventListener('click', powerOn);
  bootEl.addEventListener('click', skipBoot);

  /* ---------- Start ---------- */
  refreshScore();
  setTab(0, { sound: false, url: false });
  route(true);
  let seen = false;
  try { seen = sessionStorage.getItem('x360-on') === '1'; } catch (e) { /* storage blocked */ }
  if (nested || seen || app.open || reduce()) enter();
  else {
    if (matchMedia('(pointer: coarse)').matches) $('.power__hint').textContent = 'Tap to turn on';
    powerEl.hidden = false; $('.power__btn').focus({ preventScroll: true });
  }
})();
