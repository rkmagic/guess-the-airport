/**
 * Build public/data/airports.json from Commons search (ground-level / terminal photos).
 * Downloads thumbs into public/images/{IATA}/ and stores local thumbUrl + attribution.
 * Re-run safely: airports with ≥2 images are skipped; existing image files are not re-downloaded.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { localizeAsset, sleep, UA } from './lib/mirror-image.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'public', 'data', 'airports.json')
const API = 'https://commons.wikimedia.org/w/api.php'
const THUMB_WIDTH = 1280

/** @type {{ id: string, iata: string, name: string, city: string, country: string, queries: string[] }[]} */
const BANK = [
  // —— already seeded ——
  { id: 'AMS', iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', queries: ['Schiphol terminal interior', 'Amsterdam Schiphol Airport entry', 'Schiphol Plaza'] },
  { id: 'LHR', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', queries: ['Heathrow Terminal arrivals hall', 'Heathrow Terminal 5 interior', 'Heathrow Airport Terminal'] },
  { id: 'JFK', iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', queries: ['JFK Terminal departure hall', 'John F. Kennedy International Airport Terminal', 'JFK Airport Terminal interior'] },
  { id: 'NRT', iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', queries: ['Narita Airport Terminal', 'Narita International Airport arrival', 'Tokyo Narita Terminal interior'] },
  { id: 'SFO', iata: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', queries: ['San Francisco International Airport Terminal', 'SFO Terminal interior', 'SFO International Terminal'] },
  { id: 'CDG', iata: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France', queries: ['Charles de Gaulle Airport Terminal', 'Paris CDG Terminal interior', 'Aéroport Charles de Gaulle Terminal'] },
  { id: 'SIN', iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', queries: ['Changi Airport Terminal interior', 'Jewel Changi Airport', 'Singapore Changi Terminal'] },
  { id: 'DXB', iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', queries: ['Dubai International Airport Terminal interior', 'Dubai Airport Terminal 3', 'DXB Terminal'] },
  { id: 'FRA', iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', queries: ['Frankfurt Airport Terminal interior', 'Frankfurt Flughafen Terminal', 'Frankfurt Airport Terminal 1'] },
  { id: 'HKG', iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', queries: ['Hong Kong International Airport Terminal', 'HKG Airport Terminal interior', 'Hong Kong Airport departure'] },
  { id: 'LAX', iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', queries: ['Los Angeles International Airport Terminal', 'LAX Tom Bradley Terminal', 'LAX Airport Terminal interior'] },
  { id: 'SYD', iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', queries: ['Sydney Airport Terminal', 'Sydney Kingsford Smith Terminal', 'Sydney Airport interior'] },
  { id: 'ORD', iata: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', queries: ["O'Hare Airport Terminal", "Chicago O'Hare Terminal interior", 'ORD Airport Terminal'] },
  { id: 'IST', iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', queries: ['Istanbul Airport Terminal interior', 'Istanbul Yeni Havalimanı Terminal', 'Istanbul Airport departure hall'] },
  { id: 'ICN', iata: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', queries: ['Incheon International Airport Terminal', 'Incheon Airport Terminal interior', 'Incheon Airport departure hall'] },

  // —— Europe ——
  { id: 'MAD', iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', queries: ['Madrid Barajas Airport Terminal', 'Madrid Barajas Terminal 4', 'Aeropuerto Madrid-Barajas Terminal'] },
  { id: 'BCN', iata: 'BCN', name: 'Josep Tarradellas Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain', queries: ['Barcelona El Prat Airport Terminal', 'Barcelona Airport Terminal 1', 'Aeropuerto Barcelona Terminal'] },
  { id: 'FCO', iata: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy', queries: ['Rome Fiumicino Airport Terminal', 'Fiumicino Terminal interior', 'Aeroporto Fiumicino Terminal'] },
  { id: 'MXP', iata: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', queries: ['Milan Malpensa Airport Terminal', 'Malpensa Terminal 1', 'Aeroporto Malpensa Terminal'] },
  { id: 'MUC', iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', queries: ['Munich Airport Terminal interior', 'München Flughafen Terminal', 'Munich Airport Terminal 2'] },
  { id: 'ZRH', iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', queries: ['Zurich Airport Terminal', 'Zürich Flughafen Terminal', 'Zurich Airport Check-in'] },
  { id: 'VIE', iata: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', queries: ['Vienna Airport Terminal', 'Wien Flughafen Terminal', 'Vienna International Airport interior'] },
  { id: 'CPH', iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', queries: ['Copenhagen Airport Terminal', 'Københavns Lufthavn Terminal', 'Copenhagen Airport interior'] },
  { id: 'DUB', iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', queries: ['Dublin Airport Terminal', 'Dublin Airport Terminal 2', 'Dublin Airport interior'] },
  { id: 'ATH', iata: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', queries: ['Athens International Airport Terminal', 'Athens Airport Terminal', 'Eleftherios Venizelos Airport Terminal'] },
  { id: 'BRU', iata: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', queries: ['Brussels Airport Terminal', 'Bruxelles Airport Terminal', 'Brussels Airport interior'] },

  // —— Middle East & Africa ——
  { id: 'DOH', iata: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', queries: ['Hamad International Airport Terminal', 'Doha Hamad Airport interior', 'Hamad Airport Terminal'] },
  { id: 'AUH', iata: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', queries: ['Abu Dhabi International Airport Terminal', 'Abu Dhabi Airport Terminal', 'AUH Airport Terminal'] },
  { id: 'CAI', iata: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', queries: ['Cairo International Airport Terminal', 'Cairo Airport Terminal', 'Cairo Airport interior'] },
  { id: 'JNB', iata: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', queries: ['OR Tambo Airport Terminal', 'Johannesburg Airport Terminal', 'O.R. Tambo International Airport'] },
  { id: 'CPT', iata: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', queries: ['Cape Town International Airport Terminal', 'Cape Town Airport Terminal', 'Cape Town Airport interior'] },

  // —— Asia-Pacific ——
  { id: 'HND', iata: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', queries: ['Haneda Airport Terminal', 'Tokyo Haneda Terminal interior', 'Haneda International Terminal'] },
  { id: 'BKK', iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', queries: ['Suvarnabhumi Airport Terminal', 'Bangkok Suvarnabhumi Terminal', 'Suvarnabhumi Airport interior'] },
  { id: 'KUL', iata: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', queries: ['Kuala Lumpur International Airport Terminal', 'KLIA Terminal', 'KL International Airport interior'] },
  { id: 'TPE', iata: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', queries: ['Taoyuan International Airport Terminal', 'Taiwan Taoyuan Airport Terminal', 'TPE Airport Terminal'] },
  { id: 'PVG', iata: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', queries: ['Shanghai Pudong Airport Terminal', 'Pudong International Airport Terminal', 'PVG Airport Terminal'] },
  { id: 'DEL', iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', queries: ['Indira Gandhi International Airport Terminal', 'Delhi Airport Terminal 3', 'IGI Airport Terminal'] },
  { id: 'BOM', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', queries: ['Mumbai Airport Terminal', 'Chhatrapati Shivaji Airport Terminal', 'Bombay Airport Terminal'] },
  { id: 'MEL', iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', queries: ['Melbourne Airport Terminal', 'Melbourne Tullamarine Terminal', 'Melbourne Airport interior'] },
  { id: 'AKL', iata: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', queries: ['Auckland Airport Terminal', 'Auckland International Airport Terminal', 'Auckland Airport interior'] },

  // —— Americas ——
  { id: 'ATL', iata: 'ATL', name: 'Hartsfield–Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', queries: ['Atlanta Airport Terminal', 'Hartsfield Jackson Airport Terminal', 'ATL Airport Terminal interior'] },
  { id: 'DFW', iata: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', queries: ['Dallas Fort Worth Airport Terminal', 'DFW Airport Terminal', 'DFW Airport interior'] },
  { id: 'DEN', iata: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', queries: ['Denver International Airport Terminal', 'Denver Airport Terminal', 'DEN Airport interior'] },
  { id: 'SEA', iata: 'SEA', name: 'Seattle–Tacoma International Airport', city: 'Seattle', country: 'United States', queries: ['Seattle Tacoma Airport Terminal', 'SeaTac Airport Terminal', 'Seattle Airport Terminal interior'] },
  { id: 'MIA', iata: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', queries: ['Miami International Airport Terminal', 'Miami Airport Terminal', 'MIA Airport interior'] },
  { id: 'BOS', iata: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States', queries: ['Boston Logan Airport Terminal', 'Logan International Airport Terminal', 'Boston Airport Terminal interior'] },
  { id: 'YYZ', iata: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', queries: ['Toronto Pearson Airport Terminal', 'Pearson Airport Terminal', 'YYZ Airport Terminal'] },
  { id: 'YVR', iata: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', queries: ['Vancouver International Airport Terminal', 'Vancouver Airport Terminal', 'YVR Airport Terminal'] },
  { id: 'MEX', iata: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', queries: ['Mexico City Airport Terminal', 'Aeropuerto Ciudad de México Terminal', 'Benito Juárez Airport Terminal'] },
  { id: 'GRU', iata: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', queries: ['Guarulhos Airport Terminal', 'São Paulo Guarulhos Terminal', 'GRU Airport Terminal'] },

  // —— Europe expansion ——
  { id: 'LIS', iata: 'LIS', name: 'Lisbon Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', queries: ['Lisbon Airport Terminal interior', 'Aeroporto de Lisboa Terminal', 'Lisbon Airport check-in'] },
  { id: 'OSL', iata: 'OSL', name: 'Oslo Gardermoen Airport', city: 'Oslo', country: 'Norway', queries: ['Oslo Airport Terminal interior', 'Oslo Gardermoen Terminal', 'Oslo Airport check-in'] },
  { id: 'ARN', iata: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', queries: ['Stockholm Arlanda Terminal interior', 'Arlanda Airport Terminal', 'Arlanda check-in hall'] },
  { id: 'HEL', iata: 'HEL', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland', queries: ['Helsinki Airport Terminal interior', 'Helsinki-Vantaa Terminal', 'Helsinki Airport check-in'] },
  { id: 'WAW', iata: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland', queries: ['Warsaw Chopin Airport Terminal', 'Warsaw Airport Terminal interior', 'Lotnisko Chopina Terminal'] },
  { id: 'PRG', iata: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', queries: ['Prague Airport Terminal interior', 'Václav Havel Airport Terminal', 'Praha Airport Terminal'] },
  { id: 'BUD', iata: 'BUD', name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary', queries: ['Budapest Airport Terminal 2 interior', 'Budapest Liszt Ferenc Airport Terminal', 'Budapest Airport departure hall'] },
  { id: 'MAN', iata: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', queries: ['Manchester Airport Terminal interior', 'Manchester Airport Terminal 2', 'Manchester Airport check-in'] },
  { id: 'EDI', iata: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom', queries: ['Edinburgh Airport Terminal interior', 'Edinburgh Airport Terminal', 'Edinburgh Airport check-in'] },
  { id: 'GVA', iata: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', queries: ['Geneva Airport check-in hall', 'Aéroport Genève Terminal interior', 'Geneva Airport departure hall'] },

  // —— Middle East & Africa expansion ——
  { id: 'ADD', iata: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', queries: ['Addis Ababa Bole Airport Terminal', 'Bole Airport Terminal interior', 'Addis Ababa Airport Terminal'] },
  { id: 'NBO', iata: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', queries: ['Jomo Kenyatta Airport Terminal', 'Nairobi Airport Terminal interior', 'JKIA Terminal'] },
  { id: 'LOS', iata: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', queries: ['Lagos Airport Terminal', 'Murtala Muhammed Airport Terminal', 'Lagos Airport interior'] },

  // —— Asia-Pacific expansion ——
  { id: 'CGK', iata: 'CGK', name: 'Soekarno–Hatta International Airport', city: 'Jakarta', country: 'Indonesia', queries: ['Soekarno Hatta Airport Terminal', 'Jakarta Airport Terminal interior', 'CGK Terminal 3'] },
  { id: 'MNL', iata: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', queries: ['Ninoy Aquino Airport Terminal', 'Manila Airport Terminal interior', 'NAIA Terminal'] },
  { id: 'SGN', iata: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', queries: ['Tan Son Nhat Airport Terminal', 'Ho Chi Minh Airport Terminal', 'SGN Airport Terminal'] },
  { id: 'HAN', iata: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', queries: ['Noi Bai Airport Terminal', 'Hanoi Airport Terminal interior', 'HAN Airport Terminal'] },
  { id: 'CAN', iata: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', queries: ['Guangzhou Baiyun Airport Terminal', 'Baiyun Airport Terminal interior', 'CAN Airport Terminal'] },
  { id: 'PEK', iata: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', queries: ['Beijing Capital Airport Terminal 3', 'Beijing Airport Terminal interior', 'PEK Terminal 3'] },
  { id: 'HYD', iata: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', queries: ['Hyderabad Airport Terminal', 'Rajiv Gandhi Airport Terminal', 'HYD Airport Terminal interior'] },
  { id: 'PER', iata: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', queries: ['Perth Airport Terminal interior', 'Perth Airport Terminal', 'Perth Airport check-in'] },
  { id: 'BNE', iata: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', queries: ['Brisbane Airport Terminal interior', 'Brisbane Airport Terminal', 'Brisbane Airport check-in'] },

  // —— Americas expansion ——
  { id: 'EZE', iata: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', queries: ['Ezeiza Airport Terminal', 'Buenos Aires Ezeiza Terminal', 'Aeropuerto Ezeiza Terminal'] },
  { id: 'SCL', iata: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', queries: ['Santiago Airport Terminal', 'Arturo Merino Benítez Terminal', 'SCL Airport Terminal'] },
  { id: 'BOG', iata: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', queries: ['El Dorado Airport Terminal', 'Bogotá Airport Terminal', 'BOG Airport Terminal interior'] },
  { id: 'LIM', iata: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', queries: ['Jorge Chávez Airport Terminal', 'Lima Airport Terminal', 'LIM Airport Terminal'] },
  { id: 'GIG', iata: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', queries: ['Galeão Airport Terminal', 'Rio Galeão Terminal', 'GIG Airport Terminal'] },
  { id: 'EWR', iata: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States', queries: ['Newark Airport Terminal interior', 'Newark Liberty Terminal', 'EWR Airport Terminal'] },
  { id: 'IAH', iata: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', queries: ['Houston Intercontinental Airport Terminal', 'Bush Airport Terminal interior', 'IAH Airport Terminal'] },
  { id: 'PHX', iata: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States', queries: ['Phoenix Sky Harbor Terminal interior', 'Sky Harbor Airport Terminal', 'PHX Airport Terminal'] },
  { id: 'MSP', iata: 'MSP', name: 'Minneapolis–Saint Paul International Airport', city: 'Minneapolis', country: 'United States', queries: ['Minneapolis Airport Terminal interior', 'MSP Airport Terminal', 'Minneapolis Saint Paul Terminal'] },
  { id: 'MCO', iata: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States', queries: ['Orlando International Airport Terminal atrium', 'Orlando MCO Terminal interior', 'Orlando Airport check-in hall'] },
]

const EXCLUDE =
  /map|logo|flag|diagram|plan|svg|aerial|satellite|runway from|cockpit|livery|tail fin|in flight|bird'?s.?eye|from above|radar|chart|stamp|passport|ghost|metro |train|station|construction|aushub|sanitizer|chocolate|boutros|esenboga|van wyck|highway|expressway|parking garage|car park|wiki|stansted|cavern city|melbourne,? florida|lanseria|east london airport|baustelle|mcdonald|catholic chapel|texrail|hangar terminal|carparks|bus ticket|em constru|atatuerk|ataturk|fever check|1940|from airplane|window seat|apron|banner|smoking lounge|volcano chaos|exclusive books|internet kiosk|african swine|asheville|arex|dublin airport|heathrow|dulles|mccarran|limatambo|mariño|marino|aircraft tails|dhl cargo|birds winging|coronavirus|wheelchair|fornebu|ritazza|aiurport|fields \(distant/i

const INCLUDE =
  /airport|terminal|aeroporto|aéroport|flughafen|aeropuerto|havaliman|hall|concourse|check.?in|arrival|depart|gate |curbside|lobby|baggage|plaza|landside/i

function cleanUrl(u) {
  return String(u || '').split('?')[0]
}

async function api(params, attempt = 1) {
  const q = new URLSearchParams({ format: 'json', origin: '*', ...params })
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } })
  if (res.status === 429 && attempt < 8) {
    const wait = attempt * 3000
    console.warn(`  429 — wait ${wait}ms`)
    await sleep(wait)
    return api(params, attempt + 1)
  }
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

function pickMeta(ext, key) {
  return ext?.[key]?.value?.trim() || ''
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
}

function toAsset(page) {
  if (!page || page.missing !== undefined) return null
  const info = page.imageinfo?.[0]
  if (!info?.url) return null
  const mime = info.mime || ''
  if (!String(mime).startsWith('image/')) return null
  const title = (page.title || '').replace(/^File:/, '')
  if (EXCLUDE.test(title)) return null
  if (!INCLUDE.test(title)) return null
  const ext = info.extmetadata || {}
  const artist = stripHtml(
    pickMeta(ext, 'Artist') || pickMeta(ext, 'Credit') || 'Unknown',
  )
  const license =
    pickMeta(ext, 'LicenseShortName') || pickMeta(ext, 'License') || 'Unknown'
  return {
    title,
    url: cleanUrl(info.url),
    thumbUrl: cleanUrl(info.thumburl || info.url),
    author: artist || 'Unknown',
    license,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title.replace(/ /g, '_'))}`,
  }
}

async function searchImages(query) {
  const data = await api({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '15',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size|mime',
    iiurlwidth: String(THUMB_WIDTH),
  })
  return Object.values(data.query?.pages || {})
    .map(toAsset)
    .filter(Boolean)
}

async function resolveAirport(entry) {
  const images = []
  const used = new Set()
  for (const q of entry.queries) {
    await sleep(800)
    let results = []
    try {
      results = await searchImages(q)
    } catch (e) {
      console.warn(`  search fail (${q}): ${e.message}`)
      continue
    }
    for (const asset of results) {
      if (used.has(asset.title)) continue
      used.add(asset.title)
      try {
        const local = await localizeAsset(entry.iata, asset)
        images.push(local)
        console.log(`  + ${asset.title.slice(0, 70)} → ${local.thumbUrl}`)
        await sleep(250)
      } catch (e) {
        console.warn(`  mirror fail (${asset.title}): ${e.message}`)
        continue
      }
      if (images.length >= 3) return images
      break
    }
  }
  return images
}

async function main() {
  console.log(`Bank size: ${BANK.length} airports`)
  let existing = []
  try {
    existing = JSON.parse(readFileSync(OUT, 'utf8'))
  } catch {
    /* fresh */
  }
  const byId = new Map(existing.map((a) => [a.id, a]))

  for (const entry of BANK) {
    const have = byId.get(entry.id)
    if (have?.images?.length >= 2) {
      console.log(`skip ${entry.iata}`)
      continue
    }
    console.log(`→ ${entry.iata}`)
    const images = await resolveAirport(entry)
    if (images.length === 0) {
      console.warn(`  none for ${entry.iata}`)
      continue
    }
    byId.set(entry.id, {
      id: entry.id,
      iata: entry.iata,
      name: entry.name,
      city: entry.city,
      country: entry.country,
      images,
    })
    mkdirSync(dirname(OUT), { recursive: true })
    writeFileSync(OUT, JSON.stringify([...byId.values()], null, 2) + '\n')
  }

  // Keep bank order for readability
  const airports = BANK.map((e) => byId.get(e.id)).filter(Boolean)
  // plus any extras not in bank
  for (const a of byId.values()) {
    if (!airports.find((x) => x.id === a.id)) airports.push(a)
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(airports, null, 2) + '\n')
  const withPhotos = airports.filter((a) => a.images?.length >= 1)
  console.log(
    `Wrote ${withPhotos.length}/${BANK.length} airports (${withPhotos.filter((a) => a.images.length >= 2).length} with 2+ photos) → ${OUT}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
