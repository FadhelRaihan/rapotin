// Competition ranking: equal scores share a rank (1, 1, 3); null is unranked.
export function exportRanks(values: (number | null)[]) {
  const ordered = values.filter((value): value is number => value !== null).sort((a, b) => b - a);
  return values.map(value => value === null ? null : ordered.indexOf(value) + 1);
}
