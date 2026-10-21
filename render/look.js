// Canvas, palette and drawing primitives shared by every render module. Look and timings: docs/style-guide.md.
export const cv = document.getElementById('c'), g = cv.getContext('2d');
export const CELL = 64, PAD = 44; // PAD leaves room for the axes
// Reduced motion: effects run at half length, nothing shakes, dots still move. The in-game toggle (persisted) beats the OS setting.
export let reduced, TS;
const motionBtn = document.getElementById('motion');
export function setReduced(r, save = true) { // only the button saves: until then the OS setting rules
  reduced = r; TS = r ? 0.5 : 1; motionBtn.setAttribute('aria-pressed', r);
  if (save) try { localStorage.setItem('reduced', r ? '1' : '0'); } catch { /* fine */ }
}
let stored = null; try { stored = localStorage.getItem('reduced'); } catch { /* storage may be blocked */ }
setReduced(stored ? stored === '1' : matchMedia('(prefers-reduced-motion: reduce)').matches, false);
export const FONT = 'Verdana, "DejaVu Sans", sans-serif'; // 1 has a base, 7 has none; 6/9 open and distinct
export const INK = '#1d1f2e', WHITE = '#ffffff';
export const C = { floor: '#f4efe4', wall: '#5b6475', grid: '#e2dacb', axis: '#3a3f4b', op: '#dfe3ea', door: '#5b3aa8',
  doorFrame: '#3e2777', exit: '#06d6a0', player: '#ef476f', trench: '#7a5c43', trenchDeep: '#5a4231',
  pad: '#1f7a6d', sign: '#f1e2c2', big: '#efe9dc', pit: '#2f5d7c', pitDeep: '#244a63', hole: '#3a3f4b' };
// Lane tints (by declaration order): a hue family the value palette doesn't use. Never the only cue: rows hatch —, columns hatch |.
export const LANE = ['#3fb8c9', '#c77dff', '#e0a43a'];
// Cuisenaire-inspired, checked for deuteranopia/protanopia/tritanopia (min ΔE ≥ 12). [fill, ink]; index = value.
export const PAL = [['#e9e5dc', INK], ['#fbfaf5', INK], ['#f4826a', INK], ['#9be08a', INK], ['#e7a6dc', INK], ['#f7e35a', INK],
  ['#24785a', WHITE], ['#3d4152', WHITE], ['#8a5a2b', WHITE], ['#4f9be8', INK], ['#ff9f1c', INK]];
export const pal = n => (n <= 10 ? PAL[n] : [C.big, INK]);

export const px = (x, y) => [PAD + x * CELL, y * CELL];
export const ease = t => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
export function rr(x, y, w, h, r, fill) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); }
export function circle(x, y, r) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
export function text(s, x, y, size, color, bold = true) {
  g.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y);
}
// Ten-frame dot position (5-structure: 6 = a full row of 5 + 1). Dyscalculia-friendly, never random.
// Dots 10-19 sit in a second ten-frame, a little apart: teens are drawn unit-for-unit (no bundling before P3).
export const dotPos = (i, cx, cy, sp) => [cx + (i % 5 - 2) * sp, cy + Math.floor(i / 5) * sp + Math.floor(i / 10) * sp * 0.35];
// Dot layout on a block face, relative to the cell centre. Shared by block() and the merge/carve effects so flying dots start on visible dots.
export const face = n => (n > 10 ? { cy: -8, sp: 6.2, r: 2.5 } : { cy: 0.5, sp: 9.4, r: 3.5 });
// ponytail: two ten-frames stop at 20; P3 bundling replaces this before any level passes 20.
export function slots(n, cx, cy, sp, r, color, filled = 0) { // hollow dots: a door wants exactly n; deficit ghost
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 2;
  for (let i = 0; i < n; i++) { const [x, y] = dotPos(i, cx, cy, sp); g.beginPath(); g.arc(x, y, r, 0, 7); i < filled ? g.fill() : g.stroke(); }
}

// Equations: tokens drawn left to right; □ is the hollow box your block fills. Returns width.
// With dots (signs), each number shows its own dots under it, each lane shape its live total: no sums are computed here.
const DS = 5.2; // sign dot spacing
const tokens = spec => spec.replace(/\s/g, '').match(/\d+|./gu).map(c => (c === '-' ? '−' : c));
export function equation(spec, cx, cy, size, color, draw = true, lanes = null) {
  const toks = tokens(spec), gap = size * 0.2;
  g.font = `bold ${size}px ${FONT}`;
  const dotsOf = c => (/\d/.test(c) ? +c : lanes && c in lanes ? lanes[c] : null);
  const ws = toks.map(c => Math.max(c === '□' ? size * 0.8 : g.measureText(c).width, lanes && dotsOf(c) ? Math.min(5, dotsOf(c)) * DS + 2 : 0));
  const W = ws.reduce((a, b) => a + b + gap, -gap);
  if (!draw) return W;
  let x = cx - W / 2;
  toks.forEach((c, i) => {
    const mx = x + ws[i] / 2;
    if (c === '□') { g.strokeStyle = color; g.lineWidth = 2; g.strokeRect(x + 1, cy - size * 0.38, ws[i] - 2, size * 0.76); }
    else text(c, mx, cy + 1, size, color);
    const n = lanes ? dotsOf(c) : null;
    if (Number.isNaN(n)) text('?', mx, cy + size * 0.95, size * 0.75, color);
    else if (n) { g.fillStyle = color; for (let k = 0; k < n; k++) { const [dx, dy] = dotPos(k, mx, cy + size * 0.85, DS); circle(dx, dy, 2); } }
    x += ws[i] + gap;
  });
  return W;
}

export function door(X, Y, spec, filled = 0) {
  rr(X + 2, Y + 2, CELL - 4, CELL - 4, 6, C.doorFrame); rr(X + 6, Y + 6, CELL - 12, CELL - 12, 4, C.door);
  const cx = X + CELL / 2;
  if (typeof spec === 'number') { text(spec, cx, Y + 20, 18, WHITE); slots(spec, cx, Y + 37, 9.4, 3.5, WHITE, filled); }
  else { g.strokeStyle = WHITE; g.lineWidth = 2.5; g.strokeRect(cx - 11, Y + CELL / 2 - 11, 22, 22); } // big □: read the sign
}
// A gate opens itself (no □): portcullis bars that lift by `lift` (0 shut .. 1 open). Open = recessed frame, floor shows through.
export function gate(X, Y, lift) {
  g.globalAlpha = 1 - 0.75 * lift; rr(X + 2, Y + 2, CELL - 4, CELL - 4, 6, C.doorFrame); g.globalAlpha = 1;
  g.fillStyle = `rgba(29,31,46,${0.25 - 0.17 * lift})`; g.fillRect(X + 6, Y + 6, CELL - 12, CELL - 12); // recess: open = floor shows through
  const h = (CELL - 12) * (1 - lift * 0.8);
  g.save(); g.beginPath(); g.rect(X + 6, Y + 6, CELL - 12, CELL - 12); g.clip();
  rr(X + 6, Y + 6, CELL - 12, h, 3, C.door);
  g.fillStyle = WHITE; for (const bx of [16, 29, 42]) g.fillRect(X + bx + 1, Y + 6, 4, h - 3); g.fillRect(X + 8, Y + 6 + h - 7, CELL - 16, 3);
  g.restore();
  g.strokeStyle = C.doorFrame; g.lineWidth = 2; g.setLineDash(lift > 0.5 ? [5, 3] : []); g.strokeRect(X + 3, Y + 3, CELL - 6, CELL - 6); g.setLineDash([]);
}
// White speech plate next to a cell. Tries above, below, right, left and takes the first spot that stays on the canvas and
// covers the fewest `avoid` rects ([x, y, w, h]: blocks, the player, signs), so a "why" never hides the piece it is about.
// `must` rects (the bumped block, the player) weigh 50 each: covering them is a last resort, only when every spot does.
export function bubble(X, Y, w, h, avoid = [], must = []) {
  const clampX = x => Math.max(2, Math.min(cv.width - w - 2, x)), clampY = y => Math.max(2, Math.min(cv.height - h - 2, y));
  const cands = [[clampX(X + CELL / 2 - w / 2), Y - h - 4], [clampX(X + CELL / 2 - w / 2), Y + CELL + 4],
    [X + CELL + 4, clampY(Y + CELL / 2 - h / 2)], [X - w - 4, clampY(Y + CELL / 2 - h / 2)]];
  const n = (rs, [x, y]) => rs.filter(([ax, ay, aw, ah]) => x < ax + aw && ax < x + w && y < ay + ah && ay < y + h).length;
  const hit = c => n(avoid, c) + 50 * n(must, c) + (c[0] < 0 || c[1] < 0 || c[0] + w > cv.width || c[1] + h > cv.height ? 999 : 0);
  const [bx, by] = cands.reduce((best, c) => (hit(c) < hit(best) ? c : best));
  rr(bx, by, w, h, 8, 'rgba(255,255,255,.94)'); g.strokeStyle = 'rgba(29,31,46,.35)'; g.lineWidth = 1.5; g.stroke();
  return [bx, by];
}

// P3 pieces. A ten-rod is one body: a single 10-long bar (one notch per unit) in 10's colour, the loose ones beside it.
// ponytail: `tens` rods + leftover cubes fit one cell up to 29; place value (P6) needs a real flat.
export function rod(X, Y, value, tens, s = 1) {
  g.save(); g.translate(X + CELL / 2, Y + CELL / 2); g.scale(s, s); g.translate(-CELL / 2, -CELL / 2);
  rr(4, 7, 56, 55, 10, 'rgba(0,0,0,.18)'); rr(4, 4, 56, 55, 10, PAL[1][0]); g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; g.stroke();
  for (let i = 0; i < tens; i++) bar(10 + i * 13, 8, 10, 48, PAL[10][0]);
  g.fillStyle = INK; const ones = value - 10 * tens; // the leftover units, drawn loose: they are not bundled
  for (let i = 0; i < ones; i++) g.fillRect(12 + tens * 13 + Math.floor(i / 5) * 8, 50 - (i % 5) * 7, 6, 6);
  text(value, 47, 15, 14, INK);
  g.restore();
}
export function bar(x, y, w, h, fill, dash = false, ink = INK) { // a rod of 10 unit segments
  g.lineWidth = 1.5; g.strokeStyle = ink;
  if (dash) g.setLineDash([3, 2]); else { g.fillStyle = fill; g.fillRect(x, y, w, h); }
  g.strokeRect(x, y, w, h); for (let k = 1; k < 10; k++) { g.beginPath(); g.moveTo(x, y + k * h / 10); g.lineTo(x + w, y + k * h / 10); g.stroke(); }
  g.setLineDash([]);
}
// A pebble: a remainder unit, loose. Round (not square like a plain 1) so the silhouette alone tells them apart.
export function pebble(X, Y, s = 1, dash = false) {
  const cx = X + CELL / 2, cy = Y + CELL / 2;
  g.save(); g.translate(cx, cy); g.scale(s, s);
  if (!dash) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 4, 18, 14, 0, 0, 7); g.fill(); g.fillStyle = PAL[1][0]; }
  g.beginPath(); g.ellipse(0, 0, 18, 14, 0, 0, 7); if (!dash) g.fill();
  g.strokeStyle = INK; g.lineWidth = 2; if (dash) g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]);
  if (!dash) { text(1, 0, -5, 12, INK); g.fillStyle = INK; circle(0, 6, 3); }
  g.restore();
}
// The hole a one-cell socket shows is the one attribute it reads: '|' the rod's shape, 'v' the value 0, 'p' a pebble.
export function socketGlyph(ch, X, Y, ink = WHITE) {
  const cx = X + CELL / 2, cy = Y + CELL / 2;
  g.strokeStyle = ink; g.fillStyle = ink;
  if (ch === '|') bar(cx - 5, Y + 8, 10, CELL - 16, null, true, ink);
  if (ch === 'v') { g.lineWidth = 2; g.setLineDash([4, 3]); g.strokeRect(cx - 17, cy - 17, 34, 34); g.setLineDash([]); text(0, cx, cy + 1, 20, ink); }
  if (ch === 'p') { g.lineWidth = 2; g.setLineDash([4, 3]); g.beginPath(); g.ellipse(cx, cy, 18, 14, 0, 0, 7); g.stroke(); g.setLineDash([]); circle(cx, cy, 3); }
}
