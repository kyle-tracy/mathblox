// Pure rules engine: parseLevel(level) -> state, step(state, dir) -> { state, events }.
// No DOM. Block meaning lives in its attributes; position never changes value.
import { apply, accepts, sides, tick, checkDoor } from './math.js';

export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// Map legend: '#' wall, '.' floor, '@' player, 'E' exit, 'o' trench cell, '^' tick pad (+1, used once),
// '0'-'9' number, '+' '-' operator, other 'A'-'Z' door (spec in level.doors: a number or an equation like "7 = □+3").
export function parseLevel(level) {
  const objects = [];
  let player = null, id = 0;
  const tiles = level.map.map((row, y) => [...row].map((ch, x) => {
    if (ch === '@') player = { x, y };
    else if (/[0-9]/.test(ch)) objects.push({ id: id++, x, y, kind: 'num', value: +ch });
    else if (ch === '+' || ch === '-') objects.push({ id: id++, x, y, kind: 'op', op: ch });
    else if (/[A-Z]/.test(ch) && ch !== 'E') {
      const spec = level.doors?.[ch];
      if (spec === undefined) throw new Error(`level "${level.name}": door ${ch} has no spec`);
      checkDoor(spec);
      objects.push({ id: id++, x, y, kind: 'door', value: spec });
    }
    return '#Eo^'.includes(ch) ? ch : '.';
  }).join(''));
  if (!player) throw new Error(`level "${level.name}" has no player`);
  return { tiles, player, objects, won: false };
}

const tileAt = (s, x, y) => s.tiles[y]?.[x] ?? '#';
const setTile = (s, x, y, ch) => { s.tiles[y] = s.tiles[y].slice(0, x) + ch + s.tiles[y].slice(x + 1); };
const objAt = (s, x, y) => s.objects.find(o => o.x === x && o.y === y);
const bounce = (state, reason, at, extra) => ({ state, events: [{ type: 'bounce', reason, at, ...extra }] });

export function step(state, dir) {
  if (state.won) return { state, events: [] };
  const [dx, dy] = DIRS[dir];
  const s = structuredClone(state);
  const nx = s.player.x + dx, ny = s.player.y + dy;
  if ('#o'.includes(tileAt(s, nx, ny))) return bounce(state, 'wall', { x: nx, y: ny });

  const first = objAt(s, nx, ny);
  if (!first) return walk(s, nx, ny);
  if (first.kind === 'door') return bounce(state, 'door', { x: nx, y: ny });

  // Collect the chain of pushable blocks in front of the player.
  const chain = [];
  let cx = nx, cy = ny, o;
  while ((o = objAt(s, cx, cy)) && o.kind !== 'door') { chain.push(o); cx += dx; cy += dy; }

  // [a][op][b] pushed together always calculates, in READING order (left->right, top->bottom),
  // never push order. On a long line like 9-3-2 the reading-first triple resolves first, so
  // pushed left/up that's the far end. The result lands in the right-hand operand (reading order).
  let k = 0;
  while (chain[k]?.kind === (k % 2 ? 'op' : 'num')) k++;
  if (k % 2 === 0) k--;
  if (k >= 3) {
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

  const events = [], last = chain[chain.length - 1], here = tileAt(s, cx, cy);
  if (here === '#') return bounce(state, 'wall', { x: cx, y: cy });

  const door = objAt(s, cx, cy);
  if (door) {
    if (last.kind !== 'num' || !accepts(door.value, last.value))
      return bounce(state, 'not-equal', { x: cx, y: cy }, last.kind === 'num' ? { sides: sides(door.value, last.value) } : {});
    s.objects = s.objects.filter(x => x !== door && x !== last); // the = lock consumes the key
    chain.pop();
    events.push({ type: 'open', at: { x: cx, y: cy }, value: last.value });
  } else if (here === 'o') {
    // A block of n unit cubes fills exactly n trench cells; too long to fit bounces.
    if (last.kind !== 'num') return bounce(state, 'wall', { x: cx, y: cy });
    let len = 0;
    while (tileAt(s, cx + dx * len, cy + dy * len) === 'o' && !objAt(s, cx + dx * len, cy + dy * len)) len++;
    if (last.value > len) return bounce(state, 'too-long', { x: cx, y: cy }, { extra: last.value - len });
    for (let i = 0; i < last.value; i++) setTile(s, cx + dx * i, cy + dy * i, '.');
    s.objects = s.objects.filter(x => x !== last);
    chain.pop();
    events.push({ type: 'fill', at: { x: cx, y: cy }, dir, value: last.value, left: len - last.value });
  }

  for (const c of chain) {
    c.x += dx; c.y += dy;
    if (c.kind === 'num' && tileAt(s, c.x, c.y) === '^') {
      c.value = tick(c.value); setTile(s, c.x, c.y, '.');
      events.push({ type: 'tick', at: { x: c.x, y: c.y }, value: c.value });
    }
  }
  const res = walk(s, nx, ny);
  res.events.unshift({ type: 'push' }, ...events);
  return res;
}

function walk(s, x, y) {
  s.player = { x, y };
  const events = [{ type: 'move' }];
  if (tileAt(s, x, y) === 'E') { s.won = true; events.push({ type: 'win' }); }
  return { state: s, events };
}
