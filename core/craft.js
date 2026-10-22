// Craft: the open-world prototype. Pure, no DOM. Wraps the puzzle engine's step(), so every push,
// merge, carve and pit fill uses the same calculator-precise rules as the puzzles (no second math truth).
// Added here: a fire (warmth) at camp, a 2-slot bag (pick up / place), and turn-based day and night.
import { add, isNat } from './value.js';
import { parseLevel, step as worldStep, DIRS } from './world.js';
import { objAt, tileAt, fillTrench, bounce } from './push.js';

export const DAY = 48, NIGHT = 16, BAG = 2, START_HEAT = 3; // moves per day; the last NIGHT moves are night
const burnEvery = t => (isNight(t) ? 4 : 8); // the fire eats 1 warmth every 8 moves, every 4 at night
export const isNight = t => t % DAY >= DAY - NIGHT;
export const dayOf = t => Math.floor(t / DAY) + 1;

// Hand-authored strip, about 3 screens wide. Camp (the fire) is the origin; pits are trench runs ('o'):
// a run of n cells is a −n pit, a block of n fills it to 0, a smaller block leaves the rest.
const W = 48, H = 9, CAMP = { x: 2, y: 4 };
const RIVERS = [[10, 3], [22, 5], [36, 2]]; // [first column, width]: −3, −5, −2 across every row
const STAMPS = [
  [4, 2, '2'], [5, 2, '+'], [7, 2, '3'], // 0:00: merge 2+3, feed 5
  [3, 6, '1'], [5, 6, '9'], [6, 6, '-'], [8, 6, '6'], // 0:40: 9−6 = 3 bridges the −3 (or burn the 9 and stay home)
  [14, 5, '4'], [15, 5, '+'], [17, 5, '1'], [15, 7, '7'], [16, 7, '-'], [18, 7, '2'], [19, 2, '8'], // two ways to make 5
  [29, 3, '3'], [30, 3, '×'], [32, 3, '3'], [33, 6, '2'], [26, 1, '6'], [31, 7, '4'], // a 3×3 platform burns as 9
  [40, 2, '9'], [41, 4, '+'], [43, 4, '9'], [44, 6, '8'], [42, 6, '5'], [45, 2, '7'], // far side: bonfire wood
  [6, 3, '#'], [13, 1, '#'], [20, 1, '#'], [20, 2, '#'], [27, 6, '#'], [27, 7, '#'], [34, 1, '#'], [39, 7, '#'], [46, 4, '#'],
];
export function craftMap() {
  const rows = [...Array(H)].map((_, y) => [...Array(W)].map((_, x) => (y === 0 || y === H - 1 || x === 0 || x === W - 1 ? '#' : '.')));
  for (const [x0, w] of RIVERS) for (let y = 1; y < H - 1; y++) for (let x = x0; x < x0 + w; x++) rows[y][x] = 'o';
  for (const [x, y, ch] of STAMPS) rows[y][x] = ch;
  rows[CAMP.y][CAMP.x] = '#'; // the fire is solid; pushes into it are caught below
  rows[CAMP.y][CAMP.x + 1] = '@';
  return rows.map(r => r.join(''));
}

export function newCraft() {
  const s = parseLevel({ name: 'craft', map: craftMap() });
  return { ...s, camp: CAMP, fire: START_HEAT, bag: [], t: 0, facing: 'right', dozes: 0 };
}

// Pits as numbers: every horizontal run of trench cells is one pit of height −n (filled cells are ground 0).
export function pits(s) {
  const out = [];
  s.tiles.forEach((row, y) => { for (const m of row.matchAll(/o+/g)) out.push({ x: m.index, y, height: -m[0].length }); });
  return out;
}
export const heightAt = (s, x, y) => pits(s).find(p => p.y === y && x >= p.x && x < p.x - p.height)?.height ?? 0;

const isFire = (s, x, y) => x === s.camp.x && y === s.camp.y;
// Feed a block to the fire: warmth only grows (a wrong value is still warmth, never a penalty).
function feed(state, s, o, events) {
  if (o.kind !== 'num') return bounce(state, 'socket', { ...s.camp });
  if (!isNat(o.value) || o.value === 0) return bounce(state, 'not-whole', { ...s.camp }); // −2 or 7/2 can't burn
  s.fire = add(s.fire, o.value);
  events.push({ type: 'feed', at: { ...s.camp }, value: o.value, heat: s.fire });
  return null;
}

export function step(state, action) {
  const res = action === 'grab' ? grab(state) : push(state, action);
  if (res.state === state || res.events[0]?.type === 'bounce') return res;
  tick(res.state, res.events);
  return res;
}

function push(state, dir) {
  const r = worldStep(state, dir);
  if (r.state !== state) { r.state.facing = dir; return r; }
  const b = r.events[0], [dx, dy] = DIRS[dir];
  // A block pushed into the fire: the engine says 'wall' there (calcs in the chain already went first).
  const s = structuredClone(state), o = b?.reason === 'wall' && isFire(s, b.at.x, b.at.y) && objAt(s, b.at.x - dx, b.at.y - dy);
  if (!o) { // a bump: no time passes, but you now face that way (so you can pick up a block stuck on a wall)
    if (state.facing === dir) return r;
    s.facing = dir;
    return { state: s, events: [{ type: 'face' }, ...r.events] };
  }
  const events = [];
  const refused = feed(state, s, o, events);
  if (refused) return refused;
  s.objects = s.objects.filter(x => x !== o);
  return { state: s, events };
}

// One key: pick up the block you face, or place your last-picked block in front
// (on floor, into a pit, or into the fire).
function grab(state) {
  const s = structuredClone(state), [dx, dy] = DIRS[s.facing], x = s.player.x + dx, y = s.player.y + dy;
  const o = objAt(s, x, y), events = [];
  if (o && o.kind !== 'door') {
    if (s.bag.length >= BAG) return bounce(state, 'bag-full', { x, y });
    s.objects = s.objects.filter(q => q !== o);
    s.bag.push(o);
    return { state: s, events: [{ type: 'pick', at: { x, y }, value: o.value ?? o.op }] };
  }
  const item = s.bag.at(-1);
  if (!item) return bounce(state, 'empty', { x, y });
  if (isFire(s, x, y)) { const no = feed(state, s, item, events); if (no) return no; }
  else if (tileAt(s, x, y) === 'o') { const no = fillTrench(state, s, [item], x, y, dx, dy, s.facing, events); if (no) return no; }
  else if (tileAt(s, x, y) === '.' && (!item.shape || roomFor(s, item, x, y))) {
    s.objects.push({ ...item, x, y, id: Math.max(-1, ...s.objects.map(q => q.id)) + 1 });
    events.push({ type: 'place', at: { x, y } });
  } else return bounce(state, 'wall', { x, y });
  s.bag.pop();
  return { state: s, events };
}
const roomFor = (s, o, x, y) => {
  for (let j = 0; j < o.shape[0]; j++) for (let i = 0; i < o.shape[1]; i++)
    if (tileAt(s, x + i, y + j) !== '.' || objAt(s, x + i, y + j) || (s.player.x === x + i && s.player.y === y + j)) return false;
  return true;
};

// Time passes only on a real move (bumping a wall is free). The fire burns down; at 0 you doze off
// and wake at camp next morning, fire relit. Nothing is lost: the bag and the world stay as they were.
function tick(s, events) {
  if (events[0]?.type === 'face') return;
  const night = isNight(s.t);
  s.t++;
  if (isNight(s.t) !== night) events.push({ type: night ? 'dawn' : 'dusk' });
  if (s.t % burnEvery(s.t) === 0) s.fire = Math.max(0, s.fire - 1);
  if (s.fire > 0) return;
  s.player = wakeSpot(s);
  s.fire = START_HEAT;
  s.t = (dayOf(s.t)) * DAY; // next morning
  s.dozes++;
  events.push({ type: 'doze', at: { ...s.player } });
}
const wakeSpot = s => {
  for (const [dx, dy] of [[1, 0], [0, 1], [0, -1], [-1, 0], [1, 1], [1, -1], [2, 0]]) {
    const x = s.camp.x + dx, y = s.camp.y + dy;
    if (tileAt(s, x, y) === '.' && !objAt(s, x, y)) return { x, y };
  }
  return s.player; // ponytail: camp fully walled in by blocks — stay put; widen the search if levels ever allow it
};
