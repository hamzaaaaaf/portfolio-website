(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DATA = JSON.parse($('#fnd-data').textContent);
  const items = $('#fnd-items');
  const peek = $('#fnd-peek');
  const q = $('#fnd-q');
  const NAMES = { projects: 'Projects', games: 'Games', movies: 'Movies', apps: 'Apps', achievements: 'Achievements' };
  const FOLDERS = Object.keys(NAMES);

  let view = 'grid';
  try { view = localStorage.getItem('finder-view') || 'grid'; } catch (e) { /* storage blocked */ }
  let folder = FOLDERS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'projects';
  let list = [];
  let sel = -1;
  const back = [], fwd = [];

  /* ---------- Artwork ---------- */
  // Cases for games, posters for films: drawn from a palette, a glyph and the title.
  const cover = (it, kind) => `<div class="cover cover--${kind}" style="--c1:${it.c[0]};--c2:${it.c[1]};--c3:${it.c[2]}"><span class="cover__g">${it.g}</span><span class="cover__t">${esc(it.t)}</span>${kind === 'game' ? `<span class="cover__band">${esc(it.p)}</span>` : ''}</div>`;
  const projArt = (it) => `<div class="cover cover--proj"><div class="art ${it.art}"></div><span class="project__glyph">${esc(it.g)}</span></div>`;
  const badge = (a, got) => `<div class="badge${got ? ' is-got' : ''}"><span>${a.i}</span></div>`;

  function achievements() {
    const OS = window.OS;
    if (!OS || !OS.ACHIEVEMENTS) return [];
    const got = OS.achieved();
    return OS.ACHIEVEMENTS.map((a) => ({ ...a, got: !!got[a.id], when: got[a.id] }));
  }

  function itemsFor(f) {
    if (f === 'games') return DATA.games.map((it) => ({ ...it, kind: 'game', icon: cover(it, 'game'), sub: it.p }));
    if (f === 'movies') return DATA.movies.map((it) => ({ ...it, kind: 'movie', icon: cover(it, 'movie'), sub: it.p }));
    if (f === 'projects') return DATA.projects.map((it) => ({ ...it, kind: 'project', icon: projArt(it), sub: it.p }));
    if (f === 'apps') return DATA.apps.map((it) => ({ ...it, kind: 'app', icon: `<div class="appicon">${it.icon}</div>`, sub: it.p }));
    return achievements().map((a) => ({ id: a.id, t: a.got || !a.secret ? a.t : '???', sub: a.got ? 'Unlocked' : 'Locked', note: a.got || !a.secret ? a.d : 'A secret. Keep exploring.', kind: 'ach', icon: badge(a, a.got), got: a.got, when: a.when, i: a.i }));
  }

  /* ---------- Rendering ---------- */
  function render() {
    const term = q.value.trim().toLowerCase();
    const all = term ? FOLDERS.flatMap((f) => itemsFor(f).map((it) => ({ ...it, folder: f }))) : itemsFor(folder);
    list = term ? all.filter((it) => `${it.t} ${it.sub} ${it.note || ''}`.toLowerCase().includes(term)) : all;
    items.className = `fnd__items is-${view}`;
    items.innerHTML = list.map((it, i) => `<div class="fitem fitem--${it.kind}${it.kind === 'ach' && !it.got ? ' is-locked' : ''}" role="option" data-i="${i}" aria-selected="${i === sel}" tabindex="-1">
        <div class="fitem__icon">${it.icon}</div>
        <div class="fitem__label"><b>${esc(it.t)}</b><span>${esc(it.sub || '')}</span></div>
        <span class="fitem__kind">${esc(term ? NAMES[it.folder] : kindName(it.kind))}</span>
      </div>`).join('') || `<p class="fnd__empty">${term ? 'No results.' : 'This folder is empty.'}</p>`;
    $('#fnd-path').textContent = term ? `Searching “${q.value.trim()}”` : NAMES[folder];
    $('#fnd-title').textContent = term ? 'Search' : NAMES[folder];
    const got = folder === 'achievements' && !term ? list.filter((a) => a.got).length : null;
    $('#fnd-status').textContent = got !== null ? `${got} of ${list.length} unlocked` : `${list.length} item${list.length === 1 ? '' : 's'}`;
    $$('[data-folder]').forEach((b) => b.setAttribute('aria-current', String(!term && b.dataset.folder === folder)));
    $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    FOLDERS.forEach((f) => { const el = $(`[data-count="${f}"]`); if (el) el.textContent = f === 'achievements' ? `${achievements().filter((a) => a.got).length}/${achievements().length}` : ''; });
    $('#fnd-back').disabled = !back.length;
    $('#fnd-fwd').disabled = !fwd.length;
    showPeek();
  }
  const kindName = (k) => ({ game: 'Game', movie: 'Film', project: 'Project', app: 'App', ach: 'Achievement' }[k]);

  function showPeek() {
    const it = list[sel];
    peek.classList.toggle('is-empty', !it);
    if (!it) { peek.innerHTML = `<div class="peek__empty"><b>${NAMES[folder]}</b><span>${folder === 'games' ? 'Where it all started, and everything since.' : folder === 'movies' ? 'Found footage, mostly. The scarier the better.' : 'Select something to preview it.'}</span></div>`; return; }
    const rows = [];
    if (it.kind === 'game') rows.push(['Played on', it.p], ['Note', it.yr]);
    if (it.kind === 'movie') rows.push(['Details', it.p], ['Verdict', it.yr]);
    if (it.kind === 'project') rows.push(['Built with', it.p], ['Year', it.yr]);
    if (it.kind === 'app') rows.push(['Kind', it.p]);
    if (it.kind === 'ach') rows.push(['Status', it.got ? `Unlocked ${new Date(it.when).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Locked']);
    const action = it.open ? `<a class="mac-btn mac-btn--primary" href="${it.open}">Open</a>` : '';
    peek.innerHTML = `<div class="peek__art">${it.icon}</div>
      <h2>${esc(it.t)}</h2>
      ${it.note ? `<p>${esc(it.note)}</p>` : ''}
      <dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${action}`;
  }

  function select(i, scroll = true) {
    sel = Math.max(-1, Math.min(list.length - 1, i));
    $$('.fitem', items).forEach((el) => el.setAttribute('aria-selected', String(Number(el.dataset.i) === sel)));
    const el = $(`.fitem[data-i="${sel}"]`, items);
    if (el && scroll) el.scrollIntoView({ block: 'nearest' });
    showPeek();
    document.body.classList.toggle('fnd-peeking', sel >= 0);
  }

  function go(f, push = true) {
    if (!FOLDERS.includes(f)) return;
    if (push && f !== folder) { back.push(folder); fwd.length = 0; }
    folder = f;
    sel = -1;
    q.value = '';
    history.replaceState(null, '', `#${f}`);
    if (f === 'games' && window.OS) window.OS.achieve('gamer');
    document.body.classList.remove('fnd-peeking');
    render();
  }

  function open(it) {
    if (!it) return;
    if (it.open) location.href = it.open;
    else document.body.classList.add('fnd-peeking');
  }

  /* ---------- Events ---------- */
  $$('[data-folder]').forEach((b) => b.addEventListener('click', () => go(b.dataset.folder)));
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => {
    view = b.dataset.view;
    try { localStorage.setItem('finder-view', view); } catch (e) { /* storage blocked */ }
    render();
  }));
  $('#fnd-back').addEventListener('click', () => { if (back.length) { fwd.push(folder); go(back.pop(), false); } });
  $('#fnd-fwd').addEventListener('click', () => { if (fwd.length) { back.push(folder); go(fwd.pop(), false); } });
  q.addEventListener('input', () => { sel = -1; render(); });
  items.addEventListener('click', (e) => {
    const el = e.target.closest('.fitem');
    if (!el) { select(-1); return; }
    select(Number(el.dataset.i), false);
  });
  items.addEventListener('dblclick', (e) => { const el = e.target.closest('.fitem'); if (el) open(list[Number(el.dataset.i)]); });
  peek.addEventListener('click', (e) => { if (e.target === peek && innerWidth < 800) select(-1); });

  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); q.focus(); return; }
    if (e.target === q) { if (e.key === 'Escape') { q.value = ''; render(); q.blur(); } if (e.key === 'ArrowDown') { e.preventDefault(); q.blur(); items.focus(); select(0); } return; }
    if (e.target.closest('input, textarea, dialog')) return;
    const cols = view === 'grid' ? Math.max(1, Math.round(items.clientWidth / ($('.fitem', items)?.offsetWidth || 140))) : 1;
    if (e.key === 'ArrowRight') { e.preventDefault(); select(sel + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); select(sel - 1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); select(sel < 0 ? 0 : sel + cols); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(sel - cols); }
    else if (e.key === 'Enter') { e.preventDefault(); open(list[sel]); }
    else if (e.key === ' ') { e.preventDefault(); if (sel < 0) select(0); document.body.classList.toggle('fnd-peeking'); }
    else if (e.key === 'Escape') select(-1);
  });
  addEventListener('hashchange', () => go(location.hash.slice(1)));
  addEventListener('achievement', () => render());

  // Achievements live in os.js, which loads alongside this file.
  const ready = () => { if (!window.OS) { setTimeout(ready, 30); return; } render(); if (folder === 'games') window.OS.achieve('gamer'); };
  ready();
})();
