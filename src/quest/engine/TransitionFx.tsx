import { useEffect, useRef } from 'react'

import { QUEST } from './palette'

// The effects a new set's screen plays as it arrives (transitions.ts says which, ArtScreen
// shows them over the picture). Each runs once, on its own, and then is gone.

// ---------- Set 1 → 2: the pixels resolve into paper ----------
// Paper-coloured blocks fill the screen over the pixel art in a dithered order (the same Bayer
// pattern as Set 1's own dissolves). Then they clear — in blocks of 10 art pixels, then 5,
// then 2.5: the resolution goes up while the pencil drawing appears underneath.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const GRIDS = [
  { cols: 32, rows: 18 },
  { cols: 64, rows: 36 },
  { cols: 128, rows: 72 },
]
const PAPER = [QUEST.paper, '#ece4d3', '#e3dac8', '#f5efe2']
const FILL = 0.42 // s: the blocks cover the screen
const CLEAR = 0.7 // s: then clear in three ever finer steps

export function PixelResolve({ w, h }: { w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    // the order each cell fills and clears in: the Bayer pattern, a little shuffled
    const ranks = GRIDS.map(({ cols, rows }) =>
      Float32Array.from(
        { length: cols * rows },
        (_, i) =>
          (BAYER[(((i / cols) | 0) % 4) * 4 + ((i % cols) % 4)] + Math.random() * 0.95) / 16,
      ),
    )
    const shade = GRIDS.map(({ cols, rows }) =>
      Uint8Array.from({ length: cols * rows }, () => (Math.random() * PAPER.length) | 0),
    )
    const draw = (grid: number, covered: (rank: number) => boolean) => {
      const { cols, rows } = GRIDS[grid]
      const cw = canvas.width / cols
      const ch = canvas.height / rows
      for (let i = 0; i < cols * rows; i++) {
        if (!covered(ranks[grid][i])) continue
        ctx.fillStyle = PAPER[shade[grid][i]]
        // whole device pixels, a hair overlapping, so no seams show between the blocks
        ctx.fillRect(
          Math.floor((i % cols) * cw),
          Math.floor(((i / cols) | 0) * ch),
          Math.ceil(cw) + 1,
          Math.ceil(ch) + 1,
        )
      }
    }
    const start = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const t = (now - start) / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (t < FILL) {
        const p = t / FILL
        draw(0, (r) => r < p)
      } else if (t < FILL + CLEAR) {
        const u = (t - FILL) / CLEAR // how much has cleared
        draw(u < 1 / 3 ? 0 : u < 2 / 3 ? 1 : 2, (r) => r >= u)
      } else return // done: the canvas is clear
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [w, h])
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 size-full [image-rendering:pixelated]"
    />
  )
}

// ---------- Set 2 → 3: the scan line ----------
// A bright amber line with a soft glow trailing above it runs from the top of the screen to the
// bottom; the terminal appears where it has passed (ArtScreen wipes the picture in with it).
export function ScanBeam() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-full animate-scan-beam"
    >
      <div className="absolute inset-x-0 bottom-full h-16 bg-linear-to-b from-transparent to-[rgb(255_176_0/0.22)]" />
      <div className="absolute inset-x-0 top-0 h-[3px] -translate-y-1/2 bg-[#ffd27a] shadow-[0_0_14px_4px_rgb(255_176_0/0.75)]" />
    </div>
  )
}

// ---------- Set 3 → 4: the CRT switches off, the flat world opens from its last dot ----------
// The old screen squeezes itself into a line and a dot (transitions.ts); this is the dot's
// flash in the middle, just before the new picture opens out of it.
export function PowerDot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
    >
      <div className="size-3 animate-power-dot rounded-full bg-white shadow-[0_0_24px_10px_rgb(255_210_63/0.8)]" />
    </div>
  )
}
