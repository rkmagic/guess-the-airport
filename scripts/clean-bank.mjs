/**
 * Drop known-bad titles from airports.json and refill short airports via Commons search.
 *
 * Bad categories:
 * - wrong airport / closed airport (Atatürk labeled as IST, Bangalore as BOM, MCO as LAX)
 * - aerial / apron / airplane-window views (not ground-level curb/terminal)
 * - historical / COVID medical stations / name plastered on facade
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'data', 'airports.json')
const UA = 'GuessTheAirport/1.0 (educational game; local development)'
const API = 'https://commons.wikimedia.org/w/api.php'

/** Wipe these airports entirely and re-fetch (wrong set / all bad). */
const FORCE_CLEAR = new Set([])

const DROP =
  /atatuerk|ataturk|esenbo[gğ]a|fever check|panam terminal 1940|miami panam|dfw airport\.jpg|arrival at tokyo narita|bombay airport\.jpg$|lax bradley at 2am|hartsfield-jackson atlanta international airport \(20498314549\)|kuala lumpur international airport\.jpg$|schiphol airport amsterdam\.jpg$|sfo international terminal\.jpg$|boston logan airport from terminal e|delhi igi airport t3 sideview|aerial|satellite|from (an? )?airplane|from the air|bird'?s.?eye|runway overview|apron|tarmac overview|construction|baustelle|mcdonald|catholic chapel|mosque interior|bus ticket|texrail|carparks|stansted|cavern city|melbourne,? florida|lanseria|east london airport|em constru|wiki|skyway\.jpg|abstellposition|airport museum|banner aircraft|shoe inspection|hangar terminal|night view\.jpg|pano between terminals|outside dublin airport terminal building|arex|cargo terminal station|asheville|african swine|exclusive books|internet kiosk|volcano chaos|crew ladies|zurichairportshopping|magazine|poster in tokyo|from 767|flight cdg-atl|dublin airport|heathrow|dulles|mccarran|limatambo|mariño|marino|aircraft tails|dhl cargo|birds winging|coronavirus|wheelchair|fornebu|ritazza|aiurport|fields \(distant|hyatt|manmohan|dagger check|from above|rabde|intermodal/i

const INCLUDE =
  /airport|terminal|aeroporto|aéroport|flughafen|aeropuerto|havaliman|hall|concourse|check.?in|arrival|depart|gate|curbside|lobby|baggage|plaza/i

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

function cleanUrl(u) {
  return String(u || '').split('?')[0]
}

async function search(query, attempt = 1) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '1280',
  })
  const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': UA } })
  if (res.status === 429 && attempt < 6) {
    await sleep(attempt * 3000)
    return search(query, attempt + 1)
  }
  if (!res.ok) return []
  const data = await res.json()
  const out = []
  for (const page of Object.values(data.query?.pages || {})) {
    const info = page.imageinfo?.[0]
    if (!info?.url || !String(info.mime || '').startsWith('image/')) continue
    const t = (page.title || '').replace(/^File:/, '')
    if (DROP.test(t) || !INCLUDE.test(t)) continue
    const ext = info.extmetadata || {}
    const strip = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
    out.push({
      title: t,
      url: cleanUrl(info.url),
      thumbUrl: cleanUrl(info.thumburl || info.url),
      author: strip(ext.Artist?.value || ext.Credit?.value || 'Unknown') || 'Unknown',
      license: ext.LicenseShortName?.value || ext.License?.value || 'Unknown',
      sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(t.replace(/ /g, '_'))}`,
    })
  }
  return out
}

const REFILL_QUERIES = {
  IST: [
    'Istanbul Airport Terminal interior',
    'Istanbul Yeni Havalimanı Terminal',
    'Istanbul Airport departure hall',
  ],
  ICN: [
    'Incheon Airport Terminal interior',
    'Incheon International Airport departure hall',
    'Incheon Airport check-in',
  ],
  MIA: [
    'Miami International Airport Terminal interior',
    'Miami Airport check-in hall',
    'MIA Airport Terminal',
  ],
  DFW: [
    'DFW Airport Terminal interior',
    'Dallas Fort Worth Terminal D',
    'DFW Airport check-in',
  ],
  NRT: [
    'Narita Airport Terminal interior',
    'Narita International Airport arrival hall',
    'Narita Terminal check-in',
  ],
  BOM: [
    'Mumbai Airport Terminal 2 interior',
    'Chhatrapati Shivaji Airport Terminal',
    'CSMIA Terminal 2',
  ],
  LAX: [
    'LAX Tom Bradley Terminal interior',
    'Los Angeles International Airport Terminal interior',
    'LAX Airport check-in hall',
  ],
  ATL: [
    'Atlanta Airport Terminal interior',
    'Hartsfield Jackson Terminal atrium',
    'ATL Airport check-in',
  ],
  KUL: [
    'KLIA Terminal interior',
    'Kuala Lumpur International Airport check-in',
    'KLIA departure hall',
  ],
  AMS: [
    'Schiphol Plaza interior',
    'Schiphol Airport Terminal hall',
    'Amsterdam Schiphol departure hall',
  ],
  SFO: [
    'SFO International Terminal interior',
    'San Francisco Airport Terminal interior',
    'SFO Airport check-in',
  ],
  BOS: [
    'Boston Logan Terminal interior',
    'Logan Airport arrivals hall',
    'Boston Airport Terminal check-in',
  ],
}

async function main() {
  const airports = JSON.parse(readFileSync(OUT, 'utf8'))
  let dropped = 0

  for (const a of airports) {
    if (FORCE_CLEAR.has(a.id)) {
      dropped += a.images.length
      console.log(`${a.iata}: force-clear ${a.images.length} images`)
      a.images = []
    } else {
      const before = a.images.length
      a.images = a.images.filter((img) => !DROP.test(img.title))
      const n = before - a.images.length
      if (n) {
        dropped += n
        console.log(`${a.iata}: dropped ${n}`)
      }
    }

    const used = new Set(a.images.map((i) => i.title))
    const queries =
      REFILL_QUERIES[a.iata] ||
      [`${a.name} Terminal interior`, `${a.city} Airport Terminal hall`, `${a.iata} Airport check-in`]

    let q = 0
    while (a.images.length < 3 && q < queries.length) {
      await sleep(700)
      const found = await search(queries[q++])
      for (const asset of found) {
        if (used.has(asset.title)) continue
        const hay = asset.title.toLowerCase()
        const city = a.city.toLowerCase()
        const iata = a.iata.toLowerCase()
        const nameToken = a.name.toLowerCase().split(/[\s–—-]+/)[0]
        if (
          !hay.includes(iata) &&
          !hay.includes(city.split(' ')[0]) &&
          !hay.includes(nameToken) &&
          a.images.length >= 1
        ) {
          continue
        }
        a.images.push(asset)
        used.add(asset.title)
        console.log(`${a.iata} + ${asset.title.slice(0, 70)}`)
        if (a.images.length >= 3) break
      }
    }
    a.images = a.images.slice(0, 3)
  }

  writeFileSync(OUT, JSON.stringify(airports, null, 2) + '\n')
  const weak = airports.filter((a) => a.images.length < 2)
  console.log(
    `done: ${airports.length} airports, dropped ${dropped} bad, weak=${weak.map((a) => a.iata).join(',') || 'none'}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
