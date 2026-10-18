import type { ChapterProps } from '../engine/types'
import { Grain } from '../scene-kit/Grain'
import { LightCone } from '../scene-kit/LightCone'

// A temporary scene: one lamp over the set, the set number in the background, the title, and
// the story so far. The newest line is bright; the earlier ones step back. Real scenes
// (Milestones 10–14) replace this, built from the same scene-kit.
export function PlaceholderChapter({ chapter, beat }: ChapterProps) {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col justify-center px-6">
      {/* a new set switches its lamp on (the component is mounted again for every set) */}
      <LightCone spread={20} intensity={0.1} className="absolute inset-0" />
      {/* scene-kit order: light → grain → content (grain over the text would make it noisy) */}
      <Grain />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-display text-[16rem] leading-none font-black text-light/[0.04] sm:text-[24rem]"
      >
        {chapter.set}
      </span>

      <p className="relative font-mono text-xs tracking-[0.3em] text-wood uppercase">
        {chapter.period}
      </p>
      <h2 className="relative mt-3 font-display text-5xl font-black tracking-tight uppercase sm:text-7xl">
        {chapter.title}
      </h2>

      {/* (Screen readers hear each new line from the stage's announcement, not from here) */}
      <ol className="relative mt-10 space-y-4">
        {chapter.beats.slice(0, beat + 1).map((line, i) => (
          <li
            key={line}
            className={`max-w-2xl text-xl leading-relaxed transition-colors duration-500 sm:text-2xl ${
              i === beat ? 'animate-rise text-light' : 'text-light/35'
            }`}
          >
            {line}
          </li>
        ))}
      </ol>
    </div>
  )
}
