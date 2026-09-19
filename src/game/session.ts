import type { Airport } from '../data/airports'
import {
  milestoneBonus,
  pointsForRevealIndex,
  ROUNDS_PER_SESSION,
} from './scoring'
import { loadProgress, saveProgress, type Progress } from './storage'

export type RoundOutcome = 'correct' | 'skipped' | null

export type RoundState = {
  airport: Airport
  photoIndex: number
  outcome: RoundOutcome
  wrongAttempts: number
  pointsEarned: number
  bonusEarned: number
}

export type SessionState = {
  rounds: RoundState[]
  index: number
  sessionMiles: number
  sessionPeakStreak: number
  progress: Progress
  finished: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function createSession(airports: Airport[]): SessionState {
  const picked = shuffle(airports).slice(0, Math.min(ROUNDS_PER_SESSION, airports.length))
  const progress = loadProgress()
  return {
    rounds: picked.map((airport) => ({
      airport,
      photoIndex: 0,
      outcome: null,
      wrongAttempts: 0,
      pointsEarned: 0,
      bonusEarned: 0,
    })),
    index: 0,
    sessionMiles: 0,
    sessionPeakStreak: progress.currentStreak,
    progress,
    finished: false,
  }
}

export function currentRound(s: SessionState): RoundState | null {
  if (s.finished || s.index >= s.rounds.length) return null
  return s.rounds[s.index]
}

export function canReveal(round: RoundState): boolean {
  return (
    round.outcome === null &&
    round.photoIndex < Math.min(2, round.airport.images.length - 1)
  )
}

export function revealNext(s: SessionState): SessionState {
  const round = currentRound(s)
  if (!round || !canReveal(round)) return s
  const rounds = s.rounds.map((r, i) =>
    i === s.index ? { ...r, photoIndex: r.photoIndex + 1 } : r,
  )
  return { ...s, rounds }
}

export function submitGuess(s: SessionState, airportId: string): SessionState {
  const round = currentRound(s)
  if (!round || round.outcome !== null) return s

  if (airportId !== round.airport.id) {
    const rounds = s.rounds.map((r, i) =>
      i === s.index ? { ...r, wrongAttempts: r.wrongAttempts + 1 } : r,
    )
    return { ...s, rounds }
  }

  const points = pointsForRevealIndex(round.photoIndex)
  const nextStreak = s.progress.currentStreak + 1
  const bonus = milestoneBonus(nextStreak)
  const progress: Progress = {
    miles: s.progress.miles + points + bonus,
    currentStreak: nextStreak,
    bestStreak: Math.max(s.progress.bestStreak, nextStreak),
  }
  saveProgress(progress)

  const rounds = s.rounds.map((r, i) =>
    i === s.index
      ? {
          ...r,
          outcome: 'correct' as const,
          pointsEarned: points,
          bonusEarned: bonus,
        }
      : r,
  )

  return {
    ...s,
    rounds,
    progress,
    sessionMiles: s.sessionMiles + points + bonus,
    sessionPeakStreak: Math.max(s.sessionPeakStreak, nextStreak),
  }
}

export function skipRound(s: SessionState): SessionState {
  const round = currentRound(s)
  if (!round || round.outcome !== null) return s

  const progress: Progress = {
    ...s.progress,
    currentStreak: 0,
  }
  saveProgress(progress)

  const rounds = s.rounds.map((r, i) =>
    i === s.index
      ? { ...r, outcome: 'skipped' as const, pointsEarned: 0, bonusEarned: 0 }
      : r,
  )

  return { ...s, rounds, progress }
}

export function advanceRound(s: SessionState): SessionState {
  const next = s.index + 1
  if (next >= s.rounds.length) {
    return { ...s, finished: true, index: next }
  }
  return { ...s, index: next }
}
