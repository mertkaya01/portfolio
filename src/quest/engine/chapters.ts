import type { ComponentType } from 'react'

import { chapters } from '@/data/quest'
import type { ChapterId } from '@/types/content'

import { PlaceholderChapter } from '../chapters/PlaceholderChapter'

import type { ChapterProps } from './types'

// Which component draws each chapter. They all start as the placeholder; Milestones 10–14
// each replace one line here with the real scene (high school court, exam night, …).
const SCENES: Record<ChapterId, ComponentType<ChapterProps>> = {
  highschool: PlaceholderChapter,
  exam: PlaceholderChapter,
  university: PlaceholderChapter,
  erasmus: PlaceholderChapter,
  now: PlaceholderChapter,
}

// The chapters in order, each with its scene. Content comes from data/quest.ts.
export const questChapters = chapters.map((chapter) => ({ chapter, Scene: SCENES[chapter.id] }))
