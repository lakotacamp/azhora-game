import test from 'node:test';
import assert from 'node:assert/strict';
import { atlasCellKey, atlasLocalDetail, atlasCityDetail, atlasPlaceMarks, atlasMarkKnown, atlasRegionLabelKnown, atlasExplorationScope, splitAtlasRegionLabels, GLIMPSED_TERRAIN } from '../src/world-map-detail.js';
import { readFileSync } from 'node:fs';
import { TRANSFORM, hexAt, hexCentre } from '../src/region-world.js';
import { buildLocalMapModel } from '../src/local-map-data.js';
import { regions, regionAt, WORLD_BOUNDS } from '../src/regions.js';
import { createMapFog } from '../src/map-fog.js';
import { createCartography, chartShapes, EXPLORED_HEXES } from '../src/cartography.js';
import { AMBRON_CENTRE, AMBRON_OUTLINE, inAmbronOutline } from '../src/ambron-city-layout.js';
import { applyGameAtlasAdjustments, GAME_ATLAS_ADJUSTMENTS } from '../src/game-atlas-adjustments.js';
import { TESSEN } from '../src/pueth-world.js';

test('the capital marker and city footprint agree with the relocated city between the four lakes', () => {
  const detail = atlasCityDetail(), center = TRANSFORM.atlasToWorld(detail.marker.x, detail.marker.y);
  assert.ok(Math.hypot(center.x - AMBRON_CENTRE.x, center.z - AMBRON_CENTRE.z) < 1e-8);
  assert.equal(inAmbronOutline(center.x, center.z), true);
  assert.equal(detail.marker.name, 'Ambron'); assert.equal(detail.marker.kind, 'capital');
  assert.deepEqual(detail.boundary, AMBRON_OUTLINE.map(p => TRANSFORM.worldToAtlas(p.x, p.z)));
  assert.equal(atlasMarkKnown(detail.marker, new Set()), false, 'unvisited capital remains unnamed');
  assert.equal(atlasMarkKnown(detail.marker, new Set([atlasCellKey(detail.marker)])), true);
  assert.equal(atlasMarkKnown(detail.marker, new Set(), true), true, 'developer reveal shows the capital');
  const next = atlasCityDetail(); detail.boundary[0].x = 0;
  assert.notEqual(next.boundary[0].x, 0, 'drawing data cannot mutate the city definition');
});

test('the capital replaces duplicate ordinary Ambron labels while preserving quests and tracked destinations', () => {
  const ordinary = { id: 'ambron', name: 'Ambron', kind: 'place', x: 12, y: 30 };
  assert.deepEqual(atlasPlaceMarks([ordinary], [{ ...ordinary, kind: 'local' }]), [atlasCityDetail().marker]);
  for (const kind of ['quest', 'tracked']) {
    const objective = { ...ordinary, kind }, marks = atlasPlaceMarks([], [objective]);
    assert.deepEqual(marks.find(mark => mark.id === 'ambron'), objective);
    assert.deepEqual(marks.find(mark => mark.id === 'ambron-capital'), atlasCityDetail().marker);
  }
});

test('the atlas close view uses the same world transform for roads, houses and quest destinations', () => {
  const house = { x: -600, z: 130, width: 6, depth: 8, angle: Math.PI / 2 };
  const model = { paths: [[{ x: -603, z: 130 }, { x: -615, z: 140 }]], buildings: [house],
    goal: { id: 'bridge', name: 'Mend the Caloss bridge', x: -615, z: 140 },
    landmarks: [{ id: 'known', name: 'Chip', known: true, x: -600, z: 134 }] };
  const before = structuredClone(model), detail = atlasLocalDetail(model);
  assert.deepEqual(detail.paths[0][1], TRANSFORM.worldToAtlas(-615, 140));
  assert.deepEqual(detail.buildings[0][0], TRANSFORM.worldToAtlas(-604, 133));
  assert.deepEqual(detail.markers.find(p => p.id === 'bridge'), { id: 'bridge', name: 'Mend the Caloss bridge', kind: 'quest', ...TRANSFORM.worldToAtlas(-615, 140), markerKind: 'main', colour: '#f3c46a' });
  assert.deepEqual(model, before, 'viewing detail neither discovers places nor edits the adventure');
});

test('unknown names and missing cast locations never become local marks, and broken paths remain broken', () => {
  const detail = atlasLocalDetail({ paths: [[{ x: 0, z: 0 }, { x: 1, z: 1 }, undefined, { x: 5, z: 5 }, { x: 6, z: 6 }]],
    landmarks: [undefined, { id: 'secret', name: 'Secret hideout', x: 0, z: 0 }, { id: 'removed', name: 'Removed NPC', known: true }],
    goal: { id: 'missing', name: 'Missing destination' } });
  assert.equal(detail.paths.length, 2);
  assert.deepEqual(detail.markers, []);
  assert.deepEqual(atlasLocalDetail(null), { paths: [], buildings: [], markers: [] });
});

test('an adjacent tile provides terrain only until the traveler enters it', () => {
  const center = hexCentre(10, 106), adjacent = hexCentre(11, 106);
  const mark = { id: 'next-place', name: 'Unvisited detail', ...TRANSFORM.worldToAtlas(adjacent.x, adjacent.z) };
  const h = hexAt(center.x, center.z), visited = new Set([`${h.q},${h.r}`]);
  assert.equal(atlasCellKey(mark), '11,106');
  assert.equal(atlasMarkKnown(mark, visited), false);
  visited.add('11,106');
  assert.equal(atlasMarkKnown(mark, visited), true);
  assert.equal(atlasMarkKnown(mark, new Set(), true), true, 'developer reveal remains explicit');
  assert.ok(GLIMPSED_TERRAIN.forest !== GLIMPSED_TERRAIN.mountain);
  assert.equal(atlasCellKey(undefined), null);
});

test('the unified atlas carries discovered detail in other regions without losing quest colors', () => {
  const here = hexCentre(10, 106), remote = hexCentre(-2, 112);
  const world = { bounds: WORLD_BOUNDS, regions, regionAt,
    landmarks: [{ id: 'remote', name: 'An earlier stop', ...remote }],
    colliders: [{ kind: 'house', ...remote, width: 6, depth: 4 }], paths: [[here, remote]] };
  const options = { world, position: here, discoveries: new Set(['remote']), goal: { id: 'remote', name: 'Repair the crossing', ...remote, markerKind: 'deed' } };
  assert.equal(buildLocalMapModel(options).landmarks.some(p => p.id === 'remote'), false);
  const global = buildLocalMapModel({ ...options, globalDetail: true });
  assert.ok(global.landmarks.some(p => p.id === 'remote'));
  assert.equal(global.buildings.length, 1);
  assert.equal(global.goal.markerKind, 'deed');
  const marker = atlasLocalDetail(global).markers.find(p => p.id === 'remote');
  assert.equal(marker.colour, '#c87a3c');
  assert.equal(atlasMarkKnown(marker, new Set(['10,106'])), false, 'global detail remains hidden until its hex is confirmed');
});

test('the original region lettering is separated intact from the terrain, with no duplicate underneath', () => {
  const source = readFileSync(new URL('../assets/azhora-world-map.svg', import.meta.url), 'utf8');
  const { terrain, labels } = splitAtlasRegionLabels(source);
  assert.ok(source.includes(labels), 'all original fonts, rotations, positions and tspans are preserved byte for byte');
  assert.match(labels, /<text data-region="Drent"[^>]+transform="translate\([^)]+\) rotate\([^)]+\)"/);
  assert.match(labels, /paint-order="stroke fill"/);
  assert.doesNotMatch(terrain, /<text data-region=/, 'no country name can appear twice when fog is lifted');
  assert.match(terrain, /data-region="Drent" fill=/, 'the authored terrain itself stays intact');
  assert.throws(() => splitAtlasRegionLabels('<svg/>'), /no region lettering layer/);
});

test('hearing a country name reveals its original lettering without revealing a terrain hex', () => {
  const known = [{ name: 'Drent' }, { name: 'Feradom' }], visited = new Set();
  assert.equal(atlasRegionLabelKnown('Feradom', known), true, 'a name requires no explored cell');
  assert.equal(atlasRegionLabelKnown('Vastos', known), false, 'unheard names remain hidden');
  assert.equal(atlasRegionLabelKnown('Vastos', known, true), true, 'developer reveal names the complete atlas');
  assert.equal(atlasMarkKnown({ x: 1500, y: 2400 }, visited), false, 'knowing the name never uncovers local details');
  assert.equal(visited.size, 0);
});

test('hearing and entering a province leave every hex beyond local exploration unknown', () => {
  const atlas = JSON.parse(readFileSync(new URL('../assets/azhora-dev-regions.json', import.meta.url), 'utf8')).regions;
  const chart = createCartography(), fog = createMapFog(); chart.learn();
  chart.hear('Drent'); chart.hear('Peblos'); chart.hear('Elagos');
  let names = chartShapes(chart.view().entries, atlas), scope = atlasExplorationScope({ ...fog.view(), ...names });
  assert.equal(scope.visited.size + scope.nearby.size, 0, 'hearing three names reveals no geography');
  assert.ok(names.labels.some(label => label.name === 'Drent'));
  const here = hexCentre(10, 106); fog.reveal(here.x, here.z); chart.noteHex('Drent');
  names = chartShapes(chart.view().entries, atlas);
  // Feed even the old full-province payload: the drawing scope must still ignore it.
  const drent = atlas.find(region => region.name === 'Drent');
  scope = atlasExplorationScope({ ...fog.view(), ...names, silhouettes: [drent] });
  assert.equal(scope.visited.size, 1);
  assert.equal(scope.nearby.size, 6);
  const distant = drent.cells.find(cell => !scope.visited.has(`${cell.q},${cell.r}`) && !scope.nearby.has(`${cell.q},${cell.r}`));
  assert.ok(distant, 'the province extends beyond the local seven-cell view');
  for (let i = 1; i < EXPLORED_HEXES; i++) chart.noteHex('Drent');
  const later = atlasExplorationScope({ ...fog.view(), ...chartShapes(chart.view().entries, atlas) });
  assert.deepEqual([...later.visited], [...scope.visited]);
  assert.deepEqual([...later.nearby], [...scope.nearby], 'even the explored rank grants no remote hexes');
  assert.equal(later.visited.has(`${distant.q},${distant.r}`) || later.nearby.has(`${distant.q},${distant.r}`), false);
});


test('Cape Thalmagar has authored lettering that normal discovery and developer reveal can both show', () => {
  const source = readFileSync(new URL('../assets/azhora-world-map.svg', import.meta.url), 'utf8');
  const metadata = JSON.parse(readFileSync(new URL('../assets/azhora-world-map.json', import.meta.url), 'utf8'));
  const { terrain, labels } = splitAtlasRegionLabels(source), name = 'Cape Thalmagar';
  assert.equal((labels.match(/<text data-region="Cape Thalmagar"/g) ?? []).length, 1, 'the exported map includes the cape exactly once');
  assert.doesNotMatch(terrain, /<text data-region="Cape Thalmagar"/, 'its label still belongs to the fog-controlled layer');
  assert.ok(!metadata.uncharted.includes(name), 'no permanent export exclusion overrides discovery');
  const names = [...labels.matchAll(/<text data-region="([^"]+)"/g)].map(match => match[1]);
  assert.equal(names.length, metadata.regions.length, 'every authored region can be named');
  const chart = createCartography(); chart.learn();
  const known = () => chartShapes(chart.view().entries, metadata.regions).labels;
  assert.equal(atlasRegionLabelKnown(name, known()), false, 'the cape does not start revealed');
  assert.equal(atlasRegionLabelKnown(name, known(), true), true, 'developer map reveal names the cape');
  chart.hear(name);
  assert.equal(atlasRegionLabelKnown(name, known()), true, 'normal knowledge also reveals its original lettering');
});


test('Tidehaven northeast bank belongs to Drent in the developer atlas, baked world and journal polygons', () => {
  const survey = JSON.parse(readFileSync(new URL('../assets/azhora-dev-regions.json', import.meta.url), 'utf8'));
  const metadata = JSON.parse(readFileSync(new URL('../assets/azhora-world-map.json', import.meta.url), 'utf8'));
  const source = readFileSync(new URL('../assets/azhora-world-map.svg', import.meta.url), 'utf8');
  const owners = survey.regions.filter(region => region.cells.some(cell => cell.q === 15 && cell.r === 105));
  assert.deepEqual(owners.map(region => region.id), ['Drent']);
  assert.equal(regionAt(...Object.values(hexCentre(15, 105))).name, 'Drent');
  assert.equal(regionAt(...Object.values(hexCentre(15, 104))).name, 'Pueth', 'the neighboring north bank remains Pueth');
  assert.deepEqual(metadata.gameAdjustments, GAME_ATLAS_ADJUSTMENTS);
  const drent = metadata.regions.find(region => region.id === 'Drent');
  assert.equal(drent.hexCount, owners[0].cells.length);
  const polygons = [...source.matchAll(/<path data-region="Drent"[^>]*d="([^"]+)"/g)];
  assert.equal(polygons.length, 1);
  assert.equal((polygons[0][1].match(/M/g) ?? []).length, drent.hexCount, 'the journal paints every Drent hex');
});

test('the journal Tessen and real river share the corrected mouth without a second obsolete reach', () => {
  const source = readFileSync(new URL('../assets/azhora-world-map.svg', import.meta.url), 'utf8');
  const riverLayer = source.match(/<g id="rivers"[^>]*>([\s\S]*?)<\/g>/)?.[1];
  assert.ok(riverLayer);
  const paths = [...riverLayer.matchAll(/d="([^"]+)"/g)].flatMap(match => match[1].split('M').filter(Boolean))
    .map(line => line.split('L').map(pair => { const [x, y] = pair.split(',').map(Number); return { x, y }; }));
  const built = TESSEN.points.map(p => TRANSFORM.worldToAtlas(p.x, p.z));
  const near = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < .001;
  const corresponding = paths.filter(points => points.length === built.length &&
    (near(points[0], built[0]) || near(points.at(-1), built[0])));
  assert.equal(corresponding.length, 1, 'only one Tessen course is drawn');
  const points = near(corresponding[0][0], built[0]) ? corresponding[0] : [...corresponding[0]].reverse();
  for (let i = 0; i < points.length; i++) assert.ok(near(points[i], built[i]), `charted and built Tessen point ${i} agree`);
  assert.deepEqual(TESSEN.points, TESSEN.mapLine);
});

test('the local bank correction preserves upstream data and is safe to apply twice', () => {
  const source = { hexes: { '15,105': { q: 15, r: 105, region: 'Pueth', terrain: 'plains' },
    '15,104': { q: 15, r: 104, region: 'Pueth', terrain: 'grassland' } },
    rivers: { '14,104|14,105': 'small', '14,105|15,105': 'small', '14,106|15,105': 'small', '1,2|1,3': 'large' } };
  const before = structuredClone(source), adjusted = applyGameAtlasAdjustments(source);
  assert.deepEqual(source, before, 'imports never mutate the upstream map');
  assert.equal(adjusted.hexes['15,105'].region, 'Drent');
  assert.equal(adjusted.hexes['15,105'].terrain, 'plains');
  assert.deepEqual(adjusted.hexes['15,104'], source.hexes['15,104']);
  assert.equal(adjusted.rivers['14,104|14,105'], undefined);
  assert.equal(adjusted.rivers['14,105|15,105'], undefined);
  assert.equal(adjusted.rivers['14,106|15,105'], undefined);
  assert.equal(adjusted.rivers['15,104|15,105'], 'small');
  assert.equal(adjusted.rivers['15,105|16,104'], 'small');
  assert.equal(adjusted.rivers['16,104|16,105'], 'small');
  assert.equal(adjusted.rivers['1,2|1,3'], 'large');
  assert.deepEqual(applyGameAtlasAdjustments(adjusted), adjusted);
  assert.throws(() => applyGameAtlasAdjustments({ hexes: {}, rivers: {} }), /no longer matches/);
});
