# Jesse: A carriage worth the road

Jesse now works across the road from the old prophet/Cagney crossroads, a little farther west toward Ambron. Their existing appearance and slang remain. Chip recommends the workshop both during the bridge conversation and after the repair.

The green training quest collects two wheels, an axle, and prepared timber around the workshop. Three assembly choices build the frame, fit the running gear, and brace the seats. Completion grants experience in the existing Carpentry skill (the construction system).

Prepared pine allows a beginner to finish. Four oak or walnut planks can replace it; timber changes the carriage finish and durability, and Woodcutting experience improves craftsmanship. Tree species and timber identity remain separate, so unrelated species never silently yield a generic pine or oak log. The existing five harvestable woodlot types retain their own logs. Forest and botanical tree metadata identifies species without making decorative trees newly harvestable.

Jesse drives a physical, collision-aware carriage to Ambron with the traveler in its passenger seat. Four comments cover the breeze, politics, wood, and the guild. The journey pauses with the game and can resume from a checkpoint. It uses the road shoulder past waiting Kayla, enters the Ossen Gate, and parks beside the Carpenter's Guild.

Jesse walks inside. Knocking brings them out; the conversation explicitly says that the Carpenter's Guild story is not fleshed out yet. This is the end of this quest.

F8 -> Quest playtests -> Jesse starts a fresh isolated computer run. The pilot speaks with Jesse, collects all four workshop parts on foot, uses the supplied pine, completes all three assembly choices, boards the carriage, and waits for Jesse to enter the guild. Any key or click takes control; P resumes Jesse's focused quest, including during the passenger ride. Starting the Jesse playtest again clears its collected parts and progress, even during an existing ride. The normal saved adventure remains untouched.

`npm run test:jesse:autoplay` runs the public card in the desktop game with ordinary movement and dialogue, save/load, pause, restart, and native takeover/resume checks. Pure controller coverage is in `tests/jesse-autopilot.test.js`.

Validation includes unit tests for parts, timber, one-time experience, save/restore, and dialogue; real-world collision tests for the workshop, carriage road, and guild approach; and `npm run test:jesse-carriage`, which exercises the actual desktop conversation, collection, assembly, saved passenger ride, arrival, and knock.

Related work: [Ambron relocation](ambron-interlake-capital.md). Cagney now begins at a small roadside hamlet closer to Ambron; Kayla's race and residents' home routes use the new city gates.

Desktop results: the carriage journey, mid-ride checkpoint, guild knock, and Ben/Troy/Cagney home-return checks pass. Cagney's relocated autoplay completes in 117 seconds with all three encounters, one reward, no frame errors, and smooth following.

The broad monolithic `npm test` run was stopped after more than 15 minutes of top-level world setup, before test results appeared, with about 4.8 GB resident memory. It is not recorded as passing. Focused unit/world tests and the native checks above are the validation for this change.

Jesse autoplay validation: all seven controller tests and 19 focused carriage/tracker checks pass. The native public-button test passes 42 checks with no frame errors: the full run takes 173 seconds, walks 62 metres around the workshop, and rides 613 metres to the guild. Mid-ride reset, checkpoint restore, pause/resume, native WASD takeover, native P resume, and normal-save isolation all pass. The web build also passes.
