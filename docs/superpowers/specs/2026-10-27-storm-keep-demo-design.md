# The Storm Keep: a complete demo (design, 2026-10-27)

Commissioner: "a more succinct and complete demo… survivalcraft elements may need to be saved for the future." The finale is the Storm Keep as a boss dungeon, "organic and explorable, somewhere between" linear and branching, themed on the culture of whoever first tried dividing by zero.

## Progression and inventory (demo scope)
- **Progression = heroes + Sumhenge stones.** Finishing a solo world recruits its hero (unchanged) and lights one standing stone in the ring around the camp fire. The finish line is in view from minute one. No XP, stars, currency or drops.
- **Inventory is cut to one held block on the Road** (`BAG` 2 → 1; a pet no longer doubles it). The bag only feeds the fire toy and the creature. Puzzle rooms never had one. The party is the toolkit.
- **Out of the demo:** survival systems (already off), larger inventory, and the empty pair districts. Their signposts read "beyond the demo". The Market stays as an optional side world.

## Path
Camp → Alexandria, Croton, Ujjain, Elea (each lights a stone) → **the Storm Keep** (opens once all 4 heroes are recruited, whatever party you bring; replaces `pairs:2`). Inside, change pads give you each hero, so party size never blocks you → back to Sumhenge for the ending.

## History (Matho checks it)
- Brahmagupta, *Brāhmasphuṭasiddhānta*, 628 CE: the first rules for computing with zero. He said 0÷0 = 0 (wrong) and left n÷0 as a fraction with zero below.
- Bhāskara II (12th c., also head of the Ujjain observatory): n÷0 is *khahara*, infinite, unchanged by anything you add or take away.
- Today: n÷0 is **undefined**. That is the engine's ÷0 Storm (`core/math.js` returns `storm`).
- Theme: an Indian **stepwell** (e.g. Chand Baori, 9th c.), a stone staircase cut down to still water. Bhāskara II guards the top; the storm churns in the pool at the bottom.

## The Keep: a walkable stepwell
- The interior is a small walkable map on the Road's engine (`core/craft.js`), with a new layout, not a door menu.
- **Upper terraces:** Euclid's and Pythagoras's landings, in either order.
- **Lower terraces:** Brahmagupta's and Zeno's landings, in either order; they open when both upper landings are done.
- **The pool** opens when all 4 landings are done.
- Winding stairs, galleries that overlook unreached rooms, and the storm visible from the top, so the goal is always in sight.
- One optional hidden alcove holds Brahmagupta's 0÷0 = 0 carving: a find for explorers. It is not a collectible and not required.

## Landings (one new thought each; Worldo designs, Matho checks)
1. **Euclid:** long slides down stone stairs.
2. **Pythagoras:** brackets across the terraces; regrouping decides whether a divisor becomes 0.
3. **Brahmagupta:** a door that trusts his 0÷0 = 0; the player finds out it doesn't hold.
4. **Zeno:** halving the divisor: 1÷1, 1÷½ = 2, 1÷¼ = 4. The quotient grows as the divisor shrinks toward 0. This is the Keep's concept (limits).

## The boss pool
`n ÷ 0` sits in the water. You never win *through* the storm; you win by making the divisor not zero. Each phase needs a different hero, through change pads:
1. Brahmagupta flips the 0 and it stays 0 (−0 = 0).
2. Euclid slides a block into it (0 + 3 = 3); the divisor is rebuilt as (2 − 2).
3. Pythagoras regroups the bracket so it no longer makes 0.
4. Zeno's last share makes the door's value exact. The storm calms and the water clears.

Exact rooms belong to Worldo and Matho; the rule is that each phase is a new thought. If a phase can't be built from existing verbs, simplify the phase rather than add a mechanic. Storm drama in v1 is fx only. "The storm scatters loose blocks" is added only if Qualito finds the boss flat.

## Ending
Climb back to Sumhenge with every stone lit. Bhāskara's closing line: "you can't divide by nothing — and that's an answer too." Then the title screen offers free play on the Road.

## Build order (≈3 builds, then a play-and-cut pass)
1. **Axio:** the Keep's stepwell map and tier gating, the Keep opening once all 4 heroes are recruited (any party), `BAG` = 1, and the stone-lit state from `progress.js`. Tests: tier gates, every admitted state reaches the next door.
2. **Worldo + Matho:** `levels/keep.js` (4 landings + pool), registered in `worlds.js`; history honesty check.
3. **Arto:** stepwell art (sandstone, criss-cross stairs, dark pool), Sumhenge stones lighting, the ending beat, "beyond the demo" signposts.
4. **Qualito:** the whole demo from the title screen to the ending.

## Tests
Each landing and pool phase has a stored `solution` replayed by the suite (first-win search only). The playthrough test walks title → Camp → 4 worlds → Keep → ending.
