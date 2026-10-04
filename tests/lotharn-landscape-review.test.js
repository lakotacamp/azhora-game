import test from 'node:test';
import assert from 'node:assert/strict';
import { lotharnLandscapeDelta, RAMPS, PEAKS, peakUplift } from '../src/east-lotharn-world.js';
import { CAVE_LINES } from '../src/east-lotharn-caves.js';

test('weathered northern faces have unequal relief without lowering cave roofs', () => {
  let changed = 0, largest = 0;
  const relief = new Set();
  for (let z = -1180; z < -975; z += 3) for (let x = -1660; x < -1140; x += 3) {
    const added = lotharnLandscapeDelta(x, z);
    assert.ok(Number.isFinite(added) && added >= 0 && added < 25);
    if (added > .1) { changed++; largest = Math.max(largest, added); relief.add(Math.round(added)); }
  }
  assert.ok(changed > 100, `${changed} samples receive visible weathered spurs`);
  assert.ok(largest > 8, 'large mountain faces receive substantial rather than subpixel relief');
  assert.ok(relief.size > 8, 'the broken faces do not share one repeated spur height');
});

test('the Varn approach and no-hold terrain keep their original elevations', () => {
  for (let z = -975; z <= -590; z += 8) for (let x = -1570; x <= -690; x += 8)
    assert.equal(lotharnLandscapeDelta(x, z), 0, `${x},${z}`);
});

test('weathering preserves summit floors, authored routes and all cave mouths', () => {
  for (const peak of PEAKS) assert.equal(lotharnLandscapeDelta(peak.x, peak.z), 0, peak.id);
  for (const ramp of RAMPS) for (const p of ramp.line.points)
    assert.equal(lotharnLandscapeDelta(p.x, p.z), 0, `${ramp.id}: ${p.x},${p.z}`);
  for (const cave of CAVE_LINES) {
    const mouths = cave.kind === 'chamber' ? [cave.points[0]] : [cave.points[0], cave.points.at(-1)];
    for (const p of mouths) assert.equal(lotharnLandscapeDelta(p.x, p.z), 0, `${cave.id}: ${peakUplift(p.x,p.z)}`);
    // createCaves searches for its openings against terrain along the whole
    // corridor. Protecting only the nominal mouth moved the central portal.
    for (const p of cave.points) for (const dx of [-4, 0, 4]) for (const dz of [-4, 0, 4])
      assert.equal(lotharnLandscapeDelta(p.x + dx, p.z + dz), 0, `${cave.id} corridor`);
  }
});
