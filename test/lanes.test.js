import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLevel, step, laneValues } from '../core/world.js';

const run = (lvl, moves) => moves.reduce((acc, d) => {
  const r = step(acc.state, d); return { state: r.state, events: [...acc.events, ...r.events] };
}, { state: parseLevel(lvl), events: [] });

test('a lane is the total of the blocks in it; empty lane is 0', () => {
  const s = parseLevel({ name: 't', map: ['#@...#', '#2.3.#', '#....#'], lanes: { '△': { row: 1 }, '○': { col: 1 } } });
  assert.deepEqual(laneValues(s), { '△': 5, '○': 2 });
  assert.deepEqual(laneValues(parseLevel({ name: 't', map: ['#@.#'], lanes: { '△': { row: 0 } } })), { '△': 0 });
});

test('gate opens itself when its equation becomes true', () => {
  const lvl = { name: 't', map: ['#@5.AE#', '#.....#'], lanes: { '△': { row: 1 } }, doors: { A: '△ + 2 = 7' } };
  const s0 = parseLevel(lvl);
  assert.ok(s0.objects.some(o => o.gate));
  // push 5 down into the △ lane: player goes around above it
  const r = run({ ...lvl, map: ['#.@..#', '#.5.A#', '#....#', '#...E#'], lanes: { '△': { row: 2 } } }, ['down']);
  assert.ok(r.events.some(e => e.type === 'open' && e.gate), 'opens when △ = 5');
  assert.ok(r.state.objects.find(o => o.gate).open);
});

test('gates are live and the exit needs all gates true at once', () => {
  // △ lane is row 2. Push 5 into it (gate opens), then push it out again (gate closes).
  const lvl = { name: 't', map: ['#.@..#', '#.5.A#', '#....#', '#....#', '#...E#'], lanes: { '△': { row: 2 } }, doors: { A: '△ = 5' } };
  const r = run(lvl, ['down', 'down']);
  assert.deepEqual(r.events.filter(e => e.gate).map(e => e.type), ['open', 'close']);
  const locked = run({ name: 't', map: ['#@E#', '#A.#'], lanes: { '△': { row: 1 } }, doors: { A: '△ = 5' } }, ['right']);
  assert.equal(locked.events[0].reason, 'gates', 'exit refuses while any gate equation is false');
  assert.deepEqual(locked.events[0].falseGates, [[1, 1]]);
  const s0 = parseLevel({ name: 't', map: ['#@E#', '#A.#'], lanes: { '△': { row: 1 } }, doors: { A: '△ = 5' } });
  assert.equal(step(s0, 'right').state, s0, 'a refused exit returns the same state (no phantom undo step)');
  const g = run({ name: 't', map: ['#@4AE#'], lanes: { '△': { row: 0 } }, doors: { A: '△ = 9' } }, ['right']);
  assert.deepEqual(g.events[0].sides, [4, 9], 'gate bump shows the lane total vs target');
  const pre = parseLevel({ name: 't', map: ['#@.#', '#5A#'], lanes: { '△': { row: 1 } }, doors: { A: '△ = 5' } });
  assert.equal(pre.objects.find(o => o.gate).open, true, 'gate true at load starts open');
  assert.ok(!locked.state.won);
});

test('a lane with an operator in it reads ? and makes no gate true', () => {
  const s = parseLevel({ name: 't', map: ['#@...#', '#3-2.#'], lanes: { '△': { row: 1 } } });
  assert.ok(Number.isNaN(laneValues(s)['△']));
});

test('gates reject keys; operators into doors bounce as socket; 0 fills no trench', () => {
  const g = run({ name: 't', map: ['#@4AE#'], lanes: { '△': { row: 0 } }, doors: { A: '△ = 9' } }, ['right']);
  assert.equal(g.events[0].reason, 'gate');
  assert.equal(run({ name: 't', map: ['#@+AE#'], doors: { A: 3 } }, ['right']).events[0].reason, 'socket');
  const z = run({ name: 't', map: ['#@0oo#'], doors: {} }, ['right']);
  assert.equal(z.events[0].reason, 'zero-fill');
  assert.equal(z.state.objects.length, 1, '0 is still there');
});

test('□ doors can reference lanes; unknown symbols are rejected', () => {
  const ok = run({ name: 't', map: ['#@4AE#', '#3...#'], lanes: { '○': { row: 1 } }, doors: { A: '□ = ○ + 1' } }, ['right', 'right', 'right']);
  assert.ok(ok.state.won);
  assert.throws(() => parseLevel({ name: 't', map: ['#@A#'], doors: { A: '◇ = 2' } }), /bad door/);
  assert.doesNotThrow(() => parseLevel({ name: 't', map: ['#@A#'], doors: { A: '3 - 5 + □ = 4' } }), 'negatives are real now');
  assert.doesNotThrow(() => parseLevel({ name: 't', map: ['#@A#'], doors: { A: '3 + □ - 1 = 4' } }));
});

test('crossing lanes: a block at the crossing counts in both', () => {
  const s = parseLevel({ name: 't', map: ['#@..#', '#.4.#', '#...#'], lanes: { '△': { row: 1 }, '○': { col: 2 } } });
  assert.deepEqual(laneValues(s), { '△': 4, '○': 4 });
});


test('a gate wedged open by a block while its equation is false is flagged held', () => {
  const lvl = { name: 't', map: ['#....#', '#@2A3#', '#....#'], lanes: { '△': { row: 1 } }, doors: { A: '△ = 5' } };
  const gate = moves => run(lvl, moves).state.objects.find(o => o.gate);
  assert.ok(gate(['right']).open && !gate(['right']).held, 'true gate is open, not held');
  const g = gate(['right', 'up', 'right', 'right', 'down']); // pull the 3 out: △ = 2
  assert.ok(g.open && g.held, 'the 2 wedges it open while △ = 5 is false');
});
