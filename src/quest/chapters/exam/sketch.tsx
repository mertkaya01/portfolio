import { useId, useMemo, type ReactNode } from 'react'

import { LineDraw } from '../../scene-kit/LineDraw'

import { HAND, INK, pencilLine } from './pencil'

// The pencil-sketch kit of Set 2. Everything is SVG in a 320 × 180 box (the same frame as
// Set 1's pixel art), so it stays sharp at any size:
// - strokes are pencil lines: pressure, tapered ends, a guide stroke under them; they draw
//   themselves (LineDraw, as a mask)
// - a pencil filter roughens every line and lets the paper's grain through; a notebook page
//   sits under it all
// - handwriting (Caveat) appears as if it were being written, left to right

// Several strokes drawn one after the other, starting at `delay` ms. Each is a real pencil
// line (pencilLine in pencil.ts): it starts thin, swells with the pressure, tapers off at the
// end, and has a faint guide stroke under it that overshoots the ends — the way a hand finds a
// line before committing to it. It still draws itself: the line is revealed through a mask
// that draws along its middle.
export function Strokes({
  paths,
  delay = 0,
  each = 220,
  width = 0.8,
  color = INK.graphite,
}: {
  paths: string[]
  delay?: number
  each?: number
  width?: number
  color?: string
}) {
  return (
    <g style={{ mixBlendMode: 'multiply' }}>
      {paths.map((d, i) => (
        <PencilStroke
          key={i}
          d={d}
          delay={delay + i * each * 0.6}
          duration={each}
          size={width * 2.2}
          seed={i * 7 + d.length}
          color={color}
        />
      ))}
    </g>
  )
}

function PencilStroke({
  d,
  delay,
  duration,
  size,
  seed,
  color,
}: {
  d: string
  delay: number
  duration: number
  size: number
  seed: number
  color: string
}) {
  const id = useId()
  const line = useMemo(() => pencilLine(d, size, seed), [d, size, seed])
  if (!line) {
    // (no browser geometry to measure with: a plain line, as before)
    return (
      <LineDraw
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={size / 2.2}
        delay={delay}
        duration={duration}
      />
    )
  }
  return (
    <>
      <LineDraw
        d={line.guide}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.22}
        opacity={0.32}
        delay={Math.max(0, delay - duration * 0.4)}
        duration={duration * 0.8}
      />
      <mask id={id} maskUnits="userSpaceOnUse">
        <LineDraw
          d={d}
          fill="none"
          stroke="white"
          strokeWidth={size * 3}
          delay={delay}
          duration={duration}
        />
      </mask>
      <path d={line.outline} fill={color} mask={`url(#${id})`} />
    </>
  )
}

// Handwriting that appears left to right from `delay` ms, as if it were being written
export function Written({
  x,
  y,
  size,
  delay = 0,
  duration = 700,
  anchor = 'middle',
  id,
  children,
  color = INK.graphite,
  weight = 600,
}: {
  x: number
  y: number
  size: number
  delay?: number
  duration?: number
  anchor?: 'start' | 'middle' | 'end'
  id: string // unique: names the mask that reveals it
  children: ReactNode
  color?: string
  weight?: number
}) {
  // the mask's white bar grows from the left edge of the text to its right edge
  // (the width is estimated from the number of letters: handwriting is narrow)
  const width = String(children).length * size * 0.5 + size
  const left = anchor === 'start' ? x : anchor === 'middle' ? x - width / 2 : x - width
  return (
    <g>
      <mask id={id} maskUnits="userSpaceOnUse">
        <rect
          x={left - size * 0.3}
          y={y - size * 1.2}
          width={width + size * 0.6}
          height={size * 1.8}
          fill="white"
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'left',
            animation: `step-fill ${duration}ms linear ${delay}ms both`,
          }}
        />
      </mask>
      <text
        x={x}
        y={y}
        fontSize={size}
        fontFamily={HAND}
        fontWeight={weight}
        textAnchor={anchor}
        fill={color}
        mask={`url(#${id})`}
      >
        {children}
      </text>
    </g>
  )
}

// The paper and the pencil filter — put once inside the scene's <svg>
export function SketchDefs() {
  return (
    <defs>
      {/* graphite: lines shiver a little, and the grain of the paper shows through them —
          graphite sticks to the paper's tooth and skips its hollows, so a pencil line is never
          one flat colour */}
      <filter id="sketch-pencil" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" result="drawn" />
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.5"
          numOctaves="1"
          seed="11"
          result="tooth"
        />
        <feColorMatrix
          in="tooth"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 2.05"
          result="holds"
        />
        <feComposite in="drawn" in2="holds" operator="in" />
      </filter>
      {/* paper grain: faint noise over the paper colour */}
      <filter id="sketch-grain">
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="8" />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.28  0 0 0 0.09 0" />
      </filter>
    </defs>
  )
}

// The page: warm off-white with a faint grain — a student's notebook page, its pale blue
// rules and red margin line barely there under the drawing
export function Paper({ tint = INK.paper, ruled = true }: { tint?: string; ruled?: boolean }) {
  return (
    <>
      <rect width="320" height="180" fill={tint} />
      {ruled && (
        <g opacity={0.5}>
          {Array.from({ length: 19 }, (_, i) => (
            <path key={i} d={`M0 ${10 + i * 9} H320`} stroke="#9fb7d6" strokeWidth={0.3} />
          ))}
          <path d="M34 0 V180" stroke="#d98a8a" strokeWidth={0.4} />
        </g>
      )}
      <rect width="320" height="180" filter="url(#sketch-grain)" />
    </>
  )
}

// Pencil hatching: parallel strokes at an angle, shown only where `mask` lets them through
// (an SVG mask id), fading in at `delay` ms. For shade, night, hair, a dark jumper.
export function Hatch({
  mask,
  clip,
  gap = 2.2,
  angle = 35,
  delay = 0,
  color = INK.soft,
  width = 0.35,
  opacity = 0.8,
}: {
  mask?: string
  clip?: string // or a clip path id
  gap?: number
  angle?: number
  delay?: number
  color?: string
  width?: number
  opacity?: number
}) {
  const lines = []
  for (let i = -200; i < 520; i += gap) lines.push(`M${i} -10 L${i - 200} 190`)
  return (
    <g
      mask={mask ? `url(#${mask})` : undefined}
      clipPath={clip ? `url(#${clip})` : undefined}
      className="animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationDuration: '600ms' }}
      opacity={opacity}
    >
      <g transform={`rotate(${angle - 45} 160 90)`} stroke={color} strokeWidth={width} fill="none">
        {lines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  )
}
