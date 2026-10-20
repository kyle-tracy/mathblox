# P2 gate re-run, after P2.1 — Testo (2026-10-20)

**Verdict:** FAIL. Three of the five old blockers are fixed. The first-push traps (now L10 and L13) are still there. Under the commissioner's rule as you stated it, 15 levels have only one math route. L14 kills a random walker in more than half of all 10-move walks. The L16 door signs cover each other.

`node --test test/*.test.js` → 72 pass, 0 fail, 2 todo. New in this run:
- `test/regress.test.js`: the two first-push traps as `todo` tests, a check of intended lane totals for V1–V6, a test that a gate held open does not open the exit, and a test that "?" never equals "?".
- `test/edges.test.js`: blocks cannot bury E.
- `test/solver.js`: now exports `key`.

Level numbers below are the P2.1 numbers. Fill the Holes was inserted at L3, so old L9 is now L10, old L12 is L13, and old L13 is L14.

## 1. Old blockers
| Item | Status | Evidence |
|---|---|---|
| L10 (old L9) first-push trap | **NOT FIXED** | The spawn moved, so the first move is now a walk. But `uuur`, the first push (straight at the door, as in L1 and L11), leaves `[+]` at (4,1) between a wall and door A, and `solve()` returns `null`. 29% of random walkers' first pushes are fatal. |
| L13 (old L12) first-push trap | **NOT FIXED** | `uuur` slides the 7 into (3,1), the only cell the − can enter. `solve()` returns `null`. 22% of first pushes are fatal. |
| Restart undoable | Fixed | `restart()` pushes the old state onto history, and both the `r` key and the button call it. `fills` only paints cells that are `.`, so a restarted trench does not show stale fills. |
| L14 (old L13) fits the screen | Fixed | L14.png fits at 1100×720, and so do the 10-row levels L22 and L23. |
| Blocks bury the exit | Fixed | `#@3E#` + `right` bounces and nothing changes (pinned in a test). The bounce reason is `'wall'`, so the kid gets no boing (Arto's call, not blocking). |
| 0 into a trench | Fixed | Bounces with `zero-fill`; the dashed-rod effect shows. |

## 2. Trap rates
Method: build the full reachable graph, then mark dead states by reverse BFS from the win states. Random walks use a seeded PRNG: 300 walks per column, or 200 for L14 and L18–L21. Endpoints those graphs had not expanded were checked with `solve(…, 300k)`, and "unk" means that cap was hit. The L18–L21 shortest traps were confirmed with `solve(…, 3e6)`, which returned `null`. **Flagged column: walk20 > 50%.**

| Lvl | states | walk10 | walk20 | walk60 | shortest trap |
|---|---|---|---|---|---|
| L1–3, 6, 8, 11, 12, 15 | ≤ 96 | 0 | 0 | 0 | none |
| L4 | 14,521 | 13% | 27% | 70% | `rru` |
| L5 | 44,856 | 20% | 36% | 79% | `rru` |
| L7 | 3,166 | 2% | 4% | 28% | `rrrrr` |
| L9 | 118,736 | 11% | 27% | 63% | `rrd` |
| L10 | 3,547 | 9% | 30% | 68% | `uuur` (the first push) |
| L13 | 3,873 | 12% | 32% | 59% | `uuur` (the first push) |
| **L14** | **867,381** | **52%** | **79%** | 94% | **`dl`** (the 4 is pushed into the corner at (5,2)) |
| L16 | 11,387 | 14% | 33% | 61% | `rdd` |
| L17 | 621 | 9% | 25% | 47% | `rrrr` |
| L18 V1 | > 1M | 1% | 2% | 24% (3 unk) | `drrrdru` |
| L19 V2 | 746,525 | 1% | 8% | 60% | `rudrru` |
| L20 V3 | > 1M | 0% | 1% | 17% | `drdrurrd` |
| L21 V4 | 511,022 | 16% | 31% | 68% | `rdd` |
| L22 V5 | 269,758 | 4% | 15% | 46% | `rrdl` |
| L23 V6 | 388,376 | 13% | 27% | 63% | `drr` |
| L24 | > 300k (sampled, 100 walks) | 0% (2 unk) | 0% (6 unk) | 0% (13 unk) | none found |

Every level's `solve()` finishes inside 200k states. The *full* graphs of L14 and L18–L23 are larger than that. Worldo should confirm the authoring limit means solver states, not the full graph.

## 3. Commissioner's rule: real choices
Definitions:
- **Route**: an inclusion-minimal multiset of math events (merge, carve, tick, fill, open, each with its values) on a winning path. For lane levels, add the lane contents at the moment of the win.
- **First commitment (FC)**: the first irreversible event on a winning path.
- **Bait**: a wrong road that bounces and so never wins.

| Lvl | routes | FC | note |
|---|---|---|---|
| L1 | 1 | 1 | exempt |
| L2 | **1** | 2 | bait: tick the 5 |
| L3 | **1** | 1 | bait: the 4 bounces as too long |
| L4 | **1** | 1 | bait: the 3 bounces at the door |
| L5 | **1** | 1 | bait: tick the 2 |
| L6 | **1** | 1 | bait: the 8 |
| L7 | **1** | 2 | bait: 7+3 |
| L8 | **1** | 2 | bait: tick the 6 |
| L9 | 2 | 2 | 4+4 or 2+6 |
| L10 | **1** | 1 | bait: the 2 |
| L11 | **1** | 1 | bait: 3−8 |
| L12 | 2 | 2 | 4−4 or 5−5 |
| L13 | **1** | 1 | bait: the + |
| L14 | 2* | 2 | 4+6 or 6+4, then 6−4 (*differ only in operand order) |
| L15 | **1** | 2 | bait: 0+3 |
| L16 | **1** | 1 | open 7, 4, 3 in that order |
| L17 | **1** | 1 | 3+4, then 7−4 |
| L18 | 2 | – | △ = 2+3 or 1+4 |
| L19 | 2 | – | △ = 2+4 or 1+2+3 |
| L20 | 2 | – | △ = 4 or 2+2 |
| L21 | **1** | – | △ = 3+4 only |
| L22 | **1** | – | ○ = 5 only (4+1 spends the key) |
| L23 | 2* | – | 6 in the row and 4 in the column, or the 4 on the crossing cell plus the 2 (*same values, placement only) |
| L24 | **1** | – | the 9 can only move into A (found by hand) |

Route counts for L18–L23 come from enumerating every subset of the blocks and checking each for reachability; the capped product BFS was not used for them. So 15 levels after L1 (16 counting the Sandbox) have exactly one route. In every one of them the choice is "right road or bait". Whether a bait-only choice counts as "a real choice" is the CEO's call. Until that call is made, these levels violate the rule as it was stated. Under a stricter reading, where the starred levels count as single-route, the count is 17.

## 4. Cheese hunt, lane levels
- Every V1–V6 shortest win has exactly the intended lane totals (pinned in a test).
- The exit checks all gates against the live lane values. A gate held open by a block standing in it does not let the player through (pinned).
- No shipped level contains an operator, so "?" can never appear in play. In the engine, NaN never equals NaN, so a "?" lane makes no gate true (pinned).
- Blocks can be parked in an open gate cell. That is a trap source, not cheese.
- The banned-event cheese suite still passes.

## 5. Sign overlap
I ported `signBox` with approximate glyph widths and checked every sign at load and after every move of the solution path.
- **L16: signs A, B and C cover each other at load.** "3+4 = □" and "7 − 3 = □" cannot be read (see L16.png). This is blocking.
- L23 and L22: sign B covers the top of the exit E at load (confirmed in the screenshots).
- L14: sign B flips down onto E after move 14 of the solution.
- L22 and L23: sign A briefly covers the 4 and the player in mid-solve.

Root cause: `signBox` only avoids objects. It ignores E, the other signs, trenches and pads.

GATE: FAIL. Blocking: L10 and L13 first-push traps, L14 trap rate, L16 sign overlap, and the 15 single-route levels (pending the CEO's ruling on bait).
