# Babon: natural island pass

Babon is a large, steep jungle island with a legible northeastern coastal approach. This pass builds its landscape and wildlife while leaving its people, settlement and mysteries for later. The flat northeastern reservation is for future Tathilium; it currently contains natural vegetation and an arrival point, with no houses, harbor structures or city marker.

The source is `../world-builder/azhora_lore/geography/regions/babon.md` and the authored `azhora.wwmap`. The map contains 50 island hexes: 22 deep-forest cells with Af rainforest climate and 28 coastal grassland cells with Csa climate. Its four small streams follow all 21 authored river edges. The generated terrain-only survey does not carry climate or river metadata, so those were checked against the original map.

## Terrain and routes

The northeastern anchorage is backed by a broad low coastal plain, around 12m above the sea. Connected, unequal ridges rise behind it to approximately 134m. Saddles and damp drainage folds divide their shoulders. Dense ancient canopy belongs to the interior; the coastal plain, sea cliffs and pocket beaches create visible breaks and less enclosed habitats. The shape is an old, eroded island, without alpine peaks, vertical collision walls or isolated cone mountains.

Natural routes wind from the anchorage to the old canopy threshold, the fern ravine, the rootbound saddle, the channel cliffs, the southern palm bight and the eastern reef cove. Every arrival is on dry, clear ground. These are narrow openings in the terrain and vegetation, not built roads. Steeper off-route faces use the existing climbing system.

The four mapped streams follow continuous downhill surface profiles and join the sea. Their banks are cut into the actual terrain; each water ribbon and the collision water query share the same samples. Where a route crosses a stream, a narrow natural gravel bar rises just above the water. This matters because the current movement controller treats every submerged foot position as swimming, regardless of shallow depth. No bridges or artificial causeways are added.

Most shores are rocky, with forested hills approaching the water. Three limited beach pockets and the northeastern plain have longer, gentler descents and sand-colored margins. The existing atlas coastline remains intact. Only the final meters of authored river mouths cut through the coastline's smoothing inset, so stream outlets cannot end behind a sand sill. Reefs remain offshore scenery and wildlife habitat, not new land.

## Rendering and validation

`babon-world.js` owns the pure terrain, habitat, climate, waterways, travel points and review cameras. `babon-ground.js` refines only narrow stream and walking corridors to approximately 1m triangles. It replaces the original faces, stitches back into their existing boundary planes, and returns a sampler for the visible float32 surface. The rest of the island keeps ordinary terrain resolution.

The scenery and wildlife modules consume the same habitat and water queries. Trees follow the rendered ground surface, river banks remain free of roots, and large reptile homes need clear, gentle patches away from travel arrivals. This pass leaves the inland peoples, their relationship with the fauna, and Tathilium's eventual culture unimplemented.

`tests/babon-world.test.js` checks the atlas/climate split, coastal and neighboring terrain preservation, the northeastern reservation, linked hills and wet valleys, every authored river edge, monotone downstream profiles, dry gravel crossings, more than 8,500 real walking steps in both directions, climbing, bounded refinement, underwater rendered channel beds and distinct shoreline palettes. Scenery and wildlife have their own placement and render-budget checks; native desktop review verifies the integrated result.

The native Fast-mode review passed its terrain, water, path and animal assertions with no renderer errors. It walked 2,592m in both directions with a maximum tested grade of 0.6635, and observed 31 animals, 2,484 registered trees, 223 scenery batches and 1,075,186 triangles. The harbor, interior and giant-monitor captures were visually inspected. Evidence is in `tests/artifacts/babon-fast-review.log` and `tests/artifacts/western-environments-checks.json`. The existing GPU warning during shutdown still gives the process exit code 1 after successful capture; this is not recorded as a clean process exit. The combined Babon/Aevis Full-mode run also passed the same traversal, water, scenery and animal checks with no renderer errors; see `tests/artifacts/babon-aevis-full-review.log`. A ravine shading correction identified during that review is checked in the final Fast-mode capture.
