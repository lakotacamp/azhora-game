import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceModule } from './module-loader.js';
import { NETHER_DESERT_CELLS, NETHER_DESERT_OUTLINES, NETHER_DESERT_BOUNDS, NETHER_DESERT_ARRIVAL,
  NETHER_DESERT_LANDMARKS, NETHER_DESERT_TRAILS, NETHER_DESERT_PANS, netherDesertOwns,
  netherDesertGround, netherDesertTint, netherDesertInset, netherDesertFeatures,
  netherDesertRiverDistance } from '../src/nether-desert-world.js';
import { NETHER_DESERT_WILDLIFE_ZONES } from '../src/nether-desert-wildlife.js';
import { NETH_HEAD, NETH } from '../src/west-regions.js';
import { courseSurface } from '../src/west-ground.js';
import { groundWithRiver } from '../src/world-terrain.js';
import { regionAt } from '../src/region-world.js';

test('The Nether Desert owns all 26 atlas cells without changing neighbouring ground',()=>{
  assert.equal(NETHER_DESERT_CELLS.length,26);
  for(const c of NETHER_DESERT_CELLS){assert.ok(netherDesertOwns(c.x,c.z));assert.equal(regionAt(c.x,c.z).name,'Nether Desert');}
  for(const [x,z] of [[0,0],[-2650,300],[-3200,720],[-2100,800]]) {
    assert.equal(netherDesertGround(x,z,17.234),17.234);assert.equal(netherDesertTint(x,z),null);
  }
});

test('The stony plateau contribution fades continuously at every authored boundary edge',()=>{
  let checked=0;
  for(const loop of NETHER_DESERT_OUTLINES)for(let i=0;i<loop.length;i++) {
    const a=loop[i],b=loop[(i+1)%loop.length],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);
    for(const t of [.2,.5,.8])for(const sign of [-1,1]) {
      const x=a.x+dx*t+dz/len*.06*sign,z=a.z+dz*t-dx/len*.06*sign;
      assert.ok(Math.abs(netherDesertGround(x,z,17)-17)<.001,`edge ${x},${z}`);checked++;
    }
  }
  assert.ok(checked>100);
});

test('The upper and lower Neth retain their real water level and unobstructed channel',()=>{
  for(const river of [NETH_HEAD,NETH])for(const p of river.samples) {
    for(const offset of [-3,0,3]) {
      const x=p.x+p.nx*offset,z=p.z+p.nz*offset;
      assert.equal(netherDesertGround(x,z,2.375),2.375,`${river.id}: channel was changed`);
    }
    assert.ok(groundWithRiver(p.x,p.z)<courseSurface(river,p.x,p.z),`${river.id}: dry river bed`);
  }
});

test('The interior stays a modest walkable plateau with shallow dry pans and no dune-sized mountains',()=>{
  const b=NETHER_DESERT_BOUNDS;let samples=0,high=-Infinity,low=Infinity,maxGrade=0;
  for(let x=b.minX;x<b.maxX;x+=12)for(let z=b.minZ;z<b.maxZ;z+=12) {
    if(!netherDesertOwns(x,z)||netherDesertInset(x,z)<74||netherDesertRiverDistance(x,z)<65)continue;
    const f=netherDesertFeatures(x,z);samples++;high=Math.max(high,f.height);low=Math.min(low,f.height);maxGrade=Math.max(maxGrade,f.grade);
    assert.ok(f.height>20&&f.height<46);assert.ok(f.grade<.68,`steep plateau ${x},${z}: ${f.grade}`);
  }
  assert.ok(samples>400);assert.ok(high-low>7,'The plateau should still have readable low relief.');
  for(const p of NETHER_DESERT_PANS){const f=netherDesertFeatures(p.x,p.z);assert.equal(f.pan,1);assert.ok(p.depth<1.5);}
});

test('Arrival and natural landmark walks are fully inside the region and comfortable on the actual ground',()=>{
  assert.ok(NETHER_DESERT_LANDMARKS.length>=4);
  for(const path of NETHER_DESERT_TRAILS) {
    const [a,b]=path.points,len=Math.hypot(b.x-a.x,b.z-a.z);
    assert.deepEqual(a,NETHER_DESERT_ARRIVAL);
    for(let t=0;t<=1;t+=1/Math.ceil(len/1.5)) {
      const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
      assert.ok(netherDesertOwns(x,z));
      const grade=Math.hypot(groundWithRiver(x+1,z)-groundWithRiver(x-1,z),groundWithRiver(x,z+1)-groundWithRiver(x,z-1))/2;
      assert.ok(grade<.63,`${path.id} ${x},${z}: ${grade}`);
    }
  }
});

test('Sparse desert wildlife has terrestrial homes on gentle dry habitat, including wash browsers and basking lizards',()=>{
  const species=new Set(NETHER_DESERT_WILDLIFE_ZONES.map(z=>z.species));
  for(const s of ['spine-lizard','upland-hare','canyon-tortoise','bone-bird'])assert.ok(species.has(s),s);
  let groundAnimals=0;
  for(const zone of NETHER_DESERT_WILDLIFE_ZONES)for(const [x,z] of zone.sites) {
    assert.ok(netherDesertOwns(x,z));const f=netherDesertFeatures(x,z);
    assert.ok(f.riverDistance>20);assert.ok(f.inset>12);
    if(zone.air)continue;
    groundAnimals++;assert.ok(f.grade<=zone.maxSlope);assert.ok(f.height>=zone.minHeight&&f.height<=zone.maxHeight);
    if(zone.species!=='spine-lizard')assert.ok(f.washDistance<24,'Browsers need wash vegetation.');
  }
  assert.ok(groundAnimals>=10&&groundAnimals<=18);
});

test('Desert scenery is bounded, grounded, visibly collidable only at real slabs and clear along natural walks',async()=>{
  const THREE=await sourceModule('../vendor/three.module.js');
  const {createNetherDesertScenerySteps}=await sourceModule('../src/nether-desert-scenery.js');
  const parent=new THREE.Group(),colliders=[];
  // Distinct rendered surface verifies every prop uses the supplied mesh height
  // callback, rather than silently reverting to the logical height field.
  const rendered=(x,z)=>groundWithRiver(x,z)+.12;
  const it=createNetherDesertScenerySteps({parent,heightAt:groundWithRiver,renderedGroundHeight:rendered,colliders});
  let step,n=0;do{step=it.next();n++;}while(!step.done);
  const s=step.value;
  assert.ok(n>100,'Fast mode needs cooperative yields.');
  assert.equal(s.metrics.cells,26);assert.equal(s.metrics.pans,3);
  assert.ok(s.metrics.vertices<340000,`${s.metrics.vertices} vertices`);assert.ok(s.metrics.batches<=30);
  assert.ok(s.metrics.shrubs>100&&s.metrics.rocks>1000&&s.metrics.tufts>100);
  for(const p of s.placements) {
    assert.ok(netherDesertOwns(p.x,p.z));
    if(p.kind!=='rock')assert.ok(Math.abs(p.y-rendered(p.x,p.z))<1e-8,`${p.kind}: not grounded`);
    else assert.ok(p.y<=rendered(p.x,p.z));
  }
  assert.equal(s.metrics.colliders,colliders.length);assert.ok(colliders.length>0&&colliders.length<25);
  for(const c of colliders){assert.equal(c.kind,'rock');assert.ok(c.maxY-c.minY<1.3);assert.ok(c.maxY>rendered(c.x,c.z));}
  for(const path of NETHER_DESERT_TRAILS) {
    const [a,b]=path.points,len=Math.hypot(b.x-a.x,b.z-a.z);
    for(let d=0;d<=len;d+=1)for(const c of colliders)
      assert.ok(Math.hypot(a.x+(b.x-a.x)*d/len-c.x,a.z+(b.z-a.z)*d/len-c.z)>c.r+.7,`${path.id}: slab blocks the walk`);
  }
  for(const child of s.root.children){assert.ok(child.isMesh);assert.ok(child.geometry.boundingSphere.radius<100);}
  // Every pan's first triangle must face upward, otherwise the dry silt vanishes.
  for(const p of NETHER_DESERT_PANS){const mesh=s.root.children.find(m=>m.name===`Nether Desert — ${p.id}`);assert.ok(mesh.geometry.attributes.normal.getY(0)>.8);}
});
