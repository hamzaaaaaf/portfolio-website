(() => {
  const paper = document.getElementById('paper');
  const guides = document.getElementById('guides');
  const ctx = paper.getContext('2d');
  const gctx = guides.getContext('2d');
  const sizeInput = document.getElementById('size');
  const mirrorBtn = document.getElementById('mirror');

  const settings = { sym: 8, mirror: true, brush: 'ink', color: '#d8c4a0', size: 5 };
  let strokes = [];
  let cleared = null; // last cleared drawing, so Undo can bring it back
  let active = null;
  let hue = 0;
  let dpr = 1, W = 0, H = 0;

  /* ---------- Toolbar ---------- */
  function pick(group, btn) {
    document.querySelectorAll(`[data-group="${group}"] [aria-pressed]:not(#mirror)`).forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
  }
  document.querySelectorAll('[data-sym]').forEach((b) => b.addEventListener('click', () => {
    settings.sym = Number(b.dataset.sym);
    pick('sym', b);
    drawGuides();
  }));
  document.querySelectorAll('[data-sym]').forEach((b) => { if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false'); });
  mirrorBtn.addEventListener('click', () => {
    settings.mirror = !settings.mirror;
    mirrorBtn.setAttribute('aria-pressed', String(settings.mirror));
    drawGuides();
  });
  document.querySelectorAll('[data-brush]').forEach((b) => {
    if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => { settings.brush = b.dataset.brush; pick('brush', b); });
  });
  document.querySelectorAll('[data-color]').forEach((b) => {
    if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => { settings.color = b.dataset.color; pick('color', b); });
  });
  sizeInput.addEventListener('input', () => { settings.size = Number(sizeInput.value); });

  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('clear').addEventListener('click', () => {
    if (!strokes.length) return;
    cleared = strokes;
    strokes = [];
    redraw();
  });
  document.getElementById('save').addEventListener('click', save);
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
    dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    for (const c of [paper, guides]) { c.width = W * dpr; c.height = H * dpr; }
    drawGuides();
    redraw();
  }

  function eachSlice(c, s, fn) {
    const cx = W / 2, cy = H / 2;
    for (let k = 0; k < s.sym; k++) {
      const a = (Math.PI * 2 * k) / s.sym;
      c.setTransform(dpr, 0, 0, dpr, cx * dpr, cy * dpr);
      c.rotate(a);
      fn();
      if (s.mirror) { c.scale(1, -1); fn(); }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  function drawGuides() {
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.clearRect(0, 0, guides.width, guides.height);
    const r = Math.hypot(W, H);
    gctx.strokeStyle = 'rgba(237,235,230,0.06)';
    gctx.lineWidth = 1;
    eachSlice(gctx, { sym: settings.sym, mirror: false }, () => {
      gctx.beginPath(); gctx.moveTo(0, 0); gctx.lineTo(r, 0); gctx.stroke();
    });
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.beginPath();
    gctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2);
    gctx.fillStyle = 'rgba(237,235,230,0.25)';
    gctx.fill();
  }

  function style(s, p) {
    const color = s.color === 'rainbow' ? `hsl(${p.h} 75% 68%)` : s.color;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (s.brush === 'glow') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = color;
      ctx.shadowBlur = s.size * 2.2;
      ctx.globalAlpha = 0.55;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  // Draws the part of the stroke that ends at point i, smoothed with
  // quadratic curves through the midpoints of neighbouring points.
  function drawSegment(s, i) {
    const pts = s.pts;
    const p1 = pts[i];
    style(s, p1);
    if (i === 0) {
      eachSlice(ctx, s, () => {
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, (s.size * p1.w) / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }
    const p0 = pts[i - 1];
    const pm = pts[i - 2] || p0;
    const ax = (pm.x + p0.x) / 2, ay = (pm.y + p0.y) / 2;
    const bx = (p0.x + p1.x) / 2, by = (p0.y + p1.y) / 2;
    ctx.lineWidth = s.size * (p0.w + p1.w) / 2;
    eachSlice(ctx, s, () => {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(p0.x, p0.y, bx, by);
      ctx.stroke();
    });
  }

  function redraw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, paper.width, paper.height);
    for (const s of strokes) for (let i = 0; i < s.pts.length; i++) drawSegment(s, i);
    document.body.classList.toggle('has-drawn', strokes.length > 0);
  }

  /* ---------- Input ---------- */
  function point(e, prev) {
    const x = e.clientX - W / 2, y = e.clientY - H / 2;
    let w = 1;
    if (e.pointerType === 'pen' && e.pressure > 0) w = 0.3 + e.pressure * 1.2;
    else if (prev) {
      // Faster strokes come out thinner, like a real pen.
      const speed = Math.hypot(x - prev.x, y - prev.y);
      w = prev.w + (Math.max(0.45, Math.min(1.25, 1.3 - speed / 45)) - prev.w) * 0.35;
    }
    hue = (hue + 2) % 360;
    return { x, y, w, h: hue };
  }

  paper.addEventListener('pointerdown', (e) => {
    paper.setPointerCapture(e.pointerId);
    active = { ...settings, pts: [point(e)] };
    strokes.push(active);
    cleared = null;
    document.body.classList.add('has-drawn');
    drawSegment(active, 0);
  });
  paper.addEventListener('pointermove', (e) => {
    if (!active) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      const prev = active.pts[active.pts.length - 1];
      if (Math.hypot(ev.clientX - W / 2 - prev.x, ev.clientY - H / 2 - prev.y) < 1.5) continue;
      active.pts.push(point(ev, prev));
      drawSegment(active, active.pts.length - 1);
    }
  });
  const end = () => { active = null; };
  paper.addEventListener('pointerup', end);
  paper.addEventListener('pointercancel', end);

  /* ---------- Save ---------- */
  function save() {
    const out = document.createElement('canvas');
    out.width = paper.width; out.height = paper.height;
    const o = out.getContext('2d');
    o.fillStyle = '#0a0a0b';
    o.fillRect(0, 0, out.width, out.height);
    o.drawImage(paper, 0, 0);
    o.font = `${12 * dpr}px "JetBrains Mono", monospace`;
    o.fillStyle = 'rgba(237,235,230,0.45)';
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
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(resize, 120); });
  resize();
})();
