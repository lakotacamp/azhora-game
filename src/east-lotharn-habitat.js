/** Local soil and shelter for the Lotharn's supplementary woods. Pure numeric
 * sampling: callers supply the ground currently used by the regional builder.
 * Heights alone do not make a tree line in this warm, wet mountain range. */
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };

export function lotharnWoodlandHabitat(x, z, heightAt) {
  const height = heightAt(x, z), step = 2;
  const east = heightAt(x + step, z), west = heightAt(x - step, z);
  const north = heightAt(x, z - step), south = heightAt(x, z + step);
  const slope = Math.hypot(east - west, south - north) / (step * 2);
  // The footprint check also catches a narrow shelf between two sheer faces.
  const ledge = Math.max(...[east, west, north, south].map(y => Math.abs(y - height))) / step;
  const around = [heightAt(x + 18, z), heightAt(x - 18, z), heightAt(x, z - 18), heightAt(x, z + 18)];
  if (![height, slope, ledge, ...around].every(Number.isFinite)) return { height, slope, shelter: 0, soil: 0, density: 0 };
  const hollow = around.reduce((sum, y) => sum + y - height, 0) / 4;
  const shelter = clamp(.32 + hollow / 18 + (Math.max(around[1], around[2]) - height) / 40);
  const soil = 1 - smooth(.4, 1.1, Math.max(slope, ledge));
  // Coherent pockets of deeper soil, not independent tree-by-tree noise.
  const pocket = .5 + .28 * Math.sin(x / 43 + Math.sin(z / 71)) + .22 * Math.sin(z / 31 - x / 97);
  const shoulder = 235 + shelter * 105 + pocket * 32;
  const density = soil * (.42 + .58 * shelter) * (.65 + .35 * pocket)
    * (1 - smooth(shoulder - 70, shoulder + 20, height));
  return { height, slope, shelter, soil, density };
}

/** Match the six bottom vertices of the rendered trunk, burying its highest
 * exposed root by three centimetres even on a sloping terrain triangle. */
export function lotharnTreeFoot(tree, surfaceAt) {
  let lowest = Infinity;
  for (let i = 0; i < 6; i++) {
    const angle = tree.rot + i / 6 * Math.PI * 2;
    lowest = Math.min(lowest, surfaceAt(tree.x + Math.sin(angle) * .36 * tree.s, tree.z + Math.cos(angle) * .36 * tree.s));
  }
  return lowest - .03;
}

/** Rows for a narrow crest-aligned terrain ribbon. Outside turns use circular
 * joins; inside turns meet at the offset lines' intersection. A regular world
 * grid can miss a narrow ridge's apex even when its samples are half a metre apart. */
export function lotharnCrestRows(line, step = .4) {
  const segments = line.slice(1).map((b, i) => {
    const a = line[i], dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz);
    return { a, b, dx: dx / length, dz: dz / length, nx: -dz / length, nz: dx / length, length };
  });
  const join = (a, b) => {
    const cross = a.dx * b.dz - a.dz * b.dx, dot = a.dx * b.dx + a.dz * b.dz;
    return cross > 1e-6 && dot > -.95 ? { nx: (a.nx + b.nx) / (1 + dot), nz: (a.nz + b.nz) / (1 + dot) } : null;
  };
  const rows = [];
  const add = row => {
    const last = rows.at(-1);
    if (!last || Math.hypot(last.x - row.x, last.z - row.z, last.nx - row.nx, last.nz - row.nz) > 1e-8) rows.push(row);
  };
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i], next = segments[i + 1];
    const from = i ? join(segments[i - 1], s) ?? s : s, to = next ? join(s, next) ?? s : s;
    const count = Math.max(1, Math.ceil(s.length / step));
    for (let j = 0; j <= count; j++) {
      const t = j / count;
      add({ x: s.a.x + (s.b.x - s.a.x) * t, z: s.a.z + (s.b.z - s.a.z) * t,
        nx: from.nx + (to.nx - from.nx) * t, nz: from.nz + (to.nz - from.nz) * t });
    }
    if (next && !join(s, next)) {
      const start = Math.atan2(s.nz, s.nx), turn = Math.atan2(s.nx * next.nz - s.nz * next.nx, s.nx * next.nx + s.nz * next.nz);
      const count = Math.max(1, Math.ceil(Math.abs(turn) / .1));
      for (let j = 1; j <= count; j++) {
        const angle = start + turn * j / count;
        add({ x: s.b.x, z: s.b.z, nx: Math.cos(angle), nz: Math.sin(angle) });
      }
    }
  }
  return rows;
}
