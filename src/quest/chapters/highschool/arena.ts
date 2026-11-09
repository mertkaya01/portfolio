import { ledText, ledWidth } from './font'
import { trusses, wallFlag } from './gym'
import {
  C,
  createBuffer,
  darkenAll,
  dissolve,
  dither,
  FULL,
  hash,
  pool,
  pset,
  rect,
  zoom,
  type Buffer,
} from './pixel'
import { drawScoreboard, SCOREBOARD_BG } from './scoreboard'
import type { Shot, ShotContext } from './shot'

// The opening of the quest (320 × 180): an empty school sports hall, seen from high behind one
// end of the court. The lights flicker on, then the camera moves in on the scoreboard on the
// far wall — and the picture cuts to the scoreboard close up (scoreboard.ts), which lights up:
// SET 1 · HIGH SCHOOL · 07.2017 – 07.2021.
//
//   0 – 0.5 s   lights flicker on         1.7 – 2.6 s   the camera moves in
//   0.6 s       the board switches on     2.6 – 2.95 s  dissolve into the close-up

// ---------- A simple perspective camera ----------
// The camera stands 5 m high behind the near baseline, looking down the court. A point X m to
// the side, Y m high and m metres into the hall lands on the screen at (sx, sy).
const HORIZON = 60 // the screen row of eye level
const CAM_H = 5 // m
const K = 23.6 // px per m of height, at the near baseline
const S = 28.9 // px per m of width, at the near baseline
const Z_PER_M = 1.565 / 18 // how fast things shrink with distance (the court is 18 m long)
const depth = (m: number) => 1 + m * Z_PER_M
const sx = (X: number, m: number) => 160 + (X * S) / depth(m)
const sy = (Y: number, m: number) => HORIZON + ((CAM_H - Y) * K) / depth(m)
// …and back: which depth a floor row shows
const floorDepth = (y: number) => ((K * CAM_H) / (y - HORIZON) - 1) / Z_PER_M

const WALL_M = 24 // the far wall, 6 m behind the far baseline
const CEILING = Math.round(sy(10, WALL_M)) // the wall is 10 m high
const FLOOR_TOP = Math.round(sy(0, WALL_M))
const NET_M = 9 // the net is in the middle of the 18 m court

// The scoreboard on the far wall, and the point the camera moves in on
const BOARD = { x: 138, y: 32, w: 44, h: 22 }
const FOCUS = { x: 160, y: 43 }
const ZOOM_TO = 7.1 // at this size the board fills the picture like the close-up does

const LAMPS = [40, 100, 220, 280] // hanging under the roof (none in front of the board)

// ---------- The picture (exported as the background PNG) ----------

export function paintArenaBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  trusses(b, CEILING, C.deepBlue, C.night)

  // the far wall: cream, high windows, a salmon band, the flag and a banner either side of
  // the scoreboard
  rect(b, 0, CEILING, FULL.w, FLOOR_TOP - CEILING, C.cream)
  for (let x = 6; x < FULL.w; x += 26) {
    if (x > 118 && x < 190) continue // the board hangs there
    rect(b, x, CEILING + 4, 14, 6, C.daySky)
    rect(b, x + 7, CEILING + 4, 1, 6, C.creamShade)
    rect(b, x, CEILING + 10, 14, 1, C.creamShade)
  }
  rect(b, 0, 62, FULL.w, 4, C.salmon)
  wallFlag(b, 96, 33)
  rect(b, 192, 33, 32, 22, C.white)
  for (const y of [38, 44, 50]) rect(b, 195, y, 26, 1, C.deepBlue)

  // the scoreboard, switched off: steel casing, black panel, unlit dots
  rect(b, BOARD.x, BOARD.y, BOARD.w, BOARD.h, C.slate)
  rect(b, BOARD.x, BOARD.y, BOARD.w, 1, C.grey)
  rect(b, BOARD.x + 2, BOARD.y + 2, BOARD.w - 4, BOARD.h - 4, C.ink)
  boardDots(b, C.slate, C.slate, C.slate)

  // the stands under it: three rows of blue seats, a few people (a school match, not a final)
  for (let k = 0; k < 3; k++) {
    const y = 69 + k * 9
    rect(b, 0, y, FULL.w, 9, k % 2 ? C.deepBlue : C.courtBlue)
    rect(b, 0, y + 8, FULL.w, 1, C.grey)
    for (let x = 3 + k * 2; x < FULL.w - 4; x += 6) {
      if (hash(x, k + 7) < 0.62) continue
      const shirt = [C.plum, C.teal, C.coral, C.white, C.orange][Math.floor(hash(k, x) * 5)]
      rect(b, x - 1, y + 4, 5, 4, shirt) // shoulders
      rect(b, x, y + 1, 3, 3, C.skin) // head
      rect(b, x, y + 1, 3, 1, C.hair)
    }
  }
  // the railing and the boards along it
  rect(b, 0, 94, FULL.w, 1, C.grey)
  for (let x = 0; x < FULL.w; x += 40)
    rect(b, x, 95, 38, FLOOR_TOP - 95, (x / 40) % 2 ? C.white : C.deepBlue)

  floor(b)
  scorerTable(b)
  ballCart(b)
  net(b)
  for (const x of LAMPS) {
    rect(b, x, 0, 1, CEILING + 2, C.grey) // the cable
    rect(b, x - 3, CEILING + 2, 7, 2, C.slate) // the shade
    rect(b, x - 2, CEILING + 4, 5, 1, C.grey) // the bulb, off
  }
  return b
}

// The dots of the small board: "SET 1" and two short rows for the title and the period
function boardDots(b: Buffer, set: number, title: number, period: number) {
  ledText(b, 'SET 1', Math.round(160 - ledWidth('SET 1', 1) / 2), BOARD.y + 4, {
    pitch: 1,
    size: 1,
    on: set,
  })
  rect(b, 146, BOARD.y + 14, 28, 1, title)
  rect(b, 151, BOARD.y + 17, 18, 1, period)
}

// The floor: blue around, the orange court with its white lines, board seams across
function floor(b: Buffer) {
  for (let y = FLOOR_TOP; y < FULL.h; y++) {
    const m = floorDepth(y + 0.5)
    const half = (4.5 * S) / depth(m) // half the court's width on this row
    const inCourt = m >= 0 && m <= 18
    // a seam between two boards every 0.75 m of depth
    const seam = Math.floor(floorDepth(y) / 0.75) !== Math.floor(floorDepth(y + 1) / 0.75)
    for (let x = 0; x < FULL.w; x++) {
      const court = inCourt && Math.abs(x + 0.5 - 160) <= half
      let c = court ? C.orange : C.courtBlue
      if (seam && court && (x + y * 7) % 13 !== 0) c = C.coral // (the blue around stays calm)
      pset(b, x, y, c)
    }
    // the sidelines
    if (inCourt) {
      pset(b, Math.round(160 - half), y, C.white)
      pset(b, Math.round(160 + half), y, C.white)
    }
  }
  // the free zone: a darker blue band 2 m outside the court, like a painted service area
  for (let y = FLOOR_TOP; y < FULL.h; y++) {
    const m = floorDepth(y + 0.5)
    if (m < -3 || m > 21) continue
    const inner = (4.5 * S) / depth(m)
    const outer = (6.5 * S) / depth(m)
    for (const side of [-1, 1]) {
      for (let x = Math.round(160 + side * inner) + side; Math.abs(x - 160) <= outer; x += side) {
        if (dither(x, y, 0.5, 0, 1)) pset(b, x, y, C.deepBlue)
      }
    }
  }
  // the lines across: both baselines, the centre line under the net, the two attack lines
  for (const m of [0, 6, NET_M, 12, 18]) {
    const y = Math.min(FULL.h - 1, Math.round(sy(0, m)))
    rect(b, Math.round(sx(-4.5, m)), y, Math.round(sx(4.5, m) - sx(-4.5, m)) + 1, 1, C.white)
  }
}

// The net across the middle: padded posts, the mesh (the far court shows through it), the
// white tapes, and the red-and-white antennas over the sidelines
function net(b: Buffer) {
  const top = Math.round(sy(2.43, NET_M))
  const bottom = Math.round(sy(1.43, NET_M))
  const ground = Math.round(sy(0, NET_M))
  const left = Math.round(sx(-4.75, NET_M))
  const right = Math.round(sx(4.75, NET_M))
  for (const X of [-5.5, 5.5]) {
    const x = Math.round(sx(X, NET_M))
    rect(b, x - 1, Math.round(sy(2.6, NET_M)), 3, ground - Math.round(sy(2.6, NET_M)), C.deepBlue)
    rect(b, x - 1, Math.round(sy(2.6, NET_M)), 1, ground - Math.round(sy(2.6, NET_M)), C.grey)
  }
  rect(b, Math.round(sx(-5.5, NET_M)), top, Math.round(sx(5.5, NET_M) - sx(-5.5, NET_M)), 1, C.grey) // the cable
  for (let y = top + 2; y < bottom; y++) {
    for (let x = left; x <= right; x++) if ((x + y) % 2 === 0) pset(b, x, y, C.ink)
  }
  rect(b, left, top, right - left + 1, 2, C.white)
  rect(b, left, bottom, right - left + 1, 1, C.white)
  for (const X of [-4.5, 4.5]) {
    const x = Math.round(sx(X, NET_M))
    for (let y = Math.round(sy(3.23, NET_M)); y < top; y++) {
      pset(b, x, y, Math.floor(y / 2) % 2 ? C.red : C.white)
    }
  }
  // the referee's stand next to the left post: a platform on two legs
  const px = Math.round(sx(-6.4, NET_M))
  const py = Math.round(sy(1.6, NET_M))
  rect(b, px - 4, py, 9, 2, C.slate)
  rect(b, px - 4, py, 1, ground - py, C.slate)
  rect(b, px + 4, py, 1, ground - py, C.slate)
  rect(b, px - 4, py - 6, 1, 6, C.slate) // the backrest
}

// The scorer's table on the left, by the net: white top, blue front
function scorerTable(b: Buffer) {
  const m = 8.5
  const x0 = Math.round(sx(-9.5, m))
  const x1 = Math.round(sx(-7, m))
  const y0 = Math.round(sy(0.8, m))
  const y1 = Math.round(sy(0, m))
  rect(b, x0, y0, x1 - x0, y1 - y0, C.deepBlue)
  rect(b, x0, y0, x1 - x0, 2, C.white)
}

// A cart of volleyballs on the right, near the camera
function ballCart(b: Buffer) {
  const x = 276
  const y = 150
  rect(b, x, y + 4, 22, 1, C.grey)
  rect(b, x, y + 4, 1, 12, C.grey)
  rect(b, x + 21, y + 4, 1, 12, C.grey)
  rect(b, x, y + 15, 22, 1, C.grey)
  for (const [bx, by] of [
    [x + 2, y],
    [x + 8, y + 1],
    [x + 14, y],
    [x + 5, y + 5],
    [x + 11, y + 6],
  ]) {
    rect(b, bx, by, 6, 5, C.sun)
    rect(b, bx + 1, by + 2, 4, 1, C.sea)
  }
}

// ---------- What moves ----------

// The lamps: off → on → a flicker → on for good; light falls on the floor when they are on
function lights(b: Buffer, t: number) {
  const on = t >= 0.2 && !(t >= 0.3 && t < 0.42)
  if (on) {
    for (const x of LAMPS) {
      // a soft cone, strongest under the lamp and fading towards the floor
      for (let y = CEILING + 5; y < 150; y++) {
        const half = 2 + (y - CEILING) * 0.18
        const fade = 1 - (y - CEILING) / (150 - CEILING)
        for (let i = Math.floor(x - half); i <= x + half; i++) {
          const edge = 1 - Math.abs(i - x) / (half + 1)
          if (dither(i, y, 0.16 * edge * fade, 0, 1)) pset(b, i, y, C.glow)
        }
      }
      rect(b, x - 2, CEILING + 4, 5, 1, C.glow)
      pool(b, x, 150, 26, 8, C.glow)
    }
  }
  // the board switches on a moment after the lights
  if (t >= 0.6) boardDots(b, C.sun, C.orange, C.peach)
  // before that the hall is dim: two shades darker, and one during the flicker
  const shade = t < 0.2 ? 2 : on ? 0 : 1
  for (let i = 0; i < shade; i++) darkenAll(b)
}

const LIGHTS_END = 1.7
const ZOOM_TIME = 0.9
const CUT = LIGHTS_END + ZOOM_TIME // the close-up takes over here
const FADE = 0.35

const smooth = (p: number) => p * p * (3 - 2 * p)

// Buffers reused every frame (no garbage at 12 frames a second)
const hall = createBuffer(FULL.w, FULL.h)
const closeUp = createBuffer(FULL.w, FULL.h)

function play(b: Buffer, t: number, ctx: ShotContext) {
  // 1. the hall with its lights at this moment, seen through the camera
  hall.data.set(b.data)
  lights(hall, t)
  const p = smooth(Math.min(1, Math.max(0, (t - LIGHTS_END) / ZOOM_TIME)))
  const scale = Math.exp(Math.log(ZOOM_TO) * p) // a steady zoom feels the same at every size
  // The board glides from where it hangs to the middle of the picture while it grows:
  // find the point of the hall that has to be in the middle for that
  const at = { x: FOCUS.x + (160 - FOCUS.x) * p, y: FOCUS.y + (90 - FOCUS.y) * p }
  zoom(b, hall, FOCUS.x + (160 - at.x) / scale, FOCUS.y + (90 - at.y) / scale, scale)
  if (t < CUT) return

  // 2. the close-up, dissolving in over the zoomed hall
  const bg = ctx.image(SCOREBOARD_BG)
  if (bg) closeUp.data.set(bg.data)
  else closeUp.data.fill(C.slate)
  drawScoreboard(closeUp, t - CUT, ctx.board)
  const fade = (t - CUT) / FADE
  if (fade < 1) dissolve(b, b, closeUp, fade)
  else b.data.set(closeUp.data)
}

export const arenaShot: Shot = {
  background: '/art/set1/arena/background.png',
  images: [SCOREBOARD_BG],
  over: play,
  still: 99, // less motion: straight to the lit scoreboard
}
