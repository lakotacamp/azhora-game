import * as THREE from 'three';
import { finishBuild } from './build-steps.js';

/** Mithala, the city at the meeting of the arms (docs/mithala-city-brief.md, src/mithala-city.js).
 * The interface the world builds against: a root group, metrics, the walking surfaces (bridge decks,
 * the quay, the tower stair) and the map features. The scenery itself is laid in by the next commit. */
export function createMithalaCityScenery(...args){return finishBuild(createMithalaCityScenerySteps(...args));}

export function* createMithalaCityScenerySteps({parent,heightAt,groundHeight,colliders}){
  const root=new THREE.Group();root.name='Mithala - the city at the meeting of the arms';parent.add(root);
  const metrics={buildings:0,gates:0,bridges:0,batches:0,vertices:0,colliders:0};
  const walkSurfaces=[];
  yield;
  return {root,metrics,walkSurfaces,mapFeatures:[]};
}
