import { createSceneryBuilder } from './scenery-builder.js';
import { MITHALA_CITY, MITHALA_BUILDINGS, MITHALA_TOWER_STAIR } from './mithala-city.js';
import { P, BRICKS, TIMBER, THATCHES, FOOT, rand, pick, thatchRoof, gable, quadToward, triToward, drum, annulus } from './mithala-city-parts.js';

/** Mithala's buildings (docs/mithala-city-brief.md; footprints and heights from `MITHALA_BUILDINGS` in
 * src/mithala-city.js): the old seat's hall and court, the houses, the Braid Bank's byres, barn and pens, the Quays'
 * granaries, weighing house and factors' halls, the Ford's inns, smithy and market, and the sky tower with its stair.
 * Called by `createMithalaCityScenerySteps` with that module's root, collider list, walking surfaces and metrics; it
 * makes and finishes its own merged batches. */
export function* createMithalaCityBuildingSteps({ root, groundHeight, colliders, walkSurfaces, metrics }) {
  yield;
}
