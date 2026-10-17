import { m } from 'motion/react'
import type { ReactNode } from 'react'

// One easing curve for the whole site: fast start, long soft landing
const EASE_OUT = [0.22, 1, 0.36, 1] as const

type Props = { children: ReactNode; delay?: number; className?: string }

// Rises out of a slight blur the first time it scrolls into view.
// `whileInView` lets the motion library watch the viewport for us (IntersectionObserver inside).
export function Reveal({ children, delay = 0, className = '' }: Props) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        // a leftover filter would flatten 3D children (the player card flip), so remove it at the end
        transitionEnd: { filter: 'none' },
      }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, delay: delay / 1000, ease: EASE_OUT }}
    >
      {children}
    </m.div>
  )
}

// Text that slides up from behind an invisible edge, like a line of a film title.
// The OUTER box watches the viewport: the inner text starts hidden behind the edge, so the
// browser would never report the text itself as "in view". Variants pass the signal down.
export function MaskReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <m.span
      className="block overflow-hidden pb-[0.08em]"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true }}
    >
      <m.span
        className="block"
        variants={{
          hidden: { y: '110%' },
          shown: { y: '0%', transition: { duration: 1, delay: delay / 1000, ease: EASE_OUT } },
        }}
      >
        {children}
      </m.span>
    </m.span>
  )
}

// A court line that draws itself from left to right
export function DrawLine({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <m.span
      aria-hidden="true"
      className={`block h-px origin-left ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay: delay / 1000, ease: [0.65, 0, 0.35, 1] }}
    />
  )
}
