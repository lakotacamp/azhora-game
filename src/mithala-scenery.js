import * as THREE from 'three';
import { hexOwnerAt, REGION_CELLS, relief } from './region-world.js';
import { WORLD_SCALE } from './world-scale.js';
import { MITHALA_RIVERS, MITHALA_MAIN, WEST_BRAIDS, westBareGround } from './west-regions.js';
import { WEST_PROFILES, westWaterSurface, braidThreadOffset } from './west-ground.js';
import {
  MITHALA_REGIONS, MITHALA_SUMMER_CHANNELS, summerChannelPlace, onSummerFloor,
  mithalaClear, mithalaWet, onLevee, inBackswamp, mithalaShare,
} from './mithala-world.js';

/**
 * What the Mithala plain looks like where the ground alone is not enough: eight channels and the
 * wood that follows them, the tall grass of a continental prairie, the backswamps between the
 * braids, the fen margin going north, and the Acorwood coming over the horizon.
 *
 * **Everything here is about two things, because on this plain nothing else decides anything.**
 *
 *  - **How far from a channel**, which is how often the ground is under water. The levee crest is the
 *    driest ground in the country and carries the tallest grass and the forbs; the backswamp between
 *    two channels is the wettest and carries rank sedge-grass and nothing woody; the water's own
 *    edge carries reed, and two or three paces back from it the gallery.
 *  - **How far north**, which is how near the Acor Wetlands and the Acorwood are. There is no line
 *    anywhere on either margin - "the edge communities sitting against the open country without wall
 *    or cliff to announce the boundary" - so the grass shortens into sedge over a hundred and fifty
 *    paces on the wetland side, and on the forest side young trees simply begin to stand in the last
 *    of the grass.
 *
 * **`Dfa` is drawn by the species and not by the weather, because the game has no seasons.** What is
 * here is the summer face of a hot-summer humid continental plain, and every plant on it is one that
 * answers for the winter the world cannot yet show:
 *
 *  - **tall warm-season prairie grass**, standing to the waist by July on ground that was frozen in
 *    February and dead and buff from the first frost to the thaw. The lore's continental plains are
 *    "dominated by species not found in the Ibenwood catalogue at all: the tall grasses, the prairie
 *    forbs, the drought-tolerant perennials adapted to the seasonal dry periods that the forest never
 *    experiences" (`azhoran_flora_distribution.md`). It is drawn half again as tall as any grass
 *    already in the game and twice as dense;
 *  - **prairie forbs** through it, which is the one thing a `Cfa` meadow does not have;
 *  - **willow, black poplar and alder** on the water and nowhere else, because they are what stands
 *    a spring flood and a hard freeze in the same year. **Not one evergreen anywhere**: the plain is
 *    too wet in spring and too cold in winter, and every tree here is bare for five months;
 *  - **sedge and rush** on the fen margin, the "sedge assemblages adapted to peat formation" the
 *    flora document gives the cold wet north;
 *  - and **no aromatic scrub, no olive, no cushion plant** of any kind - everything the Mediterranean
 *    and rain-shadow countries in this game are made of is absent, which is most of what `Dfa` means
 *    next to `Csa` and `BSh`.
 *
 * Nothing here is anybody's: no field, no ditch with a straight side, no causeway, no landing, no
 * granary on a levee. Everything is placed on these four countries' own hexes (`hexOwnerAt`), from
 * one seeded stream of its own drawn after the West Lotharn's, so nothing already built anywhere
 * else moves by a centimetre for it.
 */
export function createMithalaScenery(kit) {
  const { root, material, groundHeight, colliders, dummy, color, round } = kit;
  const group = new THREE.Group(); group.name = 'Mithala scenery'; root.add(group);
  let seed = 8821477;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const range = (a, b) => a + random() * (b - a);
  const smooth = (a, b, x) => { const v = Math.max(0, Math.min(1, (x - a) / (b - a))); return v * v * (3 - 2 * v); };
  const metrics = { water: 0, blockers: 0, reeds: 0, sedge: 0, grass: 0, forbs: 0, trees: 0, saplings: 0, silt: 0, bars: 0, stones: 0 };
  const gy = (x, z) => groundHeight(x, z);
  const OWN = new Set(MITHALA_REGIONS);
  const own = (x, z) => OWN.has(hexOwnerAt(x, z));
  /** Ground something may grow on: this plain's own hexes, out of the water and off a dry channel's floor. */
  const plantable = (x, z, margin) => own(x, z) && !westBareGround(x, z, margin)
    && westWaterSurface(x, z) === null && !mithalaClear(x, z, margin);

  // -------------------------------------------------------------------------
  // The water: eight channels, two of them braided
  // -------------------------------------------------------------------------
  /**
   * Slow, brown-green, heavy with silt. This is a river that has carried the Oremindi down onto a
   * plain and is putting it there: "a deep dark accumulation of mountain sediment that makes the
   * Mithala the most productive grain land on the continent."
   */
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } }, side: THREE.DoubleSide,
    vertexShader: 'varying vec3 p; void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform float time; varying vec3 p; void main(){float w=sin(p.x*.26-time*.95+p.z*.72)*sin(p.x*.11+p.z*.83);vec3 c=vec3(.31,.38,.33)+vec3(.16,.17,.13)*pow(max(w,0.),8.);gl_FragColor=vec4(c,1.);}',
  });
  /** A ribbon over a line of samples, broken wherever the ground rises through it. */
  function ribbon(samples, name, halfOf = sample => sample.half) {
    let run = [];
    const flush = () => {
      if (run.length < 2) { run = []; return; }
      const vertices = [], indices = [];
      run.forEach((sample, index) => {
        const half = halfOf(sample);
        vertices.push(sample.x - sample.nx * half, sample.y, sample.z - sample.nz * half,
          sample.x + sample.nx * half, sample.y, sample.z + sample.nz * half);
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
  for (const course of MITHALA_RIVERS) ribbon(WEST_PROFILES.get(course.id), course.name);

  /**
   * **The braided reaches, which are what this plain is famous for.** A thread leaves the main line
   * and comes back to it, so two run either side of the channel over the reach and a bar of silt
   * stands between each thread and the middle. `WEST_BRAIDS` carries the two - the main channel's
   * over almost its whole length and the north braid's over its lower half - and the threads are the
   * same geometry Vastos, the Flats and Eer already use.
   */
  const MITHALA_BRAIDS = WEST_BRAIDS.filter(item => item.id === 'mithala-main' || item.id === 'mithala-north-braid');
  const braidThreads = braid => [1, -1].map(side => WEST_PROFILES.get(braid.course.id).map(sample => {
    const offset = braidThreadOffset(braid, sample.along);
    if (offset === null) return null;
    return { ...sample, x: sample.x + sample.nx * offset * side, z: sample.z + sample.nz * offset * side };
  }).filter(Boolean));
  for (const braid of MITHALA_BRAIDS)
    braidThreads(braid).forEach((thread, index) => ribbon(thread, `${braid.course.name} thread ${index + 1}`, () => braid.half));

  /**
   * **The main channel is a wall below its first third**, which is the house rule for a medium river
   * (the Isa, the Carica) and the reason South Mithala and East Mithala are different places. Its
   * ford is the gravel of the upper reach, where the two arms have only just come together and it is
   * not yet carrying what it carries below; from there to the sea nobody crosses it on foot. No other
   * channel on the plain is walled: a small river on ground this flat is waded anywhere.
   */
  for (const sample of WEST_PROFILES.get(MITHALA_MAIN.id)) {
    if (sample.ford) continue;
    const step = Math.max(1, Math.round(sample.half / 3.2)), radius = sample.half / (step + .5) + 1.4;
    for (let k = -step; k <= step; k++) {
      const offset = sample.half * (k / (step + .5));
      colliders.push({ x: sample.x + sample.nx * offset, z: sample.z + sample.nz * offset, r: radius, kind: 'west-deep-water' });
      metrics.blockers++;
    }
  }

  // -------------------------------------------------------------------------
  // Silt: the bars in the braids, the summer channels' floors, and the levee crests
  // -------------------------------------------------------------------------
  const stoneMaterial = material('#ffffff', { flatShading: true });
  function siltBatch(spots, name, tint, lift = .1) {
    if (!spots.length) return;
    const batch = new THREE.InstancedMesh(round, stoneMaterial, spots.length);
    spots.forEach((spot, index) => {
      dummy.position.set(spot.x, gy(spot.x, spot.z) + spot.s * lift, spot.z);
      dummy.rotation.set(range(-.1, .1), spot.rot, range(-.1, .1));
      dummy.scale.set(spot.s, spot.s * (spot.flat ?? range(.12, .26)), spot.s * range(.8, 1.4)); dummy.updateMatrix();
      batch.setMatrixAt(index, dummy.matrix); batch.setColorAt(index, tint(spot));
    });
    batch.name = name; batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
  }

  /**
   * **The bars**, which are the only ground on this plain that is not grass or water. "Three shallow
   * channels run side by side round bars of grey silt, and none of them is the river." Here they are
   * silt rather than gravel, because everything the Lizeem carries this far down is fine: a low
   * smooth shoal between the thread and the main line, bare or nearly so, and the lore's "slightly
   * elevated patches between braids" that villages are built on.
   */
  const bars = [];
  for (const braid of MITHALA_BRAIDS) for (const sample of WEST_PROFILES.get(braid.course.id)) {
    const offset = braidThreadOffset(braid, sample.along);
    if (offset === null || offset < braid.half * 2.2) continue;
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
      const across = (braid.half + range(1.2, Math.max(1.4, offset - braid.half))) * side;
      const x = sample.x + sample.nx * across, z = sample.z + sample.nz * across;
      if (!own(x, z) || westWaterSurface(x, z) !== null) continue;
      bars.push({ x, z, s: range(.14, .46), rot: random() * 6.28, flat: range(.05, .12) });
    }
  }
  siltBatch(bars, 'Mithala braid bars', () => color.set('#877f6a').offsetHSL(0, range(-.03, .03), range(-.05, .06)), .05);
  metrics.bars = bars.length;

  /**
   * **The summer channels' floors**: dried silt, cracked into plates, with bleached stalks in the
   * cracks and no stone at all. This is not the Oves - there is nothing coarse in this country to
   * lag a bed with, because the river dropped its gravel two hundred miles upstream.
   */
  const siltFloor = [];
  for (const channel of MITHALA_SUMMER_CHANNELS) {
    for (let i = 1; i < channel.points.length; i++) {
      const a = channel.points[i - 1], b = channel.points[i], length = Math.hypot(b.x - a.x, b.z - a.z);
      const nx = -(b.z - a.z) / length, nz = (b.x - a.x) / length;
      for (let d = 0; d < length; d += 1.3) for (let k = 0; k < 2; k++) {
        const t = d / length, across = range(-channel.floor - .6, channel.floor + .6);
        const x = a.x + (b.x - a.x) * t + nx * across, z = a.z + (b.z - a.z) * t + nz * across;
        if (!own(x, z) || !onSummerFloor(x, z, .6)) continue;
        siltFloor.push({ x, z, s: range(.22, .62), rot: random() * 6.28, flat: range(.04, .08) });
      }
    }
  }
  siltBatch(siltFloor, 'Mithala summer-channel silt', () => color.set('#8d8467').offsetHSL(0, range(-.03, .02), range(-.05, .07)), .03);
  metrics.silt = siltFloor.length;

  // -------------------------------------------------------------------------
  // Blades: reed on the water, sedge on the fen, and the tall grass everywhere else
  // -------------------------------------------------------------------------
  const bladeMaterial = material('#ffffff', { side: THREE.DoubleSide });
  const bladeGeometry = (blades, spread, width, base, step) => {
    const positions = [], normals = [];
    for (let blade = 0; blade < blades; blade++) {
      const a = blade * (6.283 / blades) * 1.07, lean = spread + blade % 3 * spread * .5;
      const bx = Math.cos(a) * spread, bz = Math.sin(a) * spread, h = base + (blade % 3) * step;
      const cx = Math.cos(a + Math.PI / 2) * width, cz = Math.sin(a + Math.PI / 2) * width;
      positions.push(bx - cx, 0, bz - cz, bx + cx, 0, bz + cz, bx + Math.cos(a) * lean, h, bz + Math.sin(a) * lean);
      for (let i = 0; i < 3; i++) normals.push(0, 1, 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geometry;
  };
  const reedGeometry = bladeGeometry(6, .06, .022, .95, .4);
  /** **Tall grass, and it is tall on purpose**: six blades to a tuft standing 1.1-1.8 m before scale. */
  const grassGeometry = bladeGeometry(6, .12, .045, .62, .26);
  const sedgeGeometry = bladeGeometry(7, .1, .03, .34, .12);
  function bladeBatch(geometry, spots, name, tint, tall = 1) {
    if (!spots.length) return;
    const batch = new THREE.InstancedMesh(geometry, bladeMaterial, spots.length);
    spots.forEach((spot, index) => {
      dummy.position.set(spot.x, gy(spot.x, spot.z) + .02, spot.z);
      dummy.rotation.set(0, spot.rot, 0);
      dummy.scale.set(spot.s * (spot.wide ?? 1), spot.s * tall * (spot.high ?? 1), spot.s * (spot.wide ?? 1));
      dummy.updateMatrix();
      batch.setMatrixAt(index, dummy.matrix); batch.setColorAt(index, tint(spot));
    });
    batch.name = name; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
  }

  /** Reed at every channel's waterline, on both banks: the one place on the plain it grows. */
  const reeds = [];
  for (const course of MITHALA_RIVERS) for (const sample of WEST_PROFILES.get(course.id)) {
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
      const offset = sample.half + range(.2, 4.2);
      const x = sample.x + sample.nx * offset * side, z = sample.z + sample.nz * offset * side;
      if (!own(x, z) || westWaterSurface(x, z) !== null) continue;
      reeds.push({ x, z, s: range(.8, 1.7), rot: random() * 6.28 });
    }
  }
  bladeBatch(reedGeometry, reeds, 'Mithala reed', () => color.setHSL(range(.17, .24), range(.24, .40), range(.30, .44)));
  metrics.reeds = reeds.length;

  // -------------------------------------------------------------------------
  // The gallery: the only wood on the plain
  // -------------------------------------------------------------------------
  const trunkGeometry = new THREE.CylinderGeometry(.16, .3, 1, 6);
  const crownGeometry = new THREE.IcosahedronGeometry(1, 0);
  const barkMaterial = material('#6a5a46'), leafMaterial = material('#ffffff', { flatShading: true });
  function treeBatch(trees, name, tint, kind) {
    if (!trees.length) return;
    const trunks = new THREE.InstancedMesh(trunkGeometry, barkMaterial, trees.length);
    const crowns = new THREE.InstancedMesh(crownGeometry, leafMaterial, trees.length * 3);
    let at = 0;
    trees.forEach((tree, index) => {
      const y = gy(tree.x, tree.z), height = tree.h * tree.s;
      dummy.position.set(tree.x, y + height * tree.bole * .5, tree.z);
      dummy.rotation.set(range(-.05, .05), tree.rot, range(-.05, .05));
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

  /**
   * **Willow, black poplar and alder, on the water and nowhere else.** This is the whole of the wood
   * in a hundred and sixteen hexes, and the three species are the ones that stand what this ground
   * does to a tree: roots under water for weeks every spring and in frozen ground every winter.
   * Nothing evergreen, nothing aromatic, nothing with a taproot.
   *
   * Planted off the water rather than off the hexes, the way the Oveth's gallery and Caricas's
   * corridor are, and **thickest on the main channel and thinnest on the fan**, because a gallery is
   * as wide as the flood that feeds it. On the lower main channel it is two and three trees deep and
   * is, from out on the grass, a dark line with nothing behind it - which is how a traveler finds the
   * river on ground where the river is invisible from a hundred paces.
   */
  const gallery = [];
  for (const course of MITHALA_RIVERS) {
    const main = course.id === MITHALA_MAIN.id;
    for (const sample of WEST_PROFILES.get(course.id)) {
      if (sample.index % (main ? 2 : 3)) continue;
      for (let i = 0; i < (main ? 5 : 3); i++) {
        const side = random() < .5 ? -1 : 1, offset = sample.half + range(2.2, main ? 15 : 8);
        const x = sample.x + sample.nx * offset * side, z = sample.z + sample.nz * offset * side;
        if (!plantable(x, z, 2.2)) continue;
        // Thicker downstream: the gallery grows with the flood that feeds it, and on the lower
        // channel it is the only shade in the country.
        const soil = (main ? .5 + sample.along * .45 : .32) * (1 - mithalaWet(x, z) * .6);
        if (random() > soil) continue;
        const kind = random();
        const willow = kind < .38, poplar = !willow && kind < .76;
        const spacing = willow ? 5.2 : poplar ? 5.8 : 5;
        if (gallery.some(t => Math.hypot(t.x - x, t.z - z) < spacing)) continue;
        gallery.push({ x, z, willow, poplar, s: range(.95, 1.3), rot: random() * 6.28,
          h: poplar ? range(13, 18) : willow ? range(7, 10) : range(9, 13),
          girth: poplar ? .8 : willow ? 1.2 : .95, bole: poplar ? .58 : willow ? .38 : .5,
          top: poplar ? .74 : .78, spread: poplar ? .06 : willow ? .22 : .14,
          wide: poplar ? .16 : willow ? .36 : .26, deep: poplar ? .52 : willow ? .26 : .34 });
      }
    }
  }
  treeBatch(gallery, 'Mithala gallery', tree => (tree.poplar
    ? color.set('#66813f')        // black poplar: tall, narrow, a brighter green, and the tallest thing on the plain
    : tree.willow
      ? color.set('#7f9060')      // willow: broad, grey-green, low over the water
      : color.set('#4f6c3e'))     // alder: dark, dense, and the one that stands in the water itself
    .offsetHSL(range(-.02, .02), range(-.05, .05), range(-.04, .06)), 'mithala-tree');

  /**
   * **The Acorwood coming over the horizon**, on the north-eastern margin of East and North Mithala.
   * "The approach to the Acorwood from the south is the slow thickening of the treeline along the
   * plain's northern horizon, the edge communities sitting against the open country without wall or
   * cliff to announce the boundary." So there is no edge drawn: young trees simply begin to stand in
   * the grass, singly at first and then in twos and threes, over the last few hundred metres before
   * the forest's own hexes - which are not built, and are where this stops.
   */
  const saplings = [];
  const FOREST = { fromX: -1700, toX: -1000, fromZ: -1500, toZ: -1950 };
  for (const name of ['East Mithala', 'North Mithala']) for (const cell of REGION_CELLS[name] ?? []) {
    for (let i = 0; i < 90; i++) {
      const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
      if (!plantable(x, z, 2)) continue;
      // Two gradients multiplied: nearer the north-east corner, and clear of the wetland margin,
      // because the Acorwood is forest on ground and the fen is a hole.
      const near = smooth(FOREST.fromX, FOREST.toX, x) * smooth(FOREST.fromZ, FOREST.toZ, z);
      if (near <= 0 || random() > near * near * .5) continue;
      if (saplings.some(t => Math.hypot(t.x - x, t.z - z) < 9 - near * 4)) continue;
      if (gallery.some(t => Math.hypot(t.x - x, t.z - z) < 7)) continue;
      saplings.push({ x, z, s: range(.7, 1.15), h: range(4, 9.5) * (.5 + near * .8), rot: random() * 6.28,
        girth: 1, bole: .45, top: .76, spread: .2, wide: .3, deep: .3 });
    }
  }
  treeBatch(saplings, 'Mithala Acorwood margin', () => color.set('#3f5c36').offsetHSL(range(-.02, .02), range(-.04, .06), range(-.04, .05)), 'mithala-tree');
  metrics.saplings = saplings.length;

  // -------------------------------------------------------------------------
  // The open plain: tall grass, forbs, and the fen's sedge
  // -------------------------------------------------------------------------
  /** A low clump of three lobes: the prairie forbs, which is the one thing a Cfa meadow lacks. */
  function forbBatch(clumps, name, tint) {
    if (!clumps.length) return;
    const batch = new THREE.InstancedMesh(round, leafMaterial, clumps.length * 3);
    let at = 0;
    for (const clump of clumps) {
      const y = gy(clump.x, clump.z);
      for (let lobe = 0; lobe < 3; lobe++) {
        const a = clump.rot + lobe * 2.1, spread = lobe === 2 ? 0 : .3 * clump.s;
        dummy.position.set(clump.x + Math.sin(a) * spread, y + clump.s * clump.h * (lobe === 2 ? .8 : .52), clump.z + Math.cos(a) * spread);
        dummy.rotation.set(range(-.16, .16), a, range(-.16, .16));
        dummy.scale.set(clump.s * .34, clump.s * clump.h * .42, clump.s * .32); dummy.updateMatrix();
        batch.setMatrixAt(at, dummy.matrix); batch.setColorAt(at++, tint(clump));
      }
    }
    batch.name = name; batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
    metrics.forbs += clumps.length;
  }

  /**
   * The open ground of all four countries, block by block over their own hexes and in one pass,
   * because they are one plain. What a point gets is decided by three numbers and no fourth: how
   * high it stands on a levee (`onLevee`), how deep it lies in a backswamp (`inBackswamp`) and how
   * far into the fen margin it is (`mithalaWet`). The atlas's own `grassland` / `plains` split adds
   * a fourth of a shade on top of that, which is about what it is worth here.
   */
  const cells = MITHALA_REGIONS.flatMap(name => REGION_CELLS[name] ?? []).sort((a, b) => a.z - b.z || a.x - b.x);
  const BLOCK = Math.max(1, Math.round(6 / (WORLD_SCALE * WORLD_SCALE)));
  const perHex = Math.round(27 * WORLD_SCALE * WORLD_SCALE);
  const rise = (x, z) => relief(x, z, .5, 320) / .5;   // -1 in a hollow, 1 on a swell
  const forbs = [], sedge = [], stones = [];
  for (let start = 0; start < cells.length; start += BLOCK) {
    const block = cells.slice(start, start + BLOCK), tufts = [];
    for (const cell of block) {
      const older = cell.terrain === 'grassland';   // the rows that stand back from the braids
      const apron = cell.terrain === 'hills';       // South Mithala's four
      // **Grass, and a great deal of it.** Four times the west's usual count: an open plain at the
      // ordinary density reads as bare ground from standing height, which is the lesson Gala's first
      // render taught and the Oves repeated, and this is flatter and greener than either.
      for (let i = 0; i < perHex * 4; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
        if (!plantable(x, z, 1.1)) continue;
        const wet = mithalaWet(x, z);
        if (random() > .72 - wet * .45) continue;
        const bank = onLevee(x, z), basin = inBackswamp(x, z);
        tufts.push({ x, z, rot: random() * 6.28, wet, bank, basin, older, apron,
          s: range(.8, 1.45) * (older ? 1.12 : 1) * (apron ? .88 : 1) * (1 + basin * .18) * (1 - wet * .35),
          wide: 1.25 + basin * .25, high: 1 - wet * .3 });
      }
      // **Prairie forbs**, through the grass and thickest on the levees and the older rows: the
      // "prairie forbs" and "drought-tolerant perennials adapted to the seasonal dry periods" the
      // flora document gives the continental plains, and the plant this plain has that no `Cfa` or
      // `Csa` country in the game does. Nobody walks round one, so none carries a collider.
      for (let i = 0; i < 170; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
        if (!plantable(x, z, 1.2)) continue;
        const wet = mithalaWet(x, z), bank = onLevee(x, z);
        const here = (older ? .34 : .24) * (1 - wet) * (.55 + bank * .6 + Math.max(0, rise(x, z)) * .3);
        if (random() > here) continue;
        if (forbs.some(b => Math.hypot(b.x - x, b.z - z) < 3.4)) continue;
        forbs.push({ x, z, s: range(.5, .95), h: range(.7, 1.15), rot: random() * 6.28, tall: random() < .35 });
      }
      // **Sedge and rush on the fen margin**, where the plain stops being plain. It comes up through
      // the grass rather than replacing it at a line, which is the whole point of the margin.
      for (let i = 0; i < 260; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
        if (!plantable(x, z, .8)) continue;
        const wet = mithalaWet(x, z), basin = inBackswamp(x, z);
        if (random() > wet * .8 + basin * .22) continue;
        sedge.push({ x, z, s: range(.7, 1.3), rot: random() * 6.28, wet });
      }
      // The only stone on the plain, and there is very little: a scatter on the apron's swells,
      // which is the Lotharn's own rubble brought down and the one ground here that is not silt.
      if (apron) for (let i = 0; i < 60; i++) {
        const x = cell.x + range(-50, 50), z = cell.z + range(-55, 55);
        if (!plantable(x, z, 1)) continue;
        if (random() > smooth(0, .8, rise(x, z)) * .7) continue;
        stones.push({ x, z, s: range(.2, .62), rot: random() * 6.28, flat: range(.35, .6) });
      }
    }
    bladeBatch(grassGeometry, tufts, 'Mithala prairie grass', tuft => {
      // Green and rank in the backswamps, warmer and paler on the levee crests and on the older
      // rows, grey-green on the fen margin. HSL rather than hex, because the one note that has to
      // carry is the wet/dry difference and it is a saturation note (the Meneth lesson: choose the
      // lightnesses low, the renderer's working space pales them).
      const hue = .225 - tuft.bank * .030 + tuft.basin * .014 + tuft.wet * .008;
      const sat = .36 + tuft.basin * .07 - tuft.bank * .07 - tuft.wet * .11 + range(-.04, .04);
      const light = .32 + tuft.bank * .07 - tuft.basin * .04 + tuft.wet * .04 + (tuft.apron ? .03 : 0) + range(-.035, .035);
      return color.setHSL(hue + range(-.012, .012), sat, light);
    }, 1.35);
    metrics.grass += tufts.length;
  }
  bladeBatch(sedgeGeometry, sedge, 'Mithala sedge and rush',
    spot => color.setHSL(.19 + range(-.014, .014), .20 + spot.wet * .06 + range(-.03, .03), .40 + range(-.04, .04)));
  metrics.sedge = sedge.length;
  forbBatch(forbs, 'Mithala prairie forbs', clump => (clump.tall
    ? color.set('#9a9146')     // the tall composites, going over to seed by midsummer
    : color.set('#57703c'))    // the low ones, still green in the grass
    .offsetHSL(range(-.03, .03), range(-.05, .05), range(-.05, .06)));
  siltBatch(stones, 'Mithala apron stones', () => color.set('#8a8578').offsetHSL(0, range(-.03, .03), range(-.05, .05)), .16);
  metrics.stones = stones.length;

  return {
    group, metrics,
    update(time) { waterMaterial.uniforms.time.value = time; },
  };
}
