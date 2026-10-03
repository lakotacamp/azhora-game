/** The upper Neth's quiet, stony rain-shadow plateau. No towns, invented lakes,
 * dune sea or giant canyon: broad rock backs, shallow intermittent washes and
 * dry rain pans are one continuous, walkable terrain surface. */
import { regionCells, regionOutline } from './region-layout.js';
import { PLAYABLE_SURVEY } from './region-survey.js';
import { hexAt, seamlessTerrainMix, relief } from './region-world.js';
import { createHexBoundaryDistance } from './hex-boundary-distance.js';
import { NETH_HEAD, NETH, courseDistance } from './west-regions.js';

const freeze=Object.freeze, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a),0,1);return t*t*(3-2*t);};
const lerp=(a,b,t)=>a+(b-a)*t, key=c=>`${c.q},${c.r}`;
const point=(x,z)=>freeze({x,z});
export const NETHER_DESERT='Nether Desert';
export const NETHER_DESERT_CELLS=freeze(regionCells(PLAYABLE_SURVEY,NETHER_DESERT).map(freeze));
export const NETHER_DESERT_OUTLINES=freeze(regionOutline(PLAYABLE_SURVEY,NETHER_DESERT).map(freeze));
const cells=new Map(NETHER_DESERT_CELLS.map(c=>[key(c),c]));
const vertices=NETHER_DESERT_OUTLINES.flat();
export const NETHER_DESERT_BOUNDS=freeze({minX:Math.min(...vertices.map(p=>p.x)),maxX:Math.max(...vertices.map(p=>p.x)),
  minZ:Math.min(...vertices.map(p=>p.z)),maxZ:Math.max(...vertices.map(p=>p.z))});
export function netherDesertCellAt(x,z) {
  const b=NETHER_DESERT_BOUNDS;
  if(x<b.minX||x>b.maxX||z<b.minZ||z>b.maxZ)return null;
  return cells.get(key(hexAt(x,z)))??null;
}
export const netherDesertOwns=(x,z)=>netherDesertCellAt(x,z)!==null;
function segmentDistance(x,z,a,b) {
  const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);
  return Math.hypot(x-a.x-dx*t,z-a.z-dz*t);
}
const edges=NETHER_DESERT_OUTLINES.flatMap(loop=>loop.map((a,i)=>[a,loop[(i+1)%loop.length]]));
export const netherDesertInset=createHexBoundaryDistance({cells:NETHER_DESERT_CELLS,edges,cellAt:netherDesertCellAt,
  distanceToEdge:(x,z,[a,b])=>segmentDistance(x,z,a,b)});
// The existing authored Neth is the only permanent water. Keep its whole
// channel and bank profile intact, and blend outward over another broad strip.
export const netherDesertRiverDistance=(x,z)=>Math.min(courseDistance(NETH_HEAD,x,z,80),courseDistance(NETH,x,z,80));
export const NETHER_DESERT_WASHES=freeze([
  freeze({id:'nether-north-wash',width:15,depth:2.7,points:freeze([point(-2945,785),point(-2855,730),point(-2775,717),point(-2710,663),point(-2600,632),point(-2465,593)])}),
  freeze({id:'nether-south-wash',width:12,depth:2.2,points:freeze([point(-2765,852),point(-2670,819),point(-2630,760),point(-2520,708),point(-2415,653)])}),
]);
export const NETHER_DESERT_PANS=freeze([
  freeze({id:'nether-rain-pan',x:-2783,z:720,rx:20,rz:13,depth:1.4}),
  freeze({id:'nether-shallow-bowl',x:-2628,z:781,rx:15,rz:11,depth:1.1}),
  freeze({id:'nether-west-pan',x:-2944,z:784,rx:12,rz:8,depth:.9}),
]);
export const NETHER_DESERT_SHELVES=freeze([
  freeze({id:'nether-split-back',x:-2865,z:621,rx:64,rz:23,yaw:.31,height:4.6}),
  freeze({id:'nether-southern-ledge',x:-2690,z:858,rx:53,rz:20,yaw:-.22,height:3.5}),
  freeze({id:'nether-east-back',x:-2506,z:651,rx:37,rz:17,yaw:.6,height:2.7}),
]);
function ellipse(f,x,z) {
  const co=Math.cos(f.yaw??0),si=Math.sin(f.yaw??0),dx=x-f.x,dz=z-f.z;
  return Math.hypot((dx*co+dz*si)/f.rx,(-dx*si+dz*co)/f.rz);
}
export function netherDesertSurface(x,z) {
  let washDistance=Infinity,washCut=0;
  for(const wash of NETHER_DESERT_WASHES)for(let i=1;i<wash.points.length;i++) {
    const d=segmentDistance(x,z,wash.points[i-1],wash.points[i]);
    washDistance=Math.min(washDistance,d);washCut=Math.max(washCut,wash.depth*(1-smooth(.2,1,d/wash.width)));
  }
  let pan=0,panCut=0,shelf=0,shelfRise=0;
  for(const p of NETHER_DESERT_PANS){const w=1-smooth(.55,1.2,ellipse(p,x,z));pan=Math.max(pan,w);panCut=Math.max(panCut,p.depth*w);}
  for(const p of NETHER_DESERT_SHELVES){const w=1-smooth(.4,1.3,ellipse(p,x,z));shelf=Math.max(shelf,w);shelfRise+=p.height*w;}
  // Long unequal rock backs have a shallow north-easterly fall. The substrate
  // does not switch at hex boundaries, and the washes cut only a few metres.
  const broad=31+5.4*Math.sin((x+2900)*.008+Math.sin(z*.009)*.4)
    +3.2*Math.cos(z*.012-x*.0025)+2.6*smooth(565,830,z);
  const broken=.65*Math.sin(x*.067+z*.037)*Math.cos(z*.059-x*.013);
  return {height:broad+broken+shelfRise-washCut-panCut,washDistance,pan,shelf,
    scrub:(1-smooth(6,25,washDistance))*(1-pan*.84),
    gravel:.5+.5*Math.sin(x*.041+z*.019)*Math.cos(z*.047-x*.022)};
}
export function netherDesertGround(x,z,incoming) {
  if(!netherDesertOwns(x,z))return incoming;
  const inset=netherDesertInset(x,z),river=netherDesertRiverDistance(x,z);
  if(inset<=0||river<=15)return incoming;
  return lerp(incoming,netherDesertSurface(x,z).height,smooth(0,74,inset)*smooth(15,65,river));
}
const natural=(x,z)=>{const m=seamlessTerrainMix(x,z);return m.base+relief(x,z,m.amp,m.wave);};
export const netherDesertHeight=(x,z)=>netherDesertGround(x,z,natural(x,z));
export function netherDesertFeatures(x,z) {
  const s=netherDesertSurface(x,z),d=1;
  return {...s,height:netherDesertHeight(x,z),inset:netherDesertInset(x,z),riverDistance:netherDesertRiverDistance(x,z),
    grade:Math.hypot(netherDesertHeight(x+d,z)-netherDesertHeight(x-d,z),netherDesertHeight(x,z+d)-netherDesertHeight(x,z-d))/(2*d)};
}
const palette={stone:0x9a927d,gravel:0x8e8670,soil:0xa99a7b,pan:0xbab095,scrub:0x8d916f};
function mixColor(a,b,t){let c=0;for(const shift of [0,8,16])c|=Math.round(lerp(a>>shift&255,b>>shift&255,t))<<shift;return c;}
/** Null at the exact boundary lets the ordinary biome blend carry the edge. */
export function netherDesertTint(x,z) {
  if(!netherDesertOwns(x,z)||netherDesertInset(x,z)<2||netherDesertRiverDistance(x,z)<15)return null;
  const s=netherDesertSurface(x,z);
  let c=mixColor(palette.stone,palette.gravel,s.gravel*.65);
  c=mixColor(c,palette.soil,(1-smooth(4,20,s.washDistance))*.6);
  c=mixColor(c,palette.scrub,s.scrub*.52);return mixColor(c,palette.pan,s.pan*.88);
}
export const NETHER_DESERT_LANDMARKS=freeze([
  freeze({id:'nether-split-back',name:'The Split Back',x:-2858,z:624,description:'A low back of fractured stone above the upper Neth’s exposed plateau.'}),
  freeze({id:'nether-rain-pan',name:'The Empty Rain Pan',x:-2783,z:720,description:'A shallow rock bowl holding pale silt and dry cracks. It holds water only after rain.'}),
  freeze({id:'nether-scrub-wash',name:'The Scrub Wash',x:-2632,z:754,description:'Low drought-hardened scrub follows a shallow, interrupted drainage line through the gravel.'}),
  freeze({id:'nether-nethward',name:'The Nethward Slopes',x:-2510,z:647,description:'The stony upland softens into the lower Neth country. The existing river lies beyond its northern rim.'}),
]);
export const NETHER_DESERT_ARRIVAL=point(-2844,694);
/** Unpaved cross-country walks used for traversal checks; there is no built
 * road or extra painted stripe across this unsettled plateau. */
export const NETHER_DESERT_TRAILS=freeze(NETHER_DESERT_LANDMARKS.map(p=>freeze({
  id:`${p.id}-walk`,width:3,points:freeze([NETHER_DESERT_ARRIVAL,point(p.x,p.z)])})));
export const NETHER_DESERT_VIEWS=freeze({
  'nether-desert':freeze({eye:freeze({x:-2804,z:763,y:65}),target:freeze({x:-2826,z:665,y:33})}),
  'nether-desert-pan':freeze({eye:freeze({x:-2754,z:747,y:43}),target:freeze({x:-2783,z:720,y:31})}),
  'nether-desert-wash':freeze({eye:freeze({x:-2609,z:778,y:41}),target:freeze({x:-2632,z:754,y:33.5})}),
});
