import { useEffect, useState } from 'react'

function prefersCalm() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Seconds since the scene appeared, updated `fps` times a second (for movement that CSS can't
// do alone, like a pencil going from bubble to bubble). Less motion: straight to the end.
export function useSceneTime(fps = 24) {
  const [calm] = useState(prefersCalm)
  const [t, setT] = useState(() => (calm ? 99 : 0))
  useEffect(() => {
    if (calm) return
    const start = performance.now()
    let last = -1
    let raf = 0
    const loop = (now: number) => {
      const s = (now - start) / 1000
      const tick = Math.floor(s * fps)
      if (tick !== last) {
        last = tick
        setT(s)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [calm, fps])
  return t
}
