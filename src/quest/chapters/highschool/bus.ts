import { tree } from './gym'
import { drawMert, MERT_SHEET } from './mert'
import { C, createBuffer, dither, FULL, hash, pset, rect, type Buffer } from './pixel'
import type { Shot } from './shot'

// The bus stop in the morning, seen from above like a top-down RPG (320 × 180).
// Mert waits under the shelter; the bus comes in from the right, stops in front of him (and
// hides him, as a bus does), opens its door, closes it, and drives off — he is gone, on his way
// to school. A representative Istanbul street: no real shop names, no bus company.
//
//   0 – 0.8 s  waiting       0.8 – 2.2 s  the bus pulls in      2.5 – 3.3 s  the door is open
//   3.6 s →    the bus leaves to the left

const SIDEWALK = { top: 66, bottom: 104 }
const ROAD = { top: 108, bottom: 172 }
const SHELTER = { x: 122, w: 58 }
const WAIT = { x: 142, feet: 100 }

const BUS = { length: 236, roof: 12, body: 62, bottom: 138 } // px; tall enough to hide him
const STOP_X = 116 // where the bus's front stops (its door is then right at Mert)
const DOOR_OFFSET = 18 // the front door, measured from the front of the bus

export const BUS_BG = '/art/set1/bus/background.png'

// ---------- The street (exported as the background PNG) ----------

export function paintBusBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  // three apartment buildings, morning light on their fronts
  const fronts: [number, number, number][] = [
    [0, 108, C.salmon],
    [108, 214, C.cream],
    [214, 320, C.terracotta],
  ]
  for (const [x0, x1, wall] of fronts) {
    rect(b, x0, 0, x1 - x0, SIDEWALK.top, wall)
    rect(b, x1 - 1, 0, 1, SIDEWALK.top, C.slate) // the gap between two buildings
    // two rows of windows with little balcony rails
    for (const y of [4, 26]) {
      for (let x = x0 + 8; x + 14 < x1; x += 22) {
        rect(b, x - 1, y - 1, 16, 14, C.white)
        rect(b, x, y, 14, 12, hash(x, y) < 0.3 ? C.teal : C.daySky)
        rect(b, x + 7, y, 1, 12, C.white)
        rect(b, x - 2, y + 13, 18, 2, C.grey)
        for (let i = x - 2; i < x + 16; i += 3) rect(b, i, y + 9, 1, 4, C.grey)
      }
    }
  }
  // a shop on the street floor of the middle building: a striped awning and a window
  for (let x = 124; x < 200; x++)
    rect(b, x, 46, 1, 6, Math.floor((x - 124) / 6) % 2 ? C.white : C.red)
  rect(b, 128, 52, 68, 14, C.teal)
  rect(b, 128, 52, 68, 1, C.slate)
  // the shade where the buildings meet the pavement
  for (let y = SIDEWALK.top - 6; y < SIDEWALK.top; y++) {
    for (let x = 0; x < FULL.w; x++)
      if (dither(x, y, (y - SIDEWALK.top + 6) / 8, 0, 1)) pset(b, x, y, C.slate)
  }

  // the pavement: square slabs
  rect(b, 0, SIDEWALK.top, FULL.w, SIDEWALK.bottom - SIDEWALK.top, C.creamShade)
  for (let y = SIDEWALK.top + 9; y < SIDEWALK.bottom; y += 10) rect(b, 0, y, FULL.w, 1, C.grey)
  for (let x = 6; x < FULL.w; x += 12)
    rect(b, x, SIDEWALK.top, 1, SIDEWALK.bottom - SIDEWALK.top, C.grey)
  // the kerb
  rect(b, 0, SIDEWALK.bottom, FULL.w, 2, C.white)
  rect(b, 0, SIDEWALK.bottom + 2, FULL.w, ROAD.top - SIDEWALK.bottom - 2, C.grey)

  // the road: asphalt with a little grain, white dashes between the lanes
  rect(b, 0, ROAD.top, FULL.w, ROAD.bottom - ROAD.top, C.slate)
  for (let y = ROAD.top; y < ROAD.bottom; y++) {
    for (let x = 0; x < FULL.w; x++) if (hash(x, y) < 0.05) pset(b, x, y, C.ink)
  }
  for (let x = 4; x < FULL.w; x += 26) rect(b, x, 141, 14, 2, C.white)
  // the far pavement at the bottom edge
  rect(b, 0, ROAD.bottom, FULL.w, 2, C.white)
  rect(b, 0, ROAD.bottom + 2, FULL.w, FULL.h - ROAD.bottom - 2, C.creamShade)

  shelter(b)
  // a lamp post, and a tree in its square pit
  rect(b, 58, 40, 2, 62, C.grey)
  rect(b, 54, 38, 10, 3, C.slate)
  rect(b, 249, 84, 18, 16, C.plank)
  rect(b, 249, 84, 18, 1, C.slate)
  tree(b, 258, 78)
  return b
}

// The bus shelter: a glass back wall, a roof seen from above, a bench, and the stop's sign
function shelter(b: Buffer) {
  const { x, w } = SHELTER
  for (let y = 70; y < 92; y++) {
    for (let i = x; i < x + w; i++) if (dither(i, y, 0.5, 0, 1)) pset(b, i, y, C.sky)
  }
  rect(b, x - 2, 64, w + 4, 6, C.grey) // the roof
  rect(b, x - 2, 64, w + 4, 1, C.white)
  rect(b, x, 70, 2, 26, C.slate) // posts
  rect(b, x + w - 2, 70, 2, 26, C.slate)
  rect(b, x + 6, 88, w - 12, 4, C.plank) // the bench
  rect(b, x + 6, 92, w - 12, 1, C.slate)
  // the sign: a pole with a round plate, a little bus on it
  rect(b, x + w + 10, 60, 2, 42, C.grey)
  rect(b, x + w + 6, 54, 10, 10, C.white)
  rect(b, x + w + 7, 55, 8, 8, C.deepBlue)
  rect(b, x + w + 8, 57, 6, 3, C.white)
  rect(b, x + w + 8, 61, 1, 1, C.white)
  rect(b, x + w + 13, 61, 1, 1, C.white)
}

// ---------- What moves ----------

// The bus from the side (a little from above): white roof, blue body, dark windows, wheels.
// x: its front (it drives to the left)
function bus(b: Buffer, x: number, doorOpen: boolean) {
  const top = BUS.bottom - BUS.body
  const x1 = x + BUS.length
  rect(b, x - 1, top - BUS.roof - 1, BUS.length + 2, BUS.body + BUS.roof + 2, C.ink) // outline
  rect(b, x, top - BUS.roof, BUS.length, BUS.roof, C.white) // the roof, seen from above
  rect(b, x + 30, top - BUS.roof + 3, 30, 4, C.grey) // air conditioning on the roof
  rect(b, x, top, BUS.length, BUS.body, C.courtBlue) // the body
  rect(b, x, top, BUS.length, 1, C.white)
  rect(b, x, BUS.bottom - 10, BUS.length, 2, C.white) // a stripe low on its side
  // windows: the windscreen at the front, then a row along the side
  rect(b, x, top + 4, 12, 28, C.teal)
  rect(b, x + 2, top + 6, 3, 10, C.sky)
  for (let wx = x + 40; wx + 26 < x1; wx += 30) {
    rect(b, wx, top + 6, 26, 20, C.teal)
    rect(b, wx + 2, top + 8, 4, 6, C.sky)
  }
  // the route sign over the windscreen: orange dots
  rect(b, x + 2, top - 1, 30, 4, C.ink)
  for (let i = 0; i < 13; i++) if (i % 4 !== 3) pset(b, x + 4 + i * 2, top + 1, C.orange)
  // the front door: shut (two panels) or open (dark inside)
  const dx = x + DOOR_OFFSET
  rect(b, dx, top + 4, 16, BUS.body - 6, doorOpen ? C.ink : C.teal)
  if (!doorOpen) rect(b, dx + 7, top + 4, 2, BUS.body - 6, C.slate)
  rect(b, x + 64, top + 4, 16, BUS.body - 6, C.teal) // the middle door
  rect(b, x + 71, top + 4, 2, BUS.body - 6, C.slate)
  // wheels
  for (const wx of [x + 30, x1 - 46]) {
    rect(b, wx, BUS.bottom - 4, 20, 8, C.ink)
    rect(b, wx + 7, BUS.bottom - 2, 6, 4, C.grey)
  }
  // its shadow on the road
  for (let i = x + 4; i < x1 + 4; i++) {
    for (let j = BUS.bottom + 4; j < BUS.bottom + 7; j++)
      if (dither(i, j, 0.5, 0, 1)) pset(b, i, j, C.ink)
  }
}

const ARRIVE = { start: 0.8, end: 2.2 }
const DOOR = { open: 2.5, close: 3.3 }
const LEAVE = 3.6

const easeOut = (p: number) => 1 - (1 - p) * (1 - p)
const easeIn = (p: number) => p * p

function busAt(t: number) {
  if (t < ARRIVE.start) return FULL.w + 20 // still out of sight
  if (t < ARRIVE.end) {
    const p = easeOut((t - ARRIVE.start) / (ARRIVE.end - ARRIVE.start))
    return FULL.w + 20 + (STOP_X - FULL.w - 20) * p
  }
  if (t < LEAVE) return STOP_X
  return STOP_X - easeIn((t - LEAVE) / 1.6) * (STOP_X + BUS.length + 20)
}

const play: Shot['over'] = (b, t, ctx) => {
  // Mert waits (shifting his weight now and then) until the bus has taken him
  if (t < DOOR.close) {
    const shift = t < ARRIVE.start + 0.6 && Math.floor(t * 2) % 2 === 1
    drawMert(b, ctx, 'right', WAIT.x, WAIT.feet - (shift ? 1 : 0))
  }
  const x = busAt(t)
  if (x < FULL.w) bus(b, Math.round(x), t >= DOOR.open && t < DOOR.close)
}

export const busShot: Shot = {
  label: {
    en: 'Pixel art: a street in the morning, seen from above. Mert waits at the bus stop; the bus pulls in, opens its door and drives off with him.',
    tr: 'Pixel art: yukarıdan sabah bir sokak. Mert otobüs durağında bekliyor; otobüs yanaşıyor, kapısını açıyor ve onu alıp gidiyor.',
  },
  background: BUS_BG,
  images: [MERT_SHEET],
  over: play,
  still: 0.4, // waiting at the stop
}
