import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoadCheckpoint } from '../src/road-checkpoint.js';
import { createPeninsulaTutorial, PENINSULA_TUTORIAL_ANCHORS as A } from '../src/peninsula-tutorial.js';
import { createInventoryState } from '../src/inventory.js';
import { createWeapons } from '../src/weapons.js';
import { createJourney } from '../src/journey.js';
import { METRES_PER_HEX } from '../src/world-scale.js';

function fixture(path = 'tutorial') {
  const inventory = createInventoryState(); inventory.grant('simple-sword');
  const tutorial = createPeninsulaTutorial({ onEvent: e => { if (e.type === 'tutorial-grant' && e.item) inventory.grant(e.item); } });
  tutorial.choose(path, 0);
  const data = { version: 1, ambronLayoutVersion: 2, worldScale: METRES_PER_HEX, questStage: path === 'skip' ? 2 : 0,
    journey: createJourney().snapshot(), inventory: inventory.items().map(id => ({ id, quantity: inventory.count(id) })),
    weapons: createWeapons({ inventory }).snapshot(), journeyGathered: [], meadowCleared: false, position: { ...A.arrival },
    heardDoom: false, health: 100, playSeconds: 10, peninsulaTutorial: tutorial.snapshot(),
    woodland: { version: 1, acornStatus: 'available', practiceHits: 0, practiceGuards: 0, practiceDodges: 0,
      acorns: [], sticks: [], fruits: [], discoveries: [], camp: { version: 1, taught: false, catches: 0, fires: {} } },
  };
  const values = new Map(), storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  return { data, tutorial, checkpoint: createRoadCheckpoint({ storage }) };
}
test('A chosen peninsula opening can be saved before the first lesson and restored without inventing progress', () => {
  const { data, checkpoint } = fixture(); const saved = checkpoint.save(data); assert.equal(saved.ok, true, saved.reason);
  assert.deepEqual(checkpoint.read().data.peninsulaTutorial, data.peninsulaTutorial);
  const loaded = checkpoint.read().data; loaded.peninsulaTutorial.chris.at.x += 100;
  assert.deepEqual(checkpoint.read().data.peninsulaTutorial, data.peninsulaTutorial);
});
test('Skip checkpoints retain the new letter before enlistment without requiring the downstream Nothom letter', () => {
  const { data, checkpoint } = fixture('skip');
  assert.equal(data.inventory.some(i => i.id === 'tutorial-letter'), true);
  assert.equal(data.inventory.some(i => i.id === 'harbor-letter'), false);
  const result = checkpoint.save(data); assert.equal(result.ok, true, result.reason);
  assert.equal(checkpoint.read().data.peninsulaTutorial.enlisted, false);
  assert.equal(checkpoint.save({ ...data, inventory: data.inventory.filter(i => i.id !== 'tutorial-letter') }).ok, false);
});
test('Malformed peninsula progress cannot overwrite a valid checkpoint', () => {
  const { data, checkpoint } = fixture(); assert.equal(checkpoint.save(data).ok, true);
  const invalid = structuredClone(data); invalid.peninsulaTutorial.signedOffAt = 4;
  assert.equal(checkpoint.save(invalid).ok, false);
  assert.deepEqual(checkpoint.read().data.peninsulaTutorial, data.peninsulaTutorial);
});
