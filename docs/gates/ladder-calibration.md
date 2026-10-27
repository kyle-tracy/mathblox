# Ladder calibration (Testo, 2026-10-27, experiment, not a gate)

`timeout 180 node test/ladder.js` (about 95 s). Seeded; runs cut to T0 100 / T1 40 / T2 8 to fit 2 min (cap stays 3x solution), so rates are coarse (T2 steps of 12.5%, T1 of 2.5%). Heuristic h = Manhattan(player, exit) + 3 per false gate + 2 per remaining plain door. Tier = lowest of T0/T1/T2 with win >= 5%, else T3. Detours = moves on the stored solution where h rises.

| # | Level | Kind | len | T0% | T1% | T2% | Tier | Det |
|---|---|---|---|---|---|---|---|---|
| 1 | First Push | ANCHOR | 13 | 1.0 | 100 | 75 | T1 | 0 |
| 2 | The Answer Is Not Next |  | 13 | 0.0 | 0 | 0 | T3 | 4 |
| 3 | Nothing Changes |  | 23 | 0.0 | 0 | 0 | T3 | 5 |
| 4 | The Missing Part |  | 16 | 0.0 | 0 | 0 | T3 | 4 |
| 5 | There and Back |  | 24 | 0.0 | 0 | 0 | T3 | 7 |
| 6 | The Box Counts | FAV | 13 | 0.0 | 3 | 50 | T2 | 1 |
| 7 | The Shrinking Side | FAV | 13 | 0.0 | 0 | 13 | T2 | 1 |
| 8 | Same to Both Sides | FAV | 14 | 0.0 | 5 | 0 | T1 | 1 |
| 9 | Two Triangles Again | FAV | 12 | 0.0 | 98 | 75 | T1 | 0 |
| 10 | Crossroads | FAV | 19 | 0.0 | 0 | 0 | T3 | 3 |
| 11 | Same Two Numbers |  | 24 | 0.0 | 0 | 0 | T3 | 7 |
| 12 | Three of Nine |  | 24 | 0.0 | 0 | 0 | T3 | 5 |
| 13 | No Answer |  | 28 | 0.0 | 0 | 0 | T3 | 9 |
| 14 | The Line Goes On |  | 10 | 0.0 | 0 | 0 | T3 | 4 |
| 15 | Fair From Either Side |  | 13 | 0.0 | 0 | 0 | T3 | 3 |
| 16 | Minus Reads Left to Right |  | 9 | 0.0 | 0 | 25 | T2 | 1 |
| 17 | Clear the Line |  | 13 | 0.0 | 0 | 0 | T3 | 4 |
| 18 | The Leap Is a Bracket |  | 7 | 4.0 | 8 | 100 | T1 | 1 |
| 19 | Either Plus First |  | 7 | 1.0 | 0 | 50 | T2 | 0 |
| 20 | Minus Minds the Order |  | 8 | 0.0 | 0 | 38 | T2 | 2 |
| 21 | Take Away Nothing |  | 9 | 0.0 | 0 | 0 | T3 | 2 |
| 22 | Dodge the Storm |  | 7 | 1.0 | 0 | 0 | T3 | 1 |
| 23 | Turn One Over |  | 16 | 0.0 | 20 | 88 | T1 | 0 |
| 24 | Flip It Back |  | 24 | 0.0 | 0 | 0 | T3 | 2 |
| 25 | Full of Nothing |  | 20 | 0.0 | 25 | 38 | T1 | 0 |
| 26 | The Other Way Round |  | 15 | 0.0 | 0 | 0 | T3 | 3 |
| 27 | Ever Smaller Steps |  | 19 | 0.0 | 0 | 0 | T3 | 2 |
| 28 | Quarter Past Half |  | 29 | 0.0 | 0 | 0 | T3 | 11 |
| 29 | A Third of Nine |  | 23 | 0.0 | 0 | 0 | T3 | 10 |
| 30 | Half of What Is Left |  | 57 | 0.0 | 0 | 0 | T3 | 32 |
| 31 | Keep the Pebble |  | 22 | 0.0 | 0 | 0 | T3 | 5 |
| 32 | Small Shared by Big |  | 16 | 0.0 | 0 | 0 | T3 | 4 |
| 33 | Be Someone Else |  | 10 | 0.0 | 0 | 0 | T3 | 2 |
| 34 | Owe the Whole Box |  | 15 | 0.0 | 0 | 0 | T3 | 1 |
| 35 | The Sign Carries It |  | 17 | 0.0 | 0 | 0 | T3 | 2 |
| 36 | Three for Every Piece |  | 26 | 0.0 | 0 | 0 | T3 | 8 |
| 37 | A Friend Is a Wall |  | 17 | 0.0 | 0 | 0 | T3 | 8 |
| 0 | syn: door ahead | ANCHOR | 5 | 10.0 | 100 | 75 | T0 | 0 |
| 0 | syn: merge to door | ANCHOR | 8 | 1.0 | 98 | 88 | T1 | 0 |

(# 0 = synthetic rooms defined in the script.)

## Read

- **Tier does not separate.** Anchors: T0, T1, T1. Favourites: T2, T2, T1 (Same to Both Sides, 2 wins of 40), T1, T3. Two Triangles Again (98% greedy, 0 detours) is indistinguishable from First Push. Crossroads sits in T3 with the long fields levels.
- **Detours separate weakly.** Anchors all 0. Favourites 1, 1, 1, 0, 3: four of five above the anchors, Two Triangles Again overlaps. Detours also scale with length (Half of What Is Left: 32 of 57), so read det/len, not raw det.
- **Heuristic weakness:** h has no term for block values or door match, so T3 means "h is blind here", not "needs thought". 25 of 37 levels are T3, which throws away the signal. Anything that needs walking away from the exit reads as a detour.
- **5 lowest-thought levels in play** (tier, then T1/T2 win rate, then detours; First Push excluded as an anchor): Two Triangles Again (T1, 98%, det 0), Turn One Over (T1, 20/88%, det 0), Full of Nothing (T1, 25/38%, det 0), The Leap Is a Bracket (T1, 8/100%, det 1), Either Plus First (T2, 50%, det 0).
- Flag for Worldo/Qualito: Two Triangles Again reads as easy by this alarm yet is a commissioner favourite, so either the alarm misses what makes it good (likely) or it is easier than it feels. Not our call.
- Upgrade path if wanted: add h terms for lane totals vs gate sides, memoise `step` per state (Half of What Is Left costs about 450 us/step and eats most of the time), then restore 1000/300/100 runs.
