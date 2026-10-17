import type { Chapter } from '@/types/content'

// What every chapter scene receives. A scene shows `chapter` and reveals its beats up to `beat`.
export type ChapterProps = { chapter: Chapter; beat: number }
