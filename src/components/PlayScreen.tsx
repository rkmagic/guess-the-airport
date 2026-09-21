import { useEffect, useMemo, useState } from 'react'
import type { Airport } from '../data/airports'
import { toGuessOptions } from '../data/airports'
import { preloadImages } from '../game/preload'
import {
  advanceRound,
  canReveal,
  canUseHint,
  createSession,
  currentRound,
  revealNext,
  skipRound,
  submitGuess,
  useHint,
  type SessionState,
} from '../game/session'
import { GuessInput } from './GuessInput'
import { PhotoStage } from './PhotoStage'
import { ResultPanel } from './ResultPanel'
import { ScoreBar } from './ScoreBar'

type Props = {
  airports: Airport[]
  session: SessionState
  setSession: (s: SessionState) => void
  onFinished: (s: SessionState) => void
  onQuit: () => void
}

export function PlayScreen({
  airports,
  session,
  setSession,
  onFinished,
  onQuit,
}: Props) {
  const options = useMemo(() => toGuessOptions(airports), [airports])
  const round = currentRound(session)
  const [flashMiles, setFlashMiles] = useState<number | null>(null)
  const [wrongPulse, setWrongPulse] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)

  useEffect(() => {
    if (!round) return
    const urls: string[] = []
    const maxPhotos = Math.min(3, round.airport.images.length)
    for (const img of round.airport.images.slice(0, maxPhotos)) {
      urls.push(img.thumbUrl)
    }

    const next = session.rounds[session.index + 1]
    if (next) {
      const nextMax = Math.min(3, next.airport.images.length)
      for (const img of next.airport.images.slice(0, nextMax)) {
        urls.push(img.thumbUrl)
      }
    }
    preloadImages(urls)
  }, [round, session.index, session.rounds])

  if (!round) return null

  const active = round
  const revealed = canReveal(active)
  const hintAvailable = canUseHint(active)
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
        onQuit={() => setConfirmQuit(true)}
      />
      <PhotoStage
        images={active.airport.images.slice(0, maxPhotos)}
        photoIndex={active.photoIndex}
        dimmed={decided}
      />
      <div className={`play-dock${wrongPulse ? ' is-wrong' : ''}`}>
        {!decided ? (
          <>
            {active.hintUsed && active.hintText && (
              <p className="round-hint" aria-live="polite">
                {active.hintText}
              </p>
            )}
            <GuessInput options={options} onSubmit={handleGuess} />
            <div className="round-controls">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!hintAvailable}
                onClick={() => setSession(useHint(session, airports))}
              >
                Hint
              </button>
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
              <p className="wrong-hint">Not that one — try again, hint, or reveal.</p>
            )}
          </>
        ) : (
          <ResultPanel round={active} onContinue={handleContinue} />
        )}
      </div>
      {confirmQuit && (
        <div
          className="confirm-overlay"
          role="presentation"
          onClick={() => setConfirmQuit(false)}
        >
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="quit-title"
            aria-describedby="quit-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="quit-title">Quit this run?</h2>
            <p id="quit-desc">
              Current round progress will be lost. Miles and streak already earned
              stay saved.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setConfirmQuit(false)}
              >
                Keep playing
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setConfirmQuit(false)
                  onQuit()
                }}
              >
                Quit to home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { createSession }
