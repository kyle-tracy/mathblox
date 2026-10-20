// Effects layer: merge dots, carve chips, tick ring, door opening, and the lingering 'why' ghosts and scale.
import { g, cv, CELL, INK, WHITE, C, pal, reduced, TS, px, ease, rr, circle, text, dotPos, face, slots, door, bubble, equation } from './look.js';
import { state, fx, objAt } from './state.js';
import { laneValues } from '../core/world.js';

// Where an equation door's sign hangs: above the door, unless that leaves the canvas or covers more blocks than below.
export function signBox(o) {
  const [X, Y] = px(o.x, o.y), lanes = laneValues(state), w = equation(o.value, 0, 0, 17, INK, false, lanes) + 16;
  const h = [...(o.value.match(/\d+/g) ?? []), ...Object.values(lanes)].some(n => n > 10) ? 54 : 40; // teens need a second ten-frame
  const x = Math.max(2, Math.min(cv.width - w - 2, X + CELL / 2 - w / 2));
  const cover = y => state.objects.filter(b => b !== o).filter(b => { // not the player: a sign must not hop as you walk past
    const [bx, by] = px(b.x, b.y); return x < bx + CELL && bx < x + w && y < by + CELL && by < y + h;
  }).length + (y < 0 || y + h > cv.height ? 99 : 0);
  const up = Y - h - 6, down = Y + CELL + 6;
  return [x, cover(up) <= cover(down) ? up : down, w, h];
}
const must = f => [[...px(f.wob.x, f.wob.y), CELL, CELL], [...px(state.player.x, state.player.y), CELL, CELL]];
// What a "why" bubble must not cover: every block, the player, and other doors' signs (the bumped door and its sign may be covered).
const avoid = at => [...state.objects.filter(o => o.x !== at.x || o.y !== at.y).map(o => [...px(o.x, o.y), CELL, CELL]),
  [...px(state.player.x, state.player.y), CELL, CELL],
  ...state.objects.filter(o => typeof o.value === 'string' && (o.x !== at.x || o.y !== at.y)).map(signBox)]; // its own sign may hide: the bubble says the same, live

// Balance scale for a not-equal bump: the heavier side of the = sinks. sides come from the engine.
// Balance scale for a not-equal bump: the heavier side of the = sinks. sides come from the engine.
// A side that can't be built yet (NaN: it would go below 0) is lighter than anything, so it rises. Never level.
export function scale(f, now) {
  const [X, Y] = px(f.at.x, f.at.y), [l, r] = f.sides;
  const [bx, by] = bubble(X, Y, 136, 104, avoid(f.at), must(f)), cx = bx + 68, py = by + 28;
  const k = reduced ? 1 : ease((now - f.t0) / 300), wob = reduced ? 0 : Math.sin((now - f.t0) / 45) * 0.08 * (1 - k);
  const wt = v => (Number.isNaN(v) ? -Infinity : v), both = Number.isNaN(l) && Number.isNaN(r);
  const th = (0.26 * (Math.sign(wt(r) - wt(l)) || 0)) * k + wob, L = 44;
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx, py); g.lineTo(cx - 9, by + 98); g.lineTo(cx + 9, by + 98); g.fill();
  g.save(); g.translate(cx, py); g.rotate(th); if (both) { g.setLineDash([6, 4]); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.stroke(); g.setLineDash([]); } else g.fillRect(-L, -2, 2 * L, 4); g.restore(); circle(cx, py, 4);
  [[l, -1], [r, 1]].forEach(([v, d]) => {
    const ex = cx + d * L * Math.cos(th), ey = py + d * L * Math.sin(th), pan = ey + 34;
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(ex - 20, pan); g.lineTo(ex, ey); g.lineTo(ex + 20, pan); g.stroke();
    g.beginPath(); g.arc(ex, pan, 20, 0, Math.PI); g.fillStyle = INK; g.fill(); // bowl
    if (Number.isNaN(v)) return text('?', ex, pan - 10, 15, INK);
    text(v, ex, pan + 9, 12, WHITE);
    g.fillStyle = INK; // every unit sits on the bowl as a dot, 5 to a row (teens too: no bundling before P3)
    for (let i = 0; i < v; i++) circle(ex + (i % 5 - 2) * 6.4, pan - 4 - Math.floor(i / 5) * 6.4, 2.5);
  });
}

// One drawer per effect type: (f, t = ms since the effect began, X/Y = pixel corner of f.at, now).
function merge(f, t, X, Y) { // a's dots fly over into the result, one at a time so they can be counted
  const [AX, AY] = px(f.from.x, f.from.y), [fill] = pal(f.from.value);
  for (let i = 0; i < f.n; i++) {
    const q = (t - 60 * TS - i * f.st * TS) / (180 * TS); if (q < 0 || q > 1) continue;
    const ff = face(f.from.value), e = ease(q), [dx0, dy0] = dotPos(i, 0, ff.cy, ff.sp);
    const x = AX + CELL / 2 + dx0 + (X - AX) * e, y = AY + CELL / 2 + dy0 + (Y - AY) * e - Math.sin(Math.PI * e) * 26;
    g.fillStyle = fill; circle(x, y, 6); g.fillStyle = INK; circle(x, y, 3.5);
  }
  if (t < 300 * TS) { const [OX, OY] = px(f.op.x, f.op.y), q = t / (300 * TS); g.fillStyle = `rgba(255,209,102,${1 - q})`; // operator pops into sparkles
    for (let i = 0; i < 8; i++) circle(OX + CELL / 2 + Math.cos(i * 0.785) * q * 30, OY + CELL / 2 + Math.sin(i * 0.785) * q * 30, 3.5); }
}

function carve(f, t, X, Y) {
  for (let i = 0; i < f.n; i++) { // chips fall away as pebbles
    const q = (t - i * f.st * TS) / (240 * TS); if (q < 0 || q > 1) continue;
    const m = f.from.value, ff = face(m), [dx0, dy0] = dotPos(m - f.n + i, 0, ff.cy, ff.sp); // the minuend's last n dots chip off
    g.fillStyle = `rgba(122,92,67,${1 - q})`; circle(X + CELL / 2 + dx0 * (1 + q), Y + CELL / 2 + dy0 + q * q * 44, ff.r + 1);
  }
}

function tickRing(f, t, X, Y) {
  if (t >= 500 * TS) return;
  const q = t / (500 * TS); g.globalAlpha = 1 - q;
  text('+1', X + CELL / 2, Y - 4 - q * 22, 20, C.pad); g.strokeStyle = C.pad; g.lineWidth = 3; g.beginPath(); g.arc(X + CELL / 2, Y + CELL / 2, CELL * (0.4 + q * 0.3), 0, 7); g.stroke(); g.globalAlpha = 1;
}

function open(f, t, X, Y) { // dots drop into the door's slots, then it slides open
  if (t >= 600 * TS) return;
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

// Bounce "why" ghosts, drawn in this order (a bounce can carry more than one).
function deficit(f, t, X, Y) { // deficit ghost: missing units as hollow dots, "why" in dots
  const rows = Math.ceil(f.missing / 5), [bx, by] = bubble(X, Y, 56, 14 + rows * 10, avoid(f.at), must(f));
  slots(f.missing, bx + 28, by + 12, 9.4, 3.5, INK);
}

function socket(f, t, X, Y) { // a door wants a number block: show the empty block-shaped hole
  const [bx, by] = bubble(X, Y, 60, 60, avoid(f.at), must(f));
  g.strokeStyle = INK; g.lineWidth = 2.5; g.setLineDash([6, 4]); g.beginPath(); g.roundRect(bx + 8, by + 8, 44, 44, 8); g.stroke(); g.setLineDash([]);
}

function zeroFill(f, t, X, Y) { // 0 is an object that fills 0 holes: an empty dashed rod lies over the trench
  const [bx, by] = bubble(X, Y, 128, 34, avoid(f.at), must(f));
  text('0 fills 0 holes', bx + 64, by + 17, 14, INK);
  g.strokeStyle = INK; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.strokeRect(X + 9, Y + CELL / 2 - 5, CELL - 18, 10); g.setLineDash([]);
}

function falseGates(f, t) { // exit refused: the false gates pulse (2 Hz)
  for (const [x, y] of f.falseGates) {
    const [GX, GY] = px(x, y), a = reduced ? 1 : 0.55 + 0.45 * Math.sin(t / 80);
    g.strokeStyle = `rgba(255,209,102,${a})`; g.lineWidth = 5; g.strokeRect(GX - 1, GY - 1, CELL + 2, CELL + 2);
  }
}

function tooLong(f, t) { // ghost rod: fits the trench, then `extra` units stick out
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

function bounceFx(f, t, X, Y, now) {
  if (f.missing) deficit(f, t, X, Y);
  if (f.sides && ['not-equal', 'gate'].includes(f.reason)) scale(f, now);
  if (f.reason === 'socket') socket(f, t, X, Y);
  if (f.reason === 'zero-fill') zeroFill(f, t, X, Y);
  if (f.reason === 'gates') falseGates(f, t);
  if (f.reason === 'too-long') tooLong(f, t);
}

const FX = { merge, carve, tick: tickRing, open, bounce: bounceFx };

export function drawFx(now) {
  for (const f of fx) {
    const t = now - f.t0, [X, Y] = f.at ? px(f.at.x, f.at.y) : [0, 0];
    FX[f.type]?.(f, t, X, Y, now);
  }
}
