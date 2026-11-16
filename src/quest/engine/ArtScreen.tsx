import { useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

import { Grain } from '../scene-kit/Grain'

import type { Arrival } from './transitions'
import { PixelResolve, PowerDot, ScanBeam } from './TransitionFx'

// The one screen every set is shown on. Five art styles, one frame: the same 16:9 picture, the
// same size, in the same place, with the same grain and the same darkened edges over it — so
// the styles change but the story stays one film. (Only the match point breaks out of it, on
// purpose: the finale fills the whole stage.)
//
// Its size comes from useScreenSize (artWidth.ts): a whole number of the pixel art's 320 × 180
// in device pixels, so Set 1's pixels stay square and sharp; the other sets fill the same box.

export function ArtScreen({
  size,
  arrival = 'fade',
  children,
}: {
  size: { w: number; h: number } | null
  arrival?: Arrival // how this set came on (transitions.ts): some arrivals the screen plays
  children: ReactNode
}) {
  return (
    <div
      data-screen
      className="relative overflow-hidden sm:rounded-xl sm:shadow-[0_24px_70px_rgb(0_0_0/0.55)]"
      // until the frame is measured, nothing (the first frame comes a moment later)
      style={size ? { width: size.w, height: size.h } : { visibility: 'hidden' }}
    >
      {/* the picture, on its own dark ground — clipped or held back while it arrives, so the
          set going out shows through where the new one isn't yet */}
      <div className={`absolute inset-0 bg-night ${ARRIVE[arrival]}`}>{children}</div>
      <ScreenOverlay />
      {arrival === 'pixels' && size && <PixelResolve w={size.w} h={size.h} />}
      {arrival === 'scan' && <ScanBeam />}
      {arrival === 'poweroff' && <PowerDot />}
    </div>
  )
}

const ARRIVE: Record<Arrival, string> = {
  fade: '',
  pixels: 'animate-arrive-late',
  scan: 'animate-arrive-scan',
  poweroff: 'animate-arrive-dot',
  unfold: '',
  breakout: '',
}

// Over every set's picture: a little film grain, the edges darkened, a hairline inside the frame
export function ScreenOverlay() {
  const calm = useReducedMotion() ?? false
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]">
      <Grain opacity={0.12} animated={!calm} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgb(5_6_12/0.34)_100%)]" />
      <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(230_237_245/0.09)]" />
    </div>
  )
}
