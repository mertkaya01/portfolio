import { useT } from '@/i18n'
import type { ChapterId } from '@/types/content'

import type { ArtProps } from '../engine/types'

type Props = ArtProps & {
  set: ChapterId // which set: its art style and idea come from the interface text (src/i18n)
  milestone: string // when the real art arrives
}

// The four corners of a camera viewfinder
const CORNERS = [
  'top-4 left-4 border-t border-l',
  'top-4 right-4 border-t border-r',
  'bottom-4 left-4 border-b border-l',
  'bottom-4 right-4 border-b border-r',
]

// A temporary art panel, like an empty frame on a storyboard: which style is coming, the idea
// of the scene, and which "shot" (line of the set) we are on. Each set's real art replaces it.
export function ArtPlaceholder({ set, milestone, beat, beats }: Props) {
  const t = useT()
  const { style, idea } = t.quest.art.sets[set]
  return (
    <div className="relative flex size-full flex-col items-center justify-center p-10 text-center">
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          className={`absolute size-5 border-wood/50 ${corner}`}
        />
      ))}

      <p className="font-mono text-[0.65rem] tracking-[0.3em] text-muted uppercase">
        {t.quest.art.label} · {milestone}
      </p>
      <p className="mt-3 font-display text-4xl font-black tracking-tight text-light/90 uppercase sm:text-5xl">
        {style}
      </p>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-light/55">{idea}</p>

      <p className="absolute right-6 bottom-5 font-mono text-[0.6rem] tracking-[0.25em] text-muted uppercase">
        {t.quest.art.shot(beat + 1, beats)}
      </p>
    </div>
  )
}
