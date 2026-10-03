import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceModule } from './module-loader.js';
import { REGION_CELLS,landDistance,hexOwnerAt,regionAt,SEA_LEVEL } from '../src/region-world.js';
import { groundWithRiver } from '../src/world-terrain.js';
import { canStand } from '../src/game-state.js';
import { LEGEMUM_CELLS,LEGEMUM_BOUNDS,LEGEMUM_LANDMARKS,LEGEMUM_TRAILS,legemumOwns,legemumGround,legemumSlope,legemumTint,legemumShoreTint } from '../src/legemum-world.js';
import { LEGEMUM_WILDLIFE_ZONES } from '../src/legemum-wildlife.js';
import { timberForSpecies } from '../src/wood-species.js';

test('Legemum respects all 24 atlas cells and preserves neighbouring ground and water beds',()=>{
  assert.equal(LEGEMUM_CELLS.length,24);assert.equal(LEGEMUM_CELLS,REGION_CELLS.Legemum);
  let foreign=0,shore=0;
  for(let x=LEGEMUM_BOUNDS.minX-40;x<=LEGEMUM_BOUNDS.maxX+40;x+=11)for(let z=LEGEMUM_BOUNDS.minZ-40;z<=LEGEMUM_BOUNDS.maxZ+40;z+=11){
    assert.equal(legemumGround(x,z,SEA_LEVEL-.2),SEA_LEVEL-.2,'river/sea bed was raised');
    if(!legemumOwns(x,z)){assert.equal(legemumGround(x,z,17.73),17.73);assert.equal(legemumTint(x,z),null);foreign++;}
    if(landDistance(x,z)<=2){assert.equal(legemumGround(x,z,4.2),4.2);shore++;}
  }
  assert.ok(foreign>100&&shore>100);
});

test('Every natural landmark is on dry land and the linking saddles can be walked',()=>{
  for(const p of LEGEMUM_LANDMARKS){assert.equal(hexOwnerAt(p.x,p.z),'Legemum');assert.ok(groundWithRiver(p.x,p.z)>2,p.id);}
  let samples=0;
  for(const path of LEGEMUM_TRAILS)for(let i=1;i<path.points.length;i++){
    const a=path.points[i-1],b=path.points[i],len=Math.hypot(b.x-a.x,b.z-a.z);
    for(let k=0;k<=len;k+=1){const x=a.x+(b.x-a.x)*k/len,z=a.z+(b.z-a.z)*k/len;
      assert.ok(legemumOwns(x,z),`${path.id} leaves the peninsula`);
      assert.ok(groundWithRiver(x,z)>SEA_LEVEL+.5,`${path.id} crosses water`);
      const slope=legemumSlope(x,z,groundWithRiver);assert.ok(slope<.7,`${path.id} grade ${slope} at ${x},${z}`);samples++;
    }
  }
  assert.ok(samples>900);
  const meadow=LEGEMUM_LANDMARKS.find(p=>p.id==='legemum-haur'),headland=LEGEMUM_LANDMARKS.find(p=>p.id==='legemum-west-headland');
  assert.ok(groundWithRiver(headland.x,headland.z)-groundWithRiver(meadow.x,meadow.z)>12,'headland is not distinct from meadow');
});

const THREE=await sourceModule('../vendor/three.module.js');
const {createLegemumScenery}=await sourceModule('../src/legemum-scenery.js');
const {getTreeRegistry}=await sourceModule('../src/tree-registry.js');
const colliders=[],scenery=createLegemumScenery({parent:new THREE.Group(),heightAt:groundWithRiver,colliders});
const world={bounds:LEGEMUM_BOUNDS,heightAt:groundWithRiver,colliders};

test('Legemum has grounded typed trees, varied low flora and bounded render geometry',()=>{
  assert.equal(scenery.metrics.cells,24);assert.ok(scenery.metrics.trees>=20,`${scenery.metrics.trees} trees`);
  const trees=getTreeRegistry(colliders).trees;
  assert.equal(trees.length,scenery.metrics.trees);
  const species=new Set(trees.map(t=>t.species));assert.ok(species.size>=3);
  for(const t of trees){assert.ok(timberForSpecies(t.species),t.id);assert.ok(t.harvestable);assert.equal(t.y,groundWithRiver(t.x,t.z));assert.equal(hexOwnerAt(t.x,t.z),'Legemum');}
  assert.ok(scenery.metrics.grass>800);assert.ok(scenery.metrics.bogPlants>0);assert.ok(scenery.metrics.ferns>0);assert.ok(scenery.metrics.heath>50);assert.ok(scenery.metrics.quartzVeins>=6);
  assert.ok(scenery.metrics.batches<=28,`${scenery.metrics.batches} batches`);assert.ok(scenery.metrics.vertices<550000,`${scenery.metrics.vertices} vertices`);
  for(const mesh of scenery.root.children)assert.ok(Number.isFinite(mesh.geometry.boundingSphere.radius),mesh.name);
  assert.ok(!colliders.some(c=>['house','city-wall','gate-arch'].includes(c.kind)));
});

test('Natural routes and all terrestrial wildlife homes stay clear of scenery',()=>{
  for(const p of LEGEMUM_LANDMARKS)assert.ok(canStand(p.x,p.z,world,.5),p.id);
  for(const path of LEGEMUM_TRAILS)for(let i=1;i<path.points.length;i++){
    const a=path.points[i-1],b=path.points[i],len=Math.hypot(b.x-a.x,b.z-a.z);
    for(let k=0;k<=len;k+=1){const x=a.x+(b.x-a.x)*k/len,z=a.z+(b.z-a.z)*k/len;assert.ok(canStand(x,z,world,.5),`${path.id} scenery obstruction at ${x},${z}`);}
  }
  for(const zone of LEGEMUM_WILDLIFE_ZONES)for(const [x,z]of zone.sites){
    if(zone.air||zone.sea)continue;
    assert.equal(hexOwnerAt(x,z),'Legemum',zone.id);assert.ok(canStand(x,z,world,zone.radius),zone.id);
    assert.ok(legemumSlope(x,z,groundWithRiver)<=zone.maxSlope,zone.id);
  }
});

test('Dolphins and diving sea-plungers stay over actual ocean throughout their ranges',()=>{
  const sea=LEGEMUM_WILDLIFE_ZONES.filter(z=>z.sea||z.plunge);assert.equal(sea.length,2);
  for(const zone of sea){
    const points=zone.sea?Array.from({length:25},(_,i)=>[zone.minX+(zone.maxX-zone.minX)*(i%5)/4,zone.minZ+(zone.maxZ-zone.minZ)*Math.floor(i/5)/4])
      :zone.sites.flatMap(([x,z])=>Array.from({length:36},(_,i)=>[x+Math.cos(i*Math.PI/18)*zone.circle,z+Math.sin(i*Math.PI/18)*zone.circle]));
    for(const [x,z]of points){assert.ok(landDistance(x,z)<-5,`${zone.id} circles over land at ${x},${z}`);assert.ok(groundWithRiver(x,z)<SEA_LEVEL,zone.id);}
  }
});


test('slate headlands color both wet and dry shore vertices without changing sheltered bays',()=>{
  let wet=0,dry=0;
  for(let x=LEGEMUM_BOUNDS.minX;x<LEGEMUM_BOUNDS.maxX;x+=2)for(let z=LEGEMUM_BOUNDS.minZ;z<LEGEMUM_BOUNDS.maxZ;z+=2){
    const d=landDistance(x,z),t=legemumShoreTint(x,z,d);
    if(regionAt(x,z)?.name!=='Legemum'||!(x<-2250||z>1875)){assert.equal(t,null);continue;}
    if(d>=-10&&d<=3){assert.ok(t?.rock>.99,'every triangle across the tide has stone at both ends');if(d<0)wet++;else dry++;}
  }
  assert.ok(wet>40&&dry>20,`${wet} wet and ${dry} dry vertices checked`);
});
