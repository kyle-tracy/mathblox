// The commissioner's playthrough in pure code: every world's levels win by their stored solution, and the Craft
// map lets you walk from each world's door to the next one with the heroes you've recruited so far.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORLDS } from '../levels/worlds.js';
import { LEVELS } from '../levels/levels.js';
import { parseLevel, step as play } from '../core/world.js';
import { newCraft, step, atSite } from '../core/craft.js';
import { recruits, stonesLit } from '../core/progress.js';

const KEY = { u: 'up', d: 'down', l: 'left', r: 'right', s: 'swap' };
const SOLO = ['camp', 'alexandria', 'croton', 'ujjain', 'elea'];
const byId = id => WORLDS.find(w => w.id === id);

test('every placed level resolves and its stored solution wins', () => {
  for (const w of WORLDS.filter(w => w.levels.length)) for (const name of w.levels) {
    const lv = LEVELS.find(l => l.name === name);
    assert.ok(lv, `${w.id}: "${name}" not in LEVELS`);
    assert.ok(lv.solution, `${name}: no stored solution`);
    let s = parseLevel(lv);
    for (const c of lv.solution) s = play(s, KEY[c]).state;
    assert.ok(s.won, `${w.id}: "${name}" solution does not win`);
  }
});

// ponytail: keyed on player x,y and mover (Tab is free); ground, blocks, time and heat are left out of the key (a found path is still real), capped at 20k states.
function reaches(start, id) {
  const seen = new Set([`${start.player.x},${start.player.y},${start.mover}`]), q = [start];
  while (q.length && seen.size < 20000) {
    const s = q.shift();
    for (const d of ['up', 'down', 'left', 'right', 'swap']) {
      const r = step(s, d);
      if (r.events.some(e => e.type === 'enter' && e.world === id)) return true;
      const k = `${r.state.player.x},${r.state.player.y},${r.state.mover}`;
      if (!seen.has(k)) { seen.add(k); q.push(r.state); }
    }
  }
  return false;
}
const partyFor = id => (byId(id).needs.length ? byId(id).needs : ['tally']);

test('walk the map: from each finished world to the next solo world, then the built pair worlds', () => {
  const done = [];
  for (let i = 0; i < SOLO.length; i++) {
    const id = SOLO[i], from = i ? SOLO[i - 1] : 'camp';
    assert.ok(reaches(atSite(newCraft(done, partyFor(id)), from), id), `cannot reach ${id} from ${from} with done=${done}`);
    done.push(id);
    if (byId(id).hero) assert.ok(recruits(done).includes(byId(id).hero), `${byId(id).hero} not recruited`);
  }
  for (const id of ['distrib', 'vectors'])
    assert.ok(reaches(atSite(newCraft(done, partyFor(id)), 'elea'), id), `cannot reach ${id} after all solo worlds`);
});

test('the Storm Keep: with all 4 heroes, walk each landing in tier order, then the pool; every stone is lit', () => {
  const done = [...SOLO];
  assert.equal(stonesLit(done), 5);
  for (const [id, from] of [['keep-euclid', 'elea'], ['keep-pythagoras', 'keep-euclid'], ['keep-brahmagupta', 'keep-pythagoras'], ['keep-zeno', 'keep-brahmagupta'], ['dungeon', 'keep-zeno']]) {
    assert.ok(reaches(atSite(newCraft(done, ['tally']), from), id), `cannot reach ${id} from ${from} with done=${done}`);
    done.push(id);
  }
  assert.equal(stonesLit(done), 5, 'landings light no stones');
});
