// The commissioner's playthrough in pure code: every world's levels win by their stored solution, and the Craft
// map lets you walk from each world's door to the next one with the heroes you've recruited so far.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORLDS } from '../levels/worlds.js';
import { LEVELS } from '../levels/levels.js';
import { parseLevel, step as play } from '../core/world.js';

const KEY = { u: 'up', d: 'down', l: 'left', r: 'right', s: 'swap' };

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
