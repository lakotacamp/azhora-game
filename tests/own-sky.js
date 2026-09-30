/**
 * The countries that declare a sky of their own, in **one place**.
 *
 * **This list was two copies for five builds.** `tests/region-sky.test.js` holds that every region but
 * these keeps `DEFAULT_SKY` to the digit, and `tests/eer-world.test.js` holds the same thing while it is
 * measuring Eer's coastal air against Nethereum's basin - and each of them carried its own copy of the
 * allow-list. The West Lotharn builder found the pair and extended both, the Mithala builder found it
 * again, southwest job 1 found it again, southwest job 2 found it again and wrote in its report that it
 * "wants the treatment the 'last N in the list' idiom just got: one exported constant, imported twice".
 * This is that constant.
 *
 * **Adding a country with its own sky now means one line here.** Forgetting it turns both tests red with
 * the country's own name in the message, which is the point: a region that quietly grows
 * `palette.sky`, `palette.haze` or `palette.hazeDensity` is a region whose air nobody argued for, and the
 * two tests exist to make somebody argue for it.
 *
 * Ordered as `REGION_IDS` orders them, so the list reads as the history of who has asked.
 */
export const OWN_SKY = new Set([
  'Eer', 'Nethereum', 'South Suval', 'Iscare Archipeligo', 'East Lotharn Mountains', 'Feradom', 'Gala',
  'Northern Ascarth', 'Southern Ascarth', 'Ovesos', 'Oves Desert', 'West Lotharn Mountains',
  'South Mithala', 'West Mithala', 'East Mithala', 'North Mithala',
  // The southwest, job 1: the first true-desert sky in the game (.0024, the clearest air in Azhora)
  // over the three `BWh` countries, and the steppe sky over West Pyros.
  'Navarth', 'West Pyros', 'Ganesh Desert', 'Ganesh Plain',
  // Job 2: the desert sky unchanged over the interior two, sea air over the West Meroshe's ten ocean
  // edges, and the fog belt over the South - the one `BWh` country whose air is thicker than average.
  'North Meroshe Desert', 'West Meroshe Desert', 'Central Meroshe Desert', 'South Meroshe Desert',
  // Job 3: sea air over the block's most maritime country, the clearest air in Azhora over the plateau
  // (altitude and not dryness), and the block's only properly wet air over Hama's `Csb` half.
  'Cape Heth', 'Dinelv Highlands', 'Hama',
]);
