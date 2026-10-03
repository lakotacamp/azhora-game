# Frontier command: first strategic prototype

Implemented 2 October 2026 from the first prototype in [the strategic-layer brainstorm](strategic-layer-brainstorm.md). The wider continental design remains a discussion draft.

## Try it

1. Open **F8 > Quest playtests > Frontier command** after leaving the opening tutorial. Start game skips the tutorial if you want to test immediately.
2. Keep **Imperial field force** selected. Choose **The White Bridge** in the holding ledger, then **Issue march order**.
3. Choose **Advance a day**. The approaching centaur raid meets the Imperial force and pauses the strategic clock.
4. Choose **Enter the adventure battle** to fight alongside two generic Imperial soldiers against two centaurs. Win, lose, or withdraw to return a single result to the chart. You can also resolve the battle from force condition on the chart.
5. Try different orders, command the centaur band, raid a farm, retreat, or resupply. **Reset scenario** restores the starting setup; **Reload orders** reloads the separate strategic save.

The playable objective is to defeat the raid and secure the White Bridge supply connection and Caricas town. A damaged crossing interrupts Imperial supply; the test repair action is available after the bridge is secured. The neutral free town requires passage permission and cannot be raided. Minora's main-story role is protected.

## Implemented scope

The chart uses the real 90 hexes of Isareos, Caricas and Yunethre, their existing rivers, roads, bridge, towns, farms and centaur camp. Two persistent armies follow routes over the hex graph. Terrain and crossings affect travel; supplies and morale affect force condition. Claims, effective control, local support and stored resources remain separate values.

Time advances explicitly in six-hour or one-day turns. Partial marches, orders, supply, raid effects and battle outcomes survive reload. A pending encounter pauses the clock. Each battle result is applied once, including across saves.

Strategic orders use a separate local save. Opening the chart does not reveal the personal map or advance the adventure. The local battle uses temporary soldiers; returning restores the player's original position, time, chapter progress, inventory and personal chart. The normal adventure checkpoint is not rewritten.

The prototype is available in Full and Fast loading modes. Entering its battle waits for that region's scenery. Finish the opening tutorial, land, dismount and leave underground interiors before entering a local battle.

## Deliberate limits

Army sizes, travel times, resources and combat consequences are provisional balance values. This is a small scenario, not a complete country-management game. It does not add continental AI, diplomacy, recruitment, construction, tax systems, new canonical borders or permanent changes to the main-story factions. A small adventure encounter represents the larger army clash.

## Validation

- Eleven focused tests cover the real graph and crossing, neutral access, raids and supply, deterministic saves, victory/defeat, duplicate outcome rejection, malformed saves, local arena placement and combat outcome mapping.
- Twenty-one native assertions exercise the F8 chart, partial march/reload, actual local combat resolution, once-only reconciliation and restoration of the player's adventure without changing the normal checkpoint. Screenshots of the chart, battle and result were inspected.
- The first native run exited successfully. A later visual-polish run again passed all assertions with no renderer errors, but Electron reported a GPU error during shutdown and exited unsuccessfully. This is not a clean full-suite result or an end-to-end combat autoplay test.
