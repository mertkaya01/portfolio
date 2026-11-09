import { pset, rect, type Buffer } from './pixel'

// The scoreboard's LED font: capital letters 4 dots wide (a few need 5) and 7 dots tall, so
// even "HIGH SCHOOL" fits in the middle of the picture that phones keep (x 70–249).
// Turkish capitals get their mark in an extra row above (İ Ö Ü Ğ) or below (Ş Ç).
// '#' = a lit dot.
const BODY: Record<string, string[]> = {
  A: ['.##.', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  B: ['###.', '#..#', '#..#', '###.', '#..#', '#..#', '###.'],
  C: ['.###', '#...', '#...', '#...', '#...', '#...', '.###'],
  D: ['###.', '#..#', '#..#', '#..#', '#..#', '#..#', '###.'],
  E: ['####', '#...', '#...', '###.', '#...', '#...', '####'],
  F: ['####', '#...', '#...', '###.', '#...', '#...', '#...'],
  G: ['.###', '#...', '#...', '#.##', '#..#', '#..#', '.###'],
  H: ['#..#', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  J: ['..##', '...#', '...#', '...#', '...#', '#..#', '.##.'],
  K: ['#..#', '#.#.', '##..', '##..', '#.#.', '#..#', '#..#'],
  L: ['#...', '#...', '#...', '#...', '#...', '#...', '####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#..#', '##.#', '##.#', '#.##', '#.##', '#..#', '#..#'],
  O: ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  P: ['###.', '#..#', '#..#', '###.', '#...', '#...', '#...'],
  Q: ['.##.', '#..#', '#..#', '#..#', '#.##', '#.#.', '.#.#'],
  R: ['###.', '#..#', '#..#', '###.', '#.#.', '#..#', '#..#'],
  S: ['.###', '#...', '#...', '.##.', '...#', '...#', '###.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#..#', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  V: ['#..#', '#..#', '#..#', '#..#', '#..#', '.##.', '.##.'],
  W: ['#...#', '#...#', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#..#', '#..#', '.##.', '.##.', '.##.', '#..#', '#..#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['####', '...#', '..#.', '..#.', '.#..', '#...', '####'],
  '0': ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  '1': ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
  '2': ['.##.', '#..#', '...#', '..#.', '.#..', '#...', '####'],
  '3': ['###.', '...#', '...#', '.##.', '...#', '...#', '###.'],
  '4': ['#..#', '#..#', '#..#', '####', '...#', '...#', '...#'],
  '5': ['####', '#...', '#...', '###.', '...#', '...#', '###.'],
  '6': ['.##.', '#...', '#...', '###.', '#..#', '#..#', '.##.'],
  '7': ['####', '...#', '...#', '..#.', '.#..', '.#..', '.#..'],
  '8': ['.##.', '#..#', '#..#', '.##.', '#..#', '#..#', '.##.'],
  '9': ['.##.', '#..#', '#..#', '.###', '...#', '...#', '.##.'],
  '.': ['.', '.', '.', '.', '.', '.', '#'],
  '·': ['.', '.', '.', '#', '.', '.', '.'],
  '-': ['...', '...', '...', '###', '...', '...', '...'],
  '–': ['...', '...', '...', '###', '...', '...', '...'],
  '—': ['....', '....', '....', '####', '....', '....', '....'],
  '/': ['...#', '...#', '..#.', '.##.', '.#..', '#...', '#...'],
  ' ': ['..', '..', '..', '..', '..', '..', '..'],
}

// Turkish capitals: a base letter plus a mark above (row -1) or below (row 7)
const MARKS: Record<string, { base: string; above?: string; below?: string }> = {
  İ: { base: 'I', above: '.#.' },
  Ö: { base: 'O', above: '#..#' },
  Ü: { base: 'U', above: '#..#' },
  Ğ: { base: 'G', above: '.##.' },
  Ş: { base: 'S', below: '..#.' },
  Ç: { base: 'C', below: '.#..' },
}

export const LED_ROWS = 7 // dots in a letter's body (marks add one row above or below)

type Glyph = { width: number; dots: [number, number][] } // [column, row], row -1 … 7

const cache = new Map<string, Glyph>()
function glyph(ch: string): Glyph | undefined {
  const known = cache.get(ch)
  if (known) return known
  const mark = MARKS[ch]
  const rows = BODY[mark?.base ?? ch]
  if (!rows) return undefined
  const dots: [number, number][] = []
  const add = (row: string, r: number) => {
    for (let c = 0; c < row.length; c++) if (row[c] === '#') dots.push([c, r])
  }
  rows.forEach(add)
  if (mark?.above) add(mark.above, -1)
  if (mark?.below) add(mark.below, LED_ROWS)
  const g = { width: rows[0].length, dots }
  cache.set(ch, g)
  return g
}

// The board shows capitals only. Turkish text should arrive in capitals already (i → İ is a
// Turkish rule, wrong for English "High"): HighSchoolArt does that with the visitor's language.
export function ledUpper(text: string) {
  return text.toUpperCase()
}

// Width in pixels of a text drawn with `pitch` pixels from one dot to the next
export function ledWidth(text: string, pitch: number) {
  let columns = -1 // no gap after the last letter
  for (const ch of ledUpper(text)) columns += (glyph(ch)?.width ?? 2) + 1
  return Math.max(0, columns) * pitch
}

// Where the next text starts after this one (its width plus the gap after its last letter)
export const ledAdvance = (text: string, pitch: number) => ledWidth(text, pitch) + pitch

// Draws text as LED dots. Each dot is `size` × `size` pixels, `pitch` pixels apart.
// lit (0 … 1): how much of the text is on, from left to right — for letters switching on in
// a sweep. A dot with size ≥ 3 gets a brighter centre, like a real LED.
export function ledText(
  b: Buffer,
  text: string,
  x: number,
  y: number,
  opts: { pitch: number; size: number; on: number; core?: number; lit?: number },
) {
  const { pitch, size, on, core, lit = 1 } = opts
  const total = ledWidth(text, pitch)
  let cx = x
  for (const ch of ledUpper(text)) {
    const g = glyph(ch)
    const width = g?.width ?? 2
    for (const [c, r] of g?.dots ?? []) {
      const px = cx + c * pitch
      if (total > 0 && (px - x) / total > lit) continue // not switched on yet
      const py = y + r * pitch
      rect(b, px, py, size, size, on)
      if (core !== undefined && size >= 3) pset(b, px + 1, py + 1, core)
    }
    cx += (width + 1) * pitch
  }
}
