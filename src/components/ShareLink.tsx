import { useState } from 'react'

type Props = {
  label?: string
  text?: string
}

function shareUrl(): string {
  return window.location.origin + window.location.pathname
}

export function ShareLink({
  label = 'Share AeroGuesser',
  text = 'Can you guess the airport from the curb? Play AeroGuesser.',
}: Props) {
  const [copied, setCopied] = useState(false)
  const url = shareUrl()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'AeroGuesser', text, url })
        return
      } catch {
        /* user cancelled or share failed — fall through to copy */
      }
    }
    await handleCopy()
  }

  return (
    <div className="share-link">
      <p className="share-link__label">{label}</p>
      <div className="share-link__row">
        <span className="share-link__url" title={url}>
          {url.replace(/^https?:\/\//, '')}
        </span>
        <button type="button" className="btn btn-secondary share-link__copy" onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button type="button" className="btn btn-ghost share-link__share" onClick={handleShare}>
          Share
        </button>
      </div>
    </div>
  )
}
