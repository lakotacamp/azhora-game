# Frontier command: first strategic prototype

Implemented 2 October 2026 from the first prototype in [the strategic-layer brainstorm](strategic-layer-brainstorm.md). The wider continental design remains a discussion draft.

## Try it

1. Open **F8 > Quest playtests > Open strategy map** after leaving the opening tutorial. This opens Frontier Command, a scenario you play manually. Start game skips the tutorial if you want to test immediately.
2. Choose **Select White Bridge**. This selects the **Imperial field force** and **The White Bridge** for you; it does not issue an order or advance time. You can also select the force and choose the bridge under **Places & holdings** yourself.
3. Choose **Queue march order**, then **Advance a day**. From the starting setup, the Imperial force reaches the bridge in three hours; the approaching centaur raid meets it at hour 22 and pauses the strategic clock.
4. Choose **Enter the adventure battle** to fight alongside two generic Imperial soldiers against two centaurs. Win, lose, or withdraw to return one result to the chart. **Resolve from force condition** instead applies the projected result shown on the chart.
5. Try different orders, command the centaur band, raid a farm, retreat, or resupply. **Reset scenario** restores and saves the starting setup; **Reload orders** restores the latest separate strategic save.

The objective is to win an Imperial battle and keep the White Bridge supply connection open, with both the bridge and Caricas town under Imperial control. A victory resolved on the chart also counts. A damaged crossing interrupts Imperial supply; **Test bridge repair** is available once the bridge is under Imperial control and no battle is pending.

## Giving orders

The basic sequence is **choose a force > select a hex or holding > give an order > advance time**. The route preview shows estimated travel time and supply cost. Selecting a destination or queuing an order does not move the force. **Advance 6 hours** and **Advance a day** execute both forces' current orders; a battle can stop the turn early.

- **March** moves the force to a destination, then holds there. Marching alone does not capture a holding.
- **Raid selected holding** marches to an opposing holding, then spends six hours raiding it. This transfers effective control, takes up to 25 food for the army and reduces local support by 15 percentage points. Raiding the White Bridge also damages it.
- **Hold** cancels the force's current order. It still consumes supplies as time advances.
- **Retreat home** queues a march to the force's home base.
- **Resupply here** draws food from an eligible friendly holding at the force's current location as time advances. It does not send the force to a supply source. It restores carried supply and morale, but does not restore readiness.

The Imperial force can resupply at Minora, or at a friendly Caricas town or farm if the White Bridge is open and friendly and the route back to Minora remains friendly and clear of the opposing army. The centaur band replenishes at Bane's Camp. Watch the supply message beneath the selected force's condition. Empty supplies slow travel and reduce morale.

You can command either force through **Command a force**. The centaur band starts with an order to raid the bridge and keeps following its orders when time advances. The local adventure battle always puts you on the Imperial side, even if the centaur band is selected on the chart. **Withdraw Imperial force** concedes the battlefield and sends the Imperial force toward home.

When opposing forces meet on a hex, resolve their battle before changing orders or advancing time. The projected result uses readiness, morale and carried supplies. The winner takes control of eligible holdings on that hex; both forces lose readiness and the loser retreats. Each battle result is applied once.

**Effective control** records who currently holds a place; **claim** records its original allegiance and does not change through conquest. Food reserves feed armies. Coin reserves and local support are tracked, but there are no coin purchases or additional support effects yet. The neutral free town requires **Request neutral passage** for the selected force and cannot be raided. Minora's main-story role is protected.

## Implemented scope

The chart uses the real 90 hexes of Isareos, Caricas and Yunethre, their existing rivers, roads, bridge, towns, farms and centaur camp. Two persistent armies follow routes over the hex graph. Terrain and crossings affect travel; supplies and morale affect force condition. Claims, effective control, local support and stored resources remain separate values.

Time advances explicitly in six-hour or one-day turns. Partial marches, orders, supply, raid effects and battle outcomes survive reload. A pending encounter pauses the clock. Each battle result is applied once, including across saves.

Strategic orders and turns save automatically to a separate local save on this device. Opening the chart does not reveal the personal map or advance the adventure. The local battle uses temporary soldiers; returning restores the player's original position, time, chapter progress, inventory and personal chart. The normal adventure checkpoint is not rewritten. Close the chart or press **Esc** to return to the adventure.

The prototype is available in Full and Fast loading modes. Entering its battle waits for that region's scenery. Finish the opening tutorial, land, dismount and leave underground interiors before entering a local battle.

## Deliberate limits

Army readiness, travel times, resources and combat consequences are provisional balance values; readiness is not a troop count. This is a small scenario, not a complete country-management game. It does not add scouting, officer assignments, continental AI, diplomacy, recruitment, construction, tax systems, new canonical borders or permanent changes to the main-story factions. A small adventure encounter represents the larger army clash.

## Validation

- Eleven focused tests cover the real graph and crossing, neutral access, raids and supply, deterministic saves, victory/defeat, duplicate outcome rejection, malformed saves, local arena placement and combat outcome mapping.
- Twenty-five native assertions exercise the F8 chart, partial march/reload, actual local combat resolution, once-only reconciliation and restoration of the player's adventure without changing the normal checkpoint. Screenshots of the chart, battle and result were inspected.
- The 3 October 2026 native run passed all 25 assertions with no renderer errors and exited successfully. Electron logged a GPU warning during shutdown. The check exercises the new selection helper and queued-order guidance; it is not a full-suite result or an end-to-end combat autoplay test.
