import { drawFigure, POSES, track, type Key } from './figure'
import { ball } from './gym'
import {
  C,
  createBuffer,
  darker,
  disc,
  FULL,
  gradient,
  hash,
  pset,
  rect,
  shadeLeft,
  type Buffer,
} from './pixel'
import type { Shot } from './shot'

// Shot 2, full screen (320 × 180): Fahreddin Kerim Gökay Anatolian High School at golden hour,
// drawn from the reference photos — terracotta towers with pointed gables, cream wings with
// terracotta pilasters, the arcade of arched windows, the name band, three doors up a stair,
// the flags in front. The sun is low on the right; the left of the picture stays darker,
// because on a desktop the story text sits there.
//
// Split in layers on purpose: the background (everything that stands still) is a PNG that
// Mert can paint over; the kid is a sprite sheet (exported from the skeleton below — his own
// drawing can replace it); the ball, the flags and the kid's shadow are drawn by code on top.

export const GROUND = 128 // where the building meets the schoolyard
const KID = { x: 196, feet: 168 } // the kid's position in the yard

function sky(b: Buffer) {
  gradient(b, 0, GROUND, [
    [0, C.dusk],
    [0.35, C.plum],
    [0.65, C.coral],
    [0.85, C.orange],
    [1, C.peach],
  ])
  disc(b, 298, 40, 11, C.sun)
  disc(b, 298, 40, 7, C.glow)
}

// Small windows in a grid: dark glass, some catching the low sun
function windows(b: Buffer, x0: number, x1: number, step: number, rows: number[], w = 4, h = 5) {
  for (const y of rows) {
    for (let x = x0; x + w <= x1; x += step) {
      const sunny = x > 200 && hash(x, y) > 0.55
      rect(b, x - 1, y - 1, w + 2, h + 2, C.terracotta) // frame
      rect(b, x, y, w, h, sunny ? C.peach : C.deepBlue)
      if (!sunny) pset(b, x, y, C.teal) // a glint in the corner of the glass
    }
  }
}

// A wing: cream walls, terracotta pilasters, five floors of windows
function wing(b: Buffer, x0: number, x1: number) {
  rect(b, x0, 54, x1 - x0, GROUND - 54, C.cream)
  rect(b, x0, 54, x1 - x0, 2, C.terracotta) // cornice
  for (let x = x0 + 2; x < x1 - 2; x += 12) rect(b, x, 56, 3, GROUND - 56, C.terracotta)
  windows(b, x0 + 7, x1 - 2, 12, [60, 74, 88, 102, 116])
}

// A tower: terracotta, with a pointed gable on top and a cream inset panel
function tower(b: Buffer, x0: number) {
  const cx = x0 + 9
  for (let y = 34; y < 47; y++) {
    const half = Math.round(9 * Math.sqrt((y - 34) / 12))
    rect(b, cx - half, y, half * 2 + 1, 1, C.terracotta)
  }
  rect(b, x0, 46, 19, GROUND - 46, C.terracotta)
  for (let y = 39; y < 50; y++) {
    const half = Math.round(4 * Math.sqrt((y - 39) / 10))
    rect(b, cx - half, y, half * 2 + 1, 1, C.cream)
  }
  rect(b, cx - 1, 44, 3, 4, C.deepBlue)
  rect(b, x0 + 4, 52, 11, GROUND - 56, C.cream)
  for (const y of [56, 70, 84, 98, 112]) {
    rect(b, cx - 2, y, 5, 6, C.deepBlue)
    rect(b, cx - 3, y + 6, 7, 1, C.terracotta) // little balcony
  }
}

// The central block: windows, the name band, the arcade, three doors up the stair
function centre(b: Buffer) {
  const x0 = 158
  const x1 = 222
  rect(b, x0, 50, x1 - x0, GROUND - 50, C.cream)
  rect(b, x0, 50, x1 - x0, 2, C.terracotta)
  windows(b, x0 + 6, x1 - 2, 9, [54], 4, 5)

  // the name band (a white sign, a line of "letters", the emblem)
  rect(b, 166, 64, 48, 7, C.white)
  rect(b, 170, 67, 40, 1, C.grey)
  disc(b, 169, 67, 1, C.red)

  // the arcade: four arched windows in terracotta frames
  rect(b, x0, 73, x1 - x0, 23, C.terracotta)
  for (const x of [163, 177, 191, 205]) {
    rect(b, x, 79, 11, 15, C.cream)
    disc(b, x + 5, 79, 5, C.cream)
    rect(b, x + 2, 80, 7, 13, C.deepBlue)
    disc(b, x + 5, 80, 3, C.deepBlue)
    if (x > 190) rect(b, x + 3, 84, 2, 6, C.peach) // the sun in the glass
  }
  rect(b, x0, 96, x1 - x0, 2, C.terracotta)
  windows(b, x0 + 6, x1 - 2, 11, [100], 5, 5)

  // three doors and the stair
  for (const x of [170, 186, 202]) {
    rect(b, x - 1, 108, 10, 15, C.terracotta)
    rect(b, x, 109, 8, 14, C.ink)
  }
  for (let i = 0; i < 3; i++) {
    rect(b, 162 - i * 2, 122 + i * 2, 56 + i * 4, 2, i % 2 ? C.creamShade : C.cream)
  }
  rect(b, 160, 122, 2, 6, C.terracotta)
  rect(b, 218, 122, 2, 6, C.terracotta)
}

// The flags in front of the school, waving: each column of the cloth moves up and down a
// little on a wave that travels along it
function flags(b: Buffer, t: number) {
  for (const x of [122, 130]) {
    rect(b, x, 78, 1, GROUND - 78, C.ink)
    const cloth = { x: x + 1, y: 78, w: 9, h: 6 }
    for (let i = 0; i < cloth.w; i++) {
      const dy = Math.round(Math.sin(i * 0.7 - t * 5 + x) * (i / cloth.w) * 1.4)
      rect(b, cloth.x + i, cloth.y + dy, 1, cloth.h, C.red)
      // the crescent and star ride on the cloth
      if (i === 2) rect(b, cloth.x + i, cloth.y + dy + 2, 1, 2, C.white)
      if (i === 3) {
        pset(b, cloth.x + i, cloth.y + dy + 1, C.white)
        pset(b, cloth.x + i, cloth.y + dy + 4, C.white)
      }
      if (i === 6) rect(b, cloth.x + i, cloth.y + dy + 2, 1, 2, C.white)
    }
  }
}

// The schoolyard, as in the photo: a wide square of light concrete slabs, warm in the evening
// sun. The seams between the slabs run towards a point above the stair (perspective) and the
// cross seams get further apart as they come towards you. At the foot of the building a
// yellow-and-white curb, and one white dashed line across the yard.
function yard(b: Buffer) {
  gradient(b, GROUND, FULL.h, [
    [0, C.cream],
    [0.4, C.creamShade],
    [1, C.grey],
  ])
  const seam = (x: number, y: number) => {
    const xi = Math.round(x)
    if (xi >= 0 && xi < FULL.w) b.data[y * FULL.w + xi] = darker(b.data[y * FULL.w + xi])
  }
  const VANISH = { x: 190, y: 92 }
  for (const bottom of [-260, -120, 10, 120, 190, 260, 370, 500, 640]) {
    for (let y = GROUND + 1; y < FULL.h; y++) {
      const t = (y - VANISH.y) / (FULL.h - VANISH.y)
      seam(VANISH.x + (bottom - VANISH.x) * t, y)
    }
  }
  for (const y of [133, 140, 150, 164]) for (let x = 0; x < FULL.w; x++) seam(x, y)

  // the curb along the building (not in front of the stair)
  for (let x = 0; x < FULL.w; x += 8) {
    if (x >= 156 && x < 224) continue
    rect(b, x, GROUND, 4, 2, C.sun)
    rect(b, x + 4, GROUND, 4, 2, C.white)
  }
  // the white dashed line, curving gently across the yard
  for (let x = 4; x < FULL.w; x += 9) {
    rect(b, x, 144 + Math.round(Math.sin((x - 190) / 70) * 2), 5, 1, C.white)
  }
}

// By the flags: a bust on its pedestal; right of the stair: the ramp with its red railing
function details(b: Buffer) {
  rect(b, 108, 114, 8, 14, C.slate)
  rect(b, 107, 113, 10, 2, C.grey)
  rect(b, 109, 108, 6, 5, C.ink)
  disc(b, 112, 105, 2, C.ink)
  for (let i = 0; i < 18; i++) pset(b, 224 + i, 126 - Math.floor(i / 3), C.red)
  for (const x of [224, 232, 240]) rect(b, x, 126 - Math.floor((x - 224) / 3), 1, 3, C.red)
}

// Everything that stands still
export function paintSchoolBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  sky(b)
  wing(b, 18, 140)
  wing(b, 240, FULL.w)
  tower(b, 140)
  tower(b, 222)
  centre(b)
  yard(b)
  details(b)
  shadeLeft(b)
  return b
}

// ---------- The moving layers ----------

// The kid's loop: pass the ball up, wait for it, pass again — one round every 1.6 s
const LOOP = 1.6
const KID_KEYS: Key[] = [
  { at: 0, pose: POSES.bump },
  { at: 0.28, pose: POSES.ready },
  { at: 1.28, pose: POSES.ready },
  { at: 1.52, pose: POSES.bump },
  { at: LOOP, pose: POSES.bump },
]
// Backlit by the low sun: a silhouette with a bright edge on the sun's side
const KID_LOOK = { body: C.ink, jersey: C.ink, rim: C.peach, light: 'right' as const }

// The kid as a sprite sheet: 16 frames of 40 × 50 px, 10 frames a second = one 1.6 s loop.
// (`npm run art:drafts` exports it to public/art/set1/shot2/kid.png.)
export const KID_SHEET = { frameWidth: 40, frameHeight: 50, frames: 16, fps: 10 }
const SHEET_FEET = { x: 20, y: 48 } // where the kid's feet are inside each frame

export function paintKidSheet() {
  const { frameWidth, frameHeight, frames, fps } = KID_SHEET
  const b = createBuffer(frameWidth * frames, frameHeight) // transparent
  for (let f = 0; f < frames; f++) {
    const { pose, lift } = track(KID_KEYS, f / fps)
    drawFigure(b, pose, f * frameWidth + SHEET_FEET.x, SHEET_FEET.y, 1, KID_LOOK, lift)
  }
  return b
}

// Under the kid: the long evening shadow, darkening whatever concrete it falls on
function shadow(b: Buffer) {
  for (let i = 0; i < 40; i++) {
    for (let j = 0; j < 2; j++) {
      const x = KID.x + 2 - i
      const y = KID.feet - 1 - Math.floor(i / 14) + j
      if (x >= 0) b.data[y * b.w + x] = darker(darker(b.data[y * b.w + x]))
    }
  }
}

// The ball: leaves the hands, rises about 3 m, comes back down to them
function bouncingBall(b: Buffer, t: number) {
  const p = (t % LOOP) / LOOP
  const hands = { x: KID.x + 11, y: KID.feet - 18 }
  ball(b, hands.x + Math.sin(p * Math.PI) * 3, hands.y - 4 * 48 * p * (1 - p))
}

export const schoolShot: Shot = {
  label: 'Pixel art: the high school at golden hour — a kid passing a volleyball in the yard.',
  background: '/art/set1/shot2/background.png',
  under: shadow,
  sheets: [
    {
      src: '/art/set1/shot2/kid.png',
      ...KID_SHEET,
      x: KID.x - SHEET_FEET.x,
      y: KID.feet - SHEET_FEET.y,
    },
  ],
  over: (b, t) => {
    flags(b, t)
    bouncingBall(b, t)
  },
  still: 0.8, // the ball high in the air
}
