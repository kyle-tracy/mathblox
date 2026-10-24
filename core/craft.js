// Craft: the open-world prototype. Pure, no DOM. Wraps the puzzle engine's step(), so every push,
// merge, carve and pit fill uses the same calculator-precise rules as the puzzles (no second math truth).
// Added here: number land (pits and hills), a fire at camp, a bag, turn-based day and night,
// rocks that regrow at dawn, and a shy night creature that wears an equation.
import { add, sub, isNat, parts } from './value.js';
import { accepts } from './math.js';
import { parseLevel, step as worldStep, DIRS, API } from './world.js';
import { objAt, tileAt, setTile, bounce } from './push.js';
import { HEROES } from './heroes.js';
import { missing, world } from './progress.js';

export const DAY = 48, NIGHT = 16, BAG = 2, START_HEAT = 3; // moves per day; the last NIGHT moves are night
export const isNight = t => t % DAY >= DAY - NIGHT;
export const dayOf = t => Math.floor(t / DAY) + 1;
export const movesToSwitch = t => (isNight(t) ? DAY : DAY - NIGHT) - (t % DAY); // until dawn or dusk

// Hand-authored map: a road (7 rows, about 3 screens wide) between two bands of districts, one per world.
// Camp (the fire) is the origin. The land is a number:
// each pit cell has its own height (−3), and any block pushed or placed in adds to it, from any side.
// −3 + 3 = 0 is flat ground; −3 + 2 = −1 is still a pit; −3 + 5 = 2 is a hill: a 2 block left standing there.
const OY = 5, W = 48, H = 19, ROAD = [OY + 1, OY + 7], CAMP = { x: 2, y: OY + 4 }; // rows 1-4 and 14-17 are districts
const RIVERS = [[10, -3], [22, -2], [23, -3], [36, -2]]; // [column, height] down every road row but the x-axis (camp's row: a ford, 0 deep)
const riverRows = () => [...Array(ROAD[1] - ROAD[0] + 1)].map((_, i) => ROAD[0] + i).filter(y => y !== CAMP.y);
const STAMPS = [
  [4, 2, '2'], [5, 2, '+'], [7, 2, '3'], // 0:00: merge 2+3, feed 5
  [3, 6, '1'], [5, 6, '9'], [6, 6, '-'], [8, 6, '6'], // 0:40: 9−6 = 3 bridges the −3 (or burn the 9: it regrows at dawn)
  [14, 5, '4'], [15, 5, '+'], [17, 5, '1'], [15, 7, '7'], [16, 7, '-'], [18, 7, '2'], [19, 2, '8'], // 5 fills −2 and leaves a 3 for the −3
  [29, 3, '3'], [30, 3, '×'], [32, 3, '3'], [33, 6, '2'], [26, 1, '6'], [31, 7, '4'], // a 3×3 platform burns as 9
  [40, 2, '9'], [41, 4, '+'], [43, 4, '9'], [44, 6, '8'], [42, 6, '5'], [45, 2, '7'], // far side: bonfire wood
  [6, 3, '#'], [13, 1, '#'], [20, 1, '#'], [20, 2, '#'], [27, 6, '#'], [27, 7, '#'], [34, 1, '#'], [40, 7, '#'], [46, 4, '#'],
].map(([x, y, ch]) => [x, y + OY, ch]); // authored in road rows 1-7
// The night creature: shy, past the first river, wearing one equation per night (□ is the block you give it).
const MIMIC_SPOTS = [[15, 3], [17, 1], [13, 6], [19, 4]].map(([x, y]) => [x, y + OY]), MIMIC_EQS = ['□+3=8', '□+1=5', '□+4=7'];
// Districts: one walled area per world, opening onto the road by a gap (gate) in an odd column. Inside, you stand on
// the gate's column (`stand`) beside the door (a solid cell that enters the world); the host next to the door (hero
// or signpost) greets. In curriculum order away from camp, alternating top and bottom. Rivers cut only the road, so a
// district sits on the side of the river its gate opens to: Pythagoras's pairs past the 1-wide river at 36 he can leap.
// Gate, stand and door approach all sit on odd x and odd y: the cells Pythagoras (who leaps 2) reaches from camp;
// Croton's and the Keep's gates sit where Euclid's slide stops (the rock at 40 is his stop) (he must reach Croton alone; anyone may go to the Keep).
// The real gate is `needs` (core/progress.js).
const district = (x, w, top, g, side = 1, y = top ? 1 : H - 2) => ({ x, y: top ? 1 : ROAD[1] + 2, w, h: 4,
  gate: [g, top ? ROAD[0] - 1 : ROAD[1] + 1], stand: [g, y], door: [g + side, y], host: [g + 2 * side, y] }); // side −1: door left of the gate
export const DISTRICTS = {
  camp: { x: 1, y: ROAD[0], w: 9, h: 7, stand: [1, CAMP.y - 2], door: [1, CAMP.y - 1], host: [1, CAMP.y] }, // the camp itself; host: the Tally-Keeper
  alexandria: district(1, 8, true, 3), croton: district(1, 9, false, 9, -1),
  ujjain: district(10, 10, true, 15), elea: district(11, 10, false, 13),
  distrib: district(21, 8, true, 25), under: district(22, 9, false, 25), series: district(30, 6, true, 33),
  vectors: district(32, 8, false, 37), rotation: district(37, 5, true, 37), motion: district(43, 4, true, 43),
  dungeon: district(41, 6, false, 41),
};
// Nudgers (pistons): a road tile that pushes whoever ends a move on it 1 cell onward, if that cell is open floor.
// Pythagoras leaps 2, so he keeps his parity, and gates, stands and the ford are on odd x, odd y; landing on a
// nudger flips one parity. Picked at camp on any cell, he gets back on track: (6,9) leaping right, (3,10) leaping
// up, (4,10) leaping right then (3,10).
export const NUDGERS = [[6, 9], [3, 10], [4, 10]];
const NUDGE = new Set(NUDGERS.map(String));
export const LAYOUT = 3; // bump when the map changes: older saves are dropped
export const SITES = Object.fromEntries(Object.entries(DISTRICTS).map(([id, d]) => [id, d.door]));
const keyed = f => Object.fromEntries(Object.entries(DISTRICTS).map(([id, d]) => [d[f].join(), id]));
export function craftMap() {
  const rows = [...Array(H)].map(() => Array(W).fill('#')), open = (x, y, w, h) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) rows[j][i] = '.'; };
  open(1, ROAD[0], W - 2, ROAD[1] - ROAD[0] + 1);
  for (const d of Object.values(DISTRICTS)) { open(d.x, d.y, d.w, d.h); if (d.gate) open(...d.gate, 1, 1); }
  for (const [x] of RIVERS) for (const y of riverRows()) rows[y][x] = '#'; // solid to the engine; heights live in s.ground
  for (const [x, y, ch] of STAMPS) rows[y][x] = ch;
  for (const d of Object.values(DISTRICTS)) rows[d.door[1]][d.door[0]] = rows[d.host[1]][d.host[0]] = '#';
  rows[CAMP.y][CAMP.x] = '#'; // the fire is solid too; pushes into it are caught below
  rows[CAMP.y][CAMP.x + 1] = '@';
  return rows.map(r => r.join(''));
}

// done: finished world ids; party: the heroes you take out (Tab swaps between them).
export function newCraft(done = [], party = ['tally']) {
  const s = parseLevel({ name: 'craft', map: craftMap(), cast: party }), ground = {};
  for (const [x, h] of RIVERS) for (const y of riverRows()) ground[`${x},${y}`] = h;
  const spawns = s.objects.map(({ x, y, kind, value, op }) => ({ x, y, kind, ...(kind === 'num' ? { value } : { op }) }));
  return { ...s, layout: LAYOUT, camp: CAMP, ground, spawns, fire: START_HEAT, bag: [], t: 0, facing: 'right', dozes: 0, pet: null,
    done: [...done], sites: keyed('door'), hosts: keyed('host') };
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

// Swapping heroes is free (like turning): only moves pass time. A hero's whole move is one move of time,
// so Euclid's slide costs what one step costs.
export function step(state, action) {
  const res = action === 'grab' ? grab(state) : action === 'swap' ? worldStep(state, 'swap') : go(state, action);
  if (res.state === state || ['bounce', 'swap', 'enter'].includes(res.events[0]?.type)) return res;
  tick(res.state, res.events);
  return res;
}

// Heroes move on open ground too: each hero's rule runs on Craft's own single step (pits, fire, creature).
const CRAFT_API = { ...API, move: push, gatesTrue: () => true, falseGates: () => [] };
function go(state, dir) {
  const [dx, dy] = DIRS[dir], x = state.player.x + dx, y = state.player.y + dy, site = state.sites?.[`${x},${y}`];
  if (site) { // a site door: in you go, if you brought who it needs. Either way it is now your waypoint: you wake here.
    if (state.waypoint !== site) state = { ...state, waypoint: site };
    const lack = missing(site, state.cast, state.done);
    if (lack.length) return bounce(state, 'needs', { x, y }, { world: site, missing: lack });
    if (!world(site).levels.length) return bounce(state, 'soon', { x, y }, { world: site }); // a pair world not built yet
    return { state, events: [{ type: 'enter', world: site, at: { x, y } }] };
  }
  const host = state.hosts?.[`${x},${y}`]; // a host: who lives here, what they teach, who you need (free, like a bump)
  if (host) return { state, events: [{ type: 'greet', world: host, at: { x, y } }] };
  if (state.mover === 'brahmagupta' && !state.won) { const f = flipGround(state, x, y); if (f) return f; }
  const r = HEROES[state.mover](state, dir, CRAFT_API), n = r.state;
  if (n !== state && (n.player.x !== state.player.x || n.player.y !== state.player.y)) {
    n.facing = dir;
    const to = { x: n.player.x + dx, y: n.player.y + dy };
    if (NUDGE.has(`${n.player.x},${n.player.y}`) && tileAt(n, to.x, to.y) === '.' && !objAt(n, to.x, to.y)) {
      r.events.push({ type: 'nudge', at: { ...n.player }, to });
      n.player = to;
    }
    if (n.pet && state.pet) n.pet = { ...state.player }; // it follows you (to where you stood: after a leap it hops after you)
  }
  return r;
}
// Brahmagupta in Craft: the ground is a number too, so walking into a pit or a hill flips its height (h becomes −h).
// A −3 pit becomes a 3 hill block standing there; a hill block (land) becomes a pit as deep as it was tall.
function flipGround(state, x, y) {
  const o = objAt(state, x, y);
  if (!isPit(state, x, y) && !(o?.land && !o.shape)) return null;
  const s = structuredClone(state), k = `${x},${y}`;
  let h;
  if (o) { h = sub(0, o.value); s.objects = s.objects.filter(q => q.id !== o.id); s.ground[k] = h; setTile(s, x, y, '#'); }
  else { h = sub(0, s.ground[k]); delete s.ground[k]; setTile(s, x, y, '.'); s.objects.push({ id: nextId(s), x, y, kind: 'num', value: h, land: true }); }
  return { state: s, events: [{ type: 'negate', at: { x, y }, value: h, ground: true }] };
}
// At camp (within 2 cells of the fire) you pick who comes out with you; time doesn't pass.
export function choose(state, party) {
  if (Math.max(Math.abs(state.player.x - state.camp.x), Math.abs(state.player.y - state.camp.y)) > 2) return bounce(state, 'camp', { ...state.player });
  return { state: { ...structuredClone(state), cast: [...party], mover: party[0] }, events: [{ type: 'party', party }] };
}
// Back from a world: stand on the floor beside its door (or at camp if a block now stands there).
export function atSite(state, id) {
  const s = structuredClone(state);
  s.player = doorSpot(s, id);
  if (s.pet) s.pet = { ...s.player };
  return s;
}

// One plain step (the Tally-Keeper's move), plus what Craft adds: feeding the fire, filling land, offering to the creature.
function push(state, dir) {
  const r = API.move(state, dir), [dx, dy] = DIRS[dir];
  if (r.state !== state) {
    r.state.facing = dir;
    // The right block pushed into the creature: the engine's = lock took it (the creature is a door). Tamed.
    const i = r.events.findIndex(e => e.type === 'open' && mimicAt(state, e.at.x, e.at.y));
    if (i >= 0) { r.state.pet = { ...r.events[i].at }; r.events[i] = { ...r.events[i], type: 'tame' }; }
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

// Time passes only on a real move (bumping a wall is free). The fire burns only at night (1 warmth every 4 moves;
// daytime is for exploring); at 0 you doze off
// and wake next morning beside the last district door you reached (camp if none), fire relit. Nothing is lost: the bag and the world stay as they were.
function tick(s, events) {
  if (events[0]?.type === 'face') return;
  const night = isNight(s.t);
  s.t++;
  if (isNight(s.t) !== night) (night ? dawn : dusk)(s, events);
  if (isNight(s.t) && s.t % 4 === 0) s.fire = Math.max(0, s.fire - 1);
  if (s.fire > 0) return;
  s.player = s.waypoint ? doorSpot(s, s.waypoint) : wakeSpot(s); // each land is a waypoint: you wake by the last door you reached
  if (s.pet) s.pet = { ...s.player };
  s.fire = START_HEAT;
  s.t = (dayOf(s.t)) * DAY; // next morning
  s.dozes++;
  events.push({ type: 'doze', at: { ...s.player } });
  dawn(s, events);
}
const doorSpot = (s, id) => {
  const [x, y] = SITES[id], [sx, sy] = DISTRICTS[id].stand;
  const p = [[sx - x, sy - y], ...Object.values(DIRS)].map(([dx, dy]) => ({ x: x + dx, y: y + dy })).find(q => tileAt(s, q.x, q.y) === '.' && !objAt(s, q.x, q.y));
  return p ?? wakeSpot(s);
};
const wakeSpot = s => {
  for (const [dx, dy] of [[1, 0], [0, 1], [0, -1], [-1, 0], [1, 1], [1, -1], [2, 0]]) {
    const x = s.camp.x + dx, y = s.camp.y + dy;
    if (tileAt(s, x, y) === '.' && !objAt(s, x, y)) return { x, y };
  }
  return s.player; // ponytail: camp fully walled in by blocks — stay put; widen the search if levels ever allow it
};
