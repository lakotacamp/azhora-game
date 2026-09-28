# Feradom and East Lotharn desktop integration

Claude's East Lotharn work from `azhora-game-south-suval` (`b108263`) and the live Feradom work from `azhora-game-feradom` are integrated into the main desktop checkout. Existing Suval climbing, Iscare, quests, and current uncommitted work are preserved.

## Testing from the desktop app

Restart Azhora using the existing desktop shortcut. Open F8 and use Go anywhere to choose East Lotharn Mountains or Feradom. The Named ground list includes their valleys, passes, and landmarks. Developer map and developer bat remain in Hacks.

Region identities are unchanged for existing saves: Iscare remains 19; East Lotharn is 20; Feradom is 21. Feradom's ordinary border remains closed, while testing travel can place the player inside.

## Integration details

- Imported the authored terrain, detailed scenery, roads, mountain water, wildlife, landmarks, and Feradom fortifications/garrisons.
- Extended the current climbing controller to both new regions instead of importing the older controller. Closed borders still apply to climbing.
- Eight Lotharn caves use explicit underground ownership. Walk through a mouth to enter; walking above a cave keeps the surface floor. Cave cameras stay in the passage and cave lighting fades at the entrance.
- A save made underground resumes at the entrance used to enter, safely on the surface. Testing travel, defeat/recovery, and flight release cave ownership.
- Added a native regional integration check (`npm run test:northern-regions:desktop`) alongside focused terrain, wildlife, fortification, climbing, and cave checks.

This imports the present Claude landscape. The broader aesthetic mountain redesign in `east-lotharn-mountain-plan.md` remains a separate piece of work.

## Verification

Native Electron check passed 57 assertions with no renderer errors, covering public F8 travel, cave roof/entry/transit/exit, safe checkpoint restoration, and keyboard-driven climbing. Both regions register persistent land wildlife. Focused terrain, wildlife, current Suval climbing regressions, fortifications, language, atlas, survey, and travel checks also passed. `npm run build:web` and whitespace/parsing checks passed. Native captures and the result JSON are in `tests/artifacts/northern-*`.

## Countryside and ledge follow-up (28 September 2026)

Birch Pass had two movement defects: the walking guard rejected steep descents,
and the overlapping hill blend introduced a small discontinuity concealed by the
coarser terrain mesh. Descents now leave ground support instead of meeting a
wall; the hill blend fades continuously. Gentle wooded slopes remain walkable,
while exposed steep faces use the existing climbing controls.

Ordinary foot movement now uses `terrain-fall.js` when stepping off a ledge or
jumping. Falls retain momentum, accelerate under gravity, permit limited air
steering, and slide off steep contacts until a stable foothold. Drops up to
3.5 metres are forgiving; larger dry landings cost five health per additional
metre, capped at 100. Water cushions the impact and starts the swimming system
only at its surface. Pausing freezes the fall. Airborne saves and fatal-fall
recovery use the last safe foothold. Climbing and vehicle controllers retain
ownership of their own movement.

The developer bat ceiling is 900 metres, above the roughly 421-metre highest
East Lotharn summit and its six metres of flight clearance. It still has to
climb before crossing a cliff and descend physically when G requests landing.

Feradom now has 82 persistent animals: 33 deer, 13 boar, 35 hares and one hawk.
Every one of its 34 hexes has resident land animals, with additional pass bands.
Cultivated plots and farm shelters are excluded from their home and roam spaces.

Seven anonymous farms occupy Feradom's plains and three occupy the first dry
land south of Ambron. Their 30 garden beds share the established Farming seed,
watering, growth, harvest, XP and save rules. Stanley's four original rows and
old saves remain compatible. See `regional-farmland.md` for the landscape plan.
The farms are discoverable named ground in F8 travel and on the chart.

`npm run test:countryside:desktop` uses an isolated save to exercise an actual
Lotharn walk-off fall, pause, steering, injury/recovery, summit flight/landing,
Birch Pass walking, wildlife coverage and regional farming through the F-key UI.

Verification: the countryside desktop run passed all 88 assertions with no
renderer errors. The northern regional regression passed all 57 assertions,
including cave walking and keyboard climbing. The final focused controller,
swimming, farming, checkpoint and map suite passed 100 tests. The web build
and whitespace checks passed. Captures and JSON reports are in
`tests/artifacts/countryside-*` and `tests/artifacts/northern-*`. The countryside
Electron process logged a GPU teardown warning after writing its successful
result; the separate northern desktop run exited normally.
