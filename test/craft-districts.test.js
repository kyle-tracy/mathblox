// The overworld: one district per world, each door and host reachable on foot from camp; the demo strings still play.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newCraft, step, DISTRICTS, SITES } from '../core/craft.js';

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

test('the Tally-Keeper can walk to every door and host (pits count as fillable, blocks ignored)', () => {
  const s = newCraft(), ok = (x, y) => s.tiles[y]?.[x] === '.' || `${x},${y}` in s.ground, seen = new Set([`${s.player.x},${s.player.y}`]);
  for (const q = [[s.player.x, s.player.y]]; q.length;) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (ok(x + dx, y + dy) && !seen.has(`${x + dx},${y + dy}`)) { seen.add(`${x + dx},${y + dy}`); q.push([x + dx, y + dy]); }
  }
  const near = ([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`));
  for (const [id, d] of Object.entries(DISTRICTS)) assert.ok(near(d.door) && near(d.host), id);
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
  const b = play('rrdgulllguurrrrrrrdudududududududududududu'), i = b.ev.findIndex(e => e.type === 'dusk');
  assert.ok(i >= 0); assert.equal(b.ev.find(e => e.type === 'mimic')?.value, '□+3=8');
});
