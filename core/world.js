// Pure rules engine: parseLevel(level) -> state, step(state, dir) -> { state, events }.
// No DOM. Block meaning lives in its attributes; position never changes value.
import { add, sub } from './value.js';
import { accepts, sides, checkDoor, isGate, platform } from './math.js';
import { tileAt, objAt, inside, cells, face, bounce, resolveChain, unlockDoor, fillTrench, fillPit, fillSocket, turn, blockedAt, tickPads } from './push.js';

export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// Map legend: '#' wall, '.' floor, '@' player, 'E' exit, 'o' trench cell, '^' tick pad (+1, used once),
// '0'-'9' number, '+' '-' '×' '÷' operator, other 'A'-'Z' door (spec in level.doors: a number or an equation like "7 = □+3"),
// '_' area pit cell, 'r' pivot post, 'b' bundle pad, sockets '|' rod, 'v' Void, 'p' pebble. level.platforms = [{ x, y, rows, cols }] pre-places arrays
// (top-left anchor; their map cells are '.').
// level.lanes = { '△': { row: 3 }, '○': { col: 6 } }: a variable whose value is the total of the number blocks in it.
// level.cast = ['tally', 'euclid', ...]: who you can play (default ['tally']); step(state, 'swap') cycles to the next.
export function parseLevel(level) {
  const objects = [];
  let player = null, id = 0;
  const tiles = level.map.map((row, y) => [...row].map((ch, x) => {
    if (ch === '@') player = { x, y };
    else if (/[0-9]/.test(ch)) objects.push({ id: id++, x, y, kind: 'num', value: +ch });
    else if ('+-×÷'.includes(ch)) objects.push({ id: id++, x, y, kind: 'op', op: ch });
    else if (/[A-Z]/.test(ch) && ch !== 'E') {
      const spec = level.doors?.[ch];
      if (spec === undefined) throw new Error(`level "${level.name}": door ${ch} has no spec`);
      checkDoor(spec, Object.keys(level.lanes ?? {}));
      objects.push({ id: id++, x, y, kind: 'door', value: spec, ...(isGate(spec) && { gate: true }) });
    }
    return '#Eo^_rb|vp'.includes(ch) ? ch : '.';
  }).join(''));
  for (const { x, y, rows, cols } of level.platforms ?? []) objects.push({ id: id++, x, y, kind: 'num', ...platform(rows, cols) });
  if (!player) throw new Error(`level "${level.name}" has no player`);
  const cast = level.cast ?? ['tally'];
  const state = { tiles, player, cast, mover: cast[0], objects, lanes: level.lanes ?? {}, div: level.div ?? 'remainder', won: false }; // div: how ÷ shows
  const env = laneValues(state);
  for (const g of objects.filter(o => o.gate)) g.open = accepts(g.value, env); // gates are live from the start
  return state;
}

// A lane is a box: its value is the total of the number blocks inside it. Blocks keep their own values.
export function laneValues(s) {
  const env = {};
  for (const [sym, { row, col }] of Object.entries(s.lanes ?? {}))
  {
    // A platform counts its whole value once if any of its cells is in the lane (CEO ruling).
    const inLane = s.objects.filter(o => o.kind !== 'door' && cells(o).some(([x, y]) => (row !== undefined ? y === row : x === col)));
    // A lane holding an operator reads "?": a row showing 3 − 2 must not secretly total 5.
    env[sym] = inLane.some(o => o.kind === 'op') ? NaN : inLane.reduce((t, o) => add(t, o.value), 0);
  }
  return env;
}

export function step(state, dir) {
  const res = dir === 'swap' ? swap(state) : (MOVERS[state.mover] ?? move)(state, dir);
  if (res.state === state) return res;
  // Gates are live: open exactly while their equation is true (they can't close on something inside them).
  const env = laneValues(res.state);
  for (const g of res.state.objects.filter(o => o.gate)) {
    const ok = accepts(g.value, env), open = ok || (g.open && occupied(res.state, g));
    if (open !== !!g.open) res.events.push({ type: open ? 'open' : 'close', at: { x: g.x, y: g.y }, gate: true, sides: sides(g.value, env) });
    g.open = open;
    g.held = open && !ok; // wedged open by a block while false: the renderer draws it strained
  }
  return res;
}

const occupied = (s, g) => (s.player.x === g.x && s.player.y === g.y) || s.objects.some(o => o !== g && inside(o, g.x, g.y));
// The exit needs every gate's equation true at the same moment: one △ can't be 5 for one gate and 3 for another.
const falseGates = s => { const env = laneValues(s); return s.objects.filter(o => o.gate && !accepts(o.value, env)).map(o => [o.x, o.y]); };
const gatesTrue = s => { const env = laneValues(s); return s.objects.every(o => !o.gate || accepts(o.value, env)); };

// Characters: each one moves in its own way, built from move() (one step or one push).
const walked = r => r.events[0]?.type === 'move';
// Walk up to n steps while each step is a plain walk; a push only happens as the first action.
function run(state, dir, n = Infinity) {
  let r = move(state, dir);
  if (!walked(r)) return r;
  const events = [...r.events];
  for (let i = 1; i < n && !r.state.won; i++) {
    const nx = move(r.state, dir);
    if (!walked(nx)) break;
    r = nx; events.push(...nx.events.filter(e => e.type !== 'move'));
  }
  return { state: r.state, events };
}
const runway = (state, dir) => { let n = 0, s = state, r; while (!s.won && walked(r = move(s, dir))) { n++; s = r.state; } return n; };
export const MOVERS = {
  tally: move,
  // Euclid: a line segment can be extended as far as you like. He slides until something is in the way.
  euclid: (state, dir) => run(state, dir),
  // Zeno: half the distance to whatever is ahead (rounded up, so on a grid he does arrive).
  zeno: (state, dir) => run(state, dir, Math.ceil(runway(state, dir) / 2) || 1),
  // Pythagoras: a string halved sounds an octave up (2:1). He leaps 2 cells, over anything; he never pushes.
  pythagoras(state, dir) {
    if (state.won) return { state, events: [] };
    const [dx, dy] = DIRS[dir], x = state.player.x + 2 * dx, y = state.player.y + 2 * dy, t = tileAt(state, x, y);
    if (!'.^bE'.includes(t) || objAt(state, x, y)) return bounce(state, 'leap', { x, y });
    if (t === 'E' && !gatesTrue(state)) return bounce(state, 'gates', { x, y }, { falseGates: falseGates(state) });
    const r = walk(structuredClone(state), x, y);
    r.events[0] = { type: 'leap' };
    return r;
  },
  // Brahmagupta: fortunes and debts. Walking into a plain number or a + / − flips it to its opposite.
  brahmagupta(state, dir) {
    const [dx, dy] = DIRS[dir], x = state.player.x + dx, y = state.player.y + dy, o = objAt(state, x, y);
    if (state.won || !o || o.shape || !(o.kind === 'num' || '+-'.includes(o.op))) return move(state, dir);
    const s = structuredClone(state), b = objAt(s, x, y);
    if (b.kind === 'num') b.value = sub(0, b.value); else b.op = OPP_OP[b.op];
    return { state: s, events: [{ type: 'negate', at: { x, y }, value: b.value ?? b.op }] };
  },
};
const OPP_OP = { '+': '-', '-': '+' };
function swap(state) {
  if (state.cast.length < 2 || state.won) return { state, events: [] };
  const s = structuredClone(state);
  s.mover = s.cast[(s.cast.indexOf(s.mover) + 1) % s.cast.length];
  return { state: s, events: [{ type: 'swap', mover: s.mover }] };
}

function move(state, dir) {
  if (state.won) return { state, events: [] };
  const [dx, dy] = DIRS[dir];
  const s = structuredClone(state);
  const nx = s.player.x + dx, ny = s.player.y + dy;
  if ('#o_|vpr'.includes(tileAt(s, nx, ny))) return bounce(state, 'wall', { x: nx, y: ny });

  const first = objAt(s, nx, ny);
  if (!first && tileAt(s, nx, ny) === 'E' && !gatesTrue(s)) {
    return bounce(state, 'gates', { x: nx, y: ny }, { falseGates: falseGates(s) });
  }
  if (!first) return walk(s, nx, ny);
  if (first.kind === 'door') return bounce(state, 'door', { x: nx, y: ny });

  // Collect the chain of pushable blocks in front of the player.
  const chain = [];
  let cx = nx, cy = ny, o;
  while ((o = objAt(s, cx, cy)) && o.kind !== 'door') { chain.push(o); do { cx += dx; cy += dy; } while (inside(o, cx, cy)); }
  const calc = resolveChain(state, s, chain, dx, dy);
  if (calc) return stepIn(state, calc, nx, ny);

  const events = [], here = tileAt(s, cx, cy), last = chain[chain.length - 1];
  if (here === '#' || here === 'E') return bounce(state, 'wall', { x: cx, y: cy }); // blocks can't bury the exit
  const door = objAt(s, cx, cy), ahead = face(last, dx, dy).map(([x, y]) => tileAt(s, x, y));
  if (!door && ahead.includes('r')) return stepIn(state, turn(state, s, last, cx, cy), nx, ny);
  const refused = door ? unlockDoor(state, s, chain, door, cx, cy, laneValues(s), events)
    : ahead.includes('_') ? fillPit(state, s, chain, dx, dy, events)
    : '|vp'.includes(here) ? fillSocket(state, s, chain, cx, cy, events)
    : here === 'o' ? fillTrench(state, s, chain, cx, cy, dx, dy, dir, events) : null;
  if (refused) return refused;
  const stuck = blockedAt(s, chain, dx, dy);
  if (stuck) return bounce(state, 'blocked', stuck);
  tickPads(s, chain, dx, dy, events);
  const res = walk(s, nx, ny);
  res.events.unshift({ type: 'push' }, ...events);
  return res;
}

// One step rule: after any push that succeeds, the player steps into the cell in front if it became free.
const stepIn = (state, res, x, y) => (res.state === state || objAt(res.state, x, y) ? res : (res.state.player = { x, y }, res));

function walk(s, x, y) {
  s.player = { x, y };
  const events = [{ type: 'move' }];
  if (tileAt(s, x, y) === 'E') { s.won = true; events.push({ type: 'win' }); }
  return { state: s, events };
}
