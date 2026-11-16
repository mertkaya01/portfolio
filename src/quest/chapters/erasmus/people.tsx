import type { CSSProperties } from 'react'

import { FLAT, type Look } from './flat'

// The light comes from the top left (as everywhere in the chapter), so every figure carries a
// flat shade on its right side: the same shape, a cool violet, see-through — hue-shifted
// shadow, never black. And everyone breathes, very slightly, each at their own moment.
const SHADE = '#2b2f6b'
const breathe = (x: number): CSSProperties => ({
  transformBox: 'fill-box',
  transformOrigin: 'bottom',
  animation: `flat-breathe 3.6s ease-in-out ${-((x * 37) % 3600)}ms infinite`,
})

// Flat vector people for Set 4: no outlines and no faces — a round head, hair as one shape, a
// body, legs. Mert is the one with his long dark hair tied back and the white jacket, as in his
// Erasmus photos. Everyone else gets their own hair, skin and clothes.
// Standing, seen a little from the side (facing right), feet at (x, y). Height about 40 units.
export function Standing({ x, y, look }: { x: number; y: number; look: Look }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={9} ry={2} fill="black" opacity={0.15} />
      {/* legs */}
      <rect x={-5} y={-16} width={4.4} height={16} rx={2} fill={look.legs ?? FLAT.navy} />
      <rect x={0.6} y={-16} width={4.4} height={16} rx={2} fill={look.legs ?? FLAT.navy} />
      <rect x={0.6} y={-16} width={4.4} height={16} rx={2} fill={SHADE} opacity={0.18} />
      <g style={breathe(x)}>
        {/* a puffy jacket: body and arm */}
        <rect x={-7.5} y={-31} width={15} height={17} rx={5} fill={look.top} />
        <rect x={1.5} y={-31} width={6} height={17} rx={4} fill={SHADE} opacity={0.12} />
        <rect x={-7.5} y={-24} width={15} height={1.2} fill="black" opacity={0.06} />
        <rect x={-7.5} y={-19} width={15} height={1.2} fill="black" opacity={0.06} />
        <rect
          x={1.5}
          y={-29}
          width={5}
          height={13}
          rx={2.5}
          fill={look.top}
          stroke="black"
          strokeOpacity={0.08}
        />
        <Head x={1} y={-36} look={look} facing="side" />
      </g>
    </g>
  )
}

// Seated at a table, seen from behind: head and shoulders
export function SeatedBack({ x, y, look }: { x: number; y: number; look: Look }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g style={breathe(x)}>
        <rect x={-9} y={-8} width={18} height={14} rx={6} fill={look.top} />
        <rect x={1} y={-8} width={8} height={14} rx={5} fill={SHADE} opacity={0.12} />
        <Head x={0} y={-13} look={look} facing="back" />
      </g>
    </g>
  )
}

// Seated at a table, seen from the front or a little from the side (no face drawn)
export function SeatedFront({ x, y, look }: { x: number; y: number; look: Look }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g style={breathe(x + 11)}>
        <rect x={-9} y={-8} width={18} height={14} rx={6} fill={look.top} />
        <rect x={1} y={-8} width={8} height={14} rx={5} fill={SHADE} opacity={0.12} />
        <Head x={0} y={-13} look={look} facing="front" />
      </g>
    </g>
  )
}

function Head({
  x,
  y,
  look,
  facing,
}: {
  x: number
  y: number
  look: Look
  facing: 'side' | 'back' | 'front'
}) {
  const { hair, style, skin } = look
  const r = 5.5
  return (
    <g transform={`translate(${x} ${y})`}>
      {style === 'long' && <rect x={-6.5} y={-3} width={13} height={12} rx={4} fill={hair} />}
      <rect x={-1.6} y={3.5} width={3.2} height={3} fill={skin} /> {/* neck */}
      <circle r={r} fill={facing === 'back' ? hair : skin} />
      {facing !== 'back' && (
        // the hair from the front / side: a cap over the top, swept back
        <path
          d={
            facing === 'side'
              ? `M${-r} 0.5 Q${-r - 0.5} ${-r - 1.5} 0 ${-r - 1} Q${r} ${-r} ${r * 0.5} ${-r * 0.35} Q0 ${-r * 0.8} ${-r * 0.6} 0.8 Z`
              : `M${-r} 0.8 Q${-r} ${-r - 1.4} 0 ${-r - 1} Q${r} ${-r - 1.4} ${r} 0.8 Q${r * 0.5} ${-r * 0.5} 0 ${-r * 0.55} Q${-r * 0.5} ${-r * 0.5} ${-r} 0.8 Z`
          }
          fill={hair}
        />
      )}
      {style === 'bun' && (
        <circle cx={facing === 'side' ? -r : 0} cy={-r * 0.9} r={2.4} fill={hair} />
      )}
      {style === 'curly' &&
        [-4, -1.5, 1.5, 4].map((cx) => (
          <circle key={cx} cx={cx} cy={-r + 0.5} r={2.2} fill={hair} />
        ))}
    </g>
  )
}

// The little yellow marker over Mert's head, like in the other sets
export function Marker({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 3.5} ${y - 5} L${x + 3.5} ${y - 5} L${x} ${y} Z`}
      fill={FLAT.star}
      stroke={FLAT.ink}
      strokeWidth={0.6}
      strokeLinejoin="round"
    />
  )
}
