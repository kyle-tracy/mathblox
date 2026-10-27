import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newCraft, step, heightAt, bagSize, DAY } from '../core/craft.js';

const run = (s, acts) => acts.reduce((st, a) => step(st, a).state, s);
const at = (s, x, y) => s.objects.find(o => o.x === x && o.y === y);
const ACTS = 'up up left left left down right right grab down down grab right right'.split(' ');

test('craft is deterministic: same actions, same world', () => {
  assert.equal(JSON.stringify(run(newCraft(), ACTS)), JSON.stringify(run(newCraft(), ACTS)));
});

test('merge then feed: 2+3 burns as 5 (the puzzle engine does the math)', () => {
  let s = newCraft();
  s.player = { x: 8, y: 7 }; s.facing = 'left';
  s = run(s, ['left', 'left']); // 3 slides to the +, then 2 + 3 calculates
  assert.equal(at(s, 4, 7)?.value, 5);
  s = run(s, ['left', 'grab']);
  assert.deepEqual(s.bag.map(o => o.value), [5]);
  s.player = { x: 2, y: 8 }; s.facing = 'down'; // stand above the fire
  const r = step(s, 'grab');
  assert.equal(r.events[0].type, 'feed');
  assert.equal(r.state.fire, s.fire + 5);
});

test('land is a number: −3 + 3 = 0, −3 + 2 = −1, −3 + 5 = 2 (a hill block), −3 + (−2) = −5', () => {
  const s = newCraft();
  assert.equal(heightAt(s, 10, 11), -3);
  const put = (v, st = s) => { const c = structuredClone(st); c.player = { x: 9, y: 11 }; c.facing = 'right'; c.objects = c.objects.filter(o => !(o.x === 9 && o.y === 11)); c.bag = [{ id: 99, kind: 'num', value: v }]; return step(c, 'grab'); };
  const three = put(3);
  assert.equal(heightAt(three.state, 10, 11), 0);
  assert.equal(three.state.tiles[11][10], '.');
  const two = put(2);
  assert.equal(heightAt(two.state, 10, 11), -1);
  assert.equal(heightAt(put(1, two.state).state, 10, 11), 0, '−1 + 1 = 0');
  const five = put(5);
  assert.equal(heightAt(five.state, 10, 11), 0);
  assert.equal(at(five.state, 10, 11).value, 2, 'the 2 left over stands as a hill');
  assert.equal(at(five.state, 10, 11).land, true, 'a hill carries the land attribute, so it looks unlike a carried 2');
  assert.equal(heightAt(put(-2).state, 10, 11), -5, 'a negative block digs deeper');
  assert.equal(put(0).events[0].reason, 'zero-fill');
});

test('pits fill from any side: push a 3 down into a −3', () => {
  const s = newCraft();
  s.tiles[10] = s.tiles[10].slice(0, 10) + '.' + s.tiles[10].slice(11); delete s.ground['10,10']; // stand-in bridge cell
  s.objects.push({ id: 97, x: 10, y: 10, kind: 'num', value: 3 }); s.player = { x: 10, y: 9 }; delete s.ground['10,9']; s.tiles[9] = s.tiles[9].slice(0, 10) + '.' + s.tiles[9].slice(11);
  const r = step(s, 'down');
  assert.equal(heightAt(r.state, 10, 11), 0);
  assert.equal(r.state.tiles[11][10], '.');
});

test('rocks regrow at dawn where their cell is empty', () => {
  let s = newCraft();
  s.objects = s.objects.filter(o => !(o.x === 5 && o.y === 11)); // the 9 is gone (burned)
  s.objects.push({ id: 200, x: 4, y: 7, kind: 'num', value: 1 }); // and something sits on the 2's spot
  s.objects = s.objects.filter(o => !(o.x === 4 && o.y === 7 && o.id !== 200));
  s.fire = 99; s.t = DAY - 1;
  s.player = { x: 3, y: 8 };
  s = step(s, 'up').state;
  assert.equal(at(s, 5, 11)?.value, 9);
  assert.equal(at(s, 4, 7)?.value, 1, 'an occupied spawn stays as it is');
  const again = (t) => { const c = newCraft(); c.fire = 99; c.t = t; c.player = { x: 3, y: 8 }; return JSON.stringify(step(c, 'up').state); };
  assert.equal(again(DAY - 1), again(DAY - 1), 'deterministic');
});

test('by day, from the start: a "?" creature waits past the first river; the right value tames it, a wrong one makes it hop', () => {
  const s = newCraft(), m = s.objects.find(o => o.mimic);
  assert.ok(m && m.x > 10, 'past the first river');
  assert.equal(m.value, '□+3=8');
  const give = (v, how) => { const c = structuredClone(s); c.player = { x: m.x - 2, y: m.y }; c.facing = 'right';
    if (how === 'push') { c.objects.push({ id: 300, x: m.x - 1, y: m.y, kind: 'num', value: v }); return step(c, 'right'); }
    c.player.x++; c.bag = [{ id: 300, kind: 'num', value: v }]; return step(c, 'grab'); };
  for (const how of ['push', 'place']) {
    const ok = give(5, how);
    assert.ok(ok.events.some(e => e.type === 'tame'), how);
    assert.ok(ok.state.pet && !ok.state.objects.some(o => o.mimic));
    assert.equal(bagSize(ok.state), 1, 'one held block, pet or not (2026-10-27)');
    const no = give(4, how), m2 = no.state.objects.find(o => o.mimic);
    assert.ok(no.events.some(e => e.type === 'hop'), how);
    assert.ok(m2.x !== m.x || m2.y !== m.y, 'hopped to another spot');
    assert.equal(no.state.pet, null);
  }
});

test('each dawn brings a fresh equation; a tamed creature brings none', () => {
  const s = newCraft(); s.t = DAY - 1; s.player = { x: 3, y: 8 };
  assert.equal(step(s, 'up').state.objects.find(o => o.mimic)?.value, '□+1=5');
  const p = { ...newCraft(), t: DAY - 1, player: { x: 3, y: 8 }, pet: { x: 4, y: 8 } }; p.objects = p.objects.filter(o => !o.mimic);
  assert.ok(!step(p, 'up').state.objects.some(o => o.mimic));
});

test('bumps cost no time; 0 and −2 never feed the fire', () => {
  const s = newCraft(); s.player = { x: 3, y: 9 }; s.facing = 'left';
  const r = step(s, 'left'); // walk into the fire with nothing to push
  assert.equal(r.events[0].type, 'bounce');
  assert.equal(r.state.t, 0);
  const c = structuredClone(s); c.player = { x: 2, y: 8 }; c.facing = 'down';
  c.bag = [{ id: 99, kind: 'num', value: -2 }];
  assert.equal(step(c, 'grab').events[0].reason, 'not-whole');
  c.bag = [{ id: 99, kind: 'num', value: 0 }];
  assert.equal(step(c, 'grab').events[0].reason, 'zero-fill');
});
