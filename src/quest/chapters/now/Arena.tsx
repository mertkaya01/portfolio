import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace, type MeshBasicMaterial } from 'three'

import { COLORS } from './colors'

// The 3D arena of Set 5, low-poly and simple: the orange court with its white lines and the
// blue around it, the net, stands on both sides with a few people, lamps under the roof, and a
// big screen hanging over the middle (it shows the set's scoreboard). 1 unit ≈ 1 m: the court
// is 18 × 9, the net 2.43 high.
export function Arena() {
  return (
    <group>
      {/* the floor: blue around, the orange court, the lines */}
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color={COLORS.surround} roughness={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.01}>
        <planeGeometry args={[18, 9]} />
        <meshStandardMaterial color={COLORS.court} roughness={0.7} />
      </mesh>
      {[
        // [x, z, width, depth]: the sidelines, the end lines, the centre line, the attack lines
        [0, -4.5, 18, 0.06],
        [0, 4.5, 18, 0.06],
        [-9, 0, 0.06, 9],
        [9, 0, 0.06, 9],
        [0, 0, 0.06, 9],
        [-3, 0, 0.06, 9],
        [3, 0, 0.06, 9],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[x, 0.02, z]}>
          <planeGeometry args={[w, d]} />
          <meshBasicMaterial color={COLORS.line} />
        </mesh>
      ))}
      <Net />
      <Stands side={-1} />
      <Stands side={1} />
      {/* lamps under the roof */}
      {[-6, 0, 6].map((x) => (
        <group key={x} position={[x, 11, 0]}>
          <mesh>
            <boxGeometry args={[1.6, 0.2, 1.6]} />
            <meshBasicMaterial color="#fff6d8" />
          </mesh>
          <pointLight
            position={[0, -1, 0]}
            intensity={60}
            distance={30}
            decay={1.6}
            color="#fff1cc"
          />
        </group>
      ))}
    </group>
  )
}

function Net() {
  return (
    <group>
      {[-5.2, 5.2].map((z) => (
        <mesh key={z} position={[0, 1.3, z]}>
          <cylinderGeometry args={[0.06, 0.06, 2.6, 8]} />
          <meshStandardMaterial color="#d9dde3" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      {/* the mesh: dark and see-through, the white tape on top */}
      <mesh position={[0, 1.93, 0]}>
        <boxGeometry args={[0.02, 1, 9.6]} />
        <meshStandardMaterial color="#111" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 2.43, 0]}>
        <boxGeometry args={[0.04, 0.07, 9.8]} />
        <meshBasicMaterial color={COLORS.line} />
      </mesh>
      {/* antennas */}
      {[-4.5, 4.5].map((z) => (
        <mesh key={z} position={[0, 2.85, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.85, 6]} />
          <meshBasicMaterial color="#d63a2f" />
        </mesh>
      ))}
    </group>
  )
}

// Stepped stands along a side of the hall, with a scattering of people (simple blocks)
function Stands({ side }: { side: -1 | 1 }) {
  const people = useMemo(() => {
    const list: { x: number; row: number; color: string }[] = []
    const colors = ['#c4524a', '#e6edf5', '#2f4f6b', '#7a3b6b', '#e8834a', '#ffd23f']
    for (let row = 0; row < 4; row++) {
      for (let x = -11; x <= 11; x += 1.1) {
        const r = Math.sin(x * 12.9 + row * 78.2 + side * 3.1) * 43758.5
        if (r - Math.floor(r) < 0.55) continue
        list.push({
          x,
          row,
          color: colors[Math.floor(((r * 7) % colors.length) + colors.length) % colors.length],
        })
      }
    }
    return list
  }, [side])
  return (
    <group position={[0, 0, side * 9.5]}>
      {[0, 1, 2, 3].map((row) => (
        <mesh key={row} position={[0, 0.4 + row * 0.8, side * row * 1.1]}>
          <boxGeometry args={[26, 0.8, 1.1]} />
          <meshStandardMaterial color={row % 2 ? COLORS.seat : COLORS.stand} roughness={0.9} />
        </mesh>
      ))}
      {people.map((p, i) => (
        <mesh key={i} position={[p.x, 1.1 + p.row * 0.8, side * p.row * 1.1]}>
          <boxGeometry args={[0.45, 0.6, 0.35]} />
          <meshStandardMaterial color={p.color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// The big screen over the middle of the court, showing text drawn on a canvas (the site's own
// fonts are already loaded on the page, so no 3D font is needed)
// It switches on by itself `start` seconds after it appears (a little flicker, then steady).
export function Jumbotron({
  lines,
  start = 0,
}: {
  lines: { set: string; title: string; period: string }
  start?: number
}) {
  const screen = useRef<MeshBasicMaterial>(null)
  const born = useRef<number | null>(null)
  useFrame(({ clock }) => {
    if (!screen.current) return
    born.current ??= clock.elapsedTime
    const t = clock.elapsedTime - born.current - start
    screen.current.opacity = t < 0 ? 0 : t < 0.15 ? 0.6 : t < 0.25 ? 0.1 : Math.min(1, t)
  })
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#07080c'
      ctx.fillRect(0, 0, 1024, 512)
      // faint LED grid
      ctx.fillStyle = '#141824'
      for (let y = 6; y < 512; y += 12) for (let x = 6; x < 1024; x += 12) ctx.fillRect(x, y, 6, 6)
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(255, 210, 63, 0.8)'
      ctx.shadowBlur = 24
      ctx.fillStyle = COLORS.accent
      ctx.font = "600 44px 'JetBrains Mono Variable', monospace"
      ctx.fillText(`SET ${lines.set}`, 512, 96)
      ctx.font = "900 190px 'Big Shoulders Variable', sans-serif"
      ctx.fillText(lines.title, 512, 300)
      ctx.font = "500 56px 'JetBrains Mono Variable', monospace"
      ctx.fillStyle = '#f6b26b'
      ctx.fillText(lines.period, 512, 420)
    }
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [lines.set, lines.title, lines.period])

  return (
    <group position={[0, 7.2, 0]}>
      {/* cables to the roof */}
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 2.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4.8, 4]} />
          <meshBasicMaterial color="#3a3f4a" />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[6.6, 3.5, 0.4]} />
        <meshStandardMaterial color="#1a1d26" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.21]}>
        <planeGeometry args={[6.2, 3.1]} />
        <meshBasicMaterial ref={screen} map={texture} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  )
}
