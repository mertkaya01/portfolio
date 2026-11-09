import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Group } from 'three'

import { Arena, Jumbotron } from './Arena'
import { COLORS } from './colors'
import { Mert3D } from './Mert3D'
import { Bag, Bubble, Hotel, Player } from './props3d'

// The 3D scenes of Set 5. Each one sets where the camera goes and what moves.
// calm: the visitor prefers less motion — everything stands still at a good moment.

// The camera glides to a position, looking at a point
export function CameraRig({
  to,
  look,
  calm,
}: {
  to: [number, number, number]
  look: [number, number, number]
  calm: boolean
}) {
  const { camera } = useThree()
  const target = useMemo(() => new Vector3(...to), [to])
  const focus = useMemo(() => new Vector3(...look), [look])
  const current = useRef(new Vector3(...look))
  useFrame((_, delta) => {
    const k = calm ? 1 : 1 - Math.exp(-delta * 1.6)
    camera.position.lerp(target, k)
    current.current.lerp(focus, k)
    camera.lookAt(current.current)
  })
  return null
}

// ---------- The scoreboard: the camera rises to the big screen ----------

export function ScoreboardScene({
  board,
  calm,
}: {
  board: { set: string; title: string; period: string }
  calm: boolean
}) {
  return (
    <>
      <Arena />
      <Jumbotron lines={board} start={calm ? 0 : 0.8} />
      <CameraRig to={[0, 6.4, 8.2]} look={[0, 6.6, 0]} calm={calm} />
    </>
  )
}

// ---------- Graduated: caps thrown in the air over the court ----------

const CAPS = 14
type Cap = { x: number; z: number; vx: number; vy: number; vz: number; spin: number; delay: number }

export function GraduationScene({ calm }: { calm: boolean }) {
  const caps = useMemo<Cap[]>(
    () =>
      Array.from({ length: CAPS }, (_, i) => {
        const r = (k: number) => {
          const s = Math.sin(i * 91.7 + k * 13.3) * 43758.5
          return s - Math.floor(s)
        }
        return {
          x: -3.5 + (r(1) - 0.5) * 3,
          z: (r(2) - 0.5) * 2,
          vx: (r(3) - 0.5) * 2.4,
          vy: 6.5 + r(4) * 2.5,
          vz: (r(5) - 0.5) * 2.4,
          spin: (r(6) - 0.5) * 10,
          delay: r(7) * 0.5,
        }
      }),
    [],
  )
  const refs = useRef<(Group | null)[]>([])
  const born = useRef<number | null>(null)
  useFrame(({ clock }) => {
    born.current ??= clock.elapsedTime
    const t = calm ? 0.9 : clock.elapsedTime - born.current - 0.4
    caps.forEach((c, i) => {
      const g = refs.current[i]
      if (!g) return
      const s = Math.max(0, t - c.delay)
      // thrown from the hands (y 2.1), up, and down again onto the floor
      const y = Math.max(0.03, 2.1 + c.vy * s - 4.9 * s * s)
      const landed = y <= 0.03 && s > 0.5
      g.position.set(c.x + c.vx * Math.min(s, 2.4), y, c.z + c.vz * Math.min(s, 2.4))
      if (!landed) g.rotation.set(s * c.spin * 0.4, s * c.spin, s * c.spin * 0.3)
    })
  })
  return (
    <>
      <Arena />
      <Mert3D arms="up" position={[-3.5, 0, 0.8]} rotation-y={0.5} />
      {caps.map((c, i) => (
        <group key={i} ref={(g) => void (refs.current[i] = g)} position={[c.x, 2.1, c.z]}>
          {/* a mortarboard: the flat square, the cap under it, a yellow tassel */}
          <mesh>
            <boxGeometry args={[0.5, 0.03, 0.5]} />
            <meshStandardMaterial color="#121318" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.14, 8]} />
            <meshStandardMaterial color="#121318" roughness={0.6} />
          </mesh>
          <mesh position={[0.2, -0.08, 0.2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.18, 4]} />
            <meshBasicMaterial color={COLORS.accent} />
          </mesh>
        </group>
      ))}
      <CameraRig to={[1.5, 3.4, 8.8]} look={[-3, 2, 0]} calm={calm} />
    </>
  )
}

// ---------- The internship: a hotel platform, a marketplace, WhatsApp bots ----------
// At a desk by the court, a laptop; over it, the three things he built turn slowly: a hotel,
// a shopping bag, a chat bubble.

export function InternshipScene({ calm }: { calm: boolean }) {
  const ring = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!ring.current || calm) return
    ring.current.rotation.y = clock.elapsedTime * 0.6
    ring.current.position.y = 2.6 + Math.sin(clock.elapsedTime * 1.4) * 0.08
  })
  return (
    <>
      <Arena />
      {/* the desk and the laptop */}
      <group position={[-4.5, 0, 1]}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[1.8, 0.06, 0.8]} />
          <meshStandardMaterial color="#8a5a36" />
        </mesh>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.37, 0]}>
            <boxGeometry args={[0.05, 0.74, 0.7]} />
            <meshStandardMaterial color="#5a3a2a" />
          </mesh>
        ))}
        <mesh position={[0, 0.79, 0.05]}>
          <boxGeometry args={[0.6, 0.02, 0.4]} />
          <meshStandardMaterial color="#9aa5b1" metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.98, -0.15]} rotation-x={-0.25}>
          <boxGeometry args={[0.6, 0.38, 0.02]} />
          <meshStandardMaterial color="#20242e" emissive="#2f5aa8" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <Mert3D position={[-4.5, 0, 1.9]} rotation-y={Math.PI} />
      {/* what he built, turning over the desk */}
      <group ref={ring} position={[-4.5, 2.6, 1]}>
        <Hotel position={[0.9, 0, 0]} />
        <Bag position={[-0.45, 0, 0.78]} />
        <Bubble position={[-0.45, 0, -0.78]} />
      </group>
      <CameraRig to={[0, 3.4, 8.5]} look={[-4.2, 1.9, 0.5]} calm={calm} />
    </>
  )
}

// ---------- Now: looking for my next team ----------
// Mert on his half of the court under a spotlight; across the net a team waits — five players
// and one empty place, glowing.

const TEAM_SPOTS: [number, number][] = [
  [2, -2.5],
  [2, 0],
  [2, 2.5],
  [6, -2.5],
  [6, 2.5],
]
const OPEN_SPOT: [number, number] = [6, 0]

export function LookingScene({ calm }: { calm: boolean }) {
  const mert = useRef<Group>(null)
  const glow = useRef<Group>(null)
  const born = useRef<number | null>(null)
  useFrame(({ clock }) => {
    born.current ??= clock.elapsedTime
    const t = clock.elapsedTime - born.current // since this scene appeared
    if (mert.current) mert.current.position.x = calm ? -3.5 : -6 + Math.min(1, t / 2.5) * 2.5
    if (glow.current) glow.current.scale.setScalar(calm ? 1 : 1 + Math.sin(t * 3) * 0.08)
  })
  return (
    <>
      <Arena />
      <group ref={mert} position={[-6, 0, 0]} rotation-y={Math.PI / 2}>
        <Mert3D />
      </group>
      <spotLight position={[-4, 9, 0]} angle={0.35} penumbra={0.6} intensity={120} distance={20} />
      {TEAM_SPOTS.map(([x, z]) => (
        <Player key={`${x}${z}`} color="#3a4a6a" position={[x, 0, z]} rotation-y={-Math.PI / 2} />
      ))}
      {/* the open place in the team */}
      <group ref={glow} position={[OPEN_SPOT[0], 0.03, OPEN_SPOT[1]]}>
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.45, 0.6, 32]} />
          <meshBasicMaterial color={COLORS.accent} toneMapped={false} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={-0.005}>
          <circleGeometry args={[0.45, 32]} />
          <meshBasicMaterial color={COLORS.accent} transparent opacity={0.2} toneMapped={false} />
        </mesh>
      </group>
      <CameraRig to={[-11, 3.6, 4]} look={[2.5, 1.2, 0]} calm={calm} />
    </>
  )
}

// ---------- A scene not built yet: the court, the camera slowly round it ----------

export function CourtScene({ calm }: { calm: boolean }) {
  return (
    <>
      <Arena />
      <Mert3D position={[-2, 0, 1.5]} rotation-y={0.4} />
      <CameraRig to={[6, 4, 9]} look={[0, 1.5, 0]} calm={calm} />
    </>
  )
}
