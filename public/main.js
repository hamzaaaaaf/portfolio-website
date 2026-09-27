(() => {
  const root = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || 'home';
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem('prefs') || '{}'); } catch (e) { /* storage blocked */ }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || prefs.motion === 'reduce';
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // Scrolling is native on purpose: no scroll-jacking library, nothing
  // pinned, and no layout reads per frame. Motion below only touches
  // transform and opacity, which the compositor handles off the main thread.
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? body : $(id);
      if (!target) return;
      e.preventDefault();
      if (id === '#top') scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id === '#top' ? location.pathname : id);
    });
  });

  /* ---------- Loader ---------- */
  const loader = $('.loader');
  function finishLoading() {
    body.classList.remove('is-loading');
    body.classList.add('is-loaded');
    try { sessionStorage.setItem('seen-loader', '1'); } catch (e) { /* storage blocked */ }
    if (loader) {
      loader.addEventListener('transitionend', () => loader.classList.add('is-done'), { once: true });
      setTimeout(() => loader.classList.add('is-done'), 2000);
    }
  }

  let seen = false;
  try { seen = sessionStorage.getItem('seen-loader') === '1'; } catch (e) { /* storage blocked */ }
  if (!loader || reduce || seen) {
    loader && loader.classList.add('is-done');
    requestAnimationFrame(finishLoading);
  } else {
    const dur = 1300;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const p = ease(clamp((now - start) / dur));
      loader.style.setProperty('--p', p);
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finishLoading, 180);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Split helpers ---------- */
  function splitWords(el) {
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            words.push(s);
            frag.appendChild(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return words;
  }

  const words = [];
  $$('[data-words]').forEach((el) => words.push(...splitWords(el)));

  $$('[data-chars]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', i);
      s.textContent = c;
      el.appendChild(s);
    });
  });

  /* ---------- Reveal on view ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- LeetCode ---------- */
  const lc = $('[data-leetcode]');
  if (lc) {
    const set = (k, v) => { const el = lc.querySelector(`[data-lc="${k}"]`); if (el) el.textContent = v; };
    const ago = (ts) => {
      const d = Math.floor((Date.now() / 1000 - ts) / 86400);
      if (d < 1) return 'today';
      if (d < 2) return 'yesterday';
      if (d < 31) return `${d} days ago`;
      const m = Math.floor(d / 30);
      return m < 12 ? `${m} mo ago` : `${Math.floor(m / 12)} yr ago`;
    };
    const render = (data) => {
      set('all', data.solved.All ?? 0);
      set('easy', data.solved.Easy ?? 0);
      set('medium', data.solved.Medium ?? 0);
      set('hard', data.solved.Hard ?? 0);
      set('days', data.activeDays ?? 0);

      // Heatmap: columns of weeks ending today, UTC days like LeetCode.
      // A full year on wide screens, the last five months on phones.
      const heat = lc.querySelector('.lc__heat');
      const byDay = {};
      Object.entries(data.calendar || {}).forEach(([ts, n]) => { byDay[Math.floor(ts / 86400)] = n; });
      const today = Math.floor(Date.now() / 86400000);
      const todayDow = new Date(today * 86400000).getUTCDay();
      const weeks = innerWidth < 700 ? 22 : 53;
      const first = today - todayDow - (weeks - 1) * 7;
      set('range', weeks === 53 ? 'Last 12 months' : 'Last 5 months');
      const frag = document.createDocumentFragment();
      for (let d = first, i = 0; d <= today; d++, i++) {
        const n = byDay[d] || 0;
        const cell = document.createElement('i');
        cell.style.setProperty('--d', Math.floor(i / 7));
        if (n) {
          cell.dataset.l = n >= 8 ? 4 : n >= 5 ? 3 : n >= 2 ? 2 : 1;
          cell.title = `${n} submission${n > 1 ? 's' : ''} on ${new Date(d * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`;
        }
        frag.appendChild(cell);
      }
      heat.replaceChildren(frag);

      // Month labels above the first week column of each month.
      const months = lc.querySelector('.lc__months');
      if (months) {
        const labels = [];
        let lastMonth = -1;
        months.style.gridTemplateColumns = `repeat(${weeks}, minmax(0, 1fr))`;
        for (let col = 0; col < weeks; col++) {
          const date = new Date((first + col * 7) * 86400000);
          const m = date.getUTCMonth();
          if (m !== lastMonth && col < weeks - 2) {
            const span = document.createElement('span');
            span.style.gridColumn = String(col + 1);
            span.textContent = date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }).slice(0, 3);
            if (lastMonth !== -1 || date.getUTCDate() <= 7) labels.push(span);
            lastMonth = m;
          }
        }
        months.replaceChildren(...labels);
      }

      const list = lc.querySelector('.lc__list');
      list.replaceChildren(...(data.recent || []).slice(0, 5).map((r) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `https://leetcode.com/problems/${r.slug}/`;
        a.target = '_blank';
        a.rel = 'noopener';
        const t = document.createElement('span');
        t.textContent = r.title;
        const w = document.createElement('span');
        w.className = 'mono';
        w.textContent = ago(r.ts);
        a.append(t, w);
        li.appendChild(a);
        return li;
      }));
    };
    // Live numbers from the Worker, falling back to the last saved snapshot.
    fetch('/api/leetcode', { signal: AbortSignal.timeout(7000) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .catch(() => fetch('/leetcode.json').then((r) => r.json()))
      .then(render)
      .catch(() => lc.classList.add('is-offline'));
  }

  /* ---------- Theme ---------- */
  let fgRGB = '34,30,18';
  const readTheme = () => {
    fgRGB = getComputedStyle(root).getPropertyValue('--fg-rgb').trim().replace(/\s+/g, '') || fgRGB;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = root.dataset.theme === 'dark' ? '#15130c' : '#ffe066';
  };
  readTheme();
  addEventListener('themechange', readTheme);
  $$('.theme-toggle').forEach((btn) => btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
      readTheme();
      dispatchEvent(new CustomEvent('themechange', { detail: next }));
    };
    if (document.startViewTransition && !reduce) document.startViewTransition(apply);
    else apply();
  }));

  /* ---------- Toast ---------- */
  const toastEl = $('.toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.querySelector('.toast__text').textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }
  window.toast = toast;

  /* ---------- Window buttons ---------- */
  const closeLines = [
    'This window stays open.',
    'Still here.',
    'Try the yellow one instead.',
  ];
  let closes = 0;
  const zoom = (win) => {
    win.classList.toggle('is-zoomed');
    if (win.classList.contains('app-win')) setTimeout(() => dispatchEvent(new Event('resize')), 720);
    else win.style.maxWidth = win.classList.contains('is-zoomed') ? 'none' : '';
  };
  document.addEventListener('dblclick', (e) => {
    const barEl = e.target.closest('.win__bar');
    if (barEl && !e.target.closest('.light, button, input')) zoom(barEl.closest('.win'));
  });
  document.addEventListener('click', (e) => {
    const light = e.target.closest('.light');
    if (!light) return;
    e.preventDefault();
    e.stopPropagation();
    const win = light.closest('.win');
    if (light.classList.contains('light--r')) {
      win.classList.remove('is-shaking');
      void win.offsetWidth;
      win.classList.add('is-shaking');
      win.addEventListener('animationend', () => win.classList.remove('is-shaking'), { once: true });
      toast(closeLines[closes++ % closeLines.length]);
    } else if (light.classList.contains('light--y')) {
      win.classList.toggle('is-shaded');
      if (win.classList.contains('app-win')) win.classList.remove('is-zoomed');
    } else if (light.classList.contains('light--g')) {
      zoom(win);
    }
  }, true);

  /* ---------- Draggable desktop items (hero) ---------- */
  if (finePointer && innerWidth > 900) {
    let z = 10;
    $$('[data-drag]').forEach((el) => {
      el.classList.add('is-draggable');
      const handle = el.querySelector('.win__bar') || el;
      let sx = 0, sy = 0, ox = 0, oy = 0, moved = false, dragging = false;
      handle.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || e.target.closest('.light')) return;
        dragging = true; moved = false;
        sx = e.clientX; sy = e.clientY;
        ox = Number(el.dataset.x || 0); oy = Number(el.dataset.y || 0);
        el.style.zIndex = ++z;
        handle.setPointerCapture(e.pointerId);
      });
      handle.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 4) return;
        moved = true;
        el.classList.add('is-dragging');
        el.dataset.x = ox + dx; el.dataset.y = oy + dy;
        el.style.translate = `${ox + dx}px ${oy + dy}px`;
      });
      const stop = () => { dragging = false; el.classList.remove('is-dragging'); };
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
      // A drag shouldn't also count as a click on links like the sticky note.
      el.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
    });
  }

  /* ---------- Dock ---------- */
  const dockEl = $('.dock');
  if (dockEl) {
    const items = $$('.dock__item');
    if (finePointer && !reduce && prefs.magnify !== false) {
      dockEl.addEventListener('pointermove', (e) => {
        dockEl.classList.add('is-magnifying');
        for (const it of items) {
          const r = it.getBoundingClientRect();
          const d = Math.abs(e.clientX - (r.left + r.width / 2));
          it.style.setProperty('--s', (1 + 0.55 * Math.max(0, 1 - d / 150) ** 1.6).toFixed(3));
        }
      });
      dockEl.addEventListener('pointerleave', () => {
        dockEl.classList.remove('is-magnifying');
        items.forEach((it) => it.style.setProperty('--s', 1));
      });
    }
    items.forEach((it) => it.addEventListener('click', (e) => {
      const href = it.getAttribute('href');
      if (it.target === '_blank' || href.startsWith('/#') && page === 'home') { it.classList.add('bounce'); setTimeout(() => it.classList.remove('bounce'), 650); return; }
      if (reduce || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      it.classList.add('bounce');
      setTimeout(() => { location.href = href; }, 380);
    }));
  }

  /* ---------- Tilt ---------- */
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform 0.15s ease-out';
        el.style.setProperty('--ry', `${(x * 5).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- Mail ---------- */
  const mail = $('[data-mail]');
  if (mail) {
    mail.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = mail.subject.value.trim() || 'Hello from your website';
      const body = mail.body.value.trim();
      location.href = `mailto:hello@byhamza.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast('Opening your email app…');
    });
  }

  /* ---------- GitHub (stats page) ---------- */
  const gh = $('[data-github]');
  if (gh) {
    const LANG = { Python: '#3572A5', Java: '#b07219', JavaScript: '#f1e05a', GDScript: '#355570', HTML: '#e34c26', CSS: '#563d7c', TypeScript: '#3178c6' };
    fetch('/api/github', { signal: AbortSignal.timeout(7000) })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() => fetch('/github.json').then((r) => r.json()))
      .then((d) => {
        gh.querySelector('[data-gh="repos"]').textContent = d.repos.length;
        const total = Object.values(d.languages).reduce((a, b) => a + b, 0) || 1;
        const langs = Object.entries(d.languages).sort((a, b) => b[1] - a[1]);
        gh.querySelector('.gh__bar').replaceChildren(...langs.map(([l, n]) => {
          const i = document.createElement('i');
          i.style.flex = String(n / total);
          i.style.background = LANG[l] || '#aaa';
          i.title = `${l} ${Math.round((n / total) * 100)}%`;
          return i;
        }));
        gh.querySelector('.gh__langs').replaceChildren(...langs.map(([l, n]) => {
          const li = document.createElement('li');
          li.innerHTML = `<i style="background:${LANG[l] || '#aaa'}"></i>${l} <span class="muted">${Math.round((n / total) * 100)}%</span>`;
          return li;
        }));
        gh.querySelector('.gh__repos').replaceChildren(...d.repos.slice(0, 6).map((r) => {
          const a = document.createElement('a');
          a.href = r.url; a.target = '_blank'; a.rel = 'noopener';
          const n = document.createElement('b'); n.textContent = r.name;
          const m = document.createElement('span'); m.className = 'mono muted';
          m.textContent = `${r.language || '·'} · ${new Date(r.pushed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
          a.append(n, m);
          return a;
        }));
      })
      .catch(() => gh.classList.add('is-offline'));
  }

  /* ---------- Site stats (stats page) ---------- */
  const site = $('[data-sitestats]');
  if (site) {
    fetch('/api/scores').then((r) => r.json()).then(({ scores }) => {
      const top = scores[0];
      site.querySelector('[data-site="top"]').textContent = top ? `${top.score}` : '0';
      site.querySelector('[data-site="topname"]').textContent = top ? `by ${top.name}` : 'be first';
      site.querySelector('[data-site="players"]').textContent = scores.length;
    }).catch(() => {});
  }

  /* ---------- Marquees: pure CSS animation, content duplicated once ---------- */
  $$('.marquee__inner').forEach((inner) => { inner.innerHTML += inner.innerHTML; });

  /* ---------- Hero dot field ---------- */
  const canvas = $('.hero__field');
  const ctx = canvas && canvas.getContext('2d');
  let dots = [], dpr = 1, heroVisible = false;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

  function buildField() {
    if (!canvas) return;
    dpr = Math.min(2, devicePixelRatio || 1);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const gap = w < 700 ? 24 : 30;
    dots = [];
    for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) dots.push({ x, y });
  }

  function drawField(t) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    mouse.x = lerp(mouse.x, mouse.tx, 0.1);
    mouse.y = lerp(mouse.y, mouse.ty, 0.1);
    const R = Math.min(w, h) * 0.28, R2 = R * R;
    const cx = w * 0.72, cy = h * 0.42;
    ctx.fillStyle = `rgb(${fgRGB})`;
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const wave = Math.sin(d.x * 0.012 + t * 0.0006) * Math.cos(d.y * 0.014 - t * 0.0005);
      let x = d.x, y = d.y + wave * 5;
      const dx = x - mouse.x, dy = y - mouse.y;
      const dist2 = dx * dx + dy * dy;
      let a = 0.07 + (wave + 1) * 0.05;
      if (dist2 < R2 * 4) {
        const f = Math.exp(-dist2 / R2);
        const len = Math.sqrt(dist2) || 1;
        x += (dx / len) * f * 26;
        y += (dy / len) * f * 26;
        a += f * 0.55;
      }
      const gx = (d.x - cx) / w, gy = (d.y - cy) / h;
      ctx.globalAlpha = a * 0.8 * clamp(1.25 - Math.sqrt(gx * gx + gy * gy) * 1.6, 0.25, 1);
      ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  }

  if (canvas) {
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(canvas);
    if (finePointer) {
      // Canvas rect is cached on resize so pointermove never forces layout.
      let rect = canvas.getBoundingClientRect();
      addEventListener('resize', () => { rect = canvas.getBoundingClientRect(); });
      addEventListener('scroll', () => { rect = null; }, { passive: true });
      addEventListener('pointermove', (e) => {
        if (!heroVisible) return;
        if (!rect) rect = canvas.getBoundingClientRect();
        mouse.tx = e.clientX - rect.left;
        mouse.ty = e.clientY - rect.top;
      }, { passive: true });
    }
  }

  /* ---------- Cursor bubble ---------- */
  const cursor = $('.cursor');
  const label = cursor && cursor.querySelector('.cursor__label');
  const cur = { x: -100, y: -100, tx: -100, ty: -100 };
  let cursorOn = false;
  if (cursor && finePointer && !reduce) {
    root.classList.add('has-cursor');
    addEventListener('pointermove', (e) => { cur.tx = e.clientX; cur.ty = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const view = e.target.closest('[data-cursor]');
      cursorOn = !!view;
      cursor.classList.toggle('is-view', cursorOn);
      if (view) label.textContent = view.dataset.cursor;
    });
  }

  /* ---------- Frame loop: only runs work that is visible ---------- */
  // The dot field rests while the page is being scrolled, so every frame
  // during a scroll goes to the scroll itself.
  let scrolling = 0;
  addEventListener('scroll', () => { scrolling = performance.now(); }, { passive: true });
  function frame(t) {
    if (canvas && heroVisible && !reduce && !document.hidden && t - scrolling > 140) drawField(t);
    if (cursorOn || Math.abs(cur.x - cur.tx) > 0.5) {
      cur.x = lerp(cur.x, cur.tx, 0.22);
      cur.y = lerp(cur.y, cur.ty, 0.22);
      cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(frame);
  }

  function onResize() {
    buildField();
    if (canvas && reduce) drawField(0);
  }
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(onResize, 120); });
  onResize();
  requestAnimationFrame(frame);
})();
