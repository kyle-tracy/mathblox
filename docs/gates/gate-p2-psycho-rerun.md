# P2 Gate RE-RUN: Fun Review (Psycho), after P2.1
Date: 2026-10-20. Build: 24 levels (`levels/levels.js`). Screenshots: `scratchpad/gate2/L1–L24.png` (16 viewed, the rest scored from the maps).
Previous report: `gate-p2-psycho.md` (Agency failed the floor at 2.25).
**Evidence order:** the Commissioner's playtest outranks every AI score below. They found it fun and "very Baba Is You", they loved Turn It Around (now L14), and they require a choice in every level after L1. My old low L14 score is overruled and L14 stays. These scores are hypotheses until the P4 playtest with real children.
**Move counts:** not measured this run (no solver access). Testo is to report them (fix 5).

## 1. Scores (1–5; Frustration 5 = low risk; graded = not intro/rest)
| # | Level | Beat | Clarity | Agency | Juice | Frustr. | Replay | Hard part |
|---|---|---|---|---|---|---|---|---|
| 1 | First Push | intro | 5 | 1 | 4 | 5 | 2 | math (forced, allowed) |
| 2 | One More | intro | 5 | 2 | 4 | 5 | 3 | math |
| 3 | Fill the Holes | intro | 5 | 2 | 4 | 5 | 3 | math (old fix 3 applied) |
| 4 | Mind the Gap | practice | 4 | 3 | 4 | 4 | 3 | mixed; now real practice |
| 5 | Short by One | twist | 4 | 3 | 4 | 3 | 3 | mixed |
| 6 | Both Sides Weigh | intro | 4 | 2 | 4 | 5 | 3 | math; dots now on the sign |
| 7 | The Answer Is Not Next | twist | 4 | 3 | 4 | 4 | 4 | math (best trap) |
| 8 | Tip the Scale | rest | 4 | 2 | 3 | 5 | 2 | none; same template as L2 |
| 9 | Many Ways to Eight | practice | 5 | 4 | 4 | 4 | 4 | math |
| 10 | Nothing Changes | twist | 4 | 3 | 4 | 4 | 3 | math |
| 11 | Chip Away | intro | 5 | 2 | 5 | 5 | 4 | math; the mirror 3−8 / 8−3 is the best bait |
| 12 | Carve to Nothing | combine | 5 | 3 | 5 | 5 | 3 | math; both roads valid |
| 13 | The Missing Part | combine | 4 | 3 | 4 | 4 | 3 | math (old fix 6 applied) |
| 14 | Turn It Around | twist | 3 | 4 | 4 | 3 | 4 | pushing; kept by the Commissioner |
| 15 | Ten Pals | rest | 5 | 2 | 5 | 5 | 4 | none |
| 16 | One Family | twist | **2** | 2 | 4 | 3 | 3 | reading: the three door signs overlap |
| 17 | There and Back | master | 4 | 3 | 4 | 3 | 4 | math; numbers ≤ 10 now |
| 18 | The Box Counts | intro | 4 | 4 | 4 | 5 | 4 | math; but an open room, not a 1-wide intro |
| 19 | Take It Out | practice | 4 | 4 | 4 | 4 | 3 | math |
| 20 | Two Triangles | twist | 3 | 4 | 4 | 3 | 4 | math |
| 21 | The Shrinking Side | twist | 3 | 3 | 4 | 3 | 3 | math (inverse, so on the negation theme) |
| 22 | Same to Both Sides | combine | 3 | 3 | 4 | 3 | 3 | both: two lanes and two doors |
| 23 | Crossroads | master | 3 | 3 | 4 | 3 | 4 | math: a system of two equations |
| 24 | Sandbox | rest | 4 | 5 | 4 | 5 | 5 | none (old fix 7 applied) |

**Means:** Clarity 4.00 · Juice 4.08 · Frustration 4.08 · Replay 3.38.
**Agency:** graded beats (15 levels) = 48/15 = **3.20**, which **clears the floor**. Over all 24 levels it is 2.92. The gate rule averages graded beats only. Overall mean is **3.75** (3.69 using all-level agency).

## 2. Two roads: real or fake choice?
**Real, but shallow.** The deciding information is the math (door against block), not the geometry, so the choice is intrinsically integrated.
- In each one there is exactly one true road. Testing both costs about 3 moves and is harmless, so a kid can guess and check instead of predicting.
- That is right for intros (§2 asks for one solution), so they score Agency 2.
- Real autonomy comes from levels with two true roads or open rooms: L9, L12, L18–L20, L24.
- Seven levels share the same mirror-corridor template: L2, L3, L6, L8, L11, L12, L15. L2 and L8 are the same layout, which risks template fatigue.
- The true side varies (left 4 times, right 2, both once), which is fine.
- Negation as a near-constant theme: met. It appears in bounces, ghosts, carving, the order of −, removal and 10 − △.

## 3. Pacing and rest beats
- **Standard used:** a 1-wide new-world intro counts as the sawtooth drop after a twist or master. On that standard L5→L6, L10→L11 and L17→L18 are fine. Rest beats L8, L15 and L24 are well placed.
- **Violations:**
  - L16 (twist) goes straight into L17 (master).
  - Lanes go L20 twist → L21 twist → L22 combine with no rest.
- **Lanes (L18–L23):** the hardest abstraction in the slice gets no 1-wide intro (L18 is an open 9×3 room with four blocks), only one practice level, and two twists in a row. It ends in a system of two equations for 6–9-year-olds. The Master and the Sandbox are fine; the ramp in between is too steep.

## 4. Fixes (prioritized; none blocks the gate; no criterion mean is below 3)
1. **[Arto] Door signs never overlap each other, the exit, or lane cells.**
   - L16: two of the three equations are hidden. This is the only level-level Clarity 2.
   - L22: the B sign covers the exit.
   - L20 and L21: the sign sits on lane cell x=7.
2. **[Worldo] Add a 1-wide lane intro before L18.** One block, one lane, one push, and the `△ = n` gate opens. The rule is "every new verb gets a 1-wide intro". L18 then becomes the second practice level.
3. **[Worldo, Matho] Add rest beats.**
   - Lanes: put a lane rest (two true roads, big totals) after L20.
   - L16→L17: reorder, or relabel L16 (it adds no new verb). That is their call, not mine.
4. **[Worldo] Make L8 two true roads**, as L12 already is: put a 2 and a pad on both sides. A rest should feel like competence, not a quiz. Unverified: needs the solver and the cheese check, and keep `teaches: ['tick']`.
5. **[Testo] Report the shortest-path move counts for all 24 levels.** Flag anything over 30 moves, especially L14, L17, L22 and L23, against the 1–3 min target.
6. **[Testo, P4 watch list]**
   - Two roads: does the kid pause before the first push (predicting) or run straight to a side (guessing)?
   - L14: time per level and give-up signals.
   - Lanes: can a kid say what △ is worth before touching anything?

GATE: PASS WITH FIXES
