import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'

import { useT } from '@/i18n'

import { Arena } from './Arena'
import { COLORS } from './colors'
import { Mert3D } from './Mert3D'
import { Ball, Player } from './props3d'
import { CameraRig } from './scenes'

// The finale: match point of the tie-break, in 3D. Mert in his jersey (the 9 on his back) gets
// ready, the setter puts the ball up high by the net, it hangs there — and the visitor takes the
// swing: Space, a click, or the button. The spike opens the portfolio (the stage's transition).
// Loaded with three.js, only at the end of the quest.
function prefersCalm() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export default function Finale3D({ onSpike }: { onSpike: () => void }) {
  const t = useT()
  const [calm] = useState(prefersCalm)
  return (
    <div className="relative size-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [-12, 5, 10], fov: 45, near: 0.1, far: 100 }}
        frameloop={calm ? 'demand' : 'always'}
        className="absolute! inset-0"
        aria-hidden="true"
      >
        <color attach="background" args={[COLORS.night]} />
        <fog attach="fog" args={[COLORS.night, 18, 42]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[-6, 12, 8]} intensity={1.1} />
        <spotLight
          position={[-2, 10, 2]}
          angle={0.4}
          penumbra={0.5}
          intensity={140}
          distance={22}
        />
        <Arena />
        <MatchPoint calm={calm} />
        <CameraRig to={[-8.5, 3, 6.5]} look={[-0.8, 2.3, 0]} calm={calm} />
      </Canvas>

      {/* the words over it: what this moment is, and the swing */}
      <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-6 text-center sm:pt-10">
        <p className="font-mono text-xs tracking-[0.3em] text-wood uppercase">
          {t.quest.finale.kicker}
        </p>
        <h2 className="mt-2 animate-rise font-display text-6xl font-black tracking-tight text-accent uppercase [text-shadow:0_0_30px_rgb(255_210_63/0.45)] sm:text-8xl">
          {t.quest.finale.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-light/80">{t.quest.finale.text}</p>
      </div>
      <div className="absolute inset-x-0 bottom-6 flex justify-center sm:bottom-10">
        <button
          type="button"
          onClick={onSpike}
          className="inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-mono text-xs font-semibold tracking-[0.15em] text-night uppercase shadow-[0_0_30px_rgb(255_210_63/0.5)] transition-colors hover:bg-light"
        >
          {t.quest.finale.spike}
          <kbd className="rounded border border-night/30 px-1.5 text-[0.65rem]">Space</kbd>
        </button>
      </div>
    </div>
  )
}

// Mert crouches, jumps with his arms up, lands, again — the ball hanging high by the net,
// waiting for the swing. The other team's blockers wait on their side.
function MatchPoint({ calm }: { calm: boolean }) {
  const mert = useRef<Group>(null)
  const ball = useRef<Group>(null)
  const [up, setUp] = useState(true)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const cycle = calm ? 0.5 : (t % 2.4) / 2.4
    const jump = cycle > 0.3 && cycle < 0.8 ? Math.sin(((cycle - 0.3) / 0.5) * Math.PI) : 0
    if (mert.current) mert.current.position.y = jump * 0.9
    if (ball.current) ball.current.position.y = 3.5 + (calm ? 0 : Math.sin(t * 2) * 0.06)
    const armsUp = jump > 0.1
    if (armsUp !== up) setUp(armsUp)
  })
  return (
    <>
      <group ref={mert} position={[-2.2, 0, 0.6]} rotation-y={Math.PI / 2}>
        <Mert3D kit arms={up ? 'up' : 'down'} />
      </group>
      <Player color="#2f5aa8" position={[-1.1, 0, 2]} rotation-y={Math.PI / 2} />
      <Player color="#2f5aa8" position={[-5, 0, -2.2]} rotation-y={Math.PI / 2} />
      <group ref={ball} position={[-0.7, 3.5, 0.4]}>
        <Ball />
      </group>
      {/* the other team: two blockers at the net, two behind */}
      <Player color="#e6edf5" position={[0.8, 0, 0.9]} rotation-y={-Math.PI / 2} />
      <Player color="#e6edf5" position={[0.8, 0, -0.9]} rotation-y={-Math.PI / 2} />
      <Player color="#e6edf5" position={[5, 0, 2.5]} rotation-y={-Math.PI / 2} />
      <Player color="#e6edf5" position={[5.5, 0, -2]} rotation-y={-Math.PI / 2} />
    </>
  )
}
