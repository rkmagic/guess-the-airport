import type { Progress } from '../game/storage'

type Props = {
  progress: Progress
  roundLabel?: string
  flashMiles?: number | null
  onQuit?: () => void
}

export function ScoreBar({ progress, roundLabel, flashMiles, onQuit }: Props) {
  return (
    <header className="score-bar">
      <div className="score-brand">
        <span className="brand-mark">AeroGuesser</span>
        {roundLabel && <span className="round-label">{roundLabel}</span>}
      </div>
      <div className="score-trailing">
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
        {onQuit && (
          <button
            type="button"
            className="score-quit"
            onClick={onQuit}
            aria-label="Quit to home"
            title="Quit"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}
