// A tiny pixel-art toolkit. Everything is drawn into a small buffer of pixels — one 32-bit
// number per pixel — and then copied onto the canvas in one go (putImageData). The canvas is
// shown many times bigger with `image-rendering: pixelated`, so every pixel stays a crisp
// square instead of being blurred.

// The first style frames are 160 × 120; the full-screen scenes are 320 × 180 (FULL)
export const W = 160
export const H = 120
export const FULL = { w: 320, h: 180 }

// bytes: r, g, b, a for every pixel (what a canvas wants) · data: the same memory seen as one
// number per pixel, which is faster to fill
export type Buffer = {
  w: number
  h: number
  bytes: Uint8ClampedArray<ArrayBuffer>
  data: Uint32Array
}

export function createBuffer(w = W, h = H): Buffer {
  return fromBytes(new Uint8ClampedArray(w * h * 4), w, h)
}

// Wrap pixels that already exist (e.g. read back from a canvas) so the tools can draw on them
export function fromBytes(bytes: Uint8ClampedArray<ArrayBuffer>, w: number, h: number): Buffer {
  return { w, h, bytes, data: new Uint32Array(bytes.buffer, bytes.byteOffset, w * h) }
}

// '#rrggbb' → the number the buffer stores. In memory a pixel is the bytes r, g, b, a; read
// as one number on a little-endian machine (every phone and PC today) that is 0xAABBGGRR.
function color(hex: string) {
  const v = parseInt(hex.slice(1), 16)
  const r = (v >> 16) & 255
  const g = (v >> 8) & 255
  const b = v & 255
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0
}

// The palette: like old consoles, only a handful of colors. A sunset from deep night blue to
// the volleyball yellow of the site, plus the parquet and a few details.
export const C = {
  ink: color('#0a0b0d'), // silhouettes — the site's background color
  night: color('#141a33'),
  dusk: color('#3b2a5a'),
  plum: color('#7a3b6b'),
  coral: color('#c4524a'),
  orange: color('#e8834a'),
  peach: color('#f6b26b'),
  sun: color('#ffd23f'), // the site's accent
  glow: color('#ffe9a8'),
  white: color('#e6edf5'),
  grey: color('#8a93a0'),
  slate: color('#20242e'),
  sea: color('#1d2b4a'),
  teal: color('#2f4f6b'),
  wood: color('#c98b52'), // the site's parquet
  plank: color('#8a5a36'),
  sky: color('#7dd3fc'),
  red: color('#d63a2f'),
  // added from the reference photos (see design/pixel-kit)
  parquet: color('#e2b878'),
  terracotta: color('#c65a3a'),
  brick: color('#8f3b28'), // terracotta in shadow
  cream: color('#efe1c4'),
  creamShade: color('#c9b896'),
  daySky: color('#8cc0e8'),
  courtBlue: color('#2f5aa8'),
  deepBlue: color('#1f3a78'),
  salmon: color('#d99a86'),
  green: color('#4f7a3a'),
  skin: color('#d39a74'),
  hair: color('#3a2418'),
}

export function pset(b: Buffer, x: number, y: number, c: number) {
  x = Math.round(x)
  y = Math.round(y)
  if (x >= 0 && x < b.w && y >= 0 && y < b.h) b.data[y * b.w + x] = c
}

export function rect(b: Buffer, x: number, y: number, w: number, h: number, c: number) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) pset(b, x + i, y + j, c)
}

// A filled circle. maxY cuts it off (e.g. a sun sinking behind the horizon).
export function disc(b: Buffer, cx: number, cy: number, r: number, c: number, maxY = b.h) {
  for (let y = -r; y <= r; y++) {
    if (cy + y >= maxY) break
    for (let x = -r; x <= r; x++) {
      // "+ r * 0.8" rounds the edge off nicely at small sizes
      if (x * x + y * y <= r * r + r * 0.8) pset(b, cx + x, cy + y, c)
    }
  }
}

// Ordered dithering. With few colors, old games faked in-between shades by mixing two
// colors pixel by pixel in a fixed pattern (a 4×4 Bayer matrix). t (0 … 1) is the share of
// pixels that take color b: 0.5 gives a checkerboard, 0.25 every fourth pixel, and so on.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
export function dither(x: number, y: number, t: number, a: number, b: number) {
  return t * 16 > BAYER[(y & 3) * 4 + (x & 3)] + 0.5 ? b : a
}

// A vertical gradient between rows y0 and y1, dithered between neighbouring colors.
// stops: [position 0 … 1, color], top to bottom.
export function gradient(b: Buffer, y0: number, y1: number, stops: [number, number][]) {
  for (let y = y0; y < y1; y++) {
    const p = (y - y0) / Math.max(1, y1 - y0 - 1)
    let i = 0
    while (i < stops.length - 2 && p > stops[i + 1][0]) i++
    const [p0, c0] = stops[i]
    const [p1, c1] = stops[i + 1]
    const t = Math.min(1, Math.max(0, (p - p0) / (p1 - p0)))
    for (let x = 0; x < b.w; x++) pset(b, x, y, dither(x, y, t, c0, c1))
  }
}

// A beam of light from (x, y0) down to y1, widening as it goes. Pixels inside are mixed with
// the light color: `strength` (0 … 1) in the middle, fading to nothing at the edges — the
// dithered look of a spotlight on old screens.
export function beam(
  b: Buffer,
  x: number,
  y0: number,
  y1: number,
  spread: number,
  light: number,
  strength: number,
) {
  for (let y = y0; y < y1; y++) {
    const half = 2 + (y - y0) * spread
    for (let i = Math.floor(x - half); i <= x + half; i++) {
      const edge = 1 - Math.abs(i - x) / (half + 1)
      if (dither(i, y, strength * edge, 0, 1)) pset(b, i, y, light)
    }
  }
}

// The bright patch a light makes on the floor: an oval of dithered glow
export function pool(b: Buffer, x: number, y: number, rx: number, ry: number, light: number) {
  for (let j = 0; j <= ry; j++) {
    for (let i = -rx; i <= rx; i++) {
      const d = (i * i) / (rx * rx) + (j * j) / (ry * ry)
      if (d <= 1 && dither(x + i, y + j, 0.5 * (1 - d), 0, 1)) pset(b, x + i, y + j, light)
    }
  }
}

// A sprite is drawn as text: one string per row, one character per pixel, '.' is empty.
// `colors` says which color each letter stands for; flip mirrors it (faces the other way).
export function sprite(
  b: Buffer,
  rows: readonly string[],
  x: number,
  y: number,
  colors: Record<string, number>,
  flip = false,
) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = flip ? row[row.length - 1 - i] : row[i]
      const c = colors[ch]
      if (c !== undefined) pset(b, x + i, y + j, c)
    }
  })
}

// Rim light: the classic trick for silhouettes against a low sun. Every sprite pixel whose
// neighbour on the sun's side is empty gets the light colour — a thin bright edge.
// side: 1 = the light comes from the right, -1 = from the left.
export function rim(
  b: Buffer,
  rows: readonly string[],
  x: number,
  y: number,
  side: 1 | -1,
  light: number,
  body = 'k',
) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== body) continue
      const next = row[i + side]
      if (next === undefined || next === '.') pset(b, x + i, y + j, light)
    }
  })
}

// An older, smaller picture made full-size: every pixel doubled, and `top` chooses which rows
// of the old picture stay in the wider frame (it is a different shape, so some rows go)
export function enlarge(src: Buffer, factor: number, top: number, w = FULL.w, h = FULL.h) {
  const out = createBuffer(w, h)
  for (let y = 0; y < h; y++) {
    const sy = top + Math.floor(y / factor)
    for (let x = 0; x < w; x++) {
      out.data[y * w + x] = src.data[sy * src.w + Math.floor(x / factor)]
    }
  }
  return out
}

// A 5-pixel-tall font, only the letters we need. '#' = pixel.
const FONT: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  '2': ['###', '..#', '###', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  ' ': ['..', '..', '..', '..', '..'],
}

export function textWidth(text: string) {
  return [...text].reduce((w, ch) => w + (FONT[ch]?.[0].length ?? 3) + 1, -1)
}

export function text(b: Buffer, value: string, x: number, y: number, c: number) {
  for (const ch of value) {
    const glyph = FONT[ch]
    if (!glyph) continue
    sprite(b, glyph, x, y, { '#': c })
    x += glyph[0].length + 1
  }
}

// A repeatable "random" number from 0 to 1 for a position: the windows that are lit, the
// crowd, the stars — the same pattern for every visitor and every frame.
export function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

// ---------- Shading, copying and blending whole pictures ----------

// Pixel artists shade by swapping each colour for its darker neighbour in the palette (not by
// mixing in black): the picture stays clean. Shadows lean cool (cream → grey, not brown).
const DARKER = new Map<number, number>([
  [C.glow, C.peach],
  [C.peach, C.orange],
  [C.orange, C.coral],
  [C.coral, C.plum],
  [C.plum, C.dusk],
  [C.dusk, C.night],
  [C.night, C.ink],
  [C.cream, C.creamShade],
  [C.creamShade, C.grey],
  [C.parquet, C.wood],
  [C.wood, C.plank],
  [C.plank, C.slate],
  [C.terracotta, C.brick],
  [C.brick, C.slate],
  [C.red, C.brick],
  [C.salmon, C.coral],
  [C.white, C.grey],
  [C.grey, C.slate],
  [C.slate, C.ink],
  [C.daySky, C.teal],
  [C.courtBlue, C.deepBlue],
  [C.deepBlue, C.night],
  [C.teal, C.sea],
  [C.sea, C.night],
  [C.sky, C.teal],
  [C.sun, C.orange],
  [C.green, C.slate],
  [C.skin, C.plank],
])
export const darker = (c: number) => DARKER.get(c) ?? c

// The left of a full-screen picture in shade, so the story text reads on top of it:
// one step darker left of `one`, two steps left of `two`, a dithered band at each edge.
// (Pass a negative `two` for one step only — bright rooms look wrong in deep shade.)
export function shadeLeft(b: Buffer, one = 112, two = 64, band = 16) {
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < Math.min(b.w, one + band); x++) {
      const i = y * b.w + x
      let c = b.data[i]
      if (dither(x, y, Math.min(1, Math.max(0, (one + band - x) / band)), 0, 1)) c = darker(c)
      if (dither(x, y, Math.min(1, Math.max(0, (two + band - x) / band)), 0, 1)) c = darker(c)
      b.data[i] = c
    }
  }
}

// One frame out of a sprite sheet (frames side by side in one PNG), drawn where its pixels are
// not transparent. This is how Mert's exported sprites are played.
export function blitFrame(
  b: Buffer,
  sheet: Buffer,
  frame: number,
  frameWidth: number,
  x: number,
  y: number,
  flip = false,
) {
  const sx0 = frame * frameWidth
  for (let j = 0; j < sheet.h; j++) {
    for (let i = 0; i < frameWidth; i++) {
      const s = j * sheet.w + sx0 + (flip ? frameWidth - 1 - i : i)
      if (sheet.bytes[s * 4 + 3] > 127) pset(b, x + i, y + j, sheet.data[s])
    }
  }
}

// The classic retro transition between two pictures: pixel by pixel in the Bayer pattern, so
// the new picture "grows" through the old one. progress 0 → all old, 1 → all new.
export function dissolve(out: Buffer, from: Buffer, to: Buffer, progress: number) {
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      const i = y * out.w + x
      out.data[i] = dither(x, y, progress, from.data[i], to.data[i])
    }
  }
}
