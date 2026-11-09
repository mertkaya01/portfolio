import type { Chapter, QuestScene } from '@/types/content'

// Inside a set the quest moves in steps: first the set's scoreboard, then each scene.
//   step 0      → the scoreboard   (SET 1 · HIGH SCHOOL · 07.2017 – 07.2021)
//   step 1 … n  → scene 0 … n-1
// The state machine only counts steps (its "beat"); this file says what each step shows.
export type Step = { kind: 'scoreboard' } | { kind: 'scene'; scene: QuestScene; index: number }

export const stepsIn = (chapter: Pick<Chapter, 'scenes'>) => 1 + chapter.scenes.length

export function stepOf(chapter: Chapter, step: number): Step {
  if (step <= 0 || chapter.scenes.length === 0) return { kind: 'scoreboard' }
  const index = Math.min(step, chapter.scenes.length) - 1
  return { kind: 'scene', scene: chapter.scenes[index], index }
}

// How long a step stays on screen when the quest plays by itself: long enough to read the
// caption calmly (about 15 characters a second on top of a short look at the picture)
const SCOREBOARD_MS = 3500
const MIN_MS = 3200
const MAX_MS = 7000

export function stepDuration(step: Step, scoreboardMs = SCOREBOARD_MS) {
  if (step.kind === 'scoreboard') return scoreboardMs
  const { duration, caption } = step.scene
  return duration ?? Math.min(MAX_MS, Math.max(MIN_MS, 1800 + caption.length * 65))
}
