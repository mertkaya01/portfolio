import { useRef, type TouchEvent } from 'react'

const MIN_DISTANCE = 50 // px

// Swipe left / right on a touch screen. A swipe has to be clearly sideways and long enough,
// so a small wobble while tapping or scrolling doesn't count.
export function useSwipe(onSwipe: (direction: 'left' | 'right') => void) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const swipedAt = useRef(0)

  return {
    onTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      start.current = { x: touch.clientX, y: touch.clientY }
    },
    onTouchEnd(e: TouchEvent) {
      const from = start.current
      start.current = null
      const touch = e.changedTouches[0]
      if (!from || !touch) return
      const dx = touch.clientX - from.x
      const dy = touch.clientY - from.y
      if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return
      swipedAt.current = performance.now()
      onSwipe(dx < 0 ? 'left' : 'right')
    },
    // Some browsers still fire a click after a swipe; this lets the tap handler ignore it
    justSwiped: () => performance.now() - swipedAt.current < 400,
  }
}
