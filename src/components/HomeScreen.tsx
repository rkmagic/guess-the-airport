import type { Progress } from '../game/storage'
import { ROUNDS_PER_SESSION } from '../game/scoring'

type Props = {
  progress: Progress
  airportCount: number
  onPlay: () => void
  onCredits: () => void
}

export function HomeScreen({ progress, airportCount, onPlay, onCredits }: Props) {
  return (
    <div className="screen home-screen">
      <div className="home-atmosphere" aria-hidden>
        <div className="home-stars home-stars--far" />
        <div className="home-stars home-stars--near" />
        <div className="home-horizon" />
        <div className="home-runway" />
        <div className="home-plane" />
        <div className="home-plane-trail" />
      </div>
      <div className="home-content">
        <p className="home-eyebrow">Ground-level · no codes · no silhouettes</p>
        <h1 className="home-brand">AeroGuesser</h1>
        <p className="home-lede">
          One photo from the curb, the taxi rank, or the terminal. How few
          reveals do you need?
        </p>
        <button type="button" className="btn btn-primary btn-lg" onClick={onPlay}>
          Play {Math.min(ROUNDS_PER_SESSION, airportCount)} rounds
        </button>
        <div className="home-stats">
          <div>
            <span className="stat-label">Miles</span>
            <strong>{progress.miles.toLocaleString()}</strong>
          </div>
          <div>
            <span className="stat-label">Best streak</span>
            <strong>{progress.bestStreak}</strong>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onCredits}>
          Photo credits
        </button>
      </div>
    </div>
  )
}
