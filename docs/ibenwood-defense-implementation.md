# Elfland's defended inner forest

30 September 2026. This continues the [Ibenwood environment build](ibenwood-environment-implementation.md) with the guarded inner belt from the [agreed design](ibenwood-design-draft.md). The outer woods remain explorable. Central Ibenwood and the inward-facing portions of its neighbors now have territorial ranger defenses. Dwarfland remains design only.

## Trying it

Relaunch the desktop game and open **F8 → Elfland boundary · stealth trial**. This enters the existing isolated testing session, brings you to an eastern approach, and teaches/raises Stealth to level 70. **X** toggles sneaking. The rangers remain active; this shortcut grants neither permission nor invulnerability. The normal saved adventure is preserved.

The original **Ibenwood grove · environment preview** shortcut remains outside the defended belt. Its living trees are still protected. Normal **Go anywhere** travel also reaches the five forest regions; entering their defended portions on foot is dangerous. Developer flight and ghost inspection suppress ranger attacks while those tools are active.

## Implemented behavior

- An irregular boundary follows the existing inner-forest territory. It is approximately 2.85 km long, with 116 authored marker sites and 80 ranger posts. It excludes the isolated preview grove's tree-protection circle.
- Pale stones mark the actual territorial line. Readable signs stand ahead of it in the outer woods, including lateral approaches and trail crossings. Their notice explicitly describes lethal archers beyond the stones. Rangers give no spoken warning or warning shot.
- Rangers have persistent identities, health, positions and patrol state. Each has a slightly taller elven figure, pointed ears, short cropped hair, a bow and a green leaf-cut mantle. There are no overhead labels exposing concealed rangers from a distance.
- Each ranger detects independently using facing, distance, movement, skill and actual terrain/prop sightlines. Higher Stealth reduces conspicuousness and audible movement; it does not grant invisibility. A visible bow draw precedes release. Breaking sight or retreating outside interrupts a pending shot.
- Arrows originate at the rendered bow grip and travel through space. Trees, rocks, walls, terrain and elevated floors can intercept them. Real body contact uses the normal armor, shielding, dodging, health and defeat systems. Leaving the territory stops further firing; an already released arrow remains a physical projectile.
- Player melee, arrows and fireballs can damage rangers. Fireballs respect their height and physical cover, including passage below canopy structures. Ranger deaths and wounds survive checkpoint reloads and are not erased by retreat or ordinary reset.
- Defeat by the rangers returns the player to a recently safe position outside the belt rather than restarting an unrelated road encounter. Pause freezes patrols and airborne ranger arrows.
- Fallen wood remains gatherable; living trees in protected areas reject felling through the existing harvesting rules.

The current tuning is an implementation default: 44 m sight range, a 100-degree forward cone, 180 ranger health, a 0.7-second bow draw, 70 raw arrow damage and a 2-second firing cooldown. These are not additional user design decisions and can be adjusted after playtesting.

## Verification

The focused Node selection passed **140/140 tests**, covering the environment, canopy movement, boundary geometry, detection, projectiles, spells, character geometry and checkpoint validation. This is not a claim that the complete repository suite passes; the earlier environment report records unrelated fixture drift.

The disposable desktop defense run passed **23 checks**, exited 0, and reported no renderer errors. It exercised the actual F8 shortcut, a rendered draw/release and 70-damage arrow hit, interception by a real forest tree, pause behavior, save/reload of a killed and a wounded ranger, and preservation of the normal checkpoint. Clean boundary and ranger captures were visually reviewed. A level-70 unauthorized sneak traversed **79.31 m**, from 16 m outside to almost 60 m inside the boundary, without detection; maximum suspicion was 0.411. The identical route at level 1 was detected after 24.49 m, about 5.87 m inside. The route checks accelerate elapsed walking time while querying real world collision, height and ranger sightlines; the attack check runs through the actual rendered game loop.

Repeatable commands:

```text
npm run test:ibenwood
npm run test:elfland:desktop
node scripts/launch.cjs --smoke-test --review-views=elfland-boundary,elfland-ranger --review-clean --review-size=1280x800
```

Local, gitignored evidence is in `tests/artifacts/ibenwood-defense-checks.json`, `elfland-desktop.log`, `elfland-desktop-exit.txt`, `elfland-unit.log`, `elfland-boundary.png`, and `elfland-ranger.png`.

## Remaining scope

Permission quests, withdrawal from the human world, royal and civilian characters, interiors and stranger inner-forest fauna are still unimplemented. The region descriptions retain **Environment preview** and identify this unfinished work. The live kingdom is always present for now. The quiet outer grove remains an environment demonstration, not a completed settlement quest.

Nearby patrols are simulated and distant actors retain state; geometry is created as actors come into view. This avoids processing all patrol movement and sightlines throughout the entire world. The smoke session reported a rolling average of 120 ms per frame around the shot check, including synchronous setup work; this is not a controlled graphics-performance benchmark. The prior environment report's rendering concerns remain relevant, and a separate performance pass is still needed.
