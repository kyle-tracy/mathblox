# The path map: rebuild the hub for travel (2026-10-27)

**Commissioner:** "The purpose of the map isn't to be a play area, but to be a way to navigate between areas, lets rebuild it from the ground up." Free-walking the Road with heroes gave many softlocks, and the Tally-Keeper's plain step is "like a king in chess but unlimited moves": always the best move, and boring.

## Rules
- The map is a graph: **nodes** (Sumhenge, worlds, Keep landings, bonus rooms) joined by **paths**. One arrow press walks the troupe along the path leaving the current node in that direction to the next node. Enter on a node with levels opens that world's level flow (as the Road's doors do today). Nothing is pushed and no hero power acts on the map, so nothing can be stuck.
- A path to a locked node shows a wax seal. You can walk *to* a locked node and read what it needs (the existing door wording), but you can't enter. Empty worlds (`levels: []`) are sealed "beyond the demo".
- Unlocks reuse `core/progress.js`: `missing(id, recruits(done), done)`. Party picking is gone: every recruited hero travels with you, and a world's hero needs mean "recruited".
- The Tally-Keeper is not a map form. The troupe is the heroes you've recruited, walking together; before the first recruit, the Tally-Keeper walks you (Camp's guide). Inside levels, `cast` decides who you play, as today.

## Meta-theme: graph theory (commissioner)
The overworld *is* a graph, and it may say so, in an abstract sense: names, looks and small touches only, never a quiz.
- Nodes are vertices and paths are edges. Sumhenge is the root. The demo's route is a walk from the root.
- The look can echo graph drawings: dots joined by lines, edges that light as you walk them, a node's ring showing its degree.
- Seeds for later, not demo scope: Euler's Königsberg bridges (1736) as a bonus node ("walk every bridge once"); the Discrete Underground world (`under`: parity, graphs) takes the map's own math as its subject.

## Layout: a φ spiral out from zero
- **Sumhenge** at the origin: the stone circle and fire. One stone lights per finished hero world (`stonesLit`). The `ENDING` line plays here after the pool.
- **Solo worlds** spiral outward in play order: Camp (at Sumhenge) → Alexandria → Croton → Ujjain → Elea.
- **Side nodes** off the spiral: the Market and the Observatory (worlds with levels) open by their `needs`; the other pair worlds are sealed.
- **The Storm Keep** sits at the spiral's end. The stepwell goes down from it: Euclid's and Pythagoras's landings (either order), then Brahmagupta's and Zeno's (either order), then the pool (`dungeon`). Its `needs` are unchanged.
- **Bonus nodes (like Toad Houses)** sit beside the path, optional:
  - **The Creature's Hut:** the □+3=8 creature as a short room (give it the right number).
  - **The Campfire:** feeding the fire by the number, as a short room.
  No rewards until collectibles are designed.
- Coordinates are Worldo's; this spec fixes only the topology.

## Code
- `core/map.js` (Axio): `NODES` ({id, x, y, world?, links: {u,d,l,r → id}}), `newMap(done)`, `step(state, dir)` → `{state, events}` (`walk`, `enter`, `locked` with `missing`). Pure, no DOM.
- `render/map.js` + boot (Arto): draws paths, nodes, seals, Sumhenge's lit stones, the troupe walking; title's "Go to the Road" opens the map; finishing a world returns to its node.
- `levels/bonus.js` (Worldo): the two bonus rooms, ordinary levels.
- Removed: `craft/`, `core/craft.js`, and their tests (`test/craft*.test.js`, `test/hub.test.js`, the Road parts of `test/playthrough.test.js`). Git keeps them for the survival-craft future.

## Tests (Testo)
- From Sumhenge, every node is reachable by `step` for every `done` set along the demo order, and entering succeeds exactly when `missing` is empty.
- The demo playthrough walks the order Camp → 4 worlds → the Keep's tiers → the pool and reaches the `ENDING`.

## Unchanged
Every level, Camp, the Keep's rooms, the title screen, `levels/worlds.js` data (minus party semantics).
