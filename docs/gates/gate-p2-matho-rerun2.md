# P2 Gate re-run #2: Mathematical-Honesty Review (Matho)
2026-10-20, after Worldo's two-routes batch. Inputs: `levels/*.js` (27 levels), `core/world.js` (`laneValues`, `step`, `gatesTrue`), and `docs/curriculum.md`. I solved every level's routes by hand from the maps. I ran nothing and looked at no screenshots.

**Verdict: PASS WITH FIXES.** No level teaches anything false, and every second route is mathematically honest. One level, L17, overclaims what its second route teaches. Two text and telemetry items remain. Nothing blocks the gate.

## 1. Per-level check (teaches / misconception / evidence vs. the new routes)
| L | Level | Routes (math) | Honest? |
|---|---|---|---|
| 1 | First Push | forced 2+1 | Yes. `evidence: false`. |
| 2 | One More | tick 3→4 for the 4-door, or 5→6 for the 6-door. Bait: 4→5 shows 5 vs 4 | Yes |
| 3 | Fill the Holes | fill 3 + key 2, or fill 4 + key 2. Bait: 4 over 3 holes | Yes |
| 4 | Mind the Gap | key 2 + fill 3, or key 3 + fill 2 | Yes |
| 5 | Short by One | tick 4→5, fill 5, key 2; or tick 2→3, fill 3, key 4 | Yes. Both roads require the tick. |
| 6 | Both Sides Weigh | 4 for `6=□+2`, or 5 for `7=□+2`. Bait 8: 6 vs 10 | Yes |
| 7 | The Answer Is Not Next | 4 for `7=□+3`, or 5 for `7=□+2`. Bait 7+3: 7 vs 13 | Yes. The 7+3 chain is pinned, so it can only be pushed right. |
| 8 | Tip the Scale | tick 2→3 (A), or tick 4→5 (B). Plain 4 at A: 7 vs 8 | Yes. No winning path skips the tick. |
| 9 | Many Ways to Eight | 2+6, or 4+4 | Yes |
| 10 | Nothing Changes | 5+0 (A), or 3+0 (B) | Yes. The 5+ and 3+ are pinned, so the Void is required. |
| 11 | Chip Away | 9−4, or 8−3. Bait: 2−7 deficit ghost | Yes. The column reads top to bottom. |
| 12 | Carve to Nothing | 4−4, or 5−5, each leaving a Void for `4=□+4` | Yes |
| 13 | The Missing Part | 7−3 (A), or 9−5 (B) | Yes. Both doors need 4, so the carve is required. |
| 14 | Turn It Around | order-only (CEO exemption) | Yes |
| 15 | Ten Pals | 3+7, or 4+6. Bait: 0+3 | Yes |
| 16 | One Family | 4 via B, or 3 via C, then 7 at A | Yes, with a wording fix (fix 4) |
| 17 | There and Back | 3+4, then 7−4 = 3 (A); or 3+4, then 7−2 = 5 (B) | **Overclaims** (fix 1) |
| 18 | Into the Box | 3+2, or 4+1. Push-through takes a block out | Yes |
| 19 | The Box Counts | 3+2, or 4+1 | Yes |
| 20 | Take It Out | remove the 4, or remove the 3 and the 1 | Yes |
| 21 | Two Triangles (V3) | take one 4 out, or swap in 2+2 | Yes. It is an incorrect worked example, and it logs only "fixed the shown error". |
| 22 | Big Box | 6+3, or 5+4. 6+5: 11 vs 9 | Yes. The rest beat is a V1 repeat with bigger numbers. |
| 23 | The Shrinking Side (V4) | 3+4, or 5+2. The 3 alone: 7 vs 3 | Yes |
| 24 | Same to Both Sides (V5) | ○ = 5, or 3+2. The 4+1 bait spends the key | Yes (§2) |
| 25 | Two Triangles Again | one 4, or 2+2. 4+4: 16 vs 8 | Yes (§3) |
| 26 | Crossroads (V6) | △=6, ○=4. Five fillings are arithmetically possible, including the shared crossing (4 on the crossing plus 2 in the row) | Yes. The `choice` text names only two (fix 5). |
| 27 | Sandbox | free | Yes |

The engine check is clean:
- Gates are live.
- `gatesTrue` re-evaluates at the exit, so a lane pushed to 16 after a gate opened cannot win (L25).
- Every lane level is operator-free.
- Every block is ≤ 10.

## 2. Ruling: V5, the 2 can sit in ○ beside "○ + 2"
**This is OK, under two conditions.**

Why it is safe:
- The misread "○ + 2 means put a 2 in ○" is never rewarded. The 2 alone gives ○ = 2, and the scale shows 7 vs 4.
- The only winning use of the 2 is 3+2, which makes ○ = 5 = △. That is the Küchemann demo itself: different blocks (shelf 1+4 against room 3+2) with the same value.

The two conditions:
1. The gate readout must show ○'s **total** (5), not its blocks.
2. "The 2 alone into ○ first" is logged as a miss, like L23's 3-alone.

The 4+1 bait is a resource trap: it spends the □ key. It is not math evidence, so do not score it as the misconception.

## 3. Does L25 carry the "one block per △" evidence?
**Yes, with the signal defined like this:**
- **Miss:** the △ total reaches 8 (16 vs 8) at any time.
- **Pass:** a first-try win where the △ total never exceeds 4.

Two caveats:
- **A 2+2 win alone is ambiguous.** It could also be "one small block per △", so it counts as route diversity only.
- **The live gate is a weak positive.** The gate turns true after the first 4, so a child who meant to push two 4s may just walk out. That is why the miss is the strong signal.

L25 reuses L21's exact numbers. That tests recall, not transfer (fix 3).

## 4. curriculum.md (updated in this pass)
- The S11 level list now runs L18–L26 with L-numbers. It adds Into the Box, Big Box and Two Triangles Again.
- The V3 evidence now points at L25 instead of "P3 echo room", using the §3 signal.
- The V5 misconception now reads △ = 1+4 (shelf) and ○ = 5 or 3+2.
- S6: One Family is now marked practice, and the doc states "P2 has no S6 twist" (S6 is a P2 seed). L13's wrong-part bounce is its visible failure, and the Undo-locked twist is P4's job.
- The skill IDs cited in `levels/*.js` (S1–S7, S11) all match. The L14 and L16 references still hold.

## 5. Fixes (prioritized; none blocking)
1. **L17 There and Back** (Worldo). Route B (7−2 = 5) never recovers a part, so the round trip "(3+4)−4 = 3" and "the 3 returns" happen only on route A. Pick one:
   - Swap the 2 for a 3 and make door B `7 = □+3` (key 4). Then both roads are round trips, 7−4 = 3 and 7−3 = 4, and they still differ in math.
   - Or have Testo log round-trip evidence on route A only, and edit the skill and misconception text to match.
2. **L25 telemetry** (Testo). Implement the §3 miss and pass signals, and tag L21 as "fixed the shown error" only.
3. **L25 transfer** (Worldo, optional). Use different numbers from L21, for example `△ + △ = 6` with 3, 2, 1, 3. The routes become one 3 or 2+1, and the miss is 3+3 (12 vs 6).
4. **L16 text** (Worldo). Change "each run opens two of them" to "each win needs two of them; all three can be opened".
5. **L26 `choice`** (Worldo). Mention the other fillings, especially the shared crossing (△ = 2 + 4 with the 4 on the crossing), which is honest Kakuro.
6. **V5 readout** (Arto). Confirm that the lane readout shows the total, per §2 condition 1.
7. **Teen side totals** (log). L7's bait (13) and L13's (11) are non-S11 side totals above 10. Extend the "drawn unit-for-unit" rule to every door side total.
8. **Stale map** (Archo). CLAUDE.md says `lanes.js (L18–23, S11)`. It is now L18–L26, with Sandbox at L27.
9. **Carried over from re-run #1:** `checkDoor` rejecting a non-last `−` (Archo) is still latent.

## 6. Open question for the CEO
- S6 has no twist level in P2, which bends §0 ("the twist is required"). I ruled it acceptable because S6 is a seed skill. If you want a P2 S6 twist, it needs a new level or a relabelled one (Worldo and Psycho).
