import { useMemo, useState } from 'react'
import type { Airport } from '../data/airports'
import { toGuessOptions } from '../data/airports'
import {
  advanceRound,
  canReveal,
  createSession,
  currentRound,
  revealNext,
  skipRound,
  submitGuess,
  type SessionState,
} from '../game/session'
import { Attribution } from './Attribution'
import { GuessInput } from './GuessInput'
import { PhotoStage } from './PhotoStage'
import { ResultPanel } from './ResultPanel'
import { ScoreBar } from './ScoreBar'

type Props = {
  airports: Airport[]
  session: SessionState
  setSession: (s: SessionState) => void
  onFinished: (s: SessionState) => void
}

export function PlayScreen({ airports, session, setSession, onFinished }: Props) {
  const options = useMemo(() => toGuessOptions(airports), [airports])
  const round = currentRound(session)
  const [flashMiles, setFlashMiles] = useState<number | null>(null)
  const [wrongPulse, setWrongPulse] = useState(false)

  if (!round) return null

  const active = round
  const revealed = canReveal(active)
  const decided = active.outcome !== null
  const maxPhotos = Math.min(3, active.airport.images.length)

  function handleGuess(id: string) {
    const prevWrong = active.wrongAttempts
    const next = submitGuess(session, id)
    const r = next.rounds[next.index]
    if (r.outcome === 'correct') {
      setFlashMiles(r.pointsEarned + r.bonusEarned)
      setTimeout(() => setFlashMiles(null), 1200)
    } else if (r.wrongAttempts > prevWrong) {
      setWrongPulse(true)
      setTimeout(() => setWrongPulse(false), 450)
    }
    setSession(next)
  }

  function handleContinue() {
    const next = advanceRound(session)
    if (next.finished) onFinished(next)
    else setSession(next)
  }

  return (
    <div className="screen play-screen">
      <ScoreBar
        progress={session.progress}
        roundLabel={`${session.index + 1} / ${session.rounds.length}`}
        flashMiles={flashMiles}
      />
      <PhotoStage
        images={active.airport.images.slice(0, maxPhotos)}
        photoIndex={active.photoIndex}
        dimmed={decided}
      />
      <div className={`play-dock${wrongPulse ? ' is-wrong' : ''}`}>
        {!decided ? (
          <>
            <GuessInput options={options} onSubmit={handleGuess} />
            <div className="round-controls">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!revealed}
                onClick={() => setSession(revealNext(session))}
              >
                Reveal
                {revealed
                  ? ` (${active.photoIndex + 1}/${maxPhotos})`
                  : ' (max)'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSession(skipRound(session))}
              >
                Skip
              </button>
            </div>
            {active.wrongAttempts > 0 && (
              <p className="wrong-hint">Not that one — try again or reveal.</p>
            )}
          </>
        ) : (
          <ResultPanel round={active} onContinue={handleContinue} />
        )}
      </div>
    </div>
  )
}

type CreditsProps = {
  airports: Airport[]
  onBack: () => void
}

export function CreditsScreen({ airports, onBack }: CreditsProps) {
  const all = airports.flatMap((a) =>
    a.images.map((img) => ({ ...img, airport: a.iata })),
  )
  return (
    <div className="screen credits-screen">
      <div className="credits-content">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <h1>Photo credits</h1>
        <p className="home-lede">
          All photos from Wikimedia Commons. Attribution captured at ingest.
        </p>
        {airports.map((a) => (
          <section key={a.id} className="credits-block">
            <h2>
              {a.iata} · {a.name}
            </h2>
            <Attribution assets={a.images} />
          </section>
        ))}
        {all.length === 0 && <p>No photos loaded yet.</p>}
      </div>
    </div>
  )
}

export { createSession }
