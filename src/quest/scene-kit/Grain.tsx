import { useEffect, useRef } from 'react'

// One small square of random gray noise, made once on a canvas and shared by every Grain
let tile: string | null = null
function noiseTile() {
  if (tile) return tile
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const image = ctx.createImageData(size, size)
  for (let i = 0; i < image.data.length; i += 4) {
    const v = Math.random() * 255
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  tile = canvas.toDataURL()
  return tile
}

type Props = {
  opacity?: number
  animated?: boolean
  className?: string
}

// Film grain over a scene. The noise square is tiled over a layer twice the size of the scene;
// when animated, that layer jumps to a new offset about ten times a second (steps, no
// smooth movement) — the restless grain of real film, for the cost of moving one layer.
export function Grain({ opacity = 0.25, animated = true, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // made after mount: the canvas needs the browser, and random noise must not run during render
  useEffect(() => {
    if (ref.current) ref.current.style.backgroundImage = `url(${noiseTile()})`
  }, [])

  return (
    <div
      aria-hidden="true"
      // overlay blend: the grain shows in the lit areas and leaves the blacks black
      className={`pointer-events-none absolute inset-0 overflow-hidden mix-blend-overlay ${className}`}
      style={{ opacity }}
    >
      <div ref={ref} className={`absolute -inset-1/2 ${animated ? 'animate-grain' : ''}`} />
    </div>
  )
}
