import { lazy, type ComponentType } from 'react'

import { chapters } from '@/data/quest'
import type { ChapterId } from '@/types/content'

import type { ArtProps, SetLayout } from './types'

type ArtModule = { default: ComponentType<ArtProps> }

// Which file draws each set's art. `import()` (a dynamic import) makes Vite put every set's
// art in its own small file, downloaded only when that set is about to be played — so the
// pixel sprites, the ASCII renderer and later three.js never slow down the first visit.
// Milestones 8–12 each replace one placeholder file with the real scene.
const ART: Record<ChapterId, () => Promise<ArtModule>> = {
  highschool: () => import('../chapters/highschool/HighSchoolArt'),
  exam: () => import('../chapters/exam/ExamArt'),
  university: () => import('../chapters/university/UniversityArt'),
  erasmus: () => import('../chapters/erasmus/ErasmusArt'),
  now: () => import('../chapters/now/TieBreakArt'),
}

// Sets whose art covers the whole stage (the others show it in a panel next to the text)
const LAYOUT: Partial<Record<ChapterId, SetLayout>> = {
  highschool: 'fullscreen', // Mert's full-screen pixel art, 320 × 180
}

// The sets in order, each with its text (data/quest.ts) and its art.
// - Art: a lazy component — React shows the panel empty for a moment if the file isn't here yet
// - preload: starts the download early (the stage calls it for the current and the next set)
export const questChapters = chapters.map((chapter) => {
  const load = ART[chapter.id]
  return { chapter, Art: lazy(load), preload: load, layout: LAYOUT[chapter.id] ?? 'panel' }
})
