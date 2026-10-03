import { canStand, moveCharacter } from './game-state.js';
import { AEVIS, AEVIS_PATHS, AEVIS_LANDMARKS, AEVIS_WALL_EDGES, AEVIS_OUTLINE, aevisDeckHeight } from './aevis-city.js';
import { AEVIS_SOLDIERS } from './aevis-soldiers.js';

/** Verify the new city's live streamed scenery, waterfront support and troop stands. */
export function runAevisChecks(world, npcById) {
  const checks=[];
  const check=(ok,label)=>{if(!ok)throw new Error(`Aevis: ${label}`);checks.push(label);};
  check(world.aevis.metrics.buildings>=10,'The entire bronze city has streamed');
  for(const p of [AEVIS.arrival,...AEVIS_LANDMARKS,...AEVIS_SOLDIERS]) {
    check(canStand(p.x,p.z,world,.45),`${p.id??'arrival'} has clear, supported footing`);
    if(aevisDeckHeight(p.x,p.z)===null)check(world.regionAt(p.x,p.z).id===24,`${p.id??'arrival'} belongs to Southern Ascarth`);
  }
  for(const soldier of AEVIS_SOLDIERS) {
    const actor=npcById.get(soldier.id)?.actor;
    check(!!actor?.group.getObjectByName('Avite segmented bronze cuirass'),`${soldier.id} uses the distinct bronze soldier model`);
  }
  let distance=0,maxGrade=0;
  for(const path of AEVIS_PATHS)for(const points of [path.points,[...path.points].reverse()]) {
    const pos={...points[0],y:world.heightAt(points[0].x,points[0].z)};
    for(let i=1;i<points.length;i++) {
      const target=points[i],steps=Math.ceil(Math.hypot(target.x-pos.x,target.z-pos.z)/.2);
      const dx=(target.x-pos.x)/steps,dz=(target.z-pos.z)/steps;
      for(let j=0;j<steps;j++) {
        const old={...pos};moveCharacter(pos,dx,dz,world,.45);pos.y=world.heightAt(pos.x,pos.z);
        const travel=Math.hypot(pos.x-old.x,pos.z-old.z);distance+=travel;
        if(travel>.001)maxGrade=Math.max(maxGrade,Math.abs(pos.y-old.y)/travel);
      }
      check(Math.hypot(pos.x-target.x,pos.z-target.z)<.12,`${path.id} waypoint ${i} is reachable in both directions (${pos.x.toFixed(2)},${pos.z.toFixed(2)})`);
    }
  }
  check(maxGrade<1,`Streets and waterfront approaches remain walkable (grade ${maxGrade.toFixed(3)})`);
  const i=AEVIS_WALL_EDGES[0],a=AEVIS_OUTLINE[i],b=AEVIS_OUTLINE[(i+1)%AEVIS_OUTLINE.length];
  check(!canStand((a.x+b.x)/2,(a.z+b.z)/2,world),'Landward fortifications have physical collision');
  return {ok:true,checks,metresWalked:Math.round(distance),maxGrade,metrics:world.aevis.metrics};
}
