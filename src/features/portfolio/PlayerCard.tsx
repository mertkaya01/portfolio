import { useState, type ReactNode } from 'react'

import { Sheen } from '@/components/ui/Sheen'
import { profile } from '@/data/profile'
import { TILT_STYLE, useTilt } from '@/hooks/useTilt'

const { volleyball } = profile
const role = profile.headline.split(' · ')[0] // "Computer Engineer"

// A volleyball trading card. Front: photo, number, name, availability. Back: a "scouting report".
// Click the button (or press Enter on it) to flip; the mouse tilts it and moves a light sheen.
export function PlayerCard() {
  const [flipped, setFlipped] = useState(false)
  const { ref: tiltRef, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(12)

  return (
    <div className="w-full max-w-[22rem]">
      <div className="perspective-[1200px]">
        {/* Outer layer: tilt toward the mouse */}
        <div
          ref={tiltRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          style={TILT_STYLE}
          className="group transition-transform duration-300 ease-out transform-3d"
        >
          {/* Inner layer: the flip. Both faces sit on top of each other; the back starts turned away */}
          <div
            // data-transition-target: the skip transition lands its court frame exactly here
            data-transition-target
            className={`relative aspect-[5/7] transition-transform duration-700 ease-out-expo transform-3d ${flipped ? 'rotate-y-180' : ''}`}
          >
            <CardFront hidden={flipped} />
            <CardBack hidden={!flipped} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        className="mx-auto mt-5 flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors hover:text-accent"
      >
        <span aria-hidden="true">↻</span>
        {flipped ? 'Show front' : 'Flip · scouting report'}
      </button>
    </div>
  )
}

// Two streaks of light chasing each other around the photo frame. --frame-angle is animated
// (see frame-spin in index.css), which turns the gradient — and so moves the light.
const FRAME_LIGHT =
  'conic-gradient(from var(--frame-angle), transparent 0%, var(--color-accent) 9%, transparent 20%, transparent 50%, var(--color-sky) 59%, transparent 70%)'

// Shared look of both faces
const FACE =
  'absolute inset-0 flex flex-col overflow-hidden rounded-2xl border shadow-2xl shadow-black/60 backface-hidden'

function CardFront({ hidden }: { hidden: boolean }) {
  return (
    <div aria-hidden={hidden} className={`${FACE} border-light/15 bg-night`}>
      <CourtLines />

      {/* Photo in a lit frame: two light streaks (yellow and blue) circle the frame, like the
          foil edge of a trading card. The frame is a 1px gap showing a rotating conic gradient. */}
      <div className="relative mx-3 mt-3 h-[57%]">
        {/* soft glow behind the frame, the same light blurred */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 animate-frame-spin rounded-2xl opacity-40 blur-md transition-opacity duration-500 group-hover:opacity-70"
          style={{ background: FRAME_LIGHT }}
        />
        <div
          className="relative h-full animate-frame-spin rounded-xl p-px"
          style={{ background: `${FRAME_LIGHT}, rgb(230 237 245 / 0.14)` }}
        >
          <div className="relative h-full overflow-hidden rounded-[11px] bg-night">
            <img
              src={profile.photo.src}
              alt={profile.photo.alt}
              draggable={false}
              className="h-full w-full object-cover object-[50%_18%] contrast-[1.05] grayscale-[35%] transition duration-700 group-hover:grayscale-0"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-night via-night/20 to-night/5"
            />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-light/75 uppercase">
                Beyond the Court
              </span>
              <span className="rounded bg-accent px-2 py-1 font-mono text-[0.6rem] font-bold tracking-[0.15em] text-night uppercase">
                {volleyball.position}
              </span>
            </div>

            <p className="absolute right-4 -bottom-2 font-display text-8xl leading-none font-black text-light/90 [text-shadow:0_6px_24px_rgb(0_0_0/0.6)]">
              <span className="sr-only">Jersey number </span>
              {volleyball.jerseyNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-6 pt-4 pb-6">
        <p className="font-display text-4xl font-extrabold tracking-tight uppercase">
          {profile.name}
        </p>
        <p className="mt-1 text-sm text-wood">{role}</p>

        {/* Availability: a green "live" light, like a status LED */}
        <p className="mt-auto flex items-center gap-2.5 border-t border-light/10 pt-4 font-mono text-[0.65rem] tracking-[0.2em] text-light uppercase">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-go" />
          </span>
          {profile.availability}
        </p>
      </div>

      <Sheen />
    </div>
  )
}

function CardBack({ hidden }: { hidden: boolean }) {
  const offCourt = profile.headline.split(' · ').slice(1).join(' · ')
  const languages = profile.spokenLanguages.map((l) => `${l.name} (${l.level})`).join(' · ')
  const { gaming } = profile

  return (
    <div aria-hidden={hidden} className={`${FACE} rotate-y-180 border-accent/30 bg-shadow p-6`}>
      <Sheen />
      <p className="relative font-mono text-xs tracking-[0.3em] text-accent uppercase">
        Scouting report
      </p>
      <dl className="relative mt-5 space-y-3.5 text-sm">
        <Row term="Position">{volleyball.positionNote}</Row>
        <Row term="Off court">{offCourt}</Row>
        <Row term="Languages">{languages}</Row>
        <Row term="Looking for">{profile.lookingFor.join(' · ')}</Row>
        <Row term="Also plays">
          {gaming.shortName} · {gaming.platform} Level {gaming.level}
        </Row>
        <Row term="Based in">{profile.location}</Row>
      </dl>
      <p className="relative mt-auto font-display text-2xl font-extrabold uppercase">
        #{volleyball.jerseyNumber} · {profile.name}
      </p>
    </div>
  )
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[0.6rem] tracking-[0.2em] text-muted uppercase">{term}</dt>
      <dd className="mt-1 leading-snug text-light/90">{children}</dd>
    </div>
  )
}

// A volleyball court seen from above, drawn to scale (9 m × 18 m), as the card's background
function CourtLines() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full text-light/[0.07]"
      fill="none"
      stroke="currentColor"
    >
      <rect x="20" y="10" width="60" height="120" strokeWidth="0.8" />
      <line x1="14" y1="70" x2="86" y2="70" strokeWidth="1.6" /> {/* the net */}
      <line x1="20" y1="50" x2="80" y2="50" strokeWidth="0.6" /> {/* 3 m attack lines */}
      <line x1="20" y1="90" x2="80" y2="90" strokeWidth="0.6" />
    </svg>
  )
}
