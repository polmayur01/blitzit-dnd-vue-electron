export function sortedByPosition(list) {
  return [...list].sort((a, b) => a.position - b.position)
}

export function nextPositionBetween(prev, next) {
  if (prev == null && next == null) return 250
  if (prev == null) return next - 5
  if (next == null) return prev + 5
  return (prev + next) / 2
}
