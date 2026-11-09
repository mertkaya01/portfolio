import { INK, loop, rand, sketchBox, useSceneTime, wobbly } from './pencil'
import { Paper, Strokes } from './sketch'

// "Practice tests. Optical forms. Pencil marks in tiny circles." A practice-exam answer sheet
// on the desk, drawn in pencil: its printed pink guides, two columns of questions with five
// circles each (A–E). A pencil goes down the sheet and fills one circle per question.
// (The same forms come back in Set 3: the kid who filled them builds software that reads them.)

const FORM = { x: 92, y: 10, w: 136, h: 162 }
const COLS = [102, 166] // left edge of each column of questions
const ROW = { first: 46, step: 12.4 }
const BUBBLE = { dx: 8, r: 2.7, first: 12 }
const QUESTIONS = 20
const START = 0.7 // s: the sheet is drawn first
const EACH = 0.16 // s per question

const answer = (q: number) => Math.floor(rand(q * 7 + 3) * 5)
function bubbleAt(q: number, choice: number) {
  const col = COLS[Math.floor(q / 10)]
  return { x: col + BUBBLE.first + choice * BUBBLE.dx, y: ROW.first + (q % 10) * ROW.step }
}

export function MocksScene() {
  const t = useSceneTime(24)
  const done = Math.max(0, Math.min(QUESTIONS, Math.floor((t - START) / EACH)))
  const current = Math.min(QUESTIONS - 1, done)
  const finished = t > START + QUESTIONS * EACH + 0.3
  const tip = bubbleAt(current, answer(current))
  // while filling, the tip makes small circles; when the sheet is done it lifts away
  const wiggle = finished ? { x: 18, y: -10 } : { x: Math.cos(t * 40), y: Math.sin(t * 40) * 0.8 }

  return (
    <>
      <Paper tint={INK.shade} />
      {/* the desk: a few soft hatch lines in the corners */}
      <g stroke={INK.soft} strokeWidth={0.4} opacity={0.5}>
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={wobbly(10 + i * 5, 176, 30 + i * 5, 150, i)} fill="none" />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`r${i}`} d={wobbly(250 + i * 5, 30, 270 + i * 5, 4, i + 40)} fill="none" />
        ))}
      </g>

      <g transform="rotate(-3 160 92)">
        {/* the sheet, a little shadow under it */}
        <rect
          x={FORM.x + 3}
          y={FORM.y + 3}
          width={FORM.w}
          height={FORM.h}
          fill={INK.soft}
          opacity={0.25}
        />
        <rect x={FORM.x} y={FORM.y} width={FORM.w} height={FORM.h} fill={INK.paper} />
        <g filter="url(#sketch-pencil)">
          <Strokes paths={sketchBox(FORM.x, FORM.y, FORM.w, FORM.h, 5)} each={180} width={0.8} />
        </g>

        {/* the printed part, in pink: a header band, the name box, the column titles */}
        <rect
          x={FORM.x + 6}
          y={FORM.y + 6}
          width={FORM.w - 12}
          height={18}
          fill="none"
          stroke={INK.pink}
          strokeWidth={0.6}
        />
        <rect
          x={FORM.x + 10}
          y={FORM.y + 10}
          width={60}
          height={10}
          fill="none"
          stroke={INK.pink}
          strokeWidth={0.5}
        />
        <path
          d={wobbly(FORM.x + 14, FORM.y + 16, FORM.x + 60, FORM.y + 15, 11, 1.2)}
          stroke={INK.graphite}
          strokeWidth={0.6}
          fill="none"
        />
        {COLS.map((col) =>
          ['A', 'B', 'C', 'D', 'E'].map((letter, k) => (
            <text
              key={`${col}${letter}`}
              x={col + BUBBLE.first + k * BUBBLE.dx}
              y={ROW.first - 7}
              fontSize={5}
              textAnchor="middle"
              fill={INK.pink}
              fontFamily="ui-monospace, monospace"
            >
              {letter}
            </text>
          )),
        )}

        {/* the questions: a number and five circles each; the chosen one filled in pencil */}
        {Array.from({ length: QUESTIONS }, (_, q) => {
          const filled = q < done || (q === done && t > START + q * EACH + EACH * 0.4)
          return (
            <g key={q}>
              <text
                x={COLS[Math.floor(q / 10)] + 2}
                y={ROW.first + (q % 10) * ROW.step + 1.8}
                fontSize={5}
                fill={INK.pink}
                fontFamily="ui-monospace, monospace"
              >
                {q + 1}
              </text>
              {[0, 1, 2, 3, 4].map((k) => {
                const { x, y } = bubbleAt(q, k)
                return (
                  <circle
                    key={k}
                    cx={x}
                    cy={y}
                    r={BUBBLE.r}
                    fill="none"
                    stroke={INK.pink}
                    strokeWidth={0.5}
                  />
                )
              })}
              {filled && <Mark q={q} />}
            </g>
          )
        })}

        <Pencil x={tip.x + wiggle.x} y={tip.y + wiggle.y} />
      </g>
    </>
  )
}

// A filled circle: dark graphite, a little outside the line, with a scribble on top
function Mark({ q }: { q: number }) {
  const { x, y } = bubbleAt(q, answer(q))
  return (
    <g filter="url(#sketch-pencil)">
      <circle cx={x} cy={y} r={BUBBLE.r + 0.3} fill={INK.graphite} opacity={0.85} />
      <path d={loop(x, y, BUBBLE.r * 0.6, q)} stroke={INK.graphite} strokeWidth={0.6} fill="none" />
    </g>
  )
}

// A pencil from above, its tip at (x, y), lying towards the upper right
function Pencil({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-38)`} filter="url(#sketch-pencil)">
      <path d="M0 0 L7 -2.4 L7 2.4 Z" fill="#e8c9a0" stroke={INK.graphite} strokeWidth={0.5} />
      <path d="M0 0 L2.4 -0.8 L2.4 0.8 Z" fill={INK.graphite} />
      <rect
        x={7}
        y={-2.4}
        width={44}
        height={4.8}
        fill={INK.marker}
        stroke={INK.graphite}
        strokeWidth={0.5}
      />
      <path d="M7 0 L51 0" stroke={INK.graphite} strokeWidth={0.3} opacity={0.5} />
      <rect
        x={51}
        y={-2.6}
        width={4}
        height={5.2}
        fill="#c9c4bc"
        stroke={INK.graphite}
        strokeWidth={0.5}
      />
      <rect
        x={55}
        y={-2.4}
        width={5}
        height={4.8}
        rx={1.4}
        fill={INK.pink}
        stroke={INK.graphite}
        strokeWidth={0.5}
      />
    </g>
  )
}
