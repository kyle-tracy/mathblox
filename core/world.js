// Pure rules engine: parseLevel(level) -> state, step(state, dir) -> { state, events }.
// No DOM. Block meaning lives in its attributes; position never changes value.
import { apply, accepts, sides, tick, checkDoor, isGate } from './math.js';

export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// Map legend: '#' wall, '.' floor, '@' player, 'E' exit, 'o' trench cell, '^' tick pad (+1, used once),
// '0'-'9' number, '+' '-' operator, other 'A'-'Z' door (spec in level.doors: a number or an equation like "7 = □+3").
// level.lanes = { '△': { row: 3 }, '○': { col: 6 } }: a variable whose value is the total of the number blocks in it.
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
      checkDoor(spec, Object.keys(level.lanes ?? {}));
      objects.push({ id: id++, x, y, kind: 'door', value: spec, ...(isGate(spec) && { gate: true }) });
    }
    return '#Eo^'.includes(ch) ? ch : '.';
  }).join(''));
  if (!player) throw new Error(`level "${level.name}" has no player`);
  const state = { tiles, player, objects, lanes: level.lanes ?? {}, won: false };
  const env = laneValues(state);
  for (const g of objects.filter(o => o.gate)) g.open = accepts(g.value, env); // gates are live from the start
  return state;
}

// A lane is a box: its value is the total of the number blocks inside it. Blocks keep their own values.
export function laneValues(s) {
  const env = {};
  for (const [sym, { row, col }] of Object.entries(s.lanes ?? {}))
  {
    const inLane = s.objects.filter(o => o.kind !== 'door' && (row !== undefined ? o.y === row : o.x === col));
    // A lane holding an operator reads "?": a row showing 3 − 2 must not secretly total 5.
    env[sym] = inLane.some(o => o.kind === 'op') ? NaN : inLane.reduce((t, o) => t + o.value, 0);
  }
  return env;
}

const tileAt = (s, x, y) => s.tiles[y]?.[x] ?? '#';
const setTile = (s, x, y, ch) => { s.tiles[y] = s.tiles[y].slice(0, x) + ch + s.tiles[y].slice(x + 1); };
const objAt = (s, x, y) => s.objects.find(o => o.x === x && o.y === y && !o.open); // open gates are passable
const bounce = (state, reason, at, extra) => ({ state, events: [{ type: 'bounce', reason, at, ...extra }] });

export function step(state, dir) {
  const res = move(state, dir);
  if (res.state === state) return res;
  // Gates are live: open exactly while their equation is true (they can't close on something inside them).
  const env = laneValues(res.state);
  for (const g of res.state.objects.filter(o => o.gate)) {
    const open = accepts(g.value, env) || (g.open && occupied(res.state, g));
    if (open !== !!g.open) res.events.push({ type: open ? 'open' : 'close', at: { x: g.x, y: g.y }, gate: true, sides: sides(g.value, env) });
    g.open = open;
  }
  return res;
}

const occupied = (s, g) => (s.player.x === g.x && s.player.y === g.y) || s.objects.some(o => o !== g && o.x === g.x && o.y === g.y);
// The exit needs every gate's equation true at the same moment: one △ can't be 5 for one gate and 3 for another.
const gatesTrue = s => { const env = laneValues(s); return s.objects.every(o => !o.gate || accepts(o.value, env)); };

function move(state, dir) {
  if (state.won) return { state, events: [] };
  const [dx, dy] = DIRS[dir];
  const s = structuredClone(state);
  const nx = s.player.x + dx, ny = s.player.y + dy;
  if ('#o'.includes(tileAt(s, nx, ny))) return bounce(state, 'wall', { x: nx, y: ny });

  const first = objAt(s, nx, ny);
  if (!first && tileAt(s, nx, ny) === 'E' && !gatesTrue(s)) {
    const env = laneValues(s);
    return bounce(state, 'gates', { x: nx, y: ny }, { falseGates: s.objects.filter(o => o.gate && !accepts(o.value, env)).map(o => [o.x, o.y]) });
  }
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
  if (here === '#' || here === 'E') return bounce(state, 'wall', { x: cx, y: cy }); // blocks can't bury the exit

  const door = objAt(s, cx, cy);
  if (door) {
    if (door.gate) return bounce(state, 'gate', { x: cx, y: cy }, { sides: sides(door.value, laneValues(s)) }); // gates listen to lanes; no key fits
    if (last.kind !== 'num') return bounce(state, 'socket', { x: cx, y: cy }); // a door wants a number, not an operator
    const env = { ...laneValues(s), '□': last.value };
    if (!accepts(door.value, env)) return bounce(state, 'not-equal', { x: cx, y: cy }, { sides: sides(door.value, env) });
    s.objects = s.objects.filter(x => x !== door && x !== last); // the = lock consumes the key
    chain.pop();
    events.push({ type: 'open', at: { x: cx, y: cy }, value: last.value });
  } else if (here === 'o') {
    // A block of n unit cubes fills exactly n trench cells; too long to fit bounces.
    if (last.kind !== 'num') return bounce(state, 'wall', { x: cx, y: cy });
    if (last.value === 0) return bounce(state, 'zero-fill', { x: cx, y: cy }); // 0 is an object that fills 0 holes
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
