// Characters (2026-10-23): each moves its own way; swap cycles the cast.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLevel, step } from '../core/world.js';

const lvl = (map, cast) => parseLevel({ name: 't', map, cast });
const go = (s, ...ms) => ms.reduce((st, m) => step(st, m).state, s);

test('default cast is the Tally-Keeper alone; swap does nothing', () => {
  const s = lvl(['#@..#']);
  assert.equal(s.mover, 'tally');
  assert.equal(step(s, 'swap').state, s);
});

test('Euclid slides until something is in the way, then pushes only from adjacent', () => {
  let s = lvl(['#@...2+3.#'], ['euclid']);
  s = go(s, 'right');
  assert.equal(s.player.x, 4, 'stops next to the 2');
  const r = step(s, 'right');
  assert.equal(r.events[0].type, 'merge', 'adjacent push calculates');
});

test('Euclid stops on the exit and wins', () => {
  assert.ok(go(lvl(['#@..E..#'], ['euclid']), 'right').won);
});

test('Zeno goes half the way, rounded up', () => {
  const s = go(lvl(['#@.....#'], ['zeno']), 'right'); // runway 5 -> 3
  assert.equal(s.player.x, 4);
  assert.equal(go(s, 'right', 'right').player.x, 6);
});

test('Pythagoras leaps 2 over a wall or block, never onto one', () => {
  const s = lvl(['#@#.5.#'], ['pythagoras']);
  const a = go(s, 'right');
  assert.equal(a.player.x, 3);
  assert.equal(step(a, 'right').events[0].type, 'leap');
  assert.equal(go(a, 'right').player.x, 5, 'leaps over the 5');
  assert.equal(step(lvl(['#@.5#'], ['pythagoras']), 'right').events[0].type, 'bounce');
});

test('Brahmagupta flips a number to its opposite and + to −, without moving it', () => {
  let s = lvl(['#@3+.#'], ['brahmagupta']);
  s = go(s, 'right');
  assert.equal(s.objects.find(o => o.kind === 'num').value, -3);
  assert.equal(s.player.x, 1);
  assert.equal(go(s, 'right').objects.find(o => o.kind === 'num').value, 3, 'twice is back');
});

test('swap cycles the cast and the next move uses the new character', () => {
  let s = lvl(['#@....#'], ['tally', 'euclid']);
  s = go(s, 'swap');
  assert.equal(s.mover, 'euclid');
  assert.equal(go(s, 'right').player.x, 5);
  assert.equal(go(s, 'swap').mover, 'tally');
});
