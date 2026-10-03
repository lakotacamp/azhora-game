import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceModule } from './module-loader.js';
import { AEVIS, AEVIS_BUILDINGS, AEVIS_GATES, AEVIS_PATHS, AEVIS_QUAYS, AEVIS_BOATS, aevisGround, aevisDeckHeight } from '../src/aevis-city.js';
import { groundWithRiver } from '../src/world-terrain.js';

const THREE=await sourceModule('../vendor/three.module.js');
const {createAevisScenery}=await sourceModule('../src/aevis-scenery.js');
const {AEVIS_SOLDIERS,createAevisSoldier}=await sourceModule('../src/aevis-soldiers.js');
const terrain=(x,z)=>aevisGround(x,z,groundWithRiver(x,z));
const heightAt=(x,z)=>Math.max(terrain(x,z),aevisDeckHeight(x,z)??-Infinity);
const colliders=[],city=createAevisScenery({parent:new THREE.Group(),colliders,heightAt:terrain});
const blocked=(x,z)=>{const feet=heightAt(x,z);return colliders.find(c=>c.minY<=feet+1.8&&c.maxY>=feet&&(c.r!==undefined
  ?Math.hypot(x-c.x,z-c.z)<c.r+.55:Math.abs(x-c.x)<c.hx+.55&&Math.abs(z-c.z)<c.hz+.55));};

test('Aevis keeps detailed bronze scenery within bounded merged batches',()=>{
  assert.equal(city.metrics.buildings,AEVIS_BUILDINGS.length);
  assert.equal(city.metrics.gates,AEVIS_GATES.length);
  assert.equal(city.metrics.ships,AEVIS_BOATS.length);
  assert.ok(city.metrics.batches<45,`${city.metrics.batches} batches`);
  assert.ok(city.metrics.vertices<360000,`${city.metrics.vertices} vertices`);
  for(const mesh of city.root.children){
    assert.ok(mesh.isMesh,mesh.name);
    assert.ok(Number.isFinite(mesh.geometry.boundingSphere.radius)&&mesh.geometry.boundingSphere.radius>0,mesh.name);
  }
});

test('Land gates, civic approaches, harbor access and soldiers are reachable on foot',()=>{
  for(const p of [AEVIS.arrival,...AEVIS_GATES,...AEVIS_SOLDIERS]){
    const obstruction=blocked(p.x,p.z);
    assert.equal(obstruction,undefined,`${p.id??'arrival'} blocked by ${obstruction?.id}`);
  }
  for(const path of AEVIS_PATHS)for(let i=1;i<path.points.length;i++){
    const a=path.points[i-1],b=path.points[i],len=Math.hypot(b.x-a.x,b.z-a.z);
    for(let k=0;k<=len;k+=.5){
      const x=a.x+(b.x-a.x)*k/len,z=a.z+(b.z-a.z)*k/len,obstruction=blocked(x,z);
      assert.equal(obstruction,undefined,`${path.id} at ${x},${z} blocked by ${obstruction?.id}`);
    }
  }
});

test('Eastern harbor is open to sea and piers have supported walk surfaces',()=>{
  assert.ok(!city.root.children.some(m=>/Cyclopean curtain [23]$/.test(m.name)));
  assert.equal(city.walkSurfaces.length,AEVIS_QUAYS.length);
  for(const q of AEVIS_QUAYS){
    const deck=city.walkSurfaces.find(s=>s.id===`${q.id}-deck`);
    assert.equal(deck.a.y,q.elevation);assert.equal(deck.b.y,q.elevation);assert.equal(deck.width,q.depth);
    assert.equal(blocked(q.x,q.z),undefined,`${q.id} blocked at deck height`);
    const hull=colliders.find(c=>c.id===q.id);
    assert.ok(hull.maxY<q.elevation,'solid pier stops below its walk surface');
  }
  for(let z=1765;z<=1795;z+=5)assert.equal(colliders.find(c=>['aevis-wall','city-tower','gate-arch'].includes(c.kind)&&Math.abs(c.x+1064)<4&&Math.abs(c.z-z)<4),undefined,'seaward curtain blocks the harbor');
});

test('Avite soldiers use jointed bronze armor, distinct shields and no headwear',()=>{
  const shields=new Set();
  for(const descriptor of AEVIS_SOLDIERS){
    assert.equal(descriptor.soldier,true);assert.equal(descriptor.role,'aevis-soldier');
    const actor=createAevisSoldier(descriptor),model=actor.group;
    assert.ok(model.getObjectByName('Avite segmented bronze cuirass'));
    assert.equal(model.userData.avite.headwear,false);
    shields.add(model.userData.avite.shield);
    for(const joint of ['Left Knee','Right Knee','Left Wrist','Right Wrist'])assert.ok(model.getObjectByName(joint));
    actor.animate(1,.7,true,{armed:true});model.updateMatrixWorld(true);
    model.traverse(node=>assert.ok(node.matrixWorld.elements.every(Number.isFinite),node.name));
    const spear=model.getObjectByName('Avite bronze-tipped spear');
    actor.setWeapon(null);assert.equal(spear.visible,false);
    actor.setWeapon('ash-spear');assert.equal(spear.visible,true);
    actor.setShield(false);assert.equal(model.getObjectByName(descriptor.variant%2?'Avite broad tower shield':'Avite figure-eight shield').visible,false);
  }
  assert.equal(shields.size,2);
});
