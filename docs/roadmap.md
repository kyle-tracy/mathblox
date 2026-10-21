# MathBlox — Studio Plan, Team Charters & Roadmap

## Context
Commissioner pitch: a 2D (later maybe 3D) world of **MathBlox** — blocks whose meaning lives in their math attributes (not their position), set in a world with visible axes, that physically combine like the math they represent. Math must *do* things to the world. Curriculum follows the human order of learning (counting → + − × ÷ and their interactions) while axioms are the hidden foundation. `/home/mastachi/edu-games` is empty; Node and Python are installed, Godot is not. The commissioner is hard to reach, so this plan sets the defaults and lists every open question below so they can be answered once.

---

## 1. Vision (one line)
**"The math is the physics."** Every operation is a verb you do to the world. Nothing is a quiz. A correct idea gets a bridge built. A wrong idea gets a funny, readable failure you can learn from.

### Core verbs (brainstorm → M0/M1 candidates)
| Math | Physical verb | World effect |
|---|---|---|
| Successor (+1) | **Tick**: the first tool, the Peano axiom you play as counting | grows a block by one unit (it gets taller) |
| Addition | **Merge**: push blocks together through a `+` gate | stacks fuse, and the height equals the sum |
| Subtraction | **Carve**: a `−` chisel | takes units away, digs holes, makes stairs |
| Zero | **Void** | an empty socket; adding 0 does nothing (players find out that's useful) |
| Multiplication | **Array**: `a × b` lays out an a-by-b platform | area and bridges; the commutative "rotate the rectangle" moment |
| Division | **Share**: split a block into equal parts across pedestals | opens fair-share doors; leftovers become **remainder pebbles** |
| Equality `=` | **Balance scale / lock** | the door opens only when both sides are equal (early algebra for free) |

**Puzzle hooks:** a gap of width 7 needs a length-7 beam. A door says `12`, so make it from 3×4, 6×2, or 5+7 (many paths, one goal). A river of `−` water dissolves your blocks. A scale-lock needs a 9 and you hold a 4.
**Later biomes, gated by curriculum:** Number-Line Meadow (naturals) → Place-Value Quarry → Zero Chasm → Array Fields (×) → Sharing Grove (÷, remainders) → Mirror Caves (negatives: "anti-blocks" annihilate with their partners) → Fraction Forest (blocks you can slice) → Axiom Core (endgame: rebuild arithmetic from Tick and Merge).

---

## 2. Team charters
"Training" an agent means two things. First, a definition file `.claude/agents/<name>.md` (persona, model, tools, effort, hard rules, output format). Second, the shared knowledge base in `docs/`. **Agents start cold on every spawn and remember nothing.** The `docs/` files are the studio's only memory, so every agent reads the files relevant to its task and appends its decisions to `docs/decisions.md`.

**Me (CEO / Producer / Math lead).** Owns the vision, priorities, final say on scope, the milestone gates, and contact with the commissioner. Writes task briefs and merges work.

| Agent | Core domain | Broad abilities | Owns / decides | Reviews | Consulted when |
|---|---|---|---|---|---|
| **Matho**: math-education PhD | Learning progressions, CPA (concrete→pictorial→abstract), number sense, misconception research | Spaced retrieval, interleaving, worked-example fading, Van Hiele levels, assessment design (stealth assessment), standards mapping (Common Core / UK NC), retention ("sticky") hooks, analogy design, writing the curriculum spine | The curriculum order, the mastery criteria for each skill, the list of misconceptions each level must surface (for example "× always makes bigger" or "= means the answer comes next") | Every level and every mechanic, for mathematical honesty: no rule may teach something false | Any new mechanic, level, or block type |
| **Psycho**: player psychologist and fun designer | Motivation (Self-Determination Theory: autonomy, competence, relatedness), flow, intrinsic integration (Habgood & Ainsworth) | Avoiding math anxiety (no timers by default, failure is safe), difficulty curves, reward schedules without dark patterns, onboarding, UX heuristics, feedback "juice" specs, accessibility (dyscalculia, color-blindness, reading level), ethics of play with children | Fun criteria, difficulty pacing, the feedback and reward design, the anti-pattern blacklist (loot boxes, streak guilt, ads) | Every playable build: "would a kid choose this over YouTube?" | Every milestone gate, onboarding, any reward system |
| **Axio**: lead engineer and math-kernel architect | A pure, deterministic rules engine (`core/`) separated from rendering | JS/TS architecture, testing (`node:test`, property-based checks of math laws like commutativity and associativity), performance, save/load, later the engine choice for 3D (Godot or three.js), tooling | Code structure, tech stack, the guarantee that the core can never violate arithmetic | All code PRs | Any technical decision |
| **Worldo**: level, world, and narrative designer | Puzzle design and spatial level layout | Teaching through levels without text (the Portal/Baba Is You method), biome themes, light story and characters, critical-path versus optional-challenge layout, a level-editor data format (JSON), pacing maps | The level files, the world map, the in-world story | Matho's skill map → levels; Psycho's pacing → layout | Each new skill needs 5 or more levels: introduce → practice → twist → combine → master |
| **Arto**: art, animation, audio, game feel | Readable visual language for numbers (dot patterns, rods, colors in the Cuisenaire tradition) | Pixel and vector art, merge, carve, and split animation, SFX and music specs, UI and HUD, accessibility palettes, iconography, the art direction for a future 3D version | The style guide, the symbol and glyph system, the "juice" | That visuals carry the math, for example that a 6-block *looks* six | Any new block type or effect |
| **Testo**: QA, playtest, and analytics | Automated tests, regression, simulated playtests | A bot that brute-forces levels (solvability, shortest solution, unintended shortcuts), telemetry design (privacy-safe, COPPA-aware), playtest protocols for **real** kids, bug triage, accessibility audits | The definition of "done", the release checklist | Every build before a gate | Before merges and gates |

A seventh hire is possible later: **Ethico/Legalo** (COPPA, GDPR-K, IP checks) before any public release.

---

## 3. Roadmap (several months, gated)
Each phase ends at a **gate**. If a gate fails, we iterate instead of moving on.

| Phase | Duration | Goal | Gate |
|---|---|---|---|
| **P0 Foundation** | wk 1 | `git init`; the `docs/` knowledge base (vision, curriculum spine, style guide stub, decisions log); the 6 agent files; the repo skeleton | Every agent can answer its role questions using the docs |
| **P1 Core kernel** | wk 2–3 | A pure `core/`: blocks, a grid, Tick, Merge (+), Carve (−), Void (0), an `=` lock; property tests that check math laws | 100% of the law tests pass; no illegal states are reachable |
| **P2 2D vertical slice** | wk 3–6 | Browser canvas build: move, push, merge, carve; 15 levels covering counting → + → −, with juice | Psycho fun review + Matho honesty review + Testo solver: every level solvable and no trivial cheese |
| **P3 Multiplication and division** | wk 6–10 | Array and Share verbs, remainder pebbles, Array Fields and Sharing Grove biomes, ~30 levels | Interleaved levels mixing all 4 operations; misconceptions surface and get resolved |
| **P4 Interactions** | wk 10–13 | Order of operations through physical machines, distributivity ("split the array"), inverse operations (undoing as a mechanic), a level editor | **Real-kid playtest #1** (needs the commissioner's help) |
| **P5 Polish and retention** | wk 13–16 | Audio, save system, a world map, a sandbox mode, accessibility pass, spaced-review "echo" levels | Retention metrics in the playtest; the **3D go/no-go** decision |
| **P6+ Expansion** | mo 4+ | Negatives, fractions, place-value depth, Axiom Core; a 3D prototype *only if P5 says go* | Each biome gets its own gate |
| **P7+ The long arc** | mo 6+ | The coordinate plane → Vector Orbit (vectors as thrust) → Matrix Nebula (transforming space) → linear algebra in space | Each step goes through the same gates, with an older playtest cohort |

---

## 4. Immediate execution after approval (P0 + start P1)
1. `git init` in `/home/mastachi/edu-games`.
2. Write `.claude/agents/{matho,psycho,axio,worldo,arto,testo}.md` with the charters above as system prompts, plus hard rules: read `docs/` first, log decisions, stay in your lane, and report back in a fixed format.
3. Write `docs/`: `vision.md`, `curriculum.md` (Matho drafts it), `fun-principles.md` (Psycho), `decisions.md`, `roadmap.md` (copied from this plan).
4. Consultation round: spawn Matho and Psycho in parallel on the core-verb table, then fold their feedback into the docs.
5. Prototype stack: **plain HTML5 Canvas + ES modules, no build step and no dependencies.** The pure core lives in `core/*.js`; `index.html` + `game.js` handle rendering and input; tests live in `test/*.test.js` and run with `node --test`.
6. M0 playable: a grid, a player, number blocks, push-to-merge through `+`, a `−` chisel, a door locked by `=`, and 3 levels.

**Cost posture:** I spawn agents only at decision points (about 2–4 per milestone), each with a tight brief at `effort: lower` for mechanical work. Most code I write directly. For long unattended runs, `/loop` with a 20–30 min self-pace.

---

## 5. Opinions and refinements I recommend before I start
1. **Attributes over location** (commissioner's call, see §6). A block is defined by what it carries, not by where it is.
2. **Stay inside the domain the player has unlocked.** Before negatives exist, `3 − 5` = the chisel **bounces** (it can't carve more than exists), and that sets up the negative-number reveal later. Before fractions, `7 ÷ 2` = 3 each **+ 1 remainder pebble**. `÷ 0` = a "void storm" that never resolves: a memorable, safe failure that becomes a running joke and later a lesson.
3. **Axioms and the human order don't conflict.** The first tool, Tick (+1), is both a toddler's counting and Peano's successor. The axioms come back as the endgame (the Axiom Core) instead of the opening.
4. **3D is a gate, not a plan.** Decide at P5. Most of the learning value is in the 2D loop.
5. **Agents cannot replace real children.** The biggest risk to validity is that AI reviewers can only predict fun and learning. I need **real playtesters** (ages to be confirmed) at P4 and P5. That's the one thing I'll ask the commissioner for.
6. **Emergency definition** (the only times I contact you): the projected cost is more than 2× plan, a blocker only you can resolve (legal, IP, funding, a pivot), a security or data incident, or a gate failing twice in a row. Default channel: a local push notification. I won't email unless you say so.
7. **No monetization dark patterns, ever.** No ads, loot boxes, or streak guilt. This is a children's product.
8. **Name:** check the "MathBlox" trademark before any public release (there may be existing uses).

## 6. Commissioner decisions (locked 2026-10-19)
- **Audience:** the prototype targets ages 6–9. **The architecture has to scale to linear algebra and space.** The progression runs number line → coordinate plane → vectors, and from arrays (a×b) to matrices. The space finale: vectors become thrust and headings, and matrices become transformations of the world (rotate, scale, or shear a whole asteroid field). Consequences for the code:
  - The core's `Value` is one module, so a scalar can later become a vector or matrix without touching level, render, or puzzle code.
  - The grid stays coordinate-based from day one.
  - Operations are a table that maps `(op, a, b) → result | rejection`, so new domains add rows instead of rewrites.
  - We don't build vectors or matrices now, only the seams for them. Axio owns this extensibility rule. Matho maps the long arc in `docs/curriculum.md`, from counting through linear algebra.
- **Attributes over location:** a block's meaning lives in its **attributes**, and moving it never changes what it is. Attributes:
  - `value`
  - `kind` (number / operator / relation)
  - `unit size` (ones, ten-rods, hundred-flats, so place value works by *bundling*: merge ten 1s → one ten-rod, Dienes-style)
  - later `sign`, `fraction`, and `direction/dimension` (vector, matrix)
- **The world has visible axes.** An x/y grid with labeled origin and tick marks from day one (z later if we go 3D). The axes are a frame of reference, not a source of value. Players use them to measure gaps, read the length a bridge needs, and plot targets. They become the backbone for coordinates and vectors in the long arc: a vector block's *attribute* is its displacement, and the axes are what let you see it.
- Biomes still set *which rules are unlocked* (the domain), as a curriculum gate, not as a block's value.
- **Emergency channel:** local PushNotification only, using the triggers in §5.6.
- After approval I'll save these as memory files (the commissioner is hands-off, the emergency rules, the age-and-scale target) so they persist across sessions.

## 7. Software
**Installed:** git, Node 26, Python 3.14, Chromium. That covers everything through P5 with **no installs**:
- the canvas game and ES modules
- `node --test`
- `python3 -m http.server`
- `chromium --headless --screenshot` so I can check visuals myself

**Possible later asks, flagged at the gate itself and never installed by me:**
- **Godot 4** if the P5 3D gate says go (`pacman -S godot`)
- optionally **Aseprite** or **LMMS** if Arto's art and audio need more than hand-authored SVG and WebAudio

## Verification
- `node --test` passes, including the property tests for commutativity and associativity of Merge and the inverse rule (Merge then Carve returns the original).
- Headless Chromium screenshot of each level to check rendering.
- Open `index.html` in a browser (`python3 -m http.server`) and play the 3 M0 levels end to end.
- Testo's solver confirms every level is solvable and reports the shortest solution.
- Matho and Psycho review the M0 build and record their verdicts in `docs/decisions.md`.

## Future ideas (not scheduled)
- **Level 0 and below: foundations** (commissioner, 2026-10-20). An optional world that comes *before* L1. It plays the fundamentals of discrete math and leads straight into L1, like a simplified Principia Mathematica that keeps only what a player actually needs. It would build up from:
  - **L−2, Logic:** true and false, NOT, AND, OR, if-then. NOT carries the negation theme to the very bottom.
  - **L−1, Sets:** grouping things, belonging to a group, the empty set.
  - **L0, Number:** matching two groups one-to-one shows what "same number" means, then successor, which is Tick. Its exit is L1.

  It's the same content as the Axiom Core endgame, seen from the other side, so the two could share one world that players can enter from either end. Before scheduling it, Matho has to check that it works for ages 6–9, and Psycho that it's fun rather than a lecture.
