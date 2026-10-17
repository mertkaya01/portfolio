import { useEffect, useRef, type CSSProperties } from 'react'

// The name's letters fly in from far behind the screen, each from its own direction,
// overshoot toward you a little and settle. CSS 3D only: no library, no extra download.

// Fake thickness: the letter repeated a few pixels away, darker each time, plus a soft shadow.
// x, y (-1 … 1) say where the mouse is: the "extrusion" leans away from it, as if the light
// followed the mouse. At (0, 0) the light comes straight from above.
const SIDE_COLORS = ['#c3ccd6', '#a9b2bd', '#8f99a5', '#77818d', '#606a76']
function extrusion(x: number, y: number) {
  const layers = SIDE_COLORS.map((color, i) => {
    const k = i + 1
    return `${(-x * k * 0.7).toFixed(2)}px ${(k * (1 + y * 0.35)).toFixed(2)}px 0 ${color}`
  })
  layers.push(`${(-x * 10).toFixed(1)}px ${(12 + y * 5).toFixed(1)}px 20px rgb(0 0 0 / 0.7)`)
  return layers.join(', ')
}

const MAX_TILT = 22 // degrees the title leans toward the mouse
const MAX_SHIFT = { x: 18, y: 10 } // px it drifts toward the mouse
const FOLLOW = 0.1 // 0 … 1: how much of the way to the mouse it moves each frame (smoothness)
// px: while the title turns, its letters spread to different depths (parallax).
// At rest the spread is 0, so the name sits flat and clean.
const LETTER_DEPTH = 40

// Where the letters start before they fly in. They are far away (see the keyframes),
// so on screen these distances look about four times smaller.
const SCATTER_X = 500 // px, spread to the left and right
const LIFT_MIN = 600 // px, every letter starts at least this far above the title…
const LIFT_RANGE = 600 // px, …plus up to this much more, so they drop from different heights
const SCATTER_SPIN = 160 // deg

// A "random" number between 0 and 1 that is always the same for the same n.
// The scatter looks random, but every visitor sees the same choreography.
function scatter(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

type Props = { name: string; start: number; gap: number }

export function FlyInTitle({ name, start, gap }: Props) {
  const tiltRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Mouse parallax. Every frame the title moves a fraction (FOLLOW) of the way toward where the
  // mouse points, so it glides instead of jumping. Styles are written straight to the elements:
  // no React re-render per frame. The loop stops by itself once the title has caught up.
  useEffect(() => {
    const el = tiltRef.current
    const title = titleRef.current
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || !title || calm) return

    const target = { x: 0, y: 0 } // where the mouse is (-1 … 1 from the screen center)
    const current = { x: 0, y: 0 } // where the title is now
    let frame = 0

    function tick() {
      current.x += (target.x - current.x) * FOLLOW
      current.y += (target.y - current.y) * FOLLOW
      el!.style.transform =
        `translate3d(${current.x * MAX_SHIFT.x}px, ${current.y * MAX_SHIFT.y}px, 0) ` +
        `rotateX(${-current.y * MAX_TILT}deg) rotateY(${current.x * MAX_TILT}deg)`
      title!.style.textShadow = extrusion(current.x, current.y)
      // the more it turns, the further apart the letters' depths (read by each letter via --spread)
      const spread = Math.min(1, Math.abs(current.x) + Math.abs(current.y)) * LETTER_DEPTH
      el!.style.setProperty('--spread', spread.toFixed(1))

      const settled = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) < 0.001
      frame = settled ? 0 : requestAnimationFrame(tick)
    }
    const follow = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
      follow()
    }
    // mouse left the window → glide back to the middle
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget) return
      target.x = 0
      target.y = 0
      follow()
    }

    window.addEventListener('pointermove', onMove)
    document.addEventListener('mouseout', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseout', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    // perspective = how far the "camera" is; smaller values = stronger 3D effect
    <div className="mt-6 perspective-[900px]">
      {/* transform-3d (preserve-3d) passes the 3D space down to the letters */}
      <div ref={tiltRef} className="transform-3d">
        <h1
          ref={titleRef}
          className="font-display text-5xl font-black tracking-tight transform-3d sm:text-7xl"
          style={{ textShadow: extrusion(0, 0) }}
        >
          <span className="sr-only">{name}</span>
          {[...name].map((char, i) => {
            // Each letter's starting point, read by the fly-in keyframes in index.css
            const style = {
              animationDelay: `${start + i * gap}ms`,
              '--fly-x': `${(scatter(i + 1) - 0.5) * SCATTER_X}px`,
              // Negative y = up: they come down from the overhead lights
              '--fly-y': `${-(LIFT_MIN + scatter(i + 11) * LIFT_RANGE)}px`,
              '--fly-spin': `${(scatter(i + 21) - 0.5) * SCATTER_SPIN}deg`,
            } as CSSProperties

            // Outer span: the letter's depth = its own factor (-0.5 … 0.5) × the current --spread.
            // Inner span: the fly-in animation. (Two elements: the animation would overwrite a
            // transform on the same one.)
            const depth = (scatter(i + 31) - 0.5).toFixed(2)
            return (
              <span
                key={i}
                aria-hidden="true"
                className="inline-block transform-3d"
                style={{ transform: `translateZ(calc(${depth} * var(--spread, 0) * 1px))` }}
              >
                <span className="inline-block animate-fly-in backface-hidden" style={style}>
                  {char === ' ' ? ' ' : char}
                </span>
              </span>
            )
          })}
        </h1>
      </div>
    </div>
  )
}
