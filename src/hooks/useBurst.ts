import { useRef, useState, type PointerEvent } from 'react'

// Click a card → a soft glow spreads from the click point and a ring of sparks flies out,
// then everything slowly fades. This hook keeps the list of live bursts; BurstLayer draws them.

const COLORS = [
  'var(--color-accent)',
  'var(--color-ember)',
  'var(--color-sky)',
  'var(--color-wood)',
  'var(--color-light)',
]
const SPARKS = 14
const LIFETIME = 1500 // ms — a little longer than the slowest animation, then the burst is removed

type Spark = { dx: number; dy: number; color: string; size: number; delay: number }
export type BurstData = { id: number; x: number; y: number; sparks: Spark[] }

export function useBurst() {
  const [bursts, setBursts] = useState<BurstData[]>([])
  const nextId = useRef(0)

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (e.button !== 0) return // left click (or a tap) only
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const box = e.currentTarget.getBoundingClientRect()
    const id = nextId.current++
    // Random directions are picked here, in the click handler — never during render
    const sparks = Array.from({ length: SPARKS }, (_, i) => {
      const angle = (i / SPARKS) * Math.PI * 2 + Math.random() * 0.4
      const distance = 60 + Math.random() * 70
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        color: COLORS[i % COLORS.length],
        size: 4 + Math.random() * 4,
        delay: Math.random() * 80,
      }
    })

    setBursts((list) => [...list, { id, x: e.clientX - box.left, y: e.clientY - box.top, sparks }])
    window.setTimeout(() => setBursts((list) => list.filter((b) => b.id !== id)), LIFETIME)
  }

  return { bursts, onPointerDown }
}
