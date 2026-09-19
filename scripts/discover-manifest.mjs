/**
 * Discover ground-level Commons images per airport category, write seed-manifest.json
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UA = 'GuessTheAirport/1.0 (educational game; local development)'
const API = 'https://commons.wikimedia.org/w/api.php'

const AIRPORTS = [
  { id: 'AMS', iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', category: 'Amsterdam Airport Schiphol' },
  { id: 'LHR', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', category: 'Heathrow Airport' },
  { id: 'JFK', iata: 'JFK', name: "John F. Kennedy International Airport", city: 'New York', country: 'United States', category: 'John F. Kennedy International Airport' },
  { id: 'NRT', iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', category: 'Narita International Airport' },
  { id: 'SFO', iata: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', category: 'San Francisco International Airport' },
  { id: 'CDG', iata: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France', category: 'Paris-Charles de Gaulle Airport' },
  { id: 'SIN', iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', category: 'Singapore Changi Airport' },
  { id: 'DXB', iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', category: 'Dubai International Airport' },
  { id: 'FRA', iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', category: 'Frankfurt Airport Terminals' },
  { id: 'HKG', iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', category: 'Hong Kong International Airport' },
  { id: 'LAX', iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', category: 'Los Angeles International Airport' },
  { id: 'SYD', iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', category: 'Sydney Airport' },
  { id: 'ORD', iata: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', category: "O'Hare International Airport" },
  { id: 'IST', iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', category: 'Istanbul Airport' },
  { id: 'ICN', iata: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', category: 'Incheon International Airport' },
]

const KEYWORDS = /terminal|interior|arrival|depart|hall|check.?in|curbside|plaza|lobby|concourse|gate|baggage|taxi|landside|entrance|entry|waiting/i
const EXCLUDE = /map|logo|flag|diagram|plan|aerial|satellite|runway|aircraft|airplane|plane |cockpit|livery|tail|nose|wing|take.?off|landing|in.?flight|from above|bird.?eye/i

async function api(params) {
  const q = new URLSearchParams({ format: 'json', origin: '*', ...params })
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

async function categoryMembers(category, limit = 80) {
  const titles = []
  let cont = {}
  while (titles.length < limit) {
    const data = await api({
      action: 'query',
      list: 'categorymembers',
      cmtitle: `Category:${category}`,
      cmtype: 'file',
      cmlimit: '50',
      ...cont,
    })
    const members = data.query?.categorymembers || []
    for (const m of members) {
      titles.push(m.title.replace(/^File:/, ''))
    }
    if (!data.continue) break
    cont = data.continue
    await new Promise((r) => setTimeout(r, 150))
  }
  return titles
}

function scoreTitle(title) {
  if (EXCLUDE.test(title)) return -1
  if (KEYWORDS.test(title)) return 2
  return 0
}

async function main() {
  const manifest = []
  for (const a of AIRPORTS) {
    console.log(`→ ${a.iata} / ${a.category}`)
    let files = []
    try {
      files = await categoryMembers(a.category)
    } catch (e) {
      console.warn(`  category fail: ${e.message}`)
    }
    const ranked = files
      .map((t) => ({ t, s: scoreTitle(t) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
    const picked = []
    const seen = new Set()
    for (const { t, s } of ranked) {
      if (picked.length >= 3) break
      // prefer keyword hits first
      if (s < 2 && picked.length === 0) continue
      if (seen.has(t.toLowerCase())) continue
      seen.add(t.toLowerCase())
      picked.push(t)
    }
    // fallback: take any non-excluded if we have < 2
    if (picked.length < 2) {
      for (const { t, s } of ranked) {
        if (picked.length >= 3) break
        if (s < 0) continue
        if (seen.has(t.toLowerCase())) continue
        seen.add(t.toLowerCase())
        picked.push(t)
      }
    }
    console.log(`  picked ${picked.length}: ${picked.slice(0, 3).join(' | ')}`)
    if (picked.length === 0) {
      console.warn('  SKIP — no files')
      continue
    }
    manifest.push({
      id: a.id,
      iata: a.iata,
      name: a.name,
      city: a.city,
      country: a.country,
      files: picked.slice(0, 3),
    })
    await new Promise((r) => setTimeout(r, 200))
  }
  const out = join(__dirname, 'seed-manifest.json')
  writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`Wrote ${manifest.length} entries → ${out}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
