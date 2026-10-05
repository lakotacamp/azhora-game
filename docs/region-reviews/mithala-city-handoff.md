# Mithala city handoff

Not a queue row: the user's own request of 4 October 2026, made after the Henborth delivery, during the pause on new
regions. It builds no region. It trades four hexes among the four Mithalas and builds the city of Mithala where all four
meet. The design and the measured site are in [`docs/mithala-city-brief.md`](../mithala-city-brief.md); the user's
answers are in `docs/design-answers.md` ("2026-10-04: The city of Mithala").

## Revision

| | |
| --- | --- |
| Base | `b5ff29a`, the Henborth delivery (on Ibenal, Alezhor, East Izol, Celder and `a2e49c3`) |
| Delivered | branch `mithala-city`: `3bef366` (the hex trade), `18e8636` (the pure layout), `01a64d6` (the water gate and the scenery interface), then the build and this report |

## Scope

**The trade** is a third game atlas correction, `mithala-city-quarters-v1` in `src/game-atlas-adjustments.js`: North
Mithala's 9,86 and 10,86 go to East Mithala, East Mithala's 5,88 and 6,88 go to North Mithala. It is not a World Builder
edit, because `tests/developer-atlas.test.js` holds every checkout's export to the authored map's sha256, and editing the
map would turn every game checkout red until each re-exported. If the user wants the World Builder map itself to show
the trade, it can be made there after this merges, and the correction then retires. Hexes per region are unchanged; the
Mithala's internal edges go from 49 to 47, and East and West Mithala now meet on one edge only, inside the city.

**The city** (the user's decisions, every recommendation taken): Mithala, the Cref king's old seat; four districts on the
four hexes round the meeting of the arms (the Fork in West Mithala, walled in grey Lotharn stone; the Braid Bank in North
Mithala; the Quays in East Mithala; the Ford in South Mithala), each on raised ground behind an earth flood bank; dark
brick, pale timber and reed thatch; a climbable sky tower of about 40 m; gates open; the king's hall shut; nobody in it
yet. People are stage 2.

**Lore**: a section on the city was added in place to `world-builder/azhora_lore/geography/regions/mithala.md`, uncommitted
there (the "Under the Alliance" section already in that file is another author's).
