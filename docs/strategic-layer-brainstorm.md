# Azhora strategic layer: discussion draft

30 September 2026 discussion draft; updated 2 October. The user authorized the recommended first prototype, now available through **F8 > Quest playtests > Frontier command**. See [prototype usage and limits](strategic-prototype.md). The broader country-level systems below remain design recommendations, not accepted canon or implemented gameplay.

## What already exists

The developer atlas contains **131 regions and 3,733 hexes assigned to those regions**. Its immutable `(q,r)` cells, terrain and shared edges are a useful strategic foundation. It does not contain a complete sovereign-country registry, population or economy. The game currently uses **100 world metres per hex**; the older 56 m figures in some documents are superseded. Strategic travel cannot be calibrated as though these compressed adventure spaces were literal continental distances. Sources: [atlas export](../assets/azhora-dev-regions.json), [exporter](../scripts/export-developer-atlas.mjs), [world scale](../src/world-scale.js).

| Example | Verified geography | Political data caveat |
| --- | --- | --- |
| Ambroni Empire | Many individually named provinces rather than one atlas region named Ambron; Ambron is the capital in Elagos | Current initial `empire` control covers Drent, Elagos, Moros Plain, Caricas and Isareos. Nine regions are `contested`. This is **not** a definitive list of imperial claims or historical borders. |
| Ascarth | Northern Ascarth, 16 hexes; Southern Ascarth, 18 | Both currently use the campaign's `wild` label. A country registry and its government remain to be designed. |
| Lond | North 38, East 36, South 29, West 45, Central 58: **five regions, 206 hexes** | None has an explicit `REGION_DESIGN` entry. Do not interpret the fallback “No ruler” as established political history. |
| Dwarfland | West Baldro Mountains, 36 hexes; East Baldro Mountains, 32 | Both are confirmed dwarf-controlled despite lacking campaign region entries. Government and internal connections remain open. |

[`campaign-world.js`](../src/campaign-world.js) supplies region design, atlas adjacency and a mixed faction list: countries, an alliance, and labels such as `contested` and `wild`. [`campaign.js`](../src/campaign.js) saves chapter progress, trust, truces, regional arcs and one effective-control label per region. Arcs and particular chapter victories change that label. Its `battleOdds()` is a quest-derived modifier, not a simulation of army composition, supply or maneuver.

There are real local battles, marching escorts and persistent individuals. However, the [border chapter](../src/border-chapter.js), [temporary battle reinforcements](../src/file-fill.js), [living company](../src/living-story.js), [ranger defense](../src/ibenwood-defense.js) and [frontier raids](../src/frontier-raids.js) do not constitute a continental army system. Temporary assigned soldiers explicitly disappear after their encounter; turning them into permanent regiments would change an existing rule.

## Recommended structure

Use the existing atlas for a **country → region → local holding** hierarchy, with armies moving across its hex graph. This combines regional administration with meaningful crossings and maneuver.

| Layer | Proposed responsibility |
| --- | --- |
| Country | Diplomacy, treasury, recruitment policy, nominal territory and government. A large country has more regions, not a different ruleset. |
| Region | Stable geographic identity and administration; aggregates production, supply and political conditions. Borders do not change whenever an army marches. |
| Holding | A town, fort, port, grove, pasture range or mountain entrance with a controller, access rules and productive or military role. Existing exact footprints can override a hex's general jurisdiction. |
| Hex / crossing | Terrain travel cost, local occupation or influence, reconnaissance and route capacity. Roads, fords, bridges and passes are edges or sites rather than another ownership hierarchy. |
| Army | Persistent identity, allegiance, troops, condition, orders, supplies and route progress. A moving army does not own every hex it passes through. |

Separate **nominal sovereignty**, **effective control**, **local political support** and **alliance membership**. “Contested” becomes a computed description; “unwritten political data” stays visibly unknown. An Izoli force fighting in the Coalition should retain its home identity. Feradom's nominal loyalty need not erase its autonomy. Capturing an imperial town need not erase an imperial claim or instantly convert its inhabitants.

Regions should remain named exactly as authored. Add stable country IDs alongside them; do not reuse the numeric IDs that select rendered regions. A region can contain holdings of several sovereigns, so the hierarchy is an organizational view rather than an exclusive country-parent relationship. Record local exceptions such as Elod and the Yunethre free town instead of coloring an entire region with one sovereign and treating that as complete truth.

## What the player would see and do

Add a **Realms** view to the existing map. Keep the same recognizable lakes,
mountains, roads and region names. Political color shows effective control;
dashed boundaries show claims, and hatching marks divided control. Offer focused
overlays for supply, diplomacy and intelligence instead of displaying everything
at once. Unconfirmed governments remain unknown until the country roster is
reviewed.

Country intelligence should come from scouts, holdings and reports; enemy
positions can become stale. Keep this separate from the traveler's personal
cartography discoveries, so opening a country view does not automatically grant
map exploration rewards or expose every hidden character and quest.

Selecting a country opens its treasury, food reserves, recruiting capacity,
relations and objectives. Selecting a region shows its holdings and local
support. Selecting an army shows its commander, units, morale, supplies and
orders. Clicking a destination previews the route, required permissions,
crossings, expected arrival and supply problems before committing the order.
Army banners should animate along the route; a border does not change simply
because a banner crossed it.

Useful first orders would be **march, hold, patrol, escort and resupply**. Later
orders could add raid, besiege, blockade and retreat. Construction decisions
could begin with repairing a bridge, improving a depot or restoring a ruined
town, all at identifiable sites in the adventure world. This gives the strategy
layer visible consequences that the traveler can visit.

For example, Minora could feed and shelter an Imperial army while Yunethran
bands harass its northern supply route. Caricas might remain militarily occupied
while its towns grow less cooperative under requisition. Negotiating passage
through the neutral town could matter without anyone having to conquer it.
These are example strategic situations, not predetermined quest outcomes.

A smaller country should have viable aims: protecting a pass, sustaining a
trading network, winning recognition or surviving a war. A large empire would
gain resources alongside longer supply routes, contested loyalties and more
demands on its forces. Relative size need not make every campaign a conquest
race. Guilds, magical knowledge and religious institutions could become sources
of influence once the basic simulation works.

## Adventure, time and battles

**Recommended direction:** a pausable strategic simulation tied to active play, with orders that can be inspected and changed on the atlas. Offer explicit waiting and later travel acceleration, with clear warnings before consequential events. The alternative is an explicit “advance campaign day” model: easier to reason about, but armies remain stationary while the traveler adventures. This choice needs the user's answer before implementation.

The current [saved world calendar](../src/living-story.js) maps one active second to one calendar minute: a displayed day takes 24 active minutes. Loading does not advance it; menus pause it. Reuse that source of elapsed time if the living-world option is chosen, but first decide whether its pace suits an army campaign. Use fixed strategic update steps and saved order progress, not wall-clock timestamps or frame-dependent movement. Avoid silently changing quest deadlines, crop growth or companion travel to force a new war calendar to fit. The prototype can advance by explicit test commands while this is unsettled.

Strategic distance should be expressed as **march effort and arrival time**, calibrated to the compressed map. Terrain, crossings, weather and supply affect it; adventure walking speed does not define the size of the continent. Do not stretch the built world or pretend a 100 m hex contains a realistically scaled province. Larger troop strengths can be represented abstractly, with a limited nearby scene showing part of the column or battle.

Near the traveler, the visible force and the strategic army must share one roster and outcome. The abstract simulation must not simultaneously move or fight an army engaged in a local encounter. A player can scout, escort supply, sabotage a crossing or fight one important part of a battle; their effect should be bounded and readable. Distant battles can resolve from forces, terrain, morale and supply. Do not treat the current eight-to-twelve-enemy encounter as an entire national army, or silently replace the established story battle's rules.

## Economy and logistics

Start with **food, coin and available recruits**, plus army fatigue, morale and carried supply. Generate regional output from reviewed holdings and terrain suitability; coarse atlas terrain alone cannot establish farms, mines, populations or crop yields. Existing [farm plots](../src/regional-farmland.js) and [levy disputes](../src/civil-war-quests.js) provide concrete anchors, not a finished national economy.

An army draws supply through friendly or permitted holdings and crossings. Breaking a bridge, blockading a port or isolating a depot should matter more than occupying every empty forest hex. Local forage has limits; heavy requisition reduces reserves and support. Reinforcement needs both recruits and access, preventing instant recovery deep in hostile country. Add timber, metal, trade commodities, seasonal harvests and naval logistics only after this small model works. Character inventory remains personal; a handful of harvested carrots should not fund a national campaign through an accidental conversion.

## Civil war and distinct societies

The Ambroni civil war needs competing legitimacy and local loyalties, not just two painted countries. Current regional quests should produce strategic consequences without a second system overwriting their results every tick. The first prototype should preserve the campaign as the authority for scripted settlements and use a single adapter for strategic effects. A later dynamic campaign would require explicit revision of whole-region `resolveArc()` behavior, chapter gates and reward rules.

Cedric's claim from Minora, Willard's installation in Ambron and Wilhelm's presence are now confirmed, but their later story is not. Model claimant and government identities separately from a generic `empire` label; do not infer how their dispute resolves. See the latest [confirmed answers](design-answers.md).

Distinct systems should follow established territory and institutions, with the details still proposed:

- **Elfland:** groves and protected living forest are its base. Use the actual irregular inner belt, including portions of the outer Ibenwoods; human outer-forest communities are not automatically elven subjects. The confirmed withdrawal premise removes access to Elfland while leaving the forest present. A proposed strategic rule would therefore change access rather than award cleared land to an attacker. Its trigger remains undecided.
- **Yunethre centaurs:** represent independent clans, mobile camps, pasture access, trade and raids. Proposed power comes from mobility and knowledge of routes rather than compulsory farming-town conquest. Keep the neutral lakeside town and Elfland's support distinct from subordination to Elfland.
- **Dwarfland:** both Baldro regions remain dwarf-controlled. Mountain entrances, inhabited underground cities and surface valleys offer a different holding network. Internal tunnels, production advantages and siege rules are proposals; neither the atlas nor the confirmed premise establishes their routes or exact rules. See the [Dwarfland draft](dwarfland-design-draft.md).

## A small prototype and decisions before expansion

Recommended first prototype: **Isareos, Caricas and Yunethre**, using the newly built city, farms, bridges and camp. One Imperial field force and one centaur band can demonstrate supply, marching, raiding and retreat while Minora's future royal story stays reserved and the lakeside town stays neutral. Start with a small holding ledger, an Imperial supply connection, a centaur resupply rule suited to its camp, one frontier objective and one battle outcome reconciled with the adventure. Keep recruitment types, diplomacy and production deliberately small. Use generic unit records, without inventing civilian characters. This is an isolated strategic scenario, not a new story quest or permission to alter the current chapter.

**Luscia, Moros Plain and West Suval** would be a useful second scenario for testing integration with the existing civil-war branch and chapter battles, after their outcome rules have an explicit strategic adapter. Drent/Elagos could provide fixed background context and Elod remain neutral.

Success means orders survive reload, both armies respect geography, supply disruption changes a choice, a holding can change hands without rewriting atlas regions, and one adventure action has one durable strategic consequence. The map must explain claims versus actual control. Test entirely in a separate strategic fixture first; existing saves and quest outcomes stay authoritative. A future optional strategy snapshot should migrate from existing campaign control, not reset completed arcs or resurrect persistent casualties.

The decisions that most affect the design are:

1. **Who does the player command?** Remain a mercenary influencing leaders; earn command of a force; or directly govern countries through a strategy mode? Recommended starting point: advisory orders or earned army command, preserving the traveler as a character.
2. **Does war advance during ordinary exploration?** Active-play simulation, explicit campaign turns, or an optional mode? How much warning should protect a long wilderness expedition from losing a distant war?
3. **How dynamic is the story allowed to become?** Can an army capture a required quest town, defeat a named ruler, or end the civil war before its planned chapter? A limited prototype should reserve existing story outcomes until this is answered.
4. **What are the initial countries and claims?** Confirm Ambron's claimed provinces, Ascarth's government and Lond's unity; keep unknowns as unknowns. Also decide whether victory means conquest, survival, a political settlement or a character objective.

These questions precede a full production design. Nothing here authorizes new sovereigns, cultural canon, army numbers, a technology tree, or continent-wide implementation.
