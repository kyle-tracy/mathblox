# MathBlox — Curriculum Spine
Owner: Matho. Every level cites the skill IDs below. Every mechanic must pass §3 before it ships.

## 0. Principles
- **CPA every time.** A skill appears first as a concrete block action, then as a pictorial glyph on the block, and only after that as a symbol on a door. A symbol never comes before its block.
- **Five beats per skill** (Worldo): introduce → practice → twist (the misconception surfaces) → combine → master. The twist level is required. It is the level designed so the wrong idea fails visibly and safely.
- **Mastery is inferred, never quizzed.** Default rule, unless a skill overrides it:
  - The critical action succeeds with no undo, no retry, and no wrong push first.
  - This happens in **3 of the last 4** encounters with the skill.
  - Those encounters span **≥ 2 sessions**.
  - At least one of them is an **interleaved** level, where the skill isn't the level's headline.
  - Elapsed time may be logged as weak evidence. It is never shown and never required, because there are no timers.
- **Evidence signals** (Testo designs the telemetry, privacy-safe, nothing leaves the device by default):
  - first-try push
  - undo immediately after a push, which suggests a prediction failed
  - overshoot followed by a correction
  - pushes the player tried but backed out of
  - route diversity on multi-path doors
- **Undo is not an inverse.** Undo rewinds time. Carve undoing a Merge is an operation in the world. Never present Undo as "the opposite of +".

## 1. Skill graph

```
S1 count/subitize ─► S2 lock (=) ─► S3 merge (+) ─► S4 void (0)
                                       │              │
                                       ▼              ▼
                                  S7 commutativity   S5 carve (−) ─► S6 inverse +/−
                                       │                             │
                                       ▼                             ▼
                                  S8 array (×) ──────────────► S9 share (÷, remainders)
                                       │                             │
                                       └──────────► S10 order of ops & distributivity ◄┘
                                                         │
     P6: N1 place value/bundling · N2 negatives · N3 fractions
     P7: N4 coordinate plane ─► N5 vectors ─► N6 matrices
```
P5 (polish/retention) adds no new skills. It adds echo (spaced review) levels for S1–S10.

## 2. P1–P4 skills (detail)

### S1 Counting and subitizing (P2, Number-Line Meadow)
- **Prereqs:** none.
- **Content:**
  - one-to-one correspondence
  - stable order
  - cardinality (the last count names the set)
  - subitizing 1–5 from dot faces
  - Tick = successor
- **Mastery evidence:**
  - Ticks a block to a target with no overshoot or undo.
  - Picks the right block from a mixed pile for a gap, on first try, when the faces are dot patterns rather than numerals. This is the subitizing signal.
  - Measures a gap against axis ticks and fills its holes exactly (n fills n cells, measured along the push).
- **Misconception to surface:**
  - "Count = recite," where the child skips or double-counts units.
  - "Bigger-looking = more." In the twist level a long, thin 4 sits next to a short, fat 5, and only the unit marks decide.
- **Verb:** Tick. Blocks always show unit segments, so a 6 *looks* six (Arto).

### S2 Equality as balance — the Lock (P2)
- **Prereqs:** S1.
- **Content:** `=` is a two-way relation ("same amount as"). It does not mean "the answer comes next".
- **Mastery evidence:** opens all of these on first try:
  - target on the right: `3+4 = ?`
  - target on the left: `7 = 3+?`
  - expressions on both sides: `2+5 = 3+?`
  - a number-only door: `7 = 7`
- **Misconception to surface:** "= means write the answer." The twist door is `7 = □ + 3`. A child who reads it as "answer comes next" brings 10, and the door visibly tips like an unbalanced scale.
- **Verb:** Lock, drawn as a balance scale. By the end of P2 at least a third of the doors must not have the bare `expression = ?` shape.

### S3 Addition — Merge (P2)
- **Prereqs:** S1, S2.
- **Content:**
  - addition as combining (part-part-whole)
  - counting on from the larger part rather than counting all
  - sums to 20
- **Mastery evidence:**
  - Builds a door's target from two blocks on first try.
  - On multi-path doors (`12` from 5+7, 9+3 or 6+6), uses **≥ 2 different decompositions** across encounters. This is the part-whole signal.
- **Misconception to surface:** "Merging makes a new kind of thing, not just more." The twist splits a merged 7 back into a 3 and a 4 with Carve: the units were conserved.
- **Verb:** Merge, `[a][+][b]`.

### S4 Zero as identity — Void (P2)
- **Prereqs:** S3.
- **Content:**
  - a + 0 = a and a − 0 = a
  - 0 is a *number* (an object you can hold), not absence
- **Mastery evidence:**
  - Solves a "fill the socket without changing the total" puzzle by choosing Void unprompted.
  - Never brings Void to a door that needs a change.
- **Misconception to surface:**
  - "Zero is nothing, so it isn't there."
  - "Adding always makes bigger." The twist is a door at exactly 5, where you hold a 5, a +, and the socket must be filled.
- **Verb:** Void. **a − a leaves a visible Void block, never empty floor.**

### S5 Subtraction — Carve (P2)
- **Prereqs:** S3, S4.
- **Content:**
  - take-away
  - comparison ("how much longer is 9 than 6?" means measure the difference)
  - a − b with b ≤ a
- **Mastery evidence:**
  - Carves to an exact target on first try.
  - Solves a comparison level, where the gap equals the difference of two pillars, without trial pushes.
  - Never tries `[small][−][big]` after the first bounce in a session.
- **Misconception to surface:**
  - "Subtraction is commutative." The kid pushes `[3][−][5]` and gets a bounce. `[5][−][3]` works.
  - "You can't ever take a bigger from a smaller." This one is **deliberately left open**, see §3.1.
- **Verb:** Carve. The chisel bounces when b > a.

### S6 Inverse relationship of + and − (P2 seed, P4 full)
- **Prereqs:** S3, S5.
- **Content:**
  - (a + b) − b = a
  - fact families (3, 4, 7)
  - missing addend solved by subtraction
- **Mastery evidence:**
  - Recovers an original block after a merge by *carving*, not by Undo, when Undo is locked for that one puzzle. In this level Undo is locked by design and the lock is shown.
  - Solves `7 = 3 + □` by carving 3 from a 7 rather than ticking up from 3.
- **Misconception to surface:**
  - "Undo is the opposite operation."
  - "Each fact is a separate thing to memorize." One Family (L16, now a **practice** beat) has three doors, one per family member as the key: `3+4 = □` (7), `7 − 3 = □` (4), `7 = □+4` (3, the missing-addend form of 7 − 4). Doors consume keys, so three blocks allow at most three doors. Each sign shows the other two members. The fourth fact, 4+3, is S7's job (L14 `6+4 = □`). One win needs two doors; opening all three is allowed.
  - **P2 has no S6 twist level.** S6 is a P2 seed. Its visible failure in P2 is L13's wrong-part bounce (7−5 gives 5 vs 7). The required twist, an Undo-locked round trip, is P4's job.
- **Verb:** Merge and Carve as a round trip. In P4 a reversing machine runs any chain backward.

### S7 Commutativity (and associativity) (P2 discovery, P3 for ×)
- **Prereqs:** S3, S5 (as the contrast).
- **Content:**
  - a + b = b + a
  - (a + b) + c = a + (b + c)
  - − and ÷ are **not** commutative
- **Mastery evidence:**
  - Freely reorders addends to use what's nearby, so routes vary in order.
  - Never reorders around a −.
  - In P3, rotates an array to fit a gap.
- **Misconception to surface:** overgeneralizing commutativity to − and ÷. The twist is one level where `[4][+][6]` and `[6][+][4]` both work and the same layout with − only works one way.
- **Verb:** Merge (order-free) contrasted with Carve. In P3, rotate the Array.

### S8 Multiplication — Array (P3, Array Fields)
- **Prereqs:** S3, S7, S1 (skip-counting).
- **Content:**
  - a×b as an **area or array**: rows × columns
  - equal groups
  - ×1 is the identity
  - ×0 is an empty platform (a Void)
- **Mastery evidence:**
  - Builds a platform of a required area two different ways (3×4 and 2×6).
  - Rotates instead of rebuilding.
  - Solves ×0 and ×1 doors on first try.
- **Misconception to surface:**
  - "Multiplication always makes bigger." The ×1 and ×0 twist levels are **required in P3**.
  - "× is just a lot of +." That's true for whole numbers, but the area model is what we teach, because it survives fractions and matrices.
- **Verb:** Array. It produces an *object* (the platform), not a taller block.

### S9 Division with remainders — Share (P3, Sharing Grove)
- **Prereqs:** S8, S5, S6.
- **Content:**
  - partitive division (share among b pedestals)
  - quotitive division (how many groups of b; a "pack" variant)
  - a = q·b + r with r < b
  - 0 ÷ n = 0
  - n ÷ 0 is undefined
- **Mastery evidence:**
  - Predicts usable shares, for example picks the 13 that gives 4 each with 1 pebble when a door needs 4.
  - Uses remainder pebbles as a resource.
  - Solves both the partitive and the quotitive framings.
  - Avoids ÷0 after one storm.
- **Misconception to surface:**
  - "The remainder is a decimal" (7÷2 = 3.1).
  - "Division always makes smaller."
  - "0 ÷ 5 is impossible." The twist: it resolves to 5 empty pedestals.
  - "÷0 = 0." The storm never resolves.
- **Verb:** Share, with remainder pebbles. **Only ÷0 storms. 0 ÷ n resolves.**

### S10 Order of operations and distributivity (P4)
- **Prereqs:** S6, S8, S9.
- **Content:**
  - × and ÷ bind before + and −
  - same-precedence operations go left to right
  - grouping (crates are parentheses)
  - a×(b+c) = a×b + a×c
- **Mastery evidence:**
  - Builds `2 + 3×4` correctly as one array plus 2.
  - Splits a 7×6 array into 5×6 + 2×6 to fit two gaps.
  - Uses a crate to force (2+3)×4 when needed.
- **Misconception to surface:**
  - "Always work left to right." The twist machine.
  - "Split only one factor" (a×(b+c) = a×b + c). The split array visibly leaves a strip uncovered.
- **Verb:** order-of-operations machines, crates, and **Split the Array**.

## 3. Honesty check of the verb table and decisions

### 3.1 Subtraction "bounce" before negatives: honest, with conditions
- **Risk.** This is literally the textbook misconception "you can't subtract a bigger number." The bounce is honest only if it says "not in *this* world yet" and never "impossible."
- **Requirements:**
  - Show bounce feedback as a **deficit ghost**: a faint outline of the 2 missing units under 3 − 5.
  - Use no "error" or "wrong" glyphs.
  - The bounce must never auto-swap the operands.
- **Repair:** **Mirror Caves level 1, "The Chisel Goes Through"** (P6). The first action in that level is the same `[3][−][5]` push. It now carves through the floor and leaves an anti-block −2, which fills the ghost the kid has been seeing since P2.
- **Column subtraction caveat.** In P6, Place-Value Quarry must not teach "always subtract the smaller digit." Borrowing is unbundling a ten-rod, never swapping digits.

### 3.2 Operators as pushable blocks resolving `[a][op][b]`: honest, with three requirements
1. **Reading order is fixed by the axes, never by push direction.** Rows read +x (left to right). Columns read top to bottom. If push direction set the order, `5−3` pushed from the right would become `3−5`, and non-commutativity would look arbitrary. *This is an honesty requirement. The implementation is Axio's.*
2. **Mixed-precedence chains.** Physical pushing naturally evaluates whatever it hits first. That is plain left-to-right, which is false for `2+3×4`.
   - Before P4, any chain mixing {+,−} with {×,÷} must bounce ("too tangled to carve").
   - Same-precedence chains such as `[5][−][2][−][1]` may resolve left to right, which is correct.
   - **Repair:** the first P4 machine level, "Arrays Bind First," shows × fusing into a platform before any + can reach it.
3. **"Result lands in b's cell"** is fine because value is an attribute. Never let the cell or color of the result hint that order mattered for `+`.

### 3.3 Equality Lock: risky as specified
- A door showing a bare `7` that opens for a 7 block is equality-as-identification. Doors that only ever read `a op b → ?` would *install* "= means the answer comes next."
- **Repair inside P2, not later:** the S2 door forms (target on the left, expressions on both sides).

### 3.4 Other items
- **Undo vs. inverse.** The roadmap's "inverse operations (undoing as a mechanic)" must mean Carve undoes Merge, not the Undo button (S6).
- **Merge "height = sum."** This is honest for length only. Area (×) has to *look* different, as a platform rather than a taller tower. Otherwise kids conflate 3×4 with 3+4.
- **Remainder pebbles.** These are honest in the whole numbers, and they persist as objects. **Repair:** Fraction Forest level 1, "Slice the Pebble." The same 7÷2 lets you slice the pebble, giving 3½.
- **"Multiplication makes bigger" and "division makes smaller."** Pre-empt both in P3 with ×0, ×1 and n÷1. Fully repair them in Fraction Forest, where ×½ shrinks and ÷½ grows. **"× as repeated addition" breaks for fractions, so × is taught as area or scaling from the start.**
- **÷0 void storm.** This is honest: the operation is undefined, not infinite. Never label it "∞."
- **Tick = successor.** Honest, and it doubles as the Peano axiom for the Axiom Core.

## 4. P6–P7 sketch (one line each)
- **N1 Place value via bundling** (Place-Value Quarry): ten 1-cubes Merge into a ten-rod (the `unit size` attribute), and ten rods make a flat.
  - Twist: "longer numeral = bigger" (a 9-cube pile versus one ten-rod).
  - Carve unbundles to borrow.
  - *Intro bundling is logged for P2/P3, see Open questions.*
- **N2 Negatives** (Mirror Caves): anti-blocks, where a + (−a) annihilates into a Void.
  - Repairs §3.1.
  - The number line extends left of the origin on the visible axes.
- **N3 Fractions** (Fraction Forest): a slice attribute.
  - Equivalence comes through equal-length rods.
  - Twist: whole-number bias (1/8 > 1/4 "because 8 > 4").
  - Repairs remainders and the "×/÷ change size" misconceptions.
- **N4 Coordinate plane:** the axes become addresses. A block's position is read (never assigned meaning) as an (x,y) pair.
- **N5 Vectors** (Vector Orbit): a direction attribute equal to a displacement. Merge becomes vector addition (thrust), and commutativity holds again (S7 echo).
- **N6 Matrices** (Matrix Nebula): an array (S8) that acts on vectors, which transforms space (rotate, scale, shear).
  - Twist: AB ≠ BA, an echo of S5's non-commutativity.
  - The matrix inverse echoes S6.

## 5. Top 5 stickiness hooks for M0/P2
1. **Multi-path doors (generation effect).** A door `12` accepts any route the kid builds, such as 5+7, 9+3 or 6+6. Kids generate decompositions instead of recognizing them, and route diversity is our part-whole evidence.
2. **The deficit ghost as an open loop.** The bounce leaves a visible "2 missing" outline that the game never explains. It is a planted question that Mirror Caves answers, which turns a limitation into anticipation.
3. **One quantity, three codes (dual coding).** Every block shows its unit segments, a subitizable dot face (≤ 5, then 5+n), and a consistent Cuisenaire-style color. A 6 looks, counts, and reads as six.
4. **Echo rooms (spaced retrieval and interleaving).** Every 3–4 new levels, an earlier room returns with one twist, for example the Void socket room now needs a Carve. These are the encounters that count toward mastery.
5. **Predict, then push.** Gap levels where the kid measures with the axis ticks *before* building, so the rod either fills the holes, leaves countable holes, or visibly overhangs. A committed prediction followed by physical feedback beats being told.

### S11 Variables — Variable Lanes (P2.5, after "There and Back")
- **Prereqs:** S2, S3, S5, S6 (S7 helps).
- **Mechanic (honest form):**
  - A lane (`lanes: { '△': { row: 3 } }`) is a named box. Its value is the **sum** of the number blocks inside it. An empty lane is 0, which is the empty sum. A Void adds 0.
  - Where blocks sit inside the lane doesn't matter. Merging inside a lane keeps the total and carving inside it changes the total, which echoes conservation from S3.
  - A lane holding any operator block shows **"?"** and no gate can be true. Blocks read as `3 − 2` must never total 5.
  - A crossing cell counts toward both lanes, once in each sum, as in Kakuro. This is the shared term in △ = a + c, ○ = b + c.
  - A gate may latch open. A balance-scale readout always shows its *live* truth. When a level has 2 or more gates, the exit needs them **all true at the same moment**.
- **Content:** a symbol names a number. It has one value at a time, and the same symbol means the same value everywhere. Inverse operations solve for it, and doing the same thing to both sides keeps an equation true.
- **Mastery evidence** (default rule, plus):
  - `△ + △` is solved without putting one block in per △. V3 starts with both 4s pre-placed (an incorrect worked example), so V3 only logs "fixed the shown error on the first move". The evidence comes from the empty-lane echo L25 *Two Triangles Again*:
    - Miss: the △ total reaches 8 (16 vs 8) at any point.
    - Pass: a first-try win where the △ total never goes above 4.
    - A 2+2 win counts as route diversity only. On its own it can't be told apart from "one small block per △".
  - `10 − △` is solved with no block pushed back out of △. Bringing the 3 alone (7 vs 3) counts as a miss.
  - Lanes must not hold operator blocks until "?" (unknown) and "below 0" render differently. Today both are NaN, and the scale would make an unknown side rise.
  - A two-gate system is solved without the gates ever being true at different values.
- **Levels** (L18–L26, in play order; Sandbox is L27):
  - L18 V1 intro *Into the Box* `△ = 5`, 1-wide (3+2 or 4+1)
  - L19 V1 *The Box Counts* `△ = 5` (no 5 block, so 3+2 or 4+1)
  - L20 V2 *Take It Out* `△ − 2 = 4` (the lane starts with 4,3,2,1 = 10; remove the 4, or the 3 and the 1)
  - L21 V3 twist *Two Triangles* `△ + △ = 8` (take one 4 out, or swap both 4s for 2+2)
  - L22 rest *Big Box* `△ = 9` (6+3 or 5+4)
  - L23 V4 twist *The Shrinking Side* `10 − △ = 3` (3+4 or 5+2)
  - L24 V5 combine *Same to Both Sides* `△ + 2 = ○ + 2`, then a □ door `□ = △ − 1` (○ = 5 or 3+2)
  - L25 V3 echo *Two Triangles Again* `△ + △ = 8`, empty lane (the evidence level, see above)
  - L26 V6 master *Crossroads* `△ + ○ = 10` and `△ − ○ = 2`, with the lanes crossing. Five fillings are arithmetically possible, including the shared crossing (△ = 2 + 4 with the 4 on the crossing, ○ = 4).
- **Misconceptions to surface:**
  - "Letter = object." V3: two 4s give a readout of 8, the gate computes 16, and the scale tips.
  - "Different symbols must be different numbers" (Küchemann). V5: different blocks in different lanes give equal values. △ = 1+4 on the sealed shelf, and ○ = 5 or 3+2. The miss to log is "the 2 alone into ○" (○ + 2 read as "put a 2 in"), which shows 7 vs 4.
  - "Adding more always makes it bigger." V4.
  - "Each equation can use its own value." V6.
- **Naming (S11):** keep shapes through P3. Letters (a, b, n) arrive at P4 with `2△ → 2a`, with the shape and letter shown side by side for 3 levels and then faded. Never use x or y before N4, because a row lane *is* the line y = k. Never use object initials such as a for apple.

## 6. P3 plan: × and ÷ (Array Fields, Sharing Grove)
**Honesty rules.** `a×b` = a rows of b, read along the visible axes. A platform's shape (`rows`, `cols`) and value (`rows·cols`) are both attributes: pits read shape, doors and lanes read value. × is never animated or labelled as repeated addition. Block values stay ≤ 10, so dividends above 10 are platforms; products ≤ 20, drawn unit-for-unit until bundling. Mixed {+,−}/{×,÷} chains still bounce, so each op gets its own door. Pits are sized so that no two platforms can fill one (split arrays are S10, P4). Quotitive "pack" division is deferred to P4; P3 shares only.

| # | Skill | Misconception to surface | Axio builds (one line) |
|---|---|---|---|
| 1 | S8 array as area | "× builds a taller tower", "× is lots of +" | `[a][×][b]` → one multi-cell platform `{rows:a, cols:b}`, pushed as one body; area pits take an exact shape fit, else bounce with ghost or overhang cells |
| 2 | S7× rotate | "3×4 and 4×3 are different amounts" | pivot post: pushing a platform into it swaps `rows`↔`cols`, value unchanged (`rotate` event) |
| 3 | ×0 | "4×0 = 4" | `a×0` / `0×a` → the existing Void block (never vanishes) |
| 4 | ×1 | "× always makes bigger"; then "longer-looking = more" (1×6 strip vs 2×4) | none: `1×n` is a platform `{1,n}` with value n |
| 5 | n÷1 | "÷ always makes smaller" | none: falls out of Share |
| 6 | S9 share, remainder pebbles | "remainder is a decimal" (7÷2 = 3.1); "÷ commutes"; "can't divide small by big" | `[a][÷][b]` → b blocks of value q plus r pebbles `{value:1, pebble:true}`, total conserved; meaning on the blocks, layout is Axio's; `a<b` resolves to b Voids + a pebbles (never bounces) |
| 7 | ÷0 void storm | "5÷0 = 0", "0÷5 is impossible" | `[a][÷][0]` (incl. 0÷0) emits `storm` and bounces; never resolves, never "∞"; `0÷n` → n Voids |
| 8 | N1a bundling, ten-rods | "bundling changes the amount"; "more pieces = more" (9 cubes vs 1 rod) | bundle pad: a value-10 block or platform becomes a ten-rod `{value:10, unit:10}`; merges show rod + ones |

**Levels** (slot IDs; Worldo assigns L numbers after L27 Sandbox). Each slot forces its own kind of thinking with the slot's verb. Two routes are not required, but slots that are near-copies of each other get merged or cut (commissioner, 2026-10-21).
| Slot | Beat | Skill | Routes | Negation / note |
|---|---|---|---|---|
| P3-1 | intro | S8 | door 12: 3×4 or 2×6 | platform is flat, not a tower |
| P3-2 | practice | S8 | pit 3×4 or pit 2×5 (two roads) | short platform shows ghost cells |
| P3-3 | intro | S7× | rotate 4×3 into 3×4 gap, or 5×2 into 2×5 gap | |
| P3-4 | twist | S7× | a 6×2 fits no turn of the 3×4 pit but opens door 12; or build 3×4 for the pit | pits read shape, doors read value |
| P3-5 | intro | ×0 | Void socket: 4×0 or 0×3 | the field collapses to Void |
| P3-6 | intro | ×1 | door 6 via 6×1, or door 4 via 1×4 | |
| P3-7 | twist | ×1, S1 | door 8: 2×4 or 1×8; bait 1×6 strip looks longest | thin-4/fat-5 ruling |
| P3-8 | combine | ×0, ×1 | `6×□ = 6` and `□ = 5×0`, two key pairs | both-sides doors |
| P3-9 | echo | S8, S11 | gate `△ × 3 = 12`: △ = 4 or 3+1 | lanes are variables |
| P3-10 | intro | S9 | door 4: 12-platform ÷ 3, or 8 ÷ 2 | ÷ undoes × (inverse) |
| P3-11 | intro | n÷1 | door 7 via 7÷1, or door 8 via 8÷1 | ÷ didn't shrink it |
| P3-12 | practice | S9 | door 3 + pebble socket: 7÷2 or 10÷3 | pebble is a whole unit |
| P3-13 | twist | S9 | door 2: 6÷3, or 3÷6 (6 Voids + 3 pebbles), merge 1+1 | order matters; small ÷ big resolves |
| P3-14 | twist | ÷0 | Void socket: 0÷5 or 0×4; bait road `5÷0` storms | undefined, not 0 |
| P3-15 | rest | S8 | door 10: 2×5 or 10÷1 (interleaved) | |
| P3-16 | combine | S9, S11 | gates `△ × 2 = ○`, lanes crossing: (3,6), (4,8) or (5,10) | different symbols, maybe different values |
| P3-17 | intro | N1a | door 10 as a rod: bundle a 2×5 platform or a merged 6+4 | value kept, unit changes |
| P3-18 | twist | N1a | door 13: rod + 3 or rod + 2+1; bait 9 loose cubes | more pieces ≠ more |
| P3-19 | master | all | three doors, one per op (×, ÷, bundle), ≥2 fillings each; ÷0 bait storms | big celebration |

## 7. World-map math beats (spec 2026-10-23-characters-world-design.md)
This section is Matho's plan, and Worldo builds the levels. Each beat is a thought that a hero's move forces on the player, never a quiz. Format: **beat** (the thought) / *misconception it surfaces*. Ages 6–9 run through Elea; the pair worlds are 9+, and calculus and series are older still.

### Camp (Tally): counting, + and −
Big idea: "Every push is one step, and numbers join like the things they count."
1. **Count the steps to the door; the door reads a number, not a place.** / *"The last number I said is just a label."* (cardinality)
2. **3 + 2 opens door 5, and so does 5 + 0.** / *"= means the answer comes next."*
3. **Carve 5 − 2, then walk back with + 2.** / *"+ and − are unrelated."*

### Alexandria (Euclid): commutativity
Big idea: "Joining is fair from either side; taking away isn't."
1. **Euclid slides 3 into +2 from the left and from the right, and both give 5.** / *"Which side you push from changes the sum."*
2. **The same slide with 3 × 2 builds one array either way (rotate to check).** / *"3×4 and 4×3 are different amounts."*
3. **Slide into 5 − 2 from the other side: it still reads 5 − 2 = 3, never 2 − 5.** The engine reads − and ÷ in reading order, so the push direction can't swap them. To get 2 − 5 you must rebuild the row. / *"− works backwards too."*
4. **Only a wall stops Euclid, so where he stops decides which numbers merge.** / *"Order never matters."*

### Croton (Pythagoras): associativity
Big idea: "With three to join, you pick which two meet first, and for + and × the total stays the same."
1. **Leap over the middle block to merge b + c first, then a.** / *"You must go left to right."*
2. **(2 + 3) + 4 and 2 + (3 + 4) open the same door.** / *"The brackets change the answer."*
3. **Twist: (8 − 3) − 2 opens door 3, but 8 − (3 − 2) opens door 7.** / *"Every operation regroups freely."*
4. **Pick the grouping that dodges a bounce (a pair that would go below 0 before Ujjain).** / *"There is only one right order."*

### Ujjain (Brahmagupta): negatives and zero
Big idea: "Every number has an opposite, and the opposite of a debt is a fortune."
1. **Flip 3 to −3; flip it again and it's 3.** −(−a) = a. / *"Two minuses are just more minus."*
2. **3 + (−3) = 0, and the door wants 0.** / *"Zero means nothing happened."*
3. **Flip the + to −, so 5 + 2 becomes 5 − 2.** / *"− is a different kind of thing from a negative number."* (Both are a flip.)
4. **2 − 5 resolves to −3; it doesn't bounce any more.** This repairs the P2 bounce named in §3.1. / *"You can't take a bigger from a smaller."*

### Elea (Zeno): fractions and halving
Big idea: "Half of what's left, again and again, gets you as close as you like."
1. **Zeno covers 8, then 4, 2, 1 cells.** / *"Halves are always the same size."*
2. **Halve a 1-block into ½ + ½; ½ + ¼ + ¼ = 1.** / *"½ + ¼ = 2/6."* (whole-number bias)
3. **⅓ of 9: Zeno shares the run into 3.** / *"A bigger denominator means a bigger piece."*
4. Honesty note: Zeno rounds up, so on a grid he arrives. That's a simplification, and the Endless Stair and the Racetrack repair it.

### Market (Euclid + Brahmagupta): distributivity
Big idea: "Flipping or multiplying a group does it to every piece."
1. **Brahmagupta flips a and the +, so a + b becomes −a − b = −(a + b).** / *"Negate only the first."*
2. **Twist: he also flips b, which gives −a + b, and the door stays shut.** / *"Flip everything you see."* (The operator already carried b's flip.)
3. **Euclid slides 3×(2+4) into one 3×6 array, then splits it into a 3×2 and a 3×4.** / *"3×(2+4) = 3×2 + 4."*
4. **One door wants 18 and the other two want 6 and 12: build it whole, or as two arrays.** / *"It only works one way round."*
New attribute: none.

### Turning Court (Brahmagupta + Pythagoras): imaginary numbers (9+)
Big idea: "A flip is a half turn; ×i is a quarter turn; two quarters make a flip."
Honesty check: this passes. ×i really is a 90° rotation in the complex plane, so i·i = a half turn = ×(−1). It's playable because `turn` is an attribute of the block's value (value·i^turn), never of its position, which respects the lock.
1. **Brahmagupta's flip is a half turn: 3 points the other way and reads −3.** / *"Negative means smaller, not opposite."*
2. **A ×i gate turns 3 a quarter, so it points off the number line and reads 3i.** / *"i is just a letter."*
3. **Two ×i gates make −3 with no Brahmagupta: i² = −1.** / *"A square is never negative."*
4. **Four gates bring it home: i⁴ = 1.** Pythagoras leaps in to feed blocks to gates he can't push past. / *"Turning loses the number."*
5. **3 + 3i doesn't merge into one line-number.** It becomes a 2-part block, which is the Observatory's `vec`. It must not bounce, because the sum is real math. / *"Every sum is one number on the line."*
New attribute: `turn` (0–3).

### Racetrack (Euclid + Zeno): speed, velocity, acceleration, limits (10+)
Big idea: "Velocity is speed with a direction; acceleration is how velocity changes."
1. **A block with vel 2 moves 2 cells per turn; vel −2 moves back. Same speed, opposite velocity.** / *"Speed and velocity are the same thing."*
2. **A boost pad adds +1 to vel each turn: 1, 2, 3, so distance grows faster and faster.** / *"Accelerating means moving at a fixed fast speed."*
3. **A −1 pad slows a block to 0, then it reverses.** / *"Slowing down isn't acceleration"*; *"vel 0 means nothing is changing."*
4. **Euclid's slide is the vel = ∞ caricature; Zeno's run of 1, ½, ¼ … gets ever closer to the wall without passing it.** / *"Infinitely many steps take forever."*
5. **The door reads the value a sequence of exact fractions is heading to (the limit), not any one term.** / *"The limit is the last term."*
New attribute: `vel` (signed exact rational, cells per turn).

### Discrete Underground (Pythagoras + Zeno): parity, mod, primes, graphs
Big idea: "Some places can never be reached, and you can prove it."
1. **Pythagoras's 2-leap keeps x and y each even or odd, so he reaches only ¼ of the cells.** / *"Keep trying and you'll get there."*
2. **Zeno halves only even runs exactly, which shows odd and even as a property of the number.** / *"Odd/even is about the block's spot."*
3. **Primes: a 7-platform makes only a 1×7 array, so it fits no square pit.** / *"Big numbers always split."*
4. **Bridges: cross each edge once (Euler), where an odd number of ends means no route.** / *"Unsolved means I haven't tried enough."*
New attribute: none at first.

### Observatory (Euclid + Pythagoras): vectors and distance
Big idea: "A vector is a step with a size and a direction, and steps add."
1. **Euclid slides a vec (2,1) block onto (1,3) and gets (3,4), the same from either order** (a parallelogram). / *"Vectors add like plain numbers."*
2. **(3,4) is 5 long, which Pythagoras checks with a 5-rope.** / *"Diagonal distance = 3 + 4."*
3. **Brahmagupta-style negation of a vector = the same length pointing back.** / *"−v is shorter."*
New attribute: `vec` (dx, dy). This is the seed of matrices.

### Endless Stair (Brahmagupta + Zeno): infinite series
Big idea: "Infinitely many pieces can add up to an ordinary number."
1. **Zeno's ½ + ¼ + ⅛ … creeps toward 1 and the door reads 1.** / *"Infinitely many pieces make an infinite amount."*
2. **Brahmagupta flips every other step: 1 − ½ + ¼ − … The totals bounce 1, ½, ¾, ⅝, 11/16 and close in on ⅔.** / *"The answer is the last total."*
3. **Only shrinking steps settle; 1 − 1 + 1 … never does, and that door stays shut.** / *"Every endless sum has an answer."*

### Storm Keep (boss, 3–4 heroes): the ÷0 Storm
Honesty problem with the spec: a ÷ 0 has no limit. Near 0, 1÷x gets huge and positive from one side and huge and negative from the other. So "show the value it's heading toward" only works for a 0÷0 shape. Proposed fight:
1. **Phase 1: the storm guards (3·x) ÷ x.** Zeno feeds x = 1, ½, ¼ and Brahmagupta feeds −1, −½. Every result is 3, so the door accepts 3. You never compute 0÷0.
2. **Phase 2: the storm becomes 1 ÷ x.** The two sides run off in opposite directions, and the win is a both-sides gate that proves there is no value. The storm breaks because it was never a number.
3. Euclid slides the approaches and Pythagoras leaps between the two sides.
