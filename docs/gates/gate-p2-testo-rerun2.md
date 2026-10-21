# P2 gate re-run #2 (final), 27 levels — Testo (2026-10-20)

**Verdict:** FAIL. Most of the gate now passes: routes, trap rates, cheese and signs. The CEO also asked for "no first push makes a level unwinnable" in every level. That check fails in 7 non-exempt levels: L4, L5, L9, L16, L19, L20 and L24. In each one, `solve(…, 3e6)` returns `null` after the push. That search is exhaustive, so these are real dead ends, not cases where the search hit its cap.

`node --test test/` → all pass, 0 fail. The heavy first-push cases are skipped by default. Run them with `SLOW=1 node --test test/`, which runs the 8 known-open levels as `todo`.

New in this run:
- `test/regress.test.js`: the first-push test now covers all 27 levels (it used to cover only L10 and L13). The lane-totals check now also covers Into the Box, Big Box and Two Triangles Again.
- `test/cheese.test.js`: the L14 skip comment is updated with today's re-verification.

## 1. Routes and first commitments (CEO rule: from L2 on, ≥2 math-distinct routes)
Definitions:
- **Route**: an inclusion-minimal multiset of math events on a winning path.
- **FC (first commitment)**: the first irreversible event.

Method:
- L1–L17: full product BFS over reachable states.
- L18–L26: every lane content seen at a win. L19, L21, L22, L24, L25 and L26 were capped at 0.8–3M states. A capped run can only find more routes, never fewer, so ≥2 is still proven.

| Lvl | routes | the routes (FC first) |
|---|---|---|
| L1 | 1 | 2+1 (exempt) |
| L2 | 2 | tick 3→4, open 4 · tick 5→6, open 6 |
| L3 | 2 | fill 3 · fill 4 (then 2 opens) |
| L4 | 2 | 2 opens / 3 fills · 3 opens / 2 fills (same values, but they swap roles: different fill) |
| L5 | 2 | tick→5, fill 5, 2 opens · tick→3, fill 3, 4 opens |
| L6 | 2 | 4 for 6=□+2 · 5 for 7=□+2 |
| L7 | 2 | 4 for 7=□+3 · 5 for 7=□+2 (7+3 is bait) |
| L8 | 2 | tick→3 · tick→5 |
| L9 | 2 | 4+4 · 2+6 |
| L10 | 2 | 5+0 · 3+0 |
| L11 | 2 | 9−4 · 8−3 |
| L12 | 2 | 4−4 · 5−5 |
| L13 | 2 | 7−3 · 9−5 |
| L14 | 2* | 4+6 / 6+4, then 6−4 (*order only; exempt by the CEO's ruling) |
| L15 | 2 | 3+7 · 4+6 |
| L16 | 2 | key 4 (7−3=□) · key 3 (7=□+4), then 7 |
| L17 | 2 | FC 3+4, then 7−4 · 7−2 |
| L18 | 2 | △ = 2+3 · 1+4 |
| L19 | 2 | △ = 2+3 · 1+4 |
| L20 | 2 | △ = 2+4 · 1+2+3 |
| L21 | 2 | △ = 4 · 2+2 |
| L22 | 2 | △ = 3+6 · 4+5 |
| L23 | 2 | △ = 3+4 · 2+5 |
| L24 | 2 | ○ = 5 · 2+3 (△ = 1+4 is sealed; the room's 4 is the B key on both routes) |
| L25 | 2 | △ = 4 · 2+2 |
| L26 | 2 | △ = 6 with ○ = 4 · ○ = 1+3 |
| L27 | – | Sandbox (exempt) |

**PASS.** Every non-exempt level from L2 to L26 has ≥2 routes that differ in values or operations. L4 is the borderline case: both routes use the same two values, but each value does a different job (key or fill), so I count them as different math.

## 2. First pushes (every distinct first push, then `solve(…, 3e6)`)
| Lvl | dead first pushes | walker first-push fatality | what happens |
|---|---|---|---|
| **L4** | down from (3,4), up from (3,3) | **30%** | the 3 or the 2 is pushed onto a wall row and can never get back to its road |
| **L5** | up / down from (3,3) | **23%** | the 4 or the 2 is pushed onto the top or bottom wall row |
| **L9** | down from (3,1) | **17%** | the 4 is pushed into the bottom row |
| **L24** | left from (3,4), up from (5,5) | **13%** | the 5 is pushed against the left wall, or the 4 (the B key) is pushed onto the top wall row |
| L20 | up from (6,3), down from (6,1) and (8,1) | 1% | the 2 is pushed onto row 1 (△ can no longer make 6), or a block plugs the exit corridor |
| L16 | left from (3,4) | ~0% | the 7 is pushed against the left wall |
| L19 | up from (8,3) | ~0% | the 1 is pushed into the door corridor |
| L14 (exempt?) | up from (6,3), (7,3), (8,3) | 2% (run 1 figure) | room A's row is pushed onto the top wall |

The 20 other levels pass, including L10 and L13, which were run 1's blockers. All of their first pushes keep the level winnable. L23, L26 and L27 needed more than 200k states after some pushes, but stayed under 3M.

*Correction to my last report:* run 2 checked only L10 and L13. Its own L9 `rrd` trap was a first push, and I did not flag it as one.

## 3. Trap rates (seeded random walkers; dead = can't reach a win)
| Lvl | walk10 | walk20 | walk60 |
|---|---|---|---|
| L1–3, 6, 11, 12, 15 | 0 | 0 | 0 |
| L4 | 12% | 23% | 58% |
| L5 | 15% | 29% | 68% |
| L7 | 0 | 0 | 6% |
| L8 | 0 | 3% | 20% |
| L9 | 12% | 25% | 64% |
| L10 | 0 | 1% | 14% |
| L13 | 1% | 6% | 34% |
| L14 (exempt; full graph 1,000,164 states) | 31% | 48% | 82% |
| L16 | 10% | 19% | 52% |
| L17 | 0 | 1% | 16% |
| L18 | 0 | 0 | 8% |
| L19 | 0 | 2% | 23% |
| L20 | 1% | 11% | 59% |
| L21 | 0 | 1% | 16% |
| L22 | 0 | 0 | 7% (38 unk) |
| L23 | 0 | 2% | 22% |
| L24 | 3% | 13% | 46% |
| L25 | 0 | 0 | 2% |
| L26 | see note | | |

Rows for L18–L26 have the graph capped at 600k states. "unk" counts walk endpoints where `solve(300k)` also hit its cap.

L26 note: two runs (600k and 300k caps) timed out. Its shortest-win BFS is 19 moves, and every first push stays winnable.

**PASS: no level has walk20 > 50%.** L14 dropped from 79% to 48%, which is under the flag even without the exemption. Its shortest trap is now `dr`, which the CEO accepted.

**200k rule:** every level's `solve()` reaches a win within 200k states. The slowest is L26, at 11.8 s.

## 4. Cheese
- The banned-event suite passes for every `teaches` entry.
- L14 can't be won without carve. Re-verified on the (5,1) map: exhaustive, under 5M states, 47 s.
- The lane levels win only with the intended lane totals: all 9 shortest wins are pinned in a test. A gate held open by a block doesn't let the player out, and "?" never equals "?" (both pinned).
- L24's key is always the room's 4. Spending it on ○ = 4+1 is the bait.

**PASS.**

## 5. Signs (Arto's real `layoutSigns`/`signBox`, run in headless Chromium)
Method: `render/state.js` `load` + `act`, along each solution path, plus 300 seeded random walks of 40 moves (≈12,000 states) per level. A sign or its post covering E, or two signs overlapping, is blocking.

**Positive control:** a synthetic level where every cell is E. The harness reports BLOCK for both signs and both posts, so it does catch overlaps.

| Check | Result |
|---|---|
| At load, all 27 levels | clean |
| Along every solution path | clean |
| Random-walk states | no sign on E, no sign on sign, no sign on any block |
| L16 (run 2's blocker) | A, B and C are separate |

**L13, "9 = □ + 5" (sign B):** at load the box is x 236–364, y 402–442. It sits over the two empty cells to the right of the − (shown at y=4). The − cell ends at x=236, so the sign touches the − but covers 0 px of it. The 9 is clear. No solution or walk state ever has the sign over a block. Confirmed in a screenshot.

**PASS.**

## Recommendations
1. Worldo:
   - Remove the dead first pushes in L4, L5, L9 and L24 first. These have a high walker rate: wall the edge rows the blocks can be pushed onto, or give each block's dead side a wall.
   - Then fix L16, L19 and L20.
   - When a level is fixed, delete its name from `FIRST_PUSH_TODO` in `test/regress.test.js`.
2. Re-run with `SLOW=1 node --test test/`. All 27 levels should show ✔ with no todo.
