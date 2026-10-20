// Canvas, palette and drawing primitives shared by every render module. Look and timings: docs/style-guide.md.
export const cv = document.getElementById('c'), g = cv.getContext('2d');
export const CELL = 64, PAD = 44; // PAD leaves room for the axes
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const TS = reduced ? 0.5 : 1; // reduced motion: effects run at half length, nothing shakes, dots still move
export const FONT = 'Verdana, "DejaVu Sans", sans-serif'; // 1 has a base, 7 has none; 6/9 open and distinct
export const INK = '#1d1f2e', WHITE = '#ffffff';
export const C = { floor: '#f4efe4', wall: '#5b6475', grid: '#e2dacb', axis: '#3a3f4b', op: '#dfe3ea', door: '#5b3aa8',
  doorFrame: '#3e2777', exit: '#06d6a0', player: '#ef476f', trench: '#7a5c43', trenchDeep: '#5a4231',
  pad: '#1f7a6d', sign: '#f1e2c2', big: '#efe9dc' };
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
export const dotPos = (i, cx, cy, sp) => [cx + (i % 5 - 2) * sp, cy + Math.floor(i / 5) * sp];
export function slots(n, cx, cy, sp, r, color, filled = 0) { // hollow dots: a door wants exactly n; deficit ghost
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 2;
  for (let i = 0; i < n; i++) { const [x, y] = dotPos(i, cx, cy, sp); g.beginPath(); g.arc(x, y, r, 0, 7); i < filled ? g.fill() : g.stroke(); }
}

// Equations: tokens drawn left to right; □ is the hollow box your block fills. Returns width.
export function equation(spec, cx, cy, size, color, draw = true) {
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
export const fitsOnDoor = spec => typeof spec === 'number' || equation(spec, 0, 0, 13, WHITE, false) <= CELL - 8;

export function door(X, Y, spec, filled = 0) {
  rr(X + 2, Y + 2, CELL - 4, CELL - 4, 6, C.doorFrame); rr(X + 6, Y + 6, CELL - 12, CELL - 12, 4, C.door);
  const cx = X + CELL / 2;
  if (typeof spec === 'number') { text(spec, cx, Y + 20, 18, WHITE); slots(spec, cx, Y + 37, 9.4, 3.5, WHITE, filled); }
  else if (fitsOnDoor(spec)) equation(spec, cx, Y + CELL / 2, 13, WHITE);
  else { g.strokeStyle = WHITE; g.lineWidth = 2.5; g.strokeRect(cx - 11, Y + CELL / 2 - 11, 22, 22); } // big □: read the sign
}
export function bubble(X, Y, w, h, above = 0) { // white speech plate over a cell, flipped below if it would leave the canvas
  const by = Y - above - h - 4 >= 0 ? Y - above - h - 4 : Y + CELL + 4, bx = Math.max(2, Math.min(cv.width - w - 2, X + CELL / 2 - w / 2));
  rr(bx, by, w, h, 8, 'rgba(255,255,255,.94)'); g.strokeStyle = 'rgba(29,31,46,.35)'; g.lineWidth = 1.5; g.stroke();
  return [bx, by];
}
