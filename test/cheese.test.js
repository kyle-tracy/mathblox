// Cheese hunt (Testo, P2 gate): with the level's taught event banned, the bot must exhaust the level without winning.
// Stronger than "the shortest solution contains it": NO winning path may skip the skill.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLevel } from '../core/world.js';
import { LEVELS } from '../levels/levels.js';
import { solve } from './solver.js';

for (const lvl of LEVELS) for (const t of lvl.teaches ?? []) {
  test(`"${lvl.name}" cannot be won without ${t}`, () => {
    assert.equal(solve(parseLevel(lvl), 3e6, [t]), null, `won while banning "${t}" (cheese)`);
  });
}
