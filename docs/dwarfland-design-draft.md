# Dwarfland: the two Baldro mountain countries

30 September 2026; updated 1 October 2026. **First playable Baldro implementation completed and verified.** The user confirmed the surviving kingdoms, mixed occupied and abandoned districts, and earned entry. This record preserves the earlier design proposals while identifying the current playable build. Implement Baldro Dwarfland first, then [Sevron and West Oremindi](sevron-west-oremindi-design.md). The atlas names are **West Baldro Mountains** and **East Baldro Mountains**; World Builder remains read-only. See [the implementation record](dwarfland-implementation.md) for the current scope and validation.

## Confirmed premise

Dwarfland occupies both regions, which remain controlled by dwarves. Its people have lived here for thousands of years, long before human arrival. Their towns and great cities extend inside the mountains. Develop their culture afresh: existing Azhora lore can inspire the surrounding human context but does not dictate dwarf society.

Dwarves once held the continent's mountains and hills, including Gorgi, Lotharn, Oremindi, and Suval. Elves held the extensive forests. Their division of the land was fairly equitable; they fought wars without exterminating one another. Humans arrived approximately 1,000 years ago; their expansion has displaced both peoples and now threatens their survival. This history establishes pressure on Dwarfland, but does not establish that every surviving city is ruined, impoverished, or hostile to visitors.

The user confirmed the following choices on 1 October and authorized implementation:

- Dwarfland is a confederation of independent city kingdoms. Two survive, one in West Baldro and one in East Baldro; neither is subordinate to the other.
- Many former cities were destroyed by humans or overrun by goblins. Both surviving cities contain lived-in, working districts beside abandoned districts.
- Visitors must earn entry. Each kingdom controls its own admission; permission at one gate does not admit a traveler to the other.
- Dwarves are short and broad, with adult proportions and distinct working clothes.
- Build the Baldro country and underground cities now. West Oremindi and Sevron remain the subsequent design and implementation phase.

The current implementation calls the surviving cities **West Hold** and **East Hold** as plain working labels. Their exact royal names, sovereigns, religion, clan system, named residents and larger stories remain unassigned. The two local maintenance tasks, 30 Construction XP per kingdom on successful report, six-room interior plans and unnamed civic roles are implementation choices rather than additional historical canon. Further proposals below remain proposals unless explicitly marked as built or confirmed.

## The lost Oremindi capital

**Confirmed by the user on 1 October:** the greatest ancient dwarf kingdom was based in West Oremindi. Its capital lay inside the mountains. Human armies besieged it for years, killed its king and destroyed the kingdom by bringing the sea into the mountain and drowning the city's population. Dwarves were expelled from the Oremindi, especially the western range. The ancient capital's dwarven name and language remain undecided.

Centuries later, elves settled within the ruined city and founded the hidden kingdom now called Sevron. This later elven occupation did not cause the original catastrophe. Sevron is real in the design, but its existence remains unconfirmed to most outsiders. Its relationship with Baldro and Ibenwood is open.

The surviving Baldro realms look back to the Oremindi kingdom as a lost golden age. Do not relocate that historical primacy to Baldro merely because these are the first dwarf cities built for the player. Baldro can be beautiful, capable and inhabited while preserving memory of a greater realm that was lost. The whole capital's population died; any people who carried traditions elsewhere must have been outside it at the time or have left earlier, rather than silently turning the drowning into a survivor story.

**Design proposals for Baldro:**

- Establish a shared architectural tradition that the player can later recognize in Oremindi: related openings, stone joints, civic spaces and water works. Sevron's older monumental forms and later elven modifications should still have their own identity.
- Give remembrance a place in ordinary civic life through preserved craft, records, commemorative space or inherited objects. Exact rituals, royal symbols and relics are undecided.
- Consider protected drinking-water systems, separate drainage compartments and more than one high exit in later Baldro construction. These are possible lessons from the disaster, not a settled technical account of the siege.
- Allow different attitudes toward the old kingdom and its ruins. Reverence does not automatically make every dwarf a claimant, exile, isolationist or enemy of the elves. Whether Baldro knows that elves inhabit the capital is an important future choice.

The dead king is not automatically an ancestor of a current Baldro ruler. No present monarch, succession claim, reclamation war, named resident or quest follows automatically from this history. Keep the human attacking power and siege date unresolved until designed. This catastrophe predates the present war and is not assigned to Wilhelm.

## What the map gives us

Read-only audit of `../world-builder/map/resources/examples/azhora.wwmap`:

| | West Baldro | East Baldro |
|---|---|---|
| Authored area | 36 hexes | 32 hexes |
| Terrain | 24 hills, 12 mountain | 21 hills, 11 mountain |
| Climate labels | 35 Dwc, 1 Dfc | 32 Dwc |
| Current difficulty | 9 | 8 |
| Authored water | No river sides | 12 small-river sides, all on external borders |

Both are inland. Neither contains authored high-mountain, glacier, lake, or forest hexes. Those coarse categories do not prohibit local woodland, brooks, ponds, or individual impressive peaks, but they do not justify turning the whole country into a glacier or a sheer mountain wall. At the game's current scale, a hex is approximately 100 metres across; settlement sizes must be judged in the actual game, not from an imagined vast map.

West borders Orgmala, North Ganun, North Riesov, East Lond, and one side of Eshtor Plateau, as well as East Baldro. East borders North Ganun, East Ganun, North Riesov, and South Riesov, as well as West Baldro. There is no direct Gorgi border and no sea access. The shared Baldro boundary has both hill and mountain sides: it can support different crossings instead of one inevitable pass.

The atlas supplies no settlement layout, roads, mines, precise elevations, flow directions, or internal river network. Specific geology, drainage, and city sites therefore need design rather than being presented as recovered canon. The existing difficulty numbers do not make ordinary dwarves enemies. Both regions are now registered as normal playable regions, with their own arrival points and F8 Go Anywhere destinations.

The first build places the western gate on the southern face of mountain `(47,66)` and the eastern gate on the southern face of mountain `(50,69)`, with arrivals at `(46,68)` and `(51,70)` respectively. Two contour approaches and a shared saddle route connect their exterior country. The earlier alternatives below remain possible future places, not extra assigned cities:

| Candidate area | Actual neighboring hexes | Opportunity |
|---|---|---|
| Western foothill approach | West hills `(42,67)`, `(43,67)`, `(43,66)` beside mountain `(44,66)` | A gradual approach from the East Lond/North Ganun side toward a mountain mass continuing into `(45,66)` |
| Northern connection between the two regions | West hill `(49,66)` and East hill `(50,66)`, beside mountains `(50,65)` and `(51,65)` | Entrances overlooking a shared route, with actual contours deciding whether it is a pass, road, or tunnel |
| Southern East Baldro approach | East hills `(50,71)`, `(50,70)` beside mountains `(50,69)`, `(49,70)` | An inhabited hill apron reached from East Ganun's plains |

A second, southern connection can use West `(47,68)` to East `(48,68)` or `(47,69)`. That provides an alternative to the northern route through hill country. Adjacency alone establishes neither walkable gradients nor an underground link.

## The intended experience

A traveler first sees a lived-in mountain country: paths following contours, meadow openings, wind-shaped woodland, drainage works, a distant doorway large enough to suggest something more. The entrance then reveals a street that continues into the rock. A gradual sequence of domestic spaces and occasional great halls establishes that people live here, rather than merely guard a dungeon.

Give these cities recognizable daily life: kitchens, classrooms, baths, gardens where light reaches, gathering rooms, workshops, stores, music, and places to rest. Mining and defense can have their own districts without explaining every building or inhabitant. Millennia of occupation should appear in repaired stairs, adapted rooms, successive levels, and old masonry integrated into newer construction. Ancient buildings can still be useful, comfortable homes.

Surface hamlets, productive valleys, and underground neighborhoods belong to the same country. Dwarves should be seen as at home in the hills as well as below the stone. Their threatened position need not erase humor, beauty, disagreement, or ordinary domestic concerns. The confirmed balance is mixed: active domestic and craft districts remain useful and inhabited, while substantial old quarters stand abandoned. Entry is earned separately at each surviving city.

## Terrain and routes

**West proposal: exposed shoulders and long views.** Use broad hill spines, weathered rock ribs, a few steep mountain masses, scree below broken faces, and sheltered grassy hollows. Lower woodland occupies suitable soil and shelter; higher exposed slopes thin into scrub and low vegetation. An approach can alternate between a meadow, a shallow ravine, and an exposed traverse before reaching a protected city entrance.

**East proposal: sheltered basins and folded valleys.** Give this half more wooded saddles, enclosed hill basins, stone outcrops rising through trees, and paths that follow side valleys. A main entrance might face a sunny basin with small fields and water storage; another could overlook one of the authored border streams. The west can contain sheltered woods and the east can contain bare ridges: this is a difference in emphasis, not a hard biome boundary or a claimed rain shadow.

Build landforms as coherent shapes across hex edges. A ridge should have spurs and saddles, a ravine should drain somewhere, and scree should collect below a plausible source. Avoid repeated concentric shelves, spikes at every cell center, and decorative rock walls that conceal unrelated collision. Seasonal snow can linger in shaded hollows without becoming a permanent white cap on every hill.

Design three kinds of surface movement together:

- **Inhabited routes:** walkable contour paths, switchbacks, stairs, bridges, and short rock-cut passages. These carry daily traffic and connect useful places.
- **Exploration routes:** rough gullies, woodland tracks, ridge walks, and optional climbing shortcuts with rests and readable descents.
- **Difficult terrain:** genuine cliffs, unstable-looking scree, and blocked side passages whose obstacles are visible. Do not substitute invisible borders for terrain.

Climbing should be useful on selected exposed faces and shortcuts. Ordinary hill travel should remain walking; every errand must not become a stamina climb. Falls, ledge transitions, landing, and developer flight clearance require the same scrutiny as the Lotharn work.

**Water proposal:** locate springs and catchments before locating thirsty settlements. Feed brooks down actual gradients into the existing border drainage where appropriate; use cisterns, conduits, and small reservoirs where they help explain a city. Do not draw an arbitrary underground river beneath every hall. Bedrock and cave formation remain undecided: excavated cities need not occupy natural limestone caverns.

## Forest and wildlife

Cold-country habitats should form a mosaic responding to shelter, exposure, moisture, and disturbance. Boreal mountain examples support a sequence of woodland, scrub, meadow, and exposed rock rather than a single altitude strip everywhere. This is an ecological reference, not a proposal to import Alaska's exact elevations, glacier coverage, or species list. [NPS ecological overview](https://www.nps.gov/articles/aps-v5-i1-c2.htm)

Candidate vegetation: spruce-, pine-, birch-, and willow-like trees where suitable, with short shrubs, meadow plants, moss in damp pockets, and lichens on exposed rock. The first build uses registered stone pine, silver fir, silver birch and common juniper, with denser eastern woods and sparse western cover; other species remain possible later additions. Every tree should have an actual species and material identity; visually distinct trunks and crowns must agree with the woodcutting system. Tree-use customs are undecided: Elfland's no-felling rule does not automatically apply here.

| Habitat | Candidate wildlife and visible activity |
|---|---|
| Grazing slopes beside rocky refuge | Mountain sheep, with small groups feeding and retreating toward crags |
| Talus adjoining meadow | Pikas or comparable small mammals; calls, gathering, and hay piles |
| Meadow and rock edge | Marmots, burrows, resting stones, birds hunting above |
| Sheltered woodland and scrub | Hares, squirrels, small rodents, woodland birds, occasional larger browsers |
| Productive prey habitat | Foxes or lynx, relatively sparse and using the same landscape as their prey |
| Cave entrances | Bats and small animals that also forage outside |
| Undisturbed deep cave | Sparse specialized invertebrates, damp recesses, pools where hydrology supports them |

The table is still a proposal list. The first build places persistent upland hares and red deer in both regions, seasonal hill-sheep on West Baldro grazing ground, and boar in sheltered East Baldro woodland. Pikas, marmots, foxes, lynx and cave animals have not been added. Sheep need feeding ground near refuge, and pika-like animals need both forage and rocky shelter; neither should be scattered randomly on summits. [NPS sheep habitat](https://home.nps.gov/articles/denali-sheep-survey.htm), [NPS pika habitat](https://www.nps.gov/band/learn/nature/pika.htm)

Use persistent habitat groups with feeding, resting, shelter, and travel areas. Open plains and wooded slopes should show ground wildlife as well as birds. Avoid instant respawning beside the traveler, population resets at hex boundaries, and animals walking through walls or over voids. Settlements and their approaches should leave routes between habitat patches.

Keep natural caves distinct from managed inhabited halls. Most cave food arrives from outside through water or visiting animals; a dark cavern is not naturally a self-sufficient garden. City food can come from surface cultivation, grazing, storage, and trade. Fungal cultivation still needs feedstock. A magical food or energy source is possible only as an explicit later choice. [NPS cave ecology](https://www.nps.gov/grba/learn/nature/cave-life.htm)

## Cities within mountains

Plan a few substantial places separated by landscape rather than a town in every mountain hex. The two surviving cities now have assigned gates and separate enclosed interiors. Each first interior contains a gate hall, commons, hearth district, working district, abandoned district and raised memorial hall. The visible guarded door transitions to a separate underground floor; the present return route uses that same doorway. A second exit and additional city districts remain future work.

Shape major rooms around credible rock volumes. Use retained pillars, vaults, stone ribs, and changes of level to create scale. Let small domestic rooms and public courts establish human-scale detail before revealing an exceptional chamber. Repeating giant empty halls would make both scale and habitation less convincing.

Light should orient the traveler: entrance daylight, occasional light wells where the mountain thickness permits, warm inhabited streets, and darker unused passages. Ventilation shafts and water works can become recognizable landmarks. Smoke-producing work needs a believable place in this arrangement. No universal magical lighting system is assumed.

For navigation, each district should have a memorable junction and a clear relation to an entrance or public place. Changes of floor need readable stairs, ramps, and views between levels. Short return routes keep a city enjoyable to revisit. Depth should bring architectural history and new uses, not simply darker corridors and stronger enemies.

Proposed visual language: broad low openings, carefully joined faceted stone, deep reveals, restrained metalwork, timber where useful, and local stone colors warmed by inhabited spaces. Old and new work share proportions but need not have identical decoration. The confirmed short, broad adult dwarf build is implemented with distinct guard, artisan and resident clothing. These proportions do not assign everyone the same beard, hair, clothes, or occupation. Existing rules against unsolicited hats and invented named civilians still apply.

## Dwarfland beside Elfland

| Design question | Elfland: confirmed direction | Dwarfland: proposal or unresolved choice |
|---|---|---|
| Homeland | Ancient forests, inner belt and Central Ibenwood; Sevron is a separate hidden elven kingdom | Inhabited hills and cities within West/East Baldro; the greatest former capital was in West Oremindi |
| Settlement pattern | Separate groves, mixed branch/root/stone homes, distinct royal heart | Two independent surviving city kingdoms in a confederation, with connected surface and underground places |
| Sense of age | Living giants, absorbed stone, old paths | Repaired and adapted construction, successive streets and rooms |
| Travel challenge | Cover, terrain, ranger sightlines; exceptional stealth entry possible | Exposed approaches, passes, depth and routefinding; each city grants earned entry independently |
| Boundary | Visible signs, no spoken warning before lethal defense | Guarded civic gates and local service before admission |
| Magic | Elfland may withdraw while the forest remains | No equivalent disappearance, stone magic, or divine source assumed |
| Resource relationship | Fallen wood allowed; felling living trees forbidden | Materials, managed land, and extraction customs need discussion |
| Daily life | Inhabited groves separated by substantial forest | Domestic city districts linked to supporting surface valleys |

The shared history is loss under human expansion. Baldro carries the memory of the drowned capital; Sevron brings elves into the remains of that older dwarf world. Ibenwood remains the publicly recognized elven homeland under the reconciliation in the Sevron plan. Their responses can differ without making one people virtuous nature-lovers and the other careless extractors. Neither should become a single personality repeated across all residents.

## Implementation sequence and remaining expansion

1. Place candidate ridges, watersheds, habitat patches, and city entrances on the real two-region atlas. Preserve shared borders and distinguish chosen additions from inherited map data.
2. Test one surface-to-city route with a meadow, woodland pocket, steep optional climb, entrance, inhabited hall, and return exit. Judge player-height views, scale, movement, light, and wildlife before enlarging it. Establish the shared dwarven construction language here so the later drowned capital can visibly preserve an older form of it.
3. Resolve underground traversal explicitly. Existing Lotharn caves already separate cave floors from the surface; a multi-level city must extend that idea with correct floors, ceilings, entrances, collisions, camera behavior, save/load state, and map navigation. It cannot be represented merely by lowering the terrain heightfield.
4. Expand terrain and habitat across both regions, then settlements. Use culling and shared geometry so detailed halls do not draw through entire mountains. Add residents only after appearance, roles, and permissions are agreed.
5. Verify surface and underground traversal, wildlife persistence, repeated entrances and exits, climbing/falling, saves, mapping, and desktop performance. Do not claim a whole region finished from a distant mountain screenshot.

The 1 October authorization advances Baldro into implementation. The initial build implements the two-region terrain, surface habitat, independent gate tasks, enclosed six-room interiors and persistent admission. Larger cities, additional levels and exits, scheduled civilian routines, named residents, broader economy and story content remain expansions. West Oremindi and Sevron follow after Baldro is assessed; no West Oremindi implementation is included in this pass.

## Decisions to refine next

Entry, government and the balance of inhabited and abandoned districts are settled above. The remaining choices include the character of dwarf magic, the royal and personal names, the old Oremindi capital's dwarven name and language, larger stories, and what Baldro knows of Sevron or thinks of the later elven occupation. The first build does not establish a pantheon, succession claim, reclamation war or relationship with Sevron.

## 1 October continuation: guarded craft and the wider optional arc

The user wants Dwarfland to grow through many quests, with trust earned within
each of its two sovereign city kingdoms. Their confederation gives them shared
concerns without making one city speak for the other. The first admission task
and first craft lesson establish a local relationship; neither grants an
alliance, general access to guarded knowledge, or the other kingdom's trust.

The West Hold artisan's introductory lesson shares **repair-riveting**, a single
guarded dwarven technique: controlled heat, fitting and peening the joint, then
quenching and inspecting the repair. Completing that lesson awards **45 Smithing
XP and 30 Dwarven Smithing XP once**. **Dwarven Smithing** is a specialization
under Smithing, with its own taught status and progress. It begins locked,
including in older saves that have no record of it. Ordinary Smithing remains
available under the existing rules. More experience does not reveal the other
dwarven techniques; further teaching belongs to later quests and relationships.
No new named teacher is needed for this introduction.

The later regional arc should give the player several meaningful directions:

- Cooperate with either or both kingdoms through their own politics, disputes
  and threats, including goblins. A sustained series of choices can help the
  surviving cities thrive.
- Leave the kingdoms alone. Their optional arc must not require the player to
  intervene or punish ordinary progress elsewhere for declining involvement.
- Pursue adverse paths with their own benefits and consequences. Some such
  branches could ultimately destroy a kingdom; they need deliberate quest
  design, rather than making the introductory lesson silently commit the
  player to hostility or alliance.

These are directions for **future quests**, not implemented political branches,
goblin campaigns, prosperity systems or destruction outcomes. The surviving
confederation and the memory of the drowned Oremindi capital should shape what
people protect and fear, without deciding their response for them. The capital's
old name and language, named rulers and residents, specific political factions,
quest rewards beyond the first lesson, and Baldro's knowledge of Sevron remain
open. This continuation adds no West Oremindi or Sevron implementation.

Local technical references: `region-levels.js`, `region-layout.js`, `survey-world.js`, `world-scale.js`, and `east-lotharn-caves.js`. World Builder has only been read.
