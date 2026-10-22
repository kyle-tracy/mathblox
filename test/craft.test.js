import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newCraft, step, pits, heightAt, DAY, START_HEAT } from '../core/craft.js';

const run = (s, acts) => acts.reduce((st, a) => step(st, a).state, s);
const at = (s, x, y) => s.objects.find(o => o.x === x && o.y === y);
const ACTS = 'up up left left left down right right grab down down grab right right'.split(' ');

test('craft is deterministic: same actions, same world', () => {
  assert.equal(JSON.stringify(run(newCraft(), ACTS)), JSON.stringify(run(newCraft(), ACTS)));
});

test('merge then feed: 2+3 burns as 5 (the puzzle engine does the math)', () => {
  let s = newCraft();
  s.player = { x: 8, y: 2 }; s.facing = 'left';
  s = run(s, ['left', 'left']); // 3 slides to the +, then 2 + 3 calculates
  assert.equal(at(s, 4, 2)?.value, 5);
  s = run(s, ['left', 'grab']);
  assert.deepEqual(s.bag.map(o => o.value), [5]);
  s.player = { x: 2, y: 3 }; s.facing = 'down'; // stand above the fire
  const r = step(s, 'grab');
  assert.equal(r.events[0].type, 'feed');
  assert.equal(r.state.fire, s.fire + 5 - (r.state.t % 8 === 0 ? 1 : 0));
});

test('pit math: a −3 run takes 3 to become 0; 2 leaves −1; 4 bounces', () => {
  const s = newCraft();
  assert.equal(heightAt(s, 10, 6), -3);
  const put = (v, st = s, x = 9) => { const c = structuredClone(st); c.player = { x, y: 6 }; c.facing = 'right'; c.objects = c.objects.filter(o => !(o.x === 9 && o.y === 6)); c.bag = [{ id: 99, kind: 'num', value: v }]; return step(c, 'grab'); };
  const three = put(3);
  assert.equal(three.events[0].type, 'fill');
  assert.equal(heightAt(three.state, 10, 6), 0);
  assert.equal(three.state.tiles[6].slice(10, 13), '...');
  const two = put(2);
  assert.equal(heightAt(two.state, 12, 6), -1);
  assert.equal(put(1, two.state, 11).state.tiles[6][12], '.', '−1 + 1 = 0');
  assert.equal(put(4).events[0].reason, 'too-long');
  assert.equal(put(-2).events[0].reason, 'not-whole');
  assert.equal(pits(s).filter(p => p.y === 6).map(p => p.height).join(), '-3,-5,-2');
});

test('doze: when the fire runs out you wake at camp next morning, nothing lost', () => {
  let s = newCraft();
  s = run(s, ['up', 'up', 'down', 'down']); // wander
  s.bag = [{ id: 99, kind: 'num', value: 7 }];
  const objects = JSON.stringify(s.objects);
  let r, n = 0;
  do { r = step(s, n % 2 ? 'up' : 'down'); s = r.state; n++; } while (!r.events.some(e => e.type === 'doze') && n < 200);
  assert.ok(n < 200, 'dozed');
  assert.deepEqual(s.player, { x: s.camp.x + 1, y: s.camp.y });
  assert.equal(s.fire, START_HEAT);
  assert.equal(s.t % DAY, 0, 'morning');
  assert.deepEqual(s.bag.map(o => o.value), [7]);
  assert.equal(JSON.stringify(s.objects), objects);
});

test('bumps cost no time; 0 and −2 never feed the fire', () => {
  const s = newCraft(); s.player = { x: 3, y: 4 }; s.facing = 'left';
  const r = step(s, 'left'); // walk into the fire with nothing to push
  assert.equal(r.events[0].type, 'bounce');
  assert.equal(r.state.t, 0);
  const c = structuredClone(s); c.player = { x: 2, y: 3 }; c.facing = 'down';
  c.bag = [{ id: 99, kind: 'num', value: -2 }];
  assert.equal(step(c, 'grab').events[0].reason, 'not-whole');
  c.bag = [{ id: 99, kind: 'num', value: 0 }];
  assert.equal(step(c, 'grab').events[0].reason, 'zero-fill');
});

test('pits fill only across: a 5 dropped down a filled bridge column bounces', () => {
  let s = newCraft();
  s.player = { x: 9, y: 6 }; s.facing = 'right'; s.objects = s.objects.filter(o => !(o.x === 9 && o.y === 6));
  s.bag = [{ id: 98, kind: 'num', value: 3 }];
  s = step(s, 'grab').state; // bridge row 6
  s.player = { x: 10, y: 6 }; s.facing = 'up'; s.bag = [{ id: 99, kind: 'num', value: 5 }];
  const r = step(s, 'grab');
  assert.equal(r.events[0].type, 'bounce');
  assert.deepEqual(r.state.tiles, s.tiles);
  s.tiles[7] = s.tiles[7].slice(0, 10) + '...' + s.tiles[7].slice(13); // a second bridge on row 7
  s.objects.push({ id: 97, x: 10, y: 6, kind: 'num', value: 1 }); s.player = { x: 10, y: 7 };
  const p = step(s, 'up'); // the 1 would drop into (10,5), down a column
  assert.equal(p.events[0].type, 'bounce', 'pushing up into the pit column bounces too');
  assert.deepEqual(p.state.tiles, s.tiles);
});
