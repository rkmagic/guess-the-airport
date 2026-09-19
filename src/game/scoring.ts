export const POINTS_BY_PHOTO = [300, 200, 100] as const
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

export function milestoneBonus(streak: number): number {
  return MILESTONE_BONUSES[streak] ?? 0
}
