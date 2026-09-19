export type ImageAsset = {
  title: string
  url: string
  thumbUrl: string
  author: string
  license: string
  sourceUrl: string
}

export type Airport = {
  id: string
  iata: string
  name: string
  city: string
  country: string
  images: ImageAsset[]
}

export type GuessOption = {
  id: string
  label: string
  iata: string
  name: string
  city: string
  country: string
}

export async function loadAirports(): Promise<Airport[]> {
  const res = await fetch('/data/airports.json')
  if (!res.ok) throw new Error('Failed to load airport bank')
  const data = (await res.json()) as Airport[]
  return data.filter((a) => a.images?.length > 0)
}

export function toGuessOptions(airports: Airport[]): GuessOption[] {
  return airports.map((a) => ({
    id: a.id,
    iata: a.iata,
    name: a.name,
    city: a.city,
    country: a.country,
    label: `${a.iata} — ${a.name}`,
  }))
}

export function filterGuessOptions(
  options: GuessOption[],
  query: string,
  limit = 8,
): GuessOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored = options
    .map((o) => {
      const iata = o.iata.toLowerCase()
      const name = o.name.toLowerCase()
      const city = o.city.toLowerCase()
      let score = 0
      if (iata === q) score = 100
      else if (iata.startsWith(q)) score = 80
      else if (city.startsWith(q)) score = 60
      else if (name.startsWith(q)) score = 50
      else if (city.includes(q)) score = 40
      else if (name.includes(q)) score = 30
      else if (`${iata} ${name} ${city}`.includes(q)) score = 10
      return { o, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.o.label.localeCompare(b.o.label))
  return scored.slice(0, limit).map((x) => x.o)
}

/** Resolve a free-text guess to an airport id, or null if ambiguous/no match. */
export function matchGuess(
  options: GuessOption[],
  text: string,
  selectedId?: string | null,
): string | null {
  if (selectedId) return selectedId
  const q = text.trim().toLowerCase()
  if (!q) return null
  const exactIata = options.filter((o) => o.iata.toLowerCase() === q)
  if (exactIata.length === 1) return exactIata[0].id
  const exactName = options.filter((o) => o.name.toLowerCase() === q)
  if (exactName.length === 1) return exactName[0].id
  const cityHits = options.filter((o) => o.city.toLowerCase() === q)
  if (cityHits.length === 1) return cityHits[0].id
  return null
}
