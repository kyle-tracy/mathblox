// Board renderer: tiles, axes, blocks, doors, player; effects come from fx.js.
import { cv, g, CELL, PAD, reduced, TS, INK, WHITE, C, LANE, pal, px, ease, rr, circle, text, FONT, dotPos, face, door, gate, equation, rod, pebble, socketGlyph } from './look.js';
import { state, prev, orig, fx, fills, tMove, lastDir } from './state.js';
import { sprite, castUi } from './cast.js';
import { CHARACTERS } from '../levels/characters.js';
import { drawFx, signBox, signPost } from './fx.js';
import { laneValues } from '../core/world.js';
import { inside } from '../core/push.js';
import { parts, decimal } from '../core/value.js';

// A number block, triple-coded: numeral + dot face + unit rod (length ∝ value) + Cuisenaire color.
// Designed on a 55px face; s scales it. 11-20 stay unit-for-unit: two ten-frames of dots, and the rod wraps onto a second row.
// An anti-block (−n) is the same face punched out: a dent in n's colour rim, hollow dots and a hollow rod at the very spots
// n's dots and rod sit, so a 2 would drop into a −2's holes. An exact non-whole value (`show`: 'fraction' or 'decimal')
// shows its whole units plus one partial dot (a pie slice) and a partial rod segment, so length stays ∝ value.
export function block(X, Y, n, s = 1, alpha = 1, show) {
  const [p, q] = parts(n), neg = p < 0, m = Math.abs(p) / q, whole = Math.floor(m), part = m - whole, k = whole + (part > 0); // drawing only: how many dots
  const [fill, ink] = q > 1 ? [C.big, INK] : pal(whole), u = (CELL * 0.86 * s) / 55, f = face(k), big = k > 10;
  g.save(); g.globalAlpha = alpha; g.translate(X + CELL / 2 - 27.5 * u, Y + CELL / 2 - 27.5 * u); g.scale(u, u);
  if (neg) { rr(0, 0, 55, 55, 10, fill); rr(4, 4, 47, 47, 7, C.floor); rr(4, 4, 47, 5, 4, 'rgba(0,0,0,.2)'); } // sunken: shade at the top lip, no drop shadow
  else { rr(0, 3, 55, 55, 10, 'rgba(0,0,0,.18)'); rr(0, 0, 55, 55, 10, fill); }
  g.beginPath(); g.roundRect(0, 0, 55, 55, 10);
  g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; if (n === 0) g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]);
  const c = neg ? INK : ink, dot = (x, y, r, a = 1) => { // a full or partial unit dot: filled, or a ring with a slice outline when negative
    g.beginPath(); if (a < 1) g.moveTo(x, y); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + a * 2 * Math.PI); if (a < 1) g.closePath();
    if (neg) { g.lineWidth = 1.6; g.stroke(); } else g.fill();
    if (a < 1) { g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); } // the whole it is part of
  };
  if (k > 20) { text(label(n, show), 27.5, 27.5, 15, c); g.restore(); return; } // ponytail: dots stop at 20, like the teens
  if (show !== 'decimal' && q > 1 && !big) { // a stacked fraction: numerator over denominator
    text(String(p).replace('-', '−'), 27.5, 6.5, 10, c); g.fillStyle = c; g.fillRect(19, 12, 17, 1.6); text(q, 27.5, 18, 10, c);
  } else fitText(label(n, show), 27.5, big ? 9 : 13, big ? 14 : 19, c, 48);
  g.fillStyle = c; g.strokeStyle = c;
  for (let i = 0; i < k; i++) { const [x, y] = dotPos(i, 27.5, 27.5 + f.cy, f.sp); dot(x, y, f.r + (neg ? (big ? -0.5 : 0.3) : 0), i < whole ? 1 : part); }
  for (let i = 0; i < k; i++) {
    const x = 4.5 + (i % 10) * 4.6, y = big ? 44.5 + Math.floor(i / 10) * 4.5 : 44, w = 3.6 * (i < whole ? 1 : part), h = big ? 3.5 : 8;
    g.lineWidth = 1; if (neg) g.strokeRect(x + 0.5, y + 0.5, Math.max(1, w - 1), h - 1); else g.fillRect(x, y, w, h);
  }
  if (n === 0) { g.strokeStyle = ink; g.lineWidth = 1; g.setLineDash([2, 2]); g.strokeRect(4.5, 44, 46, 8); g.setLineDash([]); }
  g.restore();
}
// How a value reads: −2 with a true minus, 7/2, or 3.5 / 0.3̅ in 'decimal' mode (formatting lives in core/value.js).
export const label = (n, show) => String(show === 'decimal' ? decimal(n) : n).replace('-', '−');
function fitText(s, x, y, size, color, max) {
  g.font = `bold ${size}px ${FONT}`; const w = g.measureText(s).width;
  text(s, x, y, w > max ? size * max / w : size, color);
}
// An a×b platform: ONE body, shape[0] rows by shape[1] columns of unit cubes, one cube per board cell, every unit visible.
// No row totals, no "+": it is an array, never repeated addition. `rows` < shape[0] while a × is still laying rows down.
export function platform(X, Y, o, s = 1, rows = o.shape[0]) {
  const [h, w] = o.shape, [fill, ink] = pal(o.value), W = w * CELL, H = h * CELL;
  g.save(); g.translate(X + W / 2, Y + H / 2); g.scale(s, s); g.translate(-W / 2, -H / 2);
  rr(3, 6, W - 6, rows * CELL - 6, 10, 'rgba(0,0,0,.18)'); rr(3, 3, W - 6, rows * CELL - 6, 10, 'rgba(29,31,46,.55)');
  for (let y = 0; y < rows; y++) for (let x = 0; x < w; x++) {
    rr(x * CELL + 7, y * CELL + 7, CELL - 14, CELL - 14, 6, fill); g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = ink; circle(x * CELL + CELL / 2, y * CELL + CELL / 2 + 4, 4);
  }
  rr(W / 2 - 17, -6, 34, 22, 8, fill); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); text(o.value, W / 2, 5, 15, ink); // the value, once
  g.restore();
}
// Every number object goes through here: its attributes pick the picture, never its place.
export function piece(X, Y, o, s = 1, rows) {
  if (o.shape) platform(X, Y, o, s, rows);
  else if (o.tens) rod(X, Y, o.value, o.tens, s);
  else if (o.pebble) pebble(X, Y, s);
  else block(X, Y, o.value, s, 1, o.show);
}
export function opBlock(X, Y, op, s) { // round silhouette (numbers are square); thick + and − glyphs
  const cx = X + CELL / 2, cy = Y + CELL / 2, r = CELL * 0.4 * s;
  g.fillStyle = 'rgba(0,0,0,.18)'; circle(cx, cy + 3, r); g.fillStyle = C.op; circle(cx, cy, r);
  g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = INK; const L = r * 1.2, w = r * 0.32;
  if (op === '+') { rr(cx - L / 2, cy - w / 2, L, w, 3, INK); rr(cx - w / 2, cy - L / 2, w, L, 3, INK); }
  else if (op === '×') { g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4); rr(-L / 2, -w / 2, L, w, 3, INK); rr(-w / 2, -L / 2, w, L, 3, INK); g.restore(); }
  else if (op === '÷') { rr(cx - L / 2, cy - w / 2, L, w, 3, INK); circle(cx, cy - L * 0.36, w * 0.6); circle(cx, cy + L * 0.36, w * 0.6); } // a bar that splits two dots apart
  else rr(cx - L / 2, cy - w / 2, L, w, 3, INK); // symmetric bar: no arrow, so it never reads as a direction
}

export function sign(o, lanes) { // equations hang on a sign next to the door, every number with its own dots (goal readable before any bump)
  const [x, y, w, h, sz] = signBox(o);
  g.fillStyle = C.doorFrame; g.fillRect(...signPost(...px(o.x, o.y), x, y, w, h));
  rr(x, y, w, h, 6, C.sign); g.strokeStyle = C.doorFrame; g.lineWidth = 2; g.stroke();
  equation(o.value, x + w / 2, y + 13 * sz / 17, sz, INK, true, lanes);
}

// Lanes: a tinted stripe with hatching (rows —, columns |, so a crossing cell is cross-hatched: in both), plus a tag at the
// axis edge (rows at the y-axis side, columns at the x-axis side) reading "△ = 5" with dots, or "△ = ?".
function lanes(vals) {
  const H = state.tiles.length, W = state.tiles[0].length;
  Object.entries(state.lanes).forEach(([sym, { row, col }], i) => {
    const tint = LANE[i % LANE.length], isRow = row !== undefined;
    for (let k = 0; k < (isRow ? W : H); k++) {
      const x = isRow ? k : col, y = isRow ? row : k;
      if (state.tiles[y][x] === '#') continue;
      const [X, Y] = px(x, y);
      g.globalAlpha = 0.22; g.fillStyle = tint; g.fillRect(X, Y, CELL, CELL); g.globalAlpha = 0.55;
      for (let j = 1; j < 4; j++) g.fillRect(isRow ? X : X + j * 16 - 1, isRow ? Y + j * 16 - 1 : Y, isRow ? CELL : 2, isRow ? 2 : CELL);
      g.globalAlpha = 1;
    }
    const [X, Y] = px(isRow ? 0 : col, isRow ? row : H - 1), v = vals[sym], cx = X + CELL / 2;
    rr(X + 3, Y + 3, CELL - 6, CELL - 6, 8, tint); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    text(`${sym}=${Number.isNaN(v) ? '?' : v}`, cx, Y + 17, 15, INK);
    g.fillStyle = INK; const sp = v > 10 ? 5 : 7;
    if (!Number.isNaN(v)) for (let d = 0; d < v; d++) { const [dx, dy] = dotPos(d, cx, Y + 32, sp); circle(dx, dy, v > 10 ? 1.8 : 2.4); }
  });
}

function held(X, Y, now) {
  const j = reduced ? 0 : Math.sin(now / 35) * 1.2, h = CELL * 0.24; // bars stop a quarter of the way down, trembling
  g.strokeStyle = C.doorFrame; g.lineWidth = 3; g.strokeRect(X + 3, Y + 3, CELL - 6, CELL - 6);
  rr(X + 6, Y + 6, CELL - 12, 8, 3, C.door);
  for (const bx of [16, 29, 42]) { rr(X + bx + j, Y + 6, 6, h, 2, C.door); g.fillStyle = WHITE; g.fillRect(X + bx + 1 + j, Y + 6, 4, h - 4);
    g.fillStyle = C.door; g.beginPath(); g.moveTo(X + bx + j, Y + 6 + h); g.lineTo(X + bx + 3 + j, Y + 12 + h); g.lineTo(X + bx + 6 + j, Y + 6 + h); g.fill(); } // spikes press down
  g.strokeStyle = '#ffd166'; g.lineWidth = 2.5; // strain marks: zigzags at both jambs
  for (const sx of [X + 7, X + CELL - 7]) { g.beginPath(); for (let i = 0; i < 4; i++) g.lineTo(sx + (i % 2 ? 3 : -3), Y + 12 + i * 6); g.stroke(); }
}

export function tile(t, x, y, now) {
  const [X, Y] = px(x, y), o0 = orig.tiles[y][x];
  g.fillStyle = t === '#' ? C.wall : t === 'E' ? C.exit : C.floor; g.fillRect(X, Y, CELL, CELL);
  g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(X + 0.5, Y + 0.5, CELL, CELL);
  if (t === 'E') { // a block pushed into the exit: the star boings (the engine says 'wall'; state.js tags it 'exit')
    const f = fx.findLast(f => f.reason === 'exit' && f.at.x === x && f.at.y === y), q = f && !reduced ? (now - f.t0) / 400 : 1;
    const s = q < 1 ? 1 + 0.3 * Math.sin(Math.PI * q * 3) * (1 - q) : 1;
    g.save(); g.translate(X + CELL / 2, Y + CELL / 2); g.scale(s, 2 - s); text('★', 0, 0, CELL * 0.5, WHITE, false); g.restore();
  }
  if (o0 === 'o' || o0 === '_') { // a dug channel (o, brown) or an area pit (_, slate blue); neighbors join so a run reads as one hole, one unit per cell
    const was = (i, j) => orig.tiles[j]?.[i] === o0, e = 7, pit = o0 === '_';
    const x0 = X + (was(x - 1, y) ? 0 : e), x1 = X + CELL - (was(x + 1, y) ? 0 : e), y0 = Y + (was(x, y - 1) ? 0 : e), y1 = Y + CELL - (was(x, y + 1) ? 0 : e);
    g.fillStyle = pit ? C.pit : C.trench; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.fillStyle = pit ? C.pitDeep : C.trenchDeep; g.fillRect(x0, y0, x1 - x0, 5);
    const f = fills.get(`${x},${y}`), k = t === '.' && f ? (now - f.t) / (150 * TS) : -1;
    if (k >= 0) { // filled: the block's units now lie in the trench, one unit cube per cell
      const s = 1 + 0.3 * (1 - ease(k)), w = (CELL - 18) * s, [fill, ink] = pal(f.n);
      rr(X + CELL / 2 - w / 2, Y + CELL / 2 - w / 2, w, w, 5, fill); g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = ink; circle(X + CELL / 2, Y + CELL / 2, 4);
    } else { g.strokeStyle = pit ? '#9fc3dd' : '#c9a98a'; g.lineWidth = 2; g.setLineDash([5, 4]); g.strokeRect(X + 15, Y + 15, CELL - 30, CELL - 30); g.setLineDash([]); }
  }
  if (o0 === 'r') { // pivot post: a fat post with a turning arrow around it
    const cx = X + CELL / 2, cy = Y + CELL / 2;
    g.fillStyle = C.wall; circle(cx, cy, 11); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 21, -2.6, 1.9); g.stroke();
    const a = 1.9, ax = cx + 21 * Math.cos(a), ay = cy + 21 * Math.sin(a); g.fillStyle = INK;
    g.beginPath(); g.moveTo(ax - 8, ay - 3); g.lineTo(ax + 5, ay - 6); g.lineTo(ax + 1, ay + 7); g.fill();
  }
  if (o0 === 'b') { // bundle pad (it stays): ten loose units on it are tied into one rod
    rr(X + 6, Y + 6, CELL - 12, CELL - 12, 8, '#ffe1b3'); g.strokeStyle = '#b86e00'; g.lineWidth = 2; g.setLineDash([5, 3]); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#b86e00'; for (let i = 0; i < 10; i++) circle(X + 19 + (i % 2) * 7, Y + 14 + Math.floor(i / 2) * 9, 2.6);
    g.fillRect(X + 13, Y + 30, 20, 3); text('10', X + 45, Y + 32, 13, '#b86e00'); // the strap
  }
  if ('|vp'.includes(o0)) { // one-cell socket: a dark hole whose outline is the attribute it reads
    rr(X + 5, Y + 5, CELL - 10, CELL - 10, 8, C.hole);
    const f = fills.get(`${x},${y}`);
    if (t === '.' && f) piece(X, Y, o0 === '|' ? { value: 10, tens: 1 } : o0 === 'v' ? { value: 0 } : { value: 1, pebble: true }, 0.8); // plugged
    else socketGlyph(o0, X, Y);
  }
  if (o0 === '^') { // +1 pad; once used it stays as a grey dashed ring so you can see it is spent
    const cx = X + CELL / 2, cy = Y + CELL / 2;
    if (t === '^') { g.fillStyle = C.pad; circle(cx, cy, CELL * 0.36); g.strokeStyle = WHITE; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, CELL * 0.3, 0, 7); g.stroke();
      text('+1', cx, cy - 4, 17, WHITE); g.fillStyle = WHITE; circle(cx, cy + 12, 3.5); }
    else { g.strokeStyle = '#a99f8e'; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.arc(cx, cy, CELL * 0.33, 0, 7); g.stroke(); g.setLineDash([]); text('+1', cx, cy, 15, '#a99f8e'); }
  }
  if (t === '*') { // change pad: a floor medallion in the hero's colour, their prop in the middle (step on to become them)
    const id = state.pads[`${x},${y}`], cx = X + CELL / 2, cy = Y + CELL / 2;
    g.fillStyle = CHARACTERS[id]?.color ?? C.player; circle(cx, cy, CELL * 0.42);
    g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cy, CELL * 0.42, 0, 7); g.stroke();
    g.fillStyle = C.floor; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; circle(cx + Math.cos(a) * CELL * 0.36, cy + Math.sin(a) * CELL * 0.36, 2); }
    circle(cx, cy, CELL * 0.27); sprite(g, cx, cy, CELL * 1.05, id, 0, 'right', 0, true);
  }
}

// Brahmagupta's flip: the block turns over like a coin, showing its opposite on the way down.
function flip(o, X, Y, now) {
  const f = fx.findLast(f => f.type === 'negate' && f.at.x === o.x && f.at.y === o.y), q = f && !reduced ? (now - f.t0) / (300 * TS) : 1;
  if (q < 1) { g.translate(X + CELL / 2, 0); g.scale(Math.max(0.05, Math.abs(Math.cos(Math.PI * q))), 1); g.translate(-X - CELL / 2, 0); }
}

export function draw(now) {
  const H = state.tiles.length, W = state.tiles[0].length;
  g.fillStyle = C.floor; g.fillRect(0, 0, cv.width, cv.height);
  state.tiles.forEach((row, y) => [...row].forEach((t, x) => tile(t, x, y, now)));
  const vals = laneValues(state);
  lanes(vals);

  // Axes: a frame of reference only. y counts up from the bottom, like real math.
  g.strokeStyle = C.axis; g.fillStyle = C.axis; g.lineWidth = 2;
  g.beginPath(); g.moveTo(PAD, 0); g.lineTo(PAD, H * CELL); g.lineTo(cv.width, H * CELL); g.stroke();
  for (let x = 0; x < W; x++) { const X = PAD + x * CELL + CELL / 2; g.fillStyle = C.axis; g.fillRect(X - 1, H * CELL, 2, 6); text(x, X, H * CELL + 18, 13, C.axis, false); }
  for (let y = 0; y < H; y++) { const Y = (H - 1 - y) * CELL + CELL / 2; g.fillStyle = C.axis; g.fillRect(PAD - 6, Y - 1, 6, 2); text(y, PAD - 18, Y, 13, C.axis, false); }
  text('x', cv.width - 10, H * CELL + 34, 13, C.axis, false); text('y', 12, 10, 13, C.axis, false);

  // Slide objects from their previous cells.
  const k = reduced ? 1 : Math.min(1, (now - tMove) / 110);
  const from = id => prev.objects.find(o => o.id === id);
  const lift = o => { // gates lift their bars over 200 ms when they open, drop them when they close
    const f = fx.findLast(f => f.type === 'gate' && f.at.x === o.x && f.at.y === o.y), q = f ? ease((now - f.t0) / (200 * TS)) : 1;
    return o.open ? q : 1 - q;
  };
  const objs = [...state.objects].sort((a, b) => !!b.open - !!a.open); // open gates first: whatever stands in one draws on top
  for (const o of objs) {
    const sp = fx.find(f => f.ids?.includes(o.id)), p = from(o.id) ?? sp?.src ?? o; // spawned parts fan out from the operand
    const f = fx.find(f => f.wob && inside(o, f.wob.x, f.wob.y) && now - f.t0 < 400 * TS);
    let x = p.x + (o.x - p.x) * k, y = p.y + (o.y - p.y) * k, s = 1;
    if (f && !reduced) {
      const t = (now - f.t0) / 400;
      if (f.type === 'bounce') x += Math.sin((now - f.t0) / 25) * (f.reason === 'zero-fill' ? 0.04 : 0.08) * (1 - t);
      else s = 1 + 0.22 * Math.sin(Math.PI * t);
    }
    const [X, Y] = px(x, y);
    if (o.gate) gate(X, Y, lift(o));
    else if (o.kind === 'door') door(X, Y, o.value);
    else if (o.kind === 'op') { g.save(); flip(o, X, Y, now); opBlock(X, Y, o.op, s); g.restore(); }
    else {
      const rows = sp?.type === 'multiply' && o.shape && !reduced ? Math.max(1, Math.ceil(o.shape[0] * Math.min(1, (now - sp.t0) / (300 * TS)))) : undefined;
      const turn = fx.find(f => f.type === 'rotate' && f.at.x === o.x && f.at.y === o.y), q = turn && !reduced ? ease((now - turn.t0) / (250 * TS)) : 1;
      g.save(); if (q < 1) { g.translate(X + CELL / 2, Y + CELL / 2); g.rotate((q - 1) * Math.PI / 2); g.translate(-X - CELL / 2, -Y - CELL / 2); } // swings about its anchor
      flip(o, X, Y, now);
      piece(X, Y, o, s, rows); g.restore();
    }
  }
  // A gate wedged open by whatever stands in it while its equation is false (the engine's own rule, not renderer math):
  // the bars come down onto the occupant, jagged and straining, frame solid — not the clean dashed look of a true gate.
  for (const o of state.objects) if (o.held) held(...px(o.x, o.y), now);
  for (const o of state.objects) if (o.kind === 'door' && typeof o.value === 'string') sign(o, vals);

  drawFx(now);

  // Bodies you aren't playing: a touch faded, eyes front, breathing gently, so the one you control stands out.
  for (const b of state.others) { const [X, Y] = px(b.x, b.y); g.globalAlpha = 0.78;
    sprite(g, X + CELL / 2, Y + CELL / 2 + (reduced ? 0 : Math.sin(now / 500 + b.x + b.y) * 1.5), CELL * 0.94, b.id, reduced ? 0 : now, 'down'); g.globalAlpha = 1; }
  // Player: whoever is up. Pythagoras arcs over what he leaps; a swap pops a ring in the newcomer's colour.
  const dist = Math.abs(state.player.x - prev.player.x) + Math.abs(state.player.y - prev.player.y); // a slide travels, it doesn't teleport
  const kp = reduced ? 1 : Math.min(1, (now - tMove) / Math.min(450, 110 + 40 * Math.max(0, dist - 1)));
  const [PX, PY] = px(prev.player.x + (state.player.x - prev.player.x) * kp, prev.player.y + (state.player.y - prev.player.y) * kp);
  const leap = fx.findLast(f => f.type === 'leap'), lt = leap ? (now - leap.t0) / 110 : 1;
  const hop = !reduced && lt < 1 ? Math.sin(Math.PI * lt) * CELL * 0.6 : 0;
  const tw = leap ? Math.max(0, 1 - (now - leap.t0) / 900) : 0;
  sprite(g, PX + CELL / 2, PY + CELL / 2 - hop, CELL, state.mover, reduced ? 0 : now, lastDir, reduced ? 0 : tw);
  const ch = fx.findLast(f => f.type === 'change'), ct = ch ? (now - ch.t0) / 450 : 1;
  if (ct < 1 && !reduced) { g.globalAlpha = 1 - ct; g.fillStyle = ch.color; // a transform puff: six clouds burst out of the pad
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, r = CELL * (0.15 + 0.4 * ct); circle(PX + CELL / 2 + Math.cos(a) * r, PY + CELL / 2 + Math.sin(a) * r, CELL * 0.14 * (1 - ct * 0.5)); }
    g.globalAlpha = 1; }
  const sw = fx.findLast(f => f.type === 'swap'), st = sw ? (now - sw.t0) / 350 : 1;
  if (st < 1) { g.globalAlpha = 1 - st; g.strokeStyle = sw.color; g.lineWidth = 4;
    g.beginPath(); g.arc(PX + CELL / 2, PY + CELL / 2, CELL * (reduced ? 0.48 : 0.3 + 0.3 * st), 0, 7); g.stroke(); g.globalAlpha = 1; }
  castUi();

  const w = fx.find(f => f.type === 'win');
  if (w && !reduced) for (let i = 0; i < 24; i++) { const t = (now - w.t0) / 1000, a = i * 0.26; if (t > 1.5) break;
    g.fillStyle = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'][i % 4]; g.fillRect(PX + CELL / 2 + Math.cos(a) * t * 160, PY + CELL / 2 + Math.sin(a) * t * 160 + t * t * 120, 7, 7); }
  requestAnimationFrame(draw);
}
