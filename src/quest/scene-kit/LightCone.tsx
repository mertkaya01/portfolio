import type { CSSProperties } from 'react'

import { Dust } from './Dust'

type Props = {
  spread?: number // half the opening angle of the beam, degrees
  intensity?: number // 0 … 1: how bright the beam is near the lamp
  flicker?: boolean // warm up with a few flickers, like arena lights
  sway?: boolean // swing very slowly, as if the lamp hung from a cable
  dust?: boolean // specks of dust floating in the light
  delay?: number // ms before the light comes on
  className?: string // where the beam is: the lamp hangs above the top center of this box
}

// The lamp sits this far above the box (in % of its height), so the beam is already a little
// wide where it enters the screen — a real spotlight, not a pointed triangle
const LAMP_ABOVE = 30

// One overhead light: the single light source of every "Silhouette & Light" scene.
// The beam is a soft vertical fade, cut into a cone by a mask: a conic-gradient centered on
// the lamp that is opaque only inside the cone's angle (with a few soft degrees at each edge).
export function LightCone({
  spread = 22,
  intensity = 0.16,
  flicker = true,
  sway = true,
  dust = false,
  delay = 0,
  className = 'absolute inset-0',
}: Props) {
  const soft = Math.min(7, spread / 2)
  const cone = `conic-gradient(from ${180 - spread}deg at 50% -${LAMP_ABOVE}%, transparent, #000 ${soft}deg, #000 ${2 * spread - soft}deg, transparent ${2 * spread}deg)`
  const light = (alpha: number) => `rgb(230 237 245 / ${alpha.toFixed(3)})` // --color-light

  const beam: CSSProperties = {
    maskImage: cone,
    background: `linear-gradient(to bottom, ${light(intensity)}, ${light(intensity * 0.4)} 55%, transparent 98%)`,
    transformOrigin: `50% -${LAMP_ABOVE}%`, // sway around the lamp
  }

  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div
        className={`absolute inset-0 ${flicker ? 'animate-light-on' : ''}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* glow where the beam enters the screen */}
        <div className="absolute -top-24 left-1/2 h-48 w-[36rem] max-w-[120vw] -translate-x-1/2 rounded-full bg-light/10 blur-3xl" />
        {/* the beam: much wider than the box, so the mask — not the box — decides its shape */}
        <div
          style={beam}
          className={`absolute inset-y-0 left-1/2 w-[300%] -translate-x-1/2 ${sway ? 'animate-sway' : ''}`}
        >
          {dust && <Dust className="absolute inset-y-0 left-[37%] h-full w-[26%]" />}
        </div>
      </div>
    </div>
  )
}
