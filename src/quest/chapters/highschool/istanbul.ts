import {
  C,
  createBuffer,
  disc,
  FULL,
  gradient,
  hash,
  pset,
  rect,
  shadeLeft,
  sprite,
  type Buffer,
} from './pixel'
import type { Shot } from './shot'
import { GULL_DOWN, GULL_UP } from './sprites'

// Shot 1, full screen (320 × 180): "Istanbul, 2017." The old city's skyline against the
// sunset — a great mosque with four minarets, a smaller one further along, Galata Tower on
// its hill across the water — and the sun sinking into the sea. Moving: the sun's
// reflection glitters, seagulls drift by, a ferry crosses.

const HORIZON = 112
const SUN = { x: 212, r: 22 }
const SHORE = 104 // the old city's waterfront

// A slender minaret: tower, two balconies, cone and spire
function minaret(b: Buffer, x: number, top: number) {
  rect(b, x, top + 6, 3, SHORE - top - 6, C.ink)
  rect(b, x - 1, top + 14, 5, 1, C.ink)
  rect(b, x - 1, top + 24, 5, 1, C.ink)
  rect(b, x, top + 3, 3, 3, C.ink)
  rect(b, x + 1, top, 1, 3, C.ink)
}

export function paintIstanbulBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  gradient(b, 0, HORIZON, [
    [0, C.night],
    [0.3, C.dusk],
    [0.55, C.plum],
    [0.78, C.coral],
    [0.92, C.orange],
    [1, C.peach],
  ])
  for (let i = 0; i < 40; i++) {
    pset(b, hash(i, 1) * FULL.w, hash(i, 2) * 40, hash(i, 3) > 0.6 ? C.white : C.grey)
  }

  // the sun, half sunk, and the sea
  disc(b, SUN.x, HORIZON, SUN.r, C.sun, HORIZON)
  disc(b, SUN.x, HORIZON, SUN.r - 7, C.glow, HORIZON)
  gradient(b, HORIZON, FULL.h, [
    [0, C.teal],
    [0.3, C.sea],
    [1, C.night],
  ])

  // the old city along the water
  rect(b, 0, SHORE, 182, HORIZON - SHORE, C.ink)
  for (const [x, y, w] of [
    [0, 94, 14],
    [14, 98, 10],
    [118, 97, 12],
    [182, 106, 10],
  ]) {
    rect(b, x, y, w, HORIZON - y, C.ink)
  }
  // the great mosque: main dome, half domes, small domes, four minarets
  rect(b, 36, 92, 72, 12, C.ink)
  disc(b, 72, 92, 18, C.ink)
  rect(b, 72, 68, 1, 6, C.ink)
  disc(b, 50, 95, 10, C.ink)
  disc(b, 94, 95, 10, C.ink)
  disc(b, 40, 99, 5, C.ink)
  disc(b, 104, 99, 5, C.ink)
  minaret(b, 29, 50)
  minaret(b, 113, 50)
  minaret(b, 39, 66)
  minaret(b, 102, 66)
  // a second mosque further along
  rect(b, 140, 96, 34, 8, C.ink)
  disc(b, 157, 96, 9, C.ink)
  rect(b, 157, 84, 1, 4, C.ink)
  minaret(b, 134, 74)
  minaret(b, 177, 74)

  // Galata Tower on its hill across the water, the top windows lit
  disc(b, 292, 146, 44, C.ink, HORIZON)
  rect(b, 282, 70, 13, 34, C.ink)
  for (let i = 0; i < 15; i++) {
    const half = Math.floor(i / 2)
    rect(b, 288 - half, 56 + i, 1 + half * 2, 1, C.ink)
  }
  for (const x of [284, 287, 290, 293]) pset(b, x, 76, C.glow)
  for (const [x, y] of [
    [262, 108],
    [268, 104],
    [300, 102],
    [310, 106],
    [276, 110],
    [252, 110],
  ]) {
    pset(b, x, y, C.peach)
  }

  shadeLeft(b)
  return b
}

// ---------- The moving layers ----------

// The sun's road on the water: broken dashes that glitter (the pattern shifts six times a
// second, every other row the other way) and narrow towards the horizon
function glitter(b: Buffer, t: number) {
  const f = Math.floor(t * 6)
  for (let row = 0; row < 30; row++) {
    const y = HORIZON + 1 + row * 2
    if (y >= FULL.h) break
    const half = 26 - row * 0.7
    const tone = row < 6 ? C.glow : row < 14 ? C.sun : row < 22 ? C.orange : C.coral
    for (let x = Math.round(SUN.x - half); x <= SUN.x + half; x++) {
      if (hash(Math.floor((x + (row % 2 ? f : -f)) / 4), row) > 0.42) pset(b, x, y, tone)
    }
  }
}

const GULLS = [
  { x: 60, y: 40, speed: 7, phase: 0 },
  { x: 140, y: 30, speed: 5, phase: 1.3 },
  { x: 250, y: 48, speed: 6, phase: 2.1 },
  { x: 90, y: 58, speed: 4, phase: 0.7 },
]
function gulls(b: Buffer, t: number) {
  for (const g of GULLS) {
    const x = ((g.x + t * g.speed) % 360) - 20
    const y = g.y + Math.sin(t * 1.4 + g.phase) * 2
    const flap = Math.floor(t * 4 + g.phase * 2) % 2
    sprite(b, flap ? GULL_DOWN : GULL_UP, x, y, { k: C.ink })
  }
}

// A Bosphorus ferry crossing from right to left: hull, cabins, funnel, lit windows, smoke
function ferry(b: Buffer, t: number) {
  const x = Math.round(340 - ((t * 7) % 420))
  const y = 132 // waterline
  for (let r = 0; r < 4; r++) rect(b, x + r, y - 4 + r, 36 - r, 1, C.ink) // the bow slants
  rect(b, x + 6, y - 8, 26, 4, C.ink)
  rect(b, x + 10, y - 11, 16, 3, C.ink)
  rect(b, x + 20, y - 17, 4, 6, C.ink)
  for (let i = 0; i < 8; i++) pset(b, x + 8 + i * 3, y - 6, C.glow)
  for (let k = 0; k < 4; k++) {
    const age = (t * 2 + k) % 4
    pset(b, x + 22 + age * 3, y - 19 - age * 2, age < 2 ? C.grey : C.dusk)
  }
}

export const istanbulShot: Shot = {
  label:
    'Pixel art: the Istanbul skyline at sunset, the sun sinking into the sea, a ferry crossing.',
  background: '/art/set1/shot1/background.png',
  over: (b, t) => {
    glitter(b, t)
    gulls(b, t)
    ferry(b, t + 18) // starts mid-crossing, not off screen
  },
  still: 0,
}
