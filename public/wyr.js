(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toast = (m) => window.toast && window.toast(m);
  const stage = $('#wyr-stage');
  let GAMES = [], byId = {};
  let pair = null, busy = false, voted = false;
  let streak = 0, count = 0;
  try { count = Number(localStorage.getItem('wyr-count')) || 0; } catch (e) { /* storage blocked */ }

  const cover = (g, big) => `<div class="cover cover--game${big ? ' cover--big' : ''}" style="--c1:${g.c[0]};--c2:${g.c[1]};--c3:${g.c[2]}"><span class="cover__band">${esc(g.g)} · ${g.y}</span><span class="cover__g">${g.i}</span><span class="cover__t">${esc(g.t)}</span></div>`;

  function newPair() {
    let a, b;
    do { a = GAMES[(Math.random() * GAMES.length) | 0]; b = GAMES[(Math.random() * GAMES.length) | 0]; } while (a.id === b.id);
    pair = [a, b];
    voted = false;
    stage.classList.remove('is-voted');
    stage.innerHTML = pair.map((g, i) => `<button type="button" class="wyr__card" data-side="${i}" aria-label="${esc(g.t)}">
        ${cover(g, true)}
        <span class="wyr__name">${esc(g.t)}</span>
        <span class="wyr__meta">${esc(g.g)} · ${g.y}${g.h ? ' · <b>Hamza’s pick</b>' : ''}</span>
        <span class="wyr__bar"><i></i><b></b></span>
      </button>`).join('<span class="wyr__or" aria-hidden="true">OR</span>');
    stage.animate([{ opacity: 0, transform: 'translateY(10px) scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(0.16,1,0.3,1)' });
  }

  async function vote(side) {
    if (busy || voted || !pair) return;
    busy = true; voted = true;
    const pick = pair[side], other = pair[1 - side];
    const cards = $$('.wyr__card');
    cards[side].classList.add('is-pick');
    stage.classList.add('is-voted');
    let counts;
    try {
      const r = await fetch('/api/wyr', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a: pair[0].id, b: pair[1].id, pick: pick.id }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      counts = d.counts;
    } catch (e) {
      counts = { [pick.id]: 1, [other.id]: 0 };
      toast('Offline, so your vote was not counted.');
    }
    const total = counts[pair[0].id] + counts[pair[1].id] || 1;
    pair.forEach((g, i) => {
      const pct = Math.round((counts[g.id] / total) * 100);
      const bar = cards[i].querySelector('.wyr__bar');
      bar.querySelector('b').textContent = `${pct}%`;
      requestAnimationFrame(() => { bar.querySelector('i').style.transform = `scaleX(${pct / 100})`; });
    });
    const majority = counts[pick.id] >= counts[other.id];
    streak = majority ? streak + 1 : 0;
    count++;
    try { localStorage.setItem('wyr-count', String(count)); } catch (e) { /* storage blocked */ }
    $('#wyr-streak').textContent = streak;
    $('#wyr-count').textContent = count;
    $('#wyr-verdict').textContent = total <= 1 ? 'First vote on this one.' : majority ? `You’re with the ${Math.round((counts[pick.id] / total) * 100)}%.` : 'Bold. The crowd disagrees.';
    if (window.OS) { window.OS.achieve('voter'); if (count >= 25) window.OS.achieve('critic'); }
    busy = false;
  }

  stage.addEventListener('click', (e) => {
    const card = e.target.closest('.wyr__card');
    if (!card) return;
    if (voted) newPair(); else vote(Number(card.dataset.side));
  });
  $('#wyr-skip').addEventListener('click', () => { $('#wyr-verdict').textContent = ''; newPair(); });
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, dialog') || $('#wyr-play').hidden) return;
    if (e.key === 'ArrowLeft' || e.key === '1') vote(0);
    else if (e.key === 'ArrowRight' || e.key === '2') vote(1);
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); $('#wyr-verdict').textContent = ''; newPair(); }
  });

  /* ---------- Rankings ---------- */
  async function rankings() {
    const list = $('#wyr-rank');
    list.innerHTML = '<li class="muted">Loading…</li>';
    try {
      const d = await fetch('/api/wyr/top').then((r) => r.json());
      $('#wyr-total').textContent = d.votes.toLocaleString('en-GB');
      const rows = d.top.filter((r) => byId[r.game]);
      list.innerHTML = rows.length ? rows.map((r, i) => {
        const g = byId[r.game], games = r.wins + r.losses;
        return `<li><span class="wyr__rk">${i + 1}</span>${cover(g, false)}<span class="wyr__rn"><b>${esc(g.t)}</b><span>${esc(g.g)} · ${g.y}${g.h ? ' · Hamza’s pick' : ''}</span></span><span class="wyr__rs"><b>${Math.round(r.rating)}</b><span>${Math.round((r.wins / games) * 100)}% of ${games}</span></span></li>`;
      }).join('') : '<li class="muted">No votes yet. Go play a few rounds.</li>';
    } catch (e) { list.innerHTML = '<li class="muted">Offline.</li>'; }
  }
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-tab]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#wyr-play').hidden = b.dataset.tab !== 'play';
    $('#wyr-ranks').hidden = b.dataset.tab !== 'ranks';
    if (b.dataset.tab === 'ranks') rankings();
  }));

  $('#wyr-count').textContent = count;
  fetch('/games.json').then((r) => r.json()).then((g) => {
    GAMES = g;
    byId = Object.fromEntries(g.map((x) => [x.id, x]));
    $('#wyr-lib').textContent = g.length;
    newPair();
  });
})();
