// Heroes are modules: every hero has a rule (core/heroes.js), data (levels/characters.js) and a look (render/cast.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HEROES } from '../core/heroes.js';
import { parseLevel, step } from '../core/world.js';
import { CHARACTERS } from '../levels/characters.js';

const look = readFileSync(new URL('../render/cast.js', import.meta.url), 'utf8');
for (const id of Object.keys(HEROES)) test(`hero "${id}" is complete and bounces off walls`, () => {
  assert.ok(CHARACTERS[id]?.name && CHARACTERS[id].trivia, 'data in levels/characters.js');
  assert.ok(look.includes(id), 'a look in render/cast.js');
  const s = parseLevel({ name: 't', map: ['###', '#@#', '###'], cast: [id] });
  for (const d of ['up', 'down', 'left', 'right']) assert.equal(step(s, d).state, s);
});

test('Euclid curls: a pushed block slides with him until stopped', () => {
  const s = parseLevel({ name: 't', map: ['#@4....#'], cast: ['euclid'] });
  const r = step(s, 'right');
  assert.equal(r.state.objects[0].x, 6);
  assert.equal(r.state.player.x, 5);
});

test('Euclid curls until the block hits math, and it calculates on impact', () => {
  const r = step(parseLevel({ name: 't', map: ['#@2...+3.#'], cast: ['euclid'] }), 'right');
  assert.ok(r.events.some(e => e.type === 'merge'));
  assert.deepEqual(r.state.objects.map(o => o.value), [5]);
});

test('several bodies: swap hands control over; the body you leave is solid', () => {
  let s = parseLevel({ name: 't', map: ['#@....#', '#.....#'], cast: ['euclid'], bodies: [{ id: 'pythagoras', x: 5, y: 1 }] });
  s = step(s, 'down').state; // Euclid slides to the bottom row
  s = step(s, 'swap').state;
  assert.equal(s.mover, 'pythagoras');
  assert.deepEqual(s.others, [{ id: 'euclid', x: 1, y: 1 }]);
  s = step(s, 'left').state; // leaps 2 to x=3
  assert.equal(s.player.x, 3);
  s = step(step(s, 'swap').state, 'right').state; // Euclid slides right and stops against Pythagoras
  assert.equal(s.player.x, 2);
});

test('a change pad turns your body into its hero and ends a slide', () => {
  const s = parseLevel({ name: 't', map: ['#@..*..#'], cast: ['euclid'], pads: { '4,0': 'zeno' } });
  const r = step(s, 'right');
  assert.equal(r.state.player.x, 4);
  assert.equal(r.state.mover, 'zeno');
  assert.ok(r.events.some(e => e.type === 'change'));
});

test('a pad without a hero is a level error', () => {
  assert.throws(() => parseLevel({ name: 't', map: ['#@*#'] }), /pad 2,0 has no hero/);
});

test('Pythagoras brackets: leaping across a sign calculates its two neighbours where the sign was', () => {
  // 9 − 4 − 2 in row 1; he stands above a − and leaps down across it.
  let s = parseLevel({ name: 't', map: ['#.@....#', '#9-4-2.#', '#......#'], cast: ['pythagoras'] });
  let r = step(s, 'down'); // across the first −: (9 − 4)
  assert.equal(r.events.find(e => e.type === 'bracket').value, 5);
  assert.deepEqual(r.state.objects.filter(o => o.kind === 'num').map(o => o.value).sort(), [2, 5]);
  s = parseLevel({ name: 't', map: ['#...@..#', '#9-4-2.#', '#......#'], cast: ['pythagoras'] });
  r = step(s, 'down'); // across the second −: (4 − 2)
  assert.equal(r.events.find(e => e.type === 'bracket').value, 2);
});

test('Pythagoras bracket over ÷0 is the storm, and nothing moves', () => {
  const s = parseLevel({ name: 't', map: ['#.@..#', '#5÷0.#', '#....#'], cast: ['pythagoras'] });
  assert.equal(step(s, 'down').state, s);
});

test('brackets chain: a result feeds the next sign across the gap it left', () => {
  const at = x => parseLevel({ name: 't', map: ['#.....@#', '#9-4-2.#', '#......#'], cast: ['pythagoras'] });
  let s = at(); s.player = { x: 2, y: 0 };
  s = step(s, 'down').state; // (9 − 4) = 5 at x2
  s.player = { x: 4, y: 2 };
  const r = step(s, 'up'); // across the second −: 5 − 2
  assert.equal(r.events.find(e => e.type === 'bracket').value, 3);
  let t = at(); t.player = { x: 4, y: 0 };
  t = step(t, 'down').state; // (4 − 2) = 2 at x4
  t.player = { x: 2, y: 2 };
  assert.equal(step(t, 'up').events.find(e => e.type === 'bracket').value, 7, '9 − (4 − 2)');
});
