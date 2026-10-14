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
    email: 'hello@byhamza.dev',
    source: 'https://github.com/hamzaaaaaf/portfolio-website',
    dashx360: 'https://github.com/ZivvoZ/dashx360',
  };
  const ME = {
    tag: 'Hamza',
    pic: '/assets/gamerpics/hamza.webp',
    motto: 'Turning curious ideas into real software.',
    short: 'Second-year Computer Science student at Aston University in Birmingham.',
  };
  const A = '/assets/';
  // A click on a project goes straight to its page.
  const PROJECTS = [
    { title: 'Panic Pack!', line: 'A first-person race to pack before your taxi arrives. Godot 4.', url: 'https://github.com/hamzaaaaaf/panic-pack-/releases/tag/v0.1.0' },
    { title: 'Instagram Unliker', line: 'A browser script that unlikes Instagram posts in bulk. JavaScript.', url: 'https://github.com/hamzaaaaaf/instagram-post-unliker' },
    { title: 'byhamza.dev', line: 'This site: the Xbox 360 dashboard, rebuilt for the web.', url: LINKS.source },
  ];
  const ABOUT = [
    'I’m Hamza, a second-year Computer Science student at Aston University in Birmingham. I like turning curious ideas into real software.',
    'My first console was an Xbox 360, so this site is built like its dashboard.',
  ];
  const FACTS = [['Studying', 'BSc Computer Science'], ['Based in', 'Birmingham, UK'], ['Languages', 'Python, Java, JavaScript'], ['Off the clock', 'Games and horror films']];
  const EDUCATION = [
    { place: 'Aston University', what: 'BSc Computer Science', when: '2025 to now' },
    { place: 'LACAS', what: 'A-levels', when: '' },
  ];
  const STACK = [
    ['Python', 'Side projects and scripts'], ['Java', 'Uni modules and OOP'], ['JavaScript', 'This site and the Unliker'], ['HTML & CSS', 'Hand-built, no framework'],
    ['Godot 4', 'Panic Pack!, in GDScript'], ['Cloudflare Workers', 'Hosting and the live stats'], ['SQL', 'Databases'], ['Git & GitHub', 'Every project'],
  ];
  // Oldest first.
  const GAMES = [
    ['Crash of the Titans', 2007], ['Spider-Man 3', 2007], ['Batman: Arkham Asylum', 2009], ['Batman: Arkham City', 2011], ['Minecraft', 2011],
    ['The Amazing Spider-Man', 2012], ['Batman: Arkham Origins', 2013], ['Grand Theft Auto V', 2013], ['The Amazing Spider-Man 2', 2014],
    ['Batman: Arkham Knight', 2015], ['Rocket League', 2015], ['Uncharted 4', 2016], ['Fortnite', 2017], ['Friday the 13th: The Game', 2017],
    ['Call of Duty: Warzone', 2020], ['Valorant', 2020],
  ].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  const JOURNEY = [['Xbox 360', 'Where it started'], ['PSP', ''], ['PS4', ''], ['PC', 'Now']];
  const SUMMER = [['Played', 'Valorant'], ['Watched', 'Stranger Things'], ['Listened to', 'SOUR by Olivia Rodrigo']];
  const ORIGIN = { title: 'Batman: Arkham Asylum', year: 2009, art: `${A}themes/batman_arkham_asylum/home.webp`, text: 'The game that got me into gaming. I’ve played every Arkham game since: City, Origins and Knight.' };

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
    ['about', 'Gamercard', 'Read About Me.', 10],
    ['education', 'Back to school', 'Look at Hamza’s education.', 10],
    ['stack', 'Full stack', 'Look at Hamza’s tech stack.', 10],
    ['stats', 'By the numbers', 'Open Stats.', 20],
    ['projects', 'Portfolio', 'Open All Projects.', 20],
    ['source', 'Open source', 'Open one of Hamza’s projects.', 10],
    ['leetcode', 'Grinding', 'Open Hamza’s LeetCode.', 10],
    ['networker', 'Networker', 'Open Hamza’s LinkedIn.', 10],
    ['messenger', 'Messenger', 'Copy Hamza’s email address or open it in your mail app.', 35],
    ['friends', 'Friends list', 'Open Friends.', 50],
    ['origin', 'Where it all began', 'Find the game that got Hamza into gaming.', 20],
    ['journey', 'Generations', 'Look at Hamza’s console journey.', 20],
    ['gamer', 'Player two', 'See the games Hamza plays.', 20],
    ['valorant', 'Ranked', 'Check Hamza’s Valorant rank.', 30],
    ['trophies', 'Trophy hunter', 'Open PlayStation.', 30],
    ['steam', 'Full steam ahead', 'Open Steam.', 30],
    ['summer', 'Summer of 2022', 'Find Hamza’s best summer.', 40],
    ['critic', 'Critic', 'Open Recently Watched.', 20],
    ['cinephile', 'Cinephile', 'Open Favourite Films.', 30],
    ['tray', 'No disc', 'Open the disc tray.', 15],
    ['colour', 'Paint job', 'Change the tile color.', 30],
    ['themes', 'Interior designer', 'Change the dashboard theme.', 30],
    ['sysset', 'Under the hood', 'Open System Settings.', 20],
    ['tidy', 'Plug and play', 'Navigate with a controller.', 75],
    ['crossplay', 'Cross-platform', 'Use a PlayStation or Nintendo controller.', 75],
    ['explorer', 'Explorer', 'Visit every tab on the dashboard.', 75],
    ['nightowl', 'Night owl', 'Turn on the console between midnight and 5am.', 50],
    ['longhaul', 'Dedicated', 'Keep the console on for ten minutes.', 60],
    ['regular', 'Regular', 'Turn on the console on three different days.', 55],
    ['lightsout', 'Lights out', 'Turn off the console.', 30],
    ['persistent', 'Persistent', 'Press B on the dashboard three times.', 30],
  ].map(([id, t, d, g]) => ({ id, t, d, g }));

  /* ================= Settings ================= */
  const DEFAULTS = { sounds: true, pad: true, startup: 'video', loading: true, volume: 1, theme: 'default', colour: '#028d02' };
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
    gear: 'M10.3 2h3.4l.5 2.6 1.8.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.8 2.6.5v3.4l-2.6.5-.8 1.8 1.5 2.2-2.4 2.4-2.2-1.5-1.8.8-.5 2.6h-3.4l-.5-2.6-1.8-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.8L2 13.7v-3.4l2.6-.5.8-1.8-1.5-2.2 2.4-2.4 2.2 1.5 1.8-.8ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
    person: 'M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 12c5 0 9 2.5 9 6v2H3v-2c0-3.5 4-6 9-6Z',
    sliders: 'M3 5h10v2H3Zm14 0h4v2h-4Zm-2-2h2v6h-2ZM3 11h4v2H3Zm8 0h10v2H11ZM9 9h2v6H9Zm-6 8h12v2H3Zm16 0h2v2h-2Zm-2-2h2v6h-2Z',
    power: 'M11 2h2v10h-2Zm-4.4 3.4 1.4 1.4a6 6 0 1 0 8 0l1.4-1.4A8 8 0 1 1 6.6 5.4Z',
    minimize: 'M4 11h16v2H4Z',
    eject: 'M12 4 21 15H3Zm-9 13h18v3H3Z',
    people: 'M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM9 13c4.4 0 7 2 7 5v3H2v-3c0-3 2.6-5 7-5Zm8.5.5c3 .3 5.5 1.8 5.5 4.5v3h-5v-3c0-1.7-.2-3.2-.5-4.5Z',
    mail: 'M2 5h20v14H2Zm2 2v.5l8 5.5 8-5.5V7Zm0 2.9V17h16V9.9l-8 5.5Z',
    contact: 'M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.4 0 8 2 8 5v3H4v-3c0-3 3.6-5 8-5Z',
    trophy: 'M8,2 L22,2 L20,17 C19,22 16,25 15,25 C14,25 11,22 10,17 M3,5 L8,5 L8,9 L5,9 C4,9 4,10 4,11 C4,14 6,16 9,16 L10,20 C4,19 0,15 0,10 C0,7 1,5 3,5 M22,5 L27,5 C29,5 30,7 30,10 C30,15 26,19 20,20 L21,16 C24,16 26,14 26,11 C26,10 26,9 25,9 L22,9 M12,25 L18,25 L18,29 L23,29 L23,32 L7,32 L7,29 L12,29',
    lock: 'M8,14 L8,10 C8,4 12,0 18,0 C24,0 28,4 28,10 L28,14 L24,14 L24,10 C24,6 22,4 18,4 C14,4 12,6 12,10 L12,14 M4,14 L32,14 L32,32 L4,32',
    github: 'M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z',
    leetcode: 'M13.5 2 5.7 10.3a3.4 3.4 0 0 0 0 4.7l4.3 4.6a3.4 3.4 0 0 0 4.8.2l2.4-2.3-1.4-1.5-2.4 2.3a1.4 1.4 0 0 1-2-.1L7.2 13.6a1.4 1.4 0 0 1 0-1.9l7.8-8.3ZM10 12.5h10v2H10Z',
    linkedin: 'M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM2.3 8.5h3.4V21H2.3Zm6 0h3.3v1.7c.5-.9 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8V21h-3.4v-6.2c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V21H8.3Z',
    layers: 'M12 2 22 7l-10 5L2 7Zm-7.6 8.3L12 14l7.6-3.7L22 11.5 12 16.5 2 11.5Zm0 4.5L12 18.5l7.6-3.7L22 16 12 21 2 16Z',
    film: 'M3 9h18v11H3Zm0-5.6 16.8-3 .7 3.6-16.8 3Z',
    cap: 'M12 3 1 8.5 12 14l9-4.5V16h2V8.5ZM5 12.2V16c0 2 3.1 3.5 7 3.5s7-1.5 7-3.5v-3.8L12 15.7Z',
    info: 'M10.5 4h3v3h-3Zm0 5h3v11h-3Z',
  };
  const svg = (name, vb = '0 0 24 24', cls = '') => `<svg viewBox="${vb}"${cls ? ` class="${cls}"` : ''} aria-hidden="true"><path d="${P[name]}"/></svg>`;
  // Controller button glyphs: a glossy disc with the letter drawn as strokes,
  // so it sits dead centre whatever font the browser picks.
  const GLYPHS = {
    a: 'M6.5 14.9 10 5.1l3.5 9.8M7.7 11.6h4.6',
    b: 'M7.4 14.9V5.1h3a2.4 2.4 0 0 1 0 4.8H7.4h3.4a2.5 2.5 0 0 1 0 5Z',
    x: 'M6.8 5.1l6.4 9.8M13.2 5.1l-6.4 9.8',
    y: 'M6.6 5.1 10 10.1l3.4-5M10 10.1v4.8',
  };
  const G = (letter) => { const l = letter.toLowerCase(); return `<i class="g g--${l}" role="img" aria-label="${letter}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="${GLYPHS[l]}"/></svg></i>`; };

  /* ================= Dashboard markup ================= */
  // The 2011 dashboard had eight tabs; this one keeps the seven a portfolio needs.
  const TABS = ['home', 'about', 'projects', 'games', 'movies', 'social', 'settings'].map((k) => ({ k }));

  const px = (o) => Object.entries(o).map(([k, v]) => `${k}:${typeof v === 'number' ? `${v}px` : v}`).join(';');
  const tile = (id, x, y, w, h, inner, { label = '', bg = '', cls = '', def = false } = {}) =>
    `<button class="t${cls ? ` ${cls}` : ''}" data-t="${id}"${def ? ' data-default' : ''} data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" style="${px({ left: x, top: y, width: w, height: h })}" aria-label="${esc(label)}"><span class="f"${bg ? ` style="background:${bg}"` : ''}>${inner}</span></button>`;
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
  // A white glyph centred above the label, for tiles without artwork.
  const glyph = (name, w, h, size = 50, vb) => `<span class="abs tile__glyph" style="${px(icoBox(w, h, size, size, { mt: -24 }))}">${svg(name, vb)}</span>`;
  const label = (t, size = 17) => tx(t, { left: 12, right: 10, bottom: 10, 'font-size': size });
  // Picture tile: artwork, a darkening gradient and a title bar.
  const picture = (src, title, sub = '') => `${fill(src)}${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,.12) 55%,rgba(0,0,0,.7) 100%')}${bar(sub ? 48 : 30, 'rgba(0,0,0,.79)')}${sub ? tx(title, { left: 10, right: 10, bottom: 22, 'font-size': 18 }) + tx(sub, { left: 10, right: 10, bottom: 5, 'font-size': 13, color: 'rgba(255,255,255,.78)' }) : tx(title, { left: 8, right: 8, bottom: 6, 'font-size': 17 })}`;
  // Text that fills in once the live stats arrive (see fillLive).
  const live = (key, fallback = '', cls = '') => `<span${cls ? ` class="${cls}"` : ''} data-live="${key}">${esc(fallback)}</span>`;
  const livePic = (key, style = '') => `<img class="fill" data-live-src="${key}" alt="" draggable="false" hidden${style ? ` style="${style}"` : ''}>`;
  const LINKEDIN = `<span class="logo" style="display:flex;align-items:center;gap:3px;font-size:30px;font-weight:700;color:#0a66c2;letter-spacing:-.5px">Linked<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:5px;background:#0a66c2;color:#fff;font-size:26px">in</span></span>`;
  const VAL_BG = grad('#ff5a63 0%,#d1323e 45%,#5a1016 100%');

  // The Open Tray tile, as on a console with no disc in the drive.
  let trayOpen = false;
  const trayLabel = () => (trayOpen ? 'Close Tray' : 'Open Tray');
  function pageHome() {
    const fx = 224, fy = 31;
    return `<div class="page" data-tab="home">
      ${tile('home.tray', fx, fy, 185, 131, `${img(`${A}icons/disc-tray.webp`, { left: 55.5, top: 14, width: 74, height: 74 }, 'ico tray__ico')}${tx(trayLabel(), { left: 13, bottom: 10, 'font-size': 18 }, ' tray__t')}`, { label: trayLabel() })}
      ${tile('home.message', fx, fy + 133, 185, 131, glyph('mail', 185, 131, 44) + label('Message Me'), { label: 'Message Me' })}
      ${tile('home.linkedin', fx, fy + 266, 185, 131, `${LINKEDIN}${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,0) 58%,rgba(0,0,0,.47) 100%')}`, { label: 'LinkedIn', bg: '#fff' })}
      ${tile('home.hero', fx + 187, fy, 466, 263, `<span class="hero"><img src="${ME.pic}" alt=""><span><b>${esc(ME.tag)}</b><span>${esc(ME.motto)}</span></span></span>${shade('rgba(0,0,0,.14) 0%,rgba(0,0,0,0) 48%,rgba(0,0,0,.66) 100%')}${bar(30, 'rgba(0,0,0,.79)')}${tx('About Me · Computer Science at Aston University', { left: 8, right: 8, bottom: 6, 'font-size': 17 })}`, { label: 'About Me', bg: grad('#bfd5d8 0%,#3b5e65 34%,#111a1d 78%,#9eaeb0 100%'), def: true })}
      ${tile('home.projects', fx + 187, fy + 265, 231, 133, `<span class="lines">${PROJECTS.map((p) => `<i>${esc(p.title)}</i>`).join('')}</span>${label('Projects')}`, { label: 'Projects', bg: grad('#3a4a55 0%,#1f2a31 60%,#11181c 100%') })}
      ${tile('home.stats', fx + 420, fy + 265, 233, 133, `<span class="big-n" style="top:12px;font-size:46px">${live('lc', '·')}</span><span class="big-n" style="top:64px;font-size:14px;opacity:.85">LeetCode problems solved</span>${label('Stats')}`, { label: 'Stats', bg: grad('#171a5c 0%,#9333c4 50%,#10103a 100%') })}
      ${tile('home.valorant', fx + 655, fy, 179, 263, valorantArt(), { label: 'Valorant', bg: VAL_BG })}
      ${tile('home.film', fx + 655, fy + 265, 179, 133, `${glyph('film', 179, 133, 40)}${livePic('film0')}${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.75) 100%')}${label('Last Watched', 16)}`, { label: 'Last Watched', bg: '#2a2d30' })}
    </div>`;
  }
  function valorantArt() {
    return `<span class="val"><small>Valorant</small>${live('valRank', 'Ranked', 'val__rank')}${live('valPeak', '', 'val__peak')}</span>${label('Valorant')}`;
  }
  function githubArt(w, h) {
    const top = h - 33;
    return `<span class="abs" style="left:0;right:0;top:0;height:${top}px;background:#1b1f23"></span><span class="logo" style="top:${top * 0.42}px;width:44px;height:44px;fill:#fff">${svg('github')}</span><span class="big-n" style="top:${top * 0.42 + 28}px;font-size:13px;opacity:.8">${live('gh', 'hamzaaaaaf')}</span><span class="bar" style="height:33px;background:#2b3137"></span>${tx('GitHub', { left: 8, bottom: 6, 'font-size': 16 })}`;
  }

  function pageAbout() {
    return `<div class="page" data-tab="about">
      ${tile('about.me', 224, 31, 300, 263, `<span class="mecard"><img src="${ME.pic}" alt=""><b>About Me</b><span>${esc(ME.short)}</span></span>`, { label: 'About Me', bg: grad('#3f7f97 0%,#1d4656 50%,#0c1d25 100%'), def: true })}
      ${tile('about.education', 224, 296, 300, 132, `${glyph('cap', 300, 132, 44)}<span class="tile__note">Aston University · LACAS</span>${label('Education')}`, { label: 'Education' })}
      ${tile('about.stack', 526, 31, 354, 131, `<span class="chips">${STACK.slice(0, 5).map(([n]) => `<i>${esc(n)}</i>`).join('')}</span>${label('Tech Stack')}`, { label: 'Tech Stack', bg: grad('#2b3a44 0%,#1a252c 100%') })}
      ${tile('about.summer', 526, 164, 354, 130, `<span class="lines">${SUMMER.map(([, v]) => `<i>${esc(v)}</i>`).join('')}</span>${label('Summer of 2022')}`, { label: 'Summer of 2022', bg: grad('#f2a64b 0%,#c4553a 55%,#5d1c33 100%') })}
      ${tile('about.achievements', 526, 296, 354, 132, `${glyph('trophy', 354, 132, 42, '0 0 30 32')}<span class="tile__note"><span data-gs>0</span> of 1000G</span>${label('Achievements')}`, { label: 'Achievements' })}
    </div>`;
  }

  function pageProjects() {
    return `<div class="page" data-tab="projects">
      ${tile('projects.list', 224, 31, 185, 197, `${img(`${A}icons/mygames.webp`, icoBox(185, 197, 72, 72, { mt: -24 }))}${label('All Projects', 19)}`, { label: 'All Projects' })}
      ${tile('projects.github', 224, 230, 185, 198, githubArt(185, 198), { label: 'GitHub', bg: '#1b1f23' })}
      ${tile('projects.panic', 411, 31, 466, 263, picture(`${A}tiles/panic-pack.webp`, 'Panic Pack!', 'Godot 4 · Free download for Windows'), { label: 'Panic Pack!', bg: grad('#2d100d 0%,#e27522 50%,#321a16 100%'), def: true })}
      ${tile('projects.unliker', 411, 296, 232, 132, picture(`${A}tiles/instagram-unliker.webp`, 'Instagram Unliker'), { label: 'Instagram Unliker', bg: grad('#ff78aa 0%,#d62976 50%,#4f0c4a 100%') })}
      ${tile('projects.site', 645, 296, 232, 132, `<img class="ico" src="/favicon.svg" alt="" style="${px(icoBox(232, 132, 62, 62, { mt: -26 }))}">${label('byhamza.dev')}`, { label: 'byhamza.dev', bg: grad('#4a5054 0%,#2a2e30 60%,#151718 100%') })}
      ${tile('projects.stats', 879, 31, 179, 397, `<span class="statcol"><b>${live('lc', '·')}</b><span>LeetCode solved</span><b>${live('ghRepos', '·')}</b><span>Public repos</span><b>${live('lcDays', '·')}</b><span>Active days</span></span>${label('Stats')}`, { label: 'Stats', bg: grad('#171a5c 0%,#9333c4 50%,#10103a 100%') })}
    </div>`;
  }

  function pageGames() {
    return `<div class="page" data-tab="games">
      ${tile('games.origin', 224, 31, 354, 263, picture(ORIGIN.art, 'Where It Began', `${ORIGIN.title}, ${ORIGIN.year}`), { label: 'Where it began', bg: '#1a120c', def: true })}
      ${tile('games.valorant', 580, 31, 232, 263, valorantArt(), { label: 'Valorant', bg: VAL_BG })}
      ${tile('games.played', 814, 31, 232, 131, glyph('games', 232, 131, 46) + label('Games I Play'), { label: 'Games I Play' })}
      ${tile('games.journey', 814, 164, 232, 130, `<span class="journey">${JOURNEY.map(([n]) => `<i>${esc(n)}</i>`).join('<em>›</em>')}</span>${label('Console Journey')}`, { label: 'Console Journey', bg: grad('#4c5a62 0%,#2a3338 100%') })}
      ${tile('games.psn', 224, 296, 354, 132, `<span class="tile__big">${live('psnLevel', 'Trophies')}</span><span class="tile__note">${live('psnSub', '')}</span>${label('PlayStation')}`, { label: 'PlayStation', bg: grad('#2b6fd6 0%,#0f3f8f 55%,#081d45 100%') })}
      ${tile('games.steam', 580, 296, 232, 132, `<span class="tile__big">${live('steamBig', 'Steam')}</span><span class="tile__note">${live('steamSub', '')}</span>${label('Steam')}`, { label: 'Steam', bg: grad('#2a475e 0%,#1b2838 60%,#0e141b 100%') })}
      ${tile('games.most', 814, 296, 232, 132, `<span class="lines">${live('most0', '', 'li')}${live('most1', '', 'li')}${live('most2', '', 'li')}</span>${label('Most Played')}`, { label: 'Most Played', bg: grad('#3d4a52 0%,#20282d 100%') })}
    </div>`;
  }

  function pageMovies() {
    const favs = [0, 1, 2, 3].map((i) => `<span class="poster" style="left:${14 + i * 112}px">${livePic(`fav${i}`)}</span>`).join('');
    return `<div class="page" data-tab="movies">
      ${tile('movies.latest', 224, 31, 175, 263, `${glyph('film', 175, 263, 50)}${livePic('film0')}${shade('rgba(0,0,0,0) 0%,rgba(0,0,0,.1) 55%,rgba(0,0,0,.78) 100%')}<span class="tile__note" style="bottom:34px">${live('film0', '')}</span>${label('Last Watched')}`, { label: 'Last Watched', bg: '#2a2d30' })}
      ${tile('movies.favs', 401, 31, 466, 263, `${favs}${bar(30, 'rgba(0,0,0,.6)')}${tx('Favourite Films', { left: 8, bottom: 6, 'font-size': 17 })}`, { label: 'Favourite Films', bg: grad('#3a2f45 0%,#1c1724 100%'), def: true })}
      ${tile('movies.recent', 224, 296, 643, 132, `<span class="lines lines--2">${live('recent0', '', 'li')}${live('recent1', '', 'li')}${live('recent2', '', 'li')}${live('recent3', '', 'li')}</span>${label('Recently Watched')}`, { label: 'Recently Watched', bg: grad('#2e3438 0%,#1a1e21 100%') })}
    </div>`;
  }

  function pageSocial() {
    const fx = 224, fy = 31, lab = (t) => tx(t, { left: 8, bottom: 8, 'font-size': 15 });
    return `<div class="page" data-tab="social">
      ${img(`${A}tiles/avatars.webp`, { left: fx + 219, top: fy + 87, width: 300, height: 256, opacity: 0.96, 'object-fit': 'contain' }, 'abs')}
      <div class="say" style="left:${fx + 540}px;top:${fy + 120}px"><b>Say hello</b><span>Message me about projects, uni or games.</span><em>${esc(LINKS.email)}</em></div>
      ${tile('social.friends', fx, fy, 177, 122, img(`${A}icons/friends.webp`, icoBox(177, 122, 58, 58, { mt: -15 })) + lab('Friends'), { label: 'Friends' })}
      ${tile('social.message', fx, fy + 123, 177, 122, glyph('mail', 177, 122, 46) + lab('Message Me'), { label: 'Message Me', def: true })}
      ${tile('social.linkedin', fx, fy + 246, 177, 122, glyph('linkedin', 177, 122, 44) + lab('LinkedIn'), { label: 'LinkedIn' })}
    </div>`;
  }

  function pageSettings() {
    const fx = 224, fy = 31, w = 270, h = 192;
    const cells = [
      ['system', 'System', img(`${A}icons/settings-system.webp`, icoBox(w, h, 80, 80, { mt: -30 }))],
      ['preferences', 'Preferences', img(`${A}icons/settings-preferences.webp`, icoBox(w, h, 80, 80, { mt: -30 }))],
      ['audio', 'Audio', img(`${A}icons/music.webp`, icoBox(w, h, 50, 50, { mt: -30 }))],
      ['privacy', 'Privacy', img(`${A}icons/settings-privacy.webp`, icoBox(w, h, 80, 80, { mt: -30 }))],
      ['credits', 'Credits', glyph('info', w, h, 56)],
      ['turnoff', 'Turn Off', img(`${A}icons/settings-turnoff.webp`, icoBox(w, h, 80, 80, { mt: -30 }))],
    ];
    const tiles = cells.map(([id, name, icon], i) => tile(`settings.${id}`, fx + (i % 3) * (w + 2), fy + Math.floor(i / 3) * (h + 2), w, h, icon + tx(name, { left: 11, bottom: 10, 'font-size': 21 }), { label: name, def: i === 0 })).join('');
    return `<div class="page" data-tab="settings">
      ${tiles}
      <p class="tx wrap" style="left:${fx}px;top:${fy + 2 * (h + 2) + 12}px;width:650px;margin:0;font-size:12px;color:rgba(255,255,255,.53)">Unofficial non-commercial fan project, inspired by my first console. Xbox and related names, logos, and imagery are property of Microsoft. Not affiliated with or endorsed by Microsoft. Dashboard design and assets from DashX360 by ZivvoZ.</p>
    </div>`;
  }

  const PAGES = { home: pageHome, about: pageAbout, projects: pageProjects, games: pageGames, movies: pageMovies, social: pageSocial, settings: pageSettings };
  // The side previews show the end of the previous tab and the start of the next one.
  function pageSpan(k) {
    const els = $$('[data-x]', pageEls[k]);
    return [Math.min(...els.map((e) => +e.dataset.x)), Math.max(...els.map((e) => +e.dataset.x + +e.dataset.w))];
  }
  const leftCrop = (k) => pageSpan(k)[1] - 104;
  const rightCrop = (k) => pageSpan(k)[0];

  /* ================= Build the dashboard ================= */
  const dashCanvas = $('#dash .canvas');
  dashCanvas.innerHTML = `
    <div class="radial"></div>
    <div class="host">
      <nav class="tabs" role="tablist" aria-label="Dashboard">${TABS.map((t, i) => `<button class="tab" role="tab" data-i="${i}"><span>${t.k}</span></button>`).join('')}</nav>
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
      <div class="hints foot"><span class="h" data-act="a">${G('A')} Select   </span></div>
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
  const bgTheme = $('.bg-theme');
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
  function openLink(url, ach, quiet) {
    if (!quiet) sfx('select');
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
  let tabIndex = TABS.findIndex((t) => t.k === 'home'), animatingTab = false, queuedStep = 0;
  const lastFocus = {};
  const curTab = () => TABS[tabIndex].k;
  const curPage = () => pageEls[curTab()];
  function pageCands(page = curPage()) {
    return $$('.t, [data-nav]', page).map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y, w: +el.dataset.w, h: +el.dataset.h }));
  }

  // FocusDefaultButton: the remembered tile, else the tab's main tile, else the
  // one nearest y 210 then x 560.
  function focusDefault() {
    const k = curTab(), cands = pageCands();
    if (lastFocus[k] && cands.some((c) => c.el === lastFocus[k])) { focusEl(lastFocus[k]); return; }
    const main = $('[data-default]', curPage());
    if (main) { focusEl(main); return; }
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
    fillPeek(peekR, next, next ? rightCrop(next.k) : 0);
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
  // Straight to a tab with no slide, for when the dashboard is out of sight.
  function jumpTab(k) {
    const i = TABS.findIndex((t) => t.k === k);
    if (i < 0) return;
    tabIndex = i;
    paintTabs(); renderPeeks(); updateBackgrounds(); visit(k);
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

  // Theme backgrounds (UpdateThemeBackgroundVisual).
  let themeSection = 'home';
  function updateBackgrounds() {
    const theme = THEMES.find((t) => t.id === S.theme);
    if (!theme || theme.id === 'default') { bgTheme.classList.remove('on'); return; }
    themeSection = Overlays.has('settings') ? 'settings' : 'home';
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
  const ACTIONS = {
    'home.tray': () => toggleTray(),
    'home.message': () => Win.open('message'),
    'home.linkedin': () => openLink(LINKS.linkedin, 'networker'),
    'home.hero': () => Win.open('about'),
    'home.projects': () => Win.open('projects'),
    'home.stats': () => Win.open('stats'),
    'home.valorant': () => Win.open('valorant'),
    'home.film': () => Win.open('recent'),
    'about.me': () => Win.open('about'),
    'about.education': () => Win.open('education'),
    'about.stack': () => Win.open('stack'),
    'about.summer': () => Win.open('summer'),
    'about.achievements': () => Guide.open('achievements'),
    'projects.list': () => Win.open('projects'),
    'projects.github': () => openLink(LINKS.github, 'source'),
    'projects.panic': () => openLink(PROJECTS[0].url, 'source'),
    'projects.unliker': () => openLink(PROJECTS[1].url, 'source'),
    'projects.site': () => openLink(PROJECTS[2].url, 'source'),
    'projects.stats': () => Win.open('stats'),
    'games.origin': () => Win.open('origin'),
    'games.valorant': () => Win.open('valorant'),
    'games.played': () => Win.open('played'),
    'games.journey': () => Win.open('journey'),
    'games.psn': () => Win.open('psn'),
    'games.steam': () => Win.open('steam'),
    'games.most': () => Win.open('most'),
    'movies.latest': () => Win.open('recent'),
    'movies.favs': () => Win.open('favs'),
    'movies.recent': () => Win.open('recent'),
    'social.friends': () => Guide.open('friends'),
    'social.message': () => Win.open('message'),
    'social.linkedin': () => openLink(LINKS.linkedin, 'networker'),
    'settings.system': () => Settings.open(),
    'settings.preferences': () => Settings.open('dashboard'),
    'settings.audio': () => Settings.open('audio'),
    'settings.privacy': () => Settings.open('data'),
    'settings.credits': () => Settings.open('about'),
    'settings.turnoff': () => powerOff(),
  };
  function activateTile(el) {
    const id = el.dataset.t;
    if (ACTIONS[id]) ACTIONS[id]();
  }

  // With no disc in the drive the tile just opens and closes the tray, like the real thing.
  function toggleTray() {
    trayOpen = !trayOpen;
    sfx('select');
    if (trayOpen) achieve('tray');
    $$('[data-t="home.tray"]').forEach((t) => {
      $('.tray__t', t).textContent = trayLabel();
      t.setAttribute('aria-label', trayLabel());
      const ico = $('.tray__ico', t);
      if (ico && !reduced.matches) ico.animate([{ translate: '0 0' }, { translate: `0 ${trayOpen ? 7 : -7}px` }, { translate: '0 0' }], { duration: 300, easing: E.cubicOut });
    });
  }

  /* ================= Overlay stack ================= */
  const Overlays = (() => {
    const stack = [];
    return {
      push(name, api) { setActive(null); if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); stack.push({ name, api }); syncDash(); },
      pop(name) { const i = stack.findIndex((o) => o.name === name); if (i >= 0) stack.splice(i, 1); syncDash(); },
      top() { return stack.length ? stack[stack.length - 1].name : null; },
      api() { return stack.length ? stack[stack.length - 1].api : null; },
      has(name) { return stack.some((o) => o.name === name); },
      // DashX360 opens one menu at a time: opening a menu closes the others
      // (game details is the exception and opens over a list).
      clear() { [...stack].reverse().forEach((o) => { if (o.api.dismiss) o.api.dismiss(); }); stack.length = 0; syncDash(); },
    };
  })();
  const overlayOpen = () => !!Overlays.top();
  // Full-screen menus hide the dashboard. Going into one, the hub slides away to
  // the left; backing out, its tiles fly back in column by column, like the 360.
  const FULL = ['settings', 'win'];
  let dashHidden = false, leaving = null, syncQueued = false, quietReturn = false;
  function syncDash() {
    // Stack changes made together (close one menu, open the next) settle once.
    if (syncQueued) return;
    syncQueued = true;
    queueMicrotask(() => {
      syncQueued = false;
      const hide = FULL.some((n) => Overlays.has(n));
      if (hide !== dashHidden) { dashHidden = hide; if (hide) dashLeave(); else dashReturn(); }
      updateBackgrounds();
    });
  }
  function dashLeave() {
    if (leaving) leaving.cancel();
    if (reduced.matches || booting) { host.style.visibility = 'hidden'; return; }
    leaving = host.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '-64px 0' }], { duration: 180, easing: E.cubicIn, fill: 'forwards' });
    leaving.finished.then(() => { if (dashHidden) host.style.visibility = 'hidden'; }, () => {});
  }
  function dashReturn() {
    if (leaving) { leaving.cancel(); leaving = null; }
    host.style.visibility = '';
    if (quietReturn || reduced.matches || booting) return;
    tilesIn(-96);
  }
  // The current hub's tiles slide in from fromX, the leftmost column first.
  function tilesIn(fromX, delay = 0) {
    const els = $$('.t, [data-nav]', curPage());
    const cols = [...new Set(els.map((e) => +e.dataset.x))].sort((a, b) => a - b);
    els.forEach((el) => el.animate([{ opacity: 0, translate: `${fromX}px 0` }, { opacity: 1, translate: '0 0' }], { duration: 400, delay: delay + cols.indexOf(+el.dataset.x) * 45, easing: E.quartOut, fill: 'backwards' }));
    // A single keyframe animates up to each element's own opacity, whatever else is running.
    [$('.tabs', host), $('.me', host), $('.foot', host), peekL, peekR].forEach((el) => el.animate([{ opacity: 0 }], { duration: 300, delay, easing: E.sineOut, fill: 'backwards' }));
  }
  // AnimateOverlayOut: a menu slides 112 px right while it fades. Menus that
  // float over the dashboard fade, and message boxes shrink away.
  function overlayOut(node, kind = 'slide') {
    if (!node || !node.isConnected) return;
    node.style.pointerEvents = 'none';
    if (reduced.matches) { node.remove(); return; }
    let a;
    if (kind === 'fade') a = anim(node, [{ opacity: 1 }, { opacity: 0 }], 160, E.sineIn);
    else if (kind === 'pop') a = anim(node, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }], 140, E.cubicIn);
    else {
      anim(node, [{ opacity: 1 }, { opacity: 0 }], 150, E.sineIn);
      a = anim(node, [{ translate: '0 0' }, { translate: '112px 0' }], 210, E.cubicIn);
    }
    a.finished.then(() => node.remove());
  }
  // After a menu closes: the one underneath takes focus again, or the dashboard.
  function refocusUnder() {
    const t = Overlays.api();
    if (t && t.refocus) t.refocus(); else if (!overlayOpen()) focusDefault();
  }
  function overlayEl(cls) {
    const el = html(`<div class="ov ${cls}"></div>`);
    dashCanvas.appendChild(el);
    return el;
  }

  /* ================= System Settings ================= */
  const Settings = (() => {
    // direct: opened straight into a category from a tile, so B goes back to the dashboard.
    let el = null, cat = null, direct = false;
    const CATS = [
      ['console', 'Console Settings', 'Change startup, sound and controller behaviour.'],
      ['dashboard', 'Dashboard Customization', 'Change the dashboard theme and tile colour.'],
      ['audio', 'Audio', 'Choose how loud the dashboard sounds are.'],
      ['data', 'Data Control', 'Reset the dashboard data saved in this browser.'],
      ['about', 'About', 'Credits for the dashboard, the artwork and the font.'],
    ];
    const STARTUP = [['video', 'Boot Video and Loading'], ['loading', 'Loading Only'], ['off', 'Straight to the Dashboard']];
    function open(category) {
      direct = !!category && !el;
      if (!el) {
        Overlays.clear();
        el = overlayEl('set');
        el.innerHTML = `<div class="set__title">System Settings</div>
          <div class="set__frame"><div class="set__left"><div class="set__scroll"><div></div></div></div><div class="set__right"><h3></h3><p></p></div></div>
          <div class="hints ofoot set__foot"><span class="h" data-act="a">${G('A')} Select   </span><span class="h" data-act="b">${G('B')} Back   </span></div>`;
        Overlays.push('settings', api);
        sfx('menu-in');
        achieve('sysset');
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
          `<div class="oslider" data-nav tabindex="-1" data-slider="volume" data-tip="Dashboard Volume|Change how loud the dashboard sounds are."><span class="track"><i style="width:${S.volume * 100}%"></i><b style="left:${S.volume * 100}%"></b></span><span>${Math.round(S.volume * 100)}%</span></div>`,
        ]);
      } else if (k === 'data') {
        list([
          btn('reset-ach', 'Reset Achievements', 'Lock every achievement again. Your gamerscore goes back to 0.'),
          btn('reset-all', 'Reset Everything', 'Clear all dashboard data saved in this browser, including settings.'),
        ]);
      } else if (k === 'about') {
        list([
          btn('l:dashx360', 'DashX360 by ZivvoZ', 'The Windows dashboard this site is ported from. Layouts, animations, sounds and artwork come from DashX360.'),
          btn('l:source', 'Source Code', 'byhamza.dev on GitHub. Built after the Xbox 360, my first console.'),
          btn('l:selawik', 'Selawik Font', 'Microsoft’s open-source stand-in for Segoe UI, under the SIL Open Font License.'),
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
        if (id.startsWith('l:')) {
          openLink({ dashx360: LINKS.dashx360, source: LINKS.source, selawik: 'https://github.com/microsoft/Selawik' }[id.slice(2)], id === 'l:source' ? 'source' : null);
          return;
        }
        if (id === 'reset-ach') { store.del('achievements'); refreshScore(); sfx('select'); toast('Achievements', 'Reset'); }
        if (id === 'reset-all') { ['achievements', 'visited', 'settings', 'days'].forEach(store.del); sfx('select'); setTimeout(() => location.reload(), 400); }
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
      Overlays.pop('settings');
      refocusUnder();
      if (reduced.matches) { node.remove(); return; }
      layerOut($('.set__title', node), 42, 145);
      layerOut($('.set__frame', node), 136, 215);
      layerOut($('.set__foot', node), 24, 130);
      overlayOut(node);
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
        if (!el) return true;
        if ((a === 'left' || a === 'right') && activeEl && el.contains(activeEl) && (activeEl.dataset.cycle || activeEl.dataset.slider)) { adjust(activeEl, a === 'left' ? -1 : 1); return true; }
        if (['left', 'right', 'up', 'down'].includes(a)) {
          const n = bestInDirection(rectCands($('.set__left', el)), activeEl, a);
          if (n) { focusEl(n); sfx('focus'); keepVisible(); if (n.dataset.tip) describe(...n.dataset.tip.split('|')); }
          return true;
        }
        if (a === 'a') { if (activeEl && el.contains(activeEl)) onClick(activeEl); return true; }
        if (a === 'b') { if (cat && !direct) { sfx('menu-out'); showCategories(); } else close(); return true; }
        return true;
      },
      refocus() { if (!el) return; const f = $('.set__left [data-nav]', el); if (f) focusEl(f); },
      dismiss() { overlayOut(el, 'fade'); el = null; },
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
      Overlays.clear();
      el = overlayEl('themes');
      el.innerHTML = `<div class="themes__back"></div><div class="themes__panel"><div class="themes__head">Select Theme</div>${THEMES.map((t) => `<button type="button" class="tbtn" data-nav data-theme="${t.id}">${esc(t.name)}${t.id === S.theme ? '<small>Current</small>' : ''}</button>`).join('')}</div>
        <div class="hints ofoot themes__foot"><span class="h" data-act="a">${G('A')} Select   </span><span class="h" data-act="b">${G('B')} Back   </span></div>`;
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
      const node = el;
      el = null;
      sfx('menu-out');
      Overlays.pop('themes');
      refocusUnder();
      if (!reduced.matches) layerOut($('.themes__panel', node), 64, 200);
      overlayOut(node, 'fade');
    }
    const api = {
      handle(a) {
        if (!el) return true;
        if (a === 'up' || a === 'down') {
          const n = bestInDirection(rectCands(el), activeEl, a);
          if (n) { focusEl(n); sfx('focus'); }
          return true;
        }
        if (a === 'a') { if (activeEl && el.contains(activeEl)) pick(activeEl); return true; }
        if (a === 'b') { close(); return true; }
        return true;
      },
      refocus() { if (!el) return; focusEl($('.tbtn', el)); },
      dismiss() { overlayOut(el, 'fade'); el = null; },
    };
    return { open };
  })();

  /* ================= Windows: one per tile ================= */
  // Live stats from the Worker (/api/feed); null until they arrive.
  let FEED = null;
  const F = (k, fn) => { try { return FEED && FEED[k] ? fn(FEED[k]) : null; } catch (e) { return null; } };
  const stars = (r) => (r ? '★'.repeat(Math.floor(r)) + (r % 1 ? '½' : '') : '');
  const n = (v) => Number(v || 0).toLocaleString('en-GB');
  const when = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const rows = (pairs) => `<dl class="wrows">${pairs.filter((p) => p[1] !== null && p[1] !== '').map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  const waiting = (what) => `<p class="wdim">${FEED ? `${what} isn’t available right now.` : 'Loading…'}</p>`;
  // A row you can select; its index points at the window's actions.
  const pick = (i, title, sub = '', side = '') => `<button type="button" class="wpick" data-nav data-i="${i}"><span><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span>${side ? `<em>${esc(side)}</em>` : ''}</button>`;
  const filmRow = (f) => `<li class="film">${f.poster ? `<img src="${esc(f.poster)}" alt="" loading="lazy">` : '<i></i>'}<span><b>${esc(f.title)}</b><small>${[f.year, f.watched ? `watched ${when(f.watched)}` : ''].filter(Boolean).join(' · ')}</small></span><em>${f.rating ? `<span class="me">${stars(f.rating)}</span>` : ''}${f.imdb ? `<span class="imdb">IMDb ${esc(f.imdb)}</span>` : ''}</em></li>`;
  const gameRow = ([name, hrs, plat]) => `<li><span>${esc(name)}</span><small>${plat ? `${esc(plat)} · ` : ''}${n(hrs)} h</small></li>`;
  function copyEmail() {
    const done = () => { achieve('messenger'); sfx('select'); toast(LINKS.email, 'Copied to clipboard'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(LINKS.email).then(done, () => toast(LINKS.email, 'Copy it from here'));
    else toast(LINKS.email, 'Copy it from here');
  }
  // Everything played on PlayStation and Steam, most hours first.
  const mostPlayed = () => [
    ...(F('psn', (d) => d.top.map((g) => [g.name, g.hours, g.platform])) || []),
    ...(F('steam', (d) => (d.top || d.recent).map((g) => [g.name, g.hours, 'PC'])) || []),
  ].sort((a, b) => b[1] - a[1]);

  const WINDOWS = {
    about: () => ({ title: 'About Me', ach: 'about', body: `<div class="wme"><img src="${ME.pic}" alt=""><div>${ABOUT.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div>${rows(FACTS)}` }),
    education: () => ({ title: 'Education', ach: 'education', body: `<ol class="wlist">${EDUCATION.map((e) => `<li><b>${esc(e.place)}</b><span>${esc(e.what)}</span>${e.when ? `<small>${esc(e.when)}</small>` : ''}</li>`).join('')}</ol>` }),
    stack: () => ({ title: 'Tech Stack', ach: 'stack', body: `<div class="wchips">${STACK.map(([t, d]) => `<div><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div>` }),
    summer: () => ({ title: 'Summer of 2022', ach: 'summer', body: `<p>The best summer of my life, and the combo that made it.</p>${rows(SUMMER)}` }),
    projects: () => ({
      title: 'All Projects', ach: 'projects',
      body: PROJECTS.map((p, i) => pick(i, p.title, p.line)).join('') + pick(PROJECTS.length, 'More on GitHub', 'Everything else I’ve built'),
      run: (i) => openLink(i < PROJECTS.length ? PROJECTS[i].url : LINKS.github, 'source'),
      a: 'Open',
    }),
    stats: () => {
      const lc = F('leetcode', (d) => d), gh = F('github', (d) => d);
      return {
        title: 'Stats', ach: 'stats',
        body: `<div class="wcols"><section><h3>LeetCode</h3>${lc ? `<p class="wbig">${n(lc.solved.All)}<small>problems solved</small></p>${rows([['Easy', `${lc.solved.Easy} of ${n(lc.totals.Easy)}`], ['Medium', `${lc.solved.Medium} of ${n(lc.totals.Medium)}`], ['Hard', `${lc.solved.Hard} of ${n(lc.totals.Hard)}`], ['Active days', lc.activeDays], ['Streak', lc.streak ? `${lc.streak} days` : '']])}${lc.recent.length ? `<h4>Recently solved</h4><ul class="wsmall">${lc.recent.map((r) => `<li>${esc(r.title)}</li>`).join('')}</ul>` : ''}` : waiting('LeetCode')}</section>
          <section><h3>GitHub</h3>${gh ? `<p class="wbig">${n(gh.repos)}<small>public repos</small></p>${rows(gh.languages.map(([l, pc]) => [l, `${pc}%`]))}${gh.latest ? `<h4>Last pushed</h4><ul class="wsmall"><li>${esc(gh.latest.name)}, ${when(gh.latest.pushed)}</li></ul>` : ''}` : waiting('GitHub')}</section></div>`,
        a: 'Open LeetCode', onA: () => openLink(LINKS.leetcode, 'leetcode'),
        x: 'Open GitHub', onX: () => openLink(LINKS.github, 'source'),
      };
    },
    message: () => ({
      title: 'Message Me',
      body: `<p class="wbig wbig--mail">${esc(LINKS.email)}</p><p>Message me about projects, uni or games.</p>${pick(0, 'Copy email address')}${pick(1, 'Open in your mail app')}${pick(2, 'LinkedIn')}`,
      run: (i) => [copyEmail, () => openLink(`mailto:${LINKS.email}`, 'messenger'), () => openLink(LINKS.linkedin, 'networker')][i](),
      a: 'Select',
    }),
    origin: () => ({ title: 'Where It Began', ach: 'origin', body: `<div class="wart"><img src="${ORIGIN.art}" alt=""></div><h3>${esc(ORIGIN.title)} <small>${ORIGIN.year}</small></h3><p>${esc(ORIGIN.text)}</p>` }),
    journey: () => ({ title: 'Console Journey', ach: 'journey', body: `<ol class="wjourney">${JOURNEY.map(([c, s]) => `<li><b>${esc(c)}</b>${s ? `<small>${esc(s)}</small>` : ''}</li>`).join('')}</ol><p>The Xbox 360 came first, and it’s why this site looks the way it does.</p>` }),
    played: () => ({ title: 'Games I Play', ach: 'gamer', body: `<ul class="wgames">${GAMES.map(([t, y]) => `<li${t === ORIGIN.title ? ' class="fav"' : ''}><span>${esc(t)}</span><small>${y}</small></li>`).join('')}</ul>` }),
    valorant: () => {
      const v = F('valorant', (d) => d);
      return {
        title: 'Valorant', ach: 'valorant',
        body: v ? `<div class="wrank"><small>Current rank</small><b>${esc(v.rank || 'Unranked')}</b>${v.rr !== null ? `<span>${v.rr} RR</span>` : ''}</div>${rows([['Peak rank', v.peak ? `${v.peak}${v.peakSeason ? ` (${v.peakSeason})` : ''}` : ''], ['Competitive wins', v.games ? `${n(v.wins)} of ${n(v.games)} games` : ''], ['Account level', v.level || '']])}` : waiting('Valorant'),
      };
    },
    psn: () => {
      const p = F('psn', (d) => d);
      return {
        title: 'PlayStation', ach: 'trophies',
        body: p ? `<div class="wcols"><section>${rows([['Trophy level', p.level], ['Platinum', p.trophies.platinum], ['Gold', p.trophies.gold], ['Silver', p.trophies.silver], ['Bronze', p.trophies.bronze], ['Games played', p.games], ['Hours played', n(p.totalHours)], ['Peak years', p.peakYears.slice(0, 2).map((y) => y.year).join(' and ')]])}</section>
          <section><h4>Most played</h4><ul class="wgames">${p.top.slice(0, 6).map((g) => gameRow([g.name, g.hours, g.platform])).join('')}</ul></section></div>` : waiting('PlayStation'),
      };
    },
    steam: () => {
      const s = F('steam', (d) => d);
      const list = s ? (s.top || s.recent) : [];
      return {
        title: 'Steam', ach: 'steam',
        body: s ? `${rows([['Library', s.games ? `${s.games} games` : ''], ['Hours played', s.totalHours ? n(s.totalHours) : ''], ['On Steam since', s.since || '']])}${list.length ? `<h4>${s.top ? 'Most played' : 'Recently played'}</h4><ul class="wgames">${list.slice(0, 6).map((g) => gameRow([g.name, g.hours])).join('')}</ul>` : ''}` : waiting('Steam'),
      };
    },
    most: () => {
      const all = mostPlayed();
      return { title: 'Most Played', ach: 'gamer', body: all.length ? `<ul class="wgames">${all.slice(0, 10).map(gameRow).join('')}</ul>` : waiting('Play time') };
    },
    favs: () => {
      const m = F('movies', (d) => d.favourites);
      return { title: 'Favourite Films', ach: 'cinephile', body: m && m.length ? `<ul class="wfilms">${m.map(filmRow).join('')}</ul>` : waiting('Letterboxd') };
    },
    recent: () => {
      const m = F('movies', (d) => d.recent);
      return { title: 'Recently Watched', ach: 'critic', body: m && m.length ? `<ul class="wfilms">${m.map(filmRow).join('')}</ul>` : waiting('Letterboxd') };
    },
  };

  const Win = (() => {
    let el = null, id = null, spec = null;
    function open(which) {
      if (!WINDOWS[which]) return;
      Overlays.clear();
      id = which;
      el = overlayEl('win');
      el.innerHTML = `<div class="win__title"></div><div class="win__panel"><div class="win__body"></div></div><div class="hints ofoot win__foot"></div>`;
      Overlays.push('win', api);
      paint();
      sfx('menu-in');
      if (reduced.matches) return;
      layerIn(el, 0, 120, 0);
      layerIn($('.win__title', el), 36, 250, 35);
      layerIn($('.win__panel', el), 132, 360, 20);
      layerIn($('.win__foot', el), 26, 210, 160);
    }
    function paint() {
      spec = WINDOWS[id]();
      if (spec.ach) achieve(spec.ach);
      $('.win__title', el).textContent = spec.title;
      const body = $('.win__body', el);
      body.innerHTML = spec.body;
      body.scrollTop = 0;
      $('.win__foot', el).innerHTML = [spec.a && ['a', spec.a], spec.x && ['x', spec.x], ['b', 'Back']].filter(Boolean).map(([k, t]) => `<span class="h" data-act="${k}">${G(k.toUpperCase())} ${esc(t)}   </span>`).join('');
      $$('[data-nav]', body).forEach((b) => {
        b.addEventListener('mouseenter', () => setActive(b));
        b.addEventListener('click', () => spec.run(+b.dataset.i));
      });
      const first = $('[data-nav]', body);
      if (first) focusEl(first);
    }
    function close() {
      if (!el) return;
      const node = el;
      el = null;
      sfx('menu-out');
      Overlays.pop('win');
      refocusUnder();
      if (!reduced.matches) layerOut($('.win__panel', node), 136, 215);
      overlayOut(node);
    }
    const api = {
      handle(a) {
        if (!el) return true;
        const body = $('.win__body', el), picks = $$('[data-nav]', body);
        if (a === 'up' || a === 'down') {
          if (picks.length) {
            const i = clamp(picks.indexOf(activeEl) + (a === 'up' ? -1 : 1), 0, picks.length - 1);
            if (picks[i] !== activeEl) { focusEl(picks[i]); picks[i].scrollIntoView({ block: 'nearest' }); sfx('focus'); }
          } else body.scrollBy({ top: a === 'up' ? -90 : 90, behavior: reduced.matches ? 'auto' : 'smooth' });
        } else if (a === 'a') {
          if (spec.run && activeEl && body.contains(activeEl)) spec.run(+activeEl.dataset.i);
          else if (spec.onA) spec.onA();
        } else if (a === 'x' && spec.onX) spec.onX();
        else if (a === 'b') close();
        return true;
      },
      refocus() { if (el) { const f = $('.win__body [data-nav]', el); if (f) focusEl(f); } },
      dismiss() { overlayOut(el, 'fade'); el = null; },
    };
    // Repaint when the live stats arrive while a window is open.
    const refresh = () => { if (el) paint(); };
    return { open, refresh };
  })();

  /* ================= Xbox Guide ================= */
  const Guide = (() => {
    const layer = $('#guide'), canvas = $('.canvas', layer);
    let open_ = false, busy = false, tab = 2, sel = 0, screen = 'main', bladeSound = 0;
    let achSel = 0, achDetail = false, frSel = 0, returnFocus = null;
    const NAMES = ['Games & Apps', ME.tag, 'Xbox Home', 'Media', 'Settings'];
    const closeThen = (fn) => () => { close(false); fn(); };
    const win = (id) => closeThen(() => Win.open(id));
    function items() {
      switch (tab) {
        case 0: return [
          ['All Projects', 'games', win('projects')],
          ['Stats', 'layers', win('stats')],
          ['Games I Play', 'games', win('played')],
          ['Valorant', '', win('valorant')],
        ];
        case 1: return [
          ['Achievements', '', () => openScreen('achievements')],
          ['About Me', 'person', win('about')],
          ['Education', '', win('education')],
          ['Tech Stack', 'layers', win('stack')],
        ];
        case 3: return [
          ['Favourite Films', 'film', win('favs')],
          ['Recently Watched', 'film', win('recent')],
          ['Summer of 2022', '', win('summer')],
        ];
        case 4: return [
          ['System Settings', 'gear', closeThen(() => Settings.open())],
          ['Preferences', 'sliders', closeThen(() => Settings.open('dashboard'))],
          ['Themes', 'sliders', closeThen(() => Themes.open())],
          ['Turn Off', 'power', () => { close(false); powerOff(); }],
        ];
        default: return [
          ['Xbox Home', '', xboxHome],
          ['Friends', 'contact', () => openScreen('friends'), String(FRIENDS().length)],
          ['Messages', 'mail', win('message')],
          ['Minimize', 'minimize', () => close(false)],
          [trayLabel(), 'eject', () => { toggleTray(); paint(); }],
        ];
      }
    }
    const FRIENDS = () => [
      { tag: 'GitHub', sub: 'Projects and code', status: 'Online: Shipping code', pic: 'github', go: () => openLink(LINKS.github, 'source', true) },
      { tag: 'LeetCode', sub: 'Problem solving', status: `Online: ${F('leetcode', (d) => `${d.solved.All} problems solved`) || 'Solving problems'}`, pic: 'leetcode', go: () => { close(false); Win.open('stats'); } },
      { tag: 'LinkedIn', sub: 'Hamza Faisal', status: 'Online: Networking', pic: 'linkedin', go: () => openLink(LINKS.linkedin, 'networker', true) },
      { tag: 'Message Hamza', sub: LINKS.email, status: 'Send a message', pic: 'mail', go: () => { close(false); Win.open('message'); } },
    ];
    function clockText() { const d = new Date(); let h = d.getHours(); const ap = h < 12 ? 'AM' : 'PM'; h = h % 12 || 12; return `${h}:${String(d.getMinutes()).padStart(2, '0')}  ${ap}`; }
    // The button bar sits where it does on every other screen.
    const hints = (list) => list.map(([k, t]) => `<span class="h" data-act="${k}">${G(k.toUpperCase())} ${esc(t)}   </span>`).join('');
    function setFoot(list) { $('.gd__foot', canvas).innerHTML = hints(list); }
    function build() {
      canvas.innerHTML = `<div class="gd">
        <div class="gd__title">Xbox Guide</div>
        <img class="gd__pic" src="${ME.pic}" alt="">
        <div class="gd__clock"></div>
        <div class="gd__wrap"><div class="gd__blade">
          <div class="gd__side gd__s0" data-rel="-2"><span></span></div>
          <div class="gd__side gd__s1" data-rel="-1"><span></span></div>
          <div class="gd__center"><div class="gd__list" role="menu"></div></div>
          <div class="gd__side gd__s3" data-rel="1"><span></span></div>
          <div class="gd__side gd__s4" data-rel="2"><span></span></div>
        </div></div>
        <div class="gd__over"></div>
        <div class="hints ofoot gd__foot"></div>
      </div>`;
      $$('.gd__side', canvas).forEach((s) => s.addEventListener('click', () => moveTab(+s.dataset.rel)));
      $('.gd__foot', canvas).addEventListener('click', (e) => { const h = e.target.closest('[data-act]'); if (h) handle(h.dataset.act); });
    }
    function paint(nudge) {
      $('.gd__clock', canvas).textContent = clockText();
      const tabText = (i) => (i < 0 || i >= NAMES.length ? '' : NAMES[i]);
      $('.gd__s0 span', canvas).textContent = tabText(tab - 2);
      $('.gd__s1 span', canvas).textContent = tabText(tab - 1);
      $('.gd__s3 span', canvas).textContent = tabText(tab + 1);
      $('.gd__s4 span', canvas).textContent = tabText(tab + 2);
      const list = $('.gd__list', canvas);
      list.innerHTML = items().map(([t, icon, , count], i) => `<button type="button" class="grow${i === sel ? ' sel' : ''}" role="menuitem" data-i="${i}"><span>${esc(t)}</span><span class="cnt">${count ? esc(count) : ''}</span>${icon ? svg(icon) : '<span></span>'}</button>`).join('');
      $$('.grow', list).forEach((r) => {
        r.addEventListener('mouseenter', () => { if (+r.dataset.i !== sel) { sel = +r.dataset.i; paint(true); } });
        r.addEventListener('click', () => { sel = +r.dataset.i; activate(); });
      });
      if (nudge) { const s = $('.grow.sel', list); if (s) { s.classList.remove('nudge'); void s.offsetWidth; s.classList.add('nudge'); } }
      if (screen === 'main') setFoot([['a', 'Select'], ['b', 'Back'], ['y', 'Xbox Home']]);
    }
    // GuideWindow.Open + BeginOpenAnimation.
    async function open(sub) {
      if (open_ || busy || booting) return;
      busy = true; open_ = true;
      returnFocus = activeEl;
      tab = 2; sel = 0; screen = 'main';
      build(); paint();
      layer.hidden = false;
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      sfx('guide-open');
      achieve('guide');
      const gd = $('.gd', canvas);
      const sides = $$('.gd__s0, .gd__s3, .gd__s4', canvas), user = $$('.gd__s1 span', canvas);
      anim(layer, [{ opacity: 0 }, { opacity: 1 }], 70, E.cubicOut);
      anim(gd, [{ transform: 'scale(.84)' }, { transform: 'scale(1)' }], 210, E.cubicOut);
      anim($('.gd__list', canvas), [{ opacity: 0 }, { opacity: 1 }], 145, E.sineOut, 285);
      user.forEach((u) => anim(u, [{ opacity: 0 }, { opacity: 1 }], 120, E.sineOut, 250));
      const last = sides.map((s) => anim(s, [{ opacity: 0 }, { opacity: 1 }], 145, E.sineOut, 430));
      if (sub) { busy = false; openScreen(sub); }
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
        const top = Overlays.api();
        if (top && top.refocus) top.refocus();
        else if (!overlayOpen() && returnFocus && curPage().contains(returnFocus)) focusEl(returnFocus);
        else if (!overlayOpen()) focusDefault();
      };
      if (instant) { done(); return; }
      anim(gd, [{ translate: '0 0' }, { translate: '0 -10px' }], 190, E.cubicIn);
      anim($('.gd__blade', canvas), [{ opacity: 1 }, { opacity: 0.72 }], 115, E.sineIn);
      anim(layer, [{ opacity: 1 }, { opacity: 0 }], 165, E.sineIn).finished.then(done);
    }
    // Xbox Home: back to the Home tab from wherever you are.
    function xboxHome() {
      close(false);
      if (overlayOpen()) { jumpTab('home'); Overlays.clear(); } else goTab('home');
    }
    function moveTab(d) {
      if (screen !== 'main') return;
      const n = clamp(tab + d, 0, NAMES.length - 1);
      if (n === tab) return;
      tab = n; sel = 0;
      bladeSound = bladeSound % 4 + 1;
      sfx(`guide-blade-switch-${bladeSound}`);
      paint();
      const blade = $('.gd__blade', canvas);
      anim(blade, [{ opacity: 0.92 }, { opacity: 1 }], 130, E.sineOut);
      anim(blade, [{ translate: `${d > 0 ? 26 : -26}px 0` }, { translate: '0 0' }], 155, E.cubicOut);
    }
    function move(d) {
      const n = clamp(sel + d, 0, items().length - 1);
      if (n !== sel) { sel = n; sfx('guide-hover'); paint(true); }
    }
    function activate() {
      const it = items()[sel];
      if (!it || !it[2]) return;
      sfx('guide-select');
      it[2]();
    }

    /* ----- Achievements and Friends (community overlays) ----- */
    function openScreen(name) {
      screen = name;
      if (name === 'achievements') { achDetail = false; achSel = 0; }
      if (name === 'friends') { frSel = 0; achieve('friends'); }
      const over = $('.gd__over', canvas);
      over.innerHTML = `<div class="gx__dim"></div><div class="gx gx--${name}"><div class="gx__head"></div><div class="gx__body"></div></div>`;
      paintScreen();
      const gx = $('.gx', over);
      if (!reduced.matches) {
        anim(gx, [{ opacity: 0 }, { opacity: 1 }], 140, E.sineOut);
        anim(gx, [{ transform: 'translateY(-30px) scale(.93,.86)' }, { transform: 'translateY(0) scale(1)' }], 275, E.cubicOut);
        anim($('.gx__head', gx), [{ opacity: 0 }, { opacity: 1 }], 115, E.sineOut, 105);
        anim($('.gx__body', gx), [{ opacity: 0 }, { opacity: 1 }], 115, E.sineOut, 155);
      }
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
      const head = $('.gx__head', gx), body = $('.gx__body', gx);
      if (screen === 'achievements') {
        head.innerHTML = `<span>Achievements</span><img src="${ME.pic}" alt=""><span>${clockText()}</span>`;
        const g = got(), unlocked = ACHIEVEMENTS.filter((a) => g[a.id]).length;
        if (!achDetail) {
          body.innerHTML = `<button type="button" class="ach-game sel"><img src="${ME.pic}" alt=""><span><b>byhamza.dev</b><span>${unlocked} of ${ACHIEVEMENTS.length} Achievements</span></span></button><div class="ach__foot"><span></span></div>`;
          $('.ach-game', body).addEventListener('click', () => { achDetail = true; achSel = 0; sfx('guide-select'); paintScreen(); });
        } else {
          const a = ACHIEVEMENTS[achSel], on = !!g[a.id];
          body.innerHTML = `<div class="ach__top"><div><b>byhamza.dev</b><div class="a-t">${esc(a.t)}</div><div class="a-d">${esc(a.d)}</div></div><div class="a-r">${on ? 'Unlocked' : 'Locked'} · ${a.g}G<span>${on ? new Date(g[a.id]).toLocaleDateString('en-GB') : ''}</span></div></div>
            <div class="ach__grid"><div>${ACHIEVEMENTS.map((x, i) => `<button type="button" class="ach${g[x.id] ? '' : ' locked'}${i === achSel ? ' sel' : ''}" data-i="${i}" aria-label="${esc(x.t)}"><i>${g[x.id] ? svg('trophy', '0 0 30 32') : svg('lock', '0 0 36 32')}</i></button>`).join('')}</div></div>
            <div class="ach__foot"><b style="font-weight:400">${achSel + 1} of ${ACHIEVEMENTS.length} ${on ? 'unlocked' : 'locked'}</b><span>${gamerscore()} of 1000G</span></div>`;
          $$('.ach', body).forEach((b) => {
            b.addEventListener('mouseenter', () => { if (+b.dataset.i !== achSel) { achSel = +b.dataset.i; paintScreen(); } });
          });
          const row = Math.floor(achSel / 7), grid = $('.ach__grid > div', body);
          grid.style.transform = `translateY(${-Math.max(0, row - 2) * 104}px)`;
        }
        setFoot([['a', 'Select'], ['b', 'Back']]);
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
        setFoot([['a', 'Select'], ['b', 'Back']]);
      }
    }
    function handleScreen(a) {
      if (screen === 'achievements') {
        if (!achDetail) {
          if (a === 'a') { achDetail = true; achSel = 0; sfx('guide-select'); paintScreen(); }
          else if (a === 'b') closeScreen();
          return true;
        }
        const total = ACHIEVEMENTS.length, col = achSel % 7;
        let i = achSel;
        if (a === 'left') i = Math.max(0, achSel - 1);
        if (a === 'right') i = Math.min(total - 1, achSel + 1);
        if (a === 'up') i = achSel - 7 < 0 ? col : achSel - 7;
        if (a === 'down') i = achSel + 7 >= total ? Math.min(Math.floor((total - 1) / 7) * 7 + col, total - 1) : achSel + 7;
        if (i !== achSel) { achSel = i; sfx('guide-hover'); paintScreen(); }
        if (a === 'b') { achDetail = false; sfx('guide-back'); paintScreen(); }
        return true;
      }
      if (screen === 'friends') {
        const fr = FRIENDS();
        if (a === 'up' || a === 'down') { const i = clamp(frSel + (a === 'up' ? -1 : 1), 0, fr.length - 1); if (i !== frSel) { frSel = i; sfx('guide-hover'); paintScreen(); } }
        if (a === 'a') { sfx('guide-select'); fr[frSel].go(); }
        if (a === 'b') closeScreen();
        return true;
      }
      return false;
    }
    function handle(a) {
      if (busy && a !== 'guide') return true;
      if (a === 'guide') { close(); return true; }
      if (screen !== 'main') return handleScreen(a);
      if (a === 'up') move(-1);
      else if (a === 'down') move(1);
      else if (a === 'left' || a === 'lb') moveTab(-1);
      else if (a === 'right' || a === 'rb') moveTab(1);
      else if (a === 'a') activate();
      else if (a === 'b') close();
      else if (a === 'y') { sfx('guide-select'); xboxHome(); }
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
      if (Guide.isOpen) Guide.close(false, true);
      Overlays.clear();
      jumpTab('home');
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
    const top = Overlays.api();
    if (top) { top.handle(a); return; }
    dashboard(a);
  }
  // HandleInputActionCore for the dashboard itself.
  function dashboard(a) {
    const dirs = ['left', 'right', 'up', 'down'];
    if (animatingTab && ['left', 'right', 'lb', 'rb'].includes(a)) { queuedStep = a === 'left' || a === 'lb' ? -1 : 1; return; }
    // One sound per move: the tab swoosh when the hub changes, the tile tick otherwise.
    if (a === 'lb' || a === 'rb') { moveTab(a === 'lb' ? -1 : 1); return; }
    if (dirs.includes(a)) {
      const cands = pageCands();
      let cur = document.activeElement && document.activeElement.closest && document.activeElement.closest('.t, [data-nav]');
      if (!cur || !cands.some((c) => c.el === cur)) cur = null;
      if (!cur) { focusDefault(); sfx('focus'); return; }
      const n = bestInDirection(cands, cur, a);
      if (n) { focusEl(n); lastFocus[curTab()] = n; sfx('focus'); }
      else if (a === 'left' || a === 'right') moveTab(a === 'left' ? -1 : 1);
      return;
    }
    if (a === 'a') {
      const cur = document.activeElement && document.activeElement.closest && document.activeElement.closest('.t, [data-nav]');
      if (cur && curPage().contains(cur)) activateTile(cur); else focusDefault();
      return;
    }
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
    KeyX: 'x', KeyY: 'y', KeyQ: 'lb', PageUp: 'lb', KeyE: 'rb', PageDown: 'rb',
    Home: 'guide', KeyG: 'guide', F1: 'guide',
  };
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target, typing = t && t.tagName === 'INPUT' && t.type !== 'file';
    if (typing) { if (e.key === 'Escape') { e.preventDefault(); t.blur(); act('b'); } return; }
    if (e.key === 'Tab') { e.preventDefault(); if (!gateWaiting && !bootSkippable) { inputMode = 'key'; setPadMode(true); act(e.shiftKey ? 'lb' : 'rb'); } return; }
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
  }
  Object.values(pageEls).forEach(wirePage);
  tabBtns.forEach((b) => b.addEventListener('click', () => { if (!overlayOpen()) moveTab(+b.dataset.i - tabIndex); }));
  $('.peek-hit--l').addEventListener('click', () => { if (!overlayOpen()) moveTab(-1); });
  $('.peek-hit--r').addEventListener('click', () => { if (!overlayOpen()) moveTab(1); });
  $('.me [data-guide]').addEventListener('click', () => act('guide'));
  dashCanvas.addEventListener('click', (e) => { const h = e.target.closest('[data-act]'); if (h && !e.target.closest('.t, .dbtn, [data-nav]')) act(h.dataset.act); });
  $('#guide').addEventListener('click', (e) => { if (e.target === $('#guide') || e.target === $('#guide .canvas') || e.target.classList.contains('gd')) Guide.close(); });

  // Wheel and swipe change tabs.
  let wheelAt = 0;
  addEventListener('wheel', (e) => {
    if (booting || Guide.isOpen || overlayOpen()) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12 || performance.now() - wheelAt < 450) return;
    wheelAt = performance.now();
    moveTab(d > 0 ? 1 : -1);
  }, { passive: true });
  let touch = null;
  addEventListener('touchstart', (e) => { touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (!touch || booting || Guide.isOpen) return;
    const p = e.changedTouches[0], dx = p.clientX - touch.x, dy = p.clientY - touch.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - touch.t < 600) {
      const top = Overlays.api();
      if (top) top.handle(dx < 0 ? 'rb' : 'lb'); else moveTab(dx < 0 ? 1 : -1);
    }
    touch = null;
  }, { passive: true });

  /* ----- Controllers (ControllerInputService) ----- */
  const NAMES = ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt', 'back', 'start', 'ls', 'rs', 'up', 'down', 'left', 'right', 'guide', 'touch'];
  const RAW = {
    sony: { 0: 'x', 1: 'a', 2: 'b', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 10: 'ls', 11: 'rs', 12: 'guide', 13: 'touch' },
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
    fire('back', 'b'); fire('lb', 'lb'); fire('rb', 'rb'); fire('guide', 'guide'); fire('touch', 'guide');
    if (st.lt > 0.47 && !prev.ltOn) press('lt');
    if (st.rt > 0.47 && !prev.rtOn) press('rt');
    prev.ltOn = st.lt > 0.47; prev.rtOn = st.rt > 0.47;
    NAMES.forEach((n) => { prev[n] = st[n]; });
  }
  const startPad = () => { if (!padLoop) padLoop = requestAnimationFrame(padTick); };
  addEventListener('gamepadconnected', startPad);
  if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) startPad();

  /* ================= Live data ================= */
  // Tile text and pictures that fill in from the feed.
  const LIVE = {
    lc: () => F('leetcode', (d) => n(d.solved.All)),
    lcDays: () => F('leetcode', (d) => n(d.activeDays)),
    gh: () => F('github', (d) => `${d.repos} public repos`),
    ghRepos: () => F('github', (d) => n(d.repos)),
    valRank: () => F('valorant', (d) => d.rank),
    valPeak: () => F('valorant', (d) => d.peak && `Peak ${d.peak}`),
    psnLevel: () => F('psn', (d) => d.level && `Trophy level ${d.level}`),
    psnSub: () => F('psn', (d) => `${d.trophies.platinum} platinum · ${n(d.totalHours)} hours`),
    steamBig: () => F('steam', (d) => (d.totalHours ? `${n(d.totalHours)} hours` : null)),
    steamSub: () => F('steam', (d) => (d.games ? `${d.games} games` : d.recent[0] ? `Lately: ${d.recent[0].name}` : null)),
    film0: () => F('movies', (d) => d.recent[0] && d.recent[0].title),
  };
  const LIVE_SRC = { film0: () => F('movies', (d) => d.recent[0] && d.recent[0].poster) };
  for (let i = 0; i < 4; i++) {
    LIVE[`recent${i}`] = () => F('movies', (d) => d.recent[i] && `${d.recent[i].title}   ${stars(d.recent[i].rating)}`);
    LIVE_SRC[`fav${i}`] = () => F('movies', (d) => d.favourites[i] && d.favourites[i].poster);
  }
  for (let i = 0; i < 3; i++) LIVE[`most${i}`] = () => { const g = mostPlayed()[i]; return g ? `${g[0]} · ${n(g[1])} h` : null; };
  function fillLive() {
    $$('[data-live]').forEach((el) => {
      const v = LIVE[el.dataset.live] && LIVE[el.dataset.live]();
      if (v !== null && v !== undefined && v !== '') el.textContent = v;
    });
    $$('[data-live-src]').forEach((im) => {
      const u = LIVE_SRC[im.dataset.liveSrc] && LIVE_SRC[im.dataset.liveSrc]();
      if (u && im.getAttribute('src') !== u) { im.onload = () => { im.hidden = false; }; im.src = u; }
    });
  }
  // The Worker refreshes the feed every few hours; this just reads the latest.
  fetch('/api/feed', { signal: AbortSignal.timeout(25000) })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => { FEED = d; }, () => { FEED = {}; })
    .then(() => { fillLive(); renderPeeks(); Win.refresh(); });

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
    }
    await settle();
    booting = false;
    focusDefault();
    await wait(120);
    toast(`${ME.tag} signed`, 'in to Xbox LIVE');
    signedIn();
  }
  // The ring fades, then the dashboard scales up into place with its tiles sweeping in.
  async function settle() {
    const L = $('#loading'), ring = $('.ring', L);
    if (!L.hidden) {
      await anim(ring, [{ opacity: 1 }, { opacity: 0 }], 120).finished;
      await wait(40);
    }
    sfx('startup');
    paintTabs();
    renderPeeks();
    anim(host, [{ opacity: 0, transform: 'translateY(18px) scale(.965)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], 470, E.cubicOut);
    if (!reduced.matches) tilesIn(84, 40);
    if (!L.hidden) anim(L, [{ opacity: 1 }, { opacity: 0 }], 520, E.cubicOut).finished.then(() => { L.hidden = true; ring.style.opacity = ''; });
    await wait(470);
    host.style.opacity = '';
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
    // /?to=<screen> and #<screen> both open a tab or a window.
    const q = new URLSearchParams(location.search).get('to');
    if (q) history.replaceState(null, '', `/#${q}`);
    const h = location.hash.slice(1).toLowerCase();
    if (!h) return;
    const tabI = TABS.findIndex((t) => t.k === h);
    if (tabI >= 0) { tabIndex = tabI; return; }
    const after = () => {
      if (h === 'achievements') Guide.open('achievements');
      else if (WINDOWS[h]) Win.open(h);
      else if (['profile', 'me'].includes(h)) Win.open('about');
      else if (['work', 'apps'].includes(h)) Win.open('projects');
    };
    const wait_ = setInterval(() => { if (!booting) { clearInterval(wait_); setTimeout(after, 400); } }, 100);
  }

  /* ================= Go ================= */
  const about = $('.about');
  if (about) about.inert = true;
  applyColour();
  refreshScore();
  route();
  paintTabs();
  renderPeeks();
})();
