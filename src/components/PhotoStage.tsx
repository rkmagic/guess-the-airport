import { useEffect, useState } from 'react'
import type { ImageAsset } from '../data/airports'

type Props = {
  images: ImageAsset[]
  photoIndex: number
  dimmed?: boolean
}

export function PhotoStage({ images, photoIndex, dimmed }: Props) {
  const image = images[Math.min(photoIndex, images.length - 1)]
  const [loaded, setLoaded] = useState(false)
  const [prevSrc, setPrevSrc] = useState<string | null>(null)

  useEffect(() => {
    setLoaded(false)
  }, [image?.thumbUrl])

  if (!image) {
    return <div className="photo-stage photo-stage--empty">No photo</div>
  }

  return (
    <div className={`photo-stage${dimmed ? ' is-dimmed' : ''}`}>
      {prevSrc && prevSrc !== image.thumbUrl && (
        <img className="photo-stage__img is-exit" src={prevSrc} alt="" />
      )}
      <img
        key={image.thumbUrl}
        className={`photo-stage__img${loaded ? ' is-in' : ''}`}
        src={image.thumbUrl}
        alt="Airport ground-level view — guess which airport"
        onLoad={() => {
          setLoaded(true)
          setPrevSrc(image.thumbUrl)
        }}
      />
      <div className="photo-dots" aria-label={`Photo ${photoIndex + 1} of ${images.length}`}>
        {images.map((_, i) => (
          <span
            key={i}
            className={`photo-dot${i <= photoIndex ? ' is-on' : ''}${i === photoIndex ? ' is-current' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
