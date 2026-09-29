(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const toast = (m) => window.toast && window.toast(m);
  const nope = (el) => window.nope && window.nope(el);
  const canvas = $('#arc-canvas');
  const ctx = canvas.getContext('2d');
  const W = 480, H = 360;
  const INK = '#ffd84d', DIM = 'rgba(255,216,77,0.14)', BG = '#141108';
  let dpr = 1;
  let game = 'snake';
  try { game = localStorage.getItem('arcade-game') || 'snake'; } catch (e) { /* storage blocked */ }

  function fit() {
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();
  addEventListener('resize', fit);

  let soundOn = true;
  try { soundOn = JSON.parse(localStorage.getItem('prefs') || '{}').sound !== false; } catch (e) { /* storage blocked */ }
  let audio;
  function beep(f, d = 0.06, type = 'square', g = 0.05) {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime, o = audio.createOscillator(), v = audio.createGain();
      o.type = type; o.frequency.value = f; v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v).connect(audio.destination); o.start(t); o.stop(t + d);
    } catch (e) { /* no audio */ }
  }
  const text = (s, x, y, size = 16, color = INK, align = 'center') => {
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.font = `600 ${size}px "JetBrains Mono", monospace`; ctx.fillText(s, x, y);
  };

  /* ---------- Shared state ---------- */
  let state = 'ready'; // ready | playing | paused | over
  let score = 0;
  const best = () => { try { return Number(localStorage.getItem(`arcade-best-${game}`)) || 0; } catch (e) { return 0; } };
  const setScore = (n) => { score = n; $('#arc-score').textContent = n; };
  const input = { left: false, right: false, pointerX: null };

  /* ---------- Snake ---------- */
  const COLS = 24, ROWS = 18, CELL = 20;
  const snake = { body: [], dir: [1, 0], next: [1, 0], food: [0, 0], step: 0, speed: 120 };
  function snakeReset() {
    snake.body = [[8, 9], [7, 9], [6, 9]];
    snake.dir = [1, 0]; snake.next = [1, 0]; snake.speed = 120; snake.step = 0;
    placeFood();
  }
  function placeFood() {
    do { snake.food = [(Math.random() * COLS) | 0, (Math.random() * ROWS) | 0]; }
    while (snake.body.some(([x, y]) => x === snake.food[0] && y === snake.food[1]));
  }
  function snakeTurn(dx, dy) {
    if (dx === -snake.dir[0] && dy === -snake.dir[1]) return;
    snake.next = [dx, dy];
  }
  function snakeUpdate(dt) {
    snake.step += dt;
    if (snake.step < snake.speed) return;
    snake.step = 0;
    snake.dir = snake.next;
    const [hx, hy] = snake.body[0];
    const head = [hx + snake.dir[0], hy + snake.dir[1]];
    if (head[0] < 0 || head[1] < 0 || head[0] >= COLS || head[1] >= ROWS || snake.body.some(([x, y]) => x === head[0] && y === head[1])) { over(); return; }
    snake.body.unshift(head);
    if (head[0] === snake.food[0] && head[1] === snake.food[1]) {
      setScore(score + 1);
      snake.speed = Math.max(55, 120 - score * 2.5);
      beep(660 + score * 10);
      placeFood();
      if (window.OS && score >= 20) window.OS.achieve('snake20');
    } else snake.body.pop();
  }
  function snakeDraw(t) {
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) { ctx.fillStyle = (x + y) % 2 ? 'rgba(255,216,77,0.03)' : 'rgba(255,216,77,0.06)'; ctx.fillRect(x * CELL, y * CELL, CELL, CELL); }
    const pulse = 3 + Math.sin(t / 150) * 1.5;
    ctx.fillStyle = '#ff8a5c';
    ctx.beginPath(); ctx.arc(snake.food[0] * CELL + 10, snake.food[1] * CELL + 10, 5 + pulse / 2, 0, Math.PI * 2); ctx.fill();
    snake.body.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 ? '#fff3b0' : `rgba(255,216,77,${1 - (i / snake.body.length) * 0.55})`;
      ctx.beginPath(); ctx.roundRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4, 5); ctx.fill();
    });
  }

  /* ---------- Breakout ---------- */
  const bo = { px: W / 2, pw: 76, ball: null, bricks: [], lives: 3, level: 1 };
  const ROW_COLORS = ['#ff5f57', '#ff8a5c', '#febc2e', '#ffd84d', '#28c840', '#3d97f2'];
  function breakoutReset(full = true) {
    if (full) { bo.lives = 3; bo.level = 1; }
    bo.bricks = [];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) bo.bricks.push({ x: 12 + c * 45.6, y: 44 + r * 18, w: 41, h: 13, r, alive: true });
    serve();
  }
  function serve() {
    const sp = 4.2 + bo.level * 0.5;
    bo.ball = { x: bo.px, y: H - 44, vx: (Math.random() < 0.5 ? -1 : 1) * sp * 0.6, vy: -sp, stuck: true };
  }
  function breakoutUpdate(dt) {
    const k = dt / 16.67;
    if (input.pointerX !== null) bo.px += (input.pointerX - bo.px) * 0.35;
    if (input.left) bo.px -= 7 * k;
    if (input.right) bo.px += 7 * k;
    bo.px = Math.max(bo.pw / 2, Math.min(W - bo.pw / 2, bo.px));
    const b = bo.ball;
    if (b.stuck) { b.x = bo.px; b.y = H - 30; return; }
    b.x += b.vx * k; b.y += b.vy * k;
    if (b.x < 6 || b.x > W - 6) { b.vx *= -1; b.x = Math.max(6, Math.min(W - 6, b.x)); beep(300, 0.03); }
    if (b.y < 6) { b.vy = Math.abs(b.vy); beep(300, 0.03); }
    if (b.y > H - 30 && b.y < H - 18 && Math.abs(b.x - bo.px) < bo.pw / 2 + 6 && b.vy > 0) {
      const off = (b.x - bo.px) / (bo.pw / 2);
      const sp = Math.hypot(b.vx, b.vy) * 1.01;
      b.vx = sp * Math.sin(off * 1.05); b.vy = -Math.abs(sp * Math.cos(off * 1.05));
      beep(440, 0.04);
    }
    for (const br of bo.bricks) {
      if (!br.alive || b.x < br.x - 5 || b.x > br.x + br.w + 5 || b.y < br.y - 5 || b.y > br.y + br.h + 5) continue;
      br.alive = false;
      const fromSide = b.x < br.x || b.x > br.x + br.w;
      if (fromSide) b.vx *= -1; else b.vy *= -1;
      setScore(score + (6 - br.r) * 10);
      beep(520 + (6 - br.r) * 60, 0.05);
      break;
    }
    if (!bo.bricks.some((br) => br.alive)) { bo.level++; beep(880, 0.2, 'triangle'); breakoutReset(false); if (window.OS) window.OS.achieve('breakout'); }
    if (b.y > H + 10) {
      bo.lives--; beep(120, 0.3, 'sawtooth');
      if (bo.lives <= 0) over(); else serve();
    }
  }
  function breakoutDraw() {
    for (const br of bo.bricks) if (br.alive) { ctx.fillStyle = ROW_COLORS[br.r]; ctx.beginPath(); ctx.roundRect(br.x, br.y, br.w, br.h, 3); ctx.fill(); }
    ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(bo.px - bo.pw / 2, H - 22, bo.pw, 9, 5); ctx.fill();
    ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(bo.ball.x, bo.ball.y, 6, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < bo.lives; i++) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(W - 16 - i * 16, 18, 5, 0, Math.PI * 2); ctx.fill(); }
    text(`LEVEL ${bo.level}`, 14, 18, 11, 'rgba(255,216,77,0.6)', 'left');
  }

  /* ---------- Flow ---------- */
  function reset() {
    setScore(0);
    if (game === 'snake') snakeReset(); else breakoutReset();
    $('#arc-best').textContent = best();
  }
  function start() {
    if (state === 'over' || state === 'ready') reset();
    state = 'playing';
    $('#arc-submit').hidden = true;
    if (game === 'breakout') bo.ball.stuck = false;
    beep(520, 0.08, 'triangle');
  }
  function over() {
    state = 'over';
    beep(160, 0.4, 'sawtooth', 0.06);
    if (score > best()) { try { localStorage.setItem(`arcade-best-${game}`, String(score)); } catch (e) { /* storage blocked */ } $('#arc-best').textContent = score; }
    if (score > 0 && qualifies(score)) { $('#arc-submit').hidden = false; setTimeout(() => $('#arc-initials').focus(), 200); }
  }
  function action() {
    if (state === 'playing' && game === 'breakout' && bo.ball.stuck) { bo.ball.stuck = false; return; }
    if (state !== 'playing') start();
  }

  let last = performance.now();
  function frame(t) {
    const dt = Math.min(50, t - last); last = t;
    if (state === 'playing') { if (game === 'snake') snakeUpdate(dt); else breakoutUpdate(dt); }
    else if (game === 'breakout' && bo.ball) breakoutUpdate(0);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    if (game === 'snake') snakeDraw(t); else breakoutDraw();
    if (state === 'ready') { overlay(game === 'snake' ? 'SNAKE' : 'BREAKOUT', 'PRESS SPACE OR TAP'); }
    else if (state === 'paused') overlay('PAUSED', 'PRESS P TO RESUME');
    else if (state === 'over') overlay('GAME OVER', `SCORE ${score}  ·  SPACE TO RETRY`);
    requestAnimationFrame(frame);
  }
  function overlay(title, sub) {
    ctx.fillStyle = 'rgba(20,17,8,0.72)'; ctx.fillRect(0, 0, W, H);
    text(title, W / 2, H / 2 - 16, 34);
    if (Math.floor(performance.now() / 500) % 2 === 0) text(sub, W / 2, H / 2 + 22, 12, 'rgba(255,216,77,0.75)');
  }

  /* ---------- Input ---------- */
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, dialog')) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'enter') { e.preventDefault(); action(); return; }
    if (k === 'p' && (state === 'playing' || state === 'paused')) { state = state === 'paused' ? 'playing' : 'paused'; return; }
    const dirs = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
    if (dirs[k]) {
      e.preventDefault();
      if (game === 'snake') { if (state !== 'playing') start(); snakeTurn(...dirs[k]); }
      else { if (k === 'arrowleft' || k === 'a') input.left = true; if (k === 'arrowright' || k === 'd') input.right = true; input.pointerX = null; }
    }
  });
  addEventListener('keyup', (e) => { const k = e.key.toLowerCase(); if (k === 'arrowleft' || k === 'a') input.left = false; if (k === 'arrowright' || k === 'd') input.right = false; });
  const toX = (e) => { const r = canvas.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * W; };
  canvas.addEventListener('pointermove', (e) => { if (game === 'breakout') input.pointerX = toX(e); });
  let touchStart = null;
  canvas.addEventListener('pointerdown', (e) => {
    touchStart = [e.clientX, e.clientY];
    if (game === 'breakout') input.pointerX = toX(e);
    action();
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!touchStart || game !== 'snake') return;
    const dx = e.clientX - touchStart[0], dy = e.clientY - touchStart[1];
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) snakeTurn(...(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]));
    touchStart = null;
  });

  /* ---------- Game switch and leaderboard ---------- */
  let top10 = [];
  let myName = '';
  try { myName = localStorage.getItem('stack-initials') || ''; } catch (e) { /* storage blocked */ }
  const qualifies = (s) => top10.length < 10 || s > top10[top10.length - 1].score;
  function loadBoard() {
    const list = $('#arc-board');
    list.innerHTML = '<li class="muted">Loading…</li>';
    fetch(`/api/scores?game=${game}`).then((r) => r.json()).then((d) => {
      top10 = d.scores || [];
      list.innerHTML = top10.length ? top10.map((r) => `<li${r.name === myName ? ' class="me"' : ''}><span class="n">${r.name}</span><b>${r.score}</b></li>`).join('') : '<li class="muted">No scores yet.</li>';
    }).catch(() => { list.innerHTML = '<li class="muted">Offline</li>'; });
  }
  function choose(g) {
    game = g;
    try { localStorage.setItem('arcade-game', g); } catch (e) { /* storage blocked */ }
    $$('[data-game]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.game === g)));
    $('#arc-help').textContent = g === 'snake' ? 'Arrows / WASD or swipe. P pauses.' : 'Mouse, touch or ← →. Space serves. P pauses.';
    $('#arc-submit').hidden = true;
    state = 'ready';
    reset();
    loadBoard();
  }
  $$('[data-game]').forEach((b) => b.addEventListener('click', () => { choose(b.dataset.game); b.blur(); }));
  $('#arc-initials').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3); });
  $('#arc-initials').value = myName;
  $('#arc-submit').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#arc-initials').value;
    if (name.length !== 3) { $('#arc-initials').focus(); nope($('#arc-submit')); return; }
    $('#arc-submit').hidden = true;
    try {
      const r = await fetch(`/api/scores?game=${game}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, score }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      myName = name;
      try { localStorage.setItem('stack-initials', name); } catch (err) { /* storage blocked */ }
      toast(`Posted ${score} as ${name}.`);
      loadBoard();
    } catch (err) { $('#arc-submit').hidden = false; nope($('#arc-submit')); }
  });

  choose(game);
  requestAnimationFrame(frame);
})();
