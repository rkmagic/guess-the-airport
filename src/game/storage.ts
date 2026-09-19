const KEY = 'gta-progress-v1'

export type Progress = {
  miles: number
  currentStreak: number
  bestStreak: number
}

const DEFAULT: Progress = {
  miles: 0,
  currentStreak: 0,
  bestStreak: 0,
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      miles: Number(parsed.miles) || 0,
      currentStreak: Number(parsed.currentStreak) || 0,
      bestStreak: Number(parsed.bestStreak) || 0,
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}
