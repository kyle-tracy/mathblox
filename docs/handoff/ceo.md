# CEO handoff, 2026-10-22 (fresh session, not a resume)

Read this, then `docs/vision.md` and `tail -n 25 docs/decisions.md`. Read nothing else until a task needs it. The older history is in git (`git log`) and `docs/archive/`.

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

## Next (when the commissioner says go)
1. Craft: hills and positive blocks look the same. Axio adds a terrain attribute, then Arto draws it.
2. Commissioner playtest of `?craft` and the 22 levels. Their feedback outranks everything.
3. The next Craft beats, from `docs/craft-loop.md`:
   - the Mirror Lands (x<0, anti-blocks)
   - recipes as balance scales
   - trees that Tick each day
   - harvest by ÷ (ages 8+)
   - Psycho's ideas: a helper pet, blueprint ghosts, a Number Museum, couch co-op, rule shrines
4. The puzzle levels no longer use ten-rod sockets or tick pads. Reuse them in Craft or delete them.

## How to work (cheap)
- One agent per task, with a tight brief and a report under 150 words. Continue a finished agent with SendMessage instead of re-spawning it.
- Make quick rulings myself, then log them.
- After each agent finishes, Qualito judges the result. Qualito may be the cheapest agent to run.
- Commit with `git add <paths>`, never `-a`: agents share the working tree.
- Log each agent's token cost in `docs/budget.md`.
- Screenshots: start `python3 -m http.server 8772` with run_in_background and a timeout, then run chromium headless (the recipe is in `docs/workflow.md`). Never `pkill -f`.
- **When the commissioner says "wrap up":** rewrite this file, update memory, push, and give them a fresh-session start prompt. Resuming a long context costs more than a fresh session that reads this file.
