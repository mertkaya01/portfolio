import { useEffect, useRef } from 'react'

// The name flips up letter by letter like scoreboard flaps (CSS 3D: no library, no extra download).

// Fake thickness: the letter repeated a few pixels lower, darker each time, plus a soft
// shadow underneath. With light coming from above it reads as an extruded sign.
const DEPTH_SHADOW = [
  '0 1px 0 #c3ccd6',
  '0 2px 0 #a9b2bd',
  '0 3px 0 #8f99a5',
  '0 4px 0 #77818d',
  '0 5px 0 #606a76',
  '0 12px 20px rgb(0 0 0 / 0.7)',
].join(', ')

const MAX_TILT = 10 // degrees the title leans toward the mouse

type Props = { name: string; start: number; gap: number }

export function FlipTitle({ name, start, gap }: Props) {
  const tiltRef = useRef<HTMLDivElement>(null)

  // Mouse parallax: we write the transform straight to the element (no React re-render per move)
  useEffect(() => {
    const el = tiltRef.current
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || calm) return

    const onMove = (e: PointerEvent) => {
      // -1 … 1, measured from the center of the screen
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      el.style.transform = `rotateX(${-y * MAX_TILT}deg) rotateY(${x * MAX_TILT}deg)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    // perspective = how far the "camera" is; smaller values = stronger 3D effect
    <div className="mt-6 perspective-[900px]">
      {/* transform-3d (preserve-3d) passes the 3D space down to the letters */}
      <div ref={tiltRef} className="transition-transform duration-500 ease-out transform-3d">
        <h1
          className="font-display text-5xl font-black tracking-tight transform-3d sm:text-7xl"
          style={{ textShadow: DEPTH_SHADOW }}
        >
          <span className="sr-only">{name}</span>
          {[...name].map((char, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="inline-block origin-bottom animate-flip-in backface-hidden"
              style={{ animationDelay: `${start + i * gap}ms` }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  )
}
