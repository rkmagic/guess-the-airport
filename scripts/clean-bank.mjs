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
import { localizeAsset, sleep, UA } from './lib/mirror-image.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'data', 'airports.json')
const API = 'https://commons.wikimedia.org/w/api.php'

/** Wipe these airports entirely and re-fetch (wrong set / all bad). */
const FORCE_CLEAR = new Set([])

/** Exact Commons titles that spell the answer on the photo (name-obvious audit). */
const DROP_TITLES = new Set(
  [
    'Auckland airport international terminal.jpg',
    'Stockholm-Arlanda Airport Terminal 5 bw.jpg',
    'Arlanda Terminal 2.JPG',
    '13-08-06-abu-dhabi-airport-04.jpg',
    'Aeropuerto de Barcelona (1322744358).jpg',
    'Logan Airport International Arrivals Hall.jpg',
    'Guangzhou Baiyun International Airport Terminal 2 Counter.jpg',
    'Interior of Guangzhou Baiyun International Airport Terminal 1.jpg',
    'Copenhagen Airport Mai 2009 PD 105.JPG',
    'Delhi airport departure terminal 1A (1).JPG',
    'Terminal D near D15 at DFW Airport (2024).jpg',
    'Dublin Airport Terminal 1 Departures Level.jpg',
    'Dubai International Airport interior of Terminal 3, 2019, 03.jpg',
    'Aeropuerto Internacional de Ezeiza Terminal B.jpg',
    'Aéroport International de Genève (10937605433).jpg',
    'Noi Bai International Airport Terminal, Hanoi (6914037042).jpg',
    'Rajiv Gandhi International Airport.jpg',
    'Istanbul Airport, Arnavutköy (P1090187).jpg',
    'Johannesburg Airport.jpg',
    'KLIA Terminal 1 05112025 01.jpg',
    'KL airport departurehall 2007 pano.jpg',
    'Tom Bradley International Terminal curbside.jpg',
    'Manchester Check-In.JPG',
    'Aeropuerto Internacional de la Ciudad de México (vie27sep13) 05.jpg',
    'Terminal 2 del AICM 02.jpg',
    'NAIA Terminal 4 exterior.JPG',
    'Milano malpensa terminal 1.JPG',
    'Narita Airport, Terminal 1 (3040989992).jpg',
    'Prg Ruzyne airport 5841.JPG',
    'SeaTacTerminal.jpg',
    'San Francisco International Airport International Terminal.jpg',
    'Sfo-intlterminal-interior.jpg',
    'TanSonNhatIntlTerminal outside.jpg',
    'Wien Flughafen Schechat May 2007 018.jpg',
  ].map((t) => t.toLowerCase()),
)

const DROP =
  /atatuerk|ataturk|esenbo[gğ]a|fever check|panam terminal 1940|miami panam|dfw airport\.jpg|arrival at tokyo narita|bombay airport\.jpg$|lax bradley at 2am|hartsfield-jackson atlanta international airport \(20498314549\)|kuala lumpur international airport\.jpg$|schiphol airport amsterdam\.jpg$|sfo international terminal\.jpg$|boston logan airport from terminal e|delhi igi airport t3 sideview|aerial|satellite|from (an? )?airplane|from the air|bird'?s.?eye|runway overview|apron|tarmac overview|construction|baustelle|mcdonald|catholic chapel|mosque interior|bus ticket|texrail|carparks|stansted|cavern city|melbourne,? florida|lanseria|east london airport|em constru|wiki|skyway\.jpg|abstellposition|airport museum|banner aircraft|shoe inspection|hangar terminal|night view\.jpg|pano between terminals|outside dublin airport terminal building|arex|cargo terminal station|asheville|african swine|exclusive books|internet kiosk|volcano chaos|crew ladies|zurichairportshopping|magazine|poster in tokyo|from 767|flight cdg-atl|dulles|mccarran|limatambo|mariño|marino|aircraft tails|dhl cargo|birds winging|coronavirus|wheelchair|fornebu|ritazza|aiurport|fields \(distant|hyatt|manmohan|dagger check|from above|rabde|intermodal|welcome to|diagram|map of|wv banner|book shop|lcct|low cost carrier|fire trainer|admini|from terminal three/i

const INCLUDE =
  /airport|terminal|aeroporto|aéroport|flughafen|aeropuerto|havaliman|hall|concourse|check.?in|arrival|depart|gate|curbside|lobby|baggage|plaza/i

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
  try {
    const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': UA } })
    if ((res.status === 429 || res.status >= 500) && attempt < 8) {
      await sleep(attempt * 2500)
      return search(query, attempt + 1)
    }
    if (!res.ok) return []
    const data = await res.json()
    const out = []
    for (const page of Object.values(data.query?.pages || {})) {
      const info = page.imageinfo?.[0]
      if (!info?.url || !String(info.mime || '').startsWith('image/')) continue
      const t = (page.title || '').replace(/^File:/, '')
      if (DROP.test(t) || DROP_TITLES.has(t.toLowerCase()) || !INCLUDE.test(t)) continue
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
  } catch (e) {
    if (attempt < 8) {
      console.log(`search retry ${attempt}: ${e.message}`)
      await sleep(attempt * 3000)
      return search(query, attempt + 1)
    }
    throw e
  }
}

const REFILL_QUERIES = {
  AKL: [
    'Auckland Airport Terminal interior',
    'Auckland Airport check-in hall',
    'Auckland International Airport departure hall',
  ],
  ARN: [
    'Arlanda Airport Terminal interior',
    'Stockholm Arlanda check-in',
    'Arlanda Terminal 5 hall',
  ],
  AUH: [
    'Abu Dhabi Airport Terminal interior',
    'Abu Dhabi International Airport check-in',
    'AUH Airport departure hall',
  ],
  BCN: [
    'Barcelona Airport Terminal interior',
    'El Prat Airport check-in hall',
    'Barcelona El Prat departure hall',
  ],
  BOS: [
    'Boston Logan Terminal interior',
    'Logan Airport Terminal B interior',
    'Boston Airport Terminal check-in',
  ],
  CAN: [
    'Guangzhou Baiyun Airport Terminal interior',
    'Baiyun Airport departure hall',
    'Guangzhou Airport check-in hall',
  ],
  CPH: [
    'Copenhagen Airport Terminal interior',
    'Copenhagen Airport check-in',
    'Kastrup Airport departure hall',
  ],
  DEL: [
    'Delhi Airport Terminal 3 interior',
    'Indira Gandhi Airport T3 hall',
    'IGI Airport check-in',
  ],
  DFW: [
    'DFW Airport Terminal interior',
    'Dallas Fort Worth Terminal D interior',
    'DFW Airport check-in hall',
  ],
  DUB: [
    'Dublin Airport Terminal 2 interior',
    'Dublin Airport check-in hall',
    'Dublin Airport departure lounge',
  ],
  DXB: [
    'Dubai Airport Terminal 3 interior',
    'Dubai International Airport departure hall',
    'DXB Airport check-in',
  ],
  EZE: [
    'Ezeiza Airport Terminal interior',
    'Aeropuerto Ezeiza hall',
    'Buenos Aires Ezeiza check-in',
  ],
  GVA: [
    'Geneva Airport Terminal interior',
    'Geneva Airport check-in',
    'Aéroport Genève hall',
  ],
  HAN: [
    'Noi Bai Airport Terminal interior',
    'Hanoi Airport check-in',
    'Noi Bai departure hall',
  ],
  HYD: [
    'Hyderabad Airport Terminal interior',
    'Rajiv Gandhi Airport check-in hall',
    'Hyderabad Airport departure hall',
  ],
  IST: [
    'Istanbul Airport Terminal interior',
    'Istanbul Yeni Havalimanı Terminal',
    'Istanbul Airport departure hall',
  ],
  JNB: [
    'OR Tambo Airport Terminal interior',
    'Johannesburg Airport check-in',
    'OR Tambo departure hall',
  ],
  KUL: [
    'KLIA Terminal interior check-in',
    'Kuala Lumpur International Airport hall',
    'KLIA departure hall interior',
  ],
  LAX: [
    'LAX Tom Bradley Terminal interior',
    'Los Angeles International Airport Terminal interior',
    'LAX Airport check-in hall',
  ],
  MAN: [
    'Manchester Airport Terminal interior',
    'Manchester Airport check-in hall',
    'Manchester Airport departure lounge',
  ],
  MEX: [
    'Mexico City Airport Terminal interior',
    'AICM Terminal 2 interior',
    'Benito Juarez Airport check-in',
  ],
  MNL: [
    'Manila Airport Terminal interior',
    'NAIA Terminal 3 interior',
    'Ninoy Aquino Airport check-in',
  ],
  MXP: [
    'Malpensa Airport Terminal interior',
    'Milan Malpensa check-in',
    'Malpensa departure hall',
  ],
  NRT: [
    'Narita Airport Terminal interior',
    'Narita International Airport arrival hall',
    'Narita Terminal check-in',
  ],
  PRG: [
    'Prague Airport Terminal interior',
    'Václav Havel Airport check-in',
    'Prague Airport departure hall',
  ],
  SEA: [
    'SeaTac Airport Terminal interior',
    'Seattle Airport check-in hall',
    'Sea-Tac departure hall',
  ],
  SFO: [
    'SFO Terminal interior hall',
    'San Francisco Airport Terminal 2 interior',
    'SFO Airport check-in hall',
  ],
  SGN: [
    'Tan Son Nhat Airport Terminal interior',
    'Ho Chi Minh Airport check-in',
    'Tan Son Nhat departure hall',
  ],
  VIE: [
    'Vienna Airport Terminal interior',
    'Vienna Airport check-in',
    'Flughafen Wien hall',
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
  BOM: [
    'Mumbai Airport Terminal 2 interior',
    'Chhatrapati Shivaji Airport Terminal',
    'CSMIA Terminal 2',
  ],
  ATL: [
    'Atlanta Airport Terminal interior',
    'Hartsfield Jackson Terminal atrium',
    'ATL Airport check-in',
  ],
  AMS: [
    'Schiphol Plaza interior',
    'Schiphol Airport Terminal hall',
    'Amsterdam Schiphol departure hall',
  ],
}

async function main() {
  const airports = JSON.parse(readFileSync(OUT, 'utf8'))
  let dropped = 0
  const affected = new Set()

  for (const a of airports) {
    if (FORCE_CLEAR.has(a.id)) {
      dropped += a.images.length
      console.log(`${a.iata}: force-clear ${a.images.length} images`)
      a.images = []
      affected.add(a.iata)
      continue
    }
    const before = a.images.length
    a.images = a.images.filter((img) => !DROP_TITLES.has(img.title.toLowerCase()))
    const n = before - a.images.length
    if (n) {
      dropped += n
      affected.add(a.iata)
      console.log(`${a.iata}: dropped ${n}`)
    }
  }

  for (const a of airports) {
    if (!affected.has(a.iata) && a.images.length >= 3) continue

    const used = new Set(a.images.map((i) => i.title))
    const queries =
      REFILL_QUERIES[a.iata] ||
      [`${a.name} Terminal interior`, `${a.city} Airport Terminal hall`, `${a.iata} Airport check-in`]

    let q = 0
    while (a.images.length < 3 && q < queries.length) {
      await sleep(900)
      const found = await search(queries[q++])
      for (const asset of found) {
        if (used.has(asset.title)) continue
        const hay = asset.title.toLowerCase()
        const city = a.city.toLowerCase()
        const iata = a.iata.toLowerCase()
        const tokens = [
          iata,
          city.split(' ')[0],
          ...a.name.toLowerCase().split(/[\s–—-]+/).filter((t) => t.length > 3),
        ]
        if (!tokens.some((t) => hay.includes(t))) continue
        try {
          const local = await localizeAsset(a.iata, asset)
          a.images.push(local)
          used.add(asset.title)
          console.log(`${a.iata} + ${asset.title.slice(0, 70)} → ${local.thumbUrl}`)
          await sleep(250)
        } catch (e) {
          console.warn(`${a.iata} mirror fail: ${e.message}`)
          continue
        }
        if (a.images.length >= 3) break
      }
    }
    a.images = a.images.slice(0, 3)
  }

  writeFileSync(OUT, JSON.stringify(airports, null, 2) + '\n')
  const weak = airports.filter((a) => a.images.length < 2)
  const short = airports.filter((a) => affected.has(a.iata) && a.images.length < 3)
  console.log(
    `done: dropped ${dropped} bad across ${affected.size} airports; weak=${weak.map((a) => a.iata).join(',') || 'none'}; still-short=${short.map((a) => a.iata + ':' + a.images.length).join(',') || 'none'}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
