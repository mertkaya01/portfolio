import type { ThreeElements } from '@react-three/fiber'

// Mert in 3D, low-poly and simple — as he looks now: short dark hair swept back (he cut it a
// term before graduating), a short beard, a black jacket over a white T-shirt. Or, on court,
// his blue jersey with an orange stripe and the 9 on the back. Arms down, or up (a cheer, a
// block, the swing of a spike). About 1.85 units tall; its feet stand at y 0.
const SKIN = '#e0aa82'
const HAIR = '#2b1d16'
const JACKET = '#1b1d24'
const JERSEY = '#2f5aa8'

export function Mert3D({
  arms = 'down',
  kit = false,
  ...props
}: { arms?: 'down' | 'up'; kit?: boolean } & ThreeElements['group']) {
  const armAngle = arms === 'up' ? Math.PI * 0.85 : 0.12
  const top = kit ? JERSEY : JACKET
  return (
    <group {...props}>
      {/* legs: trousers — or shorts, knee pads and bare shins on court */}
      {[-0.11, 0.11].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.45, 0]}>
            <boxGeometry args={[0.17, 0.9, 0.2]} />
            <meshStandardMaterial color={kit ? SKIN : '#2a3550'} roughness={0.8} />
          </mesh>
          {kit && (
            <>
              <mesh position={[x, 0.78, 0]}>
                <boxGeometry args={[0.19, 0.26, 0.22]} />
                <meshStandardMaterial color={JERSEY} roughness={0.7} />
              </mesh>
              <mesh position={[x, 0.42, 0.01]}>
                <boxGeometry args={[0.19, 0.1, 0.22]} />
                <meshStandardMaterial color="#f3efe6" />
              </mesh>
            </>
          )}
        </group>
      ))}
      {/* shoes */}
      {[-0.11, 0.11].map((x) => (
        <mesh key={`s${x}`} position={[x, 0.04, 0.04]}>
          <boxGeometry args={[0.18, 0.08, 0.3]} />
          <meshStandardMaterial color="#f3efe6" />
        </mesh>
      ))}
      {/* the jacket open over a white T-shirt — or the jersey: an orange stripe, the 9 behind */}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[0.5, 0.66, 0.28]} />
        <meshStandardMaterial color={top} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.24, 0.142]}>
        <planeGeometry args={[kit ? 0.5 : 0.16, kit ? 0.08 : 0.6]} />
        <meshStandardMaterial color={kit ? '#e8834a' : '#f3efe6'} />
      </mesh>
      {kit && <JerseyNine />}
      {/* arms, from the shoulders */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.3, 1.5, 0]} rotation-z={side * armAngle}>
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.13, 0.62, 0.15]} />
            <meshStandardMaterial color={kit ? SKIN : JACKET} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.67, 0]}>
            <boxGeometry args={[0.11, 0.11, 0.11]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
      ))}
      {/* head: face, short swept-back hair, a short beard */}
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[0.1, 0.12, 0.1]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh position={[0, 1.86, 0]}>
        <boxGeometry args={[0.3, 0.32, 0.3]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh position={[0, 2.03, -0.03]}>
        <boxGeometry args={[0.32, 0.1, 0.34]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.92, -0.16]}>
        <boxGeometry args={[0.32, 0.3, 0.06]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, 0.13]}>
        <boxGeometry args={[0.31, 0.1, 0.06]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} />
      </mesh>
    </group>
  )
}

// the 9 on the back of the jersey, in white blocks
function JerseyNine() {
  const blocks: [number, number, number, number][] = [
    [0, 0.12, 0.14, 0.035], // top
    [-0.055, 0.07, 0.035, 0.1], // upper left
    [0.055, 0.04, 0.035, 0.18], // right, all the way down
    [0, 0.02, 0.14, 0.035], // middle
    [0, -0.08, 0.14, 0.035], // bottom
  ]
  return (
    <group position={[0, 1.24, -0.142]} rotation-y={Math.PI}>
      {blocks.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#f3efe6" />
        </mesh>
      ))}
    </group>
  )
}
