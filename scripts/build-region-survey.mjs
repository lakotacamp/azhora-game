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
  'Isareos', 'Nethereum', 'Ovesos', 'Oves Desert', 'Gala', 'Eer', 'South Suval', 'Iscare Archipeligo', 'East Lotharn Mountains', 'Feradom', 'Northern Ascarth', 'Southern Ascarth'];
/**
 * **Lake hexes that belong to the region all round them.** The World Builder map paints these
 * `lake`; the dev atlas this script reads leaves them unclaimed, because a lake is nobody's
 * ground. Left unclaimed they are not land, and the coast field calls anything that is not
 * land the sea - so an inland lake would be cut to sea level and drawn with the sea's shore.
 *
 * The rule is narrow on purpose: a lake hex belongs here only when every one of its six
 * neighbours is the same region. Of the atlas's twenty-eight lake hexes exactly one meets it,
 * **the Stillwater** at (6,120), ringed by South Suval on all six sides; the lakes between
 * Elagos, Amod and Drent, and those round Nethereum, touch several regions or open water and
 * stay as they are. The region takes the hex as a `lake` cell, the way Elagos holds its own
 * lakes, and src/south-suval-world.js cuts the basin to the lake's own level.
 * tests/south-suval-world.test.js checks the World Builder map still agrees.
 */
export const ENCLOSED_LAKES = Object.freeze({ 'South Suval': Object.freeze([Object.freeze([6, 120])]) });
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
 * -33 is measured, not chosen: over the world bounds the six produce, the coast
 * lattice can sample a hex whose centre lies within COAST_MARGIN plus one hex
 * circumradius of the bounds, and the westernmost such hex on the whole atlas is
 * at q = -31. Two hexes of slack, and no more, because every hex in the window
 * is a line in a generated file.

 *
 * `minR` was 92, which is the East Lotharn's own northern row, and the East Lotharn is the first
 * playable country to reach it. Its northern edge then takes the world's bounds to its hexes'
 * rim, and the coast lattice samples out to COAST_MARGIN plus a circumradius beyond that: row 90
 * of South Mithala, measured. Row 91 left out would have called the Mithala plain the sea along
 * the whole north face of the range. Two rows, and no slack past the one the lattice reaches.
 *
 * `maxR` was 133, which West Izol's southern shore set, and the two Ascarths are the first
 * playable countries to reach past it: Southern Ascarth's tip is row 132, its hex's southern
 * corner stands at z = 2338.4, and the world's southern edge goes from 2225.2 to 2398.4. The coast
 * lattice samples out to COAST_MARGIN beyond that, to z = 2495.6, which is inside rows 134 and 135
 * and no further, measured. Twenty-five claimed hexes lie in those two rows under the lattice -
 * Selemi's six among them, the island a hundred and seventy metres south of the tip across a
 * channel one hex wide - and with 133 they were all the sea: the tip would have looked out on open
 * water where the atlas draws Selemi's shore. So 135, the last row the lattice reaches, and no slack.
 */
export const WINDOW = { minQ: -33, maxQ: 34, minR: 90, maxR: 135 };

export function buildSource(survey) {
  const name = region => region.name ?? region.id;
  const regions = PLAYABLE.map(id => {
    const region = survey.regions.find(candidate => name(candidate) === id);
    if (!region) throw new Error(`The atlas has no region called ${id}.`);
    const lakes = (ENCLOSED_LAKES[id] ?? []).map(([q, r]) => ({ q, r, terrain: 'lake' }));
    return { id: region.id, name: id, bounds: region.bounds, centerX: region.centerX, centerY: region.centerY,
      cells: [...region.cells.map(cell => ({ q: cell.q, r: cell.r, terrain: cell.terrain })), ...lakes] };
  });
  const land = [];
  for (const region of survey.regions) for (const cell of region.cells) {
    if (cell.q < WINDOW.minQ || cell.q > WINDOW.maxQ || cell.r < WINDOW.minR || cell.r > WINDOW.maxR) continue;
    land.push([cell.q, cell.r]);
  }
  // An enclosed lake is inland water, not the sea: the coast field counts it as land, and the
  // region that holds it cuts it back to its own level.
  for (const lakes of Object.values(ENCLOSED_LAKES)) for (const [q, r] of lakes) land.push([q, r]);
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
