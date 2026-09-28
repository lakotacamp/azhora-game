import test from 'node:test';
import assert from 'node:assert/strict';
import { createLotharnCaveWalk, validLotharnCaveSave } from '../src/east-lotharn-cave-walk.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const surface = (_x, z) => z > 3 && z < 17 ? 25 : 10;
function cave(kind = 'through') {
  const points = [{ x: 0, z: 0 }, { x: 0, z: 20 }];
  return { id: 'test-passage', kind, length: 20, openings: [2, 18], portals: [4, 16],
    path: { points, runs: [0, 20], length: 20, bounds: { minX: 0, maxX: 0, minZ: 0, maxZ: 20 } },
    at: s => ({ x: 0, z: clamp(s, 0, 20) }), floor: () => 10, half: () => 1.8, height: () => 3.4 };
}
const setup = (kind) => createLotharnCaveWalk({ caves: [cave(kind)], ground: surface });
function enter(walk, p = { x: 0, y: 10, z: 2 }) { assert.ok(walk.entering(p, 0, .2)); return p; }
function advance(walk, p, dz) { walk.move(p, 0, dz); if (walk.active) p.y = walk.floorAt(p.x, p.z); }

test('a grounded traveler crosses the mouth and keeps the passage floor under its roof', () => {
  const walk = setup(), p = enter(walk);
  advance(walk, p, 8);
  assert.equal(p.y, 10); assert.equal(surface(p.x, p.z), 25); assert.equal(walk.cave.id, 'test-passage');
  assert.equal(walk.validate(p), true);
});

test('walking on the roof or above a mouth never acquires cave support', () => {
  const walk = setup();
  assert.equal(walk.entering({ x: 0, y: 25, z: 10 }, 0, .2), null);
  assert.equal(walk.entering({ x: 0, y: 17, z: 2 }, 0, .2), null);
  assert.equal(walk.floorAt(0, 10), null);
  for (const flags of [{ grounded: false }, { mounted: true }, { climbing: true }, { inWater: true }]) {
    assert.equal(walk.entering({ x: 0, y: 10, z: 2 }, 0, .2, flags), null);
  }
});

test('movement away from a mouth stays outside, and a step may cross the mouth without landing exactly on it', () => {
  const walk = setup(), p = { x: 0, y: 10, z: 1.8 };
  assert.equal(walk.entering(p, 0, -.4), null);
  assert.ok(walk.entering(p, 0, .4)); advance(walk, p, .4); assert.equal(walk.active, true);
});

test('passages support entry and exit in both directions and chambers have no false rear exit', () => {
  for (const start of [2, 18]) {
    const walk = setup(), direction = start === 2 ? 1 : -1, p = { x: 0, y: 10, z: start };
    assert.ok(walk.entering(p, 0, direction * .2));
    advance(walk, p, direction * 17); assert.equal(walk.active, false); assert.equal(walk.safeEntrance, null);
  }
  const room = setup('chamber');
  assert.equal(room.entering({ x: 0, y: 10, z: 18 }, 0, -.2), null);
});

test('passage walls contain ordinary motion and the camera stays below the mountain surface', () => {
  const walk = setup(), p = enter(walk); advance(walk, p, 8);
  walk.move(p, 10, 0); assert.ok(p.x <= 1.46 + 1e-7);
  const camera = walk.camera(p, 0);
  assert.ok(camera.target.y > 10 && camera.target.y < 13.4); assert.ok(camera.target.z < p.z);
  assert.equal(camera.lookAt.y, 11.45);
});

test('a chamber has a solid far wall instead of an exit into the mountain', () => {
  const walk = setup('chamber'), p = enter(walk);
  advance(walk, p, 30);
  assert.ok(p.z <= 20 - .34 + 1e-7); assert.equal(walk.active, true);
  walk.move(p, .5, 8); assert.ok(p.x > .4); assert.ok(p.z <= 20 - .34 + 1e-7);
});

test('explicit cave saves restore the floor while legacy surface saves cannot infer underground state', () => {
  const walk = setup(), p = enter(walk); advance(walk, p, 8);
  const saved = walk.snapshot(); assert.equal(validLotharnCaveSave(saved), true);
  const restored = setup(), at = restored.restore(saved, { x: p.x, z: p.z });
  assert.equal(at.y, 10); assert.equal(restored.active, true);
  assert.equal(restored.restore(null, { x: p.x, z: p.z }), null); assert.equal(restored.active, false);
  assert.deepEqual(restored.savedExit(saved), { x: 0, y: 10, z: .8999999999999999 });
});

test('unknown caves, mismatched positions, and forged entrance coordinates cannot restore ownership', () => {
  const walk = setup(), p = enter(walk); advance(walk, p, 8); const saved = walk.snapshot();
  assert.equal(setup().restore({ ...saved, id: 'missing' }, p), null);
  assert.equal(setup().restore(saved, { x: 8, z: p.z }), null);
  assert.equal(setup().restore(saved, { x: 0, z: 3 }), null);
  assert.equal(setup().restore({ ...saved, safeEntrance: { x: 999, y: 10, z: 2 } }, p), null);
  assert.equal(validLotharnCaveSave({ ...saved, along: NaN }), false);
  assert.equal(validLotharnCaveSave({ ...saved, entrance: 2 }), false);
});

test('travel, flight, and surface relocation clear support, save identity, and camera together', () => {
  for (const change of ['travel', 'roof', 'flight', 'leave']) {
    const walk = setup(), p = enter(walk); advance(walk, p, 8);
    if (change === 'travel') walk.validate({ x: 90, y: 10, z: 90 });
    if (change === 'roof') walk.validate({ ...p, y: 25 });
    if (change === 'flight') walk.validate(p, { suspended: true });
    if (change === 'leave') walk.leave();
    assert.equal(walk.active, false); assert.equal(walk.snapshot(), null); assert.equal(walk.camera(p), null);
  }
});
