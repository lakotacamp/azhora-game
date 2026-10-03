import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceModule } from './module-loader.js';
import { scopedWorld } from './scoped-world.js';
import * as THREE from '../vendor/three.module.js';
import { canStand } from '../src/game-state.js';
import { canWalkSlope } from '../src/climbing.js';
import { REGION_IDS, hexOwnerAt } from '../src/region-world.js';
import { TELEMONIA, TELEMONIA_BOX, washWeight, borderDepth, onKethornTop, kethornLift } from '../src/telemonia-world.js';
import { TELEMON_MEN, TELEMON_WOMEN, TORETH_HANDS, TELEMONIA_PEOPLE, TELEMONIA_FIGURES, TELEMON_WORDS, TORETH_WORDS, isTelemon, peopleSummary } from '../src/telemonia-people.js';
import { PASS_MOUTHS, groundKind, TELEMON_HORSES, TELEMONIA_HERD_ZONES } from '../src/telemonia-ways.js';
import { WALL_FIGURES } from '../src/town-life.js';
import { createRoadCheckpoint } from '../src/road-checkpoint.js';
import { createInventoryState } from '../src/inventory.js';
import { createWeapons } from '../src/weapons.js';
import { createJourney } from '../src/journey.js';
import { QUEST_DONE } from '../src/game-state.js';
import { METRES_PER_HEX } from '../src/world-scale.js';

/**
 * Telemonia, stage 2: the people, and how they meet an outsider, in the world (docs/telemonia-stage2-brief.md).
 * Built on Telemonia alone (tests/scoped-world.js). The rule on its own is tests/telemon-watch.test.js; the town
 * and the fields are the town's own test (tests/telemonia-town.test.js).
 */
const { createCharacter } = await sourceModule('../src/characters.js');
const { telemonWatchFor, telemonSightline, inTelemonia, fighterSpec, TELEMON_FIGHT, TELEMON_MOUTHS } = await sourceModule('../src/telemonia-host.js');
const world = await scopedWorld(new THREE.Scene(), [REGION_IDS[TELEMONIA]]);
const DT = 1 / 30;
const watchers = () => [...TELEMON_MEN, ...TELEMON_WOMEN].map(p => ({ id: p.id, x: p.x, z: p.z, yaw: p.yaw, kind: p.telemon, range: TELEMON_FIGHT.vision }));
const luminance = hex => .2126 * ((hex >> 16) & 255) + .7152 * ((hex >> 8) & 255) + .0722 * (hex & 255);

test('who they are: Telemon men and women and the field people, nobody named, no child', () => {
  const sum = peopleSummary();
  assert.deepEqual([sum.men, sum.women, sum.fieldHands, sum.figures], [13, 10, 12, 12]);
  assert.equal(new Set(TELEMONIA_PEOPLE.map(p => p.id)).size, TELEMONIA_PEOPLE.length);
  for (const p of TELEMONIA_PEOPLE) {
    // People go by what they are.
    assert.ok(['Telemon warrior', 'Telemon woman', 'Field hand'].includes(p.name), `${p.id} is called ${p.name}`);
    assert.doesNotMatch(`${p.name} ${p.role} ${p.lines.join(' ')}`, /\b(boy|girl|child|children|son|daughter|king|Crom)\b/i, `${p.id}: no child, no king, no Crom`);
    assert.ok(!p.look?.child, `${p.id} is a child`);
    assert.ok(p.lines.length >= 1 && p.lines.length <= 3 && p.lines.every(line => line.length < 160), `${p.id} says too much`);
  }
  for (const words of [TELEMON_WORDS.man, TELEMON_WORDS.woman]) assert.ok(words.outside.every(w => w.split(' ').length <= 12), 'the Telemon say very little');
  assert.ok(TORETH_WORDS.unseen.length >= 3 && TORETH_WORDS.watched);
  // The watchers are every Telemon and nobody else.
  assert.equal(TELEMONIA_PEOPLE.filter(isTelemon).length, TELEMON_MEN.length + TELEMON_WOMEN.length);
  assert.ok(TORETH_HANDS.every(p => !isTelemon(p) && p.toreth));
  // "Compact, dark-complexioned": every Telemon darker than every field hand, who are lowlanders by descent.
  const darkest = Math.max(...[...TELEMON_MEN, ...TELEMON_WOMEN].map(p => luminance(p.skin)));
  assert.ok(TORETH_HANDS.every(p => luminance(p.skin) > darkest), 'the field people do not look like the Telemon');
});

test('the gear is on the builds: spear, shield and knife on the men, a knife on the women, nothing on the field people', () => {
  const parts = actor => { const names = []; actor.group.traverse(o => { if (o.name) names.push(o.name); }); return names; };
  for (const p of TELEMON_MEN.slice(0, 3)) for (const armed of [false, true]) {
    const names = parts(createCharacter({ role: p.modelRole, tunic: p.color, skin: p.skin, look: p.look, armed }));
    assert.ok(names.includes(armed ? 'Telemon long spear (held)' : 'Telemon long spear'), `${p.id} ${armed ? 'fights with' : 'carries'} his spear`);
    assert.ok(names.includes('Telemon shield') && names.includes('Telemon knife in its scabbard'), `${p.id}: shield and knife`);
  }
  for (const p of TELEMON_WOMEN.slice(0, 3)) {
    const names = parts(createCharacter({ role: p.modelRole, tunic: p.color, skin: p.skin, look: p.look }));
    assert.ok(names.includes('Telemon woman’s knife in its scabbard'), `${p.id} carries her knife`);
    assert.ok(!names.some(n => /spear|shield/i.test(n)), `${p.id} carries no spear or shield`);
  }
  for (const p of TORETH_HANDS.slice(0, 3)) {
    const names = parts(createCharacter({ role: p.modelRole, tunic: p.color, skin: p.skin, look: p.look }));
    assert.ok(!names.some(n => /spear|shield|knife|dagger|sword|axe|weapon/i.test(n)), `${p.id} is armed: ${names.join(', ')}`);
  }
});

test('everybody stands on ground a body can stand on, off the washes, where they belong, and can walk out', () => {
  for (const p of [...TELEMONIA_PEOPLE, ...TELEMONIA_FIGURES]) {
    assert.equal(hexOwnerAt(p.x, p.z), TELEMONIA, `${p.id} is not in Telemonia`);
    assert.ok(canStand(p.x, p.z, world, .34), `${p.id} has no footing at ${p.x.toFixed(1)}, ${p.z.toFixed(1)}`);
    assert.ok(washWeight(p.x, p.z) < .2, `${p.id} stands in a wash`);
    assert.notEqual(groundKind(p.x, p.z), 'rim', `${p.id} is up on the rim`);
    for (const q of TELEMONIA_PEOPLE) if (q !== p) assert.ok(Math.hypot(q.x - p.x, q.z - p.z) > 1.4, `${p.id} and ${q.id} stand in each other`);
  }
  assert.ok(TELEMON_WOMEN.filter(w => /gate/.test(w.role)).every(w => onKethornTop(w.x, w.z)), 'the women at the gate are inside it');
  assert.ok(TELEMON_WOMEN.filter(w => /terrace/.test(w.role)).every(w => groundKind(w.x, w.z) === 'terrace'));
  assert.ok(TORETH_HANDS.every(h => ['plain', 'terrace'].includes(groundKind(h.x, h.z))), 'the field people are in the fields and on the terraces');
  assert.ok(WALL_FIGURES.filter(f => f.id.startsWith('toreth-figure-')).length === TELEMONIA_FIGURES.length, 'the far fields’ figures are drawn');
  // A walked way out, by the game's own rules: everybody's spot is reached, backwards, from outside the country.
  const B = TELEMONIA_BOX, step = 1, cols = Math.floor((B.maxX - B.minX) / step) + 1, rows = Math.floor((B.maxZ - B.minZ) / step) + 1;
  const h = new Float32Array(cols * rows), stand = new Uint8Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = B.minX + i * step, z = B.minZ + j * step, k = j * cols + i; h[k] = world.heightAt(x, z); stand[k] = canStand(x, z, world, .34) ? 1 : 0; }
  const lattice = { heightAt: (x, z) => { const i = Math.round((x - B.minX) / step), j = Math.round((z - B.minZ) / step); return h[Math.max(0, Math.min(rows - 1, j)) * cols + Math.max(0, Math.min(cols - 1, i))]; }, regionAt: world.regionAt };
  const at = k => ({ x: B.minX + (k % cols) * step, z: B.minZ + Math.floor(k / cols) * step });
  const seen = new Uint8Array(cols * rows), queue = new Int32Array(cols * rows); let tail = 0;
  for (let k = 0; k < cols * rows; k++) { const p = at(k); if (stand[k] && hexOwnerAt(p.x, p.z) !== TELEMONIA) { seen[k] = 1; queue[tail++] = k; } }
  for (let head = 0; head < tail; head++) {
    const k = queue[head], i = k % cols, p = at(k);
    for (const n of [i > 0 ? k - 1 : -1, i < cols - 1 ? k + 1 : -1, k - cols, k + cols]) {
      if (n < 0 || n >= cols * rows || seen[n] || !stand[n]) continue;
      const q = at(n);
      if (canWalkSlope(q.x, q.z, p.x, p.z, lattice)) { seen[n] = 1; queue[tail++] = n; }
    }
  }
  const index = (x, z) => Math.round((z - B.minZ) / step) * cols + Math.round((x - B.minX) / step);
  const stuck = TELEMONIA_PEOPLE.filter(p => { for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (seen[index(p.x + dx, p.z + dz)]) return false; return true; });
  assert.deepEqual(stuck.map(p => p.id), [], 'sealed in');
});

test('the kingdom’s stock: horses and cattle on the plain, by the heads of the passes', () => {
  for (const horse of TELEMON_HORSES) { assert.equal(groundKind(horse.x, horse.z), 'plain'); assert.ok(washWeight(horse.x, horse.z) < .2); }
  const [cattle] = TELEMONIA_HERD_ZONES;
  assert.equal(cattle.region, TELEMONIA);
  for (const [x, z] of cattle.sites) {
    assert.ok(x >= cattle.minX && x <= cattle.maxX && z >= cattle.minZ && z <= cattle.maxZ);
    assert.equal(groundKind(x, z), 'plain'); assert.ok(canStand(x, z, world, cattle.radius), `cattle at ${x}, ${z}`);
  }
  assert.ok(Math.hypot(cattle.maxX - cattle.minX, cattle.maxZ - cattle.minZ) / 2 < 130, 'inside the west-life reach');
});

/** Walks a traveler along `line` with the rule bound to the world, the Telemon standing at their own places. */
function walk(watch, line, { speed = 3.6, sneaking = false, people = watchers() } = {}) {
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], len = Math.hypot(b.x - a.x, b.z - a.z);
    for (let s = 0; s < len; s += speed * DT) {
      const traveler = { x: a.x + (b.x - a.x) * s / len, z: a.z + (b.z - a.z) * s / len, sneaking };
      const r = watch.update(DT, { traveler, watchers: people });
      if (r.phase === 'noticed' || r.phase === 'hostile') return { r, at: traveler };
    }
  }
  return { r: null, at: line.at(-1) };
}

test('walking in by any pass in the open is seen; over the rim, by the west, a traveler reaches the terraces and the rock’s foot unseen', () => {
  for (const m of PASS_MOUTHS) {
    const watch = telemonWatchFor(world), line = [m.outside, ...[...m.line].reverse()], head = line.at(-1), prev = line.at(-2), d = Math.hypot(head.x - prev.x, head.z - prev.z);
    line.push({ x: head.x + (head.x - prev.x) / d * 30, z: head.z + (head.z - prev.z) / d * 30 });
    const seen = walk(watch, line);
    assert.ok(seen.r, `${m.id}: walked in by it in the open and nobody saw`);
    assert.ok(inTelemonia(seen.at.x, seen.at.z), `${m.id}: seen inside the country`);
  }
  // Over the western rim, where it is two hexes thick and no pass goes: up the outer bands by the climbing skill,
  // across, down the inner cliff onto the terraces, and across the western plain to the foot of the rock's cliffs.
  const route = [[-2352, 1250], [-2300, 1252], [-2262, 1254], [-2246, 1256], [-2215, 1250], [-2172, 1226], [-2136, 1203]].map(([x, z]) => ({ x, z }));
  assert.equal(groundKind(route[2].x, route[2].z), 'terrace', 'the route comes down onto the terraces');
  assert.ok(kethornLift(route.at(-1).x, route.at(-1).z) < .5 && Math.hypot(route.at(-1).x + 2100, route.at(-1).z - 1241) < 60, 'and ends at the foot of the rock');
  for (const sneaking of [true, false]) assert.equal(walk(telemonWatchFor(world), route, { speed: sneaking ? 1.76 : 3.6, sneaking }).r, null, `seen on the western route (${sneaking ? 'sneaking' : 'walking'})`);
  // The rock itself is had only by the gate: its cliffs give no hold (stage 1), and whoever is nearest the gate is the gate.
  const spur = walk(telemonWatchFor(world), [{ x: -2176, z: 1318 }, { x: -2136.8, z: 1278.2 }, { x: -2126.9, z: 1268.3 }], { speed: 1.76, sneaking: true });
  assert.ok(spur.r, 'up the spur to the gate, sneaking, and nobody saw');
});

test('seen in the world: turned round, walked to a pass mouth with a Telemon behind, who stops inside the border', () => {
  const watch = telemonWatchFor(world), people = watchers();
  // On the plain in front of the man with the horses, by the head of the east pass.
  const herdsman = TELEMON_MEN.find(p => /horses/.test(p.role)), traveler = { x: herdsman.x + Math.sin(herdsman.yaw) * 16, z: herdsman.z + Math.cos(herdsman.yaw) * 16, sneaking: false };
  const phases = new Set();
  let r = null;
  for (let t = 0; t < 240; t += DT) {
    r = watch.update(DT, { traveler, watchers: people });
    phases.add(r.phase);
    if (r.phase === 'outside') break;
    assert.notEqual(r.phase, 'hostile', `a fight (${r.cause}) on a walk out kept to`);
    const escort = people.find(p => p.id === r.escortId);
    if (escort && r.escortTo) {
      const d = Math.hypot(r.escortTo.x - escort.x, r.escortTo.z - escort.z), step = Math.min(d, 3.2 * DT);
      if (d > 1e-6) { escort.x += (r.escortTo.x - escort.x) / d * step; escort.z += (r.escortTo.z - escort.z) / d * step; }
      assert.ok(borderDepth(escort.x, escort.z) > 0, 'whoever walks him out never leaves the country');
    }
    if (r.phase === 'escorting') {
      // He walks to the mouth he is told, and on out past it.
      const m = r.mouth, out = { x: m.x + (m.x - m.stand.x) * 3, z: m.z + (m.z - m.stand.z) * 3 }, goal = r.released ? out : m;
      const d = Math.hypot(goal.x - traveler.x, goal.z - traveler.z), step = Math.min(d, 3 * DT);
      if (d > 1e-6) { traveler.x += (goal.x - traveler.x) / d * step; traveler.z += (goal.z - traveler.z) / d * step; }
    }
  }
  for (const phase of ['noticed', 'escorting', 'outside']) assert.ok(phases.has(phase), `${phase} missing from ${[...phases].join(', ')}`);
  assert.equal(r.walkedOut, 1);
  // The second crossing, seen: a fight at once, and every Telemon in earshot is in it.
  const spurWoman = TELEMON_WOMEN.find(p => /spur/.test(p.role)), people2 = watchers(), again = telemonWatchFor(world);
  again.restore({ version: 1, walkedOut: 1, fights: 0 });
  const seen = walk(again, [{ x: spurWoman.x + Math.sin(spurWoman.yaw) * 30, z: spurWoman.z + Math.cos(spurWoman.yaw) * 30 }, { x: spurWoman.x + Math.sin(spurWoman.yaw) * 6, z: spurWoman.z + Math.cos(spurWoman.yaw) * 6 }], { people: people2 });
  assert.equal(seen.r?.phase, 'hostile', 'the second crossing is received differently');
  assert.equal(seen.r.cause, 'returned');
  for (const id of seen.r.fighters) { const p = people2.find(q => q.id === id); assert.ok(Math.hypot(p.x - seen.at.x, p.z - seen.at.z) <= 65, `${id} is out of earshot`); }
  assert.ok(seen.r.fighters.length >= 3, `${seen.r.fighters.length} in the fight below the gate`);
  // Each fights as what they are, and the men are the harder.
  const man = TELEMON_MEN[0], woman = TELEMON_WOMEN[0];
  assert.deepEqual([fighterSpec(man, man).kind, fighterSpec(woman, woman).kind], ['soldier', 'rebel']);
  assert.ok(fighterSpec(man, man).hp > fighterSpec(woman, woman).hp);
  assert.ok(TELEMON_MOUTHS.length === 3);
});

test('the sightline: the open is seen across, the rock’s lip is cover', () => {
  const see = telemonSightline(world);
  const [a] = TELEMON_MEN;
  assert.equal(see({ ...a, id: 'x' }, { x: a.x + Math.sin(a.yaw) * 20, z: a.z + Math.cos(a.yaw) * 20 }), true, 'in the open, in front of him');
  // From the plain under the rock's cliff, nobody on its top is in sight: the lip is in the way.
  const onTop = TELEMON_MEN.find(p => /hall/.test(p.role)), under = { x: -2136, z: 1203 };
  assert.equal(see({ ...onTop, id: 'y', yaw: Math.atan2(under.x - onTop.x, under.z - onTop.z) }, under), false, 'seen through the rock');
});

test('the standing goes into the saved game and comes back; an old save has none, and a bad one is a clean one', () => {
  // The law checkpoint test's own fixture (tests/law-checkpoint.test.js): a complete road, the satchel it needs.
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
  const inventory = createInventoryState();
  for (const id of ['simple-sword', 'harbor-letter', 'road-token', 'tinderbox']) inventory.grant(id);
  const weapons = createWeapons({ inventory }), journey = createJourney({ inventory, weapons }); journey.start();
  const fixture = { version: 1, worldScale: METRES_PER_HEX, questStage: QUEST_DONE, journey: journey.snapshot(), inventory: inventory.items().map(id => ({ id, quantity: inventory.count(id) })),
    weapons: weapons.snapshot(), journeyGathered: [], meadowCleared: false, position: { x: 3, z: -190 }, heardDoom: false };
  const checkpoint = createRoadCheckpoint({ storage });
  const saved = checkpoint.save({ ...fixture, telemon: { version: 1, walkedOut: 2, fights: 1 } });
  assert.equal(saved.ok, true, saved.reason);
  assert.deepEqual(checkpoint.read().data.telemon, { version: 1, walkedOut: 2, fights: 1 });
  const watch = telemonWatchFor(world);
  assert.equal(watch.restore(checkpoint.read().data.telemon), true);
  assert.deepEqual(watch.snapshot(), { version: 1, walkedOut: 2, fights: 1 });
  assert.equal(checkpoint.save({ ...fixture, telemon: { version: 1, walkedOut: -1, fights: 0 } }).ok, true, 'a bad standing does not cost the save');
  assert.equal(checkpoint.read().data.telemon, undefined, 'it is dropped: a clean standing');
  assert.equal(checkpoint.save(fixture).ok, true, 'a save from before Telemonia had people');
  assert.equal(checkpoint.read().data.telemon, undefined);
  assert.equal(watch.restore(undefined), true);
  assert.deepEqual(watch.snapshot(), { version: 1, walkedOut: 0, fights: 0 });
});
