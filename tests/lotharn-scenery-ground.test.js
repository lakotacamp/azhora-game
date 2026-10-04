import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import { sourceModule } from './module-loader.js';
import { groundWithRiver, groundBeforeVarn } from '../src/world-terrain.js';
import { createCaves } from '../src/east-lotharn-caves.js';
import { CAVE_BENCH, CAVE_BENCHES, caveBenchRib } from '../src/varn-world.js';
import { lotharnCrestRows } from '../src/east-lotharn-habitat.js';

const { createEastLotharnScenery } = await sourceModule('../src/east-lotharn-scenery.js');
const { getTreeRegistry } = await sourceModule('../src/tree-registry.js');
let fixture;

// Build this region alone, once. Real scenery geometry and terrain are required:
// a pure height-function test cannot see a coarse/fine mesh seam or missing crest.
before(() => {
  const root = new THREE.Group(), colliders = [];
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const round = new THREE.IcosahedronGeometry(1, 0);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 6);
  const material = (tone, options) => new THREE.MeshStandardMaterial({ color: tone, ...options });
  const mesh = (geometry, mat, x, y, z, sx = 1, sy = 1, sz = 1, parent = root) => {
    const result = new THREE.Mesh(geometry, mat);
    result.position.set(x, y, z); result.scale.set(sx, sy, sz); parent.add(result);
    return result;
  };
  const caves = createCaves(groundWithRiver);
  createEastLotharnScenery({
    root, colliders, round, cylinder, material, mesh,
    dummy: new THREE.Object3D(), color: new THREE.Color(),
    box: (mat, x, y, z, w, h, d, parent) => mesh(cube, mat, x, y, z, w, h, d, parent),
    pebble: (mat, x, y, z, w, h, d, parent) => mesh(round, mat, x, y, z, w, h, d, parent),
    post: (mat, x, y, z, r, h, parent) => mesh(cylinder, mat, x, y, z, r, h, r, parent),
    roofGeometry: () => cube,
    groundHeight: groundWithRiver, unbuiltGround: groundBeforeVarn, caves,
  });
  root.updateMatrixWorld(true);
  const fine = root.getObjectByName('East Lotharn cave approach ground');
  const crest = root.getObjectByName('East Lotharn cave approach crest');
  const mouths = [];
  root.traverse(object => { if (object.isMesh && object.name.startsWith('Ground at the mouth of ')) mouths.push(object); });
  assert.ok(fine?.isMesh, 'the narrow approaches have their own fine ground mesh');
  assert.ok(crest?.isMesh, 'the oblique ridge has a continuous crest mesh');
  assert.ok(mouths.length > 0, 'include the separate cave mouth meshes in the surface contract');
  fixture = {
    root, colliders, fine, crest, mouths, surfaces: [fine, crest, ...mouths],
    mouthPoints: caves.flatMap(cave => (cave.kind === 'chamber' ? [cave.portals[0]] : cave.portals).map(at => cave.at(at))),
    ray: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0)),
  };
});

function renderedGap(x, z, label, surfaces = fixture.surfaces) {
  fixture.ray.ray.origin.set(x, 1000, z);
  const hit = fixture.ray.intersectObjects(surfaces, false)[0];
  assert.ok(hit, `${label}: missing rendered surface at ${x}, ${z}`);
  const gap = Math.abs(hit.point.y - groundWithRiver(x, z));
  return { gap, detail: `${label}: ${gap.toFixed(6)} m gap at ${x}, ${z} on ${hit.object.name}` };
}

function assertGroundAt(x, z, tolerance, label, surfaces) {
  const sample = renderedGap(x, z, label, surfaces);
  assert.ok(sample.gap <= tolerance, sample.detail);
  return sample.gap;
}

test('the entire cave approach supports the rendered body footprint within fifteen centimetres of collision ground', t => {
  const offsets = [[0, 0], [.34, 0], [-.34, 0], [0, .34], [0, -.34]];
  let samples = 0, maxGap = 0;
  for (const bench of CAVE_BENCHES) for (let j = 1; j < bench.line.length; j++) {
    const a = bench.line[j - 1], b = bench.line[j];
    const count = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z));
    // Every metre or less, test the centre and full player-radius perimeter.
    // No doorway exclusion: fine/mouth transitions must support the same body.
    for (let i = 0; i <= count; i++) for (const [dx, dz] of offsets) {
      const x = a.x + (b.x - a.x) * i / count + dx;
      const z = a.z + (b.z - a.z) * i / count + dz;
      maxGap = Math.max(maxGap, assertGroundAt(x, z, .15, 'walking footprint'));
      samples++;
    }
  }
  assert.ok(samples >= 2000, `expected full approach coverage, got ${samples} samples`);
  t.diagnostic(`${samples} body samples; maximum rendered gap ${maxGap.toFixed(6)} m`);
});

test('all cave shelf anchors join the fine and mouth ground without a hidden missing tread', t => {
  let samples = 0, maxGap = 0;
  for (const bench of CAVE_BENCHES) for (const p of bench.line) {
    // The crest must not conceal a hole in the underlying walkable shelf.
    maxGap = Math.max(maxGap, assertGroundAt(p.x, p.z, .15, 'shelf anchor', [fixture.fine, ...fixture.mouths]));
    samples++;
  }
  assert.ok(samples >= 66);
  t.diagnostic(`${samples} shelf anchors; maximum rendered gap ${maxGap.toFixed(6)} m`);
});

test('the active stone crest stays continuous and within ten centimetres of its physical ridge between mesh rows', t => {
  const line = CAVE_BENCHES.flatMap((bench, i) => i ? bench.line.slice(1) : bench.line);
  const rows = lotharnCrestRows(line);
  let active = 0, suppressed = 0, maxGap = 0, suppressedMaxGap = 0;
  for (let i = 0; i < rows.length - 1; i += 2) {
    const a = rows[i], b = rows[i + 1];
    const x = (a.x + b.x + (a.nx + b.nx) * CAVE_BENCH.rail) / 2;
    const z = (a.z + b.z + (a.nz + b.nz) * CAVE_BENCH.rail) / 2;
    // Cave mouths deliberately cut a hole through the ridge; their walkable
    // footprint remains covered by the preceding test, with no such exclusion.
    if (fixture.mouthPoints.some(p => Math.abs(x - p.x) < 6 && Math.abs(z - p.z) < 6)) continue;
    if (caveBenchRib(x, z) > .01) {
      maxGap = Math.max(maxGap, assertGroundAt(x, z, .1, 'active crest midpoint'));
      active++;
    } else {
      // Where a ramp suppresses the ridge, the overlay must stop rather than
      // bridge the height discontinuity with a false floating ledge.
      suppressedMaxGap = Math.max(suppressedMaxGap, assertGroundAt(x, z, .15, 'ramp-suppressed crest'));
      suppressed++;
    }
  }
  assert.ok(active >= 400, `expected both shelves and their corner joins, got ${active}`);
  assert.ok(suppressed >= 7, 'also cover the ramp mask transition');
  assert.equal(fixture.crest.material.polygonOffset, true, 'the overlapping ribbon must avoid coplanar flicker');
  t.diagnostic(`${active} active crest samples, max ${maxGap.toFixed(6)} m; ${suppressed} ramp samples, max ${suppressedMaxGap.toFixed(6)} m`);
});

test('the former chamber seam and both sides of the ramp mask have no clipped or floating surface', () => {
  const outliers = [
    // The chamber's mouth-patch neighbour originally interpolated coarse ground
    // and buried the body by 0.405 m; the two mask failures exceeded two metres.
    ['chamber doorway seam', -922.885, -749.4, .15],
    ['ramp-suppressed side', -1027.524, -759.749, .15],
    ['active crest beside ramp', -1028.672, -760.156, .1],
  ];
  assert.ok(caveBenchRib(outliers[1][1], outliers[1][2]) <= .01, 'probe the suppressed side of the actual mask');
  assert.ok(caveBenchRib(outliers[2][1], outliers[2][2]) > .01, 'probe the remaining physical crest beside that mask');
  for (const [label, x, z, tolerance] of outliers) assertGroundAt(x, z, tolerance, label);
});

test('regional geometry changes preserve every original saved tree identity and seeded species and height', () => {
  const trees = getTreeRegistry(fixture.colliders).trees;
  const legacy = trees.filter(tree => !tree.id.startsWith('lotharn-shelter-')).map(tree => [tree.id, tree.species, tree.height]);
  // Recorded from clean a2e49c3 scenery. No second checkout or ignored artifact
  // is required to detect a shifted candidate stream or changed legacy height.
  assert.equal(legacy.length, 5567);
  assert.equal(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'),
    'faaa49dbb472781d30cd27da1cd55ccb1d35d2c085483774d0829ea08a33cea8');
});
