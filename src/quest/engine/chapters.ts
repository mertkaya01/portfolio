import { lazy, type ComponentType } from 'react'

import { chapters } from '@/data/en/quest'
import type { ChapterId } from '@/types/content'

import type { ArtProps, SetLayout } from './types'

type ArtModule = { default: ComponentType<ArtProps> }

// Which file draws each set's art. `import()` (a dynamic import) makes Vite put every set's
// art in its own small file, downloaded only when that set is about to be played — so the
// pixel sprites, the ASCII renderer and later three.js never slow down the first visit.
const ART: Record<ChapterId, () => Promise<ArtModule>> = {
  highschool: () => import('../chapters/highschool/HighSchoolArt'),
  exam: () => import('../chapters/exam/ExamArt'),
  university: () => import('../chapters/university/UniversityArt'),
  erasmus: () => import('../chapters/erasmus/ErasmusArt'),
  now: () => import('../chapters/now/TieBreakArt'),
}

type Staging = {
  layout: SetLayout // the art in a panel next to the text, or across the whole stage
  // true: the art draws the set's scoreboard itself, in its own style (Set 1: the pixel arena
  // zooming in on its scoreboard). Otherwise the stage shows the shared SetScoreboard.
  ownScoreboard: boolean
  scoreboardMs?: number // how long the scoreboard stays when playing by itself (default 3.5 s)
}
const STAGING: Partial<Record<ChapterId, Staging>> = {
  // full-screen pixel art, 320 × 180. Its scoreboard step is longer: the arena, the camera
  // moving in, and the lights of the scoreboard coming on one by one.
  highschool: { layout: 'fullscreen', ownScoreboard: true, scoreboardMs: 6500 },
  // pencil sketches on paper (SVG); the scoreboard is drawn and written by hand
  exam: { layout: 'fullscreen', ownScoreboard: true, scoreboardMs: 5500 },
  // an amber terminal (ASCII); a little program prints the scoreboard
  university: { layout: 'fullscreen', ownScoreboard: true, scoreboardMs: 5500 },
  // flat vector illustration; the scoreboard is a card with the Erasmus ring of stars
  erasmus: { layout: 'fullscreen', ownScoreboard: true, scoreboardMs: 5000 },
  // 3D: the arena at night, the scoreboard on its big screen
  now: { layout: 'fullscreen', ownScoreboard: true, scoreboardMs: 5000 },
}
const DEFAULT_STAGING: Staging = { layout: 'panel', ownScoreboard: false }

// The sets in order, each with its art.
// - Art: a lazy component — React shows the frame empty for a moment if the file isn't here yet
// - preload: starts the download early (the stage calls it for the current and the next set)
export const questChapters = chapters.map((chapter) => {
  const load = ART[chapter.id]
  return {
    id: chapter.id,
    Art: lazy(load),
    preload: load,
    ...(STAGING[chapter.id] ?? DEFAULT_STAGING),
  }
})
