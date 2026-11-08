import { drawFigure, POSES, track, type Key, type Look } from './figure'
import { arc, ball, lamps, net, trusses, wallFlag } from './gym'
import { C, createBuffer, FULL, hash, pset, rect, shadeLeft, type Buffer } from './pixel'
import type { Shot } from './shot'

// Shot 4, full screen (320 × 180): "Early 2020: the national high-school championship in
// Aydın. I played middle blocker — it was hard, and it was great."
// The gym in Aydın, after the photos: dark-blue steel trusses with hanging lamps, cream walls
// with a salmon band below, the Turkish flag, the scoreboard and the banner of the provincial
// sports directorate, the stands with a few spectators, the orange court with blue around it.
// Mert — number 1, blue jersey with an orange stripe — blocks the spike at the net, the ball
// drops on their side, and the team celebrates. One rally, every 3.2 seconds.

const FLOOR = 170
const NET_X = 214
const RALLY = 3.2

const LIGHT = { rim: C.glow, light: 'top' as const }
const US: Look = { body: C.ink, jersey: C.courtBlue, stripe: C.orange, ...LIGHT }
const THEM: Look = { body: C.ink, jersey: C.deepBlue, stripe: C.white, ...LIGHT }

export function paintAydinBackground() {
  const b = createBuffer(FULL.w, FULL.h)
  trusses(b, 26, C.deepBlue, C.night)
  rect(b, 0, 26, FULL.w, 84, C.cream)
  rect(b, 0, 110, FULL.w, 26, C.salmon)
  rect(b, 0, 110, FULL.w, 1, C.coral)

  // the stands on the left: three tiers, a few spectators
  for (let k = 0; k < 3; k++) {
    const y = 74 + k * 12
    rect(b, 0, y, 150 - k * 12, 12, k % 2 ? C.creamShade : C.cream)
    rect(b, 0, y + 11, 150 - k * 12, 1, C.grey)
    for (let x = 4; x < 140 - k * 12; x += 7) {
      if (hash(x, k) < 0.4) continue
      const shirt = [C.plum, C.teal, C.slate, C.coral, C.deepBlue][Math.floor(hash(k, x) * 5)]
      rect(b, x - 1, y + 5, 6, 5, shirt) // shoulders
      rect(b, x, y + 1, 4, 4, C.skin) // head
      rect(b, x, y + 1, 4, 1, C.hair)
    }
  }
  rect(b, 0, 108, 152, 2, C.grey) // the railing in front of the stands

  // flag, scoreboard (no score: we don't make one up) and the banner under it
  wallFlag(b, 232, 42)
  rect(b, 276, 40, 38, 22, C.slate)
  rect(b, 277, 41, 36, 20, C.ink)
  for (const x of [282, 302]) rect(b, x, 49, 7, 2, C.orange) // "– –"
  for (let i = 0; i < 4; i++) pset(b, 293 + (i % 2) * 2, 46 + Math.floor(i / 2) * 6, C.sun)
  rect(b, 272, 66, 46, 10, C.white)
  rect(b, 275, 69, 40, 1, C.deepBlue)
  rect(b, 278, 72, 34, 1, C.deepBlue)

  // the floor: blue around, the orange court between the sidelines
  rect(b, 0, 136, FULL.w, FULL.h - 136, C.courtBlue)
  rect(b, 0, 142, FULL.w, 30, C.orange)
  for (let y = 144; y < 172; y += 4) {
    for (let x = (y * 7) % 19; x < FULL.w; x += 19) rect(b, x, y, 6, 1, C.coral) // board seams
  }
  rect(b, 0, 142, FULL.w, 1, C.white)
  rect(b, 0, 172, FULL.w, 1, C.white)
  // the attack lines, 3 m either side of the net, leaning with the perspective
  for (const x of [NET_X - 48, NET_X + 48]) {
    for (let y = 143; y < 172; y++) pset(b, x + Math.round((172 - y) * 0.2), y, C.white)
  }
  lamps(b, [30, 100, 170, 240, 300], 30, 140, C.glow, 0.1)
  net(b, NET_X, FLOOR + 2)
  shadeLeft(b, 104, -100, 40) // one gentle step: a bright gym, not a dark corner
  return b
}

// ---------- The moving layers ----------

// Mert at the net: crouch → up, both hands over the tape → down → celebrate the point
const BLOCKER: Key[] = [
  { at: 0, pose: POSES.ready },
  { at: 0.25, pose: POSES.crouch },
  { at: 0.5, pose: POSES.blockUp, lift: 10 },
  { at: 0.8, pose: POSES.blockUp, lift: 10 },
  { at: 1.05, pose: POSES.crouch },
  { at: 1.35, pose: POSES.ready },
  { at: 1.6, pose: POSES.cheer },
  { at: 2.4, pose: POSES.cheer },
  { at: 2.8, pose: POSES.ready },
]
// Their spiker: crouch → jump with the arm drawn back → hit → land
const SPIKER: Key[] = [
  { at: 0, pose: POSES.ready },
  { at: 0.2, pose: POSES.crouch },
  { at: 0.42, pose: POSES.spikeCock, lift: 12 },
  { at: 0.62, pose: POSES.spikeHit, lift: 13 },
  { at: 0.82, pose: POSES.spikeFollow, lift: 6 },
  { at: 1.0, pose: POSES.crouch },
  { at: 1.4, pose: POSES.stand },
]

// The ball: the set comes in high → their spike → it meets the block → drops on their side
function ballAt(b: Buffer, t: number) {
  const ground = FLOOR - 3
  const contact: [number, number] = [220, 122]
  const block: [number, number] = [210, 125]
  if (t < 0.62) ball(b, ...arc([272, 70], contact, t / 0.62, 10))
  else if (t < 0.7) ball(b, ...arc(contact, block, (t - 0.62) / 0.08, 0))
  else if (t < 1.05) ball(b, ...arc(block, [238, ground], (t - 0.7) / 0.35, 4))
  else if (t < 1.4) ball(b, ...arc([238, ground], [252, ground], (t - 1.05) / 0.35, 10))
  else if (t < 2.8) ball(b, ...arc([252, ground], [262, ground], (t - 1.4) / 0.6, 0))
}

// After the point our side cheers (little hops), theirs stands
function team(t: number, delay: number) {
  if (t < 1.2 + delay || t > 2.6) return { pose: POSES.ready, lift: 0 }
  return { pose: POSES.cheer, lift: Math.round(Math.abs(Math.sin((t - 1.2) * 6)) * 3) }
}

function rally(b: Buffer, time: number) {
  const t = time % RALLY
  drawFigure(b, t > 1.2 ? POSES.stand : POSES.ready, 262, FLOOR, -1, THEM)
  drawFigure(b, t > 1.2 ? POSES.stand : POSES.ready, 292, FLOOR, -1, THEM)
  for (const [x, delay] of [
    [150, 0],
    [178, 0.1],
  ]) {
    const mate = team(t, delay)
    drawFigure(b, mate.pose, x, FLOOR, 1, US, mate.lift)
  }
  const spiker = track(SPIKER, t)
  drawFigure(b, spiker.pose, 226, FLOOR, -1, THEM, spiker.lift)
  const me = track(BLOCKER, t)
  drawFigure(b, me.pose, 204, FLOOR, 1, US, me.lift)
  ballAt(b, t)
}

export const aydinShot: Shot = {
  label:
    'Pixel art: Aydın 2020 — number 1, a middle blocker, blocks the spike at the net and the team celebrates.',
  background: '/art/set1/shot4/background.png',
  over: rally,
  still: 0.66, // the ball against the block
}
