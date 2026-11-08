import { drawFigure, POSES, track, type Key, type Look } from './figure'
import { arc, ball, lamps, net, parquet, trusses } from './gym'
import { C, createBuffer, FULL, pool, pset, rect, shadeLeft, type Buffer } from './pixel'
import type { Shot } from './shot'

// Shot 3, full screen (320 × 180): "First match: I played libero. We lost badly."
// The school gym, after the practice video: grey roof trusses and hanging lamps, cream walls
// with high windows, a basketball board, the blue padding along the wall, light parquet with
// a blue centre circle. The libero (in his own shirt colour) runs, dives, slides — and the
// ball lands just past his hands. The other side celebrates.

const WALL_BOTTOM = 132
const FLOOR = 166 // where the players stand
const NET_X = 252

const LIGHT = { rim: C.glow, light: 'top' as const }
const US: Look = { body: C.ink, jersey: C.courtBlue, stripe: C.orange, ...LIGHT }
const LIBERO: Look = { body: C.ink, jersey: C.sun, stripe: C.white, ...LIGHT } // TODO colour: ask Mert
const THEM: Look = { body: C.ink, jersey: C.red, stripe: C.white, ...LIGHT }

export function paintFirstMatchBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  trusses(b, 22, C.grey, C.slate)
  rect(b, 0, 22, FULL.w, 92, C.cream)
  // high windows
  for (let x = 14; x < FULL.w; x += 46) {
    rect(b, x, 30, 26, 10, C.creamShade)
    rect(b, x + 1, 31, 24, 8, C.night)
    pset(b, x + 3, 32, C.teal)
  }
  // the basketball board on the end wall (it's a school gym)
  rect(b, 286, 50, 26, 18, C.white)
  rect(b, 294, 56, 10, 8, C.red)
  rect(b, 295, 57, 8, 6, C.white)
  rect(b, 293, 68, 12, 1, C.orange)
  for (let i = 0; i < 5; i++) pset(b, 294 + i * 2, 69 + (i % 2), C.white)
  // the blue padding along the bottom of the wall
  rect(b, 0, 114, FULL.w, WALL_BOTTOM - 114, C.courtBlue)
  rect(b, 0, 114, FULL.w, 1, C.deepBlue)

  parquet(b, WALL_BOTTOM, FULL.h, C.parquet, C.wood)
  // the blue centre circle, seen flat on the floor
  for (let y = -10; y <= 10; y++) {
    for (let x = -48; x <= 48; x++) {
      if ((x * x) / (48 * 48) + (y * y) / (10 * 10) <= 1) pset(b, NET_X + x, 150 + y, C.courtBlue)
    }
  }
  rect(b, 0, 140, FULL.w, 1, C.white)
  rect(b, 0, 172, FULL.w, 1, C.white)
  // light from the lamps, and its shine on the varnished floor
  lamps(b, [40, 120, 200, 280], 26, WALL_BOTTOM, C.glow, 0.12)
  for (const x of [40, 120, 200, 280]) pool(b, x, 154, 22, 7, C.glow)
  net(b, NET_X, FLOOR + 4)
  shadeLeft(b, 104, -100, 40) // one gentle step: a bright gym, not a dark corner
  return b
}

// ---------- The moving layers: one rally, played once ----------

const SPIKE_FROM: [number, number] = [NET_X + 16, 98] // where their spike comes from
const LANDS = 216 // where the ball hits the floor, just past the libero's hands

function ballAt(b: Buffer, t: number) {
  const ground = FLOOR - 3
  if (t < 1.05) ball(b, ...arc(SPIKE_FROM, [LANDS, ground], t / 1.05, -6))
  else if (t < 1.5) ball(b, ...arc([LANDS, ground], [232, ground], (t - 1.05) / 0.45, 12))
  else ball(b, ...arc([232, ground], [246, ground], (t - 1.5) / 0.8, 0))
}

// The libero: ready → two running steps → lunge → flying flat → sliding on the floor
const LIBERO_KEYS: Key[] = [
  { at: 0, pose: POSES.ready },
  { at: 0.35, pose: POSES.ready },
  { at: 0.45, pose: POSES.runA },
  { at: 0.55, pose: POSES.runB },
  { at: 0.65, pose: POSES.lunge },
  { at: 0.8, pose: POSES.fly, lift: 3 },
  { at: 1.0, pose: POSES.slide },
]
function liberoX(t: number) {
  if (t < 0.35) return 156
  if (t < 0.65) return 156 + ((t - 0.35) / 0.3) * 14
  if (t < 1.0) return 170 + ((t - 0.65) / 0.35) * 16
  return Math.min(192, 186 + (t - 1.0) * 15)
}

// Their team after the point: little hops with both arms up
function cheer(t: number, delay: number) {
  if (t < 1.1 + delay) return { pose: POSES.ready, lift: 0 }
  const hop = Math.abs(Math.sin((t - 1.1 - delay) * 6))
  return { pose: POSES.cheer, lift: Math.round(hop * 3) }
}

function players(b: Buffer, t: number) {
  // their spiker landing after the spike
  const spiker = track(
    [
      { at: 0, pose: POSES.spikeFollow, lift: 8 },
      { at: 0.3, pose: POSES.crouch },
      { at: 0.6, pose: POSES.ready },
    ],
    t,
  )
  const them = t < 1.1 ? spiker : cheer(t, 0)
  drawFigure(b, them.pose, 270, FLOOR, -1, THEM, them.lift)
  const other = cheer(t, 0.15)
  drawFigure(b, other.pose, 300, FLOOR, -1, THEM, other.lift)

  // our teammate: ready, then shoulders drop
  drawFigure(b, t < 1.2 ? POSES.ready : POSES.stand, 226, FLOOR, 1, US)

  const libero = track(LIBERO_KEYS, t)
  drawFigure(b, libero.pose, Math.round(liberoX(t)), FLOOR, 1, LIBERO, libero.lift)
  // a drop of sweat, after it's all over
  if (t > 1.6 && Math.floor(t * 2) % 2) {
    pset(b, Math.round(liberoX(t)) + 9, FLOOR - 10, C.sky)
    pset(b, Math.round(liberoX(t)) + 9, FLOOR - 9, C.sky)
  }
}

export const firstMatchShot: Shot = {
  label:
    'Pixel art: a school gym — the libero dives, and the ball lands just past his hands. The other team celebrates.',
  background: '/art/set1/shot3/background.png',
  over: (b, t) => {
    players(b, t)
    ballAt(b, t)
  },
  still: 1.15, // the libero sliding, the ball just past his hands
}
