import { QUEST } from '../../engine/palette'

// The pencil-sketch helpers of Set 2: its colours, hand-drawn wobbly lines, and the scene clock.
// (The drawing components are in sketch.tsx.)

export const INK = {
  graphite: '#2d2a26',
  soft: '#77706a', // light pencil, for hatching
  paper: '#f1ebdf',
  shade: '#e2dacb',
  pink: '#d77a8a', // the printed ink of an optical form
  marker: QUEST.accent, // a yellow highlighter — the quest's accent
}
export const HAND = "'Caveat Variable', cursive"

// A repeatable "random" number from 0 to 1 (the same wobble for every visitor and frame)
export function rand(seed: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

// A hand-drawn straight line: its ends slightly off and a slight bow in the middle
export function wobbly(x1: number, y1: number, x2: number, y2: number, seed: number, amp = 0.7) {
  const j = (k: number) => (rand(seed + k) - 0.5) * amp
  const mx = (x1 + x2) / 2 + j(1) * 2
  const my = (y1 + y2) / 2 + j(2) * 2
  return `M${x1 + j(3)} ${y1 + j(4)} Q${mx} ${my} ${x2 + j(5)} ${y2 + j(6)}`
}

// A hand-drawn box: four wobbly sides, each drawn twice (pencil lines are never just once)
export function sketchBox(x: number, y: number, w: number, h: number, seed: number) {
  const sides: [number, number, number, number][] = [
    [x, y, x + w, y],
    [x + w, y, x + w, y + h],
    [x + w, y + h, x, y + h],
    [x, y + h, x, y],
  ]
  return sides.flatMap(([a, b, c, d], i) => [
    wobbly(a, b, c, d, seed + i * 10),
    wobbly(a, b, c, d, seed + i * 10 + 5, 1.2),
  ])
}

// A hand-drawn circle (a little open, like a quick pencil loop)
export function loop(cx: number, cy: number, r: number, seed: number) {
  const start = rand(seed) * Math.PI * 2
  const pts: string[] = []
  for (let i = 0; i <= 26; i++) {
    const a = start + (i / 24) * Math.PI * 2
    const rr = r * (1 + (rand(seed + i) - 0.5) * 0.12)
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`)
  }
  return `M${pts.join(' L')}`
}

// ---------- A pencil line ----------
// From any SVG path: its outline as a filled shape whose width follows a hand's pressure —
// thin where the pencil lands, fuller in the middle, a long taper where it lifts off — plus a
// guide stroke: the same line, a little off to one side, overshooting both ends. The path is
// measured by the browser itself (getPointAtLength), so any path works.
let probe: SVGPathElement | null = null
function measure() {
  if (probe) return probe
  if (typeof document === 'undefined') return null
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
  probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  svg.appendChild(probe)
  document.body.appendChild(svg)
  return probe
}

const smooth = (a: number, b: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return k * k * (3 - 2 * k)
}
const f2 = (v: number) => v.toFixed(2)

export function pencilLine(d: string, size: number, seed: number) {
  const path = measure()
  if (!path) return null
  path.setAttribute('d', d)
  const length = path.getTotalLength()
  if (!(length > 0.5)) return null
  const n = Math.max(3, Math.ceil(length / 0.9))
  const pts = Array.from({ length: n + 1 }, (_, i) => path.getPointAtLength((length * i) / n))
  const normals = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(n, i + 1)]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const l = Math.hypot(dx, dy) || 1
    return { x: -dy / l, y: dx / l, tx: dx / l, ty: dy / l }
  })
  const phase = rand(seed) * 6.28
  const waves = 2 + rand(seed + 1) * 3
  const left: string[] = []
  const right: string[] = []
  pts.forEach((p, i) => {
    const t = i / n
    const press =
      (0.2 + 0.8 * smooth(0, 0.14, t) * (1 - smooth(0.62, 1, t))) *
      (0.85 + 0.15 * Math.sin(t * waves * 6.28 + phase))
    const w = (size * press) / 2
    const { x: nx, y: ny } = normals[i]
    left.push(`${f2(p.x + nx * w)} ${f2(p.y + ny * w)}`)
    right.push(`${f2(p.x - nx * w)} ${f2(p.y - ny * w)}`)
  })
  const outline = `M${left.join(' L')} L${right.reverse().join(' L')} Z`
  // the guide: a little to one side, overshooting both ends by a few units
  const off = (rand(seed + 2) - 0.5) * 1.2
  const over = 1.5 + rand(seed + 3) * 2.5
  const g = (i: number, extra = 0) => {
    const p = pts[i]
    const { x: nx, y: ny, tx, ty } = normals[i]
    return `${f2(p.x + nx * off + tx * extra)} ${f2(p.y + ny * off + ty * extra)}`
  }
  const guide = [g(0, -over)]
  for (let i = 3; i < n; i += 3) guide.push(g(i))
  guide.push(g(n, over))
  return { outline, guide: `M${guide.join(' L')}` }
}

// the scene clock is shared by every set's drawings
export { useSceneTime } from '../../engine/useSceneTime'
