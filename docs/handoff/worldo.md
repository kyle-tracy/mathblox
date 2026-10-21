# Worldo handoff: P2 fix batch #2 (2026-10-20, interrupted, uncommitted)
Scratch tools are in the session scratchpad (lost on restart). They are simple to rebuild: fp.mjs = deadFirstPushes at 3e6;
rt.mjs = solve while banning one event signature (route proof), plus walk20; rm.mjs = blank cells, then solve (lane route proof).

| Level | Status | Change | Verified |
|---|---|---|---|
| L4 Mind the Gap | done | walls at (3,1) and (3,6), above/below the blocks | fp clean; both routes; walk20 5% |
| L5 Short by One | done | walls at (3,1) and (3,5) | fp clean; both routes; walk20 6% |
| L9 Many Ways to Eight | done | bottom corridor extended to x=9 (a pushed 4 no longer plugs the 6) | fp clean; both routes; walk20 28% |
| L16 One Family | done | wall at (1,4); text: "each win needs two of them; all three can be opened" | fp clean; both routes; walk20 not measured |
| L17 There and Back | done | bottom 2 -> 3, B `7 = □+3`; skill/misconception/choice text updated | fp clean; carve 7-4 and 7-3 routes; cheese pass |
| L18 Into the Box | done | bottom return corridor (row 5) + right side column; exit at (12,3) via A | fp clean; pocketed blocks recoverable; 3+2 and 4+1; walk20 0% |
| L24 Same to Both Sides | done | 5 moved to (3,4), 4 moved to (5,5) (walls failed: they cut the 3's path and killed the level) | fp clean 23 s; 5 and 3+2 routes; 4+1 alone can't win; walk20 10% |
| L19 The Box Counts | not done (reverted) | tried: column lane col 4, △ = 6 (4+2 / 3+2+1), 7x5 room; routes OK, but fp at 3e6 ran >15 min | - |
| L20 Take It Out | not started | idea: a buffer row above and below the lane, gate mid-edge, so removed blocks can be pushed back | - |
| L26 text | not started | Matho item 5: mention the other fillings, incl. △ = 2+4 with the 4 on the crossing | - |

test/regress.test.js: FIRST_PUSH_TODO is now [Turn It Around, The Box Counts, Take It Out]. One Family and Same to Both Sides were added to HEAVY (slow).
FLAG: L14 still has 3 dead first pushes (up from (6,3), (7,3), (8,3)), which contradicts the CEO log line "L14 has no dead first push". Left untouched; the CEO decides.
If L19 gets △ = 6, WANT['The Box Counts'] in regress must change to {'△': 6} (Testo's file).

Next step: L20 redesign -> fp/walk/WANT; then L19 (smaller room, or keep the row lane and change the target/blocks); L26 choice text;
then `SLOW=1 node --test --test-name-pattern="Mind the Gap|Short by One|Many Ways|One Family|There and Back|Into the Box|Same to Both" test/regress.test.js` and `node --test test/`.
