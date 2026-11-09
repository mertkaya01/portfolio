import { C, darker, sprite, type Buffer } from './pixel'
import type { ShotContext } from './shot'

// Mert as a high-school student, from his own 64 px character sprites (portfolio-refs), made
// ready for Set 1 by design/pixel-kit/character/make-sheet.py: clean colours, no beard yet,
// a front view, volleyball poses, and every frame once more in a sports kit.
// Frames are 28 × 40 (4 empty rows on top, 2 columns either side: room for raised arms):
//   0 right · 1 right step · 2 left · 3 left step · 4 back · 5 back step · 6 front · 7 front step
//   8 arms up · 9 bump · 10 ready (facing right; facing left = mirrored)
//   second row: the same in the sports kit (jersey with a stripe, shorts, knee pads)
// Seen a little from above, like a top-down RPG — the rooms, streets and courts of Set 1 too.
export const MERT_SHEET = '/art/set1/mert/mert.png'
export const MERT = { w: 28, h: 40, top: 4, feet: 39 } // feet: the row of the shoe soles

export type Facing = 'right' | 'left' | 'back' | 'front'
// stand / step: standing or mid-step · up: arms raised (a set, a block, a cheer)
// bump: the forearm pass · ready: knees bent, hands up, waiting for the ball
export type Pose = 'stand' | 'step' | 'up' | 'bump' | 'ready'

const FIRST: Record<Facing, number> = { right: 0, left: 2, back: 4, front: 6 }
const POSE_FRAME = { up: 8, bump: 9, ready: 10 }

function frameFor(facing: Facing, pose: Pose) {
  if (pose === 'up' || pose === 'bump' || pose === 'ready') {
    // the poses exist facing right; facing left they are mirrored; from the front or the
    // back there is no pose, so the person just stands
    if (facing === 'right' || facing === 'left') {
      return { frame: POSE_FRAME[pose], flip: facing === 'left' }
    }
    return { frame: FIRST[facing], flip: false }
  }
  return { frame: FIRST[facing] + (pose === 'step' ? 1 : 0), flip: false }
}

// ---------- Colours of the sheet, so they can be swapped for other people ----------
const rgb = (r: number, g: number, b: number) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0
export const SHEET_COLORS = {
  hair: [rgb(64, 40, 30), rgb(107, 68, 51), rgb(146, 100, 78)] as [number, number, number],
  jacket: rgb(45, 43, 46), // also the jersey and the shorts of the sports kit
  stripe: rgb(238, 237, 241), // the jersey's stripe (the shirt's white in the kit)
}
const OUTLINE = rgb(25, 16, 15)

// How someone looks: hair colours (dark → light), what the jacket becomes (a uniform, a
// jersey), the jersey's stripe, long hair, and whether they wear the sports kit
export type Look = {
  hair: [number, number, number]
  jacket: number
  stripe?: number
  longHair?: boolean
  kit?: boolean
}
export const MERT_LOOK: Look = { hair: SHEET_COLORS.hair, jacket: SHEET_COLORS.jacket }

// A soft dark oval on the floor under someone: the palette's darker shade, dithered
export function shadow(b: Buffer, x: number, y: number, half = 6) {
  for (let i = -half; i <= half; i++) {
    for (const j of [0, 1]) {
      const edge = Math.abs(i) / half
      if (j === 1 && edge > 0.6) continue
      const px = Math.round(x + i)
      const py = y + j
      if (px < 0 || px >= b.w || py < 0 || py >= b.h) continue
      const k = py * b.w + px
      b.data[k] = darker(b.data[k])
    }
  }
}

type DrawOptions = {
  pose?: Pose
  step?: boolean // walking: the mid-step frame
  rows?: number // only the top part of the body (sitting behind a desk, lying in bed)
  lean?: number // px to the side (leaning over to whisper)
  withShadow?: boolean
}

// Anyone drawn from the sheet with their own look, feet at (x, feetY)
export function drawPerson(
  b: Buffer,
  ctx: ShotContext,
  facing: Facing,
  x: number,
  feetY: number,
  look: Look,
  { pose, step = false, rows, lean = 0, withShadow = false }: DrawOptions = {},
) {
  const sheet = ctx.image(MERT_SHEET)
  if (!sheet) return
  if (withShadow) shadow(b, x, Math.round(feetY))
  const { frame, flip } = frameFor(facing, pose ?? (step ? 'step' : 'stand'))
  const swap = new Map<number, number>([
    [SHEET_COLORS.hair[0], look.hair[0]],
    [SHEET_COLORS.hair[1], look.hair[1]],
    [SHEET_COLORS.hair[2], look.hair[2]],
    [SHEET_COLORS.jacket, look.jacket],
    [SHEET_COLORS.stripe, look.stripe ?? SHEET_COLORS.stripe],
  ])
  const sx0 = frame * MERT.w
  const sy0 = look.kit ? MERT.h : 0 // the kit is the sheet's second row
  const height = rows === undefined ? MERT.h : Math.min(MERT.h, MERT.top + rows)
  const left = Math.round(x - MERT.w / 2 + lean)
  const top = Math.round(feetY - MERT.feet)
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < MERT.w; i++) {
      const s = (sy0 + j) * sheet.w + sx0 + (flip ? MERT.w - 1 - i : i)
      if (sheet.bytes[s * 4 + 3] < 128) continue
      const px = left + i
      const py = top + j
      if (px < 0 || px >= b.w || py < 0 || py >= b.h) continue
      const c = sheet.data[s]
      b.data[py * b.w + px] = swap.get(c) ?? c
    }
  }
  // long hair, seen from behind: it falls over the neck and the shoulders
  if (look.longHair && facing === 'back') {
    const cx = Math.round(x + lean)
    for (let j = MERT.top + 15; j < Math.min(height, MERT.top + 25); j++) {
      const half = j < MERT.top + 21 ? 6 : 5
      for (let i = -half; i <= half; i++) {
        const px = cx + i
        const py = top + j
        if (px < 0 || px >= b.w || py < 0 || py >= b.h) continue
        b.data[py * b.w + px] =
          Math.abs(i) === half ? OUTLINE : look.hair[(i + j) % 3 === 0 ? 1 : 0]
      }
    }
  }
}

// Mert himself: his own colours, a shadow under him unless he is sitting or lying
export function drawMert(
  b: Buffer,
  ctx: ShotContext,
  facing: Facing,
  x: number,
  feetY: number,
  options: DrawOptions = {},
) {
  drawPerson(b, ctx, facing, x, feetY, MERT_LOOK, { withShadow: true, ...options })
}

// A little yellow marker over Mert's head, like the player in an RPG — where he could get
// lost in a crowd (the classroom, the team). x: his middle, feetY: where he stands.
const MARKER = ['k#####k', '.k###k.', '..k#k..', '...k...']
export function marker(b: Buffer, x: number, feetY: number) {
  sprite(b, MARKER, Math.round(x) - 3, Math.round(feetY) - 42, { '#': C.sun, k: C.ink })
}
