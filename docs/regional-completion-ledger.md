# Regional terrain and wildlife completion ledger

Inventory prepared 3 October 2026 against main `a2e49c3` and the existing Celder worktree. This is the companion to the [joint implementation and review plan](regional-completion-joint-plan.md). **Implementation authorized 4 October 2026.** Claude delivered both Celders, East Izol and Alezhor; ChatGPT is reviewing the existing R1-R11 backlog in a separate worktree and mirroring verified corrections into the desktop checkout. South/North Ibenal are now observed building in a separate draft checkout; other queued rows remain unstarted.

## Inventory totals

| Category | Regions |
| --- | ---: |
| Authored atlas | 131 |
| Registered in main | 64 |
| Outside main, delivered by Claude and awaiting review | 0 |
| Other new or partial environment builds | 67 |
| Total remaining outside main | 67 |

The 67 includes Cape Thalmagar's partial prototype. The two Celders, East Izol and Alezhor are accepted for their environment scope: four newly accepted regions. Existing environments require the review below; none receives a new acceptance certificate merely from registration. Numeric IDs in the existing inventory are current runtime IDs. Unbuilt regions receive IDs at integration, not from their queue number. Preserve exact atlas spellings.

## Claude build order

The numbered rows establish the default order. A geographic stage is not a single giant delivery: hand off one country at a time, or a specifically agreed connected pair. Complete Celder from its existing checkout first. East Izol is a relatively bounded next assignment while ChatGPT works through its review backlog.

After Celder, this order fills nearby gaps, develops the northern Oremindi approach, expands through the Acor and northern mainland countries, then reaches the cold seas and far south. An adjacent region's changed terrain must be reconciled before final acceptance. When the immediate next task depends on a disputed seam, ChatGPT can assign the next independent row and record why.

Terrain descriptions below are **atlas constraints and proposed natural emphasis**, not new cultural canon or finalized species lists. Claude must still prepare a short terrain/habitat brief before each build. Climate terms describe habitat; they do not authorize implementing seasonal survival systems.

### Existing Celder work

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 1 | South Celder | Continental open plain, low swells, mountain-facing margins and stream terraces; join West Lotharn, Yunethre, Oremindi and Mithala. | Environment accepted; available in main |
| 2 | North Celder | Continental plains and eastern grassland; cold running border streams and gentle west-to-east relief continuous with South Celder. | Environment accepted; available in main |

Historical delivery: both were frozen in `../azhora-game-celder`, branch `celder`, based on `a2e49c3`. Claude delivered the clean pair at `136b582` on 4 October, including build `e7012d9`. The initial intake did not grant acceptance. Subsequent reviewed integration and Full/Fast/Continue evidence accepted both environments in main; their stable runtime IDs are 61 and 62.

### Nearby coastal and forest margins

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 3 | East Izol | Mediterranean grass/plain mosaic, wooded pockets and one mountain cell; extend West Izol's coast and inland ground. | Environment accepted; corrected main build verified in Full and Fast |
| 4 | Alezhor | Cool summer-dry grassland and plain at Ibenwood's southern margin; localized woodland rather than regionwide deep forest. | Environment accepted; final bank 3/3, native 49267 Fast 101 +25 Continue, exit 0/errors [], repaired water/stream views accepted |
| 5 | South Ibenal | Summer-dry coastal plain; exposed shore and sheltered natural drainage beside the forest country. | Observed building with North in `azhora-game-ibenal`; raw base `116799e`, no frozen handoff |
| 6 | North Ibenal | Colder summer-dry coastal plain with one hill cell; transition from forest margin toward Oremindi. | Observed building with South in `azhora-game-ibenal`; not integrated or accepted |

### Northern Oremindi and the cape

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 7 | Henborth | Continental plains connecting Celder/Mithala to the mountain approaches; open habitats, restrained relief. | Queued |
| 8 | East Oremindi Mountains | High mountain spine and hill apron; wooded lower ground, tundra and ice according to mapped climate. | Queued |
| 9 | North Oreminidi Mountains | High northern spine with cold hill margins; varied ridges, passes and sheltered basins. | Queued |
| 10 | Lesser Oremindi Mountains | Lower mountain belt and limited hill ground; distinct footholds and connections below the high spine. | Queued |
| 11 | Cudon | Cold plains and hills with three mountain cells; a readable natural approach toward the cape. | Queued |
| 12 | Narcosh | Cool maritime highlands, mountains and four lake cells; lake basins and varied shore-to-upland journeys. | Queued |
| 13 | Cape Thalmagar | Cool maritime cape plains; complete natural environment and normal regional integration while preserving the separate fortress prototype. | Queued |

These builds preserve South Oremindi's campaign reserve, Inquest's cottage and West Oremindi's Sevron content. Cape Thalmagar's significance does not authorize adding a main-quest confrontation or changing its difficulty. The atlas does not support turning its entire plains footprint into alpine peaks.

### Acor wetland and forest country

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 14 | Acor Wetlands | Continental wetland basin; legible firm ground, shallow channels, vegetation and aquatic habitats. | Queued |
| 15 | West Acorwood | Continental forest/deep forest at the basin margin; preserve three authored ocean cells. | Queued |
| 16 | South Acordwood | Deep forest toward Mithala, with a continental-to-oceanic climate transition. | Queued |
| 17 | North Acorwood | Broad continental deep-forest core; uneven canopy, openings, deadwood and sheltered habitats. | Queued |
| 18 | East Acordwood | More maritime forest/deep forest toward Lond; distinguish its terrain and light from the northern core. | Queued |

Share drainage design across the basin and its edges before local scenery. Deep woodland must have traversable openings and wildlife in its interior, not just at the arrival clearing.

### Endevor plains

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 19 | South Endevor | Oceanic plains at the wetland and forest edge; water-shaped lower ground. | Queued |
| 20 | West Endevor | Western oceanic plains; restrained swells, exposure and natural grassland habitats. | Queued |
| 21 | North Endevor | Oceanic plains against Nothwood; a gradual woodland-margin transition. | Queued |
| 22 | East Endevor | Oceanic plains between Acorwood, Nothwood and Lond; distinct edge habitats without invented mountain relief. | Queued |

All four are mapped as plains with oceanic climate. Lore can inform gentle local folds; it must not replace the atlas with a hilly mountain country. Farming settlements remain a later pass.

### Lond

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 23 | South Lond | Oceanic grassland and plain at the Acorwood edge. | Queued |
| 24 | West Lond | Plain and grassland toward Noth Hills, with a small colder fringe. | Queued |
| 25 | Central Lond | Broad oceanic grassland core; open horizons and natural water/soil variation. | Queued |
| 26 | North Lond | Plains and grassland beneath Gorgi; colder margins with continuous mountain drainage. | Queued |
| 27 | East Lond | Plain and grassland at the Baldro/Ganun transition; colder edge habitats. | Queued |

### Ganun

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 28 | West Ganun | Broad oceanic western lowland; variation through channels, soil and grass cover. | Queued |
| 29 | North Ganun | Plains below Baldro; oceanic-to-cold continental transition. | Queued |
| 30 | East Ganun | Eastern oceanic plains beneath East Baldro, with a small colder fringe. | Queued |
| 31 | South Ganun | Southern oceanic lowland; complete the connected plain and its natural shore/drainage where mapped. | Queued |

### Northwestern woods and cold plains

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 32 | Nothwood | Mostly oceanic forest/deep forest; humid woodland, not automatic permanent snow because it is northern. | Queued |
| 33 | Noth Hills | Cold, dry-winter hill country; rounded exposed relief and sheltered hollows. | Queued |
| 34 | South Nonoth | Cold dry-winter plains at Nothwood's margin. | Queued |
| 35 | North Nonoth | Cold plains toward Orsa and Thoth; continuous habitat transitions. | Queued |
| 36 | South Thoth | Cold dry-winter plain beside Noth Hills and Gorgi. | Queued |
| 37 | Central Thoth | Cold plain below northern Gorgi; water and exposure distinguish it from the southern country. | Queued |
| 38 | North Thoth | Colder subarctic plains; weathered open ground and sheltered animal ranges. | Queued |
| 39 | South Orsa | Cold plains extending west from Nonoth; habitat follows moisture and exposure. | Queued |
| 40 | North Orsa | Colder northern plain; open country and appropriately sparse ecological structure. | Queued |

### Northern mountain margins

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 41 | West Gorgi Mountains | Predominantly hills with four mountain cells; cold broken relief rather than a continuous wall of giant peaks. | Queued |
| 42 | East Gorgi Mountains | Hills and mountain blocks; distinct valleys and connections toward neighboring plains. | Queued |
| 43 | North Gorgi Mountains | Hills, mountains and a smaller high-mountain core; varied summit hierarchy. | Queued |
| 44 | Orgmala | Cold mosaic of plains, hills, highland, forest, wetland, grassland and one high-mountain cell. | Queued |
| 45 | Eshtor Plateau | Cold hill-dominated upland; preserve mapped relief while giving the plateau a readable broad form. | Queued |

### Northeastern approaches

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 46 | South Riesov | Mixed-climate plain and hill skirt east of Baldro; preserve dwarven approaches. | Queued |
| 47 | North Riesov | Cold plains north of Baldro with one hill cell. | Queued |
| 48 | East Witherst | Cold plains facing Eshtor and Riesov; shore/exposure character follows the atlas. | Queued |
| 49 | West Witherst | Cold plains north of Gorgi; distinguish natural drainage and exposure from the eastern country. | Queued |

### Cold islands

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 50 | West Inseld | Continental island plains and grassland; natural coasts and inland habitats. | Queued |
| 51 | East Inseld | Continental island grassland; retain the actual relationship to West Inseld. | Queued |
| 52 | Cold Stones | Cold mountain and high-mountain island group; exposed rock, sheltered niches and marine life, not a uniform ice sheet. | Queued |

Wilhelm's established Inseld history does not authorize a new army or story encounter. Test landings through developer tools; no ferry implementation is required to accept these environments.

### Southern island extensions

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 53 | Aurumlis Archipeligo | Grass/hill islands with a real Mediterranean/hot-desert climate split across mapped cells. | Queued |
| 54 | Azhor Stones | Equatorial deep-forest islands; preserve forest cover despite older sparse-stone prose. | Queued |
| 55 | North Scythe | Equatorial deep jungle and deep forest; preserve the authored land connection to South Scythe. | Queued |
| 56 | South Scythe | Equatorial deep forest; connected southern counterpart with distinct local exposure and canopy. | Queued |

Do not cut an invented channel through the two shared Scythe hex edges. Record atlas/lore conflicts and keep environmental choices reversible; do not edit the source atlas or lore repository.

### Far southern jungle lands

All fifteen regions below are mapped as **deep jungle with equatorial rainforest climate**. Fourteen form one connected land cluster; Maanub is separate. No authored river edges were identified in that cluster during this audit. Local gullies, damp hollows and small natural drainage are possible builder proposals; major new rivers, lakes or biome conversions require an explicit design decision.

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 57 | Nuurat | Northern jungle coast; windward edge and sheltered inland canopy. | Queued |
| 58 | Haatrul | Narrow northern interior junction, with very limited coast. | Queued |
| 59 | Anubrul | Northeastern jungle promontory; exposure and interior contrast. | Queued |
| 60 | Maawad | Eastern and southeastern jungle coast. | Queued |
| 61 | Riwaad | Southern jungle rim; coastal canopy and sheltered interior. | Queued |
| 62 | Waahaat | Large landlocked jungle core; interior forest structure and connected animal paths. | Queued |
| 63 | Rihas | Northwestern jungle rim; transitions between the core and outer ground. | Queued |
| 64 | Qadwaaqaad | Southern coastal junction within the connected jungle lands. | Queued |
| 65 | Saxrul | Northwest-facing jungle coast. | Queued |
| 66 | Saxhan | Landlocked jungle connector; no invented seafront arrival. | Queued |
| 67 | Barqat | Western inland junction with a short shore. | Queued |
| 68 | Waahan | Northwestern jungle peninsula. | Queued |
| 69 | Qadmar | Western and southwestern jungle headland. | Queued |
| 70 | Sabrqad | Southern jungle headland. | Queued |
| 71 | Maanub | Isolated equatorial jungle island; independently validate ground and marine habitats. | Queued |

Dedicated lore is limited here. Natural-feature briefs should distinguish terrain microforms, canopy age/structure, ground cover, light and exposure within the shared biome. They must not manufacture fifteen cultures or force arbitrary color and species differences for novelty.

## Existing environment inventory

Every one of main's 60 registered regions appears below. R1–R11 refer to the review groups in the joint plan. These are **review assignments**, not new implementation statuses or exclusive authorship claims. Where a row has two groups, the overlap protects an interface affected by another review.

| Runtime ID | Exact atlas region | Review allocation |
| ---: | --- | --- |
| 1 | Drent | R11 |
| 2 | Luscia | R11 |
| 3 | Moros Plain | R11 |
| 4 | East Suval | R10; retain closed border |
| 5 | West Suval | R11 |
| 6 | Pueth | R10 |
| 7 | Peblos | R10 |
| 8 | West Izol | R10; East Izol seam |
| 9 | Elagos | R10 |
| 10 | Amod | R1; existing west-country coverage |
| 11 | Vastos | R1 and R10 |
| 12 | Meneth | R10 |
| 13 | Caricas | R10 |
| 14 | Nesdor | R10 |
| 15 | Eer | R10; Nylon interfaces |
| 16 | Isareos | R10; Minora and centaur route |
| 17 | Nethereum | R10 |
| 18 | South Suval | R10; vigilante flight and cave |
| 19 | Iscare Archipeligo | Shared regression and island neighbors |
| 20 | East Lotharn Mountains | R1 |
| 21 | Feradom | R2 |
| 22 | Gala | R9 |
| 23 | Northern Ascarth | R9 |
| 24 | Southern Ascarth | R9; Aevis interfaces |
| 25 | Ovesos | R9 |
| 26 | Oves Desert | R9 and R4 seam |
| 27 | West Lotharn Mountains | R1 and R2 |
| 28 | South Mithala | R8 |
| 29 | West Mithala | R8 |
| 30 | East Mithala | R8 |
| 31 | North Mithala | R8 |
| 32 | East Ibenwood | Shared regression; defended belt and forest neighbors |
| 33 | North Ibenwood | Shared regression; Ibenal and Oremindi interfaces |
| 34 | South Ibenwood | Shared regression; Alezhor and Navarth interfaces |
| 35 | West Ibenwood | Shared regression; Ibenal interfaces |
| 36 | Central Ibenwood | Shared regression; forest ecology and protected trees |
| 37 | South Oremindi Mountains | Shared regression; Celder/Oremindi and cottage interfaces |
| 38 | Yunethre | Shared regression; Celder and centaur/free-town routes |
| 39 | Navarth | R4 |
| 40 | West Pyros | R4 |
| 41 | Ganesh Desert | R4 |
| 42 | Ganesh Plain | R4 |
| 43 | North Meroshe Desert | R5 |
| 44 | West Meroshe Desert | R5 |
| 45 | Central Meroshe Desert | R5 |
| 46 | South Meroshe Desert | R5 |
| 47 | Cape Heth | R6 |
| 48 | Dinelv Highlands | R6 |
| 49 | Hama | R6 |
| 50 | Marosh | R7 |
| 51 | Trogo | R7 |
| 52 | West Baldro Mountains | Shared regression; new northern neighbors and dwarf access |
| 53 | East Baldro Mountains | Shared regression; Riesov/Ganun and dwarf access |
| 54 | Selemi | R9; display name Selemis |
| 55 | Telemonia | R3 |
| 56 | West Oremindi Mountains | Shared regression; new northern range and Sevron access |
| 57 | East Pyros | Shared regression; R3/R4 border corrections |
| 58 | Nether Desert | Shared regression; R4 borders |
| 59 | Legemum | Shared regression; R3 Treloss and shore |
| 60 | Babon | Shared regression; jungle and island loading |

The first 45 assigned to R groups receive explicit backlog/coverage review. The remaining 15 receive shared-system and geographic-interface review. If current testing confirms an environment gap, record a bounded finishing task; do not automatically rebuild an already implemented region or dismiss the gap because its status says early/built.

## Live handoff record

Updated 4 October 2026. Claude independently completed and froze the Celder pair after the user's confirmation that it was underway. No second Celder worker has been started. Repository handoff documents are the coordination mechanism; no direct Claude-control connection has been established.

| Field | Current execution snapshot |
| --- | --- |
| Main revision audited | `a2e49c3` |
| Unrelated local work | Developer-dragon fire/destruction and its tests; preserve separately. |
| Known regional delivery | Four new environments accepted: the Celder pair, corrected East Izol and corrected Alezhor. No frozen delivery is currently awaiting acceptance. |
| Claude connection | Independent Claude session; Celder delivery received through its clean checkout and handoff report. |
| Current Claude build | East Izol is frozen at `fdc1707`. Alezhor is frozen clean at `116799e`, following build `c042e86` and handoff `67719d9`; its corrected environment is now accepted in main. Read-only recheck finds South/North Ibenal building together in `../azhora-game-ibenal`, branch `ibenal` at raw `116799e`, with dirty source and provisional IDs 65/66. No Ibenal handoff/frozen commit exists yet; this was observed, not assigned by this coordinator. |
| ChatGPT active assignment | Both Celders, East Izol and Alezhor accepted. East Fast 93 +20 and Full 90 +19, Continue and fresh views pass. Alezhor earlier Fast 101 +25 and Full 102 +24, including Continue, pass. Final bank 3/3 and native 49267 Fast 101 +25 Continue pass, exit 0/errors []; repaired river-edge/upstream-stream views are visually accepted. R4 ghubr shelters and Navarth 25/25 runtime response pass; the Navarth approach screenshot is modal-obscured. R7 ordinary-input out/back travel passes. R1 native 6254 passes 40 +9 with exit 0; final overlook 73887 exits 0/errors [] and visually accepts the bounded shoulder/route-join correction. Wider R1 aesthetics and the Upper Olveth connection remain open. The two R8 blade-seating views are visually accepted for that scoped correction. |
| New accepted regions under this plan | South Celder, North Celder, East Izol and Alezhor (4), accepted 4 October after their scoped corrections, final Full/Fast/Continue evidence and visual inspection. |
| New deliveries awaiting review under this plan | None (0). The two Ibenals are active drafts, not completed deliveries; do not merge or count them as accepted. Their frozen delta must use the corrected shared base supplied by root. |
| Native Electron test slot | Owned by ChatGPT: Alezhor Full 20056 completed 102 +24 and Fast 51619 completed 101 +25, both exit 0. Alezhor bank correction and both repaired views are accepted; final native 49267 passes Fast 101 +25 Continue, exit 0/errors []. Combined R1/Mithala session 6254 completed 40 +9, explicit exit 0 and errors []; both R8 seating views were inspected. R1 clear elevated inspection 73887 exits 0/errors []; its overlook visually accepts the bounded shoulder/route-join correction. Earlier north/side frames were insufficient. R4 habitats session 77116 verified all ghubr shelters but failed the Navarth body-camera view. East Full 41822 completed 90 +19 checks, exit 0; its post-report GPU teardown diagnostic is recorded separately from runtime errors []. |

| Assignment | Regions | Base / delivery | State | Next action |
| --- | --- | --- | --- | --- |
| Celder | South Celder; North Celder | Frozen `136b582` + `29ca691`, reviewed corrections mirrored to main | Environment accepted | Combined scene/controller6/6, seven native views, Full198 +30 and final Fast216 +32 pass. Real swimming, normal stamina, production harvest and exact Continue restore verified. |
| R1 first corrections | East Lotharn Mountains; Varn in Amod | `a2e49c3` -> `bd01a17`; mirrored into main working copy | Functional batch verified; whole R1 still open | Final central-north shoulder/join candidate passes 10/10, preserves existing tree identities and Varn barriers, and is mirrored to main with four registered tests. Native 6254 passes 40 +9, exit 0/errors []; the clear elevated overlook from 73887 (exit 0/errors []) visually accepts the bounded pilot and route join. Neighboring cliff repetition and the Upper Olveth connection remain open. |
| Inventory coverage | All 131 atlas names | `bd01a17`, mirrored into main | Implemented; focused and combined checks passed | Inventory repaired; no new regions marked built. |
| East Izol | East Izol | Clean `fdc1707`, corrected packet mirrored through 39 narrow shared edits | Environment accepted | Fast 93 +20 and Full 90 +19, explicit exit 0; three real W out/back legs, production partial harvest and exact Continue restore; 182-tree/41-ambient catalog retained. Root inspected all eight landscape/wildlife/contact views. Coarse cliff style and the post-report Full GPU teardown diagnostic remain documented. |
| Alezhor | Alezhor | Frozen raw `116799e`; corrected lattice, river, bank and scenery packets mirrored to main | Environment accepted | Final bank 3/3; native 49267 Fast 101 +25 Continue, exit 0/errors []; prior Full 102 +24. Corrected otter/stream views accepted. Plain teal water and angular cliff style remain limitations. |
| R2 corrections | West Lotharn Mountains; Feradom | Review worktree after `13448f7`; mirrored into main | Functional correction verified; native stream verified | River-only fine mesh passes 5/5 and native valley now shows continuous water. Preserve 3,178 seeded trees and the existing ascent/descent checks. Repetitive cliff tiers remain a visual limitation. |
| R3 corrections | Telemonia | Review worktree after `13448f7`; mirrored into main | Functional/native correction verified; landscape tiers remain a limitation | Grounding/cooperative scenery 3/3, loader 8/8, regional 19/19, ordinary-input native 25/25 and five views assessed. Town construction now yields: native maximum step 10.1 ms versus 1,142.4 ms earlier; geometry unchanged. |
| R4 corrections | Navarth; West Pyros; Ganesh Desert; Ganesh Plain | Review worktree after `13448f7`; mirrored into main | Functional batch verified; native views assessed | Native 77116 verifies all ghubr shelters; Navarth 48567 passes 25/25 ordinary movement/response checks. The response PNG is clear, but the approach PNG is covered by the Carpentry modal and is not visually accepted. Preserve verified 170 trees and bounded seams. |
| R5 corrections | Four Meroshe deserts | Review worktree after `13448f7`; mirrored into main | Functional correction verified; native assessed | All 1,973 fan cobbles/shore shingle contact actual ground; seeded non-Y geometry retained. Updated fan and reg frames are readable. |
| R6 corrections | Cape Heth; Dinelv Highlands; Hama | Review worktree after `13448f7`; mirrored into main | Functional corrections verified; final native views assessed | Six seams and actual controller 4/4; 49 rooted trees. Lower-face contact repair covers 6,657 stones, combined 15/15. White terrain facets traced to shared Telemonia cistern material and corrected separately. |
| R7 corrections | Marosh; Trogo | Review worktree after `13448f7`; mirrored into main | Functional corrections and representative native route verified | 4,503 trees registered/rooted; animal footing and two accidental dry seams corrected. Node recommended inner-bank route passes 434.6 m. Native session 2863 separately walked 217.5 m outward and 217.2 m back with no falls, water or damage. Whole-region, Marosh habitat and remaining visual gates stay open. |
| R8 corrections | Four Mithala regions | Review worktree after `13448f7`; mirrored into main | Functional corrections verified; final native views assessed | 267 trees/48 residents, regional 14/14. Follow-up 4/4 seats 3,187 forb clumps and 43 stones on actual drawn ground. West Lotharn shared-ground extraction closes Fast border dependency. Latest blade seating passes 5/5 with all 31,007 tufts grounded; its three-file packet is mirrored. Both corrected dry-summer views from native 6254 are visually accepted for the scoped Y-contact repair, without a new water/density claim. |
| R9 corrections | Selemi; Gala; Northern/Southern Ascarth; Ovesos; Oves Desert | Review worktree after `13448f7`; mirrored into main | Functional/native corrections verified | Final scoped 7/7 preserves 1,197 trees and 98 residents. Shared Telemonia ground readiness/reuse passes. Selemis wrack now forms thin broken ribbons; native recapture assessed. Both earlier bone-bird stand-ins resolved. |
| R10 review | Remaining western neighbors and Suval interfaces | Review worktree after `13448f7`; verified packets mirrored into main | Functional corrections verified; combined native check passed | West Izol seams and five walking paths pass. Shared West Lotharn ground loads before its neighbors. Three bounded dry-seam corrections pass 6/6 pure, 6/6 real-controller crossings, 8/8 scene/identity checks. Original trees and wildlife homes remain exact. |
| R11 review | Drent; Luscia; Moros Plain; West Suval | Review worktree after `13448f7`; verified packets mirrored into main | Functional corrections verified; native wildlife views assessed | All 3,597 original trees and 141 original animal home/species/scale records preserved. Eleven new residents cover six sparse Luscia/Moros bands. Woodland 5/5 and final wildlife 5/5 pass; visible footing, actual retreat/return and hawk flight verified. |

The R1 corrections are not acceptance of the complete R1 group. Pass-fort regression and Full/Fast travel now pass; broader repetitive cliffs remain a documented aesthetic limitation. Later queue items remain open rather than being silently certified by shared tests. Keep individual-region acceptance visible when a pair shares a report. Update this ledger after each accepted batch and at shutdown.

The [R1 report](region-reviews/r1-lotharn-review.md) records final code, native captures,
movement and actual rendered-ground evidence. Main's 25 unrelated dragon files were checked
byte-for-byte before and after integration; its existing test entries were preserved. The
combined checkout passed 38 focused checks across five files. No push was performed and main
HEAD remains `a2e49c3`, with the integrated working changes ready for the next desktop launch.

## Delivery recheck, 4 October 2026

Read-only inspection confirms clean, unchanged deliveries at Celder `136b582`,
East Izol `fdc1707`, and Alezhor `116799e`. The fourth relevant checkout,
`../azhora-game-ibenal`, is building the connected South/North pair on raw
Alezhor `116799e`: 16 modified tracked files and ten new brief/source/test files
were observed, with no frozen Ibenal handoff. Its draft brief describes its own
coordinating session and provisional IDs 65/66; this report does not issue that
assignment or substitute a South-only build. Main remains at 64 integrated
regions; the 67 outside main include these two active drafts.

Review that evolving delta read-only now; defer intake/integration until a frozen
handoff is available. The raw base lacks the corrected stable terrain lattice,
combined forest/Alezhor ground job, exact ribbon-water query, and current bank
contact repair. South Ibenal's draft reads Alezhor's live incoming ground along
their three edges. Preserve the final evaluated west-stream stations, levels,
Float32 ribbon and retained terrain, not merely unchanged stream controls.
Compose the eventual narrow delta onto the coordinator's corrected base, then
prove existing neighbor identities and both load orders. The
[prepared interface brief](region-briefs/south-ibenal-environment.md) now records
these integration requirements without replacing the observed pair assignment.

## Inventory caveats to carry into implementation

- `buildStatusList()` exposed 73 entries at the planning baseline. The review branch now uses the complete 131-entry atlas level table; existing access restrictions and runtime IDs are unchanged.
- Some existing build-status prose still says neighboring regions are absent even though they are integrated. Refresh descriptions when those regions are reviewed, using current source and observed behavior.
- Access restrictions are not absence of terrain: East Suval and Feradom already have substantive environments.
- Generic outland visible beyond a border is not a completed regional environment.
- Earlier documents saying 27 built and 104 remaining are historical. This ledger's current snapshot is 64 integrated, with four newly accepted environments, none delivered outside main, and 67 other builds (including two active Ibenal drafts). The original inventory table records IDs 1-60 at the planning baseline; Celders61/62, East Izol63 and Alezhor64 are recorded in the delivery queue.
- At the next session, recompute the set difference before starting. Another Claude session may have finished Celder or other work overnight; keep its work and remove duplication from the queue.

The original planning pass changed no game code. The 4 October execution updates record the first verified functional batch in the review branch and main working copy. They do not certify unreviewed environments or alter the Claude checkout or user saves.
