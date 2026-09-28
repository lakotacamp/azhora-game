/**
 * The animals of the East Lotharn, as ranges for the western wildlife rigs (`src/west-regions-life.js`
 * draws them, instanced and distance-culled, and they are ambient: nobody can attack, catch or speak
 * to them).
 *
 * The lore catalogues no Lotharn fauna, so every one of these is an extension and says so. What it
 * does give is the country: "managed old-growth, forest that knows people", oak, chestnut and beech
 * - mast for boar and browse for deer - "sheep... kept on the seasonal upland pastures for as long as
 * anyone has records", open ridge-tops kept for grazing, and the valleys' own water. The wolves, the
 * trolls and the giants of the Empire arc's level-three range are not here: they are fights, and
 * fights are the campaign's to place.
 *
 * The ranges are on open ground - the balds, Upper Olveth's grass, Kemrath's western floor - because
 * an animal backing off from somebody needs room behind it, and a wood of trunks four metres apart
 * is a maze to a deer. Every site was measured on the built ground: dry, the range's own, and off
 * the water; `tests/east-lotharn-world.test.js` holds them to it.
 */
const freeze = Object.freeze;
const zone = (id, species, radius, box, sites, note, traits = {}) => freeze({
  id, species, region: 'East Lotharn Mountains', radius, scale: 1, keepRegion: true,
  minX: box[0], maxX: box[1], minZ: box[2], maxZ: box[3],
  sites: freeze(sites.map(site => freeze(site))), note, ...traits,
});

export const EAST_LOTHARN_WILDLIFE_ZONES = freeze([
  zone('olveth-sheep', 'hill-sheep', .55, [-1395, -1262, -1075, -955], [[-1340, -1010], [-1300, -1030], [-1310, -1022], [-1352, -1026], [-1346, -1048]],
    'The lore’s own: "the textile traditions of the higher, cooler valleys - where sheep have been kept on the seasonal upland pastures for as long as anyone has records". Upper Olveth’s summer grass, the fold on it, and a flock with nobody watching it yet.'),
  zone('central-bald-deer', 'red-deer', .55, [-1295, -1160, -1035, -910], [[-1228, -972], [-1214, -960], [-1242, -986], [-1220, -990]],
    'Extension: red deer, the game’s deer, on the grazed top of the central massif at the edge of the wood - the open ground in an old broadleaf forest is where a deer is seen at all.',
    { hornless: true }),
  zone('eastern-bald-hares', 'upland-hare', .3, [-1030, -905, -885, -765], [[-966, -824], [-952, -838], [-980, -810]],
    'Extension: hares on the eastern bald, the same thin, short-grazed turf the upland hares keep elsewhere, at the top of the range.'),
  zone('kemrath-herons', 'wading-bird', .4, [-1575, -1450, -855, -795], [[-1493, -821], [-1524, -821]],
    'Extension: grey herons on the Kemrath water’s slow reach below the fields, the one place in the range where a stream meanders over a flat floor and stands still enough to fish. A heron put up goes over the wood and comes back to the same bend.'),
  zone('kemrath-boar', 'boar', .7, [-1585, -1455, -880, -790], [[-1520, -842], [-1540, -838], [-1505, -834]],
    'Extension: boar at the wood’s edge on Kemrath’s western floor, where the chestnut and oak mast comes down to the valley - the pig of every oak country there is.'),
  zone('central-massif-hawk', 'plateau-hawk', .3, [-1320, -1140, -1050, -890], [[-1230, -965]],
    'Extension: the dry-plateau hawk, which the lore puts on the upland grass of the country east of here, riding the air over the central massif’s bald - one bird, high.',
    { air: 34 }),
]);
