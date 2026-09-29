(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
  };
  const toast = (m) => window.toast && window.toast(m);

  const WORDS = `the be of and a to in he have it that for they with as not on she at by this we you do but from or which one would all will there say who make when can more if no man out other so what time up go about than into could state only new year some take come these know see use get like then first any work now may such give over think most even find day also after way many must look before great back through long where much should well people down own just because good each those feel seem how high too place little world very still nation hand old life tell write become here show house both between need mean call develop under last right move thing general school never same another begin while number part turn real leave might want point form off child few small since against ask late home interest large person end open public follow during present without again hold govern around possible head consider word program problem however lead system set order eye plan run keep face fact group play stand increase early course change help line city put close case force meet once water upon war build hear light unite live every country bring center let side try provide continue name certain power pay result question study woman member until far night always service away report something company week church toward start social room figure nature though young less enough almost read include president nothing yet better big boy cost business value second why clear expect family complete act sense mind experience art next near direct car law industry important girl god several matter usual rather per often kind among white reason action return foot care simple within love human along appear doctor believe speak active student month drive concern best door hope example inform body ever least probable understand reach effect different idea whole control condition field pass fall note special talk particular today measure walk teach low hour type carry rate remain full street easy although record sit determine level local sure receive thus moment spirit train college religion perhaps music grow free cause serve age book board recent sound office cut step class true history position above strong friend necessary add court deal tax support party whether either land material happen education death agree arm mother across quite anything town past view society manage answer break organize half fire lose money stop actual already effort wait department able political learn voice air together shall cover common subject draw short wife treat limit road letter color behind produce send term total university rise century success minute remember purpose test fight watch situation south ago difference stage father table rest bear entire market prepare explain offer plant charge ground west picture hard front lie modern dark surface rule regard dance peace observe future wall farm claim firm operation further pressure property morning amount top outside piece sometimes beauty trade fear demand wonder list accept judge paint mile soon responsible allow secretary heart union slow island drink story experiment stay paper space apply decide share desire spend sign therefore various visit supply officer doubt private immediate wish contain feed raise describe ready horse son exist north suggest station effective food deep wide alone character english happy critic unit product respect drop nor fill cold choose`.split(' ');

  const CODE = {
    python: [
      'def fizzbuzz(n):\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            print("FizzBuzz")\n        elif i % 3 == 0:\n            print("Fizz")\n        elif i % 5 == 0:\n            print("Buzz")\n        else:\n            print(i)',
      'def binary_search(items, target):\n    lo, hi = 0, len(items) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if items[mid] == target:\n            return mid\n        if items[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1',
      'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i',
    ],
    java: [
      'public static int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}',
      "public boolean isAnagram(String s, String t) {\n    int[] count = new int[26];\n    for (char c : s.toCharArray()) count[c - 'a']++;\n    for (char c : t.toCharArray()) count[c - 'a']--;\n    for (int n : count) if (n != 0) return false;\n    return true;\n}",
      'class Node {\n    int value;\n    Node next;\n\n    Node(int value) {\n        this.value = value;\n    }\n}',
    ],
  };

  const els = {
    viewport: $('#tt-viewport'), words: $('#tt-words'), caret: $('#tt-caret'), input: $('#tt-input'),
    timer: $('#tt-timer'), wpm: $('#tt-wpm'), acc: $('#tt-acc'), test: $('#tt-test'), results: $('#tt-results'),
    rWpm: $('#tt-r-wpm'), rAcc: $('#tt-r-acc'), rRaw: $('#tt-r-raw'), rChars: $('#tt-r-chars'), rTime: $('#tt-r-time'),
    rMode: $('#tt-r-mode'), rPb: $('#tt-r-pb'), graph: $('#tt-graph'), submit: $('#tt-submit'), initials: $('#tt-initials'),
    board: $('#tt-board'), boardWrap: $('#tt-boardwrap'), focusHint: $('#tt-focus'),
  };

  let mode = store.get('type-mode', { kind: 'time', value: 30 });
  let clicks = store.get('type-clicks', false);
  let target = '';
  let spans = [];
  let typed = [];
  let keystrokes = 0, correctKeys = 0;
  let startedAt = 0, finished = false, running = false;
  let samples = [];
  let lineH = 0;

  /* ---------- Setup ---------- */
  function shuffleWords(n) {
    const out = [];
    let prev = '';
    while (out.length < n) {
      const w = WORDS[(Math.random() * WORDS.length) | 0];
      if (w !== prev) { out.push(w); prev = w; }
    }
    return out.join(' ');
  }

  function build() {
    if (mode.kind === 'code') {
      const list = CODE[mode.value];
      let i = store.get(`type-snippet-${mode.value}`, 0) % list.length;
      target = list[i];
      store.set(`type-snippet-${mode.value}`, i + 1);
    } else {
      target = shuffleWords(mode.kind === 'words' ? mode.value : 220);
    }
    const frag = document.createDocumentFragment();
    spans = [];
    for (const ch of target) {
      const s = document.createElement('span');
      s.className = 'ch';
      if (ch === '\n') { s.className = 'ch nl'; s.textContent = '↵'; frag.appendChild(s); spans.push(s); frag.appendChild(document.createElement('br')); continue; }
      s.textContent = ch;
      frag.appendChild(s);
      spans.push(s);
    }
    els.words.classList.toggle('is-code', mode.kind === 'code');
    els.words.replaceChildren(frag);
    typed = [];
    keystrokes = 0; correctKeys = 0; samples = [];
    startedAt = 0; finished = false; running = false; lastSample = 0;
    els.words.style.transform = '';
    els.test.hidden = false;
    els.results.hidden = true;
    document.body.classList.remove('tt-running');
    lineH = spans[0] ? spans[0].offsetHeight * 1.0 : 40;
    updateStats(0);
    els.timer.textContent = mode.kind === 'time' ? mode.value : `0/${mode.kind === 'words' ? mode.value : target.length}`;
    requestAnimationFrame(placeCaret);
    focus();
  }

  function focus() { els.input.focus({ preventScroll: true }); }

  /* ---------- Caret and line scrolling ---------- */
  function placeCaret() {
    const i = typed.length;
    const s = spans[Math.min(i, spans.length - 1)];
    if (!s) return;
    const atEnd = i >= spans.length;
    const x = s.offsetLeft + (atEnd ? s.offsetWidth : 0);
    const y = s.offsetTop;
    const lh = s.offsetHeight;
    // Keep the caret on the first or second line; scroll the text instead.
    const line = Math.round(y / lh);
    const shift = Math.max(0, line - 1) * lh;
    els.words.style.transform = `translateY(${-shift}px)`;
    els.caret.style.height = `${lh * 0.8}px`;
    els.caret.style.transform = `translate(${x}px, ${y - shift + lh * 0.1}px)`;
  }

  /* ---------- Typing ---------- */
  function start() {
    running = true;
    startedAt = performance.now();
    document.body.classList.add('tt-running');
    requestAnimationFrame(tick);
  }

  function correctCount() {
    let n = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) n++;
    return n;
  }

  function typeChar(ch) {
    if (finished) return;
    if (!running) start();
    const i = typed.length;
    if (i >= target.length) return;
    typed.push(ch);
    keystrokes++;
    const ok = ch === target[i];
    if (ok) correctKeys++;
    spans[i].classList.add(ok ? 'ok' : 'bad');
    click(ok);
    // In code mode, skip the indentation after a newline.
    if (mode.kind === 'code' && target[i] === '\n' && ok) {
      while (target[typed.length] === ' ') { spans[typed.length].classList.add('ok', 'auto'); typed.push(' '); }
    }
    placeCaret();
    if (mode.kind === 'words') els.timer.textContent = `${target.slice(0, typed.length).split(' ').length - (target[typed.length - 1] === ' ' ? 1 : 0)}/${mode.value}`;
    if (mode.kind === 'code') els.timer.textContent = `${typed.length}/${target.length}`;
    if (mode.kind !== 'time' && typed.length >= target.length) finish();
  }

  function backspace(word) {
    if (finished || !typed.length) return;
    do {
      const i = typed.length - 1;
      typed.pop();
      spans[i].classList.remove('ok', 'bad', 'auto');
      // Unwind auto-skipped indentation together with its newline.
      while (typed.length && spans[typed.length - 1].classList.contains('auto')) {
        typed.pop();
        spans[typed.length].classList.remove('ok', 'auto');
      }
    } while (word && typed.length && target[typed.length - 1] !== ' ' && target[typed.length - 1] !== '\n');
    placeCaret();
  }

  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' || e.key === 'Escape') { e.preventDefault(); build(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); backspace(e.ctrlKey || e.altKey || e.metaKey); return; }
    if (e.key === 'Enter') { e.preventDefault(); if (finished) build(); else if (mode.kind === 'code') typeChar('\n'); return; }
  });
  els.input.addEventListener('input', (e) => {
    const v = els.input.value;
    els.input.value = '';
    if (e.inputType === 'deleteContentBackward') { backspace(false); return; }
    for (const ch of v) typeChar(ch);
  });
  els.viewport.addEventListener('pointerdown', (e) => { e.preventDefault(); focus(); });
  els.input.addEventListener('focus', () => els.focusHint.classList.remove('show'));
  els.input.addEventListener('blur', () => { if (!finished) els.focusHint.classList.add('show'); });
  addEventListener('keydown', (e) => {
    if (document.activeElement === els.input || e.metaKey || e.ctrlKey) return;
    if (e.target.closest('input, textarea, dialog, button, a')) return;
    if (e.key.length === 1 || e.key === 'Tab') { focus(); }
  });

  /* ---------- Clicks ---------- */
  let audio;
  function click(ok) {
    if (!clicks) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime;
      const buf = audio.createBuffer(1, 400, audio.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
      const src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
      src.buffer = buf; f.type = 'bandpass'; f.frequency.value = ok ? 2400 : 900; g.gain.value = 0.35;
      src.connect(f).connect(g).connect(audio.destination);
      src.start(t);
    } catch (e) { /* no audio */ }
  }

  /* ---------- Timing and stats ---------- */
  const elapsed = () => (running ? (performance.now() - startedAt) / 1000 : 0);
  function updateStats(sec) {
    const mins = Math.max(sec, 0.5) / 60;
    const wpm = sec ? Math.round(correctCount() / 5 / mins) : 0;
    const acc = keystrokes ? Math.round((correctKeys / keystrokes) * 100) : 100;
    els.wpm.textContent = wpm;
    els.acc.textContent = `${acc}%`;
    return { wpm, acc };
  }
  let lastSample = 0;
  function tick() {
    if (!running || finished) return;
    const sec = elapsed();
    if (mode.kind === 'time') {
      const left = Math.max(0, Math.ceil(mode.value - sec));
      els.timer.textContent = left;
      if (sec >= mode.value) { finish(); return; }
    }
    if (sec - lastSample >= 0.25 || sec < lastSample) { lastSample = sec; updateStats(sec); }
    if (Math.floor(sec) > samples.length - 1 && sec >= 1) samples.push(Math.round(correctCount() / 5 / (sec / 60)));
    requestAnimationFrame(tick);
  }

  function finish() {
    finished = true;
    const sec = mode.kind === 'time' ? mode.value : elapsed();
    running = false;
    lastSample = 0;
    document.body.classList.remove('tt-running');
    const correct = correctCount();
    const wpm = Math.round(correct / 5 / (sec / 60));
    const raw = Math.round(typed.length / 5 / (sec / 60));
    const acc = keystrokes ? Math.round((correctKeys / keystrokes) * 100) : 0;
    samples.push(wpm);
    els.rWpm.textContent = wpm;
    els.rAcc.textContent = `${acc}%`;
    els.rRaw.textContent = raw;
    els.rChars.textContent = `${correct}/${typed.length - correct}`;
    els.rTime.textContent = `${sec.toFixed(sec < 10 ? 1 : 0)}s`;
    els.rMode.textContent = mode.kind === 'code' ? `code · ${mode.value}` : `${mode.kind} ${mode.value}`;
    const key = `type-pb-${mode.kind}-${mode.value}`;
    const pb = store.get(key, 0);
    els.rPb.hidden = !(wpm > pb && wpm > 0);
    if (wpm > pb) store.set(key, wpm);
    drawGraph();
    els.test.hidden = true;
    els.results.hidden = false;
    const ranked = mode.kind === 'time' && mode.value === 30;
    els.boardWrap.hidden = !ranked;
    els.submit.hidden = !(ranked && wpm >= 10 && acc >= 80 && qualifies(wpm));
    lastWpm = wpm;
    if (!els.submit.hidden) setTimeout(() => els.initials.focus(), 300);
    else setTimeout(focus, 50);
  }

  function drawGraph() {
    const w = 600, h = 120, pad = 6;
    const pts = samples.length > 1 ? samples : [0, ...samples];
    const max = Math.max(...pts, 10);
    const xy = pts.map((v, i) => [pad + (i / (pts.length - 1)) * (w - pad * 2), h - pad - (v / max) * (h - pad * 2)]);
    const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    els.graph.innerHTML = `<path d="${line} L${w - pad} ${h - pad} L${pad} ${h - pad} Z" class="area"/><path d="${line}" class="stroke"/>${xy.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.5"/>`).join('')}`;
  }

  /* ---------- Modes ---------- */
  function syncModes() {
    $$('[data-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === mode.kind)));
    $$('[data-val]').forEach((b) => {
      b.hidden = b.dataset.for !== mode.kind;
      b.setAttribute('aria-pressed', String(String(mode.value) === b.dataset.val && b.dataset.for === mode.kind));
    });
    $('#tt-clicks').setAttribute('aria-pressed', String(clicks));
  }
  const DEFAULTS = { time: 30, words: 25, code: 'python' };
  $$('[data-kind]').forEach((b) => b.addEventListener('click', () => {
    mode = { kind: b.dataset.kind, value: DEFAULTS[b.dataset.kind] };
    store.set('type-mode', mode); syncModes(); build();
  }));
  $$('[data-val]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.val;
    mode = { kind: mode.kind, value: mode.kind === 'code' ? v : Number(v) };
    store.set('type-mode', mode); syncModes(); build();
  }));
  $('#tt-clicks').addEventListener('click', () => { clicks = !clicks; store.set('type-clicks', clicks); syncModes(); focus(); });
  $$('[data-restart]').forEach((b) => b.addEventListener('click', build));

  /* ---------- Global leaderboard (30 second test) ---------- */
  let top10 = [];
  let lastWpm = 0;
  let myName = store.get('stack-initials-str', '') || (() => { try { return localStorage.getItem('stack-initials') || ''; } catch (e) { return ''; } })();
  function renderBoard(list) {
    top10 = list || [];
    if (!top10.length) { els.board.innerHTML = '<li class="muted">No scores yet. Be first.</li>'; return; }
    els.board.replaceChildren(...top10.map((r) => {
      const li = document.createElement('li');
      if (r.name === myName) li.className = 'me';
      const n = document.createElement('span'); n.className = 'n'; n.textContent = r.name;
      const v = document.createElement('b'); v.textContent = `${r.score} wpm`;
      li.append(n, v);
      return li;
    }));
  }
  const qualifies = (w) => top10.length < 10 || w > top10[top10.length - 1].score;
  fetch('/api/scores?game=type').then((r) => r.json()).then((d) => renderBoard(d.scores)).catch(() => { els.board.innerHTML = '<li class="muted">Offline</li>'; });
  els.initials.addEventListener('input', () => { els.initials.value = els.initials.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3); });
  els.submit.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = els.initials.value;
    if (name.length !== 3) { toast('Three letters or numbers.'); return; }
    els.submit.hidden = true;
    fetch('/api/scores?game=type', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, score: lastWpm }) })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Could not post');
        myName = name;
        try { localStorage.setItem('stack-initials', name); } catch (err) { /* storage blocked */ }
        renderBoard(d.scores);
        toast(`Posted ${lastWpm} wpm as ${name}.`);
      })
      .catch((err) => toast(err.message));
  });
  els.initials.value = myName;

  addEventListener('resize', () => requestAnimationFrame(placeCaret));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(placeCaret));
  syncModes();
  build();
})();
