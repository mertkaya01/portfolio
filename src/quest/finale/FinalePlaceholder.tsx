import { useT } from '@/i18n'

import { Grain } from '../scene-kit/Grain'
import { LightCone } from '../scene-kit/LightCone'

// Temporary finale: match point and a button to take it. Milestones 7–9 replace this with the
// 3D court, where you time the spike yourself.
export function FinalePlaceholder({ onSpike }: { onSpike: () => void }) {
  const t = useT()
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
      <LightCone spread={16} intensity={0.16} dust className="absolute inset-0" />
      <Grain />

      <p className="relative font-mono text-xs tracking-[0.3em] text-wood uppercase">
        {t.quest.finale.kicker}
      </p>
      <h2 className="relative mt-4 animate-rise font-display text-7xl font-black tracking-tight text-accent uppercase [text-shadow:0_0_30px_rgb(255_210_63/0.35)] sm:text-9xl">
        {t.quest.finale.title}
      </h2>
      <p className="relative mt-6 max-w-md text-light/70">{t.quest.finale.text}</p>
      <button
        type="button"
        onClick={onSpike}
        className="relative mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-mono text-xs font-semibold tracking-[0.15em] text-night uppercase transition-colors hover:bg-light"
      >
        {t.quest.finale.spike}
        <kbd className="rounded border border-night/30 px-1.5 text-[0.65rem]">Space</kbd>
      </button>
    </div>
  )
}
