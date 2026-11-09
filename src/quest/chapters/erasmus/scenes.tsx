import { useSceneTime } from '../../engine/useSceneTime'

import { DISPLAY, FLAT, MERT_LOOK, MONO, pop, slideUp, grow, star } from './flat'
import { Marker, SeatedBack, SeatedFront, Standing } from './people'
import { Sky } from './scoreboard'

// The scenes of Set 4, in flat vector. Everything that matters stays between x 70 and 249.

// ---------- Istanbul → Brandenburg an der Havel: the flight ----------
// A simple map: land in soft greens, the two cities with a landmark each (domes and minarets;
// a brick church tower), a dashed route, the plane flying it.

const FROM = { x: 222, y: 128 } // Istanbul
const TO = { x: 104, y: 56 } // Brandenburg an der Havel
const BOW = { x: 150, y: 58 } // the route bends up, like a flight path on a flat map
const routeAt = (p: number) => ({
  x: (1 - p) ** 2 * FROM.x + 2 * (1 - p) * p * BOW.x + p ** 2 * TO.x,
  y: (1 - p) ** 2 * FROM.y + 2 * (1 - p) * p * BOW.y + p ** 2 * TO.y,
})

export function MoveScene() {
  const t = useSceneTime(30)
  const p = Math.min(1, Math.max(0, (t - 0.8) / 2.4))
  const ease = p * p * (3 - 2 * p)
  const plane = routeAt(ease)
  const ahead = routeAt(Math.min(1, ease + 0.01))
  const angle = (Math.atan2(ahead.y - plane.y, ahead.x - plane.x) * 180) / Math.PI
  return (
    <>
      <rect width="320" height="180" fill="#bfe1f2" />
      {/* land: a few soft shapes, not a real coastline */}
      <path
        d="M0 20 Q60 6 120 18 Q170 28 210 16 Q260 4 320 14 L320 96 Q280 108 250 100 Q220 92 196 104 Q170 116 140 108 Q100 98 70 112 Q36 128 0 116 Z"
        fill="#cfe8c3"
      />
      <path
        d="M180 120 Q210 110 240 118 Q270 126 320 116 L320 180 L170 180 Q160 150 180 120 Z"
        fill="#cfe8c3"
      />
      <path d="M0 140 Q40 132 80 146 Q100 154 96 180 L0 180 Z" fill="#cfe8c3" />
      {/* the route, drawing itself */}
      <path
        d={`M${FROM.x} ${FROM.y} Q${BOW.x} ${BOW.y} ${TO.x} ${TO.y}`}
        fill="none"
        stroke={FLAT.navy}
        strokeWidth={1.1}
        strokeDasharray="3 3"
        opacity={0.7}
      />
      {/* Istanbul: domes and minarets */}
      <g style={pop(200)}>
        <circle cx={FROM.x} cy={FROM.y} r={3} fill={FLAT.brick} />
        <path
          d={`M${FROM.x - 12} ${FROM.y - 6} Q${FROM.x - 6} ${FROM.y - 20} ${FROM.x} ${FROM.y - 6} Z`}
          fill={FLAT.navy}
        />
        <rect x={FROM.x - 16} y={FROM.y - 22} width={1.6} height={16} fill={FLAT.navy} />
        <rect x={FROM.x + 2} y={FROM.y - 22} width={1.6} height={16} fill={FLAT.navy} />
        <text
          x={FROM.x + 8}
          y={FROM.y + 12}
          fontFamily={DISPLAY}
          fontWeight={800}
          fontSize={10}
          fill={FLAT.navy}
        >
          İstanbul
        </text>
      </g>
      {/* Brandenburg an der Havel: a brick church tower */}
      <g style={pop(400)}>
        <circle cx={TO.x} cy={TO.y} r={3} fill={FLAT.brick} />
        <rect x={TO.x - 18} y={TO.y - 18} width={7} height={14} fill={FLAT.brick} />
        <path
          d={`M${TO.x - 19} ${TO.y - 18} L${TO.x - 14.5} ${TO.y - 28} L${TO.x - 10} ${TO.y - 18} Z`}
          fill={FLAT.roof}
        />
        <text
          x={TO.x - 4}
          y={TO.y + 13}
          fontFamily={DISPLAY}
          fontWeight={800}
          fontSize={10}
          fill={FLAT.navy}
        >
          Brandenburg an der Havel
        </text>
      </g>
      {/* the plane */}
      <g transform={`translate(${plane.x} ${plane.y}) rotate(${angle})`}>
        <path
          d="M7 0 L-5 -1.6 L-7 -1 L-6 0 L-7 1 L-5 1.6 Z"
          fill={FLAT.white}
          stroke={FLAT.navy}
          strokeWidth={0.5}
        />
        <path d="M1 -1 L-2 -6 L-3.5 -6 L-2 -1 Z M1 1 L-2 6 L-3.5 6 L-2 1 Z" fill={FLAT.euBlue} />
      </g>
    </>
  )
}

// ---------- Six months by the Havel ----------
// After Mert's photo on the bridge: a deep blue sky, the river, bare trees on the far bank, a
// modern building on the right, the railing in front — and Mert in his white jacket, his long
// dark hair tied back, looking down the river.

export function HavelScene() {
  const t = useSceneTime(30)
  return (
    <>
      <Sky />
      {/* a cloud drifting */}
      <g transform={`translate(${((t * 6) % 360) - 40} 0)`} opacity={0.9}>
        <ellipse cx={60} cy={30} rx={18} ry={6} fill={FLAT.cloud} />
        <ellipse cx={72} cy={27} rx={12} ry={6} fill={FLAT.cloud} />
      </g>
      {/* the far bank: bare trees */}
      <rect y={92} width={320} height={10} fill="#8a9a6a" />
      {Array.from({ length: 16 }, (_, i) => {
        const x = 6 + i * 14 + (i % 3) * 3
        if (x > 236) return null
        const h = 18 + (i % 4) * 5
        return (
          <g
            key={i}
            stroke={FLAT.tree}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
            style={slideUp(100 + i * 30)}
          >
            <path d={`M${x} 96 L${x} ${96 - h}`} />
            <path d={`M${x} ${96 - h * 0.5} L${x - 5} ${96 - h * 0.8}`} />
            <path d={`M${x} ${96 - h * 0.6} L${x + 5} ${96 - h * 0.95}`} />
            <path d={`M${x} ${96 - h * 0.8} L${x - 3} ${96 - h * 1.05}`} />
          </g>
        )
      })}
      {/* the building on the right */}
      <g style={slideUp(300)}>
        <rect x={244} y={48} width={76} height={50} fill="#5d6f86" />
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 7 }, (_, c) => (
            <rect
              key={`${r}${c}`}
              x={248 + c * 10}
              y={52 + r * 9}
              width={7}
              height={5}
              fill={r % 2 ? '#a8c4e0' : '#cfe2f3'}
            />
          )),
        )}
      </g>
      {/* the river, its light moving */}
      <rect y={100} width={320} height={80} fill={FLAT.river} />
      {Array.from({ length: 14 }, (_, i) => {
        const y = 106 + i * 5
        const x = ((i * 37 + t * (8 + (i % 3) * 4)) % 340) - 20
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={14 + (i % 4) * 6}
            height={1.2}
            rx={0.6}
            fill={FLAT.riverLight}
            opacity={0.7}
          />
        )
      })}
      {/* a duck gliding by */}
      <g transform={`translate(${((t * 9) % 380) - 40} 128)`}>
        <ellipse cx={0} cy={0} rx={5} ry={2.4} fill="#6b5a4a" />
        <circle cx={4} cy={-2.2} r={1.8} fill="#2f6b4a" />
        <path d="M5.6 -2.2 L8 -1.6 L5.6 -1.2 Z" fill={FLAT.star} />
      </g>
      {/* the bridge's railing in front, and Mert at it */}
      <rect y={150} width={320} height={30} fill="#8e99a6" />
      <Standing x={140} y={151} look={MERT_LOOK} />
      <g fill="#b9c2cc">
        <rect y={130} width={320} height={2.4} />
        <rect y={138} width={320} height={1.6} />
        <rect y={144} width={320} height={1.6} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={i * 30 + 4} y={130} width={2.4} height={21} />
        ))}
      </g>
    </>
  )
}

// ---------- TH Brandenburg: computer science, and business ----------
// A lecture room in flat colours: on one screen code being written, on the other a business
// chart growing. Three students in front, seen from behind; Mert has the yellow marker.

export function CampusScene() {
  const t = useSceneTime(20)
  const code = ['class Team {', '  members = []', '  plan() {', '    return …', '  }', '}']
  const typedLines = Math.floor((t - 0.8) / 0.35)
  return (
    <>
      <rect width="320" height="180" fill="#e9e4da" />
      <rect y={128} width={320} height={52} fill="#c9bba4" />
      <text
        x={160}
        y={18}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight={800}
        fontSize={12}
        fill={FLAT.brick}
        style={slideUp(100)}
      >
        TH Brandenburg
      </text>
      {/* the code screen */}
      <g style={pop(300, 500)}>
        <rect x={74} y={28} width={82} height={58} rx={4} fill={FLAT.navy} />
        {code.map((line, i) =>
          i < typedLines ? (
            <text
              key={i}
              x={80}
              y={40 + i * 8}
              fontFamily={MONO}
              fontSize={5.4}
              fill={i % 2 ? '#7fd1b9' : FLAT.star}
            >
              {line}
            </text>
          ) : null,
        )}
      </g>
      {/* the business screen: bars growing, a trend line */}
      <g style={pop(500, 500)}>
        <rect x={164} y={28} width={82} height={58} rx={4} fill={FLAT.white} />
        {[18, 26, 22, 34, 40].map((h, i) => (
          <rect
            key={i}
            x={174 + i * 13}
            y={78 - h}
            width={8}
            height={h}
            rx={1.5}
            fill={i === 4 ? FLAT.brick : FLAT.euBlue}
            style={grow(1000 + i * 180)}
          />
        ))}
        <rect x={170} y={78} width={70} height={1} fill={FLAT.grey} />
      </g>
      {/* desks and three students in front */}
      <rect x={60} y={140} width={200} height={8} rx={2} fill="#8a6a4a" />
      <SeatedBack
        x={110}
        y={146}
        look={{ hair: FLAT.hair.blond, style: 'long', skin: FLAT.skin[3], top: '#5a8f6a' }}
      />
      <SeatedBack x={160} y={146} look={MERT_LOOK} />
      <SeatedBack
        x={210}
        y={146}
        look={{ hair: FLAT.hair.black, style: 'short', skin: FLAT.skin[2], top: '#c46a3a' }}
      />
      <Marker x={160} y={118} />
    </>
  )
}

// ---------- Team projects with international students ----------
// A round table, laptops, sticky notes on the wall, and hellos in several languages.

const TEAM = [
  {
    x: 112,
    y: 104,
    look: { hair: FLAT.hair.red, style: 'long' as const, skin: FLAT.skin[3], top: '#5b7fc4' },
    hi: 'Cześć!',
  },
  {
    x: 160,
    y: 96,
    look: { hair: FLAT.hair.black, style: 'curly' as const, skin: FLAT.skin[2], top: '#e0a23a' },
    hi: 'Hello!',
  },
  {
    x: 208,
    y: 104,
    look: { hair: FLAT.hair.blond, style: 'short' as const, skin: FLAT.skin[3], top: '#5a8f6a' },
    hi: 'Hallo!',
  },
]

export function TeamsScene() {
  return (
    <>
      <rect width="320" height="180" fill="#efe7d8" />
      {/* sticky notes on the wall */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={i}
          x={92 + (i % 5) * 28 + (i > 4 ? 14 : 0)}
          y={14 + (i > 4 ? 22 : 0)}
          width={16}
          height={16}
          fill={[FLAT.star, '#f4a3b4', '#9fd3f0'][i % 3]}
          transform={`rotate(${(i % 3) - 1} ${100 + (i % 5) * 28} ${22 + (i > 4 ? 22 : 0)})`}
          style={pop(200 + i * 90, 350)}
        />
      ))}
      {/* the people behind the table */}
      {TEAM.map((m, i) => (
        <SeatedFront key={i} x={m.x} y={m.y} look={m.look} />
      ))}
      {/* the table, laptops on it */}
      <ellipse cx={160} cy={128} rx={96} ry={26} fill="#a87c52" />
      <ellipse cx={160} cy={125} rx={96} ry={26} fill="#c4996a" />
      {[118, 160, 202].map((x, i) => (
        <g key={x}>
          <path
            d={`M${x - 10} 120 L${x + 10} 120 L${x + 12} 126 L${x - 12} 126 Z`}
            fill={FLAT.greyLight}
          />
          <rect
            x={x - 9}
            y={110}
            width={18}
            height={10}
            rx={1}
            fill={FLAT.grey}
            style={pop(400 + i * 100)}
          />
        </g>
      ))}
      {/* Mert and one more on our side of the table, seen from behind */}
      <SeatedBack x={136} y={156} look={MERT_LOOK} />
      <SeatedBack
        x={186}
        y={156}
        look={{ hair: FLAT.hair.brown, style: 'bun', skin: FLAT.skin[1], top: '#7a5ab0' }}
      />
      <Marker x={136} y={128} />
      {/* hellos, one after another */}
      {[...TEAM, { x: 136, y: 150, hi: 'Merhaba!' }, { x: 186, y: 150, hi: '¡Hola!' }].map(
        (m, i) => (
          <g key={m.hi} style={pop(1200 + i * 350, 400)}>
            <rect x={m.x - 18} y={m.y - 40} width={36} height={12} rx={6} fill={FLAT.white} />
            <path
              d={`M${m.x - 3} ${m.y - 28.5} L${m.x} ${m.y - 24} L${m.x + 3} ${m.y - 28.5} Z`}
              fill={FLAT.white}
            />
            <text
              x={m.x}
              y={m.y - 31.5}
              textAnchor="middle"
              fontFamily={DISPLAY}
              fontWeight={700}
              fontSize={7}
              fill={FLAT.navy}
            >
              {m.hi}
            </text>
          </g>
        ),
      )}
      {/* the Erasmus stars, small, in a corner of the wall */}
      <g style={pop(600)}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <path
              key={i}
              d={star(280 + Math.cos(a) * 8, 26 + Math.sin(a) * 8, 1.4)}
              fill={FLAT.star}
            />
          )
        })}
      </g>
    </>
  )
}
