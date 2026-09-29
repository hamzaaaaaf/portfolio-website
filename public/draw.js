(() => {
  const paper = document.getElementById('paper');
  const ctx = paper.getContext('2d', { desynchronized: true });
  // Guides sit on their own canvas behind the drawing.
  const guides = document.createElement('canvas');
  guides.className = 'app-canvas';
  guides.setAttribute('aria-hidden', 'true');
  paper.before(guides);
  const gctx = guides.getContext('2d');
  const sizeInput = document.getElementById('size');
  const mirrorBtn = document.getElementById('mirror');

  const settings = { sym: 8, mirror: true, brush: 'ink', color: '#ffd84d', size: 5 };
  let strokes = [];
  let cleared = null; // last cleared drawing, so Undo can bring it back
  let active = null;
  let pending = []; // [stroke, pointIndex] waiting to be drawn this frame
  let hue = 0;
  let dpr = 1, W = 0, H = 0, left = 0, top = 0;

  /* ---------- Toolbar ---------- */
  function pick(group, btn) {
    document.querySelectorAll(`[data-group="${group}"] [aria-pressed]:not(#mirror)`).forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
  }
  document.querySelectorAll('[data-sym], [data-brush], [data-color]').forEach((b) => { if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false'); });
  document.querySelectorAll('[data-sym]').forEach((b) => b.addEventListener('click', () => { settings.sym = Number(b.dataset.sym); pick('sym', b); drawGuides(); }));
  mirrorBtn.addEventListener('click', () => { settings.mirror = !settings.mirror; mirrorBtn.setAttribute('aria-pressed', String(settings.mirror)); drawGuides(); });
  document.querySelectorAll('[data-brush]').forEach((b) => b.addEventListener('click', () => { settings.brush = b.dataset.brush; pick('brush', b); }));
  document.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => { settings.color = b.dataset.color; pick('color', b); }));
  sizeInput.addEventListener('input', () => { settings.size = Number(sizeInput.value); });

  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('clear').addEventListener('click', () => {
    if (!strokes.length) return;
    cleared = strokes;
    strokes = [];
    redraw();
  });
  document.getElementById('save').addEventListener('click', save);
  document.getElementById('surprise').addEventListener('click', surprise);
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  });

  function undo() {
    if (strokes.length) strokes.pop();
    else if (cleared) { strokes = cleared; cleared = null; }
    redraw();
  }

  /* ---------- Rendering ---------- */
  function resize() {
    const r = paper.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; left = r.left; top = r.top;
    for (const c of [paper, guides]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    drawGuides();
    redraw();
  }

  // Calls fn once per slice, with the context rotated (and mirrored) around the centre.
  function eachSlice(c, s, fn) {
    const cx = W / 2, cy = H / 2;
    for (let k = 0; k < s.sym; k++) {
      c.setTransform(dpr, 0, 0, dpr, cx * dpr, cy * dpr);
      c.rotate((Math.PI * 2 * k) / s.sym);
      fn();
      if (s.mirror) { c.scale(1, -1); fn(); }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  function drawGuides() {
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.clearRect(0, 0, guides.width, guides.height);
    gctx.strokeStyle = 'rgba(248,241,216,0.05)';
    gctx.lineWidth = 1;
    const r = Math.hypot(W, H);
    eachSlice(gctx, { sym: settings.sym, mirror: false }, () => { gctx.beginPath(); gctx.moveTo(0, 0); gctx.lineTo(r, 0); gctx.stroke(); });
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.beginPath();
    gctx.arc(W / 2, H / 2, 2.5, 0, Math.PI * 2);
    gctx.fillStyle = 'rgba(248,241,216,0.3)';
    gctx.fill();
  }

  const colorOf = (s, p) => (s.color === 'rainbow' ? `hsl(${p.h} 80% 66%)` : s.color);

  // Glow is faked with three soft passes instead of shadowBlur, which is
  // what made the old brush lag: blur is expensive and ran once per slice.
  const GLOW = [[3.2, 0.07], [1.9, 0.16], [1, 0.9]];

  // Draws the part of stroke s that ends at point i: a quadratic curve
  // between the midpoints around the previous point.
  function drawSegment(s, i) {
    const pts = s.pts;
    const p1 = pts[i];
    const color = colorOf(s, p1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const glow = s.brush === 'glow';
    ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over';
    const passes = glow ? GLOW : [[1, 1]];

    if (i === 0) {
      const r = (s.size * p1.w) / 2;
      eachSlice(ctx, s, () => {
        for (const [m, a] of passes) {
          ctx.globalAlpha = a;
          ctx.beginPath(); ctx.arc(p1.x, p1.y, r * m, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      return;
    }
    const p0 = pts[i - 1];
    const pm = pts[i - 2] || p0;
    const ax = (pm.x + p0.x) / 2, ay = (pm.y + p0.y) / 2;
    const bx = (p0.x + p1.x) / 2, by = (p0.y + p1.y) / 2;
    const path = new Path2D();
    path.moveTo(ax, ay);
    path.quadraticCurveTo(p0.x, p0.y, bx, by);
    const w = (s.size * (p0.w + p1.w)) / 2;
    eachSlice(ctx, s, () => {
      for (const [m, a] of passes) {
        ctx.globalAlpha = a;
        ctx.lineWidth = w * m;
        ctx.stroke(path);
      }
    });
    ctx.globalAlpha = 1;
  }

  function redraw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, paper.width, paper.height);
    for (const s of strokes) for (let i = 0; i < s.pts.length; i++) drawSegment(s, i);
    pending = [];
    document.body.classList.toggle('has-drawn', strokes.length > 0);
  }

  // Pointer events can arrive many times per frame; draw once per frame.
  function flush() {
    for (const [s, i] of pending) drawSegment(s, i);
    pending = [];
    requestAnimationFrame(flush);
  }
  requestAnimationFrame(flush);

  /* ---------- Input ---------- */
  function point(x, y, prev, pressure, isPen) {
    let w = 1;
    if (isPen && pressure > 0) w = 0.3 + pressure * 1.2;
    else if (prev) {
      // Faster strokes come out thinner, like a real pen.
      const speed = Math.hypot(x - prev.x, y - prev.y);
      w = prev.w + (Math.max(0.45, Math.min(1.25, 1.3 - speed / 45)) - prev.w) * 0.35;
    }
    hue = (hue + 2) % 360;
    return { x, y, w, h: hue };
  }
  const local = (e) => [e.clientX - left - W / 2, e.clientY - top - H / 2];

  function begin(x, y, extra = {}) {
    active = { ...settings, ...extra, pts: [point(x, y)] };
    strokes.push(active);
    cleared = null;
    document.body.classList.add('has-drawn');
    pending.push([active, 0]);
  }
  function extend(x, y, pressure, isPen) {
    const prev = active.pts[active.pts.length - 1];
    if (Math.hypot(x - prev.x, y - prev.y) < 1.5) return;
    active.pts.push(point(x, y, prev, pressure, isPen));
    pending.push([active, active.pts.length - 1]);
  }

  paper.addEventListener('pointerdown', (e) => {
    const r = paper.getBoundingClientRect();
    left = r.left; top = r.top;
    paper.setPointerCapture(e.pointerId);
    const [x, y] = local(e);
    begin(x, y);
  });
  paper.addEventListener('pointermove', (e) => {
    if (!active) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) { const [x, y] = local(ev); extend(x, y, ev.pressure, ev.pointerType === 'pen'); }
  });
  const end = () => { active = null; };
  paper.addEventListener('pointerup', end);
  paper.addEventListener('pointercancel', end);

  /* ---------- Surprise: draws a random rose curve ---------- */
  let surprising = false;
  function surprise() {
    if (surprising) return;
    surprising = true;
    const R = Math.min(W, H) * (0.18 + Math.random() * 0.22);
    const k = [2, 3, 5, 7, 1.5, 2.5][(Math.random() * 6) | 0];
    const colors = ['#ffd84d', '#ff8a5c', '#ff7aa2', '#7fd6b2', '#8fb8ff', 'rainbow'];
    const phase = Math.random() * Math.PI, turns = Math.PI * 2 / settings.sym + Math.random() * 1.5;
    const r0 = R * Math.cos(k * phase);
    begin(r0 * Math.cos(phase), r0 * Math.sin(phase), {
      brush: Math.random() < 0.55 ? 'glow' : 'ink',
      color: colors[(Math.random() * colors.length) | 0],
      size: 2 + Math.random() * 5,
    });
    const steps = 90;
    let n = 1;
    (function step() {
      for (let j = 0; j < 3 && n <= steps; j++, n++) {
        const t = (n / steps) * turns + phase;
        const r = R * Math.cos(k * t);
        extend(r * Math.cos(t), r * Math.sin(t), 0, false);
      }
      if (n <= steps) requestAnimationFrame(step);
      else { active = null; surprising = false; }
    })();
  }

  /* ---------- Save ---------- */
  function save() {
    if (window.OS) window.OS.achieve('artist');
    const out = document.createElement('canvas');
    out.width = paper.width; out.height = paper.height;
    const o = out.getContext('2d');
    o.fillStyle = '#14120c';
    o.fillRect(0, 0, out.width, out.height);
    o.drawImage(paper, 0, 0);
    o.font = `${12 * dpr}px "JetBrains Mono", monospace`;
    o.fillStyle = 'rgba(248,241,216,0.45)';
    o.textAlign = 'right';
    o.fillText('byhamza.dev', out.width - 20 * dpr, out.height - 20 * dpr);
    out.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'kaleidoscope.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  }

  let t;
  const later = () => { clearTimeout(t); t = setTimeout(resize, 80); };
  addEventListener('resize', later);
  if (window.ResizeObserver) new ResizeObserver(later).observe(paper);
  resize();
})();
