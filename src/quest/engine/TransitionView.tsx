import { useEffect, useLayoutEffect, useRef } from 'react'

type Props = { kind: 'skip' | 'spike'; onDone: () => void }

// Timeline (ms): the court is traced → it glides onto the player card → the lights come on
const DRAW = 380
const MOVE = 500
const LIGHTS_ON = 320
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)'

type Box = { left: number; top: number; width: number; height: number; radius: number }

// Where the court is traced: in the middle of the screen, standing upright (9 m × 18 m)
function courtBox(): Box {
  const height = Math.min(window.innerHeight * 0.6, 520)
  const width = height / 2
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
    radius: 2,
  }
}

// Where an element sits in the layout, ignoring transforms. (Right after the jump the card is
// still sliding in with its entrance animation — getBoundingClientRect would catch it
// mid-slide, but we want the place where it will come to rest.)
function restingRect(el: HTMLElement) {
  let left = 0
  let top = 0
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
    left += n.offsetLeft
    top += n.offsetTop
  }
  return {
    left: left - window.scrollX,
    top: top - window.scrollY,
    width: el.offsetWidth,
    height: el.offsetHeight,
  }
}

// Where it lands: on the player card, if the card is fully on screen (on a desktop it is,
// right after the jump to the portfolio). Otherwise the court opens up to the whole screen.
function targetBox(): Box {
  const el = document.querySelector<HTMLElement>('[data-transition-target]')
  const card = el && restingRect(el)
  if (card && card.width > 0 && card.top >= 0 && card.top + card.height <= window.innerHeight) {
    return { ...card, radius: 16 }
  }
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, radius: 0 }
}

const toStyle = (b: Box) => ({
  left: `${b.left}px`,
  top: `${b.top}px`,
  width: `${b.width}px`,
  height: `${b.height}px`,
  borderRadius: `${b.radius}px`,
})

// The step from the quest (or the landing) into the portfolio, told with the court:
// its lines are traced in the dark, then the court frame glides onto the player card and
// becomes the card's frame. Everything outside the frame stays dark — a spotlight on the card —
// until the room lights come on. (After a spike there is also a flash, like the ball landing.)
//
// The dark around the frame is one huge box-shadow on the frame itself, so moving the frame
// moves the "hole" in the dark with it. The movement uses the Web Animations API
// (element.animate): the end position is measured at runtime, which CSS keyframes can't do.
export function TransitionView({ kind, onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)

  // Put the frame in its start position before the first paint
  useLayoutEffect(() => {
    if (frameRef.current) Object.assign(frameRef.current.style, toStyle(courtBox()))
  }, [])

  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (calm) {
      const timer = window.setTimeout(onDone, 0)
      return () => window.clearTimeout(timer)
    }

    const root = rootRef.current
    const frame = frameRef.current
    const fill = fillRef.current
    const lines = linesRef.current
    if (!root || !frame || !fill || !lines) return

    const animations: Animation[] = []
    let cancelled = false
    const at = (delay: number, duration: number): KeyframeAnimationOptions => ({
      delay,
      duration,
      easing: EASE,
      fill: 'both',
    })

    // Wait one frame: by then the page behind has jumped to the portfolio (HomePage does that),
    // so the card is where it will stay
    const raf = requestAnimationFrame(() => {
      animations.push(
        frame.animate([toStyle(courtBox()), toStyle(targetBox())], at(DRAW, MOVE)),
        // the court's inner lines fade while it turns into the card frame…
        lines.animate([{ opacity: 1 }, { opacity: 0 }], at(DRAW + MOVE * 0.2, MOVE * 0.5)),
        // …and the dark inside it clears: the card shows through
        fill.animate([{ opacity: 1 }, { opacity: 0 }], at(DRAW + MOVE * 0.35, MOVE * 0.65)),
        // the lights come on: the dark around the frame (and the frame) fade away
        root.animate([{ opacity: 1 }, { opacity: 0 }], at(DRAW + MOVE, LIGHTS_ON)),
      )
      Promise.all(animations.map((a) => a.finished)).then(
        () => !cancelled && onDone(),
        () => {}, // cancelled (e.g. a second Skip): nothing to do
      )
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      animations.forEach((a) => a.cancel())
    }
  }, [onDone])

  const draw = { animationDuration: `${DRAW}ms` }

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-transition={kind}
      className="absolute inset-0 overflow-hidden"
    >
      <div
        ref={frameRef}
        className="absolute overflow-hidden shadow-[0_0_0_200vmax_var(--color-night)]"
      >
        <div ref={fillRef} className="absolute inset-0 bg-night" />

        {/* The court outline, each side drawn from its middle */}
        <span className="absolute inset-x-0 top-0 h-px animate-draw-line bg-wood" style={draw} />
        <span className="absolute inset-x-0 bottom-0 h-px animate-draw-line bg-wood" style={draw} />
        <span className="absolute inset-y-0 left-0 w-px animate-draw-line-y bg-wood" style={draw} />
        <span
          className="absolute inset-y-0 right-0 w-px animate-draw-line-y bg-wood"
          style={draw}
        />

        {/* Center line (under the net) and the two attack lines, 3 m either side */}
        <div ref={linesRef} className="absolute inset-0">
          <span
            className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 animate-draw-line bg-wood"
            style={draw}
          />
          <span
            className="absolute inset-x-0 top-1/3 h-px animate-draw-line bg-wood/50"
            style={draw}
          />
          <span
            className="absolute inset-x-0 top-2/3 h-px animate-draw-line bg-wood/50"
            style={draw}
          />
        </div>
      </div>

      {kind === 'spike' && <span className="absolute inset-0 animate-spike-flash bg-accent/25" />}
    </div>
  )
}
