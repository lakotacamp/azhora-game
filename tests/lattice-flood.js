import { canStand, waterAt } from '../src/game-state.js';
import { colliderOverlapsHeight } from '../src/walk-surfaces.js';
import { CLIMBING, isClimbTerrain } from '../src/climbing.js';
import { TERRAIN_FALL } from '../src/terrain-fall.js';
import { nearestPlain } from '../src/east-lotharn-caves.js';

/**
 * **Where can a traveler get to, and what does it cost him?** - asked of the built world, on a lattice, by
 * the game's own rules.
 *
 * Not a test: the measuring tool `tests/varn-world.test.js` and `tests/lotharn-forts.test.js` share.
 *
 *  - **Standing** is `canStand` itself (src/game-state.js), asked of the built world at every lattice
 *    point with a traveler's radius: colliders, water, the world's edge.
 *  - **Walking** is `canWalkSlope`'s rule (src/climbing.js) on the lattice's own heights: in a climbing
 *    country a step up is refused when it rises faster than the grab slope or the face under it is steeper
 *    than that; anywhere else there is no limit; and a step down is always allowed.
 *  - **Falling** is what a step down onto ground too steep to stand on becomes (src/terrain-fall.js): the
 *    body comes down the face to the first ground that holds it. A fall is never refused - the game does
 *    not refuse it - it is **costed**: what a flood answers, for every point, is the least worst single
 *    fall on any way there (`Infinity` where there is no way at all). `LETHAL_FALL` is the fall that kills
 *    a traveler with a hundred health; a fall's damage stops at a hundred, so a traveler with more lives
 *    through any of them, and "no way whatever he is willing to fall" is a cost of `Infinity`.
 *  - **The caves** are ways the surface does not show: a passage walked into at one mouth is walked out of
 *    at the other (src/east-lotharn-caves.js), so the two mouths are one step apart (`caveLinks`).
 *  - **Climbing**, for a flood asked as a climber's, is the controller's rule (`sampleClimbSurface`): in a
 *    climbing country, on a face no steeper than its limit, clear of colliders, and not on rock the world
 *    marks unclimbable. Stamina is not counted, which is the worst case: a climber who never tires.
 *  - With `midpoints`, a step is refused if a collider stands half-way along it, so that a lattice coarser
 *    than something thin cannot step over it. Without, the flood is the more generous, which is the safe
 *    side for saying that somewhere cannot be reached.
 *  - **The peaks' own ways** (`ways(x, z)`): a ramp cut slantwise up a cliff is four metres wide at a grade a
 *    traveler walks, and the game's own check (`canWalkSlope`) reads the face eighty centimetres across; a
 *    lattice a metre apart reads it two metres across, which on a ramp is the cliff either side, so without
 *    this the lattice refuses what the traveler walks. With `ways`, a step between two points on a way is
 *    walked at the walking grade whatever the lattice makes of the face under it.
 */
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const RADIUS = .34;
/** The fall a traveler with a hundred health does not walk away from, in metres. */
export const LETHAL_FALL = TERRAIN_FALL.safeDrop + TERRAIN_FALL.maxDamage / TERRAIN_FALL.damagePerMetre;

/** Sample the built world over a box, `step` metres apart; `use(x, z)` says which points are asked at all. */
export function sampleLattice(world, box, step, use = () => true) {
  const W = Math.round((box.maxX - box.minX) / step) + 1, H = Math.round((box.maxZ - box.minZ) / step) + 1;
  const heights = new Float32Array(W * H).fill(NaN), stand = new Uint8Array(W * H), used = new Uint8Array(W * H), climb = new Uint8Array(W * H), slope = new Float32Array(W * H);
  const region = new Array(W * H).fill(null);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = box.minX + i * step, z = box.minZ + j * step, k = j * W + i;
    if (!use(x, z)) continue;
    used[k] = 1; heights[k] = world.heightAt(x, z); region[k] = world.regionAt(x, z)?.name ?? null;
    stand[k] = canStand(x, z, world, RADIUS, heights[k]) ? 1 : 0; climb[k] = isClimbTerrain(world, x, z) ? 1 : 0;
  }
  for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) {
    const k = j * W + i; if (!used[k]) continue;
    const at = n => (used[n] ? heights[n] : heights[k]);
    slope[k] = Math.hypot(at(k + 1) - at(k - 1), at(k + W) - at(k - W)) / (2 * step);
  }
  const L = { ...box, step, W, H, heights, stand, used, climb, slope, region };
  L.cell = (x, z) => Math.round((z - box.minZ) / step) * W + Math.round((x - box.minX) / step);
  L.at = k => ({ x: box.minX + (k % W) * step, z: box.minZ + Math.floor(k / W) * step });
  /** The nearest point to (x, z) that can be stood on, within `reach` metres; -1 if there is none. */
  L.near = (x, z, reach = 6) => {
    let best = -1, least = reach + 1e-9;
    for (let dz = -reach; dz <= reach; dz += step) for (let dx = -reach; dx <= reach; dx += step) {
      const px = x + dx, pz = z + dz;
      if (px < box.minX || px > box.maxX || pz < box.minZ || pz > box.maxZ) continue;
      const k = L.cell(px, pz), d = Math.hypot(dx, dz);
      if (stand[k] && d < least) { least = d; best = k; }
    }
    return best;
  };
  return L;
}

/**
 * Whether something solid stands at a point, among the colliders `near` answers with: `canStand`'s own
 * test (src/game-state.js), water markers passed over and a collider with a height asked whether it
 * reaches a body standing on the ground there.
 */
function solidAt(near, world, x, z) {
  let feet;
  for (const c of near(x, z)) {
    if (c.kind === 'river-water' || c.kind === 'pond-water') continue;
    if (!(c.r !== undefined ? Math.hypot(x - c.x, z - c.z) < c.r + RADIUS : Math.abs(x - c.x) < c.hx + RADIUS && Math.abs(z - c.z) < c.hz + RADIUS)) continue;
    if ((Number.isFinite(c.minY) || Number.isFinite(c.maxY)) && !colliderOverlapsHeight(c, feet ?? (feet = world.heightAt(x, z)))) continue;
    return true;
  }
  return false;
}

/**
 * The caves as steps: for every passage that goes through (a chimney, a way from one valley to the next),
 * the points a traveler steps into it from at one mouth, joined to the points he steps out onto at the
 * other. The mouth is `createCaveWalk`'s own: within the passage's width of its line, at its opening.
 */
export function caveLinks(L, caves) {
  const links = new Map();
  const mouth = (cave, at, low, high) => {
    const p = cave.at(at), out = new Set();
    for (let dz = -4; dz <= 4; dz += L.step) for (let dx = -4; dx <= 4; dx += L.step) {
      const x = p.x + dx, z = p.z + dz;
      if (x < L.minX || x > L.maxX || z < L.minZ || z > L.maxZ) continue;
      const k = L.cell(x, z), q = L.at(k);
      if (!L.stand[k]) continue;
      const near = nearestPlain(cave.path, q.x, q.z);
      if (near.distance <= cave.half(near.along) - RADIUS && near.along >= low && near.along <= high) out.add(k);
    }
    return [...out];
  };
  const join = (from, to) => { for (const k of from) links.set(k, [...(links.get(k) ?? []), ...to]); };
  for (const cave of caves) {
    if (cave.kind === 'chamber') continue;
    const [open, close] = cave.openings, a = mouth(cave, open, open - 1.3, open + .8), b = mouth(cave, close, close - .8, close + 1.3);
    join(a, b); join(b, a);
  }
  return links;
}

/**
 * Flood a sampled lattice from `seeds` (points, or lattice indices). Options:
 *  - `open`: a predicate on a collider; colliders it answers true for are not there. Opening a gate is
 *    `shutGate`, or a narrower predicate for one gate: the same world, less the colliders that shut it.
 *  - `climber`: flood as a climber as well as a walker; `forbidden(x, z)` is rock that gives no hold.
 *  - `within(x, z)`: ground the flood may use; nothing outside it is entered.
 *  - `links`: steps the surface does not show (`caveLinks`).
 *  - `midpoints`: refuse a step with something solid half-way along it.
 * Returns, for every lattice point, the least worst single fall on any way to it from the seeds, in
 * metres: 0 where it is walked to, `Infinity` where there is no way.
 */
export function leastFall(L, world, seeds, { open = null, climber = false, forbidden = () => false, within = null, links = null, midpoints = false, ways = null } = {}) {
  const { W, H, heights, stand, used, climb, slope, step } = L;
  const onWay = ways ? (L.onWay ??= (() => { const out = new Uint8Array(W * H); for (let k = 0; k < out.length; k++) if (used[k]) { const p = L.at(k); if (ways(p.x, p.z)) out[k] = 1; } return out; })()) : null;
  const near = (x, z) => { const got = world.nearColliders(x, z, RADIUS); return open ? got.filter(c => !open(c)) : got; };
  // A point `canStand` refused may be standable with a gate open: ask again of the colliders that are left.
  const opened = open ? new Int8Array(W * H) : null;
  const ok = k => {
    if (!used[k]) return false;
    if (within) { const p = L.at(k); if (!within(p.x, p.z)) return false; }
    if (stand[k]) return true;
    if (!open) return false;
    if (!opened[k]) { const p = L.at(k); opened[k] = !solidAt(near, world, p.x, p.z) && heights[k] >= waterAt(p.x, p.z, world) ? 1 : -1; }
    return opened[k] > 0;
  };
  const banned = climber ? k => { const p = L.at(k); return forbidden(p.x, p.z); } : null;
  // Where a falling body comes to rest is judged as the game judges it (src/terrain-fall.js): on the ground's own slope
  // read forty centimetres either side of the foot, not the lattice's, which reads it a step either side and so
  // smooths a ridge a metre wide into a shelf a body could stand on.
  // (The same reading decides whether a step down onto a cell is a step or the start of a fall: src/main.js asks
  // `shouldStartTerrainFall` of the surface under the foot, read the same way.)
  const resting = L.resting ??= new Int8Array(W * H);
  const holds = k => {
    if (!resting[k]) { const p = L.at(k), s = .4, gx = (world.heightAt(p.x + s, p.z) - world.heightAt(p.x - s, p.z)) / (2 * s), gz = (world.heightAt(p.x, p.z + s) - world.heightAt(p.x, p.z - s)) / (2 * s); resting[k] = Math.hypot(gx, gz) <= CLIMBING.grabSlope ? 1 : -1; }
    return resting[k] > 0;
  };
  // The least worst fall, by levels of a tenth of a metre, taken in order: a bottleneck Dijkstra.
  const cost = new Float32Array(W * H).fill(Infinity), levels = new Map();
  const push = (k, c) => { const level = Math.round(c * 10); let bucket = levels.get(level); if (!bucket) levels.set(level, bucket = { list: [], head: 0 }); bucket.list.push(k); };
  for (const s of seeds) { const k = typeof s === 'number' ? s : L.cell(s.x, s.z); if (k >= 0 && ok(k) && cost[k] > 0) { cost[k] = 0; push(k, 0); } }
  let level = 0;
  for (;;) {
    const bucket = levels.get(level);
    if (!bucket || bucket.head >= bucket.list.length) {
      levels.delete(level);
      let next = Infinity; for (const key of levels.keys()) if (key > level && key < next) next = key;
      if (next === Infinity) break;
      level = next; continue;
    }
    const k = bucket.list[bucket.head++];
    if (Math.round(cost[k] * 10) !== level) continue;
    const i = k % W, j = (k - i) / W, here = heights[k];
    for (const n of links?.get(k) ?? []) if (ok(n) && cost[k] < cost[n]) { cost[n] = cost[k]; push(n, cost[k]); }
    for (const [a, b] of N8) {
      const ii = i + a, jj = j + b; if (ii < 1 || jj < 1 || ii >= W - 1 || jj >= H - 1) continue;
      let n = jj * W + ii;
      if (!ok(n)) continue;
      if (midpoints && solidAt(near, world, L.minX + (i + a / 2) * step, L.minZ + (j + b / 2) * step)) continue;
      const run = Math.hypot(a, b) * step, rise = heights[n] - here;
      // A diagonal step is a step through one of its two corner cells, as a body a step wide must take it: a rim a cell thick
      // that runs slantwise is not stepped through where two of its stones touch at a corner.
      if (a && b) {
        const wall = m => !ok(m) || heights[m] > here + step * CLIMBING.grabSlope + .08;
        if (wall(j * W + ii) && wall(jj * W + i)) continue;
      }
      const hand = climber && climb[k] && climb[n] && slope[k] <= CLIMBING.maxSlope && slope[n] <= CLIMBING.maxSlope && !banned(k) && !banned(n);
      let fall = 0;
      if (rise > 1e-6) {
        const grade = rise <= run * CLIMBING.grabSlope + .08;
        const walk = !(climb[k] || climb[n]) || (grade && (slope[k] + slope[n]) / 2 <= CLIMBING.grabSlope) || (onWay && grade && onWay[k] && onWay[n]);
        if (!walk && !hand) continue;
      } else if (-rise > TERRAIN_FALL.stepDown && (-rise / run > CLIMBING.grabSlope || !holds(n)) && !hand) {
        // He has stepped off: down the face to the first ground that holds him.
        let land = n;
        for (let guard = 0; guard < 4000 && !holds(land); guard++) {
          const li = land % W, lj = (land - li) / W;
          let best = -1, low = heights[land];
          for (const [c, d] of N8) {
            if (li + c < 1 || lj + d < 1 || li + c >= W - 1 || lj + d >= H - 1) continue;
            const m = (lj + d) * W + li + c;
            if (!ok(m) || heights[m] >= low) continue;
            // A sliding body is a step wide too: it does not pass between two stones of a rim that touch at a corner.
            if (c && d && heights[lj * W + li + c] > heights[land] + .5 && heights[(lj + d) * W + li] > heights[land] + .5) continue;
            low = heights[m]; best = m;
          }
          if (best < 0) break;
          land = best;
        }
        fall = here - heights[land]; n = land;
      }
      const c = Math.max(cost[k], fall);
      if (c >= cost[n]) continue;
      cost[n] = c; push(n, c);
    }
  }
  return cost;
}

/** How much ground of each country a flood reached at no worse than `maxFall`, in square metres. */
export function reachedByCountry(L, cost, maxFall = LETHAL_FALL, where = () => true) {
  const out = {};
  for (let k = 0; k < cost.length; k++) {
    if (!(cost[k] < maxFall)) continue;
    const p = L.at(k);
    if (!where(p.x, p.z, k)) continue;
    const name = L.region[k] ?? 'Open country';
    out[name] = (out[name] ?? 0) + L.step * L.step;
  }
  return out;
}
/** The colliders that shut a gate: what "open the gates" takes away. */
export const shutGate = c => typeof c.kind === 'string' && c.kind.endsWith('gate-shut');
