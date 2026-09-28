/** Cave floor ownership for the current player controller. The surface heightfield is never
 * changed: only a grounded traveler crossing an open mouth can own a passage floor. */
import { createCaveWalk, nearestPlain } from './east-lotharn-caves.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const finite = p => p && Number.isFinite(p.x) && Number.isFinite(p.z);
const copy = p => p ? { x: p.x, y: p.y, z: p.z } : null;
const gap = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export function validLotharnCaveSave(saved) {
  return saved == null || (saved.version === 1 && typeof saved.id === 'string' && saved.id.length < 100
    && Number.isFinite(saved.along) && saved.along >= 0 && [0, 1].includes(saved.entrance)
    && finite(saved.safeEntrance) && Number.isFinite(saved.safeEntrance.y));
}

export function createLotharnCaveWalk({ caves = [], ground }) {
  const walk = createCaveWalk(caves, ground);
  let entrance = 0, safeEntrance = null;
  const outside = (cave, end) => {
    const s = clamp(cave.openings[end] + (end ? 1.1 : -1.1), 0, cave.length), p = cave.at(s);
    return { x: p.x, y: ground(p.x, p.z), z: p.z };
  };
  const leave = () => { walk.leave(); entrance = 0; safeEntrance = null; };
  const saveCave = saved => {
    if (!saved || !validLotharnCaveSave(saved)) return null;
    const cave = caves.find(c => c.id === saved.id);
    if (!cave || saved.along > cave.length || (saved.entrance && cave.kind === 'chamber')) return null;
    const exit = outside(cave, saved.entrance);
    return gap(exit, saved.safeEntrance) < .1 && Math.abs(exit.y - saved.safeEntrance.y) < .1 ? cave : null;
  };
  return {
    get cave() { return walk.cave; },
    get along() { return walk.along; },
    get active() { return !!walk.cave; },
    get safeEntrance() { return copy(safeEntrance); },
    leave,
    entering(position, dx, dz, { grounded = true, mounted = false, climbing = false, inWater = false } = {}) {
      if (walk.cave || !finite(position) || !Number.isFinite(position.y) || !grounded || mounted || climbing || inWater
        || !Number.isFinite(dx + dz) || Math.hypot(dx, dz) < 1e-7) return null;
      // Checking both the ground and passage floor prevents a player above the mouth or on
      // its roof from acquiring the underground floor merely by sharing its map coordinates.
      if (Math.abs(position.y - ground(position.x, position.z)) > .85) return null;
      for (const cave of caves) {
        const b = cave.path.bounds;
        if (position.x < b.minX - 2 || position.x > b.maxX + 2 || position.z < b.minZ - 2 || position.z > b.maxZ + 2) continue;
        const near = nearestPlain(cave.path, position.x, position.z);
        if (near.distance > cave.half(near.along) - .34 || Math.abs(position.y - cave.floor(near.along)) > .85) continue;
        const p = cave.at(near.along), q = cave.at(clamp(near.along + .5, 0, cave.length));
        const forward = dx * (q.x - p.x) + dz * (q.z - p.z), [open, close] = cave.openings;
        const next = nearestPlain(cave.path, position.x + dx, position.z + dz);
        const lower = forward > 0 && near.along >= open - Math.max(.2, Math.hypot(dx, dz))
          && near.along < open + .8 && next.along >= open;
        const upper = cave.kind !== 'chamber' && forward < 0 && near.along <= close + Math.max(.2, Math.hypot(dx, dz))
          && near.along > close - .8 && next.along <= close;
        if (!lower && !upper) continue;
        entrance = upper ? 1 : 0; safeEntrance = outside(cave, entrance);
        walk.restore({ id: cave.id, along: near.along }); return cave;
      }
      return null;
    },
    move(position, dx, dz, radius = .34) {
      if (!walk.cave) return { outside: true, floor: null };
      // The baseline walker treats line ends as open exits. A chamber instead has a solid
      // far wall; project motion along it rather than letting the traveler leave the room.
      if (walk.cave.kind === 'chamber') {
        const cave = walk.cave, end = cave.at(cave.length), before = cave.at(cave.length - .5);
        const length = gap(end, before) || 1, ux = (end.x - before.x) / length, uz = (end.z - before.z) / length;
        const beyond = (position.x + dx - end.x) * ux + (position.z + dz - end.z) * uz + radius;
        if (beyond > 0) { dx -= beyond * ux; dz -= beyond * uz; }
      }
      const result = walk.move(position, dx, dz, radius);
      if (result.outside) leave();
      return result;
    },
    floorAt(x, z) { return walk.floorAt(x, z); },
    /** Call before a playing frame. A teleport, flight, or mount cannot retain cave support. */
    validate(position, { suspended = false } = {}) {
      if (!walk.cave) return false;
      const cave = walk.cave, near = finite(position) && nearestPlain(cave.path, position.x, position.z);
      const floor = near && cave.floor(near.along);
      if (suspended || !near || near.distance > cave.half(near.along) + .35
        || Math.abs(near.along - walk.along) > 3
        || (Number.isFinite(position.y) && Math.abs(position.y - floor) > cave.height(near.along) + .5)) leave();
      return !!walk.cave;
    },
    snapshot() { return walk.cave ? { version: 1, id: walk.cave.id, along: walk.along, entrance, safeEntrance: copy(safeEntrance) } : null; },
    /** Only an explicit, verified saved cave identity can restore underground ownership. */
    restore(saved, position) {
      leave();
      const cave = saveCave(saved);
      if (!cave || !finite(position)) return null;
      const near = nearestPlain(cave.path, position.x, position.z);
      if (near.distance > cave.half(saved.along) - .25 || Math.abs(near.along - saved.along) > 1) return null;
      walk.restore({ id: cave.id, along: saved.along }); entrance = saved.entrance; safeEntrance = outside(cave, entrance);
      return { x: position.x, y: walk.floorAt(position.x, position.z), z: position.z };
    },
    /** Alternatively, a checkpoint may resume at this explicit entrance, never an x/z guess. */
    savedExit(saved) { const cave = saveCave(saved); return cave ? outside(cave, saved.entrance) : null; },
    camera(position, facing = 0) {
      if (!walk.cave) return null;
      const cave = walk.cave, s = walk.along, p = cave.at(s), q = cave.at(clamp(s + .5, 0, cave.length));
      const forward = Math.sin(facing) * (q.x - p.x) + Math.cos(facing) * (q.z - p.z);
      let back = s, at = p;
      for (let d = 3.4; d >= .8; d -= .3) {
        const b = clamp(s - (forward >= 0 ? d : -d), 0, cave.length), candidate = cave.at(b);
        if ([.25, .5, .75].every(t => {
          const n = nearestPlain(cave.path, candidate.x + (position.x - candidate.x) * t, candidate.z + (position.z - candidate.z) * t);
          return n.distance < cave.half(n.along) - .35;
        })) { back = b; at = candidate; break; }
      }
      return { target: { x: at.x, y: cave.floor(back) + Math.min(2.3, cave.height(back) - .5), z: at.z },
        lookAt: { x: position.x, y: walk.floorAt(position.x, position.z) + 1.45, z: position.z } };
    },
  };
}
