import { useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  stepKey: string // changes on every step: a new step starts its full time again
  duration: number // ms the current step stays on screen
  active: boolean // false where nothing should move on by itself (the finale, the transition)
  onDone: () => void // what "time's up" does (the stage sends Next)
}

function prefersCalm() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Is the tab on screen? A hidden tab pauses the quest — nobody is watching it.
function usePageVisible() {
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return visible
}

// The quest plays by itself: each step stays for its time, then moves on.
// - Pause / Play at any moment (and P on the keyboard); Back and Next always work too.
// - Pausing keeps the time that was left, so the progress bar and the timer stay together.
// - Visitors who prefer less motion start paused: nothing moves until they ask for it.
export function useAutoplay({ stepKey, duration, active, onDone }: Options) {
  const [playing, setPlaying] = useState(() => !prefersCalm())
  const visible = usePageVisible()
  const running = active && playing && visible

  // the latest onDone, without restarting the timer when it changes
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  // A new step gets its full time. (React runs every effect's cleanup before the new effects,
  // so the timer below has already put away the old step's time when this resets it.)
  const remaining = useRef(duration)
  useEffect(() => {
    remaining.current = duration
  }, [stepKey, duration])

  useEffect(() => {
    if (!running) return
    const started = performance.now()
    const timer = window.setTimeout(() => onDoneRef.current(), Math.max(0, remaining.current))
    // stopped early (paused, hidden, or the visitor moved on): remember what was left
    return () => {
      window.clearTimeout(timer)
      remaining.current -= performance.now() - started
    }
  }, [running, stepKey, duration])

  const toggle = useCallback(() => setPlaying((p) => !p), [])
  return { playing, running, toggle }
}
