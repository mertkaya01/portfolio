import { useReducedMotion } from 'motion/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'

import { useT } from '@/i18n'

import { useHoldClock, useQuestClock } from '../../engine/questClock'

import { DISPLAY, FLAT, MONO, pop, pulse, slideUp, star } from './flat'

// ---------- Istanbul → Brandenburg an der Havel: the journey, played ----------
// A simple map: land in soft greens, the two cities with a landmark each (domes and minarets;
// a brick church tower) and a dashed route between them. The visitor takes the suitcase along
// the route: drag it (it stays on the route, and snaps home near the end), or tap it, tap
// Brandenburg, or press Enter on it — it then travels by itself. If nobody plays while the
// quest plays by itself, it sets off alone after a few seconds. Until it arrives the quest
// waits; then a stamp, and the story goes on.

const FROM = { x: 222, y: 128 } // Istanbul
const TO = { x: 104, y: 56 } // Brandenburg an der Havel
const BOW = { x: 150, y: 58 } // the route bends up, like a flight path on a flat map
const routeAt = (p: number) => ({
  x: (1 - p) ** 2 * FROM.x + 2 * (1 - p) * p * BOW.x + p ** 2 * TO.x,
  y: (1 - p) ** 2 * FROM.y + 2 * (1 - p) * p * BOW.y + p ** 2 * TO.y,
})
const ROUTE_D = `M${FROM.x} ${FROM.y} Q${BOW.x} ${BOW.y} ${TO.x} ${TO.y}`
const STEPS = 160
const ROUTE = Array.from({ length: STEPS + 1 }, (_, i) => routeAt(i / STEPS))
const SNAP = 0.82 // let go past here and it goes the rest of the way
const IDLE_MS = 6500 // nobody playing: it sets off alone

// The point of the route nearest to (x, y), looking only near where the suitcase is now,
// so it can't jump across the bend
function nearest(x: number, y: number, around: number) {
  const lo = Math.max(0, Math.floor((around - 0.3) * STEPS))
  const hi = Math.min(STEPS, Math.ceil((around + 0.3) * STEPS))
  let best = around
  let bestD = Infinity
  for (let i = lo; i <= hi; i++) {
    const d = (ROUTE[i].x - x) ** 2 + (ROUTE[i].y - y) ** 2
    if (d < bestD) {
      bestD = d
      best = i / STEPS
    }
  }
  return best
}

const easeInOut = (k: number) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2)

export function JourneyScene() {
  const t = useT()
  const calm = useReducedMotion() ?? false
  const playing = useQuestClock((s) => s.playing)
  const [p, setP] = useState(0) // the suitcase along the route: 0 Istanbul … 1 Brandenburg
  const [lifted, setLifted] = useState(false)
  const [touched, setTouched] = useState(false)
  const arrived = p >= 1
  useHoldClock('erasmus-journey', !arrived)

  const pos = useRef(0)
  const raf = useRef(0)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)

  const place = useCallback((next: number) => {
    const v = next >= 0.995 ? 1 : Math.max(0, next)
    pos.current = v
    setP(v)
  }, [])

  // the rest of the way, by itself
  const travel = useCallback(() => {
    cancelAnimationFrame(raf.current)
    if (calm) return place(1)
    const from = pos.current
    const ms = 400 + (1 - from) * 1500
    const start = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms)
      place(from + (1 - from) * easeInOut(k))
      if (k < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [calm, place])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  useEffect(() => {
    if (!playing || touched || arrived) return
    const id = window.setTimeout(travel, IDLE_MS)
    return () => window.clearTimeout(id)
  }, [playing, touched, arrived, travel])

  const start = () => {
    setTouched(true)
    if (!arrived) travel()
  }

  // ---------- dragging ----------
  function onPointerDown(e: PointerEvent<SVGGElement>) {
    if (arrived) return
    e.currentTarget.setPointerCapture(e.pointerId)
    cancelAnimationFrame(raf.current)
    drag.current = { x: e.clientX, y: e.clientY, moved: false }
    setTouched(true)
  }
  function onPointerMove(e: PointerEvent<SVGGElement>) {
    const d = drag.current
    if (!d) return
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return // still a tap
      d.moved = true
      setLifted(true)
    }
    const m = e.currentTarget.ownerSVGElement?.getScreenCTM()
    if (!m) return
    const at = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    place(nearest(at.x, at.y, pos.current))
  }
  function onPointerUp() {
    const d = drag.current
    drag.current = null
    setLifted(false)
    if (!d || pos.current >= 1) return
    if (!d.moved || pos.current >= SNAP) travel() // a tap, or let go near the end
  }
  function onKeyDown(e: KeyboardEvent<SVGGElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    start()
  }

  const at = routeAt(p)
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

      {/* the route: dashed all the way, solid red where the suitcase has been */}
      <path
        d={ROUTE_D}
        fill="none"
        stroke={FLAT.navy}
        strokeWidth={1.1}
        strokeDasharray="3 3"
        opacity={0.55}
      />
      <path
        d={ROUTE_D}
        pathLength={1}
        fill="none"
        stroke={FLAT.brick}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeDasharray={`${p} 1`}
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
          x={FROM.x}
          y={FROM.y + 15}
          textAnchor="middle"
          fontFamily={DISPLAY}
          fontWeight={800}
          fontSize={10}
          fill={FLAT.navy}
        >
          İstanbul
        </text>
      </g>

      {/* Brandenburg an der Havel: a brick church tower — tapping it sends the suitcase too */}
      <g
        data-quest-interactive
        onClick={start}
        className={arrived ? undefined : 'cursor-pointer'}
        style={pop(400)}
      >
        <circle cx={TO.x} cy={TO.y} r={13} fill="transparent" />
        {!arrived && (
          <circle
            cx={TO.x}
            cy={TO.y}
            r={5}
            fill="none"
            stroke={FLAT.brick}
            strokeWidth={1}
            style={pulse(1200, 4)}
          />
        )}
        <circle cx={TO.x} cy={TO.y} r={arrived ? 4 : 3} fill={FLAT.brick} />
        <rect x={TO.x - 18} y={TO.y - 18} width={7} height={14} fill={FLAT.brick} />
        <path
          d={`M${TO.x - 19} ${TO.y - 18} L${TO.x - 14.5} ${TO.y - 28} L${TO.x - 10} ${TO.y - 18} Z`}
          fill={FLAT.roof}
        />
        <text
          x={TO.x - 4}
          y={TO.y + 20}
          fontFamily={DISPLAY}
          fontWeight={800}
          fontSize={10}
          fill={FLAT.navy}
        >
          Brandenburg an der Havel
        </text>
      </g>

      {/* arrived: stars burst from the pin, and a passport stamp */}
      {arrived && (
        <g aria-label={t.quest.journey.arrived}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = -Math.PI / 2 + (i / 7) * Math.PI * 2
            return (
              <path
                key={i}
                d={star(TO.x + Math.cos(a) * 15, TO.y + Math.sin(a) * 15, 2.6)}
                fill={FLAT.star}
                style={pop(i * 45, 380)}
              />
            )
          })}
          {/* the place on the outer group, the pop on the inner (a CSS animation's transform
              would replace an SVG transform on the same element) */}
          <g transform="translate(176 38) rotate(-14)" opacity={0.88}>
            <g style={pop(260, 420)}>
              <circle r={16} fill="none" stroke={FLAT.brick} strokeWidth={1.4} />
              <circle r={13} fill="none" stroke={FLAT.brick} strokeWidth={0.6} />
              <text
                y={-3.5}
                textAnchor="middle"
                fontFamily={DISPLAY}
                fontWeight={800}
                fontSize={4}
                fill={FLAT.brick}
              >
                BRANDENBURG
              </text>
              <text y={1.6} textAnchor="middle" fontFamily={MONO} fontSize={2.8} fill={FLAT.brick}>
                AN DER HAVEL
              </text>
              <text
                y={7}
                textAnchor="middle"
                fontFamily={MONO}
                fontWeight={700}
                fontSize={3.4}
                fill={FLAT.brick}
              >
                03 · 2025
              </text>
            </g>
          </g>
        </g>
      )}

      {/* the suitcase: lifted while dragged (bigger, its shadow further down) */}
      <g transform={`translate(${at.x} ${at.y})`}>
        <ellipse
          cx={1}
          cy={lifted ? 11 : 7.5}
          rx={lifted ? 6.5 : 8}
          ry={2}
          fill={FLAT.navy}
          opacity={lifted ? 0.12 : 0.2}
        />
        <g
          role="button"
          tabIndex={arrived ? -1 : 0}
          aria-label={t.quest.journey.travel}
          aria-disabled={arrived || undefined}
          data-quest-interactive
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className={`group outline-none ${arrived ? '' : lifted ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ touchAction: 'none' }}
          transform={lifted ? 'translate(0 -3) rotate(-7) scale(1.12)' : undefined}
        >
          <circle r={14} fill="transparent" />
          {!touched && (
            <circle r={9} fill="none" stroke={FLAT.star} strokeWidth={1.4} style={pulse(500, 4)} />
          )}
          <circle
            r={12.5}
            fill="none"
            stroke={FLAT.navy}
            strokeWidth={0.9}
            strokeDasharray="2 2"
            className="opacity-0 group-focus-visible:opacity-100"
          />
          <Suitcase />
        </g>
      </g>

      {/* how to play */}
      {!touched && !arrived && (
        <text
          x={160}
          y={172}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={6.2}
          fontWeight={600}
          fill={FLAT.navy}
          style={slideUp(900)}
        >
          {t.quest.journey.hint}
        </text>
      )}
    </>
  )
}

// A red-brown suitcase with two straps, wheels and an EU-flag sticker
function Suitcase() {
  return (
    <g>
      <rect
        x={-3.2}
        y={-10}
        width={6.4}
        height={4.4}
        rx={1.6}
        fill="none"
        stroke={FLAT.navy}
        strokeWidth={1.2}
      />
      <rect x={-8.5} y={-6.5} width={17} height={12.5} rx={2.2} fill={FLAT.brick} />
      <path
        d="M3.5 -6.5 H6.3 A2.2 2.2 0 0 1 8.5 -4.3 V3.8 A2.2 2.2 0 0 1 6.3 6 H3.5 Z"
        fill={FLAT.brickDark}
      />
      <rect x={-5.2} y={-6.5} width={1.4} height={12.5} fill={FLAT.stone} />
      <rect x={2.4} y={-6.5} width={1.4} height={12.5} fill={FLAT.stone} />
      <circle cx={-0.8} cy={0.2} r={2.4} fill={FLAT.euBlue} />
      <path d={star(-0.8, 0.2, 1.3)} fill={FLAT.star} />
      <circle cx={-6} cy={7} r={1.1} fill={FLAT.navy} />
      <circle cx={6} cy={7} r={1.1} fill={FLAT.navy} />
    </g>
  )
}
