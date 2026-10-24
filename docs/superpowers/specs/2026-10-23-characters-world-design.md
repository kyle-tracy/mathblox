# Heroes and the world map: design (commissioner + CEO, 2026-10-23)

The goal is to turn mathematics into a game. Each hero is a mathematician whose way of moving is a piece of their own math. The open world is a hub, and each puzzle world sits inside it. Regions are gated by which heroes you bring. The world map climbs from counting to imaginary numbers, calculus and discrete math, and ends at a boss dungeon. This spec is the plan for now. It's built so that more heroes can be added without touching the engine's core.

## 1. Heroes are modules

A hero is one id, registered in three places (built, commit after 7c1f2a1), each kept to a single entry:

| Layer | Where | What the entry holds |
|---|---|---|
| Rules | `core/heroes.js`: `HEROES[id] = (state, dir, api) => { state, events }` | the move rule. It is pure, built from `api.move` (one step or one push) and `api.walk`. |
| Data | `levels/characters.js`: `CHARACTERS[id]` | name, a one-line description of the move, colour, and trivia (fact-checked by Matho, imperfections kept) |
| Look | `render/cast.js`: `PROPS[id]` | sprite prop and skin |

The test `test/heroes.test.js` checks that every id has all three entries, and that each move rule returns a `bounce` instead of throwing on a wall. Adding a hero means three entries plus one level that introduces them. Nothing else in the engine changes.

Starting cast:
- Tally-Keeper: one step.
- Euclid: slides until stopped. When he pushes, he and the block slide together until something stops them, or until the block meets math.
- Zeno: goes half the runway, rounded up.
- Pythagoras: leaps 2 cells over anything and never pushes.
- Brahmagupta: walking into a number negates it in place, and turns + into −.

## 2. Characters on the board

- **Several bodies.** `level.bodies = [{ id, x, y }, …]` in addition to `@`. The body you control is `state.player` and its hero is `state.mover`; the others are in `state.others`.
  - `step(state, 'swap')` moves control to the next body.
  - The bodies you aren't controlling are solid: they block pushes and walks, Euclid stops against them, and Pythagoras can leap over them.
  - The body you control reaching `E` wins.
- **One-body swap (today's `cast`).** It stays as is. A level uses either the list of bodies or `cast`.
- **Change pads.** A map tile `*`, specified in `level.pads = { 'x,y': id }`. Stepping onto one turns your current body into that hero. The pad stays on the floor.
- **Rules for every hero:** one rule per hero, everything can be undone, and each hero gets an intro card the first time they appear.

## 3. World structure

- **The hub.** The game opens at the Craft camp with only the Tally-Keeper. L1 and L2 take place at camp.
- **Sites.** Each puzzle world is a door on the Craft map, drawn in the home art style of its era. Walking in opens that world's levels, and walking out returns you to the door.
- **Recruiting.** Finishing a solo world recruits its hero. From then on they appear at camp.
- **Going out.** At camp you choose 2 companions to take out, and the rest stay at camp. Regions are gated by a specific pair, and that region's levels are designed for exactly that pair.

### Solo worlds (one hero each)

| World | Hero | Concept |
|---|---|---|
| Camp | Tally-Keeper | counting, + and − |
| Alexandria | Euclid | commutativity: + slid into from either side gives the same result, − doesn't |
| Croton | Pythagoras | associativity: leaping chooses which pair merges first |
| Ujjain | Brahmagupta | negatives and zero: −(−a) = a |
| Elea | Zeno | fractions and halving |

### Pair worlds (any 2 of the 6 unlock the dungeon)

| Pair | Concept | New block attribute |
|---|---|---|
| Brahmagupta + Pythagoras | imaginary numbers: a flip is a half turn, ×i is a quarter turn, i² = −1 | `turn` (0–3 quarter turns) |
| Euclid + Zeno | calculus: speed, velocity, acceleration, limits | `vel` (cells per turn) |
| Euclid + Brahmagupta | distributivity: −(a+b) = −a + −b, and a×(b+c) splits into two arrays | none |
| Pythagoras + Zeno | the discrete underground: parity (the 2-leap's colouring), mod, primes, graphs | none at first |
| Euclid + Pythagoras | vectors and distance | `vec` |
| Brahmagupta + Zeno | infinite series: 1 − ½ + ¼ − … = ⅔ | none |

### The boss dungeon

Each level needs 3–4 heroes at once. The final boss is the ÷0 Storm, and the fight is honest (Matho's redesign, curriculum.md §7):
- **Phase 1:** (3x)÷x, approached from both sides, settles on 3. A hole in a formula can have a value.
- **Phase 2:** 1÷x. The two sides race to opposite infinities, which proves the Storm has no value. You win by showing that both sides disagree, never by giving it a number.

A complex number such as 3 + 3i reuses `vec` (it's a point on a plane), so there's no new attribute for it.

## 4. What doesn't change

- The engine stays exact like a calculator, and bounces happen only when a move is truly impossible.
- A block's meaning lives in its attributes, never in where it sits.
- Every level stores a solution that the tests replay. The cheese bot proves you can't win while skipping what the level teaches.
- The bot can prune Euclid and Zeno when the Tally-Keeper is also in the cast and the level has no extra bodies or pads, because their moves, including the curling push, are runs of Tally steps.
- No dependencies, and no 3D before the P5 gate.

## 5. Build order

Each step is playable on its own and gets a keep/fix verdict from Qualito.
1. **Euclid's curling push** in core. Re-check L3 and L22, and update the solver's pruning.
2. **Hero modules**: split `HEROES` into `core/heroes.js`, and add the registry test.
3. **Several bodies and change pads** in core, with 2 levels from Worldo and sprites and HUD from Arto.
4. **The hub**: site doors on the Craft map, recruiting, choosing 2 at camp, and the existing levels grouped into the solo worlds.
5. **The first pair world.** Euclid + Brahmagupta (distributivity) comes first because it needs no new attribute. Imaginary numbers (`turn`) and calculus (`vel`) follow.
6. **The next pair worlds**, then the boss dungeon.
7. **More heroes**: al-Khwarizmi (records and replays a sequence of moves), Noether (mirror twin), Fibonacci. Visio and Matho pitch them; Qualito filters.
