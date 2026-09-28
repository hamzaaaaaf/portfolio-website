// The "operating system" layer shared by every page: preferences, clocks,
// the h menu, Spotlight, the desktop context menu, sticky notes, sleep and
// restart, sparks and one easter egg.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
  };
  const toast = (m) => (window.toast ? window.toast(m) : null);
  const page = document.body.dataset.page || 'home';
  const onHome = page === 'home';
  const go = (href) => { location.href = href; };
  const copyEmail = () => navigator.clipboard.writeText('hello@byhamza.dev').then(() => toast('Copied hello@byhamza.dev'), () => toast('hello@byhamza.dev'));
  document.addEventListener('click', (e) => { if (e.target.closest('[data-copy-email]')) copyEmail(); });

  /* ---------- Preferences ---------- */
  const WALLS = ['butter', 'honey', 'lemon', 'sunset', 'paper'];
  const prefs = () => store.get('prefs', {});
  function setPref(key, value) {
    const p = prefs();
    if (key === 'theme') {
      if (value === 'auto') {
        try { localStorage.removeItem('theme'); } catch (e) { /* storage blocked */ }
        root.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        try { localStorage.setItem('theme', value); } catch (e) { /* storage blocked */ }
        root.dataset.theme = value;
      }
      dispatchEvent(new CustomEvent('themechange'));
      return;
    }
    p[key] = value;
    store.set('prefs', p);
    if (key === 'wall') root.dataset.wall = value;
    if (key === 'grain') { if (value === true) root.dataset.grain = 'on'; else delete root.dataset.grain; }
    if (key === 'motion') { if (value === 'reduce') root.dataset.motion = 'reduce'; else delete root.dataset.motion; }
    if (key === 'dock') root.style.setProperty('--dock-size', `${value}px`);
  }
  function cycleWallpaper() {
    const cur = root.dataset.wall || 'butter';
    const next = WALLS[(WALLS.indexOf(cur) + 1) % WALLS.length];
    setPref('wall', next);
    toast(`Wallpaper: ${next[0].toUpperCase()}${next.slice(1)}`);
  }
  function toggleTheme() {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const apply = () => setPref('theme', next);
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply);
    else apply();
  }

  /* ---------- Time zones ---------- */
  const DEV_TZ = 'Europe/London';
  const VIEWER_TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || DEV_TZ; } catch (e) { return DEV_TZ; } })();
  const tzPart = (tz, locale, style, date) => {
    try {
      return new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: style }).formatToParts(date).find((x) => x.type === 'timeZoneName').value;
    } catch (e) { return ''; }
  };
  // Prefer a real abbreviation (BST, EST, CEST); fall back to UTC±h.
  function tzAbbr(tz, date = new Date()) {
    const tries = [tzPart(tz, 'en-GB', 'short', date), tzPart(tz, 'en-US', 'short', date)];
    const good = tries.find((a) => a && !/^(GMT|UTC)[+-−]/.test(a));
    return good || (tries[1] || tries[0] || 'UTC').replace(/^GMT/, 'UTC');
  }
  const tzLong = (tz, date = new Date()) => tzPart(tz, 'en-US', 'long', date) || tz;
  const timeIn = (tz, date = new Date(), opts = {}) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', ...opts }).format(date);
  const partsIn = (tz, date) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' })
    .formatToParts(date).reduce((o, x) => ((o[x.type] = Number(x.value)), o), {});
  window.TZ = { DEV_TZ, VIEWER_TZ, tzAbbr, tzLong, timeIn };

  const menuClocks = $$('[data-menuclock]');
  const widgets = $$('[data-tzclock]').map((el) => {
    const tz = el.dataset.tzclock === 'dev' ? DEV_TZ : VIEWER_TZ;
    el.title = tzLong(tz);
    el.querySelector('[data-tzabbr]').textContent = tzAbbr(tz);
    return { tz, h: $('.h', el), m: $('.m', el), s: $('.s', el) };
  });
  const tzTexts = $$('[data-tztext]');
  function tick() {
    const now = new Date();
    menuClocks.forEach((c) => {
      const d = new Intl.DateTimeFormat('en-GB', { timeZone: DEV_TZ, weekday: 'short', day: 'numeric', month: 'short' }).formatToParts(now)
        .reduce((o, x) => ((o[x.type] = x.value), o), {});
      c.firstElementChild.textContent = `${d.weekday} ${d.day} ${d.month.slice(0, 3)} `;
      c.lastElementChild.textContent = `${timeIn(DEV_TZ, now)} ${tzAbbr(DEV_TZ, now)}`;
      c.title = `Hamza: ${tzLong(DEV_TZ, now)}\nYou: ${timeIn(VIEWER_TZ, now)} ${tzLong(VIEWER_TZ, now)}`;
    });
    widgets.forEach((w) => {
      const t = partsIn(w.tz, now);
      w.s.style.transform = `rotate(${t.second * 6}deg)`;
      w.m.style.transform = `rotate(${t.minute * 6 + t.second * 0.1}deg)`;
      w.h.style.transform = `rotate(${(t.hour % 12) * 30 + t.minute * 0.5}deg)`;
    });
    tzTexts.forEach((el) => {
      const tz = el.dataset.tztext === 'dev' ? DEV_TZ : VIEWER_TZ;
      el.textContent = `${timeIn(tz, now)} · ${tzLong(tz, now)} (${tzAbbr(tz, now)})`;
    });
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Popover menus ---------- */
  function makeMenu(id, html) {
    const m = document.createElement('div');
    m.className = 'menu';
    m.id = id;
    m.setAttribute('role', 'menu');
    // Manual popovers: auto ones light-dismiss on the right-click's own mouseup.
    if ('popover' in HTMLElement.prototype) m.popover = 'manual';
    m.innerHTML = html;
    document.body.appendChild(m);
    openMenus.push(m);
    return m;
  }
  const showMenu = (m, x, y) => {
    if (!m.showPopover) { m.style.display = 'block'; }
    m.style.left = '0px'; m.style.top = '0px';
    if (m.showPopover && !m.matches(':popover-open')) m.showPopover();
    const r = m.getBoundingClientRect();
    m.style.left = `${Math.max(6, Math.min(x, innerWidth - r.width - 6))}px`;
    m.style.top = `${Math.max(6, Math.min(y, innerHeight - r.height - 6))}px`;
    const first = m.querySelector('button, a');
    if (first) first.focus({ preventScroll: true });
  };
  const hideMenu = (m) => { if (m.hidePopover && m.matches(':popover-open')) m.hidePopover(); else if (!m.showPopover) m.style.display = 'none'; };
  const isOpen = (m) => (m.showPopover ? m.matches(':popover-open') : m.style.display === 'block');
  const openMenus = [];
  document.addEventListener('pointerdown', (e) => {
    openMenus.forEach((m) => { if (isOpen(m) && !m.contains(e.target) && !e.target.closest('[data-menu]')) hideMenu(m); });
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') openMenus.forEach((m) => isOpen(m) && hideMenu(m)); });
  addEventListener('blur', () => openMenus.forEach((m) => isOpen(m) && hideMenu(m)));
  addEventListener('scroll', () => openMenus.forEach((m) => isOpen(m) && hideMenu(m)), { passive: true });

  const actions = {
    about: () => go('/about'),
    settings: () => go('/settings'),
    terminal: () => go('/terminal'),
    theme: toggleTheme,
    wallpaper: cycleWallpaper,
    sticky: (e) => newSticky(e),
    sleep: () => sleep(),
    restart: () => restart(),
    shutdown: () => shutdown(),
    source: () => window.open('https://github.com/hamzaaaaaf/portfolio-website', '_blank', 'noopener'),
    spotlight: () => openSpot(),
  };

  const hmenu = makeMenu('hmenu', `
    <button data-act="about">About This Hamza</button>
    <hr>
    <button data-act="settings">System Settings…</button>
    <button data-act="terminal">Terminal</button>
    <button data-act="spotlight">Spotlight Search <kbd>⌘K</kbd></button>
    <hr>
    <button data-act="sleep">Sleep</button>
    <button data-act="restart">Restart…</button>
    <button data-act="shutdown">Shut Down…</button>`);
  const logoBtn = $('[data-menu="hmenu"]');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      const r = logoBtn.getBoundingClientRect();
      if (isOpen(hmenu)) hideMenu(hmenu);
      else showMenu(hmenu, r.left, r.bottom + 4);
      logoBtn.setAttribute('aria-expanded', String(isOpen(hmenu)));
    });
    hmenu.addEventListener('toggle', (e) => logoBtn.setAttribute('aria-expanded', String(e.newState === 'open')));
  }

  const ctx = makeMenu('ctxmenu', `
    <button data-act="sticky">New Sticky Note</button>
    <hr>
    <button data-act="wallpaper">Change Wallpaper</button>
    <button data-act="theme" data-theme-label>Use Dark Mode</button>
    <hr>
    <button data-act="terminal">Open Terminal</button>
    <button data-act="settings">System Settings…</button>
    <button data-act="source">View Source</button>`);
  let ctxPoint = null;
  document.addEventListener('contextmenu', (e) => {
    if (e.shiftKey) return;
    if (e.target.closest('a, button, input, textarea, .app-canvas, .win__body, .menubar, .dock, .menu, [contenteditable], .term')) return;
    e.preventDefault();
    ctxPoint = { x: e.clientX, y: e.clientY, target: e.target };
    $('[data-theme-label]', ctx).textContent = root.dataset.theme === 'dark' ? 'Use Light Mode' : 'Use Dark Mode';
    showMenu(ctx, e.clientX, e.clientY);
  });

  [hmenu, ctx].forEach((m) => m.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    hideMenu(m);
    actions[b.dataset.act](ctxPoint);
  }));

  /* ---------- Sticky notes (saved in this browser) ---------- */
  const hero = $('[data-desktop]');
  const saveStickies = () => store.set('stickies', $$('.sticky-new').map((n) => ({
    x: parseFloat(n.style.left), y: parseFloat(n.style.top), text: $('.sticky__text', n).innerText.slice(0, 400),
  })));
  function placeSticky({ x, y, text }) {
    const n = document.createElement('div');
    n.className = 'sticky sticky-new';
    n.style.left = `${x}px`;
    n.style.top = `${y}px`;
    n.innerHTML = '<span class="sticky__grip" aria-hidden="true"></span><button class="sticky__x" type="button" aria-label="Delete note">×</button><div class="sticky__text" contenteditable="true" spellcheck="false"></div>';
    $('.sticky__text', n).textContent = text;
    hero.appendChild(n);
    const txt = $('.sticky__text', n);
    txt.addEventListener('input', saveStickies);
    $('.sticky__x', n).addEventListener('click', () => { n.remove(); saveStickies(); });
    const grip = $('.sticky__grip', n);
    let sx, sy, ox, oy, drag = false;
    grip.addEventListener('pointerdown', (e) => { drag = true; sx = e.clientX; sy = e.clientY; ox = parseFloat(n.style.left); oy = parseFloat(n.style.top); grip.setPointerCapture(e.pointerId); });
    grip.addEventListener('pointermove', (e) => { if (!drag) return; n.style.left = `${ox + e.clientX - sx}px`; n.style.top = `${oy + e.clientY - sy}px`; });
    grip.addEventListener('pointerup', () => { drag = false; saveStickies(); });
    return n;
  }
  function newSticky(point) {
    if (!hero) { go('/'); return; }
    const r = hero.getBoundingClientRect();
    const x = point ? point.x - r.left - 100 : r.width / 2 - 100;
    const y = point ? point.y - r.top - 20 : r.height / 2 - 60;
    const n = placeSticky({ x, y, text: '' });
    $('.sticky__text', n).focus();
    saveStickies();
  }
  if (hero) store.get('stickies', []).forEach(placeSticky);

  /* ---------- Sleep, restart, shut down ---------- */
  function overlay(cls, html) {
    const o = document.createElement('div');
    o.className = `overlay ${cls}`;
    o.innerHTML = html;
    document.body.appendChild(o);
    requestAnimationFrame(() => requestAnimationFrame(() => o.classList.add('show')));
    return o;
  }
  const close = (o) => { o.classList.remove('show'); setTimeout(() => o.remove(), 800); };
  function sleep() {
    const o = overlay('', '');
    setTimeout(() => {
      const now = new Date();
      o.className = 'overlay overlay--lock show';
      o.innerHTML = `<div><div class="lock__time">${timeIn(DEV_TZ, now)}</div><div class="lock__date">${new Intl.DateTimeFormat('en-GB', { timeZone: DEV_TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(now)}</div><div class="lock__hint">Click or press any key to wake</div></div>`;
      const wake = () => { close(o); removeEventListener('keydown', wake); };
      o.addEventListener('click', wake);
      addEventListener('keydown', wake);
    }, 1200);
  }
  function restart() {
    overlay('', '<svg viewBox="0 0 32 32" width="72" height="72" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#ffd84d"/><text x="16" y="22.5" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="21" fill="#000">h</text></svg>');
    try { sessionStorage.removeItem('seen-loader'); } catch (e) { /* storage blocked */ }
    setTimeout(() => go('/'), 1600);
  }
  function shutdown() {
    const o = overlay('overlay--off', '<div><p>Shut down. Press the button to start again.</p><button class="power" type="button" aria-label="Power on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v9"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/></svg></button></div>');
    $('.power', o).addEventListener('click', (e) => { e.stopPropagation(); restart(); });
  }

  /* ---------- Sparks (a global counter) ---------- */
  const sparkEls = $$('[data-sparks]');
  const showSparks = (n) => sparkEls.forEach((el) => { el.textContent = Number(n).toLocaleString('en-GB'); });
  fetch('/api/sparks').then((r) => r.json()).then((d) => showSparks(d.count)).catch(() => showSparks('✦'));
  let sparkAudio;
  function burst(x, y) {
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      s.textContent = '✦';
      const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4, d = 40 + Math.random() * 50;
      Object.assign(s.style, { position: 'fixed', left: `${x}px`, top: `${y}px`, zIndex: 480, pointerEvents: 'none', color: i % 2 ? '#ffd84d' : '#ff8a5c', fontSize: `${10 + Math.random() * 10}px`, transition: 'transform .8s cubic-bezier(.16,1,.3,1), opacity .8s', transform: 'translate(-50%,-50%)' });
      document.body.appendChild(s);
      requestAnimationFrame(() => { s.style.transform = `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) rotate(${a * 90}deg)`; s.style.opacity = '0'; });
      setTimeout(() => s.remove(), 850);
    }
  }
  function spark(e) {
    const b = e && e.currentTarget;
    const r = b ? b.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    burst(r.left + r.width / 2, r.top + r.height / 2);
    if (b) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 500); }
    if (prefs().sound !== false) {
      try {
        sparkAudio = sparkAudio || new (window.AudioContext || window.webkitAudioContext)();
        const t = sparkAudio.currentTime, o = sparkAudio.createOscillator(), g = sparkAudio.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1760, t + 0.12);
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        o.connect(g).connect(sparkAudio.destination); o.start(t); o.stop(t + 0.26);
      } catch (err) { /* no audio */ }
    }
    const cur = parseInt((sparkEls[0] && sparkEls[0].textContent || '').replace(/\D/g, ''), 10);
    if (!Number.isNaN(cur)) showSparks(cur + 1);
    fetch('/api/sparks', { method: 'POST' }).then((r) => r.json()).then((d) => showSparks(d.count)).catch(() => {});
  }
  $$('[data-spark]').forEach((b) => b.addEventListener('click', spark));
  window.spark = spark;

  /* ---------- Spotlight ---------- */
  const ICON = (bg, glyph) => `<span class="spot__ico" style="background:${bg};color:#fff">${glyph}</span>`;
  const entries = [
    { g: 'Pages', t: 'Home', k: 'start top desktop', run: () => (onHome ? scrollTo({ top: 0, behavior: 'smooth' }) : go('/')), i: ICON('linear-gradient(#fff3a6,#f5b800)', '<i style="font:italic 18px Instrument Serif,serif;color:#2b2100">h</i>') },
    { g: 'Pages', t: 'Work', k: 'projects case studies portfolio', run: () => go('/work'), i: ICON('linear-gradient(#8fd0ff,#3d97f2)', '▤') },
    { g: 'Pages', t: 'Panic Pack!', k: 'godot game project', run: () => go('/work#panic-pack'), i: ICON('linear-gradient(#ffb347,#ff8a5c)', '!') },
    { g: 'Pages', t: 'Instagram Unliker', k: 'javascript project script', run: () => go('/work#instagram-unliker'), i: ICON('linear-gradient(#ff9ab0,#ff7aa2)', '♡') },
    { g: 'Pages', t: 'Stats', k: 'leetcode github numbers practice', run: () => go('/stats'), i: ICON('#1f1d17', '<b style="color:#ffa116">{}</b>') },
    { g: 'Pages', t: 'About', k: 'about me info university aston now timeline', run: () => go('/about'), i: ICON('radial-gradient(circle at 30% 30%,#fffbe0,#f5b800)', '<i style="font:italic 16px Instrument Serif,serif;color:#3a2c00">h</i>') },
    { g: 'Pages', t: 'Contact', k: 'email mail hello message', run: () => go('/about#contact'), i: ICON('linear-gradient(#7cc8ff,#1f7cf2)', '✉') },
    { g: 'Apps', t: 'Stack', k: 'game play blocks leaderboard', run: () => go('/play'), i: ICON('linear-gradient(#fff1a8,#ffcf3a)', '<b style="color:#ff8a5c">≡</b>') },
    { g: 'Apps', t: 'Kaleidoscope', k: 'draw paint art', run: () => go('/draw'), i: ICON('#1c1a12', '<b style="color:#ffd84d">✺</b>') },
    { g: 'Apps', t: 'Terminal', k: 'shell command line zsh cli', run: () => go('/terminal'), i: ICON('#1c1a12', '<b style="color:#ffd84d;font-family:monospace">&gt;_</b>') },
    { g: 'Apps', t: 'System Settings', k: 'preferences wallpaper dock theme', run: () => go('/settings'), i: ICON('linear-gradient(#c7c7cc,#8e8e93)', '⚙') },
    { g: 'Actions', t: 'Toggle Dark Mode', k: 'theme light night appearance', run: toggleTheme, i: ICON('#3a3a3c', '◐') },
    { g: 'Actions', t: 'Change Wallpaper', k: 'background colour color', run: cycleWallpaper, i: ICON('linear-gradient(160deg,#fff3a6,#ffcf3a)', '') },
    { g: 'Actions', t: 'Leave a Spark', k: 'like star spark', run: () => spark(), i: ICON('#1c1a12', '<b style="color:#ffd84d">✦</b>') },
    { g: 'Actions', t: 'Copy Email Address', k: 'hello@byhamza.dev clipboard', run: copyEmail, i: ICON('#2f7bff', '⧉') },
    { g: 'Actions', t: 'New Sticky Note', k: 'note write', run: () => newSticky(), i: ICON('#fff2a0', '<b style="color:#3a3316">✎</b>') },
    { g: 'Actions', t: 'Sleep', k: 'lock screen', run: sleep, i: ICON('#3a3a3c', '☾') },
    { g: 'Actions', t: 'Keyboard Shortcuts', k: 'help keys hotkeys', run: () => shortcuts(), i: ICON('#3a3a3c', '⌘') },
    { g: 'Links', t: 'GitHub', k: 'code source repos hamzaaaaaf', run: () => window.open('https://github.com/hamzaaaaaf', '_blank', 'noopener'), i: ICON('#24292f', '⌥') },
    { g: 'Links', t: 'LinkedIn', k: 'cv profile work', run: () => window.open('https://www.linkedin.com/in/hamza-faisal-125833263/', '_blank', 'noopener'), i: ICON('#0a66c2', '<b>in</b>') },
    { g: 'Links', t: 'LeetCode Profile', k: 'hamza57', run: () => window.open('https://leetcode.com/u/hamza57/', '_blank', 'noopener'), i: ICON('#1f1d17', '<b style="color:#ffa116">{}</b>') },
  ];
  const spot = document.createElement('dialog');
  spot.className = 'spot';
  spot.setAttribute('aria-label', 'Spotlight search');
  spot.innerHTML = `<div class="spot__box"><label class="spot__field"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6"/></svg><input type="text" placeholder="Spotlight Search" autocomplete="off" spellcheck="false" aria-label="Search"></label><div class="spot__list" role="listbox"></div></div>`;
  document.body.appendChild(spot);
  const spotIn = $('input', spot), spotList = $('.spot__list', spot);
  let results = [], sel = 0;

  const score = (e, q) => {
    const hay = `${e.t} ${e.k}`.toLowerCase();
    if (e.t.toLowerCase().startsWith(q)) return 3;
    if (hay.includes(q)) return 2;
    let i = 0;
    for (const ch of hay) if (ch === q[i]) i++;
    return i === q.length ? 1 : 0;
  };
  function calc(q) {
    if (!/^[\d\s+\-*/().%^]+$/.test(q) || !/\d/.test(q) || !/[+\-*/%^]/.test(q)) return null;
    try {
      const v = Function(`"use strict"; return (${q.replace(/\^/g, '**')})`)();
      return Number.isFinite(v) ? Math.round(v * 1e10) / 1e10 : null;
    } catch (e) { return null; }
  }
  function renderSpot() {
    const q = spotIn.value.trim().toLowerCase();
    const math = calc(q);
    if (q) {
      // Best matches first, but keep each group together under one header.
      const ranked = entries.map((e) => [e, score(e, q)]).filter(([, s]) => s).sort((a, b) => b[1] - a[1]).map(([e]) => e);
      const order = [...new Set(ranked.map((e) => e.g))];
      results = order.flatMap((g) => ranked.filter((e) => e.g === g));
    } else results = entries.slice(0, 9);
    if (math !== null) results.unshift({ g: 'Calculator', t: `= ${math.toLocaleString('en-GB')}`, run: () => navigator.clipboard.writeText(String(math)).then(() => toast('Copied result')), i: ICON('#ff9f0a', '=') , hint: 'Copy' });
    sel = 0;
    let html = '', last = '';
    results.forEach((e, i) => {
      if (e.g !== last) { html += `<div class="spot__group">${e.g}</div>`; last = e.g; }
      html += `<button class="spot__item" role="option" data-i="${i}" aria-selected="${i === sel}">${e.i}<span>${e.t}</span><small>${e.hint || (e.g === 'Links' ? 'Open ↗' : '')}</small></button>`;
    });
    if (q && !results.length) html = `<div class="spot__group">No results for “${spotIn.value.replace(/[<>&]/g, '')}”</div>`;
    spotList.innerHTML = html;
  }
  const mark = () => $$('.spot__item', spotList).forEach((b) => {
    const on = Number(b.dataset.i) === sel;
    b.setAttribute('aria-selected', String(on));
    if (on) b.scrollIntoView({ block: 'nearest' });
  });
  const runSel = (i) => { const e = results[i]; if (!e) return; spot.close(); setTimeout(() => e.run(), 60); };
  function openSpot() {
    if (spot.open) return;
    spotIn.value = '';
    renderSpot();
    spot.showModal();
    spotIn.focus();
  }
  spotIn.addEventListener('input', renderSpot);
  spotIn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); mark(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    if (e.key === 'Enter') { e.preventDefault(); runSel(sel); }
  });
  spotList.addEventListener('click', (e) => { const b = e.target.closest('.spot__item'); if (b) runSel(Number(b.dataset.i)); });
  spotList.addEventListener('pointermove', (e) => { const b = e.target.closest('.spot__item'); if (b && Number(b.dataset.i) !== sel) { sel = Number(b.dataset.i); mark(); } });
  spot.addEventListener('click', (e) => { if (e.target === spot) spot.close(); });
  $$('[data-spotlight]').forEach((b) => b.addEventListener('click', openSpot));
  window.openSpotlight = openSpot;

  /* ---------- Keyboard ---------- */
  const sheet = makeMenu('keysheet', `
    <div style="padding:8px 10px 4px;font-weight:600">Keyboard shortcuts</div>
    <hr>
    <button data-go="spot">Spotlight <kbd>⌘K</kbd></button>
    <button data-go="/">Home <kbd>G H</kbd></button>
    <button data-go="/work">Work <kbd>G W</kbd></button>
    <button data-go="/stats">Stats <kbd>G S</kbd></button>
    <button data-go="/play">Stack <kbd>G P</kbd></button>
    <button data-go="/draw">Kaleidoscope <kbd>G D</kbd></button>
    <button data-go="/terminal">Terminal <kbd>G T</kbd></button>
    <button data-go="/about">About <kbd>G A</kbd></button>
    <button data-go="theme">Toggle dark mode <kbd>⇧D</kbd></button>`);
  sheet.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    hideMenu(sheet);
    const g = b.dataset.go;
    if (g === 'spot') openSpot(); else if (g === 'theme') toggleTheme(); else go(g);
  });
  function shortcuts() { showMenu(sheet, innerWidth / 2 - 130, innerHeight / 2 - 170); }
  const GO = { h: '/', w: '/work', s: '/stats', p: '/play', d: '/draw', t: '/terminal', a: '/about' };
  let gPending = 0;
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable], dialog')) return;
    if (page === 'play' || page === 'terminal') return;
    const k = e.key.toLowerCase();
    if (e.key === '?') { e.preventDefault(); shortcuts(); return; }
    if (e.key === 'D' && e.shiftKey) { toggleTheme(); return; }
    if (k === 'g') { gPending = Date.now(); return; }
    if (gPending && Date.now() - gPending < 1200 && GO[k]) { gPending = 0; go(GO[k]); }
  });

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kpos = 0;
  addEventListener('keydown', (e) => {
    const typing = e.target.closest && e.target.closest('input, textarea, [contenteditable]');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); spot.open ? spot.close() : openSpot(); return; }
    if (!typing && e.key === '/' && page !== 'terminal') { e.preventDefault(); openSpot(); return; }
    kpos = e.key === KONAMI[kpos] || e.key.toLowerCase() === KONAMI[kpos] ? kpos + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; confetti(); toast('You found the secret. ✦'); }
  });

  /* ---------- Confetti (yellow blocks) ---------- */
  function confetti() {
    const c = document.createElement('canvas');
    c.className = 'confetti';
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    document.body.appendChild(c);
    const g = c.getContext('2d');
    const colors = ['#ffd84d', '#ffb347', '#ff8a5c', '#ff7aa2', '#fff3a6', '#7fd6b2'];
    const bits = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight + 20,
      vx: (Math.random() - 0.5) * 16, vy: -14 - Math.random() * 14, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      w: 8 + Math.random() * 10, h: 5 + Math.random() * 6, c: colors[(Math.random() * colors.length) | 0],
    }));
    const t0 = performance.now();
    (function frame(t) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, innerWidth, innerHeight);
      for (const b of bits) {
        b.vy += 0.45; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.fillStyle = b.c; g.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); g.restore();
      }
      if (t - t0 < 3800) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }
  window.confetti = confetti;

  window.OS = { prefs, setPref, toggleTheme, cycleWallpaper, WALLS, sleep, restart, shutdown, spark, confetti, openSpotlight: openSpot, newSticky };
})();
