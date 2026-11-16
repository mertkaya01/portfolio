import { Suspense, useRef, type ComponentType } from 'react'

import type { Chapter } from '@/types/content'

import { Grain } from '../scene-kit/Grain'
import { LightCone } from '../scene-kit/LightCone'

import { ArtScreen } from './ArtScreen'
import { useScreenSize } from './artWidth'
import { SetScoreboard } from './SetScoreboard'
import { stepOf } from './steps'
import type { Arrival } from './transitions'
import type { ArtProps, SetLayout } from './types'

type Props = {
  chapter: Chapter // the set's text in the current language
  step: number // 0 = the scoreboard, then one step per scene
  Art: ComponentType<ArtProps> // this set's art (see chapters.ts)
  layout: SetLayout
  ownScoreboard: boolean // the art draws the scoreboard itself
  arrival?: Arrival // how this set came on stage (transitions.ts)
}

// One set on the stage. A set opens with its scoreboard, then plays its scenes.
// How the art is shown depends on the set (chapters.ts):
//
//   'panel' (default)                         'fullscreen' (Set 1's pixel art)
//   desktop:  [ story ]  [   art panel   ]      desktop:  [ the art, as big as it fits   ]
//                                                         [          caption             ]
//   phone:    [   art panel   ]                 phone:    [ the art, cropped to its middle ]
//             [ story — this line ]                       [ caption ]
export function SetScene({ chapter, step, Art, layout, ownScoreboard, arrival }: Props) {
  const current = stepOf(chapter, step)
  const scene = current.kind === 'scene' ? current.index : -1
  const figure = useRef<HTMLElement>(null)
  const screen = useScreenSize(figure)

  if (current.kind === 'scoreboard' && !ownScoreboard) return <SetScoreboard chapter={chapter} />

  const art = (
    // Suspense: while the art's file is still downloading, the frame stays empty
    <Suspense fallback={null}>
      <Art chapter={chapter} scene={scene} />
    </Suspense>
  )

  if (layout === 'fullscreen') {
    return (
      // The figure stays the same element from the scoreboard to the last scene, so the art
      // keeps running (and can dissolve from one picture into the next). The caption has its
      // own row under the picture, kept even when empty, so the picture never jumps.
      //   phone:   the picture's height is known (2× of 180 px), so picture + caption sit
      //            together in the middle of the screen
      //   larger:  the picture takes the room that is left and fits itself into it
      // The picture sits on the quest's one screen (ArtScreen: the same size, frame, grain and
      // edges for every set); its width (--art-w) lines the caption up with its left edge, like
      // a subtitle card under it.
      <div data-art-frame className="relative flex h-full w-full flex-col justify-center">
        <h2 className="sr-only">{chapter.title}</h2>
        <figure
          ref={figure}
          className="relative m-0 flex h-[22.5rem] shrink-0 items-center justify-center overflow-hidden sm:h-auto sm:min-h-0 sm:flex-1"
        >
          <ArtScreen size={screen} arrival={arrival}>
            {art}
          </ArtScreen>
        </figure>
        <div className="flex min-h-[6rem] justify-center px-4 pt-4 pb-2 sm:px-6">
          <div className="w-full max-w-(--art-w)">
            {current.kind === 'scene' && <Caption chapter={chapter} index={current.index} />}
          </div>
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
        <Story chapter={chapter} index={scene} />
      </div>

      <figure className="relative order-1 m-0 min-h-0 overflow-hidden rounded-2xl border border-light/10 bg-black/40 lg:order-2 lg:h-[min(100%,36rem)]">
        {art}
      </figure>
    </div>
  )
}

// One short line under a full-screen picture, like a subtitle.
// (Screen readers hear it from the stage's announcement, not from here.)
function Caption({ chapter, index }: { chapter: Chapter; index: number }) {
  const scene = chapter.scenes[index]
  return (
    // key: a new scene's caption rises in; a yellow edge ties it to the picture above
    <div key={scene.id} className="animate-rise border-l-2 border-accent pl-4">
      <p aria-hidden="true" className="font-mono text-[0.65rem] tracking-[0.3em] text-wood">
        {index + 1} / {chapter.scenes.length}
      </p>
      <p className="mt-1.5 max-w-3xl text-base leading-relaxed text-light sm:text-lg">
        {scene.caption}
      </p>
    </div>
  )
}

// The story next to a panel: period, title and the lines so far — on a phone only the current one
function Story({ chapter, index }: { chapter: Chapter; index: number }) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.3em] text-wood uppercase">{chapter.period}</p>
      <h2 className="mt-3 font-display text-5xl font-black tracking-tight uppercase sm:text-6xl xl:text-7xl">
        {chapter.title}
      </h2>
      {/* (Screen readers hear each new line from the stage's announcement, not from here) */}
      <ol className="mt-6 space-y-4 lg:mt-10">
        {chapter.scenes.slice(0, index + 1).map((scene, i) => (
          <li
            key={scene.id}
            className={`max-w-xl text-lg leading-relaxed transition-colors duration-500 sm:text-xl ${
              i === index ? 'animate-rise text-light' : 'hidden text-light/35 lg:block'
            }`}
          >
            {scene.caption}
          </li>
        ))}
      </ol>
    </>
  )
}
