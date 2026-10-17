import type { CSSProperties } from 'react'

import type { BurstData } from '@/hooks/useBurst'

// Draws the click bursts from useBurst, clipped to the card's rounded shape.
// Pure CSS animations: see burst-glow / spark in index.css.
export function BurstLayer({ bursts }: { bursts: BurstData[] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 translate-z-2 overflow-hidden rounded-2xl"
    >
      {bursts.map((burst) => (
        <div key={burst.id} className="absolute" style={{ left: burst.x, top: burst.y }}>
          {/* the glow */}
          <span
            className="absolute size-80 -translate-x-1/2 -translate-y-1/2 animate-burst-glow rounded-full mix-blend-screen"
            style={{
              background:
                'radial-gradient(circle, rgb(255 210 63 / 0.55), rgb(201 139 82 / 0.22) 40%, transparent 70%)',
            }}
          />
          {/* the sparks */}
          {burst.sparks.map((spark, i) => (
            <span
              key={i}
              className="absolute animate-spark rounded-full"
              style={
                {
                  width: spark.size,
                  height: spark.size,
                  marginLeft: -spark.size / 2,
                  marginTop: -spark.size / 2,
                  backgroundColor: spark.color,
                  boxShadow: `0 0 10px ${spark.color}`,
                  animationDelay: `${spark.delay}ms`,
                  '--dx': `${spark.dx}px`,
                  '--dy': `${spark.dy}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  )
}
