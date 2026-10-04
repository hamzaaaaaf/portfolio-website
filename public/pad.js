// Controllers: Xbox, DualShock 4, DualSense, Switch Pro and most generic pads.
// Everything is mapped by position to Xbox names (bottom face button is A,
// right is B, left is X, top is Y), so the site only ever talks in Xbox terms.
(() => {
  const NAMES = ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt', 'back', 'start', 'ls', 'rs', 'up', 'down', 'left', 'right', 'guide'];
  // Browsers that don't apply the "standard" mapping report raw layouts.
  // Each entry maps raw button index -> Xbox name.
  const RAW = {
    // DualShock 4 / DualSense in Firefox and some Linux setups
    sony: { 0: 'x', 1: 'a', 2: 'b', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 10: 'ls', 11: 'rs', 12: 'guide', 13: 'back' },
    // Switch Pro: B is bottom, A right, Y left, X top
    nintendo: { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 10: 'ls', 11: 'rs', 12: 'guide', 13: 'back' },
    generic: { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 10: 'ls', 11: 'rs', 12: 'up', 13: 'down', 14: 'left', 15: 'right', 16: 'guide' },
  };
  const brandOf = (id) => {
    const s = id.toLowerCase();
    if (/054c|sony|dualshock|dualsense|wireless controller|playstation/.test(s)) return 'sony';
    if (/057e|nintendo|pro controller|joy-con/.test(s)) return 'nintendo';
    if (/045e|xbox|xinput|microsoft/.test(s)) return 'xbox';
    return 'generic';
  };
  const DEAD = 0.18;
  const dz = (v) => (Math.abs(v) < DEAD ? 0 : (v - Math.sign(v) * DEAD) / (1 - DEAD));

  function read(p) {
    const st = { brand: brandOf(p.id), id: p.id, lx: 0, ly: 0, rx: 0, ry: 0, lt: 0, rt: 0 };
    NAMES.forEach((n) => { st[n] = false; });
    const val = (b) => (b ? (typeof b === 'object' ? (b.pressed ? Math.max(b.value, 1) : b.value) : b) : 0);
    if (p.mapping === 'standard') {
      p.buttons.forEach((b, i) => { if (NAMES[i]) st[NAMES[i]] = val(b) > 0.5; });
      st.lt = val(p.buttons[6]); st.rt = val(p.buttons[7]);
      [st.lx, st.ly, st.rx, st.ry] = [dz(p.axes[0] || 0), dz(p.axes[1] || 0), dz(p.axes[2] || 0), dz(p.axes[3] || 0)];
    } else {
      const map = RAW[st.brand] || RAW.generic;
      p.buttons.forEach((b, i) => { const n = map[i]; if (n && val(b) > 0.5) st[n] = true; });
      st.lt = st.lt ? 1 : 0; st.rt = st.rt ? 1 : 0;
      st.lx = dz(p.axes[0] || 0); st.ly = dz(p.axes[1] || 0);
      // Raw Sony pads put the right stick on 2 and 5 (3 and 4 are the triggers).
      if (st.brand === 'sony' && p.axes.length >= 6) { st.rx = dz(p.axes[2]); st.ry = dz(p.axes[5]); st.lt = Math.max(st.lt, (p.axes[3] + 1) / 2); st.rt = Math.max(st.rt, (p.axes[4] + 1) / 2); }
      else { st.rx = dz(p.axes[2] || 0); st.ry = dz(p.axes[3] || 0); }
      // D-pad reported as a single "hat" axis (usually the last one).
      const hat = p.axes.length > 9 ? p.axes[9] : (p.axes.length > 6 && Math.abs(p.axes[p.axes.length - 1]) <= 1.01 && p.axes.length % 2 ? p.axes[p.axes.length - 1] : null);
      if (hat !== null && hat !== undefined && hat >= -1.01 && hat <= 1.01) {
        const pos = Math.round((hat + 1) * 3.5);   // 0..7, 8 = centred
        if (pos >= 0 && pos <= 7) {
          st.up = [0, 1, 7].includes(pos); st.right = [1, 2, 3].includes(pos);
          st.down = [3, 4, 5].includes(pos); st.left = [5, 6, 7].includes(pos);
        }
      } else if (p.axes.length >= 8) {
        st.left = st.left || p.axes[6] < -0.5; st.right = st.right || p.axes[6] > 0.5;
        st.up = st.up || p.axes[7] < -0.5; st.down = st.down || p.axes[7] > 0.5;
      }
    }
    st.lt = Math.min(1, st.lt); st.rt = Math.min(1, st.rt);
    return st;
  }

  // Merge every connected pad so whichever one you pick up just works.
  function merged() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter((p) => p && p.connected !== false) : [];
    if (!pads.length) return null;
    const all = pads.map(read), st = { ...all[0] };
    for (const s of all.slice(1)) {
      NAMES.forEach((n) => { st[n] = st[n] || s[n]; });
      ['lx', 'ly', 'rx', 'ry'].forEach((k) => { if (Math.abs(s[k]) > Math.abs(st[k])) st[k] = s[k]; });
      st.lt = Math.max(st.lt, s.lt); st.rt = Math.max(st.rt, s.rt);
    }
    st.brands = [...new Set(all.map((s) => s.brand))];
    return st;
  }

  const listeners = new Set(), frameListeners = new Set();
  const held = {}, repeatAt = {};
  let loop = 0, last = null;
  const DIRS = ['up', 'down', 'left', 'right'];
  function tick(t) {
    const st = merged();
    if (!st) { loop = 0; last = null; return; }
    // The left stick doubles as a d-pad for menus.
    const dir = { up: st.up || st.ly < -0.55, down: st.down || st.ly > 0.55, left: st.left || st.lx < -0.55, right: st.right || st.lx > 0.55 };
    const names = [...NAMES.filter((n) => !DIRS.includes(n)), ...DIRS];
    for (const n of names) {
      const on = DIRS.includes(n) ? dir[n] : (n === 'lt' || n === 'rt' ? st[n] > 0.5 : st[n]);
      if (on && !held[n]) { held[n] = t; repeatAt[n] = t + 380; emit('press', n, st); }
      else if (on && DIRS.includes(n) && t > repeatAt[n]) { repeatAt[n] = t + 125; emit('press', n, st, true); }
      else if (!on && held[n]) { const d = t - held[n]; held[n] = 0; emit('release', n, st, false, d); }
    }
    last = st;
    frameListeners.forEach((fn) => { try { fn(st, t); } catch (e) { /* listener error */ } });
    loop = requestAnimationFrame(tick);
  }
  function emit(type, button, state, repeat = false, heldFor = 0) {
    listeners.forEach((fn) => { try { fn({ type, button, state, repeat, heldFor }); } catch (e) { /* listener error */ } });
  }
  const start = () => { if (!loop) loop = requestAnimationFrame(tick); };
  addEventListener('gamepadconnected', (e) => {
    start();
    const id = (e.gamepad && e.gamepad.id) || '';
    listeners.forEach((fn) => fn({ type: 'connect', brand: brandOf(id), id }));
  });
  addEventListener('gamepaddisconnected', (e) => {
    const id = (e.gamepad && e.gamepad.id) || '';
    listeners.forEach((fn) => fn({ type: 'disconnect', brand: brandOf(id), id }));
  });
  if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) start();

  window.XPad = {
    on: (fn) => listeners.add(fn),
    onFrame: (fn) => { frameListeners.add(fn); return () => frameListeners.delete(fn); },
    state: () => last,
    brandOf,
    connected: () => !!(navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)),
  };
})();
