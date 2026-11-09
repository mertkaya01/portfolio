import { ball, tree } from './gym'
import { drawMert, drawPerson, MERT_SHEET, shadow, type Facing, type Look, type Pose } from './mert'
import { C, createBuffer, disc, FULL, hash, pset, rect, type Buffer } from './pixel'
import type { Shot } from './shot'

// Lunch break in the schoolyard of Fahreddin Kerim Gökay Anatolian High School, seen from
// above like a top-down RPG (320 × 180). The school's front fills the top — after the
// reference photos: terracotta towers, cream wings with terracotta pilasters, the arcade of
// arched windows, the name band, three doors up a stair, the flags in front. A flower bed runs
// along the building; on the yard a little court is painted in white lines, and Mert and three
// classmates pass a ball around it — a set, a set, a bump, a bump. Two more classmates sit on
// a bench under a tree. The sun is high on the left: shadows fall to the right.
// Everything that matters stays between x 70 and 249.

const FRONT = 58 // where the building meets the yard
const BED = { y: FRONT, h: 9 } // the flower bed along the front
const PAINTED = { x0: 84, x1: 236, y0: 92, y1: 172 } // the little court painted on the yard

export const YARD_BG = '/art/set1/yard/background.png'

// ---------- The school and its yard (exported as the background PNG) ----------

export function paintYardBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  wing(b, 0, 98)
  wing(b, 222, FULL.w)
  tower(b, 98)
  tower(b, 202)
  centre(b)
  rect(b, 0, FRONT - 3, FULL.w, 3, C.brick) // the plinth along the bottom of the front
  rect(b, 0, FRONT - 3, FULL.w, 1, C.terracotta)

  // the yard: big concrete slabs in two shades, like a chequerboard seen from far
  rect(b, 0, FRONT, FULL.w, FULL.h - FRONT, C.cream)
  for (let y = FRONT; y < FULL.h; y += 16) {
    for (let x = ((y / 16) % 2) * 16 - 8; x < FULL.w; x += 32) rect(b, x, y, 16, 16, C.creamShade)
  }
  for (let y = FRONT + 15; y < FULL.h; y += 16) rect(b, 0, y, FULL.w, 1, C.grey)
  for (let x = 7; x < FULL.w; x += 16) {
    for (let y = FRONT; y < FULL.h; y += 2) pset(b, x, y, C.grey) // joints, dotted
  }
  paintedCourt(b)
  flowerBed(b)

  // flags on their poles in front of the school
  for (const x of [88, 230]) {
    rect(b, x + 2, BED.y + BED.h, 6, 2, C.creamShade) // the pole's shadow
    rect(b, x, 20, 2, BED.y + BED.h - 18, C.white)
    rect(b, x + 1, 20, 1, BED.y + BED.h - 18, C.grey)
    flag(b, x + 2, 20)
  }
  tree(b, 34, 104)
  tree(b, 290, 96)
  bench(b, 14, 140)
  benchSeat(b, 270, 150) // its backrest is drawn over the two sitting on it (play)
  fountain(b, 52, 156)
  bin(b, 252, 80)
  return b
}

// The cream wings: terracotta pilasters, windows with white sills, a cornice under the roof
function wing(b: Buffer, x0: number, x1: number) {
  rect(b, x0, 0, x1 - x0, FRONT, C.cream)
  rect(b, x0, 0, x1 - x0, 3, C.terracotta) // cornice
  rect(b, x0, 3, x1 - x0, 1, C.creamShade) // its shadow
  for (let x = x0 + 2; x < x1 - 2; x += 12) rect(b, x, 4, 3, FRONT - 7, C.terracotta) // pilasters
  for (const y of [8, 23, 38]) {
    for (let x = x0 + 7; x + 5 <= x1 - 2; x += 12) {
      rect(b, x - 1, y - 1, 7, 9, C.brick) // frame
      rect(b, x, y, 5, 7, C.deepBlue) // glass
      rect(b, x, y, 2, 3, C.teal) // the sky in it
      rect(b, x - 1, y + 8, 7, 1, C.white) // sill
    }
  }
}

// A terracotta tower with a cream inset and a column of windows with little balconies
function tower(b: Buffer, x0: number) {
  rect(b, x0, 0, 20, FRONT, C.terracotta)
  rect(b, x0, 0, 1, FRONT, C.brick)
  rect(b, x0 + 19, 0, 1, FRONT, C.brick)
  rect(b, x0 + 4, 0, 12, FRONT - 6, C.cream)
  for (const y of [5, 19, 33]) {
    rect(b, x0 + 7, y, 6, 8, C.deepBlue)
    rect(b, x0 + 7, y, 2, 3, C.teal)
    rect(b, x0 + 6, y + 8, 8, 2, C.terracotta) // balcony
    for (let i = x0 + 6; i < x0 + 14; i += 2) pset(b, i, y + 10, C.brick)
  }
  rect(b, x0, FRONT - 6, 20, 6, C.brick)
}

// The middle: the name band, the arcade of arched windows, a canopy over three doors, the stair
function centre(b: Buffer) {
  const x0 = 118
  const x1 = 202
  rect(b, x0, 0, x1 - x0, FRONT, C.cream)
  // the name band: a white sign with a line of "letters" (no text) and the emblem
  rect(b, 127, 2, 66, 9, C.brick)
  rect(b, 128, 3, 64, 7, C.white)
  rect(b, 136, 6, 50, 1, C.grey)
  disc(b, 131, 6, 2, C.red)
  pset(b, 131, 6, C.white)
  // the arcade
  rect(b, x0, 13, x1 - x0, 19, C.terracotta)
  rect(b, x0, 13, x1 - x0, 1, C.brick)
  for (let x = 123; x < 196; x += 15) {
    rect(b, x, 19, 11, 12, C.cream)
    disc(b, x + 5, 19, 5, C.cream)
    rect(b, x + 2, 20, 7, 10, C.deepBlue)
    disc(b, x + 5, 20, 3, C.deepBlue)
    rect(b, x + 2, 20, 2, 4, C.teal)
  }
  // a canopy over the doors, its shadow, three doors
  rect(b, 130, 33, 60, 3, C.slate)
  rect(b, 130, 33, 60, 1, C.grey)
  rect(b, 130, 36, 60, 2, C.creamShade)
  for (const x of [136, 156, 176]) {
    rect(b, x - 1, 38, 10, 14, C.brick)
    rect(b, x, 39, 8, 13, C.ink)
    rect(b, x + 3, 39, 1, 13, C.slate) // two door leaves
  }
  // the stair down to the yard
  for (let i = 0; i < 3; i++) {
    rect(b, 128 - i * 3, 52 + i * 2, 64 + i * 6, 2, i % 2 ? C.creamShade : C.white)
  }
}

// A small Turkish flag at the top of a pole
function flag(b: Buffer, x: number, y: number) {
  rect(b, x, y, 14, 9, C.red)
  rect(b, x, y + 8, 14, 1, C.brick)
  disc(b, x + 5, y + 4, 3, C.white)
  disc(b, x + 6, y + 4, 2, C.red)
  pset(b, x + 9, y + 4, C.white)
}

// The flower bed along the front: a kerb, round bushes, flowers in yellow, white and coral
function flowerBed(b: Buffer) {
  const { y, h } = BED
  rect(b, 0, y, FULL.w, h, C.plank) // earth
  rect(b, 0, y + h, FULL.w, 2, C.white) // the kerb
  rect(b, 0, y + h + 2, FULL.w, 1, C.grey)
  for (let x = 4; x < FULL.w; x += 11) {
    if (x > 122 && x < 196) continue // the stair comes down here
    disc(b, x + 4, y + 4, 4, C.leafDark)
    disc(b, x + 3, y + 3, 3, C.green)
    pset(b, x + 2, y + 2, C.leafLight)
    const flower = [C.sun, C.white, C.coral][Math.floor(hash(x, 4) * 3)]
    pset(b, x + 5, y + 3, flower)
    pset(b, x + 3, y + 6, flower)
  }
}

// A little court painted on the yard: white lines and a middle line (no net: it's the yard)
function paintedCourt(b: Buffer) {
  const { x0, x1, y0, y1 } = PAINTED
  rect(b, x0, y0, x1 - x0, 1, C.white)
  rect(b, x0, y1, x1 - x0, 1, C.white)
  rect(b, x0, y0, 1, y1 - y0, C.white)
  rect(b, x1, y0, 1, y1 - y0 + 1, C.white)
  rect(b, (x0 + x1) / 2, y0, 1, y1 - y0, C.white)
}

// A park bench seen from above: three wooden slats on cast-iron ends, and its backrest —
// behind the seat when it faces us, in front of it when the people on it face away
const BENCH = { w: 34, seat: 8 }
function benchSeat(b: Buffer, x: number, y: number) {
  const { w, seat } = BENCH
  rect(b, x + 2, y + seat + 1, w, 3, C.creamShade) // its shadow, to the lower right
  rect(b, x - 1, y - 1, w + 2, seat + 2, C.ink) // outline
  for (let i = 0; i < 3; i++) {
    rect(b, x, y + i * 3, w, 2, C.wood) // a slat
    rect(b, x, y + i * 3 + 2, w, 1, i < 2 ? C.plank : C.ink) // the gap after it
    rect(b, x + 1, y + i * 3, w - 2, 1, C.parquet) // light on its upper edge
  }
  for (const ex of [x - 1, x + w - 2]) {
    rect(b, ex, y - 1, 3, seat + 4, C.ink) // the iron ends
    pset(b, ex + 1, y, C.slate)
  }
}
function benchBack(b: Buffer, x: number, y: number) {
  const { w } = BENCH
  rect(b, x - 1, y - 1, w + 2, 7, C.ink)
  rect(b, x, y, w, 2, C.wood)
  rect(b, x, y + 3, w, 2, C.wood)
  rect(b, x + 1, y, w - 2, 1, C.parquet)
  rect(b, x + 1, y + 3, w - 2, 1, C.parquet)
  for (const ex of [x - 1, x + w - 2]) rect(b, ex, y - 2, 3, 9, C.ink)
}
// an empty bench facing us: the backrest behind the seat
function bench(b: Buffer, x: number, y: number) {
  benchBack(b, x, y - 7)
  benchSeat(b, x, y)
}

// A drinking fountain: a white bowl on a grey stand
function fountain(b: Buffer, x: number, y: number) {
  rect(b, x - 1, y - 1, 12, 14, C.ink)
  rect(b, x, y, 10, 12, C.grey)
  disc(b, x + 5, y + 3, 3, C.white)
  disc(b, x + 5, y + 3, 1, C.sky)
}

function bin(b: Buffer, x: number, y: number) {
  rect(b, x - 1, y - 1, 11, 13, C.ink)
  rect(b, x, y, 9, 11, C.green)
  rect(b, x, y, 9, 2, C.leafDark)
}

// ---------- What moves: the ball going round ----------

const BLACK: Look['hair'] = [C.ink, C.slate, C.slate]
const AUBURN: Look['hair'] = [C.brick, C.terracotta, C.coral]
const LIGHT: Look['hair'] = [C.plank, C.wood, C.parquet]

type Passer = { x: number; feet: number; facing: Facing; look?: Look; touch: Pose }
// round the circle: Mert (set) → right top (set) → right bottom (bump) → left bottom (bump)
const PASSERS: Passer[] = [
  { x: 118, feet: 120, facing: 'right', touch: 'up' }, // Mert (no look: his own)
  { x: 196, feet: 118, facing: 'left', touch: 'up', look: { hair: BLACK, jacket: C.deepBlue } },
  { x: 192, feet: 162, facing: 'left', touch: 'bump', look: { hair: AUBURN, jacket: C.sea } },
  { x: 122, feet: 164, facing: 'right', touch: 'bump', look: { hair: LIGHT, jacket: C.teal } },
]
const BENCH_MATES: Look[] = [
  { hair: LIGHT, jacket: C.deepBlue, longHair: true },
  { hair: BLACK, jacket: C.teal },
]

const PASS = 0.9 // s for one pass
const ARC = 16 // px the ball rises at the top of a pass (over their heads, under the roof)
const HANDS: Record<Pose, number> = { up: 28, bump: 12, ready: 16, stand: 16, step: 16 }

const play: Shot['over'] = (b, t, ctx) => {
  // two classmates on the bench under the tree, from behind
  for (const [i, look] of BENCH_MATES.entries()) {
    drawPerson(b, ctx, 'back', 280 + i * 14, 166, look, { rows: 26 })
  }
  benchBack(b, 270, 159)

  const n = PASSERS.length
  const turn = Math.floor(t / PASS) % n // who plays the ball now
  const p = (t % PASS) / PASS
  const from = PASSERS[turn]
  const to = PASSERS[(turn + 1) % n]
  const ballY = from.feet + (to.feet - from.feet) * p
  let ballDrawn = false
  const drawBall = () => {
    const gx = from.x + (to.x - from.x) * p
    const lift = HANDS[from.touch] + (HANDS[to.touch] - HANDS[from.touch]) * p
    shadow(b, gx, Math.round(ballY) - 2, 3)
    ball(b, gx, ballY - lift - ARC * 4 * p * (1 - p))
    ballDrawn = true
  }

  // farthest first (higher on screen = farther away); the ball in its place among them
  const order = [...PASSERS.keys()].sort((i, j) => PASSERS[i].feet - PASSERS[j].feet)
  for (const i of order) {
    const s = PASSERS[i]
    if (!ballDrawn && s.feet > ballY) drawBall()
    // the one who just played it holds the pose a moment; the next one reaches for it
    const touching = (i === turn && p < 0.25) || (i === (turn + 1) % n && p > 0.85)
    const pose: Pose = touching ? s.touch : 'ready'
    if (s.look) drawPerson(b, ctx, s.facing, s.x, s.feet, s.look, { pose, withShadow: true })
    else drawMert(b, ctx, s.facing, s.x, s.feet, { pose })
  }
  if (!ballDrawn) drawBall()
}

export const yardShot: Shot = {
  label: {
    en: 'Pixel art: the front of Fahreddin Kerim Gökay Anatolian High School seen from above, a flower bed, and the yard at lunch break: Mert and three classmates pass a volleyball around on a court painted on the ground.',
    tr: 'Pixel art: yukarıdan Fahreddin Kerim Gökay Anadolu Lisesi’nin önü, çiçek tarhı ve öğle arasında bahçe: Mert ve üç sınıf arkadaşı yere çizilmiş bir sahada voleybol topuyla paslaşıyor.',
  },
  background: YARD_BG,
  images: [MERT_SHEET],
  over: play,
  still: 0.45, // the ball in the air
}
