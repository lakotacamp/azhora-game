# Ibenwood grove: implementation trial assessment

30 September 2026. One representative grove, not the five-region Elfland build. Implementation and the reviewer corrections are complete; wider art direction remains for review with the user.

This is the historical pilot assessment. The user subsequently approved denser wild forest and further implementation; see [the environment expansion report](ibenwood-environment-implementation.md) for the current build and testing destinations.

## Model and method

The implementation worker used **GPT-6.1 Sol, Medium**, through temporary official Codex CLI **0.159.0**. The older bundled CLI rejected that model; a live request through the newer CLI succeeded. This did not replace the installed application or change the user's default model. The worker's own session metadata confirms its model and reasoning effort.

The worker implemented and tested the environment. The parent reviewed code, captures, and test results and prepared the Dwarfland design in parallel. Two existing agents provided read-only atlas, ecology, and design review. The parent has not silently substituted its own implementation for the worker's output.

This is one trial with no matched Astra run. It establishes capability and records this run's cost in time and tokens; it cannot establish a percentage saving, model ranking, or exact subscription-credit charge.

## What can be reviewed

In the desktop game, open **F8 → Travel → East Ibenwood — partial grove pilot**. The grove occupies a small footprint in the actual East Ibenwood atlas area. Partial region ID 32 avoids the IDs reserved by separate work. Normal saves are preserved by the testing session.

The environment includes four exterior dwellings: a root home, a stone home, and two branch homes. A portico, paths, veteran trees, younger growth, ferns, fallen logs, and rocks connect them into a small inhabited-looking place. All 155 living trees have a species; six Ibenwood species are represented. Felling is prohibited with an explanation, and three fallen-branch pickups use the existing gathering and checkpoint systems.

Eight ambient animals include deer, boar, hares, and reused birds. They persist while the world is running, rather than appearing only when the player crosses a quest trigger. Their state is not serialized across application restarts; this inherits the existing wildlife system's limitation.

Checked views:

- [Ground-level approach](../tests/artifacts/ibenwood-arrival.png)
- [Ground-level domestic architecture](../tests/artifacts/ibenwood-player.png)
- [Overview](../tests/artifacts/ibenwood-overview.png)

These PNGs are local, gitignored review artifacts. Recreate them with `npm run review:ibenwood`. The worker's [implementation report](ibenwood-pilot-worker-report.md) records commands, limitations, and intermediate failures.

## Visual judgment

The result is a useful foundation in Azhora's faceted style. The large trees establish a different scale from the existing village woods. The final ground view makes the relationship between tree, elevated home, roots, and masonry readable. Ground animals and several layers of vegetation prevent the grove from being only buildings among trunks.

It is still an early environment study. The round homes share much of their geometry, crowns remain repetitive, and the stonework has only modest evidence of long habitation and forest growth. The overview also exposes the finite background terrain beyond this partial environment. A future art pass should give the three dwelling forms stronger architectural identities, more carefully shaped transitions into roots and branches, and a richer old-growth canopy. That is a design refinement for review, not evidence that all Elfland is finished.

Canopy homes have exterior geometry only. There are no interiors, canopy traversal, royal heart, new civilian cast, ranger perception/combat, permission quests, or dimensional withdrawal. The wider Ibenwood region designs remain separate.

## Corrections and verification

Before parent review, the worker made three substantive groups of corrections: geometry and atlas placement; visual composition and vegetation; and save/session integration. These included tree grounding, exposed trunk caps, fern geometry cost, the arrival route, and a restore guard that initially sent the player back to the road spawn.

Parent review then requested corrections covering rendered ground beyond the original world edge, full collision along fallen logs, and the elevated home's platform connection. A second reviewer prompt caught a serious allocation/culling defect introduced by the terrain correction: it recomputed tile bounds from a shared full-world vertex buffer and copied that buffer into each tile. The worker fixed it by preserving the assigned bounds and compacting only vertices referenced by intersecting tiles. A regression fixture confirms that 168 distant tiles remain untouched and the affected tile stays compact. The final camera composition already made the architecture readable and did not require another redesign.

The first implementation run passed 62 adjacent regression tests after its integration fixes. After the reviewer corrections, **all eight focused pilot tests passed**. They cover atlas placement, species/grounding/protection, movement and resource approaches, wildlife, checkpoint compatibility, actual rendered ground coverage and seams, log ends and canopy support, and shared-buffer terrain allocation. The final disposable desktop session **passed all 12 smoke assertions and exited 0 with zero renderer errors**. It checked movement, collection, protected trees, wildlife, save/load position and collected-item persistence, normal-save preservation, and reproducible captures. The parent independently inspected the final three PNGs and the result JSON. Scoped syntax and whitespace checks passed.

The full `npm test` suite was not run. Wider selections exposed an unchanged regional-wildlife fixture omitting existing Iscare zones and four unchanged woodland-progress fixtures omitting the existing normalized Ambron layout version. Those failures are documented; this report does not claim every repository test passes.

## Measurements and recommendation

Times are taken from the worker's local session records, including tools, tests, captures, and report writing:

| Stage | UTC interval, 30 September | Elapsed |
|---|---|---|
| Initial implementation and self-review | 19:56:39.126–20:50:23.748 | 53 min 45 sec |
| Reviewer correction window, including the interruption to deliver the memory finding | 20:51:19.291–21:06:44.529 | 15 min 25 sec |
| First worker start through final completion, including the handoff gap | 19:56:39.126–21:06:44.529 | **70 min 5 sec** |

Model-access investigation and temporary CLI setup took approximately ten minutes before the implementation start. Parent review and Dwarfland design overlapped the worker; their time is not added as though it ran sequentially. Final parent documentation followed worker completion.

The worker's final cumulative CLI usage was:

| Usage category | Tokens |
|---|---:|
| Total input | 13,341,679 |
| Cached input, included above | 12,982,656 |
| Uncached input | **359,023** |
| Output, including reported reasoning | **68,899** |
| Input plus output | 13,410,578 |

Approximately **97.3% of input was cached**; the total input is repeated context across requests, not 13 million unique words read. The initial turn accounts for 53,411 output tokens; corrections added 15,488. The separate availability probe used 16,640 input / 5 output tokens and is excluded. Parent and read-only review-agent usage is not exposed and is not included. Exact dollar or subscription-credit charges are unavailable. The raw local records and [run metadata](../tests/artifacts/ibenwood-pilot/run-metadata.json) support these figures.

Both successful worker turns emitted `turn.completed` records; the outer PowerShell launcher reported exit 1 alongside CLI warnings. Completion was checked against the session's `task_complete` records and the independent game validation, whose final exit code was 0. No unsupported-model fallback was substituted.

Final geometry is 155 trees, 24 tree batches, three static meshes, and **153,438 grove triangles**, including the full western terrain extension. The desktop snapshot reported **111 scene draw calls / 428,704 scene triangles** and **70 ms average frame time**. That offscreen observation is slow enough to warrant an interactive performance check before expansion, but is not a controlled baseline or a reliable attribution of cost to this grove alone. It is not an FPS guarantee.

**Recommendation:** Sol is capable of bounded environment implementation with review, but this run does not justify calling the workflow efficient or expanding it unattended. It required three worker revision groups and two substantive reviewer feedback prompts, including a serious memory/culling correction. It also spent substantial time on repeated captures, broad file reads, and overlapping regression selections. A future trial should constrain the initial context, agree on the ground-level composition early, and run each relevant test group once unless a change or failure warrants repetition. Any claim that it is cheaper or faster than Astra needs a matched comparison that this pilot did not perform.

Do not expand all five regions solely on this pilot's technical completion. Review the grove's appearance in the desktop app first. The next environment slice should apply the resulting art decisions rather than multiply the same houses and crowns across Ibenwood.

## User response to the pilot

The user likes the grove and requests denser trees in the wild forest outside settled groves. This is recorded in the Ibenwood design draft for the wider build. The implementation metrics and review findings above remain the record of the measured pilot; no new density pass is included in those figures.

## Dwarfland follow-up

The [Dwarfland design draft](dwarfland-design-draft.md) proposes inhabited hill country supporting cities inside the West and East Baldro Mountains. It distinguishes confirmed user premises, atlas evidence, and new proposals, and compares the design with Elfland. No Dwarfland terrain, residents, or gameplay have been implemented.
