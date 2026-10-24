// Every world level exists, appears once, and every hero named has a module.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORLDS } from '../levels/worlds.js';
import { LEVELS } from '../levels/levels.js';
import { HEROES } from '../core/heroes.js';

test('world levels exist and appear in one world only', () => {
  const names = WORLDS.flatMap(w => w.levels);
  for (const n of names) assert.ok(LEVELS.some(l => l.name === n), `"${n}" is not a level`);
  assert.equal(new Set(names).size, names.length, 'a level is in two worlds');
});
test('world heroes and needs are real heroes', () => {
  for (const w of WORLDS) for (const h of [w.hero, ...w.needs].filter(h => h && !h.startsWith('pairs:'))) assert.ok(HEROES[h], `${w.id}: ${h}`);
});
