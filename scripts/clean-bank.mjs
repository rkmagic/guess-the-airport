/**
 * Drop known-bad titles from airports.json and refill short airports via Commons search.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'data', 'airports.json')
const UA = 'GuessTheAirport/1.0 (educational game; local development)'
const API = 'https://commons.wikimedia.org/w/api.php'

const DROP =
  /stansted|cavern city|melbourne,? florida|lanseria|east london airport|etihad airways check-in area at ctu|swissair boeing|baustelle|mcdonald|catholic chapel|mosque interior|bus ticket machine|texrail|cumbica.*panoramio|hangar terminal|bandit at the south|new mexico|shoe inspection|skyway\.jpg|abstellposition|outside dublin airport terminal building|night view\.jpg|pano between terminals|airport museum|carparks main|banner aircraft|em construção|em construcao|construction|wiki/i

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

async function main() {
  const airports = JSON.parse(readFileSync(OUT, 'utf8'))
  let dropped = 0

  for (const a of airports) {
    const before = a.images.length
    a.images = a.images.filter((img) => !DROP.test(img.title))
    dropped += before - a.images.length
    const used = new Set(a.images.map((i) => i.title))

    let tries = 0
    while (a.images.length < 2 && tries < 3) {
      tries++
      await sleep(700)
      const found = await search(`${a.name} Terminal interior`)
      let added = false
      for (const asset of found) {
        if (used.has(asset.title)) continue
        // soft city/iata hint when possible
        const hay = asset.title.toLowerCase()
        const city = a.city.toLowerCase()
        const iata = a.iata.toLowerCase()
        if (
          !hay.includes(iata) &&
          !hay.includes(city.split(' ')[0]) &&
          !hay.includes(a.name.toLowerCase().split(' ')[0])
        ) {
          // still allow if strongly "terminal" + airport word and we're desperate
          if (a.images.length >= 1) continue
        }
        a.images.push(asset)
        used.add(asset.title)
        console.log(`${a.iata} + ${asset.title.slice(0, 60)}`)
        added = true
        if (a.images.length >= 3) break
      }
      if (!added) break
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
