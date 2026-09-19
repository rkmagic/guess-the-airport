import type { Progress } from '../game/storage'

type Props = {
  progress: Progress
  roundLabel?: string
  flashMiles?: number | null
}

export function ScoreBar({ progress, roundLabel, flashMiles }: Props) {
  return (
    <header className="score-bar">
      <div className="score-brand">
        <span className="brand-mark">AeroGuesser</span>
        {roundLabel && <span className="round-label">{roundLabel}</span>}
      </div>
      <div className="score-stats">
        <div className="stat">
          <span className="stat-label">Miles</span>
          <span className={`stat-value${flashMiles ? ' is-flash' : ''}`}>
            {progress.miles.toLocaleString()}
            {flashMiles != null && flashMiles > 0 && (
              <span className="stat-delta">+{flashMiles}</span>
            )}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{progress.currentStreak}</span>
        </div>
      </div>
    </header>
  )
}
