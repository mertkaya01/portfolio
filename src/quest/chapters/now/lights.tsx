import { useThree, type ThreeElements } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { AdditiveBlending, type WebGLRenderer } from 'three'

import { softSpot } from './stage'

// The arena's light at night, the same in every 3D scene:
// - a sky / floor fill instead of a flat ambient: cool navy from above, a warm bounce off the
//   parquet from below — the shadows are blue, the floor glows
// - one warm key from high up front
// - a cool rim from behind, so dark silhouettes come off the dark stands
export function StageLights() {
  return (
    <>
      <hemisphereLight args={['#6b84c4', '#7a4f2e', 1.25]} />
      <directionalLight position={[4, 12, 7]} intensity={1.8} color="#fff2dc" />
      <directionalLight position={[-5, 6, -11]} intensity={1.5} color="#8fc0ff" />
    </>
  )
}

// A lamp's glow, faked: a soft bright disc that always faces the camera, added on top
// (cheaper than a bloom pass, and it only glows where it should)
export function Glow({
  size = 3,
  color = '#fff1cc',
  opacity = 0.6,
  ...props
}: { size?: number; color?: string; opacity?: number } & ThreeElements['sprite']) {
  return (
    <sprite scale={[size, size, 1]} {...props}>
      <spriteMaterial
        map={softSpot()}
        color={color}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  )
}

// A soft shadow on the floor under someone: no shadow maps, just a dark round spot
export function FloorShadow({
  size = 1,
  opacity = 0.5,
  ...props
}: { size?: number; opacity?: number } & ThreeElements['mesh']) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.03} renderOrder={1} {...props}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={softSpot()}
        color="#000000"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  )
}

// Compiles the scene's shaders before its first frame, off the main thread where the browser
// can (KHR_parallel_shader_compile), then says it is ready. Without this, the first frame of a
// 3D canvas compiles everything at once and the page freezes for half a second — in the middle
// of the set's transition. Put it last in the <Canvas>, so the rest of the scene is already
// there, and keep the canvas's frameloop at 'never' until onReady. `prepare` sets the renderer up
// first (setupStage): shaders depend on the tone mapping, and ones compiled for another would
// all be compiled again — blocking — on the first frame.
export function Warmup({
  onReady,
  prepare,
}: {
  onReady: () => void
  prepare?: (state: { gl: WebGLRenderer }) => void
}) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    let alive = true
    prepare?.({ gl })
    gl.compileAsync(scene, camera)
      .catch(() => undefined) // a scene that can't compile ahead still renders, just not warm
      .then(() => {
        if (!alive) return
        onReady()
        requestAnimationFrame(() => invalidate()) // the first frame, also for 'demand' canvases
      })
    return () => {
      alive = false
    }
  }, [gl, scene, camera, invalidate, onReady, prepare])
  return null
}

// Spare lights, switched off. three.js compiles its shaders for a given number of lights, so a
// scene with one light more or less than the last recompiles every material — a hitch of
// 150–200 ms at the cut. Every Set 5 scene therefore has the same lights: 3 point lights and
// 1 spot light (its own, topped up with these).
export function SpareLights({ points = 0, spots = 0 }: { points?: number; spots?: number }) {
  return (
    <>
      {Array.from({ length: points }, (_, i) => (
        <pointLight key={`p${i}`} intensity={0} />
      ))}
      {Array.from({ length: spots }, (_, i) => (
        <spotLight key={`s${i}`} intensity={0} />
      ))}
    </>
  )
}
