// The pencil-sketch helpers of Set 2: its colours, hand-drawn wobbly lines, and the scene clock.
// (The drawing components are in sketch.tsx.)

export const INK = {
  graphite: '#2d2a26',
  soft: '#77706a', // light pencil, for hatching
  paper: '#f1ebdf',
  shade: '#e2dacb',
  pink: '#d77a8a', // the printed ink of an optical form
  marker: '#ffd23f', // a yellow highlighter — the site's accent
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

// the scene clock is shared by every set's drawings
export { useSceneTime } from '../../engine/useSceneTime'
