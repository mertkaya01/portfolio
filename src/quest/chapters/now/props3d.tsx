import type { ThreeElements } from '@react-three/fiber'

import { QUEST } from '../../engine/palette'

import { COLORS } from './colors'
import { BODY, SHAPES } from './figure'
import { FloorShadow } from './lights'

// Small 3D props for Set 5: the volleyball, faceless team-mates, and the three things Mert built
// in his internship (a hotel, a shopping bag for the marketplace, a chat bubble for the bots).

// The ball: yellow, with two blue bands
export function Ball(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color={QUEST.accent} roughness={0.5} />
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

// A person with no face, built like Mert (figure.ts) — team-mates and the other team in kit
// (shorts, bare arms and legs), graduates in gowns, colleagues in everyday clothes (long
// sleeves, trousers). Standing or sitting (on a seat about 0.5 m high). Arms hang at the sides,
// go up (a cheer), forward (on a table) — or, with `block`, up over the head with the hands
// open: a blocker at the net. A soft shadow under the feet — `shadow={false}` when the scene
// lifts the player (a jump) and draws its own.
const PLAYER_SKIN = '#d6a27c'
const SEAT_DROP = 0.34
export function Player({
  color,
  block = false,
  shadow = true,
  hair = '#2b2622',
  gown = false,
  casual = false,
  legs = '#2a3550',
  sit = false,
  arms,
  skin = PLAYER_SKIN,
  ...props
}: {
  color: string
  block?: boolean
  shadow?: boolean
  hair?: string
  gown?: boolean // a graduate: the gown over dark clothes (`color` is then the stole)
  casual?: boolean // everyday clothes: `color` is the top (long sleeves), `legs` the trousers
  legs?: string
  sit?: boolean
  arms?: 'down' | 'up' | 'forward'
  skin?: string
} & ThreeElements['group']) {
  const armAngle = block ? Math.PI * 0.93 : arms === 'up' ? Math.PI * 0.82 : 0.1
  // forward: on a table — sitting, the hands come down onto it
  const armForward = arms === 'forward' ? (sit ? -0.85 : -1.1) : 0
  const body = gown ? COLORS.gown : color
  const legColor = gown ? '#2a2f3a' : casual ? legs : skin
  const armColor = gown ? COLORS.gown : casual ? color : skin
  return (
    <group {...props}>
      {shadow && <FloorShadow size={1.1} />}
      {[-BODY.legX, BODY.legX].map((x) =>
        sit ? (
          <group key={x}>
            <mesh geometry={SHAPES.thigh} position={[x, 0.52, 0.2]} rotation-x={Math.PI / 2}>
              <meshStandardMaterial color={legColor} roughness={0.75} />
            </mesh>
            <mesh geometry={SHAPES.shin} position={[x, 0.28, 0.4]}>
              <meshStandardMaterial color={legColor} roughness={0.75} />
            </mesh>
            <mesh geometry={SHAPES.shoe} position={[x, 0.045, 0.46]}>
              <meshStandardMaterial color="#e9e4da" roughness={0.6} />
            </mesh>
          </group>
        ) : (
          <group key={x}>
            <mesh geometry={SHAPES.shoe} position={[x, 0.045, 0.04]}>
              <meshStandardMaterial color="#e9e4da" roughness={0.6} />
            </mesh>
            <mesh geometry={SHAPES.leg} position={[x, BODY.legY, 0]}>
              <meshStandardMaterial color={legColor} roughness={0.65} />
            </mesh>
          </group>
        ),
      )}
      <group position-y={sit ? -SEAT_DROP : 0}>
        <mesh geometry={SHAPES.hips} position={[0, BODY.hipsY, 0]}>
          <meshStandardMaterial color={casual ? legs : body} roughness={0.7} />
        </mesh>
        <mesh geometry={SHAPES.torso} position={[0, BODY.torsoY, 0]}>
          <meshStandardMaterial color={body} roughness={0.6} />
        </mesh>
        {gown && (
          <>
            <mesh geometry={SHAPES.robe} position={[0, 0.98, 0]}>
              <meshStandardMaterial color={COLORS.gown} roughness={0.7} />
            </mesh>
            {[-0.1, 0.1].map((x) => (
              <mesh key={x} position={[x, 1.22, 0.163]}>
                <planeGeometry args={[0.07, 0.6]} />
                <meshStandardMaterial color={color} roughness={0.6} />
              </mesh>
            ))}
          </>
        )}
        {[-1, 1].map((side) => (
          <group
            key={side}
            position={[side * BODY.shoulder.x, BODY.shoulder.y, 0]}
            rotation={[armForward, 0, side * (armForward ? 0.08 : armAngle)]}
          >
            {!gown && !casual && (
              <mesh geometry={SHAPES.sleeve} position={[0, -0.08, 0]}>
                <meshStandardMaterial color={color} roughness={0.6} />
              </mesh>
            )}
            <mesh geometry={gown ? SHAPES.robeSleeve : SHAPES.arm} position={[0, BODY.armY, 0]}>
              <meshStandardMaterial color={armColor} roughness={0.65} />
            </mesh>
            <mesh geometry={SHAPES.hand} position={[0, BODY.handY, 0]}>
              <meshStandardMaterial color={skin} roughness={0.65} />
            </mesh>
          </group>
        ))}
        <mesh geometry={SHAPES.neck} position={[0, BODY.neckY, 0]}>
          <meshStandardMaterial color={skin} roughness={0.65} />
        </mesh>
        <mesh geometry={SHAPES.head} position={[0, BODY.headY, 0]}>
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
        <mesh geometry={SHAPES.hairTop} position={[0, 1.985, -0.012]}>
          <meshStandardMaterial color={hair} roughness={0.85} />
        </mesh>
        <mesh geometry={SHAPES.hairBack} position={[0, 1.87, -0.125]}>
          <meshStandardMaterial color={hair} roughness={0.85} />
        </mesh>
      </group>
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
