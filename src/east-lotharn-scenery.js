import * as THREE from 'three';
import { hexOwnerAt, REGION_CELLS } from './region-world.js';
import { WORLD_SCALE } from './world-scale.js';
import {
  LOTHARN, KEMRATH, STONEGATE, PASS_INN, IRON_WORKINGS, BALDS, OLVETH_PASTURE, KEMRATH_FIELDS, KEMRATH_VINES,
  lotharnOpen, kemrathFloorAt, nearestOn, stonegateFloor, passRoadAt, PASS_ROAD_HALF,
  MOUNTAIN_PATCH, BANDS, PEAK_TOPS, peakUplift, peakLiftAt, onBald, onCliff, onRamp,
} from './east-lotharn-world.js';
import { LOTHARN_WATERS, STONEGATE_WATER, KEMRATH_WATER, LOTHARN_BORDER_WATER, inWestWater } from './west-regions.js';
import { WEST_PROFILES, westWaterSurface } from './west-ground.js';
import { nearestPlain } from './east-lotharn-caves.js';

/**
 * What the East Lotharn looks like where the ground alone is not enough (the ground is
 * `east-lotharn-world.js` and `west-ground.js`): its water, its forest, the open ground among it,
 * the stone the valleys cut, and its three made places - Kemrath's fields and vines, the pass inn
 * on the col, and the iron workings above Kemrath. Nobody is in any of it.
 *
 * The forest is the lore's, and the lore is particular: "primarily deciduous - oak, chestnut,
 * maple, hickory, walnut, beech, tulip poplar, and many others", "heavily, continuously,
 * completely forested from their base to within a few hundred meters of their highest summits",
 * old - "individual trees in the Lotharn are centuries old" - but "managed old-growth, forest that
 * knows people". So seven kinds, big, close, thinning toward the tops, and not in the places
 * people have kept open. Summer green: the autumn the lore makes so much of is a season the world
 * does not have yet.
 */
export function createEastLotharnScenery(kit) {
  const { root, material, mesh, box, post, pebble, groundHeight, colliders, dummy, color, round, roofGeometry } = kit;
  const group = new THREE.Group(); group.name = 'East Lotharn scenery'; root.add(group);
  let seed = 3094417;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const range = (a, b) => a + random() * (b - a);
  const pick = list => list[Math.floor(random() * list.length)];
  const gy = (x, z) => groundHeight(x, z);
  const push = collider => { colliders.push(collider); return collider; };
  const metrics = { water: 0, trees: 0, tufts: 0, crops: 0, vines: 0, rocks: 0, outcrops: 0, buildings: 0, batches: 0, rushes: 0 };
  const own = (x, z) => hexOwnerAt(x, z) === LOTHARN;

  // -------------------------------------------------------------------------
  // Water
  // -------------------------------------------------------------------------
  /**
   * Mountain water, greyer and greener than the plain's; and white water for Stonegate, where
   * the lore's rivers "run white" - the same ripple run faster, and breaking.
   */
  // In the fog like everything else: a range seen "rise into the haze" whose rivers did not would
  // draw them as dark strokes across the far forest.
  const vertexShader = `#include <fog_pars_vertex>
varying vec3 p; void main(){p=position;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
  const shader = body => `#include <fog_pars_fragment>
uniform float time; varying vec3 p; void main(){${body}
#include <fog_fragment>
}`;
  const uniforms = () => THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { time: { value: 0 } }]);
  const waterMaterial = new THREE.ShaderMaterial({ uniforms: uniforms(), fog: true, side: THREE.DoubleSide, vertexShader,
    fragmentShader: shader('float w=sin(p.x*.42-time*1.6+p.z*1.1)*sin(p.x*.17+p.z*1.3);vec3 c=vec3(.20,.33,.33)+vec3(.13,.16,.15)*pow(max(w,0.),8.);gl_FragColor=vec4(c,1.);') });
  const whiteMaterial = new THREE.ShaderMaterial({ uniforms: uniforms(), fog: true, side: THREE.DoubleSide, vertexShader,
    fragmentShader: shader('float w=sin(p.x*1.3-time*4.2+p.z*1.9)*sin(p.x*.7+p.z*2.6-time*3.1);float f=smoothstep(.15,.75,w)+.25*smoothstep(.6,1.,sin(p.z*4.1+time*5.));vec3 c=mix(vec3(.24,.37,.38),vec3(.86,.89,.88),clamp(f,0.,1.));gl_FragColor=vec4(c,1.);') });

  /** A ribbon of water over a course's samples, broken wherever the ground rises through it. */
  function ribbon(course, mat) {
    let run = [];
    const flush = () => {
      if (run.length < 2) { run = []; return; }
      const vertices = [], indices = [];
      run.forEach((sample, index) => {
        vertices.push(sample.x - sample.nx * sample.half, sample.y, sample.z - sample.nz * sample.half,
          sample.x + sample.nx * sample.half, sample.y, sample.z + sample.nz * sample.half);
        if (index) { const v = index * 2; indices.push(v - 2, v, v - 1, v - 1, v, v + 1); }
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
      const sheet = new THREE.Mesh(geometry, mat); sheet.name = course.name; group.add(sheet); metrics.water++;
      run = [];
    };
    for (const sample of WEST_PROFILES.get(course.id)) {
      const y = westWaterSurface(sample.x, sample.z);
      if (y === null) { flush(); continue; }
      run.push({ ...sample, y });
    }
    flush();
  }
  for (const course of LOTHARN_WATERS) ribbon(course, course === STONEGATE_WATER ? whiteMaterial : waterMaterial);

  // Rushes at the waterline of the slow water: Kemrath's floor and the border water's foot.
  {
    const blade = (() => {
      const positions = [], normals = [];
      for (let b = 0; b < 5; b++) {
        const a = b * 1.26, lean = .12 + b % 3 * .05, bx = Math.cos(a) * .05, bz = Math.sin(a) * .05, w = .022, h = .55 + (b % 3) * .26;
        const cx = Math.cos(a + Math.PI / 2) * w, cz = Math.sin(a + Math.PI / 2) * w;
        positions.push(bx - cx, 0, bz - cz, bx + cx, 0, bz + cz, bx + Math.cos(a) * lean, h, bz + Math.sin(a) * lean);
        for (let i = 0; i < 3; i++) normals.push(0, 1, 0);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      return geometry;
    })();
    const spots = [];
    for (const course of [KEMRATH_WATER, LOTHARN_BORDER_WATER]) for (const sample of WEST_PROFILES.get(course.id)) {
      if (sample.index % 2) continue;
      for (const side of [-1, 1]) {
        const offset = sample.half + range(.2, 1.6), x = sample.x + sample.nx * offset * side, z = sample.z + sample.nz * offset * side;
        if (!own(x, z) || westWaterSurface(x, z) !== null || passRoadAt(x, z).distance < PASS_ROAD_HALF + 1.5) continue;
        spots.push({ x, z, s: range(.55, 1.1), rot: range(0, 6.28) });
      }
    }
    if (spots.length) {
      const batch = new THREE.InstancedMesh(blade, material('#ffffff', { side: THREE.DoubleSide }), spots.length);
      spots.forEach((spot, i) => {
        dummy.position.set(spot.x, gy(spot.x, spot.z), spot.z); dummy.rotation.set(0, spot.rot, 0); dummy.scale.setScalar(spot.s); dummy.updateMatrix();
        batch.setMatrixAt(i, dummy.matrix); batch.setColorAt(i, color.setHSL(range(.2, .26), range(.3, .42), range(.3, .42)));
      });
      batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
      metrics.rushes = spots.length; metrics.batches++;
    }
  }

  // -------------------------------------------------------------------------
  // The peaks' ground
  // -------------------------------------------------------------------------
  /**
   * The massifs, drawn by a ground of their own three metres apart (the world's is sunk under it,
   * `lotharnTerrainSink`), and coloured by what the ground is: bare rock in courses where it is too
   * steep for anybody, each course a little warmer or cooler than the next the way bedded stone
   * weathers; scree and thin grass on the climbs; grass on the ledges, darker low down where the
   * forest is and paler higher up; and the balds' pale bleached grass on the tops.
   */
  {
    const { step, minX, minZ, maxX, maxZ } = MOUNTAIN_PATCH, TILE = 56;
    const cols = Math.floor((maxX - minX) / step) + 1, rows = Math.floor((maxZ - minZ) / step) + 1;
    const lift = new Float32Array(cols * rows), heights = new Float32Array(cols * rows).fill(NaN);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) lift[j * cols + i] = peakLiftAt(minX + i * step, minZ + j * step);
    // A cell is drawn if any corner of it, or of a cell beside it, is lifted.
    const drawn = new Uint8Array((cols - 1) * (rows - 1));
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      let any = false;
      for (let b = -1; b <= 2 && !any; b++) for (let a = -1; a <= 2 && !any; a++) {
        const ii = i + a, jj = j + b;
        if (ii >= 0 && jj >= 0 && ii < cols && jj < rows && lift[jj * cols + ii] > 0) any = true;
      }
      if (any) drawn[j * (cols - 1) + i] = 1;
    }
    const heightOf = (i, j) => {
      const k = j * cols + i;
      if (Number.isNaN(heights[k])) heights[k] = gy(minX + i * step, minZ + j * step);
      return heights[k];
    };
    const rock = [new THREE.Color('#8d8374'), new THREE.Color('#7c7a72'), new THREE.Color('#948878'), new THREE.Color('#827d74')];
    const scree = new THREE.Color('#8f8a6c'), lowGrass = new THREE.Color('#5d7843'), highGrass = new THREE.Color('#7f8b55');
    const baldGrass = new THREE.Color('#a4a66f'), shade = new THREE.Color();
    const material = kit.material('#ffffff', { vertexColors: true, flatShading: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    let jitter = 51413;
    const wobble = () => { jitter = (Math.imul(jitter, 1664525) + 1013904223) >>> 0; return .95 + jitter / 4294967296 * .1; };
    /** The colour of the peaks' ground at a point, into `shade`, from its height, its steepness and the peaks' lift there. */
    const paint = (x, z, y, grade, u) => {
      const course = Math.floor(u / BANDS.period);
      shade.copy(lowGrass).lerp(highGrass, Math.min(1, Math.max(0, (y - 90) / 200)));
      if (u > 0 && onBald(x, z, 4)) shade.lerp(baldGrass, .85);
      shade.lerp(scree, Math.min(1, Math.max(0, (grade - .55) / .4)));
      shade.lerp(rock[((course % 4) + 4) % 4], Math.min(1, Math.max(0, (grade - .95) / .45)));
      shade.multiplyScalar(wobble());
    };
    // At every cave's mouths the ground is opened where it stands inside the passage, and the
    // passage's own rock and an arch of stones round the opening take its place.
    const caves = kit.caves ?? [];
    // Round every cave mouth the ground is drawn again, finer (`mouthGround`, below), so the opening
    // can be cut to the passage's own shape; the three-metre ground is left out under it.
    const MOUTH = 5.5;
    const mouthPoints = caves.flatMap(cave => (cave.kind === 'chamber' ? [cave.portals[0]] : cave.portals).map(at => ({ cave, at, p: cave.at(at) })));
    const underMouth = (i, j) => {
      const x = minX + (i + .5) * step, z = minZ + (j + .5) * step;
      return mouthPoints.some(({ p }) => Math.abs(x - p.x) < MOUTH - 1.5 && Math.abs(z - p.z) < MOUTH - 1.5);
    };
    for (let tj = 0; tj < rows - 1; tj += TILE) for (let ti = 0; ti < cols - 1; ti += TILE) {
      const ci = Math.min(TILE, cols - 1 - ti), cj = Math.min(TILE, rows - 1 - tj), indices = [];
      for (let j = 0; j < cj; j++) for (let i = 0; i < ci; i++) {
        if (!drawn[(tj + j) * (cols - 1) + ti + i] || (mouthPoints.length && underMouth(ti + i, tj + j))) continue;
        const a = j * (ci + 1) + i;
        indices.push(a, a + ci + 1, a + 1, a + 1, a + ci + 1, a + ci + 2);
      }
      if (!indices.length) continue;
      const positions = new Float32Array((ci + 1) * (cj + 1) * 3), colours = new Float32Array((ci + 1) * (cj + 1) * 3);
      for (let j = 0; j <= cj; j++) for (let i = 0; i <= ci; i++) {
        const gi = ti + i, gj = tj + j, x = minX + gi * step, z = minZ + gj * step, k = j * (ci + 1) + i;
        const used = [[0, 0], [-1, 0], [0, -1], [-1, -1]].some(([a, b]) => {
          const ii = gi + a, jj = gj + b;
          return ii >= 0 && jj >= 0 && ii < cols - 1 && jj < rows - 1 && drawn[jj * (cols - 1) + ii];
        });
        if (!used) { positions.set([x, 0, z], k * 3); continue; }
        const y = heightOf(gi, gj);
        positions.set([x, y, z], k * 3);
        const east = heightOf(Math.min(cols - 1, gi + 1), gj), west = heightOf(Math.max(0, gi - 1), gj);
        const north = heightOf(gi, Math.max(0, gj - 1)), south = heightOf(gi, Math.min(rows - 1, gj + 1));
        paint(x, z, y, Math.hypot(east - west, south - north) / (2 * step), lift[gj * cols + gi]);
        colours.set([shade.r, shade.g, shade.b], k * 3);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
      geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
      const ground = new THREE.Mesh(geometry, material);
      ground.name = 'East Lotharn peaks ground'; ground.receiveShadow = true; group.add(ground);
      metrics.batches++;
    }

    // The ground round each mouth, thirty centimetres apart - a cliff is so steep that anything
    // coarser stands taller than the opening - with the passage's own section
    // taken out of it where the passage comes through: the opening in the cliff is the cave's shape.
    const FINE = .3;
    for (const { cave, at, p } of mouthPoints) {
      const n = Math.round(MOUTH * 2 / FINE) + 1, x0 = p.x - MOUTH, z0 = p.z - MOUTH;
      const positions = new Float32Array(n * n * 3), colours = new Float32Array(n * n * 3), heightsHere = new Float32Array(n * n), indices = [];
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) heightsHere[j * n + i] = gy(x0 + i * FINE, z0 + j * FINE);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const x = x0 + i * FINE, z = z0 + j * FINE, y = heightsHere[j * n + i], k = j * n + i;
        const east = heightsHere[j * n + Math.min(n - 1, i + 1)], west = heightsHere[j * n + Math.max(0, i - 1)];
        const north = heightsHere[Math.max(0, j - 1) * n + i], south = heightsHere[Math.min(n - 1, j + 1) * n + i];
        positions.set([x, y, z], k * 3);
        paint(x, z, y, Math.hypot(east - west, south - north) / (2 * FINE), peakLiftAt(x, z));
        colours.set([shade.r, shade.g, shade.b], k * 3);
      }
      // A triangle goes if any corner of it is inside the passage's rock near the opening; on a cliff
      // one that only touches the opening would otherwise hang in front of it as a sliver.
      const within = new Uint8Array(n * n);
      for (let k = 0; k < n * n; k++) {
        const x = positions[k * 3], y = positions[k * 3 + 1], z = positions[k * 3 + 2], near = nearestPlain(cave.path, x, z);
        const inward = at === cave.portals[0] ? near.along - at : at - near.along;
        if (near.distance > cave.half(near.along) + .1 || inward < -1.2 || inward > 4.5) continue;
        const floor = cave.floor(near.along);
        if (y > floor - .3 && y < floor + cave.height(near.along) + .1) within[k] = 1;
      }
      const inside = (a, b, c) => within[a] || within[b] || within[c];
      for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
        const a = j * n + i, b = a + n, c = a + 1, d = a + n + 1;
        if (!inside(a, b, c)) indices.push(a, b, c);
        if (!inside(c, b, d)) indices.push(c, b, d);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
      geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
      const ground = new THREE.Mesh(geometry, material);
      ground.name = `Ground at the mouth of ${cave.name}`; ground.receiveShadow = true; group.add(ground);
      metrics.batches++;
    }
  }

  // -------------------------------------------------------------------------
  // The caves
  // -------------------------------------------------------------------------
  /**
   * Each cave's rock, seen from inside: a flat floor of trodden grit, walls, and a roof that
   * arches over, bent along the passage and opening out into a room at a chamber's end, which is
   * walled off. At every opening, an arch of heavy stones round the mouth, where the passage meets
   * the cliff. Lit the way everything is; the dark inside is main.js's.
   */
  {
    const caves = kit.caves ?? [];
    const wall = [new THREE.Color('#6f675c'), new THREE.Color('#62605a'), new THREE.Color('#77695a')], grit = new THREE.Color('#57493b'), tone = new THREE.Color();
    const caveMaterial = kit.material('#ffffff', { vertexColors: true, flatShading: true, side: THREE.DoubleSide }), archMaterial = kit.material('#ffffff');
    // Round the passage, from the floor's left edge up over the roof and down to its right edge.
    const ring = [[-1, 0], [1, 0], [1, .42], [.9, .7], [.62, .9], [0, 1], [-.62, .9], [-.9, .7], [-1, .42]];
    for (const cave of caves) {
      const [inAt, outAt] = cave.portals, end = cave.kind === 'chamber';
      const from = Math.max(0, inAt - 1.4), to = end ? cave.length : Math.min(cave.length, outAt + 1.4);
      const samples = [];
      for (let s = from; s < to; s += 1.2) samples.push(s);
      samples.push(to);
      const positions = [], colours = [], indices = [];
      samples.forEach((s, k) => {
        const p = cave.at(s), w = cave.half(s), h = cave.height(s), y = cave.floor(s);
        ring.forEach(([a, b], r) => {
          const bump = r > 1 ? Math.sin(s * 1.7 + r * 2.3) * .12 : 0;
          positions.push(p.x + p.nx * a * (w + bump), y + b * h + (r > 1 ? bump : 0), p.z + p.nz * a * (w + bump));
          tone.copy(r < 2 ? grit : wall[(k + r) % 3]).multiplyScalar(.9 + ((k * 7 + r * 3) % 5) * .04);
          colours.push(tone.r, tone.g, tone.b);
        });
        if (k === 0) return;
        const a = (k - 1) * ring.length, b = k * ring.length;
        for (let r = 0; r < ring.length; r++) {
          const r2 = (r + 1) % ring.length;
          if (r === 0) { indices.push(a, b + 1, a + 1, a, b, b + 1); continue; }   // the floor, left edge to right
          indices.push(a + r, b + r, a + r2, a + r2, b + r, b + r2);
        }
      });
      // A chamber's far wall.
      if (end) {
        const last = (samples.length - 1) * ring.length;
        for (let r = 1; r < ring.length - 1; r++) indices.push(last, last + r, last + r + 1);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
      geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
      const rock = new THREE.Mesh(geometry, caveMaterial);
      rock.name = `Cave: ${cave.name}`; rock.receiveShadow = true; rock.castShadow = true; group.add(rock);
      metrics.batches++;
      const mouths = end ? [inAt] : [inAt, outAt];
      // A collar of rock round each opening, just outside it: the passage's section and a larger one
      // joined in a face, carried back a few metres, covering the ragged edge of the ground's cut.
      for (const at of mouths) {
        const outward = at === inAt ? -1 : 1, s0 = at + outward * 1.3, s1 = at - outward * 3;
        const frame = [], frameColours = [], frameIndex = [], w = cave.half(at), h = cave.height(at), y = cave.floor(at);
        for (const s of [s0, s1]) {
          const p = cave.at(Math.max(0, Math.min(cave.length, s)));
          for (const [grow, lift] of [[0, 0], [2.2, 3.4]]) ring.forEach(([a, b]) => {
            frame.push(p.x + p.nx * a * (w + grow), y + b * (h + lift) - (b === 0 ? .5 : 0), p.z + p.nz * a * (w + grow));
            tone.copy(wall[frame.length % 3]); frameColours.push(tone.r, tone.g, tone.b);
          });
        }
        const n = ring.length, inner = (k, r) => k * 2 * n + r, outer = (k, r) => k * 2 * n + n + r;
        for (let r = 1; r < n; r++) {
          const r2 = (r + 1) % n;
          frameIndex.push(inner(0, r), outer(0, r), inner(0, r2), inner(0, r2), outer(0, r), outer(0, r2));
          frameIndex.push(outer(0, r), outer(1, r), outer(0, r2), outer(0, r2), outer(1, r), outer(1, r2));
        }
        const shape = new THREE.BufferGeometry();
        shape.setAttribute('position', new THREE.Float32BufferAttribute(frame, 3));
        shape.setAttribute('color', new THREE.Float32BufferAttribute(frameColours, 3));
        shape.setIndex(frameIndex); shape.computeVertexNormals(); shape.computeBoundingSphere();
        const collar = new THREE.Mesh(shape, caveMaterial);
        collar.name = `Cave mouth: ${cave.name}`; collar.castShadow = true; collar.receiveShadow = true; group.add(collar);
        metrics.batches++;
      }
      // The arch of stones round each mouth.
      for (const at of mouths) {
        const p = cave.at(at), w = cave.half(at), h = cave.height(at), y = cave.floor(at);
        const stones = new THREE.InstancedMesh(round, archMaterial, 11);
        for (let i = 0; i < 11; i++) {
          const t = i / 10, a = Math.cos(Math.PI * t) * (w + .55), b = Math.sin(Math.PI * t) * (h + .35) * .98;
          dummy.position.set(p.x + p.nx * a, y + Math.max(.2, b), p.z + p.nz * a);
          dummy.rotation.set(range(-.3, .3), range(0, 6.28), range(-.3, .3));
          dummy.scale.set(range(.75, 1.1), range(.6, .9), range(.8, 1.2)); dummy.updateMatrix();
          stones.setMatrixAt(i, dummy.matrix); stones.setColorAt(i, color.setHSL(range(.07, .1), range(.06, .12), range(.36, .46)));
        }
        stones.castShadow = true; stones.receiveShadow = true; stones.computeBoundingSphere(); group.add(stones);
        metrics.batches++;
      }
    }
  }

  // -------------------------------------------------------------------------
  // The forest
  // -------------------------------------------------------------------------
  /**
   * Seven of the lore's trees, told apart by crown and colour. `tall` trees stack their crown
   * up the trunk; `wide` ones spread it. Heights are an old forest's: a tulip poplar is the
   * tallest broadleaf there is, and an oak of centuries is as broad as it is high.
   */
  const KINDS = Object.freeze([
    { id: 'oak', tint: '#3f5e31', h: [13, 18], wide: true, weight: 5 },
    { id: 'chestnut', tint: '#58773a', h: [12, 16], wide: true, weight: 4 },
    { id: 'maple', tint: '#4c7438', h: [11, 15], wide: false, weight: 3 },
    { id: 'beech', tint: '#66893f', h: [12, 17], wide: false, weight: 3 },
    { id: 'hickory', tint: '#46673a', h: [14, 19], tall: true, weight: 2 },
    { id: 'walnut', tint: '#51703c', h: [12, 15], wide: true, weight: 2 },
    { id: 'tulip-poplar', tint: '#6d9447', h: [16, 22], tall: true, weight: 2 },
  ]);
  const kindWeights = KINDS.reduce((sum, kind) => sum + kind.weight, 0);
  const chooseKind = () => { let r = random() * kindWeights; for (const kind of KINDS) { r -= kind.weight; if (r <= 0) return kind; } return KINDS[0]; };
  const trunkGeometry = new THREE.CylinderGeometry(.2, .36, 1, 6);
  const crownGeometry = new THREE.IcosahedronGeometry(1, 0);
  const barkMaterial = material('#5f4c38'), leafMaterial = material('#ffffff', { flatShading: true });
  const tuftGeometry = (() => {
    const positions = [], normals = [];
    for (let blade = 0; blade < 4; blade++) {
      const a = blade * 1.9, bx = Math.cos(a) * .15, bz = Math.sin(a) * .15, w = .05, h = .24 + (blade % 3) * .09;
      const cx = Math.cos(a + Math.PI / 2) * w, cz = Math.sin(a + Math.PI / 2) * w;
      positions.push(bx - cx, 0, bz - cz, bx + cx, 0, bz + cz, bx + Math.cos(a) * .08, h, bz + Math.sin(a) * .08);
      for (let j = 0; j < 3; j++) normals.push(0, 1, 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geometry;
  })();
  const tuftMaterial = material('#ffffff', { side: THREE.DoubleSide });
  const stoneMaterial = material('#8e8c80');

  function woodBatch(trees) {
    if (!trees.length) return;
    const trunks = new THREE.InstancedMesh(trunkGeometry, barkMaterial, trees.length);
    const crowns = new THREE.InstancedMesh(crownGeometry, leafMaterial, trees.length * 3);
    let crownIndex = 0;
    trees.forEach((tree, index) => {
      const y = gy(tree.x, tree.z), height = tree.h, kind = tree.kind;
      dummy.position.set(tree.x, y + height * .36, tree.z); dummy.rotation.set(0, tree.rot, 0);
      dummy.scale.set(tree.s, height * .74, tree.s); dummy.updateMatrix();
      trunks.setMatrixAt(index, dummy.matrix);
      push({ x: tree.x, z: tree.z, r: .5 * tree.s, kind: 'lotharn-tree' });
      for (let lobe = 0; lobe < 3; lobe++) {
        const a = tree.rot + lobe * 2.1;
        if (kind.tall) {
          // A tall crown is a column: lobes one above another, narrowing upward.
          dummy.position.set(tree.x + Math.sin(a) * height * .04, y + height * (.55 + lobe * .16), tree.z + Math.cos(a) * height * .04);
          const r = height * (.2 - lobe * .035);
          dummy.scale.set(r, height * .17, r);
        } else {
          const spread = lobe === 2 ? 0 : height * (kind.wide ? .18 : .12);
          dummy.position.set(tree.x + Math.sin(a) * spread, y + height * (lobe === 2 ? .9 : .72), tree.z + Math.cos(a) * spread);
          const r = height * (kind.wide ? .34 : .26);
          dummy.scale.set(r, height * (kind.wide ? .24 : .28), r);
        }
        dummy.rotation.set(range(-.15, .15), a, range(-.14, .14)); dummy.updateMatrix();
        crowns.setMatrixAt(crownIndex, dummy.matrix);
        crowns.setColorAt(crownIndex++, color.set(kind.tint).offsetHSL(range(-.015, .015), range(-.05, .05), range(-.06, .05)));
      }
    });
    for (const batch of [trunks, crowns]) { batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch); }
    metrics.trees += trees.length; metrics.batches += 2;
  }
  function tuftBatch(tufts, tint) {
    if (!tufts.length) return;
    const batch = new THREE.InstancedMesh(tuftGeometry, tuftMaterial, tufts.length);
    tufts.forEach((tuft, index) => {
      dummy.position.set(tuft.x, gy(tuft.x, tuft.z) + .02, tuft.z); dummy.rotation.set(0, tuft.rot, 0); dummy.scale.setScalar(tuft.s); dummy.updateMatrix();
      batch.setMatrixAt(index, dummy.matrix); batch.setColorAt(index, tint(tuft));
    });
    batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
    metrics.tufts += tufts.length; metrics.batches++;
  }
  function rockBatch(rocks) {
    if (!rocks.length) return;
    const batch = new THREE.InstancedMesh(round, stoneMaterial, rocks.length);
    rocks.forEach((rock, index) => {
      dummy.position.set(rock.x, gy(rock.x, rock.z) + rock.s * .2, rock.z);
      dummy.rotation.set(range(-.2, .2), rock.rot, range(-.2, .2));
      dummy.scale.set(rock.s, rock.s * range(.45, .75), rock.s * range(.75, 1.25)); dummy.updateMatrix();
      batch.setMatrixAt(index, dummy.matrix); batch.setColorAt(index, color.setHSL(range(.08, .13), range(.05, .12), range(.4, .56)));
    });
    batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
    metrics.rocks += rocks.length; metrics.batches++;
  }

  // Nothing grows or lies in a cave's mouth, nor on the ground in front of it.
  const mouths = (kit.caves ?? []).flatMap(cave => (cave.kind === 'chamber' ? [cave.openings[0]] : cave.openings).map(at => cave.at(at)));
  const atMouth = (x, z, margin = 0) => mouths.some(m => Math.abs(m.x - x) < 6 + margin && Math.abs(m.z - z) < 6 + margin && Math.hypot(m.x - x, m.z - z) < 6 + margin);
  /** How high a point stands among the range's own ground: the forest thins toward the tops. */
  const cells = [...(REGION_CELLS[LOTHARN] ?? [])].sort((a, b) => a.z - b.z || a.x - b.x);
  const BLOCK = Math.max(1, Math.round(4 / (WORLD_SCALE * WORLD_SCALE)));
  const candidates = Math.round(190 * WORLD_SCALE * WORLD_SCALE);
  for (let start = 0; start < cells.length; start += BLOCK) {
    const block = cells.slice(start, start + BLOCK), trees = [], floor = [], open = [], rocks = [];
    for (const cell of block) {
      for (let i = 0; i < candidates; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-57, 57);
        if (!own(x, z) || lotharnOpen(x, z, 1.5) || inWestWater(x, z, 3) || atMouth(x, z)) continue;
        const y = gy(x, z);
        // "To within a few hundred meters of their highest summits": the ledges are wooded high up
        // the peaks, thinning from two hundred metres to nothing at about two hundred and eighty,
        // and nothing grows out of a cliff or on a bald.
        if (y > 200 && random() < (y - 200) / 80) continue;
        if (onCliff(x, z) || onBald(x, z, 2)) continue;
        if (trees.some(tree => Math.hypot(tree.x - x, tree.z - z) < 4.3)) continue;
        const kind = chooseKind();
        trees.push({ x, z, kind, h: range(...kind.h) * (y > 80 ? .82 : 1) * (y > 180 ? .75 : 1), s: range(.9, 1.35), rot: range(0, 6.28) });
      }
      // The forest floor: fern and sorrel in the shade, sparse; open ground grassed thick.
      for (let i = 0; i < 70; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-57, 57);
        if (!own(x, z) || inWestWater(x, z, 1.5)) continue;
        if (lotharnOpen(x, z)) { if (kemrathFloorAt(x, z) === null) open.push({ x, z, s: range(.8, 1.6), rot: range(0, 6.28), bald: BALDS.some(b => Math.hypot(x - b.x, z - b.z) < b.radius) }); }
        else if (i % 3 === 0) floor.push({ x, z, s: range(.9, 1.7), rot: range(0, 6.28) });
      }
      // Stone shows where the soil is thin: on the balds, and on the steep ground of the tops.
      for (let i = 0; i < 16; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-57, 57);
        if (!own(x, z) || inWestWater(x, z, 2) || gy(x, z) < 70 || passRoadAt(x, z).distance < PASS_ROAD_HALF + 3 || atMouth(x, z) || onRamp(x, z, 1)) continue;
        rocks.push({ x, z, s: range(.4, 1.5), rot: range(0, 6.28) });
      }
    }
    woodBatch(trees);
    tuftBatch(floor, () => color.setHSL(range(.24, .31), range(.3, .45), range(.2, .3)));
    tuftBatch(open, tuft => tuft.bald ? color.setHSL(range(.13, .18), range(.25, .36), range(.4, .52)) : color.setHSL(range(.2, .26), range(.3, .42), range(.34, .46)));
    rockBatch(rocks);
  }

  // -------------------------------------------------------------------------
  // Kemrath: the fields and the vines
  // -------------------------------------------------------------------------
  /**
   * "The farming communities of the wider valleys... preserve agricultural varieties... that have
   * been replaced or modified in the more dynamic Mittoli heartland." Strips down both sides of
   * the water, thirty metres long: grain going gold, a darker crop in rows, and fallow.
   */
  {
    const line = KEMRATH.line;
    const pointAt = along => {
      let i = 1; while (i < line.runs.length - 1 && line.runs[i] < along) i++;
      const a = line.points[i - 1], b = line.points[i], span = line.runs[i] - line.runs[i - 1] || 1, t = (along - line.runs[i - 1]) / span;
      const dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz) || 1;
      return { x: a.x + dx * t, z: a.z + dz * t, nx: -dz / length, nz: dx / length };
    };
    const CROPS = [
      { id: 'grain', ground: '#a38f55', rows: 1.1, every: .7, tint: () => color.setHSL(range(.11, .14), range(.45, .6), range(.5, .6)), s: [1.1, 1.6] },
      { id: 'beans', ground: '#5f6b3e', rows: 1.4, every: .9, tint: () => color.setHSL(range(.27, .32), range(.35, .5), range(.24, .32)), s: [1.2, 1.7] },
      { id: 'hay', ground: '#83955a', rows: .9, every: .8, tint: () => color.setHSL(range(.18, .23), range(.3, .42), range(.4, .5)), s: [.9, 1.5] },
      null,   // fallow
    ];
    const crops = [];
    let strip = 0;
    for (let a0 = KEMRATH_FIELDS.from; a0 < KEMRATH_FIELDS.to; a0 += 30, strip++) for (const side of [-1, 1]) {
      const crop = CROPS[(strip * 2 + (side > 0 ? 1 : 0) * 3) % CROPS.length];
      if (!crop) continue;
      for (let offset = 5; offset < KEMRATH_FIELDS.half; offset += crop.rows) for (let along = a0 + 1; along < a0 + 29; along += crop.every) {
        const p = pointAt(along), x = p.x + p.nx * offset * side + range(-.15, .15), z = p.z + p.nz * offset * side + range(-.15, .15);
        if (!own(x, z) || inWestWater(x, z, 1) || kemrathFloorAt(x, z) === null) continue;
        crops.push({ x, z, s: range(...crop.s), rot: range(0, 6.28), crop });
      }
    }
    tuftBatch(crops, tuft => tuft.crop.tint());
    metrics.crops = crops.length;

    // The strips themselves, under the crop: a field is its ground's colour as much as its crop's,
    // and fallow is ploughed earth. Laid a hair above the floor, and never over the water.
    {
      const positions = [], colours = [], indices = [], shade = new THREE.Color();
      let stripIndex = 0;
      for (let a0 = KEMRATH_FIELDS.from; a0 < KEMRATH_FIELDS.to; a0 += 30, stripIndex++) for (const side of [-1, 1]) {
        const crop = CROPS[(stripIndex * 2 + (side > 0 ? 1 : 0) * 3) % CROPS.length];
        shade.set(crop ? crop.ground : '#7a6346');
        const cols = 11, rows = 11, base = positions.length / 3;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const along = a0 + .5 + i * 29 / (cols - 1), offset = 4.5 + j * 15.5 / (rows - 1), p = pointAt(along);
          const x = p.x + p.nx * offset * side, z = p.z + p.nz * offset * side;
          positions.push(x, gy(x, z) + .05, z);
          const k = .94 + ((i * 7 + j * 3) % 5) * .025;
          colours.push(shade.r * k, shade.g * k, shade.b * k);
        }
        for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
          const q = base + j * cols + i, c = (q + 1 + cols) * 3;
          const cx = (positions[q * 3] + positions[c]) / 2, cz = (positions[q * 3 + 2] + positions[c + 2]) / 2;
          if (inWestWater(cx, cz, 1.2)) continue;
          if (side > 0) indices.push(q, q + cols, q + 1, q + 1, q + cols, q + cols + 1);
          else indices.push(q, q + 1, q + cols, q + 1, q + cols + 1, q + cols);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
      geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
      const fields = new THREE.Mesh(geometry, material('#ffffff', { vertexColors: true, flatShading: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      fields.name = 'Kemrath fields'; fields.receiveShadow = true; group.add(fields); metrics.batches++;
    }

    // The vines: a low block of rows on the south-facing foot of the north wall, on stakes.
    const vines = [], stakes = [];
    for (let dz = -KEMRATH_VINES.depth / 2 + 1; dz <= KEMRATH_VINES.depth / 2 - 1; dz += 2.2) {
      for (let dx = -KEMRATH_VINES.width / 2 + 1; dx <= KEMRATH_VINES.width / 2 - 1; dx += 1.4) {
        const x = KEMRATH_VINES.x + dx, z = KEMRATH_VINES.z + dz;
        vines.push({ x, z, s: range(.75, 1.05) });
        if (Math.round(dx / 1.4) % 4 === 0) stakes.push({ x: x + .35, z });
      }
    }
    const batch = new THREE.InstancedMesh(round, material('#4f7134', { flatShading: true }), vines.length);
    vines.forEach((vine, i) => {
      dummy.position.set(vine.x, gy(vine.x, vine.z) + .72 * vine.s, vine.z); dummy.rotation.set(0, range(0, 6.28), 0);
      dummy.scale.set(.62 * vine.s, .5 * vine.s, .44 * vine.s); dummy.updateMatrix(); batch.setMatrixAt(i, dummy.matrix);
    });
    batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
    for (const stake of stakes) post(material('#6c5843'), stake.x, gy(stake.x, stake.z) + .65, stake.z, .04, 1.3, group);
    metrics.vines = vines.length; metrics.batches++;
  }

  // -------------------------------------------------------------------------
  // Upper Olveth: sheep grass and a fold
  // -------------------------------------------------------------------------
  /** A dry-stone fold on the pasture, open to the uphill side - where the sheep come down from. */
  {
    const fold = { x: OLVETH_PASTURE.x + 12, z: OLVETH_PASTURE.z + 8, r: 6.5 };
    const drystone = material('#8b8778', { flatShading: true });
    for (let i = 0; i < 26; i++) {
      const a = i / 26 * Math.PI * 2;
      if (Math.abs(Math.sin(a)) < .2 && Math.cos(a) < 0) continue;   // the gate, on the south side
      const x = fold.x + Math.sin(a) * fold.r, z = fold.z + Math.cos(a) * fold.r;
      pebble(drystone, x, gy(x, z) + .38, z, .95, .55, .7, group).rotation.y = a;
      push({ x, z, r: .6, kind: 'olveth-fold' });
    }
    metrics.buildings++;
  }

  // -------------------------------------------------------------------------
  // The stone in the cuts
  // -------------------------------------------------------------------------
  /**
   * "The valley walls reveal layer upon layer of sedimentary stone, tilted and folded... limestone
   * and shale and sandstone turned on their sides... Coal follows - black seams visible in the
   * valley walls and hillside cuts." A face of it is courses of three stones in turn, tilted as
   * the range tilted them, set into the wall with its face to the gorge; one in three shows coal.
   */
  const limestone = material('#c9c2ad', { flatShading: true }), shale = material('#6b6862', { flatShading: true });
  const sandstone = material('#b39067', { flatShading: true }), coal = material('#1d1c1b', { flatShading: true });
  function outcrop(x, z, yaw, width, height, { withCoal = false, tilt = .28 } = {}) {
    const g = new THREE.Group(); g.position.set(x, gy(x, z) - .6, z); g.rotation.y = yaw; group.add(g);
    const courses = [limestone, shale, sandstone, shale, limestone, sandstone];
    let y = 0, k = 0;
    while (y < height) {
      const thick = range(.45, 1.1), mat = withCoal && k === 2 ? coal : courses[k % courses.length];
      const course = box(mat, range(-.3, .3), y + thick / 2, range(-.25, .25), width * range(.82, 1.05), thick * (mat === coal ? .45 : 1), range(1.6, 2.6), g);
      // The outcrop's own collider stands for all of it; a course is not a rail to be walked into.
      course.rotation.z = tilt; course.userData.passable = true; y += thick * .92; k++;
    }
    push({ x, z, r: Math.max(1.2, width * .45), kind: 'lotharn-outcrop' });
    metrics.outcrops++;
    return g;
  }
  {
    const line = STONEGATE.line;
    let placed = 0;
    for (let i = 3; i < line.points.length - 2; i += 3) {
      const a = line.points[i - 1], b = line.points[i + 1], dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz) || 1;
      const nx = -dz / length, nz = dx / length;
      for (const side of [-1, 1]) {
        const reach = STONEGATE.half + range(4, 9), x = line.points[i].x + nx * reach * side, z = line.points[i].z + nz * reach * side;
        if (!own(x, z)) continue;
        const rise = gy(x, z) - stonegateFloor(nearestOn(line, x, z).along);
        if (rise < 2.5 || lotharnOpen(x, z, 1)) continue;
        outcrop(x, z, Math.atan2(-nx * side, -nz * side), range(5, 9), Math.min(7, rise + 1.2), { withCoal: placed % 3 === 1 });
        placed++;
      }
    }
    // The Before-Sea: shells in the limestone at the gorge's head, where the road first meets the
    // stone. "Exposed ancient shells are touched with water and named as witnesses of a time
    // before the mountains rose."
    const head = line.points[5], shellMaterial = material('#d9d1bd', { flatShading: true });
    const shelf = outcrop(head.x - 16, head.z + 2, Math.PI * .5, 6, 3.4, { tilt: .12 });
    const shell = new THREE.TorusGeometry(.09, .035, 5, 9);
    for (let i = 0; i < 11; i++) mesh(shell, shellMaterial, range(-2.2, 2.2), range(1, 3), 1.05, 1, 1, 1, shelf).rotation.set(0, 0, range(0, 6.28));
  }

  // -------------------------------------------------------------------------
  // The pass inn
  // -------------------------------------------------------------------------
  {
    const I = PASS_INN, g = new THREE.Group(); g.name = I.name;
    g.position.set(I.x, I.level, I.z); g.rotation.y = I.facing; group.add(g);
    const W = I.width, D = I.depth;
    const rubble = material('#8f887a'), plaster = material('#e4dcc6'), timber = material('#4b3a2b'), slate = material('#5a5d61');
    const doorWood = material('#5a4130'), dark = material('#2a2724'), trough = material('#7d7a70');
    box(rubble, 0, 1.6, 0, W, 3.2, D, g);                       // stone below: byre, store, the common room
    box(plaster, 0, 4.6, 0, W - .2, 2.8, D - .2, g);           // timber frame above: the rooms
    // The frame: posts, a rail at the floor and under the eaves, and the braces between.
    for (const side of [-1, 1]) {
      const face = side * (D / 2 - .06);
      for (let px = -W / 2 + .2; px <= W / 2 - .2 + 1e-6; px += (W - .4) / 5) box(timber, px, 4.6, face, .2, 2.8, .12, g);
      box(timber, 0, 3.28, face, W - .1, .2, .14, g); box(timber, 0, 5.92, face, W - .1, .2, .14, g);
      for (let k = 0; k < 5; k += 2) {
        const px = -W / 2 + .2 + (k + .5) * (W - .4) / 5, brace = box(timber, px, 4.6, face, .14, 2.9, .1, g);
        brace.rotation.z = k % 4 ? .62 : -.62;
      }
    }
    // The roof, steep, and a stone chimney at the gable.
    const roof = mesh(roofGeometry(D + 1, W + 1.1, 3.2), slate, 0, 6.02, 0, 1, 1, 1, g); roof.rotation.y = Math.PI / 2;
    box(rubble, W / 2 - 1, 7.1, 0, 1.1, 3.6, 1.1, g);
    // The door and windows face the road; shutters on the upper rooms.
    box(doorWood, 0, 1.15, D / 2 + .03, 1.4, 2.3, .1, g);
    for (const px of [-3.4, 3.4]) box(dark, px, 1.7, D / 2 + .03, 1, .9, .08, g);
    for (const px of [-3.2, 0, 3.2]) { box(dark, px, 4.7, D / 2 + .05, .8, .9, .06, g); box(timber, px - .6, 4.7, D / 2 + .07, .32, 1, .05, g); box(timber, px + .6, 4.7, D / 2 + .07, .32, 1, .05, g); }
    // Walls are walls: one line of colliders round the building.
    const at = (lx, lz) => { const c = Math.cos(I.facing), s = Math.sin(I.facing); return { x: I.x + lx * c + lz * s, z: I.z - lx * s + lz * c }; };
    for (let lx = -W / 2; lx <= W / 2 + 1e-6; lx += 1.3) for (const lz of [-D / 2, D / 2]) { const p = at(lx, lz); push({ x: p.x, z: p.z, r: .7, kind: 'pass-inn' }); }
    for (let lz = -D / 2; lz <= D / 2 + 1e-6; lz += 1.3) for (const lx of [-W / 2, W / 2]) { const p = at(lx, lz); push({ x: p.x, z: p.z, r: .7, kind: 'pass-inn' }); }
    const c = at(0, 0); push({ x: c.x, z: c.z, r: Math.min(W, D) * .45, kind: 'pass-inn' });
    // Across the yard: the mule shed, open on its yard side, and the trough.
    // The shed stands against the inn's end away from the road, open to the yard.
    const shed = new THREE.Group(); shed.position.set(-W / 2 - 3.4, 0, 1); shed.rotation.y = Math.PI / 2; g.add(shed);
    for (const sx of [-3, 3]) for (const sz of [-1.8, 1.8]) {
      post(timber, sx, 1.35, sz, .14, 2.7, shed);
      const p = at(-W / 2 - 3.4 - sz, 1 + sx); push({ x: p.x, z: p.z, r: .3, kind: 'pass-inn-shed' });
    }
    const shedRoof = mesh(roofGeometry(4.6, 7, 1.1), material('#6b5846'), 0, 2.7, 0, 1, 1, 1, shed); shedRoof.rotation.y = Math.PI / 2;
    box(trough, W / 2 + 2.2, .35, D / 2 + 4, .9, .7, 2.6, g);
    box(material('#50707a'), W / 2 + 2.2, .66, D / 2 + 4, .7, .04, 2.4, g);
    { const p = at(W / 2 + 2.2, D / 2 + 4); push({ x: p.x, z: p.z, r: 1.1, kind: 'pass-inn-trough' }); }
    // The waystone at the yard's edge by the road, where the col is highest.
    const stone = pebble(material('#9c978a', { flatShading: true }), -W / 2 + 1, 1, D / 2 + 4.5, .45, 1.1, .35, g);
    stone.rotation.y = .3;
    { const p = at(-W / 2 + 1, D / 2 + 4.5); push({ x: p.x, z: p.z, r: .5, kind: 'pass-waystone' }); }
    metrics.buildings += 2;
  }

  // -------------------------------------------------------------------------
  // The iron workings
  // -------------------------------------------------------------------------
  {
    const M = IRON_WORKINGS, g = new THREE.Group(); g.name = M.name;
    g.position.set(M.x, M.level, M.z); g.rotation.y = M.facing; group.add(g);
    const timber = material('#4e3b2a'), dark = material('#141312'), rail = material('#4a4744'), cart = material('#5b4634');
    // The portal: set into the hill at the back of the bench, square-timbered, black inside.
    const back = -M.bench + .6;
    for (const sx of [-1.25, 1.25]) box(timber, sx, 1.25, back, .32, 2.5, .32, g);
    box(timber, 0, 2.55, back, 3.2, .34, .4, g);
    box(dark, 0, 1.2, back - .25, 2.2, 2.4, .2, g).userData.passable = true;
    // Rails out across the bench to the tip, and a cart on them.
    for (const sx of [-.45, .45]) box(rail, sx, .06, back + M.bench * .9, .08, .08, M.bench * 1.8, g);
    for (let k = 0; k < 8; k++) box(timber, 0, .03, back + 1 + k * 1.9, 1.3, .06, .2, g);
    box(cart, 0, .62, back + 6, 1.1, .7, 1.6, g);
    pebble(material('#5a3a2c', { flatShading: true }), 0, 1.02, back + 6, .5, .28, .7, g);   // ore in it, red-brown
    for (const sx of [-.58, .58]) for (const sz of [-.5, .5]) post(dark, sx, .22, back + 6 + sz, .16, .08, g).rotation.z = Math.PI / 2;
    // The spoil tipped over the bench's lip, down the wall toward the floor.
    const spoil = material('#4d4640', { flatShading: true });
    for (let k = 0; k < 7; k++) pebble(spoil, range(-3, 3), -.4 - k * .5, M.bench + 1 + k * 1.3, range(1.4, 2.4), range(.7, 1.1), range(1.2, 2), g);
    // The seam beside the portal: stone in courses, and the coal black in it.
    const seam = outcrop(M.x + 5.5, M.z - M.bench + 1.4, M.facing, 5, 4, { withCoal: true, tilt: .2 });
    seam.position.y = M.level - .4;
    // "Returned to the entrance with bread, salt, and a spoken promise": the ledge by the portal.
    box(material('#7b776c'), -2.1, .85, back + .5, .8, .12, .5, g);
    pebble(material('#5a3a2c', { flatShading: true }), -2.3, 1.0, back + .5, .16, .12, .14, g);
    pebble(material('#a07448'), -2.0, 1.0, back + .45, .18, .1, .13, g);
    pebble(material('#f1efe8'), -1.8, .96, back + .58, .08, .05, .08, g);
    const at = (lx, lz) => { const c = Math.cos(M.facing), s = Math.sin(M.facing); return { x: M.x + lx * c + lz * s, z: M.z - lx * s + lz * c }; };
    for (const sx of [-1.25, 1.25]) { const p = at(sx, back); push({ x: p.x, z: p.z, r: .35, kind: 'iron-workings' }); }
    { const p = at(0, back + 6); push({ x: p.x, z: p.z, r: .9, kind: 'iron-workings' }); }
    metrics.buildings++;
  }

  function update(time) {
    waterMaterial.uniforms.time.value = time;
    whiteMaterial.uniforms.time.value = time;
  }
  return { group, metrics, update };
}
