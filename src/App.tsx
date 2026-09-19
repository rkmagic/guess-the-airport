import { useEffect, useState } from 'react'
import { loadAirports, type Airport } from './data/airports'
import { HomeScreen } from './components/HomeScreen'
import {
  CreditsScreen,
  PlayScreen,
  createSession,
} from './components/PlayScreen'
import { SessionEnd } from './components/SessionEnd'
import { loadProgress, type Progress } from './game/storage'
import type { SessionState } from './game/session'
import './App.css'

type View = 'home' | 'play' | 'end' | 'credits'

export default function App() {
  const [airports, setAirports] = useState<Airport[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('home')
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [session, setSession] = useState<SessionState | null>(null)

  useEffect(() => {
    loadAirports()
      .then(setAirports)
      .catch((e: Error) => setError(e.message))
  }, [])

  function startPlay() {
    if (!airports?.length) return
    const s = createSession(airports)
    setSession(s)
    setProgress(s.progress)
    setView('play')
  }

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

  if (view === 'credits') {
    return <CreditsScreen airports={airports} onBack={() => setView('home')} />
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
          setSession(s)
          setProgress(s.progress)
          setView('end')
        }}
      />
    )
  }

  if (view === 'end' && session) {
    const correctCount = session.rounds.filter((r) => r.outcome === 'correct').length
    return (
      <SessionEnd
        sessionMiles={session.sessionMiles}
        peakStreak={session.sessionPeakStreak}
        correctCount={correctCount}
        totalRounds={session.rounds.length}
        onAgain={startPlay}
        onHome={() => {
          setSession(null)
          setView('home')
        }}
      />
    )
  }

  return (
    <HomeScreen
      progress={progress}
      airportCount={airports.length}
      onPlay={startPlay}
      onCredits={() => setView('credits')}
    />
  )
}
