# Sylvia: Room to paint

Sylvia offers an optional local favor alongside her existing Visual Arts introduction: remove four invasive ivy patches beside her cottage on Drent's Sunken Lane. The cottage, easels, mailbox and walking approach remain accessible.

Press F beside a patch's roots to begin pulling, then stand still for two seconds. No weapon, tool, skill level or previous lesson is required. Movement or combat interrupts an unfinished pull; menus pause it. Clearing a whole patch introduces Farming and grants 4 Farming XP once. Drent ivy does no damage and never attacks. Cleared patches persist, including those cleared before accepting the favor. Report to Sylvia after clearing all four for 24 copper, paid once.

The journal lists this as a tertiary favor, **Room to paint**. Its copper quest marker yields to major quests, and Sylvia still teaches drawing, painting and calligraphy through her original Visual Arts options. After the favor, her unlearned art lesson retains its green skill marker.

Saved state contains only acceptance, cleared patch IDs and completion. An unfinished pull is not restored. Old saves start with the favor unaccepted and all four patches uncleared; restores never grant XP or money.

## Later forest ivy — design only

Drent is the easiest ivy tier. More dangerous forests can eventually have tougher varieties that attack or seize the player. Their appearance should communicate the threat before contact, and their interaction, combat and escape rules need separate design. No hostile ivy, health damage or level gate is enabled by this quest.

## Validation

- `node --test --test-isolation=none tests/sylvia-ivy.test.js` — 7 model tests passed. They cover clearing before acceptance, partial work, interruptions, strict save validation, failed reward delivery and exactly-once XP and money.
- `node --test --test-isolation=none tests/ivy-view.test.js` — 3 view, world and pose tests passed. Ivy follows sloping ground, clearing and cancellation update the foliage, working positions and the art lesson remain accessible, and the player kneels and pulls without shifting the camera-bearing actor origin.
- `npm run test:sylvia-ivy:desktop` — 35 native desktop checks passed with zero renderer errors. The run uses Sylvia's normal dialogue and the F interaction, verifies partial and completed checkpoint restores, confirms exactly-once Farming XP and reward, and leaves the normal saved adventure unchanged.
