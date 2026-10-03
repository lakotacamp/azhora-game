import { sourceModule } from './module-loader.js';

/** Build real game scenery for the tested regions through the production fast
 * loader. This keeps full-world geometry from dominating a local collision test;
 * it does not stub terrain, scenery, water, trees, or movement rules. Shared jobs
 * and their dependencies are still completed before the fixture is returned. */
export async function scopedWorld(scene, regionIds) {
  const ids = [...new Set(regionIds)];
  if (!ids.length) throw new Error('A scoped world needs at least one region');
  const { createWorld } = await sourceModule('../src/world.js');
  const priorFrame = globalThis.requestAnimationFrame;
  const priorCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 0);
  globalThis.cancelAnimationFrame = clearTimeout;
  let world;
  try {
    world = createWorld(scene, { loadingMode: 'fast', initialRegion: ids[0] });
    await Promise.all(ids.map(id => world.loading.ensureRegion(id)));
    for (const id of ids) if (!world.loading.isReady(id)) throw new Error(`Region ${id} did not finish loading`);
    return world;
  } finally {
    world?.loading.stop();
    if (priorFrame === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = priorFrame;
    if (priorCancel === undefined) delete globalThis.cancelAnimationFrame;
    else globalThis.cancelAnimationFrame = priorCancel;
  }
}
