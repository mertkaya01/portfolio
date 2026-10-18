import { useEffect, useRef, type ReactNode } from 'react'

const FOLLOW = 0.08 // 0 … 1: how much of the way to the pointer the scene moves each frame

// Depth from the mouse. The scene listens to the pointer once and writes where it is
// (-1 … 1 from the screen center) into two CSS variables, --px and --py. Every ParallaxLayer
// inside reads them and shifts by its own depth: far layers a little, near layers more.
// No React re-render per frame — only two variables change. Off on touch screens and for
// visitors who prefer less motion.
export function ParallaxScene({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = window.matchMedia('(pointer: fine)').matches
    if (!el || calm || !mouse) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let frame = 0
    function tick() {
      current.x += (target.x - current.x) * FOLLOW
      current.y += (target.y - current.y) * FOLLOW
      el!.style.setProperty('--px', current.x.toFixed(4))
      el!.style.setProperty('--py', current.y.toFixed(4))
      const settled = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) < 0.001
      frame = settled ? 0 : requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
      if (!frame) frame = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// depth: px it moves when the pointer is at the edge of the screen. Negative = the other way
// (things in front of the focus point move against the pointer, things behind move with it).
export function ParallaxLayer({
  depth,
  className = '',
  children,
}: {
  depth: number
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={className}
      style={{ translate: `calc(var(--px, 0) * ${depth}px) calc(var(--py, 0) * ${depth}px)` }}
    >
      {children}
    </div>
  )
}
