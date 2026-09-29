(() => {
  const root = document.documentElement;
  const OS = window.OS;
  const $$ = (s) => [...document.querySelectorAll(s)];
  const prefs = () => OS.prefs();
  const themeChoice = () => { try { return localStorage.getItem('theme') || 'auto'; } catch (e) { return 'auto'; } };

  function sync() {
    const p = prefs();
    $$('[data-set="theme"]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.val === themeChoice())));
    $$('.wallopt').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wall === (root.dataset.wall || 'butter'))));
    const sw = (key, on) => { const el = document.querySelector(`.switch[data-set="${key}"]`); if (el) el.setAttribute('aria-checked', String(on)); };
    sw('grain', p.grain === true);
    sw('magnify', p.magnify !== false);
    sw('sound', p.sound !== false);
    sw('motion', p.motion === 'reduce');
    sw('live', p.live !== false);
    const dock = document.querySelector('[data-set="dock"]');
    if (dock) dock.value = p.dock || 50;
  }

  $$('[data-set="theme"]').forEach((b) => b.addEventListener('click', () => {
    const apply = () => OS.setPref('theme', b.dataset.val);
    if (document.startViewTransition) document.startViewTransition(apply); else apply();
    sync();
  }));
  $$('.wallopt').forEach((b) => b.addEventListener('click', () => { OS.setPref('wall', b.dataset.wall); sync(); }));
  $$('.switch').forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-checked') !== 'true';
    const key = b.dataset.set;
    if (key === 'motion') OS.setPref('motion', on ? 'reduce' : 'full');
    else OS.setPref(key, on);
    if (key === 'magnify' || key === 'motion' || key === 'live') window.toast && window.toast('Takes effect on the next page.');
    sync();
  }));
  const dock = document.querySelector('[data-set="dock"]');
  if (dock) dock.addEventListener('input', () => OS.setPref('dock', Number(dock.value)));
  document.querySelector('[data-reset]').addEventListener('click', () => {
    ['prefs', 'theme', 'stickies', 'term-history'].forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ } });
    root.dataset.wall = 'butter';
    delete root.dataset.grain;
    delete root.dataset.motion;
    root.style.removeProperty('--dock-size');
    OS.setPref('theme', 'auto');
    sync();
    window.toast && window.toast('Everything is back to default.');
  });

  // Highlight the sidebar entry for the pane in view.
  const links = $$('.settings__side a');
  const main = document.querySelector('.settings__main');
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    main.scrollTo({ top: target.offsetTop - 20, behavior: 'smooth' });
  }));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { root: main, rootMargin: '0px 0px -70% 0px' });
  $$('.pane').forEach((p) => io.observe(p));

  sync();
})();
