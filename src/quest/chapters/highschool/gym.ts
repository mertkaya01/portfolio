import { C, disc, dither, pset, rect, sprite, type Buffer } from './pixel'
import { BALL, STAR } from './sprites'

// Small pieces shared by Set 1's scenes: roof trusses, a flag on a wall, a volleyball, a tree.

// Steel roof trusses: a lattice of thin diagonal beams
export function trusses(b: Buffer, height: number, beam: number, back: number) {
  for (let y = 0; y < height; y++) for (let x = 0; x < b.w; x++) pset(b, x, y, back)
  for (let x = -height; x < b.w + height; x += 16) {
    for (let y = 0; y < height; y++) {
      pset(b, x + y, y, beam)
      pset(b, x + 16 - y, y, beam)
    }
  }
  rect(b, 0, height - 2, b.w, 2, beam)
  rect(b, 0, 0, b.w, 1, beam)
}

// The Turkish flag on a wall: red, a crescent (a white disc with a red one cut out) and the star
export function wallFlag(b: Buffer, x: number, y: number) {
  rect(b, x, y, 32, 22, C.red)
  disc(b, x + 11, y + 11, 6, C.white)
  disc(b, x + 13, y + 11, 5, C.red)
  sprite(b, STAR, x + 17, y + 9, { '#': C.white })
}

export function ball(b: Buffer, x: number, y: number) {
  sprite(b, BALL, Math.round(x) - 3, Math.round(y) - 3, { k: C.ink, y: C.sun, a: C.sea })
}

// A tree from above: a round crown in three greens with a dark edge, its shadow to the right
export function tree(b: Buffer, x: number, y: number) {
  for (let j = -11; j <= 11; j++) {
    for (let i = -11; i <= 11; i++) {
      if (i * i + j * j < 121 && dither(x + i + 6, y + j + 5, 0.6, 0, 1)) {
        pset(b, x + i + 6, y + j + 5, C.creamShade) // shadow on the slabs
      }
    }
  }
  disc(b, x, y, 13, C.leafDark)
  disc(b, x - 1, y - 1, 11, C.green)
  // clumps of leaves: lighter on the sunny upper left
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    const cx = x - 1 + Math.round(Math.cos(a) * 6)
    const cy = y - 1 + Math.round(Math.sin(a) * 6)
    disc(b, cx, cy, 3, cx + cy < x + y - 4 ? C.leafLight : C.green)
    pset(b, cx + 2, cy + 2, C.leafDark)
  }
  disc(b, x - 3, y - 3, 3, C.leafLight)
}
