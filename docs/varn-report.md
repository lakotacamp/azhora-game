# Varn, and the Empire's forts on the Lotharn passes

## Main-build integration status - 2 October 2026

This report originated in Claude's `azhora-game-varn` worktree. The detailed measurements below describe that implementation and its original checks; they are not a claim that the current main build has passed every check.

The main build now includes Varn, its wall garrison, the three pass forts, shut gates, shared masonry/no-climb rules, and the difficult slab climbing route. Native review of the city, garrison, and north slab completed without frame errors. That visual review preceded the final small rim and apron refresh.

Current integration validation: the region-scoped Varn suite passes **21 of 22 tests** (Node reported approximately 120 seconds for that run). Its remaining failure seeds a traveler on the west-jamb top: a diagonal step onto the natural rim near `(-1266, -722)` permits a roughly 39 m fall into Amod behind the city. The ordinary pass and tireless-climber route tests pass within this fixture. Raising the rim globally was tried and reverted because it introduced other ledge regressions; the original assertions remain unchanged. The scoped Lotharn-forts suite passes **11 of 12 tests** (Node reported approximately 186 seconds). Its remaining assertion opens Varn's north gate alone while keeping the south gate shut and expects the coarse 1.5 m lattice to find the 1.2 m exit wicket. That flood reports a fall route instead; the Varn suite's finer physical movement check confirms the wicket permits outward travel. This sampling mismatch needs a finer wicket connection in the measuring fixture, not an unsupported claim that all tests pass. Local geometry fixtures now load the real relevant regions through the production fast loader, and the test runner executes heavy files separately to bound memory use.

Source provenance: imported from branch `varn` (originally cut from `land-all` at `01e0578`), including commit `05b71b1` and the later source HEAD `85aede18abd2c9f71bc472252a5b704971eb2085`. The source worktree was left untouched. A final dirty-file refresh was recorded at `2026-10-02T23:06:29-04:00`:

| Source file | SHA-256 at refresh |
|---|---|
| `src/varn-world.js` | `541f58168f036055928462b983995a1d3883fb1fb4b8277eb9fd5f445498e704` |
| `tests/varn-world.test.js` | `cdbfd8860949b2993307610006f9b7ae232791e3b744f4d50a650193b138ce1e` |

These hashes identify the imported source, before main-build fixture adaptations. Integration work is part of the main working tree; repository history, rather than the original report's old uncommitted/unpushed note, records subsequent publication status.

## Original implementation report

Built on 2 October 2026 from `docs/varn-brief.md`. Measurements and observations below are retained as the original implementation record.

The user's words: "a heavily and beautifully fortified city called Varn that has walls that are built
into the mountains and completely surround the perimeter of the city making that mountain pass completely
impassable. Adjust the mountains if needed to make sure this city becomes the key strategic chokehold
blocking movement south from this mountain pass. Let's also add Ambron fortresses of smaller scale
wherever else there are strategic chokeholds that control entry south from the East Lotharn Mountains and
the West Lotharn Mountains."

What is built: **Varn**, in the tip of Amod's notch, and **three forts** - the Vastos Gate, the Meneth Gate
and the Reach Gate. The original branch report recorded both of its own test files as green and
neighbouring failures as also present on its base (section 8). Current integration results are above. The measurements changed the design four times, and those four
are told plainly in section 1 and section 4, because they are the reason the forts are not where a first
look at the map would put them.

---

## 1. The ways south, measured

**How.** The built ground of both ranges and of the countries below them was sampled a metre apart
(x −2650…−600, z −1300…−150), with `canStand` itself asked at every point, and flooded with the game's
walking rules: `canWalkSlope` (in the climbing countries a step up is refused past a grade of 0.9; a step
down never is), the colliders, the closed borders of East Suval and Feradom, and the terrain-fall rule for
what a step off an edge becomes. Whatever a walker cannot be on is rock, and rock lies in islands - the
massifs' courses of cliff. Twenty-six islands of 150 m² and more; every way through the mountains goes
between two of them, so the list of gaps between neighbouring islands is the list of places a wall could
shut. Then the caves were added as the ways they are, which a lattice of the surface cannot see.

**The ways** (narrowest place, rock to rock, on the base before anything was built):

| # | Way | Narrowest | Between | Opens into | Held by |
|---|-----|-----------|---------|------------|---------|
| 1 | Amod's notch, the pass road's end | 128 m | (−1221, −788) and (−1094, −806) | Amod, hex (7,97) | nobody → **Varn** |
| 2 | The Kemrath saddle | 73 m | (−1580, −794) and (−1522, −749) | the Vastos margin | nobody |
| 3 | The long valley, at its narrows | 77 m | (−1761, −713) and (−1761, −636) | the Vastos margin | nobody |
| 2+3 | **The Vastos mouth**, where 2 and 3 come out together | 170 m | (−1660, −584) and (−1505, −653) | Vastos, hex (2,99) | nobody → **the Vastos Gate** |
| 4 | The Meneth gap, the one break in the long valley's southern wall | 79 m | (−2050, −370) and (−1993, −425) | Meneth | nobody → **the Meneth Gate** |
| 5 | The western reach | 75 m at its narrowest, 117 m where the wall stands | (−2310, −461) and (−2308, −386) | Isareos (and Yunethre) | nobody → **the Reach Gate** |
| 6 | **Through the rock**: the passage under the east arm (`col-passage`, src/west-lotharn-caves.js) | a passage 3.6 m wide, 89 m long | in at (−1594, −801) on the col, out at (−1629, −719) in the long valley's eastern reach | the long valley, and by it ways 3, 4 and 5 | nobody → left **inside** the Vastos Gate |

Feradom's pass castles hold none of these: they are on the East Lotharn's other side, shutting the
Duchy's own border, and Feradom is a closed country that turns a walker back at its edge.

Two gaps on the list are not ways south and were left alone: the col where the two ranges join (45 m,
leading west and north) and Kemrath's own floor (76 m).

**What the measurements changed.**

1. **The passage (way 6) was missed at first, and it decided where the eastern fort goes.** Two forts were
   first built at the two narrower places, a Kemrath Gate (way 2) and a Long Valley Gate (way 3). Flooding
   the built world with the caves counted showed two things: a walker went into the rock on the col and
   came out between the two forts, 33 m behind the Kemrath Gate's western end, so that fort was walked
   round; and the long valley, whose only walking link with the rest of the mountains is that passage,
   was left with no way out but its three shut gates - a pocket of 48,308 m². Both forts were taken out
   and one wall was built across the mouth instead. It is longer (178 m against 108 + 94), it is one gate
   instead of two, the passage is wholly inside the mountains, and nobody is shut in.
2. **The jambs were a stair.** Varn's two shoulders of rock were first built 28 m high (top at 88 m). Both
   massifs have a ledge at 113-119 m above their first cliff, and a walker reaches the south-west peak's
   by that peak's own first ramp from the Kemrath saddle. From that ledge to the notch's slope was one
   fall of 34 m. With a jamb at 88 m under it, the same descent was 21 m onto the jamb and 15 m off it -
   a fall a traveler with a hundred health lives through. The jambs are now the ledge's own height
   (section 2).
3. **The countries' scatter moved, and was put back.** Two neighbours lay their trees, stones and walls
   from seeded streams, and a candidate that is taken draws more of the stream than one that is refused.
   Varn's ground changed which were taken - the East Lotharn lays loose stone only above 70 m, and the
   jambs raised ground past 70 m; Amod builds a terrace wall wherever its ground steps, and the Varn
   road's bed regraded some of it - so about nine hundred of the East Lotharn's trees and a hundred and
   sixty of Amod's had moved, across both countries. Fixed at the two places that decide (section 7); the collider lists of the base
   and of the build were then compared kind by kind: every tree and stone that differs is one that was
   lifted off the works' own ground, and none has moved.
4. **The Reach Gate was first built at the reach's narrowest place and moved 93 m up the valley**, for
   two reasons found by test: the south rampart's own first ramp climbs the very cliff that wall's
   southern end died into, from the mountains' side to the ledge above the Empire's, three metres over
   the wall's end; and the wall stood across the range of the west beck's river foxes, so that the law
   "the river fox never flees and keeps arm's length from a walker" (`tests/west-life.test.js`), green on
   the base, failed - the fox was cornered against the wall at 1.36 m.

**Ways not shut, and why.**

- **Round the range.** West of the Reach Gate the reach opens onto both Isareos and Yunethre, and north
  of everything lie the Mithala plain and open country. A walker can go round both ranges by the plains.
  That is not a way through the mountains, and no fort answers it.
- **By falling.** A fall costs at most 100 health (`src/terrain-fall.js`), and a traveler's health runs
  from 100 to 400 with his toughness (`src/combat-skills.js`). So no height in the game kills a traveler
  with more than a hundred health. With every gate shut, the least worst fall on any way from the valleys
  to any lowland is **34.2 m** (the ranges flooded 1.5 m apart, in `tests/lotharn-forts.test.js`; 34.9 m on
  the one-metre survey): up the south-west peak's first ramp from the Kemrath saddle, along its first
  ledge, and off the peak's south side at about (−1426, −648), onto the hills between Varn and the Vastos
  Gate. On the base, with the same four lines walled, it was 34.0 m, at the ledge's east end over the
  notch - the spot the west jamb now covers. That fall kills a traveler with a hundred health; it costs
  any other a hundred and lets him through. It is the mountains' own shape and the fall rule's, not a
  gap in a wall, and it is left for the user (section 10).
- **By climbing.** Section 2 and section 4: the rock the works are built into gives no hold; the
  mountains beside them are climbed as they always were.

---

## 2. Varn

Numbers in `src/varn-world.js` (pure), drawn by `src/varn-scenery.js`, the masonry shared with the forts
in `src/imperial-masonry.js`. One build step in `src/world.js` (`regionBuild('varn', [10, 20], …)`), after
Amod and the East Lotharn.

**Where.** The tip of Amod's notch, hex (7,97), where the pass road stopped at (−1150, −792). The city
takes that road on from the exact point it ended.

**Piece by piece.**

- **The curtain**: a closed circuit of six walls, 325.7 m round, on the notch's own hexagon - the pass
  front straight across the north (98 m), the two long sides (60 m each) in the feet of the jambs, and a
  salient of three faces (35.8, 36, 35.8 m) to the south. 8.4 m high and 4.6 m thick with a wall walk
  at 6.2 m: taller than Ambron's own (7.2 m) and as thick.
- **Fourteen towers**, none more than 36 m from the next: six at the corners, a pair at each gate, two
  more on the pass front and one in the middle of each long side. Platforms at 12.2 m, slate caps.
- **The Pass Gate**, in the middle of the pass front: twin towers a storey over the rest, a portcullis
  and barred leaves, the Empire's red and gold hung on both towers and a shield over the arch, a ditch
  5 m wide and 2.4 m deep before the whole front with a kerbed causeway. **Shut.**
- **The Amod Gate**, in the face of the salient: the same, a storey lower, its own ditch. **Open, always.**
- **The citadel**: a keep 12.5 m square and 23 m high with four turrets, in its own ward in the
  north-west corner - the highest ground in the city, a metre and a half over the upper court - behind
  its own wall with three towers and one gate, the castellan's hall along the ward's south side.
- **The town**: nineteen buildings. Three barrack blocks and an armoury in the north-east; a market
  square on the street with a well and the Empire's standard, the market hall on one side and a
  three-floor granary on the other; ten stone houses in two blocks, Amod's own kind (undercroft,
  household, drying loft under a steep roof); a smithy and stables in the lower court.
- **The street** is the pass road: in at the Pass Gate, one in ten down through the town (the upper
  court at 60.2 m, the lower at 54.4 m), out at the Amod Gate.
- **The road down**: 417 m in all, from the pass road's end through the city and down the hills to the
  last vertex of Amod's own road at (−881, −532), through the gap in the field wall at the Kelmod road's
  end. Graded like Amod's road: 54.4 m to 34.0 m at never more than one in ten on its bed; the steepest
  metre measured along it is under one in eight.
- **The jambs** (the mountains adjusted, section 3) and **the parapets** on them, below.

**Walls built into the mountains.** The long sides' centre lines are 2 m from the jambs' lips, so the
curtain's own thickness reaches into the foot of the rock, and the pass front's two corner towers stand
in the jambs' feet. Each jamb's top is the mountain's first ledge carried out level over the city, 56 m
above the upper court, and every edge of it the jamb made carries a battlemented breastwork with a watch
turret and a beacon at its pass end: the city's wall goes on up the rock.

**The pass is shut to a walker** (`tests/varn-world.test.js`, the built world sampled a metre apart round
the city, x −1330…−990, z −850…−668, a step refused if anything solid stands half-way along it):

- From the pass road, with every fall allowed whatever its height: 0 m² of Amod behind the pass front.
  All a walker from the pass has of Amod is 533 m² of forecourt before the Pass Gate, which is Amod's hex.
- From Amod, the same way: 0 m² of the pass. (He has the whole city: the Amod Gate is open.)
- From either side: 0 m² of either jamb's top.
- With the game's own step (`moveCharacter` with `canWalkSlope`): a traveler walked south at the pass
  front every two metres from jamb to jamb is stopped by it everywhere, and one walked into each corner
  and on along the rock gets no further than the ditch.
- Open the gate (the same world less the seven colliders that shut it) and 13,584 m² of Amod is walked
  to from the pass and 4,619 m² of the pass from Amod, with every half-metre of the road clear.

**Nobody steps off a jamb.** A jamb's top is level with the mountain's ledge on purpose, so it can be
walked onto from the ledge (2,428 m² of the west jamb's top and 2,031 m² of the east's are walked, and
1,206 and 821 m² of ledge beyond them: nobody is shut up there). The breastwork is solid and closed: kept
to the top itself, a walker reaches none of the strip between the breastwork and the lip on any side, and
a traveler walked at the city side with the game's own step is stopped by it. Where the breastwork stops
at the mountain's own ledge a return runs out to the jamb's very edge; without those the strip outside it
could be walked round to the city side, which the first layout allowed.

**And to a climber.** The rule is one function in `src/climbing.js`, `climbForbidden(world, x, z)`, read
where a hand goes for a hold (`sampleClimbSurface`) and at every attached step of a climb; the world
answers it from one table, `src/no-climb-zones.js`, a row to a place. Varn's row is the first cliff
(below the mountain's first ledge, `src/lotharn-first-course.js`) inside two boxes: x −1310…−1199 and
x −1101…−990, z −800…−690.

- From Amod, inside the rule's reach: no way up at all. Every face on that side is the first cliff.
- From the pass, inside the rule's reach: a climber is on the mountain's first ledge by the eastern
  peak's own first ramp, as he always could be, and walks out over the city on the east jamb (5,166 m²
  of ground over a hundred metres east of the city without a fall; none west of it, and a walker none
  on either side). He does not come down behind the wall by any fall a hundred health lives through:
  Amod below Varn is reached only by a fall of 34.7 m off the ledge.
- The controller itself: at 49 places along the jambs' feet the rock would take a hand but for the rule,
  and at none of them does `grab` take one. With the rule lifted the same flood puts a climber on
  2,042 m² of Amod behind the wall without a fall - so the rule is what shuts it.
- **Measured, not chased** (the brief's words): beyond the rule's reach the mountain is climbed as it
  always was. A climber who never tires goes up the south-west peak's first cliff south of the no-hold
  rock, along its ledge, and down to the pass without a fall at all, 110 m from the city. Section 10.

**Why the rule is the first cliff only, and why the ramps keep their hold.** The eastern peak's own way
up - the highest peak in the range, 421 m - begins on the pass floor before Varn's Pass Gate
(`eastern-peak-ramp-1`, from (−1060, −853)), climbs the first cliff north of the east jamb and goes on
over the jamb's back from ledge to ledge. The first row written took in the whole face for a hundred
metres either side of the city, and it cut that route at its first ramp; `tests/east-lotharn-peaks.test.js`
caught the same thing at the Vastos Gate, where the south-west peak's route passes fifty metres behind
the wall's end two courses up. So the rule takes the first cliff and no more, never a peak's own ramp
(`RAMPS_KEEP_THEIR_HOLD`, one constant), and Varn's boxes begin at the jambs and run south.

**Gates on one flag.** `LOTHARN_PASSES_SHUT` in `src/varn-world.js`, read by Varn's Pass Gate and by
every fort's gate. Default **shut** (section 10).

**Nobody is sealed in.** The city opens onto Amod by the Amod Gate whatever the flag says (a traveler is
walked from the market square down every leg of the road to Amod's own); the forecourt before the shut
Pass Gate is the pass road's own end and opens back onto Kemrath; the jambs' tops open onto the ledge.

---

## 3. What was changed in the mountains, and in whose country

Measured as the ground with Varn against the ground before it, a metre apart (`groundBeforeVarn`,
`src/world-terrain.js`). The forts change no ground at all.

| Whose | Hexes | What | Area | By how much |
|-------|-------|------|------|-------------|
| East Lotharn | (6,97), (7,96) | **the west jamb**: the mountain's first ledge carried out level to within a metre of Amod's hex, x −1270…−1201, z −796…−722, top 116 m, faces 4.5 m deep | 3,522 m² | raised, up to 55.0 m |
| East Lotharn | (8,97), (8,96) | **the east jamb**: the same, x −1099…−1050 | 3,144 m² | raised, up to 58.7 m |
| East Lotharn | (7,96), (8,96) | the outer ends of the pass front's ditch and floor, where Amod's hex narrows to its tip and the wall's two corners stand 5 m outside it | 610 m² | lowered up to 8.5 m (539 m²), raised up to 1.8 m (71 m²) |
| Amod | (7,97), (6,98), (7,98) | the city's made floor, the citadel's ward, the ditch before both fronts | 9,263 m² | raised up to 9.8 m, lowered up to 10.1 m |
| Amod | (7,98), (7,99), (8,98), (8,99), (8,100), (9,99) | the road's bed down the hills | 6,738 m² | raised up to 4.8 m, lowered up to 5.4 m |

Nothing of the mountain is lowered inside a jamb (held by test). Where the mountain already stood higher
than a jamb's top it is left as it is, so the eastern peak's second ramp, which crosses the east jamb's
back, is on the ground it always was. The road's bed lets go over its last five metres, where it lies on
the bed Amod's own road already has: from the road's end east, the ground is Amod's as Amod made it. The
pass road's own bed is unchanged to two millimetres.

Also changed in Amod: the bar across the Kelmod road's end stands against its post now and the field
wall's collider has a 6.2 m gap, so the road goes through. And lifted off the works' ground, without
moving anything else: 101 trees, 43 loose rocks and 268 drawn tufts, stones and terrace walls at Varn;
154 trees and 73 drawn pieces at the forts.

---

## 4. The forts

`src/lotharn-forts.js` (pure) and `src/lotharn-forts-scenery.js`; one build step, after the western
country (`regionBuild('lotharnForts', [20, 27, 11], …)`).

Each is one straight curtain from cliff to cliff, both ends run up the fallen rock into the first cliff;
6.6 m high and 4 m thick; a tower by each end and none more than 32 m from the next; one gate between two
towers, facing the mountains, shut on the same flag; and behind it on the Empire's side a keep (8.8 m
square, 15.5 m high, four turrets) and a two-storey barrack. No ditch, no town. The same masonry as Varn.

| Fort | From | To | Length | Towers | Gate | Stands in | Opens on |
|------|------|----|--------|--------|------|-----------|----------|
| **The Vastos Gate** | (−1665, −586.5) | (−1504.5, −663.3) | 177.9 m | 8 | (−1605.5, −615) | West Lotharn (128 m of wall) and East Lotharn (50 m); keep and barrack in East Lotharn hex (3,98); the yard behind the gate is on the tip of Vastos, hex (2,99) | Vastos |
| **The Meneth Gate** | (−2053.6, −368.7) | (−1990, −427.3) | 86.5 m | 5 | (−2024.2, −395.8) | West Lotharn | Meneth |
| **The Reach Gate** | (−2212, −541.5) | (−2212, −398.5) | 143.0 m | 7 | (−2212, −483.5) | West Lotharn; a grated arch at (−2212, −466) where the west beck runs under it | Isareos |

**Why there.** The Vastos Gate: section 1, change 1. The Meneth Gate is at the gap's narrowest place. The
Reach Gate: section 1, change 4 - 93 m up the valley from the narrowest place, where no way of the
mountain's passes over either end and the foxes' ground is all on one side; 143 m of wall rather than 90.

**That they are shut** (`tests/lotharn-forts.test.js`: both ranges and the lowland within 120 m of them,
438,149 points 1.5 m apart, the eleven passages through the rock joined mouth to mouth):

- With the gates as built, a walker out of the valleys stands alive on 145,532 m² of the East Lotharn,
  100,895 m² of the West Lotharn and 520 m² of Amod (Varn's forecourt), and on nothing of Vastos, Meneth
  or Isareos. The least worst fall to any of the four lowlands is 34.2 m.
- From the lowlands, by any fall at all: none of the eight valleys.
- The mountains are one country inside the walls: from Kemrath every other valley is walked to, the
  long valley by the passage, and both mouths of both through-passages are the mountains' own ground.
- Open the gates and every one is a way: all at once, and each alone to its own country.
- **Nobody is sealed in**: from every one of the eight valleys, gates shut, a walker walks out of the
  mountains by the pass road's northern end; and the yard behind each gate opens onto its own country.
- Close to each wall, a metre apart: no walker behind it or round its ends by any fall; no climber
  behind it by any way at all. With the no-hold rule lifted a climber is behind the Vastos Gate and the
  Meneth Gate without a fall, so there the rule is what holds him; at the Reach Gate the cliffs are too
  steep for a hand in any case (36.9 m of fall even with the rule lifted).
- No way of either range touches the first cliff within 30 m of where a wall dies into it.

**A choke left open:** none of the measured ways. What is left open is listed in section 1 - round the
range, falling, climbing - and in section 10.

---

## 5. Names, and where they came from

- **Varn** - the user's.
- **The Pass Gate, the Amod Gate, the Citadel, the Market Square, the jambs** - plain words for what
  each is.
- **The Vastos Gate, the Meneth Gate, the Reach Gate** - plain words, each named for what it shuts or
  opens on. They stand in the Lotharn, whose own names are an older tongue than Mittoli and cannot be
  coined from the language profiles (the precedent is `docs/west-lotharn-report.md`).

Nothing was coined. No named characters, no quests, no civilians, nobody at all.

---

## 6. What was added to the lore

Edited in place in `world-builder/azhora_lore/geography/regions/`, not staged and not committed (both
files already carried somebody else's uncommitted changes, which are untouched):

- `amod.md`: one paragraph on Varn after the towns, in the lore's voice ("Varn is not an Amodian town,
  and Amodians say so before they say anything else about it…"); and half a sentence on Sareth-am-Vel,
  whose descent "now begins at the southern gate of Varn".
- `lotharn.md`: one paragraph at the end of "The Passes": Ambron as the latest of the outside powers
  that section already describes, Varn and the three gates by name, and that they hold every way a
  loaded mule can take and not the side routes.

The atlas is unchanged. In the game's own documents: Varn is on the list in `docs/campaign-design.md`.

---

## 7. Files

**New**: `src/varn-world.js`, `src/varn-scenery.js`, `src/imperial-masonry.js`, `src/lotharn-forts.js`,
`src/lotharn-forts-scenery.js`, `src/no-climb-zones.js`, `src/lotharn-first-course.js`,
`src/scenery-clearing.js`, `tests/varn-world.test.js`, `tests/lotharn-forts.test.js`,
`tests/lattice-flood.js` (the measuring tool the two tests share), `docs/varn-report.md`.

**Changed, and why** - several are other countries' files:

- `src/world-terrain.js`: Varn's layer in the ground, and `groundBeforeVarn`, the same ground without it.
- `src/world.js`: the two build steps; the road; the landmarks; `unclimbableAt` on the world; the fine
  ground's sink; the two neighbours handed `unbuiltGround`. The Varn road is deliberately **not** among
  the lines the countries' scatter keeps off (it would re-seed Amod's): its ground is cleared afterwards.
- `src/climbing.js`: `climbForbidden`, read in `sampleClimbSurface` and in the attached step.
- `src/east-lotharn-scenery.js` (the East Lotharn's): its loose stone is judged on the ground as the
  range made it (`kit.unbuiltGround`), one line, so that the jambs do not re-seed the range.
- `src/amod-scenery.js` (Amod's): its terrace walls are found on the ground as Amod cut it, four lines,
  for the same reason; and the Kelmod bar.
- `src/tree-registry.js`: `remove(id)` - a tree taken out for good, struck off the register.
- `src/main.js`: the review views; `unclimbableAt` handed to the climbing controller; and the count of
  streamed trees replaced by a set, because `remove` shortens the list that count ran along.
- `src/amod-world.js`, `src/map-fog.js` (one area, Varn), `src/campaign-world.js` (one settlement),
  `src/region-world.js` (Amod's landmark list), `src/build-status.js` (three countries' entries),
  `docs/campaign-design.md`, `package.json` (the two tests on the list).
- `tests/east-lotharn-world.test.js`: the law "no step in the ground off the peaks" passes over the two
  jambs, which are cliffs on purpose (without it: 8 steps counted, 6 of them the jambs' faces, limit 4).
- `tests/west-lotharn-scenery.test.js`: its trunk check passes over an instance scaled to nothing (a
  lifted tree). **Not verified**: that file crashes at load on the base before any test runs (section 8).

**For the merge with Telemonia's no-climb rule** (`azhora-game-telemonia`, read only): the two were
written in the same shape. `climbForbidden` and its two call sites are the same code lines; this side
answers `world.unclimbableAt` from the table in `src/no-climb-zones.js`, and Telemonia's
`kethornUnclimbable` becomes one more row of it. The comment above `climbForbidden` differs in two lines.

---

## 8. Tests

One file at a time. A world-building file takes 65-130 s here. The base for comparison is the checkout
at `azhora-game-land`, which moved forward during the work (now `e884e6a`; this branch was cut at
`01e0578`).

**The work's own, on the final code:**

| File | Result |
|------|--------|
| `varn-world` | 18 of 18 (72 s) |
| `lotharn-forts` | 12 of 12 (99 s) |

**The neighbours, on the final code:**

| File | Result | If red: the base |
|------|--------|------------------|
| `amod-world` | 8 of 9, **1 red** | the same test and message on the base ("world bounds reach Amod’s northern hills (-3899)"); in `docs/known-failing.md` |
| `east-lotharn-world` | 12 of 12 |  |
| `east-lotharn-peaks` | 6 of 6 |  |
| `east-lotharn-cave-walk` | 9 of 9 |  |
| `west-lotharn-world` | 10 of 10 |  |
| `west-lotharn-peaks` | 9 of 9 |  |
| `west-lotharn-scenery` | **crashes at load**, no test runs | the file crashes at load the same way on the base (`TypeError: Cannot read properties of undefined (reading 'children')`: it looks the terrain up by its old name) |
| `west-lotharn-traversal` | 1 of 1 |  |
| `climbing` | 21 of 21 |  |
| `climbing-world` | 6 of 6 |  |
| `nobody-sealed-in` | 6 of 6 |  |
| `map-fog` | 7 of 7 |  |
| `campaign-world` | 6 of 7, **1 red** | the same test on the base ("describeRegion merges design with the survey…"): Drent’s hex count, 40 here and 42 on the base since it moved forward, 39 expected; not touched by this work |
| `region-layout` | 8 of 8 |  |
| `regional-build-steps` | 3 of 3 |  |
| `region-loading` | 7 of 7 |  |
| `feradom-world` | 14 of 14 |  |
| `vastos-world` | 10 of 10 |  |
| `open-country` | 4 of 8, **4 red** | the same four tests on the base; three are in `docs/known-failing.md`, the fourth ("scenery batching keeps its old district") reads a line that moved out of `src/world.js` before this branch. One message differs, in a test about Drent’s shore, because the base has since gained Drent’s peninsula |
| `tree-registry` | 4 of 4 |  |
| `meneth-world` | 7 of 7 |  |
| `isareos-world` | 8 of 9, **1 red** | the same test and message on the base ("the chart knows menora"); in `docs/known-failing.md` |
| `fortifications` | 6 of 6 |  |
| `closed-border` | 6 of 6 |  |
| `climbing-pose` | 5 of 5 |  |
| `climbing-combat` | 4 of 4 |  |
| `terrain-fall` | 9 of 9 |  |
| `static-scenery-batches` | 7 of 7 |  |
| `local-map-data` | 11 of 12, **1 red** | the same test and message on the base ("…cottages, farms, and barracks", 16 !== 15, Drent’s chart); in `docs/known-failing.md` |
| `world-map-detail` | 13 of 13 |  |
| `minimap` | 15 of 15 |  |
| `amod-ogre` | 9 of 9 |  |
| `vastos-camp` | 6 of 6 |  |
| `vastos-host` | 8 of 8 |  |
| `scenery-builder-steps` | 1 of 1 |  |

**`tests/west-life.test.js`, law by law.** Six animal ranges come near the works: two of Amod's on the
road's bed, the eastern bald's hares, the west beck's river foxes, and two hawks, which no law on foot
asks about. A seventh, the cold head's hares, was near the Reach Gate's first site.

- "the river fox never flees…", "no band is given a range it can run out of the reach of", "a band left
  for a moment…": green here. The first was **red with the Reach Gate at its first site** and green on
  the base; the gate was moved and it is green.
- The other laws stop at their first failing band on the base (three of eleven, per
  `docs/known-failing.md`), before they reach any band near the works. So every law was run on just the
  five ranges near the works, from a temporary copy of the test, here and - reading the base's own files
  without writing there - on the base. The result is the same on both: all five pass the river-fox,
  herding and home-again laws; the walk-down law passes the first four and fails at `cold-head-hares`
  ("somebody walking got within 2.63 m") identically on the base, 108 m from the nearest work.

---

## 9. The review render

`node scripts/launch.cjs --smoke-test --review-clean --review-jpeg "--review-views=…"`, pictures in
`tests/artifacts/` (not tracked). Twenty-one views were rendered after the last change, without an error, and looked at:

- `varn-pass` - from the pass road: the Pass Gate's towers, flags and portcullis through the wood.
- `varn-pass-gate` - the Pass Gate close to: twin towers, banners, shield, portcullis down, causeway.
- `varn-amod` - **Varn from Amod**: the salient and the Amod Gate, the town's roofs, the keep, both jambs.
- `varn-amod-gate` - the Amod Gate open, the street and the Pass Gate through it.
- `varn-wall-end` - the pass front's corner tower and the curtain where they meet the west jamb.
- `varn-jamb` - the west jamb over the city, in its beds, with the breastwork and the wood on its top.
- `varn-street`, `varn-citadel` - the keep, the ward, the hall and the upper court.
- `varn-above` - the whole plan from over the Amod road.
- `fort-vastos`, `fort-meneth`, `fort-reach` - each from the mountains' side of its gate; `-back` from
  the Empire's side; `-keep` at its keep and barrack; `-end` where the wall's far end meets the rock.

What the pictures showed and what was done about it: the first render showed loose boulders and grass
standing inside the walls (the clearing found only the first of two groups called "Amod scenery"; it
finds every one now, and the count lifted went from 37 to 268); the jambs' faces read as one smooth slab
56 m high (they carry broken beds of darker stone every eight metres or so now); and several views were
taken from inside a tree's crown or drawn in against a wall (cameras moved onto the roads, looks raised).
The forts stand in the mountains' own woods and trees hide part of some views; nothing was felled for a
picture beyond the strip the walls and yards stand on. **One view does not show what it is for**:
`fort-vastos-end` is taken from inside the wood and shows the barrack's roof and the cliff, not the wall's
end. The Vastos Gate's eastern end was therefore not seen in a picture; that it is closed is held by
measurement (section 4), and the other two forts' ends and Varn's are seen.

---

## 10. Decisions left for the user

1. **The gates' default.** Shut, on one flag (`LOTHARN_PASSES_SHUT`). Chosen from the game's own
   precedent for a fortress on a pass - Feradom's castles keep "the gate toward the border shut; the one
   toward the coast stands open" - and from "completely impassable". Varn's Amod Gate is always open.
   `false` opens Varn's Pass Gate and all three forts' gates; the tests that hold "shut" skip themselves
   and the ones that hold "open is a way" still run. Not built: a gate that opens for some travelers.
2. **A garrison.** There is none: no soldiers on the walls, nobody in the houses. The build status says
   so for each country.
3. **Falling.** A traveler with more than a hundred health can still come south by one fall of about
   34 m off the south-west peak's first ledge (section 1), because a fall never costs more than a
   hundred. Closing that is a change to the fall rule or to the mountain's ledges, and neither was made.
4. **Climbing.** The no-hold rock is the first cliff beside each work, and the peaks' own ramps keep
   their hold. Beyond that reach a climber goes over the mountains as before, and at Varn one way up is
   the eastern peak's own first ramp, which starts at the forecourt. Making more rock no-hold is one row
   of `src/no-climb-zones.js` per face; making ramps no-hold inside a work's reach is one constant
   (`RAMPS_KEEP_THEIR_HOLD`), and would shut the eastern peak's route.
5. **The Vastos Gate instead of two forts**, and its length (178 m); and that its yard's trodden ground
   lies on the tip of Vastos.
6. **The Reach Gate's site**: 143 m of wall where the reach is 117 m of floor, rather than 90 m at the
   narrowest place, to leave the south rampart's route and the foxes' range alone.
7. **The jambs**: 56 m of rock either side of the city, level with the mountain's ledge, with a
   breastwork a walker on the ledge can walk up to. Lower jambs are a stair (section 1).
8. **The pass front's corners** stand 5 m outside Amod's hex, in the East Lotharn; 99 % of the ground
   inside the walls is Amod's.
9. **Sareth-am-Vel.** The lore gives it the descent Varn now heads. The road was built down that descent
   to the Kelmod road's end; the town is still only a name on the fingerpost there, and no fingerpost
   says Varn.
10. **The chart.** Varn has an area of its own and five landmarks. The forts are landmarks only, without
    areas: the West Lotharn's test caps that country's areas, and an area there would sit on another's.
11. **The Kelmod bar** is opened, in Amod's own scenery.
12. **Other countries' files** were changed where the measurements required it (section 7).

---

## 11. Not done, and not verified

- **The game's own loading path** (regions streamed in as the traveler nears them) is exercised only by
  the review render, which loaded and drew every view without an error; no node test covers it. The
  streamed-tree bookkeeping in `src/main.js` that `remove` required is checked only by that render.
- **`LOTHARN_PASSES_SHUT = false`** was not run as a build: the open state is measured by taking the
  shut gates' colliders away from the same world.
- **`tests/west-lotharn-scenery.test.js`**: the edit there is untested, because the file crashes at load
  on the base.
- **`tests/drawn-ground.test.js`** (no place the world names is buried in the ground it draws) fails on
  the base with errors before it measures anything, so it says nothing about the new landmarks; they are
  held to "can be stood on" in the work's own tests instead.
- **The full suite was never run**, as instructed. Files outside the list in section 8 were not run.
- A climber's **stamina** is not counted anywhere: every climbing measurement is of a climber who never
  tires, which is the worst case.
