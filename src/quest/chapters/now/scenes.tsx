import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Vector3, type Group, type PerspectiveCamera } from 'three'

import { Arena, Jumbotron } from './Arena'
import { COLORS } from './colors'
import { Mert3D } from './Mert3D'
import { SHAPES } from './figure'
import { SpareLights } from './lights'
import { SEATS, TABLE } from './office'
import { GraduationHall, Office } from './places'
import { Bag, Bubble, Hotel, Player } from './props3d'
import { stepBack } from './stage'

// The 3D scenes of Set 5. Each one sets where the camera goes and what moves.
// calm: the visitor prefers less motion — everything stands still at a good moment.

// The camera glides to a position, looking at a point. Scenes are composed for a 45° view; the
// rig films them through a longer lens (`fov`, 34° by default — closer to a TV camera than to a
// phone's wide angle) and steps back so the framing stays the same. Where it looks moves a
// little slower than where it stands, like a camera operator following the action.
export function CameraRig({
  to,
  look,
  calm,
  fov = 34,
}: {
  to: [number, number, number]
  look: [number, number, number]
  calm: boolean
  fov?: number
}) {
  const focus = useMemo(() => new Vector3(...look), [look])
  const target = useMemo(
    () => new Vector3(...to).sub(focus).multiplyScalar(stepBack(fov)).add(focus),
    [to, focus, fov],
  )
  const current = useRef(new Vector3(...look))
  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera
    const k = calm ? 1 : 1 - Math.exp(-delta * 1.6)
    camera.position.lerp(target, k)
    current.current.lerp(focus, calm ? 1 : 1 - Math.exp(-delta * 1.2))
    camera.lookAt(current.current)
    if (camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
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
      <SpareLights spots={1} />
      <Jumbotron lines={board} start={calm ? 0 : 0.8} />
      <CameraRig to={[0, 6.4, 8.2]} look={[0, 6.6, 0]} calm={calm} />
    </>
  )
}

// ---------- Graduated: the ceremony, caps thrown in the air ----------
// On the stage of the graduation hall, in gowns: Mert in the middle, his classmates beside him,
// arms up — and the caps flying over the stage. The families watch from their rows.

const CAPS = 16
const STAGE = 0.9 // the stage floor's height
type Cap = { x: number; z: number; vx: number; vy: number; vz: number; spin: number; delay: number }
const GRADUATES: { x: number; z: number; stole: string; skin: string; hair: string }[] = [
  { x: -3.1, z: -1.7, stole: '#c4524a', skin: '#c98b5e', hair: '#16120f' },
  { x: -1.6, z: -1.5, stole: '#7dd3fc', skin: '#f2c9a7', hair: '#d9b26a' },
  { x: 1.6, z: -1.5, stole: '#ffd23f', skin: '#8d5a3b', hair: '#16120f' },
  { x: 3.1, z: -1.7, stole: '#c4524a', skin: '#e9b48f', hair: '#a3492c' },
]

export function GraduationScene({ calm, banner }: { calm: boolean; banner: string }) {
  const caps = useMemo<Cap[]>(
    () =>
      Array.from({ length: CAPS }, (_, i) => {
        const r = (k: number) => {
          const s = Math.sin(i * 91.7 + k * 13.3) * 43758.5
          return s - Math.floor(s)
        }
        return {
          x: (r(1) - 0.5) * 7,
          z: -1.4 + (r(2) - 0.5) * 0.8,
          vx: (r(3) - 0.5) * 1.6,
          vy: 6 + r(4) * 2.5,
          vz: (r(5) - 0.5) * 1.6,
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
      // thrown from the hands, up, and down again onto the stage
      const floor = STAGE + 0.03
      const y = Math.max(floor, STAGE + 2.1 + c.vy * s - 4.9 * s * s)
      const landed = y <= floor && s > 0.5
      g.position.set(c.x + c.vx * Math.min(s, 2.4), y, c.z + c.vz * Math.min(s, 2.4))
      if (!landed) g.rotation.set(s * c.spin * 0.4, s * c.spin, s * c.spin * 0.3)
    })
  })
  return (
    <>
      <GraduationHall banner={banner} />
      <SpareLights points={3} />
      {GRADUATES.map((g) => (
        <Player
          key={g.x}
          color={g.stole}
          gown
          arms="up"
          skin={g.skin}
          hair={g.hair}
          position={[g.x, STAGE, g.z]}
          rotation-y={-g.x * 0.04}
        />
      ))}
      <Mert3D gown arms="up" position={[0, STAGE, -1.1]} />
      {caps.map((c, i) => (
        <group key={i} ref={(g) => void (refs.current[i] = g)} position={[c.x, STAGE + 2.1, c.z]}>
          {/* a mortarboard: the flat square, the cap under it, a yellow tassel */}
          <mesh geometry={SHAPES.capBoard}>
            <meshStandardMaterial color="#14162a" roughness={0.6} />
          </mesh>
          <mesh geometry={SHAPES.capCrown} position={[0, -0.06, 0]}>
            <meshStandardMaterial color="#14162a" roughness={0.6} />
          </mesh>
          <mesh position={[0.19, -0.08, 0.19]}>
            <cylinderGeometry args={[0.012, 0.012, 0.18, 4]} />
            <meshBasicMaterial color={COLORS.accent} />
          </mesh>
        </group>
      ))}
      <CameraRig to={[0, 3.1, 10.5]} look={[0, 2.3, -1.4]} calm={calm} />
    </>
  )
}

// ---------- The internship: a hotel platform, a marketplace, WhatsApp bots ----------
// The office by day: five colleagues around the round table at their laptops, and Mert on
// his feet showing what he built — over the middle of the table, like a small hologram, the
// three things turn slowly: a hotel, a shopping bag, a chat bubble. His hand points at them.

const COLLEAGUES = [
  { color: '#3a6ea5', legs: '#2a3550', hair: '#16120f', skin: '#c98b5e' },
  { color: '#c4524a', legs: '#3a3f4a', hair: '#d9b26a', skin: '#f2c9a7' },
  { color: '#4f7a3a', legs: '#2a3550', hair: '#5b3a24', skin: '#e9b48f' },
  { color: '#e9e4da', legs: '#2a2f3a', hair: '#a3492c', skin: '#f2c9a7' },
  { color: '#6b4a7a', legs: '#3a3f4a', hair: '#16120f', skin: '#8d5a3b' },
]
const PRESENTER = { x: TABLE.x + 1.7, z: TABLE.z }
// the projects float a little towards him, so they stand clear of the colleagues' heads
const HOLO = { x: TABLE.x + 0.4, z: TABLE.z + 0.15 }

export function InternshipScene({ calm }: { calm: boolean }) {
  const ring = useRef<Group>(null)
  const pointing = useRef<Group>(null)
  useFrame(({ clock }) => {
    const t = calm ? 0 : clock.elapsedTime
    if (ring.current) {
      ring.current.rotation.y = t * 0.6
      ring.current.position.y = 2.25 + Math.sin(t * 1.4) * 0.04
    }
    // his right hand up towards the projects, moving a little as he talks
    pointing.current?.rotation.set(-1.25 + Math.sin(t * 1.3) * 0.1, 0, -0.28)
  })
  return (
    <>
      <Office />
      {SEATS.map((s, i) => (
        <Player
          key={i}
          sit
          casual
          arms="forward"
          {...COLLEAGUES[i]}
          position={[s.x, 0, s.z]}
          rotation-y={s.face}
        />
      ))}
      <Mert3D
        rightArm={pointing}
        position={[PRESENTER.x, 0, PRESENTER.z]}
        rotation-y={-Math.PI / 2}
      />
      {/* what he built, over the middle of the table, with a soft glow under it */}
      <mesh
        position={[HOLO.x, TABLE.top + 0.006, HOLO.z]}
        rotation-x={-Math.PI / 2}
        renderOrder={2}
      >
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color="#7fb4ff"
          transparent
          opacity={0.22}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={ring} position={[HOLO.x, 2.25, HOLO.z]} scale={0.55}>
        <Hotel position={[0.9, 0, 0]} />
        <Bag position={[-0.45, 0, 0.78]} />
        <Bubble position={[-0.45, 0, -0.78]} />
      </group>
      <CameraRig to={[3.3, 2.9, 3.4]} look={[0, 0.95, -0.8]} calm={calm} />
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
      <SpareLights spots={1} />
      <Mert3D position={[-2, 0, 1.5]} rotation-y={0.4} />
      <CameraRig to={[6, 4, 9]} look={[0, 1.5, 0]} calm={calm} />
    </>
  )
}
