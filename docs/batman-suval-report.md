# Catie, the Suval vigilante and the frontier

Implemented 27 September 2026.

## Playable quest

Catie in Port Calos offers **A Kindness with Wings**, asking the traveler to hear the winged vigilante's side. Follow the winding highland trails to the cave. The cave offers a real choice to speak or attack; Officer Verradross offers the opposing 100-copper bounty and requires the creature's head. ?Verradross? is newly authored coastal Mittoli game vocabulary: a coined bat root combined with the lore's attested word for broken. It is not presented as an existing dictionary translation.

Speaking peacefully offers a roughly two-minute scenic flight through South, West and East Suval, passing the Stillwater, Imlamdris, Solis and the closed frontier. Landing reveals all 63 hexes across those regions; chart completion does not require flying through every hex. Batman narrates the user's 976?978 chronology, teaches Flying, awards Cartography progress and lands the traveler in northern West Suval, outside the closed East border. He then physically returns to his cave. The player has a seated pose on his back; his body, wings and passenger attachment are articulated.

Pausing and menus stop the flight. Checkpoints resume its route position, narration and discoveries without duplicate rewards. Ground attacks, stealth, recovery teleports and unsolicited ground conversations cannot interrupt the carried tour. Accepting this flight closes the bounty; ordinary independent flying remains unavailable.

**F8 ? Hacks ? Developer bat** grants an isolated testing mount. WASD steers, Space climbs, Ctrl descends, Shift flies faster, holding Tab gives 10x turbo speed, and G requests a safe landing. Low flight respects cliffs; landing requires dry, clear ground outside East Suval. It does not grant an owned mount or alter the saved normal adventure. F8 travel cancels it cleanly.

## World and residents

See [the terrain report](suval-iscare-terrain.md) for the tall Suval ridges, cave, Imlamdris ruins/rebuilding quarter, ten Iscare islands, wildlife and Zecron ruins. East Suval's exposed border now combines unequal cliffs and needles with stepped walls and sealed gates. Four winding false passages end in rockfalls or barred recesses, with walkable retreat routes.

See [the resident and mystery notes](port-calos-residents-and-cobble.md) for the 21 named blank residents, Christina/Ari/Imani/Jesse's relocation, Catie's rename, Hallie/Maddie's port swap and the three new Cobble witnesses. The placeholder dialogue is exactly the requested sentence. Jess, Hallie and Maddie retain all ferry and Swimming services and wear nautical clothing without hats.

The [Riding and Boating draft](travel-skills-design.md) is a proposal only. It does not add independent flying, ordinary controllable boats or additional riding lessons in this pass.

## Verification

- Short-tour built-world simulation: **120.2 seconds**, 2,301 metres along the smoothed 3D route, all three Suvals physically crossed, all 11 history beats emitted and all 63 chart cells revealed at landing. Terrain clearance sampled every metre stays above 37.86 metres during the tour. This is a Node simulation of the constructed world, not a new full Catie native autoplay run.

- Historical Catie F8 autoplay run, before the tour was shortened: **27 native checks passed**, zero errors; complete real-time road walk, peaceful cave conversation, original 63-hex flight route, pause/takeover/resume, safe landing, fresh restart and normal-save preservation. See [Catie autoplay](catie-autoplay.md).
- The 21 newly named residents now use identical featureless gray mannequins, including distant rendering. Focused model, animation, dialogue and appearance-preservation checks pass.

- Native Electron Batman run after shortening the tour: **83 checks passed**, no renderer errors. Exercises actual dialogue buttons, the short scenic tour, all 63 map discoveries at landing, pause, mid-flight save/reload, safe landing, physical return, exactly-once XP, hostile branch/head bounty, and developer flight/travel cancellation. Route time is accelerated in this harness; the hostile fixture resolves the enemy's death deterministically instead of playing a full combat duel.
- Short-tour focused Node group: **23 checks passed** across flight and legacy migration, the quest host, checkpoints, and the Catie planner and built-world walk. The web build also passed.
- Native Troy autoplay: **31 checks passed**, no renderer errors, through the new Cobble witnesses and reward choice.
- Batman/host/model/combat/checkpoint group: **57 checks passed**. Tests include the actual settled character's seated hips against the bat's passenger contact point, invalid-state rejection and legacy checkpoint handling.
- Targeted people/ferry, murder/autoplay, retired-quest/journal/cast, island/survey/highland and completed-world border tests passed. Every false passage has clear approach and retreat, and the continuous barrier is sampled for physical gaps.
- The Solis Sultana berth was moved clear of the harbor pier; all seven related tests passed.
- Skill registry, icon, browser and developer-flight checks passed after adding Flying. The registry now contains 34 skills; Flying has its own icon and the existing hidden/reserved-skill rules still apply.
- Actual-renderer images were reviewed for the rider, cave, ruined islands, highlands and both kinds of blocked passage. Artifacts are under `tests/artifacts/bat-*.png`.

Reproduce the focused checks with `npm run test:batman` and `npm run test:batman:desktop`. The full repository test suite was not run. Native checks use a temporary profile and in-memory checkpoints, not the player's save.

### Final terrain and developer-bat refinement

The natural Suval terrain pass retains the short tour at about 123 seconds. All 32 focused terrain, frontier, flight and walking-route tests pass; six developer-flight tests pass. The native Batman harness passes 88 checks with no renderer errors, including real held/released Tab and Shift input. The final web build passes.
