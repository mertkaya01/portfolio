import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  Matrix4,
  SRGBColorSpace,
  type InstancedMesh,
} from 'three'

import { QUEST } from '../../engine/palette'

import { SHAPES } from './figure'
import { Glow } from './lights'
import { SEATS, TABLE } from './office'

// The places of Set 5 before the court: the graduation hall and the office of the internship (by day).
// (The court — the arena — comes last: "now", and the match point.) Same build as the arena:
// low-poly, soft-edged, lit by a few real lights and faked glows.

// ---------- canvas pictures: the banner, a monitor's code, the city at night ----------

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (ctx) draw(ctx)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

const bannerTexture = (text: string) =>
  canvasTexture(1024, 160, (ctx) => {
    ctx.fillStyle = '#1c2142'
    ctx.fillRect(0, 0, 1024, 160)
    ctx.strokeStyle = QUEST.accent
    ctx.lineWidth = 6
    ctx.strokeRect(14, 14, 996, 132)
    ctx.fillStyle = QUEST.accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = "900 92px 'Big Shoulders Variable', sans-serif"
    ctx.fillText(text, 512, 84)
  })

const CODE = [
  ['#7dd3fc', 'class HotelSearch {'],
  ['#e6edf5', '  find(city, dates) {'],
  ['#ffd23f', '    return solr.query(q)'],
  ['#e6edf5', '  }'],
  ['#8a93a0', '  // approved only'],
  ['#7dd3fc', '  publish(hotel) {'],
  ['#e6edf5', '    index.add(hotel)'],
  ['#e6edf5', '  }'],
  ['#e6edf5', '}'],
]
const codeTexture = (shift: number) =>
  canvasTexture(512, 300, (ctx) => {
    ctx.fillStyle = '#0f1420'
    ctx.fillRect(0, 0, 512, 300)
    ctx.font = "500 24px 'JetBrains Mono Variable', monospace"
    CODE.forEach(([color, line], i) => {
      const [c, l] = CODE[(i + shift) % CODE.length] ?? [color, line]
      ctx.fillStyle = c
      ctx.fillText(l, 22, 40 + i * 30)
    })
  })

// ---------- people sitting in rows, seen from behind (one instanced mesh per part) ----------

const HEADS = ['#2b1d16', '#16120f', '#5b3a24', '#d9b26a', '#3a2418', '#a3492c']
const CLOTHES = ['#3a4a6a', '#6b3a4a', '#2f4f6b', '#4a4a52', '#7a5a3a', '#2f5a4a', '#5a4a7a']

function SeatedRows({
  rows,
  cols,
  x0,
  dx,
  z0,
  dz,
  rise = 0,
}: {
  rows: number
  cols: number
  x0: number
  dx: number
  z0: number
  dz: number
  rise?: number // each row a little higher than the one in front
}) {
  const seats = useMemo(() => {
    const list: { x: number; z: number; y: number; i: number }[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const s = Math.sin(r * 31.7 + c * 12.3) * 43758.5
        if (s - Math.floor(s) < 0.12) continue // an empty seat here and there
        list.push({
          x: x0 + c * dx + (r % 2) * dx * 0.5,
          z: z0 + r * dz,
          y: r * rise,
          i: list.length,
        })
      }
    }
    return list
  }, [rows, cols, x0, dx, z0, dz, rise])
  const backs = useRef<InstancedMesh>(null)
  const bodies = useRef<InstancedMesh>(null)
  const heads = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const [k, b, h] = [backs.current, bodies.current, heads.current]
    if (!k || !b || !h) return
    const at = new Matrix4()
    const tint = new Color()
    seats.forEach((s, i) => {
      k.setMatrixAt(i, at.makeScale(1.15, 1.1, 0.35).setPosition(s.x, s.y + 0.62, s.z + 0.2))
      b.setMatrixAt(i, at.makeTranslation(s.x, s.y + 0.72, s.z))
      b.setColorAt(i, tint.set(CLOTHES[(i * 5) % CLOTHES.length]))
      h.setMatrixAt(i, at.makeTranslation(s.x, s.y + 1.1, s.z))
      h.setColorAt(i, tint.set(HEADS[(i * 7) % HEADS.length]))
    })
    for (const m of [k, b, h]) {
      m.instanceMatrix.needsUpdate = true
      if (m.instanceColor) m.instanceColor.needsUpdate = true
    }
  }, [seats])
  return (
    <>
      <instancedMesh ref={backs} args={[SHAPES.fan, undefined, seats.length]}>
        <meshStandardMaterial color="#3a2a30" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={bodies} args={[SHAPES.fan, undefined, seats.length]}>
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[SHAPES.fanHead, undefined, seats.length]}>
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
    </>
  )
}

// ---------- The graduation hall ----------
// A stage with deep red curtains in folds, a banner over it ("Class of 2026"), a lectern, warm
// stage lights; the families in rows in front of the stage, seen from behind.
export function GraduationHall({ banner }: { banner: string }) {
  const banderole = useMemo(() => bannerTexture(banner), [banner])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#2a2130" roughness={0.9} />
      </mesh>
      {/* the stage, its front edge, steps up on the left */}
      <mesh position={[0, 0.45, -2.25]}>
        <boxGeometry args={[14, 0.9, 5.5]} />
        <meshStandardMaterial color="#6e4a2e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.88, 0.51]}>
        <boxGeometry args={[14, 0.05, 0.04]} />
        <meshStandardMaterial color="#c98b52" roughness={0.5} />
      </mesh>
      {[0.3, 0.6].map((h, i) => (
        <mesh key={h} position={[-5.6, h / 2, 1.2 - i * 0.35]}>
          <boxGeometry args={[1.6, h, 0.4]} />
          <meshStandardMaterial color="#5a3c26" roughness={0.7} />
        </mesh>
      ))}
      {/* the back curtain, in folds; the side curtains; the valance on top */}
      {Array.from({ length: 28 }, (_, i) => (
        <mesh key={i} position={[-7 + i * 0.52 + 0.26, 4.15, -4.85 + (i % 2) * 0.14]}>
          <boxGeometry args={[0.5, 6.5, 0.16]} />
          <meshStandardMaterial color={i % 2 ? '#6e1d2a' : '#57151f'} roughness={0.85} />
        </mesh>
      ))}
      {[-1, 1].map((side) =>
        [0, 1, 2].map((k) => (
          <mesh key={`${side}${k}`} position={[side * (6.9 - k * 0.3), 4.15, -3.6 + k * 0.7]}>
            <boxGeometry args={[0.55, 6.5, 0.2]} />
            <meshStandardMaterial color={k % 2 ? '#6e1d2a' : '#57151f'} roughness={0.85} />
          </mesh>
        )),
      )}
      <mesh position={[0, 7.2, -4.55]}>
        <boxGeometry args={[14.4, 0.9, 0.35]} />
        <meshStandardMaterial color="#4a111a" roughness={0.85} />
      </mesh>
      {/* the banner */}
      <mesh position={[0, 5.75, -4.6]}>
        <planeGeometry args={[6.4, 1]} />
        <meshBasicMaterial map={banderole} toneMapped={false} />
      </mesh>
      {/* the lectern, with a microphone */}
      <group position={[-4.3, 0.9, -0.7]}>
        <mesh position={[0, 0.56, 0]}>
          <boxGeometry args={[0.7, 1.12, 0.48]} />
          <meshStandardMaterial color="#7a5232" roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.15, 0.04]} rotation-x={0.35}>
          <boxGeometry args={[0.8, 0.05, 0.56]} />
          <meshStandardMaterial color="#8a5e3a" roughness={0.5} />
        </mesh>
        <mesh position={[0.18, 1.35, 0.05]} rotation-x={-0.4}>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 6]} />
          <meshStandardMaterial color="#20242e" />
        </mesh>
      </group>
      {/* stage lights: warm spots from the ceiling, their haze, and the light itself */}
      <spotLight
        position={[0, 9, 6]}
        angle={0.42}
        penumbra={0.7}
        intensity={160}
        distance={24}
        color="#ffe2b0"
      />
      {[-2.6, 2.6].map((x) => (
        <group key={x}>
          <mesh position={[x * 0.6, 5.2, -0.6]} rotation-z={x * -0.05} renderOrder={2}>
            <coneGeometry args={[2.3, 8.6, 24, 1, true]} />
            <meshBasicMaterial
              color="#ffe2b0"
              transparent
              opacity={0.045}
              blending={AdditiveBlending}
              depthWrite={false}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <Glow position={[x * 0.6, 9.4, -0.6]} size={2.6} opacity={0.7} color="#ffe2b0" />
        </group>
      ))}
      {/* the families, in rows in front of the stage */}
      <SeatedRows rows={5} cols={15} x0={-6.4} dx={0.9} z0={2.6} dz={1.15} rise={0.12} />
    </group>
  )
}

// ---------- The office ----------
// The internship, by day: a bright office with a wall of windows onto the city, a white round
// table in the middle with five colleagues at their laptops — and Mert on his feet, showing
// what he built (the scene puts the people in; this is the room and its furniture).
const dayCityTexture = () =>
  canvasTexture(768, 320, (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 320)
    sky.addColorStop(0, '#7fb8ea')
    sky.addColorStop(1, '#d9ecf8')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, 768, 320)
    // a few soft clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    for (const [cx, cy, r] of [
      [120, 60, 26],
      [150, 54, 32],
      [182, 62, 22],
      [520, 40, 24],
      [548, 34, 30],
    ]) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // the city in daylight: pale towers, blue glass catching the sky
    let x = 0
    let i = 0
    while (x < 768) {
      const r = (k: number) => {
        const s = Math.sin(i * 12.9 + k * 78.2) * 43758.5
        return s - Math.floor(s)
      }
      const w = 50 + r(1) * 60
      const h = 110 + r(2) * 170
      ctx.fillStyle = ['#c3ccd6', '#aebccb', '#d6dce2', '#b8c7d6'][i % 4]
      ctx.fillRect(x, 320 - h, w - 6, h)
      ctx.fillStyle = 'rgba(90,140,190,0.55)'
      for (let wy = 320 - h + 12; wy < 314; wy += 15) {
        for (let wx = x + 7; wx < x + w - 14; wx += 11) ctx.fillRect(wx, wy, 7, 9)
      }
      x += w
      i++
    }
  })

export function Office() {
  const screens = useMemo(() => [0, 2, 4, 6, 1].map((shift) => codeTexture(shift)), [])
  const city = useMemo(() => dayCityTexture(), [])
  return (
    <group>
      {/* light oak floor, pale walls */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#c9a77f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.3, -4]}>
        <planeGeometry args={[16, 4.6]} />
        <meshStandardMaterial color="#ece8e0" roughness={0.9} />
      </mesh>
      <mesh position={[-4.5, 2.3, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[14, 4.6]} />
        <meshStandardMaterial color="#e4dfd6" roughness={0.9} />
      </mesh>
      {/* a wall of windows: the city by day */}
      <group position={[0.6, 1.95, -3.97]}>
        <mesh>
          <planeGeometry args={[7, 2.8]} />
          <meshBasicMaterial map={city} toneMapped={false} />
        </mesh>
        {[-3.5, -1.75, 0, 1.75, 3.5].map((x) => (
          <mesh key={x} position={[x, 0, 0.03]}>
            <boxGeometry args={[0.08, 2.9, 0.06]} />
            <meshStandardMaterial color="#3a3f4a" roughness={0.5} />
          </mesh>
        ))}
        {[-1.45, 1.45].map((y) => (
          <mesh key={y} position={[0, y, 0.03]}>
            <boxGeometry args={[7.1, 0.08, 0.06]} />
            <meshStandardMaterial color="#3a3f4a" roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* the whiteboard with sticky notes, on the side wall */}
      <group position={[-4.47, 1.65, -1.2]} rotation-y={Math.PI / 2}>
        <mesh>
          <planeGeometry args={[2.3, 1.2]} />
          <meshStandardMaterial color="#f7f7f3" roughness={0.35} />
        </mesh>
        {[
          ['#ffd23f', -0.85, 0.3],
          ['#f2a6b8', -0.55, 0.32],
          ['#9fd4f0', -0.25, 0.28],
          ['#ffd23f', -0.82, -0.05],
          ['#9fd4f0', -0.52, -0.08],
          ['#b8e0a0', 0.6, 0.25],
          ['#f2a6b8', 0.65, -0.12],
        ].map(([c, x, y], i) => (
          <mesh
            key={i}
            position={[x as number, y as number, 0.01]}
            rotation-z={(i % 3) * 0.05 - 0.05}
          >
            <planeGeometry args={[0.22, 0.22]} />
            <meshStandardMaterial color={c as string} roughness={0.8} />
          </mesh>
        ))}
        {[0.1, 0.25, 0.4].map((x) => (
          <mesh key={x} position={[x, 0.05 - x * 0.2, 0.01]}>
            <planeGeometry args={[0.26, 0.015]} />
            <meshBasicMaterial color="#2f5aa8" />
          </mesh>
        ))}
      </group>
      {/* the round table */}
      <group position={[TABLE.x, 0, TABLE.z]}>
        <mesh position={[0, TABLE.top - 0.03, 0]}>
          <cylinderGeometry args={[TABLE.r, TABLE.r, 0.06, 48]} />
          <meshStandardMaterial color="#f3efe8" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.37, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.7, 16]} />
          <meshStandardMaterial color="#5a5f6b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.04, 32]} />
          <meshStandardMaterial color="#5a5f6b" roughness={0.5} />
        </mesh>
      </group>
      {/* a chair and an open laptop at each seat */}
      {SEATS.map((s, i) => (
        <group key={i}>
          <group position={[s.x, 0, s.z]} rotation-y={s.face}>
            <mesh position={[0, 0.48, 0]}>
              <boxGeometry args={[0.48, 0.06, 0.46]} />
              <meshStandardMaterial color="#3a3f4a" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.82, -0.24]}>
              <boxGeometry args={[0.46, 0.56, 0.05]} />
              <meshStandardMaterial color="#3a3f4a" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.44, 8]} />
              <meshStandardMaterial color="#8a909c" />
            </mesh>
          </group>
          {/* the laptop: on the table in front of the seat, its screen towards the person */}
          <group
            position={[
              TABLE.x + (s.x - TABLE.x) * 0.52,
              TABLE.top,
              TABLE.z + (s.z - TABLE.z) * 0.52,
            ]}
            rotation-y={s.face + Math.PI}
          >
            <mesh position={[0, 0.008, 0]}>
              <boxGeometry args={[0.34, 0.016, 0.24]} />
              <meshStandardMaterial color="#b8bec8" roughness={0.4} metalness={0.3} />
            </mesh>
            <group position={[0, 0.016, 0.12]} rotation-x={0.3}>
              <mesh position={[0, 0.11, 0]}>
                <boxGeometry args={[0.34, 0.22, 0.012]} />
                <meshStandardMaterial color="#b8bec8" roughness={0.4} metalness={0.3} />
              </mesh>
              <mesh position={[0, 0.11, -0.007]} rotation-y={Math.PI}>
                <planeGeometry args={[0.31, 0.19]} />
                <meshBasicMaterial map={screens[i]} toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
      {/* two coffee cups */}
      {[
        [0.35, -0.2],
        [-0.45, -1.05],
      ].map(([x, z]) => (
        <mesh key={x} position={[TABLE.x + x, TABLE.top + 0.045, TABLE.z + z]}>
          <cylinderGeometry args={[0.04, 0.035, 0.09, 12]} />
          <meshStandardMaterial color={x > 0 ? QUEST.accent : '#f3efe8'} roughness={0.5} />
        </mesh>
      ))}
      {/* pendant lamps over the table */}
      {[-0.95, 0.95].map((x) => (
        <group key={x} position={[TABLE.x + x, 2.55, TABLE.z]}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 1.8, 4]} />
            <meshStandardMaterial color="#20242e" />
          </mesh>
          <mesh>
            <coneGeometry args={[0.24, 0.22, 24, 1, true]} />
            <meshStandardMaterial color="#20242e" side={DoubleSide} roughness={0.5} />
          </mesh>
          <Glow position={[0, -0.12, 0]} size={0.9} opacity={0.6} color="#fff1d6" />
          <pointLight position={[0, -0.2, 0]} intensity={3.5} distance={4} color="#fff1d6" />
        </group>
      ))}
      {/* daylight from the windows: the sun on the table, a soft fill */}
      <spotLight
        position={[1.2, 3.6, -3.4]}
        angle={0.9}
        penumbra={1}
        intensity={55}
        distance={12}
        color="#fff5e2"
      />
      <pointLight position={[0.5, 2.4, -2.6]} intensity={6} distance={9} color="#e8f2ff" />
      {/* plants by the windows */}
      {[
        [3.6, -3.3],
        [-3.8, -3.3],
      ].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.24, 0.19, 0.5, 14]} />
            <meshStandardMaterial color="#e9e4da" roughness={0.6} />
          </mesh>
          {[
            [0, 0.85, 0, 0.32],
            [0.2, 1.05, 0.06, 0.24],
            [-0.18, 1.1, -0.06, 0.26],
            [0.02, 1.32, 0.02, 0.2],
          ].map(([px, py, pz, pr], k) => (
            <mesh key={k} position={[px, py, pz]}>
              <sphereGeometry args={[pr, 12, 10]} />
              <meshStandardMaterial color={k % 2 ? '#3f7a3a' : '#4f8f45'} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
