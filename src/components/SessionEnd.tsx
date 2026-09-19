type Props = {
  sessionMiles: number
  peakStreak: number
  correctCount: number
  totalRounds: number
  onAgain: () => void
  onHome: () => void
}

export function SessionEnd({
  sessionMiles,
  peakStreak,
  correctCount,
  totalRounds,
  onAgain,
  onHome,
}: Props) {
  return (
    <div className="screen end-screen">
      <div className="end-content">
        <p className="home-eyebrow">Session complete</p>
        <h1 className="end-title">Nice flying</h1>
        <p className="home-lede">
          {correctCount}/{totalRounds} cleared · {sessionMiles.toLocaleString()}{' '}
          miles this run
        </p>
        <div className="home-stats">
          <div>
            <span className="stat-label">Session miles</span>
            <strong>{sessionMiles.toLocaleString()}</strong>
          </div>
          <div>
            <span className="stat-label">Peak streak</span>
            <strong>{peakStreak}</strong>
          </div>
        </div>
        <div className="end-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onAgain}>
            Play again
          </button>
          <button type="button" className="btn btn-ghost" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
