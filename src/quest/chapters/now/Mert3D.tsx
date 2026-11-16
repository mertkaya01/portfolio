import type { ThreeElements } from '@react-three/fiber'
import type { Ref } from 'react'
import type { Group } from 'three'

import { QUEST } from '../../engine/palette'

import { COLORS } from './colors'
import { BODY, SHAPES } from './figure'
import { FloorShadow } from './lights'

// Mert in 3D, stylised (figure.ts): as he looks now — short dark hair swept back (he cut it a
// term before graduating), stubble, a black jacket open over a white T-shirt. On court:
// his blue jersey with an orange band, the 9 on the back, shorts and knee pads. At his
// graduation: the gown over his clothes. He can stand or sit (at a desk). No face, like
// everyone in the quest. Arms down, up (a cheer, a block, the swing of a spike) or forward (on
// a keyboard); scenes that move the arms themselves get each shoulder through `rightArm` /
// `leftArm`. About 1.95 m tall standing; feet at y 0.
const SKIN = '#e0aa82'
const HAIR = '#2b1d16'
const STUBBLE = '#93705c' // skin with a few days' growth
const JACKET = '#1b1d24'
const TROUSERS = '#2a3550'
const JERSEY = QUEST.team
const SHORTS = '#1f3a78'
const STRIPE = '#e8834a'
const WHITE = '#f3efe6'
const GOWN = COLORS.gown
const SEAT_DROP = 0.34 // how much lower the body is when sitting

export function Mert3D({
  arms = 'down',
  kit = false,
  gown = false,
  sit = false,
  rightArm,
  leftArm,
  shadow = true,
  ...props
}: {
  arms?: 'down' | 'up' | 'forward'
  kit?: boolean
  gown?: boolean // the graduation gown over his clothes
  sit?: boolean // sitting (on a chair whose seat is about 0.5 m high)
  // for scenes that move the arms themselves (the spike): each arm turns at its shoulder
  rightArm?: Ref<Group>
  leftArm?: Ref<Group>
  shadow?: boolean // a soft shadow under the feet (off when the scene lifts him and draws its own)
} & ThreeElements['group']) {
  const armAngle = arms === 'up' ? Math.PI * 0.85 : 0.12
  const armForward = arms === 'forward' ? -1.15 : 0 // reaching to a keyboard
  const top = gown ? GOWN : kit ? JERSEY : JACKET
  const sleeve = gown ? GOWN : kit ? SKIN : JACKET
  return (
    <group {...props}>
      {shadow && <FloorShadow size={1.15} />}

      {/* legs: trousers — or bare legs with knee pads on court; white shoes */}
      {[-BODY.legX, BODY.legX].map((x) => (
        <group key={x}>
          {sit ? (
            <>
              <mesh geometry={SHAPES.thigh} position={[x, 0.52, 0.2]} rotation-x={Math.PI / 2}>
                <meshStandardMaterial color={TROUSERS} roughness={0.85} />
              </mesh>
              <mesh geometry={SHAPES.shin} position={[x, 0.28, 0.4]}>
                <meshStandardMaterial color={TROUSERS} roughness={0.85} />
              </mesh>
              <mesh geometry={SHAPES.shoe} position={[x, 0.045, 0.46]}>
                <meshStandardMaterial color={WHITE} roughness={0.55} />
              </mesh>
            </>
          ) : (
            <>
              <mesh geometry={SHAPES.shoe} position={[x, 0.045, 0.04]}>
                <meshStandardMaterial color={WHITE} roughness={0.55} />
              </mesh>
              <mesh geometry={SHAPES.leg} position={[x, BODY.legY, 0]}>
                <meshStandardMaterial color={kit ? SKIN : TROUSERS} roughness={kit ? 0.6 : 0.85} />
              </mesh>
              {kit && (
                <mesh geometry={SHAPES.kneePad} position={[x, 0.42, 0.005]}>
                  <meshStandardMaterial color={WHITE} roughness={0.7} />
                </mesh>
              )}
            </>
          )}
        </group>
      ))}

      {/* everything above the hips: lower when he sits */}
      <group position-y={sit ? -SEAT_DROP : 0}>
        <mesh geometry={SHAPES.hips} position={[0, BODY.hipsY, 0]}>
          <meshStandardMaterial color={kit ? SHORTS : TROUSERS} roughness={0.8} />
        </mesh>

        {/* the jacket, open over a white T-shirt — the jersey with its band — or the gown */}
        <mesh geometry={SHAPES.torso} position={[0, BODY.torsoY, 0]}>
          <meshStandardMaterial color={top} roughness={kit ? 0.55 : 0.75} />
        </mesh>
        {gown ? (
          <>
            <mesh geometry={SHAPES.robe} position={[0, 0.98, 0]}>
              <meshStandardMaterial color={GOWN} roughness={0.7} />
            </mesh>
            {/* the stole: two yellow bands down the front */}
            {[-0.1, 0.1].map((x) => (
              <mesh key={x} position={[x, 1.22, 0.163]}>
                <planeGeometry args={[0.07, 0.6]} />
                <meshStandardMaterial color={QUEST.accent} roughness={0.6} />
              </mesh>
            ))}
          </>
        ) : kit ? (
          // the band: the torso's own shape, a little wider, squeezed thin — it wraps all round
          <mesh geometry={SHAPES.torso} position={[0, 1.38, 0]} scale={[1.02, 0.11, 1.03]}>
            <meshStandardMaterial color={STRIPE} roughness={0.55} />
          </mesh>
        ) : (
          <mesh position={[0, 1.23, 0.136]}>
            <planeGeometry args={[0.14, 0.58]} />
            <meshStandardMaterial color={WHITE} roughness={0.8} />
          </mesh>
        )}
        {kit && <JerseyNine />}

        {/* arms, from the shoulders (side −1 is his right arm): sleeve, arm, hand */}
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={side < 0 ? rightArm : leftArm}
            position={[side * BODY.shoulder.x, BODY.shoulder.y, 0]}
            rotation={[armForward, 0, side * (armForward ? 0.06 : armAngle)]}
          >
            {kit && (
              <mesh geometry={SHAPES.sleeve} position={[0, -0.08, 0]}>
                <meshStandardMaterial color={JERSEY} roughness={0.55} />
              </mesh>
            )}
            <mesh geometry={gown ? SHAPES.robeSleeve : SHAPES.arm} position={[0, BODY.armY, 0]}>
              <meshStandardMaterial color={sleeve} roughness={kit ? 0.6 : 0.75} />
            </mesh>
            <mesh geometry={SHAPES.hand} position={[0, BODY.handY, 0]}>
              <meshStandardMaterial color={SKIN} roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* neck, head and ears; short hair swept back */}
        <mesh geometry={SHAPES.neck} position={[0, BODY.neckY, 0]}>
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <mesh geometry={SHAPES.head} position={[0, BODY.headY, 0]}>
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} geometry={SHAPES.ear} position={[side * 0.15, 1.82, -0.01]}>
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        ))}
        <mesh geometry={SHAPES.hairTop} position={[0, 1.985, -0.012]}>
          <meshStandardMaterial color={HAIR} roughness={0.85} />
        </mesh>
        <mesh geometry={SHAPES.hairBack} position={[0, 1.87, -0.125]}>
          <meshStandardMaterial color={HAIR} roughness={0.85} />
        </mesh>
        {/* stubble: the jaw and upper lip a shade darker than the skin — short, not a beard */}
        <mesh geometry={SHAPES.stubble} position={[0, 1.705, 0.065]}>
          <meshStandardMaterial color={STUBBLE} roughness={0.95} />
        </mesh>
        <mesh geometry={SHAPES.lip} position={[0, 1.752, 0.149]}>
          <meshStandardMaterial color={STUBBLE} roughness={0.95} />
        </mesh>
      </group>
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
    <group position={[0, 1.13, -0.137]} rotation-y={Math.PI}>
      {blocks.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={WHITE} />
        </mesh>
      ))}
    </group>
  )
}
