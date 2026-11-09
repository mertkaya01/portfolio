import { INK, rand, sketchBox, wobbly } from './pencil'
import { Hatch, Paper, Strokes, Written } from './sketch'

// "Accepted: Computer Engineering, Istanbul Kültür University." The results page on the desk:
// a list of choices scribbled in pencil, and one line written out properly — the programme
// and the university. It gets the yellow highlighter, a pencil loop and a tick, and a few
// little stars around it. No rank or score: we don't make numbers up.
// Everything that matters stays between x 70 and 249.

const SHEET = { x: 86, y: 12, w: 148, h: 158 }
const LIST = { x: 104, first: 50, step: 18, rows: 6 }
const CHOSEN = 1 // the row that is written out (0-based)

export function AcceptedScene({ programme, school }: { programme: string; school: string }) {
  const chosenY = LIST.first + CHOSEN * LIST.step
  return (
    <>
      <Paper tint={INK.shade} />
      <defs>
        <clipPath id="acc-shadow">
          <rect x={SHEET.x + 4} y={SHEET.y + 4} width={SHEET.w} height={SHEET.h} />
        </clipPath>
      </defs>
      <Hatch clip="acc-shadow" gap={1.8} delay={0} opacity={0.35} />

      <g transform="rotate(2 160 90)">
        <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill={INK.paper} />
        <g filter="url(#sketch-pencil)">
          <Strokes
            paths={sketchBox(SHEET.x, SHEET.y, SHEET.w, SHEET.h, 3)}
            each={200}
            width={0.8}
          />
          {/* the heading: two scribbled lines, a rule under them */}
          <Strokes
            paths={[
              wobbly(SHEET.x + 14, 24, SHEET.x + 80, 24, 10, 0.8),
              wobbly(SHEET.x + 14, 31, SHEET.x + 56, 31, 11, 0.8),
              wobbly(SHEET.x + 10, 38, SHEET.x + SHEET.w - 10, 38, 12),
            ]}
            delay={500}
            each={220}
            width={0.6}
            color={INK.soft}
          />
          {/* the list of choices: a number and a scribbled line each (one is written out) */}
          <Strokes
            paths={Array.from({ length: LIST.rows }, (_, i) => i)
              .filter((i) => i !== CHOSEN)
              .map((i) => {
                const y = LIST.first + i * LIST.step
                return wobbly(LIST.x + 10, y, LIST.x + 60 + rand(i) * 50, y, 20 + i, 1.1)
              })}
            delay={900}
            each={180}
            width={0.6}
            color={INK.soft}
          />
        </g>
        {Array.from({ length: LIST.rows }, (_, i) => (
          <Written
            key={i}
            x={LIST.x}
            y={LIST.first + i * LIST.step + 2.5}
            size={9}
            anchor="start"
            delay={850 + i * 90}
            duration={200}
            id={`acc-n${i}`}
            color={INK.soft}
          >
            {`${i + 1}.`}
          </Written>
        ))}

        {/* the chosen line: highlighted, written out, circled, ticked */}
        <path
          d={`M${LIST.x + 10} ${chosenY - 7} L${LIST.x + 118} ${chosenY - 8} L${LIST.x + 118} ${chosenY + 9} L${LIST.x + 10} ${chosenY + 10} Z`}
          fill={INK.marker}
          opacity={0.7}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'left',
            animation: 'step-fill 400ms ease-out 2500ms both',
          }}
        />
        <Written
          x={LIST.x + 13}
          y={chosenY + 0.5}
          size={10.5}
          anchor="start"
          delay={1600}
          duration={600}
          id="acc-prog"
          weight={700}
        >
          {programme}
        </Written>
        <Written
          x={LIST.x + 13}
          y={chosenY + 8}
          size={7.5}
          anchor="start"
          delay={2100}
          duration={500}
          id="acc-school"
        >
          {school}
        </Written>
        <g filter="url(#sketch-pencil)">
          <Strokes
            paths={[
              `M${LIST.x + 4} ${chosenY - 2} Q${LIST.x + 2} ${chosenY - 12} ${LIST.x + 66} ${chosenY - 13} Q${LIST.x + 128} ${chosenY - 12} ${LIST.x + 126} ${chosenY + 1} Q${LIST.x + 124} ${chosenY + 14} ${LIST.x + 64} ${chosenY + 14} Q${LIST.x + 6} ${chosenY + 14} ${LIST.x + 8} ${chosenY - 4}`,
            ]}
            delay={2900}
            each={700}
            width={0.9}
          />
          {/* the tick */}
          <Strokes
            paths={[
              `M${LIST.x + 130} ${chosenY - 1} L${LIST.x + 134} ${chosenY + 4} L${LIST.x + 142} ${chosenY - 9}`,
            ]}
            delay={3600}
            each={300}
            width={1.2}
          />
          {/* little stars around it */}
          <Strokes
            paths={[
              star(LIST.x + 136, chosenY - 16, 3),
              star(LIST.x - 6, chosenY - 10, 2.4),
              star(LIST.x + 120, chosenY + 20, 2.2),
            ]}
            delay={3900}
            each={200}
            width={0.6}
            color={INK.soft}
          />
        </g>
      </g>
    </>
  )
}

// a little five-pointed star, drawn in one stroke
function star(x: number, y: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + i * ((Math.PI * 4) / 5)
    return `${(x + Math.cos(a) * r).toFixed(2)} ${(y + Math.sin(a) * r).toFixed(2)}`
  })
  return `M${pts.join(' L')}`
}
