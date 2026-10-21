// Board renderer: tiles, axes, blocks, doors, player; effects come from fx.js.
import { cv, g, CELL, PAD, reduced, TS, INK, WHITE, C, LANE, pal, px, ease, rr, circle, text, dotPos, face, door, gate, equation } from './look.js';
import { state, prev, orig, fx, fills, tMove } from './state.js';
import { drawFx, signBox, signPost } from './fx.js';
import { laneValues } from '../core/world.js';

// A number block, triple-coded: numeral + dot face + unit rod (length ∝ value) + Cuisenaire color.
// Designed on a 55px face; s scales it. 11-20 stay unit-for-unit: two ten-frames of dots, and the rod wraps onto a second row.
export function block(X, Y, n, s = 1, alpha = 1) {
  const [fill, ink] = pal(n), u = (CELL * 0.86 * s) / 55, f = face(n);
  g.save(); g.globalAlpha = alpha; g.translate(X + CELL / 2 - 27.5 * u, Y + CELL / 2 - 27.5 * u); g.scale(u, u);
  rr(0, 3, 55, 55, 10, 'rgba(0,0,0,.18)'); rr(0, 0, 55, 55, 10, fill);
  g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; if (n === 0) g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]);
  const big = n > 10;
  text(n, 27.5, big ? 9 : 13, big ? 14 : 19, ink);
  g.fillStyle = ink;
  for (let i = 0; i < n; i++) { const [x, y] = dotPos(i, 27.5, 27.5 + f.cy, f.sp); circle(x, y, f.r); }
  for (let i = 0; i < n; i++) g.fillRect(4.5 + (i % 10) * 4.6, big ? 44.5 + Math.floor(i / 10) * 4.5 : 44, 3.6, big ? 3.5 : 8);
  if (n === 0) { g.strokeStyle = ink; g.lineWidth = 1; g.setLineDash([2, 2]); g.strokeRect(4.5, 44, 46, 8); g.setLineDash([]); }
  g.restore();
}
export function opBlock(X, Y, op, s) { // round silhouette (numbers are square); thick + and − glyphs
  const cx = X + CELL / 2, cy = Y + CELL / 2, r = CELL * 0.4 * s;
  g.fillStyle = 'rgba(0,0,0,.18)'; circle(cx, cy + 3, r); g.fillStyle = C.op; circle(cx, cy, r);
  g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = INK; const L = r * 1.2, w = r * 0.32;
  if (op === '+') { rr(cx - L / 2, cy - w / 2, L, w, 3, INK); rr(cx - w / 2, cy - L / 2, w, L, 3, INK); }
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
    const p = from(o.id) ?? o, f = fx.find(f => f.wob && f.wob.x === o.x && f.wob.y === o.y && now - f.t0 < 400 * TS);
    let x = p.x + (o.x - p.x) * k, y = p.y + (o.y - p.y) * k, s = 1;
    if (f && !reduced) {
      const t = (now - f.t0) / 400;
      if (f.type === 'bounce') x += Math.sin((now - f.t0) / 25) * (f.reason === 'zero-fill' ? 0.04 : 0.08) * (1 - t);
      else s = 1 + 0.22 * Math.sin(Math.PI * t);
    }
    const [X, Y] = px(x, y);
    if (o.gate) gate(X, Y, lift(o));
    else if (o.kind === 'door') door(X, Y, o.value);
    else if (o.kind === 'op') opBlock(X, Y, o.op, s);
    else block(X, Y, o.value, s);
  }
  // A gate wedged open by whatever stands in it while its equation is false (the engine's own rule, not renderer math):
  // the bars come down onto the occupant, jagged and straining, frame solid — not the clean dashed look of a true gate.
  for (const o of state.objects) if (o.held) held(...px(o.x, o.y), now);
  for (const o of state.objects) if (o.kind === 'door' && typeof o.value === 'string') sign(o, vals);

  drawFx(now);

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
