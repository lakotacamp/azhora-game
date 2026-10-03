import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceModule } from './module-loader.js';
import { REGION_CELLS,landDistance,hexOwnerAt,regionAt,SEA_LEVEL } from '../src/region-world.js';
import { groundWithRiver } from '../src/world-terrain.js';
import { canStand } from '../src/game-state.js';
import { LEGEMUM_CELLS,LEGEMUM_BOUNDS,LEGEMUM_LANDMARKS,LEGEMUM_TRAILS,legemumOwns,legemumGround,legemumSlope,legemumTint,legemumShoreTint } from '../src/legemum-world.js';
import { LEGEMUM_WILDLIFE_ZONES } from '../src/legemum-wildlife.js';
import { timberForSpecies } from '../src/wood-species.js';
import { GALA_TELEMONIA_STREAM,GALA_TELEMONIA_MOUTH,courseDistance } from '../src/west-regions.js';
import { WEST_PROFILES,westWaterSurface,courseSample } from '../src/west-ground.js';
import { scopedWorld } from './scoped-world.js';

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


/**
 * **The Treloss reaches the sea** (2026-10-03). Gala's western border stream comes down its last atlas edge
 * between Gala and Legemum to the shore. Built with Gala when Legemum was outland, it stopped forty-two metres
 * short of the coast, and once Legemum had ground of its own it ran into a bank 2.4 m high there. Its mouth
 * (`GALA_TELEMONIA_MOUTH`, src/west-regions.js) carries it on to the water. Asked of a world built as the game
 * builds it, scoped to Gala, Legemum and Telemonia, over the stream's last 150 m and the whole of the mouth.
 */
test('The Treloss runs on to the sea down the Legemum border: one falling water, no wall, banks walked to the shore',async()=>{
  const scene=new THREE.Scene(),scoped=await scopedWorld(scene,[22,59,55]),H=(x,z)=>scoped.heightAt(x,z);
  const stream=WEST_PROFILES.get(GALA_TELEMONIA_STREAM.id),mouth=WEST_PROFILES.get(GALA_TELEMONIA_MOUTH.id),end=mouth.at(-1);
  const along=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
  const at=p=>`${p.x.toFixed(1)}, ${p.z.toFixed(1)}`;
  // One water: the mouth begins where the stream stops, at its level, and falls every sample to the sea's.
  assert.ok(Math.hypot(mouth[0].x-stream.at(-1).x,mouth[0].z-stream.at(-1).z)<1e-6&&Math.abs(mouth[0].surface-stream.at(-1).surface)<1e-6,'a step where the mouth takes over');
  const last=[...stream.filter(s=>landDistance(s.x,s.z)<150),...mouth.slice(1)];
  assert.ok(last.length>35);
  for(let i=1;i<last.length;i++){
    const a=last[i-1],b=last[i],run=Math.hypot(b.x-a.x,b.z-a.z),drop=a.surface-b.surface;
    assert.ok(drop>0,`the Treloss climbs at ${at(b)}`);
    assert.ok(drop<.6&&drop/run<.22,`a step of ${drop.toFixed(2)} m in ${run.toFixed(1)} m at ${at(b)}`);
  }
  assert.ok(landDistance(end.x,end.z)<0&&Math.abs(end.surface-SEA_LEVEL)<.08,`it ends at ${end.surface.toFixed(2)} m, ${landDistance(end.x,end.z).toFixed(1)} m from the sea`);
  // Down the centre line every half metre: water the whole way, and the bed always under it.
  for(let i=1;i<last.length;i++)for(let t=0;t<1;t+=.1){
    const p=along(last[i-1],last[i],t),w=westWaterSurface(p.x,p.z);
    assert.notEqual(w,null,`the Treloss runs out at ${at(p)}`);
    assert.ok(H(p.x,p.z)<w,`its bed stands ${(H(p.x,p.z)-w).toFixed(2)} m over its water at ${at(p)}`);
  }
  // Past its end the beach is already under the sea: nothing stands the water up at the shore.
  const prev=mouth.at(-2),run=Math.hypot(end.x-prev.x,end.z-prev.z);
  for(let d=0;d<=8;d+=.5){const x=end.x+(end.x-prev.x)/run*d,z=end.z+(end.z-prev.z)/run*d;assert.ok(H(x,z)<=end.surface+.05,`a lip at the mouth, ${d} m past its end`);}
  // The banks: a metre past the water's edge the ground stands under a metre over the water, both sides, the whole
  // way; and from the corner where Telemonia's rim stops, on Gala's and Legemum's ground, no slope across them is a cliff.
  for(const s of last)for(const side of[-1,1]){
    const x=s.x+s.nx*side*(s.half+1),z=s.z+s.nz*side*(s.half+1);
    assert.ok(H(x,z)-s.surface<1,`a bank ${(H(x,z)-s.surface).toFixed(2)} m over the water at ${x.toFixed(1)}, ${z.toFixed(1)}`);
    if(landDistance(s.x,s.z)>62)continue;
    for(let r=s.half;r<s.half+24;r+=.5){
      const px=s.x+s.nx*side*r,pz=s.z+s.nz*side*r,qx=s.x+s.nx*side*(r+.5),qz=s.z+s.nz*side*(r+.5);
      if(hexOwnerAt(px,pz)==='Telemonia')continue;
      assert.ok(Math.abs(H(qx,qz)-H(px,pz))/.5<1,`a cliff ${r.toFixed(1)} m off the Treloss at ${px.toFixed(1)}, ${pz.toFixed(1)}`);
    }
  }
  // Both banks walked down to the beach, three metres off the water, and the water itself waded wherever it is
  // above the sea's reach: no wall of deep water, nothing growing or lying in it.
  for(const side of[-1,1]){
    let reached=Infinity;
    for(let i=1;i<mouth.length;i++)for(let t=0;t<1;t+=.1){
      const p=along(mouth[i-1],mouth[i],t),s=mouth[i],x=p.x+s.nx*side*(s.half+3),z=p.z+s.nz*side*(s.half+3);
      if(H(x,z)<.6)continue;
      assert.ok(canStand(x,z,scoped,.34),`the ${side<0?'Gala':'Legemum'} bank is blocked at ${x.toFixed(1)}, ${z.toFixed(1)}`);
      reached=Math.min(reached,landDistance(x,z));
    }
    assert.ok(reached<4,`the ${side<0?'Gala':'Legemum'} bank stops ${reached.toFixed(1)} m from the sea`);
  }
  let waded=0;
  for(const s of last){
    if(H(s.x,s.z)<.6)continue;
    assert.ok(canStand(s.x,s.z,scoped,.34),`the Treloss cannot be waded at ${at(s)}`);waded++;
  }
  assert.ok(waded>=last.length-3,`${waded} of ${last.length} samples waded`);
  // Gala's scatter and Legemum's cover were laid before the mouth was cut, and what it would drown was moved off it
  // (src/gala-scenery.js `offTheMouth`, src/legemum-scenery.js `offTreloss`): on the two countries' ground within
  // sixty metres of the mouth, no instance, no blade of cover and no collider stands in the stream's water.
  const wet=(x,z)=>['Gala','Legemum'].includes(hexOwnerAt(x,z))&&[GALA_TELEMONIA_STREAM,GALA_TELEMONIA_MOUTH].some(c=>courseDistance(c,x,z,4)<courseSample(c,x,z).half);
  const close=(x,z)=>Math.hypot(x+1815,z-1463)<60,m=new THREE.Matrix4(),v=new THREE.Vector3();
  let instances=0,blades=0,shapes=0;
  scene.traverse(o=>{
    if(o.isInstancedMesh){
      for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);v.setFromMatrixPosition(m);if(!close(v.x,v.z))continue;instances++;
        assert.ok(!wet(v.x,v.z),`${o.name} stands in the Treloss at ${v.x.toFixed(1)}, ${v.z.toFixed(1)}`);}
    }else if(o.isMesh&&/^Legemum groundcover/.test(o.name)){
      const pos=o.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);if(!close(x,z))continue;blades++;
        assert.ok(!wet(x,z),`${o.name} grows in the Treloss at ${x.toFixed(1)}, ${z.toFixed(1)}`);}
    }
  });
  for(const c of scoped.colliders){if(!close(c.x,c.z)||c.surface!==undefined)continue;shapes++;assert.ok(!wet(c.x,c.z),`a ${c.kind} stands in the Treloss at ${c.x}, ${c.z}`);}
  assert.ok(instances>100&&blades>100&&shapes>0,`${instances} instances, ${blades} vertices of cover and ${shapes} colliders checked`);
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
