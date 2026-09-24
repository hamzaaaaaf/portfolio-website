import * as THREE from 'three';

const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const perfectEl = document.getElementById('perfect');
const promptTitle = document.getElementById('prompt-title');
const promptHint = document.getElementById('prompt-hint');
const soundBtn = document.getElementById('sound');

const BLOCK_H = 0.4;
const START_SIZE = 3;
const RANGE = 4.2;
const PERFECT = 0.12;

let best = 0;
try { best = Number(localStorage.getItem('stack-best')) || 0; } catch (e) { /* storage blocked */ }
bestEl.textContent = best;

let soundOn = true;
try { soundOn = localStorage.getItem('stack-sound') !== 'off'; } catch (e) { /* storage blocked */ }
soundBtn.setAttribute('aria-pressed', String(soundOn));

/* ---------- Three setup ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a0a0b, 20, 40);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
const CAM_OFFSET = new THREE.Vector3(8, 8, 8);

scene.add(new THREE.HemisphereLight(0xfff4e6, 0x1a1a22, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(6, 14, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
scene.add(sun, sun.target);

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
let hue = 30;
const colorFor = (i) => new THREE.Color().setHSL(((hue + i * 4.5) % 360) / 360, 0.42, 0.62);

function makeBlock(w, d, h, color) {
  const mesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 }));
  mesh.scale.set(w, h, d);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

/* ---------- Sound ---------- */
let audio;
function blip(freq, dur = 0.12, type = 'sine', gain = 0.12) {
  if (!soundOn) return;
  audio = audio || new (window.AudioContext || window.webkitAudioContext)();
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(audio.destination);
  osc.start(t);
  osc.stop(t + dur);
}
soundBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  soundOn = !soundOn;
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  try { localStorage.setItem('stack-sound', soundOn ? 'on' : 'off'); } catch (err) { /* storage blocked */ }
});

/* ---------- Game state ---------- */
let state = 'ready'; // ready | playing | over
let stack = [];      // { mesh, x, z, w, d }
let current = null;  // { mesh, x, z, w, d, axis, dir }
let debris = [];     // { mesh, vx, vy, vz, rx, rz }
let rings = [];
let combo = 0;
let camY = 0;
let zoom = 1;
let targetZoom = 1;
const score = () => stack.length - 1;

function clearScene() {
  [...stack, ...debris, ...rings].forEach((o) => scene.remove(o.mesh));
  if (current) scene.remove(current.mesh);
  stack = []; debris = []; rings = []; current = null;
}

function reset() {
  clearScene();
  hue = Math.floor(Math.random() * 360);
  document.body.style.setProperty('--hue', hue);
  // The base is a tall pillar so the tower looks like it grows out of it.
  const base = makeBlock(START_SIZE, START_SIZE, 12, colorFor(0).offsetHSL(0, -0.1, -0.12));
  base.position.set(0, BLOCK_H - 6, 0);
  stack.push({ mesh: base, x: 0, z: 0, w: START_SIZE, d: START_SIZE });
  combo = 0;
  scoreEl.textContent = '0';
  targetZoom = 1;
}

function topY() { return stack.length * BLOCK_H; }

function spawn() {
  const prev = stack[stack.length - 1];
  const axis = stack.length % 2 ? 'x' : 'z';
  const mesh = makeBlock(prev.w, prev.d, BLOCK_H, colorFor(stack.length));
  current = { mesh, x: prev.x, z: prev.z, w: prev.w, d: prev.d, axis, dir: 1 };
  current[axis] = -RANGE;
  mesh.position.set(current.x, topY() + BLOCK_H / 2, current.z);
}

function start() {
  if (state === 'over') reset();
  state = 'playing';
  document.body.classList.add('is-playing');
  spawn();
}

function addDebris(x, y, z, w, d, dirSign, axis) {
  const mesh = makeBlock(w, d, BLOCK_H, current.mesh.material.color);
  mesh.position.set(x, y, z);
  debris.push({
    mesh,
    vx: axis === 'x' ? dirSign * 1.5 : 0,
    vz: axis === 'z' ? dirSign * 1.5 : 0,
    vy: 0,
    rx: axis === 'z' ? dirSign * 2.2 : 0,
    rz: axis === 'x' ? -dirSign * 2.2 : 0,
  });
}

function perfectRing(b) {
  const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(b.w, 0.001, b.d));
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const mesh = new THREE.LineSegments(geo, mat);
  mesh.position.set(b.x, b.mesh.position.y - BLOCK_H / 2 + 0.01, b.z);
  scene.add(mesh);
  rings.push({ mesh, t: 0 });
}

function place() {
  const prev = stack[stack.length - 1];
  const c = current;
  const axis = c.axis;
  const sizeKey = axis === 'x' ? 'w' : 'd';
  const delta = c[axis] - prev[axis];
  const overhang = Math.abs(delta);
  const size = prev[sizeKey];
  const y = c.mesh.position.y;

  if (overhang >= size) {
    // Missed completely: the whole block falls.
    debris.push({ mesh: c.mesh, vx: axis === 'x' ? Math.sign(delta) * 1.5 : 0, vz: axis === 'z' ? Math.sign(delta) * 1.5 : 0, vy: 0, rx: 1.2, rz: 1.2 });
    current = null;
    return gameOver();
  }

  if (overhang < PERFECT) {
    c[axis] = prev[axis];
    combo++;
    perfectRing(c);
    perfectEl.textContent = combo > 1 ? `Perfect ×${combo}` : 'Perfect';
    perfectEl.classList.add('show');
    clearTimeout(place.t);
    place.t = setTimeout(() => perfectEl.classList.remove('show'), 700);
    blip(440 * Math.pow(2, Math.min(combo, 12) / 12), 0.18, 'triangle', 0.14);
  } else {
    combo = 0;
    const keep = size - overhang;
    const sign = Math.sign(delta);
    const newCenter = prev[axis] + delta / 2;
    const cutCenter = newCenter + sign * (keep / 2 + overhang / 2);
    c[sizeKey] = keep;
    c[axis] = newCenter;
    if (axis === 'x') addDebris(cutCenter, y, c.z, overhang, c.d, sign, 'x');
    else addDebris(c.x, y, cutCenter, c.w, overhang, sign, 'z');
    blip(260 + Math.min(score(), 40) * 6, 0.1, 'sine', 0.1);
  }

  c.mesh.scale.set(c.w, BLOCK_H, c.d);
  c.mesh.position.set(c.x, y, c.z);
  stack.push({ mesh: c.mesh, x: c.x, z: c.z, w: c.w, d: c.d });
  current = null;

  const s = score();
  scoreEl.textContent = s;
  bestEl.textContent = Math.max(best, s);
  scoreEl.classList.remove('bump');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('bump');
  document.body.style.setProperty('--hue', (hue + s * 4.5) % 360);
  spawn();
}

function gameOver() {
  state = 'over';
  document.body.classList.remove('is-playing');
  const s = score();
  if (s > best) {
    best = s;
    bestEl.textContent = best;
    try { localStorage.setItem('stack-best', String(best)); } catch (e) { /* storage blocked */ }
    promptTitle.innerHTML = `${s}. <em>New best.</em>`;
  } else {
    promptTitle.innerHTML = s === 1 ? '1 block. <em>Warm up?</em>' : `${s} blocks.`;
  }
  promptHint.textContent = 'Tap to go again';
  blip(140, 0.4, 'sawtooth', 0.06);
  // Pull the camera back so the whole tower is visible.
  targetZoom = Math.max(1, (stack.length * BLOCK_H + 6) / 12);
}

function action() {
  if (state === 'playing' && current) place();
  else if (state !== 'playing') start();
}

canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); action(); });
addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); action(); }
});

/* ---------- Loop ---------- */
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  // Keep the tower a comfortable size on both wide and tall screens.
  const aspect = w / h;
  const view = aspect < 1 ? 10 / aspect : 15;
  camera.left = (-view * aspect) / 2;
  camera.right = (view * aspect) / 2;
  camera.top = view / 2;
  camera.bottom = -view / 2;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 1 / 30);

  if (current) {
    const speed = Math.min(3.4 + score() * 0.09, 7.5);
    const a = current.axis;
    current[a] += current.dir * speed * dt;
    if (current[a] > RANGE) { current[a] = RANGE; current.dir = -1; }
    if (current[a] < -RANGE) { current[a] = -RANGE; current.dir = 1; }
    current.mesh.position.x = current.x;
    current.mesh.position.z = current.z;
  }

  for (let i = debris.length - 1; i >= 0; i--) {
    const p = debris[i];
    p.vy -= 22 * dt;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.mesh.rotation.x += p.rx * dt;
    p.mesh.rotation.z += p.rz * dt;
    if (p.mesh.position.y < camY - 30) { scene.remove(p.mesh); debris.splice(i, 1); }
  }

  for (let i = rings.length - 1; i >= 0; i--) {
    const r = rings[i];
    r.t += dt;
    const k = 1 + r.t * 1.6;
    r.mesh.scale.set(k, 1, k);
    r.mesh.material.opacity = Math.max(0, 0.9 - r.t * 1.6);
    if (r.t > 0.6) { scene.remove(r.mesh); rings.splice(i, 1); }
  }

  // Camera follows the top of the tower (or its middle when zoomed out).
  const goal = state === 'over' ? topY() / 2 + 1 : topY() + 1.4;
  camY += (goal - camY) * Math.min(1, dt * 4);
  zoom += (targetZoom - zoom) * Math.min(1, dt * 3);
  camera.zoom = 1 / zoom;
  camera.updateProjectionMatrix();
  camera.position.set(CAM_OFFSET.x, camY + CAM_OFFSET.y, CAM_OFFSET.z);
  camera.lookAt(0, camY, 0);
  sun.position.set(6, camY + 14, 4);
  sun.target.position.set(0, camY, 0);
  scene.fog.near = 20 * zoom;
  scene.fog.far = 40 * zoom;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

reset();
requestAnimationFrame(tick);
