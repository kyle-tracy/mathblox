# P2 gate — Testo sign-off (2026-10-20)

**Verdict:** PASS WITH FIXES. All 16 levels can be solved, and no level can be won while skipping its skill. Two levels can be lost on the very first push, restart can't be undone, and L13 doesn't fit on screen.

`node --test test/` → 47/47 pass (~18 s). New: `test/edges.test.js` (8 engine edge-case tests), `test/cheese.test.js` (banned-skill solver), `solve(start, max, ban)` in `test/solver.js` (it now throws when it hits its state cap, so "gave up" is never read as "unsolvable").

## 1. Cheese hunt
Method: with each `teaches` event banned (merge/carve/tick/fill/open), a BFS explores the level until no new states are left. **Every ban makes its level unwinnable** (31/31 checked; "Turn It Around" without carve was verified once by hand: 80 s, ~1.3M states, so it is skipped in CI).

Exact math of *every* winning path. These come from a BFS over (state, event history):

| Level | All winning routes |
|---|---|
| L1 | 2+1=3 → open | 
| L2 | tick 4 → open |
| L3 | open 2, fill 3 |
| L4 | tick→5, fill 5, open 2 |
| L5 | open 4 (no math; intended reading lesson) |
| L6 | open 4 (with or without trying 7+3=10 first) — the twist only teaches if the kid *tries* 10 |
| L7 | tick→3 → open |
| L8 | 4+4 or 2+6 |
| L9 | 5+0 only |
| L10 | 8−3 |
| L11 | 4−4=0 → open 0 |
| L12 | 7−3 only |
| L13 | 4+6 or 6+4, then 6−4 only |
| L14 | 3+7 |
| L15 | 8+5=13, 13−5=8 only (forced round trip) |

Every misconception the levels name can actually be seen on the scale in play: L6 7 vs 13, L12 7 vs 6 and 7 vs 13, L15 13 vs 18 / 13 vs 15 (13−3), L13 4−6 shows a deficit ghost of 2.

## 2. Dead ends (trap rate)
"Dead" = a state from which the level can no longer be won (exact, using the full reachable state graph). The walk columns give the share of random walks of N moves that end in a dead state.

| Lvl | dead / reachable | walk10 | walk20 | walk60 | shortest trap |
|---|---|---|---|---|---|
| L1,2,5,7,10,11,14 | 0 | 0% | 0% | 0% | none |
| L3 | 76% | 14% | 30% | 68% | `rru` (2 pushed onto top row) |
| L4 | 88% | 18% | 37% | 77% | `rru` |
| L6 | 61% | 1% | 5% | 30% | `rrrrr` |
| L8 | 85% | 13% | 26% | 62% | `rrd` |
| **L9** | 75% | **66%** | 75% | 88% | **`r` — the first push** |
| **L12** | 74% | **68%** | 77% | 93% | **`r` — the first push** |
| L13 | 78% | 29% | 55% | 88% | `ddd` |
| L15 | 81% | 8% | 21% | 47% | `rrrr` |

- **L9:** `r` jams `[5][+]` against the door; the + can never leave row 1.
- **L12:** `r` slides 7 into the only cell where the − can come up. The next `r` then shows the intended "7 vs 6" scale, but the kid is already in a dead state.

Both levels follow L1/L10, where "push right" was the whole solution.

## 3. Engine edge cases
These are all pinned as tests: chain into a door, chain into a trench, an op behind the key, ops into trenches and doors (both bounce), 0 into doors, 9-long chains from both ends, vertical columns, tick pads under chains, and reverse resolves. Bugs and questions found:

1. **Blocks can bury the exit.** `#@3E#` + `right` puts the 3 on E, and with a wall behind it the level can never be won. This can happen in L6, L8, L9, L12 and L15 (once the door is open). Fix: treat `E` as solid for blocks (Axio).
2. **A 0 pushed into a trench disappears.** `#@0ooo.#` + `right` gives `fill value 0`; the block is destroyed and nothing changes on screen. This may conflict with "0 is a number". Matho/Axio to decide.
3. **An op pushed into a trench bounces with `reason:'wall'`.** The renderer stays silent for that reason: no boing, no wobble.
4. The rule in `levels.js` ("no − in lines of 5+") and the 2026-10-20 Worldo decision are now stale: long lines compute correctly from both ends (tested).

## 4. Visual QA
- **The scale popup hides the block that was just tried.** In **L13**, doors A and B are approached from above, so the popup covers the bumped block, with the player drawn on top of it. In **L12** the flipped popup covers the **−**, which is the piece needed next. L3, L6, L8, L9 and L15 only cover walls or floor. No level has a door one row above another door.
- **L13 (1004 px tall) and L16 do not fit a 720 px viewport.** Door B, the exit and the arrow buttons end up below the fold.
- Leftover sparkle dots in the headless shots are capture artifacts (virtual time stops mid-animation), not bugs.

## 5. Accessibility (fun-principles §6)
| Item | Status |
|---|---|
| Keyboard-only play | OK: arrows/WASD, z/Backspace undo, r restart, m mute, Enter next; `e.repeat` is ignored |
| Undo | OK: unlimited, and it rewinds merges and carves |
| Restart | **FAIL**: `load()` clears history, so restart can't be undone. `r` sits right next to WASD |
| Mute | OK: button plus `m`, `aria-pressed`, saved across sessions. **No volume control** |
| Reduced motion | Partial: follows the OS `prefers-reduced-motion` setting only; there is no in-game toggle |
| Touch targets | OK: buttons are 56 px. But the canvas has `max-width:100%`, so on a 375 px phone a 14-wide level shrinks to ~24 px cells |
