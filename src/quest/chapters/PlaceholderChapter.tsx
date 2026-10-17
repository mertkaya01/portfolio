import type { ChapterProps } from '../engine/types'

// A temporary scene: the set number in the background, the title, and the story so far.
// The newest line is bright; the earlier ones step back. Real scenes replace this later.
export function PlaceholderChapter({ chapter, beat }: ChapterProps) {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col justify-center px-6">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-display text-[16rem] leading-none font-black text-light/[0.04] sm:text-[24rem]"
      >
        {chapter.set}
      </span>

      <p className="font-mono text-xs tracking-[0.3em] text-wood uppercase">{chapter.period}</p>
      <h2 className="mt-3 font-display text-5xl font-black tracking-tight uppercase sm:text-7xl">
        {chapter.title}
      </h2>

      {/* (Screen readers hear each new line from the stage's announcement, not from here) */}
      <ol className="mt-10 space-y-4">
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
