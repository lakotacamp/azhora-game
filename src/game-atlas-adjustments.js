/** Game geography corrections, applied to read-only World Builder imports.
 * Keep the journal, developer atlas and built river survey on the same source.
 * The upstream map and its provenance hash remain unchanged. */
export const GAME_ATLAS_ADJUSTMENTS = Object.freeze(['tidehaven-northeast-bank-v1']);

export function applyGameAtlasAdjustments(source) {
  const bank = source?.hexes?.['15,105'];
  if (!bank || !['Pueth', 'Drent'].includes(bank.region))
    throw new Error('The Tidehaven northeast bank no longer matches its game atlas correction.');
  const hexes = { ...source.hexes, '15,105': { ...bank, region: 'Drent' } };
  const rivers = { ...source.rivers };
  // Remove the obsolete southward reach through Tidehaven. The Tessen follows
  // the north bank of its new Drent hex, then meets the sea along the coast.
  // This isolated Drent-side spur was drawn in the atlas but never built.
  delete rivers['14,104|14,105'];
  delete rivers['14,105|15,105'];
  delete rivers['14,106|15,105'];
  rivers['15,104|15,105'] = 'small';
  rivers['15,105|16,104'] = 'small';
  rivers['16,104|16,105'] = 'small';
  return { ...source, hexes, rivers };
}
