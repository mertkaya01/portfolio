import { useEffect, useRef } from 'react'

type Speck = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  phase: number
  rate: number
}

// Specks of dust drifting up through a beam of light, drawn on a <canvas> (Canvas 2D).
// One small loop moves every speck each frame: far cheaper than 60 animated DOM elements.
// The loop pauses while the canvas is off screen, and the specks stay still for visitors
// who prefer less motion.
export function Dust({ count = 60, className = '' }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let specks: Speck[] = []

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height)
      for (const s of specks) {
        // each speck slowly glints as it turns in the light
        const glint = 0.5 + 0.5 * Math.sin((time / 1000) * s.rate + s.phase)
        ctx!.fillStyle = `rgba(230, 237, 245, ${(0.08 + glint * 0.42).toFixed(3)})`
        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    // Size the canvas to its box (sharper on high-density screens, but at most 2× the pixels)
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = canvas!.clientWidth
      height = canvas!.clientHeight
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      specks = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.3,
        vx: (Math.random() - 0.5) * 8, // px per second
        vy: -(3 + Math.random() * 9), // drifting up, warm air over the lamp
        phase: Math.random() * Math.PI * 2,
        rate: 0.6 + Math.random() * 1.2,
      }))
      draw(performance.now())
    }

    let frame = 0
    let last = 0
    function tick(time: number) {
      const dt = Math.min(0.05, (time - last) / 1000) // seconds since last frame (capped after a pause)
      last = time
      for (const s of specks) {
        s.x += s.vx * dt
        s.y += s.vy * dt
        if (s.y < -4) {
          s.y = height + 4
          s.x = Math.random() * width
        }
        if (s.x < -4) s.x = width + 4
        if (s.x > width + 4) s.x = -4
      }
      draw(time)
      frame = requestAnimationFrame(tick)
    }
    const start = () => {
      if (frame || calm) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const resizer = new ResizeObserver(resize)
    resizer.observe(canvas)
    const watcher = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    watcher.observe(canvas)
    return () => {
      stop()
      resizer.disconnect()
      watcher.disconnect()
    }
  }, [count])

  return <canvas ref={ref} aria-hidden="true" className={className} />
}
