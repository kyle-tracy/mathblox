# Handoff, 2026-10-20 (session restart)

Read this first after a restart. Then read `docs/INDEX.md` and the Log in `docs/decisions.md`.

## Where we are
- **Phase:** P2 (2D vertical slice). Gate status: **failed twice** (run 1 PASS WITH FIXES; re-run 1 FAIL; re-run 2 FAIL). The commissioner was notified per the emergency rule on 2026-10-20. The commissioner didn't need to act.
- **Only blocker left:** dead first pushes. A single first push makes the level unwinnable in L4, L5, L9, L24 (13–30% of random walkers) and in L16, L19, L20 (≤1%). Check: `SLOW=1 node --test test/regress.test.js` (`deadFirstPushes`, `FIRST_PUSH_TODO`, `HEAVY`).
- **Everything else passes:**
  - ≥2 math-distinct routes from L2 on (L14 exempt)
  - cheese
  - signs never cover E or each other
  - walk20 ≤50%
  - Psycho and Matho re-run 2: PASS WITH FIXES, nothing blocking
- 27 levels. The default test suite is green: 94 pass, 0 fail, 0 todo. Master is pushed to github.com/kyle-tracy/mathblox.

## In flight at restart
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
