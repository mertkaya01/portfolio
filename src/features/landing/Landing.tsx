// The dark opening screen. It becomes the real "quest" landing in Milestone 6;
// until then "Skip to portfolio" simply scrolls down to the portfolio.
import { m, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { profile } from '@/data/profile'

import { FlyInTitle } from './FlyInTitle'

// Timeline of the entrance (ms). Each element waits for its turn.
const NAME_START = 500
const LETTER_GAP = 80

export function Landing() {
  const ref = useRef<HTMLElement>(null)

  // 0 while the landing fills the screen → 1 once it has scrolled completely out of view
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // As you scroll away, the title sinks back slower than the page, shrinks and fades:
  // the portfolio slides over it like the next scene of a film
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const lightOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

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

        <p className="mt-12 animate-rise text-sm text-muted [animation-delay:2800ms]">
          Press{' '}
          <kbd className="inline-block animate-breathe rounded border border-muted/40 px-2 py-0.5 font-mono text-accent [animation-delay:3700ms]">
            Enter
          </kbd>{' '}
          to start — coming soon
        </p>

        <a
          href="#about"
          className="mt-6 animate-rise font-mono text-xs tracking-[0.25em] text-light/70 uppercase transition-colors [animation-delay:3100ms] hover:text-accent"
        >
          Skip to portfolio ↓
        </a>
      </m.div>
    </section>
  )
}
