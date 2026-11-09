import { INK, loop, sketchBox, wobbly } from './pencil'
import { Paper, Strokes, Written } from './sketch'

// Set 2's scoreboard, drawn in pencil on a sketchbook page: the box hangs on two strings, the
// lines draw themselves, then the writing appears — SET, a big 2 with a yellow highlighter
// mark behind it, the title, the years — and a couple of doodles in the margin.
// Everything stays between x 70 and 249 (what a phone keeps).
export function SketchScoreboard({
  set,
  title,
  period,
}: {
  set: number
  title: string
  period: string
}) {
  const box = { x: 74, y: 34, w: 172, h: 112 }
  return (
    <>
      <Paper />
      <g filter="url(#sketch-pencil)">
        {/* the two strings it hangs from, and the box itself */}
        <Strokes
          paths={[wobbly(100, 4, 102, box.y, 1), wobbly(220, 4, 218, box.y, 2)]}
          each={260}
          width={0.6}
          color={INK.soft}
        />
        <Strokes
          paths={sketchBox(box.x, box.y, box.w, box.h, 7)}
          delay={200}
          each={260}
          width={0.9}
        />
        {/* screws in the corners, the dividers between the rows */}
        <Strokes
          paths={[
            loop(box.x + 6, box.y + 6, 1.6, 21),
            loop(box.x + box.w - 6, box.y + 6, 1.6, 22),
            loop(box.x + 6, box.y + box.h - 6, 1.6, 23),
            loop(box.x + box.w - 6, box.y + box.h - 6, 1.6, 24),
            wobbly(box.x + 12, 92, box.x + box.w - 12, 92, 31),
            wobbly(box.x + 12, 120, box.x + box.w - 12, 120, 32),
          ]}
          delay={1000}
          each={160}
          width={0.6}
        />
      </g>

      {/* a yellow highlighter swipe behind the number, as if marked by hand */}
      <path
        d="M146 70 Q160 64 178 69 L176 80 Q160 76 145 81 Z"
        fill={INK.marker}
        opacity={0.75}
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'left',
          animation: 'step-fill 300ms ease-out 1700ms both',
        }}
      />
      <Written x={128} y={78} size={13} delay={1200} duration={350} id="sb-set">
        SET
      </Written>
      <Written x={162} y={84} size={36} delay={1450} duration={300} id="sb-num" weight={700}>
        {String(set)}
      </Written>
      <Written x={160} y={112} size={17} delay={2000} duration={800} id="sb-title" weight={700}>
        {title}
      </Written>
      <Written x={160} y={137} size={14} delay={2900} duration={500} id="sb-period">
        {period}
      </Written>

      {/* doodles: an arrow to the number, a little star */}
      <g filter="url(#sketch-pencil)">
        <Strokes
          paths={[
            'M206 62 Q196 58 186 66',
            'M186 66 L190 60',
            'M186 66 L192 67',
            'M100 52 L104 60 L96 55 L106 55 L98 60 Z',
          ]}
          delay={3500}
          each={180}
          width={0.6}
          color={INK.soft}
        />
      </g>
    </>
  )
}
