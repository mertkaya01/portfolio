import { HAND, INK, loop, sketchBox, useSceneTime, wobbly } from './pencil'
import { Hatch, Paper, Strokes } from './sketch'

// "A full year of preparing for the university entrance exam." Night, at the desk, drawn in
// pencil: the screen's light, two mugs, a stack of TYT / AYT test books, papers — and Mert in
// profile, one hand in his hair, the other writing. On the wall a calendar fills up with
// crosses, day after day. (The composition follows a study-at-night photo Mert chose; the
// figure is Mert himself: swept-back dark hair, as in his photos.)
// Everything that matters stays between x 70 and 249.

const DESK_Y = 122
const CAL = { x: 206, y: 14, w: 40, h: 46, cols: 7, rows: 4 }
const CROSSES = 24
const CROSS_START = 1.6 // s
const CROSS_EACH = 0.14

export function PrepScene() {
  const t = useSceneTime(24)
  const crosses = Math.max(0, Math.min(CROSSES, Math.floor((t - CROSS_START) / CROSS_EACH) + 1))
  const write = t > 1.4 ? Math.sin(t * 18) * 0.8 : 0 // the pencil hand moves as he writes

  return (
    <>
      <Paper />
      {/* night: hatching all round, a soft clearing where the screen lights the desk */}
      <defs>
        <radialGradient id="prep-light" cx="0.4" cy="0.6" r="0.6">
          <stop offset="0.35" stopColor="black" />
          <stop offset="1" stopColor="white" />
        </radialGradient>
        <mask id="prep-night" maskUnits="userSpaceOnUse">
          <rect width="320" height="180" fill="url(#prep-light)" />
        </mask>
      </defs>
      <Hatch mask="prep-night" gap={2} delay={300} />
      <Hatch mask="prep-night" gap={3} angle={-35} delay={600} opacity={0.5} />

      <g filter="url(#sketch-pencil)">
        {/* the desk */}
        <Strokes
          paths={[
            wobbly(36, DESK_Y, 292, DESK_Y, 1),
            wobbly(36, DESK_Y + 1, 292, DESK_Y + 1, 2, 1.2),
            wobbly(36, DESK_Y + 9, 292, DESK_Y + 9, 3),
          ]}
          each={400}
          width={0.9}
        />
        {/* the screen on the left: frame, stand, a few lines of a test on it */}
        <Strokes
          paths={[
            ...sketchBox(62, 62, 56, 44, 10),
            wobbly(90, 106, 90, DESK_Y - 2, 11),
            wobbly(78, DESK_Y - 1, 102, DESK_Y - 1, 12),
          ]}
          delay={300}
          each={200}
        />
        <Strokes
          paths={[66, 72, 78, 84, 90, 96].map((y, i) =>
            wobbly(68, y, 68 + 20 + ((i * 13) % 22), y, 20 + i, 0.4),
          )}
          delay={900}
          each={120}
          width={0.5}
          color={INK.soft}
        />
        {/* two mugs */}
        <Strokes
          paths={[
            'M124 106 L124 120 Q130 123 136 120 L136 106',
            wobbly(124, 106, 136, 106, 30),
            loop(139, 112, 3, 31),
            'M141 109 L141 120 Q146 123 151 120 L151 109',
            wobbly(141, 109, 151, 109, 32),
          ]}
          delay={700}
          each={180}
          width={0.7}
        />
        {/* papers on the desk */}
        <Strokes
          paths={[
            'M128 121 L136 113 L182 113 L176 121',
            wobbly(140, 116, 170, 116, 40, 0.4),
            wobbly(138, 118.5, 166, 118.5, 41, 0.4),
          ]}
          delay={1000}
          each={160}
          width={0.6}
        />
        {/* the stack of test books on the right */}
        <Strokes
          paths={[
            ...sketchBox(214, 112, 42, 9, 50).slice(0, 4),
            ...sketchBox(218, 103, 36, 9, 51).slice(0, 4),
            ...sketchBox(212, 94, 40, 9, 52).slice(0, 4),
            ...sketchBox(220, 86, 30, 8, 53).slice(0, 4),
          ]}
          delay={800}
          each={140}
          width={0.7}
        />
      </g>
      {[
        ['TYT', 235, 119],
        ['AYT', 236, 110],
        ['TYT', 232, 101],
        ['AYT', 235, 92.5],
      ].map(([label, x, y]) => (
        <text
          key={`${label}${y}`}
          x={x}
          y={y}
          fontSize={6.5}
          fontFamily={HAND}
          fontWeight={700}
          textAnchor="middle"
          fill={INK.graphite}
          className="animate-fade-in"
          style={{ animationDelay: '1300ms' }}
        >
          {label}
        </text>
      ))}

      {/* Mert, in profile, facing the screen */}
      <Mert write={write} />

      {/* the calendar on the wall: a grid of days, crossed out one by one */}
      <g filter="url(#sketch-pencil)">
        <Strokes
          paths={[
            ...sketchBox(CAL.x, CAL.y, CAL.w, CAL.h, 60),
            wobbly(CAL.x, CAL.y + 8, CAL.x + CAL.w, CAL.y + 8, 61),
            wobbly(CAL.x + 6, CAL.y + 4, CAL.x + 30, CAL.y + 4, 62, 0.4),
          ]}
          delay={500}
          each={180}
          width={0.6}
        />
        {Array.from({ length: CAL.cols * CAL.rows }, (_, i) => {
          const cw = CAL.w / CAL.cols
          const ch = (CAL.h - 10) / CAL.rows
          const x = CAL.x + (i % CAL.cols) * cw
          const y = CAL.y + 10 + Math.floor(i / CAL.cols) * ch
          return (
            <g key={i}>
              <rect
                x={x + 0.6}
                y={y + 0.6}
                width={cw - 1.2}
                height={ch - 1.2}
                fill="none"
                stroke={INK.soft}
                strokeWidth={0.3}
              />
              {i < crosses && (
                <path
                  d={`M${x + 1.2} ${y + 1.2} L${x + cw - 1.2} ${y + ch - 1.2} M${x + cw - 1.2} ${y + 1.2} L${x + 1.2} ${y + ch - 1.2}`}
                  stroke={INK.graphite}
                  strokeWidth={0.6}
                />
              )}
            </g>
          )
        })}
      </g>
    </>
  )
}

// Mert's hair, after his photos: thick, swept back from a lifted front lock, full at the
// back, down to the nape. Drawn as a pencil tone with a light band where it shines, and the
// darker lines between its locks.
const HAIR =
  'M171.5 53.5 C170.5 49 171.5 45 174 43.5 C178 40 186 38.8 192 41 C198 43.2 201.5 49 201 56 C200.6 63 198.5 70 194.5 76 L192 72 C190.5 68 190 64 188.5 61.5 C186 59 182 58 178.5 57.5 C175.5 57 173 56 171.5 53.5 Z'
const LOCKS = [
  'M171.5 53.5 C170 47 174 42.5 180 41.5', // the front lock, lifted
  'M173 50 C178 43 188 42 197 48',
  'M174.5 53 C181 47 190 47 199 55',
  'M178 56 C185 51 193 52 199.5 62',
  'M185 58.5 C191 57 195 60 197 70',
  'M189 63 C192 65 193.5 70 193.5 75',
  'M194.5 76 L196.5 79.5', // ends at the nape
  'M198 69 L201 71.5',
]

// Mert at the desk, in profile, facing left — drawn after his photos: thick dark hair swept
// back, falling to the nape; strong brows, a straight nose, a clear jawline; a black jacket over
// a white T-shirt, a thin silver chain. No beard yet (this is the year after high school).
// Both forearms on the desk, writing. The jacket is shaded with hatching.
function Mert({ write }: { write: number }) {
  return (
    <>
      <defs>
        <clipPath id="prep-jacket">
          <path d="M177 84 Q186 80 193 82 Q203 98 204 122 L172 122 Q172 104 177 84 Z" />
          <path d="M190 90 Q184 106 180 120 L188 121 Q192 106 197 94 Z" />
          <path d="M176 92 Q162 106 150 117 L154 120 Q166 111 181 97 Z" />
        </clipPath>
      </defs>
      {/* the hair: a pencil tone, lighter where the light catches it on top */}
      <g
        className="animate-fade-in"
        style={{ animationDelay: '1000ms', animationDuration: '700ms' }}
      >
        <path d={HAIR} fill={INK.graphite} opacity={0.5} filter="url(#sketch-pencil)" />
        <path
          d="M175 46.5 C181 41.8 189 41.6 196 45.5"
          fill="none"
          stroke={INK.paper}
          strokeWidth={2.2}
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>
      {/* the jacket (dark), shaded */}
      <Hatch
        clip="prep-jacket"
        gap={1.1}
        angle={50}
        delay={1200}
        color={INK.graphite}
        width={0.4}
        opacity={0.85}
      />
      <g filter="url(#sketch-pencil)">
        <Strokes
          paths={[
            // the face in profile: forehead, brow, straight nose, lips, chin, the jawline
            'M171.5 54 Q170.6 56.5 169.6 58.6 Q169.4 60 168.9 60.6 L165.6 64.6 Q166.6 65.6 168.4 65.6 Q168 66.6 168.2 67.2 L169.2 67.8 L168.5 68.8 Q168.6 71 169.6 72.4 Q170.8 74.6 173 74.8 Q178 76 181.5 75.4 Q184 74 184.8 70.6',
            HAIR,
            // the ear, half under the hair
            'M184.6 61.6 Q188.4 61 188.2 65.4 Q188 69 185 69.2',
            'M185.8 63.4 Q187 64.8 185.8 66.6',
            // the neck, the T-shirt's collar, the jacket
            'M178.6 75.6 Q178.4 79 177.6 82',
            'M191.5 72 Q191 77 192.5 82',
            'M176.5 82.5 Q184.5 86 193 82',
            'M177 84 Q172 104 172 122',
            'M172 86 Q166 104 166 122',
            'M193 82 Q203 98 204 122',
          ]}
          delay={600}
          each={200}
          width={0.8}
        />
        {/* the lines between the locks of hair */}
        <Strokes paths={LOCKS} delay={1300} each={160} width={0.7} />
        {/* strong brows and the eye */}
        <Strokes
          paths={['M169.8 57.6 Q172.5 56.4 175.6 57.4']}
          delay={1300}
          each={200}
          width={1.2}
        />
        <Strokes paths={['M170.4 60.2 Q172 59.4 173.6 60.2']} delay={1400} each={180} width={0.6} />
        {/* the other arm: down to the desk, the forearm resting on it, the hand on the paper */}
        <Strokes
          paths={[
            'M190 90 Q184 106 180 120',
            'M197 94 Q192 106 188 121',
            'M180 120.5 L164 121',
            'M164 121 Q160 119.5 162 117.5 Q166 116 168 118',
          ]}
          delay={1000}
          each={200}
          width={0.8}
        />
        {/* the writing arm along the desk, the pencil in the hand */}
        <Strokes
          paths={[
            'M176 92 Q162 106 150 117',
            'M181 97 Q166 111 154 120',
            'M150 117 Q146 119 148 121.5 Q152 122.5 154 120',
            `M148 118 L${140 + write} ${112 + write * 0.5}`,
          ]}
          delay={1200}
          each={200}
          width={0.8}
        />
        {/* the back of the chair */}
        <Strokes
          paths={[wobbly(206, 92, 208, 160, 80), wobbly(210, 92, 212, 160, 81)]}
          delay={1300}
          each={240}
          width={0.7}
          color={INK.soft}
        />
      </g>
      {/* the eye's dark iris, and the thin silver chain (dotted) */}
      <circle
        cx={171.8}
        cy={60.7}
        r={0.7}
        fill={INK.graphite}
        className="animate-fade-in"
        style={{ animationDelay: '1500ms' }}
      />
      <path
        d="M178 82.6 Q184.5 88 191.8 82.6"
        fill="none"
        stroke="#9a958d"
        strokeWidth={0.5}
        strokeDasharray="0.6 0.5"
        className="animate-fade-in"
        style={{ animationDelay: '1600ms' }}
      />
    </>
  )
}
