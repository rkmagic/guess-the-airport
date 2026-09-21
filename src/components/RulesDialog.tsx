import {
  HINT_FLOOR_POINTS,
  MAX_PHOTOS,
  MILESTONE_BONUSES,
  POINTS_BY_PHOTO,
} from '../game/scoring'

type Props = {
  roundCount: number
  onStart: () => void
  onCancel: () => void
}

const streakBonuses = Object.entries(MILESTONE_BONUSES)
  .map(([n, miles]) => `${n} (+${miles.toLocaleString()})`)
  .join(', ')

export function RulesDialog({ roundCount, onStart, onCancel }: Props) {
  return (
    <div className="confirm-overlay is-fixed" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog rules-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="rules-title">Before you fly</h2>
        <p className="rules-intro">
          {roundCount} rounds. Guess the airport from ground-level photos — no
          silhouettes, no map pins.
        </p>
        <ul className="rules-list">
          <li>
            <strong>Miles</strong> — correct on photo 1 / 2 / 3 earns{' '}
            {POINTS_BY_PHOTO.join(' / ')} miles.
          </li>
          <li>
            <strong>Reveal</strong> — up to {MAX_PHOTOS} photos per round. More
            reveals means fewer miles.
          </li>
          <li>
            <strong>Hint</strong> — using one cuts your miles for that round,
            same as revealing an extra photo ({POINTS_BY_PHOTO[0]}→
            {POINTS_BY_PHOTO[1]}, {POINTS_BY_PHOTO[1]}→{POINTS_BY_PHOTO[2]},{' '}
            {POINTS_BY_PHOTO[2]}→{HINT_FLOOR_POINTS}).
          </li>
          <li>
            <strong>Skip</strong> — ends the round with 0 miles and resets your
            streak.
          </li>
          <li>
            <strong>Streaks</strong> — bonuses at {streakBonuses} clears in a
            row.
          </li>
        </ul>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Not now
          </button>
          <button type="button" className="btn btn-primary" onClick={onStart}>
            Let's go
          </button>
        </div>
      </div>
    </div>
  )
}
