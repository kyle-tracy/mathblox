// Canvas renderer + input. All rules live in core/; this file only draws and plays sounds.
// It never computes a math result: every value comes from the state or the events step() returns.
// Look and timings are specified in docs/style-guide.md.
import { parseLevel, step, DIRS } from './core/world.js';
import { LEVELS } from './levels/levels.js';
import { SHOWCASE } from './levels/showcase.js';

const Q = new URLSearchParams(location.search);
const SET = Q.has('showcase') ? SHOWCASE : LEVELS;
const cv = document.getElementById('c'), g = cv.getContext('2d');
const CELL = 64, PAD = 44; // PAD leaves room for the axes
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TS = reduced ? 0.5 : 1; // reduced motion: effects run at half length, nothing shakes, dots still move
const FONT = 'Verdana, "DejaVu Sans", sans-serif'; // 1 has a base, 7 has none; 6/9 open and distinct
const INK = '#1d1f2e', WHITE = '#ffffff';
const C = { floor: '#f4efe4', wall: '#5b6475', grid: '#e2dacb', axis: '#3a3f4b', op: '#dfe3ea', door: '#5b3aa8',
  doorFrame: '#3e2777', exit: '#06d6a0', player: '#ef476f', trench: '#7a5c43', trenchDeep: '#5a4231',
  pad: '#1f7a6d', sign: '#f1e2c2', big: '#efe9dc' };
// Cuisenaire-inspired, checked for deuteranopia/protanopia/tritanopia (min ΔE ≥ 12). [fill, ink]; index = value.
const PAL = [['#e9e5dc', INK], ['#fbfaf5', INK], ['#f4826a', INK], ['#9be08a', INK], ['#e7a6dc', INK], ['#f7e35a', INK],
  ['#24785a', WHITE], ['#3d4152', WHITE], ['#8a5a2b', WHITE], ['#4f9be8', INK], ['#ff9f1c', INK]];
const pal = n => (n <= 10 ? PAL[n] : [C.big, INK]);

let lvlIdx = 0, state, prev, orig, history, fx = [], fills, tMove = 0, won = false, lastDir = 'right';
let muted = false;
try { muted = localStorage.getItem('mute') === '1'; } catch { /* storage may be blocked */ }

function load(i) {
  lvlIdx = (i + SET.length) % SET.length;
  state = prev = orig = parseLevel(SET[lvlIdx]);
  history = []; fx = []; fills = new Map(); won = false;
  const H = state.tiles.length, W = state.tiles[0].length;
  cv.width = W * CELL + PAD; cv.height = H * CELL + PAD;
  document.getElementById('name').textContent = `${lvlIdx + 1}. ${SET[lvlIdx].name}`;
  document.getElementById('next').hidden = true;
}

function act(dir) {
  if (won) return;
  lastDir = dir;
  fx = fx.filter(f => !f.linger); // ghosts and scales stay readable until the next move
  const before = state, r = step(state, dir);
  if (r.state !== state) { history.push(state); prev = state; state = r.state; tMove = performance.now(); }
  for (const e of r.events) feedback(e, before);
}
function undo() {
  if (!history.length) return;
  prev = state = history.pop(); won = false; fx = []; document.getElementById('next').hidden = true; tone(300, 0.08, 'sine', -150);
}

// ---- sound: pitch rises with value; never a buzzer ----
let ac;
function tone(freq, dur = 0.1, type = 'triangle', slide = 0, delay = 0) {
  if (muted) return;
  try {
    ac ??= new AudioContext();
    const t = ac.currentTime + delay, o = ac.createOscillator(), v = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); o.frequency.linearRampToValueAtTime(freq + slide, t + dur);
    v.gain.setValueAtTime(0.15, t); v.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(v).connect(ac.destination); o.start(t); o.stop(t + dur);
  } catch { /* sound is never required */ }
}
const pitch = n => 220 * 2 ** (n / 12);
const boing = () => tone(180, 0.25, 'sine', 260);
const stagger = (n, total) => Math.min(40, total / Math.max(1, n)); // ms between counted dots; keeps effects ≤600ms

const objAt = (s, x, y) => s.objects.find(o => o.x === x && o.y === y);
const tileAt = (s, x, y) => s.tiles[y]?.[x] ?? '#';

function feedback(e, before) {
  const t0 = performance.now(), [dx, dy] = DIRS[lastDir]; // bounces carry no dir: use the input's
  if (e.type === 'push') tone(110, 0.06, 'sine');
  if (e.type === 'merge' || e.type === 'carve') {
    // Operands as they stood before the push; reading order (left->right, top->bottom) is layout, not math.
    const gone = before.objects.filter(o => !state.objects.some(s => s.id === o.id));
    const a = gone.find(o => o.kind === 'num'), op = gone.find(o => o.kind === 'op');
    const n = e.type === 'merge' ? a.value : e.operands[1]; // dots that fly in / chips that fall out
    const st = stagger(n, 300);
    fx.push({ type: e.type, at: e.at, from: a, op, n, st, t0, wob: e.at });
    if (e.type === 'merge') { for (let i = 0; i < n; i++) tone(pitch(i * 2), 0.05, 'triangle', 0, (240 + i * st) / 1000); tone(pitch(e.value), 0.15, 'sine', 0, 0.42); }
    else { for (let i = 0; i < n; i++) tone(pitch(14 - i * 2), 0.04, 'square', 0, i * st / 1000); tone(pitch(e.value + 5), 0.08, 'triangle', 0, 0.45); }
  }
  if (e.type === 'tick') { fx.push({ type: 'tick', at: e.at, t0, wob: e.at }); tone(pitch(e.value), 0.08, 'triangle', 300); }
  if (e.type === 'fill') {
    const [dx, dy] = DIRS[e.dir], st = stagger(e.value, 400);
    for (let i = 0; i < e.value; i++) {
      fills.set(`${e.at.x + dx * i},${e.at.y + dy * i}`, { n: e.value, t: t0 + i * st });
      tone(pitch(i * 2), 0.05, 'sine', 0, i * st / 1000);
    }
  }
  if (e.type === 'bounce' && e.reason !== 'wall') {
    boing();
    const wob = objAt(state, e.at.x, e.at.y) ? e.at : { x: e.at.x - dx, y: e.at.y - dy };
    const f = { ...e, t0, wob, linger: true };
    if (e.reason === 'too-long') { // trench cells it would cover, read from tiles; the event says how much sticks out
      f.n = objAt(state, wob.x, wob.y)?.value ?? 0; f.cells = [];
      for (let x = e.at.x, y = e.at.y; tileAt(state, x, y) === 'o' && !objAt(state, x, y); x += dx, y += dy) f.cells.push([x, y]);
      f.dx = dx; f.dy = dy;
    }
    fx.push(f);
  }
  if (e.type === 'open') {
    const door = objAt(before, e.at.x, e.at.y), st = stagger(e.value, 300);
    fx.push({ type: 'open', at: e.at, n: e.value, spec: door.value, st, t0 });
    for (let i = 0; i < e.value; i++) tone(pitch(i * 2 + 7), 0.06, 'sine', 0, i * st / 1000);
    [0, 7].forEach(n => tone(pitch(e.value + 12 + n), 0.3, 'sine', 0, 0.42)); // balanced: a consonant fifth
  }
  if (e.type === 'win') {
    won = true; [0, 4, 7, 12].forEach((n, i) => tone(pitch(n + 12), 0.18, 'triangle', 0, i * 0.12));
    fx.push({ type: 'win', t0 }); document.getElementById('next').hidden = false;
  }
}

// ---- drawing ----
const px = (x, y) => [PAD + x * CELL, y * CELL];
const ease = t => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
function rr(x, y, w, h, r, fill) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); }
function circle(x, y, r) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function text(s, x, y, size, color, bold = true) {
  g.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y);
}
// Ten-frame dot position (5-structure: 6 = a full row of 5 + 1). Dyscalculia-friendly, never random.
const dotPos = (i, cx, cy, sp) => [cx + (i % 5 - 2) * sp, cy + Math.floor(i / 5) * sp];

// A number block, triple-coded: numeral + dot face + unit rod (length ∝ value) + Cuisenaire color.
// Designed on a 55px face; s scales it. Above 10: ones as dots, each ten as a notched ten-rod.
function block(X, Y, n, s = 1, alpha = 1) {
  const [fill, ink] = pal(n), u = (CELL * 0.86 * s) / 55;
  g.save(); g.globalAlpha = alpha; g.translate(X + CELL / 2 - 27.5 * u, Y + CELL / 2 - 27.5 * u); g.scale(u, u);
  rr(0, 3, 55, 55, 10, 'rgba(0,0,0,.18)'); rr(0, 0, 55, 55, 10, fill);
  g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; if (n === 0) g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]);
  text(n, 27.5, 13, 19, ink);
  g.fillStyle = ink;
  for (let i = 0; i < n % 10 + (n === 10 ? 10 : 0); i++) { const [x, y] = dotPos(i, 27.5, 28, 9.4); circle(x, y, 3.5); }
  if (n <= 10) {
    for (let i = 0; i < n; i++) g.fillRect(4.5 + i * 4.6, 44, 3.6, 8);
    if (n === 0) { g.strokeStyle = ink; g.lineWidth = 1; g.setLineDash([2, 2]); g.strokeRect(4.5, 44, 46, 8); g.setLineDash([]); }
  } else for (let t = 0; t < Math.floor(n / 10); t++) { // ten-rods, each notched into 10 units
    const y = 51 - t * 6; rr(4.5, y - 3, 46, 5, 1.5, PAL[10][0]); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(4.5, y - 3, 46, 5);
    g.fillStyle = INK; for (let k = 1; k < 10; k++) g.fillRect(4.5 + k * 4.6 - 0.4, y - 3, 0.8, 5);
  }
  g.restore();
}
function slots(n, cx, cy, sp, r, color, filled = 0) { // hollow dots: a door wants exactly n; deficit ghost
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 2;
  for (let i = 0; i < n; i++) { const [x, y] = dotPos(i, cx, cy, sp); g.beginPath(); g.arc(x, y, r, 0, 7); i < filled ? g.fill() : g.stroke(); }
}
function opBlock(X, Y, op, s) { // round silhouette (numbers are square); thick + and − glyphs
  const cx = X + CELL / 2, cy = Y + CELL / 2, r = CELL * 0.4 * s;
  g.fillStyle = 'rgba(0,0,0,.18)'; circle(cx, cy + 3, r); g.fillStyle = C.op; circle(cx, cy, r);
  g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = INK; const L = r * 1.2, w = r * 0.32;
  if (op === '+') { rr(cx - L / 2, cy - w / 2, L, w, 3, INK); rr(cx - w / 2, cy - L / 2, w, L, 3, INK); }
  else rr(cx - L / 2, cy - w / 2, L, w, 3, INK); // symmetric bar: no arrow, so it never reads as a direction
}

// Equations: tokens drawn left to right; □ is the hollow box your block fills. Returns width.
function equation(spec, cx, cy, size, color, draw = true) {
  const toks = [...spec.replace(/\s/g, '')].map(c => (c === '-' ? '−' : c)), gap = size * 0.1;
  g.font = `bold ${size}px ${FONT}`;
  const ws = toks.map(c => (c === '□' ? size * 0.8 : g.measureText(c).width)), W = ws.reduce((a, b) => a + b + gap, -gap);
  if (!draw) return W;
  let x = cx - W / 2;
  toks.forEach((c, i) => {
    if (c === '□') { g.strokeStyle = color; g.lineWidth = 2; g.strokeRect(x + 1, cy - size * 0.38, ws[i] - 2, size * 0.76); }
    else text(c, x + ws[i] / 2, cy + 1, size, color);
    x += ws[i] + gap;
  });
  return W;
}
const fitsOnDoor = spec => typeof spec === 'number' || equation(spec, 0, 0, 13, WHITE, false) <= CELL - 8;

function door(X, Y, spec, filled = 0) {
  rr(X + 2, Y + 2, CELL - 4, CELL - 4, 6, C.doorFrame); rr(X + 6, Y + 6, CELL - 12, CELL - 12, 4, C.door);
  const cx = X + CELL / 2;
  if (typeof spec === 'number') { text(spec, cx, Y + 20, 18, WHITE); slots(spec, cx, Y + 37, 9.4, 3.5, WHITE, filled); }
  else if (fitsOnDoor(spec)) equation(spec, cx, Y + CELL / 2, 13, WHITE);
  else { g.strokeStyle = WHITE; g.lineWidth = 2.5; g.strokeRect(cx - 11, Y + CELL / 2 - 11, 22, 22); } // big □: read the sign
}
function sign(X, Y, spec) { // long equations hang on a sign above the door (below if the door is on the top row)
  const w = equation(spec, 0, 0, 17, INK, false) + 16, cx = X + CELL / 2, up = Y >= 34, sy = up ? Y - 32 : Y + CELL + 4;
  g.fillStyle = C.doorFrame; g.fillRect(cx - 2, up ? sy + 26 : Y + CELL - 2, 4, 8);
  rr(cx - w / 2, sy, w, 28, 6, C.sign); g.strokeStyle = C.doorFrame; g.lineWidth = 2; g.stroke();
  equation(spec, cx, sy + 14, 17, INK);
}
function bubble(X, Y, w, h, above = 0) { // white speech plate over a cell, flipped below if it would leave the canvas
  const by = Y - above - h - 4 >= 0 ? Y - above - h - 4 : Y + CELL + 4, bx = Math.max(2, Math.min(cv.width - w - 2, X + CELL / 2 - w / 2));
  rr(bx, by, w, h, 8, 'rgba(255,255,255,.94)'); g.strokeStyle = 'rgba(29,31,46,.35)'; g.lineWidth = 1.5; g.stroke();
  return [bx, by];
}
// Balance scale for a not-equal bump: the heavier side of the = sinks. sides come from the engine.
function scale(f, now) {
  const [X, Y] = px(f.at.x, f.at.y), [l, r] = f.sides, door = objAt(state, f.at.x, f.at.y);
  const [bx, by] = bubble(X, Y, 136, 96, door && !fitsOnDoor(door.value) ? 34 : 0), cx = bx + 68, py = by + 22;
  const k = reduced ? 1 : ease((now - f.t0) / 300), wob = reduced ? 0 : Math.sin((now - f.t0) / 45) * 0.08 * (1 - k);
  const th = (0.26 * Math.sign(r - l) || 0) * k + wob, L = 44; // NaN side (can't be built yet): stays level
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx, py); g.lineTo(cx - 9, by + 90); g.lineTo(cx + 9, by + 90); g.fill();
  g.save(); g.translate(cx, py); g.rotate(th); g.fillRect(-L, -2, 2 * L, 4); g.restore(); circle(cx, py, 4);
  [[l, -1], [r, 1]].forEach(([v, d]) => {
    const ex = cx + d * L * Math.cos(th), ey = py + d * L * Math.sin(th), pan = ey + 34;
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(ex - 20, pan); g.lineTo(ex, ey); g.lineTo(ex + 20, pan); g.stroke();
    g.beginPath(); g.arc(ex, pan, 20, 0, Math.PI); g.fillStyle = INK; g.fill(); // bowl
    if (Number.isNaN(v)) return text('?', ex, pan - 10, 15, INK);
    text(v, ex, pan + 9, 12, WHITE);
    g.fillStyle = INK; const ones = v % 10 + (v === 10 ? 10 : 0); // contents sit on the bowl: ones as dots, tens as rods
    for (let i = 0; i < ones; i++) circle(ex + (i % 5 - 2) * 6.4, pan - 4 - Math.floor(i / 5) * 6.4, 2.5);
    for (let t = 0; t < (v > 10 ? Math.floor(v / 10) : 0); t++) rr(ex - 15, pan - 6 - Math.ceil(ones / 5) * 6.4 - t * 5, 30, 3.5, 1.5, PAL[10][0]);
  });
}

function tile(t, x, y, now) {
  const [X, Y] = px(x, y), o0 = orig.tiles[y][x];
  g.fillStyle = t === '#' ? C.wall : t === 'E' ? C.exit : C.floor; g.fillRect(X, Y, CELL, CELL);
  g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(X + 0.5, Y + 0.5, CELL, CELL);
  if (t === 'E') text('★', X + CELL / 2, Y + CELL / 2, CELL * 0.5, WHITE, false);
  if (o0 === 'o') { // a dug channel; neighbors join so a run reads as one trench, one unit hole per cell
    const was = (i, j) => orig.tiles[j]?.[i] === 'o', e = 7;
    const x0 = X + (was(x - 1, y) ? 0 : e), x1 = X + CELL - (was(x + 1, y) ? 0 : e), y0 = Y + (was(x, y - 1) ? 0 : e), y1 = Y + CELL - (was(x, y + 1) ? 0 : e);
    g.fillStyle = C.trench; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.fillStyle = C.trenchDeep; g.fillRect(x0, y0, x1 - x0, 5);
    const f = fills.get(`${x},${y}`), k = t === '.' && f ? (now - f.t) / (150 * TS) : -1;
    if (k >= 0) { // filled: the block's units now lie in the trench, one unit cube per cell
      const s = 1 + 0.3 * (1 - ease(k)), w = (CELL - 18) * s, [fill, ink] = pal(f.n);
      rr(X + CELL / 2 - w / 2, Y + CELL / 2 - w / 2, w, w, 5, fill); g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = ink; circle(X + CELL / 2, Y + CELL / 2, 4);
    } else { g.strokeStyle = '#c9a98a'; g.lineWidth = 2; g.setLineDash([5, 4]); g.strokeRect(X + 15, Y + 15, CELL - 30, CELL - 30); g.setLineDash([]); }
  }
  if (o0 === '^') { // +1 pad; once used it stays as a grey dashed ring so you can see it is spent
    const cx = X + CELL / 2, cy = Y + CELL / 2;
    if (t === '^') { g.fillStyle = C.pad; circle(cx, cy, CELL * 0.36); g.strokeStyle = WHITE; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, CELL * 0.3, 0, 7); g.stroke();
      text('+1', cx, cy - 4, 17, WHITE); g.fillStyle = WHITE; circle(cx, cy + 12, 3.5); }
    else { g.strokeStyle = '#a99f8e'; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.arc(cx, cy, CELL * 0.33, 0, 7); g.stroke(); g.setLineDash([]); text('+1', cx, cy, 15, '#a99f8e'); }
  }
}

function draw(now) {
  const H = state.tiles.length, W = state.tiles[0].length;
  g.fillStyle = C.floor; g.fillRect(0, 0, cv.width, cv.height);
  state.tiles.forEach((row, y) => [...row].forEach((t, x) => tile(t, x, y, now)));

  // Axes: a frame of reference only. y counts up from the bottom, like real math.
  g.strokeStyle = C.axis; g.fillStyle = C.axis; g.lineWidth = 2;
  g.beginPath(); g.moveTo(PAD, 0); g.lineTo(PAD, H * CELL); g.lineTo(cv.width, H * CELL); g.stroke();
  for (let x = 0; x < W; x++) { const X = PAD + x * CELL + CELL / 2; g.fillStyle = C.axis; g.fillRect(X - 1, H * CELL, 2, 6); text(x, X, H * CELL + 18, 13, C.axis, false); }
  for (let y = 0; y < H; y++) { const Y = (H - 1 - y) * CELL + CELL / 2; g.fillStyle = C.axis; g.fillRect(PAD - 6, Y - 1, 6, 2); text(y, PAD - 18, Y, 13, C.axis, false); }
  text('x', cv.width - 10, H * CELL + 34, 13, C.axis, false); text('y', 12, 10, 13, C.axis, false);

  // Slide objects from their previous cells.
  const k = reduced ? 1 : Math.min(1, (now - tMove) / 110);
  const from = id => prev.objects.find(o => o.id === id);
  for (const o of state.objects) {
    const p = from(o.id) ?? o, f = fx.find(f => f.wob && f.wob.x === o.x && f.wob.y === o.y && now - f.t0 < 400 * TS);
    let x = p.x + (o.x - p.x) * k, y = p.y + (o.y - p.y) * k, s = 1;
    if (f && !reduced) {
      const t = (now - f.t0) / 400;
      if (f.type === 'bounce') x += Math.sin((now - f.t0) / 25) * 0.08 * (1 - t);
      else s = 1 + 0.22 * Math.sin(Math.PI * t);
    }
    const [X, Y] = px(x, y);
    if (o.kind === 'door') door(X, Y, o.value);
    else if (o.kind === 'op') opBlock(X, Y, o.op, s);
    else block(X, Y, o.value, s);
  }
  for (const o of state.objects) if (o.kind === 'door' && !fitsOnDoor(o.value)) sign(...px(o.x, o.y), o.value);

  for (const f of fx) {
    const t = now - f.t0, [X, Y] = f.at ? px(f.at.x, f.at.y) : [0, 0];
    if (f.type === 'merge') { // a's dots fly over into the result, one at a time so they can be counted
      const [AX, AY] = px(f.from.x, f.from.y), [fill] = pal(f.from.value);
      for (let i = 0; i < f.n; i++) {
        const q = (t - 60 * TS - i * f.st * TS) / (180 * TS); if (q < 0 || q > 1) continue;
        const e = ease(q), [dx0, dy0] = dotPos(i, 0, 0, 9.4);
        const x = AX + CELL / 2 + dx0 + (X - AX) * e, y = AY + CELL / 2 + dy0 + (Y - AY) * e - Math.sin(Math.PI * e) * 26;
        g.fillStyle = fill; circle(x, y, 6); g.fillStyle = INK; circle(x, y, 3.5);
      }
      if (t < 300 * TS) { const [OX, OY] = px(f.op.x, f.op.y), q = t / (300 * TS); g.fillStyle = `rgba(255,209,102,${1 - q})`; // operator pops into sparkles
        for (let i = 0; i < 8; i++) circle(OX + CELL / 2 + Math.cos(i * 0.785) * q * 30, OY + CELL / 2 + Math.sin(i * 0.785) * q * 30, 3.5); }
    }
    if (f.type === 'carve') for (let i = 0; i < f.n; i++) { // chips fall away as pebbles
      const q = (t - i * f.st * TS) / (240 * TS); if (q < 0 || q > 1) continue;
      const [dx0] = dotPos(i, 0, 0, 9.4);
      g.fillStyle = `rgba(122,92,67,${1 - q})`; circle(X + CELL / 2 + dx0 * (1 + q), Y + CELL / 2 + q * q * 44, 4.5);
    }
    if (f.type === 'tick' && t < 500 * TS) { const q = t / (500 * TS); g.globalAlpha = 1 - q;
      text('+1', X + CELL / 2, Y - 4 - q * 22, 20, C.pad); g.strokeStyle = C.pad; g.lineWidth = 3; g.beginPath(); g.arc(X + CELL / 2, Y + CELL / 2, CELL * (0.4 + q * 0.3), 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (f.type === 'open' && t < 600 * TS) { // dots drop into the door's slots, then it slides open
      const drop = 400 * TS, q = Math.max(0, (t - drop) / (200 * TS));
      g.save(); g.beginPath(); g.rect(X, Y, CELL, CELL); g.clip(); g.globalAlpha = 1 - q;
      if (typeof f.spec === 'number') {
        let n = 0; for (let i = 0; i < f.n; i++) if (t > i * f.st * TS + 120 * TS) n++;
        door(X, Y - q * CELL, f.spec, n);
        for (let i = 0; i < f.n; i++) { const p = (t - i * f.st * TS) / (120 * TS); if (p < 0 || p > 1) continue;
          const [x, y] = dotPos(i, X + CELL / 2, Y + 37, 9.4); g.fillStyle = WHITE; circle(x, y - (1 - ease(p)) * 30, 3.5); }
      } else {
        door(X, Y - q * CELL, f.spec);
        for (let i = 0; i < f.n; i++) { const p = (t - i * f.st * TS) / (200 * TS); if (p < 0 || p > 1) continue;
          const [x, y] = dotPos(i, X + CELL / 2, Y + 24, 6); g.fillStyle = WHITE; circle(x, y + ease(p) * 20, 2.6); }
      }
      g.restore();
    }
    if (f.type === 'bounce' && f.missing) { // deficit ghost: missing units as hollow dots, "why" in dots
      const rows = Math.ceil(f.missing / 5), [bx, by] = bubble(X, Y, 56, 14 + rows * 10);
      slots(f.missing, bx + 28, by + 12, 9.4, 3.5, INK);
    }
    if (f.type === 'bounce' && f.reason === 'not-equal' && f.sides) scale(f, now);
    if (f.type === 'bounce' && f.reason === 'too-long') { // ghost rod: fits the trench, then `extra` units stick out
      const q = reduced ? 1 : ease(t / 300), [fill, ink] = pal(f.n);
      const cells = [...f.cells];
      for (let i = 1; i <= f.extra; i++) { const [lx, ly] = cells[cells.length - 1] ?? [f.wob.x, f.wob.y]; cells.push([lx + f.dx, ly + f.dy]); }
      cells.forEach(([cx, cy], i) => {
        if (i > q * cells.length) return;
        const [GX, GY] = px(cx, cy), over = i >= f.cells.length, w = CELL - 18;
        g.globalAlpha = over ? 0.95 : 0.55; rr(GX + 9, GY + 9, w, w, 5, fill); g.globalAlpha = 1;
        g.strokeStyle = over ? INK : 'rgba(29,31,46,.5)'; g.lineWidth = over ? 2.5 : 1.5; g.setLineDash(over ? [5, 3] : []); g.strokeRect(GX + 9, GY + 9, w, w); g.setLineDash([]);
        g.fillStyle = ink; circle(GX + CELL / 2, GY + CELL / 2, 4);
      });
    }
  }

  // Player (a friendly blob).
  const [PX, PY] = px(prev.player.x + (state.player.x - prev.player.x) * k, prev.player.y + (state.player.y - prev.player.y) * k);
  g.fillStyle = C.player; circle(PX + CELL / 2, PY + CELL / 2, CELL * 0.33);
  g.fillStyle = WHITE; for (const d of [-1, 1]) circle(PX + CELL / 2 + d * 9, PY + CELL / 2 - 5, 6);
  g.fillStyle = INK; for (const d of [-1, 1]) circle(PX + CELL / 2 + d * 9, PY + CELL / 2 - 4, 3);

  const w = fx.find(f => f.type === 'win');
  if (w && !reduced) for (let i = 0; i < 24; i++) { const t = (now - w.t0) / 1000, a = i * 0.26; if (t > 1.5) break;
    g.fillStyle = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'][i % 4]; g.fillRect(PX + CELL / 2 + Math.cos(a) * t * 160, PY + CELL / 2 + Math.sin(a) * t * 160 + t * t * 120, 7, 7); }
  requestAnimationFrame(draw);
}

// ---- input: keyboard, buttons, swipe ----
const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
const muteBtn = document.getElementById('mute');
function setMute(m) {
  muted = m; muteBtn.setAttribute('aria-pressed', m); muteBtn.classList.toggle('off', m);
  try { localStorage.setItem('mute', m ? '1' : '0'); } catch { /* fine */ }
}
addEventListener('keydown', e => {
  if (e.repeat) return; // one step per press: forgiving input
  if (KEYS[e.key]) { act(KEYS[e.key]); e.preventDefault(); }
  else if (e.key === 'z' || e.key === 'Backspace') undo();
  else if (e.key === 'r') load(lvlIdx);
  else if (e.key === 'm') setMute(!muted);
  else if (e.key === 'Enter' && won) load(lvlIdx + 1);
});
document.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => act(b.dataset.dir));
document.getElementById('undo').onclick = undo;
document.getElementById('restart').onclick = () => load(lvlIdx);
document.getElementById('next').onclick = () => load(lvlIdx + 1);
muteBtn.onclick = () => setMute(!muted);
setMute(muted);
let touch;
cv.addEventListener('touchstart', e => { touch = e.touches[0]; }, { passive: true });
cv.addEventListener('touchend', e => {
  const t = e.changedTouches[0], dx = t.clientX - touch.clientX, dy = t.clientY - touch.clientY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
});

load(Number(Q.get('level') ?? 1) - 1);
for (const c of Q.get('moves') ?? '') act({ u: 'up', d: 'down', l: 'left', r: 'right' }[c]); // QA: replay inputs
requestAnimationFrame(draw);
