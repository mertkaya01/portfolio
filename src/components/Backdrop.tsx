import { m, useScroll, useTransform } from 'motion/react'

// A fixed layer behind the whole site: an arena seen from above, barely visible.
// Light beams from the ceiling, the court lines (net and attack lines slowly pulse)
// and small lights at the corners and net posts that twinkle now and then.

// Court drawn to scale (18 m × 9 m → 1400 × 700 units), centered in a 1600 × 1000 canvas
const COURT = { x: 100, y: 150, w: 1400, h: 700 }
const NET_X = 800
const ATTACK_OFFSET = COURT.w / 6 // the 3 m line: a third of each 9 m half

// Twinkling points: corners, net posts, attack-line ends. Each blinks on its own rhythm.
const LIGHTS = [
  [COURT.x, COURT.y],
  [COURT.x + COURT.w, COURT.y],
  [COURT.x, COURT.y + COURT.h],
  [COURT.x + COURT.w, COURT.y + COURT.h],
  [NET_X, COURT.y - 40],
  [NET_X, COURT.y + COURT.h + 40],
  [NET_X - ATTACK_OFFSET, COURT.y],
  [NET_X + ATTACK_OFFSET, COURT.y + COURT.h],
  [NET_X + ATTACK_OFFSET, COURT.y],
  [NET_X - ATTACK_OFFSET, COURT.y + COURT.h],
]

// Beams fan out from three ceiling lights
const BEAMS = [
  [400, 0, 120, 1000],
  [400, 0, 640, 1000],
  [800, 0, 560, 1000],
  [800, 0, 1040, 1000],
  [1200, 0, 960, 1000],
  [1200, 0, 1480, 1000],
]

// Tiny static grain, drawn by an SVG noise filter (no image file to download)
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Backdrop() {
  // Drifts up a little as you scroll the whole page: it moves slower than the content → depth
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 animate-backdrop-in overflow-hidden [view-transition-name:backdrop]"
    >
      <m.svg
        style={{ y }}
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-x-0 top-0 h-[115%] w-full"
        fill="none"
        stroke="white"
      >
        {/* Ceiling light beams */}
        <g strokeOpacity="0.03">
          {BEAMS.map(([x1, y1, x2, y2]) => (
            <line
              key={`${x1}-${x2}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {/* The court outline */}
        <rect
          x={COURT.x}
          y={COURT.y}
          width={COURT.w}
          height={COURT.h}
          strokeOpacity="0.06"
          vectorEffect="non-scaling-stroke"
        />

        {/* Net and attack lines: slowly pulse, each on a different beat */}
        <line
          x1={NET_X}
          y1={COURT.y - 40}
          x2={NET_X}
          y2={COURT.y + COURT.h + 40}
          strokeOpacity="0.12"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className="animate-line-pulse"
        />
        {[-1, 1].map((side) => (
          <line
            key={side}
            x1={NET_X + side * ATTACK_OFFSET}
            y1={COURT.y}
            x2={NET_X + side * ATTACK_OFFSET}
            y2={COURT.y + COURT.h}
            strokeOpacity="0.08"
            vectorEffect="non-scaling-stroke"
            className="animate-line-pulse"
            style={{ animationDelay: side < 0 ? '-2.3s' : '-4.6s' }}
          />
        ))}

        {/* Twinkling lights */}
        {LIGHTS.map(([cx, cy], i) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="2.5"
            fill="white"
            stroke="none"
            className="animate-twinkle"
            style={{ animationDuration: `${5 + (i % 4) * 1.7}s`, animationDelay: `${-i * 1.3}s` }}
          />
        ))}
      </m.svg>

      {/* Film grain over everything */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  )
}
