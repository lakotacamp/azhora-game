/** Aevis: the Avite bronze city on the east-facing Southern Ascarth coast.
 * The user's chosen atlas hex is authoritative over the older northern-site lore.
 * Landward curtains protect a compact city; its eastern quays face an open sea. */
import { hexOwnerAt, landDistance } from './region-world.js';

const freeze = Object.freeze;
const point = (x, z) => freeze({ x, z });
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export const AEVIS = freeze({
  id: 'aevis', name: 'Aevis', region: 24, regionName: 'Southern Ascarth',
  hex: freeze({ q: -7, r: 126 }), x: -1118, z: 1775, elevation: 11,
  wallHeight: 18, wallThickness: 4, towerHeight: 24,
  arrival: point(-1191, 1778), plaza: point(-1118, 1778), harbor: point(-1056, 1778),
  bounds: freeze({ minX: -1174, maxX: -1064, minZ: 1730, maxZ: 1824 }),
  referenceSolisArea: 100 * 84,
});

export const AEVIS_OUTLINE = freeze([
  [-1174, 1730], [-1104, 1730], [-1064, 1760],
  [-1064, 1804], [-1098, 1824], [-1174, 1824],
].map(([x, z]) => point(x, z)));
/** Deliberately omit the eastern and southeastern edges: no harbor curtain,
 * chain, breakwater fortress or towers enclosing Aevis from the sea. */
export const AEVIS_WALL_EDGES = freeze([0, 1, 4, 5]);
export const AEVIS_AREA = Math.abs(AEVIS_OUTLINE.reduce((sum, a, i) => {
  const b = AEVIS_OUTLINE[(i + 1) % AEVIS_OUTLINE.length];
  return sum + a.x * b.z - b.x * a.z;
}, 0)) / 2;

export function aevisSegmentDistance(x, z, a, b) {
  const dx = b.x - a.x, dz = b.z - a.z, length2 = dx * dx + dz * dz;
  const t = length2 ? clamp(((x - a.x) * dx + (z - a.z) * dz) / length2) : 0;
  return Math.hypot(x - a.x - dx * t, z - a.z - dz * t);
}
export function inAevis(x, z) {
  let inside = false;
  for (let i = 0, j = AEVIS_OUTLINE.length - 1; i < AEVIS_OUTLINE.length; j = i++) {
    const a = AEVIS_OUTLINE[i], b = AEVIS_OUTLINE[j];
    if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) inside = !inside;
  }
  return inside;
}
const boundaryDistance = (x, z) => Math.min(...AEVIS_OUTLINE.map((a, i) => aevisSegmentDistance(x, z, a, AEVIS_OUTLINE[(i + 1) % AEVIS_OUTLINE.length])));
const nearby = (x, z, margin = 0) => x > -1230 - margin && x < -1012 + margin && z > 1685 - margin && z < 1880 + margin;

export const AEVIS_GATES = freeze([
  freeze({ id: 'aevis-bronze-gate', name: 'The Great Bronze Gate', edge: 5, x: -1174, z: 1778, width: 12 }),
  freeze({ id: 'aevis-south-gate', name: 'The Peninsula Gate', edge: 4, x: -1136, z: 1824, width: 10 }),
]);
const path = (id, width, coordinates) => freeze({ id, width, points: freeze(coordinates.map(([x, z]) => point(x, z))) });
export const AEVIS_PATHS = freeze([
  path('aevis-bronze-way', 7, [[-1210, 1778], [-1174, 1778], [-1128, 1778], [-1092, 1778], [-1064, 1778], [-1056, 1778]]),
  path('aevis-peninsula-way', 5, [[-1136, 1860], [-1136, 1824], [-1136, 1817], [-1128, 1817], [-1128, 1778], [-1128, 1739]]),
  path('aevis-citadel-approach', 5, [[-1149, 1778], [-1149, 1769]]),
  path('aevis-veth-approach', 5, [[-1148, 1778], [-1148, 1790]]),
  path('aevis-drill-court', 5, [[-1105, 1778], [-1105, 1765]]),
  path('aevis-quay-walk', 4, [[-1064, 1778], [-1056, 1778], [-1056, 1759]]),
]);

const building = (id, name, x, z, width, depth, height, kind, palette = 0, facing = 0) => freeze({ id, name, x, z, width, depth, height, kind, palette, facing });
export const AEVIS_BUILDINGS = freeze([
  building('aevis-palace', 'The Bronze Citadel', -1149, 1753, 32, 26, 26, 'palace'),
  building('aevis-veth-archives', 'The House of the Veth', -1148, 1803, 31, 22, 13, 'archive', 1, Math.PI),
  building('aevis-arsenal', 'The Bronze Arsenal', -1100, 1754, 14, 14, 15, 'arsenal'),
  building('aevis-lineage-house', 'Warrior Lineage House', -1117, 1749, 10, 16, 13, 'house', 1),
  building('aevis-tin-house', 'The Tin Exchange', -1080, 1768, 15, 10, 11, 'warehouse', 2),
  building('aevis-barracks', 'The Spear Court Barracks', -1089, 1799, 20, 20, 15, 'barracks', 1, Math.PI),
  building('aevis-bronze-guild', 'The Avite Bronze Guild', -1113, 1792, 18, 14, 12, 'forge', 0, Math.PI),
  building('aevis-bull-shrine', 'The Bull-Bronze Shrine', -1114, 1810, 14, 12, 16, 'temple', 2),
  building('aevis-south-guardhouse', 'South Gate Guardhouse', -1162, 1786, 12, 8, 10, 'house', 2),
  building('aevis-north-guardhouse', 'North Gate Guardhouse', -1161, 1770, 12, 6, 10, 'house'),
]);

export const AEVIS_QUAYS = freeze([
  freeze({ id: 'aevis-open-quay', name: 'The Open Bronze Quay', x: -1054, z: 1775, width: 7, depth: 42, elevation: 3.2 }),
  freeze({ id: 'aevis-trade-pier', name: 'The Tin Pier', x: -1040, z: 1778, width: 26, depth: 7, elevation: 3.2 }),
  freeze({ id: 'aevis-war-pier', name: 'The Spear Pier', x: -1041, z: 1759, width: 24, depth: 6, elevation: 3.2 }),
]);
export const AEVIS_BOATS = freeze([
  freeze({ id: 'aevis-bronze-trader', x: -1037, z: 1789, yaw: Math.PI / 2, length: 24, width: 7, kind: 'trader' }),
  freeze({ id: 'aevis-war-galley', x: -1035, z: 1748, yaw: Math.PI / 2, length: 28, width: 6, kind: 'galley' }),
]);
export const AEVIS_SOLDIERS = freeze([
  freeze({ id: 'aevis-west-guard-north', name: 'Avite bronze guard', x: -1170, z: 1775, yaw: -Math.PI / 2, variant: 0 }),
  freeze({ id: 'aevis-west-guard-south', name: 'Avite bronze guard', x: -1170, z: 1781, yaw: -Math.PI / 2, variant: 1 }),
  freeze({ id: 'aevis-palace-guard', name: 'Avite citadel guard', x: -1142, z: 1769, yaw: 0, variant: 2 }),
  ...[[-1113,1764],[-1106,1764],[-1099,1764],[-1113,1770],[-1106,1770],[-1099,1770]].map(([x,z],i) => freeze({ id: `aevis-drill-${i+1}`, name: 'Avite spearman', x, z, yaw: Math.PI / 2, variant: i % 3 })),
  freeze({ id: 'aevis-quay-guard', name: 'Avite harbor guard', x: -1061, z: 1785, yaw: Math.PI / 2, variant: 1 }),
  freeze({ id: 'aevis-south-guard', name: 'Avite bronze guard', x: -1133, z: 1819, yaw: 0, variant: 0 }),
]);
export const AEVIS_LANDMARKS = freeze([
  freeze({ id: 'aevis', name: 'Aevis', region: 24, ...AEVIS.plaza, radius: 80 }),
  freeze({ id: 'aevis-citadel', name: 'The Bronze Citadel', region: 24, x: -1149, z: 1769, radius: 22 }),
  freeze({ id: 'aevis-veth', name: 'The House of the Veth', region: 24, x: -1148, z: 1790, radius: 18 }),
  freeze({ id: 'aevis-harbor', name: 'The Open Bronze Quay', region: 24, ...AEVIS.harbor, radius: 18 }),
]);

/** A continuous, walkable fall from the citadel ridge down to the quays.
 * No artificial shelf extends into saltwater and no neighbouring region changes. */
export function aevisGround(x, z, base) {
  if (!nearby(x, z) || hexOwnerAt(x, z) !== AEVIS.regionName) return base;
  const shore = landDistance(x, z);
  if (shore <= 3) return base;
  const distance = boundaryDistance(x, z);
  const weight = (inAevis(x, z) ? 1 : 1 - smooth(distance / 26)) * smooth((shore - 3) / 10);
  const target = Math.min(14, 8 + (-1100 - x) * .075, 1.5 + shore * .18);
  const town = base + (target - base) * weight;
  // A short continuous paved ramp meets the west edge of the raised quay.
  // Its seaward influence stops on dry land; the deck itself spans the water.
  const quayRamp = smooth((x + 1063) / 5.5) * smooth(Math.min(z - 1751, 1799 - z) / 3)
    * smooth((shore - 3) / 3);
  return town + (3.2 - town) * quayRamp;
}
/** Timber decks stand above the water rather than changing the shoreline. */
export function aevisDeckHeight(x, z) {
  for (const q of AEVIS_QUAYS) if (Math.abs(x-q.x) <= q.width/2 && Math.abs(z-q.z) <= q.depth/2) return q.elevation;
  return null;
}
export function aevisReserved(x, z, margin = 0) {
  if (!nearby(x, z, margin)) return false;
  if (inAevis(x, z) || boundaryDistance(x, z) < 8 + margin) return true;
  if (AEVIS_QUAYS.some(q => Math.abs(x-q.x) < q.width/2 + 4 + margin && Math.abs(z-q.z) < q.depth/2 + 4 + margin)) return true;
  return AEVIS_PATHS.some(p => p.points.some((a,i) => i > 0 && aevisSegmentDistance(x,z,p.points[i-1],a) < p.width/2 + 3 + margin));
}
