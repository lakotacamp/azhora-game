/** A tree keeps its species from the world through harvesting and sawing.
 * Timber without an implemented harvest recipe has no substitute log: a cedar
 * never silently turns into pine, and a red oak is not a white oak. */
const freeze = Object.freeze;
const timber = (species, name, woodKind = species, log = null, plank = null, carriageUse = null) => freeze({ species, woodName: name, woodKind, log, plank, carriageUse });
export const WOOD_SPECIES = freeze({
  'loblolly-pine': timber('loblolly-pine', 'Loblolly pine', 'pine', 'pine-logs', 'pine-plank', 'Light carriage panels and the first repair lesson.'),
  'white-oak': timber('white-oak', 'White oak', 'oak', 'oak-logs', 'oak-plank', 'Sturdy carriage frames and running gear.'),
  'black-willow': timber('black-willow', 'Black willow', 'willow', 'willow-logs'),
  'red-maple': timber('red-maple', 'Red maple', 'maple', 'maple-logs'),
  'black-walnut': timber('black-walnut', 'Black walnut', 'walnut', 'walnut-logs', 'walnut-plank', 'Fine carriage trim and finished fittings.'),
  'red-oak': timber('red-oak', 'Red oak'),
  'tulip-poplar': timber('tulip-poplar', 'Tulip poplar'),
  hickory: timber('hickory', 'Shagbark hickory'),
  beech: timber('beech', 'Beech'),
  sweetgum: timber('sweetgum', 'Sweetgum'),
  sycamore: timber('sycamore', 'Sycamore'),
  'bald-cypress': timber('bald-cypress', 'Bald cypress'),
  'red-cedar': timber('red-cedar', 'Red cedar'),
  holly: timber('holly', 'Holly'),
  dogwood: timber('dogwood', 'Dogwood'),
  persimmon: timber('persimmon', 'Persimmon'),
});

export const WOOD_KIND_SPECIES = freeze(Object.fromEntries(Object.values(WOOD_SPECIES).filter(wood => wood.log).map(wood => [wood.woodKind, wood.species])));
export function timberForSpecies(species) { return WOOD_SPECIES[species] ?? null; }
export function timberForKind(kind) { return timberForSpecies(WOOD_KIND_SPECIES[kind]); }

/** Existing simplified forest styles already depict oak crowns and pine cones.
 * This attaches their fixed identity without rolling another random number,
 * changing a tree ID, changing its silhouette, or enabling unbuilt harvesting. */
export const forestTimber = pine => timberForKind(pine ? 'pine' : 'oak');
