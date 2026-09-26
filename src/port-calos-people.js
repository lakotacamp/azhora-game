import { PORT_CALOS_NPC_POSITIONS } from './port-calos-world.js';

// Port Calos receives only the civilian explicitly requested for it. Shared
// town scenery does not imply an invented cast of shopkeepers and neighbors.
export const PORT_CALOS_NPCS = Object.freeze([
  /**
   * **Christina** (the user, 26 September 2026): "a party nugget whose head looks and spins like a
   * disco ball", in Port Calos for now. Small, in the brightest thing she owns, and her head is a
   * mirror ball that never stops turning (`look.discoHead`, src/characters.js).
   */
  Object.freeze({
    id: 'christina', name: 'Christina', role: 'The party, in Port Calos',
    modelRole: 'villager', color: 0xd4388f,
    look: Object.freeze({ discoHead: true, slight: true, beard: false, hat: false, cloak: false, glasses: false }),
    yaw: PORT_CALOS_NPC_POSITIONS.christina.yaw,
  }),
  Object.freeze({
    id: 'port-calos-harbourmaster', name: 'Maddie', role: 'Harbourmaster of Port Calos',
    modelRole: 'rise-custodian', color: 0x415d70,
    look: Object.freeze({ beard: false, hair: 0x61412d, hairStyle: 'long', straightHair: true,
      slight: true, hat: false, staff: false, cloak: false }),
    yaw: PORT_CALOS_NPC_POSITIONS['port-calos-harbourmaster'].yaw,
  }),
]);
export const PORT_CALOS_NPC_IDS = Object.freeze(PORT_CALOS_NPCS.map(npc => npc.id));

/** What Christina says. There is no business in it; there is the party. */
export const CHRISTINA_LINES = Object.freeze({
  hello: Object.freeze([
    'The light off her head goes round the whole street, over the market house and the custom house and your boots, and round again.',
    '“Christina! That is me. Hello! You look like somebody who has not danced since about Tuesday, and it is not Tuesday any more.”',
    '“Everybody asks about the head. Yes, it spins. It has always spun. My mother says I came out sparkling and nobody has managed to slow me down since.”',
  ]),
  celebrating: Object.freeze([
    '“Everything! The tide came in. It will go out later, and we will celebrate that too. Port Calos has one harbourmaster, a few boats and exactly one party, and the party is me.”',
  ]),
  dizzy: Object.freeze(['“Only when it stops. So I do not let it stop.”']),
  dance: Object.freeze([
    'You dance with Christina in the street between the market house and the custom house. Nobody else does, and she does not mind, and after a while you do not either.',
    'The little squares of light go round and round the housefronts, and somewhere down on the quay Maddie pretends not to be tapping her foot.',
  ]),
  directions: Object.freeze([
    '“Directions! I love directions, they go places. Nothom is up the street and west at the junction. Maddie on the quay sails you anywhere worth a party: Jess keeps the harbor at Tidewater Haven, and Hallie keeps the one on Peblos. Tell them Christina says hello. They will know which Christina.”',
  ]),
});

/** Christina's conversation: the party, a dance, and the way to anywhere. */
function christinaConversation(npc, { openDialogue, closeDialogue }) {
  const back = () => christinaConversation(npc, { openDialogue, closeDialogue });
  const say = lines => openDialogue(npc, [...lines], null, 'Back to the party', { onComplete: back });
  openDialogue(npc, [...CHRISTINA_LINES.hello], null, 'Back to the harbor', { choices: [
    { id: 'christina-celebrating', label: 'What are you celebrating?', action: () => say(CHRISTINA_LINES.celebrating) },
    { id: 'christina-dizzy', label: 'Does it make you dizzy?', action: () => say(CHRISTINA_LINES.dizzy) },
    { id: 'christina-dance', label: 'Dance with her.', action: () => say(CHRISTINA_LINES.dance) },
    { id: 'port-directions', label: 'How do I get to Nothom or the other harbors?', action: () => openDialogue(npc, [...CHRISTINA_LINES.directions], null, 'Thank you.') },
    { id: 'leave-port-neighbor', label: 'I should keep moving.', action: closeDialogue },
  ] });
  return true;
}

/** Basic harbor directions; the host also offers Maddie's sailing choices. */
export function portCalosConversation(npc, { openDialogue, closeDialogue }) {
  if (npc?.id === 'christina') return christinaConversation(npc, { openDialogue, closeDialogue });
  if (npc?.id !== 'port-calos-harbourmaster') return false;
  openDialogue(npc, [
    'Maddie, harbourmaster. Welcome to Port Calos. The quay is for sea cargo; the houses and market stay up on the bank.',
    'I can sail you to Tidewater Haven or Peblos. For Nothom, follow the road inland from the market.',
  ], null, 'Back to the harbor', { choices: [
    { id: 'port-directions', label: 'How do I get to Nothom or the other harbors?', action: () => openDialogue(npc, [
      'For Nothom, follow the street inland to the road junction, then turn west toward town. I sail to Tidewater Haven and Peblos from this quay. Jess keeps Tidewater Haven; Hallie keeps the harbor on Peblos.',
    ], null, 'Thank you.') },
    { id: 'leave-port-neighbor', label: 'Good day to you.', action: closeDialogue },
  ] });
  return true;
}
