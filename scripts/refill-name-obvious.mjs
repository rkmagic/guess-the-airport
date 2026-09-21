/**
 * Drop exact name-obvious titles and refill only those airports with strict matching.
 * Usage: node scripts/refill-name-obvious.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { localizeAsset, sleep, UA } from './lib/mirror-image.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'data', 'airports.json')
const API = 'https://commons.wikimedia.org/w/api.php'

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
    // Bad refill candidates from first pass
    'Emirates Airbus A380-861 (A6-EEI) lining up on Runway 18 for departure to DXB.jpg',
    "Dublin airport, McDonald's restaurant.jpg",
    'Cavern City Air Terminal - New Mexico.jpg',
    'Birds winging through the geneva airport.jpg',
    'DFWTerminalEChapelInteriorPortrait.jpg',
    'Interior view of lobby looking northwest. - Manchester Airport, Administration Building, Intersection of State Route 3 (Brown Avenue) and Orchard Street, Manchester, Hillsborough County, NH HABS NH,6-MANCH,4-9.tif',
  ].map((t) => t.toLowerCase()),
)

const STOP = new Set([
  'international',
  'airport',
  'terminal',
  'aeroporto',
  'aéroport',
  'aeropuerto',
  'flughafen',
  'havalimanı',
  'havalimani',
  'the',
  'and',
  'de',
  'del',
  'di',
  'la',
  'le',
  'los',
  'las',
  'des',
  'der',
  'van',
  'von',
  'new',
  'city',
])

const REJECT =
  /atatuerk|ataturk|ye[sş]ilk[oö]y|aerial|satellite|from (an? )?airplane|bird'?s.?eye|apron|tarmac|runway|lining up|construction|diagram|map of|welcome to|facade|munich airport|beijing capital|shenzhen|lod airport|fort myers|rsw |peking|bcia|sfcc|lcct|low cost|book shop|wv banner|1958|1960|1970|panam|covid|coronavirus|mcdonald|birds winging|cavern city|new mexico|chapel|fire trainer|administ/i

const ALIASES = {
  AKL: ['auckland'],
  ARN: ['arlanda', 'stockholm'],
  AUH: ['abu dhabi', 'auh'],
  BCN: ['barcelona', 'prat'],
  BOS: ['logan', 'boston'],
  CAN: ['baiyun', 'guangzhou', 'canton'],
  CPH: ['copenhagen', 'kastrup', 'københavn', 'kobenhavn', 'cph'],
  DEL: ['delhi', 'indira', 'igi'],
  DFW: ['dfw', 'dallas'],
  DUB: ['dublin'],
  DXB: ['dubai', 'dxb'],
  EZE: ['ezeiza', 'pistarini'],
  GVA: ['geneva', 'geneve', 'genève', 'gva'],
  HAN: ['noi bai', 'hanoi', 'han'],
  HYD: ['hyderabad', 'rajiv', 'hyd'],
  IST: ['istanbul', 'havaliman'],
  JNB: ['tambo', 'jnb', 'johannesburg'],
  KUL: ['klia', 'kuala', 'lumpur', 'kul'],
  LAX: ['lax', 'bradley', 'los angeles'],
  MAN: ['manchester', 'man'],
  MEX: ['mexico', 'aicm', 'juarez', 'juárez'],
  MNL: ['naia', 'ninoy', 'aquino', 'manila', 'mnl'],
  MXP: ['malpensa', 'mxp'],
  NRT: ['narita', 'nrt'],
  PRG: ['prague', 'ruzyne', 'rużyně', 'havel', 'prg'],
  SEA: ['seatac', 'sea-tac', 'seattle', 'tacoma'],
  SFO: ['sfo', 'san francisco'],
  SGN: ['tan son', 'nhat', 'saigon', 'sgn', 'ho chi'],
  VIE: ['vienna', 'wien', 'schwechat', 'vie'],
}

const INCLUDE =
  /airport|terminal|aeroporto|aéroport|flughafen|aeropuerto|havaliman|hall|concourse|check.?in|arrival|depart|gate|curbside|lobby|baggage|plaza|interior/i

const QUERIES = {
  AKL: ['Auckland Airport Terminal interior', 'Auckland Airport check-in hall'],
  ARN: ['Stockholm Arlanda Terminal interior', 'Arlanda Airport check-in hall'],
  AUH: ['Abu Dhabi Airport Terminal interior', 'Abu Dhabi Airport check-in'],
  BCN: ['Barcelona El Prat Terminal interior', 'Barcelona Airport check-in hall'],
  BOS: ['Boston Logan Terminal interior', 'Logan Airport Terminal B interior'],
  CAN: ['Guangzhou Baiyun Airport Terminal interior', 'Baiyun Airport departure hall interior'],
  CPH: ['Copenhagen Airport Terminal interior', 'Copenhagen Airport check-in hall'],
  DEL: ['Delhi Airport Terminal 3 interior', 'Indira Gandhi Airport T3 hall'],
  DFW: ['DFW Airport Terminal interior', 'Dallas Fort Worth Terminal interior'],
  DUB: ['Dublin Airport Terminal 2 interior', 'Dublin Airport check-in desks'],
  DXB: ['Dubai Airport Terminal 3 interior hall', 'Dubai International Airport departure'],
  EZE: ['Ezeiza Airport Terminal interior', 'Aeropuerto Ezeiza interior hall'],
  GVA: ['Geneva Airport Terminal interior', 'Geneva Airport check-in hall'],
  HAN: ['Noi Bai Airport Terminal interior', 'Hanoi Noi Bai check-in'],
  HYD: ['Hyderabad Airport Terminal interior', 'Rajiv Gandhi Airport interior hall'],
  IST: ['Istanbul Airport Terminal interior 2019', 'Istanbul Airport departure hall interior'],
  JNB: ['OR Tambo Airport Terminal interior', 'OR Tambo check-in hall'],
  KUL: [
    'KLIA Terminal departure hall interior',
    'Kuala Lumpur International Airport check-in',
    'KLIA2 departure hall',
  ],
  LAX: [
    'LAX Tom Bradley Terminal interior',
    'LAX Airport Terminal check-in interior',
    'Los Angeles Airport Terminal 5 interior',
  ],
  SFO: [
    'SFO Terminal 2 interior',
    'San Francisco Airport Terminal interior hall',
    'SFO Airport boarding area',
  ],
  VIE: [
    'Vienna Airport Terminal interior',
    'Vienna Airport check-in hall',
    'Flughafen Wien Terminal Halle',
  ],
  MEX: [
    'AICM Terminal 2 interior Mexico',
    'Mexico City Airport check-in hall',
    'Aeropuerto Ciudad de Mexico Terminal interior',
  ],
  MNL: [
    'NAIA Terminal 3 interior Manila',
    'Ninoy Aquino Airport Terminal 3 hall',
    'Manila Airport Terminal interior',
  ],
  SGN: [
    'Tan Son Nhat Airport Terminal interior',
    'Tan Son Nhat International Airport hall',
    'Ho Chi Minh Airport check-in',
  ],
  HYD: [
    'Hyderabad Airport Terminal interior',
    'Rajiv Gandhi Airport interior hall',
    'RGIA Hyderabad check-in',
  ],
  AKL: [
    'Auckland Airport Terminal interior',
    'Auckland Airport check-in hall',
    'Auckland Airport departure hall',
  ],
  DUB: [
    'Dublin Airport Terminal 2 interior',
    'Dublin Airport check-in desks',
    'Dublin Airport departure hall interior',
  ],
  DXB: [
    'Dubai Airport Terminal 3 interior hall',
    'Dubai International Airport Terminal 3 interior',
    'DXB Terminal 3 check-in',
  ],
  GVA: [
    'Geneva Airport Terminal interior',
    'Geneva Airport check-in hall',
    'Aéroport de Genève hall',
  ],
}

function cleanUrl(u) {
  return String(u || '').split('?')[0]
}

function placeTokens(a) {
  const raw = [a.iata, a.city, ...(ALIASES[a.iata] || []), ...a.name.split(/[\s–—\-/',.()]+/)]
  return [
    ...new Set(
      raw
        .map((t) => t.toLowerCase().normalize('NFD').replace(/\p{M}/gu, ''))
        .filter((t) => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t)),
    ),
  ]
}

function matchesPlace(title, a) {
  const hay = title.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  // Prefer alias hits (more precise) when defined
  const aliases = (ALIASES[a.iata] || []).map((t) =>
    t.toLowerCase().normalize('NFD').replace(/\p{M}/gu, ''),
  )
  if (aliases.length && aliases.some((t) => hay.includes(t))) return true
  const tokens = placeTokens(a)
  return tokens.some((t) => hay.includes(t))
}

async function search(query, attempt = 1) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '25',
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
      if (DROP_TITLES.has(t.toLowerCase()) || REJECT.test(t) || !INCLUDE.test(t)) continue
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
      console.log(`retry ${attempt}: ${e.message}`)
      await sleep(attempt * 3000)
      return search(query, attempt + 1)
    }
    throw e
  }
}

async function main() {
  const airports = JSON.parse(readFileSync(OUT, 'utf8'))
  const focus = new Set(Object.keys(QUERIES))
  let dropped = 0

  for (const a of airports) {
    if (!focus.has(a.iata)) continue
    const before = a.images.length
    a.images = a.images.filter(
      (img) => !DROP_TITLES.has(img.title.toLowerCase()) && !REJECT.test(img.title),
    )
    const n = before - a.images.length
    if (n) {
      dropped += n
      console.log(`${a.iata}: dropped ${n}`)
    }

    if (a.images.length >= 3) continue

    const used = new Set(a.images.map((i) => i.title))
    const queries = QUERIES[a.iata] || [
      `${a.city} Airport Terminal interior`,
      `${a.iata} Airport check-in hall`,
    ]

    for (const q of queries) {
      if (a.images.length >= 3) break
      await sleep(1000)
      const found = await search(q)
      for (const asset of found) {
        if (used.has(asset.title)) continue
        if (!matchesPlace(asset.title, a)) continue
        try {
          const local = await localizeAsset(a.iata, asset)
          a.images.push(local)
          used.add(asset.title)
          console.log(`${a.iata} + ${asset.title.slice(0, 72)} → ${local.thumbUrl}`)
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
  const stillShort = airports.filter((a) => focus.has(a.iata) && a.images.length < 3)
  console.log(
    `done: dropped ${dropped}; still-short=${stillShort.map((a) => a.iata + ':' + a.images.length).join(',') || 'none'}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
