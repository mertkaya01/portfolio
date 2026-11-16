import { C, hash, type Buffer } from './pixel'

// Light for Set 1's shots, the way 320 × 180 games light their scenes (Celeste does it at this
// very size): each shot names its light sources, the picture is shaded by them in a few bands —
// dithered at the band edges with the same Bayer pattern as the dissolves — and every shaded
// colour snaps back to the palette. Light can only ever give palette colours: no blur, no
// muddy in-between tones, and the shadows lean blue-violet while the light leans warm (the
// hue shift pixel artists paint by hand).
//
// A shot opts in with `lighting` (shot.ts); it is applied after all its layers, so Mert and
// everything else walk in and out of the light.

export type Light = { x: number; y: number; r: number; power: number } // a soft round light
export type Lighting = {
  ambient: number // the light everywhere: 1 = as drawn, lower = darker
  lights: Light[]
  flicker?: number // 0–1: how often (per 12 fps frame) the light dips for a frame — fluorescent
  dust?: { x: number; y: number; w: number; h: number; n: number } // motes, seen only in the light
}

// The bands of light: darker, dim, as drawn, bright
const LEVELS = [0.6, 0.8, 1, 1.15]
const AS_DRAWN = 2

// ---------- the palette, and every colour → the nearest palette colour, shaded ----------

const PALETTE = [...new Set(Object.values(C))].map((c) => [
  c & 255,
  (c >> 8) & 255,
  (c >> 16) & 255,
])
const PALETTE_C = [...new Set(Object.values(C))]

function nearest(r: number, g: number, b: number) {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < PALETTE.length; i++) {
    const [pr, pg, pb] = PALETTE[i]
    // weighted: the eye is most sensitive to green, least to blue
    const d = 2 * (pr - r) ** 2 + 4 * (pg - g) ** 2 + 3 * (pb - b) ** 2
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return PALETTE_C[best]
}

// A colour in a band of light. Darker: blue holds on longer and a touch of violet comes in;
// brighter: warm, towards the sun yellow.
function shade(r: number, g: number, b: number, f: number) {
  if (f < 1) {
    const k = f
    return [r * k + (1 - k) * 18, g * k, b * (k + (1 - k) * 0.4) + (1 - k) * 30]
  }
  const k = f - 1
  return [r * f + k * 90, g * f + k * 60, b * (1 + k * 0.2)]
}

// For each band: a table from any colour (5 bits per channel) to its shaded palette colour.
// Made the first time a band is needed (a few ms), then shared by every shot.
const SIZE = 32768
const tables = LEVELS.map(() => new Uint32Array(SIZE))
const built = LEVELS.map(() => 0) // how much of each table is filled in
function fill(level: number, upto: number) {
  const t = tables[level]
  for (let key = built[level]; key < Math.min(SIZE, upto); key++) {
    const r = ((key >> 10) << 3) | 4
    const g = (((key >> 5) & 31) << 3) | 4
    const b = ((key & 31) << 3) | 4
    const [sr, sg, sb] = shade(r, g, b, LEVELS[level])
    t[key] = nearest(sr, sg, sb)
  }
  built[level] = Math.max(built[level], Math.min(SIZE, upto))
}
function table(level: number) {
  if (built[level] < SIZE) fill(level, SIZE) // not ready yet: finish it now
  return tables[level]
}

// Fill the tables in small pieces while the browser has nothing else to do (Set 1 calls this
// as it opens, while its scoreboard is up), so the first lit shot doesn't stop to make them
let preparing = false
export function prepareLighting() {
  if (preparing || typeof window === 'undefined') return
  preparing = true
  const idle =
    window.requestIdleCallback ??
    ((run: IdleRequestCallback) =>
      window.setTimeout(() => run({ didTimeout: false, timeRemaining: () => 6 }), 30))
  const levels = LEVELS.map((_, i) => i).filter((i) => i !== AS_DRAWN)
  const step: IdleRequestCallback = (deadline) => {
    for (const level of levels) {
      while (built[level] < SIZE && deadline.timeRemaining() > 2) fill(level, built[level] + 1024)
    }
    if (levels.some((level) => built[level] < SIZE)) idle(step)
  }
  idle(step)
}

// ---------- where the light falls: one band per pixel, worked out once per lighting ----------

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const SEAM = 5 // how sharp a band edge is: 1 = dithered all the way across, higher = a thin rim
const fields = new WeakMap<Lighting, Uint8Array>()

function field(l: Lighting, w: number, h: number) {
  let f = fields.get(l)
  if (f) return f
  f = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = l.ambient
      for (const s of l.lights) {
        const d = Math.hypot(x - s.x, y - s.y) / s.r
        if (d < 1) {
          const k = 1 - d
          v += s.power * k * k * (3 - 2 * k) // smooth fall-off
        }
      }
      // between two bands: the Bayer pattern decides — but only in a narrow seam around the
      // band edge, so each band is a clean area of colour with a thin dithered rim (a wide
      // dithered zone reads as noise all over the floor)
      let band = 0
      while (band < LEVELS.length - 1 && v > LEVELS[band + 1]) band++
      if (band < LEVELS.length - 1) {
        const into = (v - LEVELS[band]) / (LEVELS[band + 1] - LEVELS[band])
        const seam = Math.min(1, Math.max(0, (into - 0.5) * SEAM + 0.5))
        if (seam * 16 > BAYER[(y & 3) * 4 + (x & 3)] + 0.5) band++
      }
      f[y * w + x] = band
    }
  }
  fields.set(l, f)
  return f
}

// ---------- the pass ----------

export function light(b: Buffer, l: Lighting, t: number) {
  const f = field(l, b.w, b.h)
  // a fluorescent tube dipping now and then: every band one step down for a frame
  const dip = l.flicker && hash(Math.floor(t * 12), 7) < l.flicker ? 1 : 0
  const data = b.data
  for (let i = 0; i < data.length; i++) {
    const band = Math.max(0, f[i] - dip)
    if (band === AS_DRAWN) continue
    const c = data[i]
    const key = ((c & 0xf8) << 7) | ((c >> 6) & 0x3e0) | ((c >> 19) & 0x1f)
    data[i] = table(band)[key]
  }
  // dust motes drifting in the light (only where it is bright)
  if (l.dust) {
    const { x, y, w, h, n } = l.dust
    for (let k = 0; k < n; k++) {
      const px = Math.round(x + ((hash(k, 1) * w + t * (2 + hash(k, 2) * 3)) % w))
      const py = Math.round(y + ((hash(k, 3) * h + Math.sin(t * 0.8 + k) * 3 + t * 1.2) % h))
      if (px < 0 || py < 0 || px >= b.w || py >= b.h) continue
      if (f[py * b.w + px] < AS_DRAWN) continue
      data[py * b.w + px] = hash(k, 4) < 0.5 ? C.glow : C.cream
    }
  }
}
