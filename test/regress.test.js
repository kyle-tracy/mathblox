// Regressions from the P2 gates (Testo). A `todo` test is a known open bug: it runs, but does not fail CI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLevel, step, laneValues } from '../core/world.js';
import { LEVELS } from '../levels/levels.js';
import { solve, key } from './solver.js';

const lvl = name => LEVELS.find(l => l.name === name);
const play = (l, moves) => [...moves].reduce((s, m) => step(s, { u: 'up', d: 'down', l: 'left', r: 'right' }[m]).state, parseLevel(l));

// No first push may lose the level (P2: L10/L13's push straight at the door; P2 re-run #2 made it all levels). Every
// push the player can make before any other push is tried, and the level must stay winnable after it. `todo` = known
// open dead end (gate-p2-testo-rerun2.md); delete the name from FIRST_PUSH_TODO once the level is fixed.
const FIRST_PUSH_TODO = ['Mind the Gap', 'Short by One', 'Many Ways to Eight', 'Turn It Around', 'One Family', 'The Box Counts', 'Take It Out', 'Same to Both Sides'];
const deadFirstPushes = l => {
  const s0 = parseLevel(l), seen = new Set([key(s0)]), walks = [s0], dead = [];
  for (const s of walks) for (const d of ['up', 'down', 'left', 'right']) {
    const { state, events } = step(s, d);
    if (state.won) continue;
    if (events.some(e => e.type !== 'move' && e.type !== 'bounce')) {
      if (seen.has('P' + key(state))) continue;
      seen.add('P' + key(state));
      let ok; try { ok = solve(state, 3e6) !== null; } catch { ok = false; } // cap hit counts as not proven winnable
      if (!ok) dead.push(`${d} from ${s.player.x},${s.player.y}`);
    } else if (events[0]?.type === 'move' && !seen.has(key(state))) { seen.add(key(state)); walks.push(state); }
  }
  return dead;
};
// ponytail: these take 10 s to 30 min each (exhausting dead ends, big lane graphs); they run only with SLOW=1 (the gate run).
const HEAVY = [...FIRST_PUSH_TODO, 'The Shrinking Side', 'Big Box', 'Crossroads', 'Sandbox'];
for (const l of LEVELS) test(`"${l.name}": every first push keeps the level winnable`,
  { todo: FIRST_PUSH_TODO.includes(l.name), skip: HEAVY.includes(l.name) && !process.env.SLOW && 'heavy: SLOW=1 node --test test/' }, () => assert.deepEqual(deadFirstPushes(l), [], 'dead-end first pushes'));

// Lane cheese: the win must come from the intended lane totals, with every gate true at once.
const WANT = { 'Into the Box': { '△': 5 }, 'Big Box': { '△': 9 }, 'Two Triangles Again': { '△': 4 }, 'The Box Counts': { '△': 5 }, 'Take It Out': { '△': 6 }, 'Two Triangles': { '△': 4 },
  'The Shrinking Side': { '△': 7 }, 'Same to Both Sides': { '△': 5, '○': 5 }, Crossroads: { '△': 6, '○': 4 } };
for (const [name, want] of Object.entries(WANT)) test(`"${name}" is won with the intended lane totals`, () => {
  const path = solve(parseLevel(lvl(name)));
  const before = play(lvl(name), path.slice(0, -1).map(d => d[0]).join(''));
  assert.deepEqual(laneValues(before), want);
});

test('a gate held open by a block standing in it does not let the exit through', () => {
  // △ is row 2. 5 down into the lane opens A; push a 1 into the open gate; take the 5 out: A is false but stays open.
  const l = { name: 't', map: ['#@....#', '#.5.1.#', '#.....#', '#.....#', '#.A.E.#'], lanes: { '△': { row: 2 } }, doors: { A: '△ = 5' } };
  let s = parseLevel(l); const go = m => { const r = step(s, m); s = r.state; return r; };
  for (const m of ['right', 'down']) go(m); // 5 into row 2: gate opens
  assert.ok(s.objects.find(o => o.gate).open);
  assert.deepEqual(laneValues(s), { '△': 5 });
  const q = { ...s, objects: s.objects.map(o => (o.value === 1 ? { ...o, x: 2, y: 4 } : o.value === 5 ? { ...o, y: 3 } : o)), player: { x: 3, y: 4 } };
  const r = step(q, 'right');
  assert.equal(r.events[0].reason, 'gates', 'exit refuses: △ = 0 now, even though gate A is still standing open');
});

test('"?" lanes: an operator in each lane never makes △ = ○ true (NaN is not equal to NaN)', () => {
  const s = parseLevel({ name: 't', map: ['#@AE#', '#+..#', '#-..#'], lanes: { '△': { row: 1 }, '○': { row: 2 } }, doors: { A: '△ = ○' } });
  assert.equal(s.objects.find(o => o.gate).open, false);
  assert.equal(step(s, 'right').events[0].reason, 'door');
});
