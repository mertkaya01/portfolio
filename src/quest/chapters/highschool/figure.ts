import { pset, type Buffer } from './pixel'

// Players drawn from a skeleton — eleven joints, like a stick figure with thickness. A pose is
// just numbers, so a movement is a few key poses and every frame in between is calculated.
// That gives 30-px players that move smoothly, face either way and catch rim light, without
// drawing each frame by hand. (Mert's hand-drawn sprite sheets can replace any of them.)
//
// Coordinates: x points the way the player faces, y up is negative, (0, 0) is the floor
// between the feet. A standing player is 30 px tall: 1 m ≈ 16 px.

export type Point = readonly [number, number]
export type Pose = {
  head: Point
  neck: Point
  hip: Point
  elbowF: Point // F = the arm / leg nearer to us, drawn in front of the body
  handF: Point
  elbowB: Point // B = the far arm / leg, drawn behind the body
  handB: Point
  kneeF: Point
  footF: Point
  kneeB: Point
  footB: Point
}
type Joint = keyof Pose

const JOINTS = Object.keys({
  head: 0,
  neck: 0,
  hip: 0,
  elbowF: 0,
  handF: 0,
  elbowB: 0,
  handB: 0,
  kneeF: 0,
  footF: 0,
  kneeB: 0,
  footB: 0,
}) as Joint[]

// The poses used in Set 1 (all facing right)
export const POSES = {
  stand: {
    head: [0, -27],
    neck: [0, -23],
    hip: [0, -13],
    elbowF: [1, -17],
    handF: [1, -12],
    elbowB: [-1, -17],
    handB: [-1, -12],
    kneeF: [1, -7],
    footF: [1, 0],
    kneeB: [-1, -7],
    footB: [-2, 0],
  },
  // waiting for a serve: knees bent, arms low in front
  ready: {
    head: [3, -23],
    neck: [2, -19],
    hip: [-1, -10],
    elbowF: [5, -13],
    handF: [7, -11],
    elbowB: [4, -13],
    handB: [6, -11],
    kneeF: [4, -5],
    footF: [4, 0],
    kneeB: [-3, -5],
    footB: [-5, 0],
  },
  // forearm pass: arms locked straight out, hands together
  bump: {
    head: [3, -24],
    neck: [2, -20],
    hip: [-1, -11],
    elbowF: [6, -15],
    handF: [10, -14],
    elbowB: [5, -15],
    handB: [9, -14],
    kneeF: [4, -5],
    footF: [4, 0],
    kneeB: [-3, -6],
    footB: [-5, 0],
  },
  runA: {
    head: [3, -26],
    neck: [2, -22],
    hip: [0, -12],
    elbowF: [-2, -17],
    handF: [-1, -13],
    elbowB: [4, -17],
    handB: [6, -20],
    kneeF: [4, -6],
    footF: [2, 0],
    kneeB: [-2, -6],
    footB: [-6, -3],
  },
  runB: {
    head: [3, -26],
    neck: [2, -22],
    hip: [0, -12],
    elbowF: [4, -17],
    handF: [6, -20],
    elbowB: [-2, -17],
    handB: [-1, -13],
    kneeF: [-2, -6],
    footF: [-6, -3],
    kneeB: [4, -6],
    footB: [2, 0],
  },
  // the libero's dive: lunge → flying flat → sliding on the floor, arms reaching
  lunge: {
    head: [7, -19],
    neck: [5, -16],
    hip: [-3, -10],
    elbowF: [10, -14],
    handF: [14, -12],
    elbowB: [9, -15],
    handB: [13, -13],
    kneeF: [3, -5],
    footF: [6, 0],
    kneeB: [-7, -6],
    footB: [-11, -2],
  },
  fly: {
    head: [12, -7],
    neck: [9, -6],
    hip: [-2, -5],
    elbowF: [15, -6],
    handF: [19, -5],
    elbowB: [15, -5],
    handB: [19, -4],
    kneeF: [-7, -6],
    footF: [-12, -7],
    kneeB: [-7, -4],
    footB: [-12, -4],
  },
  slide: {
    head: [12, -3],
    neck: [9, -3],
    hip: [-2, -2],
    elbowF: [15, -2],
    handF: [19, -2],
    elbowB: [15, -2],
    handB: [19, -1],
    kneeF: [-7, -2],
    footF: [-12, -2],
    kneeB: [-7, -1],
    footB: [-12, -1],
  },
  // the block: crouch → up with both arms straight over the head
  crouch: {
    head: [1, -21],
    neck: [1, -17],
    hip: [-1, -8],
    elbowF: [3, -12],
    handF: [2, -8],
    elbowB: [-1, -12],
    handB: [-3, -9],
    kneeF: [3, -4],
    footF: [2, 0],
    kneeB: [-2, -4],
    footB: [-3, 0],
  },
  blockUp: {
    head: [1, -27],
    neck: [1, -23],
    hip: [0, -13],
    elbowF: [3, -31],
    handF: [5, -37],
    elbowB: [-1, -31],
    handB: [-2, -37],
    kneeF: [2, -7],
    footF: [1, -1],
    kneeB: [-1, -7],
    footB: [-2, -1],
  },
  // the spike, in the air: arm drawn back → hitting high in front → following through
  spikeCock: {
    head: [0, -27],
    neck: [0, -23],
    hip: [-1, -13],
    elbowF: [-2, -27],
    handF: [-5, -31],
    elbowB: [3, -27],
    handB: [5, -31],
    kneeF: [3, -8],
    footF: [1, -3],
    kneeB: [-2, -8],
    footB: [-5, -4],
  },
  spikeHit: {
    head: [1, -27],
    neck: [0, -23],
    hip: [-1, -13],
    elbowF: [3, -30],
    handF: [6, -36],
    elbowB: [1, -18],
    handB: [0, -14],
    kneeF: [3, -8],
    footF: [1, -3],
    kneeB: [-2, -8],
    footB: [-5, -4],
  },
  spikeFollow: {
    head: [2, -26],
    neck: [1, -22],
    hip: [-1, -12],
    elbowF: [5, -20],
    handF: [6, -14],
    elbowB: [-1, -18],
    handB: [-3, -15],
    kneeF: [3, -7],
    footF: [2, -2],
    kneeB: [-2, -7],
    footB: [-4, -2],
  },
  // celebrating the point: both arms up
  cheer: {
    head: [0, -27],
    neck: [0, -23],
    hip: [0, -13],
    elbowF: [4, -28],
    handF: [6, -33],
    elbowB: [-4, -28],
    handB: [-6, -33],
    kneeF: [2, -7],
    footF: [2, 0],
    kneeB: [-2, -7],
    footB: [-2, 0],
  },
} satisfies Record<string, Pose>

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Record<Joint, Point>
  for (const j of JOINTS)
    out[j] = [a[j][0] + (b[j][0] - a[j][0]) * t, a[j][1] + (b[j][1] - a[j][1]) * t]
  return out as Pose
}

// A movement: key poses at given times (seconds). Returns the pose at time t, eased between
// keys, holding the first / last pose outside them.
export type Key = { at: number; pose: Pose; lift?: number } // lift: px off the floor (a jump)
export function track(keys: Key[], t: number): { pose: Pose; lift: number } {
  if (t <= keys[0].at) return { pose: keys[0].pose, lift: keys[0].lift ?? 0 }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (t <= b.at) {
      const raw = (t - a.at) / (b.at - a.at)
      const e = raw * raw * (3 - 2 * raw) // smoothstep: soft start and stop
      return {
        pose: lerpPose(a.pose, b.pose, e),
        lift: (a.lift ?? 0) + ((b.lift ?? 0) - (a.lift ?? 0)) * e,
      }
    }
  }
  const last = keys[keys.length - 1]
  return { pose: last.pose, lift: last.lift ?? 0 }
}

export type Look = {
  body: number // skin, hair, shorts: the silhouette
  jersey: number
  stripe?: number // a diagonal stripe across the jersey
  rim?: number // the light catching the edge
  light?: 'top' | 'left' | 'right' // where that light comes from
}

// Drawing happens in a small grid first, so the rim light can look at neighbouring pixels
const GRID_W = 52
const GRID_H = 50
const OX = 26 // where the figure's (0, 0) sits in the grid
const OY = 46

export function drawFigure(
  b: Buffer,
  pose: Pose,
  x: number,
  y: number,
  facing: 1 | -1,
  look: Look,
  lift = 0,
) {
  const grid = new Uint8Array(GRID_W * GRID_H) // 0 empty · 1 body · 2 jersey · 3 stripe
  const put = (gx: number, gy: number, v: number) => {
    if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) grid[gy * GRID_W + gx] = v
  }
  const at = (p: Point): [number, number] => [OX + p[0] * facing, OY + p[1] - lift]
  // a thick line: a square brush stamped along it
  const limb = (p: Point, q: Point, size: number, v: number) => {
    const [x0, y0] = at(p)
    const [x1, y1] = at(q)
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2))
    const off = Math.floor(size / 2)
    for (let s = 0; s <= steps; s++) {
      const cx = Math.round(x0 + ((x1 - x0) * s) / steps)
      const cy = Math.round(y0 + ((y1 - y0) * s) / steps)
      for (let j = 0; j < size; j++)
        for (let i = 0; i < size; i++) put(cx - off + i, cy - off + j, v)
    }
  }
  const shoulder: Point = [
    pose.neck[0] + (pose.hip[0] - pose.neck[0]) * 0.15,
    pose.neck[1] + (pose.hip[1] - pose.neck[1]) * 0.15,
  ]

  // back to front: far leg and arm, torso, near leg, head, near arm
  limb(pose.hip, pose.kneeB, 3, 1)
  limb(pose.kneeB, pose.footB, 2, 1)
  limb(shoulder, pose.elbowB, 2, 1)
  limb(pose.elbowB, pose.handB, 2, 1)
  limb(pose.neck, pose.hip, 6, 2) // the jersey
  limb(pose.hip, [pose.hip[0], pose.hip[1] - 1], 6, 1) // shorts
  if (look.stripe !== undefined) {
    limb([pose.neck[0] - 1.5, pose.neck[1] + 3], [pose.hip[0] + 1.5, pose.hip[1] - 3], 1, 3)
  }
  limb(pose.hip, pose.kneeF, 3, 1)
  limb(pose.kneeF, pose.footF, 2, 1)
  const [hx, hy] = at(pose.head)
  for (let j = -3; j <= 3; j++)
    for (let i = -3; i <= 3; i++) if (i * i + j * j <= 10) put(hx + i, hy + j, 1)
  limb(shoulder, pose.elbowF, 2, 1)
  limb(pose.elbowF, pose.handF, 2, 1)

  // onto the picture, with rim light on the edges that face the light
  const colors = [0, look.body, look.jersey, look.stripe ?? look.jersey]
  const [dx, dy] = look.light === 'left' ? [-1, 0] : look.light === 'right' ? [1, 0] : [0, -1]
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const v = grid[gy * GRID_W + gx]
      if (!v) continue
      const nx = gx + dx
      const ny = gy + dy
      const edge = nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H || grid[ny * GRID_W + nx] === 0
      const c = edge && look.rim !== undefined ? look.rim : colors[v]
      pset(b, x + gx - OX, y + gy - OY, c)
    }
  }
}
