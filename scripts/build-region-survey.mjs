#!/usr/bin/env node
/**
 * Generate src/region-survey.js from assets/azhora-dev-regions.json.
 *
 * The renderer builds the playable world synchronously, and the Node tests load
 * src modules through a data: URL loader, so neither can fetch or read the
 * 240 KB atlas at module time. This script bakes the small part the game needs
 * into an ordinary ES module: the playable regions' hexes, and every claimed
 * hex near the playable window so the coastline knows where the sea is.
 *
 * tests/region-survey.test.js re-derives the same file and fails if it drifts.
 * Never hand-edit src/region-survey.js; run `node scripts/build-region-survey.mjs`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PLAYABLE = ['Drent', 'Luscia', 'Moros Plain', 'East Suval', 'West Suval', 'Pueth', 'Peblos', 'West Izol', 'Elagos', 'Amod', 'Vastos', 'Meneth', 'Caricas', 'Nesdor',
  'Isareos', 'Nethereum', 'Ovesos', 'Oves Desert', 'Gala', 'Eer', 'South Suval', 'Iscare Archipeligo', 'East Lotharn Mountains', 'Feradom', 'Northern Ascarth', 'Southern Ascarth',
  'West Lotharn Mountains', 'South Mithala', 'West Mithala', 'East Mithala', 'North Mithala',
  'Navarth', 'West Pyros', 'Ganesh Desert', 'Ganesh Plain',
  'North Meroshe Desert', 'West Meroshe Desert', 'Central Meroshe Desert', 'South Meroshe Desert'];
/**
 * **Hexes the atlas leaves unclaimed inside one region, which belong to the region all round them.**
 * The World Builder map paints these with a terrain and forgets to say whose they are; the dev atlas
 * this script reads therefore leaves them out. Left out they are not land, and the coast field calls
 * anything that is not land the sea - so a hex like this is cut to sea level, given a beach, and
 * becomes a hundred-metre hole of open water in the middle of somebody's country.
 *
 * The rule is narrow on purpose: a hex belongs here only when **every one of its six neighbours is
 * the same region**, and it keeps the terrain the map gives it. Two hexes on the whole atlas meet it:
 *
 *  - **the Stillwater** at (6,120), `lake`, ringed by South Suval. Of the atlas's twenty-eight lake
 *    hexes exactly one meets the rule; the lakes between Elagos, Amod and Drent, and those round
 *    Nethereum, touch several regions or open water and stay as they are. The region takes the hex as
 *    a `lake` cell, the way Elagos holds its own lakes, and src/south-suval-world.js cuts the basin
 *    to the lake's own level. tests/south-suval-world.test.js checks the World Builder map agrees;
 *  - **(5,92)**, `hills`, ringed by South Mithala on all six sides - found when the Mithala plain was
 *    built, because the ground there came out at 0.6 m between two hexes at 12 and 13, with a beach
 *    round it, in the middle of the flattest country in the game. Taking it makes the plain one piece
 *    (South Mithala's outline goes from two loops to one) and makes the Lotharn's last apron the
 *    unbroken chain of five `hills` hexes the map actually draws, from (3,93) to (7,91), instead of
 *    two separate swells with a pond between them.
 *
 * This used to be `ENCLOSED_LAKES` and held only the first of the two.
 */
export const ENCLOSED_HEXES = Object.freeze({
  'South Suval': Object.freeze([Object.freeze([6, 120, 'lake'])]),
  'South Mithala': Object.freeze([Object.freeze([5, 92, 'hills'])]),
});
/**
 * Axial window around the playable regions, in atlas hex coordinates. Wide
 * enough that every coast and inland horizon inside the world bounds is honest.
 *
 * `minQ` was -14, and that was too narrow twice over. It is too narrow already:
 * forty-nine claimed hexes of Legemum, East Pyros and the Aurumlis fall inside
 * today's coast lattice (WORLD_BOUNDS widened by COAST_MARGIN) and were being
 * left out of LAND_HEXES, so the coast field called land sea. Nothing is built
 * out there, so what it cost was horizon rather than ground. And it is far too
 * narrow for the six southern countries: Nethereum reaches x = -2900 and the
 * Nether Desert behind it -3050, so without them the ground immediately west of
 * Nethereum would be open water.
 *
 * -33 was measured, not chosen: over the world bounds the six produce, the coast
 * lattice can sample a hex whose centre lies within COAST_MARGIN plus one hex
 * circumradius of the bounds, and the westernmost such hex on the whole atlas is
 * at q = -31. Two hexes of slack, and no more, because every hex in the window
 * is a line in a generated file.
 *
 * Then `minQ` was -33, and **the Ganesh Desert is the first playable country to
 * reach it**: its westernmost hexes are (-33,123) through (-33,126), whose outer
 * flat stands at x = -3900, so the world's western edge goes from -3010.002 to
 * **-3960.002** and the world from 36.20 hexes wide to **45.70**. The coast
 * lattice is laid COAST_MARGIN (96 m) beyond that and snapped to its own fixed
 * phase, so its first column now stands at x = **-4056.002**. Sampling the whole
 * lattice (1,192 x 1,191 points) and collecting every hex any sample falls in
 * gives q **-41**...34, r 79...135 - measured rather than reasoned, the same rule
 * maxR 135 and minR 79 were set by. The westernmost column the lattice reaches is
 * q = -41 on rows 134-135, in the far south-west, because x = W(q + r/2) puts a
 * low q and a high r at the same world x. So minQ is -41: the last column the
 * lattice reaches, and no slack.
 *
 * That widening turns **71 claimed hexes in six countries** from sea into land -
 * Cape Heth 19 (the whole of it), the Dinelv Highlands 14, South Ibenal 14, the
 * West Meroshe Desert 13, Alezhor 7 and West Ibenwood 4. **None of them is the
 * block's own**: all four southwestern countries already lay inside q >= -33.
 * What the 71 are is the block's horizon, and the Ganesh Desert needs them: Cape
 * Heth is its western neighbour across five hex edges, and without those hexes
 * the desert would have looked out on open water where the atlas draws a cape.
 *
 * Then `minQ` was -41, and **the four Meroshe deserts moved it again without
 * reaching west at all**. Their westernmost hex is the West Meroshe's (-37,133)
 * at x = -3750, a hundred and fifty metres inside the edge the Ganesh Desert set,
 * so `WORLD_BOUNDS.minX` does not move. What moves is `maxZ` (see below), and
 * because x = W(q + r/2) puts a low q and a high r at the same world x, a lattice
 * that reaches nine rows further south reaches four columns further west in the
 * same breath. Measured over the whole lattice: q **-45**...34, and the columns
 * at q = -45 are reached only on rows 142-144, in the far south-west corner.
 *
 * `minR` was 92, which is the East Lotharn's own northern row, and the East Lotharn is the first
 * playable country to reach it. Its northern edge then takes the world's bounds to its hexes'
 * rim, and the coast lattice samples out to COAST_MARGIN plus a circumradius beyond that: row 90
 * of South Mithala, measured. Row 91 left out would have called the Mithala plain the sea along
 * the whole north face of the range. Two rows, and no slack past the one the lattice reaches.
 *
 * Then `minR` was 90, and **the four Mithala countries are the first playable ones north of it**.
 * North Mithala's northernmost hex is (11,82), its centre at z = -2049.5 and its top corner at
 * -2107.2, so the world's northern edge goes from -1301.2 to **-2167.196** and the world from
 * 37.00 hexes tall to **45.66**. The coast lattice is laid COAST_MARGIN (96 m) beyond that and
 * snapped to its own fixed phase, so its first row stands at z = **-2264.35**; a pointy-top hex
 * reaches a circumradius (57.735 m) past its centre at its top and bottom vertices, and row 79's
 * centres are at -2309.3, which puts its lower vertices at -2251.6 - north of the lattice's first
 * row by thirteen metres. Sampling the whole lattice and collecting every hex any sample lands in
 * gives q -31...34, r **79**...135, measured rather than reasoned. So minR is 79: the last row the
 * lattice reaches, and no slack. (maxQ is already exactly 34 and gains none, which is not a
 * coincidence - x = W(q + r/2), so ten rows further north is five columns further east for the
 * same world x.)
 *
 * That widening turns **329 claimed hexes in seventeen countries** from sea into land, which is
 * what the Mithala's northern horizon is made of: South Acordwood 37, North Oreminidi 29, Narcosh
 * 28, Henborth 27, West Acorwood 23, the Acor Wetlands 21, East Acordwood 19, Cudon 18, the Lesser
 * Oremindi 18, Cape Thalmagar 15, North Acorwood 13, the West and East Oremindi 9, and 72 of the
 * Mithalas' own. Without it the plain would have ended in open water one hex north of North
 * Mithala's last row, where the atlas draws the Acor Wetlands and the great forest.
 *
 * `maxR` was 133, which West Izol's southern shore set, and the two Ascarths are the first
 * playable countries to reach past it: Southern Ascarth's tip is row 132, its hex's southern
 * corner stands at z = 2338.4, and the world's southern edge goes from 2225.2 to 2398.4. The coast
 * lattice samples out to COAST_MARGIN beyond that, to z = 2495.6, which is inside rows 134 and 135
 * and no further, measured. Twenty-five claimed hexes lie in those two rows under the lattice -
 * Selemi's six among them, the island a hundred and seventy metres south of the tip across a
 * channel one hex wide - and with 133 they were all the sea: the tip would have looked out on open
 * water where the atlas draws Selemi's shore. So 135, the last row the lattice reaches, and no slack.
 *
 * Then `maxR` was 135, and **the four Meroshe deserts are the first playable countries past it** -
 * the only direction this world had left. The South Meroshe Desert's southernmost hexes are
 * (-32,141) and (-31,141), their centres at z = 3060.09 and their lower vertices a circumradius
 * (57.735 m) past that at 3117.82, so the world's southern edge goes from 2398.401 to
 * **3177.823940164498** and the world from 45.656 hexes tall to **53.450**. It is now 45.70 by
 * 53.45: taller than it is wide, for the first time since the Ascarths.
 *
 * The coast lattice is laid COAST_MARGIN (96 m) beyond that and snapped to its own fixed phase, so
 * its last row now stands at z = **3275.65** (it was 2496.22) and the lattice is 1,192 x 1,386 =
 * 1,652,112 points. Sampling all of them and collecting every hex any sample falls in gives
 * q -45...34, r 79...**144**, measured rather than reasoned. So maxR is 144: the last row the
 * lattice reaches, and no slack.
 *
 * That widening turns **143 claimed hexes in seven countries** from sea into land: Babon 50, Trogo
 * 29, Hama 19, the Azhor Stones 12 - and **thirty-three of the block's own**, which is the part
 * that matters. The South Meroshe Desert's twenty-one hexes, eight of the Central's and four of the
 * West's all lay south of row 135: without this they would have been open water in the middle of a
 * playable country. LAND_HEXES goes from 1,935 to **2,078**.
 */
export const WINDOW = { minQ: -45, maxQ: 34, minR: 79, maxR: 144 };

export function buildSource(survey) {
  const name = region => region.name ?? region.id;
  const regions = PLAYABLE.map(id => {
    const region = survey.regions.find(candidate => name(candidate) === id);
    if (!region) throw new Error(`The atlas has no region called ${id}.`);
    const enclosed = (ENCLOSED_HEXES[id] ?? []).map(([q, r, terrain]) => ({ q, r, terrain }));
    return { id: region.id, name: id, bounds: region.bounds, centerX: region.centerX, centerY: region.centerY,
      cells: [...region.cells.map(cell => ({ q: cell.q, r: cell.r, terrain: cell.terrain })), ...enclosed] };
  });
  const land = [];
  for (const region of survey.regions) for (const cell of region.cells) {
    if (cell.q < WINDOW.minQ || cell.q > WINDOW.maxQ || cell.r < WINDOW.minR || cell.r > WINDOW.maxR) continue;
    land.push([cell.q, cell.r]);
  }
  // An enclosed hex is a hole the atlas left in somebody's country, not the sea: the coast field
  // counts it as land, and the region that holds it gives it its own ground.
  for (const held of Object.values(ENCLOSED_HEXES)) for (const [q, r] of held) land.push([q, r]);
  land.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const cells = region => region.cells.map(cell => `{q:${cell.q},r:${cell.r},terrain:'${cell.terrain}'}`).join(',');
  const wrap = (text, indent) => {
    const lines = []; let line = '';
    for (const piece of text.split(/(?<=,)/)) {
      if (line.length + piece.length > 150) { lines.push(line); line = ''; }
      line += piece;
    }
    if (line) lines.push(line);
    return lines.join(`\n${indent}`);
  };
  return `${HEADER}export const SURVEY_ORIGIN = Object.freeze({ x: ${survey.origin.x}, y: ${survey.origin.y} });

/** The playable regions, exactly as the atlas authored them. */
export const PLAYABLE_SURVEY = Object.freeze({
  origin: SURVEY_ORIGIN,
  regions: Object.freeze([
${regions.map(region => `    Object.freeze({ id: ${JSON.stringify(region.id)}, name: ${JSON.stringify(region.name)},
      bounds: Object.freeze(${JSON.stringify(region.bounds)}), centerX: ${region.centerX}, centerY: ${region.centerY},
      cells: Object.freeze([${wrap(cells(region), '        ')}]) }),`).join('\n')}
  ]),
});

/**
 * Every claimed atlas hex near the playable window, playable or not. A world
 * point inside one of these is land; anything else inside the world bounds is
 * the Stills, so coastlines follow the authored map instead of a drawn curve.
 */
export const LAND_HEXES = Object.freeze([
  ${wrap(land.map(([q, r]) => `[${q},${r}]`).join(','), '  ')}
]);
`;
}

const HEADER = `// GENERATED by scripts/build-region-survey.mjs from assets/azhora-dev-regions.json.
// Do not edit by hand; tests/region-survey.test.js checks it against the atlas.
`;

export function readAtlas() {
  return JSON.parse(readFileSync(path.join(root, 'assets/azhora-dev-regions.json'), 'utf8'));
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('build-region-survey.mjs')) {
  const target = path.join(root, 'src/region-survey.js');
  writeFileSync(target, buildSource(readAtlas()));
  console.log(`Wrote ${target}`);
}
