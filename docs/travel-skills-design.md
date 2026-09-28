# Riding and boating: design draft

27 September 2026. These are proposals, not additional implemented travel systems.

## Three different skills

**Riding** governs terrestrial mounts, **Boating** governs controllable watercraft, and **Flying** governs airborne travel. Their experience and lessons remain separate. Animal Husbandry is the care and trust of living mounts; it is not a substitute for operating one. Swimming governs a traveler in the water, not a boat.

The current Flying introduction is Batman's carried tour of Suval. Completing it teaches the skill but does not grant wings, a summon, an owned bat, or unrestricted flight. The developer bat is an isolated testing tool. Neither the proposed riding additions nor player-controlled boating is part of that implementation.

## Riding: learn a mount, then learn the country

Keep the present horse controls and Kayla race understandable: movement steers, Shift asks for a faster gait, and G mounts or dismounts. Walking, trotting, and cantering have clearly different animations, sounds, turning radii, and stamina use. A rider cannot pivot a galloping horse instantly or push through another body.

An introductory lesson could teach mounting from a safe side, walking between markers, turning, stopping, and dismounting on clear ground. Later teachers can offer the same foundation, so missing the army horse allocation does not permanently close the skill. An instructor can lend a horse for a lesson without granting ownership.

| Stage | Proposed practice | Proposed benefit |
| --- | --- | --- |
| First lesson | Walk, turn, halt, and dismount | Safe independent riding |
| Familiar rider | Controlled trots on roads | Smoother steering and less mount fatigue |
| Trail rider | Narrow tracks, slopes, shallow fords | Better balance and readable footing warnings |
| Experienced rider | Longer journeys and timed courses | Better stamina management, not unlimited speed |

Award modest XP for purposeful mounted travel and discrete lesson milestones. Repeated laps around one marker should not be the best training method. Keep a mount's fatigue separate from the player's stamina. Feeding, grooming, and trust belong to Husbandry; rest restores the mount. Surface and slope should matter more than level bonuses: horses avoid deep water, cliffs, and closed gates at every level.

Mounts remain actual animals in the world, with health, location, ownership, and persistent names where authored. Whistling calls a nearby mount along a real route. A lost or dead horse is not recreated by the inventory. Store its position and condition in checkpoints. Borrowed quest mounts return to their owner, and companions need their own mount or must follow on foot.

Mounted combat is a later, separate decision. Keep dismounting before ordinary sword combat for this pass. Races should use the same movement and collision rules as travel, with physical opponents and ordinary pause behavior.

## Boating: small craft before ocean voyages

Retain Jess, Hallie, and Maddie's ferries as passenger travel. Their services should stay useful after the player learns Boating. Begin controllable craft with a small rowing boat on sheltered water, using a lesson from a harbor master. Sailing ships, naval battles, and open-ocean navigation come later.

Steer with movement controls; forward rows and backward slows or reverses gently. Shift rows harder at a stamina cost. Momentum, a modest turn radius, and water current give a boat its own feel. The camera follows the hull smoothly without amplifying wave bobbing. Show a clear dock/shore prompt where leaving is safe.

| Stage | Proposed lesson | Proposed benefit |
| --- | --- | --- |
| Sheltered water | Embark, row, turn, stop, tie up | Operate a small rowboat |
| River handling | Cross a current and avoid shallows | Better oar efficiency and current reading |
| Coastal handling | Follow landmarks between safe landings | Longer trips and weather awareness |
| Later expansion | Sail trim, wind, larger crews | Reserved for a sailing design |

Boats collide with banks, rocks, bridge piers, other boats, and closed harbor barriers. A draft check prevents crossing ground that merely looks wet. Currents push the hull continuously; fast rivers must remain readable before the player enters them. A safe landing needs shallow accessible shore or a berth with room for both boat and traveler.

The boat remains where it was tied, with hull condition and cargo recorded. The player can return for it. A failed landing leaves the player aboard; it does not drop them through a quay. Going overboard switches to Swimming, and recovery uses the normal checkpoint system. Do not force a scripted drowning to introduce the skill.

For Iscare, the first controllable coastal boat would make exploration of the abandoned islands practical. Until player boating exists, developer flight/travel can inspect the islands; do not imply that an unbuilt ferry route or boat lesson is available.

## Decisions to refine later

- Whether the first riding lesson loans a village pony or uses an army horse.
- Whether a first rowboat is borrowed, rented, or purchased, and where it can safely be left.
- How much current and wind simulation feels enjoyable at this world's scale.
- Whether fatigue and hull wear should matter during short local trips or only long journeys.
- Whether passengers, cargo, and mounted combat belong in the first expansion or a later one.

Validate future implementations with actual routes, terrain and water collision, dismount/landing safety, death recovery, pause, save/reload during travel, and teacher alternatives. Autoplay should use the same controls as the player.
