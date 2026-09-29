(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const list = $('#rv-list');
  let key = '';
  try { key = sessionStorage.getItem('rv-key') || ''; } catch (e) { /* storage blocked */ }

  async function load() {
    const r = await fetch('/api/guestbook/review', { headers: { 'x-admin-key': key } });
    const d = await r.json();
    if (!r.ok) { list.innerHTML = `<p class="muted">${esc(d.error || 'Could not load.')}</p>`; return; }
    try { sessionStorage.setItem('rv-key', key); } catch (e) { /* storage blocked */ }
    $('#rv-key').hidden = true;
    list.innerHTML = d.pending.length ? d.pending.map((e) => `<figure class="polaroid" data-id="${e.id}">
        <img src="${e.drawing}" alt="" width="300" height="300">
        <figcaption>${e.message ? `<p>${esc(e.message)}</p>` : ''}<b>${esc(e.name)}</b>
          <span class="rv__btns"><button class="mac-btn mac-btn--primary" data-act="approve">Approve</button><button class="mac-btn" data-act="delete">Delete</button></span>
        </figcaption></figure>`).join('') : '<div class="gb__empty"><b>Nothing to review.</b><span>The queue is empty.</span></div>';
  }
  $('#rv-key').addEventListener('submit', (e) => { e.preventDefault(); key = $('#rv-pass').value; load(); });
  list.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const fig = b.closest('[data-id]');
    b.disabled = true;
    const r = await fetch('/api/guestbook/review', { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': key }, body: JSON.stringify({ id: Number(fig.dataset.id), action: b.dataset.act }) });
    if (r.ok) fig.remove(); else b.disabled = false;
    if (!list.querySelector('[data-id]')) load();
  });
  if (key) load();
})();
