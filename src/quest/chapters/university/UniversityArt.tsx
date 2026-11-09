import { useRef } from 'react'

import { useT } from '@/i18n'
import { useLocale } from '@/i18n/locale'

import { useFit16x9 } from '../../engine/artWidth'
import type { ArtProps } from '../../engine/types'
import { useSceneTime } from '../../engine/useSceneTime'

import { COLS, ROWS } from './ascii'
import { campus, capstone, courses, examReader, pending, scoreboard, volleyball } from './scenes'

// Set 3's art: the world redrawn in characters — an amber terminal, 80 × 27 characters, like an
// old CRT screen: faint scan lines, a soft glow, darker corners. It is SVG text in the site's
// monospace font (each character exactly 6 × 10 units), so it stays sharp at any size.
const CELL = { w: 6, h: 10 }
const W = COLS * CELL.w // 480
const H = ROWS * CELL.h // 270
const AMBER = '#ffc23a'

export default function UniversityArt({ chapter, scene }: ArtProps) {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const boxRef = useRef<HTMLDivElement>(null)
  const phone = useFit16x9(boxRef)

  const id = scene < 0 ? 'scoreboard' : (chapter.scenes[scene]?.id ?? 'pending')
  const title = chapter.title.toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US')
  const label =
    scene < 0
      ? t.quest.asciiScoreboard(chapter.set, chapter.title, chapter.period)
      : `${t.quest.art.label} · ${t.quest.art.shot(scene + 1, chapter.scenes.length)}`

  return (
    <div ref={boxRef} className="flex size-full items-center justify-center overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio={phone ? 'xMidYMid slice' : 'xMidYMid meet'}
        role="img"
        aria-label={label}
        className="size-full max-h-full"
      >
        <defs>
          {/* scan lines: every other pixel row a little darker */}
          <pattern id="crt-lines" width="4" height="3" patternUnits="userSpaceOnUse">
            <rect width="4" height="1" fill="black" opacity="0.35" />
          </pattern>
          <radialGradient id="crt-vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.6" stopColor="black" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.7" />
          </radialGradient>
          {/* the phosphor's glow around the letters */}
          <filter id="crt-glow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={W} height={H} fill="#0d0b06" />
        {/* key: every step starts its own clock (typing starts again) */}
        <Terminal
          key={id}
          id={id}
          scene={scene}
          count={chapter.scenes.length}
          board={{ set: chapter.set, title, period: chapter.period }}
        />
        <rect width={W} height={H} fill="url(#crt-lines)" pointerEvents="none" />
        <rect width={W} height={H} fill="url(#crt-vignette)" pointerEvents="none" />
      </svg>
    </div>
  )
}

// the scenes by id (src/data/en/quest.ts); the scoreboard is apart: it needs the set's text
const SCENES: Record<string, (t: number) => string[]> = {
  iku: campus,
  courses,
  volleyball,
  'exam-reader': examReader,
  capstone,
}

function Terminal({
  id,
  scene,
  count,
  board,
}: {
  id: string
  scene: number
  count: number
  board: { set: number; title: string; period: string }
}) {
  const time = useSceneTime(20)
  const draw = SCENES[id]
  const lines =
    id === 'scoreboard'
      ? scoreboard(time, board)
      : draw
        ? draw(time)
        : pending(time, scene + 1, count)
  return (
    <g
      filter="url(#crt-glow)"
      fill={AMBER}
      fontFamily="'JetBrains Mono Variable', ui-monospace, monospace"
      fontSize={CELL.h}
      className="animate-fade-in"
    >
      {lines.map((line, row) => (
        // textLength: every row exactly 80 cells wide, whatever the font does with odd glyphs
        <text
          key={row}
          x={0}
          y={row * CELL.h + CELL.h * 0.8}
          textLength={W}
          lengthAdjust="spacing"
          xmlSpace="preserve"
          style={{ whiteSpace: 'pre' }}
        >
          {line}
        </text>
      ))}
    </g>
  )
}
