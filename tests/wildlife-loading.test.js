import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import { sourceModule } from './module-loader.js';

const { createWestLife, WEST_LIFE_ZONES, LIFE_REACH } = await sourceModule('../src/west-regions-life.js');
const world = { bounds: { minX: -20000, maxX: 20000, minZ: -20000, maxZ: 20000 },
  heightAt: () => 3, waterAt: () => null, colliders: [] };
const zone = (id, x = 0, species = 'red-deer', extra = {}) => ({ id, species, region: 'Test woodland', radius: .5,
  minX: x - 30, maxX: x + 30, minZ: -30, maxZ: 30, sites: [[x, 0], [x + 5, 5]], ...extra });
const instances = scene => {
  const result = [];
  scene.traverse(object => { if (object.isInstancedMesh) result.push(object); });
  return result;
};
const assertPosed = scene => {
  const matrix = new THREE.Matrix4(), meshes = instances(scene);
  assert.ok(meshes.length > 0, 'approaching wildlife creates actual visual instances');
  for (const mesh of meshes) for (let i = 0; i < mesh.count; i++) {
    mesh.getMatrixAt(i, matrix);
    assert.ok(matrix.elements.every(Number.isFinite));
    assert.ok(matrix.determinant() > 0, 'first visible frame already has a complete pose');
  }
};

test('distant wildlife keeps all logical residents without building species geometry or GPU instances at startup', () => {
  const scene = new THREE.Scene(), zones = [zone('near'), zone('far', 1000, 'boar')];
  const life = createWestLife(scene, world, { zones });
  try {
    assert.equal(life.state().creatures.length, 4);
    assert.deepEqual(life.state().creatures.map(a => a.id), ['near-1', 'near-2', 'far-1', 'far-2']);
    assert.deepEqual(life.visualStats(), { totalGroups: 2, loadedGroups: 0, loadedSpecies: 0, meshes: 0 });
    assert.equal(instances(scene).length, 0);
    const before = life.snapshot();
    life.update(.1, { x: 0, z: 0 }, false);
    assert.deepEqual(life.snapshot(), before, 'paused startup cannot advance or allocate animals');
    assert.equal(life.visualStats().loadedSpecies, 0);
    life.update(.1, { x: 0, z: 0 });
    assert.equal(life.visualStats().loadedSpecies, 1);
    assert.equal(life.visualStats().loadedGroups, 1);
    assertPosed(scene);
    assert.equal(scene.getObjectByName('far').children.length, 0);
  } finally { life.dispose(); }
});

test('fast travel and paused observer flight instantiate destinations immediately without replacing residents', () => {
  const scene = new THREE.Scene(), life = createWestLife(scene, world, { zones: [zone('a'), zone('b', 1000, 'boar')] });
  try {
    const live = life.state().creatures, before = life.snapshot().creatures;
    life.setObserver({ x: 0, z: 0 });
    assertPosed(scene);
    life.setObserver({ x: 1000, z: 0 });
    assert.equal(scene.getObjectByName('a').children.length, 0);
    assert.ok(scene.getObjectByName('b').visible);
    assertPosed(scene);
    life.setObserver({ x: 0, z: 0 });
    assert.ok(scene.getObjectByName('a').visible);
    assert.deepEqual(life.snapshot().creatures, before, 'rendering cannot move or reset the simulation');
    assert.equal(life.state().creatures, live);
    assert.equal(life.visualStats().loadedGroups, 1);
  } finally { life.dispose(); }
});

test('wildlife release hysteresis retains nearby instances but releases distant GPU buffers', () => {
  const scene = new THREE.Scene(), life = createWestLife(scene, world, { zones: [zone('a')] });
  try {
    life.setObserver({ x: 0, z: 0 });
    const body = instances(scene)[0]; let releases = 0;
    body.addEventListener('dispose', () => releases++);
    const version = body.instanceMatrix.version;
    for (let frame = 0; frame < 180; frame++)
      life.setObserver({ x: LIFE_REACH + (frame % 2 ? 20 : -20), z: 0 });
    assert.equal(instances(scene)[0], body, 'flight along the culling boundary does not churn mesh allocations');
    assert.equal(body.instanceMatrix.version, version, 'paused observer flight does not upload unchanged animal poses each frame');
    life.setObserver({ x: LIFE_REACH + 20, z: 0 });
    assert.equal(scene.getObjectByName('a').visible, false);
    assert.equal(instances(scene)[0], body, 'crossing the visibility edge does not rebuild the rig');
    life.setObserver({ x: LIFE_REACH + 50, z: 0 });
    assert.equal(releases, 1);
    assert.equal(instances(scene).length, 0);
    life.setObserver({ x: 0, z: 0 });
    assert.notEqual(instances(scene)[0], body);
    assertPosed(scene);
  } finally { life.dispose(); }
});

test('unloading one herd preserves shared species geometry until its controller is disposed', () => {
  const scene = new THREE.Scene(), life = createWestLife(scene, world, { zones: [zone('a'), zone('b', 100)] });
  life.setObserver({ x: 50, z: 0 });
  const a = scene.getObjectByName('a').children[0], b = scene.getObjectByName('b').children[0];
  assert.equal(a.geometry, b.geometry);
  let geometryReleases = 0;
  a.geometry.addEventListener('dispose', () => geometryReleases++);
  life.setObserver({ x: -90, z: 0 });
  assert.equal(scene.getObjectByName('b').children.length, 0);
  assert.equal(scene.getObjectByName('a').children[0], a);
  assert.equal(geometryReleases, 0);
  life.dispose(); life.dispose();
  assert.equal(geometryReleases, 1);
  assert.equal(scene.children.length, 0);
  assert.equal(life.visualStats().loadedSpecies, 0);
  assert.equal(life.setObserver({ x: 0, z: 0 }), false);
});

test('every authored species can first appear through observer flight with finite complete geometry', () => {
  const species = [...new Set(WEST_LIFE_ZONES.map(z => z.species))];
  for (const kind of species) {
    const scene = new THREE.Scene(), life = createWestLife(scene, world, { zones: [zone(kind, 0, kind)] });
    try {
      assert.equal(life.visualStats().loadedSpecies, 0, `${kind}: construction remains deferred`);
      life.setObserver({ x: 0, z: 0 });
      assert.equal(life.visualStats().loadedSpecies, 1, kind);
      assertPosed(scene);
    } finally { life.dispose(); }
  }
});

test('lazy hornless herds retain their distinct head and airborne groups remain visible across their flight radius', () => {
  const scene = new THREE.Scene(), zones = [zone('stag'), zone('hind', 20, 'red-deer', { hornless: true }),
    zone('hawk', 1000, 'plateau-hawk', { air: 30, circle: 40, quarter: 20 })];
  const life = createWestLife(scene, world, { zones });
  try {
    life.setObserver({ x: 0, z: 0 });
    assert.notEqual(scene.getObjectByName('stag').getObjectByName('red-deer heads').geometry,
      scene.getObjectByName('hind').getObjectByName('red-deer heads').geometry);
    life.setObserver({ x: 1000 + LIFE_REACH + 50, z: 0 });
    assert.equal(scene.getObjectByName('hawk').visible, true);
    assertPosed(scene);
  } finally { life.dispose(); }
});
