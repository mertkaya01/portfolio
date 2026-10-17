// The dark opening screen with its two doors: start the quest, or skip to the portfolio.
// Milestone 6 turns it into the real quest landing; the doors already work.
import { m, useInView, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, type MouseEvent } from 'react'

import { isQuestOpen } from '@/app/experienceMachine'
import { useExperience } from '@/app/experienceStore'
import { profile } from '@/data/profile'
import { handlesOwnKeys, hasModifier } from '@/lib/keyboard'

import { FlyInTitle } from './FlyInTitle'

// Timeline of the entrance (ms). Each element waits for its turn.
const NAME_START = 500
const LETTER_GAP = 80

// First visit: Skip plays the short transition into the portfolio.
// Already seen it this session: Skip just scrolls down.
function skip() {
  const { state, send } = useExperience.getState()
  if (state.name === 'LANDING') send({ type: 'SKIP' })
  else document.getElementById('about')?.scrollIntoView()
}

export function Landing() {
  const ref = useRef<HTMLElement>(null)
  const send = useExperience((s) => s.send)

  // 0 while the landing fills the screen → 1 once it has scrolled completely out of view
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // As you scroll away, the title sinks back slower than the page, shrinks and fades:
  // the portfolio slides over it like the next scene of a film
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const lightOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // The keys only work while the landing is actually on screen: Enter far down the page
  // should not suddenly start the quest
  const inView = useInView(ref, { amount: 0.5 })

  useEffect(() => {
    if (!inView) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat || hasModifier(e)) return
      if (isQuestOpen(useExperience.getState().state)) return // the quest has its own keys
      if (e.key === 'Enter') {
        if (handlesOwnKeys(e.target)) return // a focused link or button does its own thing
        e.preventDefault()
        send({ type: 'START' })
      } else if (e.key === 'Escape' || e.key === 's' || e.key === 'S') {
        e.preventDefault()
        skip()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [inView, send])

  // A real link, so it still works as a plain "jump to #about" if anything else fails
  function onSkipClick(e: MouseEvent) {
    if (useExperience.getState().state.name !== 'LANDING') return
    e.preventDefault()
    skip()
  }

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Intro"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 text-center"
    >
      {/* Overhead spotlight: a big blurred ellipse of cool light that flickers on, then dims on scroll */}
      <m.div
        aria-hidden="true"
        style={{ opacity: lightOpacity }}
        className="pointer-events-none absolute -top-48 left-1/2 h-96 w-[48rem] max-w-[150vw] -translate-x-1/2"
      >
        <div className="h-full w-full animate-light-on rounded-full bg-light/10 blur-3xl" />
      </m.div>

      <m.div style={{ y, scale, opacity }} className="flex flex-col items-center">
        <p className="animate-rise font-mono text-xs tracking-[0.4em] text-muted uppercase [animation-delay:300ms]">
          Portfolio · 2026
        </p>

        <FlyInTitle name={profile.name.toUpperCase()} start={NAME_START} gap={LETTER_GAP} />

        <p className="mt-4 animate-track-in text-base tracking-[0.3em] text-wood uppercase [animation-delay:1900ms] sm:text-lg">
          Beyond the Court
        </p>

        {/* First appearance of the "line" motif: a court line drawn under the title */}
        <span
          aria-hidden="true"
          className="mt-8 block h-px w-32 animate-draw-line bg-wood/60 [animation-delay:2300ms]"
        />

        {/* The two doors */}
        <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <button
            type="button"
            onClick={() => send({ type: 'START' })}
            className="inline-flex animate-rise items-center gap-3 rounded-full border border-accent/60 px-6 py-3 font-mono text-xs tracking-[0.2em] text-accent uppercase transition-colors [animation-delay:2800ms] hover:bg-accent hover:text-night"
          >
            Start the quest
            <kbd className="animate-breathe rounded border border-current/40 px-1.5 text-[0.65rem] [animation-delay:3700ms]">
              Enter
            </kbd>
          </button>

          <a
            href="#about"
            onClick={onSkipClick}
            className="inline-flex animate-rise items-center gap-3 px-2 py-3 font-mono text-xs tracking-[0.2em] text-light/70 uppercase transition-colors [animation-delay:3100ms] hover:text-accent"
          >
            Skip to portfolio
            <kbd className="rounded border border-current/30 px-1.5 text-[0.65rem]">S</kbd>
          </a>
        </div>
      </m.div>
    </section>
  )
}
