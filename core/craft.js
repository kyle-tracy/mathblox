// Craft: the open-world prototype. Pure, no DOM. Wraps the puzzle engine's step(), so every push,
// merge, carve and pit fill uses the same calculator-precise rules as the puzzles (no second math truth).
// Added here: number land (pits and hills), a fire at camp, a bag, turn-based day and night,
// rocks that regrow at dawn, and a shy night creature that wears an equation.
import { add, isNat, parts } from './value.js';
import { accepts } from './math.js';
import { parseLevel, step as worldStep, DIRS } from './world.js';
import { objAt, tileAt, setTile, bounce } from './push.js';

export const DAY = 48, NIGHT = 16, BAG = 2, START_HEAT = 3; // moves per day; the last NIGHT moves are night
const burnEvery = t => (isNight(t) ? 4 : 8); // the fire eats 1 warmth every 8 moves, every 4 at night
export const isNight = t => t % DAY >= DAY - NIGHT;
export const dayOf = t => Math.floor(t / DAY) + 1;
export const movesToSwitch = t => (isNight(t) ? DAY : DAY - NIGHT) - (t % DAY); // until dawn or dusk

// Hand-authored strip, about 3 screens wide. Camp (the fire) is the origin. The land is a number:
// each pit cell has its own height (−3), and any block pushed or placed in adds to it, from any side.
// −3 + 3 = 0 is flat ground; −3 + 2 = −1 is still a pit; −3 + 5 = 2 is a hill: a 2 block left standing there.
const W = 48, H = 9, CAMP = { x: 2, y: 4 };
const RIVERS = [[10, -3], [22, -2], [23, -3], [36, -2]]; // [column, height] down every row
const STAMPS = [
  [4, 2, '2'], [5, 2, '+'], [7, 2, '3'], // 0:00: merge 2+3, feed 5
  [3, 6, '1'], [5, 6, '9'], [6, 6, '-'], [8, 6, '6'], // 0:40: 9−6 = 3 bridges the −3 (or burn the 9: it regrows at dawn)
  [14, 5, '4'], [15, 5, '+'], [17, 5, '1'], [15, 7, '7'], [16, 7, '-'], [18, 7, '2'], [19, 2, '8'], // 5 fills −2 and leaves a 3 for the −3
  [29, 3, '3'], [30, 3, '×'], [32, 3, '3'], [33, 6, '2'], [26, 1, '6'], [31, 7, '4'], // a 3×3 platform burns as 9
  [40, 2, '9'], [41, 4, '+'], [43, 4, '9'], [44, 6, '8'], [42, 6, '5'], [45, 2, '7'], // far side: bonfire wood
  [6, 3, '#'], [13, 1, '#'], [20, 1, '#'], [20, 2, '#'], [27, 6, '#'], [27, 7, '#'], [34, 1, '#'], [39, 7, '#'], [46, 4, '#'],
];
// The night creature: shy, past the first river, wearing one equation per night (□ is the block you give it).
const MIMIC_SPOTS = [[15, 3], [17, 1], [13, 6], [19, 4]], MIMIC_EQS = ['□+3=8', '□+1=5', '□+4=7'];
export function craftMap() {
  const rows = [...Array(H)].map((_, y) => [...Array(W)].map((_, x) => (y === 0 || y === H - 1 || x === 0 || x === W - 1 ? '#' : '.')));
  for (const [x] of RIVERS) for (let y = 1; y < H - 1; y++) rows[y][x] = '#'; // solid to the engine; heights live in s.ground
  for (const [x, y, ch] of STAMPS) rows[y][x] = ch;
  rows[CAMP.y][CAMP.x] = '#'; // the fire is solid too; pushes into it are caught below
  rows[CAMP.y][CAMP.x + 1] = '@';
  return rows.map(r => r.join(''));
}

export function newCraft() {
  const s = parseLevel({ name: 'craft', map: craftMap() }), ground = {};
  for (const [x, h] of RIVERS) for (let y = 1; y < H - 1; y++) ground[`${x},${y}`] = h;
  const spawns = s.objects.map(({ x, y, kind, value, op }) => ({ x, y, kind, ...(kind === 'num' ? { value } : { op }) }));
  return { ...s, camp: CAMP, ground, spawns, fire: START_HEAT, bag: [], t: 0, facing: 'right', dozes: 0, pet: null };
}

export const heightAt = (s, x, y) => s.ground[`${x},${y}`] ?? 0;
export const bagSize = s => BAG * (s.pet ? 2 : 1); // a tamed creature carries as much again
const sign = v => Math.sign(parts(v)[0]);
const nextId = s => Math.max(-1, ...s.objects.map(o => o.id), ...s.bag.map(o => o.id)) + 1;
const isFire = (s, x, y) => x === s.camp.x && y === s.camp.y;
const isPit = (s, x, y) => `${x},${y}` in s.ground;
const mimicAt = (s, x, y) => s.objects.find(o => o.mimic && o.x === x && o.y === y);

// A block goes into the fire or into the land. Returns a bounce, or null once the block is used up.
function sink(state, s, o, x, y, events) {
  if (o.kind !== 'num') return bounce(state, 'socket', { x, y });
  if (o.value === 0) return bounce(state, 'zero-fill', { x, y }); // 0 changes nothing
  if (isFire(s, x, y)) { // warmth only grows: a wrong value is still warmth, never a penalty
    if (!isNat(o.value)) return bounce(state, 'not-whole', { x, y }); // −2 or 7/2 can't burn
    s.fire = add(s.fire, o.value);
    events.push({ type: 'feed', at: { x, y }, value: o.value, heat: s.fire });
    return null;
  }
  const k = `${x},${y}`, h = add(s.ground[k], o.value); // land is a number: −3 + 5 = 2, −3 + (−2) = −5
  if (sign(h) < 0) s.ground[k] = h;
  else { delete s.ground[k]; setTile(s, x, y, '.'); }
  if (sign(h) > 0) s.objects.push({ id: nextId(s), x, y, kind: 'num', value: h, land: true }); // the hill is the leftover block; land is its attribute, so it stays land wherever it goes
  events.push({ type: 'land', at: { x, y }, value: o.value, height: h });
  return null;
}

// Give the creature a block: if it makes its equation true it is tamed; otherwise it hops off, no harm done.
function offer(state, s, m, o, events) {
  if (o.kind === 'num' && accepts(m.value, { '□': o.value })) {
    s.objects = s.objects.filter(q => q !== m);
    s.pet = { x: m.x, y: m.y };
    events.push({ type: 'tame', at: { x: m.x, y: m.y }, value: o.value });
    return true;
  }
  const at = { x: m.x, y: m.y }, i = MIMIC_SPOTS.findIndex(([x, y]) => x === m.x && y === m.y);
  for (let j = 1; j <= MIMIC_SPOTS.length; j++) {
    const [x, y] = MIMIC_SPOTS[(i + j) % MIMIC_SPOTS.length];
    if (tileAt(s, x, y) === '.' && !objAt(s, x, y) && (s.player.x !== x || s.player.y !== y)) { m.x = x; m.y = y; break; }
  }
  events.push({ type: 'hop', at, to: { x: m.x, y: m.y }, value: o.value ?? o.op });
  return false;
}

export function step(state, action) {
  const res = action === 'grab' ? grab(state) : push(state, action);
  if (res.state === state || res.events[0]?.type === 'bounce') return res;
  tick(res.state, res.events);
  return res;
}

function push(state, dir) {
  const r = worldStep(state, dir), [dx, dy] = DIRS[dir];
  if (r.state !== state) {
    const n = r.state;
    n.facing = dir;
    if (n.pet && (n.player.x !== state.player.x || n.player.y !== state.player.y)) n.pet = { ...state.player }; // it follows you
    // The right block pushed into the creature: the engine's = lock took it (the creature is a door). Tamed.
    const i = r.events.findIndex(e => e.type === 'open' && mimicAt(state, e.at.x, e.at.y));
    if (i >= 0) { n.pet = { ...r.events[i].at }; r.events[i] = { ...r.events[i], type: 'tame' }; }
    return r;
  }
  const b = r.events[0], s = structuredClone(state), events = [];
  // The engine says 'wall' at the fire or a pit cell, and 'door' / 'not-equal' at the creature
  // (it is a door wearing an equation). Calcs in the chain already went first.
  const o = b && objAt(s, b.at.x - dx, b.at.y - dy), m = b && mimicAt(s, b.at.x, b.at.y);
  if (o && m && o.kind !== 'door') {
    if (offer(state, s, m, o, events)) s.objects = s.objects.filter(q => q !== o);
    return { state: s, events };
  }
  if (o && b.reason === 'wall' && (isFire(s, b.at.x, b.at.y) || isPit(s, b.at.x, b.at.y))) {
    s.objects = s.objects.filter(q => q !== o);
    const no = sink(state, s, o, b.at.x, b.at.y, events);
    return no ?? { state: s, events };
  }
  if (state.facing === dir) return r; // a bump: no time passes, but you now face that way
  s.facing = dir;
  return { state: s, events: [{ type: 'face' }, ...r.events] };
}

// One key: pick up the block you face, or place your last-picked block in front
// (on floor, into a pit, into the fire, or to the creature).
function grab(state) {
  const s = structuredClone(state), [dx, dy] = DIRS[s.facing], x = s.player.x + dx, y = s.player.y + dy;
  const o = objAt(s, x, y), events = [], m = mimicAt(s, x, y);
  if (o && o.kind !== 'door') {
    if (s.bag.length >= bagSize(s)) return bounce(state, 'bag-full', { x, y });
    s.objects = s.objects.filter(q => q !== o);
    s.bag.push(o);
    return { state: s, events: [{ type: 'pick', at: { x, y }, value: o.value ?? o.op }] };
  }
  const item = s.bag.at(-1);
  if (!item) return bounce(state, 'empty', { x, y });
  if (m) { if (offer(state, s, m, item, events)) s.bag.pop(); return { state: s, events }; }
  if (isFire(s, x, y) || isPit(s, x, y)) { const no = sink(state, s, item, x, y, events); if (no) return no; }
  else if (!o && tileAt(s, x, y) === '.' && (!item.shape || roomFor(s, item, x, y))) {
    s.objects.push({ ...item, x, y });
    events.push({ type: 'place', at: { x, y } });
  } else return bounce(state, 'wall', { x, y });
  s.bag.pop();
  return { state: s, events };
}
const free1 = (s, x, y) => tileAt(s, x, y) === '.' && !objAt(s, x, y) && (s.player.x !== x || s.player.y !== y);
const roomFor = (s, o, x, y) => {
  for (let j = 0; j < o.shape[0]; j++) for (let i = 0; i < o.shape[1]; i++) if (!free1(s, x + i, y + j)) return false;
  return true;
};

// Dusk: the creature peeks in (unless already tamed). Dawn: it leaves, and every starting rock
// whose cell is empty grows back (a Tick of time), so burning the last 9 never soft-locks the world.
function dusk(s, events) {
  events.push({ type: 'dusk' });
  if (s.pet || s.objects.some(o => o.mimic)) return;
  const spot = MIMIC_SPOTS.find(([x, y]) => free1(s, x, y));
  if (!spot) return;
  const value = MIMIC_EQS[(dayOf(s.t) - 1) % MIMIC_EQS.length];
  s.objects.push({ id: nextId(s), x: spot[0], y: spot[1], kind: 'door', value, mimic: true });
  events.push({ type: 'mimic', at: { x: spot[0], y: spot[1] }, value });
}
function dawn(s, events) {
  s.objects = s.objects.filter(o => !o.mimic);
  const grown = [];
  for (const sp of s.spawns) if (free1(s, sp.x, sp.y)) { const o = { id: nextId(s), ...sp }; s.objects.push(o); grown.push(o.id); }
  events.push({ type: 'dawn', ids: grown });
}

// Time passes only on a real move (bumping a wall is free). The fire burns down; at 0 you doze off
// and wake at camp next morning, fire relit. Nothing is lost: the bag and the world stay as they were.
function tick(s, events) {
  if (events[0]?.type === 'face') return;
  const night = isNight(s.t);
  s.t++;
  if (isNight(s.t) !== night) (night ? dawn : dusk)(s, events);
  if (s.t % burnEvery(s.t) === 0) s.fire = Math.max(0, s.fire - 1);
  if (s.fire > 0) return;
  s.player = wakeSpot(s);
  if (s.pet) s.pet = { ...s.player };
  s.fire = START_HEAT;
  s.t = (dayOf(s.t)) * DAY; // next morning
  s.dozes++;
  events.push({ type: 'doze', at: { ...s.player } });
  dawn(s, events);
}
const wakeSpot = s => {
  for (const [dx, dy] of [[1, 0], [0, 1], [0, -1], [-1, 0], [1, 1], [1, -1], [2, 0]]) {
    const x = s.camp.x + dx, y = s.camp.y + dy;
    if (tileAt(s, x, y) === '.' && !objAt(s, x, y)) return { x, y };
  }
  return s.player; // ponytail: camp fully walled in by blocks — stay put; widen the search if levels ever allow it
};
