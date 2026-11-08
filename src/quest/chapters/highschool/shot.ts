import type { Buffer } from './pixel'

// One shot of Set 1 = one line of the story. Layers are drawn in this order:
//   background (a PNG)  →  under (code)  →  sheets (PNG sprite sheets)  →  over (code)
// The PNGs live in public/art/set1/…: today drafts exported from code, later Mert's own
// drawings — replacing a file changes the picture, no code needed.
export type SheetLayer = {
  src: string // a horizontal strip of frames, e.g. /art/set1/shot2/kid.png
  frameWidth: number // px of one frame (the strip's height is the frame height)
  frames: number
  fps: number
  x: number // where the frame's top-left corner goes in the 320 × 180 picture
  y: number
  once?: boolean // play once and hold the last frame (default: loop)
  flip?: boolean // mirror it
}

export type Shot = {
  label: string // what a screen reader hears
  background: string
  under?: (b: Buffer, t: number) => void // t = seconds since the shot appeared
  sheets?: SheetLayer[]
  over?: (b: Buffer, t: number) => void
  still: number // the moment shown, frozen, to visitors who prefer less motion
}
