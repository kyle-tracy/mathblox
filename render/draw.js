// Board renderer: tiles, axes, blocks, doors, player; effects come from fx.js.
import { cv, g, CELL, PAD, reduced, TS, INK, WHITE, C, PAL, pal, px, ease, rr, circle, text, dotPos, door, fitsOnDoor, equation } from './look.js';
import { state, prev, orig, fx, fills, tMove } from './state.js';
import { drawFx } from './fx.js';

// A number block, triple-coded: numeral + dot face + unit rod (length ∝ value) + Cuisenaire color.
// Designed on a 55px face; s scales it. Above 10: ones as dots, each ten as a notched ten-rod.
export function block(X, Y, n, s = 1, alpha = 1) {
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
export function opBlock(X, Y, op, s) { // round silhouette (numbers are square); thick + and − glyphs
  const cx = X + CELL / 2, cy = Y + CELL / 2, r = CELL * 0.4 * s;
  g.fillStyle = 'rgba(0,0,0,.18)'; circle(cx, cy + 3, r); g.fillStyle = C.op; circle(cx, cy, r);
  g.strokeStyle = 'rgba(29,31,46,.6)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = INK; const L = r * 1.2, w = r * 0.32;
  if (op === '+') { rr(cx - L / 2, cy - w / 2, L, w, 3, INK); rr(cx - w / 2, cy - L / 2, w, L, 3, INK); }
  else rr(cx - L / 2, cy - w / 2, L, w, 3, INK); // symmetric bar: no arrow, so it never reads as a direction
}

export function sign(X, Y, spec) { // long equations hang on a sign above the door (below if the door is on the top row)
  const w = equation(spec, 0, 0, 17, INK, false) + 16, cx = X + CELL / 2, up = Y >= 34, sy = up ? Y - 32 : Y + CELL + 4;
  g.fillStyle = C.doorFrame; g.fillRect(cx - 2, up ? sy + 26 : Y + CELL - 2, 4, 8);
  rr(cx - w / 2, sy, w, 28, 6, C.sign); g.strokeStyle = C.doorFrame; g.lineWidth = 2; g.stroke();
  equation(spec, cx, sy + 14, 17, INK);
}

export function tile(t, x, y, now) {
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

export function draw(now) {
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
