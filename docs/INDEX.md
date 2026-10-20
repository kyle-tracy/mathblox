# Docs index: read only what your task needs
| Task | Read |
|---|---|
| Any task (start here) | `docs/vision.md` (27 lines) and `docs/decisions.md` (current rules, ≤60 lines) |
| Engine rules (`core/`) | `core/world.js` (parse, step, move), `core/push.js` (chain, door, trench, tick pads), `core/math.js`; the "Engine rules" section of decisions.md |
| One level or world | that world's file in `levels/` (meadow, balance, merge, carve, lanes, sandbox); its skill in `docs/curriculum.md` |
| Level order / adding a world | `levels/levels.js` (index, play order) |
| Skills, mastery, sequencing | `docs/curriculum.md` (search for the skill ID, e.g. `S11`) |
| Fun, pacing, beats | `docs/fun-principles.md` |
| Visuals, effects | `docs/style-guide.md`; `render/fx.js` (one function per effect), `render/draw.js`, `render/look.js` |
| Tests, solver, cheese checks | `test/` (`test/solver.js` is the BFS bot) |
| Git, CI, review, screenshots | `docs/workflow.md` |
| Phases, roles, roadmap | `docs/roadmap.md` |
| Why a rule exists (history) | `docs/archive/decisions-p0-p2.md` (grep it, don't read it whole) |
| Past gate verdicts | `docs/gates/` |
