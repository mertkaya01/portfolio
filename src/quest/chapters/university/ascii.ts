// The ASCII kit of Set 3: a terminal screen of 80 × 27 characters that scenes write into, frame
// by frame. (Rendered by UniversityArt as SVG text in the site's monospace font, so it stays
// sharp at any size.) Phones keep the middle columns 18–61 — what matters goes there.
export const COLS = 80
export const ROWS = 27
export const SAFE = { from: 18, to: 61 }

export class Screen {
  rows: string[][]
  constructor() {
    this.rows = Array.from({ length: ROWS }, () => Array<string>(COLS).fill(' '))
  }

  // write text at column x, row y (what falls outside the screen is cut off)
  put(x: number, y: number, text: string) {
    if (y < 0 || y >= ROWS) return
    ;[...text].forEach((ch, i) => {
      const c = x + i
      if (c >= 0 && c < COLS && ch !== '\u0000') this.rows[y][c] = ch
    })
  }

  // text typed out: only the first characters, as many as `typed` (0 … length)
  type(x: number, y: number, text: string, typed: number) {
    this.put(x, y, [...text].slice(0, Math.max(0, Math.floor(typed))).join(''))
  }

  // a box drawn with line characters; `title` sits in its top edge
  box(x: number, y: number, w: number, h: number, title = '') {
    this.put(x, y, `┌${'─'.repeat(w - 2)}┐`)
    for (let j = 1; j < h - 1; j++) {
      this.put(x, y + j, '│')
      this.put(x + w - 1, y + j, '│')
    }
    this.put(x, y + h - 1, `└${'─'.repeat(w - 2)}┘`)
    if (title) this.put(x + 2, y, ` ${title} `)
  }

  // several lines of text, one under the other
  block(x: number, y: number, lines: string[]) {
    lines.forEach((line, i) => this.put(x, y + i, line))
  }

  lines() {
    return this.rows.map((r) => r.join(''))
  }
}

// How many characters are typed `t` seconds in, from `start`, at `cps` characters a second
export const typed = (t: number, start: number, cps = 28) => Math.max(0, (t - start) * cps)

// A blinking block cursor
export const cursor = (t: number) => (Math.floor(t * 2.5) % 2 === 0 ? '█' : ' ')

// Big digits and capitals, 5 rows high, made of blocks — for the scoreboard
const BIG: Record<string, string[]> = {
  S: ['▄███▄', '█▄▄▄ ', ' ▀▀▀█', '█▄▄▄█', ' ▀▀▀ '],
  E: ['█████', '█▄▄▄ ', '█▀▀▀ ', '█▄▄▄▄', '▀▀▀▀▀'],
  T: ['█████', '  █  ', '  █  ', '  █  ', '  ▀  '],
  '1': [' ▄█  ', '  █  ', '  █  ', ' ▄█▄ ', ' ▀▀▀ '],
  '2': ['▄███▄', '   ▄█', ' ▄█▀ ', '█▄▄▄▄', '▀▀▀▀▀'],
  '3': ['▄███▄', '   ▄█', '  ▀█▄', '▄   █', '▀███▀'],
  '4': ['█  █ ', '█  █ ', '█▄▄█▄', '   █ ', '   ▀ '],
  '5': ['█████', '█▄▄▄ ', '    █', '▄   █', '▀███▀'],
  ' ': ['   ', '   ', '   ', '   ', '   '],
}
export function bigWidth(text: string) {
  return [...text].reduce((w, ch) => w + (BIG[ch]?.[0].length ?? 3) + 1, -1)
}
export function putBig(s: Screen, x: number, y: number, text: string) {
  let cx = x
  for (const ch of text) {
    const glyph = BIG[ch] ?? BIG[' ']
    s.block(cx, y, glyph)
    cx += glyph[0].length + 1
  }
}

// A repeatable "random" number from 0 to 1 (the same for every visitor and frame)
export function hash(a: number, b: number) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}
