/**
 * The animals of Navarth, West Pyros, the Ganesh Desert and the Ganesh Plain, as ranges for the
 * western wildlife rigs (`src/west-regions-life.js` draws them, instanced and distance-culled, and
 * they are ambient: nobody can attack, catch or speak to them).
 *
 * **One river, one wood, eight hollows, and a great deal of nothing.** Eighty-one of this block's
 * hundred and seven hexes read `BWh` - hot desert - on the World Builder map, which is a full
 * climate step drier than the Oves Desert's `BSh`, and the Oves's own report already argued that
 * emptiness is the honest reading of a dry country rather than a failure to fill it. So the
 * seventeen ranges below are not spread evenly: **seven of them are on the Vaellir or its green
 * mouth**, because the great river is the only permanent water in the southwest and everything that
 * needs water is on it; three are on Navarth's plateau and at the one hex of wood at its tip; four
 * are in the Ganesh Plain's depressions, which is where the grass goes in a drought phase; and
 * **the Ganesh Desert, which is the largest of the four countries at thirty-one hexes, has three**,
 * two of them birds in the air. That is the truthful population of a country whose own lore says
 * "the Ganesh in a severe dry year presents a surface that appears essentially lifeless."
 *
 * What the lore actually names here, and where each range comes from:
 *  - the **bone-bird**, "the large scavenger of the desert margins... a heavy, bald-headed vulture
 *    relative with a wingspan approaching two and a half meters", which the overview says is "the
 *    most visible large animal of the Moreshe from caravan routes" and is "often the first indicator
 *    of water, since both potential death and potential life concentrate around it". This is its own
 *    ground - the Ganesh is the northern margin of the Moreshe desert system - and it is the one new
 *    rig this job spent (`src/west-regions-life.js`);
 *  - the **dry-plateau hawk**, which "hunts the upland grasslands" of the eastern rain-shadow
 *    country, over Navarth's rim, which is exactly that;
 *  - everything else is an extension and says so in its own note.
 *
 * **What is deliberately absent, and why.** The overview's other animals for this quarter cannot be
 * built honestly:
 *  - the **terrace leopard** of West Pyros is a predator of terraced slopes, and the atlas gives
 *    West Pyros no hills at all and nobody to build the terraces;
 *  - the **road fox** is "associated with caravan routes and settlement edges", which are people;
 *  - the **spine lizard** wants a gait the game has not got (bask long, then dart) and the
 *    **sand-cat** cannot be built at all until there is a night for it to be nocturnal in;
 *  - the **river fox** - the *vel-caric* - is not here either, and that is a measurement rather than
 *    a judgement. It is an animal of the Lizeem's inner branches, the Vaellir is not in that system,
 *    and the one river margin in Navarth is the Alezhor Water, which runs **on the border** with
 *    unbuilt country: measured, the widest clear run behind any point of its own bank is twelve
 *    metres, and a fox that never flees needs a hundred. There is nowhere in this block to put one.
 *  - the **Ganesh dustback** is named by `ganesh_desert.md` and is left out on purpose, in the
 *    report's open questions: the lore describes its behaviour and never its body, and the only
 *    dustback the rest of the lore describes is a domestic bovid, which is somebody's.
 *
 * **Nothing domestic.** Navarth's whole export is the grey sheep, the Ganesh Plain's whole economy
 * is the pastoral herds that move by the drought cycle, and the caravan crossing runs on pack
 * animals. Every one of those belongs to people; a flock with nobody near it is still somebody's
 * flock. There is none.
 *
 * Every home site below was measured on the built world, not guessed, and
 * `tests/southwest-world.test.js` holds each one to its ground.
 */
const freeze = Object.freeze;
const zone = (id, species, region, radius, box, sites, note, traits = {}) => freeze({
  id, species, region, radius, scale: 1, keepRegion: true,
  minX: box[0], maxX: box[1], minZ: box[2], maxZ: box[3],
  sites: freeze(sites.map(site => freeze(site))), note, ...traits,
});

export const SOUTHWEST_WILDLIFE_ZONES = freeze([
  // ---------------------------------------------------------------------
  // Navarth: the plateau, and the one hex of wood at the top of it
  // ---------------------------------------------------------------------
  zone('navarth-hares', 'upland-hare', 'Navarth', .3, [-3410, -3281, 1069, 1257], [[-3321, 1217], [-3370, 1209], [-3370, 1109]],
    'Extension: the west’s upland hare on the sweeps between the plateau’s swells, which is the one ground in the southwest that is both open and has something growing on it every year. It is the same short bare scrub the animal already keeps on the Vastos plain, in Gala’s dry north and in the Oves, taken one climate step drier - and this is as dry as it goes. There are none in the Ganesh below the rim.'),
  zone('navarth-wood-deer', 'red-deer', 'Navarth', .3, [-3345, -3184, 853, 970], [[-3224, 923], [-3305, 930], [-3303, 893]],
    'Extension: deer on the open ground at the edge of the north wood, the block’s one `forest` hex, where the air turns `Csb` and the South and East Ibenwood begin over the border. A deer is seen where a wood has open ground beside it, and this is the only wood in a hundred and seven hexes with anything at all beside it. Two hundred paces south of here the ground is hot desert and there is nothing for a deer to eat.'),
  zone('navarth-rim-hawk', 'plateau-hawk', 'Navarth', .3, [-3560, -3400, 1120, 1280], [[-3480, 1200]],
    'The fauna overview’s dry-plateau hawk, which "hunts the upland grasslands" of the eastern rain-shadow country. **Not an extension**: this is an upland grassland in rain-shadow country, and from the western rim the bird has thirty metres of fall and the whole Ganesh under it. The Oves’s rim hawk is the same argument one country east.',
    { air: 33 }),
  // ---------------------------------------------------------------------
  // West Pyros: the Vaellir, which is where nearly everything alive in the southwest is
  // ---------------------------------------------------------------------
  zone('vaellir-otters', 'otter', 'West Pyros', .35, [-2901, -2817, 1188, 1299], [[-2861, 1228], [-2857, 1259]],
    'Extension by one river system: the Carica’s otter, on the one piece of deep permanent water in the southwest. The Vaellir below its ford is slow, deep and walled, which is what an otter wants and what it has to be able to go into when it is walked at - and there is nothing else within forty miles that it could.',
    { scale: 1.2 }),
  zone('vaellir-herons', 'wading-bird', 'West Pyros', .4, [-2955, -2853, 1090, 1234], [[-2915, 1130], [-2908, 1162], [-2893, 1194]],
    'Extension: the overview’s wading assemblage is catalogued on the Lizeem system and the Vaellir is a different river reaching a different sea, so these are the same birds on the nearest equivalent water rather than the documented population. A large slow river with a gallery on it is a heron’s living wherever it runs.'),
  zone('vaellir-ducks', 'duck', 'West Pyros', .3, [-3078, -2933, 889, 1066], [[-3040, 931], [-3011, 947], [-3002, 975], [-2974, 1028], [-2951, 1047]],
    'Duck on the Vaellir’s ford reach, floating: the upper quarter where the atlas draws the river `small` and it runs shin-deep and quick over gravel. Below the ford it is a wall of deep water and no duck sits on it. They are a raft rather than a scatter because in this whole quarter of the continent there is one place for waterfowl to be.',
    { float: true }),
  zone('vaellir-mouth-stilts', 'stilt', 'West Pyros', .35, [-2666, -2559, 1468, 1600], [[-2626, 1508], [-2617, 1538], [-2599, 1560]],
    'Extension: stilts on the last silt before the river reaches the sea, where the banks flatten out and the water goes wide and shallow over its own bars. It is the same ground the Mithala’s river-mouth stilts stand on at the other end of the continent, and for the same reason: fresh water meeting salt puts more in the mud than either does alone.'),
  zone('green-tip-gulls', 'gull', 'West Pyros', .3, [-2619, -2486, 1641, 1746], [[-2579, 1706], [-2548, 1681], [-2526, 1706]],
    'Gulls over the green tip, which is the block’s one hex of `Csa` Mediterranean grass and the only piece of sea coast in the southwest a traveler can stand on and find anything growing. They are here because the sea is: this is the mouth of the largest river in the quarter and the gulls work it the way they work every mouth on the Iberos.'),
  zone('pyros-hares', 'upland-hare', 'West Pyros', .3, [-3049, -2871, 1194, 1326], [[-2911, 1286], [-3009, 1277], [-2963, 1283], [-2997, 1234]],
    'Extension: hares on the open plain’s bunch grass, a few hundred metres back from the river where the tussocks stand furthest apart. The `BSh` columns are the only proper steppe in the southwest and this is the animal that lives on steppe everywhere else in the game.'),
  zone('pyros-harrier', 'harrier', 'West Pyros', .3, [-2992, -2832, 1149, 1309], [[-2912, 1229]],
    'Extension: no lore file for this quarter names a raptor over open ground. Eight hundred metres of bunch grass with one line of trees down the side of it is a harrier’s whole living, and a harrier quarters low over it rather than soaring - nine metres up, following the ground as it rises and falls under the beat.',
    { air: 9, circle: 34, period: 19, quarter: 70, bob: 1.6, follow: true }),
  // ---------------------------------------------------------------------
  // The Ganesh Desert: three ranges over thirty-one hexes, and that is the honest reading
  // ---------------------------------------------------------------------
  zone('ganesh-bone-birds', 'bone-bird', 'Ganesh Desert', .3, [-3640, -3440, 1370, 1530], [[-3515, 1449], [-3590, 1480]],
    'The fauna overview’s own animal on its own ground: "the large scavenger of the desert margins... the most visible large animals of the Moreshe from caravan routes". The Ganesh is the northern margin of that desert system and this is the country the bird is named for. Two of them, a long way up and a long way apart, over ground with nothing else moving on it - which is what a traveler crossing this desert actually sees.',
    { air: 44 }),
  zone('damp-reach-bone-bird', 'bone-bird', 'Ganesh Desert', .3, [-3591, -3431, 1487, 1647], [[-3511, 1567]],
    'A third bone-bird, and it is over the damp reach, because the overview says of them that "they are often the first indicator of water, since both potential death and potential life concentrate around it" - and the damp reach is the nearest thing to water in the Ganesh. A traveler who sees this bird from a mile off and walks to it finds green scrub in a dry bed and nothing to drink.',
    { air: 38 }),
  zone('damp-reach-hares', 'upland-hare', 'Ganesh Desert', .3, [-3575, -3417, 1521, 1603], [[-3535, 1561], [-3457, 1563]],
    '**The only animal on the ground in the whole Ganesh Desert**, and it is on the one green thing in it. The lore is explicit about the rest: "in a severe dry year, there is nothing to eat in the Ganesh and the pastoral communities do not attempt it", and "the perennial scrub retreats toward the water-concentration points". So the scrub is at the damp reach and so is this. Extension, at the animal’s absolute dry limit - one climate step past the Oves Desert, which is where the west’s hare was already said to be at its limit.'),
  // ---------------------------------------------------------------------
  // The Ganesh Plain: everything alive is in a depression
  // ---------------------------------------------------------------------
  zone('middle-pan-hares', 'upland-hare', 'Ganesh Plain', .3, [-2915, -2762, 1626, 1788], [[-2862, 1674], [-2802, 1666], [-2875, 1748]],
    'Extension: hares in the middle depressions, which in a drought phase is the only place on this plain with grass in it - "the perennial grasses contract to the water-concentration points, the annuals disappear". The routes across the plain go from one hollow to the next for the same reason the hares are in them.'),
  zone('long-pan-hares', 'upland-hare', 'Ganesh Plain', .3, [-3108, -2958, 1627, 1754], [[-2998, 1714], [-3019, 1685], [-3068, 1667]],
    'Extension: the same animal in the western depressions, a few hundred metres nearer the desert. Two bands rather than one wide one because on this plain the hollows are the country and the open clay between them is not: a band spread across both would be walking over ground that has nothing on it.'),
  zone('ganesh-plain-harrier', 'harrier', 'Ganesh Plain', .3, [-3045, -2885, 1638, 1798], [[-2965, 1718]],
    'Extension: a harrier quartering the depression corridors, which is where everything small on this plain is. It follows the line of the hollows rather than the compass, which is also what every route across this plain does.',
    { air: 9, circle: 30, period: 18, quarter: 64, bob: 1.5, follow: true }),
  zone('ganesh-plain-bone-bird', 'bone-bird', 'Ganesh Plain', .3, [-2958, -2798, 1727, 1887], [[-2878, 1807]],
    'One bone-bird over the southern plain, which is the northern edge of its range: the overview puts the bird on the desert margins and this plain is the margin’s margin - "the Ganesh Plain lies on the northern side of the Ganesh Desert’s diffuse boundary". The pastoral communities that use this ground in the good years read the bird the way the caravan guides do.',
    { air: 40 }),
]);
