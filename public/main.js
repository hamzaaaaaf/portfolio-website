(() => {
  const root = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || 'home';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  /* ---------- Smooth scroll (home only; app pages don't scroll) ---------- */
  let lenis = null;
  if (page === 'home' && !reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
  }
  const scrollY = () => window.scrollY || window.pageYOffset;

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? body : $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { duration: 1.6 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Loader ---------- */
  const loader = $('.loader');
  function finishLoading() {
    body.classList.remove('is-loading');
    body.classList.add('is-loaded');
    lenis && lenis.start();
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
    const count = loader.querySelector('.loader__count');
    lenis && lenis.stop();
    const dur = 1700;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const p = ease(clamp((now - start) / dur));
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');
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
            span.textContent = date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
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
      layout();
    };
    // Live numbers from the Worker, falling back to the last saved snapshot.
    fetch('/api/leetcode')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .catch(() => fetch('/leetcode.json').then((r) => r.json()))
      .then(render)
      .catch(() => lc.classList.add('is-offline'));
  }

  /* ---------- Layout measurements (home) ---------- */
  const hero = $('.hero');
  const heroInner = $('.hero__inner');
  const statement = $('.statement');
  const work = $('.work');
  const track = $('.work__track');
  const progress = $('.work__progress');
  const arts = $$('.art');
  const nav = $('.nav');

  let vw = innerWidth, vh = innerHeight;
  let statementTop = 0, statementLen = 1;
  let workTop = 0, workLen = 1, workDist = 0, pinned = false;

  const offsetTop = (el) => el.getBoundingClientRect().top + scrollY();

  function layout() {
    vw = innerWidth; vh = innerHeight;
    if (work && track) {
      pinned = vw > 900 && !reduce;
      if (pinned) {
        track.style.transform = 'none';
        workDist = Math.max(0, track.scrollWidth - vw);
        work.style.height = `${workDist + vh}px`;
      } else {
        work.style.height = '';
        track.style.transform = '';
        workDist = 0;
      }
      workTop = offsetTop(work);
      workLen = Math.max(1, work.offsetHeight - vh);
    }
    if (statement) {
      statementTop = offsetTop(statement);
      statementLen = Math.max(1, statement.offsetHeight - vh);
    }
    lenis && lenis.resize();
  }

  /* ---------- Marquees ---------- */
  const marquees = $$('.marquee').map((el) => {
    const inner = el.querySelector('.marquee__inner');
    inner.innerHTML += inner.innerHTML + inner.innerHTML;
    return { inner, dir: Number(el.dataset.dir) || -1, x: 0, w: 0 };
  });
  const measureMarquees = () => marquees.forEach((m) => { m.w = m.inner.scrollWidth / 3; });

  /* ---------- Hero dot field ---------- */
  const canvas = $('.hero__field');
  const ctx = canvas && canvas.getContext('2d');
  let dots = [], dpr = 1, heroVisible = !!canvas;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

  function buildField() {
    if (!canvas) return;
    dpr = Math.min(2, devicePixelRatio || 1);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const gap = w < 700 ? 22 : 30;
    dots = [];
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2; x < w; x += gap) dots.push({ x, y });
    }
  }

  function drawField(t) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    mouse.x = lerp(mouse.x, mouse.tx, 0.08);
    mouse.y = lerp(mouse.y, mouse.ty, 0.08);
    const R = Math.min(w, h) * 0.28, R2 = R * R;
    const cx = w * 0.72, cy = h * 0.42;
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
      // soft spotlight so the field fades toward the text side
      const gx = (d.x - cx) / w, gy = (d.y - cy) / h;
      a *= clamp(1.25 - Math.sqrt(gx * gx + gy * gy) * 1.6, 0.25, 1);
      ctx.fillStyle = `rgba(237,235,230,${a.toFixed(3)})`;
      ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
    }
  }

  if (hero) new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(hero);
  if (canvas && finePointer) {
    addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
    }, { passive: true });
  }

  /* ---------- Cursor & magnetic ---------- */
  const cursor = $('.cursor');
  const label = cursor && cursor.querySelector('.cursor__label');
  const cur = { x: -100, y: -100, tx: -100, ty: -100 };
  if (cursor && finePointer && !reduce) {
    root.classList.add('has-cursor');
    addEventListener('pointermove', (e) => { cur.tx = e.clientX; cur.ty = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const view = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, input, label');
      cursor.classList.toggle('is-view', !!view);
      cursor.classList.toggle('is-link', !view && !!link);
      if (view) label.textContent = view.dataset.cursor;
    });
    document.addEventListener('pointerleave', () => { cur.tx = cur.ty = -100; });

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transition = 'transform 0.2s ease-out';
        el.style.transform = `translate(${x * 0.28}px, ${y * 0.34}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Clock ---------- */
  const clocks = $$('[data-clock]');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
  const tickClock = () => { const s = fmt.format(new Date()); clocks.forEach((c) => { c.textContent = s; }); };
  tickClock();
  setInterval(tickClock, 15000);

  /* ---------- Frame loop ---------- */
  let lastY = scrollY();
  let navHidden = false;
  let lastWordP = -1;

  function frame(t) {
    lenis && lenis.raf(t);
    const y = scrollY();
    const vel = lenis ? lenis.velocity : y - lastY;

    // nav hides on scroll down, returns on scroll up
    if (nav && Math.abs(y - lastY) > 2) {
      const hide = y > lastY && y > vh * 0.6;
      if (hide !== navHidden) { navHidden = hide; nav.classList.toggle('is-hidden', hide); }
    }
    lastY = y;

    if (heroInner && !reduce && y < vh * 1.2) {
      const p = clamp(y / vh);
      heroInner.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
      heroInner.style.opacity = String(1 - p * 1.1);
    }
    if (canvas && heroVisible && !reduce) drawField(t);

    // statement words light up with scroll
    if (!reduce && words.length) {
      const p = clamp((y - statementTop + vh * 0.2) / statementLen);
      if (Math.abs(p - lastWordP) > 0.001) {
        lastWordP = p;
        const n = words.length, spread = 6;
        const head = p * (n + spread);
        for (let i = 0; i < n; i++) {
          words[i].style.opacity = (0.14 + 0.86 * clamp((head - i) / spread)).toFixed(3);
        }
      }
    }

    // horizontal work track
    if (pinned) {
      const p = clamp((y - workTop) / workLen);
      track.style.transform = `translate3d(${-p * workDist}px, 0, 0)`;
      progress.style.setProperty('--p', p.toFixed(4));
      if (y > workTop - vh && y < workTop + workLen + vh) {
        for (const art of arts) {
          const r = art.parentElement.getBoundingClientRect();
          const off = (r.left + r.width / 2 - vw / 2) / vw;
          art.style.transform = `translate3d(${off * -12}%, 0, 0)`;
        }
      }
    }

    // marquees: steady drift, pushed along by scroll velocity
    if (!reduce) {
      for (const m of marquees) {
        if (!m.w) continue;
        m.x += m.dir * (0.6 + Math.min(Math.abs(vel), 60) * 0.35);
        if (m.x <= -m.w) m.x += m.w;
        if (m.x > 0) m.x -= m.w;
        m.inner.style.transform = `translate3d(${m.x}px, 0, 0)`;
      }
    }

    if (root.classList.contains('has-cursor')) {
      cur.x = lerp(cur.x, cur.tx, 0.2);
      cur.y = lerp(cur.y, cur.ty, 0.2);
      cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(frame);
  }

  /* ---------- Init ---------- */
  function onResize() {
    buildField();
    measureMarquees();
    layout();
    if (canvas && reduce) drawField(0);
  }
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(onResize, 120); });
  onResize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  addEventListener('load', onResize);
  requestAnimationFrame(frame);
})();
