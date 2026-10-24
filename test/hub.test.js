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
test('site doors: enter with the right party, bounce with the missing heroes, a pair world with levels opens', () => {
  let r = step(from(newCraft(), 14, 2), 'up');
  assert.deepEqual([r.events[0].reason, r.events[0].missing], ['needs', ['pythagoras']]);
  r = step(from(newCraft(['alexandria', 'croton'], ['pythagoras']), 14, 2), 'up');
  assert.deepEqual(r.events[0], { type: 'enter', world: 'ujjain', at: { x: 14, y: 1 } });
  assert.equal(step(from(newCraft(), 1, 10), 'up').events[0].world, 'camp');
  assert.equal(step(from(newCraft(['alexandria', 'ujjain'], ['euclid', 'brahmagupta']), 25, 2), 'up').events[0].world, 'distrib'); // has a level now
  const back = atSite(newCraft(), 'motion');
  assert.deepEqual([back.player.x, back.player.y], [SITES.motion[0], SITES.motion[1] + 1]);
});

test('every world door has a free cell inside it to come back to (finished or left early)', () => {
  for (const id of Object.keys(SITES)) {
    const s = atSite(newCraft(), id), [x, y] = SITES[id];
    assert.equal(Math.abs(s.player.x - x) + Math.abs(s.player.y - y), 1, id);
    assert.equal(s.tiles[s.player.y][s.player.x], '.', id);
  }
});
test('heroes in Craft: Euclid slides (one move of time) and curls a block into a pit; Tab is free', () => {
  let s = from(newCraft(['alexandria'], ['euclid']), 1, 6);
  s = step(s, 'right').state;
  assert.deepEqual([s.player.x, s.t], [9, 1]);
  s = from(newCraft(['alexandria'], ['euclid']), 7, 8);
  s.objects.push({ id: 99, x: 8, y: 8, kind: 'num', value: 3 });
  const r = step(s, 'right');
  assert.ok(r.events.some(e => e.type === 'land'));
  assert.equal(heightAt(r.state, 10, 8), 0, 'the craft step ran: the 3 filled the −3');
  const t = step(newCraft(['alexandria'], ['tally', 'euclid']), 'swap').state;
  assert.deepEqual([t.mover, t.t], ['euclid', 0]);
  assert.deepEqual(choose(newCraft(['alexandria']), ['euclid']).state.cast, ['euclid'], 'picked at camp');
  assert.equal(choose(from(newCraft(['alexandria']), 9, 8), ['euclid']).events[0].reason, 'camp', 'only at camp');
});
test('Pythagoras leaps the 1-wide river; Brahmagupta flips its ground, −3 to a 3 hill and back', () => {
  const p = step(from(newCraft(['alexandria'], ['pythagoras']), 9, 8), 'right').state;
  assert.equal(p.player.x, 11);
  let b = from(newCraft([], ['brahmagupta']), 9, 8);
  b = step(b, 'right').state;
  assert.equal(heightAt(b, 10, 8), 0);
  assert.deepEqual(b.objects.filter(o => o.x === 10 && o.y === 8).map(o => [o.value, o.land]), [[3, true]]);
  b = step(b, 'right').state;
  assert.equal(heightAt(b, 10, 8), -3);
  assert.equal(b.player.x, 9);
});
