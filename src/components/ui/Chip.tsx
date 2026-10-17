import type { ReactNode } from 'react'

type Tone = 'muted' | 'accent' | 'wood'

const TONES: Record<Tone, string> = {
  muted: 'border-light/15 text-light/70',
  accent: 'border-accent/40 text-accent',
  wood: 'border-wood/40 text-wood',
}

// Small labelled pill: tech names, roles, status
export function Chip({ children, tone = 'muted' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.7rem] tracking-wide ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}
