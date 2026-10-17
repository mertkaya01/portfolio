import { useRef, type PointerEvent } from 'react'

// Tilts an element toward the mouse. The position goes into CSS variables
// (--rx, --ry for the tilt; --sx, --sy for a light sheen) — no React re-render on every move.
// Mouse only: on touch screens the card simply stays flat.
export function useTilt<T extends HTMLElement>(maxTilt = 10) {
  const ref = useRef<T>(null)

  function onPointerMove(e: PointerEvent<T>) {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const box = el.getBoundingClientRect()
    const x = (e.clientX - box.left) / box.width // 0 … 1
    const y = (e.clientY - box.top) / box.height
    el.style.setProperty('--rx', `${(0.5 - y) * maxTilt}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * maxTilt}deg`)
    el.style.setProperty('--sx', `${x * 100}%`)
    el.style.setProperty('--sy', `${y * 100}%`)
  }

  function onPointerLeave() {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }

  return { ref, onPointerMove, onPointerLeave }
}

// Use on the tilting element: style={TILT_STYLE}
export const TILT_STYLE = { transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' }
