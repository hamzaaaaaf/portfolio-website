(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toast = (m) => window.toast && window.toast(m);
  const canvas = $('#gb-canvas');
  const ctx = canvas.getContext('2d');
  const wall = $('#gb-wall');
  const PAPER = '#fffdf3';

  let color = '#111008', size = 7, eraser = false, drawn = false;
  let strokes = [], active = null;

  /* ---------- Drawing pad ---------- */
  function paint() {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokes) {
      ctx.strokeStyle = s.erase ? PAPER : s.color;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = s.size;
      if (s.pts.length === 1) { ctx.beginPath(); ctx.arc(s.pts[0][0], s.pts[0][1], s.size / 2, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.beginPath();
      ctx.moveTo(s.pts[0][0], s.pts[0][1]);
      for (let i = 1; i < s.pts.length - 1; i++) {
        const [x0, y0] = s.pts[i], [x1, y1] = s.pts[i + 1];
        ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      }
      const last = s.pts[s.pts.length - 1];
      ctx.lineTo(last[0], last[1]);
      ctx.stroke();
    }
    drawn = strokes.some((s) => !s.erase);
    $('#gb-hint').hidden = strokes.length > 0;
  }
  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * canvas.width, ((e.clientY - r.top) / r.height) * canvas.height];
  };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    active = { color, size, erase: eraser, pts: [pos(e)] };
    strokes.push(active);
    paint();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!active) return;
    for (const ev of e.getCoalescedEvents ? e.getCoalescedEvents() : [e]) active.pts.push(pos(ev));
    paint();
  });
  const end = () => { active = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  const press = (sel, btn) => { $$(sel).forEach((b) => b.setAttribute('aria-pressed', 'false')); btn.setAttribute('aria-pressed', 'true'); };
  $$('[data-gbc]').forEach((b) => b.addEventListener('click', () => { color = b.dataset.gbc; eraser = false; $('#gb-eraser').setAttribute('aria-pressed', 'false'); press('[data-gbc]', b); }));
  $$('[data-gbs]').forEach((b) => b.addEventListener('click', () => { size = Number(b.dataset.gbs); press('[data-gbs]', b); }));
  $('#gb-eraser').addEventListener('click', (e) => { eraser = !eraser; e.currentTarget.setAttribute('aria-pressed', String(eraser)); });
  $('#gb-undo').addEventListener('click', () => { strokes.pop(); paint(); });
  $('#gb-clear').addEventListener('click', () => { strokes = []; paint(); });
  paint();

  /* ---------- Wall ---------- */
  let mine = [];
  try { mine = JSON.parse(localStorage.getItem('gb-mine') || '[]'); } catch (e) { /* storage blocked */ }
  const when = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const card = (e, pending) => `<figure class="polaroid${pending ? ' is-pending' : ''}" style="--r:${((e.id * 37) % 7) - 3}deg">
      <img src="${e.drawing}" alt="Drawing by ${esc(e.name)}" loading="lazy" width="300" height="300">
      <figcaption>${e.message ? `<p>${esc(e.message)}</p>` : ''}<b>${esc(e.name)}</b><span class="mono">${pending ? 'Waiting for approval' : when(e.created)}</span></figcaption>
    </figure>`;
  let approved = [];
  function renderWall() {
    const approvedIds = new Set(approved.map((e) => e.id));
    // Drop local copies once they're live.
    mine = mine.filter((m) => !approvedIds.has(m.id));
    try { localStorage.setItem('gb-mine', JSON.stringify(mine)); } catch (e) { /* storage blocked */ }
    const html = mine.map((e) => card(e, true)).join('') + approved.map((e) => card(e, false)).join('');
    wall.innerHTML = html || '<div class="gb__empty"><b>The wall is empty.</b><span>Be the first to sign it.</span></div>';
  }
  fetch('/api/guestbook').then((r) => r.json()).then((d) => { approved = d.entries || []; renderWall(); })
    .catch(() => { wall.innerHTML = '<p class="muted">The wall is offline right now.</p>'; });

  /* ---------- Submit ---------- */
  $('#gb-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#gb-name').value.trim();
    const message = $('#gb-msg').value.trim();
    if (!name) { $('#gb-name').focus(); return; }
    if (!drawn) { toast('Draw something first.'); return; }
    const btn = $('.gb__send');
    btn.disabled = true;
    try {
      const drawing = canvas.toDataURL('image/png');
      const r = await fetch('/api/guestbook', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, message, drawing }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not sign the wall.');
      mine.unshift({ id: d.id, name, message, drawing, created: Date.now() });
      renderWall();
      strokes = []; paint();
      $('#gb-msg').value = '';
      toast('Thanks! It will appear once it has been approved.');
      if (window.OS) window.OS.achieve('signer');
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });
})();
