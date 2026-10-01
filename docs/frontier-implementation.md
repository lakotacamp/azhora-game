# Menora, Caricas and Yunethre

Implemented 30 September 2026 from the user's frontier brief. Atlas spellings are retained: Isareos, Caricas, Nethereum and Yunethre; the city is Menora.

## Playable content

- **Menora:** an intact white-walled holy city on the existing Isa–Lizeem fork. Four open gates, 18-metre walls, a 128-metre Sorcerers' Guild tower, the grand temple, houses, cloisters, gardens and five physical bridges. The existing rivers remain open beneath the decks. The chart carries a distinct holy-city marker.
- **The princes:** Cedric waits at the temple court with long dirty-blond hair. Wilhelm has a short, almost silver-blond crop and an asymmetrical expression. His camp, six tents and sixteen soldiers lie outside the western gate. Eight further guards hold the city gates. Both princes have introductory conversations; their later chapter is deliberately undecided.
- **Caricas:** a fully Imperial-occupied market town with eight buildings and eight soldiers. Five new farms connect to the existing seed, cultivation, harvest, Farming XP and save systems. Grain, vegetables, orchard and meadow plots form separate fields on suitable ground. The old wooded river corridor remains.
- **Yunethre:** all 27 atlas plains hexes are integrated. A six-building neutral lakeside town mixes human, elven and centaur architecture, with three anonymous peacekeepers. A physical timber ramp reaches the existing South Oremindi lake without moving its shoreline. Bane's Camp has seven tents, three supply wagons and four guards. Fifty persistent nonbird animals occupy 25 habitats; trees carry harvestable species.
- **Raids:** three persistent centaurs leave camp, follow a dry route into northwestern Isareos and return. They can engage the traveler on the frontier; the neutral town and Menora are outside the raid circuit. Encounters borrow the same centaur actors. Injuries, deaths and patrol positions survive saves; entering a fight does not create a healed duplicate.

Centaurs have one human head and torso joined to a four-legged equine body, with no second horse head, saddle or visible human legs. Only the two requested princes receive new personal identities. Other new inhabitants are anonymous soldiers and peacekeepers.

## Testing in the desktop app

Open **F8 → Go anywhere** and select **Isareos**, **Caricas** or **Yunethre**. The arrivals lead to Menora, the occupied market town and the neutral lakeside town respectively. Bane's Camp is a separate local destination. Existing main-road autoplay remains the first navigation path.

Commands:

```text
npm run test:frontier
npm run test:frontier:desktop
npm run review:frontier
```

The isolated desktop run passed 25 checks: all three travel destinations, all new residents' starting clearance, bridge support, city and farm integration, prince conversations and hairstyles, centaur models, actual patrol movement, full-health combat starts, persistent damage through checkpoint reload, neutral-town peace and a clean renderer. It recorded all 50 Yunethre animals. The ordinary adventure save was unchanged.

Node verification covers the actual combined-world routes and crossings, model anatomy, persistent raid state, terrain and wildlife, farm access and cultivation. The final integration/farming run passed all 12 tests with the final farm placements, including all 47 regional beds and 15 seed stations in the combined world. The farmland geometry checks place every field on walkable terrain while preserving public roads. An additional 74 combat/body/checkpoint/survey regressions and 20 model/map/sky/river checks passed. Screenshot reviews inspected Menora's skyline, the temple and army camp, both princes, the centaurs, the lakeside town and Caricas.

The final campaign and testing-travel run also passed all 18 tests, including
an actual-scene landing check for every destination offered by the developer panel.

## Deliberately unfinished

Prince/Civil War story developments, Sorcerers' Guild lessons, temple and house interiors, civilian characterization, trade systems, the wider centaur campaign and the later Henborth camp remain for future design. The imperial army is a placed garrison and muster, not a simulated country-level army. The separate [strategic-layer brainstorm](strategic-layer-brainstorm.md) proposes that future system; it does not implement it.

The user's current brief supersedes old draft assertions that Cedric had already died, Menora had been destroyed or Wilhelm was still in Nylon. The updated royal-house notes retain his earlier devastation of Suval and the Iscare islands, without deciding his future actions at Menora.
