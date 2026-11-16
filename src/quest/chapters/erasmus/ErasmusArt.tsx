import { useRef, useState } from 'react'

import { useT } from '@/i18n'
import { useLocale } from '@/i18n/locale'

import { useFit16x9 } from '../../engine/artWidth'
import type { ArtProps } from '../../engine/types'

import { JourneyScene } from './journey'
import { PhotoDialog } from './PhotoDialog'
import type { HavelPhoto } from './photos'
import { CampusScene, HavelScene, TeamsScene } from './scenes'
import { FlatScoreboard } from './scoreboard'

// Set 4's art: Erasmus in Brandenburg an der Havel, in clean flat vector shapes (SVG, 320 × 180
// like the other sets, sharp at any size). One picture per step: the scoreboard, then the
// scenes (src/data/en/quest.ts). Each step is a fresh picture: its shapes pop in again.
// Two scenes are played with: the journey (take the suitcase to Brandenburg) and the Havel
// (spots that open photos).
type SceneProps = { onOpen: (photo: HavelPhoto) => void }
const SCENES: Record<string, (props: SceneProps) => React.JSX.Element> = {
  move: JourneyScene,
  havel: HavelScene,
  'th-brandenburg': CampusScene,
  teams: TeamsScene,
}
const PLAYED = new Set(['move', 'havel', 'th-brandenburg'])

export default function ErasmusArt({ chapter, scene }: ArtProps) {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const boxRef = useRef<HTMLDivElement>(null)
  const phone = useFit16x9(boxRef) // whole on wide boxes, the middle on phones
  const [photo, setPhoto] = useState<HavelPhoto | null>(null)

  const id = scene < 0 ? 'scoreboard' : (chapter.scenes[scene]?.id ?? 'pending')
  const title = chapter.title.toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US')
  const label =
    scene < 0
      ? t.quest.vectorScoreboard(chapter.set, chapter.title, chapter.period)
      : `${t.quest.art.label} · ${t.quest.art.shot(scene + 1, chapter.scenes.length)}`
  const Scene = SCENES[id]

  return (
    <div ref={boxRef} className="flex size-full items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 320 180"
        preserveAspectRatio={phone ? 'xMidYMid slice' : 'xMidYMid meet'}
        // a scene with things to press is a group (an "img" would hide its buttons)
        role={PLAYED.has(id) ? 'group' : 'img'}
        aria-label={label}
        className="size-full max-h-full"
      >
        {/* moving shapes (the river's light, a duck) never show outside the picture */}
        <clipPath id="erasmus-frame">
          <rect width="320" height="180" />
        </clipPath>
        {/* the chapter's one light: warm from the top left, a cool violet shade towards the
            bottom right — laid over every scene in soft light, so the colours stay theirs */}
        <linearGradient id="erasmus-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1cf" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#3b3f8f" stopOpacity="0.55" />
        </linearGradient>
        <g key={id} className="animate-fade-in" clipPath="url(#erasmus-frame)">
          {id === 'scoreboard' ? (
            <FlatScoreboard set={chapter.set} title={title} period={chapter.period} />
          ) : Scene ? (
            <Scene onOpen={setPhoto} />
          ) : (
            <rect width="320" height="180" fill="#bfe1f2" />
          )}
          <rect
            width="320"
            height="180"
            fill="url(#erasmus-light)"
            pointerEvents="none"
            style={{ mixBlendMode: 'soft-light' }}
          />
        </g>
      </svg>
      {photo && <PhotoDialog photo={photo} onClose={() => setPhoto(null)} />}
    </div>
  )
}
