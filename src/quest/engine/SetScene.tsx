import { Suspense, type ComponentType } from 'react'

import type { Chapter } from '@/types/content'

import { Grain } from '../scene-kit/Grain'
import { LightCone } from '../scene-kit/LightCone'

import type { ArtProps } from './types'

type Props = {
  chapter: Chapter
  beat: number // the line being shown (0-based)
  Art: ComponentType<ArtProps> // this set's art (see chapters.ts)
}

// One set on the stage. Every set shares this frame — the text on the left, the set's own art
// on the right — so the five sets feel like one match, while each art panel has its own style.
//
//   desktop (lg):  [ period · title · story so far ]  [        art panel        ]
//   phone:         [        art panel        ]
//                  [ period · title · this line ]
export function SetScene({ chapter, beat, Art }: Props) {
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

      {/* The story: on a phone only the current line, on a desktop the set so far */}
      <div className="relative order-2 flex min-h-0 flex-col justify-center lg:order-1">
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
      </div>

      {/* The set's art. Suspense: while its file is still downloading, the panel stays empty */}
      <figure className="relative order-1 m-0 min-h-0 overflow-hidden rounded-2xl border border-light/10 bg-black/40 lg:order-2 lg:h-[min(100%,36rem)]">
        <Suspense fallback={null}>
          <Art beat={beat} beats={chapter.beats.length} />
        </Suspense>
      </figure>
    </div>
  )
}
