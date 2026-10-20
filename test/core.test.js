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

test('long lines compute in reading order from either side: 9-3-2 = 4', () => {
  for (const [map, d] of [['#@9-3-2.#', 'right'], ['#.9-3-2@#', 'left']]) {
    const r = run({ name: 't', map: [map], doors: {} }, [d, d, d]);
    const vals = r.state.objects.filter(o => o.kind === 'num').map(o => o.value);
    assert.deepEqual(vals, [4], `${map} pushed ${d}`);
    assert.deepEqual(r.events.find(e => e.type === 'carve').operands, [9, 3]);
  }
  const col = run({ name: 't', map: ['#.#', '#9#', '#-#', '#3#', '#-#', '#2#', '#@#'], doors: {} }, ['up', 'up']);
  assert.deepEqual(col.state.objects.map(o => o.value), [4], 'columns read top to bottom');
});

test('door opens only for an equal block', () => {
  const no = run({ name: 't', map: ['#@3A.E#'], doors: { A: 4 } }, ['right']);
  assert.equal(no.events[0].reason, 'not-equal');
  const yes = run({ name: 't', map: ['#@4AE#'], doors: { A: 4 } }, ['right', 'right', 'right']);
  assert.ok(yes.state.won);
});

test('equation doors: = is two-way, not "answer comes next"', () => {
  const lvl = v => ({ name: 't', map: [`#@${v}AE#`], doors: { A: '7 = □+3' } });
  assert.ok(run(lvl(4), ['right', 'right', 'right']).state.won, '7 = 4+3 opens');
  // Reading "7 = □+3" as "answer comes next" means bringing 10: the scale shows 7 vs 13.
  const ten = run({ name: 't', map: ['#@9+1AE#'], doors: { A: '7 = □+3' } }, ['right', 'right', 'right']);
  assert.equal(ten.events.at(-1).reason, 'not-equal');
  assert.deepEqual(ten.events.at(-1).sides, [7, 13]);
  assert.ok(run({ name: 't', map: ['#@3AE#'], doors: { A: '2+5 = □+4' } }, ['right', 'right', 'right']).state.won);
  assert.throws(() => parseLevel({ name: 't', map: ['#@A#'], doors: { A: '7 = 3+4' } }), /bad door/);
});

test('tick pad adds exactly one, once', () => {
  const r = run({ name: 't', map: ['#@0^^.#'], doors: {} }, ['right', 'right', 'right']);
  assert.equal(r.state.objects[0].value, 2);
  assert.equal(r.events.filter(e => e.type === 'tick').length, 2);
  const back = run({ name: 't', map: ['#.^0@#'], doors: {} }, ['left', 'right', 'right', 'left', 'left']);
  assert.equal(back.state.objects[0].value, 1, 'used pad cannot be farmed');
});

test('trench: n fills n cells, too long bounces, parts add up', () => {
  const r = run({ name: 't', map: ['#@2.ooooo.#'], doors: {} }, ['right', 'right']);
  assert.equal(r.events.find(e => e.type === 'fill').left, 3);
  assert.equal(r.state.tiles[0], '#.....ooo.#');
  const long = run({ name: 't', map: ['#@6.ooooo.#'], doors: {} }, ['right', 'right']);
  assert.deepEqual([long.events.at(-1).reason, long.events.at(-1).extra], ['too-long', 1]);
  assert.equal(run({ name: 't', map: ['#@o#'], doors: {} }, ['right']).events[0].reason, 'wall', 'player cannot walk into a trench');
});

test('position never changes a block value', () => {
  const r = run({ name: 't', map: ['#@5....#'], doors: {} }, ['right', 'right', 'right']);
  assert.equal(r.state.objects[0].value, 5);
});

for (const lvl of LEVELS) test(`level "${lvl.name}" is solvable`, () => {
  const path = solve(parseLevel(lvl));
  assert.ok(path, 'no solution');
  const types = run(lvl, path).events.map(e => e.type);
  for (const t of ['open', ...(lvl.teaches ?? [])])
    assert.ok(types.includes(t), `shortest solution skips "${t}" (cheese)`);
  console.log(`  ${lvl.name}: shortest ${path.length} moves`);
});
