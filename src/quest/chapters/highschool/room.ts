import { ball } from './gym'
import { drawMert, MERT_SHEET } from './mert'
import {
  C,
  createBuffer,
  darker,
  disc,
  dither,
  FULL,
  hash,
  pool,
  pset,
  rect,
  sprite,
  type Buffer,
} from './pixel'
import type { Shot, ShotContext } from './shot'

// Mert's room, seen from above like a top-down RPG (320 × 180), as he describes it:
// a long room — you come in through the door and the window is straight ahead. To the right
// of the door the wardrobe runs along the wall towards the window, then the bed, then the
// computer at the end. On the other side: the water dispenser and the weights.
//
//   'wake'   morning: the alarm rings, he gets up and walks out of the door
//   'night'  night: at the computer, then the screen goes off and he sleeps
//
//            ┌────[ window ]──────────────┐
//            │ water           [ desk+PC ]│
//            │                  (chair)   │
//            │ weights         [  bed    ]│
//            │                 [         ]│
//            │                 [wardrobe ]│
//            └───[ door ]─────────────────┘
// Everything stays between x 70 and 249 (what a phone keeps).

const ROOM = { x0: 78, x1: 242, y0: 4, y1: 176 }
const WALL = 6 // thickness of the side and front walls, seen from above
const WALL_BOTTOM = 40 // where the back wall meets the floor
const FLOOR = { x0: ROOM.x0 + WALL, x1: ROOM.x1 - WALL, y1: ROOM.y1 - WALL }

const DOOR = { x: ROOM.x0 + 30, w: 24 } // in the front wall, at the bottom
const WINDOW = { x: DOOR.x - 4, y: 9, w: 32, h: 24 } // straight across from the door
const DESK = { x: ROOM.x1 - 82, y: 36, w: 58, h: 22 } // against the back wall, near the corner
const SCREEN = { x: DESK.x + 22, y: 37, w: 16, h: 9 }
const CHAIR = { x: SCREEN.x + 1, y: 60 }
const BED = { x: ROOM.x1 - 42, y: 76, w: 34, h: 56 } // along the right wall, head to the desk
const PILLOW_Y = BED.y + 4
const BLANKET_Y = BED.y + 16
const WARDROBE = { x: ROOM.x1 - 30, y: 136, w: 24, h: 34 } // by the door, up to the bed
const CLOCK = { x: DESK.x + DESK.w - 20, y: 46 } // on the desk, by the head of the bed
const WEIGHTS = { x: ROOM.x0 + 10, y: 74, h: 80 } // the mat runs most of the wall

export const ROOM_BG = '/art/set1/room/background.png'

// ---------- The room (exported as the background PNG, morning light) ----------

export function paintRoomBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  // around the room: the dark wooden floor of the hall, so the picture keeps its edges
  b.data.fill(C.slate)
  for (let y = 3; y < FULL.h; y += 6) {
    rect(b, 0, y, FULL.w, 1, C.ink)
    for (let x = (y * 11) % 41; x < FULL.w; x += 41) rect(b, x, y - 5, 1, 5, C.ink)
  }

  // the back wall: cream with a faint stripe, a skirting board where it meets the floor
  rect(b, ROOM.x0, ROOM.y0, ROOM.x1 - ROOM.x0, WALL_BOTTOM - ROOM.y0, C.cream)
  for (let x = ROOM.x0; x < ROOM.x1; x += 8) {
    for (let y = ROOM.y0; y < WALL_BOTTOM - 3; y++) {
      if (dither(x, y, 0.5, 0, 1)) pset(b, x, y, C.creamShade)
    }
  }
  rect(b, ROOM.x0, WALL_BOTTOM - 3, ROOM.x1 - ROOM.x0, 3, C.plank)

  // the floor: wooden boards running along the room, their ends staggered
  rect(b, FLOOR.x0, WALL_BOTTOM, FLOOR.x1 - FLOOR.x0, FLOOR.y1 - WALL_BOTTOM, C.wood)
  for (let x = FLOOR.x0 + 7; x < FLOOR.x1; x += 8) {
    rect(b, x, WALL_BOTTOM, 1, FLOOR.y1 - WALL_BOTTOM, C.plank)
    for (let y = WALL_BOTTOM + ((x * 13) % 31); y < FLOOR.y1; y += 31) {
      rect(b, x - 7, y, 7, 1, C.plank)
    }
  }

  // the walls seen from above: both sides and the front, with the doorway in the front one
  rect(b, ROOM.x0, ROOM.y0, WALL, ROOM.y1 - ROOM.y0, C.creamShade)
  rect(b, ROOM.x1 - WALL, ROOM.y0, WALL, ROOM.y1 - ROOM.y0, C.creamShade)
  rect(b, ROOM.x0, FLOOR.y1, ROOM.x1 - ROOM.x0, WALL, C.creamShade)
  rect(b, ROOM.x0 + WALL, FLOOR.y1, ROOM.x1 - ROOM.x0 - 2 * WALL, 1, C.grey)
  doorway(b, false)

  window(b, C.daySky)
  poster(b)

  // morning sun through the window: a slanted patch of light on the floor
  for (let y = WALL_BOTTOM; y < 112; y++) {
    const shift = (y - WALL_BOTTOM) * 0.4
    for (let x = WINDOW.x + 2 + shift; x < WINDOW.x + WINDOW.w + 4 + shift; x++) {
      if (dither(Math.round(x), y, 0.35, 0, 1)) pset(b, x, y, C.parquet)
    }
  }

  waterDispenser(b)
  weights(b)
  ball(b, DOOR.x + 40, 124) // a volleyball on the floor, of course
  wardrobe(b)
  bed(b)
  desk(b)
  return b
}

// The doorway in the front wall: the door shut (a plank in the gap) or open (swung into the
// room against the wall, the dark hall beyond)
function doorway(b: Buffer, open: boolean) {
  const { x, w } = DOOR
  rect(b, x, FLOOR.y1, w, WALL, open ? C.ink : C.plank)
  if (!open) {
    rect(b, x, FLOOR.y1 + 2, w, 1, C.wood)
    rect(b, x + w - 4, FLOOR.y1 + 1, 2, 2, C.sun) // the handle
    return
  }
  rect(b, x, FLOOR.y1 - w, 3, w, C.plank) // the door, open, along its hinge side
  rect(b, x + 2, FLOOR.y1 - w, 1, w, C.wood)
}

function window(b: Buffer, sky: number) {
  const { x, y, w, h } = WINDOW
  rect(b, x - 2, y - 2, w + 4, h + 4, C.white)
  rect(b, x, y, w, h, sky)
  rect(b, x + w / 2 - 1, y, 2, h, C.white) // the frame in the middle
  rect(b, x, y + h / 2 - 1, w, 2, C.white)
  rect(b, x - 6, y - 3, 5, h + 8, C.coral) // curtains
  rect(b, x + w + 1, y - 3, 5, h + 8, C.coral)
  rect(b, x - 6, y - 3, 1, h + 8, C.brick)
  rect(b, x + w + 5, y - 3, 1, h + 8, C.brick)
}

// A volleyball poster: blue, a ball, a white stripe
function poster(b: Buffer) {
  const x = WINDOW.x + WINDOW.w + 14
  const y = 10
  rect(b, x, y, 14, 20, C.courtBlue)
  rect(b, x, y, 14, 1, C.deepBlue)
  disc(b, x + 7, y + 8, 4, C.sun)
  rect(b, x + 4, y + 7, 7, 1, C.sea)
  rect(b, x + 2, y + 15, 10, 2, C.white)
}

// The water dispenser by the window, after Mert's drawing of a 19 L jug: a white cabinet
// with its two taps, the big pale-blue jug standing on it (ridges, a white cap)
function waterDispenser(b: Buffer) {
  const x = ROOM.x0 + 10
  const y = 50 // the cabinet's top
  rect(b, x - 1, y - 19, 16, 36, C.ink) // a dark outline around it all
  // the cabinet
  rect(b, x, y, 14, 4, C.white) // its top, seen from above
  rect(b, x, y + 4, 14, 12, C.creamShade) // its front
  rect(b, x + 3, y + 7, 8, 4, C.slate) // the tap niche
  pset(b, x + 4, y + 7, C.red) // hot
  pset(b, x + 9, y + 7, C.courtBlue) // cold
  rect(b, x + 3, y + 11, 8, 1, C.grey) // drip tray
  // the jug: rounded shoulders, two ridges, the neck and its cap
  rect(b, x + 2, y - 13, 10, 13, C.water)
  rect(b, x + 1, y - 11, 12, 10, C.water)
  rect(b, x + 3, y - 12, 2, 10, C.waterLight) // light on its side
  for (const ry of [y - 9, y - 5]) rect(b, x + 1, ry, 12, 1, C.waterDeep) // ridges
  rect(b, x + 5, y - 16, 4, 3, C.waterDeep) // neck
  rect(b, x + 4, y - 18, 6, 2, C.white) // cap
}

// The weights on a long mat along the left wall: round plates leaning on the wall, a flat
// bench, two dumbbells and a kettlebell
function weights(b: Buffer) {
  const { x, y, h } = WEIGHTS
  rect(b, x - 1, y - 1, 38, h + 2, C.ink) // outline
  rect(b, x, y, 36, h, C.teal) // the mat
  rect(b, x, y, 36, 1, C.sky)
  for (let i = y + 6; i < y + h; i += 6) rect(b, x + 1, i, 34, 1, C.sea) // its ribs
  for (const [py, r] of [
    [y + 7, 5],
    [y + 19, 4],
  ]) {
    disc(b, x + 5, py, r, C.ink)
    disc(b, x + 5, py, 1, C.grey)
  }
  rect(b, x + 14, y + 6, 10, 30, C.ink) // the bench, along the room
  rect(b, x + 15, y + 7, 8, 28, C.slate)
  rect(b, x + 15, y + 7, 8, 1, C.grey)
  for (const dy of [44, 52]) {
    rect(b, x + 7, y + dy + 2, 14, 2, C.grey) // a dumbbell: the bar…
    for (const px of [x + 4, x + 20]) {
      rect(b, px, y + dy, 4, 6, C.ink) // …and its plates
      rect(b, px + 1, y + dy + 1, 2, 1, C.grey)
    }
  }
  disc(b, x + 8, y + 68, 3, C.ink) // kettlebell (out of the way to the door)
  rect(b, x + 6, y + 63, 5, 1, C.grey)
}

function wardrobe(b: Buffer) {
  const { x, y, w, h } = WARDROBE
  rect(b, x - 1, y - 1, w + 2, h + 2, C.slate) // its outline
  rect(b, x, y, w, h, C.plank) // its top, seen from above (darker than the floor)
  rect(b, x, y, w, 1, C.wood)
  rect(b, x - 5, y + 1, 5, h - 1, C.brick) // its two doors, facing into the room
  rect(b, x - 5, y + h / 2, 5, 1, C.slate)
  pset(b, x - 4, y + h / 2 - 3, C.sun)
  pset(b, x - 4, y + h / 2 + 3, C.sun)
}

function bed(b: Buffer) {
  const { x, y, w, h } = BED
  rect(b, x - 2, y - 5, w + 4, h + 9, C.ink) // outline
  rect(b, x - 1, y - 4, w + 2, 6, C.plank) // headboard
  rect(b, x - 1, y - 4, w + 2, 1, C.wood)
  rect(b, x, y, w, h, C.plank) // frame
  rect(b, x + 2, y + 2, w - 4, h - 4, C.white) // sheet
  rect(b, x, y + h, w, 3, C.slate) // its side, in shade
  pillow(b)
  blanket(b, BLANKET_Y)
}

function pillow(b: Buffer) {
  rect(b, BED.x + 5, PILLOW_Y, BED.w - 10, 9, C.cream)
  rect(b, BED.x + 5, PILLOW_Y + 8, BED.w - 10, 1, C.creamShade)
}

// The blanket from row `top` down to the foot of the bed
function blanket(b: Buffer, top: number) {
  const bottom = BED.y + BED.h - 3
  rect(b, BED.x + 1, top, BED.w - 2, bottom - top, C.courtBlue)
  rect(b, BED.x + 1, top, BED.w - 2, 3, C.sky) // the folded edge
  for (let y = top + 8; y < bottom; y += 7) rect(b, BED.x + 4, y, BED.w - 8, 1, C.deepBlue)
}

function desk(b: Buffer) {
  const { x, y, w, h } = DESK
  rect(b, x - 1, y - 1, w + 2, h + 2, C.ink) // outline
  rect(b, x, y, w, 14, C.wood) // the top
  rect(b, x, y + 14, w, h - 14, C.plank) // the front
  rect(b, x + 2, y + h, 2, 3, C.plank) // legs
  rect(b, x + w - 4, y + h, 2, 3, C.plank)
  // the computer: the screen (its back to the wall), a keyboard, the tower on the right
  rect(b, SCREEN.x - 1, SCREEN.y - 1, SCREEN.w + 2, SCREEN.h + 2, C.ink)
  screen(b, false, 0)
  rect(b, SCREEN.x + 6, SCREEN.y + SCREEN.h + 1, 4, 2, C.ink) // its stand
  rect(b, SCREEN.x + 1, y + 11, 14, 2, C.slate) // keyboard
  rect(b, x + w - 9, y + 3, 6, 9, C.ink) // the tower
  rect(b, x + w - 8, y + 4, 1, 1, C.sky)
  clock(b, false)
  chair(b)
}

// The screen: off (dark), or on with lines of text appearing as he types
function screen(b: Buffer, on: boolean, t: number) {
  rect(b, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, on ? C.sea : C.slate)
  if (!on) return
  const tick = Math.floor(t * 3) // a new line every third of a second, then a fresh page
  const lines = tick % 6
  for (let i = 0; i < Math.min(lines, 4); i++) {
    const width = 4 + Math.floor(hash(i, Math.floor(tick / 6)) * 9)
    rect(b, SCREEN.x + 2, SCREEN.y + 1 + i * 2, width, 1, i % 2 ? C.sky : C.white)
  }
}

// The alarm clock on the desk, by the head of the bed: digits lit, or dark between beeps
function clock(b: Buffer, lit: boolean) {
  const { x, y } = CLOCK
  rect(b, x, y, 8, 6, C.red)
  rect(b, x + 1, y + 1, 6, 3, C.ink)
  if (lit) {
    rect(b, x + 1, y + 2, 2, 1, C.sun)
    rect(b, x + 4, y + 2, 2, 1, C.sun)
  }
}

function chair(b: Buffer) {
  const { x, y } = CHAIR
  rect(b, x, y, 14, 9, C.ink) // a desk chair: dark seat
  rect(b, x + 1, y + 1, 12, 7, C.slate)
}
function chairBack(b: Buffer) {
  const { x, y } = CHAIR
  rect(b, x - 1, y + 5, 16, 6, C.ink)
  rect(b, x, y + 6, 14, 4, C.slate)
}

// Mert asleep: only his head shows on the pillow (the back of his head: we never see a face
// in bed), under the blanket
function asleep(b: Buffer, ctx: ShotContext) {
  drawMert(b, ctx, 'back', BED.x + BED.w / 2, PILLOW_Y + 30, { rows: 16, withShadow: false })
  blanket(b, BLANKET_Y)
}

// ---------- Morning: the alarm, out of bed, out of the door ----------

const GET_UP = 1.6 // s
// out of bed on its left side, across to the doorway, then down and out
const PATH = { x0: BED.x - 12, x1: DOOR.x + DOOR.w / 2, y0: 108, y1: FULL.h + 4 }
const WALK = { start: 1.9, turn: 2.9, out: 4.2 }

const wake: Shot['over'] = (b, t, ctx) => {
  // the alarm: beeping digits and little sound marks until he is up
  if (t < GET_UP) {
    const beep = Math.floor(t * 4) % 2 === 0
    clock(b, beep)
    if (beep) {
      sprite(b, ['.#', '#.', '.#'], CLOCK.x - 4, CLOCK.y, { '#': C.sun })
      sprite(b, ['#.', '.#', '#.'], CLOCK.x + 10, CLOCK.y, { '#': C.sun })
    }
    asleep(b, ctx)
    return
  }
  clock(b, true)
  // the bed he just left: the blanket thrown back
  pillow(b)
  blanket(b, BED.y + 30)
  const step = Math.floor(t * 6) % 2 === 1
  if (t < WALK.start) {
    drawMert(b, ctx, 'left', PATH.x0, PATH.y0) // up, standing by the bed
  } else if (t < WALK.turn) {
    const p = (t - WALK.start) / (WALK.turn - WALK.start)
    const x = PATH.x0 + (PATH.x1 - PATH.x0) * p
    drawMert(b, ctx, 'left', x, PATH.y0 - (step ? 1 : 0), { step })
  } else if (t < WALK.out) {
    // the door opens as he comes, and he walks out towards us
    doorway(b, true)
    const p = (t - WALK.turn) / (WALK.out - WALK.turn)
    drawMert(b, ctx, 'front', PATH.x1, PATH.y0 + (PATH.y1 - PATH.y0) * p, { step })
  } else {
    doorway(b, true)
  }
}

export const wakeShot: Shot = {
  label: {
    en: 'Pixel art: a long bedroom seen from above, morning sun through the window. The alarm clock rings, Mert gets out of bed and walks out of the door.',
    tr: 'Pixel art: yukarıdan uzun bir yatak odası, pencereden sabah güneşi. Çalar saat çalıyor, Mert yataktan kalkıp kapıdan çıkıyor.',
  },
  background: ROOM_BG,
  images: [MERT_SHEET],
  over: wake,
  still: 2.4, // on his way to the door
}

// ---------- Night: at the computer, then lights out ----------

const LIGHTS_OUT = 2.8 // s
const ZED = ['####', '..#.', '.#..', '####'] // a little z

// Night only darkens the room: the hall around it is dark already, and keeps the edges
function darkenRoom(b: Buffer) {
  for (let y = ROOM.y0; y < ROOM.y1; y++) {
    for (let x = ROOM.x0; x < ROOM.x1; x++) b.data[y * b.w + x] = darker(b.data[y * b.w + x])
  }
}

const night: Shot['over'] = (b, t, ctx) => {
  const out = t >= LIGHTS_OUT
  if (out) asleep(b, ctx) // after lights out he is in bed (drawn before the dark)
  darkenRoom(b)
  darkenRoom(b)
  // the window: dark blue sky, a few stars, the moon
  const half = { w: WINDOW.w / 2 - 1, h: WINDOW.h / 2 - 1 }
  for (const [dx, dy] of [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]) {
    rect(b, WINDOW.x + dx * (half.w + 2), WINDOW.y + dy * (half.h + 2), half.w, half.h, C.night)
  }
  for (let i = 0; i < 9; i++) {
    const sx = WINDOW.x + Math.floor(hash(i, 3) * WINDOW.w)
    const sy = WINDOW.y + Math.floor(hash(3, i) * WINDOW.h)
    const onFrame =
      Math.abs(sx - (WINDOW.x + WINDOW.w / 2)) <= 1 || Math.abs(sy - (WINDOW.y + WINDOW.h / 2)) <= 1
    if (!onFrame) pset(b, sx, sy, C.white)
  }
  disc(b, WINDOW.x + 7, WINDOW.y + 6, 2, C.glow) // the moon

  if (!out) {
    // the screen lights his corner blue, lines of homework appear, Mert at the desk
    pool(b, SCREEN.x + SCREEN.w / 2, DESK.y + 16, 30, 20, C.teal)
    screen(b, true, t)
    drawMert(b, ctx, 'back', CHAIR.x + 7, CHAIR.y + 18, { rows: 26, withShadow: false })
    chairBack(b)
    return
  }
  // asleep: little z's rising from the pillow
  for (let i = 0; i < 3; i++) {
    const age = t - LIGHTS_OUT - i * 0.5
    if (age < 0) continue
    const rise = Math.round((age % 1.5) * 8)
    sprite(b, ZED, BED.x - 8 - i * 4, PILLOW_Y - 2 - rise - i * 3, { '#': C.white })
  }
}

export const nightShot: Shot = {
  label: {
    en: 'Pixel art: the same room at night. Mert does his homework at the computer, then the screen goes off and he is asleep.',
    tr: 'Pixel art: aynı oda, gece. Mert bilgisayarda ödevini yapıyor, sonra ekran kapanıyor ve uyuyor.',
  },
  background: ROOM_BG,
  images: [MERT_SHEET],
  over: night,
  still: 1.2, // at the computer
}
