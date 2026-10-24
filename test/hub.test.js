// The hub (spec §3, step 4): progress rules, site doors and their needs, heroes moving on Craft's open ground.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recruits, canEnter, missing, parties } from '../core/progress.js';
import { newCraft, step, heightAt, atSite, choose, SITES } from '../core/craft.js';

test('recruits: Tally always, plus the hero of each finished solo world', () => {
  assert.deepEqual(recruits([]), ['tally']);
  assert.deepEqual(recruits(['camp', 'alexandria', 'distrib']), ['tally', 'euclid']);
});
test('canEnter: the party must hold every needed recruit; the dungeon needs 2 pair worlds done', () => {
  assert.equal(canEnter('alexandria', ['tally'], []), true);
  assert.deepEqual(missing('croton', ['tally'], ['alexandria']), ['euclid']);
  assert.equal(canEnter('croton', ['euclid'], ['alexandria']), true);
  assert.equal(canEnter('croton', ['euclid'], []), false, 'not recruited yet');
  assert.deepEqual(missing('dungeon', [], ['distrib']), ['pairs:2']);
  assert.equal(canEnter('dungeon', [], ['distrib', 'motion']), true);
  assert.deepEqual(parties(['tally', 'euclid']), [['tally'], ['euclid'], ['tally', 'euclid']]);
});

const from = (s, x, y) => { s.player = { x, y }; return s; };
test('site doors: enter with the right party, bounce with the missing heroes, pair worlds not built say soon', () => {
  let r = step(from(newCraft(), 14, 1), 'up');
  assert.deepEqual([r.events[0].reason, r.events[0].missing], ['needs', ['pythagoras']]);
  r = step(from(newCraft(['alexandria', 'croton'], ['pythagoras']), 14, 1), 'up');
  assert.deepEqual(r.events[0], { type: 'enter', world: 'ujjain', at: { x: 14, y: 0 } });
  assert.equal(step(from(newCraft(), 1, 4), 'left').events[0].world, 'camp');
  assert.equal(step(from(newCraft(['alexandria', 'ujjain'], ['euclid', 'brahmagupta']), 25, 1), 'up').events[0].reason, 'soon');
  const back = atSite(newCraft(), 'motion');
  assert.deepEqual([back.player.x, back.player.y], [SITES.motion[0] - 1, SITES.motion[1]]);
});

test('heroes in Craft: Euclid slides (one move of time) and curls a block into a pit; Tab is free', () => {
  let s = from(newCraft(['alexandria'], ['euclid']), 1, 1);
  s = step(s, 'right').state;
  assert.deepEqual([s.player.x, s.t], [9, 1]);
  s = from(newCraft(['alexandria'], ['euclid']), 7, 3);
  s.objects.push({ id: 99, x: 8, y: 3, kind: 'num', value: 3 });
  const r = step(s, 'right');
  assert.ok(r.events.some(e => e.type === 'land'));
  assert.equal(heightAt(r.state, 10, 3), 0, 'the craft step ran: the 3 filled the −3');
  const t = step(newCraft(['alexandria'], ['tally', 'euclid']), 'swap').state;
  assert.deepEqual([t.mover, t.t], ['euclid', 0]);
  assert.deepEqual(choose(newCraft(['alexandria']), ['euclid']).state.cast, ['euclid'], 'picked at camp');
  assert.equal(choose(from(newCraft(['alexandria']), 9, 3), ['euclid']).events[0].reason, 'camp', 'only at camp');
});
test('Pythagoras leaps the 1-wide river; Brahmagupta flips its ground, −3 to a 3 hill and back', () => {
  const p = step(from(newCraft(['alexandria'], ['pythagoras']), 9, 3), 'right').state;
  assert.equal(p.player.x, 11);
  let b = from(newCraft([], ['brahmagupta']), 9, 3);
  b = step(b, 'right').state;
  assert.equal(heightAt(b, 10, 3), 0);
  assert.deepEqual(b.objects.filter(o => o.x === 10 && o.y === 3).map(o => [o.value, o.land]), [[3, true]]);
  b = step(b, 'right').state;
  assert.equal(heightAt(b, 10, 3), -3);
  assert.equal(b.player.x, 9);
});
