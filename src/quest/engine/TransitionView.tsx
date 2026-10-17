import { useEffect } from 'react'

const DURATION = 950 // ms — keep in sync with the stage-out animation in index.css

type Props = { kind: 'skip' | 'spike'; onDone: () => void }

// The short step from the quest into the portfolio: a court line is drawn across the screen,
// then the dark stage fades away and reveals the portfolio (already scrolled into place behind it).
// After a spike there is also a quick flash of light, like the ball hitting the floor.
export function TransitionView({ kind, onDone }: Props) {
  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(onDone, calm ? 0 : DURATION)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div aria-hidden="true" className="absolute inset-0 animate-stage-out bg-night">
      <span
        className="absolute inset-x-0 top-1/2 h-px origin-center animate-draw-line bg-wood"
        style={{ animationDuration: '450ms' }}
      />
      {kind === 'spike' && <span className="absolute inset-0 animate-spike-flash bg-accent/25" />}
    </div>
  )
}
