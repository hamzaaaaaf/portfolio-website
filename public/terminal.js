(() => {
  const term = document.getElementById('term');
  const out = document.getElementById('term-out');
  const input = document.getElementById('term-in');
  const cwdEl = document.getElementById('term-cwd');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const OS = () => window.OS || {};
  const TZ = () => window.TZ;

  let cwd = '~';
  let history = [];
  try { history = JSON.parse(localStorage.getItem('term-history') || '[]'); } catch (e) { /* storage blocked */ }
  let hpos = history.length;

  const print = (html = '') => { const d = document.createElement('div'); d.innerHTML = html; out.appendChild(d); term.scrollTop = term.scrollHeight; return d; };
  const printLines = (lines) => lines.forEach((l) => print(l));
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${esc(text || href)}</a>`;

  const FILES = {
    '~': ['about.txt', 'skills.txt', 'contact.txt', 'projects/'],
    '~/projects': ['panic-pack.md', 'instagram-unliker.md', 'byhamza.dev.md'],
  };
  const CAT = {
    'about.txt': [
      'Hamza. Computer Science, second year, Aston University.',
      'Based in Birmingham, UK. Likes yellow, clean interfaces and finished projects.',
    ],
    'skills.txt': [
      '<span class="y">languages</span>   Python, Java',
      '<span class="y">tools</span>       Git, GitHub, Godot, Cloudflare',
      '<span class="y">studying</span>    data structures, algorithms, OOP, software engineering',
    ],
    'contact.txt': [
      `<span class="y">email</span>     ${link('mailto:hello@byhamza.dev', 'hello@byhamza.dev')}`,
      `<span class="y">github</span>    ${link('https://github.com/hamzaaaaaf', 'github.com/hamzaaaaaf')}`,
      `<span class="y">linkedin</span>  ${link('https://www.linkedin.com/in/hamza-faisal-125833263/', 'linkedin.com/in/hamza-faisal')}`,
    ],
    'panic-pack.md': ['# Panic Pack!', 'First-person race against the clock. Grab everything on a random packing list', 'and make the taxi before your flight leaves. Godot 4, playable Windows build.', link('https://github.com/hamzaaaaaf/panic-pack-')],
    'instagram-unliker.md': ['# Instagram Unliker', 'Clears years of Instagram likes in batches, confirming each step and pacing', 'itself so the page keeps up. Plain JavaScript in the browser console.', link('https://github.com/hamzaaaaaf/instagram-post-unliker')],
    'byhamza.dev.md': ['# byhamza.dev', 'This site. A desktop in the browser on Cloudflare Workers, with D1 for the', 'Stack leaderboard and a live LeetCode feed.', link('https://github.com/hamzaaaaaf/portfolio-website')],
  };
  const resolve = (name) => {
    const n = name.replace(/^\.\//, '').replace(/^projects\//, '');
    if (cwd === '~' && FILES['~/projects'].includes(n) && name.startsWith('projects/')) return n;
    return FILES[cwd].includes(n) ? n : null;
  };

  const OPEN = {
    github: 'https://github.com/hamzaaaaaf', linkedin: 'https://www.linkedin.com/in/hamza-faisal-125833263/',
    leetcode: 'https://leetcode.com/u/hamza57/', stack: '/play', play: '/play', draw: '/draw', kaleidoscope: '/draw',
    settings: '/settings', home: '/', work: '/work', stats: '/stats', about: '/about', email: 'mailto:hello@byhamza.dev', source: 'https://github.com/hamzaaaaaf/portfolio-website',
  };

  const bar = (n, max, width = 24) => {
    const fill = max ? Math.max(n ? 1 : 0, Math.round((n / max) * width)) : 0;
    return `<span class="bar-fill">${'█'.repeat(fill)}</span><span class="m">${'░'.repeat(width - fill)}</span>`;
  };

  const COMMANDS = {
    help: { d: 'list commands', run: () => {
      print('<span class="m">Things you can type:</span>');
      Object.entries(COMMANDS).filter(([, c]) => !c.hidden).forEach(([k, c]) => print(`  <span class="y">${k.padEnd(12)}</span>${esc(c.d)}`));
      print('<span class="m">Tab completes, ↑ ↓ walk history, Ctrl+L clears.</span>');
    } },
    about: { d: 'who is Hamza', run: () => printLines(CAT['about.txt']) },
    whoami: { d: 'you, probably', hidden: true, run: () => print('visitor. but this is hamza\'s machine.') },
    ls: { d: 'list files', run: (args) => {
      const dir = args[0] === 'projects' || args[0] === 'projects/' ? '~/projects' : cwd;
      print(FILES[dir].map((f) => (f.endsWith('/') ? `<span class="b">${f}</span>` : f)).join('    '));
    } },
    cd: { d: 'change directory', run: (args) => {
      const a = args[0] || '~';
      if (a === '~' || a === '..' || a === '/') cwd = '~';
      else if ((a === 'projects' || a === 'projects/') && cwd === '~') cwd = '~/projects';
      else return print(`<span class="r">cd: no such file or directory: ${esc(a)}</span>`);
      cwdEl.textContent = cwd;
    } },
    cat: { d: 'print a file', run: (args) => {
      if (!args[0]) return print('<span class="r">usage: cat &lt;file&gt;</span>');
      const f = resolve(args[0]);
      if (!f) return print(`<span class="r">cat: ${esc(args[0])}: No such file or directory</span>`);
      printLines(CAT[f]);
    } },
    projects: { d: 'what I have built', run: () => {
      print(`<span class="y">Panic Pack!</span>          ${link('https://github.com/hamzaaaaaf/panic-pack-', 'Godot game')}`);
      print(`<span class="y">Instagram Unliker</span>    ${link('https://github.com/hamzaaaaaf/instagram-post-unliker', 'browser script')}`);
      print(`<span class="y">byhamza.dev</span>          ${link('https://github.com/hamzaaaaaf/portfolio-website', 'this site')}`);
    } },
    open: { d: 'open github, linkedin, stack, draw…', run: (args) => {
      const target = OPEN[(args[0] || '').toLowerCase()];
      if (!target) return print(`<span class="r">open: try one of: ${Object.keys(OPEN).join(', ')}</span>`);
      print(`<span class="m">opening ${esc(args[0])}…</span>`);
      if (target.startsWith('http')) window.open(target, '_blank', 'noopener'); else setTimeout(() => { location.href = target; }, 300);
    } },
    leetcode: { d: 'live LeetCode stats', run: async () => {
      const line = print('<span class="m">fetching leetcode.com/u/hamza57…</span>');
      try {
        const d = await fetch('/api/leetcode').then((r) => (r.ok ? r.json() : fetch('/leetcode.json').then((x) => x.json())));
        const s = d.solved, max = Math.max(s.Easy, s.Medium, s.Hard, 1);
        line.innerHTML = `<span class="y">${s.All}</span> solved · <span class="y">${d.activeDays}</span> active days`;
        print(`  <span class="g">easy  </span> ${bar(s.Easy, max)} ${s.Easy}`);
        print(`  <span class="y">medium</span> ${bar(s.Medium, max)} ${s.Medium}`);
        print(`  <span class="r">hard  </span> ${bar(s.Hard, max)} ${s.Hard}`);
        if (d.recent && d.recent[0]) print(`<span class="m">latest: ${esc(d.recent[0].title)}</span>`);
      } catch (e) { line.innerHTML = '<span class="r">leetcode: could not reach the API</span>'; }
    } },
    scores: { d: 'Stack global leaderboard', run: async () => {
      const line = print('<span class="m">loading leaderboard…</span>');
      try {
        const { scores } = await fetch('/api/scores').then((r) => r.json());
        if (!scores.length) { line.innerHTML = 'No scores yet. <a href="/play">Be first.</a>'; return; }
        line.innerHTML = '<span class="y">#   name  score</span>';
        scores.forEach((r, i) => print(`${String(i + 1).padEnd(4)}${esc(r.name)}   ${r.score}`));
      } catch (e) { line.innerHTML = '<span class="r">scores: offline</span>'; }
    } },
    time: { d: 'my time and yours', run: () => {
      const t = TZ();
      print(`<span class="y">hamza</span>  ${t.timeIn(t.DEV_TZ)}  ${esc(t.tzLong(t.DEV_TZ))} (${esc(t.tzAbbr(t.DEV_TZ))})`);
      print(`<span class="b">you  </span>  ${t.timeIn(t.VIEWER_TZ)}  ${esc(t.tzLong(t.VIEWER_TZ))} (${esc(t.tzAbbr(t.VIEWER_TZ))})`);
    } },
    date: { d: 'current date', hidden: true, run: () => print(esc(new Date().toString())) },
    theme: { d: 'light, dark or auto', run: (args) => {
      const v = (args[0] || '').toLowerCase();
      if (!['light', 'dark', 'auto'].includes(v)) return print(`<span class="m">theme is ${document.documentElement.dataset.theme}. usage: theme light|dark|auto</span>`);
      OS().setPref('theme', v);
      print(`<span class="g">✓</span> theme set to ${v}`);
    } },
    wallpaper: { d: 'change the wallpaper', run: (args) => {
      const walls = OS().WALLS || [];
      const v = (args[0] || '').toLowerCase();
      if (!walls.includes(v)) return print(`<span class="m">wallpapers: ${walls.join(', ')}. current: ${document.documentElement.dataset.wall}</span>`);
      OS().setPref('wall', v);
      print(`<span class="g">✓</span> wallpaper set to ${v}`);
    } },
    spark: { d: 'leave a spark ✦', run: () => { OS().spark && OS().spark(); print('<span class="y">✦</span> thanks. it counts.'); } },
    hamzafetch: { d: 'system info', run: () => {
      const t = TZ();
      const days = Math.max(1, Math.floor((Date.now() - Date.UTC(2026, 8, 23)) / 86400000));
      const logo = ['   ██         ', '   ██         ', '   ██ ████    ', '   ███   ██   ', '   ██    ██   ', '   ██    ██   ', '   ██    ██   '];
      const info = [
        '<span class="y">hamza</span>@<span class="y">byhamza</span>',
        '<span class="m">───────────────</span>',
        `<span class="y">OS</span>        byhamza.dev`,
        `<span class="y">Host</span>      Cloudflare Workers`,
        `<span class="y">Uptime</span>    ${days} days`,
        `<span class="y">Languages</span> Python, Java`,
        `<span class="y">Theme</span>     ${document.documentElement.dataset.wall} (${document.documentElement.dataset.theme})`,
        `<span class="y">Time</span>      ${t.timeIn(t.DEV_TZ)} ${esc(t.tzAbbr(t.DEV_TZ))}`,
        `<span class="y">Display</span>   ${innerWidth}×${innerHeight}`,
      ];
      const n = Math.max(logo.length, info.length);
      for (let i = 0; i < n; i++) print(`<span class="y">${logo[i] || ' '.repeat(14)}</span>${info[i] || ''}`);
      print(`${' '.repeat(14)}${['#ff5f57', '#febc2e', '#28c840', '#ffd84d', '#ff8a5c', '#ff7aa2', '#8fb8ff'].map((c) => `<span style="color:${c}">███</span>`).join('')}`);
    } },
    neofetch: { d: '', hidden: true, run: () => COMMANDS.hamzafetch.run() },
    echo: { d: 'print text', hidden: true, run: (args) => print(esc(args.join(' '))) },
    history: { d: 'past commands', run: () => history.slice(-20).forEach((h, i) => print(`<span class="m">${String(i + 1).padStart(4)}</span>  ${esc(h)}`)) },
    clear: { d: 'clear the screen', run: () => { out.innerHTML = ''; } },
    sleep: { d: 'put the site to sleep', hidden: true, run: () => OS().sleep() },
    restart: { d: '', hidden: true, run: () => OS().restart() },
    shutdown: { d: '', hidden: true, run: () => OS().shutdown() },
    sudo: { d: '', hidden: true, run: () => print('<span class="r">hamza is not in the sudoers file. This incident will be reported.</span>') },
    rm: { d: '', hidden: true, run: (args) => print(args.join(' ').includes('-rf') ? '<span class="r">nice try.</span>' : '<span class="r">rm: permission denied</span>') },
    exit: { d: '', hidden: true, run: () => print('<span class="m">there is no exit. try the dock.</span>') },
    vim: { d: '', hidden: true, run: () => print('<span class="m">you are now stuck in vim. just kidding. type :q anyway.</span>') },
    ':q': { d: '', hidden: true, run: () => print('<span class="m">see? easy.</span>') },
    party: { d: '', hidden: true, run: () => { OS().confetti && OS().confetti(); print('<span class="y">✦ ✦ ✦</span>'); } },
    cowsay: { d: 'a cow says it', run: (args) => {
      const msg = esc(args.join(' ') || 'moo. try the stack game.');
      const line = '─'.repeat(msg.length + 2);
      printLines([` ╭${line}╮`, ` │ ${msg} │`, ` ╰${line}╯`, '        \\   ^__^', '         \\  (oo)\\_______', '            (__)\\       )\\/\\', '                ||----w |', '                ||     ||']);
    } },
  };

  const suggest = (cmd) => {
    const names = Object.keys(COMMANDS).filter((k) => !COMMANDS[k].hidden);
    const dist = (a, b) => {
      const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
      for (let j = 1; j <= b.length; j++) m[0][j] = j;
      for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      return m[a.length][b.length];
    };
    const best = names.map((n) => [n, dist(cmd, n)]).sort((a, b) => a[1] - b[1])[0];
    return best && best[1] <= 2 ? best[0] : null;
  };

  async function exec(raw) {
    const line = raw.trim();
    print(`<span class="y">hamza@byhamza</span> <span class="b">${cwd}</span> % <span class="term__cmd">${esc(line)}</span>`);
    if (!line) return;
    history.push(line);
    history = history.slice(-100);
    hpos = history.length;
    try { localStorage.setItem('term-history', JSON.stringify(history)); } catch (e) { /* storage blocked */ }
    const [cmd, ...args] = line.split(/\s+/);
    const c = COMMANDS[cmd.toLowerCase()];
    if (!c) {
      const s = suggest(cmd.toLowerCase());
      print(`<span class="r">zsh: command not found: ${esc(cmd)}</span>${s ? `<span class="m">  did you mean <span class="y">${s}</span>?</span>` : ''}`);
      return;
    }
    await c.run(args);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); const v = input.value; input.value = ''; exec(v); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hpos > 0) input.value = history[--hpos]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hpos = Math.min(history.length, hpos + 1); input.value = history[hpos] || ''; }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.value.split(/\s+/);
      const last = parts[parts.length - 1];
      const pool = parts.length === 1 ? Object.keys(COMMANDS).filter((k) => !COMMANDS[k].hidden) : [...FILES[cwd], ...Object.keys(OPEN), ...(OS().WALLS || []), 'light', 'dark', 'auto'];
      const hits = pool.filter((x) => x.startsWith(last));
      if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(' ') + (parts.length === 1 ? ' ' : ''); }
      else if (hits.length > 1) print(`<span class="m">${hits.join('  ')}</span>`);
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  term.addEventListener('click', () => { if (!getSelection().toString()) input.focus(); });

  const t = TZ ? TZ() : null;
  print(`<span class="m">Last login: ${esc(new Date().toString().slice(0, 24))} on ttys001</span>`);
  print('Welcome to <span class="y">byhamza.dev</span>. Type <span class="y">help</span> to see what you can do.');
  if (t) print(`<span class="m">It's ${t.timeIn(t.DEV_TZ)} ${esc(t.tzAbbr(t.DEV_TZ))} here, ${t.timeIn(t.VIEWER_TZ)} ${esc(t.tzAbbr(t.VIEWER_TZ))} for you.</span>`);
  print('');
  input.focus();
})();
