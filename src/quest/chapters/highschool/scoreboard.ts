import { ledAdvance, ledText, ledWidth, LED_ROWS } from './font'
import { C, createBuffer, dither, FULL, pset, rect, type Buffer } from './pixel'
import type { Shot, ShotContext } from './shot'

// The arena scoreboard, close up (320 × 180): a dark LED panel in a steel casing on the gym
// wall. Its three rows light up one after the other:
//
//        SET 1                       big dots (pitch 4) — the "1" blinks twice, then stays
//     HIGH SCHOOL                    medium dots (pitch 3) — switching on in a sweep
//  07.2017 – 07.2021                 small dots (pitch 2)
//
// The background PNG holds only the casing and the empty panel; the dots are drawn by code,
// so the text follows the visitor's language. Everything important stays between x 70 and
// 249: the part of the picture a phone keeps.

export const SCOREBOARD_BG = '/art/set1/scoreboard/background.png'

const CASING = { x: 10, y: 12, w: 300, h: 156 }
const PANEL = { x: 18, y: 20, w: 284, h: 130 }
const GRID_X = PANEL.x + 8 // where the dot columns start (every row is aligned to it)

// The three rows: dot pitch, dot size, top of the letters (row 0), colours when lit
const ROWS = {
  set: { pitch: 4, size: 3, y: 30, on: C.sun, core: C.glow, label: C.white },
  title: { pitch: 3, size: 2, y: 75, on: C.sun },
  period: { pitch: 2, size: 1, y: 118, on: C.peach },
}

export function paintScoreboardBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  // the gym wall around it: cream, a little shade, the steel brackets that hold the board
  rect(b, 0, 0, FULL.w, FULL.h, C.cream)
  for (let y = 0; y < FULL.h; y++) {
    for (let x = 0; x < FULL.w; x++) if (dither(x, y, 0.25, 0, 1)) pset(b, x, y, C.creamShade)
  }
  for (const x of [60, 254]) rect(b, x, 0, 6, CASING.y, C.grey)

  // the casing: steel, light on its top edge, dark under it, a bolt in every corner
  rect(b, CASING.x, CASING.y, CASING.w, CASING.h, C.slate)
  rect(b, CASING.x, CASING.y, CASING.w, 1, C.grey)
  rect(b, CASING.x, CASING.y + CASING.h, CASING.w, 2, C.creamShade) // its shadow on the wall
  for (const [x, y] of [
    [CASING.x + 3, CASING.y + 3],
    [CASING.x + CASING.w - 5, CASING.y + 3],
    [CASING.x + 3, CASING.y + CASING.h - 5],
    [CASING.x + CASING.w - 5, CASING.y + CASING.h - 5],
  ]) {
    rect(b, x, y, 2, 2, C.grey)
  }

  // the panel: black, two thin dividers between the rows
  rect(b, PANEL.x, PANEL.y, PANEL.w, PANEL.h, C.ink)
  for (const y of [66, 108]) rect(b, PANEL.x + 6, y, PANEL.w - 12, 1, C.slate)

  // the name on the casing, small, like a maker's plate
  const plate = 'BEYOND THE COURT'
  ledText(b, plate, Math.round(160 - ledWidth(plate, 1) / 2), PANEL.y + PANEL.h + 4, {
    pitch: 1,
    size: 1,
    on: C.grey,
  })
  return b
}

// Text centred on the picture, snapped to its row's dot grid
function centred(text: string, pitch: number) {
  return GRID_X + pitch * Math.round((160 - ledWidth(text, pitch) / 2 - GRID_X) / pitch)
}

// The dots that are off: a dim grid over a row, so the panel looks like a real LED board
function dimRow(b: Buffer, top: number, pitch: number, size: number) {
  for (let r = -1; r <= LED_ROWS; r++) {
    for (let x = GRID_X; x + size <= PANEL.x + PANEL.w - 6; x += pitch) {
      rect(b, x, top + r * pitch, size, size, C.slate)
    }
  }
}

const sweep = (t: number, from: number, length: number) =>
  Math.min(1, Math.max(0, (t - from) / length))

// The lights of the panel at time t (seconds since the close-up appeared)
export function drawScoreboard(b: Buffer, t: number, board: ShotContext['board']) {
  const { set, title, period } = ROWS
  dimRow(b, set.y, set.pitch, set.size)
  dimRow(b, title.y, title.pitch, title.size)
  dimRow(b, period.y, period.pitch, period.size)

  // Row 1: "SET" switches on, then the number blinks twice and stays
  const label = 'SET '
  const digit = String(board.set)
  const x0 = centred(label + digit, set.pitch)
  if (t >= 0.3) ledText(b, 'SET', x0, set.y, { ...set, on: set.label })
  const blink = t >= 1 || (t >= 0.45 && t < 0.6) || (t >= 0.75 && t < 0.9)
  if (blink) ledText(b, digit, x0 + ledAdvance(label, set.pitch), set.y, set)

  // Row 2: the title — narrower dots if a long title would not fit the phone's part
  const pitch = ledWidth(board.title, title.pitch) <= 176 ? title.pitch : 2
  ledText(b, board.title, centred(board.title, pitch), title.y, {
    pitch,
    size: pitch - 1,
    on: title.on,
    lit: sweep(t, 1, 0.8),
  })

  // Row 3: the period
  ledText(b, board.period, centred(board.period, period.pitch), period.y, {
    ...period,
    lit: sweep(t, 2, 0.5),
  })
}

// Coming back to the set's scoreboard later: only the close-up, no arena
export const scoreboardShot: Shot = {
  background: SCOREBOARD_BG,
  over: (b, t, ctx) => drawScoreboard(b, t, ctx.board),
  still: 99, // everything lit
}
