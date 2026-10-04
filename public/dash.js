// byhamza.dev: a web port of DashX360's Metro dashboard by ZivvoZ
// (github.com/ZivvoZ/dashx360). Layouts, timings, easing curves and sound
// cues follow DashX360's XAML and C#; the content is Hamza's.
(() => {
  'use strict';

  /* ================= Helpers ================= */
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const html = (s) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(`dx.${k}`); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(`dx.${k}`, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(`dx.${k}`); } catch (e) { /* storage blocked */ } },
  };
  const getJSON = (u) => fetch(u, { signal: AbortSignal.timeout(8000) }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  // WPF easing functions as CSS curves.
  const E = {
    cubicOut: 'cubic-bezier(.215,.61,.355,1)', cubicIn: 'cubic-bezier(.55,.055,.675,.19)',
    sineOut: 'cubic-bezier(.39,.575,.565,1)', sineIn: 'cubic-bezier(.47,0,.745,.715)',
    quartOut: 'cubic-bezier(.165,.84,.44,1)', quartInOut: 'cubic-bezier(.77,0,.175,1)', linear: 'linear',
  };
  // One property animation, like a WPF DoubleAnimation with a BeginTime.
  function anim(el, frames, ms, easing = E.linear, delay = 0) {
    if (!el) return { finished: Promise.resolve() };
    const a = el.animate(frames, { duration: reduced.matches ? Math.min(ms, 1) : ms, easing, delay: reduced.matches ? 0 : delay, fill: 'both' });
    a.finished.then(() => { try { a.commitStyles(); a.cancel(); } catch (e) { /* detached */ } }, () => {});
    return a;
  }
  // DashX360's BeginLayerAnimation: slide in on X (quartic out) while fading (sine out).
  function layerIn(el, fromX, ms, delay, toOpacity = 1) {
    if (!el) return;
    anim(el, [{ opacity: 0 }, { opacity: toOpacity }], ms, E.sineOut, delay);
    if (fromX) anim(el, [{ translate: `${fromX}px 0` }, { translate: '0 0' }], ms, E.quartOut, delay);
  }
  function layerOut(el, toX, ms, fromOpacity = 1) {
    if (!el) return;
    anim(el, [{ opacity: fromOpacity }, { opacity: 0 }], ms, E.sineOut);
    if (toX) anim(el, [{ translate: '0 0' }, { translate: `${toX}px 0` }], ms, E.quartOut);
  }

  /* ================= Content ================= */
  const LINKS = {
    github: 'https://github.com/hamzaaaaaf',
    linkedin: 'https://www.linkedin.com/in/hamza-faisal-125833263/',
    leetcode: 'https://leetcode.com/u/hamza57/',
    mail: 'mailto:hello@byhamza.dev',
    source: 'https://github.com/hamzaaaaaf/portfolio-website',
    dashx360: 'https://github.com/ZivvoZ/dashx360',
  };
  const ME = {
    tag: 'Hamza',
    pic: '/assets/gamerpics/hamza.webp',
    motto: 'Turning curious ideas into real software.',
    name: 'Hamza',
    location: 'Birmingham, UK',
    bio: 'Computer Science student at Aston University. Java for uni, Python for everything else, and this console one tile at a time.',
    zone: 'Recreation',
  };
  const A = '/assets/';
  // Everything in My Games and My Apps. "kind" decides what Launch does.
  const LIBRARY = [
    {
      id: 'doom', type: 'game', title: 'DOOM', sub: 'id Software', cover: `${A}covers/doom.webp`, wide: `${A}covers/doom-wide.webp`,
      launch: { kind: 'web', url: '/doom/', label: 'Launch' },
      second: null,
      meta: ['Shareware episode: Knee-Deep in the Dead', 'Runs in your browser', 'Single player', 'Controller, keyboard and mouse, or touch'],
      rating: ['M', 'Mature 17+. Blood and Gore, Intense Violence'],
      source: 'Shareware v1.9 on Chocolate Doom', genre: 'Shooter',
      developer: 'id Software', publisher: 'id Software',
      local: 'Single player\nController, keyboard and mouse, or touch', online: 'None',
      note: 'The 1993 shareware episode, running on Cloudflare’s WebAssembly build of Chocolate Doom. Left stick moves, right stick turns, RT fires, A uses, LB and RB change weapon.',
      extras: [['Chocolate Doom for WebAssembly', 'https://github.com/cloudflare/doom-wasm', 'GPL-2.0'], ['How to play', '#details', 'Controls']],
      gallery: [`${A}covers/doom-wide.webp`, `${A}covers/doom-help.webp`, `${A}covers/doom-credit.webp`],
    },
    {
      id: 'panic-pack', type: 'game', title: 'Panic Pack!', sub: 'Godot 4 · Windows', cover: `${A}covers/panic-pack.webp`, wide: `${A}tiles/panic-pack.webp`,
      launch: { kind: 'link', url: 'https://github.com/hamzaaaaaf/panic-pack-/releases/tag/v0.1.0', label: 'Download' },
      second: { label: 'View Source', url: 'https://github.com/hamzaaaaaf/panic-pack-' },
      meta: ['First-person, beat the clock', 'Godot 4 · GDScript', 'Single player', 'Windows'],
      rating: ['RP', 'Rating Pending'],
      source: 'GitHub release v0.1.0', genre: 'Action, Puzzle',
      developer: 'Hamza', publisher: 'Hamza',
      local: 'Single player\nKeyboard and mouse', online: 'None',
      note: 'Your taxi is coming. Search the house, grab everything on a randomised packing list, then sprint for the front door before the flight countdown runs out. WASD to move, E to pick up, hold Tab for the list.',
      extras: [['Download v0.1.0', 'https://github.com/hamzaaaaaf/panic-pack-/releases/tag/v0.1.0', 'Windows'], ['Source code', 'https://github.com/hamzaaaaaf/panic-pack-', 'GitHub']],
      gallery: [`${A}tiles/panic-pack.webp`, `${A}covers/panic-pack.webp`],
    },
    {
      id: 'instagram-unliker', type: 'app', title: 'Instagram Unliker', sub: 'JavaScript', cover: `${A}covers/instagram-unliker.webp`, wide: `${A}tiles/instagram-unliker.webp`, icon: `${A}apps/instagram-unliker.webp`,
      launch: { kind: 'link', url: 'https://github.com/hamzaaaaaf/instagram-post-unliker', label: 'View Source' },
      second: null,
      meta: ['Browser console script', 'JavaScript', 'No password, cookie or API key', 'Works on Instagram’s Likes page'],
      rating: ['E', 'Everyone'],
      source: 'GitHub', genre: 'Utility',
      developer: 'Hamza', publisher: 'Hamza',
      local: 'Runs in your own browser', online: 'Instagram',
      note: 'Instagram makes you unlike old posts one at a time. Paste this into the console on Your Activity › Likes and it selects every loaded post, unlikes them, confirms, waits for Instagram to catch up and keeps going.',
      extras: [['Source code', 'https://github.com/hamzaaaaaf/instagram-post-unliker', 'GitHub']],
      gallery: [`${A}tiles/instagram-unliker.webp`, `${A}covers/instagram-unliker.webp`],
    },
    {
      id: 'byhamza', type: 'app', title: 'byhamza.dev', sub: 'This site', cover: ME.pic, wide: ME.pic, icon: ME.pic,
      launch: { kind: 'link', url: LINKS.source, label: 'View Source' },
      second: { label: 'DashX360', url: LINKS.dashx360 },
      meta: ['A web port of DashX360', 'HTML, CSS and JavaScript', 'No framework, no build step', 'Cloudflare Workers'],
      rating: ['E', 'Everyone'],
      source: 'GitHub', genre: 'Website',
      developer: 'Hamza', publisher: 'Hamza',
      local: 'Controller, keyboard, mouse or touch', online: 'Live LeetCode and GitHub stats',
      note: 'The site you’re on: DashX360’s Xbox 360 Metro dashboard ported to the web, with the same layouts, animations, sounds and Guide, served from Cloudflare’s edge.',
      extras: [['Source code', LINKS.source, 'GitHub'], ['DashX360 by ZivvoZ', LINKS.dashx360, 'Original']],
      gallery: [ME.pic],
    },
  ];
  const byId = (id) => LIBRARY.find((g) => g.id === id);
  const GAMES = () => LIBRARY.filter((g) => g.type === 'game').sort((a, b) => a.title.localeCompare(b.title));

  const THEMES = [
    { id: 'default', name: 'Default' },
    { id: 'batman_arkham_asylum', name: 'Batman Arkham Asylum' },
    { id: 'halo_4', name: 'Halo 4' },
    { id: 'resident_evil_6', name: 'Resident Evil 6' },
    { id: 'stockholm_underground', name: 'Stockholm Underground' },
  ];
  const COLOURS = [['Green', '#028d02'], ['Blue', '#1b6fd1'], ['Orange', '#e5650c'], ['Red', '#c8211f'], ['Pink', '#d63c8f'], ['Purple', '#7b3fbf'], ['Teal', '#09918a'], ['Grey', '#5f6a70']];

  const ACHIEVEMENTS = [
    ['hello', 'Signed in', 'Turn on the console.', 10],
    ['guide', 'Guide me', 'Open the Xbox Guide.', 20],
    ['profile', 'Gamercard', 'View Hamza’s profile.', 10],
    ['library', 'Collector', 'Open My Games.', 10],
    ['apps', 'App happy', 'Open My Apps.', 10],
    ['reader', 'Case study', 'Open the details of every game and app Hamza made.', 80],
    ['doom', 'Rip and tear', 'Launch DOOM.', 50],
    ['doom10', 'Knee-deep', 'Play DOOM for five minutes.', 100],
    ['ragequit', 'Any unsaved progress will be lost', 'Quit a game from the Guide.', 30],
    ['tray', 'Disc swap', 'Pin a game to the tray.', 15],
    ['pinned', 'Pinned', 'Pin a game to My Pins.', 15],
    ['search', 'Decision engine', 'Search with Bing.', 20],
    ['themes', 'Interior designer', 'Change the dashboard theme.', 30],
    ['tidy', 'Plug and play', 'Navigate with a controller.', 75],
    ['crossplay', 'Cross-platform', 'Use a PlayStation or Nintendo controller.', 75],
    ['music', 'DJ', 'Play your own music in the Music Player.', 40],
    ['source', 'Open source', 'Look at the source code on GitHub.', 10],
    ['networker', 'Networker', 'Open Hamza’s LinkedIn.', 10],
    ['messenger', 'Messenger', 'Send Hamza an email.', 30],
    ['leetcode', 'Grinding', 'Open Hamza’s LeetCode.', 10],
    ['explorer', 'Explorer', 'Visit every tab on the dashboard.', 100],
    ['nightowl', 'Night owl', 'Turn on the console between midnight and 5am.', 50],
    ['longhaul', 'Dedicated', 'Keep the console on for ten minutes.', 60],
    ['regular', 'Regular', 'Turn on the console on three different days.', 80],
    ['lightsout', 'Lights out', 'Turn off the console.', 30],
    ['persistent', 'Persistent', 'Press B on the dashboard three times.', 30],
  ].map(([id, t, d, g]) => ({ id, t, d, g }));

  /* ================= Settings ================= */
  const DEFAULTS = { sounds: true, pad: true, startup: 'video', loading: true, volume: 1, theme: 'default', colour: '#028d02', tray: 'doom' };
  const S = Object.assign({}, DEFAULTS, store.get('settings', {}));
  const saveSettings = () => store.set('settings', S);

  /* ================= Scale ================= */
  function fit() { root.style.setProperty('--s', Math.min(innerWidth / 1280, innerHeight / 720)); }
  addEventListener('resize', fit);
  fit();

  /* ================= Sound (DashX360's AudioService map) ================= */
  const Sound = (() => {
    const FILES = {
      startup: 'startup.wav', 'notify-popup': 'notify.wav',
      'page-left': 'page-right.mp3', 'page-right': 'page-left.mp3', tab: 'page-right.mp3',
      select: 'select.mp3', 'settings-box': 'select-alt.mp3', 'menu-in': 'menu-in.wav', 'menu-out': 'menu-out.wav',
      back: 'back.mp3', focus: 'focus.wav', hover: 'focus.wav',
      'guide-open': 'guide-open.wav', 'guide-close': 'guide-close.wav', 'guide-blade-open': 'guide-blade-open.wav',
      'guide-blade-switch-1': 'guide-blade-switch-1.wav', 'guide-blade-switch-2': 'guide-blade-switch-2.wav',
      'guide-blade-switch-3': 'guide-blade-switch-3.wav', 'guide-blade-switch-4': 'guide-blade-switch-4.wav',
      'guide-hover': 'guide-hover.wav', 'guide-select': 'guide-select.wav', 'guide-back': 'guide-back.wav',
    };
    const THROTTLE = { select: 80, 'menu-in': 120, 'menu-out': 120, 'guide-open': 60, 'guide-close': 60, 'guide-blade-open': 60, 'guide-select': 60, 'guide-back': 60, 'page-left': 150, 'page-right': 150, tab: 150 };
    const buffers = {}, last = {}, playing = {};
    let ctx = null, out = null, loaded = Promise.resolve();
    function unlock() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        out = ctx.createGain(); out.gain.value = S.volume; out.connect(ctx.destination);
      } catch (e) { ctx = null; return; }
      loaded = Promise.all([...new Set(Object.values(FILES))].map((f) => fetch(`${A}sounds/${f}`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((buf) => { buffers[f] = buf; }).catch(() => {})));
    }
    function play(name) {
      if (!ctx || !S.sounds) return;
      if (/^tab-switch-/.test(name)) name = 'tab';
      const f = FILES[name], buf = f && buffers[f];
      if (!buf) return;
      const now = performance.now();
      if (THROTTLE[name] && now - (last[name] || -1e9) < THROTTLE[name]) return;
      last[name] = now;
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(out); src.start();
      (playing[name] = playing[name] || new Set()).add(src);
      src.onended = () => playing[name].delete(src);
    }
    function stop(name) { (playing[name] || []).forEach((s) => { try { s.stop(); } catch (e) { /* stopped */ } }); }
    function volume(v) { if (out) out.gain.value = v; }
    const ready = (name) => !!buffers[FILES[name]];
    return { unlock, play, stop, volume, ready, get loaded() { return loaded; }, get ctx() { return ctx; }, get out() { return out; } };
  })();
  const sfx = (n) => Sound.play(n);

  /* ================= Achievements ================= */
  const got = () => store.get('achievements', {});
  const gamerscore = () => { const g = got(); return ACHIEVEMENTS.reduce((s, a) => s + (g[a.id] ? a.g : 0), 0); };
  function achieve(id) {
    const a = ACHIEVEMENTS.find((x) => x.id === id), g = got();
    if (!a || g[id]) return;
    g[id] = Date.now();
    store.set('achievements', g);
    refreshScore();
    toast('Achievement unlocked', `${a.g}G - ${a.t}`);
  }

  /* ================= Icons (Segoe MDL2 stand-ins) ================= */
  const P = {
    games: 'M7 6h10a5 5 0 0 1 4.8 6.4l-1.3 4.4a2.6 2.6 0 0 1-4.5.9L14.4 16H9.6L8 17.7a2.6 2.6 0 0 1-4.5-.9l-1.3-4.4A5 5 0 0 1 7 6Zm0 3v1.5H5.5V12H7v1.5h1.5V12H10v-1.5H8.5V9Zm9 .5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
    apps: 'M3 3h8v8H3Zm10 0h8v8h-8ZM3 13h8v8H3Zm10 0h8v8h-8Z',
    bag: 'M6 7V6a6 6 0 0 1 12 0v1h3l-1 15H4L3 7Zm2 0h8V6a4 4 0 0 0-8 0Z',
    gear: 'M10.3 2h3.4l.5 2.6 1.8.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.8 2.6.5v3.4l-2.6.5-.8 1.8 1.5 2.2-2.4 2.4-2.2-1.5-1.8.8-.5 2.6h-3.4l-.5-2.6-1.8-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.8L2 13.7v-3.4l2.6-.5.8-1.8-1.5-2.2 2.4-2.4 2.2 1.5 1.8-.8ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
    person: 'M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 12c5 0 9 2.5 9 6v2H3v-2c0-3.5 4-6 9-6Z',
    sliders: 'M3 5h10v2H3Zm14 0h4v2h-4Zm-2-2h2v6h-2ZM3 11h4v2H3Zm8 0h10v2H11ZM9 9h2v6H9Zm-6 8h12v2H3Zm16 0h2v2h-2Zm-2-2h2v6h-2Z',
    power: 'M11 2h2v10h-2Zm-4.4 3.4 1.4 1.4a6 6 0 1 0 8 0l1.4-1.4A8 8 0 1 1 6.6 5.4Z',
    minimize: 'M4 11h16v2H4Z',
    chat: 'M3 3h18v13H8l-5 5Zm2 2v11l2-2h12V5Z',
    eject: 'M12 4 21 15H3Zm-9 13h18v3H3Z',
    people: 'M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM9 13c4.4 0 7 2 7 5v3H2v-3c0-3 2.6-5 7-5Zm8.5.5c3 .3 5.5 1.8 5.5 4.5v3h-5v-3c0-1.7-.2-3.2-.5-4.5Z',
    mail: 'M2 5h20v14H2Zm2 2v.5l8 5.5 8-5.5V7Zm0 2.9V17h16V9.9l-8 5.5Z',
    contact: 'M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.4 0 8 2 8 5v3H4v-3c0-3 3.6-5 8-5Z',
    prev: 'M4 5h2v14H4Zm3 7 13-7v14Z',
    next: 'M18 5h2v14h-2ZM4 5l13 7-13 7Z',
    play: 'M6 4l14 8-14 8Z',
    pause: 'M6 4h4v16H6Zm8 0h4v16h-4Z',
    stop: 'M5 5h14v14H5Z',
    shuffle: 'M2 6h4.5l9 11H19v-2l3 3-3 3v-2h-4.4l-9-11H2Zm13.5 0H19V4l3 3-3 3V8h-2.6l-2.6 3.2-1.3-1.6Zm-9 12H2v-2h3.6l2.6-3.2 1.3 1.6Z',
    volume: 'M3 9h4l5-4v14l-5-4H3Zm12.5-1.5a6 6 0 0 1 0 9l-1.4-1.4a4 4 0 0 0 0-6.2Zm2.8-2.8a10 10 0 0 1 0 14.6l-1.4-1.4a8 8 0 0 0 0-11.8Z',
    trophy: 'M8,2 L22,2 L20,17 C19,22 16,25 15,25 C14,25 11,22 10,17 M3,5 L8,5 L8,9 L5,9 C4,9 4,10 4,11 C4,14 6,16 9,16 L10,20 C4,19 0,15 0,10 C0,7 1,5 3,5 M22,5 L27,5 C29,5 30,7 30,10 C30,15 26,19 20,20 L21,16 C24,16 26,14 26,11 C26,10 26,9 25,9 L22,9 M12,25 L18,25 L18,29 L23,29 L23,32 L7,32 L7,29 L12,29',
    lock: 'M8,14 L8,10 C8,4 12,0 18,0 C24,0 28,4 28,10 L28,14 L24,14 L24,10 C24,6 22,4 18,4 C14,4 12,6 12,10 L12,14 M4,14 L32,14 L32,32 L4,32',
    github: 'M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z',
    leetcode: 'M13.5 2 5.7 10.3a3.4 3.4 0 0 0 0 4.7l4.3 4.6a3.4 3.4 0 0 0 4.8.2l2.4-2.3-1.4-1.5-2.4 2.3a1.4 1.4 0 0 1-2-.1L7.2 13.6a1.4 1.4 0 0 1 0-1.9l7.8-8.3ZM10 12.5h10v2H10Z',
    linkedin: 'M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM2.3 8.5h3.4V21H2.3Zm6 0h3.3v1.7c.5-.9 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8V21h-3.4v-6.2c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V21H8.3Z',
    search: 'M17,17 A14,14 0 1 1 36,36M34,34 L47,47',
  };
  const svg = (name, vb = '0 0 24 24', cls = '') => `<svg viewBox="${vb}"${cls ? ` class="${cls}"` : ''} aria-hidden="true"><path d="${P[name]}"/></svg>`;
  const G = (letter) => `<i class="g g--${letter.toLowerCase()}">${letter}</i>`;

  /* ================= Dashboard markup ================= */
  const TABS = [
    { k: 'bing', x: 180, w: 58 }, { k: 'home', x: 274, w: 78 }, { k: 'social', x: 388, w: 86 }, { k: 'video', x: 512, w: 82 },
    { k: 'games', x: 634, w: 94 }, { k: 'music', x: 776, w: 88 }, { k: 'apps', x: 896, w: 68 }, { k: 'settings', x: 994, w: 128 },
  ];
  // MainWindow's adjacent preview crops (DashboardViewModel.GetLeftPreviewCrop / GetRightPreviewCrop).
  const leftCrop = (k) => ({ settings: 954, video: 938, music: 938, apps: 938, games: 913 }[k] || 910);
  function rightCrop(cur, k) {
    if (cur === 'video' && k === 'games') return 198;
    if (cur === 'social' && k === 'video') return 198;
    if (cur === 'games' && k === 'music') return 206;
    if (cur === 'music' && k === 'apps') return 206;
    return { bing: 198, home: 224, social: 224, settings: 224, games: 258, video: 236, music: 236, apps: 236 }[k] || 224;
  }

  const px = (o) => Object.entries(o).map(([k, v]) => `${k}:${typeof v === 'number' ? `${v}px` : v}`).join(';');
  const tile = (id, x, y, w, h, inner, { label = '', bg = '', cls = '' } = {}) =>
    `<button class="t${cls ? ` ${cls}` : ''}" data-t="${id}" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" style="${px({ left: x, top: y, width: w, height: h })}" aria-label="${esc(label)}"><span class="f"${bg ? ` style="background:${bg}"` : ''}>${inner}</span></button>`;
  const img = (src, box, cls = 'ico') => `<img class="${cls}" src="${src}" alt=""${box ? ` style="${px(box)}"` : ''} draggable="false">`;
  const fill = (src) => `<img class="fill" src="${src}" alt="" draggable="false">`;
  const tx = (text, box, extra = '') => `<span class="tx${extra}" style="${px(box)}">${esc(text)}</span>`;
  const shade = (stops) => `<span class="sh" style="background:linear-gradient(${stops})"></span>`;
  const bar = (h, c) => `<span class="bar" style="height:${h}px;background:${c}"></span>`;
  const grad = (stops) => `linear-gradient(to bottom right,${stops})`;
  // Green system tile: an icon placed like WPF's Center/Top alignment with a margin, and a label.
  function icoBox(w, h, iw, ih, { top, mt = 0 }) {
    return { left: (w - iw) / 2, top: top !== undefined ? top : mt + (h - mt - ih) / 2, width: iw, height: ih };
  }

  function pageBing() {
    return `<div class="page" data-tab="bing">
      ${tx('Search Xbox for games, movies, music and apps', { left: 378, top: 104, 'font-size': 19, 'font-weight': 300, color: 'rgba(255,255,255,.75)' })}
      ${tx('bing', { left: 198, top: 148, 'font-size': 44, 'font-weight': 300, color: 'rgba(255,255,255,.95)' })}
      <div class="bing__box t-like" data-nav data-x="377" data-y="134" data-w="585" data-h="92" tabindex="-1">
        <input type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" aria-label="Search with Bing">
        <svg viewBox="0 0 50 50"><path d="${P.search}"/></svg>
      </div>
    </div>`;
  }

  function pageHome() {
    const fx = 224, fy = 31, tray = byId(S.tray) || byId('doom');
    return `<div class="page" data-tab="home">
      ${tile('home.open-tray', fx, fy, 185, 131, `${fill(tray.wide)}${img(`${A}icons/disc-tray.webp`, { left: 55.5, top: 17, width: 74, height: 74 })}${tx('Open Tray', { left: 13, right: 8, bottom: 10, 'font-size': 18 })}`, { label: `Open Tray: ${tray.title}` })}
      ${tile('home.pins', fx, fy + 133, 185, 131, `${img(`${A}icons/pin.webp`, icoBox(185, 131, 38, 38, { mt: -20 }))}${tx('My Pins', { left: 12, bottom: 12, 'font-size': 17 })}`, { label: 'My Pins' })}
      ${tile('home.recent', fx, fy + 266, 185, 131, `<svg class="ico" viewBox="0 0 36 36" style="${px(icoBox(185, 131, 36, 36, { mt: -20 }))};position:absolute;fill:none;stroke:rgba(255,255,255,.91);stroke-width:4;stroke-linecap:round"><circle cx="18" cy="18" r="16"/><path d="M18,8 L18,20 L27,20"/></svg>${tx('Recent', { left: 12, bottom: 12, 'font-size': 17 })}`, { label: 'Recent' })}
      ${tile('home.hero', fx + 187, fy, 466, 263, `<span class="hero"><img src="${ME.pic}" alt=""><span><b>${esc(ME.tag)}</b><span>${esc(ME.motto)}</span></span></span>${shade('rgba(0,0,0,.14) 0%,rgba(0,0,0,0) 48%,rgba(0,0,0,.66) 100%')}${bar(30, 'rgba(0,0,0,.79)')}${tx('Hamza · Computer Science at Aston University', { left: 8, right: 8, bottom: 6, 'font-size': 17 })}`, { label: 'Hamza’s profile', bg: grad('#bfd5d8 0%,#3b5e65 34%,#111a1d 78%,#9eaeb0 100%') })}
      ${tile('home.panic', fx + 187, fy + 265, 231, 133, `${fill(`${A}tiles/panic-pack.webp`)}${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,.16) 55%,rgba(0,0,0,.69) 100%')}${bar(30, 'rgba(0,0,0,.79)')}${tx('Panic Pack!', { left: 8, right: 8, bottom: 6, 'font-size': 17 })}`, { label: 'Panic Pack!', bg: grad('#2d100d 0%,#e27522 50%,#321a16 100%') })}
      ${tile('home.unliker', fx + 420, fy + 265, 233, 133, `${fill(`${A}tiles/instagram-unliker.webp`)}${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,.19) 62%,rgba(0,0,0,.69) 100%')}${bar(30, 'rgba(0,0,0,.79)')}${tx('Instagram Unliker', { left: 8, right: 8, bottom: 6, 'font-size': 17 })}`, { label: 'Instagram Unliker', bg: 'linear-gradient(to right,#cfcfcf,#50606f)' })}
      ${tile('home.leetcode', fx + 655, fy, 179, 131, `<span class="big-n" style="top:16px;font-size:50px" data-live="lc">&middot;</span><span class="big-n" style="top:70px;font-size:15px;opacity:.85">solved</span>${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,.14) 58%,rgba(0,0,0,.69) 100%')}${bar(30, 'rgba(0,0,0,.79)')}${tx('LeetCode', { left: 8, right: 8, bottom: 6, 'font-size': 16 })}`, { label: 'LeetCode', bg: grad('#171a5c 0%,#9333c4 50%,#10103a 100%') })}
      ${tile('home.github', fx + 655, fy + 133, 179, 131, `<span class="abs" style="left:0;right:0;top:0;height:98px;background:#1b1f23"></span><span class="logo" style="top:40px;width:44px;height:44px;fill:#fff">${svg('github')}</span><span class="big-n" style="top:68px;font-size:13px;opacity:.8" data-live="gh">hamzaaaaaf</span>${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,.06) 58%,rgba(0,0,0,.69) 100%')}<span class="bar" style="height:33px;background:#2b3137"></span>${tx('GitHub', { left: 8, bottom: 6, 'font-size': 16 })}`, { label: 'GitHub', bg: '#1b1f23' })}
      ${tile('home.linkedin', fx + 655, fy + 266, 179, 131, `<span class="logo" style="display:flex;align-items:center;gap:3px;font-size:30px;font-weight:700;color:#0a66c2;letter-spacing:-.5px">Linked<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:5px;background:#0a66c2;color:#fff;font-size:26px">in</span></span>${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,0) 58%,rgba(0,0,0,.47) 100%')}`, { label: 'LinkedIn', bg: '#fff' })}
    </div>`;
  }

  function pageSocial() {
    const fx = 224, fy = 31, ico = (src) => img(src, icoBox(177, 122, 58, 58, { mt: -15 })), lab = (t) => tx(t, { left: 6, bottom: 8, 'font-size': 13 });
    return `<div class="page" data-tab="social">
      ${img(`${A}tiles/join-the-fun.webp`, { left: fx + 535, top: fy + 78, width: 230, height: 168, opacity: 0.82, 'object-fit': 'contain' }, 'abs')}
      ${img(`${A}tiles/avatars.webp`, { left: fx + 219, top: fy + 87, width: 300, height: 256, opacity: 0.96, 'object-fit': 'contain' }, 'abs')}
      ${tile('social.friends', fx, fy, 177, 122, ico(`${A}icons/friends.webp`) + lab('Friends'), { label: 'Friends' })}
      ${tile('social.themes', fx, fy + 123, 177, 122, ico(`${A}icons/settings-preferences.webp`) + lab('Themes'), { label: 'Themes' })}
      ${tile('social.signin', fx, fy + 246, 177, 122, ico(`${A}icons/sign-in-or-out.webp`) + lab('Sign in or Out'), { label: 'Sign in or Out' })}
    </div>`;
  }

  function pageVideo() {
    return `<div class="page" data-tab="video">
      ${tile('video.apps', 236, 76, 146, 148, `${img(`${A}icons/my-video-apps.webp`, { left: 1, top: 4, width: 144, height: 102 })}${tx('My Video Apps', { left: 12, right: 0, bottom: 12, 'font-size': 22 }, ' wrap')}`, { label: 'My Video Apps' })}
      ${tile('video.marketplace', 236, 226, 146, 148, `${img(`${A}icons/video-marketplace.webp`, icoBox(146, 148, 58, 58, { top: 26 }))}${tx('Video Marketplace', { left: 12, right: 0, bottom: 12, 'font-size': 22 }, ' wrap')}`, { label: 'Video Marketplace' })}
      ${tile('video.feature', 384, 73, 308, 301, `${fill(`${A}tiles/darkknight.webp`)}${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,.09) 54%,rgba(0,0,0,.66) 100%')}${bar(46, 'rgba(0,0,0,.51)')}${tx('The Dark Knight', { left: 12, bottom: 12, 'font-size': 19 })}`, { label: 'The Dark Knight', bg: grad('#f2f0e8 0%,#b59f80 50%,#201712 100%') })}
      ${tile('video.cloudy', 694, 73, 148, 150, `${fill(`${A}tiles/cloudy.webp`)}<span class="sh" style="background:rgba(0,0,0,.33)"></span>${tx('Cloudy with a Chance of Meatballs', { left: 10, right: 8, bottom: 12, 'font-size': 16 }, ' wrap')}`, { label: 'Cloudy with a Chance of Meatballs', bg: '#33434a' })}
      ${tile('video.recent', 844, 73, 198, 150, `<svg class="abs" viewBox="0 0 198 150" style="inset:0;width:198px;height:150px"><path d="M0,115 C70,28 132,82 198,4 L198,150 L0,150" fill="#59b631"/></svg>${tx('Recent', { left: 20, top: 48, 'font-size': 30, color: '#2b2b2b' })}`, { label: 'Recent videos', bg: '#fff' })}
      ${tile('video.kungfu', 694, 225, 148, 149, `${fill(`${A}tiles/kungfupanda2.webp`)}<span class="sh" style="background:rgba(0,0,0,.27)"></span><span class="logo" style="font-size:28px;font-weight:700;color:rgba(255,255,255,.67)">HD</span>${tx('Kung Fu Panda 2', { left: 10, right: 0, bottom: 12, 'font-size': 21 }, ' wrap')}`, { label: 'Kung Fu Panda 2', bg: '#e9c330' })}
      ${tile('video.hbogo', 844, 225, 198, 149, `${fill(`${A}tiles/hbogo-video.webp`)}`, { label: 'HBO GO' })}
      <span class="advert" style="left:844px;top:374px;margin-top:4px">ADVERTISEMENT</span>
    </div>`;
  }

  function pageGames() {
    return `<div class="page" data-tab="games">
      ${tile('games.mygames', 258, 74, 155, 153, `${img(`${A}icons/mygames.webp`, icoBox(155, 153, 72, 72, { mt: -18 }))}${tx('My Games', { left: 15, bottom: 12, 'font-size': 22 })}`, { label: 'My Games' })}
      ${tile('games.marketplace', 258, 229, 155, 149, `${img(`${A}icons/game-marketplace.webp`, icoBox(155, 149, 58, 58, { top: 24 }))}${tx('Game Marketplace', { left: 15, right: 0, bottom: 12, 'font-size': 22 }, ' wrap')}`, { label: 'Game Marketplace' })}
      ${tile('games.forza', 415, 74, 400, 303, `${fill(`${A}tiles/forza.webp`)}<span class="sh" style="background:rgba(0,0,0,.27)"></span>${bar(78, 'rgba(0,0,0,.56)')}${tx('Forza Horizon', { left: 10, bottom: 42, 'font-size': 24 })}${tx('December IGN Pack', { left: 10, bottom: 12, 'font-size': 24, color: 'rgba(255,255,255,.87)' })}`, { label: 'Forza Horizon', bg: grad('#e9f0ea 0%,#7e968c 32%,#17201c 100%') })}
      ${tile('games.minecraft', 817, 74, 200, 151, `${fill(`${A}tiles/minecraft.webp`)}<span class="sh" style="background:rgba(0,0,0,.2)"></span>${tx('Minecraft', { left: 10, bottom: 14, 'font-size': 20 })}`, { label: 'Minecraft', bg: grad('#0f2719 0%,#6a8d36 60%,#131814 100%') })}
      ${tile('games.blackops', 817, 227, 200, 150, `${fill(`${A}tiles/blackops2.webp`)}<span class="sh" style="background:rgba(0,0,0,.2)"></span>${tx('Black Ops II', { left: 10, bottom: 14, 'font-size': 20 })}`, { label: 'Black Ops II', bg: grad('#1b1b1f 0%,#376b7b 52%,#111 100%') })}
      <span class="advert" style="left:820px;top:387px">ADVERTISEMENT</span>
    </div>`;
  }

  function pageMusic() {
    return `<div class="page" data-tab="music">
      ${tile('music.player', 236, 76, 148, 148, `${img(`${A}icons/music.webp`, icoBox(148, 148, 58, 58, { mt: -12 }))}${tx('Music Player', { left: 12, bottom: 12, 'font-size': 22 })}`, { label: 'Music Player' })}
      ${tile('music.marketplace', 236, 226, 148, 148, `${img(`${A}icons/music-marketplace.webp`, icoBox(148, 148, 58, 58, { top: 26 }))}${tx('Music Marketplace', { left: 12, right: 0, bottom: 12, 'font-size': 22 }, ' wrap')}`, { label: 'Music Marketplace' })}
      ${tile('music.feature', 386, 76, 306, 298, `${fill(`${A}tiles/overexposed.webp`)}<span class="sh" style="background:rgba(0,0,0,.2)"></span>${bar(56, 'rgba(0,0,0,.63)')}${tx('Overexposed', { left: 12, bottom: 24, 'font-size': 23 })}${tx('Maroon 5 - Overexposed', { left: 12, bottom: 8, 'font-size': 16, color: 'rgba(255,255,255,.87)' })}`, { label: 'Overexposed', bg: grad('#232323 0%,#6e2b82 48%,#0d0d0d 100%') })}
      ${tile('music.recent', 694, 76, 158, 148, `${fill(`${A}tiles/evanescence.webp`)}<span class="sh" style="background:rgba(0,0,0,.2)"></span>${tx('Recent Music', { left: 10, bottom: 12, 'font-size': 22 })}`, { label: 'Recent Music', bg: '#2f6f9f' })}
      ${tile('music.search', 854, 76, 188, 148, `${tx('search', { left: 10, bottom: 12, 'font-size': 23 })}`, { label: 'Search', bg: '#191919' })}
      ${tile('music.panchiko', 694, 226, 348, 148, `${fill(`${A}tiles/panchiko.webp`)}<span class="sh" style="background:rgba(255,255,255,.33)"></span>${tx('Panchiko', { left: 14, bottom: 12, 'font-size': 24, color: '#303030' })}`, { label: 'Panchiko', bg: '#e8e8e8' })}
    </div>`;
  }

  function pageApps() {
    const fx = 236, fy = 76;
    return `<div class="page" data-tab="apps">
      ${tile('apps.myapps', fx, fy, 148, 148, `${img(`${A}icons/myapps.webp`, icoBox(148, 148, 72, 72, { mt: -18 }))}${tx('My Apps', { left: 12, bottom: 12, 'font-size': 22 })}`, { label: 'My Apps' })}
      ${tile('apps.browse', fx, fy + 150, 148, 148, `${img(`${A}icons/apps-marketplace.webp`, icoBox(148, 148, 58, 58, { top: 26 }))}${tx('Browse Apps', { left: 12, right: 0, bottom: 12, 'font-size': 22 }, ' wrap')}`, { label: 'Browse Apps' })}
      ${tile('apps.hbogo', fx + 150, fy, 306, 298, `${fill(`${A}tiles/hbogo-apps.webp`)}<span class="sh" style="background:rgba(0,0,0,.2)"></span><span class="tx" style="left:0;right:0;bottom:24px;text-align:center;font-size:16px;color:rgba(255,255,255,.8)">Watch with Xbox LIVE Gold</span>`, { label: 'HBO GO', bg: '#000' })}
      ${tile('apps.netflix', fx + 458, fy, 158, 148, `${fill(`${A}tiles/netflix.webp`)}<span class="tx" style="left:0;right:0;bottom:12px;text-align:center;font-size:10px;color:rgba(255,255,255,.8)">instant queue</span>`, { label: 'Netflix', bg: '#e3262e' })}
      ${tile('apps.youtube', fx + 618, fy, 188, 148, fill(`${A}tiles/youtube-apps.webp`), { label: 'YouTube', bg: '#111' })}
      ${tile('apps.hulu', fx + 458, fy + 150, 158, 148, `<span class="logo" style="margin-top:-12px;font-size:30px;font-weight:700;color:#58b22e;white-space:nowrap">hulu</span><span class="logo" style="margin-top:32px;font-size:21px;color:#2e2e2e">Plus</span>`, { label: 'Hulu Plus', bg: '#f4f4f4' })}
      ${tile('apps.espn', fx + 618, fy + 150, 188, 148, `<span class="logo" style="font-size:39px;font-style:italic;font-weight:700;color:#e03535">ESPN</span><span class="tx" style="left:0;right:0;bottom:12px;text-align:center;font-size:11px;font-weight:700;color:#9b1515">LIVE SPORTS</span>`, { label: 'ESPN', bg: '#fff' })}
    </div>`;
  }

  function pageSettings() {
    const fx = 224, fy = 31, cw = 97.8875, ch = 93.425;
    const cells = [
      ['system', 'System', 'system', 39], ['preferences', 'Preferences', 'preferences', 39, 9], ['profile', 'Profile', 'account', 39], ['kinect', 'Kinect', 'kinect', 41],
      ['account', 'Account', 'account', 39, 10, true], ['privacy', 'Privacy', 'privacy', 39, 10, true], ['family', 'Family', 'family', 39], ['turnoff', 'Turn Off', 'turnoff', 40],
    ];
    const tiles = cells.map(([id, label, icon, s, fs = 10, dim], i) => {
      const x = (i % 4) * cw, y = Math.floor(i / 4) * ch;
      return `<button class="t${dim ? ' dim' : ''}" data-t="settings.${id}" data-sx="${x}" data-sy="${y}" style="${px({ left: x, top: y, width: cw, height: ch })}" aria-label="${label}"><span class="f">${img(`${A}icons/settings-${icon}.webp`, { left: (cw - s) / 2, top: (ch + 9 - s) / 2 - 9, width: s, height: s })}${tx(label, { left: fs === 9 ? 4 : 5, bottom: 5, 'font-size': fs })}</span></button>`;
    }).join('');
    return `<div class="page" data-tab="settings">
      <div class="sgrid" style="left:${fx}px;top:${fy}px">${tiles}</div>
      <p class="tx wrap" style="left:${fx}px;top:${fy + 398}px;width:650px;margin:0;font-size:12px;color:rgba(255,255,255,.53)">Unofficial non-commercial fan project. Xbox and related names, logos, and imagery are property of Microsoft. Not affiliated with or endorsed by Microsoft. Dashboard design and assets from DashX360 by ZivvoZ.</p>
    </div>`;
  }

  const PAGES = { bing: pageBing, home: pageHome, social: pageSocial, video: pageVideo, games: pageGames, music: pageMusic, apps: pageApps, settings: pageSettings };

  /* ================= Build the dashboard ================= */
  const dashCanvas = $('#dash .canvas');
  dashCanvas.innerHTML = `
    <div class="radial"></div>
    <div class="host">
      <nav class="tabs" role="tablist" aria-label="Dashboard">${TABS.map((t, i) => `<button class="tab" role="tab" data-i="${i}" style="left:${t.x}px;width:${t.w}px"><span>${t.k}</span></button>`).join('')}</nav>
      <div class="me">
        <div class="me__state me__plain"><span class="me__tag">${esc(ME.tag)}</span></div>
        <div class="me__state me__stats"><svg viewBox="0 0 24 24"><path d="${P.people}"/></svg><span class="n">4</span><span data-gs>0</span><b>G</b></div>
        <span class="me__pic"><img src="${ME.pic}" alt=""></span>
        <button type="button" aria-label="Open the Xbox Guide" data-guide></button>
      </div>
      <div class="frame">
        <div class="pages">${TABS.map((t) => PAGES[t.k]()).join('')}</div>
        <div class="strip" hidden></div>
        <div class="peek peek--l"><div class="peek__in"></div></div>
        <div class="peek peek--r"><div class="peek__in"></div></div>
        <button class="peek-hit peek-hit--l" type="button" aria-label="Previous" tabindex="-1"></button>
        <button class="peek-hit peek-hit--r" type="button" aria-label="Next" tabindex="-1"></button>
      </div>
      <div class="hints foot"><span class="h" data-act="a">${G('A')} Select   </span><span class="h" data-act="y">${G('Y')} Eject</span></div>
    </div>
    <div class="toast" aria-live="polite">
      <span class="toast__glow"></span><span class="toast__pill"></span>
      <span class="toast__icon"><img class="orb" src="${A}ui/xbox-orb.webp" alt=""><img class="alert" src="${A}ui/live-alert.webp" alt=""></span>
      <span class="toast__text"><div></div><div></div></span>
    </div>`;
  const host = $('.host'), pagesEl = $('.pages'), stripEl = $('.strip');
  const pageEls = Object.fromEntries($$('.page', pagesEl).map((p) => [p.dataset.tab, p]));
  const tabBtns = $$('.tab');
  const peekL = $('.peek--l'), peekR = $('.peek--r');
  const bgTheme = $('.bg-theme'), bgBing = $('.bg-bing');
  document.body.insertAdjacentHTML('beforeend', '<p class="rotate">Turn your phone sideways for the full dashboard</p>');

  /* ================= Toast (RunSignInToastSequenceAsync) ================= */
  const toastEl = $('.toast'), toastQueue = [];
  [`${A}ui/xbox-orb.webp`, `${A}ui/live-alert.webp`].forEach((u) => { new Image().src = u; });
  let toastBusy = false;
  function toast(l1, l2) {
    if (toastQueue.length > 3) toastQueue.splice(3);
    toastQueue.push([l1, l2]);
    if (!toastBusy) runToasts();
  }
  async function runToasts() {
    toastBusy = true;
    while (toastQueue.length) {
      const [l1, l2] = toastQueue.shift();
      await toastSequence(l1, l2);
    }
    toastBusy = false;
  }
  async function toastSequence(l1, l2) {
    const glow = $('.toast__glow', toastEl), pill = $('.toast__pill', toastEl), icon = $('.toast__icon', toastEl), text = $('.toast__text', toastEl);
    const [t1, t2] = $$('div', text);
    t1.textContent = l1; t2.textContent = l2;
    [glow, pill, icon, text, toastEl].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    Object.assign(glow.style, { opacity: 0, transform: 'scaleX(0)' });
    Object.assign(pill.style, { opacity: 0, transform: 'scaleX(0)' });
    Object.assign(icon.style, { opacity: 0, transform: 'scale(.56)' });
    text.style.opacity = 0;
    icon.classList.remove('blink');
    await wait(120);
    toastEl.style.opacity = 1;
    anim(icon, [{ opacity: 0 }, { opacity: 1 }], 150, E.cubicOut);
    const grow = anim(icon, [{ transform: 'scale(.56)' }, { transform: 'scale(1.04)' }], 180, E.cubicOut);
    sfx('notify-popup');
    await grow.finished;
    icon.classList.add('blink');
    await anim(icon, [{ transform: 'scale(1.04)' }, { transform: 'scale(1)' }], 115, E.cubicOut).finished;
    await wait(55);
    anim(glow, [{ opacity: 0 }, { opacity: 0.34 }], 135, E.cubicOut);
    anim(glow, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 265, E.cubicOut);
    anim(pill, [{ opacity: 0 }, { opacity: 1 }], 110, E.cubicOut);
    await anim(pill, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 265, E.cubicOut).finished;
    await wait(55);
    await anim(text, [{ opacity: 0 }, { opacity: 1 }], 185).finished;
    await wait(2450);
    await anim(text, [{ opacity: 1 }, { opacity: 0 }], 185, E.cubicIn).finished;
    await wait(150);
    icon.classList.remove('blink');
    anim(glow, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], 320, E.cubicIn);
    anim(glow, [{ opacity: 0.34 }, { opacity: 0 }], 270, E.cubicIn);
    anim(pill, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], 320, E.cubicIn);
    anim(pill, [{ opacity: 1 }, { opacity: 0 }], 300, E.cubicIn);
    anim(icon, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.52)', opacity: 0 }], 210, E.cubicIn);
    await wait(320);
    await anim(toastEl, [{ opacity: 1 }, { opacity: 0 }], 80, E.cubicIn).finished;
  }
  const unavailable = (title) => { sfx('select'); toast(title, 'Not available here'); };
  function openLink(url, ach) {
    sfx('select');
    if (ach) achieve(ach);
    if (url.startsWith('mailto:')) location.href = url;
    else window.open(url, '_blank', 'noopener');
  }

  /* ================= Focus: "active" tile and keyboard focus ================= */
  let inputMode = 'mouse';
  let activeEl = null;
  function setActive(el) {
    if (activeEl === el) return;
    if (activeEl) activeEl.classList.remove('on');
    activeEl = el;
    if (el) el.classList.add('on');
  }
  function focusEl(el) {
    if (!el) return false;
    try { el.focus({ preventScroll: true }); } catch (e) { /* not focusable */ }
    setActive(el);
    return true;
  }
  function setPadMode(on) {
    document.body.classList.toggle('pad', on);
  }
  addEventListener('mousemove', (e) => { if (e.movementX || e.movementY) { inputMode = 'mouse'; setPadMode(false); } }, { passive: true });

  // TryMoveDashboardFocus: nearest candidate in the pressed direction,
  // scored as secondary distance x 2.4 plus primary distance.
  function bestInDirection(cands, cur, dir) {
    const c = cands.find((x) => x.el === cur);
    if (!c) return null;
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    const [vx, vy] = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[dir];
    const horiz = dir === 'left' || dir === 'right';
    let best = null, bestScore = Infinity, bestPrimary = Infinity;
    for (const k of cands) {
      if (k.el === cur) continue;
      const kx = k.x + k.w / 2, ky = k.y + k.h / 2, dx = kx - cx, dy = ky - cy;
      if (dx * vx + dy * vy <= 1) continue;
      const primary = horiz ? Math.abs(dx) : Math.abs(dy), secondary = horiz ? Math.abs(dy) : Math.abs(dx);
      const score = secondary * 2.4 + primary;
      if (score < bestScore || (score === bestScore && primary < bestPrimary)) { best = k.el; bestScore = score; bestPrimary = primary; }
    }
    return best;
  }
  // Candidates from on-screen rectangles, for overlays and the Guide.
  function rectCands(scope) {
    const s = parseFloat(getComputedStyle(root).getPropertyValue('--s')) || 1;
    return $$('[data-nav]', scope).filter((el) => el.offsetParent !== null && !el.disabled).map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: r.left / s, y: r.top / s, w: r.width / s, h: r.height / s };
    });
  }

  /* ================= Tabs ================= */
  let tabIndex = 1, animatingTab = false, queuedStep = 0;
  const lastFocus = {};
  const curTab = () => TABS[tabIndex].k;
  const curPage = () => pageEls[curTab()];
  function pageCands(page = curPage()) {
    const k = page.dataset.tab;
    const cands = [];
    $$('.t, [data-nav]', page).forEach((el) => {
      if (el.closest('.sgrid')) {
        const g = el.closest('.sgrid');
        cands.push({ el, x: parseFloat(g.style.left) + parseFloat(el.dataset.sx) * 2.08, y: parseFloat(g.style.top) + parseFloat(el.dataset.sy) * 2.08, w: 97.8875 * 2.08, h: 93.425 * 2.08 });
      } else {
        cands.push({ el, x: +el.dataset.x, y: +el.dataset.y, w: +el.dataset.w, h: +el.dataset.h });
      }
    });
    void k;
    return cands.filter((c) => { const cx = c.x + c.w / 2; return cx >= 64 && cx <= 1120; });
  }
  // FocusDefaultButton: the remembered tile, else the one nearest y 210 then x 560.
  function focusDefault() {
    const k = curTab(), cands = pageCands();
    if (lastFocus[k] && cands.some((c) => c.el === lastFocus[k])) { focusEl(lastFocus[k]); return; }
    cands.sort((a, b) => Math.abs(a.y + a.h / 2 - 210) - Math.abs(b.y + b.h / 2 - 210) || Math.abs(a.x + a.w / 2 - 560) - Math.abs(b.x + b.w / 2 - 560));
    if (cands[0]) focusEl(cands[0].el);
  }
  function renderPeeks() {
    const prev = TABS[tabIndex - 1], next = TABS[tabIndex + 1];
    const fillPeek = (box, t, crop) => {
      const inner = $('.peek__in', box);
      inner.innerHTML = '';
      if (!t) return;
      const clone = cleanClone(pageEls[t.k]);
      clone.style.left = `${-clamp(crop, 0, 1176)}px`;
      inner.appendChild(clone);
    };
    fillPeek(peekL, prev, prev ? leftCrop(prev.k) : 0);
    fillPeek(peekR, next, next ? rightCrop(curTab(), next.k) : 0);
  }
  function cleanClone(page) {
    const c = page.cloneNode(true);
    c.classList.remove('cur');
    c.setAttribute('aria-hidden', 'true');
    c.inert = true;
    $$('.on', c).forEach((x) => x.classList.remove('on'));
    $$('[id]', c).forEach((x) => x.removeAttribute('id'));
    $$('input', c).forEach((x) => { x.tabIndex = -1; });
    return c;
  }
  function paintTabs() {
    tabBtns.forEach((b, i) => { b.classList.toggle('sel', i === tabIndex); b.setAttribute('aria-selected', String(i === tabIndex)); });
    Object.values(pageEls).forEach((p) => p.classList.toggle('cur', p.dataset.tab === curTab()));
  }
  // MoveTab + AnimateTabChange: a 420 ms quartic slide of a 3-page strip,
  // with the side previews sliding in from outside.
  function moveTab(delta, { silent = false } = {}) {
    const next = clamp(tabIndex + delta, 0, TABS.length - 1);
    if (next === tabIndex) return false;
    if (animatingTab) { queuedStep = Math.sign(delta); return true; }
    const from = tabIndex, dir = next > from ? 1 : -1;
    rememberFocus();
    if (!silent) sfx(`tab-switch-${Math.min(from, next)}`);
    tabIndex = next;
    const oldPage = pageEls[TABS[from].k], newPage = pageEls[TABS[next].k];
    const oldClone = cleanClone(oldPage), newClone = cleanClone(newPage);
    setActive(null);
    paintTabs();
    updateBackgrounds();
    visit(curTab());
    stripEl.innerHTML = '';
    oldClone.style.left = '0px';
    newClone.style.left = `${dir * 1280}px`;
    stripEl.append(oldClone, newClone);
    stripEl.hidden = false;
    pagesEl.classList.add('sliding');
    animatingTab = true;
    renderPeeks();
    anim($('.peek__in', peekL), [{ translate: '-104px 0' }, { translate: '0 0' }], 420, E.quartInOut);
    anim($('.peek__in', peekR), [{ translate: '104px 0' }, { translate: '0 0' }], 420, E.quartInOut);
    focusDefault();
    const slide = [{ translate: '0 0' }, { translate: `${-dir * 1280}px 0` }];
    anim(oldClone, slide, 420, E.quartInOut);
    anim(newClone, slide, 420, E.quartInOut).finished.then(() => {
      animatingTab = false;
      stripEl.hidden = true; stripEl.innerHTML = '';
      pagesEl.classList.remove('sliding');
      if (queuedStep && !overlayOpen()) { const s = queuedStep; queuedStep = 0; moveTab(s); } else queuedStep = 0;
    });
    return true;
  }
  function goTab(k) {
    const i = TABS.findIndex((t) => t.k === k);
    if (i >= 0 && i !== tabIndex) moveTab(i - tabIndex);
  }
  function rememberFocus() {
    const k = curTab(), el = document.activeElement;
    if (el && curPage().contains(el)) lastFocus[k] = el.closest('.t, [data-nav]');
  }
  const visited = new Set(store.get('visited', []));
  function visit(k) {
    if (visited.has(k)) return;
    visited.add(k); store.set('visited', [...visited]);
    if (TABS.every((t) => visited.has(t.k))) achieve('explorer');
  }

  // Theme and Bing backgrounds (UpdateThemeBackgroundVisual / UpdateBingBackgroundVisual).
  let themeSection = 'home';
  function updateBackgrounds() {
    const theme = THEMES.find((t) => t.id === S.theme);
    const bingOn = curTab() === 'bing' && !Overlays.top();
    bgBing.classList.toggle('on', bingOn);
    if (!theme || theme.id === 'default') { bgTheme.classList.remove('on'); return; }
    themeSection = Overlays.has('settings') ? 'settings' : Overlays.has('library') ? (Library.mode === 'apps' ? 'apps' : 'games') : 'home';
    const url = `${A}themes/${theme.id}/${themeSection}.webp`;
    if (bgTheme.dataset.src !== url) {
      bgTheme.dataset.src = url;
      bgTheme.classList.remove('on');
      const im = new Image();
      im.onload = () => { if (bgTheme.dataset.src === url) { bgTheme.style.backgroundImage = `url(${url})`; bgTheme.classList.add('on'); } };
      im.src = url;
    } else bgTheme.classList.add('on');
  }

  /* ================= Top right: gamertag, then stats, then neither, every 6 s ================= */
  let topState = 0;
  setInterval(() => {
    if (booting) return;
    topState = (topState + 1) % 3;
    $('.me__plain').style.opacity = topState === 0 ? 1 : 0;
    $('.me__stats').style.opacity = topState === 1 ? 1 : 0;
  }, 6000);
  function refreshScore() { $$('[data-gs]').forEach((el) => { el.textContent = gamerscore(); }); }

  /* ================= Tile actions ================= */
  const recentGame = () => byId(store.get('recent', 'doom')) || byId('doom');
  const ACTIONS = {
    'home.open-tray': () => launch(byId(S.tray) || byId('doom')),
    'home.pins': () => Library.open('pins'),
    'home.recent': () => Details.open(recentGame()),
    'home.hero': () => Profile.open(),
    'home.panic': () => Details.open(byId('panic-pack')),
    'home.unliker': () => Details.open(byId('instagram-unliker')),
    'home.leetcode': () => openLink(LINKS.leetcode, 'leetcode'),
    'home.github': () => openLink(LINKS.github, 'source'),
    'home.linkedin': () => openLink(LINKS.linkedin, 'networker'),
    'social.friends': () => Guide.open('friends'),
    'social.themes': () => Themes.open(),
    'social.signin': () => { sfx('select'); toast(`${ME.tag} signed`, 'in to Xbox LIVE'); },
    'video.apps': () => Library.open('apps'),
    'video.marketplace': () => unavailable('Video Marketplace'),
    'video.feature': () => unavailable('The Dark Knight'),
    'video.cloudy': () => unavailable('Cloudy with a Chance of Meatballs'),
    'video.recent': () => unavailable('Recent videos'),
    'video.kungfu': () => unavailable('Kung Fu Panda 2'),
    'video.hbogo': () => openLink('https://www.max.com'),
    'games.mygames': () => Library.open('games'),
    'games.marketplace': () => unavailable('Game Marketplace'),
    'games.forza': () => unavailable('Forza Horizon'),
    'games.minecraft': () => openLink('https://www.minecraft.net'),
    'games.blackops': () => unavailable('Black Ops II'),
    'music.player': () => Music.open(),
    'music.marketplace': () => unavailable('Music Marketplace'),
    'music.feature': () => unavailable('Overexposed'),
    'music.recent': () => Music.open(),
    'music.search': () => Search.open(),
    'music.panchiko': () => unavailable('Panchiko'),
    'apps.myapps': () => Library.open('apps'),
    'apps.browse': () => unavailable('Browse Apps'),
    'apps.hbogo': () => openLink('https://www.max.com'),
    'apps.netflix': () => openLink('https://www.netflix.com'),
    'apps.youtube': () => openLink('https://www.youtube.com'),
    'apps.hulu': () => openLink('https://www.hulu.com'),
    'apps.espn': () => openLink('https://www.espn.com'),
    'settings.system': () => Settings.open(),
    'settings.preferences': () => Settings.open('dashboard'),
    'settings.profile': () => Profile.open(),
    'settings.kinect': () => unavailable('Kinect'),
    'settings.account': () => Settings.open(),
    'settings.privacy': () => Settings.open('data'),
    'settings.family': () => Settings.open(),
    'settings.turnoff': () => powerOff(),
  };
  function activateTile(el) {
    const id = el.dataset.t;
    if (el.classList.contains('bing__box')) { focusBingInput(); return; }
    if (ACTIONS[id]) ACTIONS[id]();
  }

  /* ================= Overlay stack ================= */
  const Overlays = (() => {
    const stack = [];
    return {
      push(name, api) { stack.push({ name, api }); syncDash(); },
      pop(name) { const i = stack.findIndex((o) => o.name === name); if (i >= 0) stack.splice(i, 1); syncDash(); },
      top() { return stack.length ? stack[stack.length - 1].name : null; },
      api() { return stack.length ? stack[stack.length - 1].api : null; },
      has(name) { return stack.some((o) => o.name === name); },
    };
  })();
  const overlayOpen = () => !!Overlays.top();
  // IsDashboardContentHidden: My Games and System Settings hide the tiles and tab row.
  function syncDash() {
    host.style.visibility = Overlays.has('library') || Overlays.has('settings') ? 'hidden' : '';
    updateBackgrounds();
  }
  function overlayEl(cls) {
    const el = html(`<div class="ov ${cls}"></div>`);
    dashCanvas.appendChild(el);
    return el;
  }

  /* ================= My Games / My Apps / My Pins ================= */
  const Library = (() => {
    let el = null, mode = 'games', sel = 0, closing = false;
    const pins = () => store.get('pins', []);
    const list = () => (mode === 'pins' ? GAMES().filter((g) => pins().includes(g.id)) : GAMES());
    // RebuildAppLibraryTiles: five built-ins, then Hamza's apps filling columns from the third.
    const APP_TILES = () => {
      const size = 198, gap = 4, step = size + gap, x0 = 16, y0 = 8;
      const tiles = [
        { title: 'Windows Media Center', img: `${A}apps/windows-media-center.webp`, col: 0, row: 0, act: () => unavailable('Windows Media Center') },
        { title: 'System Music Player', img: `${A}apps/system-music-player.webp`, col: 1, row: 0, act: () => { close(true); Music.open(); } },
        { title: 'YouTube', img: `${A}apps/youtube.webp`, col: 2, row: 0, act: () => openLink('https://www.youtube.com') },
        { title: 'Internet Explorer', img: `${A}apps/internet-explorer.webp`, col: 0, row: 1, act: () => openLink('https://www.bing.com') },
        { title: 'Microsoft Movies & TV', img: `${A}apps/movies-and-tv.webp`, col: 1, row: 1, act: () => unavailable('Microsoft Movies & TV') },
      ];
      const mine = [
        { title: 'byhamza.dev', img: ME.pic, act: () => Details.open(byId('byhamza')) },
        { title: 'GitHub', glyph: 'github', act: () => openLink(LINKS.github, 'source') },
        { title: 'Instagram Unliker', img: `${A}apps/instagram-unliker.webp`, act: () => Details.open(byId('instagram-unliker')) },
        { title: 'LeetCode', glyph: 'leetcode', act: () => openLink(LINKS.leetcode, 'leetcode') },
        { title: 'LinkedIn', glyph: 'linkedin', act: () => openLink(LINKS.linkedin, 'networker') },
        { title: 'Message Hamza', glyph: 'mail', act: () => openLink(LINKS.mail, 'messenger') },
      ].sort((a, b) => a.title.localeCompare(b.title));
      mine.forEach((t, i) => { t.row = i % 2 === 0 ? 1 : 0; t.col = 2 + Math.floor((i + 1) / 2); tiles.push(t); });
      return tiles.map((t) => ({ ...t, x: x0 + step * t.col, y: y0 + step * t.row, w: size, h: size }));
    };
    function open(m) {
      if (el) close(false, true);
      mode = m; sel = 0; closing = false;
      el = overlayEl('lib');
      const title = mode === 'apps' ? 'My Apps' : mode === 'pins' ? 'My Pins' : 'My Games';
      const filter = mode === 'apps' ? 'all apps' : mode === 'pins' ? 'pinned games' : 'all games';
      el.innerHTML = `<div class="lib__back"></div>
        ${mode === 'apps' ? '' : `<div class="lib__filter"><div><small>&#x2304; show me</small><span>${filter}</span></div><div><small>&#x2304; sort</small><span>titles</span></div></div>`}
        <div class="lib__head"><b>${title}</b><span class="lib__count"></span><em class="lib__sel"></em></div>
        ${mode === 'apps' ? '<div class="apps__view"><div class="lib__strip apps__canvas"></div></div>' : '<div class="lib__view"><div class="lib__strip"></div></div>'}
        <div class="foot-row lib__foot" style="left:75px;bottom:34px;font-size:15px">${G('A')} Launch   <span data-act="b" style="display:flex;align-items:center;cursor:pointer">${G('B')} Back   </span>${mode === 'apps' ? '' : `${G('X')} Game Details   `}${G('Y')} Pin</div>`;
      Overlays.push('library', api);
      render();
      sfx('menu-in');
      achieve(mode === 'apps' ? 'apps' : 'library');
      if (reduced.matches) return;
      layerIn(el, 0, 120, 0);
      anim($('.lib__back', el), [{ opacity: 0 }, { opacity: 0.26 }], 260, E.sineOut);
      layerIn($('.lib__filter', el), -24, 240, 40);
      layerIn($('.lib__head', el), 42, 260, 60);
      layerIn($('.lib__view, .apps__view', el), 168, 360, 35);
      layerIn($('.lib__foot', el), 28, 210, 145);
    }
    function render() {
      const strip = $('.lib__strip', el);
      if (mode === 'apps') {
        const tiles = APP_TILES();
        strip.style.width = `${Math.max(1070, ...tiles.map((t) => t.x + t.w + 18))}px`;
        strip.style.height = '430px';
        strip.innerHTML = tiles.map((t, i) => `<button class="t" data-nav data-i="${i}" style="${px({ left: t.x, top: t.y, width: t.w, height: t.h })}" aria-label="${esc(t.title)}"><span class="f" style="background:${t.img ? '#000' : `rgb(0,154,0)`}">${t.img ? fill(t.img) : `<span class="app__glyph">${svg(t.glyph)}</span><span class="app__t">${esc(t.title)}</span>`}</span></button>`).join('');
        $$('.t', strip).forEach((b, i) => {
          b.addEventListener('click', () => { sel = i; tiles[i].act(); });
          b.addEventListener('mouseenter', () => setActive(b));
          b.addEventListener('mouseleave', () => { if (activeEl === b) setActive(null); });
        });
        select(0, true);
        return;
      }
      const games = list();
      strip.innerHTML = games.map((g, i) => `<button class="t card" data-nav data-i="${i}" aria-label="${esc(g.title)}"><span class="f"><span class="card__cover"><img src="${g.cover}" alt=""></span><span class="card__t">${esc(g.title)}</span><span class="card__s">${esc(g.sub)}</span>${pins().includes(g.id) ? `<span class="card__pin"><img src="${A}icons/pin.webp" alt="Pinned"></span>` : ''}</span></button>`).join('');
      if (!games.length) strip.insertAdjacentHTML('afterend', '<p class="lib__empty">Nothing pinned yet. Press Y on a game in My Games to pin it.</p>');
      $$('.t', strip).forEach((b, i) => {
        b.addEventListener('click', () => { select(i); launch(games[i]); });
        b.addEventListener('mouseenter', () => setActive(b));
        b.addEventListener('mouseleave', () => { if (activeEl === b) setActive(null); });
      });
      select(Math.min(sel, Math.max(0, games.length - 1)), true);
    }
    function count() { return mode === 'apps' ? APP_TILES().length : list().length; }
    function select(i, quiet) {
      const n = count();
      if (!n) { $('.lib__count', el).textContent = '0 of 0'; $('.lib__sel', el).textContent = ''; return; }
      const prev = sel;
      sel = clamp(i, 0, n - 1);
      const btn = $$('.lib__strip .t', el)[sel];
      focusEl(btn);
      $('.lib__count', el).textContent = `${sel + 1} of ${n}`;
      $('.lib__sel', el).textContent = mode === 'apps' ? APP_TILES()[sel].title : list()[sel].title;
      if (!quiet && prev !== sel) sfx('focus');
      // Keep the focused card or tile inside the visible strip.
      const strip = $('.lib__strip', el), view = strip.parentElement;
      const left = mode === 'apps' ? APP_TILES()[sel].x : sel * 196, w = mode === 'apps' ? 198 : 188;
      const vw = view.clientWidth - 40, cur = -(parseFloat(strip.dataset.off) || 0);
      let off = cur;
      if (left - off < 0) off = left;
      if (left + w - off > vw) off = left + w - vw;
      strip.dataset.off = -off;
      strip.style.transform = `translateX(${-off}px)`;
    }
    function move(dir) {
      if (mode === 'apps') {
        const tiles = APP_TILES(), cands = tiles.map((t, i) => ({ el: i, x: t.x, y: t.y, w: t.w, h: t.h }));
        const n = bestInDirection(cands.map((c) => ({ ...c, el: c.el })), sel, dir);
        if (n !== null && n !== undefined) select(n);
        return;
      }
      if (dir === 'left') select(sel - 1);
      if (dir === 'right') select(sel + 1);
    }
    function close(silent, instant) {
      if (!el || closing) return;
      const node = el;
      closing = true;
      if (!silent) sfx('menu-out');
      const finish = () => { node.remove(); if (el === node) { el = null; closing = false; } Overlays.pop('library'); if (!overlayOpen()) focusDefault(); };
      if (instant || reduced.matches) { finish(); return; }
      layerOut($('.lib__filter', node), -34, 145);
      layerOut($('.lib__head', node), 48, 160);
      layerOut($('.lib__view, .apps__view', node), 150, 210);
      layerOut($('.lib__foot', node), 24, 130);
      layerOut($('.lib__back', node), 0, 190, 0.26);
      anim(node, [{ opacity: 1 }, { opacity: 0 }], 150, E.sineIn);
      anim(node, [{ translate: '0 0' }, { translate: '112px 0' }], 210, E.cubicIn).finished.then(finish);
    }
    function togglePin() {
      if (mode === 'apps') return;
      const g = list()[sel];
      if (!g) return;
      const p = pins(), i = p.indexOf(g.id);
      if (i >= 0) p.splice(i, 1); else { p.push(g.id); achieve('pinned'); }
      store.set('pins', p);
      sfx('select');
      render();
    }
    const api = {
      handle(a) {
        if (['left', 'right', 'up', 'down'].includes(a)) { move(a); return true; }
        if (a === 'a') { const b = $$('.lib__strip .t', el)[sel]; if (b) b.click(); return true; }
        if (a === 'b') { close(); return true; }
        if (a === 'x' && mode !== 'apps') { const g = list()[sel]; if (g) Details.open(g); return true; }
        if (a === 'y') { togglePin(); return true; }
        return true;
      },
      refocus() { select(sel, true); },
    };
    return { open, close, get mode() { return mode; }, get isOpen() { return !!el; } };
  })();

  /* ================= Game Details ================= */
  const Details = (() => {
    let el = null, game = null, tab = 0;
    const TABS_D = ['overview', 'details', 'extras', 'gallery'];
    let galleryI = 0;
    function open(g) {
      if (!g) return;
      if (el) el.remove(), Overlays.pop('details');
      game = g; tab = 0; galleryI = 0;
      store.set('recent', g.id);
      const read = new Set(store.get('read', []));
      read.add(g.id); store.set('read', [...read]);
      if (['doom', 'panic-pack', 'instagram-unliker', 'byhamza'].filter((x) => x !== 'doom').every((x) => read.has(x))) achieve('reader');
      el = overlayEl('det');
      el.innerHTML = `<div class="det__tint"></div><img class="det__img" src="${g.wide}" alt=""><div class="det__shade"></div><div class="det__grad"></div>
        <nav class="det__tabs">${TABS_D.map((t, i) => `<button type="button" data-tab="${i}">${t}</button>`).join('')}</nav>
        <div class="det__title">${esc(g.title)}</div>
        <div class="det__body"></div>
        <div class="foot-row foot-row--20 det__foot" style="left:95px;bottom:38px;font-size:16px">${G('A')} Select   <span data-act="b" style="display:flex;align-items:center;cursor:pointer">${G('B')} Back   </span>${G('Y')} Pin to Tray</div>`;
      $$('.det__tabs button', el).forEach((b) => b.addEventListener('click', () => setTab(+b.dataset.tab)));
      Overlays.push('details', api);
      paint(true);
      sfx('menu-in');
      if (reduced.matches) return;
      layerIn(el, 0, 120, 0);
      anim($('.det__tint', el), [{ opacity: 0 }, { opacity: 1 }], 210, E.sineOut);
      anim($('.det__img', el), [{ opacity: 0 }, { opacity: 0.46 }], 270, E.sineOut, 25);
      anim($('.det__shade', el), [{ opacity: 0 }, { opacity: 1 }], 250, E.sineOut, 40);
      anim($('.det__grad', el), [{ opacity: 0 }, { opacity: 1 }], 250, E.sineOut, 55);
      layerIn($('.det__tabs', el), -42, 270, 55);
      layerIn($('.det__title', el), 48, 280, 80);
      layerIn($('.det__foot', el), 26, 210, 190);
    }
    const dbtn = (label, box, act) => `<button type="button" class="dbtn" data-nav data-act="${act}" style="${px(box)}">${esc(label)}</button>`;
    function paint(first) {
      $$('.det__tabs button', el).forEach((b, i) => b.classList.toggle('sel', i === tab));
      const body = $('.det__body', el), g = game;
      $('.det__title', el).style.display = '';
      if (tab === 0) {
        const four = !!g.second;
        body.innerHTML = `<div class="det__panel det__over" style="left:160px;top:184px;width:760px;height:382px">
            ${dbtn(g.launch.label, { left: 0, top: 0, width: 165, height: 100 }, 'launch')}
            ${four ? dbtn(g.second.label, { left: 169, top: 0, width: 161, height: 100 }, 'second') : dbtn('Pin to Tray', { left: 169, top: 0, width: 161, height: 100 }, 'tray')}
            ${four ? dbtn('Details', { left: 0, top: 104, width: 165, height: 96 }, 'details') + dbtn('Pin to Tray', { left: 169, top: 104, width: 161, height: 96 }, 'tray') : ''}
            <div class="det__cover"><img src="${g.wide}" alt=""></div>
            <div class="det__meta">${g.meta.map((m, i) => `<div style="font-size:${[15, 16, 14, 14][i] || 14}px;margin-top:${i ? 5 : 0}px">${esc(m)}</div>`).join('')}</div>
          </div>
          <div class="det__info"><div class="rate"><b>${esc(g.rating[0])}</b><span>${esc(g.rating[1])}</span></div>
            <dl><dt>Source</dt><dd>${esc(g.source)}</dd><dt>Genre</dt><dd>${esc(g.genre)}</dd><dt>Last played</dt><dd class="small">${esc(lastPlayed(g))}</dd></dl></div>`;
        if (first && !reduced.matches) { layerIn($('.det__over', el), 118, 340, 95); layerIn($('.det__info', el), 58, 285, 145); }
      } else if (tab === 1) {
        body.innerHTML = `<div class="det__panel det__details" style="left:198px;top:188px;width:850px;height:370px">
          <div><h4>Developer</h4><p>${esc(g.developer)}</p><h4>Publisher</h4><p>${esc(g.publisher)}</p><h4>Genre</h4><p>${esc(g.genre)}</p></div>
          <div class="cap"><h4>Local Capabilities</h4><p>${esc(g.local).replace(/\n/g, '<br>')}</p><h4 class="on">Online Capabilities</h4><p>${esc(g.online)}</p></div>
          <p class="note" data-nav tabindex="-1">${esc(g.note)}</p></div>`;
      } else if (tab === 2) {
        body.innerHTML = `<div class="det__panel det__extras" style="left:228px;top:184px;width:810px;height:312px">${g.extras.map(([t, u, p], i) => `<button type="button" class="dbtn" data-nav data-act="extra" data-i="${i}"><img src="${A}icons/${i ? 'apps-marketplace' : 'game-marketplace'}.webp" alt=""><span class="x-p">${esc(p)}</span><span class="x-t">${esc(t)}</span></button>`).join('')}</div>`;
      } else {
        const n = g.gallery.length;
        body.innerHTML = `<div class="det__count">${galleryI + 1} of ${n}</div><div class="det__panel" style="left:240px;top:182px"><div class="det__gallery" data-nav tabindex="-1"><img src="${g.gallery[galleryI]}" alt=""></div></div>`;
      }
      $$('[data-nav]', body).forEach((b) => {
        b.addEventListener('mouseenter', () => setActive(b));
        b.addEventListener('mouseleave', () => { if (activeEl === b) setActive(null); });
        b.addEventListener('click', () => act(b));
      });
      const firstBtn = $('[data-nav]', body);
      if (firstBtn) focusEl(firstBtn);
    }
    function lastPlayed(g) {
      const t = store.get('played', {})[g.id];
      return t ? new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';
    }
    function setTab(i) {
      i = clamp(i, 0, TABS_D.length - 1);
      if (i === tab) return;
      sfx(i < tab ? 'page-left' : 'page-right');
      const dir = i > tab ? 1 : -1;
      tab = i;
      paint();
      const panel = $('.det__panel', el);
      if (panel && !reduced.matches) layerIn(panel, dir * 90, 260, 0);
    }
    function act(b) {
      const a = b.dataset.act;
      if (a === 'launch') launch(game);
      else if (a === 'second') openLink(game.second.url, 'source');
      else if (a === 'details') setTab(1);
      else if (a === 'tray') pinToTray(game);
      else if (a === 'extra') {
        const [, u] = game.extras[+b.dataset.i];
        if (u === '#details') setTab(1); else openLink(u, 'source');
      }
    }
    function pinToTray(g) {
      if (g.type !== 'game') { sfx('select'); toast(g.title, 'Only games go in the tray'); return; }
      S.tray = g.id; saveSettings();
      sfx('select');
      achieve('tray');
      rebuildPage('home');
      toast(g.title, 'Pinned to the tray');
    }
    function close() {
      if (!el) return;
      el.remove(); el = null;
      sfx('menu-out');
      Overlays.pop('details');
      const top = Overlays.api();
      if (top && top.refocus) top.refocus(); else if (!overlayOpen()) focusDefault();
    }
    const api = {
      handle(a) {
        if (a === 'lb' || a === 'rb') { setTab(tab + (a === 'lb' ? -1 : 1)); return true; }
        if (tab === 3 && (a === 'left' || a === 'right')) {
          const n = game.gallery.length, i = clamp(galleryI + (a === 'left' ? -1 : 1), 0, n - 1);
          if (i !== galleryI) { galleryI = i; sfx('focus'); paint(); }
          return true;
        }
        if (['left', 'right', 'up', 'down'].includes(a)) {
          const n = bestInDirection(rectCands(el), activeEl, a);
          if (n) { focusEl(n); sfx('focus'); }
          return true;
        }
        if (a === 'a') { if (activeEl && el.contains(activeEl) && activeEl.dataset.act) act(activeEl); return true; }
        if (a === 'b') { close(); return true; }
        if (a === 'y') { pinToTray(game); return true; }
        return true;
      },
      refocus() { const f = $('.det__body [data-nav]', el); if (f) focusEl(f); },
    };
    return { open, close };
  })();

  function rebuildPage(k) {
    const old = pageEls[k], fresh = html(PAGES[k]());
    if (old.classList.contains('cur')) fresh.classList.add('cur');
    old.replaceWith(fresh);
    pageEls[k] = fresh;
    wirePage(fresh);
    if (activeEl && !document.contains(activeEl)) activeEl = null;
    delete lastFocus[k];
    renderPeeks();
    fillLive();
  }

  /* ================= System Settings ================= */
  const Settings = (() => {
    let el = null, cat = null;
    const CATS = [
      ['console', 'Console Settings', 'Change startup, sound and controller behaviour.'],
      ['dashboard', 'Dashboard Customization', 'Change the dashboard theme and tile colour.'],
      ['audio', 'Audio', 'Choose how loud the dashboard sounds are.'],
      ['data', 'Data Control', 'Reset the dashboard data saved in this browser.'],
      ['about', 'About', 'Credits for the dashboard, the artwork, the font and DOOM.'],
    ];
    const STARTUP = [['video', 'Boot Video and Loading'], ['loading', 'Loading Only'], ['off', 'Straight to the Dashboard']];
    function open(category) {
      if (!el) {
        el = overlayEl('set');
        el.innerHTML = `<div class="set__title">System Settings</div>
          <div class="set__frame"><div class="set__left"><div class="set__scroll"><div></div></div></div><div class="set__right"><h3></h3><p></p></div></div>
          <div class="foot-row set__foot" style="left:92px;bottom:45px;font-size:15px">${G('A')} Select   <span data-act="b" style="display:flex;align-items:center;cursor:pointer">${G('B')} Back</span></div>`;
        Overlays.push('settings', api);
        sfx('menu-in');
        if (!reduced.matches) {
          layerIn(el, 0, 120, 0);
          layerIn($('.set__title', el), 36, 250, 35);
          layerIn($('.set__frame', el), 132, 360, 20);
          layerIn($('.set__foot', el), 26, 210, 160);
        }
      }
      if (category) showCategory(category, true); else showCategories();
    }
    function describe(t, d) { $('.set__right h3', el).textContent = t; $('.set__right p', el).textContent = d; }
    function list(items) {
      const box = $('.set__scroll > div', el);
      box.style.transform = '';
      box.innerHTML = items.join('');
      $$('[data-nav]', box).forEach((b) => {
        b.addEventListener('mouseenter', () => { setActive(b); if (b.dataset.tip) describe(...b.dataset.tip.split('|')); });
        b.addEventListener('focus', () => { if (b.dataset.tip) describe(...b.dataset.tip.split('|')); });
        b.addEventListener('click', (e) => onClick(b, e));
      });
      focusEl($('[data-nav]', box));
      const f = $('[data-nav]', box);
      if (f && f.dataset.tip) describe(...f.dataset.tip.split('|'));
    }
    function showCategories() {
      cat = null;
      $('.set__title', el).textContent = 'System Settings';
      describe('System Settings', 'Choose a settings category.');
      list(CATS.map(([k, t, d]) => `<button type="button" class="mbtn" data-nav data-cat="${k}" data-tip="${esc(t)}|${esc(d)}">${esc(t)}</button>`));
    }
    const chk = (key, label, tip) => `<button type="button" class="ochk${S[key] ? ' chk' : ''}" data-nav data-chk="${key}" data-tip="${esc(label)}|${esc(tip)}"><i></i>${esc(label)}</button>`;
    const btn = (id, label, tip) => `<button type="button" class="obtn" data-nav data-btn="${id}" data-tip="${esc(label)}|${esc(tip)}">${esc(label)}</button>`;
    function showCategory(k, fromOutside) {
      cat = k;
      const [, title, desc] = CATS.find((c) => c[0] === k);
      $('.set__title', el).textContent = title;
      if (!fromOutside) sfx('settings-box');
      if (k === 'console') {
        const st = STARTUP.find((s) => s[0] === S.startup) || STARTUP[0];
        list([
          '<div class="opt"><label>Dashboard Startup</label></div>',
          `<button type="button" class="oval" data-nav data-cycle="startup" data-tip="Dashboard Startup|Choose what plays when the dashboard opens."><span>${st[1]}</span><small>&#9666; &#9656;</small></button>`,
          chk('sounds', 'Play UI Sounds', 'Play dashboard navigation and selection sounds.'),
          chk('pad', 'Enable Controller Input', 'Use an Xbox, PlayStation or Nintendo controller to navigate the dashboard.'),
          chk('loading', 'Enable Fake Loading', 'Show the Xbox-style loading transition during startup.'),
        ]);
      } else if (k === 'dashboard') {
        const c = COLOURS.find((x) => x[1] === S.colour) || COLOURS[0];
        list([
          btn('themes', 'Select Theme', 'Pick a dashboard theme. Themes change the dashboard background.'),
          '<div class="opt"><label>Tile Color</label></div>',
          `<button type="button" class="oval" data-nav data-cycle="colour" data-tip="Tile Color|Change the color of the dashboard’s system tiles."><span><i style="display:inline-block;width:14px;height:14px;margin-right:10px;vertical-align:-1px;background:${c[1]}"></i>${c[0]}</span><small>&#9666; &#9656;</small></button>`,
        ]);
      } else if (k === 'audio') {
        list([
          '<div class="opt"><label>Dashboard Volume</label></div>',
          `<div class="oslider" data-nav tabindex="-1" data-slider="volume" data-tip="Dashboard Volume|Change only this dashboard’s sounds and music volume."><span class="track"><i style="width:${S.volume * 100}%"></i><b style="left:${S.volume * 100}%"></b></span><span>${Math.round(S.volume * 100)}%</span></div>`,
          btn('music', 'Music Player', 'Open the Music Player and play songs from this device.'),
        ]);
      } else if (k === 'data') {
        list([
          btn('reset-ach', 'Reset Achievements', 'Lock every achievement again. Your gamerscore goes back to 0.'),
          btn('reset-lib', 'Reset Pins, Tray and Recent', 'Clear My Pins, put DOOM back in the tray and forget what you played.'),
          btn('reset-all', 'Reset Everything', 'Clear all dashboard data saved in this browser, including settings.'),
        ]);
      } else if (k === 'about') {
        list([
          btn('l:dashx360', 'DashX360 by ZivvoZ', 'The Windows dashboard this site is ported from. Layouts, animations, sounds and artwork come from DashX360.'),
          btn('l:source', 'Source Code', 'byhamza.dev on GitHub.'),
          btn('l:selawik', 'Selawik Font', 'Microsoft’s open-source stand-in for Segoe UI, under the SIL Open Font License.'),
          btn('l:doom', 'DOOM Shareware', 'Shareware DOOM v1.9 by id Software on Cloudflare’s WebAssembly build of Chocolate Doom (GPL-2.0).'),
          '<p class="otext">Unofficial non-commercial fan project. Xbox and related names, logos, and imagery are property of Microsoft. Not affiliated with or endorsed by Microsoft.</p>',
        ]);
      }
      if (!$('[data-nav]', el)) describe(title, desc);
    }
    function onClick(b) {
      if (b.dataset.cat) { showCategory(b.dataset.cat); return; }
      if (b.dataset.chk) {
        const k = b.dataset.chk;
        S[k] = !S[k]; saveSettings();
        b.classList.toggle('chk', S[k]);
        sfx('select');
        return;
      }
      if (b.dataset.cycle) { adjust(b, 1); return; }
      if (b.dataset.btn) {
        const id = b.dataset.btn;
        if (id === 'themes') { Themes.open(); return; }
        if (id === 'music') { close(true); Music.open(); return; }
        if (id.startsWith('l:')) {
          openLink({ dashx360: LINKS.dashx360, source: LINKS.source, selawik: 'https://github.com/microsoft/Selawik', doom: 'https://github.com/cloudflare/doom-wasm' }[id.slice(2)], id === 'l:source' ? 'source' : null);
          return;
        }
        if (id === 'reset-ach') { store.del('achievements'); refreshScore(); sfx('select'); toast('Achievements', 'Reset'); }
        if (id === 'reset-lib') { store.del('pins'); store.del('recent'); store.del('played'); S.tray = 'doom'; saveSettings(); rebuildPage('home'); sfx('select'); toast('My Pins', 'Reset'); }
        if (id === 'reset-all') { ['achievements', 'pins', 'recent', 'played', 'read', 'visited', 'settings', 'days'].forEach(store.del); sfx('select'); setTimeout(() => location.reload(), 400); }
      }
    }
    // DashboardInputRouter.TryAdjustFocusedSetting: left and right change values in place.
    function adjust(b, d) {
      if (b.dataset.cycle === 'startup') {
        const i = STARTUP.findIndex((s) => s[0] === S.startup);
        S.startup = STARTUP[(i + d + STARTUP.length) % STARTUP.length][0];
        $('span', b).textContent = STARTUP.find((s) => s[0] === S.startup)[1];
      } else if (b.dataset.cycle === 'colour') {
        const i = COLOURS.findIndex((c) => c[1] === S.colour);
        const c = COLOURS[(i + d + COLOURS.length) % COLOURS.length];
        S.colour = c[1];
        $('span', b).innerHTML = `<i style="display:inline-block;width:14px;height:14px;margin-right:10px;vertical-align:-1px;background:${c[1]}"></i>${c[0]}`;
        applyColour();
      } else if (b.dataset.slider === 'volume') {
        S.volume = clamp(Math.round((S.volume + d * 0.05) * 20) / 20, 0, 1);
        Sound.volume(S.volume);
        $('.track i', b).style.width = `${S.volume * 100}%`;
        $('.track b', b).style.left = `${S.volume * 100}%`;
        $('span:last-child', b).textContent = `${Math.round(S.volume * 100)}%`;
      } else return false;
      saveSettings();
      sfx('focus');
      return true;
    }
    function close(silent) {
      if (!el) return;
      const node = el;
      el = null;
      if (!silent) sfx('menu-out');
      const finish = () => { node.remove(); Overlays.pop('settings'); if (!overlayOpen()) focusDefault(); else { const t = Overlays.api(); if (t && t.refocus) t.refocus(); } };
      if (reduced.matches) { finish(); return; }
      layerOut($('.set__title', node), 42, 145);
      layerOut($('.set__frame', node), 136, 215);
      layerOut($('.set__foot', node), 24, 130);
      anim(node, [{ opacity: 1 }, { opacity: 0 }], 150, E.sineIn);
      anim(node, [{ translate: '0 0' }, { translate: '112px 0' }], 210, E.cubicIn).finished.then(finish);
    }
    function keepVisible() {
      const box = $('.set__scroll > div', el);
      if (!activeEl || !box.contains(activeEl)) return;
      const top = activeEl.offsetTop, bottom = top + activeEl.offsetHeight, h = box.parentElement.clientHeight;
      const cur = -(parseFloat(box.dataset.off) || 0);
      let off = cur;
      if (top - off < 0) off = top;
      if (bottom - off > h) off = bottom - h;
      box.dataset.off = -off;
      box.style.transform = `translateY(${-off}px)`;
    }
    const api = {
      handle(a) {
        if ((a === 'left' || a === 'right') && activeEl && el.contains(activeEl) && (activeEl.dataset.cycle || activeEl.dataset.slider)) { adjust(activeEl, a === 'left' ? -1 : 1); return true; }
        if (['left', 'right', 'up', 'down'].includes(a)) {
          const n = bestInDirection(rectCands($('.set__left', el)), activeEl, a);
          if (n) { focusEl(n); sfx('focus'); keepVisible(); if (n.dataset.tip) describe(...n.dataset.tip.split('|')); }
          return true;
        }
        if (a === 'a') { if (activeEl && el.contains(activeEl)) onClick(activeEl); return true; }
        if (a === 'b') { if (cat) { sfx('menu-out'); showCategories(); } else close(); return true; }
        return true;
      },
      refocus() { const f = $('.set__left [data-nav]', el); if (f) focusEl(f); },
    };
    return { open, close };
  })();
  function applyColour() {
    const c = S.colour || '#028d02';
    const n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const adj = (d) => `rgb(${clamp(r + d, 0, 255)},${clamp(g + d, 0, 255)},${clamp(b + d, 0, 255)})`;
    root.style.setProperty('--green', c);
    root.style.setProperty('--tile', `linear-gradient(to bottom right, ${adj(28)} 0%, ${adj(10)} 28%, ${c} 58%, ${adj(-16)} 100%)`);
  }

  /* ================= Themes ================= */
  const Themes = (() => {
    let el = null;
    function open() {
      if (el) return;
      el = overlayEl('themes');
      el.innerHTML = `<div class="themes__back"></div><div class="themes__panel"><div class="themes__head">Select Theme</div>${THEMES.map((t) => `<button type="button" class="tbtn" data-nav data-theme="${t.id}">${esc(t.name)}${t.id === S.theme ? '<small>Current</small>' : ''}</button>`).join('')}</div>
        <div class="foot-row themes__foot" style="left:92px;bottom:45px;font-size:15px">${G('A')} Select   <span data-act="b" style="display:flex;align-items:center;cursor:pointer">${G('B')} Back</span></div>`;
      $$('.tbtn', el).forEach((b) => {
        b.addEventListener('mouseenter', () => setActive(b));
        b.addEventListener('click', () => pick(b));
      });
      Overlays.push('themes', api);
      focusEl($(`.tbtn[data-theme="${S.theme}"]`, el) || $('.tbtn', el));
      sfx('menu-in');
      if (!reduced.matches) {
        anim(el, [{ opacity: 0 }, { opacity: 1 }], 95, E.sineOut);
        anim($('.themes__back', el), [{ opacity: 0 }, { opacity: 1 }], 180, E.sineOut);
        layerIn($('.themes__panel', el), 64, 285, 15);
        layerIn($('.themes__foot', el), 24, 205, 110);
      }
    }
    function pick(b) {
      const id = b.dataset.theme;
      sfx('select');
      if (S.theme !== id) { S.theme = id; saveSettings(); if (id !== 'default') achieve('themes'); }
      $$('.tbtn small', el).forEach((s) => s.remove());
      b.insertAdjacentHTML('beforeend', '<small>Current</small>');
      updateBackgrounds();
    }
    function close() {
      if (!el) return;
      el.remove(); el = null;
      sfx('menu-out');
      Overlays.pop('themes');
      const t = Overlays.api();
      if (t && t.refocus) t.refocus(); else focusDefault();
    }
    const api = {
      handle(a) {
        if (a === 'up' || a === 'down') {
          const n = bestInDirection(rectCands(el), activeEl, a);
          if (n) { focusEl(n); sfx('focus'); }
          return true;
        }
        if (a === 'a') { if (activeEl && el.contains(activeEl)) pick(activeEl); return true; }
        if (a === 'b') { close(); return true; }
        return true;
      },
      refocus() { focusEl($('.tbtn', el)); },
    };
    return { open };
  })();

  /* ================= Profile ================= */
  const Profile = (() => {
    let el = null;
    const ITEMS = [
      ['View Games', () => Library.open('games')],
      ['View Achievements', () => Guide.open('achievements')],
      ['View Apps', () => Library.open('apps')],
      ['GitHub', () => openLink(LINKS.github, 'source')],
      ['LinkedIn', () => openLink(LINKS.linkedin, 'networker')],
      ['LeetCode', () => openLink(LINKS.leetcode, 'leetcode')],
      ['Send Message', () => openLink(LINKS.mail, 'messenger')],
    ];
    function open() {
      if (el) return;
      el = overlayEl('prof');
      el.innerHTML = `<div class="prof__title">Profile</div>
        <div class="prof__pic"><img src="${ME.pic}" alt=""></div>
        <div class="prof__clock" data-clock24></div>
        <div class="prof__frame">
          <div class="prof__left">${ITEMS.map(([t], i) => `<button type="button" class="pbtn" data-nav data-i="${i}">${esc(t)}</button>`).join('')}</div>
          <div class="prof__right">
            <div class="gc"><div class="gc__tag">${esc(ME.tag)}</div><div class="gc__pic"><img src="${ME.pic}" alt=""></div>
              <div class="gc__rows"><div><span>Rep</span><span class="rep">&#9733;&#9733;&#9733;&#9733;&#9733;</span></div><div><span>Gamerscore</span><span><span data-gs>${gamerscore()}</span> G</span></div><div><span>Zone</span><span>${esc(ME.zone)}</span></div></div></div>
            <div class="prof__bio"><p class="motto">${esc(ME.motto)}</p><p>${esc(ME.name)}</p><p class="loc">${esc(ME.location)}</p><p>${esc(ME.bio)}</p></div>
          </div>
        </div>
        <div class="foot-row prof__foot" style="left:138px;bottom:38px;font-size:15px">${G('A')} Select   <span data-act="b" style="display:flex;align-items:center;cursor:pointer">${G('B')} Back</span></div>`;
      $$('.pbtn', el).forEach((b) => {
        b.addEventListener('mouseenter', () => setActive(b));
        b.addEventListener('click', () => ITEMS[+b.dataset.i][1]());
      });
      Overlays.push('profile', api);
      tickClock();
      focusEl($('.pbtn', el));
      sfx('menu-in');
      achieve('profile');
      if (!reduced.matches) {
        anim(el, [{ opacity: 0 }, { opacity: 1 }], 95, E.sineOut);
        layerIn($('.prof__title', el), 34, 240, 35);
        layerIn($('.prof__pic', el), 0, 210, 45);
        layerIn($('.prof__clock', el), 34, 240, 55);
        layerIn($('.prof__frame', el), 118, 340, 20);
        layerIn($('.prof__foot', el), 24, 205, 145);
      }
    }
    function close() {
      if (!el) return;
      el.remove(); el = null;
      sfx('menu-out');
      Overlays.pop('profile');
      const t = Overlays.api();
      if (t && t.refocus) t.refocus(); else focusDefault();
    }
    const api = {
      handle(a) {
        if (a === 'up' || a === 'down') {
          const n = bestInDirection(rectCands($('.prof__left', el)), activeEl, a);
          if (n) { focusEl(n); sfx('focus'); }
          return true;
        }
        if (a === 'a') { if (activeEl && el.contains(activeEl)) activeEl.click(); return true; }
        if (a === 'b') { close(); return true; }
        return true;
      },
      refocus() { focusEl($('.pbtn', el)); },
    };
    return { open };
  })();

  /* ================= Bing search ================= */
  function bingSearch(q) {
    q = (q || '').trim();
    if (!q) return false;
    achieve('search');
    sfx('select');
    window.open(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, '_blank', 'noopener');
    return true;
  }
  function focusBingInput() {
    const input = $('.bing__box input', pageEls.bing);
    focusEl(input.parentElement);
    input.focus({ preventScroll: true });
  }
  const Search = (() => {
    let el = null;
    function open() {
      if (el) return;
      goTab('bing');
      el = overlayEl('srch');
      el.innerHTML = `<div class="srch__box"><h2>Bing</h2><p>Search games, help, stores, and the web.</p><input type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" aria-label="Search with Bing"><div class="srch__btns"><button type="button" class="abtn" data-nav data-go>Search</button><button type="button" class="abtn" data-nav data-cancel>Cancel</button></div></div>`;
      const input = $('input', el);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      $('[data-go]', el).addEventListener('click', submit);
      $('[data-cancel]', el).addEventListener('click', () => close());
      $$('.abtn', el).forEach((b) => b.addEventListener('mouseenter', () => setActive(b)));
      Overlays.push('search', api);
      sfx('menu-in');
      setTimeout(() => input.focus({ preventScroll: true }), 30);
    }
    function submit() { if (bingSearch($('input', el).value)) close(true); }
    function close(silent) {
      if (!el) return;
      el.remove(); el = null;
      if (!silent) sfx('menu-out');
      Overlays.pop('search');
      focusDefault();
    }
    const api = {
      handle(a) {
        if (a === 'b') { close(); return true; }
        if (a === 'left' || a === 'right' || a === 'down') {
          const n = bestInDirection(rectCands(el), activeEl && el.contains(activeEl) ? activeEl : $('.abtn', el), a);
          focusEl(n || $('.abtn', el));
          return true;
        }
        if (a === 'up') { $('input', el).focus(); setActive(null); return true; }
        if (a === 'a') { if (activeEl && el.contains(activeEl)) activeEl.click(); else submit(); return true; }
        return true;
      },
    };
    return { open };
  })();

  /* ================= Music Player (Hard Drive = files on this device) ================= */
  const Music = (() => {
    let el = null, tracks = [], cur = -1, audio = null, analyser = null, raf = 0;
    function open() {
      if (el) return;
      el = overlayEl('mus');
      el.innerHTML = `<div class="mus__title">Music Player</div>
        <div class="mus__frame"><div class="mus__left">
          <button type="button" class="mus__src" data-nav data-src="hd"><img src="${A}icons/music-hard-drive.webp" alt="">Hard Drive</button>
          <button type="button" class="mus__src" data-nav data-src="songs"><img src="${A}icons/music-songs.webp" alt="">Songs</button>
          <button type="button" class="mus__src" data-nav data-src="play"><img src="${A}icons/music-saved-playlists.webp" alt="">Play / Pause</button>
        </div><div class="mus__right"><div class="mus__now"><b>Select Music</b><span>Nothing playing</span></div><canvas class="mus__viz" width="1040" height="300"></canvas><div class="mus__list"></div></div></div>
        <div class="foot-row mus__foot" style="left:145px;bottom:58px;font-size:15px">${G('A')} Select   <span data-act="b" style="display:flex;align-items:center;cursor:pointer">${G('B')} Back</span></div>
        <input type="file" accept="audio/*" multiple hidden>`;
      const input = $('input[type=file]', el);
      input.addEventListener('change', () => { addFiles([...input.files]); input.value = ''; });
      $$('[data-src]', el).forEach((b) => {
        b.addEventListener('mouseenter', () => setActive(b));
        b.addEventListener('click', () => pick(b.dataset.src));
      });
      Overlays.push('music', api);
      renderList();
      focusEl($('.mus__src', el));
      sfx('menu-in');
      draw();
      if (!reduced.matches) {
        layerIn(el, 0, 130, 0);
        layerIn($('.mus__title', el), 34, 240, 35);
        layerIn($('.mus__frame', el), 112, 335, 20);
        layerIn($('.mus__foot', el), 24, 205, 170);
      }
    }
    function pick(src) {
      sfx('select');
      if (src === 'hd') $('input[type=file]', el).click();
      else if (src === 'songs') { const r = $('.mus__row', el); if (r) focusEl(r); }
      else if (src === 'play') toggle();
    }
    function addFiles(files) {
      files.filter((f) => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f.name)).forEach((f) => tracks.push({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) }));
      renderList();
      if (cur < 0 && tracks.length) play(0);
    }
    function renderList() {
      const box = $('.mus__list', el);
      $('.mus__empty', el) && $('.mus__empty', el).remove();
      if (!tracks.length) { box.innerHTML = ''; box.insertAdjacentHTML('afterend', '<p class="mus__empty">Choose Hard Drive to play songs from this device. Nothing is uploaded: the files stay in your browser.</p>'); return; }
      box.innerHTML = tracks.map((t, i) => `<button type="button" class="mus__row${i === cur ? ' cur' : ''}" data-nav data-i="${i}">${esc(t.name)}</button>`).join('');
      $$('.mus__row', box).forEach((b) => {
        b.addEventListener('mouseenter', () => setActive(b));
        b.addEventListener('click', () => { sfx('select'); play(+b.dataset.i); });
      });
    }
    function play(i) {
      cur = i;
      const t = tracks[i];
      if (!audio) {
        audio = new Audio();
        audio.addEventListener('ended', () => { if (tracks.length) play((cur + 1) % tracks.length); });
        if (Sound.ctx) {
          try {
            const src = Sound.ctx.createMediaElementSource(audio);
            analyser = Sound.ctx.createAnalyser(); analyser.fftSize = 128;
            src.connect(analyser); analyser.connect(Sound.ctx.destination);
          } catch (e) { analyser = null; }
        }
      }
      audio.src = t.url;
      audio.volume = S.volume;
      audio.play().catch(() => {});
      achieve('music');
      if (el) { $('.mus__now b', el).textContent = t.name; $('.mus__now span', el).textContent = 'Now Playing'; renderList(); }
    }
    function toggle() {
      if (!audio || cur < 0) { if (tracks.length) play(0); return; }
      if (audio.paused) audio.play().catch(() => {}); else audio.pause();
    }
    function draw() {
      cancelAnimationFrame(raf);
      const c = el && $('.mus__viz', el);
      if (!c) return;
      const g = c.getContext('2d'), w = c.width, h = c.height, n = 48;
      const data = new Uint8Array(analyser ? analyser.frequencyBinCount : n);
      const frame = () => {
        if (!el) return;
        if (analyser && audio && !audio.paused) analyser.getByteFrequencyData(data); else data.fill(0);
        g.clearRect(0, 0, w, h);
        const bw = w / n;
        for (let i = 0; i < n; i++) {
          const v = (data[i] || 0) / 255, bh = Math.max(4, v * h);
          g.fillStyle = `rgba(155, 226, 122, ${0.35 + v * 0.65})`;
          g.fillRect(i * bw + 2, h - bh, bw - 4, bh);
        }
        raf = requestAnimationFrame(frame);
      };
      frame();
    }
    function close() {
      if (!el) return;
      cancelAnimationFrame(raf);
      el.remove(); el = null;
      sfx('menu-out');
      Overlays.pop('music');
      const t = Overlays.api();
      if (t && t.refocus) t.refocus(); else focusDefault();
    }
    const api = {
      handle(a) {
        if (['left', 'right', 'up', 'down'].includes(a)) {
          const n = bestInDirection(rectCands(el), activeEl, a);
          if (n) { focusEl(n); sfx('hover'); }
          return true;
        }
        if (a === 'a') { if (activeEl && el.contains(activeEl)) activeEl.click(); return true; }
        if (a === 'b') { close(); return true; }
        if (a === 'x' || a === 'y') { toggle(); return true; }
        return true;
      },
      refocus() { focusEl($('.mus__src', el)); },
    };
    return { open, toggle, next: () => tracks.length && play((cur + 1) % tracks.length), prev: () => tracks.length && play((cur - 1 + tracks.length) % tracks.length), stop: () => { if (audio) { audio.pause(); audio.currentTime = 0; } }, label: () => (cur >= 0 && audio && !audio.paused ? tracks[cur].name : 'Select Music'), get playing() { return !!(audio && !audio.paused); } };
  })();

  /* ================= Running a game (DOOM) ================= */
  const gameLayer = $('#game');
  let running = null, playStart = 0, doomTimer = 0;
  async function launch(g) {
    if (!g) return;
    if (g.launch.kind === 'link') { openLink(g.launch.url, 'source'); store.set('recent', g.id); return; }
    sfx('select');
    store.set('recent', g.id);
    const played = store.get('played', {}); played[g.id] = Date.now(); store.set('played', played);
    if (g.id === 'doom') achieve('doom');
    await fakeLoading(700);
    running = g;
    gameLayer.hidden = false;
    gameLayer.innerHTML = `<iframe src="${g.launch.url}" title="${esc(g.title)}" allow="autoplay; fullscreen; gamepad"></iframe>`;
    const frame = $('iframe', gameLayer);
    frame.addEventListener('load', () => { try { frame.contentWindow.focus(); } catch (e) { /* cross-origin */ } });
    playStart = Date.now();
    clearInterval(doomTimer);
    if (g.id === 'doom') doomTimer = setInterval(() => { if (running && Date.now() - playStart > 5 * 60 * 1000) { achieve('doom10'); clearInterval(doomTimer); } }, 10000);
  }
  function quitGame(fromGuide) {
    if (!running) return;
    running = null;
    clearInterval(doomTimer);
    gameLayer.hidden = true;
    gameLayer.innerHTML = '';
    if (fromGuide) achieve('ragequit');
    if (!overlayOpen()) focusDefault();
  }
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || !e.data.x360) return;
    if (e.data.t === 'guide') Guide.toggle();
    if (e.data.t === 'close') quitGame();
  });

  async function fakeLoading(ms) {
    const L = $('#loading');
    L.hidden = false;
    await anim(L, [{ opacity: 0 }, { opacity: 1 }], 200, E.sineOut).finished;
    await wait(ms);
    anim(L, [{ opacity: 1 }, { opacity: 0 }], 260, E.cubicOut).finished.then(() => { L.hidden = true; });
  }

  /* ================= Xbox Guide ================= */
  const Guide = (() => {
    const layer = $('#guide'), canvas = $('.canvas', layer);
    let open_ = false, busy = false, tab = 2, sel = 0, screen = 'main', mediaFocus = 'list', transport = 1, bladeSound = 0;
    let achSel = 0, achDetail = false, frSel = 0, status = '', returnFocus = null, askOpen = false, askSel = 0;
    const NAMES = ['Games & Apps', ME.tag, 'Xbox Home', 'Media', 'Settings'];
    const placeholder = (name) => setStatus(`${name} is not connected yet`);
    const closeThen = (fn) => () => { close(false); fn(); };
    function items() {
      const trayGame = byId(S.tray) || byId('doom');
      switch (tab) {
        case 0: return [
          ['My Games', 'games', closeThen(() => Library.open('games'))],
          ['My Apps', 'apps', closeThen(() => Library.open('apps'))],
          ['Game Marketplace', 'bag', () => placeholder('Game Marketplace')],
          ['App Marketplace', 'bag', () => placeholder('App Marketplace')],
        ];
        case 1: return [
          ['Achievements', '', () => openScreen('achievements')],
          ['Awards', '', () => placeholder('Awards')],
          ['Recent', '', () => placeholder('Recent')],
          ['My Games', '', closeThen(() => Library.open('games'))],
          ['Active Downloads', '', () => placeholder('Active Downloads')],
          ['Redeem Code', '', () => placeholder('Redeem Code')],
        ];
        case 3: return [
          ['Video Player', '', null],
          ['Music Player', '', closeThen(() => Music.open())],
          ['Picture Viewer', '', null],
          ['Windows Media Center', '', null],
        ];
        case 4: return [
          ['System Settings', 'gear', closeThen(() => Settings.open())],
          ['Profile', 'person', closeThen(() => Profile.open())],
          ['Preferences', 'sliders', closeThen(() => Settings.open('dashboard'))],
          ['Turn Off', 'power', () => { close(false); powerOff(); }],
        ];
        default: return [
          ['Xbox Home', '', xboxHome],
          ['Friends', 'contact', () => openScreen('friends'), String(FRIENDS().length)],
          ['Party', 'people', () => placeholder('Party'), '0'],
          ['Inside Xbox', 'mail', () => placeholder('Inside Xbox'), '0'],
          ['Minimize', 'minimize', () => close(false)],
          ['Chat and IM', 'chat', () => placeholder('Chat and IM')],
          [trayGame.title, 'eject', () => { close(false); launch(trayGame); }],
        ];
      }
    }
    const FRIENDS = () => [
      { tag: 'GitHub', sub: 'github.com/hamzaaaaaf', status: 'Online: Shipping code', pic: 'github', url: LINKS.github, ach: 'source' },
      { tag: 'LeetCode', sub: 'leetcode.com/u/hamza57', status: `Online: ${lcSolved !== null ? `${lcSolved} problems solved` : 'Solving problems'}`, pic: 'leetcode', url: LINKS.leetcode, ach: 'leetcode' },
      { tag: 'LinkedIn', sub: 'Hamza Faisal', status: 'Online: Networking', pic: 'linkedin', url: LINKS.linkedin, ach: 'networker' },
      { tag: 'Message Hamza', sub: 'hello@byhamza.dev', status: 'Send a message', pic: 'mail', url: LINKS.mail, ach: 'messenger' },
    ];
    function clockText() { const d = new Date(); let h = d.getHours(); const ap = h < 12 ? 'AM' : 'PM'; h = h % 12 || 12; return `${h}:${String(d.getMinutes()).padStart(2, '0')}  ${ap}`; }
    function setStatus(t) { status = t; const s = $('.gd__status', canvas); if (s) s.textContent = t; }
    function build() {
      canvas.innerHTML = `<div class="gd">
        <div class="gd__title">Xbox Guide</div>
        <img class="gd__pic" src="${ME.pic}" alt="">
        <div class="gd__clock"></div>
        <div class="gd__wrap"><div class="gd__blade">
          <div class="gd__side gd__s0" data-rel="-2"><span></span></div>
          <div class="gd__side gd__s1" data-rel="-1"><span></span></div>
          <div class="gd__center"><div class="gd__list" role="menu"></div><div class="gd__media" hidden><button type="button" class="gd__song"></button><div class="gd__transport"></div></div></div>
          <div class="gd__side gd__s3" data-rel="1"><span></span></div>
          <div class="gd__side gd__s4" data-rel="2"><span></span></div>
        </div>
        <div class="gfoot gd__foot"><span class="h" data-act="a">${G('A')}Select</span><span class="h" data-act="b">${G('B')}Back</span><span class="h gd__x" data-act="x" hidden>${G('X')}<span class="gd__xt"></span></span></div></div>
        <div class="gd__status"></div>
        <div class="gd__over"></div>
      </div>`;
      $$('.gd__side', canvas).forEach((s) => s.addEventListener('click', () => moveTab(+s.dataset.rel)));
      $$('.gfoot .h', canvas).forEach((h) => h.addEventListener('click', () => handle(h.dataset.act)));
    }
    function paint(nudge) {
      $('.gd__clock', canvas).textContent = clockText();
      const tabText = (i) => (i < 0 || i >= NAMES.length ? '' : NAMES[i]);
      $('.gd__s0 span', canvas).textContent = tabText(tab - 2);
      $('.gd__s1 span', canvas).textContent = tabText(tab - 1);
      $('.gd__s3 span', canvas).textContent = tabText(tab + 1);
      $('.gd__s4 span', canvas).textContent = tabText(tab + 2);
      const list = $('.gd__list', canvas), its = items();
      list.innerHTML = its.map(([t, icon, , count], i) => `<button type="button" class="grow${i === sel && (tab !== 3 || mediaFocus === 'list') ? ' sel' : ''}" role="menuitem" data-i="${i}"><span>${esc(t)}</span><span class="cnt">${count ? esc(count) : ''}</span>${icon ? svg(icon) : '<span></span>'}</button>`).join('');
      $$('.grow', list).forEach((r) => {
        r.addEventListener('mouseenter', () => { if (+r.dataset.i !== sel || mediaFocus !== 'list') { sel = +r.dataset.i; mediaFocus = 'list'; paint(true); } });
        r.addEventListener('click', () => { sel = +r.dataset.i; mediaFocus = 'list'; activate(); });
      });
      if (nudge) { const s = $('.grow.sel', list); if (s) { s.classList.remove('nudge'); void s.offsetWidth; s.classList.add('nudge'); } }
      const media = $('.gd__media', canvas);
      media.hidden = tab !== 3;
      if (tab === 3) {
        const song = $('.gd__song', media);
        song.textContent = Music.label();
        song.classList.toggle('sel', mediaFocus === 'song');
        song.onclick = () => { mediaFocus = 'song'; activate(); };
        const ctrls = [['prev', () => Music.prev()], [Music.playing ? 'pause' : 'play', () => Music.toggle()], ['stop', () => Music.stop()], ['next', () => Music.next()], ['shuffle', () => {}], ['volume', () => {}]];
        $('.gd__transport', media).innerHTML = ctrls.map(([icon], i) => `<button type="button" class="${mediaFocus === 'transport' && i === transport ? 'sel' : ''}" data-i="${i}" aria-label="${icon}">${svg(icon)}</button>`).join('');
        $$('.gd__transport button', media).forEach((b) => b.addEventListener('click', () => { transport = +b.dataset.i; ctrls[transport][1](); sfx('guide-select'); setTimeout(() => paint(), 50); }));
      }
      const x = $('.gd__x', canvas);
      x.hidden = !running;
      $('.gd__xt', canvas).textContent = 'Close Game';
      $('.gd__status', canvas).textContent = status;
    }
    // GuideWindow.Open + BeginOpenAnimation.
    async function open(sub) {
      if (open_ || busy || booting) return;
      busy = true; open_ = true;
      returnFocus = activeEl;
      tab = 2; sel = 0; screen = 'main'; mediaFocus = 'list'; status = ''; askOpen = false;
      build(); paint();
      layer.hidden = false;
      if (running) { try { $('iframe', gameLayer).blur(); } catch (e) { /* ignore */ } window.focus(); }
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      sfx('guide-open');
      achieve('guide');
      const gd = $('.gd', canvas), center = [$('.gd__list', canvas), $('.gd__media', canvas)];
      const sides = $$('.gd__s0, .gd__s3, .gd__s4', canvas), user = $$('.gd__s1 span', canvas);
      anim(layer, [{ opacity: 0 }, { opacity: 1 }], 70, E.cubicOut);
      anim(gd, [{ transform: 'scale(.84)' }, { transform: 'scale(1)' }], 210, E.cubicOut);
      center.forEach((c) => anim(c, [{ opacity: 0 }, { opacity: 1 }], 145, E.sineOut, 285));
      user.forEach((u) => anim(u, [{ opacity: 0 }, { opacity: 1 }], 120, E.sineOut, 250));
      const last = sides.map((s) => anim(s, [{ opacity: 0 }, { opacity: 1 }], 145, E.sineOut, 430));
      if (sub) { busy = false; openScreen(sub, true); }
      await (last[0] ? last[0].finished : Promise.resolve());
      busy = false;
      if (open_) sfx('guide-blade-open');
    }
    // CloseGuide: 165 ms fade, content rising 10 px.
    function close(playSound = true, instant = false) {
      if (!open_) return;
      if (playSound) sfx('guide-close');
      open_ = false; busy = true;
      const gd = $('.gd', canvas);
      const done = () => {
        layer.hidden = true; canvas.innerHTML = ''; busy = false;
        if (running) { const f = $('iframe', gameLayer); if (f) try { f.contentWindow.focus(); } catch (e) { /* ignore */ } }
        else if (!overlayOpen() && returnFocus && document.contains(returnFocus)) focusEl(returnFocus);
        else if (!overlayOpen()) focusDefault();
      };
      if (instant) { done(); return; }
      anim(gd, [{ translate: '0 0' }, { translate: '0 -10px' }], 190, E.cubicIn);
      anim($('.gd__blade', canvas), [{ opacity: 1 }, { opacity: 0.72 }], 115, E.sineIn);
      anim(layer, [{ opacity: 1 }, { opacity: 0 }], 165, E.sineIn).finished.then(done);
    }
    function xboxHome() {
      if (running) { ask(); return; }
      close(false);
      while (overlayOpen()) { const t = Overlays.top(); if (t === 'library') Library.close(true, true); else { const a = Overlays.api(); a.handle('b'); } if (Overlays.top() === t) break; }
      goTab('home');
    }
    function ask() {
      askOpen = true; askSel = 0;
      const over = $('.gd__over', canvas);
      over.innerHTML = `<div class="ask"><b>Xbox Home</b><div><p>Are you sure you want to quit? Any unsaved progress will be lost.</p><button type="button" class="grow sel" data-a="1"><span>Yes</span><span></span><span></span></button><button type="button" class="grow" data-a="0"><span>No</span><span></span><span></span></button></div></div>`;
      $$('.ask .grow', over).forEach((b, i) => b.addEventListener('click', () => { askSel = i; answer(); }));
    }
    function answer() {
      askOpen = false;
      $('.gd__over', canvas).innerHTML = '';
      if (askSel === 0) { sfx('guide-select'); close(false, true); quitGame(true); goTab('home'); } else sfx('guide-back');
    }
    function moveTab(d) {
      if (screen !== 'main') return;
      const n = clamp(tab + d, 0, NAMES.length - 1);
      if (n === tab) return;
      tab = n; sel = 0; mediaFocus = 'list'; status = '';
      bladeSound = bladeSound % 4 + 1;
      sfx(`guide-blade-switch-${bladeSound}`);
      paint();
      const blade = $('.gd__blade', canvas);
      anim(blade, [{ opacity: 0.92 }, { opacity: 1 }], 130, E.sineOut);
      anim(blade, [{ translate: `${d > 0 ? 26 : -26}px 0` }, { translate: '0 0' }], 155, E.cubicOut);
    }
    function move(d) {
      const its = items();
      if (tab === 3) {
        if (mediaFocus === 'transport') { if (d < 0) { mediaFocus = 'song'; sfx('guide-hover'); paint(); } return; }
        if (mediaFocus === 'song') { mediaFocus = d > 0 ? 'transport' : 'list'; if (d < 0) sel = its.length - 1; sfx('guide-hover'); paint(); return; }
        if (d > 0 && sel >= its.length - 1) { mediaFocus = 'song'; sfx('guide-hover'); paint(); return; }
      }
      const n = clamp(sel + d, 0, its.length - 1);
      if (n !== sel) { sel = n; sfx('guide-hover'); paint(true); }
    }
    function activate() {
      if (tab === 3 && mediaFocus === 'song') { sfx('guide-select'); close(false); Music.open(); return; }
      if (tab === 3 && mediaFocus === 'transport') { const b = $$('.gd__transport button', canvas)[transport]; if (b) b.click(); return; }
      const it = items()[sel];
      if (!it || !it[2]) return;
      sfx('guide-select');
      it[2]();
    }

    /* ----- Achievements and Friends (community overlays) ----- */
    function openScreen(name, fromDashboard) {
      screen = name;
      if (name === 'achievements') { achDetail = false; achSel = 0; }
      if (name === 'friends') frSel = 0;
      const over = $('.gd__over', canvas);
      over.innerHTML = `<div class="gx__dim"></div><div class="gx gx--${name}"><div class="gx__head"></div><div class="gx__body"></div><div class="gfoot"></div></div>`;
      paintScreen();
      const gx = $('.gx', over);
      if (!reduced.matches) {
        anim(gx, [{ opacity: 0 }, { opacity: 1 }], 140, E.sineOut);
        anim(gx, [{ transform: 'translateY(-30px) scale(.93,.86)' }, { transform: 'translateY(0) scale(1)' }], 275, E.cubicOut);
        anim($('.gx__head', gx), [{ opacity: 0 }, { opacity: 1 }], 115, E.sineOut, 105);
        anim($('.gx__body', gx), [{ opacity: 0 }, { opacity: 1 }], 115, E.sineOut, 155);
        anim($('.gfoot', gx), [{ opacity: 0 }, { opacity: 1 }], 115, E.sineOut, 190);
      }
      void fromDashboard;
    }
    function closeScreen() {
      screen = 'main';
      $('.gd__over', canvas).innerHTML = '';
      sfx('guide-back');
      paint();
    }
    function paintScreen() {
      const gx = $('.gx', canvas);
      if (!gx) return;
      const head = $('.gx__head', gx), body = $('.gx__body', gx), foot = $('.gfoot', gx);
      if (screen === 'achievements') {
        head.innerHTML = `<span>Achievements</span><img src="${ME.pic}" alt=""><span>${clockText()}</span>`;
        const g = got(), n = ACHIEVEMENTS.filter((a) => g[a.id]).length;
        if (!achDetail) {
          body.innerHTML = `<button type="button" class="ach-game sel"><img src="${ME.pic}" alt=""><span><b>byhamza.dev</b><span>${n} of ${ACHIEVEMENTS.length} Achievements</span></span></button><div class="ach__foot"><span></span></div>`;
          $('.ach-game', body).addEventListener('click', () => { achDetail = true; achSel = 0; sfx('guide-select'); paintScreen(); });
          foot.innerHTML = `<span class="h" data-act="a">${G('A')}Select</span><span class="h" data-act="b">${G('B')}Back</span>`;
        } else {
          const a = ACHIEVEMENTS[achSel], on = !!g[a.id];
          body.innerHTML = `<div class="ach__top"><div><b>byhamza.dev</b><div class="a-t">${esc(on ? a.t : `${a.t}`)}</div><div class="a-d">${esc(a.d)}</div></div><div class="a-r">${on ? 'Unlocked' : 'Locked'} · ${a.g}G<span>${on ? new Date(g[a.id]).toLocaleDateString('en-US') : ''}</span></div></div>
            <div class="ach__grid"><div>${ACHIEVEMENTS.map((x, i) => `<button type="button" class="ach${g[x.id] ? '' : ' locked'}${i === achSel ? ' sel' : ''}" data-i="${i}" aria-label="${esc(x.t)}"><i>${g[x.id] ? svg('trophy', '0 0 30 32') : svg('lock', '0 0 36 32')}</i></button>`).join('')}</div></div>
            <div class="ach__foot"><b style="font-weight:400">${achSel + 1} of ${ACHIEVEMENTS.length} ${on ? 'unlocked' : 'locked'}</b><span>${gamerscore()} of 1000G</span></div>`;
          $$('.ach', body).forEach((b) => {
            b.addEventListener('mouseenter', () => { if (+b.dataset.i !== achSel) { achSel = +b.dataset.i; paintScreen(); } });
          });
          const row = Math.floor(achSel / 7), grid = $('.ach__grid > div', body);
          grid.style.transform = `translateY(${-Math.max(0, row - 2) * 104}px)`;
          foot.innerHTML = `<span class="h" data-act="a">${G('A')}Select</span><span class="h" data-act="b">${G('B')}Back</span>`;
        }
      } else if (screen === 'friends') {
        const fr = FRIENDS();
        head.innerHTML = `<span>Friends</span><img src="${ME.pic}" alt=""><span>${clockText()}</span>`;
        body.innerHTML = `<div class="fr__tabs"><div>${svg('people')}</div><div class="act">${svg('people')}Friends (${fr.length})</div><div>${svg('mail')}0</div><div>${svg('games')}0</div></div>
          <div class="fr__list">${fr.map((f, i) => `<button type="button" class="frow${i === frSel ? ' sel' : ''}" data-i="${i}"><span style="width:48px;height:48px;margin:2px 10px 2px 0;display:grid;place-items:center;background:${f.pic === 'linkedin' ? '#0a66c2' : f.pic === 'leetcode' ? '#ffa116' : f.pic === 'mail' ? 'var(--green)' : '#24292f'};border:1px solid #9ea8ad"><svg viewBox="0 0 24 24" style="width:30px;height:30px;fill:#fff"><path d="${P[f.pic]}"/></svg></span><span><b>${esc(f.tag)}</b><small>${esc(f.sub)}</small></span><span class="st">${svg('contact')}${esc(f.status)}</span></button>`).join('')}</div>
          <div class="fr__foot">Sorted by online status</div>`;
        $$('.frow', body).forEach((r) => {
          r.addEventListener('mouseenter', () => { if (+r.dataset.i !== frSel) { frSel = +r.dataset.i; paintScreen(); } });
          r.addEventListener('click', () => { frSel = +r.dataset.i; handle('a'); });
        });
        foot.innerHTML = `<span class="h" data-act="a">${G('A')}Select</span><span class="h" data-act="b">${G('B')}Back</span><span class="h" data-act="y">${G('Y')}Change Sort</span>`;
      }
      $$('.h', foot).forEach((h) => h.addEventListener('click', () => handle(h.dataset.act)));
    }
    function handleScreen(a) {
      if (screen === 'achievements') {
        if (!achDetail) {
          if (a === 'a') { achDetail = true; achSel = 0; sfx('guide-select'); paintScreen(); }
          else if (a === 'b') closeScreen();
          return true;
        }
        const n = ACHIEVEMENTS.length, col = achSel % 7;
        let i = achSel;
        if (a === 'left') i = Math.max(0, achSel - 1);
        if (a === 'right') i = Math.min(n - 1, achSel + 1);
        if (a === 'up') i = achSel - 7 < 0 ? col : achSel - 7;
        if (a === 'down') i = achSel + 7 >= n ? Math.min(Math.floor((n - 1) / 7) * 7 + col, n - 1) : achSel + 7;
        if (i !== achSel) { achSel = i; sfx('guide-hover'); paintScreen(); }
        if (a === 'b') { achDetail = false; sfx('guide-back'); paintScreen(); }
        return true;
      }
      if (screen === 'friends') {
        const fr = FRIENDS();
        if (a === 'up' || a === 'down') { const i = clamp(frSel + (a === 'up' ? -1 : 1), 0, fr.length - 1); if (i !== frSel) { frSel = i; sfx('guide-hover'); paintScreen(); } }
        if (a === 'a') { const f = fr[frSel]; sfx('guide-select'); if (f.ach) achieve(f.ach); if (f.url.startsWith('mailto:')) location.href = f.url; else window.open(f.url, '_blank', 'noopener'); }
        if (a === 'y') sfx('guide-select');
        if (a === 'b') closeScreen();
        return true;
      }
      return false;
    }
    function handle(a) {
      if (busy && a !== 'guide') return true;
      if (askOpen) {
        if (a === 'up' || a === 'down') { askSel = askSel ? 0 : 1; $$('.ask .grow', canvas).forEach((b, i) => b.classList.toggle('sel', i === askSel)); sfx('guide-hover'); }
        if (a === 'a') answer();
        if (a === 'b') { askSel = 1; answer(); }
        return true;
      }
      if (a === 'guide') { close(); return true; }
      if (screen !== 'main') return handleScreen(a);
      if (a === 'up') move(-1);
      else if (a === 'down') move(1);
      else if (a === 'left' || a === 'right') {
        if (tab === 3 && mediaFocus === 'transport') { transport = clamp(transport + (a === 'left' ? -1 : 1), 0, 5); sfx('guide-hover'); paint(); }
        else moveTab(a === 'left' ? -1 : 1);
      } else if (a === 'lb') moveTab(-1);
      else if (a === 'rb') moveTab(1);
      else if (a === 'a') activate();
      else if (a === 'b') close();
      else if (a === 'x' && running) ask();
      return true;
    }
    function toggle() { if (open_) close(); else open(); }
    setInterval(() => { if (open_) { const c = $('.gd__clock', canvas); if (c) c.textContent = clockText(); } }, 10000);
    return { open, close, toggle, handle, get isOpen() { return open_; } };
  })();

  /* ================= Power ================= */
  let booting = true;
  function powerOff() {
    achieve('lightsout');
    sfx('select');
    setTimeout(() => {
        if (running) quitGame(false);
      booting = true;
      const gate = $('#gate');
      gate.hidden = false;
      gate.style.opacity = 0;
      anim(gate, [{ opacity: 0 }, { opacity: 1 }], 600, E.sineOut);
      $('#dash').style.visibility = 'hidden';
      gateWaiting = true;
    }, 250);
  }

  /* ================= Input ================= */
  let bCount = 0, bTimer = 0;
  function act(a) {
    if (gateWaiting) { startFromGate(); return; }
    if (bootSkippable) { skipBoot(); return; }
    if (booting) return;
    if (a === 'guide') { Guide.toggle(); return; }
    if (Guide.isOpen) { Guide.handle(a); return; }
    if (running) return;
    const top = Overlays.api();
    if (top) { top.handle(a); return; }
    dashboard(a);
  }
  // HandleInputActionCore for the dashboard itself.
  function dashboard(a) {
    const dirs = ['left', 'right', 'up', 'down'];
    if (animatingTab && ['left', 'right', 'lb', 'rb'].includes(a)) { queuedStep = a === 'left' || a === 'lb' ? -1 : 1; return; }
    if (a === 'lb' || a === 'rb') { moveTab(a === 'lb' ? -1 : 1); sfx('focus'); return; }
    if (dirs.includes(a)) {
      const cands = pageCands();
      let cur = document.activeElement && document.activeElement.closest && document.activeElement.closest('.t, [data-nav]');
      if (!cur || !cands.some((c) => c.el === cur)) cur = null;
      if (!cur) { focusDefault(); sfx('focus'); return; }
      const n = bestInDirection(cands, cur, a);
      if (n) { focusEl(n); lastFocus[curTab()] = n; }
      else if (a === 'left') moveTab(-1);
      else if (a === 'right') moveTab(1);
      sfx('focus');
      return;
    }
    if (a === 'a') {
      const cur = document.activeElement && document.activeElement.closest && document.activeElement.closest('.t, [data-nav]');
      if (cur && curPage().contains(cur)) activateTile(cur); else focusDefault();
      return;
    }
    if (a === 'x') { Details.open(recentGame()); return; }
    if (a === 'y') { Search.open(); return; }
    if (a === 'b') {
      bCount++; clearTimeout(bTimer); bTimer = setTimeout(() => { bCount = 0; }, 1500);
      if (bCount >= 3) achieve('persistent');
    }
  }

  // Keyboard (DashboardInputRouter).
  const KEYS = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
    KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down',
    Enter: 'a', Space: 'a', Escape: 'b', Backspace: 'b', KeyB: 'b',
    KeyX: 'x', KeyY: 'y', KeyF: 'y', KeyQ: 'lb', PageUp: 'lb', KeyE: 'rb', PageDown: 'rb',
    Home: 'guide', KeyG: 'guide', F1: 'guide',
  };
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target, typing = t && t.tagName === 'INPUT' && t.type !== 'file';
    if (typing) {
      if (e.key === 'Escape') { e.preventDefault(); t.blur(); if (t.closest('.bing__box')) focusEl(t.closest('.bing__box')); else act('b'); }
      if (e.key === 'Enter' && t.closest('.bing__box')) { e.preventDefault(); if (bingSearch(t.value)) t.value = ''; }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && t.closest('.bing__box')) { e.preventDefault(); t.blur(); act(e.key === 'ArrowDown' ? 'down' : 'up'); }
      if (['PageUp', 'PageDown', 'F1'].includes(e.code) && t.closest('.bing__box')) { e.preventDefault(); t.blur(); act(KEYS[e.code]); }
      return;
    }
    // Typing on the bing tab goes straight into the search box.
    if (!gateWaiting && !booting && !running && curTab() === 'bing' && !overlayOpen() && !Guide.isOpen && e.key.length === 1 && /\S/.test(e.key)) { focusBingInput(); return; }
    const a = KEYS[e.code];
    if (gateWaiting || bootSkippable) { e.preventDefault(); act('a'); return; }
    if (!a) return;
    e.preventDefault();
    if (e.repeat && !['left', 'right', 'up', 'down'].includes(a)) return;
    inputMode = 'key'; setPadMode(true);
    act(a);
  });

  // Mouse: hover makes a tile active, a click activates it.
  function wirePage(page) {
    $$('.t', page).forEach((b) => {
      b.addEventListener('mousemove', () => { if (activeEl !== b && !animatingTab) { inputMode = 'mouse'; setPadMode(false); setActive(b); } });
      b.addEventListener('mouseleave', () => { if (activeEl === b && inputMode === 'mouse') setActive(null); });
      b.addEventListener('click', () => { if (animatingTab) return; focusEl(b); lastFocus[curTab()] = b; activateTile(b); });
    });
    const box = $('.bing__box', page);
    if (box) {
      box.addEventListener('mousedown', (e) => { if (e.target.tagName !== 'INPUT') { e.preventDefault(); focusBingInput(); } });
      $('input', box).addEventListener('focus', () => setActive(box));
    }
  }
  Object.values(pageEls).forEach(wirePage);
  tabBtns.forEach((b) => b.addEventListener('click', () => { if (!overlayOpen()) moveTab(+b.dataset.i - tabIndex); }));
  $('.peek-hit--l').addEventListener('click', () => { if (!overlayOpen()) moveTab(-1); });
  $('.peek-hit--r').addEventListener('click', () => { if (!overlayOpen()) moveTab(1); });
  $('.me [data-guide]').addEventListener('click', () => act('guide'));
  dashCanvas.addEventListener('click', (e) => { const h = e.target.closest('[data-act]'); if (h && !e.target.closest('.t, .dbtn, [data-nav]')) { const a = h.dataset.act; if (a === 'y' && !overlayOpen()) Search.open(); else if (a === 'b') act('b'); } });
  $('#guide').addEventListener('click', (e) => { if (e.target === $('#guide') || e.target === $('#guide .canvas') || e.target.classList.contains('gd')) Guide.close(); });

  // Wheel and swipe change tabs.
  let wheelAt = 0;
  addEventListener('wheel', (e) => {
    if (booting || Guide.isOpen || overlayOpen() || running) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12 || performance.now() - wheelAt < 450) return;
    wheelAt = performance.now();
    moveTab(d > 0 ? 1 : -1);
  }, { passive: true });
  let touch = null;
  addEventListener('touchstart', (e) => { touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (!touch || booting || Guide.isOpen || running) return;
    const p = e.changedTouches[0], dx = p.clientX - touch.x, dy = p.clientY - touch.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - touch.t < 600) {
      const top = Overlays.api();
      if (top) top.handle(dx < 0 ? 'rb' : 'lb'); else moveTab(dx < 0 ? 1 : -1);
    }
    touch = null;
  }, { passive: true });

  /* ----- Controllers (ControllerInputService) ----- */
  const NAMES = ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt', 'back', 'start', 'ls', 'rs', 'up', 'down', 'left', 'right', 'guide'];
  const RAW = {
    sony: { 0: 'x', 1: 'a', 2: 'b', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 10: 'ls', 11: 'rs', 12: 'guide' },
    nintendo: { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 10: 'ls', 11: 'rs', 12: 'guide' },
    generic: { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 10: 'ls', 11: 'rs', 12: 'up', 13: 'down', 14: 'left', 15: 'right', 16: 'guide' },
  };
  const brandOf = (id) => {
    const s = id.toLowerCase();
    if (/054c|sony|dualshock|dualsense|wireless controller|playstation/.test(s)) return 'sony';
    if (/057e|nintendo|pro controller|joy-con/.test(s)) return 'nintendo';
    return /045e|xbox|xinput|microsoft/.test(s) ? 'xbox' : 'generic';
  };
  const DEAD = 16000 / 32767, REPEAT = 185;
  function readPad(p) {
    const st = { brand: brandOf(p.id), lx: p.axes[0] || 0, ly: p.axes[1] || 0, rx: 0, ry: 0, lt: 0, rt: 0 };
    NAMES.forEach((n) => { st[n] = false; });
    const val = (b) => (b ? (typeof b === 'object' ? (b.pressed ? Math.max(b.value, 1) : b.value) : b) : 0);
    if (p.mapping === 'standard') {
      p.buttons.forEach((b, i) => { if (NAMES[i]) st[NAMES[i]] = val(b) > 0.5; });
      st.lt = val(p.buttons[6]); st.rt = val(p.buttons[7]);
      st.rx = p.axes[2] || 0; st.ry = p.axes[3] || 0;
    } else {
      const map = RAW[st.brand] || RAW.generic;
      p.buttons.forEach((b, i) => { const n = map[i]; if (n && val(b) > 0.5) st[n] = true; });
      st.lt = st.lt ? 1 : 0; st.rt = st.rt ? 1 : 0;
      if (st.brand === 'sony' && p.axes.length >= 6) { st.rx = p.axes[2]; st.ry = p.axes[5]; st.lt = Math.max(st.lt, (p.axes[3] + 1) / 2); st.rt = Math.max(st.rt, (p.axes[4] + 1) / 2); }
      else { st.rx = p.axes[2] || 0; st.ry = p.axes[3] || 0; }
      const hat = p.axes.length > 9 ? p.axes[9] : null;
      if (hat !== null && hat >= -1.01 && hat <= 1.01) {
        const pos = Math.round((hat + 1) * 3.5);
        if (pos >= 0 && pos <= 7) { st.up = [0, 1, 7].includes(pos); st.right = [1, 2, 3].includes(pos); st.down = [3, 4, 5].includes(pos); st.left = [5, 6, 7].includes(pos); }
      }
    }
    return st;
  }
  const prev = {}, lastMove = {};
  let padLoop = 0, chordDown = false;
  function padTick() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter((p) => p && p.connected !== false) : [];
    if (!pads.length) { padLoop = 0; return; }
    padLoop = requestAnimationFrame(padTick);
    const all = pads.map(readPad), st = { ...all[0] };
    for (const s of all.slice(1)) { NAMES.forEach((n) => { st[n] = st[n] || s[n]; }); ['lx', 'ly', 'rx', 'ry'].forEach((k) => { if (Math.abs(s[k]) > Math.abs(st[k])) st[k] = s[k]; }); st.lt = Math.max(st.lt, s.lt); st.rt = Math.max(st.rt, s.rt); }
    const brands = all.map((s) => s.brand);
    // While a game runs it gets the raw pad; only the Guide button reaches the dashboard.
    if (running && !Guide.isOpen) {
      const f = $('iframe', gameLayer);
      if (f && f.contentWindow) f.contentWindow.postMessage({ doompad: { lx: st.lx, ly: st.ly, rx: st.rx, ry: st.ry, lt: st.lt, rt: st.rt, a: st.a, b: st.b, x: st.x, y: st.y, lb: st.lb, rb: st.rb, start: st.start, back: st.back, du: st.up, dd: st.down, dl: st.left, dr: st.right } }, location.origin);
      if ((st.guide && !prev.guide) || (st.back && st.start && !chordDown)) Guide.open();
      chordDown = st.back && st.start;
      NAMES.forEach((n) => { prev[n] = st[n]; });
      return;
    }
    if (!S.pad && !gateWaiting && !bootSkippable) { NAMES.forEach((n) => { prev[n] = st[n]; }); return; }
    const press = (a) => {
      if (!gateWaiting && !bootSkippable) {
        inputMode = 'pad'; setPadMode(true); achieve('tidy');
        if (brands.some((b) => b === 'sony' || b === 'nintendo')) achieve('crossplay');
      }
      act(a);
    };
    // Back + Start together opens the Guide (DashX360's chord), as does the Guide / PS / Home button.
    if (st.back && st.start) {
      if (!chordDown) press('guide');
      chordDown = true;
      NAMES.forEach((n) => { prev[n] = st[n]; });
      return;
    }
    chordDown = false;
    const now = performance.now();
    const stickDir = Math.abs(st.lx) > DEAD || Math.abs(st.ly) > DEAD ? (Math.abs(st.lx) >= Math.abs(st.ly) ? (st.lx > 0 ? 'right' : 'left') : (st.ly > 0 ? 'down' : 'up')) : null;
    for (const d of ['up', 'down', 'left', 'right']) {
      const on = st[d] || stickDir === d;
      if (on && !prev[`dir_${d}`]) { lastMove[d] = now; press(d); }
      else if (on && now - lastMove[d] >= REPEAT) { lastMove[d] = now; press(d); }
      prev[`dir_${d}`] = on;
    }
    const fire = (btn, a) => { if (st[btn] && !prev[btn]) press(a); };
    fire('a', 'a'); fire('b', 'b'); fire('x', 'x'); fire('y', 'y');
    fire('back', 'b'); fire('lb', 'lb'); fire('rb', 'rb'); fire('guide', 'guide');
    if (st.lt > 0.47 && !prev.ltOn) press('lt');
    if (st.rt > 0.47 && !prev.rtOn) press('rt');
    prev.ltOn = st.lt > 0.47; prev.rtOn = st.rt > 0.47;
    NAMES.forEach((n) => { prev[n] = st[n]; });
  }
  const startPad = () => { if (!padLoop) padLoop = requestAnimationFrame(padTick); };
  addEventListener('gamepadconnected', startPad);
  if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) startPad();

  /* ================= Live data ================= */
  let lcSolved = null;
  function fillLive() {
    $$('[data-live="lc"]').forEach((el) => { el.textContent = lcSolved === null ? '·' : lcSolved; });
  }
  getJSON('/api/leetcode').catch(() => getJSON('/leetcode.json')).then((d) => { lcSolved = d && d.solved ? d.solved.All : null; fillLive(); }).catch(() => {});
  getJSON('/api/github').catch(() => getJSON('/github.json')).then((d) => {
    const n = d && d.repos ? d.repos.length : 0;
    if (n) $$('[data-live="gh"]').forEach((el) => { el.textContent = `${n} public repos`; });
  }).catch(() => {});

  /* ================= Clocks ================= */
  function tickClock() {
    const d = new Date();
    $$('[data-clock24]').forEach((el) => { el.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; });
  }
  setInterval(tickClock, 15000);

  /* ================= Startup: gate, boot video, fake loading, sign-in ================= */
  let gateWaiting = true, bootSkippable = false, bootEnded = null;
  const gate = $('#gate'), bootEl = $('#boot'), video = $('video', bootEl);
  gate.addEventListener('click', () => act('a'));
  bootEl.addEventListener('click', () => act('a'));

  function startFromGate() {
    gateWaiting = false;
    Sound.unlock();
    gate.hidden = true;
    gate.style.opacity = '';
    $('#dash').style.visibility = '';
    runStartup();
  }
  async function runStartup() {
    booting = true;
    setActive(null);
    host.style.opacity = 0;
    const mode = S.startup;
    if (mode === 'video') {
      bootEl.hidden = false;
      bootSkippable = true;
      try { video.currentTime = 0; } catch (e) { /* not loaded */ }
      const ended = new Promise((r) => { bootEnded = r; });
      video.onended = () => bootEnded && bootEnded();
      const p = video.play();
      if (p && p.catch) p.catch(() => bootEnded && bootEnded());
      const t = setTimeout(() => bootEnded && bootEnded(), 12000);
      await ended;
      clearTimeout(t);
      bootSkippable = false;
      video.pause();
    }
    bootEl.hidden = true;
    if (mode !== 'video') await Promise.race([Sound.loaded, wait(1500)]);
    await enterDashboard(mode === 'video' || (mode === 'loading' && S.loading));
  }
  function skipBoot() {
    if (!bootSkippable) return;
    bootSkippable = false;
    Sound.stop('startup');
    if (bootEnded) bootEnded();
  }
  // RunFakeLoadingSequenceAsync: ring for 1150 ms, then the dashboard settles in.
  async function enterDashboard(withLoading) {
    const L = $('#loading');
    if (withLoading && S.loading) {
      L.hidden = false; L.style.opacity = 1;
      $('.ring', L).style.opacity = 1;
      await wait(1150);
      await anim($('.ring', L), [{ opacity: 1 }, { opacity: 0 }], 120).finished;
      await wait(40);
    }
    sfx('startup');
    paintTabs();
    renderPeeks();
    anim(host, [{ opacity: 0, transform: 'translateY(18px) scale(.965)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], 470, E.cubicOut);
    if (!L.hidden) anim(L, [{ opacity: 1 }, { opacity: 0 }], 520, E.cubicOut).finished.then(() => { L.hidden = true; $('.ring', L).style.opacity = ''; });
    await wait(470);
    host.style.opacity = '';
    booting = false;
    focusDefault();
    await wait(120);
    toast(`${ME.tag} signed`, 'in to Xbox LIVE');
    signedIn();
  }
  function signedIn() {
    achieve('hello');
    if (new Date().getHours() < 5) achieve('nightowl');
    const day = new Date().toDateString(), days = new Set(store.get('days', []));
    days.add(day); store.set('days', [...days].slice(-10));
    if (days.size >= 3) achieve('regular');
    setTimeout(() => achieve('longhaul'), 10 * 60 * 1000);
    visit(curTab());
  }

  /* ================= Deep links ================= */
  function route() {
    // Old addresses redirect to /?to=<screen> (see public/_redirects); hashes work too.
    const q = new URLSearchParams(location.search).get('to');
    if (q) history.replaceState(null, '', `/#${q}`);
    const h = location.hash.slice(1).toLowerCase();
    if (!h) return;
    const tabI = TABS.findIndex((t) => t.k === h);
    if (tabI >= 0) { tabIndex = tabI; return; }
    const after = () => {
      if (h === 'profile' || h === 'about') Profile.open();
      else if (h === 'games' || h === 'mygames' || h === 'projects' || h === 'work') Library.open('games');
      else if (h === 'apps' || h === 'myapps') Library.open('apps');
      else if (h === 'settings') Settings.open();
      else if (h === 'achievements') Guide.open('achievements');
      else if (byId(h)) Details.open(byId(h));
    };
    const wait_ = setInterval(() => { if (!booting) { clearInterval(wait_); setTimeout(after, 400); } }, 100);
  }

  /* ================= Go ================= */
  applyColour();
  refreshScore();
  route();
  paintTabs();
  renderPeeks();
})();
