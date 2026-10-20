// Engine edge cases (Testo, P2 gate). Each test pins behaviour the levels rely on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLevel, step } from '../core/world.js';

const run = (map, moves, doors = {}) => moves.reduce((acc, d) => {
  const r = step(acc.state, d); return { state: r.state, events: [...acc.events, ...r.events] };
}, { state: parseLevel({ name: 't', map, doors }), events: [] });
const nums = s => s.objects.filter(o => o.kind === 'num').map(o => `${o.value}@${o.x},${o.y}`);
const unchanged = (map, d, doors) => { const r = run(map, [d], doors); assert.deepEqual(r.state, parseLevel({ name: 't', map, doors })); return r.events[0]; };

test('chain into a door: only the front block is the key; the rest slide up', () => {
  const r = run(['#@54AE#'], ['right'], { A: 4 });
  assert.equal(r.events.find(e => e.type === 'open').value, 4);
  assert.deepEqual(nums(r.state), ['5@3,0']);
  assert.deepEqual(r.state.player, { x: 2, y: 0 });
  assert.equal(unchanged(['#@45AE#'], 'right', { A: 4 }).reason, 'not-equal', 'wrong front block bounces whole chain');
  const op = run(['#@+4AE#'], ['right'], { A: 4 });
  assert.deepEqual(op.state.objects.map(o => `${o.op}@${o.x}`), ['+@3'], 'an operator behind the key just slides');
});

test('operators never open doors or fill trenches; the push bounces and nothing moves', () => {
  assert.equal(unchanged(['#@+A.#'], 'right', { A: 3 }).type, 'bounce');
  assert.equal(unchanged(['#@+ooo.#'], 'right').type, 'bounce');
});

test('chain into a trench: front block fills, rest slide; works vertically', () => {
  const r = run(['#@52ooo.#'], ['right']);
  assert.equal(r.events.find(e => e.type === 'fill').left, 1);
  assert.deepEqual(nums(r.state), ['5@3,0']);
  const v = run(['#@#', '#2#', '#o#', '#o#', '#o#', '###'], ['down']);
  assert.deepEqual(v.state.tiles.map(t => t[1]), ['.', '.', '.', '.', 'o', '#']);
  const side = run(['#.#.#', '#@2o#', '#.#o#'], ['right']); // a 1-wide run across the push: 2 is too long
  assert.deepEqual([side.events[0].reason, side.events[0].extra], ['too-long', 1]);
});

test('zero at doors: 0 is a real key', () => {
  assert.ok(run(['#@0AE#'], ['right', 'right', 'right'], { A: 0 }).state.won);
  assert.ok(run(['#@0AE#'], ['right', 'right', 'right'], { A: '4 = □+4' }).state.won);
  assert.deepEqual(unchanged(['#@0AE#'], 'right', { A: 5 }).sides, [0, 5]);
});

test('long chains (>5) compute in reading order from both ends', () => {
  for (const [line, want] of [['1+1+1+1+1', 5], ['8-3+2-4', 3], ['9-1-1-1', 6]]) {
    const R = run([`#@${line}${'.'.repeat(9)}#`], Array(12).fill('right'));
    const L = run([`#${'.'.repeat(9)}${line}@#`], Array(12).fill('left'));
    for (const r of [R, L]) assert.deepEqual(r.state.objects.map(o => o.value), [want], line);
    assert.deepEqual(R.events.filter(e => e.operands).map(e => e.operands), L.events.filter(e => e.operands).map(e => e.operands), 'same steps either way');
  }
});

test('vertical chains read top to bottom when pushed down', () => {
  const r = run(['#@#', '#7#', '#-#', '#3#', '#.#'], ['down']);
  assert.deepEqual(nums(r.state), ['4@1,3']);
  assert.equal(unchanged(['#@#', '#3#', '#-#', '#7#', '#.#'], 'down').missing, 4);
});

test('tick pads under a chain: each number that lands on a fresh pad ticks once; operators do not spend pads', () => {
  const r = run(['#@12^..#'], ['right', 'right']);
  assert.deepEqual(nums(r.state), ['1@4,0', '3@5,0'], 'the 2 ticked, the 1 crossed a spent pad');
  const op = run(['#@+^..#'], ['right', 'right']);
  assert.equal(op.state.tiles[0][3], '^');
  const last = run(['#@31^.#'], ['right']); // front block lands on the pad, block behind does not
  assert.deepEqual(nums(last.state), ['3@3,0', '2@4,0']);
});

test('resolve: forward the player steps in; reverse the player stays and the result sits beside it', () => {
  const f = run(['#@7-3.#'], ['right']);
  assert.deepEqual([nums(f.state), f.state.player], [['4@4,0'], { x: 2, y: 0 }]);
  const b = run(['#.7-3@#'], ['left']);
  assert.deepEqual([nums(b.state), b.state.player], [['4@4,0'], { x: 5, y: 0 }]);
  assert.equal(b.events.some(e => e.type === 'move'), false);
  const up = run(['#.#', '#7#', '#-#', '#3#', '#@#'], ['up']);
  assert.deepEqual([nums(up.state), up.state.player], [['4@1,3'], { x: 1, y: 4 }]);
  const dangling = run(['#+7-3@#'], ['left']);
  assert.deepEqual(nums(dangling.state), ['4@4,0'], 'a stray operator past the line is left alone');
});
