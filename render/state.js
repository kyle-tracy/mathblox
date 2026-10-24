// Level selection, game state + undo history, and turning step() events into effects and sounds.
// Never computes a math result: every value comes from the state or the events step() returns.
import { step, parseLevel, DIRS } from '../core/world.js';
import { inside } from '../core/push.js';
import { LEVELS } from '../levels/levels.js';
import { CHARACTERS } from '../levels/characters.js';
import { SHOWCASE } from '../levels/showcase.js';
import { WORLDS } from '../levels/worlds.js';
import { cv, CELL, PAD } from './look.js';
import { tone, pitch, boing } from './audio.js';

export const Q = new URLSearchParams(location.search);
export const WORLD = WORLDS.find(w => w.id === Q.get('world') && w.levels.length); // ?world=id: that world's levels, in order
export const SET = Q.has('showcase') ? SHOWCASE : WORLD ? WORLD.levels.map(n => LEVELS.find(l => l.name === n)) : LEVELS;

// Finished worlds, kept in localStorage when it is there; the game runs without it (nothing is remembered).
export const getDone = () => { try { return JSON.parse(localStorage.getItem('mathblox.done')) ?? []; } catch { return []; } };
function markDone(id) { try { const d = getDone(); if (!d.includes(id)) localStorage.setItem('mathblox.done', JSON.stringify([...d, id])); } catch { /* no storage */ } }

export let lvlIdx = 0, state, prev, orig, history, fx = [], fills, tMove = 0, won = false, lastDir = 'right';

// Back to the Craft map at this world's door. Leaving early (Esc, ↩ map) marks nothing done.
export const leave = () => { if (WORLD) location.search = `?craft&from=${WORLD.id}`; };

export function load(i) {
  if (WORLD && i >= SET.length) return leave(); // world finished: back out of its door
  document.getElementById('map').hidden = !WORLD;
  lvlIdx = (i + SET.length) % SET.length;
  state = prev = orig = parseLevel(SET[lvlIdx]);
  history = []; fx = []; fills = new Map(); won = false;
  const H = state.tiles.length, W = state.tiles[0].length;
  cv.width = W * CELL + PAD; cv.height = H * CELL + PAD; fit();
  document.getElementById('name').textContent = `${lvlIdx + 1}. ${SET[lvlIdx].name}`;
  document.getElementById('next').hidden = true;
}

// Fit the board to the window by CSS scaling (drawing stays on the 64 px grid), never below 48 px cells.
// The bar sits beside the board on wide screens (index.html); these margins are calibration for that layout.
export function fit() {
  const wide = matchMedia('(min-aspect-ratio: 5/4)').matches;
  const k = Math.max(48 / CELL, Math.min(1, (innerWidth - 40 - (wide ? 150 : 0)) / cv.width, (innerHeight - 80 - (wide ? 0 : 150)) / cv.height));
  cv.style.width = `${cv.width * k}px`; cv.style.height = `${cv.height * k}px`;
}

// Restart is a move like any other: it goes onto the history, so Undo brings your board back.
export function restart() {
  if (state === orig) return;
  history.push(state); prev = state = orig; won = false; fx = []; tMove = 0;
  document.getElementById('next').hidden = true; tone(300, 0.08, 'sine', -150);
}

export function act(dir) {
  if (won) return;
  if (DIRS[dir]) lastDir = dir;
  fx = fx.filter(f => !f.linger); // ghosts and scales stay readable until the next move
  const before = state, r = step(state, dir);
  if (r.state !== state && r.events[0]?.type !== 'bounce') { history.push(state); prev = state; state = r.state; tMove = performance.now(); }
  for (const e of r.events) feedback(e, before);
}
export function undo() {
  if (!history.length) return;
  prev = state = history.pop(); won = false; fx = []; document.getElementById('next').hidden = true; tone(300, 0.08, 'sine', -150);
}

export const stagger = (n, total) => Math.min(40, total / Math.max(1, n)); // ms between counted dots; keeps effects ≤600ms

export const objAt = (s, x, y) => s.objects.find(o => inside(o, x, y)); // footprints; open gates still match
export const tileAt = (s, x, y) => s.tiles[y]?.[x] ?? '#';

export function feedback(e, before) {
  const t0 = performance.now(), [dx, dy] = DIRS[lastDir]; // bounces carry no dir: use the input's
  if (e.type === 'push') tone(110, 0.06, 'sine');
  // Characters: a swap pops; a negate flips (a note and its mirror); a leap is an octave, 2:1; a refused leap boings softly.
  if (e.type === 'swap' && before.others?.length) prev = state; // control jumps to another body: no slide across the board
  if (e.type === 'change') { fx.push({ type: 'change', t0, color: CHARACTERS[e.mover]?.color ?? '#ef476f' }); tone(300, 0.22, 'sine', 500); [12, 16, 19].forEach((n, i) => tone(pitch(n), 0.06, 'triangle', 0, 0.12 + i * 0.05)); }
  if (e.type === 'swap') { fx.push({ type: 'swap', t0, color: CHARACTERS[e.mover]?.color ?? '#ef476f' }); tone(520, 0.05, 'sine', 260); tone(780, 0.06, 'triangle', 0, 0.05); }
  if (e.type === 'negate') { fx.push({ type: 'negate', at: e.at, t0, wob: e.at }); tone(pitch(7), 0.1, 'triangle', -120); tone(pitch(0), 0.12, 'triangle', 120, 0.1); }
  if (e.type === 'leap') { fx.push({ type: 'leap', t0 }); tone(pitch(0), 0.12, 'sine'); tone(pitch(12), 0.2, 'sine', 0, 0.1); }
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
  if (e.type === 'multiply' || e.type === 'share') { // spawned blocks fan out from the left operand's cell; ids[0] slides from the right's
    const src = before.objects.find(o => o.kind === 'num' && !state.objects.some(s => s.id === o.id)), n = e.ids.length;
    fx.push({ type: e.type, at: e.at, ids: e.ids, src, t0 });
    if (e.type === 'multiply') { const [r] = state.objects.find(o => o.id === e.ids[0]).shape ?? [1]; // one note per row as the rows lay down
      for (let i = 0; i < r; i++) tone(pitch(i * 3), 0.07, 'triangle', 0, i * 0.07); tone(pitch(e.value), 0.18, 'sine', 0, r * 0.07); }
    else for (let i = 0; i < n; i++) tone(pitch(12 - i), 0.05, 'triangle', 0, i * 0.04); // a fair-share patter, falling
  }
  if (e.type === 'rotate') { fx.push({ type: 'rotate', at: e.at, t0, wob: e.at }); tone(pitch(e.value), 0.12, 'sine', 120); }
  if (e.type === 'bundle') { fx.push({ type: 'bundle', at: e.at, t0, wob: e.at }); for (let i = 0; i < 10; i++) tone(pitch(i), 0.03, 'square', 0, i * 0.02); tone(pitch(17), 0.12, 'triangle', 0, 0.22); }
  if (e.type === 'pit') e.cells.forEach(([x, y], i) => { fills.set(`${x},${y}`, { n: e.value, t: t0 + i * 25 }); tone(pitch(i), 0.05, 'sine', 0, i * 0.025); });
  if (e.type === 'socket') { fills.set(`${e.at.x},${e.at.y}`, { n: e.value, t: t0 }); [0, 7].forEach(n => tone(pitch(e.value + n), 0.2, 'sine')); }
  if (e.type === 'tick') { fx.push({ type: 'tick', at: e.at, t0, wob: e.at }); tone(pitch(e.value), 0.08, 'triangle', 300); }
  if (e.type === 'fill') {
    const [dx, dy] = DIRS[e.dir], st = stagger(e.value, 400);
    for (let i = 0; i < e.value; i++) {
      fills.set(`${e.at.x + dx * i},${e.at.y + dy * i}`, { n: e.value, t: t0 + i * st });
      tone(pitch(i * 2), 0.05, 'sine', 0, i * st / 1000);
    }
  }
  const exit = e.type === 'bounce' && e.reason === 'wall' && tileAt(state, e.at.x, e.at.y) === 'E'; // a block pushed into E
  if (e.type === 'bounce' && (e.reason !== 'wall' || exit)) {
    if (e.reason === 'leap') tone(200, 0.16, 'sine', 70); else boing(); if (e.reason === 'storm') tone(520, 0.6, 'sine', -400, 0.08); // a silly wind-down whoosh, never a buzzer
    const wob = objAt(state, e.at.x, e.at.y) || e.reason === 'leap' ? e.at : { x: e.at.x - dx, y: e.at.y - dy }; // a leap never wobbles what it jumps over
    const f = { ...e, t0, wob, linger: !exit, ...(exit && { reason: 'exit' }) };
    if (e.reason === 'too-long') { // trench cells it would cover, read from tiles; the event says how much sticks out
      f.n = objAt(state, wob.x, wob.y)?.value ?? 0; f.cells = [];
      for (let x = e.at.x, y = e.at.y; tileAt(state, x, y) === 'o' && !objAt(state, x, y); x += dx, y += dy) f.cells.push([x, y]);
      f.dx = dx; f.dy = dy;
    }
    fx.push(f);
  }
  if (e.gate) { // gates stay on the board: bars lift (consonant fifth: the sides balance) or drop (a soft step down)
    fx.push({ type: 'gate', at: e.at, t0 });
    if (e.type === 'open') [0, 7].forEach(n => tone(pitch(e.sides[0] + 12 + n), 0.3, 'sine'));
    else { tone(pitch(10), 0.1, 'triangle'); tone(pitch(5), 0.14, 'triangle', 0, 0.1); }
    return;
  }
  if (e.type === 'open') {
    const door = objAt(before, e.at.x, e.at.y), st = stagger(e.value, 300);
    fx.push({ type: 'open', at: e.at, n: e.value, spec: door.value, st, t0 });
    for (let i = 0; i < e.value; i++) tone(pitch(i * 2 + 7), 0.06, 'sine', 0, i * st / 1000);
    [0, 7].forEach(n => tone(pitch(e.value + 12 + n), 0.3, 'sine', 0, 0.42)); // balanced: a consonant fifth
  }
  if (e.type === 'win') {
    won = true; if (WORLD && lvlIdx === SET.length - 1) markDone(WORLD.id);
    [0, 4, 7, 12].forEach((n, i) => tone(pitch(n + 12), 0.18, 'triangle', 0, i * 0.12));
    fx.push({ type: 'win', t0 }); document.getElementById('next').hidden = false;
  }
}
