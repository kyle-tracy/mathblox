// Push resolution for core/world.js move(): what a pushed chain does when it calculates, meets a door, or fills a trench.
// Pure, no DOM. Imports only math.js (no cycle with world.js); `lanes` is laneValues(s), passed in by the caller.
import { isNat } from './value.js';
import { apply, accepts, sides, tick, rotate, bundle, SOCKETS } from './math.js';

export const tileAt = (s, x, y) => s.tiles[y]?.[x] ?? '#';
export const setTile = (s, x, y, ch) => { s.tiles[y] = s.tiles[y].slice(0, x) + ch + s.tiles[y].slice(x + 1); };
// A platform covers shape [rows, cols] from its top-left anchor; everything else is one cell.
export const inside = (o, x, y) => (o.shape ? x >= o.x && x < o.x + o.shape[1] && y >= o.y && y < o.y + o.shape[0] : o.x === x && o.y === y);
export const cells = o => { const [h, w] = o.shape ?? [1, 1], c = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) c.push([o.x + x, o.y + y]); return c; };
export const objAt = (s, x, y) => s.objects.find(o => !o.open && inside(o, x, y)); // open gates are passable
export const extent = (o, dx) => (o.shape ? o.shape[dx ? 1 : 0] : 1); // cells along the push line
// The cells a body moves into: its own footprint shifted one step, minus itself.
export const face = (o, dx, dy) => cells(o).map(([x, y]) => [x + dx, y + dy]).filter(([x, y]) => !inside(o, x, y));
const floor = t => t === '.' || t === 'b'; // where a body may stand
const free = (s, cs, ok = () => false) => cs.every(([x, y]) => floor(tileAt(s, x, y)) && (!objAt(s, x, y) || ok(objAt(s, x, y))) && (s.player.x !== x || s.player.y !== y));
// Replace a block's math attributes with a fresh block from math.js; id, kind and place stay.
const remake = (o, b) => { delete o.shape; delete o.tens; delete o.pebble; delete o.show; return Object.assign(o, b); };
export const bounce = (state, reason, at, extra) => ({ state, events: [{ type: 'bounce', reason, at, ...extra }] });

// Helpers below mutate the clone `s` and the `chain`; every bounce returns the untouched `state`.
// [a][op][b] pushed together always calculates, operands in READING order (left->right, top->bottom).
// A longer line resolves one triple per push, chosen by standard precedence (below).
// The result grows from where the operands were: it fills
// their cells from the reading-first operand on, and any extra cells (÷ pebbles, Voids, wide
// platforms) extend along the push line away from the player. move() then steps the player in if free.
export function resolveChain(state, s, chain, dx, dy) {
  let k = 0;
  while (chain[k]?.kind === (k % 2 ? 'op' : 'num')) k++;
  if (k % 2 === 0) k--;
  if (k < 3) return null;
  // Scientific-calculator precedence: × ÷ before + −. Within that level, − or ÷ needs reading order
  // (reading-first triple); a pure + or × level is commutative, so the triple nearest the player goes first.
  const rev = dx < 0 || dy < 0, line = rev ? chain.slice(0, k).reverse() : chain.slice(0, k); // reading order
  const prec = o => (o?.kind === 'op' ? ('×÷'.includes(o.op) ? 2 : 1) : 0);
  const top = Math.max(...line.map(prec)), cand = line.flatMap((o, j) => (prec(o) === top ? [j] : []));
  const j = cand.some(i => '-÷'.includes(line[i].op)) || !rev ? cand[0] : cand.at(-1);
  const [l, op, rr] = line.slice(j - 1, j + 2);
  // Operators just outside the triple (in reading order) must not change its meaning: 8 − 1 − 1 never becomes
  // 8 − (1 − 1), and 2 + 3 × (gap) 4 never becomes (2 + 3) × 4. If they would, the line just slides.
  const pb = j > 1 ? line[j - 2] : rev && chain[k], pa = j + 2 < line.length ? line[j + 2] : !rev && chain[k];
  if (prec(pb) === prec(op) && !('+×'.includes(op.op) && pb.op === op.op) || prec(pb) > prec(op)) return null;
  if (prec(pa) > prec(op)) return null;
  const r = apply(op.op, l, rr, s.div);
  if (!r.ok) return bounce(state, r.reason, { x: rr.x, y: rr.y }, { missing: r.missing });
  const operands = [l.value, rr.value];
  s.objects = s.objects.filter(o => o !== l && o !== op && o !== rr);
  // Along the line: the triple spans lo..hi (l is always at lo); across it, blocks grow toward +x / +y.
  const lo = dx ? l.x : l.y, hi = (dx ? rr.x : rr.y) + extent(rr, dx) - 1;
  const len = r.out.reduce((t, b) => t + ((dx ? b.shape?.[1] : b.shape?.[0]) ?? 1), 0);
  let at = rev ? Math.min(lo, hi - len + 1) : lo, id = Math.max(...state.objects.map(o => o.id)) + 1;
  const cx = dx ? null : state.player.x, cy = dx ? state.player.y : null;
  const made = r.out.map((b, i) => {
    const o = { id: i ? id++ : rr.id, x: cx ?? at, y: cy ?? at, kind: 'num', ...b };
    at += extent(o, dx);
    return o;
  });
  const all = made.flatMap(cells);
  if (!free(s, all)) return bounce(state, 'no-room', { x: rr.x, y: rr.y }, { ghost: all });
  s.objects.push(...made);
  return { state: s, events: [{ type: r.event, at: { x: made[0].x, y: made[0].y }, value: r.value, operands, ids: made.map(o => o.id) }] };
}

// The last block of the chain is the key; returns a bounce, or null once the = lock consumed it.
export function unlockDoor(state, s, chain, door, cx, cy, lanes, events) {
  const last = chain[chain.length - 1];
  if (door.gate) return bounce(state, 'gate', { x: cx, y: cy }, { sides: sides(door.value, lanes) }); // gates listen to lanes; no key fits
  if (last.kind !== 'num') return bounce(state, 'socket', { x: cx, y: cy }); // a door wants a number, not an operator
  const env = { ...lanes, '□': last.value };
  if (!accepts(door.value, env)) return bounce(state, 'not-equal', { x: cx, y: cy }, { sides: sides(door.value, env) });
  s.objects = s.objects.filter(x => x !== door && x !== last); // the = lock consumes the key
  chain.pop();
  events.push({ type: 'open', at: { x: cx, y: cy }, value: last.value });
  return null;
}

// A block of n unit cubes fills exactly n trench cells; too long to fit bounces. Returns a bounce or null.
export function fillTrench(state, s, chain, cx, cy, dx, dy, dir, events) {
  const last = chain[chain.length - 1];
  if (last.kind !== 'num' || last.shape) return bounce(state, 'wall', { x: cx, y: cy }); // platforms never fill trenches
  if (last.value === 0) return bounce(state, 'zero-fill', { x: cx, y: cy }); // 0 is an object that fills 0 holes
  if (!isNat(last.value)) return bounce(state, 'not-whole', { x: cx, y: cy }); // −2 or 7/2 unit cubes can't exist
  let len = 0;
  while (tileAt(s, cx + dx * len, cy + dy * len) === 'o' && !objAt(s, cx + dx * len, cy + dy * len)) len++;
  if (last.value > len) return bounce(state, 'too-long', { x: cx, y: cy }, { extra: last.value - len });
  for (let i = 0; i < last.value; i++) setTile(s, cx + dx * i, cy + dy * i, '.');
  s.objects = s.objects.filter(x => x !== last);
  chain.pop();
  events.push({ type: 'fill', at: { x: cx, y: cy }, dir, value: last.value, left: len - last.value });
  return null;
}

// An area pit ('_' cells) takes a body only if the pit is exactly its footprint; else the ghost
// (empty pit cells) or overhang (cells hanging out) bounce back. Shape is read here, never value.
export function fillPit(state, s, chain, dx, dy, events) {
  const last = chain[chain.length - 1], n = extent(last, dx);
  const target = cells(last).map(([x, y]) => [x + dx * n, y + dy * n]);
  const region = [], todo = face(last, dx, dy).filter(([x, y]) => tileAt(s, x, y) === '_'), has = (cs, [x, y]) => cs.some(c => c[0] === x && c[1] === y);
  while (todo.length) {
    const c = todo.pop();
    if (has(region, c) || tileAt(s, ...c) !== '_') continue;
    region.push(c);
    todo.push([c[0] + 1, c[1]], [c[0] - 1, c[1]], [c[0], c[1] + 1], [c[0], c[1] - 1]);
  }
  const ghost = region.filter(c => !has(target, c)), overhang = target.filter(c => !has(region, c));
  const at = { x: last.x + dx, y: last.y + dy };
  if (last.kind !== 'num') return bounce(state, 'wall', at);
  if (ghost.length || overhang.length) return bounce(state, 'pit', at, { ghost, overhang });
  for (const [x, y] of region) setTile(s, x, y, '.');
  s.objects = s.objects.filter(x => x !== last);
  chain.pop();
  events.push({ type: 'pit', at, cells: target, value: last.value, ...(last.shape && { shape: last.shape }) });
  return null;
}

// A one-cell socket ('|' rod, 'v' Void, 'p' pebble) takes a block only if its one attribute matches.
export function fillSocket(state, s, chain, cx, cy, events) {
  const last = chain[chain.length - 1], [name, fits] = SOCKETS[tileAt(s, cx, cy)];
  if (last.kind !== 'num' || !fits(last)) return bounce(state, `not-${name}`, { x: cx, y: cy });
  setTile(s, cx, cy, '.');
  s.objects = s.objects.filter(x => x !== last);
  chain.pop();
  events.push({ type: 'socket', at: { x: cx, y: cy }, value: last.value });
  return null;
}

// A platform pushed into a pivot post ('r') turns in place about its top-left cell; nothing else moves.
export function turn(state, s, b, cx, cy) {
  if (!b.shape) return bounce(state, 'wall', { x: cx, y: cy });
  const t = rotate(b);
  if (!free(s, cells({ ...b, ...t }), o => o === b)) return bounce(state, 'blocked', { x: b.x, y: b.y }, { ghost: cells({ ...b, ...t }) });
  b.shape = t.shape;
  return { state: s, events: [{ type: 'rotate', at: { x: b.x, y: b.y }, value: b.value, shape: b.shape }] };
}

// Line-only pushing: every moving body's leading face must be free floor or another moving body.
export function blockedAt(s, chain, dx, dy) {
  for (const b of chain) if (b.shape)
    for (const [x, y] of face(b, dx, dy)) if (!chain.some(c => inside(c, x, y)) && !free(s, [[x, y]])) return { x, y };
  return null;
}

// The pushed blocks move one cell; a number landing on a tick pad gains 1 and uses the pad up.
// A value-10 block or platform touching a bundle pad ('b') becomes a one-cell ten-rod on the pad (the pad stays).
export function tickPads(s, chain, dx, dy, events) {
  for (const c of chain) {
    c.x += dx; c.y += dy;
    if (c.kind === 'num' && tileAt(s, c.x, c.y) === '^') {
      c.value = tick(c.value); setTile(s, c.x, c.y, '.');
      events.push({ type: 'tick', at: { x: c.x, y: c.y }, value: c.value });
    }
    const pad = c.kind === 'num' && cells(c).find(([x, y]) => tileAt(s, x, y) === 'b'), rod = pad && bundle(c);
    if (rod) {
      [c.x, c.y] = pad; remake(c, rod);
      events.push({ type: 'bundle', at: { x: c.x, y: c.y }, value: c.value });
    }
  }
}
