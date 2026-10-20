// Push resolution for core/world.js move(): what a pushed chain does when it calculates, meets a door, or fills a trench.
// Pure, no DOM. Imports only math.js (no cycle with world.js); `lanes` is laneValues(s), passed in by the caller.
import { apply, accepts, sides, tick } from './math.js';

export const tileAt = (s, x, y) => s.tiles[y]?.[x] ?? '#';
export const setTile = (s, x, y, ch) => { s.tiles[y] = s.tiles[y].slice(0, x) + ch + s.tiles[y].slice(x + 1); };
export const objAt = (s, x, y) => s.objects.find(o => o.x === x && o.y === y && !o.open); // open gates are passable
export const bounce = (state, reason, at, extra) => ({ state, events: [{ type: 'bounce', reason, at, ...extra }] });

// Helpers below mutate the clone `s` and the `chain`; every bounce returns the untouched `state`.
// [a][op][b] pushed together always calculates, in READING order (left->right, top->bottom),
// never push order. On a long line like 9-3-2 the reading-first triple resolves first, so
// pushed left/up that's the far end. The result lands in the right-hand operand (reading order).
export function resolveChain(state, s, chain, dx, dy, nx, ny) {
  let k = 0;
  while (chain[k]?.kind === (k % 2 ? 'op' : 'num')) k++;
  if (k % 2 === 0) k--;
  if (k < 3) return null;
  const rev = dx < 0 || dy < 0;
  const [p, op, q] = rev ? chain.slice(k - 3, k) : chain.slice(0, 3);
  const [l, rr] = rev ? [q, p] : [p, q];
  const r = apply(op.op, l.value, rr.value);
  if (!r.ok) return bounce(state, r.reason, { x: rr.x, y: rr.y }, { missing: r.missing });
  const operands = [l.value, rr.value];
  rr.value = r.value;
  s.objects = s.objects.filter(x => x !== l && x !== op);
  if (!rev) s.player = { x: nx, y: ny }; // pushed forward, the player steps into the freed cell
  return { state: s, events: [{ type: op.op === '+' ? 'merge' : 'carve', at: { x: rr.x, y: rr.y }, value: r.value, operands }] };
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
  if (last.kind !== 'num') return bounce(state, 'wall', { x: cx, y: cy });
  if (last.value === 0) return bounce(state, 'zero-fill', { x: cx, y: cy }); // 0 is an object that fills 0 holes
  let len = 0;
  while (tileAt(s, cx + dx * len, cy + dy * len) === 'o' && !objAt(s, cx + dx * len, cy + dy * len)) len++;
  if (last.value > len) return bounce(state, 'too-long', { x: cx, y: cy }, { extra: last.value - len });
  for (let i = 0; i < last.value; i++) setTile(s, cx + dx * i, cy + dy * i, '.');
  s.objects = s.objects.filter(x => x !== last);
  chain.pop();
  events.push({ type: 'fill', at: { x: cx, y: cy }, dir, value: last.value, left: len - last.value });
  return null;
}

// The pushed blocks move one cell; a number landing on a tick pad gains 1 and uses the pad up.
export function tickPads(s, chain, dx, dy, events) {
  for (const c of chain) {
    c.x += dx; c.y += dy;
    if (c.kind === 'num' && tileAt(s, c.x, c.y) === '^') {
      c.value = tick(c.value); setTile(s, c.x, c.y, '.');
      events.push({ type: 'tick', at: { x: c.x, y: c.y }, value: c.value });
    }
  }
}
