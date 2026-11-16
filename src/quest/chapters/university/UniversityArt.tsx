import { useRef } from 'react'

import { useT } from '@/i18n'
import { useLocale } from '@/i18n/locale'

import { useFit16x9 } from '../../engine/artWidth'
import type { ArtProps } from '../../engine/types'
import { useSceneTime } from '../../engine/useSceneTime'

import { COLS, ROWS } from './ascii'
import { campus, capstone, courses, examReader, pending, scoreboard, volleyball } from './scenes'

// Set 3's art: the world redrawn in characters — an amber terminal, 80 × 27 characters, like an
// old CRT screen. It is SVG text in the site's monospace font (each character exactly 6 × 10
// units), so it stays sharp at any size. What makes it a screen and not just yellow text:
// - three levels of brightness: solid blocks burn hot (almost white at the core), text glows
//   amber, shading characters stay dim — a phosphor screen is never one flat colour
// - a two-layer glow: a tight halo and a wide bloom that the brightest parts spread most
// - scan lines, darker corners, the curved glass catching a faint reflection, and the
//   phosphor's slight flicker
const CELL = { w: 6, h: 10 }
const W = COLS * CELL.w // 480
const H = ROWS * CELL.h // 270
const AMBER = '#ffc23a'
const TIERS = {
  hot: '#ffe7a6', // solid blocks: the brightest phosphor, nearly white
  base: AMBER,
  dim: '#a8700f', // shading, dots and rules: the glow of a low beam
}
const HOT = new Set([...'█▄▀▌▐■●◆▓'])
const DIM = new Set([..."░▒·.:'`,~"])
type Tier = keyof typeof TIERS
const tierOf = (ch: string): Tier => (HOT.has(ch) ? 'hot' : DIM.has(ch) ? 'dim' : 'base')

// a row cut into runs of the same brightness (one <tspan> each)
function runs(line: string) {
  const out: { text: string; tier: Tier }[] = []
  for (const ch of line) {
    const tier = ch === ' ' && out.length ? out[out.length - 1].tier : tierOf(ch)
    const last = out[out.length - 1]
    if (last && last.tier === tier) last.text += ch
    else out.push({ text: ch, tier })
  }
  return out
}

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
          {/* the phosphor's glow: a tight halo, and a wide, faint bloom around it */}
          <filter id="crt-glow" x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="halo" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="wide" />
            <feComponentTransfer in="wide" result="bloom">
              <feFuncA type="linear" slope="0.55" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="bloom" />
              <feMergeNode in="halo" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* the curved glass: a soft diagonal reflection and shade along the edges */}
          <linearGradient id="crt-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.07" />
            <stop offset="0.35" stopColor="white" stopOpacity="0.015" />
            <stop offset="0.6" stopColor="white" stopOpacity="0" />
          </linearGradient>
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
        <rect width={W} height={H} fill="url(#crt-sheen)" pointerEvents="none" />
        <rect
          x={1}
          y={1}
          width={W - 2}
          height={H - 2}
          rx={14}
          fill="none"
          stroke="black"
          strokeOpacity={0.5}
          strokeWidth={10}
          pointerEvents="none"
          style={{ filter: 'blur(6px)' }}
        />
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
      <g className="animate-crt-flicker">
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
            {runs(line).map((run, i) => (
              <tspan key={i} fill={TIERS[run.tier]}>
                {run.text}
              </tspan>
            ))}
          </text>
        ))}
      </g>
    </g>
  )
}
