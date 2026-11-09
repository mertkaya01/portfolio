import type { ThreeElements } from '@react-three/fiber'

// Small 3D props for Set 5: the volleyball, faceless team-mates, and the three things Mert built
// in his internship (a hotel, a shopping bag for the marketplace, a chat bubble for the bots).

// The ball: yellow, with two blue bands
export function Ball(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.5} />
      </mesh>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} rotation-y={r}>
          <torusGeometry args={[0.121, 0.012, 6, 24]} />
          <meshStandardMaterial color="#1d2b4a" />
        </mesh>
      ))}
    </group>
  )
}

// A player with no face: a body in their kit and a head — for team-mates and the other team
export function Player({ color, ...props }: { color: string } & ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.36, 0.9, 0.22]} />
        <meshStandardMaterial color="#d6a27c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.5, 0.66, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.82, 0]}>
        <boxGeometry args={[0.3, 0.32, 0.3]} />
        <meshStandardMaterial color="#2b2622" roughness={0.9} />
      </mesh>
    </group>
  )
}

// A hotel: a block of floors with lit windows, a sign on top
export function Hotel(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[0.6, 0.9, 0.4]} />
        <meshStandardMaterial color="#e9e1d3" />
      </mesh>
      {Array.from({ length: 4 }, (_, r) =>
        [-0.15, 0, 0.15].map((x) => (
          <mesh key={`${r}${x}`} position={[x, -0.3 + r * 0.2, 0.201]}>
            <planeGeometry args={[0.08, 0.1]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.4, 0.12, 0.05]} />
        <meshBasicMaterial color="#c4524a" />
      </mesh>
    </group>
  )
}

// A shopping bag: the marketplace
export function Bag(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[0.55, 0.6, 0.25]} />
        <meshStandardMaterial color="#e8834a" />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <torusGeometry args={[0.13, 0.02, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#8a5a36" />
      </mesh>
    </group>
  )
}

// A chat bubble: the WhatsApp bots (three dots typing)
export function Bubble(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[0.7, 0.45, 0.12]} />
        <meshStandardMaterial color="#4fbf6a" />
      </mesh>
      <mesh position={[-0.22, -0.28, 0]} rotation-z={0.6}>
        <boxGeometry args={[0.14, 0.14, 0.12]} />
        <meshStandardMaterial color="#4fbf6a" />
      </mesh>
      {[-0.17, 0, 0.17].map((x) => (
        <mesh key={x} position={[x, 0, 0.065]}>
          <circleGeometry args={[0.045, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}
