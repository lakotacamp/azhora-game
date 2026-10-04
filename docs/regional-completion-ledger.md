# Regional terrain and wildlife completion ledger

Inventory prepared 3 October 2026 against main `a2e49c3` and the existing Celder worktree. This is the companion to the [joint implementation and review plan](regional-completion-joint-plan.md). **Implementation authorized 4 October 2026.** The user confirmed Claude is actively building both Celders; ChatGPT has begun R1 in a separate review worktree. Queued rows remain unstarted.

## Inventory totals

| Category | Regions |
| --- | ---: |
| Authored atlas | 131 |
| Registered in main with existing environment content | 60 |
| Outside main, delivered by Claude and awaiting review | 2 |
| Other new or partial environment builds | 69 |
| Total remaining outside main | 71 |

The 69 includes Cape Thalmagar's partial prototype. Existing environments require the review below; none receives a new acceptance certificate merely from registration. Numeric IDs in the existing inventory are current runtime IDs. Unbuilt regions receive IDs at integration, not from their queue number. Preserve exact atlas spellings.

## Claude build order

The numbered rows establish the default order. A geographic stage is not a single giant delivery: hand off one country at a time, or a specifically agreed connected pair. Complete Celder from its existing checkout first. East Izol is a relatively bounded next assignment while ChatGPT works through its review backlog.

After Celder, this order fills nearby gaps, develops the northern Oremindi approach, expands through the Acor and northern mainland countries, then reaches the cold seas and far south. An adjacent region's changed terrain must be reconciled before final acceptance. When the immediate next task depends on a disputed seam, ChatGPT can assign the next independent row and record why.

Terrain descriptions below are **atlas constraints and proposed natural emphasis**, not new cultural canon or finalized species lists. Claude must still prepare a short terrain/habitat brief before each build. Climate terms describe habitat; they do not authorize implementing seasonal survival systems.

### Existing Celder work

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 1 | South Celder | Continental open plain, low swells, mountain-facing margins and stream terraces; join West Lotharn, Yunethre, Oremindi and Mithala. | Ready for review |
| 2 | North Celder | Continental plains and eastern grassland; cold running border streams and gentle west-to-east relief continuous with South Celder. | Ready for review |

Both are in `../azhora-game-celder`, branch `celder`, based on `a2e49c3`. Claude delivered a clean two-region handoff at `136b582` on 4 October, including build `e7012d9`. Provisional IDs are 61 and 62. Preserve this delivery while the existing review backlog is corrected; intake does not grant acceptance or merge it into the desktop build.

### Nearby coastal and forest margins

| Queue | Exact atlas region | Environment direction | State |
| ---: | --- | --- | --- |
| 3 | East Izol | Mediterranean grass/plain mosaic, wooded pockets and one mountain cell; extend West Izol's coast and inland ground. | Queued |
| 4 | Alezhor | Cool summer-dry grassland and plain at Ibenwood's southern margin; localized woodland rather than regionwide deep forest. | Queued |
| 5 | South Ibenal | Summer-dry coastal plain; exposed shore and sheltered natural drainage beside the forest country. | Queued |
| 6 | North Ibenal | Colder summer-dry coastal plain with one hill cell; transition from forest margin toward Oremindi. | Queued |

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
| Known regional delivery | Celder pair in `../azhora-game-celder`, clean `136b582`; intake recorded, acceptance pending. |
| Claude connection | Independent Claude session; Celder delivery received through its clean checkout and handoff report. |
| Next Claude action | East Izol brief is ready; pin its assignment base/worktree before starting. No next worker has been launched from this session. |
| ChatGPT active assignment | R1 East Lotharn/Varn on `codex/region-review-2026-10-04` in `../azhora-game-region-review`, base `a2e49c3`. Celder owns its West Lotharn seam edits. |
| New accepted regions under this plan | None |
| New deliveries awaiting review under this plan | South Celder and North Celder, one frozen pair. |
| Native Electron test slot | Baseline capture completed in `../azhora-game-land`; release after each launch. Do not run concurrent native captures. |

| Assignment | Regions | Base / delivery | State | Next action |
| --- | --- | --- | --- | --- |
| Celder | South Celder; North Celder | `a2e49c3` -> `136b582`; clean `celder` worktree | Ready for review; intake only | Preserve frozen pair, reconcile its West Lotharn interface during R2; acceptance follows backlog. |
| R1 first corrections | East Lotharn Mountains; Varn in Amod | `a2e49c3`; active review branch | Correcting and validating | Restore two cave approaches without bypasses; verify woodland additions and tree identities; then complete the wider landscape review. |
| Inventory coverage | All 131 atlas names | Active review branch | Implemented; four focused checks passed | Integrate with R1 after combined validation; no new regions marked built. |
| East Izol brief | East Izol | Next bounded Claude assignment | Brief preparation only | Ready after Celder handoff; implementation has not started. |

The R1 corrections are not acceptance of the complete R1 group. Wider skyline changes, pass-fort regression, Full/Fast travel and the subsequent R2–R11 review remain outstanding. Keep individual-region acceptance visible when a pair shares a report. Update this ledger after each accepted batch and at shutdown.

## Inventory caveats to carry into implementation

- `buildStatusList()` exposed 73 entries at the planning baseline. The review branch now uses the complete 131-entry atlas level table; existing access restrictions and runtime IDs are unchanged.
- Some existing build-status prose still says neighboring regions are absent even though they are integrated. Refresh descriptions when those regions are reviewed, using current source and observed behavior.
- Access restrictions are not absence of terrain: East Suval and Feradom already have substantive environments.
- Generic outland visible beyond a border is not a completed regional environment.
- Earlier documents saying 27 built and 104 remaining are historical. This ledger's snapshot is 60 integrated plus 2 delivered but not accepted plus 69 other builds.
- At the next session, recompute the set difference before starting. Another Claude session may have finished Celder or other work overnight; keep its work and remove duplication from the queue.

The original planning pass changed no game code. The 4 October execution updates record code under review in the isolated worktree; they do not certify unreviewed environments or alter the Claude checkout or user saves.
