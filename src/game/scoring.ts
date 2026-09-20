export const POINTS_BY_PHOTO = [300, 200, 100] as const
/** Floor when hint is used on the last photo tier. */
export const HINT_FLOOR_POINTS = 50
export const MILESTONE_BONUSES: Record<number, number> = {
  5: 500,
  10: 1500,
  20: 5000,
}
export const ROUNDS_PER_SESSION = 10
export const MAX_PHOTOS = 3

export function pointsForRevealIndex(revealIndex: number): number {
  // revealIndex is 0-based photo currently shown when guessed correctly
  return POINTS_BY_PHOTO[Math.min(revealIndex, POINTS_BY_PHOTO.length - 1)] ?? 100
}

/**
 * Miles for a correct guess.
 * Reveal already lowers points via photo index; hint steps one tier further
 * (photo 1+hint→200, photo 2+hint→100, photo 3+hint→50). Both helps stack
 * as that single extra step — not a separate compound multiplier.
 */
export function pointsForGuess(revealIndex: number, hintUsed: boolean): number {
  const base = pointsForRevealIndex(revealIndex)
  if (!hintUsed) return base
  const tier = Math.min(revealIndex, POINTS_BY_PHOTO.length - 1)
  if (tier >= POINTS_BY_PHOTO.length - 1) return HINT_FLOOR_POINTS
  return POINTS_BY_PHOTO[tier + 1] ?? HINT_FLOOR_POINTS
}

export function milestoneBonus(streak: number): number {
  return MILESTONE_BONUSES[streak] ?? 0
}
