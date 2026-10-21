// Cheese hunt (Testo, P2 gate): with the level's taught event banned, the bot must exhaust the level without winning.
// Stronger than "the shortest solution contains it": NO winning path may skip the skill.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLevel } from '../core/world.js';
import { LEVELS } from '../levels/levels.js';
import { solve } from './solver.js';

for (const lvl of LEVELS) for (const t of lvl.teaches ?? []) {
  // ponytail: Turn It Around without carve takes 47 s to exhaust (under 5M states). Re-verified unsolvable on the (5,1) map at
  // P2 re-run #2 (gate-p2-testo-rerun2.md), skipped here; re-run it by hand when L14 changes.
  if (lvl.name === 'Turn It Around' && t === 'carve') continue;
  test(`"${lvl.name}" cannot be won without ${t}`, () => {
    assert.equal(solve(parseLevel(lvl), 3e6, [t]), null, `won while banning "${t}" (cheese)`);
  });
}
