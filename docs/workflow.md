# Workflow (Archo)

## Branches and tags
- `master` is always playable and green. Never force-push it or rewrite published history.
- Work on short-lived branches per phase or task: `p2/lanes`, `archo/render-split`. Merge to `master` with `--no-ff`.
- Tag every passed gate on `master`: `p2-gate`, `p3-gate`, … (`git tag p2-gate && git push origin p2-gate`).
- Agents don't commit; the CEO commits and merges. Several agents may share one working tree, so stay inside your own files.

## Commits
- Imperative, descriptive subject (≤72 chars), optionally prefixed by area: `render: split game.js into render/`.
- Body says why when it isn't obvious. End every commit with the trailer:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Ownership (from CLAUDE.md)
| Path | Owner |
|---|---|
| `core/` | Axio |
| `levels/` | Worldo |
| `render/`, `game.js`, audio, `style-guide.md` | Arto |
| `test/` | Testo |
| repo layout, git, CI, tooling, backend | Archo |
| `curriculum.md` | Matho |
| `fun-principles.md` | Psycho |

Touching someone else's file needs that owner's sign-off, noted in the report.

## Reviews with code-review-graph
Run `code-review-graph update` first, then:
- `detect-changes`: risk-scored summary of the current diff. Start every review here.
- `impact`: what the changed functions' callers and tests are (the blast radius).
- `architecture`: module and community overview; check that the boundaries still hold.
- `dead-code`: unreferenced functions left behind after a refactor.
- `large-functions`: candidates to split; browser files should stay under ~300 lines.

## Merge gate
Nothing merges to `master` unless:
1. `node --test test/` passes locally and in CI (`.github/workflows/test.yml`).
2. Headless screenshots match. For render changes, shoot before and after with
   `chromium --headless=new --disable-gpu --no-sandbox --window-size=1100,720 --virtual-time-budget=2000 --screenshot=OUT.png "http://localhost:8770/?showcase&level=N&moves=..."`.
   Static shots must be byte-identical (`cmp`); compare animated ones visually.
3. The browser console shows no module errors.
