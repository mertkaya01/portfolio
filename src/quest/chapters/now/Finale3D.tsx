import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'

import { useT } from '@/i18n'

import { setFinaleSwing, type SwingKey } from '../../engine/finaleInput'
import { Grain } from '../../scene-kit/Grain'

import { COLORS } from './colors'
import { StageLights, Warmup } from './lights'
import { ATTEMPTS, type Grade, type Outcome } from './spike'
import { SpikeGame, type GameEvent, type Press } from './SpikeGame'
import { setupStage } from './stage'

// The finale: match point of the tie-break, played. The setter puts the ball up, Mert (the 9 on
// his back) runs in and jumps, time slows down and a ring closes on the ball: the visitor swings
// when it meets the ball — Space, a click, a tap, or the button — and aims at the side the block
// leaves open (← → or the half of the screen they tap). A kill opens the portfolio (the stage's
// transition). A miss only brings one more ball; after the second, Mert takes it himself.
// Loaded with three.js, only at the end of the quest.
function prefersCalm() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function isTouch() {
  try {
    return window.matchMedia('(pointer: coarse)').matches
  } catch {
    return false
  }
}

type View = {
  phase: 'intro' | 'play' | 'result' | 'done'
  ring: boolean // the ring is up: now is the time to watch for it
  result: Outcome | null
  grade: Grade | null
  attempt: number
  shot: number // counts the results, so the same word pops again
}

export default function Finale3D({ onSpike }: { onSpike: () => void }) {
  const t = useT()
  const text = t.quest.finale
  const [calm] = useState(prefersCalm)
  // the game starts once its shaders are compiled (Warmup): no freeze as the finale comes on
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const [touch] = useState(isTouch)
  const [view, setView] = useState<View>({
    phase: calm ? 'play' : 'intro',
    ring: calm,
    result: null,
    grade: null,
    attempt: 0,
    shot: 0,
  })
  const [said, setSaid] = useState('') // for screen readers: what just happened

  // The match point breaks out of the quest's screen: it starts exactly where the last set's
  // screen is (still on stage, fading out under it) and opens to the whole stage
  const rootRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const root = rootRef.current
    const screen = document.querySelector('[data-screen]')
    if (calm || !root || !screen) return
    const s = screen.getBoundingClientRect()
    const r = root.getBoundingClientRect()
    const from = `inset(${s.top - r.top}px ${r.right - s.right}px ${r.bottom - s.bottom}px ${s.left - r.left}px round 12px)`
    root.animate([{ clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], {
      duration: 850,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    })
  }, [calm])

  // swings wait here until the game's next frame picks them up
  const presses = useRef<Press[]>([])
  const lastPush = useRef(0)
  const push = useCallback((time: number, screen: number | null) => {
    lastPush.current = performance.now()
    presses.current.push({ time, screen })
  }, [])
  const take = useCallback(() => {
    const first = presses.current.shift()
    presses.current.length = 0
    return first
  }, [])

  // While the match point is on screen, the stage's keyboard hands the swing keys to the game
  useEffect(() => {
    setFinaleSwing((key: SwingKey, time) =>
      push(time, key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : null),
    )
    return () => setFinaleSwing(null)
  }, [push])

  const spikeRef = useRef(onSpike)
  useEffect(() => {
    spikeRef.current = onSpike
  })
  const onEvent = useCallback(
    (e: GameEvent) => {
      if (e.type === 'play') {
        setView((v) => ({ ...v, phase: 'play', ring: false, result: null, attempt: e.attempt }))
        if (e.attempt > 0) setSaid(e.auto ? text.last : text.again)
      } else if (e.type === 'ring') {
        setView((v) => ({ ...v, ring: true }))
      } else if (e.type === 'result') {
        setView((v) => ({
          ...v,
          phase: 'result',
          result: e.outcome,
          grade: e.grade,
          shot: v.shot + 1,
        }))
        setSaid(text.words[e.outcome])
      } else {
        setView((v) => ({ ...v, phase: 'done' }))
        spikeRef.current()
      }
    },
    [text],
  )

  // A tap or click on the court: the swing, aimed at the side of the screen it lands on
  // (near the middle: at the open side)
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as Element).closest('button, a')) return
    const box = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * 2 - 1
    push(e.timeStamp, Math.abs(x) < 0.2 ? null : x)
  }

  const point = view.result === 'kill' || view.result === 'blockout'
  const sub = !view.result
    ? ''
    : point
      ? view.grade === 'perfect'
        ? text.perfect
        : text.point
      : view.attempt + 1 >= ATTEMPTS
        ? text.last
        : text.again
  const intro = view.phase === 'intro'

  return (
    <div
      ref={rootRef}
      className="relative size-full touch-none select-none"
      onPointerDown={onPointerDown}
      data-phase={view.phase}
      data-ring={view.ring || undefined}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [-9.8, 3.2, 2.7], fov: 38, near: 0.1, far: 100 }}
        className="absolute! inset-0"
        aria-hidden="true"
        frameloop={ready ? 'always' : 'never'}
        onCreated={setupStage}
      >
        <color attach="background" args={[COLORS.night]} />
        <fog attach="fog" args={[COLORS.night, 18, 42]} />
        <StageLights />
        <SpikeGame calm={calm} take={take} onEvent={onEvent} />
        <Warmup onReady={onReady} prepare={setupStage} />
      </Canvas>
      {/* the same film grain as on the quest's screen: the match point breaks out of the frame,
          not out of the film */}
      <Grain opacity={0.12} animated={!calm} />

      {/* the slow motion: the edges darken, all eyes on the ball */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(5_6_12/0.7)_100%)] transition-opacity duration-300 ${
          view.ring && view.phase === 'play' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* what this moment is: big at first, then out of the way of the ball */}
      <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-5 text-center sm:pt-8">
        <p className="font-mono text-xs tracking-[0.3em] text-wood uppercase">{text.kicker}</p>
        <h2
          className={`mt-2 origin-top font-display font-black tracking-tight text-accent uppercase transition-[transform,opacity] duration-500 [text-shadow:0_0_30px_rgb(255_210_63/0.45)] ${
            intro ? 'scale-100' : 'scale-75 opacity-0'
          } text-6xl sm:text-8xl`}
        >
          {text.title}
        </h2>
        {intro && <p className="mx-auto mt-3 max-w-md text-light/80">{text.text}</p>}
      </div>

      {/* the word: KILL! BLOCKED! OUT! — and what it means */}
      {view.result && (
        <div
          key={view.shot}
          className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center px-6 text-center"
        >
          <p
            className={`animate-hit-word font-display text-5xl font-black tracking-tight uppercase italic [-webkit-text-stroke:2px_var(--color-night)] sm:text-7xl ${
              point
                ? 'text-accent [text-shadow:0_0_40px_rgb(255_210_63/0.6)]'
                : 'text-light [text-shadow:0_4px_0_rgb(0_0_0/0.35)]'
            }`}
          >
            {text.words[view.result]}
          </p>
          <p className="mt-3 animate-rise font-mono text-xs tracking-[0.2em] text-light/85 uppercase">
            {sub}
          </p>
        </div>
      )}

      {/* how to play, and the swing as a button */}
      <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-3 px-6 sm:bottom-8">
        {view.phase === 'play' && (
          <p
            className={`pointer-events-none text-center font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors ${
              view.ring ? 'text-accent' : 'text-light/70'
            }`}
          >
            {touch ? text.hintTouch : text.hintKeys}
          </p>
        )}
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation()
            push(e.timeStamp, null)
          }}
          onKeyDown={(e) => {
            if (e.key !== ' ' && e.key !== 'Enter') return
            e.preventDefault() // swing on the key going down, not on the click after it
            if (!e.repeat) push(e.timeStamp, null)
          }}
          // a click with no pointer or key before it (a screen reader, say)
          onClick={() => {
            if (performance.now() - lastPush.current > 600) push(performance.now(), null)
          }}
          className={`inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-xs font-semibold tracking-[0.15em] uppercase transition-colors ${
            view.ring
              ? 'bg-accent text-night shadow-[0_0_30px_rgb(255_210_63/0.6)]'
              : 'bg-light/15 text-light hover:bg-light/25'
          }`}
        >
          {text.spike}
          <kbd className="rounded border border-current/30 px-1.5 text-[0.65rem]">Space</kbd>
        </button>
      </div>

      <p aria-live="assertive" className="sr-only">
        {said}
      </p>
    </div>
  )
}
