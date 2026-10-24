# CEO handoff, 2026-10-22 (fresh session, not a resume)

Read `docs/ceo.md` first: it says who you are and how you delegate. Then read this, `docs/vision.md` and `tail -n 25 docs/decisions.md`. Read nothing else until a task needs it. The older history is in git (`git log`) and `docs/archive/`.

## Where we are
- **The direction changed (commissioner, 2026-10-21).** The puzzles are now the tutorial. The goal is an **open-world survival-craft** built from math blocks. The commissioner said: "build a bit chaotically, keep good game design; let QC and testing kill bad ideas."
- **The engine (core/)** is calculator-precise:
  - + and × give the same result in either push direction; − and ÷ read in order.
  - Negatives are real (3−5 = −2).
  - Values are exact rationals (`core/value.js`).
  - `level.div` sets how a division shows: `remainder` (the default), `fraction`, or `decimal`.
  - Standard precedence applies in chains and doors.
  - Results sit at the operand cells, and the player always steps forward after a push.
  - Bounces happen only for no-room, `not-whole` into a trench, or ÷0 (the storm).
- **Puzzles:** 22 levels plus Sandbox (cut from 39 by Qualito's audit). Each one stores a `solution` that the tests replay, so room size is never capped by the solver.
- **Craft prototype** at `?craft` (`core/craft.js`, `craft/play.js`):
  - Ground heights are numbers; pits fill from any side, and overfilling leaves a hill.
  - A bag that holds 2, a fire for warmth, and turn-based day and night.
  - Dozing off keeps your blocks.
  - Spawns regrow at dawn.
  - A "?" creature at dusk wears an equation; tame it with the right value and it doubles your bag.
  - Arto has drawn all of this, plus negatives (hollow faces) and fractions (pie dots).
- **Tests:** 86 pass. Everything is pushed to master (github.com/kyle-tracy/mathblox).
- **The studio is paused.** No agents are running.

## Next: the residency demo (due 2026-10-27)
The commissioner ruled that the demo shows the best of what exists, polished; **nothing is built new for it**. Craft beats are paused until it ships.
1. **Done:** playlist recovered from the last chat and saved to `docs/demo.md`; no polish gaps open.
2. **Done:** Arto fixed both gaps (hill, creature sign); Qualito screenshot-checked them.
3. Record the demo, which the commissioner does.

## After the demo
- Commissioner playtest of `?craft` and the 22 levels. Their feedback outranks everything.
- Visio batch 1 (triaged): build Weight Bridges, then Doubling Trees. Prime Ore waits until a hut needs a floor; Mirror Twin stays on paper (`docs/ideas.md`).
- Other Craft beats are in `docs/craft-loop.md`. Rod sockets and tick pads stay in core/ for reuse (decision of 2026-10-22).

## Owners
Demo: qualito → arto → commissioner. After: commissioner → qualito triage → axio/worldo/arto build.
How to work: see `docs/ceo.md` (the loop, the brief template, the gotchas, the wrap-up).
