/**
 * The southwestern block: Navarth, West Pyros, the Ganesh Desert and the Ganesh Plain, as ground,
 * climate, water margin and named natural places.
 *
 * Pure: no three, no DOM. `src/west-ground.js` puts the landforms here into the ground
 * (`southwestGround`) in the same sum as Caricas's shelf, Nethereum's hollow, Gala's steppe rise,
 * the Oves's basin and the Mithala's levees, so the two rivers that run through them read the
 * ground they are cut in; `src/west-regions.js` declares those rivers with the rest of the west's
 * water; `src/southwest-scenery.js` draws what grows, and `src/southwest-wildlife.js` places what
 * lives there. The tests, the chart and the terrain tint read the same numbers.
 *
 * Authored directly in **world metres** (100 m per authored hex), like every country since Pueth.
 *
 * **Four countries in one module, because they are one dry quarter.** A hundred and seven hexes,
 * forty-six hex edges shared among the four, one wavelength, and a single climate gradient that
 * runs across all four borders without noticing them. Modules are named `southwest-*` rather than
 * after one country because three more jobs will extend them southward.
 *
 * **This is the first true desert in the game.** Eighty-one of the hundred and seven hexes read
 * `BWh` - hot desert - on the World Builder map, where everything built before this was `Cfa`,
 * `Csa`, `Csb`, `BSh` or `Dfa`. The Oves Desert, which is the game's existing dry country, is
 * `BSh` steppe on every one of its hexes and its own report says so: the map's author had `BWh`
 * available and did not use it there. He used it here, over three whole countries.
 *
 * **And unlike the Oves there is a gradient, which is the block's shape** (`southwestAridity`):
 * `BSh` × 18 down West Pyros's eastern columns beside the great river, `Csb` × 6 and `Csa` × 2 on
 * the block's two green corners - Navarth's north-eastern tip where the Ibenwood's southern edge
 * reaches in, and the south-eastern corner of West Pyros and the Ganesh Plain where Marosh's
 * country and the southern sea begin - and `BWh` over everything else, which is most of it.
 * **Aridity increases westward and inland**, and the driest ground in Azhora is the Ganesh Desert's
 * thirty-one hexes, every one of them `BWh`, running out at a gulf shore it is arid right up to.
 *
 * **The block is an island.** None of these four touches a built country: the built frontier in the
 * west is Nethereum and Isareos, which border the Ibenwoods, and the Ibenwoods are not built. So
 * every outer margin is `outland`, nothing here can step on anybody's ground, and the block's own
 * internal coherence is the only standard there is. **The datum is the two river mouths**: the
 * Alezhor Water reaches the gulf at the Ganesh Desert's north-western corner and the Vaellir
 * reaches the sea at West Pyros's southern tip, and those are the two places in this block where
 * the world's own sea level is a fact rather than a choice. Everything below is measured up from
 * them, and the two of them are the block's two outlets: the ground falls north-west to the first
 * and south-east to the second, and the low divide between the two runs down the Ganesh Plain.
 *
 * **Everything the lore of this quarter is actually about belongs to somebody, and none of it is
 * built**: Pyros the empire and both its halves, Gala on its hill above the confluence, the Fire
 * Memory with its fumarole sites and its ceremonies, Navarth's surrogate fires and its pilgrimage
 * and its grey sheep, the caravan crossing of the Ganesh with its waystations and its water points
 * and the Route Registry at Dinelv that issues the crossing guidance, the pastoral communities who
 * move through the plain by the drought cycle, the northern markets and Ganesh Ford at the head of
 * them, and every animal any of those people own.
 */
import { terrainMix, hexOwnerAt, REGION_CELLS, REGION_TERRAIN, landDistance } from './region-world.js';
import { VAELLIR, ALEZHOR_WATER, SOUTHWEST_RIVERS, courseDistance, coursePosition } from './west-regions.js';

const freeze = Object.freeze;
const point = (x, z) => freeze({ x, z });
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const smooth = (a, b, x) => { const v = clamp((x - a) / (b - a), 0, 1); return v * v * (3 - 2 * v); };
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * **The block in two halves, because it was built in two jobs and the halves are different
 * countries.** The northern four are job 1's: a plateau, a steppe with a great river down it, a
 * desert and a transition plain, with four climate codes across them and a gradient in them. The
 * southern four are job 2's: ninety-five hexes of `plains` and `BWh` with no gradient in them at
 * all, told apart by what the ground is made of and by which edge of the desert each one shows.
 *
 * `SOUTHWEST_REGIONS` is all eight and is what the box, the weights and the tilt read, because the
 * two halves share ten hex edges along the Ganesh Plain's southern row and a landform gated on
 * either half alone would die out in a valley down the middle of that seam. The two lists are
 * separate because the landforms are: benches, dunes, fans and fog belong to one half and washes,
 * channels, crests and galleries to the other.
 */
export const SOUTHWEST_NORTH_REGIONS = freeze(['Navarth', 'West Pyros', 'Ganesh Desert', 'Ganesh Plain']);
export const MEROSHE_REGIONS = freeze(['North Meroshe Desert', 'West Meroshe Desert', 'Central Meroshe Desert', 'South Meroshe Desert']);
export const SOUTHWEST_REGIONS = freeze([...SOUTHWEST_NORTH_REGIONS, ...MEROSHE_REGIONS]);

// ---------------------------------------------------------------------------
// The climate, which for once is a gradient
// ---------------------------------------------------------------------------
/**
 * What the World Builder map paints on every hex of all four countries
 * (`world-builder/map/resources/examples/azhora.wwmap`, `hexes[key].climate`, `koppen-v1` - *not*
 * `azhora.cmap.json`, whose one-code-per-region field is a default and says `Cfb` for almost
 * everything). The dev export drops the field, so it is written out here and
 * `tests/southwest-world.test.js` holds it to the map hex for hex whenever the map is on the
 * machine to ask.
 *
 * **A hundred and seven entries and four codes**: `BWh` × 81, `BSh` × 18, `Csb` × 6, `Csa` × 2.
 * Where the Oves and the Mithala each had one code over a whole block and drew no gradient at all,
 * this one has a real one and it is the shape of the country - so `southwestAridity` below blends
 * it, the way Gala's three bands are blended, and the ground colour, the scatter and the wildlife
 * all read off it.
 *
 * Read down the columns rather than across the rows and the pattern is plain: in West Pyros and
 * the Ganesh Plain the codes change with **q** and not with **r**, which is to say from east to
 * west; in Navarth they change with **r**, from the forest belt southward. For context the whole
 * quarter agrees: East Pyros next door is `BSh` × 29 + `Csb` × 3 + `Csa` × 1 with its own green
 * southern tip, Alezhor over the northern border is `Csb` × 25, South and West Ibenwood are `Csb`
 * throughout, Marosh over the south-eastern border is `Csa` × 10 + `Csb` × 8, and everything west
 * and south - Cape Heth, the Dinelv Highlands, the North Meroshe Desert - is `BWh` like the Ganesh.
 */
export const NAVARTH_CLIMATE = freeze({
  '-24,116': 'Csb', '-23,116': 'Csb',
  '-26,117': 'BWh', '-25,117': 'BWh', '-24,117': 'BWh',
  '-27,118': 'BWh', '-26,118': 'BWh', '-25,118': 'BWh', '-24,118': 'BWh',
  '-28,119': 'BWh', '-27,119': 'BWh', '-26,119': 'BWh', '-25,119': 'BWh',
  '-28,120': 'BWh', '-27,120': 'BWh', '-26,120': 'BWh', '-25,120': 'BWh',
  '-28,121': 'BWh', '-27,121': 'BWh', '-26,121': 'BWh',
  '-27,122': 'BWh', '-26,122': 'BWh',
});
export const WEST_PYROS_CLIMATE = freeze({
  '-22,116': 'BSh',
  '-23,117': 'BSh', '-22,117': 'BSh',
  '-23,118': 'BSh', '-22,118': 'BSh',
  '-24,119': 'BWh', '-23,119': 'BSh', '-22,119': 'BSh',
  '-24,120': 'BWh', '-23,120': 'BSh', '-22,120': 'BSh',
  '-25,121': 'BWh', '-24,121': 'BWh', '-23,121': 'BSh', '-22,121': 'BSh', '-21,121': 'BSh',
  '-25,122': 'BWh', '-24,122': 'BWh', '-23,122': 'BSh', '-22,122': 'BSh', '-21,122': 'BSh',
  '-23,123': 'BWh', '-22,123': 'BSh', '-21,123': 'BSh',
  '-22,124': 'BSh', '-21,124': 'Csb',
  '-21,125': 'Csa',
});
export const GANESH_DESERT_CLIMATE = freeze({
  '-30,120': 'BWh', '-29,120': 'BWh',
  '-31,121': 'BWh', '-30,121': 'BWh', '-29,121': 'BWh',
  '-32,122': 'BWh', '-31,122': 'BWh', '-30,122': 'BWh', '-29,122': 'BWh', '-28,122': 'BWh',
  '-33,123': 'BWh', '-32,123': 'BWh', '-31,123': 'BWh', '-30,123': 'BWh', '-29,123': 'BWh', '-28,123': 'BWh', '-27,123': 'BWh',
  '-33,124': 'BWh', '-32,124': 'BWh', '-31,124': 'BWh', '-30,124': 'BWh', '-29,124': 'BWh', '-28,124': 'BWh',
  '-33,125': 'BWh', '-32,125': 'BWh', '-31,125': 'BWh', '-30,125': 'BWh', '-29,125': 'BWh', '-28,125': 'BWh',
  '-33,126': 'BWh', '-32,126': 'BWh',
});
export const GANESH_PLAIN_CLIMATE = freeze({
  '-26,123': 'BWh', '-25,123': 'BWh', '-24,123': 'BWh',
  '-27,124': 'BWh', '-26,124': 'BWh', '-25,124': 'BWh', '-24,124': 'BWh', '-23,124': 'BWh',
  '-27,125': 'BWh', '-26,125': 'BWh', '-25,125': 'BWh', '-24,125': 'BWh', '-23,125': 'BWh', '-22,125': 'Csb',
  '-28,126': 'BWh', '-27,126': 'BWh', '-26,126': 'BWh', '-25,126': 'BWh', '-24,126': 'BWh', '-23,126': 'Csb', '-22,126': 'Csa',
  '-28,127': 'BWh', '-27,127': 'BWh', '-26,127': 'BWh', '-25,127': 'BWh', '-24,127': 'BWh', '-23,127': 'Csb',
});
/**
 * **The four Meroshe deserts: ninety-five hexes and one code.** Read off the same map field, hex by
 * hex, and there is nothing in it - `BWh` ninety-five times, which with job 1's eighty-one makes a
 * hundred and seventy-six of this block's two hundred and two hexes hot desert.
 *
 * **This is the finding the whole job turns on.** Job 1's half has a climate gradient and that
 * gradient is its shape; this half has none, and four quarters the atlas bothered to name cannot be
 * told apart by their weather, their terrain word, their relief or their water, because the atlas
 * gives all four the same in every one of those fields. So they are told apart by **the surface** -
 * hamada, fan skirt and salt, erg, reg - and by **which edge of the desert each one looks out at**:
 * the Ganesh Plain and Marosh's Mediterranean hills north of the North, the Dinelv escarpment and
 * the open ocean west of the West, nothing at all from inside the Central, and Trogo's tropical
 * rainforest and the southern ocean south of the South.
 *
 * For context, and it is worth having: **every one of the two hundred and forty-five `BWh` hexes on
 * the whole claimed atlas is in this one quarter of the continent** - the Dinelv Highlands 35, these
 * four 95, the Ganesh Desert 31, the Ganesh Plain 23, Navarth 20, Cape Heth 18, Hama 10, West Pyros
 * 7 and the Aurumlis 6. There is no other desert in Azhora, and these ninety-five hexes are
 * thirty-nine per cent of the one there is.
 */
export const NORTH_MEROSHE_CLIMATE = freeze({
  '-28,128': 'BWh', '-27,128': 'BWh', '-26,128': 'BWh', '-25,128': 'BWh', '-24,128': 'BWh',
  '-29,129': 'BWh', '-28,129': 'BWh', '-27,129': 'BWh', '-26,129': 'BWh', '-25,129': 'BWh',
  '-30,130': 'BWh', '-29,130': 'BWh', '-28,130': 'BWh', '-27,130': 'BWh', '-26,130': 'BWh',
  '-32,131': 'BWh', '-31,131': 'BWh', '-30,131': 'BWh', '-29,131': 'BWh', '-28,131': 'BWh', '-27,131': 'BWh',
  '-32,132': 'BWh', '-31,132': 'BWh',
});
export const WEST_MEROSHE_CLIMATE = freeze({
  '-34,132': 'BWh', '-33,132': 'BWh',
  '-37,133': 'BWh', '-36,133': 'BWh', '-35,133': 'BWh', '-34,133': 'BWh', '-33,133': 'BWh',
  '-37,134': 'BWh', '-36,134': 'BWh', '-35,134': 'BWh', '-34,134': 'BWh', '-33,134': 'BWh',
  '-37,135': 'BWh', '-36,135': 'BWh', '-35,135': 'BWh', '-34,135': 'BWh',
  '-37,136': 'BWh', '-36,136': 'BWh', '-35,136': 'BWh', '-34,136': 'BWh',
});
export const CENTRAL_MEROSHE_CLIMATE = freeze({
  '-30,132': 'BWh', '-29,132': 'BWh', '-28,132': 'BWh', '-27,132': 'BWh',
  '-32,133': 'BWh', '-31,133': 'BWh', '-30,133': 'BWh', '-29,133': 'BWh', '-28,133': 'BWh', '-27,133': 'BWh',
  '-32,134': 'BWh', '-31,134': 'BWh', '-30,134': 'BWh', '-29,134': 'BWh', '-28,134': 'BWh', '-27,134': 'BWh',
  '-33,135': 'BWh', '-32,135': 'BWh', '-31,135': 'BWh', '-30,135': 'BWh', '-29,135': 'BWh', '-28,135': 'BWh', '-27,135': 'BWh',
  '-33,136': 'BWh', '-32,136': 'BWh', '-31,136': 'BWh', '-30,136': 'BWh', '-29,136': 'BWh',
  '-33,137': 'BWh', '-32,137': 'BWh', '-31,137': 'BWh',
});
export const SOUTH_MEROSHE_CLIMATE = freeze({
  '-28,136': 'BWh', '-27,136': 'BWh', '-26,136': 'BWh',
  '-30,137': 'BWh', '-29,137': 'BWh', '-28,137': 'BWh', '-27,137': 'BWh',
  '-31,138': 'BWh', '-30,138': 'BWh', '-29,138': 'BWh', '-28,138': 'BWh', '-27,138': 'BWh',
  '-31,139': 'BWh', '-30,139': 'BWh', '-29,139': 'BWh', '-28,139': 'BWh',
  '-32,140': 'BWh', '-31,140': 'BWh', '-30,140': 'BWh',
  '-32,141': 'BWh', '-31,141': 'BWh',
});
export const MEROSHE_CLIMATE = freeze({
  ...NORTH_MEROSHE_CLIMATE, ...WEST_MEROSHE_CLIMATE, ...CENTRAL_MEROSHE_CLIMATE, ...SOUTH_MEROSHE_CLIMATE,
});
export const SOUTHWEST_CLIMATE = freeze({
  ...NAVARTH_CLIMATE, ...WEST_PYROS_CLIMATE, ...GANESH_DESERT_CLIMATE, ...GANESH_PLAIN_CLIMATE,
  ...MEROSHE_CLIMATE,
});
/**
 * How dry a hex's code is, on one scale: 1 is hot desert, 0 is the Mediterranean corner. The two
 * `Cs` codes are held apart by a little, because `Csb` is the cooler wetter-summer form and is what
 * the Ibenwood margin reads, where `Csa` is the hot-summer form on the two hexes nearest the
 * southern sea.
 */
export const ARIDITY = freeze({ BWh: 1, BSh: .58, Csa: .18, Csb: .08 });
const CLIMATE_CENTRES = freeze(Object.entries(SOUTHWEST_CLIMATE).map(([key, code]) => {
  const [q, r] = key.split(',').map(Number);
  const cell = SOUTHWEST_REGIONS.flatMap(name => REGION_CELLS[name] ?? []).find(c => c.q === q && c.r === r);
  return freeze({ q, r, code, dry: ARIDITY[code] ?? 1, x: cell?.x ?? 0, z: cell?.z ?? 0 });
}));
/**
 * The climate as a field rather than as a hex list, blended on the same falloff the ground's own
 * hex blend uses (`blendHexes`, reach 1.28 hexes), so the aridity changes over a hex and not at a
 * hex edge. Outside the block, and where no hex of the block is within reach, it answers the
 * block's own driest value, because everything round this quarter but the forest belt and Marosh
 * is desert too.
 *
 * **Gala's three bands are the precedent and the Oves's flat `BSh` is the counter-example.** This
 * is the third country in the game with a climate that varies inside it and the first where the
 * variation runs the width of four countries at once.
 */
export function southwestAridity(x, z) {
  let total = 0, sum = 0;
  for (const hex of CLIMATE_CENTRES) {
    const weight = 1 - Math.hypot(x - hex.x, z - hex.z) / 128;
    if (weight <= 0) continue;
    total += weight; sum += hex.dry * weight;
  }
  return total > 0 ? sum / total : 1;
}
/** The hex code at a point, for the tests and the chart: the nearest authored hex's own word. */
export function southwestKoppen(x, z) {
  let best = null, bestDistance = Infinity;
  for (const hex of CLIMATE_CENTRES) {
    const d = (hex.x - x) ** 2 + (hex.z - z) ** 2;
    if (d < bestDistance) { bestDistance = d; best = hex; }
  }
  return best?.code ?? null;
}

// ---------------------------------------------------------------------------
// The boxes, and how much of a point belongs to the block
// ---------------------------------------------------------------------------
const boxOf = names => {
  const box = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (const name of names) for (const cell of REGION_CELLS[name] ?? []) {
    box.minX = Math.min(box.minX, cell.x - 95); box.maxX = Math.max(box.maxX, cell.x + 95);
    box.minZ = Math.min(box.minZ, cell.z - 95); box.maxZ = Math.max(box.maxZ, cell.z + 95);
  }
  return freeze(box);
};
export const SOUTHWEST_BOX = boxOf(SOUTHWEST_REGIONS);
export const SOUTHWEST_BOXES = freeze(Object.fromEntries(SOUTHWEST_REGIONS.map(name => [name, boxOf([name])])));
const inBox = (box, x, z) => x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ;
export const inSouthwestBox = (x, z) => inBox(SOUTHWEST_BOX, x, z);
/** The middle of one country's own hexes, measured rather than typed. */
const centreOf = name => {
  const cells = REGION_CELLS[name] ?? [];
  return point(cells.reduce((s, c) => s + c.x, 0) / cells.length, cells.reduce((s, c) => s + c.z, 0) / cells.length);
};
export const SOUTHWEST_CENTRES = freeze(Object.fromEntries(SOUTHWEST_REGIONS.map(name => [name, centreOf(name)])));

/**
 * How much of a point is this block's own to shape, by the ground blend's own weights, at the
 * threshold Meneth's ridges, Nethereum's hollow, Gala's rise, the Oves's basin and the Mithala's
 * tilt all use.
 *
 * **It is the four countries together and never one of them**, for the reason the Mithala gives:
 * ask each name separately and the answer at an internal border is two halves that each fail the
 * threshold, and a landform gated on them would die out in a valley down the middle of the block
 * along every one of the forty-six internal edges.
 *
 * **There is no gate against a neighbour here, and that is worth saying.** The Mithala needed
 * `lotharnGate` because its low-threshold landforms reached into a built mountain range. Every
 * margin of this block is unbuilt `outland`: there is nobody to step on.
 */
export function southwestWeight(x, z, mix = null) {
  if (!inSouthwestBox(x, z)) return 0;
  const weights = (mix ?? terrainMix(x, z)).weights;
  let own = 0;
  for (const name of SOUTHWEST_REGIONS) own += weights[name] ?? 0;
  return own;
}
export const southwestShare = (x, z, mix = null) => smooth(.3, .8, southwestWeight(x, z, mix));
/**
 * The same weight at a much lower threshold, for the landforms that have to reach the water. Both
 * of this block's rivers are drawn **on a border with an unbuilt country** - the Vaellir on West
 * Pyros | East Pyros for all twenty of its edges, the Alezhor Water on Navarth | Alezhor and then
 * Ganesh Desert | Alezhor for all eight of its - so at the water's own edge the blend is a third
 * of this block and two thirds of `outland`, and a tilt or a swale gated at the ordinary threshold
 * would stop short of the river it belongs to. It is exactly the allowance the Sorten's bench makes
 * on the Oveth (`ovesWeights.sorten`) and the Mithala's banks make on the west arm.
 */
export const southwestBankShare = (x, z, mix = null) => smooth(.05, .30, southwestWeight(x, z, mix));

/** How much of a point is one named country's own, for the landforms that belong to one of them. */
export function regionShare(name, x, z, mix = null) {
  if (!inBox(SOUTHWEST_BOXES[name], x, z)) return 0;
  return smooth(.22, .70, (mix ?? terrainMix(x, z)).weights[name] ?? 0);
}

/**
 * The four Meroshe deserts together, for the two things that cross their internal seams: the fog off
 * the southern ocean, which does not stop at a hex edge, and the salt the wind carries off the pan.
 * Asking one country at a time would put a line down the middle of a seam, which is the reason
 * `southwestWeight` is the whole block and not one name.
 */
export const MEROSHE_BOX = boxOf(MEROSHE_REGIONS);
export function merosheShare(x, z, mix = null) {
  if (!inBox(MEROSHE_BOX, x, z)) return 0;
  const weights = (mix ?? terrainMix(x, z)).weights;
  let own = 0;
  for (const name of MEROSHE_REGIONS) own += weights[name] ?? 0;
  return smooth(.22, .70, own);
}

// ---------------------------------------------------------------------------
// The fall: two outlets, and a divide between them
// ---------------------------------------------------------------------------
/**
 * **The block tilts toward the Vaellir's mouth**, which is the outlet three of job 1's four
 * countries use: West Pyros down the river itself, the Ganesh Plain's eastern side over a low
 * divide, and Navarth's whole southern face. One plane over all of it, for the reason the Mithala
 * had one: a plane is continuous across every internal border, so none of the internal edges has a
 * step or a change of gradient in it.
 *
 * **Job 2 extended the plane rather than laying a second one**, and that is the whole of what the
 * four Meroshe deserts get for a fall. The plane's northing term takes the ground down 4.0 m at the
 * Ganesh Plain seam, 5.6 m at the middle of the sand sea and 8.7 m at the South Meroshe's own shore,
 * which is the fall a desert ninety-five hexes wide needs and no more; a second plane meeting this
 * one at the seam would put a change of gradient in the ten hex edges that seam is made of. The two
 * quarters whose outlet is *not* the way the plane falls get one of their own instead, which is
 * `ganeshBasin`'s rule: the Ganesh Desert to its gulf, and the West Meroshe to the western ocean
 * (`merosheFans`).
 *
 * It is small on purpose - five metres of easting over fourteen hundred and four of northing over
 * nine hundred and fifty, one in two hundred and eighty and one in two hundred and forty - because
 * the block's real shape is in its profile bases (Navarth's plateau at 36 against the Ganesh's 18)
 * and a tilt that competed with those would bury them.
 */
export const SOUTHWEST_TILT = freeze({ pivotX: -3230, pivotZ: 1370, perEast: 5 / 1400, perNorth: 4 / 950 });
export const southwestSlope = (x, z) => SOUTHWEST_TILT.perEast * (SOUTHWEST_TILT.pivotX - x)
  + SOUTHWEST_TILT.perNorth * (SOUTHWEST_TILT.pivotZ - z);

/**
 * **The Ganesh Desert's own fall, north-west to the gulf**, and the one landform in the block that
 * reverses the general tilt. It is a one-sided ramp rather than a plane: nought along the desert's
 * eastern side, where the Ganesh Plain's channels come in and the lore says the boundary is diffuse
 * and has no line in it, and its full drop at the shore. So there is no ridge anywhere - the two
 * drainages meet at a divide a traveler cannot see, which is what a watershed on ground this flat
 * is, and the Mithala's fen margin is the same trick for the same reason.
 *
 * The anchors are measured, not chosen: `to` is the last point of the Alezhor Water, which is where
 * the atlas's own river leaves this block, and `from` is the middle of the desert's eastern margin
 * against the Ganesh Plain.
 */
export const GANESH_BASIN = freeze({ from: point(-3230, 1600), to: point(-3718, 1194), drop: 13 });
export function ganeshBasin(x, z, own = 0) {
  if (own <= 0) return 0;
  const dx = GANESH_BASIN.to.x - GANESH_BASIN.from.x, dz = GANESH_BASIN.to.z - GANESH_BASIN.from.z;
  const length = Math.hypot(dx, dz);
  const along = ((x - GANESH_BASIN.from.x) * dx + (z - GANESH_BASIN.from.z) * dz) / (length * length);
  return -GANESH_BASIN.drop * smooth(0, 1, along) * own;
}

/**
 * **The Ganesh Plain's own fall, west-north-west into the desert.** "A series of shallow drainage
 * channels cross it, too diffuse to qualify as rivers, carrying water southward toward the Ganesh
 * Desert in wet years and lying dry in drought years." The atlas puts the desert west of the plain
 * rather than south of it, so the ground falls west and the lore is adjusted (docs/southwest-1-report.md);
 * everything else in that sentence is built exactly as written.
 *
 * Five metres over five hundred, pivoted on the middle of the plain, which puts the divide between
 * the two drainages about two hundred metres inland of the south-eastern corner - where the ground
 * turns over and the last of the plain falls to the sea instead.
 */
export const GANESH_PLAIN_FALL = freeze({ perMetre: 5 / 500, eastX: .966, eastZ: .261 });
export function ganeshPlainFall(x, z, own = 0) {
  if (own <= 0) return 0;
  const centre = SOUTHWEST_CENTRES['Ganesh Plain'];
  const along = (x - centre.x) * GANESH_PLAIN_FALL.eastX + (z - centre.z) * GANESH_PLAIN_FALL.eastZ;
  return along * GANESH_PLAIN_FALL.perMetre * own;
}

/**
 * **West Pyros falls south with its river.** Twelve metres over seven hundred and eighty, pivoted
 * on the middle of the country, so the Vaellir has a gradient of its own to run down instead of
 * being forced into one by `WEST_PROFILES`. Without it the river would stand level for seven
 * hundred metres and then drop fifteen in the last hundred and fifty, where the grassland hex at
 * the mouth and the coast field between them take the ground to the sea - which is a waterfall and
 * not a river mouth.
 */
export const PYROS_FALL = freeze({ perMetre: 12 / 780 });
export function pyrosFall(x, z, own = 0) {
  if (own <= 0) return 0;
  return (SOUTHWEST_CENTRES['West Pyros'].z - z) * PYROS_FALL.perMetre * own;
}

// ---------------------------------------------------------------------------
// Navarth: the swells on the plateau
// ---------------------------------------------------------------------------
/**
 * **The ten `hills` hexes the atlas gives Navarth, as broad worn crests.** The lore's whole account
 * of this country's ground is three phrases - "broad upland sweeps, exposed ridgelines, the
 * occasional sheltered hollow", on "a high, rolling tableland" - and that is what the atlas draws:
 * ten `hills` hexes scattered through eleven `plains` ones, not a range and not a rim, with open
 * ground between every pair of them.
 *
 * Each crest is a dome on its own hex centre, and they are taken as a **maximum and not a sum**,
 * which is `ovesRim`'s rule: two crests whose skirts overlap make one longer swell rather than a
 * hill twice as high. The heights vary by where the hex stands - the four along the western rim
 * above the Ganesh are the highest, because that is the side the ground has to fall from, and the
 * one at the north-eastern tip is the lowest, because it is the shoulder above the forest.
 *
 * Nobody has made anything of any of them. The lore's surrogate fires stand "in locations that
 * correspond to where fumaroles would be if the volcanic geology extended this far north", and a
 * maintained fire is a work and works are people, so there is not one.
 */
export const NAVARTH_CRESTS = freeze([
  freeze({ id: 'west-rim-north', x: -3550, z: 1155, lift: 14, radius: 108 }),
  freeze({ id: 'west-rim-mid', x: -3450, z: 1155, lift: 15, radius: 112 }),
  freeze({ id: 'west-rim-south', x: -3400, z: 1241, lift: 13, radius: 104 }),
  freeze({ id: 'west-rim-foot', x: -3350, z: 1328, lift: 11, radius: 98 }),
  freeze({ id: 'north-swell', x: -3350, z: 982, lift: 10, radius: 100 }),
  freeze({ id: 'middle-swell', x: -3300, z: 1068, lift: 11, radius: 102 }),
  freeze({ id: 'east-swell', x: -3200, z: 1241, lift: 10, radius: 98 }),
  freeze({ id: 'south-swell', x: -3250, z: 1328, lift: 11, radius: 100 }),
  freeze({ id: 'south-shoulder', x: -3200, z: 1415, lift: 9, radius: 94 }),
  freeze({ id: 'wood-shoulder', x: -3200, z: 895, lift: 6, radius: 88 }),
]);
export function navarthCrests(x, z, own = 0) {
  if (own <= 0) return 0;
  let best = 0;
  for (const crest of NAVARTH_CRESTS) {
    const d = Math.hypot(x - crest.x, z - crest.z);
    if (d >= crest.radius) continue;
    best = Math.max(best, crest.lift * (1 - smooth(0, 1, d / crest.radius)));
  }
  return best * own;
}

// ---------------------------------------------------------------------------
// The Ganesh Desert: what the wind leaves
// ---------------------------------------------------------------------------
/**
 * **"Wind is the defining physical force in the Ganesh."** The lore is explicit about what that
 * makes: "a surface shaped by wind and by the occasional floodwater that crosses it in the wetter
 * years, depositing a thin layer of fine sediment over the rocky substrate", with no canyon, no
 * escarpment and no deep carving anywhere; and "summer winds blow from the north and northwest, hot
 * and desiccating".
 *
 * So the desert's own roughness is **three quarters of a metre**, which is the lowest relief any
 * landform in the game has, laid on two turned bearings - one field on a single bearing reads as
 * corrugation, which is the Ascarth plateau's lesson - plus **a long grain on the summer wind's own
 * bearing**, a two-hundred-metre wave of half a metre running north-west to south-east. The grain
 * is the one thing a traveler crossing this country can navigate by, and it is the wind's.
 *
 * `ganeshLie` reads the field back on a nought-to-one scale: 1 where the ground is swept and the
 * sediment is gone, 0 in a pocket where it has gathered a hand deep. The scatter and the ground
 * tint are both read off it, the way the Oves's are off `ovesLie`.
 */
export const GANESH_WIND = freeze({ amp: .42, waveA: 47, waveB: 71, bearingA: -.62, bearingB: 1.05,
  grainAmp: .5, grainWave: 205, grainBearing: -.71 });
const turned = (x, z, bearing) => x * Math.cos(bearing) + z * Math.sin(bearing);
export function ganeshStone(x, z, own = 0) {
  if (own <= 0) return 0;
  const g = GANESH_WIND;
  const a = Math.sin(turned(x, z, g.bearingA) * 6.2831853 / g.waveA);
  const b = Math.sin(turned(x, z, g.bearingB) * 6.2831853 / g.waveB);
  const grain = Math.sin(turned(x, z, g.grainBearing) * 6.2831853 / g.grainWave);
  return (g.amp * (a * .6 + b * .4) + g.grainAmp * grain) * own;
}
/** 1 on a swept rise where the rock is at the surface, 0 in a pocket where the sediment has gathered. */
export function ganeshLie(x, z) {
  const own = regionShare('Ganesh Desert', x, z);
  if (own <= 0) return 0;
  const raw = ganeshStone(x, z, 1);
  return clamp((raw + GANESH_WIND.amp + GANESH_WIND.grainAmp) / (2 * (GANESH_WIND.amp + GANESH_WIND.grainAmp)), 0, 1);
}

/**
 * **The two washes, and there is nothing in either of them.** "Water in the Ganesh follows a simple
 * rule: almost none on the surface, some below it." What crosses this desert crosses it in the
 * wetter years, so what it leaves is a cut bed with a floor of coarse gravel and no water surface,
 * no ribbon, no reed, and a traveler walks down the middle of either as a road - which is the Oves
 * Desert's four dry channels, the same machinery for the same reason.
 *
 * Both carry on the Ganesh Plain's own shallow channels westward and fade out before the shore,
 * because a bed that only runs after rain does not keep a mouth open. The lower one holds **the
 * damp reach**: a hundred and twenty metres where the subsurface water is near enough the gravel to
 * keep something green in the bed, which is the lore's "some below it" and the only green in the
 * whole of the Ganesh. There is nothing to drink there and nothing has been built to reach it; the
 * waystations the lore puts at the water points are somebody's.
 */
const washLine = points => freeze(points.map(([x, z]) => point(x, z)));
export const GANESH_WASHES = freeze([
  freeze({ id: 'north-wash', name: 'The North Wash', cut: 1.35, half: 11, fade: 150,
    line: washLine([[-3240, 1487], [-3390, 1440], [-3520, 1400], [-3620, 1345], [-3670, 1300]]) }),
  freeze({ id: 'south-wash', name: 'The South Wash', cut: 1.15, half: 9, fade: 140,
    line: washLine([[-3215, 1655], [-3360, 1636], [-3500, 1594], [-3640, 1540], [-3760, 1472]]) }),
]);
export const GANESH_DAMP = freeze({ wash: 'south-wash', from: .40, to: .62 });

function lineWalk(line, x, z, limit) {
  let best = Infinity, along = 0, total = 0, seen = 0;
  for (let i = 1; i < line.length; i++) total += Math.hypot(line[i].x - line[i - 1].x, line[i].z - line[i - 1].z);
  let walked = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i];
    const dx = b.x - a.x, dz = b.z - a.z, len2 = dx * dx + dz * dz;
    const t = len2 > 0 ? clamp(((x - a.x) * dx + (z - a.z) * dz) / len2, 0, 1) : 0;
    const d = Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t));
    if (d < best) { best = d; along = (walked + t * Math.sqrt(len2)) / (total || 1); }
    walked += Math.sqrt(len2);
    seen++;
  }
  return best <= limit ? { distance: best, along, length: total } : null;
}
/** The wash a point is in, with how far along it and how far from its middle. */
export function nearestWash(x, z, margin = 0) {
  let best = null;
  for (const wash of GANESH_WASHES) {
    const found = lineWalk(wash.line, x, z, wash.half * 3 + margin);
    if (found && (!best || found.distance < best.distance)) best = { wash, ...found };
  }
  return best;
}
export function ganeshWashCut(x, z, own = 0) {
  if (own <= 0) return 0;
  const found = nearestWash(x, z);
  if (!found) return 0;
  const { wash, distance, along } = found;
  const across = 1 - smooth(wash.half, wash.half * 2.6, distance);
  const ends = smooth(0, .09, along) * (1 - smooth(1 - wash.fade / (found.length || 1), 1, along));
  return -wash.cut * across * ends * own;
}
/** True on a wash's own floor, where nothing grows and nothing is scattered. */
export function onWashFloor(x, z, margin = 0) {
  const found = nearestWash(x, z, margin);
  if (!found) return false;
  const ends = smooth(0, .09, found.along) * (1 - smooth(1 - found.wash.fade / (found.length || 1), 1, found.along));
  return ends > .35 && found.distance < found.wash.half + margin;
}
/** How damp a point on the south wash's floor is: 1 in the middle of the damp reach, 0 outside it. */
export function ganeshDamp(x, z) {
  const found = nearestWash(x, z);
  if (!found || found.wash.id !== GANESH_DAMP.wash) return 0;
  const inReach = smooth(GANESH_DAMP.from - .05, GANESH_DAMP.from + .03, found.along)
    * (1 - smooth(GANESH_DAMP.to - .03, GANESH_DAMP.to + .05, found.along));
  return inReach * (1 - smooth(found.wash.half, found.wash.half * 2.2, found.distance));
}

// ---------------------------------------------------------------------------
// The Ganesh Plain: the channels, and the depressions that are the whole of it
// ---------------------------------------------------------------------------
/**
 * **"These channels and their associated depressions are the terrain's most ecologically
 * significant features."** The lore gives the Ganesh Plain one landform and it is this: shallow
 * drainage channels "too diffuse to qualify as rivers", running toward the Ganesh, with closed
 * hollows strung along them where "water concentrates in the depressions, plants do better there,
 * livestock do better there, and the routes across the plain follow the depressions' alignment
 * because they are the corridors where grass persists longest".
 *
 * So: three channels, a metre of cut and nine metres across, with no water surface anywhere in any
 * of them - this is the dry-year face and in a dry year they are dry - **two of them running west
 * into the Ganesh and the third east to the sea**, which is the divide the plain sits on, and eight
 * depressions on their lines, a metre or so below the plain and a hundred and twenty to two hundred metres across,
 * which are where the grass is. `inDepression` is what the scatter and the ground tint read, and
 * the wildlife is placed on them, because on this plain a depression is the only thing that decides
 * where anything can be.
 */
export const GANESH_PLAIN_CHANNELS = freeze([
  freeze({ id: 'upper-channel', name: 'The Upper Channel', cut: .95, half: 9,
    line: washLine([[-2790, 1556], [-2900, 1543], [-3040, 1516], [-3110, 1524]]) }),
  freeze({ id: 'middle-channel', name: 'The Middle Channel', cut: 1.05, half: 10,
    line: washLine([[-2690, 1726], [-2850, 1700], [-3010, 1660], [-3160, 1628], [-3190, 1622]]) }),
  // **The third one runs the other way, and that is the divide made visible.** Two channels carry
  // the plain's water west into the Ganesh; this one leaves the same low rise and runs east-south-east
  // to the sea at the green corner, four hundred metres away. It is not a decision: measured on the
  // built ground, the plain's southern rows do not fall west at all - they rise again toward the
  // Dinelv Highlands margin - and the only way off them is the way this one goes. "West of it every
  // drop goes to the Ganesh and is gone; east of it the ground falls a few hundred paces to the sea."
  freeze({ id: 'sea-channel', name: 'The Sea Channel', cut: .9, half: 8,
    line: washLine([[-2800, 1810], [-2730, 1795], [-2670, 1780], [-2630, 1766]]) }),
]);
export const GANESH_DEPRESSIONS = freeze([
  freeze({ id: 'upper-pan', x: -2880, z: 1548, depth: 1.05, radius: 88 }),
  freeze({ id: 'north-pan', x: -3080, z: 1514, depth: .95, radius: 78 }),
  freeze({ id: 'middle-pan', x: -2830, z: 1704, depth: 1.25, radius: 104 }),
  freeze({ id: 'long-pan', x: -3030, z: 1657, depth: 1.15, radius: 96 }),
  freeze({ id: 'west-pan', x: -3170, z: 1626, depth: .9, radius: 74 }),
  freeze({ id: 'lower-pan', x: -2880, z: 1826, depth: 1.1, radius: 92 }),
  freeze({ id: 'south-pan', x: -3050, z: 1792, depth: 1, radius: 82 }),
  freeze({ id: 'corner-pan', x: -2720, z: 1846, depth: .85, radius: 70 }),
]);
export function ganeshPlainChannelCut(x, z, own = 0) {
  if (own <= 0) return 0;
  let cut = 0;
  for (const channel of GANESH_PLAIN_CHANNELS) {
    const found = lineWalk(channel.line, x, z, channel.half * 3);
    if (!found) continue;
    const across = 1 - smooth(channel.half, channel.half * 2.8, found.distance);
    const ends = smooth(0, .06, found.along) * (1 - smooth(.94, 1, found.along));
    cut = Math.max(cut, channel.cut * across * ends);
  }
  return -cut * own;
}
export function ganeshDepressionCut(x, z, own = 0) {
  if (own <= 0) return 0;
  let cut = 0;
  for (const pan of GANESH_DEPRESSIONS) {
    const d = Math.hypot(x - pan.x, z - pan.z);
    if (d >= pan.radius) continue;
    cut = Math.max(cut, pan.depth * (1 - smooth(0, 1, d / pan.radius)));
  }
  return -cut * own;
}
/** 1 in the middle of a depression, 0 on the open plain between them. */
export function inDepression(x, z) {
  let best = 0;
  for (const pan of GANESH_DEPRESSIONS) {
    const d = Math.hypot(x - pan.x, z - pan.z);
    if (d >= pan.radius) continue;
    best = Math.max(best, 1 - smooth(0, 1, d / pan.radius));
  }
  return best;
}
/** True on a Ganesh Plain channel's own floor. */
export function onChannelFloor(x, z, margin = 0) {
  for (const channel of GANESH_PLAIN_CHANNELS) {
    const found = lineWalk(channel.line, x, z, channel.half + margin);
    if (!found) continue;
    const ends = smooth(0, .06, found.along) * (1 - smooth(.94, 1, found.along));
    if (ends > .4) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// The Meroshe: four surfaces, because the atlas gives four countries one word
// ---------------------------------------------------------------------------
/**
 * **Ninety-five hexes, `plains` on every one and `BWh` on every one.** No relief, no variety, no
 * water, no gradient: the largest single-character expanse the atlas draws anywhere. That is not a
 * licence to invent mountains, and it is not a reason to draw the Ganesh Desert four more times
 * either. It is the country's subject, and the answer to it is underfoot.
 *
 * **A hot desert is not one surface, it is four, and the game had drawn none of them at scale.**
 * `moroshe_desert.md` says so itself, in the one paragraph it spends on geography: the Moroshe
 * "ranges from the rocky hammada of the northern transition zone - flat gravel plains and exposed
 * bedrock where scrubby thorn trees still manage to exist - through the great sand seas of the
 * central interior, to the canyon country of the south". Three named surfaces in one sentence, in
 * the order the atlas names the quarters, and the fourth - the salt pan at the foot of a fan skirt -
 * is what the atlas adds by putting an ocean on the west.
 *
 * So:
 *
 *  - **North Meroshe is hamada**, bare rock: a stone floor with the hard beds standing out of it in
 *    low steps (`MEROSHE_BENCHES`), and the only trees in ninety-five hexes growing in their joints.
 *    It is the highest of the four and the transition from the Ganesh Plain's clay.
 *  - **West Meroshe is a fan skirt and a salt pan** (`merosheSkirt`, `MEROSHE_FANS`,
 *    `MEROSHE_SALT`): three coalesced gravel fans spread off the Dinelv escarpment to an ocean,
 *    sorting finer as they go, with the salt where the last of the water stops.
 *  - **Central Meroshe is erg** (`MEROSHE_SINK`, `MEROSHE_DUNES`): the first sand sea in the game,
 *    linear ridges on the summer wind's bearing with dead-flat corridors between them, in a shallow
 *    closed sink that is why the sand is there.
 *  - **South Meroshe is reg** (`merosheFog`, `merosheVarnish`): a pavement of close-packed varnished
 *    pebbles, under the fog that comes off the southern ocean where Trogo's rainforest begins.
 *
 * **Four surfaces, four sight-lines, four edges.** What tells a traveler which quarter they are in
 * is what the ground is made of, how far they can see across it, and which single thing stands on
 * its horizon: the Ganesh Plain and Marosh's green hills from the North, the Dinelv escarpment and
 * the sea from the West, **nothing whatever** from inside the Central, and Trogo's forest wall and
 * the southern ocean from the South.
 */

/**
 * **North Meroshe: the benches.** "Flat gravel plains and exposed bedrock", and what exposed bedrock
 * does on a desert floor is stand up in steps where a harder bed outcrops - a metre or two of riser,
 * a long back slope, and then the next one. `dinelv_highlands.md` gives the strike: "a series of
 * ridge systems crosses it from roughly north to south, aligned with the peninsula's long axis", so
 * these run **north and south**, which is the one navigational fact this country has. The sand sea
 * next door runs north-west to south-east on the wind's bearing, so a traveler always knows which of
 * the two they are standing on by which way the lines go.
 *
 * Each bench is a straight line with an asymmetric profile across it: the riser over sixteen metres
 * on the **west** side, because the beds dip away from the highland, and then the back slope decaying
 * over a hundred and ten. They are taken as a **maximum and not a sum** (`ovesRim`'s rule), so nine
 * benches ninety metres apart make a stepped floor and not a staircase nine risers high: the whole
 * field is between nought and two metres, which is a little more than the Ganesh's wind field and a
 * great deal less than a landform.
 */
const bench = (id, name, x, z, length, rise) => freeze({ id, name, x, z, length, rise, run: 8, fade: 110, cap: 40 });
export const MEROSHE_BENCHES = freeze([
  bench('bench-corner', 'The Corner Step', -3290, 2310, 150, 1.4),
  bench('bench-west', 'The West Step', -3200, 2300, 300, 1.7),
  bench('bench-mid-west', 'The Long Step', -3110, 2215, 300, 2.0),
  bench('bench-mid', 'The Middle Step', -3020, 2210, 295, 1.6),
  bench('bench-short-south', 'The Short Step', -3060, 2130, 120, 1.2),
  bench('bench-mid-east', 'The Broken Step', -2930, 2210, 290, 1.8),
  bench('bench-marosh', 'The Marosh Step', -2830, 2210, 290, 1.5),
  bench('bench-step-north', 'The North Step', -2880, 1990, 90, 1.1),
  bench('bench-east', 'The East Step', -2740, 2040, 130, 1.3),
]);
/** How high the rock stands at a point, and how near a riser it is: the scatter reads both. */
export function merosheBench(x, z) {
  let lift = 0, edge = 0;
  for (const b of MEROSHE_BENCHES) {
    const along = b.z - z;                                   // the line runs north from (x, z)
    if (along < -b.cap || along > b.length + b.cap) continue;
    const ends = smooth(-b.cap, b.cap * .35, along) * (1 - smooth(b.length - b.cap * .35, b.length + b.cap, along));
    if (ends <= 0) continue;
    const s = b.x - x;                                       // positive west: the up-dip side
    if (s < -b.run || s > b.run + b.fade) continue;
    const face = smooth(-b.run, b.run, s);
    const here = b.rise * face * (1 - smooth(b.run, b.run + b.fade, s)) * ends;
    if (here > lift) lift = here;
    edge = Math.max(edge, ends * (1 - smooth(0, b.run * 2.2, Math.abs(s))));
  }
  return { lift, edge };
}
export function merosheBenches(x, z, own = 0) {
  if (own <= 0) return 0;
  return merosheBench(x, z).lift * own;
}

/**
 * **West Meroshe: the skirt.** The atlas puts an ocean on this country's west and the Dinelv
 * Highlands on its north-east, and `dinelv_highlands.md` says what is between them: the plateau
 * "extends twenty to forty miles inland before the terrain descends again toward the Meroshe
 * interior". So the ground falls west-south-west from the highland's foot to the sea, seven metres
 * over four hundred and thirty, and it is a **one-sided ramp and not a plane** - nought along the
 * margin against the sand sea, its full drop at the shore - for `ganeshBasin`'s reason: a ramp
 * leaves no ridge anywhere, and on ground this flat a watershed is something a traveler walks over
 * without seeing it.
 *
 * Without it the shore came out at eleven and a half metres with the coast field having forty metres
 * to take it to the water, which is a bluff and not a desert shore. It is the same measurement job 1
 * made at the Ganesh's gulf and the same answer.
 *
 * **And it lets go at the shore**, which is the swale's own rule and was found the same way: the
 * coast field has already blended the last forty metres down to the beach by the time
 * `southwestGround` sees the ground, so a seven-metre drop laid on top of that put the ground at the
 * West Meroshe's own westernmost hex centres **four metres under the sea**. So the ramp holds its
 * full drop to thirty-four metres inland and releases over the last six, which leaves a shore that
 * runs 0 at the water, 1.7 m six metres in, 2.6 at twenty and 4.5 at forty: a gravel beach on a
 * desert, which is what the atlas draws.
 */
export const MEROSHE_SKIRT = freeze({ from: point(-3380, 2400), to: point(-3810, 2500), drop: 7, shoreFrom: 6, shoreTo: 34 });
export function merosheSkirt(x, z, own = 0) {
  if (own <= 0) return 0;
  const dx = MEROSHE_SKIRT.to.x - MEROSHE_SKIRT.from.x, dz = MEROSHE_SKIRT.to.z - MEROSHE_SKIRT.from.z;
  const length2 = dx * dx + dz * dz;
  const along = ((x - MEROSHE_SKIRT.from.x) * dx + (z - MEROSHE_SKIRT.from.z) * dz) / length2;
  const shore = smooth(MEROSHE_SKIRT.shoreFrom, MEROSHE_SKIRT.shoreTo, landDistance(x, z));
  return -MEROSHE_SKIRT.drop * smooth(0, 1, along) * shore * own;
}

/**
 * **The three fans that make the skirt a bajada and not a plane.** An alluvial fan is what a desert
 * does with the water that comes down an escarpment twice in a decade: a cone of gravel spreading
 * out of one mouth, coarsest at the apex and sorting finer the further from it, and where several of
 * them overlap the result is a bajada. So: three apexes on the Dinelv margin, each spreading
 * south-west through a sector, and taken as a **maximum and not a sum**, because two fans that
 * overlap make one longer apron rather than a cone twice as high.
 *
 * They are small on purpose - four metres and a bit at the apex against the skirt's seven - because
 * the atlas says `plains` and a fan five metres high on a slope of one in sixty is the most a
 * traveler would call a swell. What they are for is the **grain size**, which is the whole of how
 * this country reads: `merosheFan` comes back 1 at an apex and 0 at the toe, and the scatter puts
 * cobbles at one end and dust at the other.
 */
const fan = (id, name, x, z, bearingX, bearingZ, reach, lift) => freeze({ id, name, x, z, bearingX, bearingZ, reach, lift });
export const MEROSHE_FANS = freeze([
  fan('north-fan', 'The North Fan', -3720, 2345, -.38, .92, 290, 4.2),
  fan('middle-fan', 'The Middle Fan', -3590, 2345, -.71, .71, 330, 5.0),
  fan('east-fan', 'The East Fan', -3450, 2270, -.64, .77, 340, 4.6),
]);
/** 1 at a fan's apex where the gravel is coarsest, 0 at its toe where it is dust. */
export function merosheFan(x, z) {
  let best = 0;
  for (const f of MEROSHE_FANS) {
    const dx = x - f.x, dz = z - f.z, d = Math.hypot(dx, dz);
    if (d >= f.reach) continue;
    const forward = d > 0 ? (dx * f.bearingX + dz * f.bearingZ) / d : 1;
    if (forward <= .1) continue;                             // behind the apex: not on the fan
    const sector = smooth(.1, .55, forward);
    best = Math.max(best, (1 - smooth(0, 1, d / f.reach)) * sector);
  }
  return best;
}
export function merosheFans(x, z, own = 0) {
  if (own <= 0) return 0;
  let best = 0;
  for (const f of MEROSHE_FANS) {
    const dx = x - f.x, dz = z - f.z, d = Math.hypot(dx, dz);
    if (d >= f.reach) continue;
    const forward = d > 0 ? (dx * f.bearingX + dz * f.bearingZ) / d : 1;
    if (forward <= .1) continue;
    best = Math.max(best, f.lift * (1 - smooth(0, 1, d / f.reach)) ** 1.4 * smooth(.1, .55, forward));
  }
  return best * own;
}

/**
 * **The Malhat: the salt, and the only water in ninety-five hexes that can be seen.** Where a
 * desert's internal drainage stops near sea level what it leaves is a sabkha - a pan floored with
 * salt, dead flat because standing water levels everything it lies in, hard enough to ring underfoot
 * in the dry months and rotten under a crust in the others. It is not a watercourse and there is no
 * water surface on it; what is drawn is the crust. The name is the tongue's own word for salt
 * (`maroshi.roots.salt` = *malhat*, `src/languages.js`), taken rather than coined, exactly as job 1
 * took *vaellir* for the river.
 *
 * **It is a levelled floor and not a bowl**, which is why it is applied as a `lerp` toward a plane
 * in `southwestGround` rather than added as a cut: a playa is flat to the centimetre over hundreds
 * of metres, and a smooth depression of the same depth would read as a hollow in a field and not as
 * the thing that makes a traveler stop walking and look at their feet. The floor's own level is
 * measured rather than typed - the designed surface at the pan's own centre, less the depth.
 */
export const MEROSHE_SALT = freeze({ id: 'malhat', name: 'The Malhat', x: -3500, z: 2560, radiusX: 150, radiusZ: 105, depth: 1.1, rim: .28 });
/** 1 on the pan's own flat floor, 0 off it, feathered over the rim. */
export function onSaltPan(x, z, margin = 0) {
  const p = MEROSHE_SALT;
  const r = Math.hypot((x - p.x) / (p.radiusX + margin), (z - p.z) / (p.radiusZ + margin));
  return 1 - smooth(1 - p.rim, 1, r);
}
let saltLevel = null;
export function saltPanLevel() {
  if (saltLevel === null) {
    const p = MEROSHE_SALT, mix = terrainMix(p.x, p.z);
    saltLevel = mix.base + southwestSlope(p.x, p.z) + merosheSkirt(p.x, p.z, 1) - p.depth;
  }
  return saltLevel;
}

/**
 * **Central Meroshe: the sink, and the sand sea that sits in it.** An erg is not sand blown onto a
 * plain, it is sand that had nowhere left to go: a shallow closed basin with no outlet, which is what
 * the atlas draws by putting this country's thirty-one hexes between a hamada on the north, a
 * highland skirt on the west, a stone floor on the south and Marosh's hills on the east, and giving
 * it no river edge at all. So the sink first - three and a half metres over six hundred, no rim, the
 * lowest ground in the Meroshe - and the dunes on top of it.
 */
export const MEROSHE_SINK = freeze({ x: -2980, z: 2480, radiusX: 340, radiusZ: 255, depth: 3.5 });
const sinkRadius = (x, z) => Math.hypot((x - MEROSHE_SINK.x) / MEROSHE_SINK.radiusX, (z - MEROSHE_SINK.z) / MEROSHE_SINK.radiusZ);
export function merosheSink(x, z, own = 0) {
  if (own <= 0) return 0;
  const r = sinkRadius(x, z);
  if (r >= 1) return 0;
  return -MEROSHE_SINK.depth * (1 - smooth(0, 1, r)) * own;
}

/**
 * **The sand sea.** "The central sand seas are genuinely extreme... Navigating the sand seas without
 * local knowledge is considered one of the more reliable methods of dying on Azhora." What makes
 * them that is not the height of a dune, it is that **you cannot go straight**: linear dunes run in
 * parallel ridges for miles, and the only fast ground is the corridor between two of them, which
 * goes where the ridges go and not where the traveler wants to.
 *
 * So: ridges on **the summer wind's own bearing**, which is job 1's - `GANESH_WIND.grainBearing`,
 * -0.71 radians, from the north-west, because it is the same wind seven hundred metres of desert
 * apart - a wavelength of **a hundred and forty metres** and **six metres** crest to floor. The
 * cross-section is deliberately asymmetric and deliberately mostly floor: **forty-eight per cent of
 * every wavelength is dead-flat corridor**, sixty-seven metres of it, then fifty-nine metres of
 * gentle windward rise at about six degrees, then a lee face of fourteen metres at twenty-three.
 *
 * **The wavelength is a measurement and was wrong once.** Real linear dunes are fifty metres high and
 * a mile and a half apart, one in thirty; at two hundred and thirty metres, which is what that ratio
 * first gave, the hillshade came back with **two ridges in the whole country** - correct arithmetic
 * and not a sand sea. A country six hundred metres across has to fit enough of them to be a field, so
 * the spacing came down to a hundred and forty (still one in twenty-three, still a real erg's ratio)
 * and the field now crosses four to five ridges over its long axis and three over its short one.
 *
 * **The field has an edge**, because an erg does: it is full inside about four fifths of the sink and
 * gone a little past its rim, so the outer corners of this country are sheet sand with low ridges in
 * them - which is where a traveler stands to look at the thing, and the only place in it with a
 * horizon.
 */
export const MEROSHE_DUNES = freeze({ wave: 140, height: 6, bearing: GANESH_WIND.grainBearing,
  floor: .48, crest: .90, inner: .78, outer: 1.10 });
/** How much of a point is inside the dune field proper: 1 in the sand sea, 0 on the sheet sand. */
export function merosheErg(x, z, own = 0) {
  if (own <= 0) return 0;
  return own * (1 - smooth(MEROSHE_DUNES.inner, MEROSHE_DUNES.outer, sinkRadius(x, z)));
}
/** The dune's own profile at a point, 0 on a corridor floor and 1 on a crest. */
export function duneProfile(x, z) {
  const d = MEROSHE_DUNES;
  const u = turned(x, z, d.bearing) / d.wave;
  const t = u - Math.floor(u);
  if (t < d.floor) return 0;
  if (t < d.crest) return ((t - d.floor) / (d.crest - d.floor)) ** 1.35;
  return 1 - smooth(d.crest, 1, t);
}
export function merosheDunes(x, z, erg = 0) {
  if (erg <= 0) return 0;
  return MEROSHE_DUNES.height * duneProfile(x, z) * erg;
}
/** 1 on a flat interdune corridor a traveler can walk fast on, 0 on a dune. */
export function merosheCorridor(x, z) {
  const own = regionShare('Central Meroshe Desert', x, z);
  if (own <= 0) return 0;
  return 1 - duneProfile(x, z) * merosheErg(x, z, own);
}

/**
 * **South Meroshe: the fog, which is the one thing in this quarter that is not dry.** `trogo.md` is
 * explicit and it is the best single sentence in the lore for this job: "Where desert air meets
 * ocean-loaded humidity along the southeastern ridge, fog forms and stays, sometimes for days. This
 * is not the cold sea-fog of Bouén's coast. It is warm and thick and close, and it waters the middle
 * elevation forest through the dry months when the rainfall alone would not be enough."
 *
 * The atlas says `BWh` on every hex of this country, so it does not rain here; the fog is how the
 * surface gets wet without it. Two fronts - one off the southern ocean, one off the Trogo margin to
 * the east - taken as a maximum, so the south-eastern corner is fog and the north-western one, against
 * Hama and the sand sea, is not. The game has no weather, so what is drawn is what the fog leaves:
 * a crust on the pavement, a varnish on the stone, and the only thorn scrub in the Meroshe that
 * stands closer together than a man can walk between. The **sky** reads it too - this is the one
 * desert country in Azhora with thicker air rather than thinner (`REGION_TEXT`).
 */
export const MEROSHE_FOG = freeze({ seaFrom: 2760, seaTo: 3080, landFrom: -2900, landTo: -2560 });
export function merosheFog(x, z, mix = null) {
  const own = merosheShare(x, z, mix);
  if (own <= 0) return 0;
  const f = MEROSHE_FOG;
  const sea = smooth(f.seaFrom, f.seaTo, z);
  const land = smooth(f.landFrom, f.landTo, x);
  return Math.max(sea, land) * own;
}
/**
 * How dark the pavement is: desert varnish is a film of manganese and iron that takes millennia to
 * form and only forms where the surface does not move, so a reg is the darkest ground in a desert and
 * the fog belt is the darkest part of it. 0 is pale gravel, 1 is stone so dark a footprint in it
 * shows from a hundred paces.
 */
export function merosheVarnish(x, z, mix = null) {
  const own = regionShare('South Meroshe Desert', x, z, mix);
  if (own <= 0) return 0;
  return own * (.34 + .66 * merosheFog(x, z, mix));
}

// ---------------------------------------------------------------------------
// The swale: a designed floor for two rivers drawn on unbuilt borders
// ---------------------------------------------------------------------------
/**
 * Both of this block's courses are drawn **on a border with a country nobody has built**, so up to
 * two thirds of the hex blend along them is `outland`, whose relief is six metres on a
 * hundred-and-fifty-metre wave against this block's own nine tenths of a metre on three hundred and
 * twenty. Left alone the water is dragged up and down by somebody else's sine - the Mithala
 * measured its west arm forced down 6.79 m over a thousand metres of exactly this - so every course
 * here is given a swale, on the Mithala's own numbers: within forty-five metres the ground is the
 * block's own designed surface (the blend's base, the tilt and no relief at all), coming back to
 * the ordinary ground by a hundred and sixty-five.
 *
 * The blend's `base` is kept and only `relief()` is dropped, because a base blends linearly across
 * a hex boundary and is therefore already smooth; it is the sine that chirps. The swale lets go at
 * the shore, because the coast field lowers the last forty metres to the sea and a levelled floor
 * laid over that would draw the river's bed in the air above the beach.
 */
export const SOUTHWEST_SWALE = freeze({ inner: 45, outer: 165, shoreFrom: 22, shoreTo: 72 });
export function nearestSouthwestRiver(x, z, limit = SOUTHWEST_SWALE.outer) {
  let best = null, distance = limit;
  for (const course of SOUTHWEST_RIVERS) {
    const d = courseDistance(course, x, z, distance);
    if (d < distance) { distance = d; best = course; }
  }
  return best ? { course: best, distance } : null;
}
export function southwestSwaleWeight(x, z, bank = null, near = null) {
  const own = bank ?? southwestBankShare(x, z);
  if (own <= 0) return 0;
  const found = near === undefined ? null : (near ?? nearestSouthwestRiver(x, z));
  if (!found) return 0;
  const inner = 1 - smooth(SOUTHWEST_SWALE.inner, SOUTHWEST_SWALE.outer, found.distance);
  const shore = smooth(SOUTHWEST_SWALE.shoreFrom, SOUTHWEST_SWALE.shoreTo, landDistance(x, z));
  return inner * shore * own;
}

// ---------------------------------------------------------------------------
// The ground
// ---------------------------------------------------------------------------
/**
 * **Every landform of this block, in one term of `west-ground.js`'s sum.** `southwestGround` wraps
 * the ground it is handed rather than adding to it, for the reason `mithalaGround` does: the swale
 * reshapes the ground rather than adding to it, and a wrapper is the only honest shape for that.
 * Two comparisons reject the rest of Azhora.
 *
 * The order inside it does not matter much - most of the terms are added - but which of them is
 * which does. The block tilts to the Vaellir's mouth; the Ganesh Desert reverses that with its own
 * fall to the gulf; West Pyros falls south with its river and the Ganesh Plain west with its
 * channels; Navarth's swells stand on top of all of it; the wind field roughens the desert's floor
 * by three quarters of a metre; and the washes, the channels and the depressions are cut into
 * whatever the rest leave, so a dry bed on the tilt runs downhill with it.
 */
export function southwestGround(x, z, ground) {
  if (!inSouthwestBox(x, z)) return ground;
  const mix = terrainMix(x, z), raw = southwestWeight(x, z, mix);
  if (raw <= 0) return ground;
  const bank = smooth(.05, .30, raw), own = smooth(.3, .8, raw);
  const navarth = regionShare('Navarth', x, z, mix);
  const desert = regionShare('Ganesh Desert', x, z, mix);
  const plain = regionShare('Ganesh Plain', x, z, mix);
  const pyros = regionShare('West Pyros', x, z, mix);
  const hamada = regionShare('North Meroshe Desert', x, z, mix);
  const skirt = regionShare('West Meroshe Desert', x, z, mix);
  const erg = regionShare('Central Meroshe Desert', x, z, mix);
  const tilt = southwestSlope(x, z) * bank
    + ganeshBasin(x, z, desert) + ganeshPlainFall(x, z, plain) + pyrosFall(x, z, pyros)
    + merosheSkirt(x, z, skirt) + merosheSink(x, z, erg);
  let height = ground + tilt + navarthCrests(x, z, navarth) + ganeshStone(x, z, desert)
    + merosheBenches(x, z, hamada) + merosheFans(x, z, skirt) + merosheDunes(x, z, merosheErg(x, z, erg));
  const near = nearestSouthwestRiver(x, z);
  const swale = southwestSwaleWeight(x, z, bank, near);
  // The designed surface: the blend's own base, the tilt, and no relief at all.
  if (swale > 0) height = height + (mix.base + tilt - height) * swale;
  height += ganeshWashCut(x, z, desert) + ganeshPlainChannelCut(x, z, plain) + ganeshDepressionCut(x, z, plain);
  // **The salt pan is levelled, not cut**: a playa is flat to the centimetre over hundreds of metres.
  const salt = skirt > 0 ? onSaltPan(x, z) * skirt : 0;
  if (salt > 0) height = lerp(height, saltPanLevel(), salt);
  return height;
}

/**
 * Whether the scatter must keep off a point for this block's own reasons: a dry bed's floor, or the
 * salt pan's crust, where nothing roots at all because the ground it would root in is brine.
 */
export const southwestClear = (x, z, margin = 0) => onWashFloor(x, z, margin) || onChannelFloor(x, z, margin)
  || onSaltPan(x, z, margin) > .25;

// ---------------------------------------------------------------------------
// The colour of the ground
// ---------------------------------------------------------------------------
/**
 * Four grounds the atlas's terrain field cannot colour, for the reason Gala's, the Oves's and the
 * Mithala's could not be: the field says `plains` in all four countries and means several different
 * things, and what decides the colour here changes over a hundred metres where the terrain word
 * changes over a hex.
 *
 * What decides it is **how dry the air is** (`southwestAridity`, which is a gradient across the
 * whole block), **whether the wind has swept the sediment off** (`ganeshLie`, which changes over
 * forty metres in the desert), **whether a point is in one of the Ganesh Plain's depressions**,
 * which is where all the grass on that plain is, and **whether it is on the damp reach**, which is
 * the only green in the desert.
 *
 * Hooked into `groundTint` (src/world-terrain.js) for these four countries' own swatches only;
 * everywhere else it answers null and nothing changes.
 */
export const SOUTHWEST_GROUND = freeze({
  swept: 0x7a7159,     // the wind's own floor: pale stone under a skin of grit, the driest colour in the game
  pocket: 0x685f45,    // where the fine sediment has gathered a hand deep, and darker for it
  green: 0x68753f,     // the two wet corners, and the depressions on the plain
  damp: 0x5c6c3f,      // the damp reach in the south wash, the one green thing in the Ganesh
  // The four Meroshe surfaces. **These are the whole of how four countries with one terrain word and
  // one climate code are told apart from the air**, and they are the four real colours of a hot
  // desert: bare rock, sand, varnished pavement, salt.
  rock: 0x67644f,      // hamada: bedrock under a skin of grit - grey where everything else here is warm
  sand: 0x7e7250,      // erg: clean quartz sand, the warmest and lightest ground in the block
  reg: 0x352a1c,       // reg: close-packed pebbles under desert varnish, the darkest dry ground in the game
  crust: 0x9c9a89,     // sabkha: a salt crust, and the only near-white the block is allowed
});
const SWATCHES = freeze(new Set(SOUTHWEST_REGIONS.flatMap(name => {
  const profile = REGION_TERRAIN[name];
  return [profile.ground, ...Object.values(profile.byTerrain ?? {}).map(entry => entry.ground)];
})));
const mixHex = (from, to, t) => {
  const k = clamp(t, 0, 1);
  const channel = shift => { const a = (from >> shift) & 255, b = (to >> shift) & 255; return Math.round(a + (b - a) * k) & 255; };
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
};
const hexOf = swatch => (typeof swatch === 'string' ? parseInt(swatch.replace('#', ''), 16) : swatch);
export function southwestTint(x, z, ground) {
  if (!inSouthwestBox(x, z) || !SWATCHES.has(ground)) return null;
  const own = southwestShare(x, z);
  if (own <= 0) return null;
  const base = hexOf(ground);
  let colour = base;
  const dry = southwestAridity(x, z);
  if (dry < .55) colour = mixHex(base, SOUTHWEST_GROUND.green, smooth(.55, .12, dry) * .8);
  const lie = ganeshLie(x, z);
  if (lie > 0) colour = mixHex(colour, lie > .5 ? SOUTHWEST_GROUND.swept : SOUTHWEST_GROUND.pocket,
    Math.abs(lie - .5) * 1.3);
  const pan = inDepression(x, z);
  if (pan > 0) colour = mixHex(colour, SOUTHWEST_GROUND.green, smooth(.05, .8, pan) * .55);
  const damp = ganeshDamp(x, z);
  if (damp > 0) colour = mixHex(colour, SOUTHWEST_GROUND.damp, smooth(.05, .7, damp) * .8);
  if (!inBox(MEROSHE_BOX, x, z)) return colour === base ? null : colour;
  // The four Meroshe surfaces, in the order a traveler crossing from the Ganesh Plain meets them.
  // **The rock and the sand are pulled well below the swatch they start from** and the salt crust is
  // the only pale thing allowed, which is job 1's haze lesson taken at its word: at .0024 with a warm
  // dust haze, more than half of every pixel past a hundred and fifty metres is haze rather than
  // ground, so a ground that is honest about a desert on the screen has to be darker than a desert.
  const mix = terrainMix(x, z);
  const rock = regionShare('North Meroshe Desert', x, z, mix);
  if (rock > 0) colour = mixHex(colour, SOUTHWEST_GROUND.rock, rock * (.58 + merosheBench(x, z).edge * .34));
  const erg = merosheErg(x, z, regionShare('Central Meroshe Desert', x, z, mix));
  if (erg > 0) colour = mixHex(colour, SOUTHWEST_GROUND.sand, erg * (.50 + duneProfile(x, z) * .42));
  const varnish = merosheVarnish(x, z, mix);
  if (varnish > 0) colour = mixHex(colour, SOUTHWEST_GROUND.reg, varnish * .88);
  const skirt = regionShare('West Meroshe Desert', x, z, mix);
  if (skirt > 0) {
    colour = mixHex(colour, SOUTHWEST_GROUND.rock, skirt * merosheFan(x, z) * .52);
    const salt = onSaltPan(x, z) * skirt;
    if (salt > 0) colour = mixHex(colour, SOUTHWEST_GROUND.crust, smooth(.05, .75, salt) * .94);
  }
  return colour === base ? null : colour;
}

// ---------------------------------------------------------------------------
// The places
// ---------------------------------------------------------------------------
/**
 * The natural places worth a name on the chart.
 *
 * **One name is taken and nothing is coined.** This is the first block in the west whose people's
 * tongue is actually in `world-builder/azhoran_language_profiles.py` - there is a `pyrosi` profile,
 * where there is no Mithali, no Ovesi and no Lothi - and `src/languages.js` carries it with its
 * lexicon. So the great river is **the Vaellir**, which is that lexicon's own word for a river,
 * used the way an Avon is a river: the tongue's word rather than an invention. Everything else is
 * either the lore's own word (the Ganesh, the Navarth Plateau, the washes, the depressions) or
 * plain English. The Ganesh's own name is left entirely alone, because `ganesh_desert.md` is
 * emphatic that it is pre-Moreshi and that "whoever named this desert named it in a way that no
 * current language on the peninsula can explain".
 *
 * Two places are named for what is *not* on them, because leaving them unnamed would be dishonest
 * about the ground: **the Vaellir's ford**, which is the only crossing of the largest river in this
 * quarter and has nothing built at it, and **the damp reach**, which is where the lore puts a
 * caravan waystation and where there is none.
 */
const onCourse = (course, t, offset = 0) => {
  const samples = course.samples;
  const sample = samples[clamp(Math.round((samples.length - 1) * t), 0, samples.length - 1)];
  if (!offset) return point(sample.x, sample.z);
  for (const side of [1, -1]) {
    const x = sample.x + sample.nx * offset * side, z = sample.z + sample.nz * offset * side;
    if (SOUTHWEST_REGIONS.includes(hexOwnerAt(x, z))) return point(x, z);
  }
  return point(sample.x, sample.z);
};
const onWash = (wash, t) => {
  const line = wash.line;
  const index = clamp(Math.round((line.length - 1) * t), 0, line.length - 1);
  return point(line[index].x, line[index].z);
};

export const SOUTHWEST_LANDMARKS = freeze([
  // ----- Navarth -----
  freeze({ id: 'navarth-plateau', name: 'The Navarth Plateau', x: -3330, z: 1150,
    description: 'The high ground of this whole quarter of the continent: a worn tableland standing forty metres over the plain on the one side and thirty over the desert on the other, open in every direction, with broad sweeps of bare scrub between rounded swells of pale stone. The lore calls Navarth cold plateau country. The map says hot desert, and the map wins: what this altitude buys here is not snow but a night you can feel, and a wind off the open ground that never stops.' }),
  freeze({ id: 'navarth-swells', name: 'The Swells', x: -3300, z: 1068,
    description: 'Ten rounded rises through the middle of the plateau, none of them more than fifteen metres over the sweeps between them and every one of them visible from the last. Worn round rather than cut, with the stone showing grey through the thin soil along their tops. The Pyrosi of this country keep their fire ceremonies on ground like this, at places that stand where a fumarole would be if the volcanic rock reached this far north. There is no fire on any of these.' }),
  freeze({ id: 'navarth-west-rim', name: 'The Western Rim', x: -3480, z: 1200,
    description: 'Where the plateau ends. Four swells in a line along the western edge, and from the top of any of them the ground goes down thirty metres and then does not come up again: the Ganesh runs from the foot of this rim to a horizon that has nothing on it at all. It is the one view in the southwest that explains the geography in a single look.' }),
  freeze({ id: 'navarth-wood', name: 'The North Wood', x: -3300, z: 900,
    description: 'The block’s one hex of forest, at Navarth’s north-eastern tip, where the air turns Mediterranean for two hexes and the Ibenwood’s southern edge begins. Oak and pine standing well apart on a shoulder falling north-east, with the desert scrub thinning out behind them and the great forest going on north out of sight. Two hundred paces south of the last tree it has not rained properly in years.' }),
  freeze({ id: 'alezhor-water', name: 'The Alezhor Water', ...onCourse(ALEZHOR_WATER, .45, 26),
    description: 'A small river running west along the top of Navarth and then down the Ganesh’s north-eastern edge to the sea. It rises in the green grassland country over the northern border and gains nothing at all on the way through: what reaches the gulf is what left Alezhor, less what the ground and the air took. Waded anywhere along it, and the only running water in eighty hexes.' }),
  // ----- West Pyros -----
  freeze({ id: 'the-vaellir', name: 'The Vaellir', ...onCourse(VAELLIR, .55, 30),
    description: 'The great river of the southwest and the second the atlas draws large, after the Lizeem itself. It comes down the whole of West Pyros’s eastern side out of the Pyros hill country, growing from a gravel head a traveler wades to a hundred paces of slow green water nobody crosses. The far bank is East Pyros and there is no way to it here, or anywhere below the ford. The lore’s Gala stands on a terraced hill above a confluence somewhere on this water; it is not on this ground and it is not built.' }),
  freeze({ id: 'vaellir-ford', name: 'The Vaellir Ford', ...onCourse(VAELLIR, .12, 22),
    description: 'The head of the river, where it still runs shallow and quick over gravel: shin-deep, forty paces across, and the only place in a day’s walk that either bank can be reached from the other. Nothing is built at it. Everything that has ever crossed this river on foot has crossed it here.' }),
  freeze({ id: 'vaellir-mouth', name: 'The Vaellir Mouth', ...onCourse(VAELLIR, .97, 28),
    description: 'Where the river reaches the sea at the southern tip of West Pyros. The banks flatten, the water goes wide and grey with what it is carrying, and the grass on both sides turns green for the last hex and a half - the only properly wet ground in the southwest, and the smallest of the two corners where this block stops being a desert.' }),
  freeze({ id: 'pyros-open-plain', name: 'The Open Plain', x: -2950, z: 1300,
    description: 'The body of West Pyros: semi-arid bunch grass in tussocks with bare pale earth showing between them, falling south for eight hundred metres with nothing on it but the line of trees along the river to the east. The lore calls this the wetter half of Pyros and the most productive farmland on the continent; the map calls it steppe with desert on its western columns, and the terraces and the orchards are somewhere the atlas does not draw.' }),
  freeze({ id: 'pyros-green-tip', name: 'The Green Tip', x: -2560, z: 1660,
    description: 'One hex of Mediterranean grass at the river’s mouth, where the sea and Marosh’s country begin together. Walking south down this plain the grass gets greener over about four hundred paces and then there is a horizon of water. It is the only place in the southwest where anything is green because of the weather rather than because of a hollow in the ground.' }),
  // ----- The Ganesh Desert -----
  freeze({ id: 'ganesh-floor', name: 'The Ganesh', x: -3560, z: 1520,
    description: 'The driest country in Azhora and the largest of these four: thirty-one hexes of hot desert, flat to gently rolling, with no canyon, no escarpment and nothing whatever between a traveler and the horizon. The surface is a thin skin of pale sediment over stone, swept down to grit on every rise and gathered a hand deep in every pocket. Scrub the height of a knee stands far enough apart to walk between, each plant with roots reaching further out than it stands tall, and between them nothing.' }),
  freeze({ id: 'ganesh-wind-grain', name: 'The Wind Grain', x: -3620, z: 1400,
    description: 'The long low ridges the summer wind has combed into the sediment, running north-west to south-east across the whole desert two hundred paces apart and half a metre high. In a country with no landmark at all they are the one thing that can be steered by, and they point where the wind comes from: out of the north-west, hot and drying, all summer.' }),
  freeze({ id: 'ganesh-washes', name: 'The Washes', ...onWash(GANESH_WASHES[0], .5),
    description: 'Two cut beds crossing the desert from east to west with nothing in either of them. They carry the Ganesh Plain’s channels on toward the gulf in the wet years and are dry in every other, floored with coarse gravel, deep enough to stand in and out of the wind, and walked down the middle as a road. Neither reaches the shore: a bed that runs once in five years does not keep a mouth open.' }),
  freeze({ id: 'ganesh-damp-reach', name: 'The Damp Reach', ...onWash(GANESH_WASHES[1], .5),
    description: 'A hundred and twenty metres of the south wash where the water below the gravel comes near enough the surface to keep something alive: grey-green scrub standing in a dry bed, twice the size of anything within a mile of it, and nothing at all to drink. The lore puts the caravan waystations at points like this one, at the old water places with worked stone round them. There is nothing here but the scrub.' }),
  freeze({ id: 'ganesh-shore', name: 'The Gulf Shore', x: -3740, z: 1240,
    description: 'The strangest thing in the southwest: a desert that runs out at the sea. The scrub thins, the sediment turns to sand within forty paces, and the water is there - and the ground a hundred paces inland is as dry as the ground twenty miles in. The Alezhor Water comes in beside it, having crossed the desert without gaining a drop.' }),
  // ----- The Ganesh Plain -----
  freeze({ id: 'ganesh-plain-channels', name: 'The Drainage Channels', x: -3010, z: 1660,
    description: 'Three shallow cuts across the plain, a metre deep and nine across, too diffuse to be called rivers by anybody who has seen one. Two run west into the Ganesh and the third leaves the same low ground going the other way, to the sea. They carry water in the wet years and lie dry in the drought years, which is most of them, and this is a drought year. The pastoral communities of this plain know every one of them by name and read the state of the grass in them the way other people read a calendar.' }),
  freeze({ id: 'ganesh-depressions', name: 'The Depressions', x: -2880, z: 1700,
    description: 'Eight shallow closed hollows strung along the channels, a metre below the plain and a hundred and fifty paces across, and every one of them greener than the ground round it. Water gathers in them, the clay holds it longer than the desert’s rock does, and the grass lasts weeks longer. On this plain in a dry year the depressions are the only green there is, and every route across it goes from one to the next.' }),
  freeze({ id: 'ganesh-plain-divide', name: 'The Divide', x: -2700, z: 1790,
    description: 'The low rise along the eastern side of the plain, and it is a divide a traveler walks over without noticing. West of it every drop goes to the Ganesh and is gone; east of it the ground falls a few hundred paces to the sea. Two metres of rise decide it, and on ground this flat two metres is what a watershed is.' }),
  freeze({ id: 'ganesh-plain-green-corner', name: 'The Green Corner', x: -2620, z: 1780,
    description: 'The south-eastern corner, where Marosh’s country begins: one hex of Mediterranean grass and three of something between that and desert, all of it a different colour from the plain behind it. The lore calls this whole plain ground that cannot decide which zone it belongs to, and this corner is where the argument is settled in favour of the green.' }),
  // ----- The North Meroshe Desert: the hamada -----
  freeze({ id: 'meroshe-hamada', name: 'The Hamada', x: -2950, z: 2110,
    description: 'The northern transition of the great desert, and it is not sand: it is rock. A floor of bare bedrock under a skin of gravel, swept clean, ringing under a boot, with the hard beds standing out of it in low steps a metre or two high that run north and south for three hundred paces at a time. The lore calls it "the rocky hammada of the northern transition zone — flat gravel plains and exposed bedrock where scrubby thorn trees still manage to exist", and that is exactly what stands here: thorn, and nothing else, and a great deal of stone.' }),
  freeze({ id: 'meroshe-benches', name: 'The Stone Steps', x: -3110, z: 2100,
    description: 'Nine low escarpments crossing the hamada from north to south, each of them a metre or two of riser and then a long back slope to the next. They are the outcrops of harder beds dipping east off the Dinelv highland, and they are the only thing in this country that gives a direction: the sand sea one hex south runs north-west to south-east on the wind, and the stone runs north and south on the rock, so a traveler who knows which way the lines go knows which country they are standing in.' }),
  freeze({ id: 'meroshe-thorn', name: 'The Thorn Ground', x: -2860, z: 2020,
    description: 'The only trees in ninety-five hexes of desert, and they are growing out of a crack in a rock. Thorn, waist-high to head-high, rooted in the joints of the bedrock where the last rain went and stayed — a dozen paces apart where the joints are close and half a mile apart where they are not. Nothing else in the Meroshe is tall enough to stand in the shade of.' }),
  freeze({ id: 'meroshe-dust-line', name: 'The Dust Line', x: -2900, z: 1940,
    description: 'Where the Ganesh Plain stops. Walking south off the plain the pale clay thins over about two hundred paces, the grass tufts give out one by one, and then there is stone underfoot and nothing standing anywhere. There is no ridge, no river and no line on any map: the plain simply runs out of soil. It is the northern door of the whole Meroshe and there is nothing at it.' }),
  freeze({ id: 'meroshe-green-shoulder', name: 'The Green Shoulder', x: -2730, z: 1950,
    description: 'The north-eastern corner, and on the atlas the one place in the Meroshe where a traveler could see green. Two hexes east the ground goes up into Marosh’s Mediterranean hills — grass, olive, oak scrub, winter rain — and from the last of the hamada it is a low green shoulder on the horizon with heat shimmer between. The distance is under a mile and the difference is a climate. **Marosh is not built**, so what stands on that horizon today is open country and not the hills; what is real here is the far side of the argument, which is hot desert to the last hex and a dry wind coming off it.' }),
  // ----- The West Meroshe Desert: the fan skirt and the salt -----
  freeze({ id: 'meroshe-fan-skirt', name: 'The Fan Skirt', x: -3590, z: 2420,
    description: 'The apron below the Dinelv escarpment: three broad cones of gravel spread south-west out of the highland’s mouths and grown together into one skirt falling to the sea. What a traveler notices is the size of the stones. At the heads they are cobbles a hand across and the walking is bad; four hundred paces down the fan they are pebbles; at the toe they are dust deep enough to print. Water comes down these twice in a decade and the sorting is all it has left behind.' }),
  freeze({ id: 'meroshe-salt-pan', name: 'The Malhat', x: -3500, z: 2560,
    description: 'The one place in ninety-five hexes where water can be seen, and it cannot be drunk. Three hundred paces of floor so flat it has no features at all, floored in a white salt crust that rings under a boot in the dry months and gives way to grey mud under it in the others. This is where the fan skirt’s drainage stops: nothing leaves the Malhat except upward. The Moreshi word for salt is *malhat*, and the pan has no other name.' }),
  freeze({ id: 'meroshe-dry-shore', name: 'The Dry Shore', x: -3700, z: 2440,
    description: 'A desert that runs out at an open ocean, which is the second time this block does it and the more extreme of the two: the Ganesh has a sheltered gulf and this has the whole western sea, with the weather of half a world arriving on it and not a drop of it falling here. Gravel, then sand for forty paces, then surf. A hundred paces inland the ground is as arid as it is twenty miles in, and the only things alive on it came out of the water.' }),
  freeze({ id: 'meroshe-escarpment-foot', name: 'The Escarpment Foot', x: -3660, z: 2350,
    description: 'The northern edge of the fan skirt, where the Dinelv plateau stands up out of the desert. Looking north from here the ground goes up in stepped bands of rock — the warm-toned stone the Dinelv trade quarries low down, the harder dark stone above it — and the seasonal channels that cut the face are visible as dark lines all the way to the rim. The caravan road to the plateau passes somewhere along this foot. It is not built and neither is the plateau.' }),
  // ----- The Central Meroshe Desert: the erg -----
  freeze({ id: 'meroshe-sand-sea', name: 'The Sand Sea', x: -3150, z: 2585,
    description: 'The erg, and the only one in Azhora. Parallel ridges of clean sand running north-west to south-east on the summer wind’s bearing, seven metres from floor to crest and two hundred and thirty paces apart, with a flat gravel corridor between every pair. From the crest of one the next is the horizon. The lore is plain about what this ground is: "the central sand seas are genuinely extreme… Navigating the sand seas without local knowledge is considered one of the more reliable methods of dying on Azhora."' }),
  freeze({ id: 'meroshe-corridors', name: 'The Corridors', x: -2960, z: 2460,
    description: 'The floors between the dunes, and the only fast ground in the sand sea. They are swept flat and hard by the same wind that piled the ridge beside them, and a traveler can walk one at speed for half a mile — north-west or south-east, and no other direction, because that is the way the ridges go. Crossing the erg against the grain means climbing every ridge in turn, and there are a dozen of them.' }),
  freeze({ id: 'meroshe-sink', name: 'The Sink', x: -2920, z: 2520,
    description: 'The reason the sand is here. This whole country lies in a shallow closed basin three and a half metres below its own rim, with no river edge anywhere on it and no outlet in any direction — hamada to the north, a highland skirt to the west, a stone floor to the south and Marosh’s hills to the east. Sand that gets into the Meroshe gets into this, and does not leave.' }),
  freeze({ id: 'meroshe-sand-edge', name: 'The Sand Edge', x: -2780, z: 2610,
    description: 'Where the sand sea gives out. The ridges get lower over about three hundred paces, then broken, then they are just streaks of sand lying on a gravel floor, and the horizon comes back. It is the only place in this country from which the erg can be seen as a thing rather than walked in, and it is where anybody with sense turns round.' }),
  // ----- The South Meroshe Desert: the reg and the fog -----
  freeze({ id: 'meroshe-stone-floor', name: 'The Stone Floor', x: -2800, z: 2800,
    description: 'The reg: a pavement of pebbles packed edge to edge over the whole country, flat enough to see twenty miles across and dark enough to look wet. The colour is desert varnish, a film of iron and manganese that takes an age to form and only forms where the surface never moves — so the ground here is old in a way that the sand sea two hexes north is not, and a footprint on it will still be there next year.' }),
  freeze({ id: 'meroshe-fog-margin', name: 'The Fog Margin', x: -2650, z: 2720,
    description: 'The strangest ground in the Meroshe: desert that gets wet without being rained on. The atlas gives this hex hot desert like all the rest, and the fog off the southern ocean and off Trogo’s ridge comes in over it and stays, sometimes for days — "warm and thick and close", the lore says, not the cold sea-fog of the northern coasts. What it leaves is a crust on the stone, lichen in the lee of every pebble, and thorn standing close enough together to make a traveler walk round it, which nothing else in this desert does.' }),
  freeze({ id: 'meroshe-forest-wall', name: 'The Forest Wall', x: -2560, z: 2640,
    description: 'The eastern edge of the stone floor, and the sharpest boundary the atlas draws anywhere: thirteen hex edges of hot desert against tropical rainforest. Trogo begins at the next hex east and goes up in one wall of dark canopy with cloud sitting in it: "the desert’s last water meets the coast’s first moisture and produces a consequence that neither the desert peoples to the northwest nor the Maroshi kingdom to the north has entirely figured out what to do with: tropical rainforest." **Trogo is not built**, so there is no canopy on that horizon yet. What has already crossed the line is the fog, and this is where it stands thickest.' }),
  freeze({ id: 'meroshe-south-shore', name: 'The Southern Shore', x: -2860, z: 3040,
    description: 'The bottom of the desert and the bottom of the continent’s southwest: the stone floor runs south until the pebbles turn to shingle and then to the southern ocean, with the whole Meroshe behind it and nothing but water in front. Four hex edges of it, and the fog comes ashore here first.' }),
]);
