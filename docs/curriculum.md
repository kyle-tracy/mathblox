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
  - Measures a gap against axis ticks and brings a beam that fits.
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
  - "Each fact is a separate thing to memorize." The twist shows all four fact-family doors opened by the same three blocks.
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
5. **Predict, then push.** Gap levels where the kid measures with the axis ticks *before* building, so the bridge either fits or visibly falls short. A committed prediction followed by physical feedback beats being told.
