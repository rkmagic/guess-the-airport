/**
 * One-shot: download all remote thumbs in airports.json into public/images/
 * and rewrite thumbUrl to /images/{IATA}/...
 *
 * Usage: node scripts/mirror-images.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT,
  isLocalThumbUrl,
  localizeAsset,
  sleep,
} from './lib/mirror-image.mjs'

const OUT = join(ROOT, 'public', 'data', 'airports.json')

async function main() {
  const airports = JSON.parse(readFileSync(OUT, 'utf8'))
  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const a of airports) {
    const next = []
    for (const img of a.images || []) {
      if (isLocalThumbUrl(img.thumbUrl)) {
        next.push(img)
        skipped++
        continue
      }
      try {
        const before = img.thumbUrl
        const localized = await localizeAsset(a.iata, img)
        next.push(localized)
        if (localized.thumbUrl !== before) {
          // localizeAsset always changes remote → local; count file write via re-check is hard — log path
          downloaded++
          console.log(`${a.iata} ← ${localized.thumbUrl}`)
        }
        await sleep(1500)
      } catch (e) {
        failed++
        console.warn(`${a.iata} FAIL ${img.title}: ${e.message}`)
        next.push(img)
      }
    }
    a.images = next
  }

  writeFileSync(OUT, JSON.stringify(airports, null, 2) + '\n')

  const stillRemote = airports.flatMap((a) =>
    (a.images || []).filter((i) => !isLocalThumbUrl(i.thumbUrl)),
  )
  console.log(
    `done: mirrored≈${downloaded}, already-local=${skipped}, failed=${failed}, still-remote=${stillRemote.length}`,
  )
  if (stillRemote.length) {
    for (const img of stillRemote.slice(0, 10)) {
      console.warn(`  remote: ${img.title} → ${img.thumbUrl}`)
    }
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
