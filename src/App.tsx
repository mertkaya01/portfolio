// Milestone 1 placeholder: proves React, TypeScript and Tailwind (with our tokens) all work.
// This screen becomes the real "quest" landing in Milestone 6.
import { FlyInTitle } from '@/features/landing/FlyInTitle'

const NAME = 'MERT KAYA'

// Timeline of the entrance (ms). Each element waits for its turn.
const NAME_START = 500
const LETTER_GAP = 80

function App() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Overhead spotlight: a big blurred ellipse of cool light that flickers on */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 h-96 w-[48rem] max-w-[150vw] -translate-x-1/2 animate-light-on rounded-full bg-light/10 blur-3xl"
      />

      <p className="animate-rise text-xs tracking-[0.4em] text-muted uppercase [animation-delay:300ms]">
        Portfolio · 2026
      </p>

      <FlyInTitle name={NAME} start={NAME_START} gap={LETTER_GAP} />

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
        <kbd className="inline-block animate-breathe rounded border border-muted/40 px-2 py-0.5 font-body text-accent [animation-delay:3700ms]">
          Enter
        </kbd>{' '}
        to start — coming soon
      </p>
    </main>
  )
}

export default App
