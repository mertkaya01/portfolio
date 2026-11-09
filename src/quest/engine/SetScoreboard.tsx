import { useT } from '@/i18n'
import type { Chapter } from '@/types/content'

import { Grain } from '../scene-kit/Grain'
import { LightCone } from '../scene-kit/LightCone'

// The scoreboard that opens a set: SET n · TITLE · PERIOD.
// This is the shared version, in the portfolio's own look. A set whose art draws its own
// scoreboard in its style (Set 1: pixel art) uses that instead — see chapters.ts.
export function SetScoreboard({ chapter }: { chapter: Chapter }) {
  const t = useT()
  return (
    <div className="relative flex h-full items-center justify-center px-4 sm:px-6">
      <LightCone spread={18} intensity={0.12} dust className="absolute inset-0" />
      <Grain />

      <div className="relative w-full max-w-xl animate-rise overflow-hidden rounded-2xl border border-light/10 bg-black/70 text-center shadow-[0_0_80px_rgb(0_0_0/0.7)]">
        {/* the top of an arena scoreboard: two status lamps and a label */}
        <div className="flex items-center justify-between border-b border-light/10 px-5 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-1.5 rounded-full bg-accent" />
            <span className="size-1.5 rounded-full bg-accent/40" />
          </span>
          <span className="font-mono text-[0.65rem] tracking-[0.3em] text-muted uppercase">
            {t.quest.set} {chapter.set} / 5
          </span>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <p className="font-mono text-xs tracking-[0.35em] text-muted uppercase">{t.quest.set}</p>
          {/* the set number glows like the digits of a real scoreboard */}
          <p className="mt-1 font-mono text-7xl leading-none font-bold text-accent [text-shadow:0_0_28px_rgb(255_210_63/0.45)] sm:text-8xl">
            {chapter.set}
          </p>
          <h2 className="mt-6 font-display text-4xl font-black tracking-tight text-light uppercase sm:text-6xl">
            {chapter.title}
          </h2>
          <p className="mt-4 font-mono text-sm tracking-[0.3em] text-wood">{chapter.period}</p>
        </div>
      </div>
    </div>
  )
}
