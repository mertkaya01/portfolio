import { wallFlag } from './gym'
import { drawMert, drawPerson, marker, MERT_SHEET, type Look } from './mert'
import { C, createBuffer, disc, dither, FULL, hash, pset, rect, type Buffer } from './pixel'
import type { Shot } from './shot'

// The classroom, seen from above and behind like a top-down RPG (320 × 180): science track,
// three rows of double desks facing the blackboard. Mert sits in the middle; his classmates and
// the teacher are seen from behind (no faces), each with their own hair and uniform colours.
// While the teacher writes on the board, his deskmate leans over to whisper something.
// A representative classroom — not a copy of a real one.

const ROOM = { x0: 36, x1: 284 }
const WALL_BOTTOM = 46
const BOARD = { x: 108, y: 8, w: 104, h: 28 }
const DESK_ROWS = [62, 102, 142] // the top edge of each row of desks
const DESK_COLS = [84, 160, 236] // the middle of each double desk
const DESK = { w: 46, top: 8, front: 6 }
const SEAT = 11 // a seat is this far left / right of the desk's middle
const MERT_SEAT = { col: 1, row: 1, side: -1 } // middle desk, middle row, the left seat

export const CLASS_BG = '/art/set1/class/background.png'

// ---------- The classroom (exported as the background PNG) ----------

export function paintClassBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  b.data.fill(C.slate) // the corridor around the room (dark)
  // the front wall: pale green below, cream above, like many school walls
  rect(b, ROOM.x0, 0, ROOM.x1 - ROOM.x0, WALL_BOTTOM, C.cream)
  rect(b, ROOM.x0, 30, ROOM.x1 - ROOM.x0, WALL_BOTTOM - 30, C.creamShade)
  rect(b, ROOM.x0, WALL_BOTTOM - 2, ROOM.x1 - ROOM.x0, 2, C.plank)

  // the floor: big pale tiles
  rect(b, ROOM.x0, WALL_BOTTOM, ROOM.x1 - ROOM.x0, FULL.h - WALL_BOTTOM, C.cream)
  for (let y = WALL_BOTTOM + 15; y < FULL.h; y += 16)
    rect(b, ROOM.x0, y, ROOM.x1 - ROOM.x0, 1, C.creamShade)
  for (let x = ROOM.x0 + 15; x < ROOM.x1; x += 16)
    rect(b, x, WALL_BOTTOM, 1, FULL.h - WALL_BOTTOM, C.creamShade)

  // the side walls seen from above; windows in the left one, their light on the floor
  rect(b, ROOM.x0, 0, 6, FULL.h, C.creamShade)
  rect(b, ROOM.x1 - 6, 0, 6, FULL.h, C.creamShade)
  for (const wy of [56, 100, 144]) {
    rect(b, ROOM.x0, wy, 6, 22, C.daySky)
    rect(b, ROOM.x0, wy + 10, 6, 2, C.white)
    for (let y = wy; y < wy + 22; y++) {
      for (let x = ROOM.x0 + 6; x < ROOM.x0 + 40 + (y - wy); x++) {
        if (dither(x, y + 4, 0.3, 0, 1)) pset(b, x, y + 4, C.glow)
      }
    }
  }

  blackboard(b)
  // above the board: the flag; on the left a pin board, on the right a clock
  wallFlag(b, 222, 4)
  rect(b, 56, 8, 40, 26, C.plank)
  rect(b, 58, 10, 36, 22, C.wood)
  for (let i = 0; i < 6; i++) {
    const x = 60 + Math.floor(hash(i, 2) * 26)
    const y = 12 + Math.floor(hash(2, i) * 12)
    rect(b, x, y, 7, 8, [C.white, C.sky, C.peach][i % 3])
    pset(b, x + 3, y, C.red)
  }
  disc(b, 270, 18, 7, C.white)
  disc(b, 270, 18, 6, C.cream)
  rect(b, 270, 13, 1, 5, C.ink)
  rect(b, 270, 18, 4, 1, C.ink)

  // the teacher's desk in front of the board
  rect(b, 135, 46, 50, 14, C.ink) // outline
  rect(b, 136, 47, 48, 8, C.wood)
  rect(b, 136, 55, 48, 4, C.plank)
  rect(b, 140, 49, 10, 4, C.white) // papers
  rect(b, 172, 49, 6, 4, C.red) // a red book

  // the pupils' desks: wooden tops on grey metal frames
  for (const y of DESK_ROWS) {
    for (const x of DESK_COLS) {
      const x0 = x - DESK.w / 2
      rect(b, x0 - 1, y - 1, DESK.w + 2, DESK.top + DESK.front + 2, C.ink) // outline
      rect(b, x0, y, DESK.w, DESK.top, C.wood)
      rect(b, x0, y, DESK.w, 1, C.parquet)
      rect(b, x0, y + DESK.top, DESK.w, DESK.front, C.plank)
      rect(b, x0 + 1, y + DESK.top + DESK.front, 2, 3, C.grey)
      rect(b, x0 + DESK.w - 3, y + DESK.top + DESK.front, 2, 3, C.grey)
      // notebooks and pencil cases on the desk, a bit different on every desk
      for (const side of [-1, 1]) {
        const nx = x + side * SEAT - 4
        rect(b, nx, y + 2, 8, 5, hash(x, y + side) < 0.5 ? C.white : C.sky)
        if (hash(y, x + side) < 0.5) rect(b, side < 0 ? nx + 9 : nx - 4, y + 3, 3, 2, C.coral)
      }
    }
  }
  return b
}

function blackboard(b: Buffer) {
  const { x, y, w, h } = BOARD
  rect(b, x - 2, y - 2, w + 4, h + 4, C.plank) // the wooden frame
  rect(b, x, y, w, h, C.green)
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) if (dither(i, j, 0.12, 0, 1)) pset(b, i, j, C.slate) // old chalk
  }
  rect(b, x - 2, y + h + 2, w + 4, 2, C.wood) // the chalk tray
  rect(b, x + 8, y + h + 1, 4, 1, C.white)
}

// ---------- The people ----------

const HAIR: Record<string, [number, number, number]> = {
  black: [C.ink, C.slate, C.slate],
  light: [C.plank, C.wood, C.parquet],
  auburn: [C.brick, C.terracotta, C.coral],
} // (nobody else has Mert's dark brown: he should stand out)
const UNIFORM = [C.deepBlue, C.sea, C.deepBlue, C.teal]

// Everyone else in the room: a look per seat, the same for every visitor
function classmate(col: number, row: number, side: number): Look {
  const n = hash(col * 3 + row, side + 5)
  const hair = Object.values(HAIR)[Math.floor(n * 3)]
  return {
    hair,
    jacket: UNIFORM[Math.floor(hash(row, col + side) * UNIFORM.length)],
    longHair: hash(side, col + row * 5) < 0.45,
  }
}

const TEACHER: Look = { hair: [C.grey, C.white, C.white], jacket: C.plum }
const SEATED_ROWS = 27 // a seated pupil: head, shoulders, the top of the back
const SEAT_GAP = 42 // from the top of a desk to the feet of the pupils sitting at it

// The bench of a double school desk ("sıra"), seen from behind: one long wooden backrest for
// both pupils, on the grey metal frame that joins it to the desk in front of them
function deskBench(b: Buffer, x: number, deskY: number) {
  const x0 = x - DESK.w / 2
  const y = deskY + SEAT_GAP - 8 // the top of the backrest
  // the frame: a bar down each side, from the desk to the bench, and short legs under it
  for (const fx of [x0 - 1, x0 + DESK.w - 1]) {
    rect(b, fx, deskY + DESK.top + DESK.front, 2, y - deskY - DESK.top - DESK.front, C.grey)
    rect(b, fx, y + 7, 2, 3, C.grey)
  }
  rect(b, x0 - 1, y - 1, DESK.w + 2, 9, C.ink) // outline
  for (const sy of [y, y + 4]) {
    rect(b, x0, sy, DESK.w, 3, C.wood) // two slats
    rect(b, x0, sy, DESK.w, 1, C.parquet) // light on their top edge
  }
}

const play: Shot['over'] = (b, t, ctx) => {
  // the teacher at the board, writing: the arm goes up and down, chalk lines appear
  const writing = Math.floor(t * 4) % 2 === 0
  const lines = Math.min(4, Math.floor(t / 0.8) + 1)
  for (let i = 0; i < lines; i++) {
    const full = i < lines - 1
    const width = full ? 30 + Math.floor(hash(i, 7) * 50) : Math.floor(((t / 0.8) % 1) * 60) + 4
    rect(b, BOARD.x + 8, BOARD.y + 5 + i * 6, width, 1, C.white)
    if (i % 2 === 1) rect(b, BOARD.x + 8 + width + 3, BOARD.y + 5 + i * 6, 6, 1, C.white)
  }
  const tx = 196
  drawPerson(b, ctx, 'back', tx, 48, TEACHER)
  rect(b, tx + 7, writing ? 24 : 27, 2, 8, C.plum) // the writing arm
  pset(b, tx + 7, writing ? 23 : 26, C.skin)

  // the pupils, row by row from the back of the picture to the front
  DESK_ROWS.forEach((deskY, row) => {
    // seated at the desk: heads over its front edge, the bench's backrest below them
    const feet = deskY + SEAT_GAP
    DESK_COLS.forEach((x, col) => {
      for (const side of [-1, 1]) {
        const sx = x + side * SEAT
        const isMert = col === MERT_SEAT.col && row === MERT_SEAT.row && side === MERT_SEAT.side
        if (isMert) {
          drawMert(b, ctx, 'back', sx, feet, { rows: SEATED_ROWS, withShadow: false })
          // a little yellow marker over his head, like the player in an RPG
          marker(b, sx, feet)
        } else {
          // Mert's deskmate leans over to whisper, then sits back
          const deskmate = col === MERT_SEAT.col && row === MERT_SEAT.row
          const lean = deskmate && t > 1.8 && t < 3.0 ? -3 : 0
          drawPerson(b, ctx, 'back', sx, feet, classmate(col, row, side), {
            rows: SEATED_ROWS,
            lean,
          })
        }
      }
      deskBench(b, x, deskY)
    })
  })
}

export const classShot: Shot = {
  label: {
    en: 'Pixel art: a classroom seen from above and behind. The teacher writes on the blackboard; Mert sits among his classmates, and his deskmate leans over to whisper.',
    tr: 'Pixel art: yukarıdan ve arkadan bir sınıf. Öğretmen tahtaya yazıyor; Mert arkadaşlarının arasında oturuyor, sıra arkadaşı ona doğru eğilip fısıldıyor.',
  },
  background: CLASS_BG,
  images: [MERT_SHEET],
  over: play,
  still: 2.2, // the deskmate leaning over
}
