import type { Chapter } from '@/types/content'

// What every set's art receives. The art follows the story:
// - `chapter`: the set's text in the current language (title and period for a scoreboard,
//   scene ids and captions)
// - `scene`: the scene being shown (0-based), or -1 while the set's scoreboard is up
//   (only for sets that draw their own scoreboard — see chapters.ts)
export type ArtProps = { chapter: Chapter; scene: number }

// How a set's art is shown: in a panel next to the text, or across the whole stage
export type SetLayout = 'panel' | 'fullscreen'
