import '@fontsource-variable/caveat' // handwriting — loaded with this set only

import { useRef } from 'react'

import { useT } from '@/i18n'
import { useLocale } from '@/i18n/locale'

import { useFit16x9 } from '../../engine/artWidth'
import type { ArtProps } from '../../engine/types'

import { AcceptedScene } from './accepted'
import { ExamDayScene } from './examday'
import { MocksScene } from './mocks'
import { PrepScene } from './prep'
import { SketchScoreboard } from './scoreboard'
import { INK } from './pencil'
import { Paper, SketchDefs, Written } from './sketch'

// Set 2's art: pencil sketches on paper (SVG, 320 × 180 like Set 1, sharp at any size).
// One drawing per step: the set's scoreboard, then the scenes (src/data/en/quest.ts).
// A new step starts a new drawing: its lines draw themselves again.

export default function ExamArt({ chapter, scene }: ArtProps) {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const boxRef = useRef<HTMLDivElement>(null)
  const phone = useFit16x9(boxRef) // whole on wide boxes, the middle on phones

  const id = scene < 0 ? 'scoreboard' : (chapter.scenes[scene]?.id ?? 'pending')
  const title = chapter.title.toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US')
  const label =
    scene < 0
      ? t.quest.sketchScoreboard(chapter.set, chapter.title, chapter.period)
      : `${t.quest.art.label} · ${t.quest.art.shot(scene + 1, chapter.scenes.length)}`

  return (
    <div ref={boxRef} className="flex size-full items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 320 180"
        preserveAspectRatio={phone ? 'xMidYMid slice' : 'xMidYMid meet'}
        role="img"
        aria-label={label}
        className="size-full max-h-full"
      >
        <SketchDefs />
        {/* key: every step is a fresh drawing, its strokes start again */}
        <g key={id} className="animate-fade-in">
          {id === 'scoreboard' ? (
            <SketchScoreboard set={chapter.set} title={title} period={chapter.period} />
          ) : id === 'prep' ? (
            <PrepScene />
          ) : id === 'mocks' ? (
            <MocksScene />
          ) : id === 'exam-day' ? (
            <ExamDayScene />
          ) : id === 'accepted' ? (
            <AcceptedScene
              programme={t.quest.accepted.programme}
              school={t.quest.accepted.school}
            />
          ) : (
            <Pending n={scene + 1} of={chapter.scenes.length} />
          )}
        </g>
      </svg>
    </div>
  )
}

// A scene that isn't drawn yet: a blank page with its number
function Pending({ n, of }: { n: number; of: number }) {
  return (
    <>
      <Paper />
      <Written x={160} y={98} size={24} id="pending" color={INK.soft}>
        {`${n} / ${of} …`}
      </Written>
    </>
  )
}
