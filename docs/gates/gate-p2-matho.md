# P2 Gate: Mathematical-Honesty Review (Matho)
2026-10-20. Inputs: `core/math.js`, `core/world.js`, `game.js` (render), `levels/levels.js`, `docs/style-guide.md`, gate screenshots L1–L16 and Arto's showcase. Engine edge cases were probed with node.

**Verdict: PASS WITH FIXES.** The critical-path engine rules are true in ℕ, and none of them has to be unlearned. Three issues teach something false. Two are visual (teen blocks in the master level, a level beam for "can't build"). One is a rule: 0 vanishes into a trench. Coverage is thin: S1 and S6 have no twist, and no skill can reach 3-of-4 mastery inside the slice.

## 1. Engine rules

| Rule | Verdict | Notes |
|---|---|---|
| Reading-order evaluation, long lines | **Honest** | Pushed left/up, the far-end triple is the reading-first one, so 9−3−2 = 4 from either side (test passes). This is the correct same-precedence left-to-right convention, and it still holds when × arrives (P4 repair is unchanged). Worldo's "no − in lines ≥ 5" authoring rule is now obsolete from the math side. |
| Result lands in the right-hand operand | **Honest** | The cell is fixed by reading position, never by push direction or by which addend. 4+6 lands in the same cell from either side. The colour is the value's colour. Nothing hints that order mattered for +. |
| Door equations, left to right, + and − | **Honest for P2** | Every P2 door uses + only, so NaN never occurs. Latent bug: `□−5+6 = 4` with 3 returns `[NaN, 4]`. That rejects an equation that is true in ℤ, because the naturals stop at an intermediate. |
| Balance scale NaN | **False (latent)** | `game.js:196`: a NaN side shows `?` and the beam stays **level**. A level beam is the icon for "equal". A side can only be NaN because it would be negative, which makes it lighter than any buildable side. It must rise, never sit level. |
| Trench: n fills n cells, too long bounces | **Honest, with conditions** | This is length comparison, not "bigger is bad". A short rod falls in and leaves countable holes (L4 uses this). A long rod shows its exact overhang (the extra ghost), so the failure is symmetric and quantitative. Risk: length is measured *along the push*. A 4 pushed crosswise into a 4-long trench bounces with "3 extra", which reads as "my measurement was wrong". This is reachable in Sandbox. The curriculum's "beam that fits" metaphor is wrong too: a real beam spans a shorter gap. The wording should be "fill the holes". |
| 0 into a trench | **False** | The probe gives `fill value:0` and the block is **deleted**, with the trench unchanged. This contradicts "0 is an object, never empty floor" (S4, locked decision). It is reachable in Sandbox. |
| Doors consume the key | **Acceptable** | Dots drop one-to-one into the slots (good S1 correspondence), and door and key vanish together, like both pans emptying. There is no "= means the answer is used up" signal, because the door shows both sides first. |
| Tick pad, used once | **Honest** | Successor. The spent ring shows it was used, and nothing can be farmed. |
| a − a | **Honest** | It leaves a dashed 0 block (L11). |
| Carve bounce | **Honest** | Push direction is irrelevant, no auto-swap, deficit ghost. In L13 the ghost (2 missing) equals 6−4. That is true (|4−6| = 2), but the ghost must stay hollow and unpushable so it never reads as "4−6 = 2". |

## 2. Visual honesty
- **1–10:** numeral, 5-structure dots, rod units and slots agree in every screenshot (checked 0–10 and doors 2–10).
- **11–20: false in P2.** `block()` draws n%10 dots and one ten-rod. So 13 shows **3 dots** and an orange bar of 10, and its rod reads 10, not 13.
  - In L15 (master, "units are conserved"), 8 dots fly into a 5 and the result shows 3. Then 5 chips fall off a face that shows 3.
  - This is bundling, which is scheduled for P3, so it appears before it is taught. 14 and 15 also have identical rod lengths.
- **L9 jam:** pushing [5][+] into the door bounces `not-equal` with no `sides`, so the scale is skipped. The S4 twist fails with no visible *why*, and no empty-socket ghost is shown.

## 3. Curriculum coverage (beats as labelled → as played)

| Skill | Intro | Practice | Twist | Combine | Master | Encounters |
|---|---|---|---|---|---|---|
| S1 | L2 | L3 | **none** (L4 is the de-facto twist, "close enough fits") | L4 | none | L2, L3, L4, L7 (L7 forced) |
| S2 | L5 | (L7 rest) | L6 ✓ surfaces 7 vs 13 | L11, L12 | L15 | 7 |
| S3 | L1 | L8 | L15 (units conserved) | L12, L13 | L15 | 5 |
| S4 | **L9 is the twist** (curriculum's own "5, +, socket") | none | L9 | L11 | none | 2 |
| S5 | L10 | none | L13 ✓ (3−5 bounce form) | L11, L12 | L15 | 5 |
| S6 | — | — | **none** (no fact-family level) | L12 | L15 | 2 |
| S7 | — | — | L13: − half ✓, **+ half not shown** (room A only ever reads 4+6, so a+b = b+a never appears) | — | — | 1 |

- **Level-text errors:**
  - L7's misconception ("bringing 7 shows 7 vs 11") cannot happen, because the only block is a 2 on a forced pad.
  - L9 is labelled introduce, but it is the twist.
  - The levels.js line 4 comment about right-to-left evaluation is stale.
- **Mastery signals this slice can produce:**
  - S1 gap-fill without a trial push (L3, L4)
  - S2 first-try opens on target-left and both-sides forms (L5, L6, L12, L15)
  - S3 build from two blocks (L8)
  - S4 chooses Void (L9)
  - S5 exact carve (L12) and no small−big retry after a bounce (L13)
  - S6 carve not undo: L15 traps the 8 in a corridor, so undo can't help. This structural lock is an honest substitute for the Undo lock.
- **Mastery signals missing:**
  - The Undo lock UI.
  - The thin-4/fat-5 twist. It is impossible here, because every block is one cell.
  - Subitizing on dots-only faces.
  - Route diversity: one multi-path door.
  - Void decoy.
  - S5 comparison.
  - Fact family.
  - S7 reordering.
  - 3-of-4 is unreachable for S4, S6 and S7 (≤ 2 encounters).
  - **No telemetry exists yet.**
  - Forced levels (L1, L2, L5, L7, L10, L11, L14) carry zero evidence and must not count.

## 4. Fixes (prioritized)
1. **game.js `block()` and L15:** teens must show all their units in P2. Either render 11–20 unit-for-unit (a full ten-frame of 10 dots plus ones, and a rod of 10 notched units + k units; Arto's call), or retune L15 to ≤ 10: `4+5`, door `'9 = □+5'`, decoy 3 shows 9 vs 11.
2. **world.js fill branch:** add `if (last.value === 0) return bounce(state, 'void', {x: cx, y: cy})` before the length loop. The renderer lays an empty dashed rod over the trench ("fills 0 holes") and the block survives.
3. **L9 and world.js door branch:** when the last item of the chain is an op, bounce with `{ socket: true }`, and have game.js draw a hollow □ ghost after the +. Relabel L9's beat to `twist`.
4. **L13:** change `doors.A` from `10` to `'6+4 = □'`, so the built 4+6 balances a door that reads 6+4. That is commutativity, shown next to room B's 4−6 bounce.
5. **game.js:196 and math.js `checkDoor`:**
   - The NaN pan rises: sort NaN as −∞, never level.
   - `checkDoor` rejects a `−` that is not the last op on its side. Then NaN ⇔ negative in ℤ, which makes the tilt honest. Do this before any door uses −.
6. **Sandbox map:** change row 7 to `'#...####....#'`, so the trench is entered only lengthwise. Authoring rule: trenches are always entered along their length.
7. **levels.js text:**
   - L4 beat `twist` (S1).
   - L7 misconception `'none (rest): forced tick, both-sides door'`.
   - Delete the stale line-4 comment.
8. **P2.1 content** (Worldo and Testo): add the S6 twist "One Family" (3, 4, 7 open `'3+4 = □'`, `'7 = 3+□'`, `'7 = □+4'`, `'□+3 = 7'`), and add one Void decoy to L14 (3+0 shows 10 vs 3). Tag forced levels `evidence: false` in telemetry.

## 5. Open questions for the CEO
- Teens in P2 versus bundling in P3. Do we accept unit-for-unit teens now (fix 1a), or cap P2 at 10 (fix 1b)?
- Thin-4/fat-5 can't exist while every block is one cell. I propose deferring the "bigger-looking = more" twist to P3 Array Fields (a 1×6 strip beside a 2×4 platform). Approve?
