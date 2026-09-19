import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  filterGuessOptions,
  matchGuess,
  type GuessOption,
} from '../data/airports'

type Props = {
  options: GuessOption[]
  disabled?: boolean
  onSubmit: (airportId: string) => void
}

export function GuessInput({ options, disabled, onSubmit }: Props) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(
    () => filterGuessOptions(options, query),
    [options, query],
  )

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function pick(opt: GuessOption) {
    setQuery(opt.label)
    setSelectedId(opt.id)
    setOpen(false)
    setError('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const id = matchGuess(options, query, selectedId)
    if (!id) {
      setError('Pick an airport from the list (or type its IATA code).')
      return
    }
    setError('')
    onSubmit(id)
    setQuery('')
    setSelectedId(null)
  }

  return (
    <form className="guess-form" onSubmit={handleSubmit}>
      <div className="guess-wrap" ref={wrapRef}>
        <label className="sr-only" htmlFor="guess-input">
          Guess the airport
        </label>
        <input
          id="guess-input"
          className="guess-input"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Airport name or IATA…"
          value={query}
          disabled={disabled}
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedId(null)
            setOpen(true)
            setError('')
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => (i + 1) % suggestions.length)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => (i - 1 + suggestions.length) % suggestions.length)
            } else if (e.key === 'Enter' && suggestions[active] && !selectedId) {
              // let form submit if selected; else pick highlighted
              if (!matchGuess(options, query, selectedId)) {
                e.preventDefault()
                pick(suggestions[active])
              }
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
        />
        {open && suggestions.length > 0 && (
          <ul id={listId} className="guess-list" role="listbox">
            {suggestions.map((opt, i) => (
              <li key={opt.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={i === active ? 'is-active' : undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(opt)}
                >
                  <span className="guess-iata">{opt.iata}</span>
                  <span className="guess-name">
                    {opt.name}
                    <em>
                      {opt.city}, {opt.country}
                    </em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={disabled}>
        Guess
      </button>
      {error && <p className="guess-error">{error}</p>}
    </form>
  )
}
