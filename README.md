# MathBlox — M0 prototype
The math is the physics. Push `[a][+][b]` together to merge, `[a][−][b]` to carve, and bring a door exactly its number.

- Play: `python3 -m http.server` then open http://localhost:8000 (`?level=N` jumps). Arrows/WASD, Z undo, R restart.
- Test: `node --test test/` (math laws, rules, every level solvable without cheese).
- Docs: start at `docs/INDEX.md` (which doc for which task). Team: `.claude/agents/`.

## File map
- `index.html`, `game.js`: page and single module entry (input wiring and boot).
- `core/`: pure rules and math, no DOM (`world.js` step/parse/move, `push.js` push resolution, `math.js` ops and doors).
- `levels/`: `levels.js` (index, play order) over one file per world: `meadow`, `balance`, `merge`, `carve`, `lanes`, `sandbox`; `showcase.js` (visual-QA rooms, `?showcase`).
- `render/`: browser layer. `look.js` (canvas, palette, primitives, doors), `draw.js` (board, blocks, axes, player), `fx.js` (effects, scale), `state.js` (level selection, state/undo, event to fx/sound), `audio.js` (tones, mute).
- `test/`: `node --test test/` (CI: `.github/workflows/test.yml`).
- `docs/`: studio memory; `workflow.md` covers branches, commits, ownership and the merge gate.
