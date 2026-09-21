declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Send a custom event to GA4. No-ops if gtag is unavailable. */
export function track(name: string, params?: Record<string, string | number | boolean>) {
  window.gtag?.('event', name, params)
}
