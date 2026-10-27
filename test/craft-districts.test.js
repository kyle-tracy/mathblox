// The overworld: one district per world, each door and host reachable on foot from camp; the demo strings still play.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newCraft, step, DISTRICTS, SITES, DAY } from '../core/craft.js';
import { recruits, canEnter, parties } from '../core/progress.js';

const M = { u: 'up', d: 'down', l: 'left', r: 'right', g: 'grab' };
const play = moves => { let s = newCraft(), ev = []; for (const c of moves) { const r = step(s, M[c]); s = r.state; ev.push(...r.events); } return { s, ev }; };
const cells = d => [...Array(d.w * d.h)].map((_, i) => `${d.x + (i % d.w)},${d.y + Math.floor(i / d.w)}`);

test('districts do not overlap; door and host sit inside, side by side', () => {
  const seen = new Set();
  for (const [id, d] of Object.entries(DISTRICTS)) {
    for (const c of cells(d)) { assert.ok(!seen.has(c), `${id} overlaps at ${c}`); seen.add(c); }
    const inside = cells(d);
    assert.ok(inside.includes(d.door.join()) && inside.includes(d.host.join()), id);
    assert.equal(Math.abs(d.door[0] - d.host[0]) + Math.abs(d.door[1] - d.host[1]), 1, id);
    assert.deepEqual(SITES[id], d.door);
  }
});

// Walking only (no pushes, merges or flips), keyed on x, y and mover (Tab is free). ponytail: time is not in the key
// (a path that meets the night creature may be missed); capped. With `home` (a finished search from the spawn cell),
// reaching any of its cells means reaching all its doors: the world is static, so that is exact.
const WALK = ['move', 'leap', 'nudge', 'swap', 'face', 'enter', 'dusk', 'dawn', 'mimic'];
function entered(start, home, cap = 30000) {
  const key = s => `${s.player.x},${s.player.y},${s.mover}`, seen = new Set([key(start)]), got = new Set();
  for (let q = [start]; q.length && seen.size < cap;) {
    const s = q.shift();
    if (home?.seen.has(key(s))) return { seen, got: new Set([...got, ...home.got]) };
    for (const a of ['up', 'down', 'left', 'right', 'swap']) {
      const r = step(s, a);
      for (const e of r.events) if (e.type === 'enter' || e.reason === 'soon') got.add(e.world); // 'soon': at the door, world not built yet
      if (r.events.some(e => !WALK.includes(e.type))) continue; // walk only: blocks and land stay put, so the key is exact
      if (!seen.has(key(r.state))) { seen.add(key(r.state)); q.push(r.state); }
    }
  }
  return { seen, got };
}
const ALL = Object.keys(DISTRICTS);
test('from every cell where C picks a party, every party reaches each door it admits (nudgers and the ford included)', () => {
  for (const party of parties(recruits(ALL))) {
    const s0 = { ...newCraft(ALL, party), fire: 99 }, home = entered(s0); // terrain only
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
      const x = s0.camp.x + dx, y = s0.camp.y + dy;
      if (s0.tiles[y][x] !== '.' || s0.objects.some(o => o.x === x && o.y === y)) continue;
      const { got } = entered({ ...s0, player: { x, y } }, home);
      for (const id of ALL) if (canEnter(id, party, ALL)) assert.ok(got.has(id), `${party} from ${x},${y}: ${id}`);
    }
  }
});
test('a nudger pushes you one cell on, if that cell is open', () => {
  const s = newCraft(); s.player = { x: 5, y: 9 };
  const r = step(s, 'right');
  assert.deepEqual(r.state.player, { x: 7, y: 9 });
  assert.deepEqual(r.events.at(-1), { type: 'nudge', at: { x: 6, y: 9 }, to: { x: 7, y: 9 } });
  s.player = { x: 3, y: 8 }; // down onto (3,10)? no: (3,9) first, a plain step
  const c = structuredClone(s); c.player = { x: 3, y: 11 }; c.objects = c.objects.filter(o => !(o.x === 3 && o.y === 11)); c.objects.push({ id: 90, x: 3, y: 9, kind: 'num', value: 1 });
  assert.deepEqual(step(c, 'up').state.player, { x: 3, y: 10 }, 'blocked: you stay on the nudger');
});
test('the Road of Lands is free to walk: a whole day and night never drains the fire or dozes you off', () => {
  let s = newCraft(), ev = [];
  for (let i = 0; i < DAY + 5; i++) { const r = step(s, i % 2 ? 'up' : 'down'); s = r.state; ev.push(...r.events.map(e => e.type)); }
  assert.equal(s.fire, 3); assert.ok(ev.includes('dusk') && ev.includes('dawn') && !ev.includes('doze'));
});

const facing = (s, [x, y], dir) => { const c = structuredClone(s), [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir]; c.player = { x: x - dx, y: y - dy }; return c; };
test('bumping a host greets, for free; doors still say needs / soon / enter', () => {
  const s = newCraft(['camp']), d = DISTRICTS.alexandria, c = facing(s, d.host, 'up'), r = step(c, 'up');
  assert.equal(r.state, c);
  assert.deepEqual(r.events, [{ type: 'greet', world: 'alexandria', at: { x: d.host[0], y: d.host[1] } }]);
  assert.equal(step(facing(s, DISTRICTS.camp.host, 'left'), 'left').events[0].type, 'greet');
  assert.equal(step(facing(s, DISTRICTS.camp.door, 'left'), 'left').events[0].type, 'enter');
  const types = Object.keys(DISTRICTS).map(id => { const dd = DISTRICTS[id], dir = dd.door[1] === 1 ? 'up' : dd.door[1] === s.tiles.length - 2 ? 'down' : 'left';
    return step(facing(s, dd.door, dir), dir).events[0]; });
  assert.ok(types.every(e => e.type === 'enter' || ['needs', 'soon'].includes(e.reason)), JSON.stringify(types));
  assert.ok(types.some(e => e.reason === 'needs'));
});

test('residency demo strings still do what docs/demo.md says', () => {
  const a = play('uurrrrrrr'), land = a.ev.find(e => e.type === 'land');
  assert.equal(String(land.value), '5'); assert.equal(String(land.height), '2');
  assert.ok(a.s.objects.some(o => o.land && o.x === land.at.x && o.y === land.at.y && String(o.value) === '2'));
  const b = play('rrrrrr'), m = b.s.objects.find(o => o.mimic), cam = Math.max(0, b.s.player.x - 7); // play.js: 15 cells wide
  assert.equal(b.s.t, 6); assert.equal(m?.value, '□+3=8'); assert.ok(m.x >= cam && m.x < cam + 15, 'on screen');
});

test('entering a door costs no time', () => {
  const e = step({ ...newCraft(), player: { x: 1, y: 7 } }, 'down'); // into Camp
  assert.equal(e.events[0].type, 'enter'); assert.equal(e.state.t, 0);
});
