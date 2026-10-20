import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply } from '../core/math.js';
import { parseLevel, step } from '../core/world.js';
import { LEVELS } from '../levels/levels.js';
import { solve } from './solver.js';

const N = [...Array(15).keys()];

test('math laws hold for + and - over the naturals', () => {
  for (const a of N) for (const b of N) {
    assert.deepEqual(apply('+', a, b), apply('+', b, a), 'commutative');
    assert.equal(apply('+', a, 0).value, a, 'zero is identity');
    assert.equal(apply('-', apply('+', a, b).value, b).value, a, 'merge then carve undoes');
    const r = apply('-', a, b);
    assert.equal(r.ok, b <= a, 'carving more than is there bounces');
    if (r.ok) assert.ok(r.value >= 0, 'closed over naturals');
    for (const c of N.slice(0, 5))
      assert.equal(apply('+', apply('+', a, b).value, c).value, apply('+', a, apply('+', b, c).value).value, 'associative');
  }
});

const run = (lvl, moves) => moves.reduce((acc, d) => {
  const r = step(acc.state, d); return { state: r.state, events: [...acc.events, ...r.events] };
}, { state: parseLevel(lvl), events: [] });

test('pushing [a][op][b] calculates; wrong order bounces', () => {
  const lvl = { name: 't', map: ['#@3-7.#'], doors: {} };
  const bad = run(lvl, ['right']);
  assert.equal(bad.events[0].reason, 'too-much');
  assert.equal(bad.events[0].missing, 4, 'deficit ghost shows 4 missing units');
  assert.deepEqual(bad.state, parseLevel(lvl), 'bounce changes nothing');
  const left = run({ name: 't', map: ['#.3-7@#'], doors: {} }, ['left']);
  assert.equal(left.events[0].reason, 'too-much', 'reads 3-7 on screen, so it IS 3-7 even pushed leftward');
  const good = run({ name: 't', map: ['#@7-3.#'], doors: {} }, ['right']);
  assert.equal(good.events[0].type, 'carve');
  assert.deepEqual(good.state.objects.map(o => o.value), [4]);
});

test('door opens only for an equal block', () => {
  const no = run({ name: 't', map: ['#@3A.E#'], doors: { A: 4 } }, ['right']);
  assert.equal(no.events[0].reason, 'not-equal');
  const yes = run({ name: 't', map: ['#@4AE#'], doors: { A: 4 } }, ['right', 'right', 'right']);
  assert.ok(yes.state.won);
});

test('position never changes a block value', () => {
  const r = run({ name: 't', map: ['#@5....#'], doors: {} }, ['right', 'right', 'right']);
  assert.equal(r.state.objects[0].value, 5);
});

for (const lvl of LEVELS) test(`level "${lvl.name}" is solvable`, () => {
  const path = solve(parseLevel(lvl));
  assert.ok(path, 'no solution');
  assert.ok(run(lvl, path).events.some(e => e.type === 'open'), 'exit reachable without opening a door (cheese)');
  console.log(`  ${lvl.name}: shortest ${path.length} moves`);
});
