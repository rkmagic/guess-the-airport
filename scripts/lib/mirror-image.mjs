/**
 * Download a Commons (or remote) image into public/images/{IATA}/ and return a local path.
 * Re-run safe: skips download when the file already exists.
 */
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(__dirname, '..', '..')
export const IMAGES_DIR = join(ROOT, 'public', 'images')
export const UA = 'GuessTheAirport/1.0 (educational game; https://guess-the-airport.vercel.app)'

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Sanitize Commons title into a filesystem-safe name; prefer extension from remote URL. */
export function safeFilename(title, remoteUrl) {
  const raw = String(title || 'image').replace(/^File:/i, '')
  let ext = ''
  try {
    if (remoteUrl) ext = extname(new URL(remoteUrl).pathname)
  } catch {
    /* ignore */
  }
  const titleExt = extname(raw)
  if (!ext || ext === '.php' || ext === '.index') ext = titleExt || '.jpg'
  const stemSource = titleExt ? raw.slice(0, -titleExt.length) : raw
  const stem =
    stemSource
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w.\-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 120) || 'image'
  return `${stem}${ext.toLowerCase()}`
}

export function localThumbPath(iata, filename) {
  return `/images/${String(iata).toUpperCase()}/${filename}`
}

export function isLocalThumbUrl(url) {
  return typeof url === 'string' && url.startsWith('/images/')
}

function candidateUrls(title, remoteUrl, fullUrl) {
  const urls = []
  const push = (u) => {
    if (u && !isLocalThumbUrl(u) && !urls.includes(u)) urls.push(u)
  }
  const file = String(title || '').replace(/^File:/i, '').replace(/ /g, '_')
  // Prefer Commons redirect/FilePath first — more resilient than direct upload CDN under rate limits
  if (file) {
    push(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1280`)
    push(
      `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(file)}&width=1280`,
    )
  }
  push(remoteUrl)
  push(fullUrl)
  return urls
}

async function downloadToFile(url, absFile, userAgent) {
  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent, Accept: 'image/*,*/*' },
    redirect: 'follow',
  })
  if (!res.ok) {
    const err = new Error(`download ${res.status} for ${url}`)
    err.status = res.status
    throw err
  }
  const ctype = res.headers.get('content-type') || ''
  if (ctype.includes('text/html')) {
    throw new Error(`got HTML instead of image for ${url}`)
  }
  if (!res.body) throw new Error(`empty body for ${url}`)
  try {
    await pipeline(Readable.fromWeb(res.body), createWriteStream(absFile))
  } catch (e) {
    try {
      unlinkSync(absFile)
    } catch {
      /* ignore */
    }
    throw e
  }
}

/**
 * @param {{ iata: string, title: string, remoteUrl: string, fullUrl?: string, userAgent?: string }} opts
 * @returns {Promise<{ thumbUrl: string, filename: string, downloaded: boolean }>}
 */
export async function mirrorImage({
  iata,
  title,
  remoteUrl,
  fullUrl,
  userAgent = UA,
}) {
  if (!remoteUrl && !fullUrl && !title) {
    throw new Error('mirrorImage: remoteUrl or title required')
  }
  if (isLocalThumbUrl(remoteUrl)) {
    return {
      thumbUrl: remoteUrl,
      filename: remoteUrl.split('/').pop(),
      downloaded: false,
    }
  }

  const code = String(iata).toUpperCase()
  const urls = candidateUrls(title, remoteUrl, fullUrl)
  const filename = safeFilename(title, urls[0] || remoteUrl)
  const absDir = join(IMAGES_DIR, code)
  const absFile = join(absDir, filename)
  const thumbUrl = localThumbPath(code, filename)

  if (existsSync(absFile)) {
    return { thumbUrl, filename, downloaded: false }
  }

  mkdirSync(absDir, { recursive: true })

  let lastErr = null
  for (const url of urls) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await downloadToFile(url, absFile, userAgent)
        return { thumbUrl, filename, downloaded: true }
      } catch (e) {
        lastErr = e
        const status = e.status
        if ((status === 429 || status >= 500) && attempt < 5) {
          const wait = attempt * 8000
          console.warn(`  ${status} — wait ${wait}ms (${filename})`)
          await sleep(wait)
          continue
        }
        if (attempt < 5 && /fetch|network|ECONN|ETIMEDOUT/i.test(String(e.message))) {
          await sleep(attempt * 3000)
          continue
        }
        break // try next candidate URL
      }
    }
  }
  throw lastErr || new Error(`download failed for ${title}`)
}

/**
 * Ensure an image asset has a local thumbUrl. Keeps Commons `url` + `sourceUrl` for credit/re-fetch.
 * @param {string} iata
 * @param {{ title: string, url: string, thumbUrl: string, author: string, license: string, sourceUrl: string }} asset
 */
export async function localizeAsset(iata, asset) {
  if (isLocalThumbUrl(asset.thumbUrl)) return asset
  const { thumbUrl } = await mirrorImage({
    iata,
    title: asset.title,
    remoteUrl: asset.thumbUrl || asset.url,
    fullUrl: asset.url,
  })
  return { ...asset, thumbUrl }
}
