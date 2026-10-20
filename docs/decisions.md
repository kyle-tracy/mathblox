# Decisions: current rules
The rules still in force, grouped by topic. Full P0–P2 history with reasons: `docs/archive/decisions-p0-p2.md`. Gate reports: `docs/gates/`.
When a rule changes, edit it here and add a Log entry at the bottom: `- YYYY-MM-DD [who] decision — why`.

## Vision and authority
- Ages 6–9 prototype, 2D browser; the architecture must scale to linear algebra in space. No 3D before the P5 gate. [Commissioner]
- A block's meaning lives in its attributes, never its location. The visible axes are a frame of reference. [Commissioner]
- Commissioner feedback outranks agent predictions: every level after L1 requires a choice; negation (− order, bounces, ghosts, inverses) is a near-constant theme; keep L13. [Commissioner]
- Commissioner is hands-off (emergencies only, local push notification). The repo is public. [Commissioner]

## Stack and repo
- Plain HTML5 canvas + ES modules, no build, no dependencies without CEO approval; the pure core is tested with `node --test`. [CEO]
- Levels are ES modules, not JSON: one file per world, imported in play order by `levels/levels.js`. [CEO, Archo]
- Rules code is pure (no DOM). The renderer never does math; it reads state and `step()` events. Only `render/state.js` reassigns game state; no import cycles. [Archo]
- Branches, commits, CI, review and the screenshot merge gate: `docs/workflow.md`. [Archo]

## Engine rules
- Operators are pushable blocks. `[a][op][b]` resolves into the right-hand operand's cell and the operator is consumed; a rejected op bounces and nothing moves. [CEO]
- Chains compute in READING order (left→right, top→bottom), never push order. Long lines resolve the reading-first triple first (honest same-precedence left-to-right). [CEO, Matho]
- Naturals only: a − b with b > a bounces carrying `missing` units (deficit ghost). a − a leaves a visible 0 (Void) block. Mixed-precedence chains bounce until P4. [CEO, Matho]
- A 0 block never vanishes; at a trench it bounces ("0 fills 0 holes"). A block of n fills exactly n trench cells; too long bounces showing its exact overhang. Trenches are entered only along their length. [Matho]
- Doors consume their key; both sides are shown before a door opens. Door equations use − only as the last op on a side, so "can't build" means negative. [Matho]
- Variable lanes: value = sum of the number blocks inside (empty = 0); an operator in a lane makes it "?"; a crossing cell counts in both lanes. Gates are live; the exit needs every gate true at once. [Matho]
- Undo is unlimited and always visible, and restart is undoable. Undo ≠ inverse: S6 levels trap the operand so only a carve helps. [Psycho, Matho, Arto]

## Curriculum and level design
- `docs/curriculum.md` owns skills (S1–S11, N1–N6). Mastery = first-try success in 3 of the last 4 encounters, ≥2 sessions, ≥1 interleaved. Forced levels (no choice) are `evidence: false`. [Matho]
- ≥1/3 of lock doors are not `expr = ?` (target-left or both sides). [Matho]
- Deferred: × as area/array, bundling intro and the thin-4/fat-5 twist in P3; ×0/×1 levels mandatory in P3; place value in P6. [CEO, Matho]
- Variables are shapes until P4, then letters a, b, n; x and y are reserved for N4. Never author a gate implying △ + ○ = blocks on the board. [Matho]
- Authoring limits: maps ≤ 12 rows; each level < 200k solver states. [Worldo]
- Numbers ≤ 10 through P2 unless Matho overrides. [Psycho]
- Never raise math and push complexity in the same level; every new verb gets a 1-wide intro; no level needs a block swap to rebuild an expression. [Psycho]
- "Two roads" for intros and rests: spawn between a bait road and a true road; the bait ends in a harmless bounce; the true side varies. [Worldo]
- No cheese: with each `teaches` event banned, the solver must exhaust the level without a win. A capped search throws; it never reads as "unsolvable". [Testo]

## Feedback and fun
- No dark patterns. No score, stars or ranking; celebration is fixed and proportional (bigger only at a skill's Master level). [Psycho]
- Failure feedback is shown in dots (deficit ghost, overhang, balance scale, socket hole), never words or colour alone; a comedic boing, never a buzzer or red X. [Psycho]
- "Why" effects animate in ≤ 300 ms, then linger until the next input. [Arto]
- Build gate: 5 criteria scored 1–5; pass = none below 3 and mean ≥ 3.5. Agency is averaged over graded beats only. [Psycho]

## Look (`docs/style-guide.md`)
- Blocks are coded four ways: numeral, 5-structure dots, unit rod, CVD-checked colour. Colour is never the only cue. − is a symmetric bar. [Arto]
- Teens 11–20 render unit-for-unit (two ten-frames); no ten-rods before P3 bundling. [CEO, Arto]
- Equation doors hang a sign with each number's dots and each lane's live total; no idle beam. On the scale a NaN side rises and is never level. [Matho, Arto]
- Lanes: tint + hatch direction + wall tag. Gates: portcullis. Fit by CSS scaling with ≥ 48 px cells; the reduced-motion toggle persists. [Arto]

## Log
- 2026-10-20 [Archo] Modularized for token cost (Commissioner, 2026-10-20): levels split per world, `move()` push branches moved to `core/push.js`, `drawFx` split into per-effect functions, this file condensed with the full log archived, gate reports in `docs/gates/`, `docs/INDEX.md` routes tasks to docs. No behavior change — verified by identical LEVELS JSON, solver paths, step() traces and static screenshots.
- 2026-10-20 [Psycho] A 1-wide new-world intro counts as the rest/sawtooth drop after a Twist or Master; two-roads bait corridors (one true road) score Agency 2 — consistent scoring for the P2 re-run (`docs/gates/gate-p2-psycho-rerun.md`).
- 2026-10-20 [Matho] One Family keeps 3 doors (7, 4, 3 as keys), since key consumption caps it at 3 and 4+3 belongs to S7. V3's pre-placed 4s are honest as an incorrect worked example, but V3 carries no "one block per △" evidence; that evidence moves to an empty-lane echo. Block values stay ≤ 10; S11 side totals (V3's 16) may exceed 10, drawn unit-for-unit. No operator blocks in lanes until "unknown" and "below 0" render differently — the gate-p2 rerun (`docs/gates/gate-p2-matho-rerun.md`).
- 2026-10-20 [Archo] Static screenshot checks force `--force-prefers-reduced-motion` — without it, lingering-ghost shots differ run to run.
