/** The unwalled, unpeopled eastern Pyrosi country: old volcanic ground, open
 * grass and ash, a greener southern end, and small thermal basins. */
import { PLAYABLE_SURVEY } from './region-survey.js';
import { regionCells, regionOutline } from './region-layout.js';
import { hexOwnerAt, landDistance } from './region-world.js';
import { VAELLIR, courseDistance, coursePosition, courseHalfAt } from './west-regions.js';

const freeze=Object.freeze;
const point=(x,z)=>freeze({x,z});
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{const s=clamp(t);return s*s*(3-2*s);};
const mix=(a,b,t)=>a+(b-a)*t;
const bell=(x,z,c)=>{const d=((x-c.x)/c.rx)**2+((z-c.z)/c.rz)**2;return d<1?(1-d)**2:0;};
export const EAST_PYROS='East Pyros';
export const EAST_PYROS_CELLS=freeze(regionCells(PLAYABLE_SURVEY,EAST_PYROS));
export const EAST_PYROS_OUTLINES=freeze(regionOutline(PLAYABLE_SURVEY,EAST_PYROS));
export const EAST_PYROS_BOX=freeze({minX:-3070,maxX:-2280,minZ:820,maxZ:1660});
export const EAST_PYROS_ARRIVAL=point(-2815,1115);
export const inEastPyrosBox=(x,z)=>x>EAST_PYROS_BOX.minX&&x<EAST_PYROS_BOX.maxX&&z>EAST_PYROS_BOX.minZ&&z<EAST_PYROS_BOX.maxZ;

export function eastPyrosSegment(x,z,a,b){
  const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz,t=l2?clamp(((x-a.x)*dx+(z-a.z)*dz)/l2):0;
  return {distance:Math.hypot(x-a.x-dx*t,z-a.z-dz*t),t};
}
export function eastPyrosBoundaryDistance(x,z){
  let distance=Infinity;
  for(const loop of EAST_PYROS_OUTLINES)for(let i=0;i<loop.length;i++)distance=Math.min(distance,eastPyrosSegment(x,z,loop[i],loop[(i+1)%loop.length]).distance);
  return distance;
}
// Telemonia's border is a zigzag of hex edges, and the nearest of them changes along the lines halfway between
// two: a feather laid off that distance creased there, as a lit band down the slope. Off Telemonia's edges alone
// the distance is a smooth minimum (over SOFT_SEAM metres), so the ground comes down to the rim's foot in one slope.
const SOFT_SEAM=8;
const besideTelemonia=(a,b)=>{const mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;
  return hexOwnerAt(mx-dz/l,mz+dx/l)==='Telemonia'||hexOwnerAt(mx+dz/l,mz-dx/l)==='Telemonia';};
const EAST_PYROS_EDGES=EAST_PYROS_OUTLINES.flatMap(loop=>loop.map((a,i)=>[a,loop[(i+1)%loop.length]]));
const TELEMONIA_EDGES=EAST_PYROS_EDGES.filter(([a,b])=>besideTelemonia(a,b)),OTHER_EDGES=EAST_PYROS_EDGES.filter(([a,b])=>!besideTelemonia(a,b));
function eastPyrosFeatherDistance(x,z){
  let other=Infinity,sum=0;
  for(const [a,b] of OTHER_EDGES)other=Math.min(other,eastPyrosSegment(x,z,a,b).distance);
  for(const [a,b] of TELEMONIA_EDGES)sum+=Math.exp(-eastPyrosSegment(x,z,a,b).distance/SOFT_SEAM);
  return Math.min(other,sum>0?-SOFT_SEAM*Math.log(sum):Infinity);
}
export function eastPyrosRiverClearance(x,z){
  return courseDistance(VAELLIR,x,z)-courseHalfAt(VAELLIR,coursePosition(VAELLIR,x,z));
}
export const EAST_PYROS_SWELLS=freeze([
  freeze({id:'talermolis',x:-2845,z:990,rx:180,rz:150,rise:32}),
  freeze({id:'ash-shoulder',x:-2705,z:1158,rx:152,rz:178,rise:22}),
  freeze({id:'red-ridge',x:-2468,z:1248,rx:91,rz:182,rise:20}),
  freeze({id:'southern-fold',x:-2470,z:1480,rx:118,rz:132,rise:7}),
]);
const dryWash=(id,points,width,depth)=>freeze({id,points:freeze(points.map(([x,z])=>point(x,z))),width,depth});
/** These are dry runnels and shallow gravel fans, not invented perennial rivers. */
export const EAST_PYROS_WASHES=freeze([
  dryWash('talermolis-wash',[[-2797,1037],[-2832,1074],[-2865,1120],[-2878,1153]],11,2.4),
  dryWash('red-stone-wash',[[-2471,1272],[-2518,1310],[-2566,1344],[-2611,1386]],12,1.9),
]);
export function eastPyrosWashAt(x,z){
  let best={distance:Infinity,wash:null};
  for(const wash of EAST_PYROS_WASHES)for(let i=1;i<wash.points.length;i++){
    const p=eastPyrosSegment(x,z,wash.points[i-1],wash.points[i]);if(p.distance<best.distance)best={...p,wash};
  }
  return best;
}
export const EAST_PYROS_ROUTES=freeze([
  freeze({id:'east-pyros-open-valley',width:8,points:freeze([[-2890,1020],[-2860,1050],[-2815,1115],[-2754,1135],[-2667,1222],[-2600,1310],[-2518,1420],[-2460,1500]].map(([x,z])=>point(x,z)))}),
  freeze({id:'east-pyros-red-saddle',width:7,points:freeze([[-2667,1222],[-2585,1188],[-2530,1176],[-2455,1165]].map(([x,z])=>point(x,z)))}),
]);
export const EAST_PYROS_TRAILS=EAST_PYROS_ROUTES;
export function eastPyrosRouteDistance(x,z){
  let best=Infinity;
  for(const route of EAST_PYROS_ROUTES)for(let i=1;i<route.points.length;i++)best=Math.min(best,eastPyrosSegment(x,z,route.points[i-1],route.points[i]).distance);
  return best;
}
export function eastPyrosNaturalHeight(x,z){
  let y=26+Math.sin(x/173)*Math.cos(z/191)*1.1;
  for(const hill of EAST_PYROS_SWELLS)y+=hill.rise*bell(x,z,hill);
  const wash=eastPyrosWashAt(x,z);
  if(wash.wash)y-=wash.wash.depth*(1-smooth(wash.distance/wash.wash.width));
  return y;
}
const pool=(id,name,x,z,radius)=>freeze({id,name,x,z,radius,surfaceY:eastPyrosNaturalHeight(x,z)-1.35,depth:.7});
export const EAST_PYROS_POOLS=freeze([
  pool('east-pyros-warm-spring','The Warm Ash Spring',-2775,1060,7.2),
  pool('east-pyros-green-spring','The Green-Rim Spring',-2515,1390,5.7),
]);
export function eastPyrosWaterAt(x,z){
  if(!inEastPyrosBox(x,z))return null;
  const p=EAST_PYROS_POOLS.find(p=>Math.hypot(x-p.x,z-p.z)<p.radius*.73);
  return p?p.surfaceY:null;
}
export const EAST_PYROS_OUTCROPS=freeze([
  freeze({id:'talermolis-basalt',name:'The Talermolis Basalt',x:-2882,z:968,radius:12,kind:'basalt'}),
  freeze({id:'east-pyros-ash-columns',name:'The Ash Columns',x:-2680,z:1128,radius:17,kind:'basalt'}),
  freeze({id:'east-pyros-red-stone',name:'The Red Stone Fold',x:-2458,z:1280,radius:17,kind:'red-stone'}),
  freeze({id:'east-pyros-pumice',name:'The Pumice Hollow',x:-2548,z:1188,radius:13,kind:'pumice'}),
]);
export const EAST_PYROS_LANDMARKS=freeze([
  freeze({id:'east-pyros-talermolis',name:'The Talermolis Rise',region:57,x:-2860,z:996,radius:58}),
  ...EAST_PYROS_POOLS.map(p=>freeze({...p,x:p.x+p.radius*2.5,region:57,radius:25})),
  ...EAST_PYROS_OUTCROPS.slice(1).map(p=>freeze({...p,x:p.x+p.radius+8,region:57,radius:32})),
  freeze({id:'east-pyros-southern-grass',name:'The Southern Green',region:57,x:-2460,z:1500,radius:45}),
]);
export const EAST_PYROS_VIEWS=freeze({
  'east-pyros':freeze({eye:freeze({x:-2610,z:1290,y:133}),target:freeze({x:-2790,z:1080,y:37})}),
  'east-pyros-springs':freeze({eye:freeze({x:-2739,z:1100,y:64}),target:freeze({x:-2775,z:1060,y:EAST_PYROS_POOLS[0].surfaceY})}),
  'east-pyros-red-stone':freeze({eye:freeze({x:-2388,z:1325,y:75}),target:freeze({x:-2458,z:1280,y:38})}),
  'east-pyros-south':freeze({eye:freeze({x:-2390,z:1530,y:76}),target:freeze({x:-2490,z:1480,y:25})}),
  // The border with Telemonia (src/telemonia-world.js, `telemoniaSeamBedrock`): the rim's foot from under the
  // Red Ridge, and the same foot from over the western rim's outer face.
  'east-pyros-border':freeze({eye:freeze({x:-2440,z:1250,y:47}),target:freeze({x:-2356,z:1242,y:14})}),
  'east-pyros-border-from-telemonia':freeze({eye:freeze({x:-2385,z:1330,y:40}),target:freeze({x:-2450,z:1385,y:24})}),
});

export function eastPyrosGround(x,z,incoming){
  if(!inEastPyrosBox(x,z)||hexOwnerAt(x,z)!==EAST_PYROS)return incoming;
  const shore=landDistance(x,z),edge=eastPyrosBoundaryDistance(x,z),river=eastPyrosRiverClearance(x,z);
  if(shore<=8||edge<.001||river<=25)return incoming;
  const weight=smooth(eastPyrosFeatherDistance(x,z)/72)*smooth((shore-8)/48)*smooth((river-25)/36);
  let target=eastPyrosNaturalHeight(x,z);
  for(const pool of EAST_PYROS_POOLS){
    const r=Math.hypot(x-pool.x,z-pool.z)/pool.radius;
    // The visible water edge and the zero-depth shoreline are the same circle.
    // A low mineral lip then blends into the slope, keeping water from ending
    // halfway up an open, below-water bank on the downhill side.
    if(r<.73)target=pool.surfaceY-pool.depth*(1-smooth((r-.4)/.33));
    else if(r<1.08)target=pool.surfaceY+.35*smooth((r-.73)/.35);
    else if(r<2.2)target=mix(pool.surfaceY+.35,target,smooth((r-1.08)/1.12));
  }
  return mix(incoming,target,weight);
}
/** Moisture comes from shelter and the south; the atlas's eastern margin is dry. */
export function eastPyrosHabitat(x,z){
  const north=bell(x,z,{x:-2860,z:1000,rx:190,rz:165}),south=smooth((z-1390)/170);
  const river=eastPyrosRiverClearance(x,z),wash=eastPyrosWashAt(x,z);
  const moist=Math.max(north*.76,south,river<35?.65:0);
  return {moist,river,washDistance:wash.distance,dry:1-moist,flower:moist>.4};
}
export function eastPyrosTint(x,z){
  if(!inEastPyrosBox(x,z)||hexOwnerAt(x,z)!==EAST_PYROS||eastPyrosBoundaryDistance(x,z)<8||landDistance(x,z)<10)return null;
  const habitat=eastPyrosHabitat(x,z);
  if(EAST_PYROS_POOLS.some(p=>Math.hypot(x-p.x,z-p.z)<p.radius*1.7))return '#afa98c';
  if(habitat.washDistance<5)return '#857d6b';
  if(EAST_PYROS_OUTCROPS.some(p=>p.kind==='red-stone'&&Math.hypot(x-p.x,z-p.z)<p.radius*1.6))return '#a17a61';
  if(habitat.moist>.68)return '#85905a';
  return Math.sin(x*.026+Math.sin(z*.019))>.58?'#82785d':'#aaa06a';
}
export function eastPyrosClear(x,z,margin=0){
  if(Math.hypot(x-EAST_PYROS_ARRIVAL.x,z-EAST_PYROS_ARRIVAL.z)<8+margin)return true;
  if(EAST_PYROS_LANDMARKS.some(p=>Math.hypot(x-p.x,z-p.z)<5+margin))return true;
  if(eastPyrosRouteDistance(x,z)<4.5+margin)return true;
  return EAST_PYROS_POOLS.some(p=>Math.hypot(x-p.x,z-p.z)<p.radius*1.7+margin);
}
