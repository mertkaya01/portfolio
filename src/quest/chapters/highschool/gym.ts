import { C, disc, dither, pset, rect, sprite, type Buffer } from './pixel'
import { BALL, STAR } from './sprites'

// Pieces shared by the two gym shots (first match, Aydın 2020), at full-screen scale:
// 1 m ≈ 16 px, so the net's top is 38 px over the floor and its mesh 16 px deep.

// The net from the side: you look along it, so it is thin — post, mesh, white tape, and the
// red-and-white antenna that sticks up 0.8 m over the tape
export function net(b: Buffer, x: number, floor: number) {
  const top = floor - 38
  rect(b, x, top, 2, floor - top, C.ink)
  for (let y = top + 1; y < top + 16; y++) {
    for (let i = x - 2; i <= x + 3; i++) if ((i + y) % 2 === 0) pset(b, i, y, C.ink)
  }
  rect(b, x - 2, top, 6, 2, C.white)
  for (let y = top - 13; y < top; y++)
    pset(b, x, y, Math.floor((y - top) / 2) % 2 ? C.red : C.white)
}

// A row of hanging lamps, each with a soft dithered cone of light down to the floor
export function lamps(
  b: Buffer,
  xs: number[],
  y: number,
  floor: number,
  light: number,
  strength = 0.18,
) {
  for (const x of xs) {
    for (let j = y + 3; j < floor; j++) {
      const half = 3 + (j - y) * 0.32
      for (let i = Math.floor(x - half); i <= x + half; i++) {
        const edge = 1 - Math.abs(i - x) / (half + 1)
        if (dither(i, j, strength * edge, 0, 1)) pset(b, i, j, light)
      }
    }
    rect(b, x - 1, 0, 1, y - 1, C.grey) // the cable
    rect(b, x - 3, y - 1, 7, 2, C.slate) // the shade
    rect(b, x - 2, y + 1, 5, 1, C.glow) // the bulb
  }
}

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

// A floor of wooden boards seen from the side: board seams run across, closer together far away
export function parquet(b: Buffer, from: number, to: number, base: number, seam: number) {
  rect(b, 0, from, b.w, to - from, base)
  let gap = 2
  for (let y = from + 1; y < to; y += gap, gap = Math.min(7, gap + 1)) {
    for (let x = 0; x < b.w; x++) if ((x + y * 5) % 23 !== 0) pset(b, x, y, seam)
    for (let x = (y * 13) % 29; x < b.w; x += 29) pset(b, x, y + 1, seam) // board ends
  }
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

// A ball's flight between two points: a straight line plus an arc (height h px at the middle)
export function arc(
  from: readonly [number, number],
  to: readonly [number, number],
  p: number,
  h: number,
): [number, number] {
  const q = Math.min(1, Math.max(0, p))
  return [from[0] + (to[0] - from[0]) * q, from[1] + (to[1] - from[1]) * q - 4 * h * q * (1 - q)]
}
