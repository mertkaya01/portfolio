import type { ReactNode } from 'react'

import { useBurst } from '@/hooks/useBurst'
import { TILT_STYLE, useTilt } from '@/hooks/useTilt'

import { BurstLayer } from './Burst'
import { Sheen } from './Sheen'

type Props = { children: ReactNode; maxTilt?: number }

// A card that leans toward the mouse in 3D and bursts with color when clicked.
// Children can float above the card's surface with translate-z-* classes
// (each parent in between needs `transform-3d`) → depth.
export function TiltCard({ children, maxTilt = 8 }: Props) {
  const { ref: tiltRef, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(maxTilt)
  const { bursts, onPointerDown } = useBurst()

  return (
    <div className="h-full perspective-[1100px]">
      <div
        ref={tiltRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        style={TILT_STYLE}
        className="group relative h-full transition-transform duration-300 ease-out transform-3d"
      >
        {children}
        <BurstLayer bursts={bursts} />
        <Sheen className="rounded-2xl" />
      </div>
    </div>
  )
}
