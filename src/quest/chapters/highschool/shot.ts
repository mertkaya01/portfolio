import type { Locale } from '../../../i18n/locale'

import type { Buffer } from './pixel'

// One shot of Set 1 = one step of the set (its scoreboard, or a scene). Layers are drawn in
// this order:
//   background (a PNG)  →  under (code)  →  sheets (PNG sprite sheets)  →  over (code)
// The PNGs live in public/art/set1/<shot>/…: today drafts exported from code, later Mert's
// own drawings — replacing a file changes the picture, no code needed.
export type SheetLayer = {
  src: string // a horizontal strip of frames, e.g. /art/set1/lunch/kid.png
  frameWidth: number // px of one frame (the strip's height is the frame height)
  frames: number
  fps: number
  x: number // where the frame's top-left corner goes in the 320 × 180 picture
  y: number
  once?: boolean // play once and hold the last frame (default: loop)
  flip?: boolean // mirror it
}

// What the code layers can use besides the picture itself
export type ShotContext = {
  image: (src: string) => Buffer | undefined // another loaded picture (listed in `images`)
  board: { set: number; title: string; period: string } // the set's scoreboard, in the
  // visitor's language
  scene: { index: number; count: number } // which scene this is (-1 on the scoreboard)
}

export type Shot = {
  label?: Record<Locale, string> // what a screen reader hears, in each language
  background?: string // missing: the shot paints everything itself
  images?: string[] // more pictures the code layers draw (loaded together with the rest)
  under?: (b: Buffer, t: number, ctx: ShotContext) => void // t = seconds since it appeared
  sheets?: SheetLayer[]
  over?: (b: Buffer, t: number, ctx: ShotContext) => void
  still: number // the moment shown, frozen, to visitors who prefer less motion
}
