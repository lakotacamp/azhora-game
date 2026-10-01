# Ibenwood environment implementation

**Later phase:** [Elfland defense implementation](ibenwood-defense-implementation.md) adds the guarded inner belt, ranger combat and unauthorized stealth crossings. This report records the earlier environment-only milestone; its unfinished-defenses section is historical.

30 September 2026. This is the first environment expansion after the user approved the representative grove and requested denser wild forest. It covers all five Ibenwood regions. It is not yet the completed, defended Elfland kingdom. The [design draft](ibenwood-design-draft.md) remains the record of the intended gameplay; [Dwarfland](dwarfland-design-draft.md) remains design only.

## Trying it in the desktop game

Relaunch the desktop game, open **F8**, and use **Go anywhere** to choose East, North, South, West, or Central Ibenwood. **Ibenwood grove · environment preview** is the direct shortcut to the original eastern grove. The chart marks these regions as **Environment preview**, with their unfinished features listed.

The groves have ground paths and exterior homes among roots, branches, and stone. West Ibenwood's Mossbound Stone Boughs and Central Ibenwood's High Bough Grove have working stairs, landings, and elevated walks. The royal glade reserves space for the eventual royal heart; it is not a completed palace or royal encounter.

## Environment and integration

- All 159 authored atlas hexes are registered in the normal region, travel, discovery, and save systems. Existing region IDs and seeded order remain unchanged; the five new IDs are 32–36.
- Approximately **22,200 new regional trees** surround the original 155-tree grove. Density varies between regeneration patches, mature stands, veteran trees, and open settlement clearings. The measured wild-forest density is approximately 167 trees per hectare against 12 inside the new grove footprints. These measurements describe the generated placement, not canopy coverage or a biological simulation.
- Every registered tree has a species. Outer woods use region-specific ordinary species; the inner belt and heart use the established Ibenwood species. Living trees in elven territory reject felling through the harvesting system. Gathering fallen wood is permitted.
- **77 new stable fallen-branch sites** use the existing collection and checkpoint system, in addition to the original grove's three. Placement checks for a clear approach. Collected branches remain collected after saving and reloading.
- Ground wildlife is distributed across all five regions: deer, boar, and hares, with a few reused birds. Approximately 249 additional animals are assigned to persistent runtime habitat zones. They use the existing wildlife lifecycle; individual animal state still is not serialized across application restarts. Stranger inner-forest fauna remains future work.
- The two authored river courses use the atlas's 21 Ibenwood river edges. Water, swimming, scenery exclusions, ground carving, and chart geometry share this source. North and East did not receive invented rivers. Existing river edges elsewhere remain unchanged.
- Ground geometry now covers the expanded region bounds. The established terrain sampling phase is preserved to avoid moving existing scenery. River banks receive compact local mesh refinement rather than copies of full-world vertex buffers.
- Central Ibenwood identifies its ruler as **Elfland**. Local HUD and chart names now identify Ibenwood's own groves and approaches instead of distant old-country landmarks.

## Walking above and below the canopy

Elevated walks use separate support surfaces rather than changing the terrain height underneath them. Ordinary movement can climb the stairs, cross platforms, descend, or pass below the same structure. Rail and building collisions only obstruct the level they occupy; tree trunks remain solid throughout their height.

Stepping off a platform enters the existing falling system. A fast fall can land on the highest platform crossed during that frame. Checkpoints store a valid support-surface identity so a canopy save reloads on the canopy, while old ground-only saves remain supported. Stale or misplaced surface identities safely restore to ground.

Review caught and corrected unsupported platform edges, stair-to-landing height discontinuities, and gaps in rail collision. The corrected visible deck footprints and collision/support geometry agree.

## Verification

The final disposable Electron session **passed all 27 checks and exited 0**, with **zero renderer frame errors**. It exercised F8 travel to all five regions, actual held-key walking, both canopy routes, walking underneath, canopy save/reload, river swimming, protected trees, wildlife, branch collection and persistence, and preservation of the user's normal checkpoint. Final West and Central grove captures were visually reviewed.

The final focused Node selection passed **44/44 tests** covering the environment, wildlife, rivers, gathering, map metadata, canopy supports, and campaign metadata. An additional metadata/map-fog run passed **12/12** after the build-status labels were added. Earlier focused terrain/layout and adjacent movement/checkpoint selections also passed. Syntax and whitespace checks passed.

Repeatable commands:

```text
npm run test:ibenwood
npm run test:ibenwood:desktop
npm run review:ibenwood
```

The complete repository `npm test` suite was not run to completion. Broader selections exposed existing expected-data drift: woodland-progress fixtures omit the normalized `ambronLayoutVersion: 2`, a campaign-world fixture expects 39 rather than 40 Drent cells, and an older wildlife fixture omits the already-built Iscare zones. These were not changed to hide unrelated failures.

Local, gitignored evidence:

- `tests/artifacts/ibenwood-checks.json`
- `tests/artifacts/ibenwood-expansion/final-desktop.log`
- `tests/artifacts/ibenwood-expansion/final-desktop-exit.txt`
- `tests/artifacts/ibenwood-expansion/final-unit.log`
- `tests/artifacts/ibenwood-west.png`
- `tests/artifacts/ibenwood-heart.png`
- `tests/artifacts/ibenwood-wild.png`

## Worker assessment and performance

The bounded regional scenery implementation worker used **GPT-6.1 Sol** through the temporary official CLI used for the earlier trial. Its recorded portion ran from 21:25:03 to 21:38:53 UTC, approximately **13 minutes 50 seconds**. It reported **1,556,360 input tokens**, of which **1,488,256 were cached**, and **21,681 output tokens**. Parent integration, other agents' work, visual review, and corrections are excluded from those worker figures. This is not a matched comparison against Astra and does not establish an exact subscription cost or relative efficiency.

The final regional forest reports 444 tree batches, 92 static meshes, and approximately 1.78 million total authored triangles. The final desktop snapshot rendered 312 draw calls and approximately 1.01 million scene triangles, with a reported 54 ms average frame time. Another normal game instance was running concurrently, so this is not a controlled performance benchmark. It is slow enough that interactive performance and further distance-detail work deserve attention before adding extensive ranger simulation or more elaborate canopy geometry.

The visual result establishes the requested dense wild woods and walkable grove scale. Buildings and elevated walks still reuse a small set of forms; stronger individual architectural identities and a richer old-growth canopy remain art refinements.

## Deliberately unfinished

This phase does not implement ranger perception or lethal boundary enforcement, permission and stealth admission, Elfland's dimensional withdrawal, the elf character model or resident cast, interiors, magical fauna, or royal gameplay. The current inner forest is therefore accessible for environment testing. Do not present it as the finished isolationist kingdom. No Dwarfland terrain or inhabitants were added.
