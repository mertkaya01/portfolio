import type { KeyboardEvent } from 'react'

import { useT } from '@/i18n'

import { FLAT, pop, pulse } from './flat'
import type { HavelPhoto } from './photos'

// The spots in the Havel scene that open a photo: a white camera badge with a ring that swells
// a few times, then rests. Real buttons for the keyboard and screen readers; a hit area much
// bigger than the badge for thumbs. The photo starts loading as soon as a pointer or the focus
// comes near, so it is there when the dialog opens.
export function Hotspots({
  photos,
  onOpen,
}: {
  photos: HavelPhoto[]
  onOpen: (photo: HavelPhoto) => void
}) {
  const t = useT()
  return photos.map((photo, i) => {
    const preload = () => {
      if (photo.src) new Image().src = photo.src
    }
    const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      onOpen(photo)
    }
    return (
      <g
        key={photo.id}
        role="button"
        tabIndex={0}
        aria-label={t.quest.photos.open(t.quest.photos[photo.id])}
        data-quest-interactive
        onClick={() => onOpen(photo)}
        onKeyDown={onKeyDown}
        onPointerEnter={preload}
        onFocus={preload}
        transform={`translate(${photo.x} ${photo.y})`}
        className="group cursor-pointer outline-none"
      >
        <circle r={12} fill="transparent" />
        <circle
          r={5.5}
          fill="none"
          stroke={FLAT.white}
          strokeWidth={1.2}
          style={pulse(1000 + i * 260)}
        />
        <circle
          r={9}
          fill="none"
          stroke={FLAT.star}
          strokeWidth={1}
          strokeDasharray="2 1.6"
          className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
        <g style={pop(800 + i * 160)}>
          <circle
            r={5.5}
            fill={FLAT.white}
            stroke={photo.src ? FLAT.navy : FLAT.grey}
            strokeWidth={0.8}
            strokeDasharray={photo.src ? undefined : '1.4 1'}
          />
          <rect x={-2.9} y={-1.5} width={5.8} height={3.9} rx={0.8} fill={FLAT.navy} />
          <rect x={-1.2} y={-2.6} width={2.4} height={1.3} rx={0.4} fill={FLAT.navy} />
          <circle cy={0.45} r={1.25} fill={FLAT.white} />
        </g>
      </g>
    )
  })
}
