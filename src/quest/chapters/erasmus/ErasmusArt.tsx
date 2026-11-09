import { useRef } from 'react'

import { useT } from '@/i18n'
import { useLocale } from '@/i18n/locale'

import { useFit16x9 } from '../../engine/artWidth'
import type { ArtProps } from '../../engine/types'

import { CampusScene, HavelScene, MoveScene, TeamsScene } from './scenes'
import { FlatScoreboard } from './scoreboard'

// Set 4's art: Erasmus in Brandenburg an der Havel, in clean flat vector shapes (SVG, 320 × 180
// like the other sets, sharp at any size). One picture per step: the scoreboard, then the
// scenes (src/data/en/quest.ts). Each step is a fresh picture: its shapes pop in again.
const SCENES: Record<string, () => React.JSX.Element> = {
  move: MoveScene,
  havel: HavelScene,
  'th-brandenburg': CampusScene,
  teams: TeamsScene,
}

export default function ErasmusArt({ chapter, scene }: ArtProps) {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const boxRef = useRef<HTMLDivElement>(null)
  const phone = useFit16x9(boxRef) // whole on wide boxes, the middle on phones

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
        role="img"
        aria-label={label}
        className="size-full max-h-full"
      >
        {/* moving shapes (the river's light, a duck) never show outside the picture */}
        <clipPath id="erasmus-frame">
          <rect width="320" height="180" />
        </clipPath>
        <g key={id} className="animate-fade-in" clipPath="url(#erasmus-frame)">
          {id === 'scoreboard' ? (
            <FlatScoreboard set={chapter.set} title={title} period={chapter.period} />
          ) : Scene ? (
            <Scene />
          ) : (
            <rect width="320" height="180" fill="#bfe1f2" />
          )}
        </g>
      </svg>
    </div>
  )
}
