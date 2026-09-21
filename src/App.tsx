import { useEffect, useState } from 'react'
import { track } from './analytics'
import { loadAirports, type Airport } from './data/airports'
import { HomeScreen } from './components/HomeScreen'
import { PlayScreen, createSession } from './components/PlayScreen'
import { RulesDialog } from './components/RulesDialog'
import { SessionEnd } from './components/SessionEnd'
import { loadProgress, type Progress } from './game/storage'
import { ROUNDS_PER_SESSION } from './game/scoring'
import type { SessionState } from './game/session'
import './App.css'

type View = 'home' | 'play' | 'end'

export default function App() {
  const [airports, setAirports] = useState<Airport[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('home')
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [session, setSession] = useState<SessionState | null>(null)
  const [showRules, setShowRules] = useState(false)

  useEffect(() => {
    loadAirports()
      .then(setAirports)
      .catch((e: Error) => setError(e.message))
  }, [])

  function openRules(source: 'home' | 'end') {
    if (!airports) return
    const roundCount = Math.min(ROUNDS_PER_SESSION, airports.length)
    track('play_clicked', { source, roundCount })
    setShowRules(true)
  }

  function startPlay() {
    if (!airports?.length) return
    const roundCount = Math.min(ROUNDS_PER_SESSION, airports.length)
    track('lets_go_clicked', { roundCount })
    const s = createSession(airports)
    setSession(s)
    setProgress(s.progress)
    setShowRules(false)
    setView('play')
  }

  const rulesDialog =
    showRules && airports ? (
      <RulesDialog
        roundCount={Math.min(ROUNDS_PER_SESSION, airports.length)}
        onStart={startPlay}
        onCancel={() => setShowRules(false)}
      />
    ) : null

  if (error) {
    return (
      <div className="screen">
        <p className="fatal">{error}</p>
      </div>
    )
  }

  if (!airports) {
    return (
      <div className="screen">
        <p className="loading">Loading airports…</p>
      </div>
    )
  }

  if (view === 'play' && session && !session.finished) {
    return (
      <PlayScreen
        airports={airports}
        session={session}
        setSession={(s) => {
          setSession(s)
          setProgress(s.progress)
        }}
        onFinished={(s) => {
          const correctCount = s.rounds.filter((r) => r.outcome === 'correct').length
          track('session_finished', {
            correctCount,
            totalRounds: s.rounds.length,
            sessionMiles: s.sessionMiles,
            peakStreak: s.sessionPeakStreak,
          })
          setSession(s)
          setProgress(s.progress)
          setView('end')
        }}
        onQuit={() => {
          setSession(null)
          setView('home')
        }}
      />
    )
  }

  if (view === 'end' && session) {
    const correctCount = session.rounds.filter((r) => r.outcome === 'correct').length
    return (
      <>
        <SessionEnd
          sessionMiles={session.sessionMiles}
          peakStreak={session.sessionPeakStreak}
          correctCount={correctCount}
          totalRounds={session.rounds.length}
          onAgain={() => openRules('end')}
          onHome={() => {
            setSession(null)
            setView('home')
          }}
        />
        {rulesDialog}
      </>
    )
  }

  return (
    <>
      <HomeScreen
        progress={progress}
        airportCount={airports.length}
        onPlay={() => openRules('home')}
      />
      {rulesDialog}
    </>
  )
}
