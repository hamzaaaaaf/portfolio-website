// Dashboard sounds, synthesised with Web Audio and voiced after the Xbox 360:
// soft plasticky ticks for moving, a rising "bloop" for A, a falling one for B,
// an air swish between hubs, the resonant achievement "bwoop", the 360 S touch
// beep and a boot score timed to the startup animation.
//
// A private copy can use its own recordings: put audio files in /sounds/ and
// list them in /sounds/pack.json, e.g. {"select": "select.wav", "ach": "ach.wav"}.
// Anything not listed falls back to the synthesised version.
(() => {
  let ctx = null, out = null, wet = null, pack = {}, packLoaded = false;
  const enabled = () => !(window.OS && window.OS.prefs && window.OS.prefs().sound === false);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' }); } catch (e) { return null; }
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.18;
    out = ctx.createGain(); out.gain.value = 0.9;
    out.connect(comp).connect(ctx.destination);
    // A small, bright room: stereo noise with an exponential tail.
    const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    const verb = ctx.createConvolver(); verb.buffer = ir;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 6500;
    wet = ctx.createGain(); wet.gain.value = 1;
    wet.connect(tone).connect(verb).connect(out);
    loadPack();
    return ctx;
  }
  function loadPack() {
    if (packLoaded) return;
    packLoaded = true;
    fetch('/sounds/pack.json').then((r) => (r.ok ? r.json() : {})).then((list) => {
      Object.entries(list || {}).forEach(([name, file]) => {
        fetch(`/sounds/${file}`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((buf) => { pack[name] = buf; }).catch(() => {});
      });
    }).catch(() => {});
  }
  // Wake audio on the first real gesture (controllers don't count as one).
  ['pointerdown', 'keydown', 'touchstart'].forEach((t) => addEventListener(t, () => { if (enabled()) init(); }, { capture: true, passive: true }));

  // One voice: oscillator -> envelope -> dry + reverb send.
  function voice({ type = 'sine', f, f2, bend = 0.05, at = 0, a = 0.004, d = 0.12, s = 0, hold = 0, r = 0.1, gain = 0.1, send = 0.15, detune = 0, filter, pan = 0 }) {
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.detune.value = detune;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + bend);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + a);
    if (s > 0) { g.gain.exponentialRampToValueAtTime(Math.max(gain * s, 0.0001), t + a + d); g.gain.setValueAtTime(Math.max(gain * s, 0.0001), t + a + d + hold); }
    const end = t + a + d + hold + r;
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    let node = o;
    if (filter) {
      const bq = ctx.createBiquadFilter();
      bq.type = filter.type || 'lowpass'; bq.Q.value = filter.q || 0.7;
      bq.frequency.setValueAtTime(filter.from, t);
      if (filter.to) bq.frequency.exponentialRampToValueAtTime(filter.to, t + (filter.time || 0.1));
      if (filter.back) bq.frequency.exponentialRampToValueAtTime(filter.back, t + (filter.time || 0.1) + (filter.backTime || 0.3));
      node.connect(bq); node = bq;
    }
    node.connect(g);
    let dest = g;
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); dest = p; }
    dest.connect(out);
    if (send) { const sg = ctx.createGain(); sg.gain.value = send; dest.connect(sg).connect(wet); }
    o.start(t); o.stop(end + 0.05);
  }
  let noiseBuf = null;
  function noise({ at = 0, dur = 0.2, from = 800, to = 3000, q = 1, gain = 0.05, type = 'bandpass', a = 0.3, send = 0.2 }) {
    const t = ctx.currentTime + at;
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource(), bq = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; bq.type = type; bq.Q.value = q;
    bq.frequency.setValueAtTime(from, t); bq.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur * a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bq).connect(g).connect(out);
    if (send) { const sg = ctx.createGain(); sg.gain.value = send; g.connect(sg).connect(wet); }
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }
  const jitter = (f) => f * (1 + (Math.random() - 0.5) * 0.03);

  const SOUNDS = {
    // Moving between tiles: a very quiet, low, woody thud (~320 Hz).
    nav() {
      voice({ type: 'sine', f: jitter(324), a: 0.003, d: 0.05, r: 0.02, gain: 0.07, send: 0.05 });
      voice({ type: 'sine', f: jitter(216), a: 0.003, d: 0.04, r: 0.02, gain: 0.03, send: 0 });
      noise({ dur: 0.04, from: 900, to: 500, q: 0.8, type: 'lowpass', gain: 0.025, a: 0.15, send: 0 });
    },
    // Moving in the Guide and dialogs: a short sine blip (344 Hz).
    gnav() {
      voice({ type: 'sine', f: 344, a: 0.003, d: 0.06, r: 0.02, gain: 0.08, send: 0.05 });
      voice({ type: 'sine', f: 253, a: 0.003, d: 0.05, r: 0.02, gain: 0.012, send: 0 });
    },
    // A: two soft sines a fourth apart (G4 + C5) that swell in and fade.
    select() {
      voice({ type: 'sine', f: 392, a: 0.11, d: 0.34, r: 0.12, gain: 0.07, send: 0.25 });
      voice({ type: 'sine', f: 523.25, a: 0.11, d: 0.34, r: 0.12, gain: 0.066, send: 0.25 });
    },
    // B: the same swell a fifth lower (C4 + G4).
    back() {
      voice({ type: 'sine', f: 261.6, a: 0.13, d: 0.3, r: 0.12, gain: 0.08, send: 0.22 });
      voice({ type: 'sine', f: 392, a: 0.13, d: 0.3, r: 0.12, gain: 0.05, send: 0.22 });
    },
    // LB / RB between hubs: a bright, airy swish.
    pivot() {
      noise({ dur: 0.27, from: 3600, to: 6200, q: 0.7, gain: 0.075, a: 0.42, send: 0.15 });
    },
    // Guide: C5 over G4, a slower swell with a long tail.
    guide() {
      voice({ type: 'sine', f: 523.25, a: 0.19, d: 0.55, r: 0.15, gain: 0.08, send: 0.3 });
      voice({ type: 'sine', f: 392, a: 0.19, d: 0.5, r: 0.15, gain: 0.024, send: 0.3 });
      voice({ type: 'sine', f: 784, a: 0.19, d: 0.4, r: 0.1, gain: 0.005, send: 0.3 });
    },
    guideClose() {
      voice({ type: 'sine', f: 466, a: 0.14, d: 0.28, r: 0.1, gain: 0.08, send: 0.25 });
      voice({ type: 'sine', f: 349, a: 0.14, d: 0.26, r: 0.1, gain: 0.022, send: 0.25 });
      voice({ type: 'sine', f: 699, a: 0.14, d: 0.2, r: 0.08, gain: 0.005, send: 0.25 });
    },
    // Can't do that: a dull, low thunk.
    nope() {
      voice({ type: 'sine', f: 190, f2: 140, bend: 0.08, a: 0.003, d: 0.12, gain: 0.16, send: 0.05 });
      voice({ type: 'square', f: 95, a: 0.003, d: 0.06, gain: 0.02, send: 0, filter: { from: 600 } });
    },
    // Achievement unlocked: a resonant, rising "bwoop" with a shimmer tail.
    ach() {
      const f = { type: 'lowpass', q: 11, from: 420, to: 3400, time: 0.11, back: 1100, backTime: 0.45 };
      voice({ type: 'sawtooth', f: 311, f2: 622, bend: 0.11, a: 0.006, d: 0.6, gain: 0.07, send: 0.35, filter: f });
      voice({ type: 'square', f: 311, f2: 622, bend: 0.11, a: 0.006, d: 0.55, gain: 0.04, send: 0.35, detune: 9, filter: f });
      voice({ type: 'sine', f: 155, f2: 311, bend: 0.11, a: 0.006, d: 0.45, gain: 0.09, send: 0.1 });
      voice({ type: 'sine', f: 1244, at: 0.1, a: 0.004, d: 0.9, gain: 0.025, send: 0.6 });
      voice({ type: 'sine', f: 1865, at: 0.13, a: 0.004, d: 0.8, gain: 0.018, send: 0.6, pan: 0.3 });
      voice({ type: 'sine', f: 2489, at: 0.16, a: 0.004, d: 0.7, gain: 0.012, send: 0.6, pan: -0.3 });
    },
    // Notifications: a short low note, then a bright chorused one an octave up.
    notify() {
      voice({ type: 'sine', f: 576, a: 0.005, d: 0.06, r: 0.02, gain: 0.05, send: 0.2 });
      voice({ type: 'sine', f: 1141, at: 0.06, a: 0.01, d: 0.16, r: 0.06, gain: 0.06, send: 0.3 });
      voice({ type: 'sine', f: 1114, at: 0.06, a: 0.01, d: 0.14, r: 0.06, gain: 0.035, send: 0.3, pan: -0.3 });
      voice({ type: 'sine', f: 1168, at: 0.06, a: 0.01, d: 0.14, r: 0.06, gain: 0.025, send: 0.3, pan: 0.3 });
    },
    // The 360 S touch power button: a quick, bright electronic beep.
    power() {
      voice({ type: 'square', f: 1975, a: 0.002, d: 0.02, s: 0.85, hold: 0.07, r: 0.05, gain: 0.05, send: 0.05, filter: { from: 5200, q: 0.5 } });
      voice({ type: 'sine', f: 1975, a: 0.002, d: 0.02, s: 0.9, hold: 0.07, r: 0.08, gain: 0.08, send: 0.1 });
    },
    // Launching an app or game: a deep thoom and a falling swish.
    launch() {
      voice({ type: 'sine', f: 220, f2: 82, bend: 0.4, a: 0.01, d: 0.5, gain: 0.16, send: 0.3 });
      noise({ dur: 0.45, from: 4200, to: 220, q: 0.7, gain: 0.06, a: 0.15, send: 0.3 });
      voice({ type: 'sine', f: 659, at: 0.02, a: 0.004, d: 0.35, gain: 0.04, send: 0.5 });
    },
    // Back to Xbox Home: the reverse, rising into a chord.
    home() {
      noise({ dur: 0.5, from: 220, to: 4800, q: 0.7, gain: 0.06, a: 0.75, send: 0.35 });
      [392, 587, 784].forEach((f, i) => voice({ type: 'sine', f, at: 0.3 + i * 0.04, a: 0.01, d: 0.7, gain: 0.05, send: 0.5 }));
    },
    // Startup, timed to the intro: dark swell, light burst, ring, logo chord.
    boot() {
      // 0.0s: the dark sphere rises
      noise({ dur: 1.6, from: 70, to: 240, q: 0.6, type: 'lowpass', gain: 0.18, a: 0.85, send: 0.2 });
      voice({ type: 'sine', f: 41, f2: 55, bend: 1.4, a: 1.1, d: 0.6, gain: 0.22, send: 0.1 });
      // 1.3s: the light bursts through the X
      noise({ at: 1.25, dur: 1.2, from: 300, to: 9000, q: 0.5, gain: 0.12, a: 0.25, send: 0.55 });
      [164.8, 246.9, 329.6, 415.3, 493.9, 659.3].forEach((f, i) => voice({ type: i % 2 ? 'triangle' : 'sine', f, at: 1.3 + i * 0.015, a: 0.02, d: 2.8, gain: 0.05, send: 0.6, pan: (i % 3 - 1) * 0.3 }));
      [1318.5, 1661.2, 1975.5, 2637].forEach((f, i) => voice({ type: 'sine', f, at: 1.45 + i * 0.09, a: 0.004, d: 1.1, gain: 0.02, send: 0.7, pan: i % 2 ? 0.4 : -0.4 }));
      // 3.0s: the ring sweeps out
      voice({ type: 'sine', f: 98, f2: 196, bend: 0.5, at: 3.0, a: 0.02, d: 0.8, gain: 0.12, send: 0.4 });
      noise({ at: 3.0, dur: 0.9, from: 900, to: 3500, q: 1.4, gain: 0.04, a: 0.4, send: 0.5 });
      // 3.4s: the wordmark chord settles
      [329.6, 493.9, 659.3, 830.6, 987.8].forEach((f, i) => voice({ type: 'sine', f, at: 3.4 + i * 0.03, a: 0.25, d: 2.6, gain: 0.04, send: 0.7 }));
    },
  };

  function play(name) {
    if (!enabled()) return;
    if (!init()) return;
    if (pack[name]) {
      const src = ctx.createBufferSource(); src.buffer = pack[name]; src.connect(out); src.start();
      return;
    }
    try { (SOUNDS[name] || (() => {}))(); } catch (e) { /* audio unavailable */ }
  }
  window.XSound = { play, init };
})();
