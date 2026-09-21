import { useState } from 'react'

type Props = {
  text?: string
}

function shareUrl(): string {
  return window.location.origin + window.location.pathname
}

function ShareIcon() {
  return (
    <svg
      className="share-link__icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  )
}

export function ShareLink({
  text = 'Can you guess the airport from the curb? Play AeroGuesser.',
}: Props) {
  const [copied, setCopied] = useState(false)
  const url = shareUrl()

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'AeroGuesser', text, url })
        return
      } catch {
        /* user cancelled or share failed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      className="btn btn-secondary share-link"
      onClick={handleShare}
      aria-label={copied ? 'Link copied' : 'Share'}
      title={copied ? 'Link copied' : 'Share'}
    >
      <ShareIcon />
      <span className="share-link__text">{copied ? 'Copied' : 'Share'}</span>
    </button>
  )
}
