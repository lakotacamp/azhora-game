# Legemum: natural landscape

Legemum is wet, low and ocean-facing, in contrast to Ascarth's dry bronze coast. This pass builds its terrain, plants and wildlife. Villages, mines, farms, guilds, people and working harbors remain for a later pass.

The 24 authored atlas hexes and existing shoreline remain authoritative. Low tin-bearing hills descend through walking saddles to a broad Haur meadow, a sedge and sphagnum hollow, sheltered alder/birch/oak folds and exposed slate headlands. Quartz ribs identify mineral country without constructing mine entrances. Gorse, heather, thrift-like flowers and wind-pruned hawthorn keep the open ground textured without turning it into forest. Every living tree is a named, harvestable species.

The Haur is the lore's seasonal assembly meadow. It is currently empty. Three natural shore indentations retain the potential for the lore's Three Mouths anchorages; this pass does not invent ports, deep-water access or additional atlas rivers.

Travel arrives at **The Tin Hills** (-1970, 1535). Natural corridors connect the headland, Haur, peat hollow, Alder Fold and Slate Tor. They remain free of collision scenery and have walkable grades. Short exposed faces can still be climbed. Coast and river beds are preserved, and terrain changes fade into adjoining countries.

The fauna overview explicitly places **Great White Sea-plungers** on Legemum's headlands. The existing rig circles offshore and dives into genuine sea, beside a gull colony. Red deer, wild boar, hares, a marsh harrier and grey dolphins are documented habitat extensions from the game's existing fauna. Domestic animals are deferred with the inhabited landscape. All terrestrial homes are placed on measured dry, walkable ground; marine ranges remain offshore.

Trees use shared instances with individual harvest handles. Low plants are merged per hex, and construction yields between small batches for Fast loading. The renderer supplies its actual terrain height to root vegetation on the displayed ground.

Validation covers atlas ownership, unchanged water beds and neighbouring terrain, more than a kilometre of natural routes, tree species/grounding, geometry budgets, wildlife footing and full offshore swimming/diving ranges. Native views: `legemum-headland`, `legemum-hills`, `legemum-hollow`, `legemum-woods`.

Sources: `../world-builder/azhora_lore/geography/regions/legemum.md`, `geography/azhoran_flora_distribution.md`, `fauna/azhoran_fauna_overview.md`, and the existing authored atlas. No changes are made to the World Builder repository.

Desktop verification (3 October 2026): the Fast launch smoke review passed all clear-footing, owned-region and dry-arrival checks, plus 2,208 metres of bidirectional saddle and headland walking; 23 resident animals across seven species. Landscape screenshots were inspected in the actual Electron renderer. All named natural landmarks are discoverable on the journal map and available under F8 / Go anywhere. Focused region tests cover terrain continuity, grounded vegetation, traversable corridors and wildlife habitat.

Full-mode desktop review also completed the region checks with no renderer errors and captured close-up wildlife views. Electron emitted a GPU-process warning during shutdown; this made the shell exit nonzero after the checks and image capture had completed. New-region ground animals now use the visible terrain triangles for their drawn footing while preserving logical movement, and Fast mode keeps fauna hidden until the region is ready.

Exposed western and southern headlands use slate-grey stone through the tide line, including the narrow shoreline fringe outside authored land hexes. Sheltered bay strands retain the ordinary sand tint. The shared shore-tint regression covers all three cliff families.
