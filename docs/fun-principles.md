# MathBlox — Fun Principles
Owner: Psycho. Read with `vision.md` and `decisions.md`. AI fun predictions are hypotheses; only real children (P4/P5 playtests) are proof.

## 1. Fun criteria and build-review rubric
A build is fun when a 6–9-year-old **chooses to keep playing** and **the math is the thing they're playing with** (intrinsic integration, not chocolate-covered broccoli).

Score each criterion 1–5. Gate pass = no criterion below 3, and a mean of 3.5 or higher.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **Clarity of goal** | Kid can't tell what "done" looks like | Goal clear after one try | Goal readable at a glance from the geometry (door + number) |
| **Agency** | One forced path; kid is following instructions | Some choice of order/route | Several valid solutions; kid feels clever, not guided |
| **Juice** | Silent, static state changes | Every action has feedback | Every action *feels* physical and the feedback carries the math (you can count the merge) |
| **Frustration risk** (5 = low risk) | Deadlocks, unclear failure, punishing restarts | Failures readable, undo works | Failure is funny and teaches; no state costs more than one undo |
| **Replay pull** | Done and gone | Would replay to show someone | Asks for "one more"; pokes at things that aren't required |

**Agency anchors (P2 on):**
- 2: one true road plus bait.
- 3: two or more true roads that swap numbers inside the same idea (4−4 vs 5−5).
- 4: routes that differ in op or structure (one block vs two, carve vs merge, a different door).
- 5: open-ended.
- L14 is scored on its turn-around choice.

Also record for each level: is the hard part the **math** or the **pushing**? (It should be the math. See §7.)

## 2. Pacing rules
Every new idea follows the cadence, one idea per level, 5+ levels per skill (Worldo lays them out):

1. **Introduce**: the new thing is the only thing. Almost no space, can't fail in a confusing way, success in under 30 s. From L2 on, the player must think, not just walk; two routes are not required (commissioner, 2026-10-21). L1 is the only level that can be a forced walk.
2. **Practice**: same idea, 2–3 levels, new numbers, slightly more room. Still one idea.
3. **Twist**: the idea is used in an unexpected way (e.g. − where order matters; a decoy block you must *not* use).
4. **Combine**: the new idea plus one older idea. Never two new ideas at once.
5. **Master**: a level that needs real planning; several solutions are fine and celebrated.

Rules:
- **Rest beat** after every Twist and every Master: a short, easy, pretty level (big numbers merging, lots of juice), or a free-play pocket with spare blocks and no door. Competence feels good; let them feel it.
- **Sawtooth, not a ramp**: difficulty rises inside a skill, drops at the start of the next.
- **Stretch challenges are optional**: side doors / bonus nooks off the critical path. Never block progress behind them.
- **Spatial complexity stays low when math complexity rises**, and vice versa. Never raise both in the same level.
- **Numbers stay within subitizing/ten-frame range** (≤10) through all of M0/P2 unless Matho says otherwise.
- Target level length: 1–3 minutes of play for the critical path.

## 3. Feedback and juice spec (M0)
Intent and timing are Psycho's; final art and audio are Arto's call. Principles: every effect **shows the math** (dots visibly move, combine, or get removed), is **short** (≤600 ms, never blocks input for long), and is **proportional** (a level win is bigger than a merge; nothing is slot-machine).

**Global**: block pushes have a small squash on contact and a soft thud. **Pitch rises with value** (1 = low, 10 = high) everywhere a value sounds. Undo plays a quick reverse "whoosh" and rewinds the animation; it is never punished.

| Event | Visual | Sound |
|---|---|---|
| **Merge** `[a][+][b]` | Chain squashes together (~150 ms). a's dots **fly across** into b's cell and settle into the dot pattern for a+b, one at a time (fast, ~40 ms each, so they can be counted). Operator pops into sparkles. Result block does one bouncy stretch, then shows the new numeral. | Soft click per arriving dot, pitch stepping up; a warm "fwump" chord at the end, pitched to the result. |
| **Carve** `[a][−][b]` | Chisel taps the block; b's worth of dots **chip off** a one by one and fall/fade away as small pebbles. Remaining dots re-settle into their pattern; numeral updates. Block slightly shrinks then settles. | Small "tik" per chip, pitch stepping **down**; a crisp "tok" at the end, pitched to the result. |
| **Bounce** (rejected op, e.g. 3 − 5) | Nothing changes state. The chisel *tries*: it lines up b's dots against a's, shows the **missing dots as empty outlines** ("not enough to carve"), then the chain springs back ~1/4 cell with a rubbery wobble. Player avatar does a surprised blink, never a sad face. | A comedic "boing" (rubber band), short. No buzzer, no "wrong" tone, no red X. |
| **Door opening** (exact match) | Door shows its number as **empty dot slots**. When the matching block arrives, each dot drops into a slot (left-to-right), slots glow, door slides open. **Wrong value**: block bumps the door; too few → empty slots stay outlined; too many → extra dots hover outside, then the block nudges back. | Each dot "plinks" into its slot, rising pitch; a satisfying latch "clunk" + open chime. Wrong value: the same friendly boing as a bounce. |
| **Level complete** | Avatar walks through; short (~1.5 s) celebration: the numbers used in the level hop once in sequence, a small confetti puff, then a calm "next" door. **No** score, stars, or ranking in M0. | A short 3–4 note rising jingle. Same jingle every time; bigger version only at the end of a skill set (Master level). |

Failure feedback must always answer "why" in dots, never in words or color alone.

## 4. No-text onboarding (ages 6–9)
- **The level is the tutorial.** Level 1: avatar, a 2, a +, a 1, a door showing 3 in a corridor 1 tile wide. The only possible push is the right one.
- **Affordance first**: blocks look pushable (chunky, shadowed, slight idle wobble). Doors look like they want something (empty dot slots).
- **Show, then let them do**: before a new verb is required, place a "free sample" the player triggers by walking (e.g. a pre-built chain one push from resolving) so they see the effect once.
- **Dots before numerals**: every number block shows dots *and* numeral, so non-readers and readers both succeed.
- **No text, no voice-over required.** Optional icons only (undo arrow, restart loop). A hand/arrow hint appears only after ~20 s of no meaningful progress, and is a nudge (glow the next block), not a solution.
- **Safe to poke**: every first-time failure (first bounce, first wrong door) happens in a level where it costs nothing and is funny.
- Controls: arrow keys/WASD + on-screen big swipe/tap pad. Undo is one key (Z / Backspace) and one big button, always visible.

## 5. Anti-dark-pattern blacklist (never, any phase)
- Ads of any kind; in-app purchases; "premium" content shown but locked.
- Loot boxes, random reward drops, gacha, spin wheels.
- Streaks, daily-login rewards, "you'll lose X" guilt, energy/lives timers.
- FOMO: limited-time events, countdowns, expiring rewards.
- Push notifications or nags to return; "your friends are playing" messaging.
- Public leaderboards, rankings, comparing kids to each other.
- Default timers on puzzles (an optional, opt-in speed mode for older players is a P5+ discussion, not a default).
- Punitive failure: lost progress, "Game Over", shaming sounds/faces, red X's.
- Variable-ratio celebration (randomly bigger rewards to hook). Celebration is proportional and predictable.
- Collecting personal data, chat, or open social features (COPPA). Telemetry, if any, is anonymous and Testo/Ethico-reviewed.
- Endless-scroll/autoplay "next level" without a natural stopping point. Every skill set ends at a clear rest/stop.

## 6. Accessibility minimums (M0 and every build after)
- **Never color alone**: values read from dots + numeral; operators from shape (+ and − glyphs, distinct silhouettes). Palette must pass deuteranopia/protanopia/tritanopia checks (Arto).
- **Dyscalculia-friendly dots**: canonical dice/ten-frame patterns (5-structure: 6 = 5 + 1), never random scatter; dots count off one-by-one in animations.
- **Numerals**: large, sans-serif, unambiguous 1/7 and 6/9 (Arto picks the font); ≥ 4.5:1 contrast.
- **Big targets**: touch targets ≥ 48 px; grid cells large enough for small fingers on a tablet.
- **Forgiving input**: no timing or precision required; held keys don't over-push (one step per press, or slow repeat).
- **Undo always, unlimited**, plus restart. No action is irreversible.
- **Sound is never required**: every audio cue has a visual twin. Mute and volume controls. No flashing above 3 Hz.
- **Reduced motion** option: effects shorten, no screen shake, dots still visibly move.
- Keyboard-only and touch-only both fully playable.

## 7. Critique of the core loop (M0)
The core idea is strong: `[a][op][b]` makes operators physical, and the − bounce makes non-commutativity discoverable. Risks, ranked:

1. **Push direction vs reading direction (highest risk).** The chain resolves in push direction, but kids read left-to-right. Pushing **leftward** through `[5][−][3]` on screen may compute 3 − 5 (bounce) while the screen *reads* "5 − 3". That teaches something false and feels unfair. Needs a rule: e.g. a chain always reads in push direction with a visible arrow/ghost, or carves only resolve left-to-right/top-to-bottom. **Matho + Axio call**; I need it to be readable at a glance.
2. **Sokoban difficulty swamps the math.** Push puzzles are hard in their own right (corners, walls, deadlocks). If kids fail on *pushing*, the game is a Sokoban with numbers and the math learning stalls. Keep corridors and wiggle room generous early; Testo's solver should flag deadlock-prone layouts.
3. **Deadlock and irreversibility.** Merges consume blocks. Without instant unlimited undo, one wrong merge = a stuck level = frustration. Undo must rewind merges/carves, not just moves.
4. **Overshoot with no way back.** Exact-equal doors + only + available early means a kid who merges too much is stuck. Fine if undo is cheap, but levels should make overshoot *visible* (door slots) so they learn "too many" rather than just "doesn't work".
5. **Bounce feels like a broken game** if the reason isn't shown. Spec'd above (empty-outline dots); must ship in M0, not later.
6. **Operator lifetime is unspecified.** Is the operator block consumed on resolve? Consumed = scarcity puzzles; kept = reusable tools. Both are valid but change the puzzle design hugely. **Worldo/Axio call**; decide before levels are built.

What's missing:
- **A reason to care**: a character, a destination, something behind the door. Even a tiny creature who wants through is enough relatedness for this age.
- **Prediction moment**: the fun beat is "I bet this makes 7" → it does. No result preview (it would kill the prediction); but door slots let kids compare before pushing.
- **Expressive play**: a free-play sandbox pocket (rest beats) where kids just merge things to see. Kids this age love making big numbers.
- **Multiple solutions** from M0 level 3 on: a door 5 reachable by 2+3 *or* 6−1 is where agency and number sense meet.
- **A stopping point**: a clear end after 3 levels that feels finished, not cut off.
