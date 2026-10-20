# P2 Gate: Fun Review (Psycho)
Date: 2026-10-20. Build: 16-level slice (`levels/levels.js`), screenshots `scratchpad/gate/L1–L16.png`, Arto's effect showcase `arto-*.png`.
Shortest-solution lengths come from `node --test` (Testo's BFS). Alternative maps below were checked with the same solver and `core/world.js` (scratch scripts only, no repo code touched).
**Caveat:** these are AI predictions of fun. They are hypotheses, not evidence. Only the P4 playtest with real children counts (§5).

## 1. Scores (1–5; Frustration 5 = low risk)
| # | Level | Beat | Moves | Clarity | Agency | Juice | Frustr. | Replay | Hard part |
|---|---|---|---|---|---|---|---|---|---|
| 1 | First Push | intro | 5 | 5 | 1 | 4 | 5 | 2 | math (trivial) |
| 2 | One More | intro | 5 | 5 | 1 | 4 | 5 | 2 | math |
| 3 | Mind the Gap | practice | 24 | 3 | 2 | 4 | 3 | 3 | **pushing** (first open room + first trench at once) |
| 4 | Short by One | combine | 25 | 4 | 2 | 4 | 3 | 3 | mixed; ticking the 2 by mistake is a silent dead end |
| 5 | Both Sides Weigh | intro | 6 | 3 | 1 | 3 | 5 | 2 | reading the 13 px equation (no dots on the door) |
| 6 | The Answer Is Not Next | twist | 14 | 4 | 3 | 4 | 4 | 4 | **math**: the free first push builds the wrong 10. Best trap in the slice |
| 7 | Tip the Scale | rest | 6 | 3 | 1 | 3 | 5 | 2 | none; it solves itself, and the equation is decoration |
| 8 | Many Ways to Eight | practice | 26 | 5 | 4 | 4 | 4 | 4 | math (2+6 or 4+4, with 2+4 showing the scale) |
| 9 | Nothing Changes | intro | 19 | 4 | 3 | 4 | 4 | 3 | mixed; long for an intro, decoy 2 included |
| 10 | Chip Away | intro | 5 | 5 | 1 | 5 | 5 | 3 | math |
| 11 | Carve to Nothing | combine | 7 | 4 | 1 | 5 | 5 | 3 | math (the Void reveal); one push only |
| 12 | The Missing Part | combine | 25 | 3 | 3 | 4 | 3 | 3 | **both**: new idea (missing addend via carve) and 25 moves |
| 13 | Turn It Around | twist | **35** | 2 | 4 | 4 | 2 | 3 | **pushing**: the 4−6 → 6−4 rebuild is Sokoban, and the 15-row map needs scrolling |
| 14 | Ten Pals | rest | 6 | 5 | 1 | 5 | 5 | 4 | none (a good rest beat) |
| 15 | There and Back | master | **35** | 3 | 3 | 4 | 3 | 4 | both; uses 13 (above the ≤10 rule) and has one solution |
| 16 | Sandbox | rest | 4 | 4 | 5 | 4 | 5 | 4 | none; but only one + (one merge total), and the exit is 2 presses from spawn |

**Build means (all 16 levels):** Clarity 3.88 · Agency 2.25 · Juice 4.06 · Frustration 4.13 · Replay 3.06 · overall 3.47.
**Agency on graded levels** (excluding intros and rests, see §6 decision): L3, L4, L6, L8, L11, L12, L13, L15 = 22/8 = **2.75**. Overall mean with this aggregation is 3.57.
**As-is the build fails my rubric**: agency is below 3 however it is aggregated. With fixes 1 and 2 (verified maps), graded agency = 24/8 = **3.0** and overall ≈ 3.62. That is a pass, but only just.

Juice note: the showcase (dots flying into the merge, ten-rods past 10, tick ring, trench cubes, balance scale with dot pans) carries the math well. Stills can't show timing or sound; Testo/P4 must check those live.

## 2. Pacing across the arc
- **Moves:** 5, 5, 24, 25, 6, 14, 6, 26, 19, 5, 7, 25, 35, 6, 35, 4. The sawtooth shape is real, and the rest beats are in the right places (L7 after the L6 twist, L14 after the L13 twist, L16 after the L15 master).
- **Rule broken: math and space rise together.**
  - **L3** introduces a new verb (fill) in the first open room, labelled "practice", with no 1-wide intro.
  - **L12** brings in a new idea (carve to solve an addition door) and jumps from 7 to 25 moves.
  - **L13** is the hardest idea in the slice (order of −) at 35 moves. The idea itself is understood within about 5 moves, at the first bounce. The other ~25 moves are block swapping. I tried four open-room layouts for rebuilding 4−6 as 6−4, and all cost 25–32 moves. Physically rebuilding a subtraction is pure Sokoban, which is exactly risk 2 in fun-principles §7.
- **L15 (35 moves)** is acceptable for a Master: about 1–2 minutes at a 7-year-old's pace, inside the 1–3 min target. But the length comes from walking back around after the forced 8+5 merge, not from thinking. Swapping the numbers doesn't shorten it (still 35). Moving the −5 up one row cuts it to 29, which is only a partial fix.
- **Weak rest beat:** L7 is a tick, not a big juicy merge, and the kid never has to engage with the equation `2+5 = □+4`. It's fine as rest, but it teaches nothing about =.
- **Equation doors lose the dot slots.** Plain doors show empty dots, but equation doors show 13 px text or a sign. For non-readers, the goal can't be read at a glance until they bump the door. 8 of the 17 doors are equations.

## 3. Changes (prioritized; owner in brackets)
1. **[Worldo] L13 → this 9-row map** (verified: 12 moves; events merge, open, carve, open; pushing the row from the right bounces `too-much`, missing 2; the column pushed down carves 6−4 = 2):
   ```
   '###########',
   '#@4+6.A...#',
   '#######...#',
   '#######6..#',
   '######4-6.#',
   '#######4..#',
   '#######B###',
   '#######E###',
   '###########',
   ```
   doors `{ A: 10, B: '□+4 = 6' }`. The row reads 4−6 and the column reads 6−4, sharing one −. The order lesson becomes a *choice of reading*, not a block swap.
   **Trade-off:** the shortest path never has to meet the bounce. That goes on the P4 watch list.
2. **[Worldo] L11 → two ways to make the Void** (verified: wins with both chains, with only 4−4, and with only 5−5):
   ```
   '##########',
   '#@4-4..AE#',
   '#.....#.##',
   '#.5-5....#',
   '#........#',
   '##########',
   ```
   doors unchanged `{ A: '4 = □+4' }`.
3. **[Worldo] Insert a trench intro before L3** (the slice becomes 17 levels): `['#########','#@.3oooE#','#########']`, `doors: {}`, `teaches: ['fill']`. Verified: 6 moves, fill then win. L3 then really is practice.
4. **[Arto] Equation doors show dots before any bump.** Draw the balance scale idle on every equation door: known numbers as dot pans, `□` as an empty dashed pan, beam level. A bump then animates from that state. This restores "goal readable at a glance" for non-readers on L5–L7, L11, L12, L13, L14 and L15.
5. **[Arto] Fit the board to the viewport.** Scale cells down to a minimum of 48 px so no level needs scrolling (L13 is 15 rows today, and L16 is cropped). Goal and exit must be visible together.
6. **[Worldo] L12: move the − under the gap.** Change map row 3 to `'#..-.+..#'` (− at x=3, + at x=5). Verified: 17 moves instead of 25. The + trap stays reachable (two pushes left), so the decision is still the math.
7. **[Worldo] L16 Sandbox:**
   - Spawn inside the room: row 1 becomes `'#..9AE#######'`, and `@` goes at row 5 x=6 (`'#.....@.....#'`). The kid then sees the toys first, and leaving is a choice. Verified: exit still reachable (13 moves).
   - Add three + blocks: row 4 becomes `'#.1+.2+.3+..#'`, so kids can build big numbers (1+2+3+4 = 10).
8. **[Matho call, then Worldo] L15 numbers ≤ 10.**
   - Suggested map: row 1 `'#@.3+4...AE#'`, row 3 `'#..2..-4####'`, door `'7 = □+4'`. Verified solvable: merge, carve, open. The decoy 2 shows 7 vs 9.
   - Optional partial trim on the current numbers: move `-5` up to row 2 (`'#.####-5####'`, row 3 `'#..3....####'`) for 29 moves.

## 4. Not changing (deliberately)
- L6 stays as is: the free first push that builds the wrong answer is the best "aha" in the slice.
- L1, L2, L5, L10 stay single-solution: §2 requires that for intros.
- No stars, scores or streaks anywhere. Blacklist check: clean.

## 5. What the P4 real-kid playtest must observe
1. **L6, L12, L15 traps:** does the kid look at the scale after the bump and change plan, or retry the same thing? Count retries before switching.
2. **L13 (new map):** do kids push the row first (and meet the bounce), or go straight for the column? Watch for spontaneous talk like "it goes the other way".
3. **Equation doors:** can non-readers (ask the parent) say what the door wants *before* touching it? Point-and-ask: "what does this door need?"
4. **Push vs math failures:** tag every undo as a push mistake (block in a corner, wrong row) or a math mistake (wrong value at the door). Target: math > push from L3 on.
5. **Undo use:** do kids find and use undo without help? Does anyone restart instead and lose motivation?
6. **Time per level** against the 1–3 min target, especially L3, L4, L12, L15. Watch for give-up signals (looking away, asking an adult, random mashing) after about 60 s without progress.
7. **Sandbox:** time spent before leaving. Do they build numbers nobody asked for? This is the strongest replay-pull signal.
8. **Juice timing:** can kids count the dots during a merge, carve or open (ask "how many went in?")? Do the bounce and boing read as funny, not as being told off (laughing versus frowning)?
9. **Readability of ten-rods** (L14 makes 10, L15 makes 13 if kept): does a 6-year-old read "10" as ten?
