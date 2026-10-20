// Effects layer: merge dots, carve chips, tick ring, door opening, and the lingering 'why' ghosts and scale.
import { g, CELL, INK, WHITE, C, PAL, pal, reduced, TS, px, ease, rr, circle, text, dotPos, slots, door, bubble, fitsOnDoor } from './look.js';
import { state, fx, objAt } from './state.js';

// Balance scale for a not-equal bump: the heavier side of the = sinks. sides come from the engine.
export function scale(f, now) {
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

export function drawFx(now) {
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
}
