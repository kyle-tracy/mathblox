# P2 Gate re-run: Mathematical-Honesty Review (Matho)
2026-10-20, after P2.1. Inputs: `core/math.js`, `core/push.js`, `core/world.js`, `render/fx.js`, `levels/*.js` (24 levels), and screenshots L1–L24. I verified from the code and the static screenshots. I did not run anything.

**Verdict: PASS WITH FIXES.** Seven of the 8 prior fixes are resolved and one is partial. The lane rules are honest. Nothing blocks the gate.

## 1. Prior fixes
| # | Fix | Status |
|---|---|---|
| 1 | Teens unit-for-unit | **Resolved.** Draw, look and the scale all draw unit-for-unit. P2 blocks are ≤ 10, and only V3's side total (16) is a teen. |
| 2 | 0 into a trench | **Resolved.** The `zero-fill` bounce shows a dashed rod and the block survives. |
| 3 | Socket ghost; L9 is the twist | **Resolved.** |
| 4 | L14 `'6+4 = □'` | **Resolved.** |
| 5a | NaN side rises | **Resolved.** NaN is weighted as −∞. When both sides are NaN, the beam is a dashed level line, which reads as "unknown", not "equal". |
| 5b | `checkDoor` rejects a non-last `−` | **Not done.** The rule is in decisions.md but the code does not enforce it. All 5 current `−` doors comply, so this is latent. |
| 6 | Sandbox trench entered lengthwise | **Resolved.** |
| 7 | levels text | **Resolved.** L4 is now `twist`. The stale comment is gone. L7 now makes "7 vs 11" reachable. |
| 8 | One Family; L14 Void decoy | **Resolved.** One Family is L16. The Void decoy is in Ten Pals (L15). |

## 2. Rulings on Worldo's questions
- **One Family, 3 doors: accepted.** Key consumption is locked, so three blocks allow at most 3 doors.
  - The three doors cover 3+4, 7−3 and 7 = □+4 (≡ 7−4). Each block is a key once, and each sign shows the other two members.
  - 4+3 is S7's job, and L14 covers it.
  - I edited the S6 twist line in curriculum.md to match.
- **V3 pre-placed 16 vs 8: honest.** It is an incorrect worked example (Große & Renkl), and the sign shows 8 dots under each △.
  - Worldo's premise does not hold: the player *can* reach 16 vs 8 by pushing the second 4 in after the gate opens. It just isn't forced.
  - Cost: V3 cannot log "solved without one block per △". That evidence moves to an empty-lane echo (curriculum.md updated).

## 3. Lane rules as built
- The lane sum is honest: an empty lane is 0 (the empty sum), and the crossing cell counts once in each lane.
- Live gates are honest.
- "Every gate true at once" is honest: holding a gate open by standing in it cannot cheat the exit.
- Two risks are latent:
  - **Operator in a lane.** It reads `?` = NaN, so the scale makes that side *rise*. That falsely says "less than 0" when the true meaning is "unknown". No V level holds an operator. Rule: no operators in lanes until the two render differently.
  - **Held-open gate.** A gate held open while its equation is false shows "open" while false.

## 4. S11 coverage
| Level | Intended misconception | Surfaced? |
|---|---|---|
| V1 | △ is one block | Yes. There is no 5 block. |
| V2 | to solve, add | Yes. The lane starts at 8 vs 4. |
| V3 | letter = object | Shown, not generated (see §2). |
| V4 | more makes bigger | Yes, through the live readout. The 3 bait (7 vs 3) is "copy the visible number". |
| V5 | relabel to "different symbols must differ" | Yes: △ = ○ = 5. The shelf's visible 2 next to the door's "+2" invites a misread. |
| V6 | each equation uses its own value | Yes. Its text is wrong (see fix 2). |

## 5. Fixes (prioritized)
1. **L16 signs overlap** (screenshot): A is clipped and B is unreadable, so the fact family is invisible. Stagger the signs or put them on alternating sides (Arto or Worldo).
2. **V6 misconception text** (Worldo): change it to "△=4, ○=6 (4 pushed into the row) opens A, and B reads ? vs 2; △=8, ○=2 (the 2 on the crossing) opens A, and B reads 6 vs 2".
3. **`checkDoor`** (Archo): throw when a `−` is followed by another op on the same side. That keeps NaN ⇔ negative.
4. **Held-open false gate** (Arto): draw it visibly "held", for example a lowered portcullis resting on the player, so open always means true.
5. **V5** (Worldo): make the sealed shelf `1+4`, or otherwise avoid a block that matches the door's `+2`. Relabel the misconception.
6. **V3 evidence** (Testo and telemetry): tag V3's "one block per △" signal `evidence: false`, and schedule the empty-lane echo.
