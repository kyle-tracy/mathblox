# Storm Keep Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the demo complete: Camp → 4 solo worlds (each lights a Sumhenge stone) → a walkable stepwell Storm Keep (4 landings in two any-order tiers, then the ÷0 boss pool) → an ending, with the Road's bag cut to one block.

**Architecture:** No new engine. The stepwell is more floor on the Road map (`core/craft.js`), and its five rooms are ordinary sites (`DISTRICTS` entries) whose worlds gate by two new `needs` tokens in `core/progress.js`: `heroes:N` (recruited, any party) and `done:<id>` (tiers). Rooms are puzzle levels in a new `levels/keep.js`. `pairs:N` is deleted (nothing uses it any more).

**Tech Stack:** Vanilla ES modules, canvas, `node --test`. No dependencies.

**Spec:** `docs/superpowers/specs/2026-10-27-storm-keep-demo-design.md`

**Rules for every task:** run `node --test test/ 2>&1 | grep -E "^ℹ (pass|fail)"` before committing (baseline: 151 pass, plus Worldo's Market tests). Commit only your own paths with `git add <paths>`, never `-a`. End each commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push (the CEO pushes). Log decisions in `docs/decisions.md` under Log.

**Sequencing:** Task 1 starts after Worldo's Market build is committed, because both touch `levels/worlds.js`. Tasks 1→2→3 run in order (Axio). Task 4 (Worldo + Matho) and Task 5 (Arto) can run in parallel after Task 2. Task 6 (Testo) follows Task 4. Task 7 (Qualito) is last.

## File map
| File | Change | Owner |
|---|---|---|
| `core/progress.js` | `heroes:N`, `done:id` tokens; delete `pairs:N`; add `stonesLit` | Axio |
| `levels/worlds.js` | 4 landing worlds plus the pool (`dungeon`) with new needs | Axio (CEO ruling) |
| `core/craft.js` | map H 19→27, stepwell floor + 5 sites, `LAYOUT` 5, `BAG` 1 | Axio |
| `craft/play.js` (messages only) | need wording, `host` greet, "beyond the demo", ending line | Axio |
| `levels/keep.js`, `levels/levels.js`, `levels/worlds.js` (level lists) | 4 landings + pool rooms | Worldo, Matho checks |
| `craft/play.js` (drawing) | stepwell art, lit stones, Keep landmark | Arto |
| `test/playthrough.test.js` | walk the Keep end to end | Testo |

---

### Task 1: Progress tokens and the Keep's worlds (Axio)

**Files:**
- Modify: `core/progress.js` (whole file is 15 lines)
- Modify: `levels/worlds.js:21` (the `dungeon` line)
- Modify: `test/worlds.test.js:14`
- Test: `test/hub.test.js:11-17`

- [ ] **Step 1: Write the failing tests.** In `test/hub.test.js`, change the import on line 4 to `import { recruits, canEnter, missing, parties, stonesLit } from '../core/progress.js';`. Replace the test at lines 11-17 (the one titled `canEnter: ... the dungeon needs 2 pair worlds done`) with:

```js
test('canEnter: the party must hold every needed recruit', () => {
  assert.equal(canEnter('alexandria', ['tally'], []), true);
  assert.deepEqual(missing('croton', ['tally'], ['alexandria']), ['euclid']);
  assert.equal(canEnter('croton', ['euclid'], ['alexandria']), true);
  assert.equal(canEnter('croton', ['euclid'], []), false, 'not recruited yet');
});
const FOUR = ['camp', 'alexandria', 'croton', 'ujjain', 'elea'];
test('the Keep: landings open once all 4 heroes are recruited (any party), the lower tier after the upper, the pool last', () => {
  assert.deepEqual(missing('keep-euclid', ['tally'], FOUR.slice(0, 4)), ['heroes:4']);
  assert.equal(canEnter('keep-euclid', ['tally'], FOUR), true, 'any party');
  assert.equal(canEnter('keep-pythagoras', ['zeno'], FOUR), true, 'any party');
  assert.deepEqual(missing('keep-zeno', ['tally'], [...FOUR, 'keep-euclid']), ['done:keep-pythagoras']);
  assert.equal(canEnter('keep-brahmagupta', ['tally'], [...FOUR, 'keep-euclid', 'keep-pythagoras']), true);
  assert.deepEqual(missing('dungeon', ['tally'], [...FOUR, 'keep-euclid', 'keep-pythagoras', 'keep-zeno']), ['done:keep-brahmagupta']);
});
test('stonesLit: one per finished hero world; landings and pair worlds light none', () => {
  assert.equal(stonesLit([]), 0);
  assert.equal(stonesLit(['camp', 'alexandria', 'distrib', 'keep-euclid']), 2);
  assert.equal(stonesLit(FOUR), 5);
});
```

- [ ] **Step 2: Run it and check that it fails.** Run `node --test test/hub.test.js 2>&1 | tail -15`. Expected: FAIL (`stonesLit` is not exported, and world `keep-euclid` is undefined).

- [ ] **Step 3: Implement.** Replace lines 6-14 of `core/progress.js` (from `const isPair` through `canEnter`) with:

```js
// Finishing a solo world recruits its hero; the Tally-Keeper is always with you.
export const recruits = done => [...new Set(['tally', ...done.map(world).filter(w => w?.hero).map(w => w.hero)])];
// Sumhenge: one standing stone lights per finished hero world (Camp included).
export const stonesLit = done => done.map(world).filter(w => w?.hero).length;
// What stops you entering: heroes not in your party; 'heroes:N' while fewer than N heroes (not counting Tally) are
// recruited, whoever you brought; 'done:id' until that world is finished.
export function missing(id, party, done) {
  const have = party.filter(h => recruits(done).includes(h)), heroes = recruits(done).length - 1;
  return world(id).needs.filter(n => (n.startsWith('heroes:') ? heroes < Number(n.slice(7))
    : n.startsWith('done:') ? !done.includes(n.slice(5)) : !have.includes(n)));
}
export const canEnter = (id, party, done) => missing(id, party, done).length === 0;
```

In `levels/worlds.js`, replace the `dungeon` line (line 21) with:

```js
  // The Storm Keep (spec 2026-10-27): a stepwell under the Road. Its landings open once all 4 heroes are recruited, whatever
  // party you bring (the rooms hand you each hero by change pads): upper tier in either order, lower tier, then the pool.
  // `host`: the hero who greets at a landing's door (not `hero`: a landing recruits nobody and lights no stone).
  { id: 'keep-euclid', name: "Euclid's Landing", host: 'euclid', kid: 'slide down the stairs', concept: 'limits: the ÷0 Storm', needs: ['heroes:4'], levels: [] },
  { id: 'keep-pythagoras', name: "Pythagoras's Landing", host: 'pythagoras', kid: 'which two make zero?', concept: 'limits: the ÷0 Storm', needs: ['heroes:4'], levels: [] },
  { id: 'keep-brahmagupta', name: "Brahmagupta's Landing", host: 'brahmagupta', kid: 'is 0÷0 really 0?', concept: 'limits: the ÷0 Storm', needs: ['done:keep-euclid', 'done:keep-pythagoras'], levels: [] },
  { id: 'keep-zeno', name: "Zeno's Landing", host: 'zeno', kid: 'share by less and less', concept: 'limits: the ÷0 Storm', needs: ['done:keep-euclid', 'done:keep-pythagoras'], levels: [] },
  { id: 'dungeon', name: 'The Storm Keep', kid: 'calm the ÷0 Storm', concept: 'limits: the ÷0 Storm', needs: ['done:keep-brahmagupta', 'done:keep-zeno'], levels: [] }, // the pool at the bottom
```

In `test/worlds.test.js:14`, change `.filter(h => h && !h.startsWith('pairs:'))` to `.filter(h => h && !h.includes(':'))`, and make the same line also check `w.host`: `[w.hero, w.host, ...w.needs]`.

- [ ] **Step 4: Run the tests.** Run `node --test test/ 2>&1 | grep -E "^ℹ (pass|fail)"`. Expected: all pass. `craft/play.js:30` still has a `pairs:` branch in `bring`; that is harmless until Task 3 replaces it.

- [ ] **Step 5: Commit.**

```bash
git add core/progress.js levels/worlds.js test/hub.test.js test/worlds.test.js
git commit -m "Progress: heroes:N and done:id needs, stonesLit; the Keep's five worlds (pairs:N deleted)"
```

---

### Task 2: The stepwell on the Road map, bag of one (Axio)

**Files:**
- Modify: `core/craft.js:12` (`BAG`), `:20` (`H`), `:40` (bottom band row), `:48` (`dungeon`), `:56` (`LAYOUT`), `:59-71` (`craftMap`), `:84` (`bagSize`)
- Test: `test/craft.test.js:78`, `test/craft-districts.test.js` (existing tests are the acceptance check)

- [ ] **Step 1: Update the bag test first.** In `test/craft.test.js:78`, replace `assert.equal(bagSize(ok.state), 4, 'the helper doubles the bag');` with `assert.equal(bagSize(ok.state), 1, 'one held block, pet or not (2026-10-27)');`. Run `node --test test/craft.test.js 2>&1 | tail -5`. Expected: FAIL (4 ≠ 1).

- [ ] **Step 2: Bag of one.** In `core/craft.js:12`, set `BAG = 1`. Replace line 84 with:

```js
export const bagSize = () => BAG; // one held block: the party is the toolkit (spec 2026-10-27)
```

- [ ] **Step 3: Grow the map and pin the bottom band.** Line 20: change `H = 19` to `H = 27`. Line 40: change the default `y = top ? 1 : H - 2` to `y = top ? 1 : ROAD[1] + 5`. That is row 17, the bottom band's last row; without this, every bottom district's door would move off its floor.

- [ ] **Step 4: The stepwell.** Replace line 48 (`dungeon: district(41, 6, false, 41),`) with the five sites. Every stand is on odd x and odd y (Pythagoras's lattice); stand, door and host sit in a row:

```js
  // The Storm Keep: a stepwell under the Road. Top terrace = the old Keep district (STEPWELL[0], gate KEEP_GATE); a stair
  // at (43,18) leads down to the upper landings (row 19), stairs at (37,21) and (41,21) to the lower ones (row 23), and one
  // at (37,24) to the pool (row 25). Doors gate by `needs` (heroes:4, then done:...), never by walls.
  'keep-euclid': { x: 33, y: 19, w: 3, h: 1, stand: [35, 19], door: [34, 19], host: [33, 19] },
  'keep-pythagoras': { x: 43, y: 19, w: 3, h: 1, stand: [43, 19], door: [44, 19], host: [45, 19] },
  'keep-brahmagupta': { x: 33, y: 23, w: 3, h: 1, stand: [35, 23], door: [34, 23], host: [33, 23] },
  'keep-zeno': { x: 43, y: 23, w: 3, h: 1, stand: [43, 23], door: [44, 23], host: [45, 23] },
  dungeon: { x: 37, y: 25, w: 3, h: 1, stand: [37, 25], door: [38, 25], host: [39, 25] }, // the pool; host: Bhāskara's carved stone
```

Directly after the `DISTRICTS` object, add:

```js
// Open floor that belongs to no district: [x, y, w, h]. Terraces, the stairs between them, the pool's ledge.
const STEPWELL = [[41, ROAD[1] + 2, 6, 4], [43, 18, 1, 1], [33, 19, 13, 2], [37, 21, 1, 1], [41, 21, 1, 1], [33, 22, 13, 2], [37, 24, 1, 1], [36, 25, 7, 1],
  [32, 20, 1, 1]]; // last: the alcove, a dead-end niche off the upper terrace (Brahmagupta's 0÷0 = 0 carving; optional, Arto draws it)
const KEEP_GATE = [41, ROAD[1] + 1]; // where the old Keep district's gate was: anyone may go down
```

In `craftMap()`, after the `for (const d of Object.values(DISTRICTS)) { open(...` line, add:

```js
  for (const r of STEPWELL) open(...r);
  open(...KEEP_GATE, 1, 1);
```

Line 56: `LAYOUT = 5` (older saves are dropped).

- [ ] **Step 5: Run the suite and let the reachability test place the cells.** Run `node --test test/ 2>&1 | grep -E "^ℹ (pass|fail)|not ok"`. The test `from every cell where C picks a party, every party reaches each door it admits` (`test/craft-districts.test.js:40`) is the acceptance check. Every party, including solo Euclid (he slides until stopped) and solo Pythagoras (he leaps 2 and keeps parity), must reach all five Keep doors. If it fails, fix the layout the way map v4 did: move a stand, add a stamp rock in `STAMPS` as a slide stop, or add a nudger in `NUDGERS`. Don't weaken the test. If the BFS cap (30000) is hit on the bigger map, raise it to 60000 and say so. Also check `test/craft-districts.test.js` 'districts do not overlap' and the demo-string tests: camp-relative positions are unchanged, so they should pass untouched.

- [ ] **Step 6: Screenshot check.** Start `timeout 120 python3 -m http.server 8772` with `run_in_background`, then run `chromium --headless=new --disable-gpu --no-sandbox --window-size=1100,720 --virtual-time-budget=2000 --screenshot=/tmp/claude-1000/keep.png "http://localhost:8772/?craft"` and look at it. The camp view is unchanged; the lands map in the corner is taller.

- [ ] **Step 7: Commit.**

```bash
git add core/craft.js test/craft.test.js test/craft-districts.test.js
git commit -m "Road: the stepwell under the Storm Keep (5 sites, two tiers, pool), bag of one, map v5"
```

---

### Task 3: Messages for the new needs, landing hosts, the ending (Axio)

**Files:**
- Modify: `craft/play.js:30` (`bring`), `:33-38` (`greet`), `:39-40` (arrival message), `:51` (`needs` message), `:53` (`soon` message)

These are text and logic only, with no drawing. There is no unit test because `craft/play.js` is DOM code; Step 4's screenshot is the check.

- [ ] **Step 1: Need wording.** Replace line 30 with:

```js
const bring = ms => ms.map(m => (m.startsWith('heroes:') ? `all ${m.slice(7)} heroes` : who(m))).join(' and ');
// What a door is waiting for, as a sentence: heroes to bring, or rooms to finish first (needs never mix the two).
const need = ms => (ms[0]?.startsWith('done:') ? `Finish ${ms.map(m => world(m.slice(5)).name).join(' and ')} first` : `Bring ${bring(ms)}`);
```

- [ ] **Step 2: greet() uses `need`, and landings greet as their host hero.** Replace the body of `greet` (lines 34-37) with:

```js
  const w = world(id), miss = missing(id, s.cast, s.done), h = w.hero ?? w.host;
  const how = !w.levels.length ? 'Beyond the demo, for now.' : miss.length ? `${need(miss)}.` : s.done.includes(id) ? 'Walk in to play again!' : 'Walk in!';
  say(h ? `${who(h)}. ${short(CHARACTERS[h].trivia)}\n${w.name}: ${about(w)}. ${how}`
    : `${w.name}: ${about(w)}.\n${w.levels.length ? how : `${need(w.needs)}. ${how}`}`);
```

- [ ] **Step 3: Door messages and the ending.** Line 51: `if (e.reason === 'needs') say(`${world(e.world).name}: ${need(e.missing)}.`);`. Line 53: `if (e.reason === 'soon') say(`${world(e.world).name} (${about(world(e.world))}) is beyond the demo, for now.`);`. Replace line 40 (the arrival `say(...)`) with:

```js
const ENDING = 'Bhāskara: "You cannot share by nothing. That is an answer too." Every stone at Sumhenge is lit. Walk anywhere you like.';
say(from === 'dungeon' && done.includes('dungeon') ? ENDING
  : hero && hero !== 'tally' && done.includes(from) ? `${who(hero)} joins you! Press C at camp to pick who comes along.`
  : 'Push blocks together to do math. A shy ? wants a number. Space picks up / puts down.');
```

- [ ] **Step 4: Check.** Run the tests (expect all pass). Then screenshot `?craft` (server as in Task 2 Step 6) to confirm the page still boots; a blank board means a syntax error. The ending line can't be reached headless without seeded storage, so Qualito checks it in Task 7.

- [ ] **Step 5: Commit.**

```bash
git add craft/play.js
git commit -m "Road: Keep door wording (all 4 heroes / finish first), landing hosts greet, beyond-the-demo, ending line"
```

---

### Task 4: The Keep's rooms (Worldo designs, Matho checks)

**Files:**
- Create: `levels/keep.js`
- Modify: `levels/levels.js` (import `keep`, add `...keep` to `ALL`), `levels/worlds.js` (`levels:` of the five Keep worlds)

Level design is creative work: the maps are Worldo's. The plan fixes the brief and the acceptance check, not the cells.

- [ ] **Step 1: Matho's history check (5 minutes, no code).** Matho confirms or corrects the History section of the spec: Brahmagupta 628 CE (0÷0 = 0, n÷0 as a zero-denominator fraction), Bhāskara II and *khahara*, and "undefined" today. Fix the spec and the `ENDING` line in `craft/play.js` if anything is off, and log it.

- [ ] **Step 2: Build one room per landing** in `levels/keep.js`, in the existing level format (`name`, `cast`, `pads`, `map`, `solution`, `skill`, `beat`, `misconception`, `choice`; see `levels/cast.js:114` 'Be Someone Else' for a cast-plus-change-pads example). Each landing's `cast` starts with its host hero; use change pads where a second hero is needed. One thought each:
  1. `keep-euclid`: long slides down stone stairs.
  2. `keep-pythagoras`: which bracket you leap decides whether a divisor becomes 0 (it echoes 'Dodge the Storm' in croton.js, so it must force a different thought).
  3. `keep-brahmagupta`: a door that trusts 0÷0 = 0; the player finds out it doesn't hold (`core/math.js:33` storms on any ÷0).
  4. `keep-zeno`: divide by smaller and smaller shares: 1÷1, 1÷½ = 2, 1÷¼ = 4. The quotient grows as the divisor shrinks.

- [ ] **Step 3: Build the pool** (`dungeon`), one to four rooms. `n ÷ 0` sits in the water. The player never wins through the storm; they win by making the divisor not zero, with a new thought per phase: Brahmagupta flips the 0 and it stays 0 (−0 = 0); Euclid slides a block in (0 + 3); Pythagoras regroups a (2−2); Zeno's last share makes the door exact. If a phase can't be built from existing verbs, simplify the phase. Don't touch `core/`.

- [ ] **Step 4: Register.** Add the level names to each Keep world's `levels:` in `levels/worlds.js` and `import keep from './keep.js'` plus `...keep` in `ALL` in `levels/levels.js`.

- [ ] **Step 5: Acceptance.** Run `node --test test/ 2>&1 | grep -E "^ℹ (pass|fail)"`. `test/core.test.js:88` and `test/playthrough.test.js` replay every stored `solution`; `test/cheese.test.js` enforces `teaches`. Use first-win search only (`test/solver.js`), always under `timeout 120`, and never leave solver scripts running. Commissioner rules: no "just press right", each room a new thought, bad first moves are fine, rooms are roomy, and negation keeps recurring.

- [ ] **Step 6: Commit.**

```bash
git add levels/keep.js levels/levels.js levels/worlds.js docs/decisions.md
git commit -m "Storm Keep: four landings and the ÷0 pool"
```

---

### Task 5: Stepwell art and lit stones (Arto)

**Files:**
- Modify: `craft/play.js` (`henge` at ~line 480, `landmarks` `dungeon()` at ~line 462, `LOOKS`/`STYLE` at ~lines 265 and 310, `decal`)

- [ ] **Step 1: Lit stones.** Import `stonesLit` from `../core/progress.js`. In `henge()`, set `const lit = stonesLit(s.done);`. The henge bank's stroke becomes `lit ? 'rgba(242,193,78,.6)' : 'rgba(122,92,67,.35)'` (Camp lights the bank). Lintel `i` of `LINTELS` (one per hero world, in `WORLDS` order) fills `'#f2c14e'` with a soft glow when `i < lit - 1`, and `'#9aa0a6'` otherwise. Still under reduced motion: a glow, no pulse.

- [ ] **Step 2: The stepwell.** Sandstone floor and criss-cross stair decals on the `STEPWELL` cells (Chand Baori), a dark pool row with the storm churning (reuse the ÷0 storm fx look), Bhāskara's carved stone on the pool's host cell, and Brahmagupta's "0÷0 = 0" carving in the alcove at (32,20) (a find, not a collectible). Move the Storm Keep landmark (`dungeon()`) to the top terrace (x 41-46, rows 14-17), because `DISTRICTS.dungeon` now sits at the pool. Landings take their hero's era palette from `STYLE`. Empty pair districts get a "beyond the demo" look (sealed, not broken).

- [ ] **Step 3: Check by screenshot** (server as in Task 2 Step 6): `?craft` (camp unchanged), plus a view of the stepwell. If no URL shows the stepwell, use `&moves=` from camp to walk there, and record that string in `docs/demo.md`.

- [ ] **Step 4: Commit.**

```bash
git add craft/play.js docs/demo.md docs/decisions.md
git commit -m "Road: the stepwell (sandstone terraces, storm pool, Bhaskara's stone); Sumhenge stones light per world"
```

---

### Task 6: The playthrough walks the Keep (Testo)

**Files:**
- Modify: `test/playthrough.test.js` (append one test after the walk-the-map test)

- [ ] **Step 1: Write the test** (it fails until Task 4's rooms exist, because `reaches` needs an `enter` event, not `soon`):

```js
test('the Storm Keep: with all 4 heroes, walk each landing in tier order, then the pool; every stone is lit', () => {
  const done = [...SOLO];
  assert.equal(stonesLit(done), 5);
  for (const [id, from] of [['keep-euclid', 'elea'], ['keep-pythagoras', 'keep-euclid'], ['keep-brahmagupta', 'keep-pythagoras'], ['keep-zeno', 'keep-brahmagupta'], ['dungeon', 'keep-zeno']]) {
    assert.ok(reaches(atSite(newCraft(done, ['tally']), from), id), `cannot reach ${id} from ${from} with done=${done}`);
    done.push(id);
  }
  assert.equal(stonesLit(done), 5, 'landings light no stones');
});
```

Add `stonesLit` to the `../core/progress.js` import on line 9. If `reaches`' 20000-state cap is hit on the taller map, raise it to 40000.

- [ ] **Step 2: Run it.** Run `node --test test/playthrough.test.js 2>&1 | tail -5`. Expected: PASS once Task 4 is in.

- [ ] **Step 3: Commit.**

```bash
git add test/playthrough.test.js
git commit -m "Playthrough: walk the Storm Keep to the pool"
```

---

### Task 7: Qualito plays the whole demo, then wrap up (CEO)

- [ ] **Step 1: Qualito** plays from the bare URL (title) → Camp → 4 worlds → Keep → ending, as a 6–9-year-old would. Report the bugs, any room that repeats another's thought, whether the boss feels flat (only then is "storm scatters loose blocks" built), and whether the 1-block bag hurts the fire or creature toys.
- [ ] **Step 2: Route the findings** to the owners by continuing their agents.
- [ ] **Step 3: CEO:** log the rulings, add a `docs/budget.md` line, push, update `docs/handoff/ceo.md`, and tell the commissioner.
