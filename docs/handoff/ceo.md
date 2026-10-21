# Handoff, 2026-10-20 (session restart)

Read this first after a restart. Then read `docs/INDEX.md` and the Log in `docs/decisions.md`.

## Where we are
- **Phase:** P2 (2D vertical slice). Gate status: **failed twice** (run 1 PASS WITH FIXES; re-run 1 FAIL; re-run 2 FAIL). The commissioner was notified per the emergency rule on 2026-10-20. The commissioner didn't need to act.
- **P2 gate PASSED (2026-10-20, tag p2-gate).** The commissioner dropped the dead-first-push rule ("Baba Is You isn't afraid of bad first moves"). Next: plan P3.
- **Everything else passes:**
  - ≥2 math-distinct routes from L2 on (L14 exempt)
  - cheese
  - signs never cover E or each other
  - walk20 ≤50%
  - Psycho and Matho re-run 2: PASS WITH FIXES, nothing blocking
- 27 levels. The default test suite is green: 94 pass, 0 fail, 0 todo. Master is pushed to github.com/kyle-tracy/mathblox.

## Update at wrap-up
Worldo batch #2 has been committed: L4, L5, L9, L16, L17, L18 and L24 are fixed. **Still open:** L19 and L20 dead first pushes, and the L26 text. L14 has 3 dead first pushes, which the CEO exempted. See `docs/handoff/worldo.md`.

## In flight at restart (historical)
- **Worldo:** fix batch #2. Its notes are in `docs/handoff/worldo.md`. Its uncommitted edits may be in `levels/` and `test/regress.test.js`. Run `git status`: if the tests pass, commit; if not, finish from the notes.
  - the dead first pushes above
  - L17: swap the 2 for a 3, with door B `7 = □+3`
  - text fixes in L16/L26
  - vary L19's layout
  - L18's bottom pocket

## Next steps, in order
1. Finish Worldo's batch, then run a narrow re-check with Testo:
   - `SLOW=1` first-push check
   - routes, cheese, signs and walk20 on the changed levels only
2. If it's green, tag `p2-gate` and push the tag.
3. Plan P3 (× and ÷), from the plan file `~/.claude/plans/you-are-the-math-twinkly-cake.md` §3:
   - arrays as area, never repeated addition
   - ×0, ×1, n÷1
   - share with remainder pebbles
   - ÷0 as a void storm
   - bundling and ten-rods
   - Keep negation and ≥2 routes in every level.
4. P4 watch list for the real-kid playtest:
   - predict vs guess on two-road levels
   - where kids give up in L14 and the lanes
   - negation in L1–L10, which has no − block before S5

## Agent notes
- Testo: `docs/gates/gate-p2-testo-rerun2.md`. Tooling: test/solver.js, test/regress.test.js.
- Matho: `docs/gates/gate-p2-matho-rerun2.md`. curriculum.md has been renumbered to 27 levels.
- Psycho: `docs/gates/gate-p2-psycho-rerun2.md`. Agency on graded levels is 3.76. Open item: L19 repeats L18.
- Arto: the style guide covers `layoutSigns` (render/fx.js), held gates and the exit boing. Optional: draw "?" (unknown) and "below 0" differently before any operator goes into a lane.
- Axio: core sets `held` on gates in `step()`. Nothing is open.
- Archo: nothing is open.

## Gotchas
- Agents share one working tree. A Testo branch checkout moved HEAD under me once. Before merging, check `git branch --show-current`, or give agents `isolation: "worktree"`.
- Never `pkill -f`. Kill the server only by `$SRV`.
- **Token and CPU cost:** the exhaustive dead-end checks (up to 3M states, 10 s to 30 min each) are what burn tokens and CPU. Testo's re-run 2 used about 132k tokens over 1 h 44 m, mostly re-running and waiting on these. From now on, run `SLOW=1` once per gate on the changed levels only. Agents use `timeout` and must not leave background solver scripts running after they report.
- **Commissioner note for Testo:** we only need proof that a level is beatable, not the best solution. Use a first-win search such as DFS or best-first for solvability and for first-push checks (each push just needs any win). Keep exhaustive search for proving dead ends. See `.claude/agents/testo.md`.
