# Celder frozen delivery intake

4 October 2026. **Intake and contract review only. No acceptance, integration, native run or
heavy test fixture was performed.** R1–R11 remain ahead of substantive new-delivery review under
the [joint plan](../regional-completion-joint-plan.md). This records two delivered regions in
the waiting queue, not two accepted environments.

## Frozen packet

- Source worktree: `C:/Users/Michael/Programs/typescript/azhora-game-celder`; branch `celder`.
- Clean tracked/untracked status observed at `136b5822dd8b11906d35b041f2ac9a67be4ad08d`.
- Base `a2e49c3`; build commit `e7012d9`; final commit adds the handoff and a loading label/comment.
- Handoff: `docs/region-reviews/celder-handoff.md` in that frozen worktree.
- Diff against base: 27 files, 2,228 additions and 16 deletions. No packet completeness blocker
  prevents keeping this delivery queued. Main remains separate with unrelated local work.

## Scope and integration contract

South Celder is 37 plains cells; North Celder is 34 cells, including eight grassland cells.
The patch adds environment ground, water margins, scenery, wildlife, chart entries and tests;
it adds no civilians, settlements, quests or domestic herds. Canerd has a terrain/scatter reserve
at `(-2620, -1035)`, radius 110 m. Existing campaign files and story rules are unchanged.

Runtime IDs 61 and 62 append after Babon, preserving the existing 60-region order. They remain
provisional until central integration. Scenery jobs and landmarks use `REGION_IDS`; the developer
destination table contains literal 61/62 rows and must stay consistent if allocation changes.
The survey generator list and generated survey include both countries. Build status correctly
says `environment`; retain the review branch's independent all-131 inventory correction on merge.

`world.js` owns separate `southCelder` and `northCelder` jobs through existing `regionBuild`,
with terrain dependencies supplied by that pipeline. Both use a shared yielding scenery builder,
separate deterministic seeds, typed tree registration and a rendered-ground callback. Wildlife
zones append to `WEST_LIFE_ZONES`; the existing wildlife loading system remains the owner.
No independent readiness controller or save format is introduced. This is source-level wiring
evidence; it does not establish correct Fast travel/arrival behavior.

Shared integration files include `main.js`, `world.js`, `world-terrain.js`, `west-lotharn-world.js`,
the region/map/language registries and test manifest. Preserve current review fixes when combining
them, and regenerate shared generated data from the combined source rather than replacing it.

## Evidence received

The handoff reports 8 South and 6 North ground tests, plus 9 life/scenery tests passing on
`e7012d9`; neighbor and registration suites also passed. Source inspection confirms meaningful
checks for exact atlas/climate membership, ownership, dense seam samples, unchanged Mithala water,
wildlife clearance, species registration, animal retreat/return and bounded rendering batches.
The reported `languages` failure, “East Ibenwood has no tongue”, is identified against the base.
No tests were rerun for this intake; final-label commit `136b582` is newer than the reported run.

The life tests use a scoped world. Their rendered-ground fixture is deliberately
`groundWithRiver + 0.12`, proving callback use but not real mesh-triangle support or root footprints.
The reported 2.1 km movement loop is useful production-controller evidence, but the exact loop
is not a committed test among the three added files. Request its script/artifact when executing it.
The author explicitly did not perform the same journey with native keyboard controls.

Thirteen native review captures and two startup JSON reports are listed with checkout/date.
Both startup JSON files and representative PNG files exist in `tests/artifacts/` in the frozen
worktree. Images were not judged at intake. Evidence remains attributed to Claude's handoff.

## Deferred concerns and required acceptance evidence

1. **Full/Fast readiness and responsiveness:** Full cold startup reportedly rose 9.3% on one
   before/after pair; warm timing improved. Fast mode, destination wait, frame times, renderer
   memory and draw calls are unmeasured. Reported iterator steps of 7–28 ms and a first cold
   step near 1.5 s require measurement in the renderer. The scheduler cannot interrupt a step;
   lazy synchronous seam-table construction in `south-celder-world.js` is one place to profile.
2. **Native journey and persistence:** still pending arrival, crossing both countries and water,
   return, leave/re-enter, and saved harvested-tree/defeated-animal reload. Repeat in Full and Fast
   on the final combined revision, including normal ground/contact and readiness checks.
3. **R2 shared boundary:** South Celder meets West Lotharn on 16 edges. The handoff reports a
   12.19 m difference over a 0.5 m probe at `(-2050, -864.9)`, improved from a 15.2 m base cliff,
   plus 303 additional steep one-metre samples within the 45 m margin. Existing tests probe only
   0.1 m across each edge, so their small-step bounds do not prove an ordinary crossing route.
   Inspect cliff versus accidental seam at player height and prove intended ascents/descents.
4. **Preserve the range while resolving R2:** the patch makes `westLotharnShare` subtract Celder
   weights from the land denominator, preserving how it treated those cells as outland. Removing
   that compatibility rule reportedly moves existing mountain ground by up to 80.7 m. Do not
   adopt the handoff's optional “re-baseline” suggestion without checking summits, caves, fort
   approaches, rendered trees and established routes. Coordinate any R2 fix with this frozen seam.
5. **Water and presentation:** one mapped inter-Celder stream edge is represented by a dry gravel
   head as a declared seasonal interpretation; verify that choice against atlas/water acceptance.
   Reported white quads on West Lotharn slopes require visual triage. Similar herd spawn patterns
   merit player-height review. Mithala low banks at `(-1859, -1153)` and `(-1700, -1414)` belong
   to R8; keep those distinct from new Celder faults.

The handoff also discloses an uncommitted edit to the sibling World Builder `celder.md` under an
earlier instruction, with unrelated content in the same file. It is outside the delivered game
commits. This intake neither approves nor reverts it; preserve the edit and record the discrepancy
without sweeping it into game integration. The joint plan's read-only World Builder rule governs
subsequent work. Routine builder ecology choices do not require a new approval round by default.

Next: keep this exact revision frozen and queued; finish the existing review backlog, then perform
the missing acceptance work against a recorded combined base. Do not mark Celder accepted or
merge it into the user's active main checkout on the strength of this intake.
