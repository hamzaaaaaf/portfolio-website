// byhamza.dev: a dashboard after the Xbox 360 "Metro" dashboard (fall 2011).
// Hubs of tiles, screens that slide in, apps and games that launch through a
// splash, the Guide over everything, achievements, controllers, a browser with
// a stick-driven cursor, and DOOM. The page itself never changes.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const OS = window.OS || { prefs: () => ({}), setPref() {}, achieve() {}, achieved: () => ({}), ACHIEVEMENTS: [], toggleTheme() {} };
  const prefs = () => OS.prefs();
  const reduce = () => root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => matchMedia('(max-width: 700px), (max-aspect-ratio: 4/5)').matches;
  const nested = window.top !== window.self;
  const depth = Number(new URLSearchParams(location.search).get('d')) || 0;
  const getJSON = (u) => fetch(u, { signal: AbortSignal.timeout(8000) }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
  };
  const sfx = (n) => window.XSound && window.XSound.play(n);
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce() ? Math.min(ms, 60) : ms));
  const I = (n) => `<svg class="tile__ico"><use href="#i-${n}"/></svg>`;

  /* ================= Content ================= */
  const PROJECTS = [
    {
      slug: 'panic-pack', name: 'Panic Pack!', short: 'panic pack!', art: 'art-panic', glyph: '!', meta: ['2026', 'Godot 4', 'GDScript', 'Windows'],
      overview: 'A first-person beat-the-clock game. Your taxi is coming. Search the house, grab everything on your packing list before time runs out, then get out the front door.',
      points: ['A new randomised packing list every run, pulled up with <kbd>Tab</kbd>', 'A flight countdown, then the taxi arrives and you sprint for the door', 'Pick up, carry and drop physics objects around the house', 'Doors that open, a radio that plays, footsteps as you move', 'A furnished low-poly house built from food, furniture and building asset packs'],
      extra: '<h3>controls</h3><dl class="rows"><div><dt><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dt><dd>Move</dd></div><div><dt>Mouse</dt><dd>Look</dd></div><div><dt><kbd>E</kbd></dt><dd>Interact, pick up, drop</dd></div><div><dt><kbd>Tab</kbd></dt><dd>Hold to view the packing list</dd></div><div><dt><kbd>Space</kbd></dt><dd>Jump</dd></div></dl>',
      actions: [['Download', 'https://github.com/hamzaaaaaf/panic-pack-/releases/tag/v0.1.0', 'games'], ['View Source', 'https://github.com/hamzaaaaaf/panic-pack-', 'git']],
    },
    {
      slug: 'instagram-unliker', name: 'Instagram Unliker', short: 'instagram unliker', art: 'art-heart', glyph: '♡', meta: ['2026', 'JavaScript', 'Browser console'],
      overview: 'Instagram makes you unlike old posts one at a time. This script does it in bulk from your own browser, with no password, cookie or API key involved.',
      points: ['Enters Instagram’s Select mode on the Likes page by itself', 'Selects every loaded post, unlikes them and confirms the dialog', 'Waits between batches so Instagram can catch up, then keeps going', 'Stops cleanly with a console message if the page changes underneath it', 'Logs each batch to the console so you can watch it work'],
      extra: '<h3>how to use it</h3><ol><li>Open Your Activity, then Interactions, then Likes</li><li>Open the browser console</li><li>Paste the script and press Enter</li></ol>',
      actions: [['View Source', 'https://github.com/hamzaaaaaf/instagram-post-unliker', 'git']],
    },
    {
      slug: 'this-site', name: 'byhamza.dev', short: 'byhamza.dev', art: 'art-site', glyph: 'h', meta: ['2026', 'HTML', 'CSS', 'JavaScript', 'Workers', 'D1'],
      overview: 'The site you’re on: a recreation of the 2011 Xbox 360 dashboard, served from Cloudflare’s edge with no framework and no build step.',
      points: ['Hubs of tiles laid out to the measurements of the real dashboard', 'Every app launches through a splash and quits from the Guide', 'Xbox, PlayStation and Nintendo controllers, mapped by button position', '1000 gamerscore of achievements, with sounds synthesised in the browser', 'Shareware DOOM on WebAssembly, and a browser with a stick-driven cursor'],
      extra: '<h3>under the hood</h3><dl class="rows"><div><dt>Hosting</dt><dd>Cloudflare Workers</dd></div><div><dt>Data</dt><dd>D1 for the guestbook and sparks</dd></div><div><dt>Live</dt><dd>A Durable Object relays who is online</dd></div></dl>',
      actions: [['View Source', 'https://github.com/hamzaaaaaf/portfolio-website', 'git'], ['Open Terminal', '#terminal', 'term']],
    },
  ];
  const FAVS = ['batman-arkham-knight', 'uncharted-4-a-thief-s-end', 'grand-theft-auto-v', 'minecraft'];

  // Everything that can be opened. Screens slide in over the dashboard;
  // apps and games launch full screen through a splash.
  const APPS = {
    doom: { kind: 'game', name: 'DOOM', url: '/doom/', bg: '#000' },
    ie: { kind: 'ie', name: 'Internet Explorer', icon: 'ie', bg: '#1ba1e2' },
    guestbook: { kind: 'app', name: 'Guestbook', url: '/guestbook', icon: 'book', bg: '#e8623a' },
    terminal: { kind: 'app', name: 'Terminal', url: '/terminal', icon: 'term', bg: '#1f1f1f' },
    draw: { kind: 'app', name: 'Kaleidoscope', url: '/draw', icon: 'kaleido', bg: '#8e3fb5' },
    achievements: { kind: 'screen', name: 'Achievements', icon: 'trophy' },
    profile: { kind: 'screen', name: 'Hamza’s Profile', icon: 'user' },
    projects: { kind: 'screen', name: 'Projects', icon: 'folder' },
    stats: { kind: 'screen', name: 'Stats', icon: 'chart' },
    library: { kind: 'screen', name: 'My Games', icon: 'games' },
    pins: { kind: 'screen', name: 'My Pins', icon: 'pin' },
    recent: { kind: 'screen', name: 'Recent', icon: 'clock' },
    system: { kind: 'screen', name: 'System Info', icon: 'info' },
  };
  // Old addresses and names land somewhere sensible.
  const ALIAS = { about: 'profile', work: 'projects', finder: 'library', play: 'games', type: 'games', arcade: 'games', wyr: 'games', snake: 'games', breakout: 'games' };
  const PINS = ['projects', 'profile', 'doom', 'ie', 'guestbook', 'stats'];
  const EXPLORE = ['profile', 'projects', 'stats', 'achievements', 'library', 'pins', 'recent', 'system', 'doom', 'ie', 'guestbook', 'terminal', 'draw'];

  /* ================= Elements ================= */
  const panes = $('#panes'), powerEl = $('.power'), bootEl = $('.boot');
  const screenEl = $('.screen'), screenBody = $('.screen__body'), screenPiv = $('.screen__pivots'), screenOver = $('.screen__over');
  const appEl = $('.app'), appBody = $('.app__body'), splash = $('.splash');
  const guideEl = $('.guide'), dialogEl = $('.dialog'), blackout = $('.blackout');

  /* ================= Focus ================= */
  let inputMode = 'pointer';
  const markFocus = (el) => {
    $$('.is-focus').forEach((x) => x !== el && x.classList.remove('is-focus'));
    if (el && inputMode !== 'pointer') el.classList.add('is-focus');
  };
  addEventListener('pointerdown', () => { inputMode = 'pointer'; markFocus(null); }, true);
  addEventListener('mousemove', (e) => { if (e.movementX || e.movementY) { if (inputMode !== 'pointer' && ctx() !== 'app') { inputMode = 'pointer'; } } }, { passive: true });
  document.addEventListener('focusin', (e) => markFocus(e.target));
  function focusEl(el, sound) {
    if (!el) return;
    el.focus({ preventScroll: true });
    markFocus(el);
    const box = el.closest('.screen__body, .guide__lists, .pane');
    if (box && (box.classList.contains('screen__body') || phone())) {
      const r = rectOf(el), b = box.getBoundingClientRect();
      if (r.bottom > b.bottom - 8) box.scrollBy({ top: r.bottom - b.bottom + 24, behavior: reduce() ? 'auto' : 'smooth' });
      else if (r.top < b.top + 8) box.scrollBy({ top: r.top - b.top - 24, behavior: reduce() ? 'auto' : 'smooth' });
    }
    if (el.classList.contains('tile') && el.closest('.pane')) setAnchorFrom(el);
    if (el.dataset.ach !== undefined || el.classList.contains('ach')) showAchDetail(el);
    if (sound) sfx('nav');
  }
  // The focused tile is scaled up, so read its layout box without the transform.
  function rectOf(el) {
    const r = el.getBoundingClientRect();
    const tf = getComputedStyle(el).transform;
    if (!tf || tf === 'none') return r;
    const m = new DOMMatrixReadOnly(tf), sx = Math.hypot(m.a, m.b) || 1, sy = Math.hypot(m.c, m.d) || 1;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, w = r.width / sx, h = r.height / sy;
    return { left: cx - w / 2, right: cx + w / 2, top: cy - h / 2, bottom: cy + h / 2, width: w, height: h };
  }

  /* ================= Context ================= */
  const guideOpen = () => !guideEl.hidden;
  const ctx = () => (!powerEl.hidden ? 'power' : !bootEl.hidden ? 'boot' : !dialogEl.hidden ? 'dialog' : guideOpen() ? 'guide' : app.id ? 'app' : screen.id ? 'screen' : 'dash');

  /* ================= Hubs ================= */
  const TABS = $$('.pivot').map((b) => b.dataset.tab);
  let tab = TABS.indexOf('home');
  $$('.pane').forEach((p) => $$('.tile', p).forEach((t, i) => t.style.setProperty('--n', i)));
  const activePane = () => $$('.pane')[tab];
  function setTab(i, { sound = true, focus = false, url = true } = {}) {
    i = Math.max(0, Math.min(TABS.length - 1, i));
    const changed = i !== tab;
    tab = i;
    panes.style.setProperty('--i', i);
    $$('.pivot').forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    $$('.pane').forEach((p, k) => {
      p.classList.toggle('is-active', k === i);
      p.setAttribute('aria-hidden', String(k !== i));
      $$('button, a, input', p).forEach((el) => { el.tabIndex = k === i ? 0 : -1; });
    });
    if (changed && sound) sfx('pivot');
    if (focus === 'pivot') focusEl($$('.pivot')[i]);
    else if (focus === 'tile') {
      const pick = cellTile(activePane(), anchor.row, 1) || $('.tile', activePane());
      if (pick) focusEl(pick);
    }
    if (url && !app.id && !screen.id) history.replaceState(null, '', `${location.pathname}${location.search}#${TABS[i]}`);
    if (TABS[i] === 'games') OS.achieve('gamer');
  }
  $$('.pivot').forEach((b, k) => b.addEventListener('click', () => setTab(k)));
  // Neighbouring hubs peek in at the edges; clicking one switches to it.
  panes.addEventListener('click', (e) => {
    const p = e.target.closest('.pane');
    if (!p || p.classList.contains('is-active')) return;
    e.preventDefault(); e.stopPropagation();
    setTab($$('.pane').indexOf(p));
  }, true);
  let wheelAt = 0;
  panes.addEventListener('wheel', (e) => {
    if (phone() || Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 30) return;
    e.preventDefault();
    if (performance.now() - wheelAt < 450) return;
    wheelAt = performance.now();
    setTab(tab + (e.deltaX > 0 ? 1 : -1));
  }, { passive: false });
  let tx = 0, ty = 0;
  panes.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  panes.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    setTab(tab + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ================= Navigation ================= */
  // On the dashboard, moves follow the grid itself (each tile knows its
  // row/column span) and remember the row or column you're travelling along,
  // like the real dashboard. Elsewhere, moves use geometry.
  const anchor = { row: 1, col: 1 };
  const areaOf = (el) => {
    const v = el.style.getPropertyValue('--a');
    if (!v) return null;
    const [r1, c1, r2, c2] = v.split('/').map((n) => Number(n.trim()));
    return { r1, c1, r2, c2 };
  };
  const gridTiles = (pane) => $$(':scope > .tiles > .tile', pane).filter(areaOf);
  function cellTile(pane, row, col, step = 1) {
    const tiles = gridTiles(pane);
    for (let c = col; c >= 1 && c <= 4; c += step) {
      const hit = tiles.find((t) => { const a = areaOf(t); return a.r1 <= row && row < a.r2 && a.c1 <= c && c < a.c2; });
      if (hit) return hit;
      // Nothing in this exact row: take the nearest row in this column.
      const col_ = tiles.filter((t) => { const a = areaOf(t); return a.c1 <= c && c < a.c2; });
      if (col_.length) return col_.sort((x, y) => Math.abs(areaOf(x).r1 - row) - Math.abs(areaOf(y).r1 - row))[0];
    }
    return null;
  }
  function setAnchorFrom(el) {
    const a = areaOf(el);
    if (!a) return;
    if (!(a.r1 <= anchor.row && anchor.row < a.r2)) anchor.row = a.r1;
    if (!(a.c1 <= anchor.col && anchor.col < a.c2)) anchor.col = a.c1;
  }
  function gridMove(cur, dir) {
    const pane = activePane(), a = areaOf(cur), tiles = gridTiles(pane);
    if (!a || !tiles.includes(cur)) return false;
    setAnchorFrom(cur);
    let target = null;
    if (dir === 'left' || dir === 'right') {
      const step = dir === 'right' ? 1 : -1;
      for (let c = dir === 'right' ? a.c2 : a.c1 - 1; c >= 1 && c <= 4 && !target; c += step) {
        target = tiles.find((t) => { const b = areaOf(t); return b.r1 <= anchor.row && anchor.row < b.r2 && b.c1 <= c && c < b.c2; });
      }
      if (!target) {
        const loose = $$('.tile, .tile--searchbox input', pane).filter((el) => el !== cur && !gridTiles(pane).includes(el) && el.getClientRects().length);
        const near = loose.length && spatialMove(loose, cur, dir);
        if (near) { focusEl(near, true); return true; }
      }
      if (target) { anchor.col = dir === 'right' ? areaOf(target).c1 : areaOf(target).c2 - 1; }
      else {
        // Off the edge: carry on into the next hub, keeping the row.
        const next = tab + step;
        if (next < 0 || next >= TABS.length) return 'edge';
        setTab(next);
        const t = cellTile(activePane(), anchor.row, dir === 'right' ? 1 : 4, step) || $('.tile', activePane());
        if (t) { focusEl(t); const ta = areaOf(t); if (ta) anchor.col = dir === 'right' ? ta.c1 : ta.c2 - 1; }
        return true;
      }
    } else {
      const step = dir === 'down' ? 1 : -1;
      for (let r = dir === 'down' ? a.r2 : a.r1 - 1; r >= 1 && r <= 3 && !target; r += step) {
        target = tiles.find((t) => { const b = areaOf(t); return b.c1 <= anchor.col && anchor.col < b.c2 && b.r1 <= r && r < b.r2; });
      }
      if (!target) {
        const loose = $$('.tile, .tile--searchbox input', pane).filter((el) => el !== cur && !gridTiles(pane).includes(el) && el.getClientRects().length);
        const near = loose.length && spatialMove(loose, cur, dir);
        if (near) { focusEl(near, true); return true; }
      }
      if (target) anchor.row = dir === 'down' ? areaOf(target).r1 : areaOf(target).r2 - 1;
      else if (dir === 'up') { focusEl($$('.pivot')[tab], true); return true; }
      else return 'edge';
    }
    focusEl(target.classList.contains('tile--searchbox') ? $('input', target) : target, true);
    return true;
  }
  function items() {
    switch (ctx()) {
      case 'dialog': return $$('.dialog__btns button');
      case 'guide': return $$('.guide__list:not([hidden]) button');
      case 'screen': return [...$$('.screen__pivots button'), ...$$('[data-nav]', screenBody)].filter((el) => el.offsetParent !== null || el.getClientRects().length);
      case 'dash': return [...$$('.tile', activePane()).filter((t) => !t.disabled && !t.classList.contains('tile--searchbox')), ...$$('.tile--searchbox input', activePane()), ...$$('.pivot'), $('.me__card')];
      default: return [];
    }
  }
  function spatialMove(list, cur, dir) {
    const a = rectOf(cur), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, score = Infinity;
    for (const el of list) {
      if (el === cur) continue;
      const b = rectOf(el);
      if (!b.width) continue;
      const bx = b.left + b.width / 2, by = b.top + b.height / 2;
      let main, side;
      if (dir === 'right') { if (bx <= ax + 2 || b.left < a.left + 4) continue; main = Math.max(0, b.left - a.right); side = Math.max(0, Math.abs(by - ay) - (a.height + b.height) / 4); }
      if (dir === 'left') { if (bx >= ax - 2 || b.right > a.right - 4) continue; main = Math.max(0, a.left - b.right); side = Math.max(0, Math.abs(by - ay) - (a.height + b.height) / 4); }
      if (dir === 'down') { if (by <= ay + 2 || b.top < a.top + 4) continue; main = Math.max(0, b.top - a.bottom); side = Math.max(0, Math.abs(bx - ax) - (a.width + b.width) / 4); }
      if (dir === 'up') { if (by >= ay - 2 || b.bottom > a.bottom - 4) continue; main = Math.max(0, a.top - b.bottom); side = Math.max(0, Math.abs(bx - ax) - (a.width + b.width) / 4); }
      const s = main + side * 3 + Math.hypot(bx - ax, by - ay) * 0.05;
      if (s < score) { score = s; best = el; }
    }
    return best;
  }
  function move(dir) {
    const c = ctx();
    const list = items();
    if (!list.length) return;
    let cur = document.activeElement;
    if (!list.includes(cur)) {
      const first = c === 'dash' ? (cellTile(activePane(), anchor.row, anchor.col) || $('.tile', activePane())) : c === 'screen' ? ($('[data-nav]', screenBody) || list[0]) : list[0];
      focusEl(first, true);
      return;
    }
    if (c === 'guide' && (dir === 'left' || dir === 'right')) { guideTab(guideTabI + (dir === 'left' ? -1 : 1)); return; }
    if (c === 'dash' && cur.classList.contains('pivot')) {
      if (dir === 'left' || dir === 'right') { setTab(tab + (dir === 'left' ? -1 : 1), { focus: 'pivot' }); return; }
      if (dir === 'down') { focusEl(cellTile(activePane(), 1, Math.max(1, anchor.col)) || $('.tile', activePane()), true); return; }
    }
    if (c === 'screen' && cur.closest('.screen__pivots')) {
      if (dir === 'left' || dir === 'right') { screenPivot(screen.pi + (dir === 'left' ? -1 : 1), true); return; }
      if (dir === 'down') { focusEl($('[data-nav]', screenBody), true); return; }
    }
    if (c === 'dash' && !phone() && cur.closest('.pane') && areaOf(cur)) {
      const r = gridMove(cur, dir);
      if (r === true) return;
      if (r === 'edge') { nope(cur); return; }
    }
    if (c === 'screen' && (dir === 'up' || dir === 'down') && cur.scrollHeight > cur.clientHeight + 4) {
      const room = dir === 'down' ? cur.scrollHeight - cur.clientHeight - cur.scrollTop : cur.scrollTop;
      if (room > 2) { cur.scrollBy({ top: (dir === 'down' ? 1 : -1) * cur.clientHeight * 0.6, behavior: reduce() ? 'auto' : 'smooth' }); sfx('nav'); return; }
    }
    let pool = list;
    if (c === 'dash' && cur.closest('.pane') && dir !== 'up') pool = list.filter((el) => el.closest('.pane'));
    if (c === 'screen' && !cur.closest('.screen__pivots') && dir !== 'up') pool = list.filter((el) => !el.closest('.screen__pivots'));
    const best = spatialMove(pool, cur, dir) || (dir === 'up' && c === 'dash' ? $$('.pivot')[tab] : null) || (dir === 'up' && c === 'screen' && screen.pivots.length > 1 ? $$('.screen__pivots button')[screen.pi] : null);
    if (best) focusEl(best, true); else nope(cur);
  }

  /* ================= "Can't do that" ================= */
  let bPresses = 0;
  function nope(el) {
    sfx('nope');
    const t = el && el !== document.body ? el : (activePane() && $('.tiles', activePane()));
    if (!t || !t.animate) return;
    t.animate([{ translate: '0 0' }, { translate: '-8px 0' }, { translate: '7px 0' }, { translate: '-4px 0' }, { translate: '0 0' }], { duration: 360, easing: 'ease-out' });
  }

  /* ================= Screens ================= */
  const screen = { id: null, sub: null, from: null, pivots: [], pi: 0 };
  const SCREENS = {
    achievements: { over: 'byhamza.dev', titles: ['achievements'], render: renderAchievements },
    profile: { over: 'hamza', titles: ['profile'], render: renderProfile },
    projects: { over: 'projects', titles: PROJECTS.map((p) => p.short), render: renderProject },
    stats: { over: 'hamza', titles: ['stats'], render: renderStats },
    library: { over: 'games', titles: ['my games'], render: renderLibrary },
    pins: { over: 'home', titles: ['my pins'], render: (b) => renderLaunchers(b, PINS) },
    recent: { over: 'home', titles: ['recent'], render: (b) => renderLaunchers(b, store.get('recent', []), 'Nothing yet. Open something and it’ll show up here.') },
    system: { over: 'settings', titles: ['system'], render: renderSystem },
  };
  function openScreen(id, sub, from) {
    const S = SCREENS[id];
    if (!S) return;
    const same = screen.id === id;
    screen.id = id; screen.from = from || screen.from; screen.sub = sub;
    screen.pivots = S.titles;
    screen.pi = id === 'projects' ? Math.max(0, PROJECTS.findIndex((p) => p.slug === sub)) : 0;
    document.body.classList.add('is-screen');
    screenEl.hidden = false;
    screenEl.classList.remove('is-out');
    screenOver.textContent = S.over;
    screenPiv.innerHTML = S.titles.map((t, i) => `<button type="button" role="tab" aria-selected="${i === screen.pi}">${esc(t)}</button>`).join('');
    $$('button', screenPiv).forEach((b, i) => b.addEventListener('click', () => screenPivot(i)));
    paintScreen(!same);
    track(id);
    const ach = { profile: 'profile', stats: 'stats', library: 'library', pins: 'pinned', recent: 'recent' }[id];
    if (ach) OS.achieve(ach);
  }
  function paintScreen(animate) {
    const S = SCREENS[screen.id];
    screenBody.scrollTop = 0;
    screenBody.innerHTML = '';
    S.render(screenBody, screen.pi);
    $$('[data-nav]', screenBody).forEach((el, i) => { el.style.setProperty('--n', i); if (!el.hasAttribute('tabindex') && !/^(A|BUTTON)$/.test(el.tagName)) el.tabIndex = 0; });
    if (animate !== false) { screenEl.classList.remove('is-in'); void screenEl.offsetWidth; screenEl.classList.add('is-in'); }
    if (inputMode !== 'pointer') setTimeout(() => focusEl($('[data-nav]', screenBody)), 30);
  }
  function screenPivot(i, focusPivot) {
    if (screen.pivots.length < 2) return;
    i = (i + screen.pivots.length) % screen.pivots.length;
    if (i === screen.pi) return;
    screen.pi = i;
    sfx('pivot');
    $$('button', screenPiv).forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    if (screen.id === 'projects') history.replaceState(null, '', `#projects/${PROJECTS[i].slug}`);
    paintScreen(true);
    if (focusPivot) focusEl($$('button', screenPiv)[i]);
  }
  function closeScreen(instant) {
    if (!screen.id) return;
    const from = screen.from;
    const done = () => {
      screenEl.hidden = true; screenBody.innerHTML = '';
      screenEl.classList.remove('is-out', 'is-in');
      Object.assign(screen, { id: null, sub: null, from: null, pivots: [], pi: 0 });
      document.body.classList.remove('is-screen');
      if (from && document.contains(from) && inputMode !== 'pointer') focusEl(from);
      else if (inputMode !== 'pointer') focusEl(cellTile(activePane(), anchor.row, anchor.col));
    };
    if (instant || reduce()) { done(); return; }
    screenEl.classList.add('is-out');
    setTimeout(done, 200);
  }

  /* ----- Screen renderers ----- */
  const when = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  function renderAchievements(box) {
    const got = OS.achieved(), list = OS.ACHIEVEMENTS;
    const g = refreshScore(), n = list.filter((a) => got[a.id]).length;
    const sorted = [...list].sort((a, b) => (got[b.id] ? 1 : 0) - (got[a.id] ? 1 : 0) || (got[b.id] || 0) - (got[a.id] || 0));
    box.innerHTML = `<div class="sgrid">
      <div class="panel ach-sum" style="--a:1/1/4/2">
        <div class="art-site">h</div>
        <div class="ach-sum__n">${n}<small> / ${list.length}</small></div>
        <div class="ach-sum__bar"><i style="width:${(n / list.length) * 100}%"></i></div>
        <div><span class="gs gs--lg"><i>G</i>${g} / 1000</span></div>
        <div class="ach-detail" data-achdetail><span class="dim">Select an achievement to see how to unlock it.</span></div>
      </div>
      <div style="--a:1/2/4/5"><div class="achs">${sorted.map((a) => {
        const on = !!got[a.id], hide = a.secret && !on;
        return `<button type="button" class="ach${on ? '' : ' is-locked'}" data-nav data-ach="${a.id}" aria-label="${esc(hide ? 'Secret achievement' : a.t)}">${on ? '' : '<svg class="ach__lock"><use href="#i-lock"/></svg>'}<span class="ach__g">${a.g}G</span><span class="ach__i">${hide ? '?' : a.i}</span><span class="ach__t">${esc(hide ? 'Secret achievement' : a.t)}</span></button>`;
      }).join('')}</div></div></div>`;
    $$('.ach', box).forEach((b) => { b.addEventListener('mouseenter', () => showAchDetail(b)); b.addEventListener('click', () => showAchDetail(b)); });
  }
  function showAchDetail(el) {
    const d = $('[data-achdetail]'), id = el.dataset.ach;
    if (!d || !id) return;
    const a = OS.ACHIEVEMENTS.find((x) => x.id === id), got = OS.achieved()[id];
    if (!a) return;
    const hide = a.secret && !got;
    d.innerHTML = `<b>${esc(hide ? 'Secret achievement' : a.t)}</b><span>${esc(hide ? 'Keep exploring to unlock this one.' : a.d)}</span><br><span class="dim">${a.g}G${got ? ` · Unlocked ${when(got)}` : ' · Locked'}</span>`;
  }
  function renderProfile(box) {
    const got = OS.achieved(), list = OS.ACHIEVEMENTS, n = list.filter((a) => got[a.id]).length;
    box.innerHTML = `<div class="sgrid">
      <div class="panel big-card" data-nav style="--a:1/1/4/3">
        <div class="big-card__top"><span class="pic"><i>h</i></span><div><div class="big-card__name">Hamza</div><span class="gs gs--lg"><i>G</i><span data-gs>${refreshScore()}</span></span><div class="stars" aria-label="Reputation: five stars">★★★★★</div></div></div>
        <div class="big-card__motto">“Turning curious ideas into real software.”</div>
        <dl class="rows"><div><dt>Studying</dt><dd>BSc Computer Science, second year</dd></div><div><dt>University</dt><dd>Aston University</dd></div><div><dt>Location</dt><dd>Birmingham, UK</dd></div><div><dt>Languages</dt><dd>Python, Java</dd></div><div><dt>Zone</dt><dd>Recreation</dd></div></dl>
        <div class="chips"><span>Python</span><span>Java</span><span>Godot</span><span>Git &amp; GitHub</span><span>Cloudflare</span><span>SQL</span><span>Data structures</span><span>Algorithms</span><span>OOP</span></div>
      </div>
      <div class="panel" data-nav style="--a:1/3/3/4"><h3>now</h3><ul>
        <li>Studying data structures, algorithms, OOP and software engineering at Aston.</li>
        <li>Learning Java for uni, Python for everything else.</li>
        <li>Practising LeetCode alongside the data structures module.</li>
        <li>Building this console, one tile at a time.</li>
        <li>Off the clock: games since Minecraft, and found-footage horror films.</li></ul></div>
      <div class="panel" data-nav style="--a:3/3/4/4"><h3>timeline</h3><div class="tl"><div><b>2025</b>Started at Aston University</div><div><b>Aug 26</b>Instagram Unliker</div><div><b>Sep 26</b>Panic Pack! and byhamza.dev</div></div></div>
      <button type="button" class="stile" data-nav data-open="achievements" style="--a:1/4/2/5">${I('trophy')}<span class="tile__label">${n} of ${list.length} Achievements</span></button>
      <a class="stile" data-nav href="mailto:hello@byhamza.dev" data-ach-on="messenger" style="--a:2/4/3/5">${I('mail')}<span class="tile__label">Send Message</span></a>
      <a class="stile art-linkedin" data-nav href="https://www.linkedin.com/in/hamza-faisal-125833263/" target="_blank" rel="noopener" data-ach-on="networker" style="--a:3/4/4/5">${I('in')}<span class="tile__label">LinkedIn</span></a>
    </div>`;
  }
  function renderProject(box, i) {
    const p = PROJECTS[i];
    const read = new Set(store.get('readProjects', []));
    read.add(p.slug); store.set('readProjects', [...read]);
    if (PROJECTS.every((x) => read.has(x.slug))) OS.achieve('reader');
    box.innerHTML = `<div class="sgrid">
      <div class="proj-art ${p.art}" style="--a:1/1/3/3"><b>${p.glyph}</b><span class="hero__text"><b>${esc(p.name)}</b><span>${p.meta.join(' · ')}</span></span></div>
      ${p.actions.map(([label, href, icon], k) => {
        const ext = href.startsWith('http');
        const attrs = href.startsWith('#') ? `href="${href}" data-open="${href.slice(1)}"` : `href="${href}"${ext ? ' target="_blank" rel="noopener" data-ach-on="source"' : ''}`;
        return `<a class="stile" data-nav ${attrs} style="--a:3/${k + 1}/4/${k + 2}">${I(icon)}<span class="tile__label">${esc(label)}</span></a>`;
      }).join('')}
      <div class="panel" data-nav style="--a:1/3/4/5"><div class="proj-meta">${p.meta.map((m) => `<span>${esc(m)}</span>`).join('')}</div><p>${p.overview}</p><h3>what it does</h3><ul>${p.points.map((x) => `<li>${x}</li>`).join('')}</ul>${p.extra}</div>
    </div>`;
  }
  let LC = null, GH = null;
  function renderStats(box) {
    box.innerHTML = '<p class="empty">Loading…</p>';
    Promise.all([LC || getJSON('/api/leetcode').catch(() => getJSON('/leetcode.json')).catch(() => null), GH || getJSON('/api/github').catch(() => getJSON('/github.json')).catch(() => null)]).then(([lc, gh]) => {
      LC = lc; GH = gh;
      if (screen.id !== 'stats') return;
      const s = lc ? lc.solved : { All: '–', Easy: 0, Medium: 0, Hard: 0 }, tot = lc ? lc.totals : { Easy: 1, Medium: 1, Hard: 1 };
      const langs = gh ? Object.entries(gh.languages || {}).sort((a, b) => b[1] - a[1]).slice(0, 5) : [];
      const lsum = langs.reduce((x, [, v]) => x + v, 0) || 1;
      const COLORS = { Python: '#3572A5', JavaScript: '#f1e05a', HTML: '#e34c26', CSS: '#663399', GDScript: '#5dc21e', Java: '#b07219' };
      const repos = gh ? (gh.repos || []).slice(0, 4) : [];
      box.innerHTML = `<div class="sgrid">
        <div class="panel bigstat art-lc" data-nav style="--a:1/1/3/2"><b>${s.All}</b><span>LeetCode problems solved</span></div>
        <div class="panel" data-nav style="--a:1/2/3/3"><h3>by difficulty</h3><div class="bars">
          ${[['Easy', '#5dc21e'], ['Medium', '#ffb13b'], ['Hard', '#e3242b']].map(([k, c]) => `<div class="bar"><span><span>${k}</span><b>${s[k]} / ${tot[k]}</b></span><i style="--p:${Math.max(0.01, s[k] / tot[k])};--c:${c}"></i></div>`).join('')}
          <span class="dim">${lc ? `${lc.activeDays} active days this year` : 'Offline'}</span></div></div>
        <div class="panel" data-nav style="--a:1/3/3/4"><h3>recently solved</h3><div class="tl">${lc ? lc.recent.slice(0, 6).map((r) => `<div><b>${new Date(r.ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</b>${esc(r.title)}</div>`).join('') : '<span class="dim">Offline</span>'}</div></div>
        <div class="panel" data-nav style="--a:1/4/3/5"><h3>languages</h3><div class="bars">${langs.map(([k, v]) => `<div class="bar"><span><span>${esc(k)}</span><b>${Math.round((v / lsum) * 100)}%</b></span><i style="--p:${v / lsum};--c:${COLORS[k] || '#9a9a9a'}"></i></div>`).join('')}</div></div>
        ${repos.map((r, k) => `<a class="stile art-github" data-nav href="${esc(r.url)}" target="_blank" rel="noopener" data-ach-on="source" style="--a:3/${k + 1}/4/${k + 2}">${I('git')}<span class="tile__label">${esc(r.name)} · ${esc(r.language || 'code')}</span></a>`).join('')}
      </div>`;
      $$('[data-nav]', box).forEach((el, i) => { el.style.setProperty('--n', i); if (!/^(A|BUTTON)$/.test(el.tagName)) el.tabIndex = 0; });
      if (inputMode !== 'pointer') focusEl($('[data-nav]', box));
    });
  }
  let GAMES = null;
  const games = () => (GAMES ? Promise.resolve(GAMES) : getJSON('/games.json').then((g) => (GAMES = g)));
  const cover = (g) => `<div class="cover cover--game" style="--c1:${g.c[0]};--c2:${g.c[1]};--c3:${g.c[2]}"><span class="cover__band">${esc(g.g)} · ${g.y}</span><span class="cover__g">${g.i}</span><span class="cover__t">${esc(g.t)}</span></div>`;
  function renderLibrary(box) {
    box.innerHTML = '<p class="empty">Loading…</p>';
    games().then((list) => {
      if (screen.id !== 'library') return;
      box.innerHTML = `<div class="lib">${list.filter((g) => g.h).map((g) => `<figure data-nav tabindex="0">${cover(g)}<figcaption>${esc(g.t)} · ${g.y}</figcaption></figure>`).join('')}</div>`;
      $$('[data-nav]', box).forEach((el, i) => el.style.setProperty('--n', i));
      if (inputMode !== 'pointer') focusEl($('[data-nav]', box));
    }).catch(() => { box.innerHTML = '<p class="empty">Offline.</p>'; });
  }
  function renderLaunchers(box, ids, empty) {
    const list = ids.filter((id) => APPS[id]);
    if (!list.length) { box.innerHTML = `<p class="empty">${esc(empty || '')}</p>`; return; }
    const cells = ['1/1/2/2', '1/2/2/3', '1/3/2/4', '1/4/2/5', '2/1/3/2', '2/2/3/3', '2/3/3/4', '2/4/3/5', '3/1/4/2', '3/2/4/3', '3/3/4/4', '3/4/4/5'];
    box.innerHTML = `<div class="sgrid">${list.slice(0, 12).map((id, k) => {
      const A = APPS[id];
      const art = id === 'doom' ? `<span class="art art-doom" style="position:absolute;inset:0"><span class="art"><span class="doom-word">DOOM</span></span></span>` : I(A.icon || 'games');
      return `<button type="button" class="stile" data-nav data-open="${id}" style="--a:${cells[k]}">${art}<span class="tile__label">${esc(A.name)}</span></button>`;
    }).join('')}</div>`;
  }
  function renderSystem(box) {
    const pad = window.XPad && window.XPad.state();
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    const brand = (id) => ({ sony: 'PlayStation controller', nintendo: 'Nintendo controller', xbox: 'Xbox controller', generic: 'Controller' })[window.XPad ? window.XPad.brandOf(id) : 'generic'];
    const rows = [
      ['Console', 'byhamza.dev'],
      ['Dashboard', 'Metro, after the fall 2011 Xbox 360 update'],
      ['Controllers', pads.length ? pads.map((p) => `${brand(p.id)} (${esc(p.id.split('(')[0].trim())})`).join('<br>') : 'None connected. Plug one in and press any button'],
      ['Buttons', 'Mapped by position: bottom A, right B, left X, top Y'],
      ['Gamerscore', `${refreshScore()} / 1000`],
      ['Built with', 'HTML, CSS and JavaScript. No framework, no build step'],
      ['Hosting', 'Cloudflare Workers, D1 and a Durable Object'],
      ['Sounds', 'Synthesised in the browser with Web Audio'],
      ['DOOM', 'Shareware v1.9 (id Software) on Chocolate Doom for WebAssembly, <a href="https://github.com/cloudflare/doom-wasm" target="_blank" rel="noopener">source (GPL)</a>'],
      ['Source', '<a href="https://github.com/hamzaaaaaf/portfolio-website" target="_blank" rel="noopener">github.com/hamzaaaaaf/portfolio-website</a>'],
    ];
    void pad;
    box.innerHTML = `<div class="panel" data-nav><dl class="rows">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`;
  }

  /* ================= Apps and games ================= */
  const app = { id: null, kind: null, frame: null, ready: false, from: null, host: null, startedAt: 0 };
  let pushed = false, afterClose = null;
  function track(id) {
    if (!['recent', 'pins'].includes(id)) {
      const r = store.get('recent', []).filter((x) => x !== id);
      r.unshift(id); store.set('recent', r.slice(0, 12));
    }
    const o = new Set(store.get('opened', []));
    o.add(id); store.set('opened', [...o]);
    if (EXPLORE.every((x) => o.has(x))) OS.achieve('explorer');
  }
  async function startApp(id, sub, tileEl) {
    const A = APPS[id];
    track(id);
    if (tileEl && !reduce()) tileEl.classList.add('is-launching');
    sfx('launch');
    blackout.hidden = false; void blackout.offsetWidth; blackout.classList.add('is-on');
    await wait(300);
    if (tileEl) tileEl.classList.remove('is-launching');
    Object.assign(app, { id, kind: A.kind, ready: false, from: tileEl || null, startedAt: performance.now() });
    appEl.hidden = false;
    appEl.classList.toggle('app--light', A.kind === 'app');
    // Splash: the app's colour and mark, with the Metro loading dots.
    splash.style.setProperty('--splash', A.bg || '#000');
    splash.classList.toggle('splash--doom', id === 'doom');
    $('.splash__art', splash).innerHTML = id === 'doom' ? '<span class="doom-word">DOOM</span>' : `<svg><use href="#i-${A.icon}"/></svg>`;
    $('.splash__name', splash).textContent = id === 'doom' ? '' : A.name;
    splash.hidden = false; splash.classList.remove('is-out');
    blackout.classList.remove('is-on');
    setTimeout(() => { blackout.hidden = true; }, 300);
    if (A.kind === 'ie') { app.host = IE.open(appBody); }
    else {
      const f = document.createElement('iframe');
      f.title = A.name;
      f.allow = 'gamepad; fullscreen; clipboard-write; autoplay';
      f.src = A.url + (sub ? `#${sub}` : '');
      f.addEventListener('load', () => { if (A.kind !== 'game') app.ready = true; });
      appBody.appendChild(f);
      app.frame = f;
    }
    if (id === 'doom') { OS.achieve('doom'); setTimeout(() => toast('Press Back + Start, or Home, for the Guide', 'pad'), 2600); }
    if (id === 'ie') OS.achieve('browser');
    const min = A.kind === 'game' ? 2200 : 1300;
    const t0 = performance.now();
    while ((!app.ready || performance.now() - t0 < min) && performance.now() - t0 < 12000 && app.id === id) await wait(80);
    if (app.id !== id) return;
    splash.classList.add('is-out');
    setTimeout(() => { splash.hidden = true; }, 400);
    try { if (app.frame) app.frame.contentWindow.focus(); } catch (e) { /* not ready */ }
  }
  async function stopApp({ toHome = false, sound = true } = {}) {
    if (!app.id) return;
    const wasId = app.id;
    blackout.hidden = false; void blackout.offsetWidth; blackout.classList.add('is-on');
    if (sound) sfx(toHome ? 'home' : 'back');
    await wait(280);
    if (app.id !== wasId) return;
    if (app.kind === 'ie') IE.close();
    if (app.frame) app.frame.remove();
    appBody.innerHTML = '';
    splash.hidden = true;
    appEl.hidden = true;
    const from = app.from;
    Object.assign(app, { id: null, kind: null, frame: null, ready: false, from: null, host: null });
    if (toHome) setTab(TABS.indexOf('home'), { sound: false, url: false });
    document.body.classList.add('is-entering');
    setTimeout(() => document.body.classList.remove('is-entering'), 1200);
    blackout.classList.remove('is-on');
    setTimeout(() => { blackout.hidden = true; }, 300);
    if (inputMode !== 'pointer') focusEl(!toHome && from && document.contains(from) ? from : cellTile(activePane(), anchor.row, anchor.col));
  }

  // Opening anything adds a history entry, so the browser's back button
  // behaves like B. The hash drives what's on screen.
  function launch(id, sub, origin) {
    id = ALIAS[id] || id;
    if (TABS.includes(id)) { goTab(id); return; }
    if (!APPS[id]) return;
    const go = () => {
      if (APPS[id].kind === 'screen') sfx('select');
      pendingOrigin = origin || null;
      pushed = true;
      const h = sub ? `${id}/${sub}` : id;
      if (location.hash.slice(1) === h) route(false); else location.hash = h;
    };
    // A game is running: the real console asks before quitting it.
    if (app.id && app.kind === 'game' && app.id !== id) {
      confirmQuit().then((ok) => { if (ok) { stopApp({ sound: false }).then(go); } });
      return;
    }
    go();
  }
  let pendingOrigin = null;
  function parseHash() {
    const [raw, sub] = decodeURIComponent(location.hash.slice(1)).split('/');
    return { id: ALIAS[raw] || raw, sub };
  }
  async function route(first) {
    const { id, sub } = parseHash();
    const A = APPS[id];
    if (A && A.kind === 'screen') {
      if (app.id) await stopApp({ sound: false });
      openScreen(id, sub, pendingOrigin);
    } else if (A) {
      if (screen.id) closeScreen(true);
      if (app.id !== id) { if (app.id) await stopApp({ sound: false }); startApp(id, sub, pendingOrigin); }
    } else {
      if (app.id) await stopApp({ toHome: afterClose === 'home' });
      if (screen.id) { sfx('back'); closeScreen(); }
      const t = afterClose === 'home' ? TABS.indexOf('home') : TABS.indexOf(id);
      if (t >= 0) setTab(t, { sound: !first, url: afterClose === 'home' });
      afterClose = null;
    }
    pendingOrigin = null;
    if (first) pushed = false;
  }
  addEventListener('hashchange', () => route(false));
  // Leave whatever is open: back through history if we added the entry.
  function leave(toHome) {
    afterClose = toHome ? 'home' : null;
    if (pushed) { pushed = false; history.back(); return; }
    history.replaceState(null, '', `#${toHome ? 'home' : TABS[tab]}`);
    route(false);
  }
  function goTab(name) {
    if (app.id || screen.id) { afterClose = null; pushed = false; history.replaceState(null, '', `#${name}`); route(false); }
    else setTab(TABS.indexOf(name), { focus: inputMode === 'pointer' ? false : 'tile' });
  }
  function back() {
    switch (ctx()) {
      case 'dialog': answer(false); break;
      case 'guide': closeGuide(); break;
      case 'screen': leave(false); break;
      case 'app': if (app.kind === 'app') { leave(false); } else if (app.kind === 'ie') { IE.back(); } break;
      case 'dash': if (document.activeElement && document.activeElement.matches('input[data-search]')) { document.activeElement.blur(); break; } nope($('.tiles', activePane())); if (++bPresses >= 3) OS.achieve('persistent'); break;
      default:
    }
  }
  function xboxHome() {
    closeGuide(true);
    if (app.id && app.kind === 'game') {
      confirmQuit().then((ok) => { if (ok) { OS.achieve('ragequit'); leave(true); } else refocusApp(); });
      return;
    }
    if (app.id || screen.id) { leave(true); return; }
    sfx('home');
    setTab(TABS.indexOf('home'), { focus: inputMode === 'pointer' ? false : 'tile' });
  }
  const confirmQuit = () => ask({ title: `Quit ${APPS[app.id].name}?`, text: `Are you sure you want to quit ${APPS[app.id].name} and go to Xbox Home? Any unsaved progress will be lost.` });
  const refocusApp = () => { try { if (app.frame) app.frame.contentWindow.focus(); } catch (e) { /* gone */ } };

  /* ================= Dialog ================= */
  let dialogResolve = null, dialogReturn = null;
  function ask({ title, text }) {
    dialogReturn = document.activeElement;
    $('.dialog__title').textContent = title;
    $('.dialog__text').textContent = text;
    dialogEl.hidden = false;
    sfx('guide');
    setTimeout(() => focusEl($('[data-dialog="no"]')), 20);
    return new Promise((r) => { dialogResolve = r; });
  }
  function answer(yes) {
    if (dialogEl.hidden) return;
    dialogEl.hidden = true;
    sfx(yes ? 'select' : 'back');
    const r = dialogResolve; dialogResolve = null;
    if (!yes && dialogReturn && document.contains(dialogReturn)) dialogReturn.focus({ preventScroll: true });
    if (r) r(yes);
  }
  dialogEl.addEventListener('click', (e) => { const b = e.target.closest('[data-dialog]'); if (b) answer(b.dataset.dialog === 'yes'); else if (e.target === dialogEl) answer(false); });

  /* ================= Guide ================= */
  let guideTabI = 0, guideReturn = null;
  function guideTab(i) {
    const tabs = $$('.guide__tabs button');
    i = (i + tabs.length) % tabs.length;
    if (i !== guideTabI) sfx('pivot');
    guideTabI = i;
    tabs.forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    $$('.guide__list').forEach((l, k) => { l.hidden = k !== i; });
    if (guideOpen()) focusEl($('.guide__list:not([hidden]) button'));
  }
  $$('.guide__tabs button').forEach((b, i) => b.addEventListener('click', () => guideTab(i)));
  function openGuide() {
    if (guideOpen() || !dialogEl.hidden) return;
    guideReturn = document.activeElement;
    guideEl.hidden = false;
    sfx('guide');
    OS.achieve('spotlight');
    settingLabels();
    guideTab(guideTabI);
    setTimeout(() => focusEl($('.guide__list:not([hidden]) button')), 20);
  }
  function closeGuide(silent) {
    if (!guideOpen()) return;
    guideEl.hidden = true;
    if (!silent) sfx('guideClose');
    if (app.id) refocusApp();
    else if (!silent && guideReturn && document.contains(guideReturn)) focusEl(guideReturn);
  }
  const toggleGuide = () => (guideOpen() ? closeGuide() : openGuide());
  guideEl.addEventListener('click', (e) => { if (e.target === guideEl) closeGuide(); });

  /* ================= Clicks ================= */
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) {
      e.preventDefault();
      if (guideOpen()) closeGuide(true);
      const [id, sub] = o.dataset.open.split('/');
      launch(id, sub, o.classList.contains('tile') ? o : null);
      return;
    }
    const g = e.target.closest('[data-go]');
    if (g) { closeGuide(true); goTab(g.dataset.go); return; }
    if (e.target.closest('[data-home]')) { xboxHome(); return; }
    if (e.target.closest('[data-back]')) { back(); return; }
    if (e.target.closest('[data-guide]')) { toggleGuide(); return; }
    if (e.target.closest('[data-poweroff]')) { closeGuide(true); powerOff(); return; }
    const s = e.target.closest('[data-set]');
    if (s) { changeSetting(s.dataset.set); return; }
    const ach = e.target.closest('[data-ach-on], .tile[data-ach]');
    if (ach) { OS.achieve(ach.dataset.achOn || ach.dataset.ach); }
    if (e.target.closest('a.tile, a.stile')) sfx('select');
  });

  /* ================= Messages from apps ================= */
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || !e.data.x360) return;
    const d = e.data;
    if (d.t === 'ach') { if (nested) { try { parent.postMessage(d, location.origin); } catch (err) { /* no parent */ } } else showAchievement(d.id); refreshScore(); }
    else if (d.t === 'toast') toast(d.m);
    else if (d.t === 'go') window.X360.go(d.href);
    else if (d.t === 'guide' || d.t === 'close') { inputMode = 'key'; openGuide(); }
    else if (d.t === 'ready') app.ready = true;
  });
  window.X360 = {
    go(href) {
      const u = new URL(href, location.origin);
      if (u.origin !== location.origin) { window.open(u.href, '_blank', 'noopener'); return; }
      const k = u.pathname.replace(/\.html$/, '').replace(/^\/|\/$/g, '') || 'home';
      const id = ALIAS[k] || k;
      if (id === 'library' && k === 'finder') { goTab('games'); return; }
      if (APPS[id]) launch(id, u.hash ? u.hash.slice(1) : '');
      else if (TABS.includes(id)) goTab(id);
    },
  };

  /* ================= Notifications ================= */
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
    sfx(sound);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => { t.remove(); showing = false; pump(); }, 400); }, 4800);
  }
  function showAchievement(id) {
    const a = OS.ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    queue.push({ cls: 'toast--ach', sound: 'ach', html: `<span class="toast__orb"><svg><use href="#i-trophy"/></svg></span><span class="toast__text"><small>Achievement unlocked</small><b>${a.g}G – ${esc(a.t)}</b></span>` });
    pump();
  }
  function toast(m, icon) {
    const orb = icon === 'pad' ? '<svg style="width:62%;height:62%;color:#fff"><use href="#i-pad"/></svg>' : '<svg viewBox="0 0 100 100"><use href="#orb"/></svg>';
    queue.push({ cls: `toast--msg${icon === 'pad' ? ' toast--ach' : ''}`, sound: 'notify', html: `<span class="toast__orb">${orb}</span><span class="toast__text"><small>${icon === 'pad' ? 'Controller' : 'Xbox'}</small><b>${esc(m)}</b></span>` });
    pump();
  }
  window.toast = (m) => toast(m);
  addEventListener('achievement', (e) => { if (!nested) showAchievement(e.detail); refreshScore(); });
  function refreshScore() {
    const got = OS.achieved(), list = OS.ACHIEVEMENTS;
    const recent = $('[data-recent]');
    if (recent) recent.innerHTML = list.filter((a) => got[a.id]).sort((a, b) => got[b.id] - got[a.id]).slice(0, 9).map((a) => `<span title="${esc(a.t)}">${a.i}</span>`).join('');
    const g = list.reduce((s, a) => s + (got[a.id] ? a.g : 0), 0);
    $$('[data-gs]').forEach((el) => { el.textContent = g.toLocaleString('en-GB'); });
    $$('[data-achcount]').forEach((el) => { el.textContent = list.filter((a) => got[a.id]).length; });
    return g;
  }

  /* ================= bing ================= */
  const SEARCH = [
    ...PROJECTS.map((p) => [p.name, `project ${p.meta.join(' ')} ${p.overview}`, `projects/${p.slug}`, 'folder']),
    ['Projects', 'work case studies portfolio', 'projects', 'folder'],
    ['Hamza’s Profile', 'about me aston university birmingham contact cv', 'profile', 'user'],
    ['Stats', 'leetcode github numbers languages', 'stats', 'chart'],
    ['DOOM', 'game shooter shareware id software play', 'doom', 'skull'],
    ['Internet Explorer', 'browser web ie internet', 'ie', 'ie'],
    ['Kaleidoscope', 'draw art paint', 'draw', 'kaleido'],
    ['Terminal', 'shell command line cheats', 'terminal', 'term'],
    ['Guestbook', 'sign draw wall message', 'guestbook', 'book'],
    ['Achievements', 'gamerscore trophies', 'achievements', 'trophy'],
    ['My Games', 'library played favourites hamza games', 'library', 'games'],
    ['My Pins', 'pinned favourites', 'pins', 'pin'],
    ['Recent', 'recently played history', 'recent', 'clock'],
    ['System Info', 'about this console controllers tech', 'system', 'info'],
    ['GitHub', 'code source repositories', 'https://github.com/hamzaaaaaf', 'git'],
    ['LinkedIn', 'cv career contact', 'https://www.linkedin.com/in/hamza-faisal-125833263/', 'in'],
    ['Email Hamza', 'mail contact hello message', 'mailto:hello@byhamza.dev', 'mail'],
    ['Settings', 'theme sound colour dark startup', '#settings', 'gear'],
  ];
  const searchIn = $('[data-search]'), results = $('[data-results]');
  function renderSearch() {
    const q = searchIn.value.trim().toLowerCase();
    let hits = SEARCH.filter(([t, k]) => !q || `${t} ${k}`.toLowerCase().includes(q)).map(([t, , o, i]) => ({ t, o, i }));
    if (q && GAMES) GAMES.filter((g) => g.h && g.t.toLowerCase().includes(q)).forEach((g) => hits.push({ t: `${g.t} · My Games`, o: 'library', i: 'games' }));
    hits = hits.slice(0, q ? 7 : 6);
    results.innerHTML = hits.length ? hits.map((h) => {
      const ext = /^(https?:|mailto:)/.test(h.o), tabLink = h.o.startsWith('#');
      const attrs = ext ? `href="${h.o}"${h.o.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}` : tabLink ? `type="button" data-go="${h.o.slice(1)}"` : `type="button" data-open="${h.o}"`;
      const tag = ext ? 'a' : 'button';
      return `<${tag} class="tile tile--sys" ${attrs}><svg class="tile__ico"><use href="#i-${h.i}"/></svg><span class="tile__label">${esc(h.t)}</span></${tag}>`;
    }).join('') : `<p class="results__none">Nothing on byhamza.dev matches “${esc(searchIn.value)}”.</p>`;
  }
  function openSearch() {
    if (app.id || screen.id) return;
    setTab(TABS.indexOf('bing'));
    setTimeout(() => searchIn.focus({ preventScroll: true }), 60);
  }
  searchIn.addEventListener('input', () => { renderSearch(); if (searchIn.value.trim().length >= 2) OS.achieve('search'); });
  searchIn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      const first = $('.tile', results);
      if (first) { e.preventDefault(); inputMode = 'key'; if (e.key === 'Enter') first.click(); else focusEl(first, true); }
    } else if (e.key === 'Escape') { e.preventDefault(); searchIn.blur(); focusEl($('[data-focus-search]'), true); }
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-focus-search]')) openSearch(); });
  games().then(() => renderSearch()).catch(() => {});
  renderSearch();

  /* ================= Settings ================= */
  function settingLabels() {
    const p = prefs();
    const v = {
      theme: root.dataset.theme === 'dark' ? 'Dark' : 'Light',
      skin: root.dataset.skin === 'yellow' ? 'Yellow' : 'Green',
      sound: p.sound === false ? 'Off' : 'On',
      motion: root.dataset.motion === 'reduce' ? 'Reduced' : 'Full',
      live: p.live === false ? 'Off' : 'On',
      bootlogo: root.dataset.bootlogo === 'hamza' ? 'Hamza 360' : 'Xbox 360',
    };
    $$('[data-setval]').forEach((el) => { el.textContent = v[el.dataset.setval]; });
  }
  function changeSetting(k) {
    const p = prefs();
    if (k === 'theme') { OS.toggleTheme(); setTimeout(settingLabels, 50); }
    if (k === 'skin') { const s = root.dataset.skin === 'yellow' ? 'green' : 'yellow'; OS.setPref('skin', s); root.dataset.skin = s; OS.achieve('decorator'); }
    if (k === 'sound') OS.setPref('sound', p.sound === false);
    if (k === 'motion') OS.setPref('motion', root.dataset.motion === 'reduce' ? 'full' : 'reduce');
    if (k === 'live') { OS.setPref('live', p.live === false); toast('Takes effect next time you turn on'); }
    if (k === 'bootlogo') { const b = root.dataset.bootlogo === 'hamza' ? 'xbox' : 'hamza'; OS.setPref('bootlogo', b); root.dataset.bootlogo = b; }
    sfx('select');
    settingLabels();
  }
  addEventListener('themechange', settingLabels);
  settingLabels();

  /* ================= Live tiles ================= */
  const setLive = (k, v) => $$(`[data-live="${k}"]`).forEach((el) => { el.textContent = v; });
  getJSON('/api/leetcode').catch(() => getJSON('/leetcode.json')).then((d) => { LC = d; setLive('lc', d.solved.All); }).catch(() => setLive('lc', '–'));
  getJSON('/api/guestbook').then(({ entries }) => {
    const e = entries[0];
    if (!e) return;
    const img = `<img src="${e.drawing}" alt="Drawing by ${esc(e.name)}" width="300" height="300">`;
    $$('[data-live="guest"], [data-live="guest2"]').forEach((el) => { el.innerHTML = img; });
  }).catch(() => {});
  games().then((list) => {
    FAVS.forEach((id, k) => {
      const g = list.find((x) => x.id === id);
      if (!g) return;
      const el = $(`[data-fav="${k}"]`);
      if (el) el.innerHTML = cover(g);
      const t = $(`[data-favlabel="${k}"] .tile__label`);
      if (t) t.textContent = g.t;
    });
  }).catch(() => {});
  addEventListener('presence', (e) => {
    const n = e.detail || 1;
    $$('[data-online-n]').forEach((el) => { el.textContent = n; });
    const live = $('[data-online]');
    if (live) { live.hidden = n < 2; live.textContent = `${n - 1} other${n === 2 ? '' : 's'} online`; }
  });
  function clock() {
    const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    $$('[data-clock]').forEach((el) => { el.textContent = t; });
  }
  clock(); setInterval(clock, 15000);

  /* ================= Internet Explorer ================= */
  // After IE for Xbox 360: a free cursor on the left stick that glows over
  // links, A clicks, the right stick scrolls, pushing the cursor against an
  // edge scrolls too, Y opens the Web Hub and B goes back.
  const IE = (() => {
    let wrap = null, frame = null, cursor = null, hub = null, pos = { x: 0, y: 0 }, unFrame = null, navs = 0, lastPad = 0;
    const SITES = [
      ['byhamza.dev', '/?d=', 'h', '#ffd84d', '#e0a500'],
      ['Projects', '/work', '▤', '#8fd0ff', '#3d97f2'],
      ['About Hamza', '/about', '☺', '#9be86a', '#2f8f12'],
      ['Stats', '/stats', '{ }', '#ffb13b', '#f08a00'],
      ['Guestbook', '/guestbook', '✎', '#ff9f6b', '#e8623a'],
    ];
    const CURSOR = '<svg viewBox="0 0 34 44"><path class="c-fill" d="M3 3 L3 33 L11 25 L17 40 L23 37 L17 23 L28 23 Z" stroke="#1d1d1d" stroke-width="2.4" stroke-linejoin="round"/></svg>';
    function open(host) {
      wrap = document.createElement('div');
      wrap.className = 'ie';
      wrap.innerHTML = `<iframe title="Internet Explorer" allow="gamepad; autoplay"></iframe><div class="ie__cursor">${CURSOR}</div>`;
      host.appendChild(wrap);
      frame = $('iframe', wrap); cursor = $('.ie__cursor', wrap);
      pos = { x: innerWidth / 2, y: innerHeight / 2 }; place();
      app.frame = frame;
      frame.addEventListener('load', () => {
        app.ready = true; navs++;
        try {
          const doc = frame.contentDocument;
          const st = doc.createElement('style');
          st.textContent = '*, *::before, *::after { cursor: none !important; }';
          doc.head.appendChild(st);
          doc.addEventListener('mousemove', (e) => { pos = { x: e.clientX, y: e.clientY }; place(); hover(); }, { passive: true });
          const d = new URLSearchParams(frame.contentWindow.location.search).get('d');
          if (Number(d) >= 3) OS.achieve('inception');
        } catch (e) { /* not same origin */ }
        updateAddr();
      });
      frame.src = `/?d=${depth + 1}`;
      wrap.addEventListener('mousemove', (e) => { pos = { x: e.clientX, y: e.clientY }; place(); hover(); });
      unFrame = window.XPad ? window.XPad.onFrame(padFrame) : null;
      return wrap;
    }
    function close() { if (unFrame) unFrame(); unFrame = null; wrap = frame = cursor = hub = null; navs = 0; }
    const place = () => { if (cursor) cursor.style.transform = `translate(${pos.x - 4}px, ${pos.y - 3}px)`; };
    function target() {
      if (!wrap) return null;
      if (hub) { const el = document.elementFromPoint(pos.x, pos.y); return el && hub.contains(el) ? el : null; }
      try { return frame.contentDocument.elementFromPoint(pos.x, pos.y); } catch (e) { return null; }
    }
    function hover() {
      const el = target();
      const hot = el && el.closest && el.closest('a, button, input, textarea, select, label, [role="button"], [data-open], [data-tab], .tile, .site');
      cursor.classList.toggle('is-link', !!hot);
      if (hub) $$('.is-hot', hub).forEach((x) => x.classList.toggle('is-hot', x === (hot && hot.closest('button, .site'))));
    }
    function click() {
      const el = target();
      if (!el) return;
      sfx('select');
      const hot = el.closest('a, button, input, textarea, select, label, [role="button"], [data-open], [data-tab], .tile, .site') || el;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(hot.tagName)) { hot.focus(); return; }
      const opts = { bubbles: true, cancelable: true, clientX: pos.x, clientY: pos.y, view: hot.ownerDocument.defaultView };
      try { hot.dispatchEvent(new PointerEvent('pointerdown', opts)); hot.dispatchEvent(new MouseEvent('mousedown', opts)); hot.dispatchEvent(new PointerEvent('pointerup', opts)); hot.dispatchEvent(new MouseEvent('mouseup', opts)); } catch (e) { /* old browser */ }
      hot.click();
    }
    function scroll(dx, dy) { try { frame.contentWindow.scrollBy(dx, dy); const sc = frame.contentDocument.querySelector('.screen__body, .doc'); if (sc) sc.scrollBy(dx, dy); } catch (e) { /* cross origin */ } }
    function padFrame(st, t) {
      if (!wrap || ctx() !== 'app' || app.kind !== 'ie') return;
      const dt = lastPad ? Math.min(50, t - lastPad) : 16; lastPad = t;
      const mag = Math.hypot(st.lx, st.ly);
      if (mag > 0.05) {
        const sp = 0.25 + 1.35 * mag * mag;
        pos.x = Math.max(0, Math.min(innerWidth - 2, pos.x + st.lx * sp * dt));
        pos.y = Math.max(0, Math.min(innerHeight - 2, pos.y + st.ly * sp * dt));
        place(); hover();
        // Pushing against the top or bottom edge scrolls the page.
        if (!hub && pos.y >= innerHeight - 3 && st.ly > 0.3) scroll(0, st.ly * dt * 1.2);
        if (!hub && pos.y <= 1 && st.ly < -0.3) scroll(0, st.ly * dt * 1.2);
      }
      if (Math.abs(st.ry) > 0.05 || Math.abs(st.rx) > 0.05) scroll(st.rx * dt * 1.4, st.ry * dt * 1.4);
    }
    function toggleHub() {
      if (!wrap) return;
      if (hub) { hub.remove(); hub = null; sfx('guideClose'); return; }
      sfx('guide');
      hub = document.createElement('div');
      hub.className = 'webhub';
      let url = '/';
      try { url = frame.contentWindow.location.pathname + frame.contentWindow.location.search; } catch (e) { /* ignore */ }
      hub.innerHTML = `<div class="webhub__bar">
          <button type="button" class="bk" aria-label="Back"><svg><use href="#i-back"/></svg></button>
          <button type="button" class="fwd" aria-label="Forward"><svg><use href="#i-back"/></svg></button>
          <label class="webhub__addr"><input type="text" value="byhamza.dev${esc(url === '/' ? '' : url)}" aria-label="Address" spellcheck="false" autocomplete="off"></label>
          <button type="button" class="rf" aria-label="Refresh"><svg><use href="#i-clock"/></svg></button>
          <button type="button" class="cl" aria-label="Close Web Hub">✕</button></div>
        <div class="webhub__main"><div class="webhub__piv"><b>favorites</b><span>recent</span></div>
        <div class="webhub__sites">${SITES.map(([t, u, g, c1, c2]) => `<button type="button" class="site" data-url="${u}"><span class="site__thumb" style="--c1:${c1};--c2:${c2}">${esc(g)}</span><span class="site__t">${esc(t)}<small>byhamza.dev${u.startsWith('/?') ? '' : u}</small></span></button>`).join('')}</div></div>
        <div class="webhub__foot"><span><i class="btn btn--a">A</i> Select</span><span><i class="btn btn--b">B</i> Hide Web Hub</span><span><i class="btn btn--y">Y</i> Web Hub</span></div>`;
      wrap.appendChild(hub);
      hub.addEventListener('mousemove', (e) => { pos = { x: e.clientX, y: e.clientY }; place(); hover(); });
      hub.addEventListener('click', (e) => {
        const s = e.target.closest('.site');
        if (s) { go(s.dataset.url === '/?d=' ? `/?d=${depth + 1}` : s.dataset.url); return; }
        if (e.target.closest('.bk')) { history_(-1); return; }
        if (e.target.closest('.fwd')) { history_(1); return; }
        if (e.target.closest('.rf')) { try { frame.contentWindow.location.reload(); } catch (err) { /* ignore */ } toggleHub(); return; }
        if (e.target.closest('.cl')) toggleHub();
      });
      $('input', hub).addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        let v = e.target.value.trim().replace(/^https?:\/\//, '');
        if (v.startsWith('byhamza.dev')) v = v.slice('byhamza.dev'.length) || '/';
        if (v.startsWith('/')) go(v === '/' ? `/?d=${depth + 1}` : v);
        else { window.open(`https://${v}`, '_blank', 'noopener'); toggleHub(); }
      });
    }
    function go(u) { frame.src = u; if (hub) toggleHub(); }
    function history_(d) { try { frame.contentWindow.history.go(d); } catch (e) { /* ignore */ } if (hub) toggleHub(); }
    function updateAddr() { if (hub) { try { $('input', hub).value = `byhamza.dev${frame.contentWindow.location.pathname}`; } catch (e) { /* ignore */ } } }
    function back() {
      if (hub) { toggleHub(); return; }
      if (navs > 1) { navs -= 2; history_(-1); return; }
      leave(false);
    }
    return { open, close, click, back, toggleHub, isHub: () => !!hub };
  })();

  /* ================= DOOM bridge ================= */
  const NEUTRAL = { lx: 0, ly: 0, rx: 0, ry: 0, lt: 0, rt: 0 };
  let doomSent = false;
  if (window.XPad) window.XPad.onFrame((st) => {
    if (app.id !== 'doom' || !app.frame) return;
    const live = ctx() === 'app';
    if (live) { app.frame.contentWindow.postMessage({ doompad: st }, location.origin); doomSent = true; }
    else if (doomSent) { app.frame.contentWindow.postMessage({ doompad: NEUTRAL }, location.origin); doomSent = false; }
  });
  setInterval(() => {
    if (app.id !== 'doom' || document.hidden || ctx() !== 'app') return;
    const t = store.get('doomTime', 0) + 5;
    store.set('doomTime', t);
    if (t >= 300) OS.achieve('doom10');
  }, 5000);

  /* ================= Keyboard ================= */
  const typing = (e) => e.target.closest && e.target.closest('input, textarea, [contenteditable]');
  addEventListener('keydown', (e) => {
    const c = ctx();
    if (c === 'power') { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); powerOn(); } return; }
    if (c === 'boot') { e.preventDefault(); skipBoot(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (typing(e) && !['Escape'].includes(e.key)) return;
    const dirs = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (e.key === 'Home' || e.key === 'F1') { e.preventDefault(); inputMode = 'key'; toggleGuide(); return; }
    if (c === 'app') {
      if (e.key === 'Escape') { e.preventDefault(); inputMode = 'key'; openGuide(); }
      return;
    }
    if (dirs[e.key]) { e.preventDefault(); inputMode = 'key'; move(dirs[e.key]); return; }
    if (e.key === 'Escape') {
      e.preventDefault(); inputMode = 'key';
      if (c === 'dash') openGuide(); else back();
      return;
    }
    if (e.key === 'Backspace') { e.preventDefault(); inputMode = 'key'; back(); return; }
    if (c === 'guide') {
      if (e.key === '[' || e.key === 'PageUp') guideTab(guideTabI - 1);
      if (e.key === ']' || e.key === 'PageDown') guideTab(guideTabI + 1);
      if (e.key.toLowerCase() === 'y') xboxHome();
      return;
    }
    if (c === 'screen') {
      if (e.key === '[' || e.key === 'PageUp') screenPivot(screen.pi - 1);
      if (e.key === ']' || e.key === 'PageDown') screenPivot(screen.pi + 1);
      return;
    }
    if (c === 'dash') {
      if (e.key === '/') { e.preventDefault(); openSearch(); return; }
      if (e.key === '[' || e.key === 'PageUp') { e.preventDefault(); setTab(tab - 1, { focus: inputMode === 'pointer' ? false : 'tile' }); }
      if (e.key === ']' || e.key === 'PageDown') { e.preventDefault(); setTab(tab + 1, { focus: inputMode === 'pointer' ? false : 'tile' }); }
      if (e.key === 'Tab') inputMode = 'key';
    }
  });

  /* ================= Controller ================= */
  let padUsed = false;
  if (window.XPad) window.XPad.on((ev) => {
    if (ev.type === 'connect') {
      toast(ev.brand === 'sony' ? 'PlayStation controller connected' : ev.brand === 'nintendo' ? 'Nintendo controller connected' : 'Controller connected', 'pad');
      if (ev.brand === 'sony' || ev.brand === 'nintendo') OS.achieve('crossplay');
      return;
    }
    if (ev.type !== 'press') return;
    const b = ev.button, st = ev.state, c = ctx();
    inputMode = 'pad';
    if (!padUsed) { padUsed = true; OS.achieve('tidy'); }
    if (st.brands && st.brands.some((x) => x === 'sony' || x === 'nintendo')) OS.achieve('crossplay');
    if (c === 'power') { powerOn(); return; }
    if (c === 'boot') { skipBoot(); return; }
    const dir = { up: 'up', down: 'down', left: 'left', right: 'right' }[b];
    if (c === 'app') {
      const chord = (b === 'start' && st.back) || (b === 'back' && st.start);
      if (b === 'guide' || chord) { openGuide(); return; }
      if (app.kind === 'game') return; // everything else belongs to the game
      if (app.kind === 'ie') {
        if (b === 'a') IE.click(); else if (b === 'b') IE.back(); else if (b === 'y') IE.toggleHub(); else if (b === 'start' || b === 'back') openGuide();
        return;
      }
      if (b === 'b') { back(); return; }
      if (b === 'start' || b === 'back') { openGuide(); return; }
      if (dir === 'up' || dir === 'down') { try { app.frame.contentWindow.scrollBy(0, dir === 'up' ? -160 : 160); } catch (e) { /* ignore */ } }
      return;
    }
    if (b === 'guide' || b === 'start' || b === 'back' || (b === 'x' && c === 'dash')) { if (c === 'dialog') return; toggleGuide(); return; }
    if (dir) { move(dir); return; }
    if (b === 'a') {
      const el = document.activeElement;
      if (el && el !== document.body && items().includes(el)) { if (el.matches('input')) el.focus(); else el.click(); } else move('down');
      return;
    }
    if (b === 'b') { back(); return; }
    if (c === 'guide') {
      if (b === 'lb') guideTab(guideTabI - 1);
      if (b === 'rb') guideTab(guideTabI + 1);
      if (b === 'y') xboxHome();
      if (b === 'x') { closeGuide(true); powerOff(); }
      return;
    }
    if (c === 'screen') { if (b === 'lb') screenPivot(screen.pi - 1); if (b === 'rb') screenPivot(screen.pi + 1); return; }
    if (c === 'dash') {
      if (b === 'lb') setTab(tab - 1, { focus: 'tile' });
      if (b === 'rb') setTab(tab + 1, { focus: 'tile' });
      if (b === 'y') openSearch();
    }
  });

  /* ================= Power and startup ================= */
  let bootTimer = 0;
  function enter() {
    clearTimeout(bootTimer);
    if (!bootEl.hidden) { bootEl.classList.add('is-out'); setTimeout(() => { bootEl.hidden = true; bootEl.classList.remove('is-out'); }, 550); }
    held = false; pump();
    document.body.classList.add('is-entering');
    setTimeout(() => document.body.classList.remove('is-entering'), 1400);
    try { sessionStorage.setItem('x360-on', '1'); } catch (e) { /* storage blocked */ }
    // Regulars and long sessions.
    const day = new Date().toISOString().slice(0, 10), days = new Set(store.get('days', []));
    days.add(day); store.set('days', [...days].slice(-30));
    if (days.size >= 3) OS.achieve('regular');
    setTimeout(() => OS.achieve('longhaul'), 10 * 60 * 1000);
    if (depth >= 3) OS.achieve('inception');
    if (inputMode !== 'pointer') focusEl(cellTile(activePane(), 1, 1));
  }
  function powerOn() {
    if (powerEl.classList.contains('is-on')) return;
    if (window.XSound) window.XSound.init();
    sfx('power');
    powerEl.classList.add('is-on');
    setTimeout(() => {
      powerEl.hidden = true; powerEl.classList.remove('is-on');
      if (reduce()) { enter(); return; }
      bootEl.hidden = false;
      $$('*', bootEl).forEach((el) => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
      sfx('boot');
      bootTimer = setTimeout(enter, 6300);
    }, 1050);
  }
  function skipBoot() { enter(); }
  async function powerOff() {
    if (app.id) await stopApp({ sound: false });
    if (screen.id) closeScreen(true);
    history.replaceState(null, '', '#home');
    setTab(TABS.indexOf('home'), { sound: false, url: false });
    held = true;
    sfx('back');
    OS.achieve('lightsout');
    powerEl.hidden = false;
    powerEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    $('.power__btn').focus({ preventScroll: true });
  }
  powerEl.addEventListener('click', powerOn);
  bootEl.addEventListener('click', skipBoot);

  /* ================= Start ================= */
  refreshScore();
  setTab(TABS.indexOf('home'), { sound: false, url: false });
  route(true);
  let seen = false;
  try { seen = sessionStorage.getItem('x360-on') === '1'; } catch (e) { /* storage blocked */ }
  if (nested || seen || app.id || screen.id || reduce()) enter();
  else {
    if (matchMedia('(pointer: coarse)').matches) $('.power__hint').textContent = 'Tap the power button';
    powerEl.hidden = false; $('.power__btn').focus({ preventScroll: true });
  }
})();
