import { DISPLAY, FLAT, MONO, pop, slideUp, star } from './flat'

// Set 4's scoreboard, in flat vector: a clean card in front of a sky and the red-brick roofs of
// Brandenburg. The set's number sits in a ring of twelve yellow stars — the Erasmus flag's.
// Everything stays between x 70 and 249 (what a phone keeps).
export function FlatScoreboard({
  set,
  title,
  period,
}: {
  set: number
  title: string
  period: string
}) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    return { x: 160 + Math.cos(a) * 17, y: 66 + Math.sin(a) * 17 }
  })
  return (
    <>
      <Sky />
      <Roofs />
      {/* the card, its shadow under it */}
      <g style={pop(100, 550)}>
        <rect x={90} y={33} width={146} height={118} rx={10} fill={FLAT.ink} opacity={0.18} />
        <rect x={86} y={28} width={148} height={118} rx={10} fill={FLAT.white} />
        <rect x={86} y={28} width={148} height={10} rx={5} fill={FLAT.euBlue} />
        <rect x={86} y={33} width={148} height={5} fill={FLAT.euBlue} />
      </g>
      {/* the ring of stars, one after another, and the number in it */}
      <circle cx={160} cy={66} r={22} fill={FLAT.euBlue} style={pop(500)} />
      {stars.map((s, i) => (
        <path key={i} d={star(s.x, s.y, 2.4)} fill={FLAT.star} style={pop(700 + i * 60, 300)} />
      ))}
      <text
        x={160}
        y={74}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight={900}
        fontSize={24}
        fill={FLAT.white}
        style={pop(900)}
      >
        {set}
      </text>
      <text
        x={160}
        y={42}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={5}
        fill={FLAT.white}
        letterSpacing={2}
        style={slideUp(600)}
      >
        SET
      </text>
      <text
        x={160}
        y={113}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight={800}
        fontSize={20}
        letterSpacing={1}
        fill={FLAT.navy}
        style={slideUp(1500)}
      >
        {title}
      </text>
      <rect
        x={140}
        y={119}
        width={40}
        height={1.5}
        rx={0.75}
        fill={FLAT.star}
        style={slideUp(1700)}
      />
      <text
        x={160}
        y={134}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={7}
        fill={FLAT.brick}
        style={slideUp(1900)}
      >
        {period}
      </text>
    </>
  )
}

export function Sky() {
  return (
    <>
      <defs>
        <linearGradient id="flat-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={FLAT.skyDeep} />
          <stop offset="1" stopColor={FLAT.sky} />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#flat-sky)" />
    </>
  )
}

// A row of red-brick gables and a church tower along the bottom, like Brandenburg's old town
function Roofs() {
  const houses = [0, 26, 50, 78, 230, 254, 280, 302]
  return (
    <g>
      {houses.map((x, i) => (
        <g key={x} style={slideUp(200 + i * 40)}>
          <rect
            x={x}
            y={150 - (i % 3) * 6}
            width={24}
            height={40}
            fill={i % 2 ? FLAT.brick : FLAT.brickDark}
          />
          <path
            d={`M${x - 1} ${150 - (i % 3) * 6} L${x + 12} ${138 - (i % 3) * 6} L${x + 25} ${150 - (i % 3) * 6} Z`}
            fill={FLAT.roof}
          />
          <rect
            x={x + 9}
            y={158 - (i % 3) * 6}
            width={6}
            height={8}
            fill={FLAT.stone}
            opacity={0.8}
          />
        </g>
      ))}
      {/* the church tower */}
      <g style={slideUp(300)}>
        <rect x={104} y={110} width={16} height={70} fill={FLAT.brickDark} />
        <path d="M102 110 L112 86 L122 110 Z" fill={FLAT.roof} />
        <rect x={109} y={120} width={6} height={10} rx={3} fill={FLAT.navy} opacity={0.6} />
      </g>
      <rect y={168} width={320} height={12} fill={FLAT.grass} />
    </g>
  )
}
