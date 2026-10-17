import type { ReactNode } from 'react'

import { DrawLine, MaskReveal, Reveal } from './Reveal'

type Props = {
  id: string // anchor for the nav: /#projects
  index: string // "01"
  kicker: string // small label above the title
  title: string
  intro?: string
  children: ReactNode
}

// Every portfolio section shares this frame and the same entrance:
// label fades in → title slides up from behind a mask → court line draws → intro rises
export function Section({ id, index, kicker, title, intro, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
            <span className="text-accent">{index}</span> — {kicker}
          </p>
        </Reveal>
        <h2
          id={`${id}-title`}
          className="mt-3 font-display text-5xl font-extrabold tracking-tight uppercase sm:text-6xl"
        >
          <MaskReveal delay={100}>{title}</MaskReveal>
        </h2>
        <DrawLine className="mt-5 w-24 bg-wood/60" delay={350} />
        {intro && (
          <Reveal delay={450}>
            <p className="mt-6 max-w-2xl text-light/70">{intro}</p>
          </Reveal>
        )}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}
