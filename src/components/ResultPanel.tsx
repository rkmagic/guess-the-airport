import type { RoundState } from '../game/session'
import { Attribution } from './Attribution'
import { ShareLink } from './ShareLink'

type Props = {
  round: RoundState
  onContinue: () => void
}

export function ResultPanel({ round, onContinue }: Props) {
  const correct = round.outcome === 'correct'
  const airport = round.airport
  const shareText = correct
    ? `I cleared ${airport.iata} (${airport.city}) in AeroGuesser — can you beat me?`
    : 'Can you guess the airport from the curb? Play AeroGuesser.'

  return (
    <div className="result-panel" role="dialog" aria-labelledby="result-title">
      <p className={`result-kicker${correct ? ' is-ok' : ' is-skip'}`}>
        {correct ? 'Cleared' : 'Skipped'}
      </p>
      <h2 id="result-title">
        <span className="result-iata">{airport.iata}</span>
        {airport.name}
      </h2>
      <p className="result-meta">
        {airport.city}, {airport.country}
      </p>
      {correct && (
        <p className="result-score">
          +{round.pointsEarned} miles
          {round.bonusEarned > 0 && (
            <span className="result-bonus">
              {' '}
              · streak bonus +{round.bonusEarned}
            </span>
          )}
          <span className="result-photos">
            {' '}
            · photo {round.photoIndex + 1}/{airport.images.length}
          </span>
          {round.hintUsed && (
            <span className="result-hint"> · hint used</span>
          )}
        </p>
      )}
      {!correct && (
        <p className="result-score">Streak reset · 0 miles this round</p>
      )}
      <Attribution assets={airport.images} compact />
      <ShareLink text={shareText} />
      <button type="button" className="btn btn-primary btn-block" onClick={onContinue}>
        Continue
      </button>
    </div>
  )
}
