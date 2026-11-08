import { Suspense, type ComponentType } from 'react'

import type { Chapter } from '@/types/content'

import { Grain } from '../scene-kit/Grain'
import { LightCone } from '../scene-kit/LightCone'

import type { ArtProps, SetLayout } from './types'

type Props = {
  chapter: Chapter
  beat: number // the line being shown (0-based)
  Art: ComponentType<ArtProps> // this set's art (see chapters.ts)
  layout?: SetLayout
}

// One set on the stage. Every set shares the same story text; how its art is shown depends on
// the set (chapters.ts):
//
//   'panel' (default)                         'fullscreen' (e.g. Set 1's pixel art)
//   desktop:  [ story ]  [   art panel   ]      desktop:  [ story │      the art, edge to edge ]
//   phone:    [   art panel   ]                 phone:    [ the art, cropped to its middle ]
//             [ story — this line ]                       [ story — this line ]
export function SetScene({ chapter, beat, Art, layout = 'panel' }: Props) {
  const art = (
    // Suspense: while the art's file is still downloading, the frame stays empty
    <Suspense fallback={null}>
      <Art beat={beat} beats={chapter.beats.length} />
    </Suspense>
  )

  if (layout === 'fullscreen') {
    return (
      <div className="relative grid h-full w-full grid-rows-[minmax(0,45%)_minmax(0,1fr)] lg:block">
        <figure className="relative m-0 min-h-0 overflow-hidden bg-night lg:absolute lg:inset-0">
          {art}
        </figure>
        {/* desktop: the left of the picture darkens a little, so the text reads on top of it */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-linear-to-r from-night/85 via-night/45 to-transparent lg:block"
        />
        {/* about a third of the width: the part of the picture that is kept calm for the text */}
        <div className="relative flex min-h-0 flex-col justify-center px-4 py-6 sm:px-6 lg:h-full lg:w-[34%] lg:py-10">
          <Story chapter={chapter} beat={beat} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto grid h-full w-full max-w-7xl grid-rows-[minmax(0,2fr)_minmax(0,3fr)] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1 lg:items-center lg:gap-12 lg:py-10">
      {/* The lamp hangs over the text; a new set switches it on again (the scene is new) */}
      <LightCone
        spread={20}
        intensity={0.1}
        className="absolute inset-y-0 left-0 w-full lg:w-[45%]"
      />
      {/* scene-kit order: light → grain → content (grain over the text would make it noisy) */}
      <Grain />

      <div className="relative order-2 flex min-h-0 flex-col justify-center lg:order-1">
        <Story chapter={chapter} beat={beat} />
      </div>

      <figure className="relative order-1 m-0 min-h-0 overflow-hidden rounded-2xl border border-light/10 bg-black/40 lg:order-2 lg:h-[min(100%,36rem)]">
        {art}
      </figure>
    </div>
  )
}

// The story: period, title and the lines so far — on a phone only the current line
function Story({ chapter, beat }: { chapter: Chapter; beat: number }) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.3em] text-wood uppercase">{chapter.period}</p>
      <h2 className="mt-3 font-display text-5xl font-black tracking-tight uppercase sm:text-6xl xl:text-7xl">
        {chapter.title}
      </h2>
      {/* (Screen readers hear each new line from the stage's announcement, not from here) */}
      <ol className="mt-6 space-y-4 lg:mt-10">
        {chapter.beats.slice(0, beat + 1).map((line, i) => (
          <li
            key={line}
            className={`max-w-xl text-lg leading-relaxed transition-colors duration-500 sm:text-xl ${
              i === beat ? 'animate-rise text-light' : 'hidden text-light/35 lg:block'
            }`}
          >
            {line}
          </li>
        ))}
      </ol>
    </>
  )
}
