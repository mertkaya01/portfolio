import { LineDraw } from './LineDraw'

// A volleyball court on the floor, seen from the stands, traced line by line.
// It is drawn in real proportions (9 m × 18 m) through a tiny pinhole camera:
// a point on the floor that is x metres to the side and z metres away lands on the screen at
//   x_screen = center + focal · x / distance,   y_screen = focal · height / distance
// — the further away, the closer to the horizon and the closer to the middle. That is all
// perspective is.

const VIEW = { width: 1600, height: 600 } // the SVG's own coordinate space; y = 0 is the horizon
// eye height (m), distance behind the near baseline (m), zoom. Far back with a long lens:
// the court looks flatter and sits low, under the title.
const CAMERA = { height: 3.67, back: 12, focal: 1840 }
const HALF_WIDTH = 4.5 // m — the court is 9 m wide…
const LENGTH = 18 // m — …and 18 m long; the net is at 9 m, the attack lines 3 m either side

function project(x: number, z: number) {
  const distance = z + CAMERA.back
  const sx = VIEW.width / 2 + (CAMERA.focal * x) / distance
  const sy = (CAMERA.focal * CAMERA.height) / distance
  return `${sx.toFixed(1)} ${sy.toFixed(1)}`
}

// A straight line on the floor
const floorLine = (x1: number, z1: number, x2: number, z2: number) =>
  `M${project(x1, z1)} L${project(x2, z2)}`

type Line = { d: string; delay: number; duration: number; strong?: boolean }

const LINES: Line[] = [
  // The two sidelines run away from you, from the near baseline to the far one
  ...[-HALF_WIDTH, HALF_WIDTH].map((x) => ({
    d: floorLine(x, 0, x, LENGTH),
    delay: 0,
    duration: 1300,
  })),
  // The lines across the court, near to far, each drawn from the middle outwards:
  // baseline, attack line, center line (under the net), attack line, far baseline
  ...[0, 6, 9, 12, LENGTH].flatMap((z, i) =>
    [-HALF_WIDTH, HALF_WIDTH].map((x) => ({
      d: floorLine(0, z, x, z),
      delay: 250 + i * 150,
      duration: 700,
      strong: z === LENGTH / 2,
    })),
  ),
]

type Props = {
  start?: number // ms before the first line starts
  className?: string
}

export function CourtFloor({ start = 0, className = '' }: Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      // slice: always fills the box; on narrow screens the sides are cut, the middle stays
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {LINES.map((line) => (
        <LineDraw
          key={line.d}
          d={line.d}
          delay={start + line.delay}
          duration={line.duration}
          strokeWidth={line.strong ? 2.5 : 1.5}
          className={line.strong ? 'stroke-wood/80' : 'stroke-wood/45'}
        />
      ))}
    </svg>
  )
}
