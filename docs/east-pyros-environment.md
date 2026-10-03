# East Pyros environment

The atlas gives East Pyros 33 hexes: 32 plains and one grassland. Its new landscape keeps that open-country identity: weathered volcanic swells, dark ash and basalt, red stone shoulders, pale pumice, shallow dry washes, and a greener southern coastal end. Talermolis is the sheltered northern rise. There are no new people, settlements, farms, or quest states in this pass.

The regional Pyros lore in `../world-builder/azhora_lore/geography/regions/pyros.md` supplies the quiet volcanic history, mineral soils, thermal springs and mixed dry/green country. The fauna overview supplies road-foxes, plateau hawks and spine-lizards. The revised geography and the actual atlas guide the moisture gradient: the eastern interior is dry, while northern shelter and the southern coast support more vegetation. Old volcanic activity is visible without turning a plains region into another mountain range.

## Places and movement

- **The Talermolis Rise:** broad, overlapping upland shoulders; sheltered holm oaks and umbrella stone pines.
- **The Warm Ash Spring:** a small, shallow warm pool with a pale mineral lip and faint steam. Its waterline meets the actual ground.
- **The Ash Columns:** irregular groups of exposed basalt, rooted in the hillside rather than a repeated row of freestanding pillars.
- **The Pumice Hollow:** pale, low weathered fragments among grass and juniper.
- **The Red Stone Fold:** warm, layered rock and a gravel wash leading out through open scrub.
- **The Green-Rim Spring / Southern Green:** a second small basin and a gradual transition to greener grass, wild olives, stone pines and riparian tamarisk.

Two open natural corridors connect the country. They are clear travel space, not artificial paved roads. Their sampled ground grades remain below 0.8, allowing normal walking; the occasional steeper volcanic shoulder remains available for climbing. F8 arrivals use dry, clear viewpoints beside springs and rock formations. The coast and the Vaellir river banks retain their existing hydrology. Relief fades to the incoming terrain at every region seam.

## Plants and wildlife

All visible tree trunks are registered, harvestable species: holm oak, stone pine, common juniper, olive, white poplar and tamarisk. The woodland is intermittent; most of the country remains grass and low scrub. Trunk feet follow the rendered terrain surface, including the entire trunk footprint on a slope. Pale bunchgrass, greener sheltered tufts and small seasonal flowers use merged per-hex geometry.

Wildlife is persistent and distributed through the region: cautious road-foxes, basking spine-lizards, upland hares, southern wild boar, plateau hawks and a low-hunting harrier. Named species are not static ornaments: the existing wildlife controller owns movement, avoidance and grounding. Each ground site has a clear patch and a slope limit. No domestic livestock is added to this unpopulated pass.

## Integration and checks

`east-pyros-world.js` supplies region ownership, feathered relief, tints, shallow pools, landmarks, open routes and review cameras. `east-pyros-scenery.js` supplies a bounded streaming generator returning immutable metrics, tree descriptors and a small steam update function. `east-pyros-wildlife.js` supplies the wildlife zones. The full and fast launch paths use the same generator.

The region uses 139 trees, roughly 6,400 grass tufts, 770 shrubs and 900 rocks in 75 draw batches, with approximately 267,000 source vertices including instanced tree counts. Exact metrics are available on the returned scenery object. Generation yields after small candidate batches and during geometry assembly; the whole region does not build in a single synchronous block.

`tests/east-pyros-world.test.js` checks atlas fidelity, untouched neighbours and river banks, seam continuity, pool depth and shores, actual ground grades and scenery clearance along routes, dry landmark arrivals, typed harvestable trees, streaming/geometry budgets and terrestrial/aerial wildlife placement. Native desktop checks and image review are run through the shared new-region harness.

Desktop verification (3 October 2026): the Fast launch smoke review passed all clear-footing, owned-region and dry-arrival checks, plus 1,752 metres of bidirectional valley and saddle walking; 26 resident animals across six species. Landscape screenshots were inspected in the actual Electron renderer. All named natural landmarks are discoverable on the journal map and available under F8 / Go anywhere. Focused region tests cover terrain continuity, grounded vegetation, traversable corridors and wildlife habitat.

Full-mode desktop review also completed the region checks with no renderer errors and captured close-up wildlife views. Electron emitted a GPU-process warning during shutdown; this made the shell exit nonzero after the checks and image capture had completed. New-region ground animals now use the visible terrain triangles for their drawn footing while preserving logical movement, and Fast mode keeps fauna hidden until the region is ready.
