import { ball, wallFlag } from './gym'
import {
  drawPerson,
  marker,
  MERT_SHEET,
  SHEET_COLORS,
  shadow,
  type Facing,
  type Look,
  type Pose,
} from './mert'
import { C, createBuffer, FULL, hash, pset, rect, sprite } from './pixel'
import type { Shot } from './shot'

// After school: training — and early 2020, the national high-school championship in Aydın,
// as a middle blocker. The gym in Aydın seen from above like a top-down RPG (320 × 180),
// after the photos: cream walls with a salmon band, the flag, the scoreboard (no score: we
// don't make one up), the banner, a row of seats, the orange court with blue around it.
// Mert's team in blue on the left, the other team in white on the right; the net runs down
// the middle. Everyone in the sports kit (jersey, shorts, knee pads) and in volleyball poses.
// One rally, every 3.4 s: their setter sets with both hands up, their hitter jumps and spikes,
// Mert and his setter go up for a double block — stuff! — the ball drops on their side, their
// defender dives for it too late, and Mert's team jumps for joy.

const WALL = 30 // where the end wall meets the floor
const COURT = { x0: 64, x1: 256, y0: 58, y1: 154 } // 18 m × 9 m
const NET_X = 160

// Jerseys: the sprite's black jacket becomes the jersey, the white shirt its stripe
const US_KIT = { jacket: C.courtBlue, stripe: C.orange, kit: true }
const THEM_KIT = { jacket: C.white, stripe: C.deepBlue, kit: true }
const ours = (hair: Look['hair']): Look => ({ hair, ...US_KIT })
const theirs = (hair: Look['hair']): Look => ({ hair, ...THEM_KIT })
const BLACK: Look['hair'] = [C.ink, C.slate, C.slate]
const LIGHT: Look['hair'] = [C.plank, C.wood, C.parquet]
const AUBURN: Look['hair'] = [C.brick, C.terracotta, C.coral]

type Spot = { x: number; feet: number; facing: Facing; look: Look }
const MERT_SPOT: Spot = { x: 150, feet: 122, facing: 'right', look: ours(SHEET_COLORS.hair) }
const OUR_SETTER: Spot = { x: 147, feet: 82, facing: 'right', look: ours(BLACK) }
const OUR_BACK: Spot[] = [
  { x: 96, feet: 96, facing: 'right', look: ours(LIGHT) },
  { x: 102, feet: 144, facing: 'right', look: ours(AUBURN) },
]
const HITTER: Spot = { x: 174, feet: 122, facing: 'left', look: theirs(BLACK) }
const THEIR_SETTER: Spot = { x: 190, feet: 80, facing: 'left', look: theirs(LIGHT) }
const DEFENDER: Spot = { x: 220, feet: 136, facing: 'left', look: theirs(AUBURN) }
const THEIR_BACK: Spot = { x: 226, feet: 94, facing: 'left', look: theirs(BLACK) }

export const COURT_BG = '/art/set1/court/background.png'

// ---------- The gym (exported as the background PNG) ----------

export function paintCourtBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  // the end wall: cream, a salmon band, the flag, the scoreboard, the banner
  rect(b, 0, 0, FULL.w, WALL, C.cream)
  rect(b, 0, 16, FULL.w, 6, C.salmon)
  rect(b, 0, 16, FULL.w, 1, C.coral)
  wallFlag(b, 70, 0)
  rect(b, 144, 1, 32, 14, C.slate) // scoreboard: dark, two dashes (no score)
  rect(b, 145, 2, 30, 12, C.ink)
  rect(b, 150, 7, 6, 2, C.orange)
  rect(b, 164, 7, 6, 2, C.orange)
  pset(b, 160, 5, C.sun)
  pset(b, 160, 10, C.sun)
  rect(b, 214, 2, 40, 11, C.white) // the banner
  rect(b, 218, 5, 32, 1, C.deepBlue)
  rect(b, 221, 9, 26, 1, C.deepBlue)
  // a row of seats along the wall, a few people watching
  rect(b, 0, WALL - 8, FULL.w, 8, C.deepBlue)
  rect(b, 0, WALL - 1, FULL.w, 1, C.grey)
  for (let x = 4; x < FULL.w; x += 7) {
    if (hash(x, 3) < 0.6) continue
    const shirt = [C.plum, C.teal, C.coral, C.white][Math.floor(hash(3, x) * 4)]
    rect(b, x - 1, WALL - 5, 5, 4, shirt)
    rect(b, x, WALL - 8, 3, 3, C.skin)
    rect(b, x, WALL - 8, 3, 1, C.hair)
  }

  // the floor: blue around, the orange court with board seams and white lines
  rect(b, 0, WALL, FULL.w, FULL.h - WALL, C.courtBlue)
  const { x0, x1, y0, y1 } = COURT
  rect(b, x0, y0, x1 - x0, y1 - y0, C.orange)
  for (let y = y0 + 4; y < y1; y += 5) {
    for (let x = x0 + ((y * 7) % 19); x < x1; x += 19) rect(b, x, y, 7, 1, C.coral)
  }
  rect(b, x0, y0, x1 - x0, 1, C.white)
  rect(b, x0, y1 - 1, x1 - x0, 1, C.white)
  rect(b, x0, y0, 1, y1 - y0, C.white)
  rect(b, x1 - 1, y0, 1, y1 - y0, C.white)
  for (const x of [NET_X - 32, NET_X + 32]) rect(b, x, y0, 1, y1 - y0, C.white) // attack lines
  // the net down the middle: posts, the mesh, the white tape, the antennas
  for (const y of [y0 - 8, y1 + 4]) rect(b, NET_X - 2, y, 4, 5, C.ink)
  for (let y = y0 - 4; y < y1 + 4; y++) {
    if ((y & 1) === 0) pset(b, NET_X - 1, y, C.ink)
    pset(b, NET_X + 1, y, C.white) // the tape along the top, seen from above
  }
  for (const y of [y0, y1 - 1]) {
    rect(b, NET_X - 1, y - 1, 3, 3, C.red)
    pset(b, NET_X, y, C.white)
  }
  // a bench and a ball cart by the side
  rect(b, 14, 66, 6, 60, C.plank)
  rect(b, 14, 66, 6, 1, C.wood)
  rect(b, 290, 150, 16, 12, C.grey)
  for (const [bx, by] of [
    [292, 146],
    [298, 147],
    [295, 151],
  ]) {
    ball(b, bx + 3, by + 3)
  }
  return b
}

// ---------- The rally ----------

const RALLY = 3.4 // s
const PEAK = 9 // px a jump lifts a player
const SPARK = ['..#..', '.#.#.', '#...#', '.#.#.', '..#..'] // the block's little flash

// height of a jump between two moments (0 outside, PEAK in the middle)
function jump(t: number, from: number, to: number) {
  if (t < from || t > to) return 0
  const p = (t - from) / (to - from)
  return Math.round(PEAK * 4 * p * (1 - p))
}
// celebrating: little hops with the arms up, from a moment on, until the rally starts over
function hop(t: number, from: number, offset: number) {
  return t > from && t < 2.7 ? Math.round(Math.abs(Math.sin((t - from) * 8 + offset)) * 3) : 0
}

const lerp = (a: number, b: number, p: number) => a + (b - a) * p
const arc = (p: number, h: number) => h * 4 * p * (1 - p)
const BLOCK = { x: NET_X - 3, feet: MERT_SPOT.feet - 4, h: 30 } // where the ball meets the block
const LAND = { x: 204, feet: 138 } // where it drops on their side, near their defender

// the ball: where its shadow is on the floor (gx, gy) and how high it flies (h)
function ballAt(t: number): { gx: number; gy: number; h: number } | null {
  if (t < 0.6) {
    // the set: from the setter's hands, high, to the hitter at the net
    const p = t / 0.6
    const x = lerp(THEIR_SETTER.x - 6, HITTER.x - 2, p)
    return { gx: x, gy: lerp(THEIR_SETTER.feet, HITTER.feet, p), h: 26 + arc(p, 22) + 6 * p }
  }
  if (t < 0.68) {
    // the spike, straight into the block
    const p = (t - 0.6) / 0.08
    return {
      gx: lerp(HITTER.x - 6, BLOCK.x, p),
      gy: lerp(HITTER.feet, BLOCK.feet, p),
      h: 32 - 2 * p,
    }
  }
  if (t < 1.1) {
    // stuffed: it drops on their side
    const p = (t - 0.68) / 0.42
    return {
      gx: lerp(BLOCK.x + 4, LAND.x, p),
      gy: lerp(BLOCK.feet, LAND.feet, p),
      h: BLOCK.h * (1 - p) + arc(p, 8),
    }
  }
  if (t < 1.5) {
    const p = (t - 1.1) / 0.4 // one small bounce
    return { gx: lerp(LAND.x, LAND.x + 10, p), gy: LAND.feet + 3 * p, h: arc(p, 6) }
  }
  if (t < 2.7) return { gx: LAND.x + 10, gy: LAND.feet + 3, h: 0 }
  return null
}

type Move = { spot: Spot; pose: Pose; lift: number; dx?: number }

// what everyone does at time t of the rally
function moves(t: number): Move[] {
  const after = t > 1.15 && t < 2.7 // the point is won
  const mertUp = jump(t, 0.42, 0.95)
  return [
    // their setter: hands up as the ball leaves them, then ready
    { spot: THEIR_SETTER, pose: t < 0.25 ? 'up' : 'ready', lift: 0 },
    // their hitter: ready, the jump with the arm up, the landing
    { spot: HITTER, pose: t > 0.3 && t < 0.85 ? 'up' : 'ready', lift: jump(t, 0.3, 0.85) },
    // their back row: ready; the defender dives for the ball, too late
    { spot: THEIR_BACK, pose: after ? 'stand' : 'ready', lift: 0 },
    {
      spot: DEFENDER,
      pose: t > 0.85 && t < 1.4 ? 'bump' : after ? 'stand' : 'ready',
      lift: 0,
      dx: t > 0.85 && t < 1.4 ? -Math.min(8, (t - 0.85) * 30) : 0,
    },
    // Mert and his setter: the double block, then arms up for the point
    {
      spot: MERT_SPOT,
      pose: mertUp > 0 || after ? 'up' : 'ready',
      lift: mertUp + (after ? hop(t, 1.2, 0) : 0),
    },
    {
      spot: OUR_SETTER,
      pose: jump(t, 0.45, 0.95) > 0 || after ? 'up' : 'ready',
      lift: jump(t, 0.45, 0.95) + (after ? hop(t, 1.25, 1) : 0),
    },
    ...OUR_BACK.map((spot, i): Move => ({
      spot,
      pose: after ? 'up' : 'ready',
      lift: after ? hop(t, 1.3 + i * 0.1, 2 + i) : 0,
    })),
  ]
}

const play: Shot['over'] = (b, time, ctx) => {
  const t = time % RALLY
  // everyone, from the back of the picture to the front (higher on screen = farther away)
  const people = moves(t).sort((m, n) => m.spot.feet - n.spot.feet)
  for (const { spot, pose, lift, dx = 0 } of people) {
    const x = spot.x + dx
    shadow(b, x, spot.feet)
    drawPerson(b, ctx, spot.facing, x, spot.feet - lift, spot.look, { pose })
    if (spot === MERT_SPOT) marker(b, x, spot.feet - lift)
  }
  const ball0 = ballAt(t)
  if (ball0) {
    shadow(b, ball0.gx, Math.round(ball0.gy) - 2, 3)
    ball(b, ball0.gx, ball0.gy - 4 - ball0.h)
  }
  // the moment of the block: a little white flash
  if (t > 0.66 && t < 0.8)
    sprite(b, SPARK, BLOCK.x - 2, BLOCK.feet - 4 - BLOCK.h - 2, { '#': C.white })
}

export const courtShot: Shot = {
  label: {
    en: 'Pixel art: a sports hall in Aydın seen from above, 2020. The other team sets and spikes; Mert and a teammate jump for a double block and stop it, the ball drops on their side and his team jumps for joy.',
    tr: 'Pixel art: yukarıdan Aydın’da bir spor salonu, 2020. Rakip pas verip smaç vuruyor; Mert ve bir takım arkadaşı çift bloğa sıçrayıp durduruyor, top karşı sahaya düşüyor ve takımı sevinçle zıplıyor.',
  },
  background: COURT_BG,
  images: [MERT_SHEET],
  over: play,
  // the hall's lights over the court: the court bright, the stands and walls in the dim;
  // dust in the light above the floor
  lighting: {
    ambient: 0.8,
    lights: [
      { x: 160, y: 62, r: 125, power: 0.34 },
      { x: 160, y: 128, r: 120, power: 0.3 },
    ],
    dust: { x: 100, y: 30, w: 120, h: 95, n: 16 },
  },
  still: 0.7, // the ball against the block
}
