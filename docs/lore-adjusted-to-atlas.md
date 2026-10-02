# The lore, adjusted to the atlas — proposed, not applied

> **Nothing in `world-builder` has been changed.** The edits below were to be made in place
> and left uncommitted in `C:\Users\Michael\Programs\typescript\world-builder`, branch
> `whole-world-simulation`, under `azhora_lore\geography\regions\`. **The write was refused:**
> this agent is isolated in its git worktree and the tool declines any edit outside it —
> *"This agent is isolated in the worktree … Edit the worktree copy of this file instead of
> the shared-checkout path."* The coordinator's instruction in that case was to stop and say
> so rather than work around it, so no workaround was attempted and no file in that
> repository has been opened for writing.
>
> What follows is therefore the change **ready to apply**, claim by claim, in the form the
> coordinator asked for: *was / now / the atlas fact that forced it*. Whoever can write to
> that repository can apply it from this document without re-deriving anything.

The rule being applied is the user's, 2026-09-21: **"Favor the atlas over what the lore says.
Adjust what the lore says to fit the atlas."**

## What the atlas actually says, in one place

These are the facts every row below cites. They come from
`world-builder/map/resources/examples/azhora.wwmap` (per-hex `region`, `terrain`, `climate`,
and the river edges) and from `assets/azhora-dev-regions.json`, which is its export.

* The climate field is `koppen-v1`, nineteen codes in use across the continent. **`BWh`, true
  hot desert, exists and is used 245 times** — so `BSh` on a desert is a choice, not a
  shrug.
* The terrain field has **`lake` (28 hexes, five in Elagos)** and **`wetland` (28 hexes,
  twenty-five in the Acor Wetlands)** and `forest` and `deep_forest`. The map can say lake,
  marsh and wood, and says all three elsewhere.
* Per region: Isareos grassland 25 / plains 6, all `Cfa`, **no unclaimed (sea) edge at all**.
  Nethereum grassland 26 / plains 1, all `Cfa`. Ovesos grassland 8 / plains 11, all `BSh`.
  Oves Desert plains 20 / hills 3, all `BSh`. Gala plains 19 / grassland 2; `BSh` × 12
  (northern three rows), `Csb` × 7, `Csa` × 2 (the southern row, on the sea). Eer plains 12 /
  grassland 13; `Cfa` × 11 (inland, north-west), `Csa` × 14 (coastal, south-east).
* **None of the six has a `forest`, `lake` or `wetland` hex.**
* The Lizeem runs on the border of all six in turn. Ovesos shares **no dry hex edge** with
  Caricas or Nesdor; Gala shares none with Nesdor or Eer. The Oves Desert shares **no border
  of any kind with Caricas**.

---

## `isareos.md` — the largest change: the coast is gone

Isareos is landlocked on the atlas. Thirty-one hexes, every neighbouring hex claimed by
another region, no sea anywhere. The file is written as a coastal territory throughout, so
the geography, economy and community sections are rewritten; the name puzzle, the Ambronite
history, the social form and the language section survive with their claims re-pointed.

| was | now | the atlas fact |
|---|---|---|
| "The coastal territory on the eastern Iberos Sea margin — south of the Elagosi lake country, north of the main Iberos commercial zone" | Inland grass country west of the Lizeem's head, between the lake country's approaches and the Ibenwood, north of the Neth | 31 hexes, 0 unclaimed edges; neighbours Caricas, Meneth, Yunethre, West Lotharn, North and East Ibenwood, Nethereum |
| "The coastline of Isareos is the dominant geographic fact" … dozens of bays and inlets, gravel bars, pilotage | Cut. The dominant geographic fact is the grass: low hills of it from the Lizeem's head west to the forest edge | no coast |
| "The Isareos Promontories — the sequence of low headlands … modest, forested, rising perhaps a hundred feet" | The Isareos shoulders: the same modest hundred-foot rises, inland, and **grass to the top** rather than forested | grassland 25, plains 6, `forest` 0 |
| "Low hills … covered in mixed deciduous and scrub forest" | Low hills under deep humid grass, with thorn in the hollows and a narrow gallery of alder and willow on the water | `forest` 0 in a map that uses `forest` two hexes west in the Ibenwood |
| "The sea is where Isareos's productive relationship with its environment is clearest" … the inshore fishery, flat-bottom fish, migratory shoals, shellfish | The stock is: cattle and sheep on grass that never dries out, and the hides and cheese that come off them | no coast, `Cfa` (rain all year) |
| "The Isareos economy is organized around the small vessel and the coastal route" | Organised around the drove road and the river crossing: Isareos is the ground a traveller must cross to reach the inner branch country from the lake country | the one dry land bridge into the whole south-west runs through Isareos |
| "The Iberos coastal trade … uses Isareos's inlets as its rest-and-resupply network" | The overland traffic between the lake country and the branch countries uses Isareos's valley heads the same way, for the same reason: they are where the water is fordable | the Lizeem's head and the Isa are fordable in Isareos and nowhere below it |
| "the route-communities and the pure fishing communities" | the route-communities and the pure grazing communities — the same social division, on the same argument | follows |
| "The individual bay communities of Isareos are the fundamental social unit … each inlet is a community" | The individual valley communities are the fundamental social unit — each valley head is a community | no bays |
| "**Isamouth** — the largest of the Isareos settlements, at the mouth of the small Isa river" | Isamouth stands where **the Isa** joins the Lizeem, at the region's south-eastern corner. The Isa is the river that runs the whole Isareos–Nethereum border, from the western uplands east to the great river | the atlas draws exactly one river there, medium, (-2800, 87) → (-2250, 231), and the lore names exactly one river in Isareos |
| "the specific vocabulary for sea states and wind directions", "The Isareos pilot vocabulary … bar depths at different tidal states" | The ford vocabulary: the specialist terms for the crossings, the height of the water at each, and the conditions that make a ford passable or deadly. Everything the section says about the vocabulary — that it is the primary technical language, that it expands with every season of fieldwork, that a scholar who was there one season has one season of it — survives word for word | no tides; the fords are real and are the country's business |
| "a coastal-substrate naming layer that appears in other eastern Iberos place names" | an older naming layer that appears in other western-interior place names | no coast |
| "periods when Ambron maintained a naval presence on the eastern coast" | periods when Ambron could keep a garrison on the far side of the Lizeem's head | no coast; the Lizeem is the only approach |

**One judgement call in that table, flagged for the user:** the Isa. The lore names the river
and the atlas draws a river there and names nothing. Identifying the two is a derivation from
the lore rather than an invention, and it is the single tidiest way to keep Isamouth. If the
user would rather the Isa stayed a coastal river and the border river stayed nameless, that
row comes out and nothing else in the table changes.

## `nethereum.md` — the Nethermere stops being a lake

The heaviest finding of the job and the one the coordinator has put to the user. Nethereum is
twenty-six `grassland` hexes and one `plains` in a map that has `lake` and `wetland` and uses
both elsewhere. **The proposal does not delete the flood.** It makes the Nethermere a
seasonally flooded meadow rather than a body of standing water — a shallow sheet over grass
for some weeks each spring, and grass for the rest of the year. That is `grassland` honestly,
it keeps the Nethrani, the Flood Council, the Flood Recall, the post-flood pasture and the
cattle intact, and it costs the file the things that need water all year.

| was | now | the atlas fact |
|---|---|---|
| "the Nethermere: a body of standing water that in dry years is a large shallow lake with productive margins and in flood years is a flat inland sea" | the Nethermere: a shallow sheet of water that spreads across the basin's grass each spring and is gone by midsummer, leaving the richest pasture in the inner branch country. In a dry year it barely forms; in a flood year it covers the basin to the ridgelines and stays into summer | `lake` 0, `wetland` 0, `grassland` 26 |
| "In a dry year it is a lake of three to four miles across, with marshland extending well beyond it" | In a dry year the water lies only in the lowest threads and the basin is grazed from spring | as above |
| **Fishery**: "The Nethermere supports a large population of river fish … extensive weir and trap systems … quantities of preserved fish … travel as far as Minora and occasionally Nylon. The fish trade is the Nethrani's most commercially reliable export" | The Neth itself carries the fish, and the weirs are on the river rather than at the basin's outlets. The trade is smaller than the file claimed and is not the country's first export; the **cattle** are | a river has fish; a grassland hex has no fishery |
| **Reed-grain**: "in the shallower margins of the Nethermere, the Nethrani cultivate … a variety of marsh grain … grows in standing water of up to a foot, harvested by wading" | Cut. In its place: the basin's spring-flooded ground is sown to oats as soon as it is walkable, and the crop that makes the Nethrani distinctive is **hay** — two cuts off the flood meadow where their neighbours get one | no standing water to grow it in |
| **Reed and marsh goods**: "the tall marsh reeds used for thatch, basketry, rope fiber … several Nethrani communities specialize in them almost entirely" | Rush and sedge from the wet threads, enough for thatch and basketry and not enough to specialise in; the communities that did now deal in hay and hides | `wetland` 0 |
| **Cattle**: "a compact, short-legged breed adapted to wet ground … moved onto this post-flood pasture as soon as the footing is reliable" | Unchanged, and promoted: it is now the country's principal living | still true of a flood meadow |
| "the Nethermere is not the same body of water from year to year … the line between 'lake' and 'flooded plain' does not exist in the Nethermere as a fixed thing" | Kept almost whole: the line between *meadow* and *flooded plain* does not exist as a fixed thing, and the Nethrani have mapped every foot of the gradient | the atlas is silent on relief, so the basin itself stands |
| "The climate is wetter than Ovesos and much wetter than the main Mithala plain" | Unchanged — and now understated. Nethereum is `Cfa`, Ovesos is `BSh` | `Cfa` × 27 against `BSh` × 19 |
| the Flood, the Flood Council, the Flood Recall, *nethvel*, *haethoss*, *nethoss*, the Drying Festival | **All kept.** A meadow that floods every spring and drowns people who misjudge it carries every one of them | nothing in the atlas touches them |

## `ovesos.md` — the valley is a steppe

`BSh` over all nineteen hexes. The file says "temperate and wet". This is the one the first
draft of `docs/six-regions-brief.md` decided the other way and the user reversed.

| was | now | the atlas fact |
|---|---|---|
| "The climate is temperate and wet, sharing the Mittolo character without the main plain's scale. Winters are cold, short-summer, with spring floods" | Hot and dry: long burning summers, short mild winters, and rain that comes in a few weeks and then does not come again. The Oveth's rise is snow and hill-rain off the upland, not a wet season | `BSh` × 19 |
| "orchards on the gentle slopes above the floodline" ; "**The apples of the Sorten** — dense, acid, long-keeping … have a commercial reputation that has traveled further than Ovesos itself" ; the pears and the winter drink | Cut. In their place: the Sorten's irrigated bottomland grain — barley and hard wheat, watered off the Oveth by channel — and above it nothing but grass. What has travelled further than Ovesos itself is its **wool** | apples do not keep in a hot steppe; the lore already gives the river as "substantial enough for irrigation" |
| "a valley microclimate that produces fruit at a latitude where the main plain cannot" | a valley microclimate that produces grain where the country either side of it produces only grass | as above |
| "The Galans have been buying them long enough to know the specific character of trees grown from the valley's mineral-heavy, slightly damp soil" | The Galans have been buying Ovesian wool and hides long enough to know the specific character of a fleece grown on the Sorten's grass | follows |
| "Livestock on the upland ridges … provide wool, meat, and the secondary agricultural economy the valley bottomland cannot accommodate" | Livestock **is** the economy; the irrigated bottomland is the part that cannot accommodate more of it. The upland herders' seasonal round and their separate dialect are unchanged, and their standing in the kingdom is raised to match | `BSh`; grassland north, plains south |
| "The upper Oveth's gradient drives mills — grain mills and fulling mills" | **Kept.** A river with gradient drives a mill whatever the rainfall, and a fulling mill is a wool country's mill | nothing in the atlas touches it |
| the Water Council, water-right seniority, *osk-milis*, the Middle Reach dispute, King Melos, the Nescor wars | **All kept**, and every one of them is stronger: water rights are the whole of politics in a steppe | nothing in the atlas touches them |

## `oves_desert.md` — the rain shadow is the Pyros divide, and Caricas is six hundred metres away

| was | now | the atlas fact |
|---|---|---|
| "The boundary with Caricas to the east is the most contested. The eastern margin of the Oves Desert coincides — approximately — with the western bank of the Carica River's upper drainage" | The contested boundary is with **Ovesos to the north-east**, where the desert margin and the Sorten's grazing land overlap, and with **Telemonia to the south** | the Oves Desert's neighbours are Ovesos (13 edges), the Nether Desert (8), Telemonia (12), East Pyros (5) and Gala (2). It shares **no** border with Caricas |
| "the Carican Voice" as the opposing party throughout the water-rights and seasonal-use sections; "the Carican corridor communities … not primarily grazing but woodland management and the protection of the vel-caric corridor" | The **Telemon bands** in the same role: their presence on the desert margin does not depend on the annual grass either, because their business there is the routes and not the grazing | as above |
| "the hills separating the Oveth basin from the main Lizeem system run roughly north to south … the Oveth-facing eastern slope receives the air that has already lost its moisture" | The hills along the desert's own north-western rim, behind which lies East Pyros — itself in the rain shadow of the Pyros divide. The Oves lies in the far tail of the same shadow | the 3 `hills` hexes are on the north-west rim, at x -2400…-2500; East Pyros is the neighbour beyond them |
| "it is not large, it is not particularly severe … the word 'desert' seem[s] like an overstatement" | **Kept, and confirmed.** The map codes it `BSh`, hot steppe, in a vocabulary that has `BWh` for true desert and uses it 245 times elsewhere | `BSh` × 23 |
| "In wet years … annual grasses and forbs … germinate in large numbers" ; the drought-tolerant tail of the inner-branch flora | **Kept.** Steppe is exactly what that describes | `BSh` |

## `gala.md` — the compass turns, and the country is a climate gradient

| was | now | the atlas fact |
|---|---|---|
| "the coastal plain that lies between the rocky base of the Ascarth Peninsula to the north and the river's broad delta to the east" | between the dry interior to the **north** — Ovesos's plains and the Oves Desert beyond them — and the Lizeem to the **east**, with the Ascarth foothills coming in from the **south-east** | Gala's northern neighbours are Ovesos and the Oves Desert; Northern Ascarth is on 8 edges to the south-east |
| "The region of Gala runs roughly thirty miles along the coast … and twenty to twenty-five miles inland" | runs roughly thirty miles **down the river** from the Ovesian border to the delta, and twenty to twenty-five miles inland from it; the sea is the southern end of the country rather than its long side | 2 unclaimed hexes, both on the southern row |
| "warm, well-watered by the Lizeem's distributaries and seasonal rains off the sea, sheltered from the worst of the interior weather by the Ascarth hills behind it" | **Kept for the south, denied for the north.** The southern third is exactly that; the northern half is not sheltered from the interior weather, it is the interior weather — dry, hot, and grazed rather than farmed | `Csa`/`Csb` on the southern rows, `BSh` on the northern three |
| "The northern edge of Gala, where the plain meets the foothills, has a different character … more pastoral, with the upland farming communities that supply the coastal markets, distinct enough to be considered almost a different region by the Galans themselves" | **Kept almost word for word** — the difference is that the northern edge is dry steppe rather than foothill, and that "almost a different region" understates it | the climate line is inside the country |
| "The people of the foothills have a relationship with Aevis that is more direct — they are closer to the peninsula's territory" | The people of the **south-eastern** rises have that relationship; the northerners' dealings are with Ovesos and the desert margin | Northern Ascarth is to the south-east |
| "It grows food without great effort" | The south grows food without great effort. The north grows stock | `BSh` |
| the city, the harbour, the Guild of Assessors, the guest-right, the Avite cycle, Nylon across the river | **All kept.** The atlas denies none of it | — |

### `gala.md` — second pass, **applied in place** (the Gala build, 2026-09-28)

The first pass above had been applied to `gala.md` by the time Gala was built. Building the country
against the atlas turned up two more claims the map does not bear, and these were written into the
lore file in place (left uncommitted in `world-builder`, as the rule is), not only proposed here:

| was | now | the atlas fact |
|---|---|---|
| "twenty to twenty-five miles inland from it before the terrain gives way to the dry steppe that marks the edge of Ovesos and the Oves Desert beyond it" | twenty to twenty-five miles inland to the Telemonian border; **the northern half of that is itself dry steppe**, the same country as Ovesos and the Oves Desert across the Oveth, with one gravel wash that runs only in the rains | `BSh` over Gala's own northern three rows (12 of 21 hexes): the steppe is inside Gala, not beyond it |
| "the sea is the southern end of the country rather than its long side" | kept, and made exact: a short shore at the **south-western** tip, and the Lizeem going out to sea at the **south-eastern** tip, where Gala, Eer and the Ascarth ground meet | Gala's three sea edges are on hexes (-12,122) and (-11,122); the Lizeem's last authored edge ends at (-1350, 1213), the corner of Eer, Northern Ascarth and the sea |
| "drained by a network of small rivers fed from the Ascarth foothills" | its rivers are on its borders — the Oveth along the north, wadeable over rock at its head and deep from there to the Lizeem; a shallower stream off the desert margin; a small stream down the Telemonian border to the sea; the Lizeem along the east, uncrossable. **The Ascarth border is dry.** Inside, the plain's own slow water rises beside the Lizeem's western bank and braids out to the short shore — "the Lizeem's distributaries, as the Galans call it" | river edges: Gala\|Ovesos 3 (medium), Gala\|Oves Desert 2 (medium), Gala\|Telemonia 7 and Gala\|Legemum 1 (small), Gala\|Nesdor 3 and Gala\|Eer 5 (large); Gala\|Northern Ascarth 0 of 8 |
| "supplemented by irrigation channels in the drier northern stretches" | **kept** — the channels are dug, so somebody's, and not built; the atlas does not deny them | — |
| "The northern edge of Gala, where the plain meets the dry steppe … the upland herding communities" | the northern **half** of Gala, the steppe … the herding communities; "the climate changes under a traveler's feet in the middle of the country, not at its border" | as the first row; and the north stands about eight metres, which is not upland |
| "The people of the south-eastern rises" | the people of the south-east, under the Ascarth hills | Gala's own south-east is four-metre plain on the seam; the rises are Northern Ascarth's `hills` hexes beyond it |

Nothing else in the file was touched: the city, the harbour, the Guild of Assessors, the guest-right,
the Avite cycle, Nylon and the language section all stand.

## `ovesos.md` and `oves_desert.md` — second pass, **applied in place** (the Oves build, 2026-09-28)

The first passes above had been applied to both files by the time the two countries were built.
Building them against the atlas turned up seven more claims the map does not bear — all of them about
which way things lie — and these were written into the two lore files in place (left uncommitted in
`world-builder`, as the rule is), not only proposed here. The climate is not among them: the first
pass had already settled `BSh`, and the build confirmed it on all forty-two hexes.

### `ovesos.md`

| was | now | the atlas fact |
|---|---|---|
| "Where the Oveth crosses its widest valley — a stretch of bottomland … the Sorten" | **Kept, and placed.** The river is the kingdom's **south-western boundary** rather than a line through the middle of it: the Sorten is the bottomland on the Ovesian bank, and the bank opposite is the Oves Desert's own margin, two or three metres higher and carrying nothing but stone and scrub | every one of the 7 wet Ovesos\|Oves Desert edges and all 3 Ovesos\|Gala edges is the Oveth; the atlas draws **no** river inside Ovesos at all |
| "It rises in the upland between Telemonia's northern ridgelines and the more open interior plateau" | **Kept**, with where it arrives: it comes down onto Ovesian ground at the **western corner** the kingdom shares with the Oves Desert and the Nether Desert margin | the authored course begins at (-2050, 751), the corner of (-11,114), (-10,114) and (-11,115) |
| "No mountain wall marks Ovesos's borders to the north, west, or south. The terrain simply rises — into the plateau country … to the north, into the Telemon highland edge to the south, into the forested upland to the west" | No mountain wall in **any** direction. The terrain rises six metres from the river bottom to the upland grass of the northern rows, and again across the Oveth to the **south-west** into the desert's margin and the hills of its rim. The other two borders are water and not ground: the **Neth** along the north-west, waded only in its upper reach, and the **Lizeem** along the whole north-east and east, which nobody crosses | Ovesos's neighbours are Oves Desert 13 (SW), Caricas 7 and Nesdor 7 (both the Lizeem, NE and E), Nethereum 5 (the Neth, NW), Gala 3 (the Oveth, SE), Nether Desert 1 (W). Telemonia is not a neighbour of Ovesos at all |
| the Sorten's grain, the mills, the Water Council, *osk-milis*, the Middle Reach, King Melos, the five branch countries | **All kept.** None of them is built, and the atlas denies none of them | — |

### `oves_desert.md`

| was | now | the atlas fact |
|---|---|---|
| "occupies a small arid territory on the **eastern** margin of the Oveth river basin … behind the hills of the desert's own north-western rim" | on the **south-western** margin of the basin, behind the hills of its own **western** rim | the desert is at x -2500…-1850 with Ovesos to its north-east on 13 edges; it is upstream and west of the Oveth's bottomland, not east of it |
| "The hills along the desert's own north-western rim run roughly north to south" | **Kept, and leaned.** They run roughly north to south, **stepping a little further west with every mile they run south** — three broad worn summits on a line from the north-east to the south-west | the 3 `hills` hexes are (-14,114), (-15,115) and (-16,116): one hex west for every hex south, from (-2400, 722) to (-2500, 895) |
| "It occupies a wedge of the Oveth basin's **eastern** section … running **south** from the hill junction" | a wedge of the basin's **south-western** section, **opening westward from its own eastern point** — the corner where the Oveth comes down off the Ovesian border and the Telemon border stream comes in to meet it — and running **east-south-east** off the hill junction | the country narrows to one hex, (-10,117), at (-1850, 982), where its two authored courses meet at (-1800, 953); it is six hexes wide under the rim |
| "The surface drainage is intermittent; the seasonal water channels … are active only during and immediately after rainfall events" | **Kept, and completed**: nothing inside the Oves carries water the year round. Its two permanent courses are both on its edges — the Oveth along the north-east and the small stream along the Telemon border to the south — and the ground between them is dry beds, some of which hold water below their gravel where the rock will not let it away | the atlas draws no river inside the Oves Desert: 7 edges with Ovesos, 5 with Telemonia and 2 with Gala, every one of them a border |
| "not large, not particularly severe … in wet years … the word 'desert' seem[s] like an overstatement"; the drought cycle, the perennial tail, the seed banks, the Branch Compact, the Telemon bands, the wells | **All kept**, and the drought cycle is what the ground was built from: the dry-year face, with the stubble where the wet-year flush would be | `BSh` × 23, in a vocabulary that has `BWh` and does not use it here |

## `eer.md` — no hills, and the coast is the grassy half

The lightest of the six.

| was | now | the atlas fact |
|---|---|---|
| "rises gently toward low chalk hills in the interior, which mark the region's northern limit and separate it from the dryer Mittoli upland country beyond" | rises very gently inland to the north-west and then simply stops being farmed. There are no hills in Eer, and no line where it ends | `hills` 0 |
| "The land is flat near the coast" with the interior implied richer | The coast is the grassy half and the **inland** half is the heavy alluvial ground: the deep loam is north-west, the dry tawny grass is on the sea | `plains` 12 with `Cfa` inland; `grassland` 13 with `Csa` coastal |
| (climate unstated) | Stated: wet all year in the north-west, hot dry summers and mild wet winters on the coast, with the change happening in the middle of the country rather than at either border | `Cfa` × 11, `Csa` × 14 |
| (western boundary unstated) | The Lizeem is the western boundary, and it cannot be crossed anywhere along the Eer bank; Gala is on the far side of it | every Eer–Gala hex edge carries the large river; there is no dry one |
| "The soil is the deep alluvial loam deposited by the Lizeem's seasonal floods" ; "it requires maintenance" ; the north road, the occupations, the walls of Nylon, the people | **All kept** | — |

## `nether_desert.md` — three sentences only

Touched only where it contradicts the atlas about one of the six.

| was | now | the atlas fact |
|---|---|---|
| "the elevated interior plateau west and south of the Nethermere watershed's drainage divide" | west and south of the Neth's own drainage divide | the Nethermere is no longer a lake |
| "the vegetation shifts from the scrub of the high plateau to the grassland and marsh-edge of the Neth's middle course" | …to the grassland of the Neth's middle course | `wetland` 0 in Nethereum |
| "when the Nethermere's expansion pushes the productive zone further up the drainage" | when the spring water pushes the productive zone further up the drainage | as above |
| "In a year when the upland has received significant rain, the Nethermere floods high" | **Kept.** A flood meadow floods | — |

## `telemonia.md`, `the_telemon.md` and `legemum.md` — the rewrite for Telemonia, **applied in place** (2026-10-01)

The coordinating session rewrote the Telemon lore on 2026-10-01 to the user's design (a closed warrior
kingdom in a bowl of dry rock: docs/telemonia-stage1-brief.md) and to the atlas, in place, uncommitted in
`world-builder` as the rule is. Recorded here by the stage 1 build (docs/telemonia-stage1-report.md), which
read the rewrite against the atlas and found nothing further to change. Only the claims the atlas forced
are listed; what the user's design added - the Galmeth, Kethorn, Tormon and the Rothkar, the field people,
the common life, the men's and women's arms - is design and not adjustment.

| was | now | the atlas fact |
|---|---|---|
| "The climate is cool and wet in winter, short-summer"; "the ridges are forested in their lower reaches and rocky above the treeline" | **Hot, dry country** in the same belt as the Oves Desert and the Galan steppe: bunch grass, wormwood and thorn on the slopes, grey scrub oak and juniper in the folds, bare stone above, one short cool rainy season. No treeline: **only the south-eastern corner holds a wood**, the Belketh, "where the hills stand near enough to the sea to catch its weather" | climate per hex `BSh` × 23 and `Csb` × 2, and the two `Csb` hexes are (-12,121) and (-13,122), the south-east corner; `forest` 0 and `deep_forest` 0 among the 25 |
| "Between **Pyros** to the west"; "**West Pyros** shares a cultural memory of the volcanic land and a degree of mutual intelligibility between their older dialects and Kellith"; Kellith "shares some sound patterns with older Pyrosi dialects" | **East Pyros** to the west - "the Pyrosi transit country lies along the western rim" - and Kellith shares sound patterns with "the old Taler speech of upland East Pyros"; they "trade occasionally at the western edge" | Telemonia's western neighbour is East Pyros on 8 edges; West Pyros touches East Pyros on 20 and Telemonia on none |
| (the north unstated) | **The Oves Desert to the north**, where "the hills go down into the Oves", and the track along their foot - the desert's southern route, with its wells - kept by Telemon bands in every season: the road the bands go out by | the Oves Desert is Telemonia's longest border, 12 edges, the Caelin on five of them |
| "a series of parallel valleys"; "the valley floors are fertile enough for grazing and subsistence agriculture"; "The rivers that drain the highland move quickly ... They flood unpredictably in spring. The Telemon build nothing in the flood plains." | **A bowl with a thick rim**: ridge behind ridge on the north-east grain round **one enclosed plain**, the Galmeth. **No river rises in Telemonia and leaves it under a name**: washes that run for a few days after rain, "dry stone by midsummer", and "the Telemon build nothing in a wash". The only streams that run the year round are on the borders - one along the northern foot, and the Treloss down the eastern side | `hills` × 17, every one on the edge, round `plains` × 8 that touch no border; **no river edge inside**: the atlas's 12 river edges on Telemonia are all borders, 5 `small` with the Oves Desert and 7 `small` with Gala |
| (Gala's part in the Telemon's affairs: the contracts and the border markets) | **Kept, and one thing added from the neighbour's lore**: the same Galan brokers argue the classification of the Oves margin before **the Branch Court** of the inner-branch countries, the wells on the bands' northern routes being at issue, and no Telemon has ever appeared there. And the Gala meant is named: "the Gala of the Lizeem ... not the walled Gala of West Pyros" | `oves_desert.md` makes the margin's classification the dispute the desert is known for, and the Caelin - on the Telemon border - is the one water on its edge (docs/oves-report.md); the Lizeem's Gala borders Telemonia on 9 edges, the Pyrosi capital is two countries west |
| `legemum.md`: "**To the north and west**, Legemum's land border connects it to the Mittoli interior" | Legemum's land border "is short and has three neighbors on it": **due north, along most of its length, the Telemon highland**, which the Legemi do not enter - what passes between them passes at the edge markets below the rim, a little tin up and Telemon horses down; **East Pyros to the north-west**, and the Mittoli interior beyond it; **Gala at the north-eastern corner** | Legemum's land edges are Telemonia 9, East Pyros 5, Gala 1, against 29 of sea |

**Read against the atlas and left alone**: "roughly sixty miles east to west and forty north to south" (the
country is 600 m by 460 m of world; the game's scale compresses every country alike, and the proportion,
1.3 to 1, is the atlas's); "the passes through the rim are few" (three are built: docs/telemonia-stage1-report.md);
"the Galan lowlands to the east" (Gala's ground stands 3-9 m against the Galmeth's 30).

---

## To review it once it is applied

```
git -C C:\Users\Michael\Programs\typescript\world-builder diff -- azhora_lore/geography/regions/
```

Files to be touched, and no others: `isareos.md`, `nethereum.md`, `ovesos.md`,
`oves_desert.md`, `gala.md`, `eer.md`, `nether_desert.md`. The user's own uncommitted work in
that repository — `moros.md`, `suval.md` and the map application under `map/` — is not to be
touched, and nothing there is to be committed, staged, stashed, branched or pushed.
