import { INK, loop, useSceneTime, wobbly } from './pencil'
import { Hatch, Paper, Strokes } from './sketch'

// "Exam day." The exam hall seen from the back, in pencil: rows of single desks going away
// towards the front wall, everyone bent over their paper (seen from behind: no faces), the
// proctor's desk, and the big clock on the wall — its hands racing. Mert is circled with the
// yellow highlighter. Everything that matters stays between x 70 and 249.

const VANISH = { x: 160, y: 30 } // where the lines of the floor meet
const ROWS = [
  { y: 72, scale: 0.62 },
  { y: 102, scale: 0.8 },
  { y: 140, scale: 1 },
]
const COLS = [-1.5, -0.5, 0.5, 1.5] // desks left and right of the middle, in desk widths
const MERT_SEAT = { row: 1, col: 1 }

// a desk's middle on screen: spread out more in the nearer rows
const seatX = (col: number, scale: number) => 160 + COLS[col] * 58 * scale

export function ExamDayScene() {
  const t = useSceneTime(24)
  const minute = t * 220 // degrees: the minute hand races round
  const hour = t * 18
  const mert = { x: seatX(MERT_SEAT.col, ROWS[MERT_SEAT.row].scale), y: ROWS[MERT_SEAT.row].y }

  return (
    <>
      <Paper />
      <g filter="url(#sketch-pencil)">
        {/* the front wall, the floor lines running to it */}
        <Strokes
          paths={[
            wobbly(20, 50, 300, 50, 1),
            wobbly(20, 51, 300, 51, 2, 1.2),
            wobbly(VANISH.x - 60, 50, 10, 180, 3),
            wobbly(VANISH.x + 60, 50, 310, 180, 4),
            wobbly(VANISH.x - 20, 50, 100, 180, 5, 0.4),
            wobbly(VANISH.x + 20, 50, 220, 180, 6, 0.4),
          ]}
          each={300}
          width={0.7}
          color={INK.soft}
        />
        {/* the clock on the wall */}
        <Strokes
          paths={[loop(160, 26, 13, 10), loop(160, 26, 12, 11)]}
          delay={300}
          each={300}
          width={0.9}
        />
        <g stroke={INK.graphite} strokeLinecap="round">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2
            return (
              <path
                key={i}
                d={`M${160 + Math.sin(a) * 10} ${26 - Math.cos(a) * 10} L${160 + Math.sin(a) * 11.4} ${26 - Math.cos(a) * 11.4}`}
                strokeWidth={0.6}
              />
            )
          })}
          <path d="M160 26 L160 17" strokeWidth={0.9} transform={`rotate(${minute} 160 26)`} />
          <path d="M160 26 L160 20.5" strokeWidth={1.3} transform={`rotate(${hour} 160 26)`} />
        </g>
        {/* the proctor's desk at the front, papers on it */}
        <Strokes
          paths={[
            wobbly(56, 58, 104, 58, 20),
            wobbly(56, 58, 54, 66, 21),
            wobbly(104, 58, 106, 66, 22),
            wobbly(54, 66, 106, 66, 23),
            wobbly(64, 56, 80, 56, 24, 0.3),
          ]}
          delay={600}
          each={160}
          width={0.7}
        />
      </g>

      {/* the candidates, row by row from the front of the hall to the back of it */}
      {ROWS.map((row, r) =>
        COLS.map((_, c) => (
          <Candidate
            key={`${r}${c}`}
            x={seatX(c, row.scale)}
            y={row.y}
            scale={row.scale}
            seed={r * 10 + c}
            delay={900 + (2 - r) * 250}
            mert={r === MERT_SEAT.row && c === MERT_SEAT.col}
          />
        )),
      )}

      {/* Mert: a yellow highlighter loop around him */}
      <path
        d={loop(mert.x, mert.y - 14 * 0.8, 15, 99)}
        fill="none"
        stroke={INK.marker}
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.85}
        pathLength={1}
        strokeDasharray="1 1"
        className="animate-draw-path"
        style={{ animationDelay: '2000ms', animationDuration: '600ms' }}
      />
    </>
  )
}

// One candidate at a desk, seen from behind and a little above: the desk top in front, the
// head bent over it, the shoulders, a dark jumper
function Candidate({
  x,
  y,
  scale,
  seed,
  delay,
  mert = false,
}: {
  x: number
  y: number
  scale: number
  seed: number
  delay: number
  mert?: boolean // Mert: his thick hair swept back to the nape, his black jacket
}) {
  const s = scale
  const head = { x: x + (seed % 2 ? 1 : -1) * s, y: y - 16 * s }
  const clip = `cand-${seed}`
  // from behind, Mert's hair: fuller, down to the collar, strands running back
  const hair = mert
    ? [
        `M${head.x - 6.5 * s} ${head.y} Q${head.x - 6 * s} ${head.y - 7.5 * s} ${head.x} ${head.y - 7.5 * s} Q${head.x + 6 * s} ${head.y - 7.5 * s} ${head.x + 6.5 * s} ${head.y} Q${head.x + 6 * s} ${head.y + 6.5 * s} ${head.x} ${head.y + 7.5 * s} Q${head.x - 6 * s} ${head.y + 6.5 * s} ${head.x - 6.5 * s} ${head.y} Z`,
        `M${head.x - 3 * s} ${head.y - 6 * s} Q${head.x - 2 * s} ${head.y} ${head.x - 3 * s} ${head.y + 6 * s}`,
        `M${head.x + 1 * s} ${head.y - 7 * s} Q${head.x + 2 * s} ${head.y} ${head.x + 1 * s} ${head.y + 7 * s}`,
        `M${head.x + 4 * s} ${head.y - 5 * s} Q${head.x + 5 * s} ${head.y} ${head.x + 4 * s} ${head.y + 6 * s}`,
      ]
    : [loop(head.x, head.y, 6 * s, seed + 50)]
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path
            d={`M${x - 11 * s} ${y + 4 * s} Q${x - 10 * s} ${y - 8 * s} ${x} ${y - 9 * s} Q${x + 10 * s} ${y - 8 * s} ${x + 11 * s} ${y + 4 * s} Z`}
          />
          <circle cx={head.x} cy={head.y} r={6 * s} />
        </clipPath>
      </defs>
      <g filter="url(#sketch-pencil)">
        {/* the desk top, in front of them */}
        <Strokes
          paths={[
            wobbly(x - 16 * s, y - 20 * s, x + 16 * s, y - 20 * s, seed),
            wobbly(x - 18 * s, y - 8 * s, x + 18 * s, y - 8 * s, seed + 1),
            wobbly(x - 16 * s, y - 20 * s, x - 18 * s, y - 8 * s, seed + 2),
            wobbly(x + 16 * s, y - 20 * s, x + 18 * s, y - 8 * s, seed + 3),
          ]}
          delay={delay}
          each={120}
          width={0.6}
        />
      </g>
      {/* the head and shoulders, shaded */}
      <Hatch
        clip={clip}
        gap={mert ? 0.9 * s + 0.3 : 1.3 * s + 0.4}
        angle={40}
        delay={delay + 300}
        color={INK.graphite}
        width={0.4}
        opacity={mert ? 0.95 : 0.75}
      />
      <g filter="url(#sketch-pencil)">
        <Strokes
          paths={[
            ...hair,
            `M${x - 11 * s} ${y + 4 * s} Q${x - 10 * s} ${y - 8 * s} ${x} ${y - 9 * s} Q${x + 10 * s} ${y - 8 * s} ${x + 11 * s} ${y + 4 * s}`,
          ]}
          delay={delay + 150}
          each={160}
          width={0.7}
        />
      </g>
    </>
  )
}
