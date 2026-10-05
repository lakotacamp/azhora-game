import * as THREE from 'three';
import { finishBuild } from './build-steps.js';
import { createSceneryBuilder } from './scenery-builder.js';
import { westWaterSurface } from './west-ground.js';
import { MITHALA_CITY, MITHALA_DISTRICTS, MITHALA_CURTAIN, MITHALA_GATES, MITHALA_BRIDGES, MITHALA_FORD, MITHALA_QUAY,
  MITHALA_BARGES, MITHALA_STREETS, MITHALA_BUILDINGS, MITHALA_TOWER_STAIR, MITHALA_GAUGE,
  mithalaCityWaterClearance, mithalaSegmentDistance, polygonDepth } from './mithala-city.js';

/**
 * Mithala, the city at the meeting of the arms (docs/mithala-city-brief.md; the layout is src/mithala-city.js and
 * nothing here moves anything it says). Two hands built it, and the scenery keeps them apart:
 *
 *  - **Mithali work** everywhere: stone footings, walls of dark brick of fired flood clay with a tide line where the
 *    spring water stands, pale timber frames, thick reed thatch, granaries on staddle stones, the bridges' warm stone
 *    piers with the flood marks cut in them. Broad and low.
 *  - **The Cref curtain** round the Fork, in cool grey Lotharn ashlar: battered plinth, string course, crenellated
 *    parapet, drum towers at the gates and the corners, and the one stone wall on the plain.
 *
 * Everything stands at the layout's heights (`MITHALA_CITY.platform`, the bridge and quay decks), with footings carried
 * down past whatever ground is under them, so nothing floats if the made ground is a little off; anything in the water
 * goes down to the bed (`groundHeight`). Static geometry is merged by structure and yielded in small batches for Fast
 * mode. The walking surfaces are the three bridge decks, the quay, the floors that stand a step proud of the ground,
 * the gauge's steps and the sky tower's stair, flight by flight.
 */
const TAU = Math.PI * 2;
const P = MITHALA_CITY.platform;

// Mithali work.
const FOOT = '#7c725f', FOOT_DARK = '#625a4b', FOOT_LIGHT = '#91866f';
const BRICKS = ['#4f362b', '#583b2f', '#4a3229', '#5d4134'], STAIN = '#3a2c25', BURNT = '#33241f';
const TIMBER = '#c9b58d', TIMBER_2 = '#baa47d', TIMBER_OLD = '#a99570', TIMBER_DARK = '#7d6b51';
const THATCHES = ['#a6935f', '#9e8c5a', '#ad9a66', '#978656'], THATCH_RIDGE = '#74673f', THATCH_EDGE = '#8b7b50';
const DOOR = '#5e4733', OPENING = '#241e1a', SHUTTER = '#806b4d', BONE = '#d9d0b9';
// The Cref curtain: cool grey Lotharn ashlar, a different hand from everything else on the plain.
const GREYS = ['#8a9196', '#80878c', '#959ca0', '#878e93', '#7b8287'], GREY_DARK = '#676e73', GREY_LIGHT = '#a8aeb1', COPING = '#b4b9bb';
const IRON = '#35383b', ROPE = '#9c8b63', SACKS = ['#c6b18b', '#bca77f', '#cfbb95'], MARK = '#2b2d2f';
const PAVE_FORK = '#795646', PAVE = '#8c7c60', FLAGS = '#9a9283', CLAY_FLOOR = '#a28c68';

// ---------------------------------------------------------------------------
// Small deterministic helpers
// ---------------------------------------------------------------------------
/** A hash in [0, 1) of a few numbers: variation that never changes between loads. */
function rand(...keys) {
  let h = 2166136261;
  for (const v of keys) { h ^= Math.round(v * 977) | 0; h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const pick = (list, ...keys) => list[Math.floor(rand(...keys) * list.length) % list.length];
/** A quad (or triangle) wound so its front face looks along `n`, in the builder's current frame. */
function facing(p, q, r, n) {
  const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2], vx = r[0] - p[0], vy = r[1] - p[1], vz = r[2] - p[2];
  return (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2] >= 0;
}
function quadToward(b, tint, p, q, r, s, n) { if (facing(p, q, r, n)) b.quad(tint, p, q, r, s); else b.quad(tint, s, r, q, p); }
function triToward(b, tint, p, q, r, n) { if (facing(p, q, r, n)) b.triangle(tint, p, q, r); else b.triangle(tint, r, q, p); }
/** A frustum's side (and optionally a top cap) round (x, z): `tint` may be a function of the face index. */
function drum(b, tint, x, y0, z, r0, y1, r1, sides = 16, phase = 0, { inward = false, cap = null } = {}) {
  for (let i = 0; i < sides; i++) {
    const a0 = phase + i * TAU / sides, a1 = phase + (i + 1) * TAU / sides, am = (a0 + a1) / 2, t = typeof tint === 'function' ? tint(i) : tint;
    const n = inward ? [-Math.cos(am), 0, -Math.sin(am)] : [Math.cos(am), 0, Math.sin(am)];
    quadToward(b, t, [x + Math.cos(a0) * r0, y0, z + Math.sin(a0) * r0], [x + Math.cos(a1) * r0, y0, z + Math.sin(a1) * r0],
      [x + Math.cos(a1) * r1, y1, z + Math.sin(a1) * r1], [x + Math.cos(a0) * r1, y1, z + Math.sin(a0) * r1], n);
    if (cap) triToward(b, cap, [x, y1, z], [x + Math.cos(a0) * r1, y1, z + Math.sin(a0) * r1], [x + Math.cos(a1) * r1, y1, z + Math.sin(a1) * r1], [0, 1, 0]);
  }
}
/** A flat ring (or disc, from r0 = 0) facing up. */
function annulus(b, tint, x, y, z, r0, r1, sides = 16) {
  for (let i = 0; i < sides; i++) {
    const a0 = i * TAU / sides, a1 = (i + 1) * TAU / sides;
    const p = (r, a) => [x + Math.cos(a) * r, y, z + Math.sin(a) * r];
    if (r0 > 1e-3) quadToward(b, tint, p(r0, a0), p(r1, a0), p(r1, a1), p(r0, a1), [0, 1, 0]);
    else triToward(b, tint, [x, y, z], p(r1, a0), p(r1, a1), [0, 1, 0]);
  }
}
/**
 * A thick reed-thatch roof over a `w` by `d` wall footprint whose wall plate is at local y = 0, the ridge along local x
 * (turn the frame for a ridge along z). `rise` is the underside's height at the ridge above the plate, so a gable
 * triangle of that height fits exactly under it. Hipped roofs keep one pitch all round; gabled ones show the thatch's
 * thickness at the verges.
 */
function thatchRoof(b, tint, w, d, rise, { hip = true, over = .8, t = .45, edge = THATCH_EDGE, ridge = THATCH_RIDGE } = {}) {
  const hd = d / 2 + over, hw = w / 2 + over, slope = rise / (d / 2), yE = t - slope * over, yR = t + rise;
  const hipIn = hip ? Math.min(hw, hd) : 0;
  const E = [[-hw, yE, -hd], [hw, yE, -hd], [hw, yE, hd], [-hw, yE, hd]], R = [[-hw + hipIn, yR, 0], [hw - hipIn, yR, 0]];
  const down = p => [p[0], p[1] - t, p[2]], Eb = E.map(down), Rb = R.map(down);
  quadToward(b, tint, E[0], E[1], R[1], R[0], [0, 1, -1]); quadToward(b, tint, E[3], E[2], R[1], R[0], [0, 1, 1]);
  quadToward(b, edge, Eb[0], Eb[1], Rb[1], Rb[0], [0, -1, 1]); quadToward(b, edge, Eb[3], Eb[2], Rb[1], Rb[0], [0, -1, -1]);
  quadToward(b, edge, E[0], E[1], Eb[1], Eb[0], [0, 0, -1]); quadToward(b, edge, E[3], E[2], Eb[2], Eb[3], [0, 0, 1]);
  if (hip) {
    triToward(b, tint, E[0], E[3], R[0], [-1, 1, 0]); triToward(b, tint, E[1], E[2], R[1], [1, 1, 0]);
    triToward(b, edge, Eb[0], Eb[3], Rb[0], [1, -1, 0]); triToward(b, edge, Eb[1], Eb[2], Rb[1], [-1, -1, 0]);
    quadToward(b, edge, E[0], E[3], Eb[3], Eb[0], [-1, 0, 0]); quadToward(b, edge, E[1], E[2], Eb[2], Eb[1], [1, 0, 0]);
    for (const [e, r] of [[0, 0], [3, 0], [1, 1], [2, 1]]) b.beam(ridge, E[e], R[r], .32, .26);
  } else {
    for (const [e, r, s] of [[0, 0, -1], [3, 0, -1], [1, 1, 1], [2, 1, 1]]) quadToward(b, edge, E[e], R[r], Rb[r], Eb[e], [s, 0, 0]);
  }
  if (R[1][0] - R[0][0] > .05) b.beam(ridge, [R[0][0] - (hip ? .2 : .1), yR + .05, 0], [R[1][0] + (hip ? .2 : .1), yR + .05, 0], .5, .3);
  else b.box(ridge, 0, yR + .1, 0, .7, .3, .7);
}
/** A gable wall's triangle under `thatchRoof(..., {hip:false})`, in the plane x = `x`. */
function gable(b, tint, x, d, rise, sign) { triToward(b, tint, [x, 0, -d / 2], [x, 0, d / 2], [x, rise, 0], [sign, 0, 0]); }

// ---------------------------------------------------------------------------
// What the layout implies for the masonry: gate gaps, the ways that must stay clear
// ---------------------------------------------------------------------------
const CURTAIN = MITHALA_CITY.curtain, T = CURTAIN.thickness, RING = MITHALA_CURTAIN, NR = RING.length;
const FORK = MITHALA_DISTRICTS.find(d => d.id === 'mithala-fork');
const EDGES = RING.map((a, k) => {
  const c = RING[(k + 1) % NR], len = Math.hypot(c.x - a.x, c.z - a.z), ux = (c.x - a.x) / len, uz = (c.z - a.z) / len;
  let nx = uz, nz = -ux;
  if (nx * ((a.x + c.x) / 2 - FORK.centre.x) + nz * ((a.z + c.z) / 2 - FORK.centre.z) < 0) { nx = -nx; nz = -nz; }
  return { k, a, c, len, ux, uz, nx, nz };
});
const STREET_SEGMENTS = MITHALA_STREETS.flatMap(s => s.points.slice(1).map((q, i) => ({ id: s.id, a: s.points[i], b: q, half: s.width / 2 })));
function streetAt(id, x, z) {
  let best = null;
  for (const seg of STREET_SEGMENTS) if (seg.id === id) {
    const d = mithalaSegmentDistance(x, z, seg.a, seg.b);
    if (!best || d < best.d) best = { d, seg };
  }
  const { a, b, half } = best.seg, l = Math.hypot(b.x - a.x, b.z - a.z);
  return { sx: (b.x - a.x) / l, sz: (b.z - a.z) / l, half };
}
/**
 * Every gate with its geometry: the wall (or bank) line it cuts, the street through it, the passage's half-width square
 * to the street (`pass`), and how far along the wall either side of the gate's centre a square-cut jamb has to stand for
 * its corners to clear that passage (`half`) - wider than half the gate where the street crosses on the skew.
 */
const GATES = MITHALA_GATES.map(g => {
  const line = MITHALA_DISTRICTS.find(d => d.id === g.district).line, a = line[g.edge], c = line[(g.edge + 1) % line.length];
  const len = Math.hypot(c.x - a.x, c.z - a.z), ux = (c.x - a.x) / len, uz = (c.z - a.z) / len, street = streetAt(g.street, g.x, g.z);
  const sin = Math.max(.25, Math.abs(ux * street.sz - uz * street.sx)), cos = Math.abs(ux * street.sx + uz * street.sz);
  const pass = g.width / 2 * sin, thick = g.kind === 'stone' ? T : 0;
  return { ...g, ux, uz, len, s: Math.hypot(g.x - a.x, g.z - a.z), sx: street.sx, sz: street.sz, streetHalf: street.half, sin, cos,
    pass, half: (pass + thick / 2 * cos) / sin };
});
const FORK_GATES = GATES.filter(g => g.kind === 'stone');
/** The gate whose passage (within `reach` of its centre, along its street) a point stands in, widened by `margin`. */
function inPassage(x, z, margin = 0, reach = 14) {
  for (const g of GATES) {
    const dx = x - g.x, dz = z - g.z, along = dx * g.sx + dz * g.sz, across = Math.abs(dz * g.sx - dx * g.sz);
    if (Math.abs(along) < reach && across < g.pass + margin) return g;
  }
  return null;
}
const WAYS = [...STREET_SEGMENTS, ...MITHALA_BRIDGES.map(b => ({ a: b.a, b: b.b, half: b.width / 2 + .6 })),
  { a: MITHALA_FORD.a, b: MITHALA_FORD.b, half: MITHALA_FORD.width / 2 }];
/** Metres from a point to the edge of the nearest street, bridge or ford: negative on one. */
const wayGap = (x, z) => Math.min(...WAYS.map(w => mithalaSegmentDistance(x, z, w.a, w.b) - w.half));
const buildingGap = (x, z) => Math.min(...MITHALA_BUILDINGS.map(b =>
  Math.hypot(Math.max(0, Math.abs(x - b.x) - b.width / 2), Math.max(0, Math.abs(z - b.z) - b.depth / 2))));

/** The curtain's straight runs between its gates, with the ends that meet at a corner mitred to their neighbour. */
const RUNS = (() => {
  const runs = [];
  for (const e of EDGES) {
    const gaps = FORK_GATES.filter(g => g.edge === e.k).map(g => [g.s - g.half, g.s + g.half]).sort((p, q) => p[0] - q[0]);
    let s0 = 0;
    for (const [g0, g1] of [...gaps, [e.len, e.len]]) {
      if (Math.min(g0, e.len) - s0 > .25) runs.push({ e, s0, s1: Math.min(g0, e.len) });
      s0 = Math.max(s0, g1);
    }
  }
  // A run whose square end would stand in a passage (the corner beside a gate) is cut back until it does not.
  const corner = (run, s, side) => ({ x: run.e.a.x + run.e.ux * s + run.e.nx * side * T / 2, z: run.e.a.z + run.e.uz * s + run.e.nz * side * T / 2 });
  const clear = (run, s) => [-1, 1].every(side => { const p = corner(run, s, side); return !inPassage(p.x, p.z, .1, T / 2 + 4); });
  for (const run of runs) {
    while (run.s1 - run.s0 > .5 && !clear(run, run.s0)) run.s0 += .1;
    while (run.s1 - run.s0 > .5 && !clear(run, run.s1)) run.s1 -= .1;
  }
  const kept = runs.filter(r => r.s1 - r.s0 > .9);
  for (const run of kept) {
    const prev = EDGES[(run.e.k + NR - 1) % NR], next = EDGES[(run.e.k + 1) % NR];
    run.mStart = run.s0 < 1e-6 && kept.some(r => r.e === prev && r.s1 > prev.len - 1e-6);
    run.mEnd = run.s1 > run.e.len - 1e-6 && kept.some(r => r.e === next && r.s0 < 1e-6);
  }
  return kept;
})();
function mitre(v, e0, e1, off) {
  let bx = e0.nx + e1.nx, bz = e0.nz + e1.nz; const l = Math.hypot(bx, bz); bx /= l; bz /= l;
  const k = off / (bx * e1.nx + bz * e1.nz);
  return { x: v.x + bx * k, z: v.z + bz * k };
}
/** A run's end, `off` metres out from its centre line (negative is inward). */
function runEnd(run, end, off) {
  const e = run.e;
  if (end === 0 && run.mStart) return mitre(e.a, EDGES[(e.k + NR - 1) % NR], e, off);
  if (end === 1 && run.mEnd) return mitre(e.c, e, EDGES[(e.k + 1) % NR], off);
  const s = end === 0 ? run.s0 : run.s1;
  return { x: e.a.x + e.ux * s + e.nx * off, z: e.a.z + e.uz * s + e.nz * off };
}
/** A point `s` metres along the curtain from the start of edge `k` (wrapping round the ring), with its frame. */
function alongCurtain(k, s) {
  let e = EDGES[((k % NR) + NR) % NR];
  while (s > e.len) { s -= e.len; e = EDGES[(e.k + 1) % NR]; }
  while (s < 0) { e = EDGES[(e.k + NR - 1) % NR]; s += e.len; }
  return { x: e.a.x + e.ux * s, z: e.a.z + e.uz * s, ux: e.ux, uz: e.uz, nx: e.nx, nz: e.nz };
}
/** Coursed ashlar on one face of a run, from p0 to p1: each block its own grey, the courses broken in bond. */
function ashlar(b, p0, p1, y0, y1, n, seed, course = .8, block = 1.7) {
  const L = Math.hypot(p1.x - p0.x, p1.z - p0.z); if (L < .05) return;
  const ux = (p1.x - p0.x) / L, uz = (p1.z - p0.z) / L, rows = Math.max(1, Math.round((y1 - y0) / course)), h = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) {
    const ya = y0 + r * h, yb = ya + h;
    let s = 0, col = 0;
    while (s < L - 1e-4) {
      const e = Math.min(L, col === 0 ? block * (r % 2 ? .5 : .25 + .5 * rand(seed, r)) : s + block * (.8 + .4 * rand(seed, r, col)));
      quadToward(b, pick(GREYS, seed, r, col), [p0.x + ux * s, ya, p0.z + uz * s], [p0.x + ux * e, ya, p0.z + uz * e],
        [p0.x + ux * e, yb, p0.z + uz * e], [p0.x + ux * s, yb, p0.z + uz * s], n);
      s = e; col++;
    }
  }
}

export function createMithalaCityScenery(...args) { return finishBuild(createMithalaCityScenerySteps(...args)); }

export function* createMithalaCityScenerySteps({ parent, heightAt, groundHeight = heightAt, colliders }) {
  const root = new THREE.Group(); root.name = 'Mithala - the city at the meeting of the arms'; parent.add(root);
  const metrics = { buildings: 0, gates: 0, earthGates: 0, bridges: 0, piers: 0, towers: 0, wallSegments: 0, barges: 0,
    stairFlights: 0, batches: 0, vertices: 0, colliders: 0, walkSurfaces: 0 };
  const walkSurfaces = [];
  const push = c => { colliders.push(c); metrics.colliders++; return c; };
  const walk = s => { walkSurfaces.push(s); metrics.walkSurfaces++; return s; };
  const finish = function* (b) { metrics.vertices += b.vertexCount; const m = yield* b.finishSteps(root); if (m) metrics.batches++; return m; };
  const ground = (x, z) => groundHeight(x, z);
  /** The deepest a footing must go under a footprint: a metre and more below the platform, and below any ground. */
  const footing = (x, z, hx = 0, hz = 0, below = 1.2) => Math.min(P - below,
    ...[[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]].map(([i, k]) => ground(x + i * hx, z + k * hz) - .8));
  let work = 0;

  // -------------------------------------------------------------------------
  // The streets: brick-paved inside the Fork, rammed gravel in the other three districts
  // -------------------------------------------------------------------------
  {
    const b = createSceneryBuilder('Mithala - streets');
    const lift = .05, inFork = (x, z) => polygonDepth(FORK.outline, x, z) > 0;
    const strip = (a, c, width, seed) => {
      const dx = c.x - a.x, dz = c.z - a.z, len = Math.hypot(dx, dz), ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
      const n = Math.max(1, Math.ceil(len / 3)), across = [-width / 2, 0, width / 2];
      for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
        const s0 = len * i / n, s1 = len * (i + 1) / n, o0 = across[j], o1 = across[j + 1];
        const p = (s, o) => { const x = a.x + ux * s + nx * o, z = a.z + uz * s + nz * o; return [x, heightAt(x, z) + lift, z]; };
        const mx = a.x + ux * (s0 + s1) / 2, mz = a.z + uz * (s0 + s1) / 2;
        const tint = inFork(mx, mz) ? (rand(seed, i, j) < .5 ? PAVE_FORK : '#72503f') : (rand(seed, i, j) < .5 ? PAVE : '#857559');
        quadToward(b, tint, p(s0, o0), p(s1, o0), p(s1, o1), p(s0, o1), [0, 1, 0]);
      }
    };
    for (const s of MITHALA_STREETS) {
      yield;
      for (let i = 1; i < s.points.length; i++) strip(s.points[i - 1], s.points[i], s.width, i * 31 + s.width);
      // A square of paving at each bend, so the strips meet without a notch.
      for (let i = 1; i < s.points.length - 1; i++) {
        const c = s.points[i], h = s.width / 2;
        const p = (x, z) => [x, heightAt(x, z) + lift + .005, z];
        quadToward(b, inFork(c.x, c.z) ? PAVE_FORK : PAVE, p(c.x - h, c.z - h), p(c.x + h, c.z - h), p(c.x + h, c.z + h), p(c.x - h, c.z + h), [0, 1, 0]);
      }
    }
    yield* finish(b);
  }

  // -------------------------------------------------------------------------
  // The Cref curtain: the runs between the gates
  // -------------------------------------------------------------------------
  {
    const b = createSceneryBuilder('Mithala - the Cref curtain');
    const walkY = P + 8.2, paraY = P + 9, rearY = P + 8.7, merlonY = P + 9.9;
    RUNS.forEach((run, index) => { run.index = index; });
    for (const run of RUNS) {
      yield;
      const e = run.e, n = [e.nx, 0, e.nz], m = [-e.nx, 0, -e.nz], seed = 101 + run.index * 17;
      const mid = { x: (runEnd(run, 0, 0).x + runEnd(run, 1, 0).x) / 2, z: (runEnd(run, 0, 0).z + runEnd(run, 1, 0).z) / 2 };
      const L = run.s1 - run.s0, foot = footing(mid.x, mid.z, 0, 0, 2.2);
      const os = runEnd(run, 0, T / 2), oe = runEnd(run, 1, T / 2), is = runEnd(run, 0, -T / 2), ie = runEnd(run, 1, -T / 2);
      const bs = runEnd(run, 0, T / 2 + .55), be = runEnd(run, 1, T / 2 + .55);
      const ws = runEnd(run, 0, T / 2 - .6), we = runEnd(run, 1, T / 2 - .6), rs = runEnd(run, 0, -T / 2 + .4), re = runEnd(run, 1, -T / 2 + .4);
      const at = (p, y) => [p.x, y, p.z];
      // Below the made ground, plain; above it, coursed ashlar on both faces.
      quadToward(b, GREY_DARK, at(is, foot), at(ie, foot), at(ie, P - .5), at(is, P - .5), m);
      ashlar(b, os, oe, P + 1.3, paraY, n, seed);
      ashlar(b, is, ie, P - .5, rearY, m, seed + 7);
      // The battered plinth on the outer face, the Lotharn masons' signature.
      quadToward(b, GREY_DARK, at(bs, foot), at(be, foot), at(be, P - .35), at(bs, P - .35), n);
      quadToward(b, pick(GREYS, seed, 3), at(bs, P - .35), at(be, P - .35), at(oe, P + 1.3), at(os, P + 1.3), [e.nx, .7, e.nz]);
      // The wall-walk between the outer parapet and the low rear wall.
      quadToward(b, '#8f9598', at(rs, walkY), at(re, walkY), at(we, walkY), at(ws, walkY), [0, 1, 0]);
      quadToward(b, pick(GREYS, seed, 5), at(ws, walkY), at(we, walkY), at(we, paraY), at(ws, paraY), m);
      quadToward(b, pick(GREYS, seed, 6), at(rs, walkY), at(re, walkY), at(re, rearY), at(rs, rearY), n);
      quadToward(b, COPING, at(ws, paraY), at(we, paraY), at(oe, paraY), at(os, paraY), [0, 1, 0]);
      quadToward(b, COPING, at(is, rearY), at(ie, rearY), at(re, rearY), at(rs, rearY), [0, 1, 0]);
      // Square ends (a gate's jamb, or a run cut back from a passage) are dressed full height.
      for (const [end, p, q] of [[0, os, is], [1, oe, ie]]) {
        if (end === 0 ? run.mStart : run.mEnd) continue;
        const out = end === 0 ? [-e.ux, 0, -e.uz] : [e.ux, 0, e.uz];
        quadToward(b, GREY_LIGHT, at(p, foot), at(q, foot), at(q, walkY), at(p, walkY), out);
        quadToward(b, GREY_LIGHT, at(p, walkY), at({ x: p.x - e.nx * .6, z: p.z - e.nz * .6 }, walkY), at({ x: p.x - e.nx * .6, z: p.z - e.nz * .6 }, paraY), at(p, paraY), out);
      }
      // String course under the parapet, and the merlons.
      const yaw = Math.atan2(e.ux, e.uz), sm = (run.s0 + run.s1) / 2;
      const sc = { x: e.a.x + e.ux * sm + e.nx * T / 2, z: e.a.z + e.uz * sm + e.nz * T / 2 };
      b.box(COPING, sc.x, P + 7.45, sc.z, .26, .26, L + (run.mStart ? .3 : 0) + (run.mEnd ? .3 : 0), yaw);
      const count = Math.max(1, Math.round(L / 2.5));
      for (let i = 0; i < count; i++) {
        const s = run.s0 + (i + .5) * L / count;
        b.box(pick(GREYS, seed, i, 9), e.a.x + e.ux * s + e.nx * (T / 2 - .3), (paraY + merlonY) / 2, e.a.z + e.uz * s + e.nz * (T / 2 - .3), .6, merlonY - paraY, 1.25, yaw);
      }
      // Solid along its centre line, from its footing to its merlons.
      const r = T / 2 + .08, k = Math.max(1, Math.ceil((L - 2 * r) / 1.5));
      for (let i = 0; i <= k; i++) {
        const s = L <= 2 * r ? (run.s0 + run.s1) / 2 : run.s0 + r + (L - 2 * r) * i / k;
        push({ x: e.a.x + e.ux * s, z: e.a.z + e.uz * s, r: Math.min(r, L / 2 + .2), minY: foot, maxY: merlonY, kind: 'mithala-curtain', id: `mithala-curtain-${run.index}-${i}` });
        if (L <= 2 * r) break;
      }
      metrics.wallSegments++;
    }
    yield* finish(b);
  }

  // -------------------------------------------------------------------------
  // Drum towers at the gates and the corners, the gatehouses, and the postern
  // -------------------------------------------------------------------------
  const towers = [];
  /** A tower fits where it stays on the curtain, out of every passage, street, bridge, building and other tower. */
  function towerFits(x, z, r) {
    const out = -polygonDepth(RING, x, z);
    if (out < -.6 || out > r - .6) return false;
    if (inPassage(x, z, r + .25, r + 12) || wayGap(x, z) < r + .25 || buildingGap(x, z) < r + .4) return false;
    return !towers.some(t => Math.hypot(t.x - x, t.z - z) < t.r + r + .6);
  }
  function placeTower(ideal, away, out, r) {
    let best = null;
    for (let da = 0; da <= 6.01; da += .25) for (const dn of [0, .3, -.3, .6, -.6, 1, -1, 1.5, 2, 2.5, 3, 3.5]) {
      const x = ideal.x + away.x * da + out.x * dn, z = ideal.z + away.z * da + out.z * dn, cost = da + Math.abs(dn) * 1.4;
      if ((!best || cost < best.cost) && towerFits(x, z, r + .35)) best = { x, z, cost };
    }
    return best;
  }
  const GRAND = 'The Horizon Gate';
  for (const g of FORK_GATES) {
    if (g.name === 'The Water Gate') continue;
    const r = g.name === GRAND ? 3.6 : 2.8, h = g.name === GRAND ? 15 : 12.5;
    for (const side of [-1, 1]) {
      const p = alongCurtain(g.edge, g.s + side * (g.half + r)), away = { x: p.ux * side, z: p.uz * side };
      const spot = placeTower({ x: p.x + p.nx * r * .45, z: p.z + p.nz * r * .45 }, away, { x: p.nx, z: p.nz }, r);
      if (spot) towers.push({ x: spot.x, z: spot.z, r, h, gate: g.id, name: `${g.name} ${side < 0 ? 'left' : 'right'} tower` });
    }
  }
  EDGES.forEach((e, k) => {
    const prev = EDGES[(k + NR - 1) % NR], turn = Math.acos(Math.max(-1, Math.min(1, prev.ux * e.ux + prev.uz * e.uz)));
    if (turn < .5) return;
    const r = 2.8;
    if (towers.some(t => Math.hypot(t.x - e.a.x, t.z - e.a.z) < t.r + r + 3.5)) return;
    let ox = prev.nx + e.nx, oz = prev.nz + e.nz; const l = Math.hypot(ox, oz); ox /= l; oz /= l;
    const spot = placeTower({ x: e.a.x + ox * r * .45, z: e.a.z + oz * r * .45 }, { x: e.ux, z: e.uz }, { x: ox, z: oz }, r)
      ?? placeTower({ x: e.a.x + ox * r * .45, z: e.a.z + oz * r * .45 }, { x: -prev.ux, z: -prev.uz }, { x: ox, z: oz }, r);
    if (spot) towers.push({ x: spot.x, z: spot.z, r, h: 12.5, name: `Mithala corner tower ${k}` });
  });
  const towerBatch = createSceneryBuilder('Mithala - the Cref towers');
  for (const [ti, t] of towers.entries()) {
    yield;
    const b = towerBatch, { x, z, r, h } = t, foot = footing(x, z, r, r, 1.8), top = P + h, seed = 300 + ti * 13, n = 16;
    const away = Math.atan2(z - FORK.centre.z, x - FORK.centre.x);
    drum(b, GREY_DARK, x, foot, z, r + .55, P - .3, r + .55, n);
    drum(b, i => pick(GREYS, seed, i, 1), x, P - .3, z, r + .55, P + 1.6, r, n);
    const courses = Math.max(4, Math.round((h - 2.8) / .85)), ch = (h - 2.8) / courses;
    for (let k = 0; k < courses; k++) drum(b, i => pick(GREYS, seed, k, i), x, P + 1.6 + k * ch, z, r, P + 1.6 + (k + 1) * ch, r, n, k % 2 ? Math.PI / n : 0);
    const yc = top - 1.2;
    drum(b, GREY_DARK, x, yc, z, r, yc + .4, r + .4, n);
    drum(b, i => pick(GREYS, seed, 40, i), x, yc + .4, z, r + .4, top, r + .4, n);
    drum(b, '#8f9598', x, yc + .2, z, r - .15, top + .12, r - .15, n, 0, { inward: true });
    drum(b, COPING, x, top, z, r + .45, top + .12, r + .45, n);
    annulus(b, COPING, x, top + .12, z, r - .15, r + .45, n);
    annulus(b, '#8f9598', x, yc + .2, z, 0, r - .15, n);
    for (let i = 0; i < 8; i++) {
      const a = (i + .5) * TAU / 8;
      b.box(pick(GREYS, seed, i, 7), x + Math.cos(a) * (r + .15), top + .55, z + Math.sin(a) * (r + .15), .6, .9, 1.25, -a);
    }
    // Arrow slits on the field side, two storeys of them.
    for (const y of [P + 4.2, P + 8]) for (const da of [-.55, 0, .55]) {
      const a = away + da + (y > P + 5 ? .27 : 0);
      b.box(MARK, x + Math.cos(a) * (r + .02), y, z + Math.sin(a) * (r + .02), .12, 1.3, .22, -a);
      b.box(GREY_LIGHT, x + Math.cos(a) * (r - .02), y, z + Math.sin(a) * (r - .02), .12, 1.7, .55, -a);
    }
    push({ x, z, r: r + .35, minY: foot, maxY: top + 1, kind: 'city-tower', id: `mithala-tower-${ti}` });
    metrics.towers++;
  }
  yield* finish(towerBatch);
  // The gates themselves: an arched opening in the wall with the parapet carried over it, square jambs, the portcullis
  // up in its slot. The Horizon Gate is a gatehouse: deeper, higher, a gallery over its outer arch and the Cref crown
  // cut above it. The Water Gate is a postern: the wall goes on over a low arch, and no towers.
  {
    const b = createSceneryBuilder('Mithala - the Cref gates');
    for (const g of FORK_GATES) {
      yield;
      const grand = g.name === GRAND, postern = g.name === 'The Water Gate', e = EDGES[g.edge], seed = 500 + g.edge * 7;
      const crown = grand ? 6.4 : postern ? 3.8 : 5.8, spring = grand ? 4.6 : postern ? 2.9 : 4.3, top = grand ? 12 : 9;
      const deep = grand ? 2.6 : 0, half = g.half, o = (e.nx * -e.uz + e.nz * e.ux) > 0 ? 1 : -1;
      // The opening: the whole gap, but a postern's doorway is only a little wider than its lane.
      const open = postern ? Math.min(half, (g.streetHalf + .25) / g.sin) : half;
      const z0 = -T / 2 * o, z1 = (T / 2 + deep) * o, zc = (z0 + z1) / 2, zd = Math.abs(z1 - z0);
      const foot = footing(g.x, g.z, half, half, 2.2);
      b.frame(g.x, 0, g.z, Math.atan2(-e.uz, e.ux), () => {
        // Jambs: dressed piers either side, from the footing to the springing and on into the walls.
        for (const s of [-1, 1]) {
          const jw = half + 1.4 - open;
          b.block(GREY_LIGHT, s * (open + jw / 2), foot, zc, jw, P + crown - foot + .1, zd + .1);
          for (let y = P + .2, k = 0; y < P + spring; y += .9, k++) b.box(pick(GREYS, seed, s, k), s * (open + .65 + (k % 2 ? .1 : 0)), y + .45, zc, 1.4, .82, zd + .16);
        }
        // The block over the passage, ashlar-coursed, with the arch cut on both faces.
        const rows = Math.round((top - crown) / .8);
        for (let k = 0; k < rows; k++) {
          const y = P + crown + k * (top - crown) / rows;
          b.box(pick(GREYS, seed, k, 3), 0, y + (top - crown) / rows / 2, zc, 2 * half + 2.7, (top - crown) / rows - .02, zd);
        }
        b.box(GREY_DARK, 0, P + crown - .05, zc, 2 * open + .2, .1, zd - .1);
        const rise = crown - spring, R = (open * open + rise * rise) / (2 * rise), alpha = Math.asin(open / R), yc = P + crown - R;
        for (const face of [z0, z1]) {
          const fz = face + Math.sign(face) * .02, depth = .7;
          for (let i = 0; i < 9; i++) {
            const a0 = -alpha + 2 * alpha * i / 9, a1 = -alpha + 2 * alpha * (i + 1) / 9, am = (a0 + a1) / 2;
            const vx = Math.sin(am) * (R + .35), vy = yc + Math.cos(am) * (R + .35);
            b.box(i % 2 ? GREY_LIGHT : COPING, vx, vy, fz - Math.sign(face) * depth / 2, 2 * (R + .35) * Math.sin((a1 - a0) / 2) + .04, .7, depth, 0, 0, -am);
            // The spandrel between the arch and the block's square underside.
            const x0 = Math.sin(a0) * R, x1 = Math.sin(a1) * R, ytop = yc + Math.max(Math.cos(a0), Math.cos(a1)) * R;
            if (P + crown - ytop > .05) b.box(pick(GREYS, seed, i, 11), (x0 + x1) / 2, (ytop + P + crown) / 2, fz - Math.sign(face) * depth / 2, Math.abs(x1 - x0) + .02, P + crown - ytop, depth - .04);
          }
        }
        // The portcullis, raised: its teeth show under the arch in the wall's slot.
        if (!postern) {
          b.box(IRON, 0, P + crown - .25, 0, 2 * open - .3, .12, .14);
          for (let x = -open + .35; x <= open - .3; x += .45) b.box(IRON, x, P + crown - .45, 0, .08, .5, .08);
        }
        // Parapet and merlons over the gate, on both faces of a gatehouse.
        b.box(COPING, 0, P + top + .06, zc, 2 * half + 3, .12, zd + .2);
        const merlons = Math.max(2, Math.round((2 * half + 2.6) / 2.4));
        for (const face of grand ? [z0, z1] : [T / 2 * o]) for (let i = 0; i < merlons; i++) {
          const x = -half - 1.3 + (i + .5) * (2 * half + 2.6) / merlons;
          b.box(pick(GREYS, seed, i, 13), x, P + top + .6, face - Math.sign(face) * .3, 1.25, 1, .6);
        }
        if (grand) {
          // A gallery corbelled out over the outer arch, and the crown the Crefs cut over every gate they built.
          for (let i = 0; i < 7; i++) b.box(GREY_DARK, -half + 1 + i * (2 * half - 2) / 6, P + top - 2.2, z1 + o * .35, .5, .7, .7);
          b.box(pick(GREYS, seed, 70), 0, P + top - 1.4, z1 + o * .55, 2 * half - .6, 1, .6);
          b.box(COPING, 0, P + crown + 1.05, z1 + o * .1, 2.4, .32, .2);
          for (let i = -2; i <= 2; i++) b.box(COPING, i * .5, P + crown + 1.42 + (i % 2 ? 0 : .12), z1 + o * .1, .26, .5 + (i % 2 ? 0 : .24), .2, 0, 0, Math.PI / 4);
        }
      });
      // The jambs are solid; the passage between them is not, and nothing overhead comes down into it.
      for (const s of [-1, 1]) for (const zz of grand ? [-.6, .6, T / 2 + deep / 2] : [-.6, .6]) for (const at of open < half - .3 ? [open + .45, half + .7] : [half + .7]) {
        const sx = g.x + e.ux * s * at + e.nx * zz, sz = g.z + e.uz * s * at + e.nz * zz;
        push({ x: sx, z: sz, r: at < half ? .45 : .68, minY: foot, maxY: P + top + 1, kind: 'mithala-curtain', id: `${g.id}-jamb-${s < 0 ? 'l' : 'r'}-${zz}-${at.toFixed(1)}` });
      }
      metrics.gates++;
    }
    yield* finish(b);
  }

  return { root, metrics, walkSurfaces,
    mapFeatures: MITHALA_BUILDINGS.map(b => ({ id: b.id, name: b.name, x: b.x, z: b.z, width: b.width, depth: b.depth, kind: b.kind })) };
}
