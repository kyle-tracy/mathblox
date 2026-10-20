// Canvas renderer + input. All rules live in core/; this file only draws and plays sounds.
import { parseLevel, step } from './core/world.js';
import { LEVELS } from './levels/levels.js';

const cv = document.getElementById('c'), g = cv.getContext('2d');
const CELL = 64, PAD = 44; // PAD leaves room for the axes
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const C = { floor: '#f4efe4', wall: '#5b6475', grid: '#e2dacb', axis: '#3a3f4b', block: '#ffd166', op: '#8ecae6',
  door: '#9b5de5', exit: '#06d6a0', dot: '#2b2d42', hole: '#c9bfae', player: '#ef476f' };

let lvlIdx = 0, state, prev, history, fx = [], tMove = 0, won = false;

function load(i) {
  lvlIdx = (i + LEVELS.length) % LEVELS.length;
  state = prev = parseLevel(LEVELS[lvlIdx]);
  history = []; fx = []; won = false;
  const H = state.tiles.length, W = state.tiles[0].length;
  cv.width = W * CELL + PAD; cv.height = H * CELL + PAD;
  document.getElementById('name').textContent = `${lvlIdx + 1}. ${LEVELS[lvlIdx].name}`;
  document.getElementById('next').hidden = true;
}

function act(dir) {
  if (won) return;
  const r = step(state, dir);
  if (r.state !== state) { history.push(state); prev = state; state = r.state; tMove = performance.now(); }
  for (const e of r.events) feedback(e);
}
function undo() { if (history.length) { prev = state = history.pop(); won = false; fx = []; document.getElementById('next').hidden = true; tone(300, 0.08, 'sine', -150); } }

// ---- sound: pitch rises with value; never a buzzer ----
let ac;
function tone(freq, dur = 0.1, type = 'triangle', slide = 0, delay = 0) {
  try {
    ac ??= new AudioContext();
    const t = ac.currentTime + delay, o = ac.createOscillator(), v = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); o.frequency.linearRampToValueAtTime(freq + slide, t + dur);
    v.gain.setValueAtTime(0.15, t); v.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(v).connect(ac.destination); o.start(t); o.stop(t + dur);
  } catch { /* sound is never required */ }
}
const pitch = n => 220 * 2 ** (n / 12);

function feedback(e) {
  const now = performance.now();
  if (e.type === 'push') tone(110, 0.06, 'sine');
  if (e.type === 'merge') { for (let i = 0; i <= e.value; i++) tone(pitch(i * 2), 0.05, 'triangle', 0, i * 0.04); fx.push({ ...e, t0: now }); }
  if (e.type === 'carve') { for (let i = 0; i < 4; i++) tone(pitch(14 - i * 2), 0.04, 'square', 0, i * 0.04); fx.push({ ...e, t0: now }); }
  if (e.type === 'bounce' && e.reason !== 'wall') { tone(180, 0.25, 'sine', 260); fx.push({ ...e, t0: now }); }
  if (e.type === 'open') { for (let i = 0; i < e.value; i++) tone(pitch(i * 2 + 7), 0.06, 'sine', 0, i * 0.06); fx.push({ ...e, t0: now }); }
  if (e.type === 'win') { won = true; [0, 4, 7, 12].forEach((n, i) => tone(pitch(n + 12), 0.18, 'triangle', 0, i * 0.12)); fx.push({ ...e, t0: now }); document.getElementById('next').hidden = false; }
}

// ---- drawing ----
const px = (x, y) => [PAD + x * CELL, y * CELL];

// Ten-frame dot layout (5-structure): 6 = a full row of 5 + 1. Dyscalculia-friendly, never random.
function dots(n, cx, cy, size) {
  const r = size * 0.06, sp = size * 0.17, tens = Math.floor(n / 10);
  for (let i = 0; i < n % 10; i++) { g.beginPath(); g.arc(cx + (i % 5 - 2) * sp, cy + size * 0.18 + Math.floor(i / 5) * sp, r, 0, 7); g.fill(); }
  for (let t = 0; t < tens; t++) g.fillRect(cx - size * 0.38, cy + size * 0.1 + t * 6, size * 0.76, 4); // ten-rods
}
function slots(n, cx, cy, size, color = '#fff') { // hollow dots: door wants exactly n / deficit ghost
  g.strokeStyle = color; g.lineWidth = 2;
  for (let i = 0; i < n; i++) { const col = i % 5, row = Math.floor(i / 5); g.beginPath(); g.arc(cx + (col - 2) * size * 0.17, cy + size * 0.18 + row * size * 0.17, size * 0.06, 0, 7); g.stroke(); }
}
function roundRect(x, y, w, h, r, fill) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); }

function draw(now) {
  const H = state.tiles.length, W = state.tiles[0].length;
  g.fillStyle = C.floor; g.fillRect(0, 0, cv.width, cv.height);
  state.tiles.forEach((row, y) => [...row].forEach((t, x) => {
    const [X, Y] = px(x, y);
    g.fillStyle = t === '#' ? C.wall : t === 'E' ? C.exit : C.floor; g.fillRect(X, Y, CELL, CELL);
    g.strokeStyle = C.grid; g.strokeRect(X + 0.5, Y + 0.5, CELL, CELL);
    if (t === 'E') { g.fillStyle = '#fff'; g.font = `${CELL * 0.5}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', X + CELL / 2, Y + CELL / 2); }
  }));

  // Axes: a frame of reference only. y counts up from the bottom, like real math.
  g.strokeStyle = C.axis; g.fillStyle = C.axis; g.lineWidth = 2; g.font = '13px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.beginPath(); g.moveTo(PAD, 0); g.lineTo(PAD, H * CELL); g.lineTo(cv.width, H * CELL); g.stroke();
  for (let x = 0; x < W; x++) { const X = PAD + x * CELL + CELL / 2; g.fillRect(X - 1, H * CELL, 2, 6); g.fillText(x, X, H * CELL + 18); }
  for (let y = 0; y < H; y++) { const Y = (H - 1 - y) * CELL + CELL / 2; g.fillRect(PAD - 6, Y - 1, 6, 2); g.fillText(y, PAD - 18, Y); }
  g.fillText('x', cv.width - 10, H * CELL + 34); g.fillText('y', 12, 10);

  // Slide objects from their previous cells.
  const k = reduced ? 1 : Math.min(1, (now - tMove) / 110);
  const from = id => prev.objects.find(o => o.id === id);
  for (const o of state.objects) {
    const p = from(o.id) ?? o;
    let x = p.x + (o.x - p.x) * k, y = p.y + (o.y - p.y) * k;
    const f = fx.find(f => f.at && f.at.x === o.x && f.at.y === o.y && now - f.t0 < 400);
    let s = 1;
    if (f?.type === 'bounce' && !reduced) x += Math.sin((now - f.t0) / 25) * 0.08 * (1 - (now - f.t0) / 400);
    if ((f?.type === 'merge' || f?.type === 'carve') && !reduced) s = 1 + 0.25 * Math.sin(Math.PI * (now - f.t0) / 400);
    const [X, Y] = px(x, y), m = CELL * (1 - s * 0.84) / 2, sz = CELL - 2 * m, cx = X + CELL / 2, cy = Y + CELL / 2 - CELL * 0.12;
    if (o.kind === 'door') {
      roundRect(X + 2, Y + 2, CELL - 4, CELL - 4, 6, C.door);
      g.fillStyle = '#fff'; g.font = `bold ${CELL * 0.3}px system-ui`; g.fillText(o.value, cx, cy - CELL * 0.06); slots(o.value, cx, cy, CELL);
    } else if (o.kind === 'op') {
      roundRect(X + m, Y + m, sz, sz, 12, C.op);
      g.fillStyle = C.dot; g.font = `bold ${sz * 0.7}px system-ui`; g.fillText(o.op === '-' ? '−' : '+', X + CELL / 2, Y + CELL / 2 + 2);
    } else {
      roundRect(X + m, Y + m + 3, sz, sz, 12, 'rgba(0,0,0,.15)'); roundRect(X + m, Y + m, sz, sz, 12, C.block);
      g.fillStyle = C.dot; g.font = `bold ${CELL * 0.34}px system-ui`; g.fillText(o.value, cx, cy - CELL * 0.04); dots(o.value, cx, cy, CELL);
    }
  }
  // Deficit ghost: a bounced carve shows the missing units as hollow dots (Matho/Psycho: "why" in dots, never words).
  for (const f of fx) if (f.type === 'bounce' && f.missing && now - f.t0 < 1200) {
    const [X, Y] = px(f.at.x, f.at.y); roundRect(X + 6, Y - CELL * 0.62, CELL - 12, CELL * 0.56, 8, 'rgba(255,255,255,.85)');
    slots(f.missing, X + CELL / 2, Y - CELL * 0.62, CELL * 0.8, C.dot);
  }

  // Player (a friendly blob).
  const pk = reduced ? 1 : Math.min(1, (now - tMove) / 110);
  const [PX, PY] = px(prev.player.x + (state.player.x - prev.player.x) * pk, prev.player.y + (state.player.y - prev.player.y) * pk);
  g.fillStyle = C.player; g.beginPath(); g.arc(PX + CELL / 2, PY + CELL / 2, CELL * 0.33, 0, 7); g.fill();
  g.fillStyle = '#fff'; for (const d of [-1, 1]) { g.beginPath(); g.arc(PX + CELL / 2 + d * 9, PY + CELL / 2 - 5, 6, 0, 7); g.fill(); }
  g.fillStyle = C.dot; for (const d of [-1, 1]) { g.beginPath(); g.arc(PX + CELL / 2 + d * 9, PY + CELL / 2 - 4, 3, 0, 7); g.fill(); }

  const w = fx.find(f => f.type === 'win');
  if (w && !reduced) for (let i = 0; i < 24; i++) { const t = (now - w.t0) / 1000, a = i * 0.26; if (t > 1.5) break;
    g.fillStyle = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'][i % 4]; g.fillRect(PX + CELL / 2 + Math.cos(a) * t * 160, PY + CELL / 2 + Math.sin(a) * t * 160 + t * t * 120, 7, 7); }
  requestAnimationFrame(draw);
}

// ---- input: keyboard, buttons, swipe ----
const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
addEventListener('keydown', e => {
  if (e.repeat) return; // one step per press: forgiving input
  if (KEYS[e.key]) { act(KEYS[e.key]); e.preventDefault(); }
  else if (e.key === 'z' || e.key === 'Backspace') undo();
  else if (e.key === 'r') load(lvlIdx);
  else if (e.key === 'Enter' && won) load(lvlIdx + 1);
});
document.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => act(b.dataset.dir));
document.getElementById('undo').onclick = undo;
document.getElementById('restart').onclick = () => load(lvlIdx);
document.getElementById('next').onclick = () => load(lvlIdx + 1);
let touch;
cv.addEventListener('touchstart', e => { touch = e.touches[0]; }, { passive: true });
cv.addEventListener('touchend', e => {
  const t = e.changedTouches[0], dx = t.clientX - touch.clientX, dy = t.clientY - touch.clientY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
});

load(Number(new URLSearchParams(location.search).get('level') ?? 1) - 1);
requestAnimationFrame(draw);
