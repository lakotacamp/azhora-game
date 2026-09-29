# Port Calos residents and the Cobble investigation

Implemented design, 27 September 2026.

Update, 28 September 2026: Ari has moved to Applegarth in western Drent, near Stanley, to teach the sunflower Farming lesson. Jesse had already moved to the Luscian road for the carriage quest. The original relocation design below records their earlier Port Calos placement; they are no longer placed in that town.

Port Calos retains its five buildings on the existing land hex and its harbor. It has Catie, Hallie the harbor master, Christina, Ari, Imani, Jesse, Kendall, Jay, Robert, Vic, Madi, Madison, Sierra, Franz, Marissa, Sean, Flor, Melissa, Richard, Laurie, Zach, Courtney, Kathy, Karen, Kirk, Zkayla and Pswtr. Madi and Madison are separate people; Hallie serves the harbor so their names cannot be mistaken for its keeper.

Catie's display name replaces Katy while her `katy` actor and drawing IDs stay stable. The new Suval vigilante quest owns her authored conversation. Hallie retains ferry and swimming services. Every other Port Calos resident says only: **This person could use more characterization.** There are no invented topics, backgrounds, rewards or services for these placeholders. The 21 newly named residents are identical featureless neutral-gray blank figures until the user supplies their physical descriptions; no provisional personal appearances are invented. Existing requested looks remain: Christina's turning disco-ball head; Ari's long black curls and violet dress; Imani's bob, glasses and work clothes; Jesse's twelve-colored hair, glasses and carriage tools. Jesse retains the `cobble-jessi` save ID despite the rename and move.

The harbor identities have switched: long-blonde-haired Hallie now serves Port Calos; long-brown-haired Maddie serves Cobble. Jess stays in Tidewater Haven. Their port role IDs and ferry route/save IDs stay unchanged. All three wear navy-and-cream jerseys, rope belts and weatherproof boots, without hats or bandannas. They can each offer both other ports and introduce Swimming through the shared skill.

## The new people in Cobble

These are fictional NPCs authored for the existing murder mystery, rather than personalities assigned to the user's acquaintances. Their foundations are the Peblos lore's pilot families, shifting bars, salvage customs, Sorven's fresh-water lens, trading through the Stills, and compressed Drentish speech. The ongoing Empire-versus-quay tally dispute is the game's existing investigation premise; it does not redefine the lore's broader island independence.

**Brenna Vell**, `cobble-boatwright`, repairs fishing boats with wood recovered from wrecks. Her mother pilots the inlet; Brenna trusts sound joints and the people who actually worked a tide over an official number. She is blunt enough to admit that she spoke cruelly about the murdered Bregga Sell. It makes her a plausible suspect, but two fishers were holding a split hull while she repaired it through dawn. Brenna's testimony establishes that full cargo aboard sound boats inexplicably weighed short at the quay. Her cropped copper hair, warm ochre clothes, short work apron and hanging hammer distinguish her from the other witnesses and from the relocated Jesse. No headwear.

**Orren Pell**, `cobble-ledgerkeeper`, belongs to a pilot family but records cargo, never a supposedly permanent route through moving sandbars. He teaches his grandchildren to read water from the bow. His accounting shows matching barrel counts and mismatching weights. He lies about his whereabouts because he brought drinking water to deserters from Ed the Word's ship on the skerry. Troy explicitly separates that secret from guilt in Bregga's death. Orren wears a deep-blue coat, brass glasses, a receding silver crop and a short silver beard, and carries a ledger. He has no staff, cloak or hat.

**Sivra Noll**, `cobble-kelp-trader`, comes from Sorven to sort and trade kelp before dawn. She speaks concretely about wet and dry weights, fresh water, and an aunt whose house had to follow a changing island. As the outsider, she receives careful hospitality but none of the village's confidences. She notices a lamp underneath the weigh-beam before any barrels are present, without initially realizing its significance. Her dark tied hair, rose-colored tunic, dark skin, rolled working sleeves and reed basket give her a different silhouette from Brenna and Orren. No headwear.

Torven Oss remains the murderer and Troy remains the investigator. The three clue IDs (`light-boats`, `weights-not-counts`, `lamp-under-the-beam`), deduction, accusation cooldown, reward choice and Mind Read lesson are unchanged. Existing saved accusation IDs for Jesse/Ari/Imani migrate to the corresponding new witnesses when restored; new conversations never accept the relocated trio as witnesses. Troy's autoplay consumes the current testimony registry, so it walks to and interrogates the replacements.

Lore source: `../world-builder/azhora_lore/geography/regions/peblos.md` and the language-family context in `../world-builder/azhora_lore/peoples/languages.md`, read only.

## Verification

Executed Node checks:

- `port-calos-people.test.js` and `ferry.test.js`: 23 passed, including exact names/dialogue, retained looks, 3.5 m personal space, nautical models, all six directed ferry routes, and shared Swimming.
- `murder-quest.test.js`, `troy-autopilot.test.js`, `quest-tracker.test.js`, `katy.test.js`, and `peblos-world.test.js`: 43 passed, including legacy accusation migration, distinct replacement models, and the real Troy dialogue/autoplay path through built Cobble.
- The earlier `port-calos-world.test.js` / murder / Troy run passed 23 checks, including all new resident stands, visible ground matching feet, every compact-town street, the harbor ramp, and connection to Nothom.

Native Electron integration is reserved for the parent task; no concurrent Electron instances were launched for this subtask. Actual procedural meshes were projected into a CPU-rendered contact sheet at `tests/artifacts/people-model-thumbnails.png` and visually reviewed for hair, silhouettes, nautical clothing, and absence of hats.
