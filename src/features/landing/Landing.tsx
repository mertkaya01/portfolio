// The opening scene: a dark arena, one lamp switching on above an empty court, the name falling
// out of the light — and two doors: play the story, or skip to the portfolio.
import { m, useInView, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, type MouseEvent } from 'react'

import { isQuestOpen } from '@/app/experienceMachine'
import { useExperience } from '@/app/experienceStore'
import { profile } from '@/data/profile'
import { handlesOwnKeys, hasModifier } from '@/lib/keyboard'
import { CourtFloor } from '@/quest/scene-kit/CourtFloor'
import { Grain } from '@/quest/scene-kit/Grain'
import { LightCone } from '@/quest/scene-kit/LightCone'
import { ParallaxLayer, ParallaxScene } from '@/quest/scene-kit/Parallax'

import { FlyInTitle } from './FlyInTitle'

// Timeline of the entrance (ms). Each element waits for its turn:
// the lamp flickers on → the letters fall out of its light → the court is traced → the doors
const LAMP_ON = 200
const NAME_START = 500
const LETTER_GAP = 80
const COURT_START = 2100

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
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

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

  // A real link (it still works without JavaScript, or opened in a new tab), but the click is
  // handled here: a plain "#about" jump would be undone by the router's scroll restoration
  function onSkipClick(e: MouseEvent) {
    e.preventDefault()
    skip()
  }

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Intro"
      // isolate: the scene layers below (-z-10) stay inside this section, under the text.
      // pb: the content sits a little above the middle, leaving the floor to the court.
      className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 pb-[16vh] text-center"
    >
      {/* The landing is its own dark scene: it covers the site's arena backdrop, and only lets
          it through at the very bottom, so scrolling into the portfolio has no hard edge */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-night from-95%"
      />

      {/* The scene: lamp and court. It fades as you scroll away. */}
      <m.div
        aria-hidden="true"
        style={{ opacity: sceneOpacity }}
        className="absolute inset-0 -z-10"
      >
        <ParallaxScene className="absolute inset-0">
          <ParallaxLayer depth={6} className="absolute inset-0">
            <LightCone dust delay={LAMP_ON} />
          </ParallaxLayer>

          <ParallaxLayer depth={-16} className="absolute inset-x-0 bottom-0 h-[42%]">
            {/* warm pool of light where the beam meets the parquet */}
            <div
              className="absolute inset-x-[18%] top-[22%] bottom-[2%] animate-light-on rounded-[50%] bg-wood/10 blur-3xl"
              style={{ animationDelay: `${LAMP_ON}ms` }}
            />
            {/* the court lines fade out where the light ends */}
            <CourtFloor
              start={COURT_START}
              className="absolute inset-0 size-full [mask-image:radial-gradient(ellipse_62%_85%_at_50%_70%,#000_45%,transparent_100%)]"
            />
          </ParallaxLayer>
        </ParallaxScene>
      </m.div>
      {/* Grain sits outside the fading layer: a layer with opacity is mixed on its own, so the
          grain's blend would see only empty space there instead of the dark scene */}
      <Grain
        opacity={0.3}
        className="-z-10 [mask-image:linear-gradient(to_bottom,#000_85%,transparent_92%)]"
      />

      <m.div style={{ y, scale, opacity }} className="flex flex-col items-center">
        <p className="animate-rise font-mono text-xs tracking-[0.4em] text-muted uppercase [animation-delay:300ms]">
          Portfolio · 2026
        </p>

        <FlyInTitle name={profile.name.toUpperCase()} start={NAME_START} gap={LETTER_GAP} />

        <p className="mt-4 animate-track-in text-base tracking-[0.3em] text-wood uppercase [animation-delay:1900ms] sm:text-lg">
          Beyond the Court
        </p>

        <p className="mt-5 max-w-sm animate-rise text-sm text-light/60 [animation-delay:2500ms] sm:text-base">
          My story so far, played as a five-set match.
        </p>

        {/* The two doors */}
        <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
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
