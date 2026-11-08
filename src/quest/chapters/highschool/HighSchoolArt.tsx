import { useEffect, useRef } from 'react'

import type { ArtProps } from '../../engine/types'

import { aydinShot } from './aydin'
import { firstMatchShot } from './firstmatch'
import { istanbulShot } from './istanbul'
import { blitFrame, C, createBuffer, dissolve, fromBytes, FULL, type Buffer } from './pixel'
import { schoolShot } from './school'
import type { Shot } from './shot'

// Set 1's art: full-screen pixel art, 320 × 180, one shot per line of the set, animated.
const SHOTS: Shot[] = [istanbulShot, schoolShot, firstMatchShot, aydinShot]

const FPS = 12 // pixel animation is drawn in steps, not smoothly — like old games
const DISSOLVE_MS = 420 // the retro dissolve from one shot to the next

// Phones: the picture is shown at 2× and cropped to its middle (x 70–249 stays visible)
const PHONE_SCALE = 2
const PHONE_BELOW = 640 // px: narrower boxes use the phone crop

// PNGs (backgrounds and sprite sheets) are decoded once into pixel buffers and kept
const loading = new Map<string, Promise<void>>()
const loaded = new Map<string, Buffer>()
function load(src: string) {
  if (loading.has(src)) return
  const img = new Image()
  // onload, not img.decode(): decode() can wait forever in a page that isn't being painted
  // (a background tab), while the picture is long there
  const ready = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(src))
  })
  img.src = src
  loading.set(
    src,
    ready.then(
      () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
        loaded.set(src, fromBytes(data, canvas.width, canvas.height))
      },
      () => {}, // a missing file just leaves that layer out
    ),
  )
}

// One frame of a shot at time t: background, then the layers on top
function compose(out: Buffer, shot: Shot, t: number) {
  const bg = loaded.get(shot.background)
  if (bg) out.data.set(bg.data)
  else out.data.fill(C.night)
  shot.under?.(out, t)
  for (const s of shot.sheets ?? []) {
    const sheet = loaded.get(s.src)
    if (!sheet) continue
    const n = Math.floor(t * s.fps)
    blitFrame(
      out,
      sheet,
      s.once ? Math.min(s.frames - 1, n) : n % s.frames,
      s.frameWidth,
      s.x,
      s.y,
      s.flip,
    )
  }
  shot.over?.(out, t)
}

export default function HighSchoolArt({ beat }: ArtProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const index = Math.min(beat, SHOTS.length - 1)
  const indexRef = useRef(index) // read by the drawing loop, which runs outside React
  useEffect(() => {
    indexRef.current = index
  }, [index])

  // The drawing loop: 12 times a second, paint the current shot at its time; when the shot
  // changes, dissolve from what was on screen into the new one.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    SHOTS.forEach((shot) => {
      load(shot.background)
      shot.sheets?.forEach((s) => load(s.src))
    })
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const frame = createBuffer(FULL.w, FULL.h) // the shot as it should look now
    const shown = createBuffer(FULL.w, FULL.h) // what is on screen (differs during a dissolve)
    const from = createBuffer(FULL.w, FULL.h) // the old shot, frozen, while dissolving
    const image = new ImageData(shown.bytes, FULL.w, FULL.h) // shares memory with `shown`
    let current = -1
    let shotStart = 0
    let fadeStart = -Infinity
    let lastTick = -1
    let raf = 0

    const render = (now: number) => {
      const i = indexRef.current
      if (i !== current) {
        if (current >= 0 && !calm) {
          from.data.set(shown.data)
          fadeStart = now
        }
        current = i
        shotStart = now
      }
      const shot = SHOTS[i]
      compose(frame, shot, calm ? shot.still : (now - shotStart) / 1000)
      const p = (now - fadeStart) / DISSOLVE_MS
      if (p < 1) dissolve(shown, from, frame, p)
      else shown.data.set(frame.data)
      ctx.putImageData(image, 0, 0)
    }
    // With reduced motion nothing moves, so a frame is painted only when something changed:
    // another shot, or one more picture finished loading
    let painted = ''
    const loop = (now: number) => {
      const tick = Math.floor(now / (1000 / FPS))
      const state = `${indexRef.current}:${loaded.size}`
      if (calm ? state !== painted : tick !== lastTick) {
        lastTick = tick
        painted = state
        render(now)
      }
      raf = requestAnimationFrame(loop)
    }
    render(performance.now()) // the first frame right away, not one frame later
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Pixel art only looks right at whole-number sizes: every pixel exactly 4 × 4, 5 × 5 …
  // screen pixels (counted in real device pixels, so it stays sharp on any screen).
  // - wide boxes (desktop, tablet): the biggest size where the whole picture fits
  // - narrow boxes (phones): 2× and cropped to the middle of the picture
  useEffect(() => {
    const box = boxRef.current
    const canvas = canvasRef.current
    if (!box || !canvas) return
    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      const scale =
        box.clientWidth < PHONE_BELOW
          ? Math.round(PHONE_SCALE * dpr)
          : Math.max(
              1,
              Math.floor(
                Math.min((box.clientWidth * dpr) / FULL.w, (box.clientHeight * dpr) / FULL.h),
              ),
            )
      canvas.style.width = `${(FULL.w * scale) / dpr}px`
      canvas.style.height = `${(FULL.h * scale) / dpr}px`
    }
    fit() // right away, so the very first frame already has its size
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={boxRef} className="flex size-full items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={FULL.w}
        height={FULL.h}
        role="img"
        aria-label={SHOTS[index].label}
        // no smoothing when the browser scales the canvas up: square, sharp pixels
        className="max-w-none shrink-0 [image-rendering:pixelated]"
      />
    </div>
  )
}
