import { useEffect, useRef, useState } from 'react'

import { useT } from '@/i18n'

import { useLocale, type Locale } from '../../../i18n/locale'
import { setArtWidth } from '../../engine/artWidth'
import type { ArtProps } from '../../engine/types'

import { arenaShot } from './arena'
import { busShot } from './bus'
import { classShot } from './class'
import { courtShot } from './court'
import { pendingShot } from './pending'
import { blitFrame, C, createBuffer, dissolve, fromBytes, FULL, type Buffer } from './pixel'
import { nightShot, wakeShot } from './room'
import { scoreboardShot } from './scoreboard'
import { yardShot } from './yard'
import type { Shot, ShotContext } from './shot'

// Set 1's art: full-screen pixel art, 320 × 180, animated. One shot per step of the set:
//   'arena'       the opening: the hall, the camera moving in on its scoreboard (first time)
//   'scoreboard'  the scoreboard close up (coming back to it later)
//   scene ids     the montage of a school day (src/data/en/quest.ts)
// Scenes that aren't drawn yet show an empty storyboard frame (pending.ts).
const SHOTS: Record<string, Shot> = {
  arena: arenaShot,
  scoreboard: scoreboardShot,
  wake: wakeShot,
  bus: busShot,
  class: classShot,
  lunch: yardShot,
  training: courtShot,
  night: nightShot,
}
const shotFor = (key: string) => SHOTS[key] ?? pendingShot

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
const image = (src: string) => loaded.get(src)

// One frame of a shot at time t: background, then the layers on top
function compose(out: Buffer, shot: Shot, t: number, ctx: ShotContext) {
  const bg = shot.background && loaded.get(shot.background)
  if (bg) out.data.set(bg.data)
  else out.data.fill(C.night)
  shot.under?.(out, t, ctx)
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
  shot.over?.(out, t, ctx)
}

export default function HighSchoolArt({ chapter, scene }: ArtProps) {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // The hall and the camera move only open the set. Once a scene has been seen, going back to
  // the scoreboard shows just the board.
  const [sawScene, setSawScene] = useState(false)
  if (scene >= 0 && !sawScene) setSawScene(true) // (React's way to remember "it happened")
  const key =
    scene >= 0 ? (chapter.scenes[scene]?.id ?? 'pending') : sawScene ? 'scoreboard' : 'arena'

  // What the drawing loop reads — it runs outside React, so it gets the latest values from here
  const live = useRef({ key, ctx: context(chapter, scene, locale) })
  useEffect(() => {
    live.current = { key, ctx: context(chapter, scene, locale) }
  }, [key, chapter, scene, locale])

  // The drawing loop: 12 times a second, paint the current shot at its time; when the shot
  // changes, dissolve from what was on screen into the new one.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx2d = canvas?.getContext('2d')
    if (!canvas || !ctx2d) return
    for (const shot of [...Object.values(SHOTS)]) {
      if (shot.background) load(shot.background)
      shot.images?.forEach(load)
      shot.sheets?.forEach((s) => load(s.src))
    }
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const frame = createBuffer(FULL.w, FULL.h) // the shot as it should look now
    const shown = createBuffer(FULL.w, FULL.h) // what is on screen (differs during a dissolve)
    const from = createBuffer(FULL.w, FULL.h) // the old shot, frozen, while dissolving
    const pixels = new ImageData(shown.bytes, FULL.w, FULL.h) // shares memory with `shown`
    let current = ''
    let shotStart = 0
    let fadeStart = -Infinity
    let lastTick = -1
    let raf = 0

    const render = (now: number) => {
      const { key, ctx } = live.current
      if (key !== current) {
        if (current && !calm) {
          from.data.set(shown.data)
          fadeStart = now
        }
        current = key
        shotStart = now
      }
      const shot = shotFor(key)
      compose(frame, shot, calm ? shot.still : (now - shotStart) / 1000, ctx)
      const p = (now - fadeStart) / DISSOLVE_MS
      if (p < 1) dissolve(shown, from, frame, p)
      else shown.data.set(frame.data)
      ctx2d.putImageData(pixels, 0, 0)
    }
    // With reduced motion nothing moves, so a frame is painted only when something changed:
    // another shot, other text (the language), or one more picture finished loading
    let painted = ''
    const loop = (now: number) => {
      const tick = Math.floor(now / (1000 / FPS))
      const { key, ctx } = live.current
      const state = `${key}:${ctx.board.title}:${loaded.size}`
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
      const width = (FULL.w * scale) / dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${(FULL.h * scale) / dpr}px`
      setArtWidth(box, width) // so the caption lines up with the picture's edges
    }
    fit() // right away, so the very first frame already has its size
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  // What a screen reader hears for the picture
  const label =
    scene < 0
      ? t.quest.scoreboardArt(chapter.set, chapter.title, chapter.period)
      : (shotFor(key).label?.[locale] ??
        `${t.quest.art.label} · ${t.quest.art.shot(scene + 1, chapter.scenes.length)}`)

  return (
    <div ref={boxRef} className="flex size-full items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={FULL.w}
        height={FULL.h}
        role="img"
        aria-label={label}
        // no smoothing when the browser scales the canvas up: square, sharp pixels
        className="max-w-none shrink-0 [image-rendering:pixelated]"
      />
    </div>
  )
}

// What the shots' code layers get to know about the set
function context(chapter: ArtProps['chapter'], scene: number, locale: Locale): ShotContext {
  // the board shows capitals, with each language's own rules (Turkish: Lise → LİSE)
  const title = chapter.title.toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US')
  return {
    image,
    board: { set: chapter.set, title, period: chapter.period },
    scene: { index: scene, count: chapter.scenes.length },
  }
}
