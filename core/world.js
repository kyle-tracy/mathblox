// Pure rules engine: parseLevel(level) -> state, step(state, dir) -> { state, events }.
// No DOM. Block meaning lives in its attributes; position never changes value.
import { accepts, sides, checkDoor, isGate } from './math.js';
import { tileAt, objAt, bounce, resolveChain, unlockDoor, fillTrench, tickPads } from './push.js';

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
  const calc = resolveChain(state, s, chain, dx, dy, nx, ny);
  if (calc) return calc;

  const events = [], here = tileAt(s, cx, cy);
  if (here === '#' || here === 'E') return bounce(state, 'wall', { x: cx, y: cy }); // blocks can't bury the exit
  const door = objAt(s, cx, cy);
  const refused = door ? unlockDoor(state, s, chain, door, cx, cy, laneValues(s), events)
    : here === 'o' ? fillTrench(state, s, chain, cx, cy, dx, dy, dir, events) : null;
  if (refused) return refused;
  tickPads(s, chain, dx, dy, events);
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
