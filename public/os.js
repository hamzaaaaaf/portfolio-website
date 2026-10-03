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
  // SHELL: the Xbox-style dashboard at /. EMBED: an app opened inside it.
  const SHELL = document.body.dataset.shell === 'x360';
  const EMBED = window.top !== window.self;
  const tell = (msg) => { try { parent.postMessage({ x360: true, ...msg }, location.origin); } catch (e) { /* cross-origin parent */ } };
  const toast = (m) => (EMBED ? tell({ t: 'toast', m }) : window.toast ? window.toast(m) : null);
  const page = document.body.dataset.page || 'home';
  const onHome = page === 'home';
  const go = (href) => {
    if (SHELL && window.X360) window.X360.go(href);
    else if (EMBED) tell({ t: 'go', href });
    else location.href = href;
  };
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
    if (key === 'wall') { root.dataset.wall = value; achieve('decorator'); }
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
    if (next === 'dark') achieve('darkside');
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply);
    else apply();
  }

  /* ---------- Achievements ---------- */
  const ACHIEVEMENTS = [
    { id: 'hello', i: '👋', g: 5, t: 'Hello, world', d: 'Sign in to byhamza.dev for the first time.' },
    { id: 'explorer', i: '🧭', g: 50, t: 'Explorer', d: 'Open every app on the dashboard.' },
    { id: 'gamer', i: '🕹️', g: 10, t: 'Gamer', d: 'Open the games tab.' },
    { id: 'spotlight', i: '🧿', g: 10, t: 'Guide', d: 'Open the Guide.' },
    { id: 'darkside', i: '🌙', g: 10, t: 'Dark side', d: 'Switch to the dark theme.' },
    { id: 'decorator', i: '🎨', g: 10, t: 'Interior designer', d: 'Change the theme.' },
    { id: 'tidy', i: '🎮', g: 30, t: 'Plug and play', d: 'Navigate with a controller.' },
    { id: 'spark', i: '✦', g: 10, t: 'Spark', d: 'Leave a spark.' },
    { id: 'stack10', i: '🧱', g: 20, t: 'Builder', d: 'Stack 10 blocks.' },
    { id: 'stack20', i: '🏗️', g: 50, t: 'Skyscraper', d: 'Stack 20 blocks.' },
    { id: 'perfect5', i: '🎯', g: 40, t: 'Precision', d: 'Land 5 perfect drops in a row.' },
    { id: 'wpm60', i: '⌨️', g: 30, t: 'Quick fingers', d: 'Type 60 wpm or faster.' },
    { id: 'wpm100', i: '⚡', g: 70, t: 'Blazing', d: 'Type 100 wpm or faster.' },
    { id: 'artist', i: '🖌️', g: 20, t: 'Artist', d: 'Save a kaleidoscope drawing.' },
    { id: 'signer', i: '✍️', g: 30, t: 'Signed', d: 'Sign the guestbook.' },
    { id: 'hacker', i: '💻', g: 20, t: 'Hacker', d: 'Run hamzafetch in the terminal.' },
    { id: 'company', i: '👥', g: 30, t: 'Party up', d: 'See another visitor online.' },
    { id: 'nightowl', i: '🦉', g: 20, t: 'Night owl', d: 'Visit between midnight and 5am.' },
    { id: 'voter', i: '🗳️', g: 10, t: 'Voter', d: 'Vote in Would You Rather.' },
    { id: 'critic', i: '🏆', g: 30, t: 'Critic', d: 'Cast 25 Would You Rather votes.' },
    { id: 'snake20', i: '🐍', g: 40, t: 'Long boi', d: 'Score 20 in Snake.' },
    { id: 'breakout', i: '🧱', g: 40, t: 'Wrecking ball', d: 'Clear a level in Breakout.' },
    { id: 'cheater', i: '🕹️', g: 20, t: 'Cheater', d: 'Enter a cheat code.', secret: true },
    { id: 'codebreaker', i: '🔓', g: 275, t: 'Code breaker', d: 'Find every cheat code.', secret: true },
    { id: 'persistent', i: '🅱️', g: 15, t: 'Persistent', d: 'Press B on the dashboard three times.', secret: true },
    { id: 'sudo', i: '🚫', g: 15, t: 'Nice try', d: 'Try sudo in the terminal.', secret: true },
    { id: 'konami', i: '🎮', g: 50, t: 'Old school', d: 'Enter the Konami code.', secret: true },
    { id: 'creeper', i: '💥', g: 25, t: 'Aw man', d: 'Type the word creeper anywhere.', secret: true },
    { id: 'clicker', i: '🌀', g: 15, t: 'Spin cycle', d: 'Click your gamerpic five times.', secret: true },
  ];  const achieved = () => store.get('achievements', {});
  const notifs = document.createElement('div');
  notifs.className = 'notifs';
  notifs.setAttribute('aria-live', 'polite');
  document.body.appendChild(notifs);
  let chime;
  function achieve(id) {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    const got = achieved();
    if (!a || got[id]) return;
    got[id] = Date.now();
    store.set('achievements', got);
    dispatchEvent(new CustomEvent('achievement', { detail: id }));
    if (EMBED) { tell({ t: 'ach', id }); return; }
    if (SHELL) return;
    const n = document.createElement('a');
    n.className = 'notif';
    n.href = '/finder#achievements';
    n.innerHTML = `<span class="notif__badge">${a.i}</span><span><small>Achievement unlocked</small><b>${a.t}</b><span>${a.d}</span></span>`;
    notifs.appendChild(n);
    setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 500); }, 4200);
    if (prefs().sound !== false) {
      try {
        chime = chime || new (window.AudioContext || window.webkitAudioContext)();
        [660, 880, 1320].forEach((f, k) => {
          const t = chime.currentTime + k * 0.09, o = chime.createOscillator(), g = chime.createGain();
          o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
          o.connect(g).connect(chime.destination); o.start(t); o.stop(t + 0.36);
        });
      } catch (e) { /* no audio */ }
    }
  }
  // Any switch to dark mode counts, whichever control did it.
  addEventListener('themechange', () => { if (root.dataset.theme === 'dark') achieve('darkside'); });

  // Page visits, first visit, night owl.
  const PAGES = ['home', 'work', 'stats', 'about', 'play', 'draw', 'type', 'arcade', 'wyr', 'terminal', 'guestbook'];
  const visited = store.get('visited', []);
  if (!visited.includes(page)) { visited.push(page); store.set('visited', visited); }
  setTimeout(() => {
    if (!EMBED) achieve('hello');
    if (PAGES.every((p) => visited.includes(p))) achieve('explorer');
    const h = new Date().getHours();
    if (h < 5) achieve('nightowl');
  }, 1400);

  /* ---------- Easter eggs ---------- */
  // Click the logo five times quickly.
  let logoClicks = [], typedBuf = '';
  document.addEventListener('click', (e) => {
    const logo = e.target.closest('.menubar__logo, [data-logo]');
    if (!logo) return;
    const now = Date.now();
    logoClicks = logoClicks.filter((t) => now - t < 1500).concat(now);
    if (logoClicks.length >= 5) {
      logoClicks = [];
      logo.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(720deg)' }], { duration: 900, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
      achieve('clicker');
    }
  });
  // Typing "creeper" anywhere outside a text field.
  function creeper() {
    const face = document.createElement('div');
    face.className = 'creeper';
    face.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
    document.body.appendChild(face);
    setTimeout(() => {
      document.body.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-10px,6px)' }, { transform: 'translate(9px,-7px)' }, { transform: 'translate(-6px,-4px)' }, { transform: 'translate(0,0)' }], { duration: 420 });
      face.classList.add('boom');
      setTimeout(() => face.remove(), 700);
      toast('Sssss… boom.');
      achieve('creeper');
    }, 1500);
  }
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
    if (e.key.length !== 1) return;
    typedBuf = (typedBuf + e.key.toLowerCase()).slice(-16);
    if (typedBuf.endsWith('creeper')) { typedBuf = ''; creeper(); return; }
    const code = Object.keys(CHEATS).find((c) => typedBuf.endsWith(c));
    if (code) { typedBuf = ''; runCheat(code); }
  });
  /* ---------- Cheat codes ---------- */
  const fx = (cls, html, ms) => {
    const el = document.createElement('div');
    el.className = `fx ${cls}`;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = html;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), ms);
    return el;
  };
  function rain(chars, colors, n = 80) {
    const c = document.createElement('canvas');
    c.className = 'confetti';
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    document.body.appendChild(c);
    const g = c.getContext('2d');
    const drops = Array.from({ length: n }, () => ({ x: Math.random() * innerWidth, y: -Math.random() * innerHeight, v: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.1, s: 18 + Math.random() * 18, ch: chars[(Math.random() * chars.length) | 0], c: colors[(Math.random() * colors.length) | 0] }));
    const t0 = performance.now();
    (function frame(t) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
      for (const d of drops) { d.y += d.v; d.r += d.vr; g.save(); g.translate(d.x, d.y); g.rotate(d.r); g.fillStyle = d.c; g.font = `700 ${d.s}px Inter Tight, sans-serif`; g.fillText(d.ch, 0, 0); g.restore(); }
      if (t - t0 < 3600) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }
  function matrix() {
    const c = document.createElement('canvas');
    c.className = 'fx fx--matrix';
    c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    const g = c.getContext('2d'), cols = Math.floor(innerWidth / 16), ys = Array(cols).fill(0).map(() => Math.random() * -40);
    const t0 = performance.now();
    (function frame(t) {
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#39ff6a'; g.font = '15px JetBrains Mono, monospace';
      ys.forEach((y, i) => { g.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), i * 16, y * 16); ys[i] = y * 16 > c.height && Math.random() > 0.97 ? 0 : y + 1; });
      if (t - t0 < 4000) requestAnimationFrame(frame); else { c.style.opacity = '0'; setTimeout(() => c.remove(), 600); }
    })(t0);
  }
  let trail = null;
  function godMode() {
    document.documentElement.classList.add('god');
    const onMove = (e) => {
      const s = document.createElement('span');
      s.className = 'god-spark'; s.textContent = '✦';
      s.style.left = `${e.clientX}px`; s.style.top = `${e.clientY}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 700);
    };
    if (!trail) addEventListener('pointermove', (trail = onMove), { passive: true });
    setTimeout(() => { document.documentElement.classList.remove('god'); removeEventListener('pointermove', trail); trail = null; }, 12000);
  }
  const CHEATS = {
    hesoyam: () => { rain(['$', '$', '💵'], ['#28c840', '#1f9d35', '#ffd84d']); toast('Health, armour and $250,000.'); },
    wasted: () => { fx('fx--wasted', '<b>WASTED</b>', 3200); },
    iddqd: () => { godMode(); toast('Degreelessness mode on.'); },
    idkfa: () => { rain(['🗝️', '🔫', '★'], ['#ffd84d'], 50); toast('Very happy ammo added.'); },
    motherlode: () => { rain(['§'], ['#28c840', '#7fd6b2'], 70); toast('+§50,000 simoleons.'); },
    doabarrelroll: () => { document.body.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 1300, easing: 'cubic-bezier(0.65,0,0.35,1)' }); },
    batman: () => { fx('fx--bat', '<svg viewBox="0 0 100 50"><path d="M50 12c-3 0-4 5-6 5s-3-6-6-6c-4 0-6 8-12 8-7 0-10-9-18-9 7 5 9 15 16 20 8 5 14 1 18 6 3 3 5 9 8 12 3-3 5-9 8-12 4-5 10-1 18-6 7-5 9-15 16-20-8 0-11 9-18 9-6 0-8-8-12-8-3 0-4 6-6 6s-3-5-6-5z" fill="#111008"/></svg>', 3200); },
    blairwitch: () => { fx('fx--witch', '<svg viewBox="0 0 60 80"><g stroke="#111" stroke-width="3" stroke-linecap="round" fill="none"><path d="M30 5v70M12 20l36 10M10 45l40-6M18 70l24-24M42 70L18 46"/></g></svg>', 2600); },
    matrix,
    gravity: () => {
      [...document.querySelectorAll('h1, .h2, .menubar__item, .dock__item')].slice(0, 30).forEach((el, i) => {
        el.animate([{ transform: 'none' }, { transform: `translateY(${innerHeight}px) rotate(${(i % 2 ? 1 : -1) * (10 + i * 3)}deg)`, offset: 0.45 }, { transform: `translateY(${innerHeight}px) rotate(${(i % 2 ? 1 : -1) * (10 + i * 3)}deg)`, offset: 0.7 }, { transform: 'none' }],
          { duration: 3400, easing: 'cubic-bezier(0.5,0,0.75,0)', delay: i * 40 });
      });
    },
  };
  function runCheat(code) {
    CHEATS[code]();
    const found = store.get('cheats', []);
    if (!found.includes(code)) { found.push(code); store.set('cheats', found); }
    achieve('cheater');
    if (Object.keys(CHEATS).every((c) => found.includes(c))) achieve('codebreaker');
  }
  window.cheat = runCheat;

  // A visitor on a Friday the 13th gets a whisper.
  const today = new Date();
  if (today.getDay() === 5 && today.getDate() === 13) setTimeout(() => toast('Ki ki ki… ma ma ma. Happy Friday the 13th.'), 2500);

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
    <a href="/finder#achievements">Achievements…</a>
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

  const appsmenu = makeMenu('appsmenu', `
    <a href="/finder">Finder <kbd>G F</kbd></a>
    <hr>
    <a href="/arcade">Arcade <kbd>G R</kbd></a>
    <a href="/wyr">Would You Rather <kbd>G V</kbd></a>
    <a href="/play">Stack <kbd>G P</kbd></a>
    <a href="/type">Typing Test <kbd>G K</kbd></a>
    <a href="/draw">Kaleidoscope <kbd>G D</kbd></a>
    <a href="/guestbook">Guestbook <kbd>G B</kbd></a>
    <hr>
    <a href="/terminal">Terminal <kbd>G T</kbd></a>
    <a href="/settings">System Settings…</a>`);
  const appsBtn = $('[data-menu="appsmenu"]');
  if (appsBtn) {
    appsBtn.addEventListener('click', () => {
      const r = appsBtn.getBoundingClientRect();
      if (isOpen(appsmenu)) hideMenu(appsmenu);
      else showMenu(appsmenu, r.left, r.bottom + 4);
      appsBtn.setAttribute('aria-expanded', String(isOpen(appsmenu)));
    });
    appsmenu.addEventListener('toggle', (e) => appsBtn.setAttribute('aria-expanded', String(e.newState === 'open')));
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
    if (e.shiftKey || SHELL || EMBED) return;
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
    achieve('spark');
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
    { g: 'Apps', t: 'Arcade', k: 'snake breakout retro games', run: () => go('/arcade'), i: ICON('linear-gradient(#8f6bff,#4a2fc9)', '🕹') },
    { g: 'Apps', t: 'Would You Rather', k: 'wyr vote games versus ranking', run: () => go('/wyr'), i: ICON('#1c1a12', '<b style="color:#ff8a5c">VS</b>') },
    { g: 'Apps', t: 'Typing Test', k: 'type speed wpm keyboard words code', run: () => go('/type'), i: ICON('linear-gradient(#ffe27a,#f5b800)', '<b style="color:#3a2c00">⌨</b>') },
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
    achieve('spotlight');
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
    <button data-go="/finder">Finder <kbd>G F</kbd></button>
    <button data-go="/guestbook">Guestbook <kbd>G B</kbd></button>
    <button data-go="/stats">Stats <kbd>G S</kbd></button>
    <button data-go="/play">Stack <kbd>G P</kbd></button>
    <button data-go="/draw">Kaleidoscope <kbd>G D</kbd></button>
    <button data-go="/type">Typing Test <kbd>G K</kbd></button>
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
  const GO = { h: '/', w: '/work', s: '/stats', f: '/finder', p: '/play', d: '/draw', k: '/type', b: '/guestbook', r: '/arcade', v: '/wyr', t: '/terminal', a: '/about' };
  let gPending = 0;
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable], dialog')) return;
    if (EMBED || ['play', 'terminal', 'type', 'arcade', 'wyr'].includes(page)) return;
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
    if (!SHELL && !EMBED && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); spot.open ? spot.close() : openSpot(); return; }
    if (!SHELL && !EMBED && !typing && e.key === '/' && page !== 'terminal') { e.preventDefault(); openSpot(); return; }
    kpos = e.key === KONAMI[kpos] || e.key.toLowerCase() === KONAMI[kpos] ? kpos + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; confetti(); toast('You found the secret. ✦'); achieve('konami'); }
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

  /* ---------- Live cursors ---------- */
  // Other visitors on the same page, relayed through a Durable Object.
  if (!EMBED && prefs().live !== false && 'WebSocket' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const layer = document.createElement('div');
    layer.className = 'cursors';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    const here = document.createElement('span');
    here.className = 'here';
    here.hidden = true;
    const right = $('.menubar__right');
    if (right) right.prepend(here);
    const others = new Map();
    let ws, retry = 1500, lastSend = 0, queued = null;
    const setCount = (n) => {
      dispatchEvent(new CustomEvent('presence', { detail: n }));
      here.hidden = !(n > 1);
      here.innerHTML = `<i></i>${n - 1} other${n - 1 === 1 ? '' : 's'} here`;
      here.title = 'Other people looking at this page right now';
    };
    const drop = (id) => { const o = others.get(id); if (o) { o.el.remove(); clearTimeout(o.timer); others.delete(id); } };
    function show(d) {
      let o = others.get(d.id);
      if (!o) {
        const el = document.createElement('div');
        el.className = 'rcursor';
        el.style.setProperty('--c', d.c);
        el.innerHTML = `<svg viewBox="0 0 16 20"><path d="M1 1l13 9.5-5.6 1L11 18l-2.6 1.2L5.9 12.6 1 16z" fill="var(--c)" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg><span>${d.n}</span>`;
        layer.appendChild(el);
        o = { el };
        others.set(d.id, o);
        achieve('company');
      }
      o.el.style.transform = `translate(${(d.x * 100).toFixed(2)}vw, ${d.y}px)`;
      o.el.classList.remove('idle');
      clearTimeout(o.timer);
      o.timer = setTimeout(() => o.el.classList.add('idle'), 8000);
    }
    function send(msg) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); }
    function connect() {
      if (document.hidden) return;
      const room = location.pathname.replace(/\.html$/, '') || '/';
      ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/live?room=${encodeURIComponent(room)}`);
      ws.onopen = () => { retry = 1500; };
      ws.onmessage = (e) => {
        let d; try { d = JSON.parse(e.data); } catch (err) { return; }
        if (d.t === 'hi' || d.t === 'count') setCount(d.count);
        else if (d.t === 'm') show(d);
        else if (d.t === 'bye') { drop(d.id); if (d.count) setCount(d.count); }
      };
      ws.onclose = () => {
        others.forEach((_, id) => drop(id));
        setCount(0);
        ws = null;
        if (!document.hidden) setTimeout(connect, (retry = Math.min(retry * 2, 30000)));
      };
    }
    // At most ten updates a second, and nothing while the tab is hidden.
    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      queued = { t: 'm', x: e.clientX / innerWidth, y: Math.round(e.clientY + scrollY) };
      const now = performance.now();
      if (now - lastSend > 100) { send(queued); queued = null; lastSend = now; }
    }, { passive: true });
    setInterval(() => { if (queued) { send(queued); queued = null; lastSend = performance.now(); } }, 120);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { send({ t: 'bye' }); if (ws) ws.close(); }
      else if (!ws) connect();
    });
    addEventListener('pagehide', () => send({ t: 'bye' }));
    setTimeout(connect, 600);
  }

  window.OS = { ACHIEVEMENTS, achieve, achieved, prefs, setPref, toggleTheme, cycleWallpaper, WALLS, sleep, restart, shutdown, spark, confetti, openSpotlight: openSpot, newSticky };
})();
