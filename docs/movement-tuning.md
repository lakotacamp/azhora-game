# Walking and Running: enjoyable travel from the start

Implemented tuning, 2 October 2026. Ordinary movement should feel useful immediately; mastery is a modest benefit earned during adventures, not a prerequisite for comfortable travel.

| Movement | Beginner | Mastered |
| --- | ---: | ---: |
| Walking speed | 6 m/s | 6.6 m/s |
| Running speed | 9.5 m/s | 10.5 m/s |
| Peaceful running cost | 4 stamina/s | 2.5 stamina/s |
| Active-combat running cost | 8 stamina/s | 5 stamina/s |

These are Azhora tuning values, not measured Breath of the Wild speeds. A beginner with 100 stamina can run for 25 seconds in peaceful terrain or 12.5 seconds during an active fight, assuming no other stamina spending. Climbing, swimming, attacks and dodges retain their separate costs. Combat changes running effort, not speed, so entering a fight does not produce a sudden movement slowdown.

At zero stamina the player continues walking. Holding Run cannot restart running until half of maximum stamina has recovered. Once it resumes, dipping below half a bar does not interrupt it again; only exhaustion resets that latch. This creates a visible recovery interval without a hard stop or rapid alternating walk/run frames. Walking itself never spends stamina.

Walking and Running still gain one XP per second of real, eligible movement. Their independent diminishing curves preserve `maximum walking < beginner running`. Blocked input, pauses, teleportation, falling, knockback, sneaking, climbing, swimming and mounted or scripted travel remain excluded. Old saves receive the new novice baseline without losing existing skill XP.

## What to borrow from Breath of the Wild

The official guide describes stamina as an effort resource for sprinting and climbing, automatic recovery after stopping the effort, and an exhaustion interval before stamina actions become available again. That supports keeping a readable common stamina pool and a deliberate recovery phase. [Piggyback official guide, "Stamina Wheel"](https://www.piggyback.com/online-guide/the-legend-of-zelda/en/)

Celia Wagar's firsthand review criticizes frequent sprint exhaustion during long journeys while praising climbing's route choices and opportunities to rest on suitable slopes. This is a useful design criticism, not a universal player preference: retain decisions around dangerous traversal, but reduce the stamina tax on ordinary safe travel. [CritPoints, "Movement"](https://critpoints.net/2017/05/02/zelda-breath-of-the-wild-review/)

The resulting Azhora choice is quicker starting movement, a small speed reward for mastery, and a larger endurance reward. Running still matters tactically because it shares the resource needed for combat and costs twice as much during an active fight. We should judge the numbers against actual journeys and encounters rather than copy another game's unverified numerical values.

## Frame-rate issue to address separately

The current main loop caps simulation time at 0.05 seconds per rendered frame. Below 20 FPS this slows all simulation, including movement: at a sustained 10 FPS a nominal 6 m/s walk covers about 3 metres per real second. The new speed values do not fix that underlying issue.

Recommended follow-up: separate rendering from bounded fixed simulation substeps. Accumulate active elapsed time, simulate steps no larger than 0.05 seconds, and cap catch-up to a small budget such as five steps/0.25 seconds per frame. Discard suspended/background elapsed time. Apply the same simulation clock to movement, stamina, combat, physics and active quest timing; changing only player displacement would desynchronize those systems. Validate thin-wall collision, fall damage, combat timing, pause/resume and autoplay at 10/15/30/60 FPS before changing the global loop. The tuning change intentionally leaves that shared timestep untouched.

## Validation

Focused locomotion tests cover monotonic independent skill curves, beginner/mastery limits, peaceful versus combat spending with identical XP, stable exhaustion recovery, old-save compatibility, and no XP from excluded movement. Native controls should verify 6 m/s walking and 9.5 m/s running against simulation time, with Tab and Shift equivalent. Review a long peaceful road journey and a fight separately before further balance changes.

Validation record: the isolated Electron smoke run with Fast loading passed after this tuning, exit code 0 and no frame errors. It verified 6 m/s walking, 9.5 m/s Tab/Shift running, two diagonal controls, 50 collision checks and the legacy road/combat/checkpoint flow. Earlier peninsula autoplay elapsed-time measurements predate this tuning; the pure tutorial/autoplay/company suite passed 13 tests with the new values.

The affected Ben, Cagney, civil-war and dwarf autoplay controllers use current host movement speeds, including mastery, combat movement locks and exhaustion. Thirty-two focused controller checks passed, including actual guide-follow velocity at 20/30/60/120 Hz and bounded input during exhaustion/recovery.
