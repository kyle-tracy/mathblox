# MathBlox studio

A game where **the math is the physics**. Prototype: ages 6–9 (2D, browser). The long arc reaches linear algebra in space.

- **Run:** `python3 -m http.server`, then open http://localhost:8000 (`?level=N`, `?showcase`, `&moves=udlr`). **Test:** `node --test test/`. Both must pass before you commit.
- **Studio memory is `docs/`.** `docs/decisions.md` is the current-rules summary; log new decisions under its "Log" heading as `- YYYY-MM-DD [who] decision — why`.
- **Read narrowly.** Read `docs/INDEX.md`, then only the files your task names. Before opening a whole source file, use code-review-graph `query` / `impact` (CLI or MCP) to find the function you need, then read just that range. Grep the archive (`docs/archive/`) instead of reading it.
- **File map:**
  - `core/world.js`: `parseLevel`, `step`, `laneValues`; `move()` delegates to `core/push.js` (`resolveChain`, `unlockDoor`, `fillTrench`, `tickPads`). `core/math.js`: ops, doors, equations.
  - `levels/levels.js`: index only, play order. One file per world: `meadow.js` (L1–5, S1), `balance.js` (L6–8, S2), `merge.js` (L9–10, S3/S4), `carve.js` (L11–17, S5–S7), `lanes.js` (L18–26, S11), `sandbox.js`. `showcase.js`: visual-QA rooms.
  - `render/`: `look.js` (canvas, palette, primitives), `draw.js` (board, blocks), `fx.js` (one function per effect, `FX` table), `state.js` (state, undo, events to fx/sound), `audio.js`. `game.js`: input and boot.
  - `test/`: `node --test test/*.test.js`; `solver.js` is the BFS bot.
  - `docs/`: `INDEX.md` (what to read), `decisions.md`, `workflow.md`, `gates/`, `archive/`.
- **Locked decisions:**
  - A block's meaning lives in its attributes, never its location. The visible axes are a frame of reference.
  - Chains compute in reading order.
  - No dark patterns.
  - No 3D before the P5 gate.
  - No dependencies without CEO approval.
- **Commissioner feedback outranks agent predictions.** After L1, no level is solved by "just press right, there's nothing else to do"; this is about thinking, not about having two routes. Variety beats self-similar levels: each level must make you think in a way the others don't. Negation is a recurring theme. Keep L13.
- **Commissioner meta-pattern (read before designing anything):** the commissioner keeps correcting checklists we built out of their taste: "shortest solution" became "just beatable", "no dead first push" became "bad first moves are fine", and "a choice" became "two routes". Metrics are smoke alarms, not goals. Design for the new thought each level forces. Let players fail and explore, as in Baba Is You. When a rule produces sameness or cost, question the rule.
- **Token budget (commissioner, 2026-10-20):**
  - Solvability only needs *one* win: use a first-win search. Exhaustive searches run only at a gate, only on changed levels, under `timeout`. Never leave solver scripts running.
  - Read only what your brief names. For the Log, use `tail -n 15 docs/decisions.md` instead of reading the whole file.
  - Gate re-runs re-check only the levels that changed.
  - Reports stay under 150 words. Pipe test output through `tail -3`.
  - The CEO continues a running agent with a message rather than spawning a new one, makes quick rulings itself, and gives mechanical briefs `effort: lower`.
- **Ownership:**

| Path | Owner |
|---|---|
| `core/` | Axio |
| `levels/` | Worldo |
| `render/`, audio, `style-guide.md` | Arto |
| `test/` | Testo |
| repo layout, git, tooling, backend | Archo |
| `curriculum.md` | Matho |
| `fun-principles.md` | Psycho |
| `budget.md` (token estimates and ledger) | Budgeto |

  Agent charters are in `.claude/agents/`.
- **Rules code:** keep it pure, with no DOM. The renderer never does math; it reads state and events from `step()`.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes_tool` or `query_graph_tool` instead of Grep
- **Understanding impact**: `get_impact_radius_tool` instead of manually tracing imports
- **Code review**: `detect_changes_tool` + `get_review_context_tool` instead of reading entire files
- **Finding relationships**: `query_graph_tool` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview_tool` + `list_communities_tool`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes_tool` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context_tool` | Need source snippets for review — token-efficient |
| `get_impact_radius_tool` | Understanding blast radius of a change |
| `get_affected_flows_tool` | Finding which execution paths are impacted |
| `query_graph_tool` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes_tool` | Finding functions/classes by name or keyword |
| `get_architecture_overview_tool` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes_tool` for code review.
3. Use `get_affected_flows_tool` to understand impact.
4. Use `query_graph_tool` pattern="tests_for" to check coverage.
