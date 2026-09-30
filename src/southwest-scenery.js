import * as THREE from 'three';
import { hexOwnerAt, REGION_CELLS, relief, landDistance } from './region-world.js';
import { WORLD_SCALE } from './world-scale.js';
import { VAELLIR, ALEZHOR_WATER, SOUTHWEST_RIVERS, westBareGround } from './west-regions.js';
import { WEST_PROFILES, westWaterSurface } from './west-ground.js';
import {
  SOUTHWEST_REGIONS, SOUTHWEST_NORTH_REGIONS, MEROSHE_REGIONS, GANESH_WASHES, GANESH_PLAIN_CHANNELS, GANESH_DEPRESSIONS,
  MEROSHE_SALT, MEROSHE_DUNES,
  southwestAridity, southwestClear, ganeshLie, ganeshDamp, inDepression, nearestWash,
  merosheBench, merosheFan, merosheCorridor, merosheErg, merosheFog, merosheVarnish, duneProfile, onSaltPan, regionShare,
} from './southwest-world.js';

/**
 * What the southwestern block looks like where the ground alone is not enough: a desert that has
 * almost nothing on it, a plain whose only green is in its hollows, a steppe of bunch grass, one
 * river with a wood along it, and one hex of forest at the top of the whole thing.
 *
 * **This file is mostly a statement about how little there is.** Eighty-one of the hundred and
 * seven hexes are `BWh`, hot desert, and the honest reading of hot desert is bare ground: the Oves
 * Desert's own report made that argument for `BSh` steppe and this country is a full climate step
 * drier. So what is drawn is:
 *
 *  - **The Ganesh Desert**: deep-rooted perennial scrub spaced far enough apart to walk between, and
 *    in a dry year that is nearly all of it. "The above-ground growth is deceptive: a plant that
 *    presents as a knee-high shrub in good years may have a root system extending several meters in
 *    all directions" - so the plants are small and far apart and the ground between them is the
 *    point. Gravel and grit wherever the wind has swept the sediment off (`ganeshLie`), a skin of
 *    fine pale sediment where it has gathered, a stubble of bleached annual seed-heads where the
 *    wet-year flush would be, coarse gravel on the two washes' floors, and one band of green scrub
 *    on the damp reach. **No dune and no sand sea**: the lore's surface is "a thin layer of fine
 *    sediment over the rocky substrate", which is a desert pavement and not an erg.
 *  - **The Ganesh Plain**: bunch grass contracted into the eight depressions, which is where it goes
 *    in a drought phase - "the perennial grasses contract to the water-concentration points, the
 *    annuals disappear" - with scrub and bare clay on the open ground between them, and the
 *    south-eastern corner green because the climate there is `Csa` and not `BWh`.
 *  - **West Pyros**: semi-arid bunch grass in tussocks over the steppe columns, thinning west into
 *    desert scrub on the `BWh` ones against Navarth, and a gallery of poplar, willow and tamarisk
 *    along the Vaellir, which is the only wood in the block outside Navarth's one forest hex. On a
 *    plain this open that line of trees is visible from a mile and is how the river is found.
 *  - **Navarth**: bare scrub on the plateau with the stone showing grey along the tops of the
 *    swells, and at the north-eastern tip **the north wood** - oak and pine standing well apart on
 *    the one `forest` hex the atlas gives this quarter, where the air turns `Csb` and the Ibenwood
 *    begins.
 *
 * Everything is sorted by **how dry the air is** (`southwestAridity`, a real gradient across all
 * four countries, where the Oves had one code and no gradient at all) and by **what the ground is
 * made of** underneath - which pocket the wind has left sediment in, which hollow holds the water.
 *
 * Nothing here is anybody's: no field, no terrace, no well, no waystation, no cairn on a caravan
 * route, no fire kept where a fumarole would be. Everything is placed on these four countries' own
 * hexes (`hexOwnerAt`), from one seeded stream of its own drawn after the Mithala's, so nothing
 * already built anywhere else moves by a centimetre for it.
 */
export function createSouthwestScenery(kit) {
  const { root, material, groundHeight, colliders, dummy, color, round } = kit;
  const group = new THREE.Group(); group.name = 'Southwest scenery'; root.add(group);
  let seed = 8113507;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const range = (a, b) => a + random() * (b - a);
  const smooth = (a, b, x) => { const v = Math.max(0, Math.min(1, (x - a) / (b - a))); return v * v * (3 - 2 * v); };
  const metrics = { water: 0, blockers: 0, reeds: 0, gravel: 0, boulders: 0, pavement: 0, stones: 0, tufts: 0, scrub: 0, stubble: 0, trees: 0, wood: 0,
    rock: 0, cobble: 0, sand: 0, reg: 0, salt: 0, lichen: 0, thorn: 0, shingle: 0 };
  const gy = (x, z) => groundHeight(x, z);
  const OWN = new Set(SOUTHWEST_REGIONS);
  const own = (x, z) => OWN.has(hexOwnerAt(x, z));
  const where = (x, z) => hexOwnerAt(x, z);
  const plantable = (x, z, margin) => own(x, z) && !westBareGround(x, z, margin)
    && westWaterSurface(x, z) === null && !southwestClear(x, z, margin);

  // -------------------------------------------------------------------------
  // The water: two courses in a hundred and seven hexes
  // -------------------------------------------------------------------------
  /**
   * The Vaellir is a big lowland river carrying silt off a plateau, so it is greener and heavier
   * than the Oveth; the Alezhor Water is a small clear one out of grass country. One shader, two
   * tints, and the waves are the western shader's.
   */
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } }, side: THREE.DoubleSide,
    vertexShader: 'varying vec3 p; void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform float time; varying vec3 p; void main(){float w=sin(p.x*.36-time*1.25+p.z*1.02)*sin(p.x*.15+p.z*1.18);vec3 c=vec3(.33,.42,.36)+vec3(.16,.17,.14)*pow(max(w,0.),8.);gl_FragColor=vec4(c,1.);}',
  });
  function ribbon(samples, name) {
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
      const sheet = new THREE.Mesh(geometry, waterMaterial);
      sheet.name = name; group.add(sheet); metrics.water++;
      run = [];
    };
    for (const sample of samples) {
      const y = westWaterSurface(sample.x, sample.z);
      if (y === null) { flush(); continue; }
      run.push({ ...sample, y });
    }
    flush();
  }
  for (const course of SOUTHWEST_RIVERS) ribbon(WEST_PROFILES.get(course.id), course.name);

  /**
   * **The Vaellir is a wall below its ford**, as every deep western river is, and it is the one
   * thing in this block that stops anybody. Its first quarter is `small` on the atlas and is waded
   * over gravel; from the first `medium` edge to the sea there is no crossing on foot and nothing to
   * cross to, because East Pyros is not built. The Alezhor Water carries none: it is small over all
   * eight of its edges and is waded anywhere, which is the only reason Navarth and the Ganesh Desert
   * are joined round the north at all.
   */
  for (const sample of WEST_PROFILES.get(VAELLIR.id)) {
    if (sample.ford) continue;
    const step = Math.max(1, Math.round(sample.half / 3.2)), radius = sample.half / (step + .5) + 1.4;
    for (let k = -step; k <= step; k++) {
      const offset = sample.half * (k / (step + .5));
      colliders.push({ x: sample.x + sample.nx * offset, z: sample.z + sample.nz * offset, r: radius, kind: 'west-deep-water' });
      metrics.blockers++;
    }
  }

  // -------------------------------------------------------------------------
  // Stone: the washes' floors, the desert pavement, the swells' tops
  // -------------------------------------------------------------------------
  const stoneMaterial = material('#ffffff', { flatShading: true });
  function stoneBatch(spots, name, tint, lift = .12) {
    if (!spots.length) return;
    const batch = new THREE.InstancedMesh(round, stoneMaterial, spots.length);
    spots.forEach((spot, index) => {
      dummy.position.set(spot.x, gy(spot.x, spot.z) + spot.s * lift, spot.z);
      dummy.rotation.set(range(-.16, .16), spot.rot, range(-.16, .16));
      dummy.scale.set(spot.s, spot.s * (spot.flat ?? range(.25, .45)), spot.s * range(.7, 1.25)); dummy.updateMatrix();
      batch.setMatrixAt(index, dummy.matrix); batch.setColorAt(index, tint(spot));
    });
    batch.name = name; batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
  }

  /**
   * **The two washes and the three channels**: coarse gravel on a wash's floor, because a bed that
   * runs hard once in five years leaves the coarse part of its load where the water stopped; and on
   * the Ganesh Plain's channels, fine pale clay plates instead, because the plain's soil is clay
   * and its channels are "too diffuse to qualify as rivers" and never carried a stone in their
   * lives. Nothing grows on either floor, which is what `southwestClear` says.
   */
  const washGravel = [], washBoulders = [], channelSilt = [];
  for (const wash of GANESH_WASHES) {
    for (let i = 1; i < wash.line.length; i++) {
      const a = wash.line[i - 1], b = wash.line[i], length = Math.hypot(b.x - a.x, b.z - a.z);
      const nx = -(b.z - a.z) / length, nz = (b.x - a.x) / length;
      for (let d = 0; d < length; d += 1.2) for (let k = 0; k < 3; k++) {
        const t = d / length, across = range(-wash.half - .8, wash.half + .8);
        const x = a.x + (b.x - a.x) * t + nx * across, z = a.z + (b.z - a.z) * t + nz * across;
        if (!own(x, z) || !southwestClear(x, z, .8)) continue;
        washGravel.push({ x, z, s: range(.13, .44), rot: random() * 6.28 });
      }
      for (let d = 0; d < length; d += 6) {
        const t = d / length, side = random() < .5 ? -1 : 1, across = side * range(0, wash.half * 1.6);
        const x = a.x + (b.x - a.x) * t + nx * across, z = a.z + (b.z - a.z) * t + nz * across;
        if (!own(x, z) || !nearestWash(x, z)) continue;
        washBoulders.push({ x, z, s: range(.35, .95), rot: random() * 6.28, flat: range(.45, .8) });
      }
    }
  }
  for (const channel of GANESH_PLAIN_CHANNELS) {
    for (let i = 1; i < channel.line.length; i++) {
      const a = channel.line[i - 1], b = channel.line[i], length = Math.hypot(b.x - a.x, b.z - a.z);
      const nx = -(b.z - a.z) / length, nz = (b.x - a.x) / length;
      for (let d = 0; d < length; d += 2.2) for (let k = 0; k < 2; k++) {
        const t = d / length, across = range(-channel.half, channel.half);
        const x = a.x + (b.x - a.x) * t + nx * across, z = a.z + (b.z - a.z) * t + nz * across;
        if (!own(x, z) || !southwestClear(x, z, .6)) continue;
        channelSilt.push({ x, z, s: range(.18, .46), rot: random() * 6.28, flat: range(.07, .15) });
      }
    }
  }
  stoneBatch(washGravel, 'Ganesh wash gravel', () => color.set('#645d4e').offsetHSL(0, range(-.03, .03), range(-.06, .06)), .07);
  stoneBatch(washBoulders, 'Ganesh wash boulders', () => color.set('#6b6355').offsetHSL(0, range(-.03, .03), range(-.05, .05)), .2);
  stoneBatch(channelSilt, 'Ganesh Plain channel clay', () => color.set('#6d6553').offsetHSL(0, range(-.02, .02), range(-.05, .05)), .03);
  metrics.gravel += washGravel.length + channelSilt.length; metrics.boulders += washBoulders.length;

  /** The Vaellir's bed is gravel over its ford, which is the only part of it anybody stands in. */
  const fordGravel = [];
  for (const sample of WEST_PROFILES.get(VAELLIR.id)) {
    if (!sample.ford) continue;
    for (let i = 0; i < 3; i++) {
      const side = random() < .5 ? -1 : 1, offset = range(0, sample.half + 3);
      const x = sample.x + sample.nx * offset * side, z = sample.z + sample.nz * offset * side;
      if (!own(x, z)) continue;
      fordGravel.push({ x, z, s: range(.15, .5), rot: random() * 6.28, flat: range(.3, .55) });
    }
  }
  stoneBatch(fordGravel, 'Vaellir bed gravel', () => color.set('#6d655b').offsetHSL(0, range(-.03, .03), range(-.05, .05)), .1);
  metrics.gravel += fordGravel.length;

  // -------------------------------------------------------------------------
  // Reed, and there is very little of it
  // -------------------------------------------------------------------------
  const reedGeometry = (() => {
    const positions = [], normals = [];
    for (let blade = 0; blade < 6; blade++) {
      const a = blade * 1.05, lean = .10 + blade % 3 * .05;
      const bx = Math.cos(a) * .06, bz = Math.sin(a) * .06, w = .02, h = .8 + (blade % 3) * .35;
      const cx = Math.cos(a + Math.PI / 2) * w, cz = Math.sin(a + Math.PI / 2) * w;
      positions.push(bx - cx, 0, bz - cz, bx + cx, 0, bz + cz, bx + Math.cos(a) * lean, h, bz + Math.sin(a) * lean);
      for (let i = 0; i < 3; i++) normals.push(0, 1, 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geometry;
  })();
  const bladeMaterial = material('#ffffff', { side: THREE.DoubleSide });
  function reedBatch(spots, name) {
    if (!spots.length) return;
    const batch = new THREE.InstancedMesh(reedGeometry, bladeMaterial, spots.length);
    spots.forEach((spot, index) => {
      dummy.position.set(spot.x, gy(spot.x, spot.z) + .02, spot.z);
      dummy.rotation.set(0, spot.rot, 0); dummy.scale.set(spot.s, spot.s * range(.85, 1.35), spot.s); dummy.updateMatrix();
      batch.setMatrixAt(index, dummy.matrix);
      batch.setColorAt(index, color.setHSL(range(.13, .21), range(.22, .36), range(.24, .36)));
    });
    batch.name = name; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
    metrics.reeds += spots.length;
  }
  const reeds = [];
  for (const course of SOUTHWEST_RIVERS) for (const sample of WEST_PROFILES.get(course.id)) {
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
      const offset = sample.half + range(.2, 3.2);
      const x = sample.x + sample.nx * offset * side, z = sample.z + sample.nz * offset * side;
      if (!own(x, z) || westWaterSurface(x, z) !== null) continue;
      reeds.push({ x, z, s: range(.6, 1.35), rot: random() * 6.28 });
    }
  }
  reedBatch(reeds, 'Southwest reed');

  // -------------------------------------------------------------------------
  // What grows
  // -------------------------------------------------------------------------
  const trunkGeometry = new THREE.CylinderGeometry(.16, .28, 1, 6);
  const crownGeometry = new THREE.IcosahedronGeometry(1, 0);
  const barkMaterial = material('#6b5942'), leafMaterial = material('#ffffff', { flatShading: true });
  function treeBatch(trees, name, tint, kind) {
    if (!trees.length) return;
    const trunks = new THREE.InstancedMesh(trunkGeometry, barkMaterial, trees.length);
    const crowns = new THREE.InstancedMesh(crownGeometry, leafMaterial, trees.length * 3);
    let at = 0;
    trees.forEach((tree, index) => {
      const y = gy(tree.x, tree.z), height = tree.h * tree.s;
      dummy.position.set(tree.x, y + height * tree.bole * .5, tree.z); dummy.rotation.set(range(-.05, .05), tree.rot, range(-.05, .05));
      dummy.scale.set(tree.s * tree.girth, height * tree.bole, tree.s * tree.girth); dummy.updateMatrix();
      trunks.setMatrixAt(index, dummy.matrix);
      colliders.push({ x: tree.x, z: tree.z, r: .42 * tree.s * tree.girth, kind });
      for (let lobe = 0; lobe < 3; lobe++) {
        const a = tree.rot + lobe * 2.1, spread = lobe === 2 ? 0 : height * tree.spread;
        dummy.position.set(tree.x + Math.sin(a) * spread, y + height * (lobe === 2 ? tree.top : tree.top - .16), tree.z + Math.cos(a) * spread);
        dummy.rotation.set(range(-.2, .2), a, range(-.18, .18));
        dummy.scale.set(height * tree.wide, height * tree.deep, height * tree.wide); dummy.updateMatrix();
        crowns.setMatrixAt(at, dummy.matrix); crowns.setColorAt(at++, tint(tree));
      }
    });
    trunks.name = `${name} trunks`; crowns.name = `${name} crowns`;
    for (const batch of [trunks, crowns]) { batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch); }
    metrics.trees += trees.length;
  }
  /** A low bush of three lobes: desert scrub, the plain's saltbush and the damp reach's green are all this shape. */
  function bushBatch(bushes, name, tint, collide = null) {
    if (!bushes.length) return;
    const batch = new THREE.InstancedMesh(round, leafMaterial, bushes.length * 3);
    let at = 0;
    for (const bush of bushes) {
      const y = gy(bush.x, bush.z);
      for (let lobe = 0; lobe < 3; lobe++) {
        const a = bush.rot + lobe * 2.1, spread = lobe === 2 ? 0 : .42 * bush.s;
        dummy.position.set(bush.x + Math.sin(a) * spread, y + bush.s * bush.h * (lobe === 2 ? .62 : .42), bush.z + Math.cos(a) * spread);
        dummy.rotation.set(range(-.16, .16), a, range(-.16, .16));
        dummy.scale.set(bush.s * .7, bush.s * bush.h * .5, bush.s * .66); dummy.updateMatrix();
        batch.setMatrixAt(at, dummy.matrix); batch.setColorAt(at++, tint(bush));
      }
      if (collide) colliders.push({ x: bush.x, z: bush.z, r: collide * bush.s, kind: 'southwest-scrub' });
    }
    batch.name = name; batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
  }
  const tuftGeometry = (() => {
    const positions = [], normals = [];
    for (let blade = 0; blade < 5; blade++) {
      const a = blade * 1.26, bx = Math.cos(a) * .13, bz = Math.sin(a) * .13, w = .05, h = .26 + (blade % 3) * .1;
      const cx = Math.cos(a + Math.PI / 2) * w, cz = Math.sin(a + Math.PI / 2) * w;
      positions.push(bx - cx, 0, bz - cz, bx + cx, 0, bz + cz, bx + Math.cos(a) * .1, h, bz + Math.sin(a) * .1);
      for (let j = 0; j < 3; j++) normals.push(0, 1, 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geometry;
  })();
  function tuftBatch(tufts, name, tint) {
    if (!tufts.length) return;
    const batch = new THREE.InstancedMesh(tuftGeometry, bladeMaterial, tufts.length);
    tufts.forEach((tuft, index) => {
      dummy.position.set(tuft.x, gy(tuft.x, tuft.z) + .02, tuft.z);
      dummy.rotation.set(0, tuft.rot, 0); dummy.scale.set(tuft.s * tuft.wide, tuft.s, tuft.s * tuft.wide); dummy.updateMatrix();
      batch.setMatrixAt(index, dummy.matrix); batch.setColorAt(index, tint(tuft));
    });
    batch.name = name; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
    metrics.tufts += tufts.length;
  }
  function stubbleBatch(spots, name) {
    if (!spots.length) return;
    const batch = new THREE.InstancedMesh(tuftGeometry, bladeMaterial, spots.length);
    spots.forEach((spot, index) => {
      dummy.position.set(spot.x, gy(spot.x, spot.z) + .02, spot.z);
      dummy.rotation.set(0, spot.rot, 0); dummy.scale.set(spot.s * .5, spot.s * 1.5, spot.s * .5); dummy.updateMatrix();
      batch.setMatrixAt(index, dummy.matrix);
      batch.setColorAt(index, color.set('#7b7259').offsetHSL(range(-.015, .015), range(-.06, .04), range(-.05, .06)));
    });
    batch.name = name; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
    metrics.stubble += spots.length;
  }

  /**
   * **The Vaellir's gallery, and only along the water.** Poplar, willow and tamarisk two and three
   * trees deep on the West Pyros bank and nothing at all on the far one, because the far one is
   * East Pyros and nothing of this build is written outside these four countries' hexes. On a plain
   * this open that is a dark line running from the northern horizon to the southern with nothing
   * behind it, and it is how a traveler finds the river from half a mile out.
   *
   * The **Alezhor Water** gets a thinner one - tamarisk and scrub rather than poplar - because it
   * crosses a desert rather than running through farmland, and the lore's own account of a river
   * like this one is that it gains nothing on the way: what it has, it brought.
   */
  const gallery = [], tamarisk = [];
  for (const course of SOUTHWEST_RIVERS) for (const sample of WEST_PROFILES.get(course.id)) {
    const small = course.id === ALEZHOR_WATER.id;
    if (sample.index % (small ? 4 : 2)) continue;
    for (let i = 0; i < (small ? 2 : 4); i++) {
      const side = random() < .5 ? -1 : 1, offset = sample.half + range(2.4, small ? 7 : 13);
      const x = sample.x + sample.nx * offset * side, z = sample.z + sample.nz * offset * side;
      if (!plantable(x, z, 2.2)) continue;
      // Thicker where the air is wetter: the Vaellir's lower half runs toward the Mediterranean tip
      // and its head toward the desert columns, and the gallery follows that rather than the river.
      const soil = small ? .26 : .34 + (1 - southwestAridity(x, z)) * .78;
      if (random() > soil) continue;
      const shrub = small || random() < .40;
      if (shrub) {
        if (tamarisk.some(t => Math.hypot(t.x - x, t.z - z) < 4.2) || gallery.some(t => Math.hypot(t.x - x, t.z - z) < 4)) continue;
        tamarisk.push({ x, z, s: range(.8, 1.15), h: range(3.8, 5.4), rot: random() * 6.28, girth: .78, bole: .5, top: .86, spread: .15, wide: .30, deep: .30 });
      } else {
        if (gallery.some(t => Math.hypot(t.x - x, t.z - z) < 5.4) || tamarisk.some(t => Math.hypot(t.x - x, t.z - z) < 4)) continue;
        const poplar = random() < .55;
        gallery.push({ x, z, poplar, s: range(.95, 1.35), h: poplar ? range(12, 16) : range(7, 10), rot: random() * 6.28,
          girth: poplar ? .8 : 1.15, bole: poplar ? .55 : .42, top: poplar ? .72 : .78, spread: poplar ? .07 : .2,
          wide: poplar ? .17 : .34, deep: poplar ? .5 : .26 });
      }
    }
  }
  metrics.gallery = gallery.length + tamarisk.length;
  treeBatch(gallery, 'Vaellir gallery', tree => tree.poplar
    ? color.set('#4e6536').offsetHSL(range(-.02, .02), range(-.05, .05), range(-.04, .06))
    : color.set('#5f6f49').offsetHSL(range(-.02, .02), range(-.05, .05), range(-.04, .05)), 'southwest-tree');
  treeBatch(tamarisk, 'Southwest tamarisk', () => color.set('#71785e').offsetHSL(range(-.02, .02), range(-.05, .04), range(-.05, .06)), 'southwest-tree');

  /**
   * **The north wood**, on the one `forest` hex the atlas gives this quarter: (-24,116), `Csb`, at
   * Navarth's north-eastern tip, where the South and East Ibenwood begin over the border. Oak and
   * pine standing well apart rather than closed canopy, because this is the forest's dry southern
   * margin and not its interior, and the flora document says the overlap with the Ibenwood catalogue
   * "thins sharply" where the rain does. It is one hex, so it is a feature and not a band - the way
   * the West Lotharn's one `Dfa` hex became its cold head - and it stops at its own hex edge, where
   * the ground goes `BWh` and the wood simply stops.
   */
  const wood = [];
  {
    const hex = (REGION_CELLS.Navarth ?? []).find(cell => cell.terrain === 'forest');
    if (hex) for (let i = 0; i < 620; i++) {
      const x = hex.x + range(-54, 54), z = hex.z + range(-58, 58);
      if (!plantable(x, z, 2.5) || where(x, z) !== 'Navarth') continue;
      // Thinning outward: the middle of the hex is wood and its southern edge is scrub with a tree in it.
      const dry = southwestAridity(x, z);
      if (random() > (1 - dry) * 1.25) continue;
      if (wood.some(t => Math.hypot(t.x - x, t.z - z) < 6.5)) continue;
      const pine = random() < .42;
      wood.push({ x, z, pine, s: range(.95, 1.35), h: pine ? range(12, 17) : range(9, 13), rot: random() * 6.28,
        girth: pine ? .72 : 1.1, bole: pine ? .62 : .44, top: pine ? .76 : .74, spread: pine ? .06 : .22,
        wide: pine ? .2 : .36, deep: pine ? .46 : .3 });
    }
  }
  treeBatch(wood, 'Navarth north wood', tree => tree.pine
    ? color.set('#3b5135').offsetHSL(range(-.02, .02), range(-.05, .05), range(-.04, .05))
    : color.set('#4c6037').offsetHSL(range(-.02, .02), range(-.05, .05), range(-.04, .06)), 'southwest-tree');
  metrics.wood = wood.length;

  /**
   * **The damp reach**: a band of green scrub standing in the south wash's dry bed, twice the size
   * of anything within a mile of it and with nothing to drink anywhere near. It is the lore's "some
   * below it" and the only green in the Ganesh, and it is the Oves Desert's damp reach again for
   * exactly the same reason.
   */
  const dampScrub = [];
  {
    const wash = GANESH_WASHES.find(w => w.id === 'south-wash');
    for (let i = 1; i < wash.line.length; i++) {
      const a = wash.line[i - 1], b = wash.line[i], length = Math.hypot(b.x - a.x, b.z - a.z);
      const nx = -(b.z - a.z) / length, nz = (b.x - a.x) / length;
      for (let d = 0; d < length; d += 1.1) for (let k = 0; k < 2; k++) {
        const t = d / length, across = range(-wash.half * 1.6, wash.half * 1.6);
        const x = a.x + (b.x - a.x) * t + nx * across, z = a.z + (b.z - a.z) * t + nz * across;
        const damp = ganeshDamp(x, z);
        if (damp < .25 || !own(x, z) || random() > damp * .55) continue;
        if (dampScrub.some(s => Math.hypot(s.x - x, s.z - z) < 1.6)) continue;
        dampScrub.push({ x, z, s: range(.55, 1.05), h: range(1.0, 1.45), rot: random() * 6.28 });
      }
    }
  }
  bushBatch(dampScrub, 'Ganesh damp-reach scrub', () => color.set('#415934').offsetHSL(range(-.02, .02), range(-.05, .05), range(-.04, .06)), .42);

  /**
   * The open ground of all four countries, block by block over their own hexes. What decides what a
   * point gets is **how dry the air is there** and, inside the Ganesh, **what the wind has left**.
   * There is no fifth thing: this block has no soil story worth telling apart from the sediment, and
   * saying otherwise would be inventing a country the map does not draw.
   */
  // Job 1's four only. The Meroshe deserts have their own pass below, because nothing that decides
  // what grows there is in this loop's vocabulary - and keeping the two lists apart keeps this loop's
  // cell count at a hundred and seven, so the seeded stream job 1's scatter was drawn from is the
  // same stream to the draw.
  const cells = SOUTHWEST_NORTH_REGIONS.flatMap(name => REGION_CELLS[name] ?? []).sort((a, b) => a.z - b.z || a.x - b.x);
  const BLOCK = Math.max(1, Math.round(6 / (WORLD_SCALE * WORLD_SCALE)));
  const perHex = Math.round(27 * WORLD_SCALE * WORLD_SCALE);
  const rise = (x, z) => relief(x, z, .9, 320) / .9;
  const scrub = [], stubble = [], stones = [], pavement = [];
  for (let start = 0; start < cells.length; start += BLOCK) {
    const block = cells.slice(start, start + BLOCK), tufts = [];
    for (const cell of block) {
      const here = where(cell.x, cell.z);
      const desert = here === 'Ganesh Desert';
      const plain = here === 'Ganesh Plain';
      for (let i = 0; i < perHex * 3; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
        if (!plantable(x, z, 1.2)) continue;
        const dry = southwestAridity(x, z);
        const pan = plain ? inDepression(x, z) : 0;
        // The one rule: grass follows water. In the desert that means the pockets the wind has left
        // and nowhere else; on the plain it means the depressions, because in a drought phase "the
        // perennial grasses contract to the water-concentration points"; on the steppe and in the
        // two green corners it means the air.
        const cover = desert ? (1 - ganeshLie(x, z)) * .13
          : plain ? .10 + pan * .58 + (1 - dry) * .30
            : (1 - dry) * .62 + .16;
        if (random() > cover) continue;
        tufts.push({ x, z, s: range(.7, 1.45) * (pan ? 1.35 : 1) * (desert ? .65 : 1) * (1 + (1 - dry) * .5),
          wide: pan ? 1.5 : 1.28, rot: random() * 6.28, dry, pan, desert });
      }
      // Perennial scrub: the desert's is small and far apart and has all its investment underground;
      // the plain's is the saltbush of the bare clay between the depressions; West Pyros's western
      // columns get the desert's kind because the map says those hexes are desert.
      for (let i = 0; i < 160; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
        if (!plantable(x, z, 1.5)) continue;
        const dry = southwestAridity(x, z);
        const pocket = desert ? 1 - ganeshLie(x, z) : 1;
        const pan = plain ? inDepression(x, z) : 0;
        if (random() > pocket * dry * (plain ? .30 * (1 - pan * .8) : .34)) continue;
        if (scrub.some(b => Math.hypot(b.x - x, b.z - z) < (desert ? 4.4 : 3.2))) continue;
        scrub.push({ x, z, s: range(.26, .6) * (desert ? 1 : 1.2), h: range(.7, 1.05), rot: random() * 6.28, grey: random() < .5 });
      }
      if (desert || plain) {
        // The seed bank as a dry year leaves it: bleached annual stalks where the flush would be.
        for (let i = 0; i < 200; i++) {
          const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
          if (!plantable(x, z, .8)) continue;
          const chance = desert ? (1 - ganeshLie(x, z)) * .42 : .18 + inDepression(x, z) * .4;
          if (random() > chance) continue;
          stubble.push({ x, z, s: range(.4, .8), rot: random() * 6.28 });
        }
      }
      if (desert) {
        // Desert pavement: grit and gravel wherever the wind has taken the fine stuff away, which is
        // every rise and every wind-combed crest. It is most of the surface of this country.
        for (let i = 0; i < 340; i++) {
          const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
          if (!plantable(x, z, .5)) continue;
          if (random() > ganeshLie(x, z) * .62) continue;
          pavement.push({ x, z, s: range(.14, .55), rot: random() * 6.28, flat: range(.14, .3), bald: ganeshLie(x, z) > .7 });
        }
      } else {
        // Stone on the rises: Navarth's swells show grey along their tops and West Pyros's plain has
        // a scatter of it where the grass gives out.
        for (let i = 0; i < 70; i++) {
          const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
          if (!plantable(x, z, 1)) continue;
          const dry = southwestAridity(x, z);
          if (random() > smooth(0, .8, rise(x, z)) * (cell.terrain === 'hills' ? 1.1 : .6) * (.3 + dry * .8)) continue;
          stones.push({ x, z, s: range(.2, .75), rot: random() * 6.28, flat: range(.3, .58) });
        }
      }
    }
    tuftBatch(tufts, 'Southwest grass', tuft => {
      // Bleached buff in the desert, a shade greener in the plain's depressions, and properly green
      // only in the two `Cs` corners. Lightnesses are chosen low (the renderer's working space: the
      // old Meneth lesson, which the Mithala had to learn again).
      const hue = .112 + (1 - tuft.dry) * .045 + tuft.pan * .012;
      const sat = (tuft.desert ? .19 : .25 + (1 - tuft.dry) * .15) + range(-.04, .04);
      const light = (tuft.desert ? .37 : .38) - (1 - tuft.dry) * .07 - tuft.pan * .02 + range(-.032, .032);
      return color.setHSL(hue + range(-.012, .012), sat, light);
    });
  }
  bushBatch(scrub, 'Southwest perennial scrub', bush => bush.grey
    ? color.set('#75776a').offsetHSL(range(-.02, .02), range(-.04, .04), range(-.05, .05))
    : color.set('#666e54').offsetHSL(range(-.02, .02), range(-.04, .05), range(-.04, .05)));
  stubbleBatch(stubble, 'Southwest seed-bank stubble');
  stoneBatch(stones, 'Southwest stones', () => color.set('#605c52').offsetHSL(0, range(-.03, .03), range(-.05, .05)), .16);
  stoneBatch(pavement, 'Ganesh desert pavement', spot => (spot.bald ? color.set('#696557') : color.set('#5f5a4d')).offsetHSL(0, range(-.03, .03), range(-.05, .06)), .04);
  metrics.scrub = scrub.length; metrics.stones += stones.length; metrics.pavement = pavement.length;

  // -------------------------------------------------------------------------
  // The four Meroshe deserts: one climate code, four surfaces
  // -------------------------------------------------------------------------
  /**
   * **Ninety-five hexes with the same terrain word and the same climate code, and this is where they
   * are told apart.** Nothing above can do it: job 1's loop sorts by how dry the air is and where the
   * wind has left sediment, and here the air is `BWh` on every hex of all four countries, so aridity
   * is flat 1.00 across the whole ninety-five and says nothing at all. What is left is the ground
   * itself, and a hot desert has four grounds:
   *
   *  - **hamada** (North): bedrock slabs with gravel in the joints, thorn trees growing out of the
   *    cracks near the bench risers where the last rain went, and nothing else at all. The only trees
   *    in ninety-five hexes;
   *  - **the fan skirt and the Malhat** (West): cobbles a hand across at the fan heads sorting down
   *    to dust at the toes - which is the whole of what this country is - and at the dead end of the
   *    drainage a salt crust with nothing living on it whatever;
   *  - **erg** (Central): clean sand on the ridges with wind ripples combed across them, swept gravel
   *    on the corridor floors so a traveler can feel which one they are on through their boots, and
   *    the only plants in the country on the sand sheet at its outer margin;
   *  - **reg under fog** (South): pebbles packed edge to edge and varnished dark, lichen in the lee of
   *    them where the fog reaches, and the one thorn scrub in the Meroshe that stands close enough
   *    together to walk round.
   *
   * **The whole pass is stone.** Over four countries it lays about forty thousand stones and fewer
   * than three thousand plants, and that ratio is the argument: the Oves Desert's report made it for
   * `BSh` steppe, job 1's made it for `BWh` on thirty-one hexes, and this is the same reading over
   * ninety-five more.
   */
  const merosheCells = MEROSHE_REGIONS.flatMap(name => REGION_CELLS[name] ?? []).sort((a, b) => a.z - b.z || a.x - b.x);
  const rockSlabs = [], hamadaGrit = [], thornTrees = [], thornScrub = [], hamadaStubble = [];
  const fanCobble = [], fanDust = [], saltPlates = [], saltRidges = [], skirtScrub = [], shingle = [];
  const ripples = [], corridorGrit = [], sheetScrub = [];
  const regPebbles = [], lichen = [], fogThorn = [], regStubble = [];
  const RIPPLE = MEROSHE_DUNES.bearing + Math.PI / 2;
  for (const cell of merosheCells) {
    const here = where(cell.x, cell.z);
    const sample = (count, work) => {
      for (let i = 0; i < count; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
        if (where(x, z) !== here) continue;
        work(x, z);
      }
    };
    if (here === 'North Meroshe Desert') {
      // Bedrock: slabs where the hard bed is at the surface, which is along and above every riser,
      // and gravel in the joints everywhere else. This is the ground and not a scatter on it.
      sample(300, (x, z) => {
        if (!plantable(x, z, .4)) return;
        const bench = merosheBench(x, z);
        const bare = .30 + bench.edge * .55;
        if (random() > bare) return;
        rockSlabs.push({ x, z, s: range(.5, 1.7) * (1 + bench.edge * .5), rot: random() * 6.28, flat: range(.06, .14) });
      });
      sample(220, (x, z) => {
        if (!plantable(x, z, .3)) return;
        if (random() > .5) return;
        hamadaGrit.push({ x, z, s: range(.1, .34), rot: random() * 6.28, flat: range(.2, .4) });
      });
      // "Scrubby thorn trees still manage to exist" - in the joints, which is where the water is, so
      // they are on the risers and nowhere else. Three to six metres, wide flat crowns, far apart.
      sample(90, (x, z) => {
        if (!plantable(x, z, 2.4)) return;
        const bench = merosheBench(x, z);
        if (random() > bench.edge * .30) return;
        if (thornTrees.some(t => Math.hypot(t.x - x, t.z - z) < 13)) return;
        thornTrees.push({ x, z, s: range(.85, 1.2), h: range(3.4, 5.6), rot: random() * 6.28,
          girth: .62, bole: .46, top: .74, spread: .26, wide: .40, deep: .16 });
      });
      sample(120, (x, z) => {
        if (!plantable(x, z, 1.2)) return;
        const bench = merosheBench(x, z);
        if (random() > .10 + bench.edge * .22) return;
        if (thornScrub.some(b => Math.hypot(b.x - x, b.z - z) < 5.4)) return;
        thornScrub.push({ x, z, s: range(.24, .5), h: range(.7, 1.15), rot: random() * 6.28, grey: random() < .6 });
      });
      sample(90, (x, z) => {
        if (!plantable(x, z, .8)) return;
        if (random() > merosheBench(x, z).edge * .34) return;
        hamadaStubble.push({ x, z, s: range(.32, .62), rot: random() * 6.28 });
      });
    } else if (here === 'West Meroshe Desert') {
      // **The fans are a grain-size story and nothing else.** Cobbles at the apex, pebbles halfway,
      // dust at the toe - the one thing a traveler notices about this country is what the walking is
      // like, and it changes over four hundred paces.
      sample(300, (x, z) => {
        if (!plantable(x, z, .5)) return;
        const grain = merosheFan(x, z);
        if (random() > .16 + grain * .62) return;
        // "A hand across" is a hand across: the first pass ran to a metre and photographed as boulders.
        fanCobble.push({ x, z, s: range(.10, .24) + grain * range(.10, .30), rot: random() * 6.28, flat: range(.3, .6), grain });
      });
      sample(200, (x, z) => {
        if (!plantable(x, z, .3)) return;
        if (random() > (1 - merosheFan(x, z)) * .5) return;
        fanDust.push({ x, z, s: range(.16, .44), rot: random() * 6.28, flat: range(.05, .11) });
      });
      // The Malhat: a salt crust, and the polygonal ridges standing a hand's breadth off it where the
      // crust has buckled. Nothing grows on it, which `southwestClear` already says.
      sample(260, (x, z) => {
        const pan = onSaltPan(x, z);
        if (pan < .18 || westBareGround(x, z, .3)) return;
        if (random() > pan * .82) return;
        saltPlates.push({ x, z, s: range(.3, .9), rot: random() * 6.28, flat: range(.03, .07) });
      });
      sample(180, (x, z) => {
        const pan = onSaltPan(x, z);
        if (pan < .3 || westBareGround(x, z, .3)) return;
        // The ridges stand on a coarse lattice: a crust cracks into plates a few metres across.
        const lattice = Math.abs(Math.sin(x * .22) * Math.sin(z * .19));
        if (lattice > .16 || random() > pan * .6) return;
        saltRidges.push({ x, z, s: range(.22, .52), rot: random() * 6.28, flat: range(.3, .6) });
      });
      sample(140, (x, z) => {
        if (!plantable(x, z, 1.4)) return;
        // What little grows here grows on the fine ground between the fans and off the salt entirely.
        if (random() > (1 - merosheFan(x, z)) * (1 - onSaltPan(x, z, 30)) * .16) return;
        if (skirtScrub.some(b => Math.hypot(b.x - x, b.z - z) < 6.5)) return;
        skirtScrub.push({ x, z, s: range(.22, .46), h: range(.6, .95), rot: random() * 6.28, grey: random() < .7 });
      });
      sample(140, (x, z) => {
        const shore = landDistance(x, z);
        if (shore > 34 || shore < 1 || westWaterSurface(x, z) !== null) return;
        if (random() > .58) return;
        shingle.push({ x, z, s: range(.13, .42), rot: random() * 6.28, flat: range(.24, .5) });
      });
    } else if (here === 'Central Meroshe Desert') {
      const ergHere = (x, z) => merosheErg(x, z, regionShare('Central Meroshe Desert', x, z));
      // Wind ripples: flat, long, lying across the ridge, dense on the sand and absent on the gravel.
      sample(420, (x, z) => {
        if (!plantable(x, z, .3)) return;
        const sandHere = duneProfile(x, z) * ergHere(x, z);
        if (random() > .10 + sandHere * .80) return;
        ripples.push({ x, z, s: range(.5, 1.5), rot: RIPPLE + range(-.18, .18), flat: range(.03, .07) });
      });
      // The corridor floors: swept gravel, and the one thing that tells a traveler through their boots
      // which of the two grounds they are on.
      sample(260, (x, z) => {
        if (!plantable(x, z, .3)) return;
        if (random() > merosheCorridor(x, z) ** 3 * .58) return;
        corridorGrit.push({ x, z, s: range(.1, .34), rot: random() * 6.28, flat: range(.16, .34) });
      });
      // **Every plant in this country is on the sand sheet at its margin.** An active dune has nothing
      // on it at all, and thirty-one hexes of this one are mostly active dune.
      sample(160, (x, z) => {
        if (!plantable(x, z, 1.6)) return;
        if (random() > (1 - ergHere(x, z)) * .13) return;
        if (sheetScrub.some(b => Math.hypot(b.x - x, b.z - z) < 8)) return;
        sheetScrub.push({ x, z, s: range(.22, .48), h: range(.55, .95), rot: random() * 6.28, grey: random() < .5 });
      });
    } else if (here === 'South Meroshe Desert') {
      // The reg itself: pebbles edge to edge, small and flat and very many, dark where the varnish is.
      sample(460, (x, z) => {
        if (!plantable(x, z, .3)) return;
        if (random() > .66) return;
        regPebbles.push({ x, z, s: range(.13, .34), rot: random() * 6.28, flat: range(.2, .42), dark: merosheVarnish(x, z) });
      });
      // Lichen in the lee of the pebbles, and only where the fog reaches: the one thing in the Meroshe
      // that lives on water out of the air.
      sample(300, (x, z) => {
        if (!plantable(x, z, .3)) return;
        const fog = merosheFog(x, z);
        if (random() > fog * .46) return;
        lichen.push({ x, z, s: range(.12, .34), rot: random() * 6.28, flat: range(.04, .08) });
      });
      sample(280, (x, z) => {
        if (!plantable(x, z, 1.5)) return;
        const fog = merosheFog(x, z);
        if (random() > fog * fog * .62) return;
        if (fogThorn.some(b => Math.hypot(b.x - x, b.z - z) < 2.6)) return;
        fogThorn.push({ x, z, s: range(.2, .44), h: range(.8, 1.25), rot: random() * 6.28, fog });
      });
      sample(140, (x, z) => {
        if (!plantable(x, z, .8)) return;
        if (random() > merosheFog(x, z) * .3) return;
        regStubble.push({ x, z, s: range(.3, .58), rot: random() * 6.28 });
      });
      sample(140, (x, z) => {
        const shore = landDistance(x, z);
        if (shore > 34 || shore < 1 || westWaterSurface(x, z) !== null) return;
        if (random() > .55) return;
        shingle.push({ x, z, s: range(.12, .4), rot: random() * 6.28, flat: range(.22, .48) });
      });
    }
  }
  stoneBatch(rockSlabs, 'Meroshe bedrock slabs', () => color.set('#6f6a55').offsetHSL(0, range(-.02, .02), range(-.05, .06)), .02);
  stoneBatch(hamadaGrit, 'Meroshe hamada grit', () => color.set('#63604e').offsetHSL(0, range(-.03, .03), range(-.05, .05)), .05);
  stoneBatch(fanCobble, 'Meroshe fan cobbles', spot => color.set(spot.grain > .55 ? '#6a6450' : '#615c4a').offsetHSL(0, range(-.03, .03), range(-.05, .06)), .16);
  stoneBatch(fanDust, 'Meroshe fan dust', () => color.set('#6d6854').offsetHSL(0, range(-.02, .02), range(-.04, .06)), .02);
  stoneBatch(saltPlates, 'Malhat salt crust', () => color.set('#8e8b7c').offsetHSL(0, range(-.015, .015), range(-.04, .07)), .01);
  stoneBatch(saltRidges, 'Malhat crust ridges', () => color.set('#98957f').offsetHSL(0, range(-.015, .015), range(-.04, .07)), .12);
  stoneBatch(ripples, 'Meroshe sand ripples', () => color.set('#79714f').offsetHSL(0, range(-.02, .02), range(-.04, .07)), .01);
  stoneBatch(corridorGrit, 'Meroshe corridor gravel', () => color.set('#5e5a49').offsetHSL(0, range(-.03, .03), range(-.05, .05)), .04);
  // The pebbles are a shade *lighter* than the pavement they make, which is the only way a stone
  // floor reads as stones rather than as a flat dark field: the varnish is on the ground and the tops
  // of the pebbles catch what light there is.
  stoneBatch(regPebbles, 'Meroshe reg pavement', spot => color.set(spot.dark > .6 ? '#5c5340' : '#6a5f49').offsetHSL(0, range(-.02, .02), range(-.05, .05)), .03);
  stoneBatch(lichen, 'Meroshe fog lichen', () => color.set('#5b6050').offsetHSL(range(-.02, .02), range(-.03, .04), range(-.04, .06)), .01);
  stoneBatch(shingle, 'Meroshe shore shingle', () => color.set('#6a6657').offsetHSL(0, range(-.02, .02), range(-.05, .06)), .1);
  bushBatch(thornScrub, 'Meroshe hamada thorn', bush => bush.grey
    ? color.set('#6e7065').offsetHSL(range(-.02, .02), range(-.04, .04), range(-.05, .05))
    : color.set('#5f6750').offsetHSL(range(-.02, .02), range(-.04, .05), range(-.04, .05)));
  bushBatch(skirtScrub, 'Meroshe skirt scrub', bush => bush.grey
    ? color.set('#70726a').offsetHSL(range(-.02, .02), range(-.04, .04), range(-.05, .05))
    : color.set('#616852').offsetHSL(range(-.02, .02), range(-.04, .05), range(-.04, .05)));
  bushBatch(sheetScrub, 'Meroshe sand-sheet scrub', bush => bush.grey
    ? color.set('#767567').offsetHSL(range(-.02, .02), range(-.04, .04), range(-.05, .05))
    : color.set('#666b52').offsetHSL(range(-.02, .02), range(-.04, .05), range(-.04, .05)));
  // The fog thorn is the only green in ninety-five hexes and it gets greener the deeper into the fog
  // belt it stands, which is the one gradient this half of the block has.
  bushBatch(fogThorn, 'Meroshe fog thorn', bush =>
    color.setHSL(.160 + bush.fog * .022 + range(-.010, .010), .13 + bush.fog * .11 + range(-.025, .025), .145 + range(-.02, .02)), .34);
  treeBatch(thornTrees, 'Meroshe hamada thorn trees', () => color.set('#5d6647').offsetHSL(range(-.02, .02), range(-.05, .04), range(-.04, .06)), 'southwest-tree');
  stubbleBatch(hamadaStubble, 'Meroshe hamada stubble');
  stubbleBatch(regStubble, 'Meroshe fog stubble');
  metrics.rock = rockSlabs.length; metrics.cobble = fanCobble.length + fanDust.length;
  metrics.sand = ripples.length; metrics.reg = regPebbles.length;
  metrics.salt = saltPlates.length + saltRidges.length; metrics.lichen = lichen.length;
  metrics.thorn = thornScrub.length + skirtScrub.length + sheetScrub.length + fogThorn.length;
  metrics.shingle = shingle.length; metrics.thornTrees = thornTrees.length;
  metrics.gravel += hamadaGrit.length + corridorGrit.length;

  return {
    group, metrics,
    update(time) { waterMaterial.uniforms.time.value = time; },
  };
}
