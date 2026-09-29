/**
 * What the traveler has charted. The world chart starts blank: a hex of the
 * authored atlas is uncovered only when the traveler has walked into it, and the country between them is named by subregions — small
 * authored areas (a point and a reach, usually a hex or three) that are recorded
 * in the journal the first time the traveler reaches one. Tidehaven, the port
 * village the game opens in, is the first. Pure: no DOM, no three.
 */
import { hexAt } from './region-world.js';
import { FARMSTEADS } from './regional-farmland.js';
import { WINERY } from './winery.js';
import { ISCARE_RUIN_SITES, ISCARE_REGION } from './iscare-world.js';

export const MAP_FOG_VERSION = 1;
/** The chart records ground the traveler has actually stood on: one authored hex at a time. */
export const CHART_GRAIN = 'hex';
const HEX_NEIGHBOURS = Object.freeze([[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]);

/** Detail belongs to entered hexes. The world map also uses this for individual local marks. */
export function chartKnowsPoint(cells, x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const at = hexAt(x, z), key = `${at.q},${at.r}`;
  return cells instanceof Set ? cells.has(key) : Array.isArray(cells) && cells.includes(key);
}

const area = (id, name, region, x, z, radius, note) => Object.freeze({ id, name, region, x, z, radius, note });

/** The named ground of Azhora, as the traveler's own chart records it. */
export const SUBREGIONS = Object.freeze([
  ...FARMSTEADS.map(farm => area(farm.id, farm.name, farm.region, farm.x, farm.z, 28, 'Worked fields, an open tool shelter and shared garden beds. Take seeds, sow, water, and return for the harvest.')),
  ...ISCARE_RUIN_SITES.map(site => area(site.id, site.name, ISCARE_REGION, site.x, site.z, 45, 'Burned, roofless stone and charred beams remain from the Blood Prince\'s passage. The islands have wildlife, but these settlements are abandoned.')),
  area('imlamdris-rebuilding', 'Imlamdris rebuilding', 'South Suval', -126, 1154, 40, 'Four small timber homes and a new building frame stand beside the razed city.'),
  // Drent
  // The id stays `eastreena` so older charts keep loading; the name on the chart is the one the village uses now.
  area('eastreena', 'Tidehaven', 'Drent', -6, 29, 55, 'The port village on Drent’s east coast, where the road begins. It was East Rena once — Eastreena — when there was a Rena to be east of, and the old people still call it that.'),
  area('the-greenway', 'The Greenway', 'Drent', -70, 29, 45, 'The old footpath inland under the broadleaf canopy, the waykeeper’s watch and the charcoal burners’ ground.'),
  area('willowmere', 'Willowmere', 'Drent', -97, 9, 30, 'A quiet forest pool east of the road, with a fishing ledge and a stone firepit.'),
  area('fernway', 'Fernway Rest', 'Drent', -128, 34, 45, 'A shaded bench and an old cairn where the woodland paths meet, with Odger Pell’s drying rack on the bench side and Fern Hollow damp behind it.'),
  area('avrel', 'The Avrel Clearing', 'Drent', -421, 40, 75, 'Farm clearings in Drent’s forested upland: the mill commons, the army’s post, the sunken drove lane where Nell Harrow works her hedge banks, and the road on to the Caloss.'),
  area('rena', 'The Ruins of Rena', 'Drent', -395, -70, 55, 'Rena was the principal town of Drent until it was pulled down after a battle eighty years ago: street lines under the grass, a burnt gate, the stump of the hall, and a well that still holds water.'),
  area('applegarth', 'Applegarth', 'Drent', -568, -32, 45, 'The orchard village at the west end of the old Rena road. It was West Rena, then Westerina, and its bound stone has never been recut.'),
  // Drent's tenth (the user, 2026-09-21). Small on purpose: the Caloss Bank's reach comes within
  // twenty metres of it, so the ground is sized to what is actually here - the roofless house,
  // the stream crossing below it, Silas Garrow's cart, and the road they all stand off.
  area('the-toll-house', 'The Toll House', 'Drent', -515, 92, 18, 'A roofless toll house at the head of a stream crossing on the Caloss road, where the lord of Rena took a toll on everything going down to the river. Silas Garrow keeps his marl cart on the road side of it, and the stream cut below is a section a man can read.'),
  area('caloss-bank', 'The Caloss Bank', 'Drent', -546, 177, 70, 'Drent’s side of the river: reed beds, a quiet fishing bank and the road down to the bridge.'),
  // Luscia
  area('caloss-crossing', 'The Caloss Crossing', 'Luscia', -610, 139, 55, 'The bridge over the Caloss and the crossing keeper’s hut. Luscia begins on the far bank.'),
  area('reedcutters', 'The Reedcutters’ Camp', 'Luscia', -675, 190, 50, 'Cut reed stacked to dry, a landing workshop, and the people who work the river’s edge.'),
  area('the-rise', 'The Rise', 'Luscia', -675, 230, 50, 'Sava’s shrine and the three waymarkers on the height above the river road.'),
  area('lauvel', 'The Field at the Lauvel', 'Luscia', -700, 315, 70, 'Where the army broke a rebel army: burial mounds, the relay, and the people who buried the losers.'),
  // **Nothom**, which is Luscian Mittoli for what the Empire's clerks used to call Lumber Town:
  // `noth`, forest or timber, on `hom`, a settlement (azhoran_language_profiles.py, the Mittoli
  // root list; the user, 22 September 2026). The id is the old one and stays the old one - it is
  // in saves, in the road smoke and in a dozen modules, and nobody reads an id.
  area('lumber-town', 'Nothom', 'Luscia', -729, 384, 55, 'Luscia’s timber town: the square, the smiths, the relay clerk and the stable yard on its edge.'),
  area('burned-hamlet', 'The Burned Hamlet', 'Luscia', -621, 356, 55, 'Roof beams standing in the grass, and a well somebody still keeps clean.'),
  area('paradise-springs', WINERY.name, WINERY.region, WINERY.centre.x, WINERY.centre.z, WINERY.radius, 'Paradise Springs, in plain words: Lakota’s old winery southeast of Port Calos. A log cabin where the wine is poured, a great hall where it is made, a spring welling out of limestone, and eight grapes in blocks down the slope.'),
  // The Moros Plain
  area('moros-gate', 'The Moros Road', 'Moros Plain', -763, 440, 45, 'The open road from Nothom onto the Moros Plain. The town’s guards keep watch back at its walls.'),
  area('border-stockade', 'The Border Stockade', 'Moros Plain', -667, 527, 70, 'The army’s ditch and stakes on the border, and the ground the battle is fought over.'),
  area('legion-camp', 'The Army Camp', 'Moros Plain', -981, 599, 95, 'The Ambroni outpost at the centre of the plain: gate, tents, horse lines and the Marshal’s command.'),
  // West Suval
  area('west-suval-border', 'Into West Suval', 'West Suval', -636, 685, 60, 'The stockade road crosses into West Suval, and the downs open out toward the sea.'),
  area('suval-downs', 'The Suval Downs', 'West Suval', -600, 745, 70, 'Tawny grass, dry-stone walls, olives and thorn, a broken watchtower and a wayside well.'),
  area('shepherds-fold', 'The Shepherds’ Fold', 'West Suval', -700, 750, 55, 'A dry-stone ring and a turf-roofed hut where the flocks are brought in.'),
  area('solis', 'Solis', 'West Suval', -520, 950, 115, 'The walled city on its promontory: the Gate of Sun Horses, the Court of Oaths, the quay, and the Coalition’s camp outside the walls.'),
  // East Suval
  area('suval-border-post', 'Elod’s Border Post', 'East Suval', -400, 499, 60, 'East Suval’s frontier: a shut stone gate, a ditch, and soldiers in light black armour.'),
  area('waystation', 'The Roofless Waystation', 'East Suval', -274, 560, 55, 'A shelter without a roof on the stone road, kept by whoever passes.'),
  area('elod', 'Elod', 'East Suval', -50, 635, 52, 'The Elodi city on its shelf of pale rock: the Sea-Road Gate, the walled precinct of the Threshold, and the ordinary city stepping down toward the water.'),
  area('elod-harbour', 'The Harbour Quarter', 'East Suval', -8, 631, 32, 'Elod’s quay, its breakwater and the strangers’ hostel: the only ground in the city a foreigner is free on, because trade requires it.'),
  area('north-light', 'The North Light', 'East Suval', -68, 538, 44, 'The stone light on the northern point, whitewashed to the sill. The Confederation allots the coast; Elod keeps this stretch of it lit and argues about none of the rest.'),
  area('sorrow-beach', 'Sorrow Beach', 'East Suval', 82, 800, 48, 'Seven roofs on the exposed east coast, boats dragged up the shingle, and a standing stone with names cut on it in three hands.'),
  area('sevenwalls', 'Sevenwalls', 'East Suval', -205, 690, 55, 'A dry valley inland: four terraces with no stream between them, a covered cistern and an olive press older than the houses.'),
  area('suval-dry-hills', 'The Dry Hills', 'East Suval', -146, 858, 62, 'The bare southern ridges above Elod: limestone bones, a shepherds’ cistern and a fold, and an old ring of ridge stones that watches the road.'),
  // Pueth
  area('tessen-crossing', 'The Tessen Crossing', 'Pueth', -105, -217, 60, 'The timber bridge over the Tessen and the army’s road post on the Pueth bank.'),
  area('bramble-woods', 'The Bramble Woods', 'Pueth', 55, -190, 60, 'Birch and thorn off the road north, and the goblin camp that has been crossing the river into Drent.'),
  area('birch-landing', 'Birch Landing', 'Pueth', 76, -246, 55, 'Cold-birch logs stacked by the water, waiting for the shipwrights’ barges.'),
  area('ordel-mouth', 'The Ordel Mouth', 'Pueth', 84, -349, 55, 'Where the Ordel runs out to the northern sea over grey shingle.'),
  area('rimeholt', 'Rimeholt', 'Pueth', -335, -362, 80, 'The palisaded timber town on the Feradom road: a garrison house, a timber yard and a cold welcome.'),
  area('cold-hearth', 'The Cold Hearth', 'Pueth', -40, -418, 55, 'A ring of stones in the open valley, black with old fires.'),
  area('grey-shoulder', 'The Grey Shoulder', 'Pueth', -268, -500, 65, 'Bare hills above the valley, where the birch gives out and the wind does not.'),
  area('feradom-road', 'The Feradom Road', 'Pueth', -424, -522, 60, 'The barrier at the edge of Pueth. Feradom lies beyond it, and the road is shut.'),
  // Elagos
  area('the-stair', 'The Stair', 'Elagos', -1256, 400, 52, 'Where the lake water falls to the Moros in four steps of shelved rock, and the ox capstan that hauls a laden barge back up it.'),
  area('ambron', 'Ambron', 'Elagos', -1130, 10, 155, 'The imperial capital fills dry ground between four lakes: high civic roofs in the north, an interlake market, and guild courts and homes along the southern avenues.'),
  area('the-narrows', 'The Narrows', 'Elagos', -1274, 176, 60, 'Where Lake Ela pinches to forty-six metres before it goes south. Everything the Lake Lands sells passes this gap.'),
  area('lake-ela', 'Lake Ela', 'Elagos', -1345, 100, 110, 'Cold, clear and old, running north-west out of sight, with one outlet at its south-eastern tip.'),
  area('nemmel', 'Nemmel', 'Elagos', -1258, 126, 42, 'A fishing hamlet on Ela’s eastern shore: six roofs, drying frames, and a smoke shed that works all year.'),
  area('the-link', 'The Link', 'Elagos', -1272, 15, 56, 'The Thelas chain’s drain into Ela, crossed on three slabs of lake-stone, with the portage path beside it.'),
  // Amod: the east end of the terrace country, charted from the road in and the shoulder above it.
  area('amod-pass-stones', 'The Amod Pass Stones', 'Amod', -676, -470, 40, 'Four standing stones on the border, an ogre who takes a toll off the road, and the first terrace wall beyond them.'),
  area('ostel-bridge', 'The Ostel Bridge', 'Amod', -772, -488, 34, 'One stone arch over the Tarvel, with an offering shelf on the upstream parapet and the town’s shoulder rising beyond it.'),
  area('ostel', 'Ostel', 'Amod', -814, -504, 44, 'The eastern dry-slope town on its shoulder: stonecutters, hard white wine, a water court and the road house that keeps the toll book.'),
  area('tir-ostel', 'Tir Ostel', 'Amod', -844, -560, 30, 'Ostel’s burial terrace above the town, where the dead lie facing down the watercourse.'),
  area('vessen', 'Vessen', 'Amod', -874, -594, 34, 'Three roofs and a springhouse on the western flank, the high channel above them, and the gate two households argue about.'),
  // Vastos: a plain with nothing built on it charts by its water and its one outcrop of strange rock.
  area('vastos-range', 'The Open Range', 'Vastos', -1560, -400, 120, 'Cold tussock from one horizon to the other, with watering pans strung across it and longhorn cattle standing in them. Nothing here breaks the wind and nothing here casts a shadow.'),
  area('vastos-sulfur', 'The Sulfur Ground', 'Vastos', -1700, -430, 46, 'A crust of pale sinter on the plain’s western fall, a warm pool at its middle, and three vents that have not stopped breathing. The grass stops in a line where the crust starts.'),
  area('vastos-braids', 'The Braided Reach', 'Vastos', -1539, -106, 70, 'Where the ground goes flat the river stops choosing: three shallow channels round bars of grey gravel, and none of them is the river.'),
  area('vastos-basins', 'The Eastern Basins', 'Vastos', -1330, -300, 100, 'Two small cold lakes on the fall toward the lake country, sedge to the waterline. Everything about them is a rehearsal for Elagos except the size.'),
  // Meneth: a country you chart by which ridge you are on and which valley you are in.
  area('meneth-ridges', 'The Meneth Ridges', 'Meneth', -1870, -240, 100, 'Rounded ridge after rounded ridge, all of them running east and west, with an open valley between each pair. Every one is a climb and none of them needs route-finding, which between the mountains and the lake country is the whole point.'),
  area('meneth-nut-slopes', 'The Nut Slopes', 'Meneth', -1905, -150, 60, 'Wild chestnut and walnut standing well apart on the lower ridge faces, hay meadow below them and close-grown hardwood above. The spacing gives it away: nothing in a wood grows that far from its neighbour by accident.'),
  area('meneth-becks', 'The Valley Becks', 'Meneth', -1790, -74, 90, 'Cold shallow water on every valley floor, running east off the ridges toward the one river that takes them. You step over any of them without thinking, which is why none has ever been bridged.'),
  area('meneth-open-end', 'The Open End', 'Meneth', -1620, 90, 80, 'Where the ridges lower and widen and the valley floors run together. There is no line here at which the upland stops and the lake country starts, and nobody who lives on either side has ever felt the want of one.'),
  // Caricas: a country that charts as one corridor, one shelf and one great river.
  area('carica-corridor', 'The Carica Corridor', 'Caricas', -1740, 430, 110, 'Six miles of riverbank nobody has ever cleared: old-growth forest standing to the water on both sides, and somewhere in it the vel-caric, which does not run when you come and does not look away.'),
  area('carica-upper', 'The Upper Carica', 'Caricas', -1660, 300, 62, 'Where the river comes off the eastern shelf: quick, cold, and running over rock and gravel in a cut too steep to stand beside. A summer storm on the plateau reaches here two days later.'),
  area('caricas-shelf', 'The Eastern Shelf', 'Caricas', -1780, 210, 90, 'The rough, dry upland the Carica comes off, fifteen metres above the corridor: stone at the surface, thin soil, and no water on it anywhere.'),
  area('lizeem-bank', 'The Lizeem Bank', 'Caricas', -2170, 200, 110, 'The great river along the western edge of the country: deep, slow, wide enough for light boats, and not crossable by anybody on foot for the whole of its length here.'),
  // Nesdor: a country with almost nothing in it to chart, which is the point of it.
  area('nesdor-head', 'The Valley Head', 'Nesdor', -1570, 380, 76, 'The last of the branch country: a shallow broad valley with hazel and oak on its slopes and a beck on its floor. South and east of here there are no more valleys, and nobody has ever drawn a line where that starts.'),
  area('nesdor-braids', 'The Braided Water', 'Nesdor', -1660, 660, 96, 'Where the gradient dies the water stops keeping to one channel: three shallow threads side by side round low bars of sand, a different shape after every flood season and never deep enough to matter.'),
  area('nesdor-flats', 'The Nesdor Flats', 'Nesdor', -1420, 730, 120, 'Dark alluvial ground with the relief measured in feet, cattle standing about on it, and an open horizon that goes on being open until it is the Moros. Nothing here breaks the sky.'),
  area('lizeem-bend', 'The Lizeem Bend', 'Nesdor', -1630, 740, 90, 'Where the great river turns south-east along the foot of the Flats and takes everything off them with it. A hundred paces of deep water; the far bank is another country and there is no way to it here.'),
  // Eer: a country with one line drawn across it, and the chart records which side of it you are on.
  area('eer-loam', 'The Black Loam', 'Eer', -1250, 1000, 110, 'The heavy inland half: alluvium the great river has been laying down since before anybody counted, black to the depth of a spade, holding water the whole year and carrying grass to the knee. Everybody who has ever wanted this country has wanted this.'),
  area('eer-channels', 'The Two Channels', 'Eer', -1120, 1100, 95, 'Shallow water leaving the loam and going south-east to the sea, widening and slowing until it stops keeping to one bed. Herons stand in all three threads of it and do not move when you do.'),
  area('eer-scrub', 'The Dry Half', 'Eer', -1070, 1180, 100, 'Where the rain stops coming in summer: tawny grass, grey cushion scrub that smells of itself when you walk through it, and wild olives standing singly with nothing near them. Nobody drew a line here; the weather changed under you a hundred paces back.'),
  area('eer-bays', 'The Low Bays', 'Eer', -930, 1250, 95, 'The Iberos coast of Eer: low headlands and small sheltered bays, none of them big enough to be a harbour. No cliff, no proper beach — the grass thins, gives out, and the water is there. Gulls on all of it, and something with a fin out past the surf.'),
  // Isareos: a country charted by which shoulder you are on and which valley is under it.
  area('isareos-shoulders', 'The Isareos Shoulders', 'Isareos', -2520, -60, 110, 'The high ground between the valley heads: the same modest hundred-foot rise over and over, grass to the top of every one and no tree on any. Every one is a climb and none of them needs route-finding, which is the whole use of this country to everybody who crosses it.'),
  area('isareos-hollows', 'The Thorn Hollows', 'Isareos', -2610, 20, 95, 'Hawthorn and blackthorn down in the folds and on the lee of every shoulder, in threes and fours and nothing tall enough to stand under. On open hill country the wind decides where a woody thing may live, and it has decided here.'),
  area('isareos-gallery', 'The Isa Gallery', 'Isareos', -2620, 116, 100, 'Alder, willow and hazel two trees deep along the Isa and not one pace further. There is no forest hex anywhere in this country: this ribbon is the whole of the wood in it, and the valley communities cut it and let it grow again.'),
  area('isareos-west-rim', 'The Western Rim', 'Isareos', -2800, 30, 100, 'Where the hills give out against the Ibenwood: the grass goes thin, short and grey, the shoulders flatten, and the wind comes off the forest with nothing at all to break it.'),
  // Nethereum: a country charted by how deep in the dish you are standing.
  area('nethereum-hollow', 'The Hollow', 'Nethereum', -2600, 300, 105, 'The northern shoulder of the basin, where the ground stops being ordinary and starts going down. Six hundred metres across and eight deep, with the fall spread over two hundred paces: there is no bank anywhere and no moment at which you have arrived.'),
  area('nethereum-basin', 'The Deep Basin', 'Nethereum', -2545, 372, 110, 'The bottom of it, which the Nethrani call the nethoss and use for any situation that cannot get worse. The richest pasture in the inner branch country, knee-deep and soft and standing in its own damp — and under water again every spring, which is why nobody is on it but the cattle.'),
  area('nethereum-threads', 'The Wet Threads', 'Nethereum', -2620, 370, 90, 'Where the hill-streams stop being streams: the channel spreads, the water goes into the ground, and what runs on across the meadow is a line of rush and sedge a few paces wide. Not a marsh — a wet line in a field, of the kind that tells a walker where to put his feet.'),
  // Pulled back onto the country's own ground rather than sat on the crossing itself: the
  // ford is on the southern corner of Nethereum and a disc centred on it was 42% Ovesos.
  area('neth-ford', 'The Neth Ford', 'Nethereum', -2320, 545, 50, 'Gravel, shin-deep, below where the river comes off the desert edge. The only dry-shod way south out of this country, and the only place on the Neth that is one: everything below it runs deep to the Lizeem and nobody has bridged any of it.'),
  area('nethereum-dry-corner', 'The Dry Corner', 'Nethereum', -2880, 206, 95, 'The one corner the basin does not drain, against the Nether Desert. Two metres lower than the rim and outside the catchment altogether: the grass goes short, thin and grey, and the wind off the desert margin has nothing to break it.'),
  // South Suval: the lake country and its hills (src/south-suval-world.js).
  area('imlamdris', 'Imlamdris', 'South Suval', -52, 1158, 62, 'The oldest city on the peninsula, on terraces climbing from the Stillwater to the Star Terrace, facing the water and turning its back on the road.'),
  area('the-stillwater', 'The Stillwater', 'South Suval', -100, 1241, 58, 'Spring-fed and never dry: the only lake on the peninsula, misted in the mornings, with reed round its open shore.'),
  area('south-suval-ridge', 'The Ridge', 'South Suval', -150, 1075, 95, 'Pale limestone across the north of the country, cold-summer ground where little grows but cushion scrub and stone.'),
  area('imlamdris-pass', 'The Hill Pass', 'South Suval', -40, 1050, 75, 'The saddle east of the ridge and the road over it, then west under the ridge to the barred southern hill gate in the East Suval frontier.'),
  area('eastern-slopes', 'The Eastern Slopes', 'South Suval', 0, 1241, 55, 'Vines in rows on the hill across the water from the city, facing the morning sun.'),
  area('southern-cliffs', 'The Southern Cliffs', 'South Suval', -150, 1335, 100, 'The ridge country’s drop to the sea: high ground to the edge, then rock and swell. A cove where the grass comes down, and seabirds on the tops.'),
  // Feradom: the barrier hills along its inland edge, and the six passes through them (src/feradom-world.js).
  area('feradom-barrier-hills', 'The Barrier Hills', 'Feradom', -307, -629, 125, 'Steep forested hills along the duchy’s inland edge, faced with a band of bare rock toward the border, with beacons on the summits between the passes.'),
  area('feradom-ordel-gap', 'The Ordel Gap', 'Feradom', -148, -587, 60, 'The easternmost pass: a gorge above the Ordel, a tower on its rim, and a castle across the basin behind.'),
  area('feradom-road-pass', 'The Road Pass', 'Feradom', -421, -610, 70, 'The Feradom road’s pass: a gorge, a tower above the narrows, and the great castle of the passes, its gate toward Pueth shut.'),
  area('feradom-birch-pass', 'The Birch Pass', 'Feradom', -586, -705, 60, 'A narrow gorge on the Amod border, west of the corner where Pueth’s border turns, and a small castle behind it.'),
  area('feradom-amod-pass', 'The Amod Pass', 'Feradom', -728, -850, 60, 'The pass over against Amod: a gorge, its tower, and a castle filling the basin.'),
  area('feradom-stone-pass', 'The Stone Pass', 'Feradom', -830, -908, 60, 'A castle in a basin cut from the East Lotharn’s foothills, the range’s grey slopes above it.'),
  area('feradom-fir-pass', 'The Fir Pass', 'Feradom', -896, -1022, 60, 'The westernmost pass, deep in the firs between the East Lotharn and the sea.'),
  // The East Lotharn: the old range's valleys and tops (src/east-lotharn-world.js).
  area('kemrath', 'Kemrath', 'East Lotharn Mountains', -1330, -835, 125, 'A broad high valley with a flat floor of deep soil, fields in strips down both sides of its water and vines on its north wall.'),
  area('the-col', 'The Col', 'East Lotharn Mountains', -1080, -895, 60, 'The saddle at Kemrath’s head between the two massifs, the divide and the pass’s highest section. The pass inn stands on it.'),
  area('stonegate', 'Stonegate', 'East Lotharn Mountains', -1080, -1080, 110, 'The gorge the pass goes down to the Mithala plain: white water between walls of layered stone.'),
  area('upper-olveth', 'Upper Olveth', 'East Lotharn Mountains', -1330, -1060, 110, 'An open high valley of the north face, sheep grass at its head and its beck running down to the border water.'),
  area('central-massif', 'The Central Massif', 'East Lotharn Mountains', -1300, -955, 110, 'Old forest to a grazed top, and the iron and coal of the central range in its south face.'),
  area('eastern-massif', 'The Eastern Massif', 'East Lotharn Mountains', -930, -830, 110, 'The highest ground in the range, forested to a rounded open summit.'),
  area('border-water', 'The Border Water', 'East Lotharn Mountains', -1250, -1165, 90, 'The range’s northern foot, where the forest gives out above a mountain river and the Mithala plain begins.'),
  // The Ascarth Peninsula, on the far bank of the Lizeem's mouth (src/ascarth-world.js).
  area('ascarth-neck', 'The Neck', 'Northern Ascarth', -1455, 1335, 55, 'Where the peninsula leaves the mainland: low grass at Gala’s own level between the western sea and the bay under the Lizeem’s mouth, before the ground begins to rise.'),
  area('interior-hills', 'The Interior Hills', 'Northern Ascarth', -1365, 1580, 105, 'Two rounded rocky hills and a saddle between them, wooded in evergreen oak with pine on the tops, and green stain on the stone of the southern one where the copper is.'),
  area('ascarth-west-cliffs', 'The West Cliffs', 'Northern Ascarth', -1530, 1535, 55, 'Grass to the edge and then a fall to rock and swell: the peninsula’s western shore, with gulls on the tops.'),
  area('ascarth-east-bays', 'The East Bays', 'Southern Ascarth', -1010, 1840, 70, 'Sheltered bays between low headlands on the finger’s eastern shore, each with its beach: the only good anchorage the peninsula has.'),
  area('ascarth-finger', 'The Finger', 'Southern Ascarth', -870, 2060, 90, 'Thin grass and stone rolling between two seas, a wild olive here and there and nothing taller, cliffs on the west.'),
  area('ascarth-tip', 'The Tip', 'Southern Ascarth', -720, 2255, 55, 'The end of the peninsula: cliffs round three sides, sea-plungers diving off it, and Selemi across the channel to the south.'),
  area('lizeem-reach', 'The Lower Lizeem', 'Eer', -1420, 1080, 110, 'The last reach of the great river, going grey with what it is carrying. Gala is on the far bank and there is no way to it: not here, and not anywhere along this side.'),
  // Gala: one plain charted by which of its three climates you are in (src/gala-world.js).
  area('gala-dry-north', 'The Dry North', 'Gala', -1690, 1040, 105, 'The interior weather and no shelter from it: bunch grass in tussocks with bare ground between them, grey wormwood and saltbush, and a hot wind off the Oves Desert. Grazed rather than farmed, the lore says, and nobody grazing it.'),
  area('gala-wash', 'The Dry Wash', 'Gala', -1722, 1122, 55, 'A bed of grey gravel between low cut banks, running south-east off the steppe shoulder. Water in it for a few days after the winter rains and none the rest of the year.'),
  area('oveth-ford', 'The Oveth Ford', 'Gala', -1772, 978, 40, 'Where the Oveth narrows over rock below the corner of three countries: shin-deep and quick, and the only place on this reach it is crossed. Below it the river deepens toward the Lizeem.'),
  area('gala-maquis', 'The Maquis', 'Gala', -1680, 1262, 90, 'Tawny grass and low aromatic scrub on every rise, never closed, and wild olive and fig standing singly a long way apart. The rain comes off the sea here and not off the desert.'),
  area('gala-mouths', 'The Braided Mouths', 'Gala', -1772, 1372, 58, 'The plain’s water coming down to the Iberos Sea in three threads round bars of sand, reed and tamarisk thick along all of them, and black geese on the widest of the water.'),
  // Ovesos and the Oves Desert: one climate over both of them, so the chart names them by what the
  // ground is made of and where the water is (src/oves-world.js).
  area('oves-upland-grass', 'The Upland Grass', 'Ovesos', -2050, 592, 110, 'The northern rows, six metres above the river: bunch grass in tussocks with bare earth showing between them, buff eleven months of the year. The lore\u2019s herders move flocks across this ground between the summer plateau and the winter valley edge, and none of them is here.'),
  area('oves-sorten', 'The Sorten', 'Ovesos', -1956, 800, 62, 'The wide seat: a bench of bottomland a metre below the plain where the Oveth slows and spreads, with poplar, willow and tamarisk along the water in a dark line two trees deep. The only green ground in the country.'),
  area('oves-open-plain', 'The Open Plain', 'Ovesos', -1790, 782, 92, 'The southern rows, thinner and flatter than the grass above them: short bunch grass going to bare ground, grey wormwood and blue-grey saltbush where the soil gives out, stones on the rises, and a vulture over it.'),
  area('oves-rim-hills', 'The Rim Hills', 'Oves Desert', -2438, 812, 92, 'Three low rounded hills stepping south-west down the desert\u2019s north-western rim, broad-backed and worn, with bare stone through the thin soil on their tops. They are the whole reason the country behind them is a desert.'),
  area('oves-dry-channels', 'The Dry Channels', 'Oves Desert', -2250, 878, 86, 'Cut beds of coarse gravel and boulders running east-south-east off the hills\u2019 feet, deep enough to stand in and dry in every one of them, with one reach of one of them holding water below the gravel and a hundred paces of green in it.'),
  area('oves-wedge', 'The Dry Wedge', 'Oves Desert', -2170, 986, 96, 'The floor of the Oves: worn rock through a poor thin soil, gravel pavement wherever the rock is up, perennial scrub spaced wide enough to walk between, and a stubble of dead seed-heads in the pockets where a wet year\u2019s grasses would be.'),
  area('oves-apex', 'The Wedge\u2019s Point', 'Oves Desert', -1878, 968, 44, 'The eastern point of the desert, where the Oveth comes down off the Ovesian border and the southern border stream comes in to meet it. The lowest ground in the Oves and the only water anywhere near it.'),
  // The West Lotharn (src/west-lotharn-world.js): the spine of the range, its two valleys, the col
  // the two halves join at, and the two lesser masses that are not summits so much as fronts.
  area('west-lotharn-crest', 'The Crest', 'West Lotharn Mountains', -1842, -792, 95, 'The highest crest of the Lotharn: pale grass above worn shoulders and courses of cliff, with the long valley far below. Slanting ramps and narrow shelves wind up through the rock.'),
  area('west-lotharn-long-valley', 'The Long Valley', 'West Lotharn Mountains', -1800, -668, 110, 'A flat floor of deep soil fifty paces across with old wood climbing away from it on both sides, and a divide in it where its two becks part — one east to the Vastos margin, one west the whole length of the range.'),
  area('west-lotharn-west-reach', 'The Western Reach', 'West Lotharn Mountains', -2150, -500, 110, 'The long fall of the valley floor from the divide to the hills above Yunethre, with the cold head standing over it on one side and the south rampart on the other.'),
  area('west-lotharn-north-valley', 'The North Valley', 'West Lotharn Mountains', -1876, -890, 70, 'The range’s drainage to the Mithala plain, down the notch in the massif between the crest’s north shoulder and the north summit: steeper than the long valley, open all the way, and the one break in the forested wall the plain sees.'),
  area('west-lotharn-col', 'The Col', 'West Lotharn Mountains', -1618, -848, 45, 'Where the two halves of the Lotharn join: the gap at forty-three metres that the East Lotharn’s Kemrath runs out through, with the West’s east arm on one side and the East’s south-west peak on the other. The water turns north down the notch from here.'),
  area('west-lotharn-cold-head', 'The Cold Head', 'West Lotharn Mountains', -2380, -470, 95, 'The mountains at the western tip of the range, furthest from the plain and first to meet the westerly weather. Colder winds scour the exposed crown above the sheltered wood.'),
  area('west-lotharn-rampart', 'The South Rampart', 'West Lotharn Mountains', -2250, -340, 70, 'The range’s southern wall, one hex deep above Isareos: cliffs in courses standing over ordinary country, with the lake country’s low hills beginning immediately below them.'),
  // Peblos: the islands, which are charted from the water as much as from the land.
  area('cobble', 'Cobble', 'Peblos', 336, 432, 45, 'The one village in the Pebbles: a stone quay, drying racks, ten roofs on a shelf of rock, and the Empire’s tally shed.'),
  area('peblos-headland', 'The Cobble Headland', 'Peblos', 402, 366, 42, 'The northern cape of the main island, with the unlit headland light on its crown.'),
  area('peblos-south-shore', 'The Southern Shore', 'Peblos', 410, 490, 45, 'The low neck of the main island: shingle, a cove the seals have, and the sea on both sides of you.'),
  area('longstone', 'Longstone', 'Peblos', 375, 159, 70, 'The long bare island north of Cobble, with the Empire’s abandoned beacon on its ridge.'),
  area('gull-scarp', 'Gull Scarp', 'Peblos', 250, 289, 55, 'A white-streaked rock between Cobble and the Drent shore, and every gull in the Stills.'),
  area('pilots-stone', 'The Pilot’s Stone', 'Peblos', 50, 289, 55, 'The nearest Pebble to Drent, and the mark the pilots steer by out of Tidehaven.'),
  area('wrack-island', 'Wrack Island', 'Peblos', 150, 462, 55, 'Shingle, thrift, and the ribs of the Sea-Mare standing out of it.'),
  area('saltings', 'The Saltings', 'Peblos', -100, 375, 55, 'The westernmost Pebble: salt pans in the turf and one standing stone.'),
  // West Izol: the western half of the island of Izol, across the Izoli Channel.
  area('izolveth', 'Izolveth', 'West Izol', 58, 1776, 62, 'The largest town on the island and not its capital: a quay, two moles, a ropewalk, and a meeting house at the top of the cut that is plainly not a palace.'),
  area('izol-headland', 'The Harbour Headland', 'West Izol', 150, 1668, 46, 'The rock that shelters Izolveth\u2019s harbour, with the Sea Gate in the cleft at its head and the channel on three sides.'),
  area('izolveth-camp', 'The Camp Above Izolveth', 'West Izol', 180, 1886, 56, 'Tent lines and a drill ground on the pasture above the town, under seven banners and three generals.'),
  area('ardveth', 'Ardveth', 'West Izol', -90, 1818, 58, 'Six roofs and a shingle beach in the next cove but one, facing the open channel.'),
  area('kelvath', 'Kelvath Cove', 'West Izol', 252, 1750, 50, 'A slip, a saw pit and a hull on the stocks with no planking on her, in a cove easier to reach by sea than by land.'),
  area('sightstone', 'The Sightstone', 'West Izol', 382, 1806, 60, 'The shoulder of the Hearth Road where all three Presences stand up at once. The Hearthstone itself is further in.'),
  area('long-pasture', 'The Long Pasture', 'West Izol', 272, 1956, 62, 'The low inland grass where the highland flocks come down, with a dry-stone fold and a cairn.'),
]);

export const SUBREGION_IDS = Object.freeze(SUBREGIONS.map(item => item.id));
const byId = new Map(SUBREGIONS.map(item => [item.id, item]));
export const subregion = id => byId.get(id) ?? null;

/** The named areas a point stands in, nearest first. */
export function subregionsAt(x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return [];
  return SUBREGIONS.filter(item => Math.hypot(item.x - x, item.z - z) <= item.radius)
    .sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z));
}

export function validateMapFogSnapshot(data, { allowMissing = true } = {}) {
  if (data === undefined) return allowMissing;
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.version !== MAP_FOG_VERSION) return false;
  if (!Array.isArray(data.cells) || data.cells.length > 20000 || !Array.isArray(data.subregions)) return false;
  if (!data.cells.every(key => typeof key === 'string' && /^-?\d{1,4},-?\d{1,4}$/.test(key))) return false;
  return data.subregions.every(id => byId.has(id));
}

export function createMapFog({ onEvent = () => {} } = {}) {
  const cells = new Set(), glimpsed = new Set(), found = [];

  function glimpseAround(q, r) {
    glimpsed.delete(`${q},${r}`);
    const fresh = [];
    for (const [dq, dr] of HEX_NEIGHBOURS) {
      const key = `${q + dq},${r + dr}`;
      if (!cells.has(key) && !glimpsed.has(key)) { glimpsed.add(key); fresh.push(key); }
    }
    return fresh;
  }

  /** Chart the ground about a point. Returns what was new. */
  function reveal(x, z) {
    if (!Number.isFinite(x) || !Number.isFinite(z)) return { cells: [], glimpsed: [], subregions: [] };
    const home = hexAt(x, z), key = `${home.q},${home.r}`, newCells = [];
    if (!cells.has(key)) { cells.add(key); newCells.push(key); }
    const newGlimpses = newCells.length ? glimpseAround(home.q, home.r) : [];
    const newAreas = [];
    for (const item of subregionsAt(x, z)) {
      if (found.includes(item.id) || !chartKnowsPoint(cells, item.x, item.z)) continue;
      found.push(item.id); newAreas.push(item.id);
      onEvent({ type: 'subregion-found', id: item.id, name: item.name, region: item.region, note: item.note });
    }
    if (newCells.length) onEvent({ type: 'chart-widened', cells: newCells.length });
    return { cells: newCells, glimpsed: newGlimpses, subregions: newAreas };
  }

  const knows = (q, r) => cells.has(`${q},${r}`);
  const knowsPoint = (x, z) => chartKnowsPoint(cells, x, z);

  /** The chart for the journal: every named area, and whether it has been found. */
  function view() {
    // A legacy named area can straddle the edge of a visited hex. Keep its saved discovery,
    // but do not print its detailed location until the hex containing it has been entered.
    const detailed = found.map(id => byId.get(id)).filter(item => knowsPoint(item.x, item.z));
    return {
      cells: [...cells], glimpsed: [...glimpsed], cellCount: cells.size,
      subregions: SUBREGIONS.map(item => ({ ...item, known: found.includes(item.id) && knowsPoint(item.x, item.z) })),
      found: detailed, foundCount: detailed.length, total: SUBREGIONS.length,
    };
  }

  function snapshot() { return { version: MAP_FOG_VERSION, cells: [...cells], subregions: [...found] }; }

  function restore(data) {
    cells.clear(); glimpsed.clear(); found.length = 0;
    if (!validateMapFogSnapshot(data, { allowMissing: false })) return false;
    for (const key of data.cells) cells.add(key);
    // Glimpses are derived, never saved or counted as walking. Every old saved cell remains
    // confirmed, including a deliberate developer reveal; nothing migrates into extra visits.
    for (const key of cells) glimpseAround(...key.split(',').map(Number));
    for (const id of data.subregions) found.push(id);
    return true;
  }

  return { reveal, knows, knowsPoint, view, snapshot, restore,
    get cells() { return [...cells]; }, get glimpsed() { return [...glimpsed]; }, get found() { return [...found]; } };
}
