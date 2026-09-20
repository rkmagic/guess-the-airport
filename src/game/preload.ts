const cache = new Set<string>()

/** Warm the browser image cache for the given URLs. */
export function preloadImages(urls: string[]): void {
  for (const url of urls) {
    if (!url || cache.has(url)) continue
    cache.add(url)
    const img = new Image()
    img.src = url
  }
}
