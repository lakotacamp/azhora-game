# Ibenwood and Elfland

Design discussion, 30 September 2026. **The reviewed grove pilot has expanded into all five Ibenwood environments and an implemented guarded inner belt.** See the [environment implementation](ibenwood-environment-implementation.md) and [ranger-defense implementation and validation record](ibenwood-defense-implementation.md). Persistent ranger patrols, physical arrows and skill-sensitive unauthorized stealth entry are now part of the build. Permission quests, withdrawal, civilians, royalty, interiors and magical fauna remain future work. Confirmed user decisions are separated from implementation defaults and proposals below. This brief develops the Ibenwood portion of [the remaining-regions plan](remaining-regions-design-plan.md); it does not rewrite World Builder lore.

## Confirmed direction

- Humans arrived about 1,000 years ago. Their expansion and woodland clearance displaced elves from much of Azhora. Dwarves historically dominated mountains and hills; elves dominated the much more extensive forests.
- Ibenwood is the last great elven refuge. Elfland is the continent's only independent elf country, ruled by a powerful sorcerer king and queen.
- Elfland controls Central Ibenwood and the inward-facing portions of its neighbors: southern North Ibenwood, western East Ibenwood, northern South Ibenwood, and eastern West Ibenwood.
- **The outer forest in all four surrounding regions is explorable. A guarded inner belt protects Central Ibenwood.** East and South are not entirely closed regions.
- **Visible boundary signs precede lethal arrows. There is no spoken warning.** Powerful, concealed elven ranger archers defend the boundary.
- Forest Mittoli human communities live in the outer forest; elves rule the inner belt and heart. The older decentralized human communities and the new elven kingdom are distinct societies.
- The kingdom is isolationist and wary of outsiders because it is trying to survive. Central Ibenwood should be among the hardest places on the map to enter.
- **When Elfland is present, exceptionally skilled players can sneak inside without permission.** Consent is not an absolute entry requirement; unauthorized stealth entry must be genuinely possible.
- Elfland can withdraw dimensionally from the human world. **The forest remains, but paths no longer reach Elfland.** Lord Dunsany's *The King of Elfland's Daughter* is the inspiration. The practical rules of withdrawal remain open; a connection to the user's Cromb Coo Coo material is undecided.
- Elves need a distinct visual treatment, including pointed ears. Their stature is approximately human, perhaps slightly taller. Terrain, wildlife, and the elven presence belong in this design discussion; named royalty and a civilian cast have not been requested.
- **Elven settlements mix dwellings among branches, homes nestled around enormous roots, and ancient stone buildings absorbed into the forest.** All three belong in the architectural language; individual building designs remain open.
- **Elfland has several inhabited groves with a distinct royal heart, leaving substantial stretches of ancient forest between settlements.** Exact settlement numbers, locations, and sizes are undecided.
- **In elven territory, gathering fallen wood is permitted; felling living trees is prohibited.** Permission to gather does not grant permission to trespass. Further consequences for prohibited felling remain undecided.
- Forest structure should become more ancient toward the interior, with complexity and wildlife throughout.
- **Pilot feedback: the user likes the grove, but wants denser trees in wild forest outside settled groves.** The inhabited clearings should contrast with more densely wooded stretches between them.
- **Wildlife is mostly natural in the outer forest; stranger creatures and plants become more apparent inward.** This is a gradual change, not a complete replacement of ordinary forest life at a region border.

## Geographic foundation

The atlas contains 159 Ibenwood hexes, of which 100 are deep forest. All five regions now have an integrated environment build, using their exact atlas cells, with ranger defenses on the elven inner belt. Permission quests, dimensional withdrawal and the broader inhabited kingdom remain unimplemented. The current game scale is 100 metres per hex. The outer regions have difficulty 4 and Central has difficulty 5; exceptional difficulty of access can come from defenses that demand exceptional stealth, and the separate possibility of obtaining permission, rather than increasing every animal's level.

Current built-country approaches meet North Ibenwood from Isareos, and East Ibenwood from Isareos and Nethereum. These are geographic contacts, not existing constructed forest paths.

| Region | Atlas foundation | Proposed landscape identity |
| --- | --- | --- |
| North — 36 hexes | South Oremindi frontier; cooler climate; 21 forest and 15 deep-forest hexes | Cold, high-branched woodland beneath the mountains. Forested shoulders, root stairways, boulders, sheltered hollows, and occasional views back toward the peaks. Frost Needle and Ancient Cedar become more prominent on exposed ground. |
| East — 30 hexes | Isareos and Nethereum entrances; desert-facing margins and a lake edge; 19 deep-forest hexes | The clearest journey from dry, open country into forest. Sunlit fringes, thorny gaps, weathered rock, and increasingly tall shaded stands. Ancient survivors at the margin make the lost extent of the woods tangible. |
| South — 31 hexes | 23 deep-forest hexes; mapped river continues toward Alezhor | A wooded river country: shaded banks, root arches, low terraces, fallen crossings, and fern gullies. Drier outer ridges contrast with moist drainage bottoms. River Sentinel, Root Bridge, and Mud Cedar fit the water corridors. |
| West — 35 hexes | Ibenal-facing forest, reaching south toward Alezhor; no direct sea edge | A quieter, mossier forest of broad crowns, decaying giants, sheltered glades, and irregular root-covered ground. Its moisture is concentrated in sheltered places, not an invented permanent swamp. |
| Central — 27 hexes | Entirely deep forest, enclosed by the other four; small mapped river | The oldest continuous forest and Elfland's heart. Monumental living trees, hollow veterans, open spaces beneath high crowns, dense young growth in old storm gaps, and increasingly uncanny distance and light. |

These are landscape proposals, not finalized elevation or settlement placements. The ring is asymmetric: the defensive belt should follow inward ground, ridges, and crossings, rather than dividing four equal regions in half. The whole Ibenwood footprint is forest terrain on the atlas; that allows local relief without turning it into another major mountain range.

The principal authored internal river corridor runs through Central and South into Alezhor. North and East have no mapped river segments; West has only a short stream boundary with South Ibenal. Small drainage details can be proposed later, but four matching regional rivers or radial roads would misrepresent the map.

Most atlas climate cells have summer-dry labels. Older prose describes more continuous rainfall. The working proposal is a seasonally dry forest with damp shaded refuges, cooler northern woods, and wetter interiors; uniform year-round rain remains an unresolved lore discrepancy. The purported Lizeem boundary in Yunethre prose is also absent from the authored Ibenwood river map. Neither discrepancy is silently corrected here.

## Making the forest feel old

Old growth is not simply a collection of enormous trees. Uneven ages, multiple canopy layers, and new growth after small disturbances are central to its structure. For Ibenwood, use a mosaic of veterans, mature stands, saplings, and gaps rather than an unbroken wall of trunks. [NPS: forest succession](https://www.nps.gov/places/burnwood-trail-stop-3-forest-succession.htm)

The visual journey inward should increase continuity and structural variety, not tree density alone:

- At disturbed margins, younger trees compete in tight stands, with sunny shrubs and surviving old trees between them.
- Beneath some mature canopies, the player can see a long way between huge trunks. Understory density should vary with local conditions; sparse understory occurs in real old-growth stands. [NPS: Burnwood old-growth research](https://irmadev.nps.gov/DataStore/Reference/Profile/2298500)
- Where a giant has fallen, its root plate, trunk, and opening in the canopy create a recognizable place. Younger plants occupy the light. Windthrow also occurs deep inside ancient forest.
- Standing dead trees and fallen wood remain part of the habitat. Cavities support birds and bats; moist decaying logs support fungi, invertebrates, and small animals. [NPS: decomposition](https://www.nps.gov/places/burnwood-trail-stop-8-decomposition.htm)

Use the existing fantasy flora before inventing replacements: Grey Vault's immense trunk and spreading crown; pale, high-branched Pale Witness; red-brown Bloodoak; Midnight Elm's dark foliage; Ridgeback's buttresses; and Deeproot's exposed root ridges. Each needs a recognizable silhouette and species identity, including trees that serve as scenery or landmarks.

The ground layer can draw on Shadow Fern, occasional Ghost Fern, hanging fern curtains, Velvet Moss, lichens, and fungi. Bright growth belongs in appropriate light gaps. Luminous plants should be rare accents in the deepest places; ordinary shaded forest needs enough light and contrast to remain readable in the game's low-poly style.

Age is a property of the forest's continuity, not a requirement that every tree be several thousand years old. The lore's exceptional giants can remain fantastical without making the entire ecosystem identical.

### Density adjustment after the pilot

Make the surrounding wild forest visibly denser than the current sample. Proposed treatment: irregular clusters of additional mature trees and younger growth, overlapping crowns, and deeper vegetation along sightlines out of settled clearings. Keep the veteran trees legible and let narrow animal trails, root passages, and occasional natural gaps thread through the denser stands. The earlier old-growth mosaic remains; this adjustment raises the wild forest's overall density rather than filling every opening identically.

Judge density from ordinary walking height and moving-camera views, including concealment and navigable routes. Test render cost and collision as density rises; do not choose a fixed tree multiplier before measuring. Grove courtyards and useful domestic space can retain the openness the user liked in the pilot.

## Wildlife and exploration

Proposed habitats should support persistent wildlife across the outer forests and interior. A quiet area can still contain tracks, calls, insects, or movement; long stretches of scenery with only birds would repeat the problem the user has already identified elsewhere.

Candidate encounters include deer browsing gaps, boar foraging at productive edges, squirrels moving through nut-bearing trees, woodland birds around cavities, bats at dusk, and small animals around wet logs and streams. These are design candidates, not a finalized regional species list. Predators and rare magical animals need a separate pass; neither should be added merely to fill empty ground.

Animals should have habitat, feeding places, refuge, and persistent state. Elven ownership should not automatically make ordinary wildlife hostile or turn it into an army of trained sentries.

The user has confirmed a natural-to-uncanny progression. Proposed treatment:

- **Outer forest:** familiar animals and habitat behavior dominate. Rare unusual plants or an unexplained sighting can hint at the interior without making every encounter magical.
- **Inner belt:** strange flora and behavior become easier to notice. The existing lore's sparse luminous plants and direction-sensitive growth offer possibilities; exact species and behavior remain to be selected. Unusual creatures still need feeding, shelter, and movement through a habitat.
- **Central forest:** extraordinary plants and creatures become a recognizable part of the ecosystem alongside ordinary animals. An enchanted encounter need not be a fight; curiosity, beauty, and uncertainty should also matter.

This is a change in frequency and character, not three hard spawn bands. Ancient remnants and sheltered habitats can introduce exceptions. Do not equate deeper magic with constant aggression or assume creatures automatically report intruders to the elves. Specific species, powers, and any hostile-ivy encounters remain proposals for further discussion.

Navigation should use distinctive roots, rock, water, clearings, and unusual trees. Climbing can open viewpoints on appropriate rocky ground, while much of the challenge is finding passages through roots and gullies. Water, fallen trunks, and alternate paths should connect coherently. Preserve readable walking space and camera views when dressing the terrain.

Botany, tracking, foraging, cartography, and stealth fit naturally. In elven territory, gathering fallen wood is permitted and felling living trees is prohibited. Permission to gather does not grant permission to trespass. The current build refuses protected felling and provides collectible fallen branches throughout Ibenwood. Further consequences for prohibited felling remain undecided. Keep tree identification distinct from gathering and felling. Dangerous ivy is already a future forest concept, but its location and role here are not yet agreed.

## The defended inner forest

The current guarded-belt build places pale boundary stones and readable signs before the defended inner forest. The territorial line follows Elfland's inner belt; it does not close all of East, South, North or West Ibenwood. Markers cover path and lateral approaches. Their visual readability and actual walking routes are part of the [defense implementation review](ibenwood-defense-implementation.md).

After crossing, there is **no greeting, spoken ultimatum, or warning-shot stage**. Rangers may shoot to kill after detecting the traveler. The visual signs supply the advance warning the user selected; the boundary itself inflicts no damage.

Rangers now have actual ground positions, patrol routes, facing and individual perception. Arrows originate from their bows and meet terrain, trees, rocks and bodies. Their health, deaths, patrol positions and awareness persist in saves. Fighting a defender is possible; leaving the area does not respawn a killed ranger.

**Unauthorized stealth entry is a confirmed route when Elfland is present.** The implementation gives taught, skilled sneaking more time in a sightline and a smaller audible footprint. Observation, timing and real cover still matter: lingering in sight can expose even an expert. No automatic hex detection or mandatory permission check cancels an unseen crossing. Entering does not itself grant permission or friendship. Broader civilian and diplomatic responses to later discovery remain future design work.

Each ranger's awareness is independent. The first pass has no shared global alarm or omniscient plant sentries. Any later communication system or magical creature that can expose an intruder must have observable behavior and preserve the confirmed possibility of stealth entry.

The implemented defense is territorial: crossing back outside the belt cancels new aim and shots, and rangers do not pursue throughout the outer forests. Arrows already in flight remain physical projectiles. Political memory of an intrusion and a way to earn permission remain unresolved; no invitation quest, pass item or named commander has been added.

**Chosen tuning defaults, not new user canon:** ranger sight is 44 metres in a 100-degree cone; health is 180; an arrow deals 70 damage; full detection precedes an approximately 0.7-second draw tell, followed by a 2-second shot cooldown. These numbers and patrol coverage can be adjusted during playtesting without changing the confirmed lethal-defense and viable-stealth rules.

Rangers use pointed-ear elf models of roughly human stature, with a slightly taller build and woodland clothing. The broader range of elven appearances, civilian dress and royal presentation remains to be designed. Existing defaults still apply: no unsolicited hats, buns or named civilian characters.

## Elven settlements

The user has chosen a mixture of branch dwellings, root homes, and ancient stone buildings absorbed into the forest. Proposed treatment: let all three coexist within inhabited places, with their arrangement responding to individual trees, old structures, and terrain.

- **Among the branches:** modest dwellings and platforms tucked into the crowns of suitable giants such as Grey Vault. Occasional elevated connections can reveal another layer of settlement above the traveler. Selected canopy exteriors now have stairs and bridges; a broader canopy traversal system remains future design work.
- **Around the roots:** homes and sheltered courtyards nestled between great buttresses, particularly around Ridgeback. Entrances follow gaps between living roots; paths bend around them. Avoid making every home an excavated hole through a living trunk.
- **Within old stonework:** worn arches, steps, terraces, and buildings partly embraced by roots, moss, and regrowth. Some can remain inhabited and carefully maintained. Forest absorption need not mean abandonment. The builders, dates, and uses of individual structures remain undecided.

For visual unity, repeat a restrained set of materials and curved forms across the three types while varying height, orientation, and how much is initially visible. Preserve the game's low-poly style. A ground-level approach might first reveal a stone stair disappearing between roots, then a doorway, then dwellings overhead. The proportions and materials are proposals, not finalized assets.

Domestic spaces should not all become lookout posts. Selected elevated positions can watch exposed crossings, while roots and old walls interrupt sightlines elsewhere. Settlement approaches must preserve the confirmed possibility of skilled unauthorized entry. No resident population, named civilian cast, royal palace, or building interiors are specified here.

**Settlement pattern is now confirmed:** several inhabited groves, a distinct royal heart, and substantial stretches of ancient forest between settlements.

Proposed layout: place groves irregularly within the elven inner belt and Central Ibenwood, responding to shelter, water, living giants, and existing stonework. Do not assign one settlement to each compass region. Give the royal heart a deeper position within Central Ibenwood, with its precise location and architectural centerpiece still open.

Reserve connected expanses of ancient forest before sizing the inhabited places. At the current world scale, oversized settlements could merge visually even if their markers remain separate. Walking between groves should return the traveler to woodland exploration, wildlife, and natural landmarks. Winding approaches, intervening terrain, and canopy can reveal each grove gradually. Narrow paths and local elevated connections fit this proposal; a continuous cleared street network would undermine the agreed spacing.

The royal heart should feel distinct through a deliberate arrival sequence and an exceptional concentration of the chosen architectural forms, rather than merely enlarging every building. Its scale, central feature, and how the king and queen inhabit it remain design questions. The distribution must also preserve possible unauthorized stealth approaches, without forcing every route through a single checkpoint.

## Elfland's withdrawal

Dunsany's book provides a useful distinction: the frontier itself can retreat beyond a human traveler's reach, rather than merely closing a gate. That supports making entry depend on more than surviving the rangers. [Primary text: The King of Elfland's Daughter](https://www.gutenberg.ca/ebooks/dunsany-kingofelflandsdaughter/dunsany-kingofelflandsdaughter-00-h.html)

The user has chosen a withdrawal that leaves the forest present while its paths cease to reach Elfland. The traveler should not encounter an emptied landscape or a conventional closed gate. The route behavior, map representation, and treatment of travelers already inside remain open.

Presence and permission are separate. While the realm is present, an uninvited traveler can reach it through exceptional stealth. Recommendation: withdrawal should not automatically follow a player approaching or successfully slipping past a patrol. Its trigger and effects need their own design so that this magic does not silently remove the agreed stealth route. Give travelers perceptible evidence that distinguishes a withdrawn kingdom from a difficult guarded approach. Whether any means can reach a withdrawn Elfland remains undecided.

One proposal is to separate the physical defended forest from the deeper dimensional threshold. The rangers protect real woodland and its inhabitants; the sovereigns can withdraw the heart beyond ordinary routes. The relationship between those two boundaries, the extent of withdrawal, and its limits are not settled. The existing lore's unreliable measured distances and navigation by water, growth, and sound supports the chosen direction. No portal destination, royal genealogy, time-travel rule, or mandatory Cromb Coo Coo connection is established.

## Questions and lore reconciliation

These questions have now been answered:

1. **Forest Mittoli communities:** human communities remain in the outer forest; elves rule the inner belt and heart. Older statements denying any forest-wide ruler can describe the outer human communities, but should no longer be treated as a complete account of the interior.
2. **Withdrawal:** the forest remains, but paths no longer reach Elfland.
3. **Unauthorized entry:** exceptionally skilled players can sneak inside while Elfland is present.
4. **Wildlife and plants:** mostly natural outside, increasingly strange toward the interior.
5. **Architecture:** a mixture of branch dwellings, homes around enormous roots, and ancient stone buildings absorbed into the forest.
6. **Settlement pattern:** several inhabited groves with a distinct royal heart and substantial ancient forest between settlements.
7. **Wood gathering:** gathering fallen wood is permitted in elven territory; felling living trees is prohibited. Permission to gather does not grant permission to trespass.

Remaining decisions include final grove locations and scale beyond the current exterior defaults, the royal heart's central feature, broader elven appearance, conditions for withdrawal, permission quests, civilian and diplomatic responses to discovery, and further consequences for prohibited tree felling. Older statements about thousands of years of local human history also need reconciliation with the user's approximately 1,000-year arrival chronology. Old trees and ruins can predate humans; the age of wood alone does not establish the age of writing on it.

The earlier Cromb Coo Coo redesign document explicitly identifies itself as speculative and non-canon. Its human-only geography and genealogy do not override this new brief.

## Implementation and remaining review

The initial one-grove pilot was reviewed and followed by authorization for the denser five-region environment and then the guarded inner belt. The [environment report](ibenwood-environment-implementation.md) records the earlier pass; the [defense report](ibenwood-defense-implementation.md) records the current implementation, desktop validation and limitations. All five regions retain the Environment preview classification because the inhabited kingdom and wider regional gameplay are unfinished.

The stealth acceptance requirement remains concrete: demonstrate entry into a present Elfland without permission, detection or killing its defenders, using real movement and cover. Also verify readable advance signs, physical projectile obstruction, retreat, combat counterplay and save restoration. Permission quests and withdrawal need later design and implementation; civilian communities, royalty, interiors and magical fauna remain future scope. Dwarfland remains design only.

Local source material: the World Builder `ibenwood.md`, `ibenwood_flora.md`, and `ibenwood_groundflora.md` drafts; the Forest Mittoli and Standard Mittoli drafts; `azhora.wwmap`; and the game's `region-layout.js`, `region-levels.js`, and `world-scale.js`. All five Ibenwood names follow the atlas spelling.
