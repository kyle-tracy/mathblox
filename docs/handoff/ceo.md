# CEO handoff, 2026-10-27

Read `docs/ceo.md` (new: the "Who does the work" ladder and the "Which model" choice), then this file, `docs/vision.md`, and `tail -n 25 docs/decisions.md`. The plan is `docs/superpowers/plans/2026-10-27-storm-keep-demo.md` (spec: `docs/superpowers/specs/2026-10-27-storm-keep-demo-design.md`).

## What changed today
- **The demo has an ending (commissioner):** "a more succinct and complete demo"; survival-craft waits. The path is Camp → 4 solo worlds (each lights a Sumhenge stone) → **the Storm Keep**, a walkable Indian stepwell under the Road. Brahmagupta first tried ÷0 in 628 CE, and Bhāskara II guards the top. Two any-order tiers of landings, then the ÷0 boss pool. The Market stays as an optional side world. Inventory is one held block.
- **Done:** the Market's 4 levels (Worldo). Plan Tasks 1–3 (Axio on Sonnet): `heroes:N` / `done:id` needs, `stonesLit`, map v5 with the stepwell (H 27, `LAYOUT` 5), `BAG` 1, door wording, landing hosts, the ending line. Style A is locked.
- **Cheese philosophy (commissioner):** a cheese can be a feature (Mario Kart Ultra shortcuts). The measure is mental energy, partly taste. The bot ladder `test/ladder.js` doesn't yet separate favourites from trivial rooms (`docs/gates/ladder-calibration.md`). It's parked as a smoke alarm; Two Triangles Again is flagged (98% greedy wins).
- **Difficulty 1–5 per level** (Mario Wonder style): varied, rising across the game; open-world rooms needn't all be mandatory. Worldo adds it, Qualito judges the curve.
- **Methodology:** spawning is a per-task cost ladder, and the model is chosen per dispatch (Haiku / Sonnet / Opus). Charters are updated to match, and Budgeto's charter is deleted.

## In flight at wrap-up
Nothing is running, and the tree is clean and pushed.
- **Arto's Task 5 is done** (2d81ba2): the stepwell art, lit stones and wax "beyond the demo" seals. Lit stones haven't been checked by eye. The pool shows on screen only from the lower terraces.
- **Worldo's Task 4 is not done.** Six drafted rooms with `difficulty` are saved in `docs/handoff/keep-draft.js`, which nothing imports: Down the Stone Stairs, Zero on Top, Brahmagupta Trusts the Zero, Share by Less and Less, Still Zero and The Last Share. The first two have no win (their maps are broken), the third timed out, and the last three were never searched. Ruling: the pool rooms may use swap instead of change pads (swap is an existing verb).

## Next
1. **Finish the Storm Keep plan:** a cold Worldo starts from `docs/handoff/keep-draft.js`. Fix the maps, store the solutions, register the rooms, add the Task 6 test, then move the file to `levels/keep.js`. Whatever else is left of Tasks 4–6 (check `git log` and the Keep worlds' `levels:` in `levels/worlds.js`). Then **Matho's history check** of the spec's History section and the `ENDING` line in craft/play.js. Then **Task 7, Qualito plays the whole demo** from the title to the ending (cheeses, the difficulty curve, whether the boss feels flat, whether the 1-block bag hurts).
2. **Brainstorm collectibles** (commissioner is considering them: "for doing more/different ways or encouraging specific solutions"). Constraints: earned by a different thought, a fixed number, can't be bought, never expire, no nagging. Ties to the shortcut wink and the Museum idea.
3. **Backfill `difficulty`** for the existing levels (Worldo, Sonnet-able once the scale is written down) and look at Two Triangles Again.
4. Later: the Fibonacci hero idea; more pair worlds after the demo.

## Open questions for the commissioner
- None blocking. Collectibles design waits on a brainstorm with them.
