// Pure rules engine: parseLevel(level) -> state, step(state, dir) -> { state, events }.
// No DOM. Block meaning lives in its attributes; position never changes value.
import { apply, equal } from './math.js';

export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// Map legend: '#' wall, '.' floor, '@' player, 'E' exit, '0'-'9' number, '+' '-' operator, 'A'-'Z' door (value in level.doors).
export function parseLevel(level) {
  const objects = [];
  let player = null, id = 0;
  const tiles = level.map.map((row, y) => [...row].map((ch, x) => {
    if (ch === '@') player = { x, y };
    else if (/[0-9]/.test(ch)) objects.push({ id: id++, x, y, kind: 'num', value: +ch });
    else if (ch === '+' || ch === '-') objects.push({ id: id++, x, y, kind: 'op', op: ch });
    else if (/[A-Z]/.test(ch) && ch !== 'E') objects.push({ id: id++, x, y, kind: 'door', value: level.doors[ch] });
    return ch === '#' || ch === 'E' ? ch : '.';
  }).join(''));
  if (!player) throw new Error(`level "${level.name}" has no player`);
  return { tiles, player, objects, won: false };
}

const tileAt = (s, x, y) => s.tiles[y]?.[x] ?? '#';
const objAt = (s, x, y) => s.objects.find(o => o.x === x && o.y === y);
const bounce = (state, reason, at, extra) => ({ state, events: [{ type: 'bounce', reason, at, ...extra }] });

export function step(state, dir) {
  if (state.won) return { state, events: [] };
  const [dx, dy] = DIRS[dir];
  const s = structuredClone(state);
  const nx = s.player.x + dx, ny = s.player.y + dy;
  if (tileAt(s, nx, ny) === '#') return bounce(state, 'wall', { x: nx, y: ny });

  const first = objAt(s, nx, ny);
  if (!first) return walk(s, nx, ny);
  if (first.kind === 'door') return bounce(state, 'door', { x: nx, y: ny });

  // Collect the chain of pushable blocks in front of the player.
  const chain = [];
  let cx = nx, cy = ny, o;
  while ((o = objAt(s, cx, cy)) && o.kind !== 'door') { chain.push(o); cx += dx; cy += dy; }

  // [a][op][b] pushed together always calculates, in READING order (left->right, top->bottom),
  // never push order: the screen must show the sum being computed.
  const [a, op, b] = chain;
  if (a?.kind === 'num' && op?.kind === 'op' && b?.kind === 'num') {
    const [l, r_] = dx < 0 || dy < 0 ? [b, a] : [a, b];
    const r = apply(op.op, l.value, r_.value);
    if (!r.ok) return bounce(state, r.reason, { x: b.x, y: b.y }, { missing: r.missing });
    b.value = r.value;
    s.objects = s.objects.filter(x => x !== a && x !== op);
    s.player = { x: nx, y: ny };
    return { state: s, events: [{ type: op.op === '+' ? 'merge' : 'carve', at: { x: b.x, y: b.y }, value: r.value }] };
  }

  const events = [];
  if (tileAt(s, cx, cy) === '#') return bounce(state, 'wall', { x: cx, y: cy });
  const door = objAt(s, cx, cy);
  if (door) {
    const last = chain[chain.length - 1];
    if (last.kind !== 'num' || !equal(last.value, door.value)) return bounce(state, 'not-equal', { x: cx, y: cy });
    s.objects = s.objects.filter(x => x !== door && x !== last); // the = lock consumes the key
    chain.pop();
    events.push({ type: 'open', at: { x: cx, y: cy }, value: door.value });
  }
  for (const c of chain) { c.x += dx; c.y += dy; }
  const res = walk(s, nx, ny);
  res.events.unshift(...events, { type: 'push' });
  return res;
}

function walk(s, x, y) {
  s.player = { x, y };
  const events = [{ type: 'move' }];
  if (tileAt(s, x, y) === 'E') { s.won = true; events.push({ type: 'win' }); }
  return { state: s, events };
}
