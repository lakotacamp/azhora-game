# R1: East Lotharn and Varn review

Started 4 October 2026 from `a2e49c3`, on `codex/region-review-2026-10-04`
in `../azhora-game-region-review`. **First functional correction batch verified;
not a complete R1 acceptance.** No Celder source has been copied or edited.

## First correction batch

- Restore a walkable ledge from the eastern peak's third ramp to the eastern chamber,
  then to the low chimney. Keep the existing high chimney, all cave identities, passage
  floors and opening coordinates. Carry the outer rock rim around the new ledge and
  rail both low-chimney doors; Varn's gates and the Slabs remain the admission routes.
- Ground East Lotharn's tree trunks against the rendered mountain triangles across
  their six-sided footprints. Use separately seeded supplementary woodland pockets
  selected by soil, exposure and shelter, while preserving established tree identities.
- Add four interior woodland ranges containing ten deer and boar. Preserve all original
  eighteen animals and use existing woodland retreat/path behavior and species rigs.
- Add limited weathered spurs on northern central/western faces. Keep summit floors,
  ramps, cave corridors and the complete Varn-controlled terrain outside this change.
  This is a local first pass; it does not finish the repetitive skyline/tree-belt work.
- Repair the developer build inventory to list all 131 atlas regions, preserving
  runtime IDs, authored status and closed/unbuilt access rules.

The narrow cave ledge requires a finer rendered patch than the existing 3 m mountain
grid. Its visual mesh must be validated together with the actual movement surface;
passing a controller-only route test is insufficient for acceptance.

## Evidence recorded so far

| Evidence | Result / location |
| --- | --- |
| Clean baseline | `../azhora-game-land`, unchanged `a2e49c3` |
| Baseline native views | `tests/artifacts/lotharn-kemrath.jpg`, `lotharn-north.jpg`, `varn-above.jpg` in the baseline checkout; 1440×900, clean HUD, Full loading |
| Baseline capture log | `tests/artifacts/r1-baseline-review.log`; all three views captured, renderer `errors: []`; process returned 1 with a GPU shutdown error after capture, so this is visual evidence, not a clean smoke-test pass |
| Inventory tests | Four focused tests passed: complete names, ordering, preserved status, unbuilt access |
| Terrain tests | Northern weathering bounded and unequal; Varn untouched; summits, ramps and complete cave corridors protected |
| Legacy tree comparison | All 5,567 original IDs/species/heights match clean baseline SHA-256 `faaa49dbb472781d30cd27da1cd55ccb1d35d2c085483774d0829ea08a33cea8`; evidence in review checkout `tests/artifacts/r1-habitat-legacy.json` |
| Original scenery counts | 8,289 tufts, 7,273 crops, 256 rocks and 9 outcrops preserved in the isolated scenery fixture |
| New woodland | 31 separately seeded shelter trees, including six above 280 m; 5,598 trees total |
| Woodland movement | Ten new animals spawned, dry/collision-clear homes; four 15-second pursuit samples, travel 44–59 m, zero invalid footing; `tests/artifacts/r1-habitat-movement.json` |
| Cave movement | Production movement/slope rules traverse both new ledges out and back; eastern openings unchanged; cave-floor save/restore and return checks pass |
| Cave exits | 24 running headings from each of five eastern mouths: no damaging drop in the focused test |
| Wider Varn regression | 26/26 passed before the final corner correction (`r1-varn-world-final.log`); afterward the three affected constructed-world tests passed, including the full eastern flood and 480 physical doorway exits (`r1-varn-caves-final.log`) |
| Sharp-corner regression | 48 real running trajectories pass from the corner center and the former escape point; new focused cave suite 5/5 in `r1-cave-access-final.log` |
| Exterior cave ownership | Wrapper 14/14 and actual eastern entry/save checks 2/2 after fixing lateral release; `r1-cave-entry-lateral.log`. Airborne/roof/mounted entry guards and interior walls remain enforced |
| Actual rendered ground | `lotharn-scenery-ground.test.js` 5/5: 2,000 body samples within 0.09924 m of collision ground, 66 anchors within 0.09736 m, 405 active ridge samples within 0.01998 m, seven ramp-boundary samples within 0.05887 m; no missing surface |
| Habitat and ridge geometry | Eight tests pass, including shelter/soil, safe animal ranges, trunk footprints and joined ridge geometry |
| Final native views | Six ground-level views, 1440 x 900, Full mode; `r1-final-native-review.log`, renderer `errors: []`. Ridge spikes removed, chamber approach visible, trees grounded and a deer visible in woodland. Same post-capture GPU shutdown error as baseline; not a clean exit-code smoke pass |

These are measured checks, not a full saved-game migration or a complete native journey.
Legacy identity comparison must be repeated after any scenery changes. New tests are in
the explicit test manifest. Artifacts are ignored files and remain in the named checkouts.

Known unrelated baseline failure: `south-oremindi-metadata.test.js` expects the older
`sage.*campaign.*unbuilt` prose; current status describes the convergence and separate
cottage. Do not change that expectation merely to make this regional patch green.

## Corrections found during review

The first native inspection exposed a repetitive sawtooth silhouette on the cave rim:
the half-metre grid undersampled the narrow analytic crest by up to 1.18 m. A local ribbon
now follows that crest, clipped at the existing ramp and mouth boundaries. It changes no
collision height. A separate coarse/fine doorway seam was corrected rather than excluded
from the measurements. The new rendered-scenery regression protects both repairs.

Independent review found exterior cave-floor ownership could retain invisible lateral walls
before entering. The wrapper now releases ownership before that side step, lets normal surface
collision/slope checks control the movement, and prevents immediate reacquisition. Passage
walls still apply inside the actual opening.

Native image examples in the review checkout's `tests/artifacts/`:

- `stand-at--986-323--751-720--1-88-0-20-6.jpg`: continuous rim and walkable shelf.
- `stand-at--926-50--748-60--1-14-0-12-2.jpg`: lateral approach to the eastern chamber.
- `stand-at--1030--765-5--2-5-0-12-3.jpg`: preserved ramp/rim junction.
- `stand-at--1485-86--983-86-0-665-0-12-4.jpg`: grounded woodland trees and a deer.

The ridge still reads as a regular retaining edge; ramp ends and cave trim have angular joins,
and the very close camera crowds the avatar. These are recorded aesthetic follow-ups, not
claims that the whole mountain presentation is finished. The broader mountain views also
retain conspicuous cliff rings. Full/Fast timing, native saved-game migration and the complete
regional journey have not been certified by this batch. The latest scoped scenery construction
was 18.57 seconds; it is not a comparative desktop startup benchmark.

## Remaining R1 and next review

R1 still needs the broader silhouette and tree-belt pass, pass-fort checks affecting Vastos
and West Lotharn, and combined Full/Fast arrival and departure evidence. Changing the
fortified faces requires repeating the admission/falling checks; do not round away a gate.

R2 reconnaissance identified these next items, without changing those regions:

- West Lotharn explicitly excludes animals from ledge forest; its nine wildlife ranges
  occupy valley floors, balds or air. Add appropriate woodland encounters after verifying
  usable habitat, preserving existing populations.
- The existing crest test proves ascent; ordinary return descent needs production movement
  evidence. Keep the integrated summit/cave/grounding repairs rather than repeating them.
- Feradom has seven farmland clusters and resident wildlife already. Its tree builder still
  samples analytic height at trunk center while terrain uses 3 m triangles: reproduce any
  root-support error before applying a correction.
- West Lotharn shares sixteen edges with South Celder. Leave that active seam to Claude
  until its frozen delivery; reconcile final combined terrain at review. Feradom is not
  directly adjacent to Celder.

## Celder and the next build

Claude subsequently froze the Celder pair at clean `136b582`, including its build at
`e7012d9`. The [intake review](celder-intake-review.md) records scope, evidence and deferred
concerns. Keep both regions queued while the existing review backlog proceeds; intake
does not grant acceptance or integrate the pair.
The next eligible build has a prepared [East Izol brief](../region-briefs/east-izol-environment.md).
No East Izol implementation or second Claude worker has been started.
