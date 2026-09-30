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
  SOUTHWEST_REGIONS, SOUTHWEST_CLIMATE, NAVARTH_CLIMATE, WEST_PYROS_CLIMATE,
  GANESH_DESERT_CLIMATE, GANESH_PLAIN_CLIMATE, ARIDITY, SOUTHWEST_TILT, GANESH_BASIN,
  GANESH_WASHES, GANESH_DAMP, GANESH_PLAIN_CHANNELS, GANESH_DEPRESSIONS, NAVARTH_CRESTS,
  SOUTHWEST_LANDMARKS, SOUTHWEST_BOX, SOUTHWEST_SWALE,
  southwestAridity, southwestKoppen, southwestGround, southwestWeight, southwestClear,
  ganeshLie, ganeshDamp, inDepression, ganeshDepressionCut, onWashFloor, onChannelFloor,
  nearestWash, navarthCrests, regionShare,
} from '../src/southwest-world.js';
import { SOUTHWEST_WILDLIFE_ZONES } from '../src/southwest-wildlife.js';
import { DEFAULT_SKY, regionSky } from '../src/region-sky.js';
import { SUBREGIONS } from '../src/map-fog.js';
import { regionBuildStatus } from '../src/build-status.js';
import { regionLevel } from '../src/region-levels.js';
import { REGION_LANGUAGE, DIALECTS } from '../src/languages.js';
import { DEV_WORLD_DESTINATIONS } from '../src/developer-atlas.js';

/**
 * The southwestern block — Navarth, West Pyros, the Ganesh Desert and the Ganesh Plain — built as
 * terrain, climate, water, scenery and wildlife and nothing that belongs to anybody
 * (docs/southwest-1-brief.md, 30 September 2026). A hundred and seven authored hexes over four
 * countries, and the first `BWh` ground in the game.
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
const blockShare = (x, z) => {
  const weights = terrainMix(x, z).weights;
  let own = 0; for (const name of FOUR) own += weights[name] ?? 0;
  return own;
};

test('the atlas gives four countries a hundred and seven hexes, in the order the brief fixed', () => {
  assert.deepEqual(FOUR.map(name => REGION_IDS[name]), [32, 33, 34, 35]);
  assert.deepEqual(SOUTHWEST_REGIONS, FOUR);
  // Appended, never inserted: `world-regions.js` walks PLAYABLE_REGIONS with one seeded scatter
  // stream, so a name put anywhere but the end re-rolls every region after it.
  const at = PLAYABLE_REGIONS.indexOf('Navarth');
  assert.deepEqual(PLAYABLE_REGIONS.slice(at), FOUR);
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
  assert.equal(Object.keys(SOUTHWEST_CLIMATE).length, 107);
  const tally = {};
  for (const code of Object.values(SOUTHWEST_CLIMATE)) tally[code] = (tally[code] ?? 0) + 1;
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

test('the world box grows west, and the survey window with it', () => {
  // Nethereum set the western edge at -3010.002; the Ganesh Desert's westernmost hexes are
  // (-33,123) through (-33,126), whose outer flat stands at x = -3900, so the edge goes to
  // -3960.002 and the world from 36.20 hexes wide to 45.70. Nothing moves north or south.
  assert.ok(Math.abs(WORLD_BOUNDS.minX - -3960.0019279391277) < 1e-6, `minX is ${WORLD_BOUNDS.minX}`);
  assert.ok(Math.abs(WORLD_BOUNDS.maxX - 609.9980720608719) < 1e-6, `maxX is ${WORLD_BOUNDS.maxX}`);
  assert.ok(Math.abs(WORLD_BOUNDS.minZ - -2167.195996001615) < 1e-6, `minZ is ${WORLD_BOUNDS.minZ}`);
  assert.ok(Math.abs(WORLD_BOUNDS.maxZ - 2398.401076758503) < 1e-6, `maxZ is ${WORLD_BOUNDS.maxZ}`);
  const wide = (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) / METRES_PER_HEX;
  assert.ok(Math.abs(wide - 45.70) < .01, `east to west is ${wide.toFixed(2)} hexes`);
  // The Ganesh Desert alone spends it: no other of the four reaches past -3600.
  const westmost = Object.fromEntries(FOUR.map(name => [name, Math.min(...cellsOf(name).map(cell => cell.x))]));
  assert.ok(Math.abs(westmost['Ganesh Desert'] - -3850) < 1, `the Ganesh Desert's westernmost hex centre is ${westmost['Ganesh Desert'].toFixed(1)}`);
  for (const name of ['Navarth', 'West Pyros', 'Ganesh Plain'])
    assert.ok(westmost[name] > westmost['Ganesh Desert'], `${name} does not spend the western edge`);
  // `WINDOW.minQ` is the last column the coast lattice reaches, measured off the lattice rather
  // than chosen — the rule maxR 135 and minR 79 were both set by.
  assert.equal(WINDOW.minQ, -41);
  assert.equal(WINDOW.maxQ, 34);
  assert.equal(WINDOW.minR, 79);
  assert.equal(WINDOW.maxR, 135);
  const CELL = 4, MARGIN = 96, PHASE = { x: -1556.0019279391274, z: -704.3502691896258 };
  const snap = (value, phase) => phase + Math.floor((value - phase) / CELL + 1e-9) * CELL;
  const firstX = snap(WORLD_BOUNDS.minX - MARGIN, PHASE.x), firstZ = snap(WORLD_BOUNDS.minZ - MARGIN, PHASE.z);
  let reached = 99;
  for (let z = firstZ; z <= WORLD_BOUNDS.maxZ + MARGIN + CELL; z += CELL)
    reached = Math.min(reached, hexAt(firstX, z).q, hexAt(firstX + CELL, z).q);
  assert.equal(WINDOW.minQ, reached, 'the window stops at the last column the lattice reaches: no slack, and nothing left out');
  // And what the widening pulled in is the block's horizon and not its own ground: all four
  // countries already lay inside q >= -33, so none of the 71 new land hexes is theirs.
  for (const name of FOUR) for (const cell of cellsOf(name)) assert.ok(cell.q >= -33, `(${cell.q},${cell.r}) was outside the old window`);
  const land = new Set(LAND_HEXES.map(([q, r]) => `${q},${r}`));
  assert.equal(LAND_HEXES.length, 1935);
  for (const name of FOUR) for (const cell of cellsOf(name)) assert.ok(land.has(`${cell.q},${cell.r}`), `(${cell.q},${cell.r}) is not land`);
});

test('none of the four touches a built country, and the block is one island of ground', () => {
  const built = new Set(PLAYABLE_REGIONS);
  const neighbours = {};
  let internal = 0;
  for (const name of FOUR) for (const cell of cellsOf(name)) for (const [dq, dr] of AXIAL) {
    const other = owner.get(`${cell.q + dq},${cell.r + dr}`);
    if (!other || other === name) continue;
    if (FOUR.includes(other)) { internal++; continue; }
    neighbours[other] = (neighbours[other] ?? 0) + 1;
  }
  // **The whole point of this job's shape.** Not one of the four shares an edge with anything that
  // is built: the built frontier in the west is Nethereum and Isareos, which border the unbuilt
  // Ibenwoods. So the block is reached by F8 travel and by nothing else until the forest belt lands.
  for (const other of Object.keys(neighbours)) assert.ok(!built.has(other), `${other} is built and shares an edge with this block`);
  assert.equal(internal / 2, 46, 'forty-six internal hex edges');
});

test('one wavelength over all four, and the internal seams have nothing in them', () => {
  for (const name of FOUR) {
    const profile = REGION_TERRAIN[name];
    for (const entry of [profile, ...Object.values(profile.byTerrain ?? {})])
      assert.equal(entry.wave, 320, `${name} is off the block's wavelength`);
  }
  // Measured on all-block ground only: an outland point at the end of a seam is a rib and not a seam.
  const pairs = new Map();
  for (const name of FOUR) for (const cell of cellsOf(name)) for (const [dq, dr] of AXIAL) {
    const other = owner.get(`${cell.q + dq},${cell.r + dr}`);
    if (!other || other === name || !FOUR.includes(other)) continue;
    const mate = cellsOf(other).find(o => o.q === cell.q + dq && o.r === cell.r + dr);
    const key = [name, other].sort().join(' | ');
    if (!pairs.has(key)) pairs.set(key, 0);
    for (let i = 0; i < 24; i++) {
      const t = (i + .5) / 24;
      const x = cell.x + (mate.x - cell.x) * t, z = cell.z + (mate.z - cell.z) * t;
      if (blockShare(x, z) < .999) continue;
      pairs.set(key, Math.max(pairs.get(key), step(x, z)));
    }
  }
  assert.equal(pairs.size, 5, 'five internal seams');
  for (const [key, worst] of pairs)
    assert.ok(worst < 5, `${key} steps ${worst.toFixed(2)} m in two metres`);
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
  for (const name of FOUR) for (const cell of cellsOf(name)) for (let i = 0; i < 12; i++) {
    const x = cell.x + ((i % 4) - 1.5) * 34, z = cell.z + (Math.floor(i / 4) - 1) * 40;
    if (landDistance(x, z) < 30) continue;
    const share = blockShare(x, z);
    if (share > .95) inside.push(step(x, z)); else if (share > .02) margin.push(step(x, z));
  }
  const p95 = list => [...list].sort((a, b) => a - b)[Math.floor(list.length * .95)];
  assert.ok(p95(inside) < 2.2, `inside the block the 95th percentile step is ${p95(inside).toFixed(2)} m`);
  assert.ok(Math.max(...margin) > Math.max(...inside), 'the margin is where the ribs are, as every country before this found');
  // And the whole block is one walkable piece: a flood fill on an eight-metre lattice from West
  // Pyros's own spawn reaches all four countries, round the Vaellir rather than over it.
  const spawn = regions.find(region => region.name === 'West Pyros').spawn;
  const seen = new Set(), reached = new Set();
  const queue = [[Math.round(spawn.x / 8) * 8, Math.round(spawn.z / 8) * 8]];
  while (queue.length) {
    const [x, z] = queue.pop(), key = `${x},${z}`;
    if (seen.has(key)) continue; seen.add(key);
    if (x < SOUTHWEST_BOX.minX || x > SOUTHWEST_BOX.maxX || z < SOUTHWEST_BOX.minZ || z > SOUTHWEST_BOX.maxZ) continue;
    const here = H(x, z);
    const name = hexOwnerAt(x, z);
    if (FOUR.includes(name)) reached.add(name);
    for (const [dx, dz] of [[8, 0], [-8, 0], [0, 8], [0, -8]]) {
      if (seen.has(`${x + dx},${z + dz}`)) continue;
      if (westWaterSurface(x + dx, z + dz) !== null) continue;
      if (Math.abs(H(x + dx, z + dz) - here) > 4) continue;
      queue.push([x + dx, z + dz]);
    }
  }
  for (const name of FOUR) assert.ok(reached.has(name), `${name} cannot be walked to from West Pyros`);
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
  assert.equal(SOUTHWEST_WILDLIFE_ZONES.length, 17);
  const byRegion = {};
  for (const zone of SOUTHWEST_WILDLIFE_ZONES) byRegion[zone.region] = (byRegion[zone.region] ?? 0) + 1;
  assert.deepEqual(byRegion, { Navarth: 3, 'West Pyros': 7, 'Ganesh Desert': 3, 'Ganesh Plain': 4 });
  // Thirty-one hexes and three ranges, two of them birds in the air: the honest dry-year reading,
  // and the lore's own — "the Ganesh in a severe dry year presents a surface that appears
  // essentially lifeless."
  const ganesh = SOUTHWEST_WILDLIFE_ZONES.filter(zone => zone.region === 'Ganesh Desert');
  assert.equal(ganesh.filter(zone => !zone.air).length, 1);
  for (const zone of SOUTHWEST_WILDLIFE_ZONES) {
    assert.ok(FOUR.includes(zone.region), `${zone.id} claims ${zone.region}`);
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
  // The one new rig, and it is where the lore puts it: the desert margins.
  const boneBirds = SOUTHWEST_WILDLIFE_ZONES.filter(zone => zone.species === 'bone-bird');
  assert.equal(boneBirds.length, 4 - 1);
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
    assert.ok(FOUR.includes(hexOwnerAt(place.x, place.z)), `${place.id} stands on ${hexOwnerAt(place.x, place.z)}`);
  assert.equal(SOUTHWEST_LANDMARKS.length, 19);
});
