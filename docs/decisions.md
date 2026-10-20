# Decisions log
Format: `- YYYY-MM-DD [who] decision — why`

- 2026-10-19 [Commissioner] Prototype for ages 6–9; architecture must scale to linear algebra/space — long-term vision.
- 2026-10-19 [Commissioner] Block meaning = attributes, not location; world has visible axes — position-as-value was rejected.
- 2026-10-19 [Commissioner] Emergencies only, via local push notification — commissioner is hands-off.
- 2026-10-19 [CEO] Stack: plain HTML5 canvas + ES modules, no build, no deps; pure core tested with `node --test` — fewest moving parts.
- 2026-10-19 [CEO] Operators are pushable blocks. Pushing the chain `[a][op][b]` resolves to the result in b's cell; a rejected op bounces with nothing moving — makes order (non-commutativity of −) physically discoverable.
- 2026-10-19 [CEO] Before negatives are unlocked, a − b with b > a bounces ("can't carve more than is there") — keeps the naturals honest and sets up the negatives reveal.
- 2026-10-19 [CEO] Levels are an ES module (`levels/levels.js`), not JSON — importable by both browser and node without fetch/attribute quirks.
- 2026-10-19 [CEO] Deferred: unit size / bundling (place value), Tick tool, × ÷ — scheduled for P2/P3.
- 2026-10-19 [Psycho] Build-review gate: 5 criteria scored 1–5 (goal clarity, agency, juice, frustration risk, replay pull); pass = none below 3 and mean ≥ 3.5 — makes fun reviews comparable across builds.
- 2026-10-19 [Psycho] Failure feedback is shown in dots (empty outlines for missing, hovering extras for too many), never words/color alone; bounce uses a comedic "boing", never a buzzer or red X — safe, readable failure for ages 6–9 and math-anxiety research.
- 2026-10-19 [Psycho] Doors display their value as empty dot slots that fill on match — lets kids compare and predict before pushing.
- 2026-10-19 [Psycho] No score, stars, or ranking in M0; celebration is fixed and proportional (bigger only at a skill's Master level) — avoids variable-ratio reward hooks.
- 2026-10-19 [Psycho] Never raise spatial (push) complexity and math complexity in the same level; numbers ≤ 10 through P2 unless Matho overrides — the hard part must be the math, not Sokoban.
- 2026-10-19 [Psycho] Undo is unlimited and rewinds merges/carves, always visible as key + big button — push puzzles deadlock; no state may cost more than one undo.
- 2026-10-19 [Matho] curriculum.md v1 adopted: skills S1–S10 (P1–P4), N1–N6 (P6–P7); default mastery = first-try success in 3 of last 4 encounters, ≥2 sessions, ≥1 interleaved — stealth assessment without quizzes or timers.
- 2026-10-19 [Matho] Expression reading order is fixed by the axes (+x, then top→bottom), never by push direction — otherwise non-commutativity of − looks arbitrary.
- 2026-10-19 [Matho] Mixed-precedence chains ({+,−} with {×,÷}) must bounce until P4; repaired by P4 level "Arrays Bind First" — physical push order would otherwise teach left-to-right as law.
- 2026-10-19 [Matho] Carve bounce must show a "deficit ghost", never an error glyph or auto-swap; repaired by Mirror Caves L1 "The Chisel Goes Through" — avoids "can't subtract a bigger number".
- 2026-10-19 [Matho] ≥1/3 of P2 Lock doors must be non-`expr = ?` forms (target-left, both-sides) — prevents "= means the answer comes next".
- 2026-10-19 [Matho] a − a leaves a visible Void block; 0 ÷ n resolves, only ÷0 storms; ×0 and ×1 levels mandatory in P3 — 0 is a number; pre-empts "× makes bigger".
- 2026-10-19 [Matho] × taught as area/array (an object, not a taller block), not repeated addition — survives fractions and matrices.
- 2026-10-19 [Matho] Undo ≠ inverse: S6 inverse levels lock Undo and require Carve — kids must not learn "inverse = rewind".
- 2026-10-19 [CEO] Chains evaluate in READING order (left→right, top→bottom), never push order — Psycho+Matho both flagged that push order would compute 7−3 while the screen reads 3−7. Take Away redesigned around it.
- 2026-10-19 [CEO] Operators are consumed when a chain resolves; unlimited undo restores everything — Psycho open question; keeps levels countable.
- 2026-10-19 [CEO] Bounce carries `missing` units; renderer draws a deficit ghost (hollow dots) — Matho/Psycho "why in dots".
- 2026-10-19 [CEO] Bundling: intro in P3, place-value depth in P6 — resolves Matho's open question.
- 2026-10-19 [CEO] Next for P2: Worldo adds `7 = □+3`-style doors (≥1/3 target-on-left), a 1-wide "2+1" first-push level per Psycho §4, and mixed chains bounce until P4 precedence.
