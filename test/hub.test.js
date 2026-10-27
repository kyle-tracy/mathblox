// The hub (spec §3, step 4): progress rules, site doors and their needs, heroes moving on Craft's open ground.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recruits, canEnter, missing, stonesLit } from '../core/progress.js';

test('recruits: Tally always, plus the hero of each finished solo world', () => {
  assert.deepEqual(recruits([]), ['tally']);
  assert.deepEqual(recruits(['camp', 'alexandria', 'distrib']), ['tally', 'euclid']);
});
test('canEnter: the party must hold every needed recruit', () => {
  assert.equal(canEnter('alexandria', ['tally'], []), true);
  assert.deepEqual(missing('croton', ['tally'], ['alexandria']), ['euclid']);
  assert.equal(canEnter('croton', ['euclid'], ['alexandria']), true);
  assert.equal(canEnter('croton', ['euclid'], []), false, 'not recruited yet');
});
const FOUR = ['camp', 'alexandria', 'croton', 'ujjain', 'elea'];
test('the Keep: landings open once all 4 heroes are recruited (any party), the lower tier after the upper, the pool last', () => {
  assert.deepEqual(missing('keep-euclid', ['tally'], FOUR.slice(0, 4)), ['heroes:4']);
  assert.equal(canEnter('keep-euclid', ['tally'], FOUR), true, 'any party');
  assert.equal(canEnter('keep-pythagoras', ['zeno'], FOUR), true, 'any party');
  assert.deepEqual(missing('keep-zeno', ['tally'], [...FOUR, 'keep-euclid']), ['done:keep-pythagoras']);
  assert.equal(canEnter('keep-brahmagupta', ['tally'], [...FOUR, 'keep-euclid', 'keep-pythagoras']), true);
  assert.deepEqual(missing('dungeon', ['tally'], [...FOUR, 'keep-euclid', 'keep-pythagoras', 'keep-zeno']), ['done:keep-brahmagupta']);
});
test('stonesLit: one per finished hero world; landings and pair worlds light none', () => {
  assert.equal(stonesLit([]), 0);
  assert.equal(stonesLit(['camp', 'alexandria', 'distrib', 'keep-euclid']), 2);
  assert.equal(stonesLit(FOUR), 5);
});
