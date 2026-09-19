import type { ImageAsset } from '../data/airports'

type Props = {
  assets: ImageAsset[]
  compact?: boolean
}

export function Attribution({ assets, compact }: Props) {
  if (assets.length === 0) return null
  return (
    <div className={`attribution${compact ? ' is-compact' : ''}`}>
      {!compact && <h3>Photo credits</h3>}
      <ul>
        {assets.map((a) => (
          <li key={a.sourceUrl + a.title}>
            <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer">
              {a.title}
            </a>
            <span>
              {' '}
              — {a.author} · {a.license}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
