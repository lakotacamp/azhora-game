import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { PLAYABLE_REGIONS, REGION_BIOMES, METRES_PER_HEX } from '../src/region-layout.js';
import { PLAYABLE, WINDOW } from '../scripts/build-region-survey.mjs';
import { LAND_HEXES } from '../src/region-survey.js';
import { RIVER_EDGES } from '../src/region-rivers.js';
import {
  REGION_CELLS, REGION_IDS, REGION_TERRAIN, WORLD_BOUNDS, hexAt, hexCentre, hexOwnerAt, regionAt,
  regions, terrainMix, landDistance,
} from '../src/region-world.js';
import {
  VAELLIR, ALEZHOR_WATER, SOUTHWEST_RIVERS, WEST_RIVERS, WEST_REGION_NAMES, courseDistance,
} from '../src/west-regions.js';
import { WEST_PROFILES, westGroundAt, westWaterSurface } from '../src/west-ground.js';
import { groundWithRiver } from '../src/world-terrain.js';
import {
  SOUTHWEST_REGIONS, SOUTHWEST_NORTH_REGIONS, MEROSHE_REGIONS,
  SOUTHWEST_CLIMATE, NAVARTH_CLIMATE, WEST_PYROS_CLIMATE,
  GANESH_DESERT_CLIMATE, GANESH_PLAIN_CLIMATE, ARIDITY, SOUTHWEST_TILT, GANESH_BASIN,
  GANESH_WASHES, GANESH_DAMP, GANESH_PLAIN_CHANNELS, GANESH_DEPRESSIONS, NAVARTH_CRESTS,
  SOUTHWEST_LANDMARKS, SOUTHWEST_BOX, SOUTHWEST_SWALE,
  MEROSHE_CLIMATE, NORTH_MEROSHE_CLIMATE, WEST_MEROSHE_CLIMATE, CENTRAL_MEROSHE_CLIMATE, SOUTH_MEROSHE_CLIMATE,
  MEROSHE_BENCHES, MEROSHE_SKIRT, MEROSHE_FANS, MEROSHE_SALT, MEROSHE_SINK, MEROSHE_DUNES, MEROSHE_FOG, MEROSHE_BOX,
  southwestAridity, southwestKoppen, southwestGround, southwestWeight, southwestClear,
  ganeshLie, ganeshDamp, inDepression, ganeshDepressionCut, onWashFloor, onChannelFloor,
  nearestWash, navarthCrests, regionShare, merosheShare,
  merosheBench, merosheBenches, merosheSkirt, merosheFan, merosheFans, merosheSink,
  merosheErg, merosheDunes, merosheCorridor, duneProfile, merosheFog, merosheVarnish, onSaltPan, saltPanLevel,
} from '../src/southwest-world.js';
import { SOUTHWEST_WILDLIFE_ZONES } from '../src/southwest-wildlife.js';
import { DEFAULT_SKY, regionSky } from '../src/region-sky.js';
import { SUBREGIONS } from '../src/map-fog.js';
import { regionBuildStatus } from '../src/build-status.js';
import { regionLevel } from '../src/region-levels.js';
import { REGION_LANGUAGE, DIALECTS } from '../src/languages.js';
import { DEV_WORLD_DESTINATIONS } from '../src/developer-atlas.js';

/**
 * The southwestern block, in two halves and two jobs.
 *
 * **Job 1** — Navarth, West Pyros, the Ganesh Desert and the Ganesh Plain — built as terrain,
 * climate, water, scenery and wildlife and nothing that belongs to anybody
 * (docs/southwest-1-brief.md, 30 September 2026). A hundred and seven authored hexes over four
 * countries, and the first `BWh` ground in the game.
 *
 * **Job 2** — the North, West, Central and South Meroshe Deserts (docs/southwest-2-brief.md, the
 * same day). Ninety-five more hexes, `plains` on every one and `BWh` on every one: the largest
 * single-character expanse the atlas draws anywhere, and the one job in this project where the atlas
 * cannot tell four countries apart. What tells them apart is the **surface** - hamada, fan skirt and
 * salt pan, erg, reg under fog - and the tests for it are at the end of this file. Two things moved
 * that nobody expected: **the world box grew south**, from 45.656 hexes tall to 53.450, and the
 * survey window with it in *both* axes (`maxR` 135 to 144 and, because x = W(q + r/2), `minQ` -41 to
 * -45 without any country reaching west at all).
 *
 * The standing rule is the user's: the atlas wins over the lore. So most of what is asserted below
 * is the atlas's own arithmetic — twenty-two hexes and twenty-seven and thirty-one and twenty-seven,
 * thirty-nine internal edges, twenty-eight authored river edges in two chains, and a climate read
 * hex for hex off the World Builder map, which is checked against the map itself whenever it is on
 * the machine to ask.
 *
 * Three things make this block different from every one before it and each has its own test:
 * **none of the four touches a built country**, so every margin is outland and the block's internal
 * coherence is the only standard; **the world box grew west**, from 36.20 hexes to 45.70, which is
 * more than anything has spent in that direction; and **the climate is a gradient**, where the Oves
 * and the Mithala each had one code over a whole block.
 */

const FOUR = ['Navarth', 'West Pyros', 'Ganesh Desert', 'Ganesh Plain'];
const MEROSHE = ['North Meroshe Desert', 'West Meroshe Desert', 'Central Meroshe Desert', 'South Meroshe Desert'];
const BLOCK = [...FOUR, ...MEROSHE];
const AXIAL = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const MAP_PATH = new URL('../../world-builder/map/resources/examples/azhora.wwmap', import.meta.url);
const H = groundWithRiver;
const owner = new Map();
for (const name of Object.keys(REGION_CELLS)) for (const cell of REGION_CELLS[name]) owner.set(`${cell.q},${cell.r}`, name);
const cellsOf = name => REGION_CELLS[name];
const terrainCount = name => cellsOf(name).reduce((tally, cell) => {
  tally[cell.terrain] = (tally[cell.terrain] ?? 0) + 1; return tally;
}, {});
const step = (x, z) => {
  let worst = 0;
  for (const [dx, dz] of [[2, 0], [0, 2], [1.41, 1.41], [1.41, -1.41]]) worst = Math.max(worst, Math.abs(H(x + dx, z + dz) - H(x - dx, z - dz)));
  return worst;
};
const shareOf = names => (x, z) => {
  const weights = terrainMix(x, z).weights;
  let own = 0; for (const name of names) own += weights[name] ?? 0;
  return own;
};
const blockShare = shareOf(FOUR);
const wholeShare = shareOf(BLOCK);

test('the atlas gives four countries a hundred and seven hexes, in the order the brief fixed', () => {
  assert.deepEqual(FOUR.map(name => REGION_IDS[name]), [32, 33, 34, 35]);
  assert.deepEqual(SOUTHWEST_NORTH_REGIONS, FOUR);
  assert.deepEqual(SOUTHWEST_REGIONS, BLOCK, 'the module\u2019s own list is both halves');
  // Appended, never inserted: `world-regions.js` walks PLAYABLE_REGIONS with one seeded scatter
  // stream, so a name put anywhere but the end re-rolls every region after it.
  //
  // **This assertion used to read `PLAYABLE_REGIONS.slice(at)` and be compared with these four**,
  // which says "these are the last four in the list" when what it means is "these come after
  // everything that was there before". It is the fourth file in which that mistake has been found
  // and rewritten - the West Lotharn builder fixed it in `oves-world`, the Mithala builder in
  // `west-lotharn-world`, job 1 in `mithala-world` twice - and job 2 broke it here by appending four
  // more. So it now finds its own index and checks the order rather than the length, and
  // `tests/region-layout.test.js` carries the **permanent guard** the fourth generation earned: that
  // PLAYABLE_REGIONS is in strictly increasing `REGION_IDS` order with no gaps, everywhere, for
  // every country, so nobody needs the "last N" idiom again.
  const at = PLAYABLE_REGIONS.indexOf('Navarth');
  assert.deepEqual(PLAYABLE_REGIONS.slice(at, at + 4), FOUR);
  for (const name of PLAYABLE_REGIONS.slice(at)) assert.ok(REGION_IDS[name] >= 32, `${name} comes after the block with a lower id`);
  for (const name of FOUR) assert.ok(PLAYABLE.includes(name), `${name} is in the survey`);
  assert.deepEqual(FOUR.map(name => cellsOf(name).length), [22, 27, 31, 27]);
  assert.equal(FOUR.reduce((sum, name) => sum + cellsOf(name).length, 0), 107);
  assert.deepEqual(terrainCount('Navarth'), { forest: 1, hills: 10, plains: 11 });
  assert.deepEqual(terrainCount('West Pyros'), { plains: 26, grassland: 1 });
  assert.deepEqual(terrainCount('Ganesh Desert'), { plains: 31 });
  assert.deepEqual(terrainCount('Ganesh Plain'), { plains: 26, grassland: 1 });
  // The one `forest` hex and the two `grassland` hexes are the block's three odd ones, and every one
  // of them is also one of its wettest: the forest is `Csb` at Navarth's Ibenwood tip, and both
  // grassland hexes are `Csa`, one hex from the southern sea. The atlas's terrain and its climate
  // agree with each other, which is why those three hexes carry features rather than bands.
  const odd = FOUR.flatMap(name => cellsOf(name).filter(cell => cell.terrain === 'forest' || cell.terrain === 'grassland')
    .map(cell => [cell.terrain, SOUTHWEST_CLIMATE[`${cell.q},${cell.r}`]]));
  assert.deepEqual(odd.sort(), [['forest', 'Csb'], ['grassland', 'Csa'], ['grassland', 'Csa']]);
});

test('the climate is a gradient, which is a first: BWh over eighty-one hexes, and two green corners', () => {
  assert.equal(Object.keys(SOUTHWEST_CLIMATE).length, 202, 'both halves, hex for hex');
  const tally = {};
  for (const name of FOUR) for (const cell of cellsOf(name)) {
    const code = SOUTHWEST_CLIMATE[`${cell.q},${cell.r}`];
    tally[code] = (tally[code] ?? 0) + 1;
  }
  assert.deepEqual(tally, { BWh: 81, BSh: 18, Csb: 6, Csa: 2 });
  assert.equal(Object.keys(NAVARTH_CLIMATE).length, 22);
  assert.equal(Object.keys(WEST_PYROS_CLIMATE).length, 27);
  assert.equal(Object.keys(GANESH_DESERT_CLIMATE).length, 31);
  assert.equal(Object.keys(GANESH_PLAIN_CLIMATE).length, 27);
  // The Ganesh Desert is the first country in the game with hot desert on every one of its hexes.
  assert.deepEqual([...new Set(Object.values(GANESH_DESERT_CLIMATE))], ['BWh']);
  // Every hex of the block is recorded, and no hex of anybody else's is.
  for (const name of FOUR) for (const cell of cellsOf(name))
    assert.ok(SOUTHWEST_CLIMATE[`${cell.q},${cell.r}`], `(${cell.q},${cell.r}) has no climate`);
  // Held to the World Builder map itself when the map is on the machine.
  if (existsSync(MAP_PATH)) {
    const map = JSON.parse(readFileSync(MAP_PATH, 'utf8').replace(/^﻿/, ''));
    for (const [key, code] of Object.entries(SOUTHWEST_CLIMATE))
      assert.equal(map.hexes[key]?.climate, code, `${key} reads ${map.hexes[key]?.climate} on the map`);
  }
  // The gradient runs west to east and is smooth, not stepped: aridity at the Ganesh's middle is
  // the driest value there is, and at the green tip it is under a fifth of it.
  assert.ok(southwestAridity(-3560, 1520) > .99, 'the Ganesh is as dry as the scale goes');
  assert.ok(southwestAridity(-2560, 1670) < .3, 'the green tip is not');
  assert.ok(southwestAridity(-3300, 900) < .45, 'the Ibenwood corner is not either');
  assert.equal(southwestKoppen(-3560, 1520), 'BWh');
  assert.equal(southwestKoppen(-2550, 1674), 'Csa');
  assert.equal(ARIDITY.BWh, 1);
  // No jump anywhere: walking the block on a 20 m lattice, aridity never changes by more than a
  // twentieth in one step, which is what blending a hex field on the ground's own falloff buys.
  let worst = 0;
  for (let x = SOUTHWEST_BOX.minX; x <= SOUTHWEST_BOX.maxX; x += 20) for (let z = SOUTHWEST_BOX.minZ; z <= SOUTHWEST_BOX.maxZ; z += 20) {
    if (blockShare(x, z) < .5 || blockShare(x + 20, z) < .5) continue;
    worst = Math.max(worst, Math.abs(southwestAridity(x + 20, z) - southwestAridity(x, z)));
  }
  // Steepest measured: 0.157 over twenty metres, at (-2750, 1870) in the Ganesh Plain's
  // south-eastern corner, which is where the map itself puts `Csa` against `BWh` one hex apart.
  // That is the gradient the atlas draws and not a seam in the blend; there is no discontinuity.
  assert.ok(worst < .2, `aridity jumps ${worst.toFixed(3)} in twenty metres`);
});

test('the world box grew west for job 1 and south for job 2, and the survey window with it', () => {
  // **West, for job 1.** Nethereum set the western edge at -3010.002; the Ganesh Desert's
  // westernmost hexes are (-33,123) through (-33,126), whose outer flat stands at x = -3900, so the
  // edge went to -3960.002 and the world from 36.20 hexes wide to 45.70.
  //
  // **South, for job 2, and nobody expected it.** The brief predicted no movement at all: the
  // Meroshe's westernmost hex is the West Meroshe's (-37,133) at x = -3750, a hundred and fifty
  // metres inside the edge job 1 set, so `minX` does not move and is checked here for that. What
  // moves is `maxZ`: the South Meroshe Desert's southernmost hexes are (-32,141) and (-31,141),
  // centres at z = 3060.089 and lower vertices a circumradius (57.735 m) past that at 3117.824, so
  // the southern edge goes from 2398.401 to **3177.824** and the world from 45.656 hexes tall to
  // **53.450**. It is 45.70 by 53.45 now: taller than it is wide, for the first time since the
  // Ascarth Peninsula, and no direction is left that a playable country has not spent.
  assert.ok(Math.abs(WORLD_BOUNDS.minX - -3960.0019279391277) < 1e-6, `minX is ${WORLD_BOUNDS.minX}`);
  assert.ok(Math.abs(WORLD_BOUNDS.maxX - 609.9980720608719) < 1e-6, `maxX is ${WORLD_BOUNDS.maxX}`);
  assert.ok(Math.abs(WORLD_BOUNDS.minZ - -2167.195996001615) < 1e-6, `minZ is ${WORLD_BOUNDS.minZ}`);
  assert.ok(Math.abs(WORLD_BOUNDS.maxZ - 3177.823940164498) < 1e-6, `maxZ is ${WORLD_BOUNDS.maxZ}`);
  const wide = (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) / METRES_PER_HEX;
  const tall = (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ) / METRES_PER_HEX;
  assert.ok(Math.abs(wide - 45.70) < .01, `east to west is ${wide.toFixed(2)} hexes`);
  assert.ok(Math.abs(tall - 53.450) < .01, `north to south is ${tall.toFixed(3)} hexes`);
  // The Ganesh Desert alone spends the west: no other of job 1's four reaches past -3600, and no
  // Meroshe hex reaches past -3750.
  const westmost = Object.fromEntries(BLOCK.map(name => [name, Math.min(...cellsOf(name).map(cell => cell.x))]));
  assert.ok(Math.abs(westmost['Ganesh Desert'] - -3850) < 1, `the Ganesh Desert's westernmost hex centre is ${westmost['Ganesh Desert'].toFixed(1)}`);
  for (const name of BLOCK.filter(item => item !== 'Ganesh Desert'))
    assert.ok(westmost[name] > westmost['Ganesh Desert'], `${name} does not spend the western edge`);
  // And the South Meroshe alone spends the south.
  const southmost = Object.fromEntries(BLOCK.map(name => [name, Math.max(...cellsOf(name).map(cell => cell.z))]));
  assert.ok(Math.abs(southmost['South Meroshe Desert'] - 3060.0889132455354) < 1e-6, `the South Meroshe's southernmost hex centre is ${southmost['South Meroshe Desert']}`);
  for (const name of BLOCK.filter(item => item !== 'South Meroshe Desert'))
    assert.ok(southmost[name] < southmost['South Meroshe Desert'], `${name} does not spend the southern edge`);
  assert.ok(WORLD_BOUNDS.maxZ > southmost['South Meroshe Desert'] + 57.7 + 59, 'the edge clears the hex rim by the 60 m margin');
  // **Both window axes moved, and only one country reached.** `maxR` 135 -> 144 is the lattice's own
  // last row. `minQ` -41 -> -45 is a side effect of it and not of anything reaching west: x =
  // W(q + r/2), so a lattice nine rows further south reaches four columns further west at the same
  // world x. Both are measured off the lattice rather than chosen, which is the rule minR 79 and
  // maxR 135 were both set by.
  assert.equal(WINDOW.minQ, -45);
  assert.equal(WINDOW.maxQ, 34);
  assert.equal(WINDOW.minR, 79);
  assert.equal(WINDOW.maxR, 144);
  const CELL = 4, MARGIN = 96, PHASE = { x: -1556.0019279391274, z: -704.3502691896258 };
  const snap = (value, phase) => phase + Math.floor((value - phase) / CELL + 1e-9) * CELL;
  const firstX = snap(WORLD_BOUNDS.minX - MARGIN, PHASE.x), firstZ = snap(WORLD_BOUNDS.minZ - MARGIN, PHASE.z);
  const columns = Math.ceil((WORLD_BOUNDS.maxX + MARGIN - firstX) / CELL) + 1;
  const rows = Math.ceil((WORLD_BOUNDS.maxZ + MARGIN - firstZ) / CELL) + 1;
  const lastZ = firstZ + (rows - 1) * CELL, lastX = firstX + (columns - 1) * CELL;
  let west = 99, deep = -99;
  for (let z = firstZ; z <= lastZ; z += CELL) west = Math.min(west, hexAt(firstX, z).q, hexAt(firstX + CELL, z).q);
  for (let x = firstX; x <= lastX; x += CELL) deep = Math.max(deep, hexAt(x, lastZ).r, hexAt(x, lastZ - CELL).r);
  assert.equal(WINDOW.minQ, west, 'the window stops at the last column the lattice reaches: no slack, and nothing left out');
  assert.equal(WINDOW.maxR, deep, 'and at the last row it reaches');
  // Job 1's widening bought only horizon: all four of its countries lay inside q >= -33, so none of
  // the 71 hexes it turned from sea into land was its own. **Job 2's bought its own ground**, and
  // that is the difference: the South Meroshe's twenty-one hexes, eight of the Central's and four of
  // the West's all lie south of row 135, so without the widening thirty-three hexes of a playable
  // country would have been open water. LAND_HEXES 1,935 -> 2,078.
  for (const name of FOUR) for (const cell of cellsOf(name)) assert.ok(cell.q >= -33, `(${cell.q},${cell.r}) was outside the old window`);
  const beyond = MEROSHE.flatMap(name => cellsOf(name)).filter(cell => cell.r > 135);
  assert.equal(beyond.length, 33, 'thirty-three of the block\u2019s own hexes were outside the old window');
  const land = new Set(LAND_HEXES.map(([q, r]) => `${q},${r}`));
  assert.equal(LAND_HEXES.length, 2078);
  for (const name of BLOCK) for (const cell of cellsOf(name)) assert.ok(land.has(`${cell.q},${cell.r}`), `(${cell.q},${cell.r}) is not land`);
});

test('the block still touches no built country outside itself, and is one island of ground', () => {
  const built = new Set(PLAYABLE_REGIONS);
  const neighbours = {};
  let internal = 0, job1 = 0, job2 = 0, across = 0;
  for (const name of BLOCK) for (const cell of cellsOf(name)) for (const [dq, dr] of AXIAL) {
    const other = owner.get(`${cell.q + dq},${cell.r + dr}`);
    if (!other || other === name) continue;
    if (BLOCK.includes(other)) {
      internal++;
      const mine = MEROSHE.includes(name), theirs = MEROSHE.includes(other);
      if (mine && theirs) job2++; else if (!mine && !theirs) job1++; else across++;
      continue;
    }
    neighbours[other] = (neighbours[other] ?? 0) + 1;
  }
  // **The whole point of the block's shape, and job 2 does not change it.** Nothing in either half
  // shares an edge with a built country outside the block: the built frontier in the west is
  // Nethereum and Isareos, which border the unbuilt Ibenwoods. So the whole southwest is reached by
  // F8 travel and by nothing else until the forest belt lands, and jobs 3 and 4 inherit that.
  for (const other of Object.keys(neighbours)) assert.ok(!built.has(other), `${other} is built and shares an edge with this block`);
  assert.equal(job1 / 2, 46, 'forty-six internal hex edges among job 1\u2019s four');
  assert.equal(job2 / 2, 30, 'thirty among job 2\u2019s four');
  assert.equal(across / 2, 10, 'and ten between the halves, all of them Ganesh Plain | North Meroshe');
  assert.equal(internal / 2, 86);
  // Those ten are the only seam in the block with a built country on both sides of it, and they are
  // all one pair.
  let pair = 0;
  for (const cell of cellsOf('North Meroshe Desert')) for (const [dq, dr] of AXIAL)
    if (owner.get(`${cell.q + dq},${cell.r + dr}`) === 'Ganesh Plain') pair++;
  assert.equal(pair, 10);
});

test('one wavelength over all eight, and the internal seams have nothing in them', () => {
  for (const name of BLOCK) {
    const profile = REGION_TERRAIN[name];
    for (const entry of [profile, ...Object.values(profile.byTerrain ?? {})])
      assert.equal(entry.wave, 320, `${name} is off the block's wavelength`);
  }
  // Measured on all-block ground only: an outland point at the end of a seam is a rib and not a seam.
  const pairs = new Map();
  for (const name of BLOCK) for (const cell of cellsOf(name)) for (const [dq, dr] of AXIAL) {
    const other = owner.get(`${cell.q + dq},${cell.r + dr}`);
    if (!other || other === name || !BLOCK.includes(other)) continue;
    const mate = cellsOf(other).find(o => o.q === cell.q + dq && o.r === cell.r + dr);
    const key = [name, other].sort().join(' | ');
    if (!pairs.has(key)) pairs.set(key, 0);
    for (let i = 0; i < 24; i++) {
      const t = (i + .5) / 24;
      const x = cell.x + (mate.x - cell.x) * t, z = cell.z + (mate.z - cell.z) * t;
      if (wholeShare(x, z) < .999) continue;
      pairs.set(key, Math.max(pairs.get(key), step(x, z)));
    }
  }
  // Ten seams now: job 1's five, job 2's four, and the one between the halves.
  assert.equal(pairs.size, 10, 'ten internal seams');
  for (const [key, worst] of pairs)
    assert.ok(worst < 5, `${key} steps ${worst.toFixed(2)} m in two metres`);
  // **The seam between the two jobs is the flattest of the ten**, which is what it should be: a plain
  // of clay at base 22 meeting a rock floor at 21 over ten hex edges, on the same wavelength, with the
  // block's own tilt running through both. Measured, 0.27 m in two metres - a third of the next
  // flattest and a ninth of the Navarth rim.
  assert.ok(pairs.get('Ganesh Plain | North Meroshe Desert') < .6,
    `the halves meet with ${pairs.get('Ganesh Plain | North Meroshe Desert').toFixed(2)} m in two metres`);
});

test('Navarth is the block’s high ground, the Ganesh its lowest, and the ground falls to its two mouths', () => {
  const at = name => cellsOf(name).map(cell => H(cell.x, cell.z));
  const mean = list => list.reduce((a, b) => a + b, 0) / list.length;
  const navarth = at('Navarth'), pyros = at('West Pyros'), desert = at('Ganesh Desert'), plain = at('Ganesh Plain');
  assert.ok(mean(navarth) > 40, `Navarth means ${mean(navarth).toFixed(1)} m`);
  assert.ok(mean(navarth) > mean(pyros) + 12, 'Navarth stands well over West Pyros');
  assert.ok(mean(navarth) > mean(desert) + 24, 'and further over the Ganesh');
  assert.ok(mean(desert) < mean(plain), 'the desert lies below the plain it drains, so the plain’s channels run into it');
  // The swells the atlas draws are real relief and not a rounding: every one of Navarth's ten
  // `hills` hexes stands over the sweeps between them.
  assert.equal(NAVARTH_CRESTS.length, 10);
  assert.equal(cellsOf('Navarth').filter(cell => cell.terrain === 'hills').length, 10);
  for (const crest of NAVARTH_CRESTS) {
    const hex = cellsOf('Navarth').find(cell => Math.abs(cell.x - crest.x) < 1 && Math.abs(cell.z - crest.z) < 1);
    assert.ok(hex && hex.terrain === 'hills', `${crest.id} is not on a hills hex`);
    assert.ok(navarthCrests(crest.x, crest.z, 1) > crest.lift * .9, `${crest.id} does not stand up`);
  }
  // The two outlets are the block's datum, and each is the lowest ground near it.
  const gulf = ALEZHOR_WATER.points.at(-1), mouth = VAELLIR.points.at(-1);
  for (const [name, end] of [['the gulf', gulf], ['the Vaellir’s mouth', mouth]])
    assert.ok(H(end.x, end.z) < 12, `${name} stands at ${H(end.x, end.z).toFixed(1)} m`);
  // And the desert's own fall is one-sided: nothing at the Ganesh Plain margin where the lore says
  // the boundary is diffuse, its whole drop at the shore, so there is no ridge between the two.
  assert.ok(Math.abs(H(GANESH_BASIN.from.x, GANESH_BASIN.from.z) - 18) < 6, 'the desert’s eastern margin is at its own base');
  assert.ok(SOUTHWEST_TILT.perEast > 0 && SOUTHWEST_TILT.perNorth > 0, 'the block tilts toward the Vaellir’s mouth');
});

test('two courses, both on a border, both reaching the sea, and both falling the whole way', () => {
  // Twenty-eight authored edges in two chains, and not one of them inside any of the four: what a
  // desert quarter has is somebody else's rain going past its edge.
  const mine = RIVER_EDGES.filter(edge => edge.regions.some(region => FOUR.includes(region)));
  assert.equal(mine.length, 28);
  for (const edge of mine) assert.ok(edge.regions.some(region => !FOUR.includes(region)), `${edge.a}|${edge.b} is inside the block`);
  const vaellirEdges = mine.filter(edge => edge.regions.includes('West Pyros'));
  assert.equal(vaellirEdges.length, 20);
  const sizes = vaellirEdges.reduce((tally, edge) => { tally[edge.size] = (tally[edge.size] ?? 0) + 1; return tally; }, {});
  assert.deepEqual(sizes, { small: 5, medium: 11, large: 4 });
  // `large` is drawn three times on the whole atlas: the Lizeem through Caricas and Eer, and this.
  assert.equal(SOUTHWEST_RIVERS.length, 2);
  for (const course of SOUTHWEST_RIVERS) {
    assert.ok(WEST_RIVERS.includes(course), `${course.id} is not in WEST_RIVERS`);
    const profile = WEST_PROFILES.get(course.id);
    for (let i = 1; i < profile.length; i++)
      assert.ok(profile[i].surface <= profile[i - 1].surface, `${course.id} climbs at sample ${i}`);
    for (const sample of profile)
      assert.ok(westGroundAt(sample.x, sample.z) <= sample.surface + .05, `${course.id} runs above its own bed at (${sample.x.toFixed(0)}, ${sample.z.toFixed(0)})`);
    assert.ok(landDistance(profile.at(-1).x, profile.at(-1).z) < 70, `${course.id} does not reach the sea`);
  }
  // The Vaellir is waded over its gravel head and is a wall below it; the Alezhor Water is waded
  // anywhere, which is the only reason Navarth and the Ganesh Desert are joined round the north.
  const vaellir = WEST_PROFILES.get(VAELLIR.id);
  const ford = vaellir.filter(sample => sample.ford).length;
  assert.ok(ford > 40 && ford < 70, `the Vaellir's ford is ${ford} of ${vaellir.length} samples`);
  assert.equal(WEST_PROFILES.get(ALEZHOR_WATER.id).every(sample => sample.ford), true);
  // The swale: at the water's edge on an unbuilt border the ground is the block's designed surface.
  assert.ok(SOUTHWEST_SWALE.inner === 45 && SOUTHWEST_SWALE.outer === 165);
  let worstBank = 0;
  for (const sample of vaellir) {
    if (sample.along < .1 || sample.along > .9) continue;
    for (const side of [-1, 1]) {
      const x = sample.x + sample.nx * 30 * side, z = sample.z + sample.nz * 30 * side;
      if (hexOwnerAt(x, z) !== 'West Pyros') continue;
      worstBank = Math.max(worstBank, step(x, z));
    }
  }
  assert.ok(worstBank < 2.5, `the Vaellir's own bank steps ${worstBank.toFixed(2)} m in two metres`);
});

test('the Ganesh is wind and stone, and the Ganesh Plain is its hollows', () => {
  // The wind field is three quarters of a metre and no more: the lore's surface is "flat or gently
  // rolling, the relief created by ancient alluvial processes rather than by active geological
  // uplift", with no canyon and no escarpment anywhere in it.
  let low = 9, high = -9;
  for (const cell of cellsOf('Ganesh Desert')) for (let i = 0; i < 40; i++) {
    const x = cell.x + (i % 8 - 4) * 11, z = cell.z + (Math.floor(i / 8) - 2) * 19;
    const lie = ganeshLie(x, z);
    if (lie > 0) { low = Math.min(low, lie); high = Math.max(high, lie); }
  }
  assert.ok(low < .25 && high > .75, `the wind field reads ${low.toFixed(2)}…${high.toFixed(2)}: swept ground and pockets both`);
  assert.equal(ganeshLie(-2900, 1250), 0, 'the wind field is the desert’s and stops at its border');
  // Two washes with nothing in either, both clear of the shore, and a damp reach on the lower one.
  assert.equal(GANESH_WASHES.length, 2);
  for (const wash of GANESH_WASHES) {
    const mid = wash.line[Math.floor(wash.line.length / 2)];
    assert.ok(onWashFloor(mid.x, mid.z), `${wash.id} has no floor at its middle`);
    assert.equal(westWaterSurface(mid.x, mid.z), null, `${wash.id} has water in it`);
    assert.ok(landDistance(wash.line.at(-1).x, wash.line.at(-1).z) > 80, `${wash.id} keeps a mouth open`);
    for (const point of wash.line) assert.equal(hexOwnerAt(point.x, point.z), 'Ganesh Desert', `${wash.id} leaves the desert`);
  }
  assert.equal(GANESH_DAMP.wash, 'south-wash');
  const south = GANESH_WASHES.find(wash => wash.id === 'south-wash');
  const damp = south.line[2];
  assert.ok(ganeshDamp(damp.x, damp.z) > .4, 'the damp reach is not damp');
  assert.equal(ganeshDamp(GANESH_WASHES[0].line[2].x, GANESH_WASHES[0].line[2].z), 0, 'the north wash is dry all the way');
  // Three shallow channels and eight depressions, all of them the Ganesh Plain's own, all of them dry.
  assert.equal(GANESH_PLAIN_CHANNELS.length, 3);
  assert.equal(GANESH_DEPRESSIONS.length, 8);
  for (const channel of GANESH_PLAIN_CHANNELS) {
    for (const point of channel.line) assert.equal(hexOwnerAt(point.x, point.z), 'Ganesh Plain', `${channel.id} leaves the plain`);
    const mid = channel.line[Math.floor(channel.line.length / 2)];
    assert.ok(onChannelFloor(mid.x, mid.z), `${channel.id} has no floor`);
    assert.equal(westWaterSurface(mid.x, mid.z), null, `${channel.id} has water in it`);
    // The channels run downhill toward the desert, which is what the lore says and what the atlas
    // makes possible by putting the desert west of the plain rather than south of it.
    assert.ok(H(channel.line.at(-1).x, channel.line.at(-1).z) < H(channel.line[0].x, channel.line[0].z),
      `${channel.id} runs uphill`);
  }
  for (const pan of GANESH_DEPRESSIONS) {
    assert.equal(hexOwnerAt(pan.x, pan.z), 'Ganesh Plain', `${pan.id} is not on the plain`);
    assert.ok(inDepression(pan.x, pan.z) > .9, `${pan.id} is not a hollow`);
    // Measured against the plain's own surface at the same point rather than against a ring round
    // it, and that is deliberate: this plain tilts a metre in a hundred, several of the hollows lie
    // within a hex of a margin where the ground falls away anyway, and two of them are close enough
    // to touch. A hollow here is a metre below the surface it is cut into - which is what makes the
    // water gather in it - and not a closed basin on a level floor.
    const share = regionShare('Ganesh Plain', pan.x, pan.z);
    assert.ok(share > .9, `${pan.id} is not on the plain's own ground`);
    assert.ok(ganeshDepressionCut(pan.x, pan.z, share) < -pan.depth * .85,
      `${pan.id} is cut ${(-ganeshDepressionCut(pan.x, pan.z, share)).toFixed(2)} m against its own ${pan.depth} m`);
    assert.ok(pan.depth >= .8 && pan.radius >= 70, `${pan.id} is too slight to hold anything`);
  }
  // Like the crests, the hollows are a maximum and not a sum, so past one edge a neighbour's may
  // still be there; what has to be true is that the open plain between them is not in any of them.
  for (const [x, z] of [[-3110, 1720], [-2760, 1620], [-2960, 1870], [-3120, 1740]])
    assert.ok(inDepression(x, z) < .01, `(${x}, ${z}) is open plain and reads as a hollow`);
});

test('the ribs against the outland are measured and left alone, and the block is walkable end to end', () => {
  // Every margin of this block is unbuilt, so the ribs Gala, Ovesos, the West Lotharn and the
  // Mithala all reported are here on every side of it. The cure belongs in `relief()`/`terrainMix`
  // and is a world-wide job; what this test holds is that they stay at the margin and that the
  // inside of the block is quiet.
  const inside = [], margin = [];
  for (const name of BLOCK) for (const cell of cellsOf(name)) for (let i = 0; i < 12; i++) {
    const x = cell.x + ((i % 4) - 1.5) * 34, z = cell.z + (Math.floor(i / 4) - 1) * 40;
    if (landDistance(x, z) < 30) continue;
    const share = wholeShare(x, z);
    if (share > .95) inside.push(step(x, z)); else if (share > .02) margin.push(step(x, z));
  }
  const p95 = list => [...list].sort((a, b) => a - b)[Math.floor(list.length * .95)];
  assert.ok(p95(inside) < 2.2, `inside the block the 95th percentile step is ${p95(inside).toFixed(2)} m`);
  assert.ok(Math.max(...margin) > Math.max(...inside), 'the margin is where the ribs are, as every country before this found');
  // And the whole block is one walkable piece: a flood fill on an eight-metre lattice from West
  // Pyros's own spawn reaches **all eight** countries, round the Vaellir rather than over it, over
  // the Ganesh Plain's divide, across the hamada's benches, along the sand sea's corridors and out
  // to the southern ocean. Two kilometres of desert end to end and no barrier anywhere in it: the
  // steepest thing in the Meroshe is a dune's lee face at about one in three.
  const spawn = regions.find(region => region.name === 'West Pyros').spawn;
  const seen = new Set(), reached = new Set();
  const queue = [[Math.round(spawn.x / 8) * 8, Math.round(spawn.z / 8) * 8]];
  while (queue.length) {
    const [x, z] = queue.pop(), key = `${x},${z}`;
    if (seen.has(key)) continue; seen.add(key);
    if (x < SOUTHWEST_BOX.minX || x > SOUTHWEST_BOX.maxX || z < SOUTHWEST_BOX.minZ || z > SOUTHWEST_BOX.maxZ) continue;
    const here = H(x, z);
    const name = hexOwnerAt(x, z);
    if (BLOCK.includes(name)) reached.add(name);
    for (const [dx, dz] of [[8, 0], [-8, 0], [0, 8], [0, -8]]) {
      if (seen.has(`${x + dx},${z + dz}`)) continue;
      if (westWaterSurface(x + dx, z + dz) !== null) continue;
      if (Math.abs(H(x + dx, z + dz) - here) > 4) continue;
      queue.push([x + dx, z + dz]);
    }
  }
  for (const name of BLOCK) assert.ok(reached.has(name), `${name} cannot be walked to from West Pyros`);
});

test('nothing of this block is written outside its own hexes, and nobody else’s ground moved', () => {
  // There is no built neighbour to step on, so what this holds is the weaker and still necessary
  // thing: `southwestGround` is exactly the ground it was handed wherever the block has no weight,
  // and the box it works in is its own hexes and a hex of margin.
  for (const [x, z] of [[-1700, -1414], [-2205, 902], [-1817, -651], [0, 29], [-1450, 700]])
    assert.equal(southwestGround(x, z, 12.5), 12.5, `(${x}, ${z}) is outside the block and was reshaped`);
  assert.equal(southwestWeight(-1700, -1414), 0);
  assert.ok(SOUTHWEST_BOX.minX < -3900 && SOUTHWEST_BOX.maxX > -2550);
  // And the scatter keeps off the dry beds, which is the one thing this block asks of it.
  const wash = GANESH_WASHES[0].line[2];
  assert.equal(southwestClear(wash.x, wash.z), true);
  assert.equal(southwestClear(-3560, 1520), false);
});

test('every animal stands on this block’s own ground, and the desert is nearly empty on purpose', () => {
  assert.equal(SOUTHWEST_WILDLIFE_ZONES.length, 24);
  const byRegion = {};
  for (const zone of SOUTHWEST_WILDLIFE_ZONES) byRegion[zone.region] = (byRegion[zone.region] ?? 0) + 1;
  assert.deepEqual(byRegion, { Navarth: 3, 'West Pyros': 7, 'Ganesh Desert': 3, 'Ganesh Plain': 4,
    'North Meroshe Desert': 2, 'West Meroshe Desert': 2, 'Central Meroshe Desert': 1, 'South Meroshe Desert': 2 });
  // Thirty-one hexes and three ranges, two of them birds in the air: the honest dry-year reading,
  // and the lore's own — "the Ganesh in a severe dry year presents a surface that appears
  // essentially lifeless."
  const ganesh = SOUTHWEST_WILDLIFE_ZONES.filter(zone => zone.region === 'Ganesh Desert');
  assert.equal(ganesh.filter(zone => !zone.air).length, 1);
  for (const zone of SOUTHWEST_WILDLIFE_ZONES) {
    assert.ok(BLOCK.includes(zone.region), `${zone.id} claims ${zone.region}`);
    assert.ok(zone.note && zone.note.length > 80, `${zone.id} has no note`);
    assert.ok(Math.hypot(zone.maxX - zone.minX, zone.maxZ - zone.minZ) / 2 < 130, `${zone.id}'s range is wider than it is run from`);
    for (const [x, z] of zone.sites) {
      assert.ok(x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ, `${zone.id}'s home is outside its range`);
      if (!zone.float) assert.equal(hexOwnerAt(x, z), zone.region, `${zone.id}'s home at (${x}, ${z}) is on ${hexOwnerAt(x, z)}'s hex`);
      if (zone.air) continue;
      // A raft sits on a river the atlas draws on a hex edge, so what is under it is water and the
      // hex either side of the line; the ground checks below are for the ranges that stand on ground.
      if (zone.float) { assert.ok(westWaterSurface(x, z) !== null, `${zone.id} floats on dry land`); continue; }
      assert.equal(regionAt(x, z)?.name, zone.region, `${zone.id}'s home at (${x}, ${z}) is not in its own country`);
      assert.equal(westWaterSurface(x, z), null, `${zone.id}'s home is under water`);
      assert.equal(southwestClear(x, z), false, `${zone.id}'s home is on a dry bed's floor`);
      assert.ok(step(x, z) < 2, `${zone.id}'s home at (${x}, ${z}) steps ${step(x, z).toFixed(2)} m`);
    }
  }
  // The one new rig, and it is where the lore puts it: the desert margins. Job 1 spent it on three
  // zones and job 2 added one in each of the four Meroshe quarters without spending another rig.
  const boneBirds = SOUTHWEST_WILDLIFE_ZONES.filter(zone => zone.species === 'bone-bird');
  assert.equal(boneBirds.length, 7);
  for (const name of MEROSHE)
    assert.equal(boneBirds.filter(zone => zone.region === name).length, 1, `${name} has no bone-bird`);
  for (const zone of boneBirds) assert.ok(zone.air >= 38, `${zone.id} flies too low for a bird with two and a half metres of wing`);
  // Nothing domestic anywhere: Navarth's grey sheep, the plain's herds and the caravan animals all
  // belong to people, and this block has none of them.
  for (const zone of SOUTHWEST_WILDLIFE_ZONES)
    assert.ok(!['longhorn', 'hill-sheep', 'nethrani-cattle'].includes(zone.species), `${zone.id} is somebody's stock`);
});

test('the four are charted, levelled, spoken for and listed, and nothing is built in any of them', () => {
  for (const name of FOUR) {
    assert.ok(REGION_BIOMES[name], `${name} has no biome`);
    assert.ok(REGION_BIOMES[name].ownScatter, `${name} does not scatter its own country`);
    const region = regions.find(entry => entry.name === name);
    assert.ok(region, `${name} is not a region`);
    assert.deepEqual(region.npcIds, [], `${name} has people in it`);
    assert.ok(region.landmarks.length >= 4, `${name} has too few landmarks`);
    for (const id of region.landmarks) assert.ok(SOUTHWEST_LANDMARKS.some(place => place.id === id), `${name} names a landmark that is not built: ${id}`);
    assert.equal(hexOwnerAt(region.spawn.x, region.spawn.z), name, `${name}'s spawn is not on its own hexes`);
    assert.equal(westWaterSurface(region.spawn.x, region.spawn.z), null, `${name}'s spawn is in the water`);
    assert.equal(southwestClear(region.spawn.x, region.spawn.z), false, `${name}'s spawn is on a dry bed`);
    assert.equal(regionBuildStatus(name).state, 'early', `${name} is not listed as early`);
    assert.ok(regionBuildStatus(name).work.length > 40, `${name} does not say what is left`);
    assert.ok(regionLevel(name) >= 3, `${name} has no level`);
    assert.ok(REGION_LANGUAGE[name], `${name} has no tongue`);
    assert.ok(DEV_WORLD_DESTINATIONS.some(place => place.regionId === name), `${name} has no travel stop`);
    assert.ok(SUBREGIONS.some(area => area.region === name), `${name} has no chart area`);
    assert.ok(WEST_REGION_NAMES.includes(name), `${name} is not a western region`);
    // Its own sky, and not the default: three desert countries share one and West Pyros has the
    // steppe's. Clearer air than anything else in the game, because a hot desert has no water in it.
    const sky = regionSky(region);
    assert.notDeepEqual(sky, DEFAULT_SKY, `${name} takes the default sky`);
    assert.ok(sky.density <= .0042, `${name}'s air is thicker than a dry country's`);
  }
  // Navarth and West Pyros speak Pyrosi, the two Ganesh countries the contact speech of the
  // junction the plain sits on, and both dialects exist.
  assert.equal(REGION_LANGUAGE.Navarth.language, 'pyrosi');
  assert.equal(REGION_LANGUAGE['West Pyros'].dialect, 'west-pyrosi');
  assert.equal(REGION_LANGUAGE['Ganesh Plain'].language, 'maroshi');
  assert.equal(REGION_LANGUAGE['Ganesh Desert'].dialect, 'ganesh');
  for (const id of ['west-pyrosi', 'ganesh']) assert.ok(DIALECTS[id], `${id} is not a dialect`);
  // The three desert countries share one sky and West Pyros does not.
  const sky = name => regionSky(regions.find(entry => entry.name === name));
  assert.deepEqual(sky('Navarth'), sky('Ganesh Desert'));
  assert.deepEqual(sky('Navarth'), sky('Ganesh Plain'));
  assert.notDeepEqual(sky('Navarth'), sky('West Pyros'));
  // Every landmark stands on the block's own hexes, which is the check that catches a place named
  // for ground that turned out to be somebody else's.
  for (const place of SOUTHWEST_LANDMARKS)
    assert.ok(BLOCK.includes(hexOwnerAt(place.x, place.z)), `${place.id} stands on ${hexOwnerAt(place.x, place.z)}`);
  assert.equal(SOUTHWEST_LANDMARKS.length, 36);
});

// ---------------------------------------------------------------------------
// Job 2: the four Meroshe deserts
// ---------------------------------------------------------------------------

test('the atlas gives four more countries ninety-five hexes, one terrain word and one climate code', () => {
  assert.deepEqual(MEROSHE.map(name => REGION_IDS[name]), [36, 37, 38, 39]);
  assert.deepEqual(MEROSHE_REGIONS, MEROSHE);
  for (const name of MEROSHE) assert.ok(PLAYABLE.includes(name), `${name} is in the survey`);
  const at = PLAYABLE_REGIONS.indexOf('North Meroshe Desert');
  assert.deepEqual(PLAYABLE_REGIONS.slice(at, at + 4), MEROSHE);
  assert.equal(PLAYABLE_REGIONS.indexOf('Ganesh Plain'), at - 1, 'appended straight after job 1\u2019s last');
  assert.deepEqual(MEROSHE.map(name => cellsOf(name).length), [23, 20, 31, 21]);
  assert.equal(MEROSHE.reduce((sum, name) => sum + cellsOf(name).length, 0), 95);
  // **One terrain word over ninety-five hexes**, which is the largest single-character expanse the
  // atlas draws: no `hills`, no `grassland`, no `forest`, no `coast`, no odd hex anywhere.
  for (const name of MEROSHE) assert.deepEqual(terrainCount(name), { plains: cellsOf(name).length }, `${name} is not all plains`);
  // **And one climate code over the same ninety-five.** With job 1's eighty-one that makes a hundred
  // and seventy-six of this block's two hundred and two hexes hot desert.
  assert.equal(Object.keys(MEROSHE_CLIMATE).length, 95);
  assert.deepEqual([...new Set(Object.values(MEROSHE_CLIMATE))], ['BWh']);
  assert.equal(Object.keys(NORTH_MEROSHE_CLIMATE).length, 23);
  assert.equal(Object.keys(WEST_MEROSHE_CLIMATE).length, 20);
  assert.equal(Object.keys(CENTRAL_MEROSHE_CLIMATE).length, 31);
  assert.equal(Object.keys(SOUTH_MEROSHE_CLIMATE).length, 21);
  for (const name of MEROSHE) for (const cell of cellsOf(name))
    assert.equal(MEROSHE_CLIMATE[`${cell.q},${cell.r}`], 'BWh', `(${cell.q},${cell.r}) has no climate`);
  if (existsSync(MAP_PATH)) {
    const map = JSON.parse(readFileSync(MAP_PATH, 'utf8').replace(/^\ufeff/, ''));
    for (const [key, code] of Object.entries(MEROSHE_CLIMATE))
      assert.equal(map.hexes[key]?.climate, code, `${key} reads ${map.hexes[key]?.climate} on the map`);
    // Every `BWh` hex on the whole claimed atlas is in this one quarter of the continent: these
    // ninety-five are thirty-nine per cent of all the desert there is.
    let total = 0;
    for (const name of Object.keys(REGION_CELLS)) for (const cell of REGION_CELLS[name])
      if (map.hexes[`${cell.q},${cell.r}`]?.climate === 'BWh') total++;
    assert.ok(total >= 176, `the playable world has ${total} BWh hexes`);
  }
  // **So the climate says nothing at all here**, which is the finding the whole job turns on: job 1's
  // half has a gradient and that gradient is its shape, and this half is flat 1.00 on every hex of
  // all four countries, with no green corner in it anywhere.
  // **Measured: ninety-four of the ninety-five read 1.000 and the ninety-fifth reads 0.893.** The one
  // that does not is the North Meroshe's (-24,128), its north-eastern tip, which stands one hex from
  // the Ganesh Plain's `Csb` row - so even the single exception is the blend telling the truth about
  // a neighbour rather than a gradient inside this half. There is no third value anywhere in it.
  let exceptions = 0;
  for (const name of MEROSHE) for (const cell of cellsOf(name)) {
    assert.equal(southwestKoppen(cell.x, cell.z), 'BWh');
    const dry = southwestAridity(cell.x, cell.z);
    if (dry > .995) continue;
    exceptions++;
    assert.deepEqual([cell.q, cell.r], [-24, 128], `${name} at (${cell.q},${cell.r}) reads ${dry.toFixed(3)}`);
    assert.ok(dry > .85, `and it reads ${dry.toFixed(3)}`);
  }
  assert.equal(exceptions, 1, 'one hex of ninety-five is pulled off 1.00, and it is the corner by the plain');
});

test('the west and south edges are the sea, and the atlas draws no water in the Meroshe at all', () => {
  // **No watercourse anywhere.** The atlas draws five hundred and seventy-two river edges and not one
  // of them touches any of these ninety-five hexes - the nearest are in Marosh, two hexes east of the
  // North Meroshe, and in Trogo, one hex south-east of the South. A desert ringed by water it does not
  // get is the honest reading, and it is what the lore says too: "water is found at depth, in
  // aquifer-fed oases". Nothing wet is built: the Malhat is a salt crust and not a water surface.
  assert.equal(RIVER_EDGES.filter(edge => edge.regions.some(region => MEROSHE.includes(region))).length, 0);
  for (const name of MEROSHE) for (const cell of cellsOf(name))
    assert.equal(westWaterSurface(cell.x, cell.z), null, `${name} has water on (${cell.q},${cell.r})`);
  assert.equal(westWaterSurface(MEROSHE_SALT.x, MEROSHE_SALT.z), null, 'the salt pan is a crust, not a pool');
  // **The west and south edges are sea and not merely unclaimed land**, which the brief asked to be
  // checked. Measured on the World Builder map: every unclaimed hex the West Meroshe and the South
  // Meroshe share an edge with is `coast`, and beyond that column and that row the map is `ocean`.
  if (existsSync(MAP_PATH)) {
    const map = JSON.parse(readFileSync(MAP_PATH, 'utf8').replace(/^\ufeff/, ''));
    // `owner` here is the survey's, so Dinelv, Hama, Marosh and Trogo count as unclaimed too - they
    // are claimed on the atlas and simply not built. What separates sea from unbuilt land is the
    // map's own terrain word, and it is unambiguous: **`coast`, with `ocean` beyond it.**
    const counts = {};
    const coastHexes = new Set();
    for (const name of MEROSHE) {
      counts[name] = 0;
      for (const cell of cellsOf(name)) for (const [dq, dr] of AXIAL) {
        const key = `${cell.q + dq},${cell.r + dr}`;
        if (owner.has(key)) continue;
        const terrain = map.hexes[key]?.terrain;
        if (terrain !== 'coast' && terrain !== 'ocean') continue;
        counts[name]++; coastHexes.add(key);
      }
    }
    // **The atlas's ten sea edges on the West Meroshe and four on the South are sea**, over six
    // coast hexes and three; and the North and the Central have none at all, so their unbuilt
    // neighbours are the Dinelv Highlands' `hills` and Marosh's - land, not water.
    assert.deepEqual(counts, { 'North Meroshe Desert': 0, 'West Meroshe Desert': 10,
      'Central Meroshe Desert': 0, 'South Meroshe Desert': 4 });
    assert.equal(coastHexes.size, 9, 'six hexes west of the West Meroshe and three south of the South');
    for (const key of coastHexes) assert.equal(map.hexes[key]?.terrain, 'coast', `${key} is not coast`);
    // And beyond that column and that row the map is open ocean.
    for (const [q, r] of [[-39, 133], [-39, 134], [-39, 135], [-33, 143], [-32, 143], [-31, 143]])
      assert.equal(map.hexes[`${q},${r}`]?.terrain, 'ocean', `(${q},${r}) is not open water`);
  }
  // And the coast field agrees: both shores are real waterlines a traveler can walk to, and the
  // ground behind them is desert right up to it - the Ganesh's gulf again, twice over, on an open
  // ocean instead of a sheltered one.
  const westShore = [], southShore = [];
  for (const cell of cellsOf('West Meroshe Desert')) if (landDistance(cell.x, cell.z) < 120) westShore.push(cell);
  for (const cell of cellsOf('South Meroshe Desert')) if (landDistance(cell.x, cell.z) < 120) southShore.push(cell);
  assert.ok(westShore.length >= 4, `${westShore.length} West Meroshe hexes within 120 m of the water`);
  assert.ok(southShore.length >= 2, `${southShore.length} South Meroshe hexes within 120 m of the water`);
  for (const cell of [...westShore, ...southShore]) assert.ok(southwestAridity(cell.x, cell.z) > .995,
    'the shore is as arid as the interior');
  // The skirt lets go at the shore, so the West Meroshe's own hexes are not under the sea: measured,
  // 0 m at the waterline, 2.6 at twenty metres in and 10.4 at a hundred and thirty.
  for (const cell of cellsOf('West Meroshe Desert')) if (landDistance(cell.x, cell.z) > 12)
    assert.ok(H(cell.x, cell.z) > 0, `(${cell.q},${cell.r}) stands at ${H(cell.x, cell.z).toFixed(2)} m`);
});

test('four surfaces, because one word and one code cannot tell four countries apart', () => {
  // **The design answer of this job, as arithmetic.** Erg, reg, hamada and salt pan are four real and
  // distinct desert surfaces and the game had drawn none of them at scale. Each is one country's and
  // stops at its own border, which is what makes the four quarters four countries.
  //
  // *North: the hamada's benches.* Nine, striking north and south on the dip off the Dinelv highland,
  // one to two metres of riser each, taken as a maximum and not a sum so nine of them make a stepped
  // floor and not a staircase nine risers high.
  assert.equal(MEROSHE_BENCHES.length, 9);
  let lift = 0;
  for (const cell of cellsOf('North Meroshe Desert')) for (let i = 0; i < 100; i++) {
    const x = cell.x + (i % 10 - 5) * 10, z = cell.z + (Math.floor(i / 10) - 5) * 10;
    if (hexOwnerAt(x, z) !== 'North Meroshe Desert') continue;
    lift = Math.max(lift, merosheBench(x, z).lift);
  }
  assert.ok(lift > 1.6 && lift < 2.2, `the benches stand ${lift.toFixed(2)} m at most`);
  assert.ok(Math.max(...MEROSHE_BENCHES.map(b => b.rise)) <= 2, 'no bench is more than two metres');
  for (const b of MEROSHE_BENCHES) assert.equal(hexOwnerAt(b.x, b.z), 'North Meroshe Desert', `${b.id} starts off the hamada`);
  assert.equal(merosheBenches(-2980, 2480, 1), 0, 'the benches are the hamada\u2019s and stop at its border');
  //
  // *Central: the sink and the erg.* The sink first, because an erg is sand that had nowhere left to
  // go: three and a half metres of closed basin with no outlet and no river edge anywhere on it. Then
  // the dunes, on the summer wind's own bearing - job 1's `GANESH_WIND.grainBearing`, because it is
  // the same wind - seven metres crest to floor, two hundred and thirty apart, and **forty-eight per
  // cent of every wavelength dead-flat corridor**, which is the whole of why this country cannot be
  // crossed in a straight line.
  // Six metres crest to floor at a hundred and forty apart, which is one in twenty-three: a real
  // erg's ratio, and the second try at it. The first was 7 m at 230 - the same ratio as a fifty-metre
  // dune a mile and a half wide - and it put **two ridges in the whole country**, which the hillshade
  // caught and the arithmetic did not.
  assert.equal(MEROSHE_DUNES.height, 6);
  assert.equal(MEROSHE_DUNES.wave, 140);
  assert.equal(MEROSHE_DUNES.floor, .48);
  assert.ok(MEROSHE_DUNES.wave / MEROSHE_DUNES.height > 18 && MEROSHE_DUNES.wave / MEROSHE_DUNES.height < 32,
    'the dunes keep a real erg’s height-to-spacing ratio');
  // And the country is wide enough for a field rather than a pair: at least four ridge crests stand
  // between the two ends of its long axis.
  let crossings = 0, was = duneProfile(-3250, 2500);
  for (let k = 1; k <= 120; k++) {
    const here = duneProfile(-3250 + k * 5, 2500);
    if (was > .5 && here <= .5) crossings++;
    was = here;
  }
  assert.ok(crossings >= 4, `only ${crossings} dune crests across six hundred metres`);
  assert.ok(merosheSink(MEROSHE_SINK.x, MEROSHE_SINK.z, 1) < -3.4, 'the sink is not a sink');
  assert.equal(merosheSink(-2950, 2021, 1), 0, 'and it is the sand sea\u2019s own');
  let crest = 0, floors = 0, samples = 0;
  for (const cell of cellsOf('Central Meroshe Desert')) for (let i = 0; i < 100; i++) {
    const x = cell.x + (i % 10 - 5) * 10, z = cell.z + (Math.floor(i / 10) - 5) * 10;
    if (hexOwnerAt(x, z) !== 'Central Meroshe Desert') continue;
    samples++;
    const erg = merosheErg(x, z, regionShare('Central Meroshe Desert', x, z));
    crest = Math.max(crest, merosheDunes(x, z, erg));
    if (merosheCorridor(x, z) > .92) floors++;
  }
  assert.ok(crest > 5.5 && crest < 6.1, `the tallest dune stands ${crest.toFixed(2)} m`);
  assert.ok(floors / samples > .5 && floors / samples < .75, `${(floors / samples * 100).toFixed(0)}% of the sand sea is corridor floor`);
  assert.equal(merosheCorridor(-2950, 2021), 0, 'the corridors are the sand sea\u2019s own');
  //
  // *West: the skirt, the fans and the salt.* The skirt is a one-sided ramp to the ocean, nought at
  // the sand sea's margin and its whole seven metres at the shore; the three fans are a grain-size
  // field on top of it, coarse at the apex and dust at the toe; and the Malhat is a levelled floor
  // and not a bowl, because a playa is flat to the centimetre.
  assert.equal(MEROSHE_FANS.length, 3);
  assert.equal(MEROSHE_SKIRT.drop, 7);
  assert.ok(merosheSkirt(MEROSHE_SKIRT.from.x, MEROSHE_SKIRT.from.z, 1) > -.2, 'the ramp is nought at the sand sea margin');
  assert.ok(merosheSkirt(-3700, 2450, 1) < -5, 'and its full drop near the shore');
  for (const f of MEROSHE_FANS) assert.equal(hexOwnerAt(f.x, f.z), 'West Meroshe Desert', `${f.id}\u2019s apex is off the skirt`);
  assert.ok(merosheFan(MEROSHE_FANS[1].x - 20, MEROSHE_FANS[1].z + 20) > .85, 'the fan heads are coarse');
  assert.ok(merosheFan(-3500, 2620) < .35, 'and the toes are not');
  assert.equal(hexOwnerAt(MEROSHE_SALT.x, MEROSHE_SALT.z), 'West Meroshe Desert');
  assert.ok(onSaltPan(MEROSHE_SALT.x, MEROSHE_SALT.z) > .99 && onSaltPan(-2950, 2021) === 0);
  assert.equal(southwestClear(MEROSHE_SALT.x, MEROSHE_SALT.z), true, 'nothing roots in brine');
  // Flat to the centimetre: the pan's floor is one level over three hundred metres.
  let low = 99, high = -99;
  for (let a = 0; a < 16; a++) for (const k of [.2, .5, .7]) {
    const t = a / 16 * Math.PI * 2;
    const x = MEROSHE_SALT.x + Math.cos(t) * MEROSHE_SALT.radiusX * k, z = MEROSHE_SALT.z + Math.sin(t) * MEROSHE_SALT.radiusZ * k;
    low = Math.min(low, H(x, z)); high = Math.max(high, H(x, z));
  }
  assert.ok(high - low < .12, `the Malhat's floor varies ${(high - low).toFixed(3)} m across itself`);
  assert.ok(Math.abs(saltPanLevel() - H(MEROSHE_SALT.x, MEROSHE_SALT.z)) < .01, 'and it is the level the module measured');
  //
  // *South: the fog and the varnish.* The one `BWh` country in Azhora whose surface gets wet: two
  // fronts, one off the southern ocean and one off the Trogo margin, taken as a maximum, so the
  // south-eastern corner is fog and the north-western one against Hama and the sand sea is not.
  let fogLow = 9, fogHigh = -9;
  for (const cell of cellsOf('South Meroshe Desert')) for (let i = 0; i < 100; i++) {
    const x = cell.x + (i % 10 - 5) * 10, z = cell.z + (Math.floor(i / 10) - 5) * 10;
    if (hexOwnerAt(x, z) !== 'South Meroshe Desert') continue;
    const fog = merosheFog(x, z);
    fogLow = Math.min(fogLow, fog); fogHigh = Math.max(fogHigh, fog);
  }
  assert.ok(fogLow < .1 && fogHigh > .9, `the fog reads ${fogLow.toFixed(2)}\u2026${fogHigh.toFixed(2)}: bare desert and fog belt both`);
  assert.ok(merosheFog(-2580, 2660) > .8, 'the Trogo margin is in the fog');
  assert.ok(merosheFog(-2950, 2714) < .3, 'the Hama corner is not');
  assert.ok(merosheVarnish(-2600, 2700) > merosheVarnish(-2900, 2740) + .3, 'and the pavement is darkest where the fog is');
  assert.equal(merosheFog(-2950, 2021), 0, 'the fog stops where the block\u2019s own hexes do');
  assert.equal(merosheVarnish(-2980, 2480), 0, 'the varnish is the stone floor\u2019s own');
  // And nothing of any of it reaches outside the Meroshe box.
  assert.ok(MEROSHE_BOX.minX < -3840 && MEROSHE_BOX.maxX > -2600 && MEROSHE_BOX.minZ < 1845 && MEROSHE_BOX.maxZ > 3150);
  assert.equal(merosheShare(-2205, 902), 0);
});

test('the Ganesh Plain seam is the flattest in the block, and its divide did not move', () => {
  // **The one seam in this job with a built country on the other side of it**, and the brief asked
  // for three things back: the seam itself, the Ganesh Plain's three channels re-measured, and
  // whether the divide moved. Measured against the same ground built without the Meroshe at all
  // (`git archive` of the base commit, run side by side):
  //
  //  - the three channels fall **1.60 m, 3.00 m and 4.07 m** head to mouth, to the centimetre the
  //    same as before, and all three still run downhill the way they ran;
  //  - the divide's crest stands at **x = -2800** along z = 1790 and **x = -2735** along z = 1730,
  //    the same two points. **The divide did not move.**
  //  - what did move is the plain's own southern margin, and upward: its hex-centre mean goes from
  //    18.670 m to **18.971**, because the row of hexes south of it stopped being `outland` at base
  //    11.5 and became the hamada at 21. That is the rib at that margin disappearing, which is what
  //    building a neighbour is for.
  const falls = GANESH_PLAIN_CHANNELS.map(channel => {
    const a = channel.line[0], b = channel.line.at(-1);
    return +(H(a.x, a.z) - H(b.x, b.z)).toFixed(2);
  });
  assert.deepEqual(falls, [1.60, 3.00, 4.07], 'the three channels fall exactly as they did');
  const crestAt = z => {
    let best = -99, at = 0;
    for (let x = -2900; x <= -2600; x += 5) { const h = H(x, z); if (h > best) { best = h; at = x; } }
    return at;
  };
  assert.equal(crestAt(1790), -2800, 'the divide crest has not moved along z = 1790');
  assert.equal(crestAt(1730), -2735, 'nor along z = 1730');
  const plain = cellsOf('Ganesh Plain').map(cell => H(cell.x, cell.z));
  const mean = plain.reduce((a, b) => a + b, 0) / plain.length;
  assert.ok(Math.abs(mean - 18.971) < .01, `the plain means ${mean.toFixed(3)} m`);
  // And the seam is walked over without noticing: the plain at 22 against the rock floor at 21, on
  // the same wavelength, with the block's own tilt running through both.
  assert.ok(Math.abs(REGION_TERRAIN['Ganesh Plain'].base - REGION_TERRAIN['North Meroshe Desert'].base) <= 1);
  let worst = 0;
  for (const cell of cellsOf('North Meroshe Desert')) for (const [dq, dr] of AXIAL) {
    if (owner.get(`${cell.q + dq},${cell.r + dr}`) !== 'Ganesh Plain') continue;
    const mate = cellsOf('Ganesh Plain').find(o => o.q === cell.q + dq && o.r === cell.r + dr);
    for (let i = 0; i < 24; i++) {
      const t = (i + .5) / 24, x = cell.x + (mate.x - cell.x) * t, z = cell.z + (mate.z - cell.z) * t;
      if (wholeShare(x, z) < .999) continue;
      worst = Math.max(worst, step(x, z));
    }
  }
  assert.ok(worst < .6, `the halves meet with ${worst.toFixed(2)} m in two metres`);
});

test('seven ranges over ninety-five hexes, and the sand sea carries one of them', () => {
  const mine = SOUTHWEST_WILDLIFE_ZONES.filter(zone => MEROSHE.includes(zone.region));
  assert.equal(mine.length, 7);
  // **Sparser per hex than the Ganesh, which was already the sparsest country in the game.** Job 1
  // carries three ranges over the Ganesh Desert's thirty-one hexes, 0.097 a hex; this half carries
  // seven over ninety-five, 0.074 - a quarter sparser again, on ground with no green corner and no
  // permanent water anywhere in it. Emptiness measured, which is what the brief asked for.
  const perHex = mine.length / 95;
  assert.ok(perHex < 3 / 31, `${perHex.toFixed(3)} a hex against the Ganesh's ${(3 / 31).toFixed(3)}`);
  // Only three of the seven stand on the ground, and the largest country of the four has one range
  // in it, fifty-two metres up: the emptiest country in Azhora.
  assert.equal(mine.filter(zone => !zone.air).length, 3);
  const erg = mine.filter(zone => zone.region === 'Central Meroshe Desert');
  assert.equal(erg.length, 1);
  assert.equal(erg[0].air, 52);
  assert.ok(erg[0].air > Math.max(...SOUTHWEST_WILDLIFE_ZONES.filter(zone => zone !== erg[0]).map(zone => zone.air ?? 0)),
    'and it flies higher than anything else in the southwest');
  // Nothing domestic - the dustback herds and the caravan animals are somebody's - and no gull, hare
  // or bone-bird is anywhere it cannot stand.
  for (const zone of mine) {
    assert.ok(!['longhorn', 'hill-sheep', 'nethrani-cattle'].includes(zone.species), `${zone.id} is somebody's stock`);
    assert.ok(Math.hypot(zone.maxX - zone.minX, zone.maxZ - zone.minZ) / 2 < 130, `${zone.id}'s range is wider than it is run from`);
    for (const [x, z] of zone.sites) {
      assert.equal(hexOwnerAt(x, z), zone.region, `${zone.id}'s home at (${x}, ${z}) is on ${hexOwnerAt(x, z)}'s hex`);
      if (zone.air) continue;
      assert.equal(regionAt(x, z)?.name, zone.region, `${zone.id}'s home is not in its own country`);
      assert.equal(westWaterSurface(x, z), null, `${zone.id}'s home is under water`);
      assert.equal(southwestClear(x, z), false, `${zone.id}'s home is on a dry bed or the salt`);
      assert.ok(step(x, z) < 2, `${zone.id}'s home at (${x}, ${z}) steps ${step(x, z).toFixed(2)} m`);
    }
  }
  // The gulls are the exception that proves the rule: the one abundant life in this desert is on the
  // waterline and comes out of the sea, so their sites are the only ones in the block within forty
  // metres of a shore.
  const gulls = mine.find(zone => zone.species === 'gull');
  for (const [x, z] of gulls.sites) {
    const d = landDistance(x, z);
    assert.ok(d > 4 && d < 45, `a gull stands ${d.toFixed(0)} m inland`);
  }
});

test('the four Meroshe are charted, levelled, spoken for and listed, and nothing is built in any of them', () => {
  for (const name of MEROSHE) {
    assert.ok(REGION_BIOMES[name]?.ownScatter, `${name} does not scatter its own country`);
    const region = regions.find(entry => entry.name === name);
    assert.ok(region, `${name} is not a region`);
    assert.deepEqual(region.npcIds, [], `${name} has people in it`);
    assert.ok(region.landmarks.length >= 4, `${name} has too few landmarks`);
    for (const id of region.landmarks) assert.ok(SOUTHWEST_LANDMARKS.some(place => place.id === id), `${name} names a landmark that is not built: ${id}`);
    assert.equal(hexOwnerAt(region.spawn.x, region.spawn.z), name, `${name}'s spawn is not on its own hexes`);
    assert.equal(westWaterSurface(region.spawn.x, region.spawn.z), null, `${name}'s spawn is in the water`);
    assert.equal(southwestClear(region.spawn.x, region.spawn.z), false, `${name}'s spawn is on a dry bed or the salt`);
    assert.ok(step(region.spawn.x, region.spawn.z) < 2, `${name}'s spawn steps ${step(region.spawn.x, region.spawn.z).toFixed(2)} m`);
    assert.equal(regionBuildStatus(name).state, 'early', `${name} is not listed as early`);
    assert.ok(regionBuildStatus(name).work.length > 40, `${name} does not say what is left`);
    assert.ok(regionLevel(name) >= 3, `${name} has no level`);
    assert.ok(DEV_WORLD_DESTINATIONS.some(place => place.regionId === name), `${name} has no travel stop`);
    assert.ok(SUBREGIONS.some(area => area.region === name), `${name} has no chart area`);
    assert.ok(WEST_REGION_NAMES.includes(name), `${name} is not a western region`);
    assert.notDeepEqual(regionSky(region), DEFAULT_SKY, `${name} takes the default sky`);
  }
  // **Three skies over four countries, and the argument for each is the atlas's own.** The two
  // interior quarters take job 1's desert sky unchanged, .0024, the clearest air in Azhora. The West
  // Meroshe has ten hex edges of open western ocean, so it carries sea air over a desert at .0032.
  // And the South Meroshe is under fog, so it is **the one `BWh` country in the game whose air is
  // thicker than the average rather than thinner** - .0046, against the Oves steppe's .0034 - and the
  // only desert in Azhora a traveler cannot see across.
  const sky = name => regionSky(regions.find(entry => entry.name === name));
  assert.deepEqual(sky('North Meroshe Desert'), sky('Central Meroshe Desert'));
  assert.deepEqual(sky('North Meroshe Desert'), sky('Ganesh Desert'), 'the interior shares job 1\u2019s desert sky');
  assert.ok(sky('West Meroshe Desert').density > sky('North Meroshe Desert').density, 'the coast is hazier than the interior');
  assert.ok(sky('South Meroshe Desert').density > sky('West Meroshe Desert').density, 'and the fog belt hazier than the coast');
  assert.ok(sky('South Meroshe Desert').density < DEFAULT_SKY.density, 'but still clearer than an ordinary sky');
  // **Plain Maroshi, and no dialect, which is a decision.** The desert peoples' own speech is the
  // centre of this family rather than a margin of it, and both Maroshi dialects the game has are
  // margins: the coastal court form the base tongue carries, and `ganesh`, the northern contact seam
  // on the Ganesh Plain. The Meroshe is neither.
  for (const name of MEROSHE) {
    assert.equal(REGION_LANGUAGE[name].language, 'maroshi', `${name} speaks something else`);
    assert.equal(REGION_LANGUAGE[name].dialect, null, `${name} has been given a dialect`);
  }
  assert.equal(REGION_LANGUAGE['Ganesh Desert'].dialect, 'ganesh', 'and the Ganesh keeps the plain\u2019s');
});
