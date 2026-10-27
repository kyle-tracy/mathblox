// The path map (spec 2026-10-27-path-map-design.md): a graph you travel, never a play area.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NODES, newMap, step } from '../core/map.js';
import { WORLDS } from '../levels/worlds.js';

const OPP = { u: 'd', d: 'u', l: 'r', r: 'l' };
const nodeOf = id => Object.keys(NODES).find(k => NODES[k].world === id);

test('every link is two-way, in the opposite direction', () => {
  for (const [a, n] of Object.entries(NODES))
    for (const [d, b] of Object.entries(n.links)) assert.equal(NODES[b]?.links[OPP[d]], a, `${a} -${d}-> ${b} has no way back`);
});

test('the graph is connected from Sumhenge, and every world sits on exactly one node', () => {
  const seen = new Set(['sumhenge']), todo = ['sumhenge'];
  while (todo.length) for (const b of Object.values(NODES[todo.pop()].links)) if (!seen.has(b)) { seen.add(b); todo.push(b); }
  assert.deepEqual([...seen].sort(), Object.keys(NODES).sort());
  for (const n of Object.values(NODES)) if (n.world) assert.ok(WORLDS.some(w => w.id === n.world), n.world);
  for (const w of WORLDS) assert.equal(Object.values(NODES).filter(n => n.world === w.id).length, 1, w.id);
});

test('walking never fails: a missing link is a no-op, a link moves you', () => {
  const s = newMap();
  assert.deepEqual(step(s, 'l').events, []);
  const r = step(s, 'r');
  assert.equal(r.state.at, NODES.sumhenge.links.r);
  assert.deepEqual(r.events, [{ type: 'walk', from: 'sumhenge', to: NODES.sumhenge.links.r }]);
});

test('the demo order: each world enters once the ones before it are done', () => {
  const done = [];
  for (const id of ['camp', 'alexandria', 'croton', 'ujjain', 'elea', 'keep-euclid', 'keep-pythagoras', 'keep-brahmagupta', 'keep-zeno', 'dungeon']) {
    assert.equal(step(newMap(done, nodeOf(id)), 'enter').events[0].type, 'enter', `${id} after ${done}`);
    done.push(id);
  }
});

test('a locked world says what it needs; an empty world is sealed beyond the demo', () => {
  assert.deepEqual(step(newMap([], nodeOf('croton')), 'enter').events, [{ type: 'locked', world: 'croton', missing: ['euclid'] }]);
  assert.deepEqual(step(newMap([], nodeOf('rotation')), 'enter').events, [{ type: 'locked', world: 'rotation', missing: [], soon: true }]);
  assert.deepEqual(step(newMap(), 'keep').events ?? [], []); // junctions and bad input do nothing
});
