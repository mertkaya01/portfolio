import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  MathUtils,
  Quaternion,
  Shape,
  ShapeGeometry,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type PerspectiveCamera,
} from 'three'

import { Arena } from './Arena'
import { COLORS } from './colors'
import { FloorShadow } from './lights'
import { Mert3D } from './Mert3D'
import { Ball, Player } from './props3d'
import {
  ATTEMPTS,
  T,
  WINDOWS,
  grade as gradeSwing,
  isPoint,
  lastChance,
  offsetMs,
  outcome as outcomeOf,
  speedAt,
  type Grade,
  type Outcome,
  type Side,
} from './spike'

// The match point, played: the 3D scene of the spike timing game (the rules are in spike.ts).
// Everything that moves is driven from one useFrame loop with refs — React only hears about
// the big moments (a new ball, the ring, the result, the end), so nothing re-renders per frame.
//
// The camera stands behind Mert (the 9 on his back), so the left and right of the screen are
// the two sides of the court the block can cover.

// A swing: when (the event's timeStamp, ms) and where (-1 left … 1 right of the screen, or null
// for "the open side" — Space, Enter, the button)
export type Press = { time: number; screen: number | null }
export type GameEvent =
  | { type: 'play'; attempt: number; auto: boolean }
  | { type: 'ring' }
  | { type: 'result'; outcome: Outcome; grade: Grade | null }
  | { type: 'done' }

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)
const { lerp, smoothstep, clamp } = MathUtils

// Where things are (1 unit ≈ 1 m; the net is at x 0, Mert's side is x < 0)
const SETTER_HANDS = v(-0.8, 2.25, 1.7)
const MERT_FROM = v(-5.4, 0, 1.2) // the start of his run-up
const MERT_AT = v(-2.0, 0, 0.15) // where he takes off
const HIT = v(-1.55, 3.3, 0.45) // where he meets the ball: in front of his right shoulder
const SET_ARC = 2.0 // how high the set goes above the line from the setter to the hit
const JUMP = 0.85
const BLOCK_JUMP = 0.65
const TARGETS: Record<Side, Vector3> = { [-1]: v(5, 0.1, -2.7), [1]: v(5, 0.1, 2.7) }

// The camera: behind Mert during the set, closer in the slow motion, wide for the celebration
const CAM_FROM = v(-9.8, 3.2, 2.7)
const CAM_CLOSE = v(-7.1, 3.15, 1.75)
const LOOK_FROM = v(0.6, 2.4, 0)
const LOOK_CLOSE = v(-0.3, 2.85, 0.15)
const CAM_WIDE = v(-6.4, 4.4, 7.8)
const LOOK_WIDE = v(-0.4, 1.5, 0)

// ---------- the ball's flight after the swing: quadratic curves, one after the other ----------

type Segment = {
  from: Vector3
  ctrl: Vector3
  to: Vector3
  dur: number // real seconds
  hit?: 'floor' | 'hands' | 'net' // what it hits at the end
  fast?: boolean // stretch the ball along its path
  grade?: Grade // on the first one: how the swing was timed (told with the result)
}

const mid = (a: Vector3, b: Vector3, lift = 0) =>
  a
    .clone()
    .add(b)
    .multiplyScalar(0.5)
    .setY((a.y + b.y) / 2 + lift)

function flightFor(o: Outcome, from: Vector3, open: Side): Segment[] {
  const blocked = -open as Side
  const hands = v(0.45, 3.0, HIT.z + blocked * 0.7)
  const r = Math.random()
  switch (o) {
    case 'kill': {
      const floor = v(4.2 + r * 1.4, 0.12, open * (2.1 + r * 0.9))
      const away = v(9.8, 2.4, open * 4.6)
      return [
        { from, ctrl: mid(from, floor, 0.25), to: floor, dur: 0.26, hit: 'floor', fast: true },
        { from: floor, ctrl: v(7.4, 3.4, open * 3.8), to: away, dur: 0.6 },
        { from: away, ctrl: v(11, 1.8, open * 5), to: v(12.5, 0.12, open * 5.6), dur: 0.35 },
      ]
    }
    case 'blockout': {
      const far = v(7, 5.2, blocked * 7.5)
      return [
        { from, ctrl: mid(from, hands, 0.1), to: hands, dur: 0.12, hit: 'hands', fast: true },
        { from: hands, ctrl: v(3.4, 6.6, blocked * 3.6), to: far, dur: 0.8 },
        { from: far, ctrl: v(8.6, 3, blocked * 8.6), to: v(9.6, 0.12, blocked * 9.4), dur: 0.4 },
      ]
    }
    case 'blocked': {
      const floor = v(-2.7, 0.12, HIT.z + 0.6)
      return [
        { from, ctrl: mid(from, hands, 0.1), to: hands, dur: 0.12, hit: 'hands', fast: true },
        { from: hands, ctrl: v(-1.1, 3.6, HIT.z + 0.3), to: floor, dur: 0.6, hit: 'floor' },
        { from: floor, ctrl: v(-3.4, 0.9, HIT.z + 0.8), to: v(-4.2, 0.12, HIT.z + 1), dur: 0.4 },
      ]
    }
    case 'net': {
      const net = v(-0.06, 1.8, HIT.z)
      return [
        { from, ctrl: mid(from, net), to: net, dur: 0.2, hit: 'net', fast: true },
        {
          from: net,
          ctrl: v(-0.3, 1.3, HIT.z),
          to: v(-0.55, 0.12, HIT.z),
          dur: 0.42,
          hit: 'floor',
        },
      ]
    }
    case 'out': {
      const far = v(10.6, 0.9, open * 1.6)
      return [
        { from, ctrl: v(4.5, 4.4, open), to: far, dur: 0.62, fast: true },
        { from: far, ctrl: v(11.6, 1.2, open * 1.8), to: v(12.6, 0.12, open * 2), dur: 0.3 },
      ]
    }
    case 'miss': {
      const floor = v(-0.95, 0.12, HIT.z + 0.6)
      return [{ from, ctrl: v(-1.15, 2.4, HIT.z + 0.4), to: floor, dur: 0.48, hit: 'floor' }]
    }
  }
}

function onCurve(s: Segment, p: number, out: Vector3) {
  const a = (1 - p) * (1 - p)
  const b = 2 * (1 - p) * p
  const c = p * p
  return out.set(
    a * s.from.x + b * s.ctrl.x + c * s.to.x,
    a * s.from.y + b * s.ctrl.y + c * s.to.y,
    a * s.from.z + b * s.ctrl.z + c * s.to.z,
  )
}

// The set: from the setter's hands, up, down onto the hitting point at T.hit (and past it)
function onSet(t: number, out: Vector3) {
  const u = t / T.hit
  out.lerpVectors(SETTER_HANDS, HIT, u)
  out.y += SET_ARC * 4 * u * (1 - u)
  return out
}

// ---------- the game's state, changed only inside the frame loop ----------

type Game = {
  phase: 'intro' | 'play' | 'flight' | 'result'
  attempt: number
  auto: boolean // the last ball: Mert takes it himself
  open: Side // the side the block leaves open
  t: number // game time of this ball
  wait: number // real seconds left of the intro / the result
  freeze: number // real seconds of hit-stop left
  swingAt: number | null // game time of the swing
  result: Outcome | null
  flight: Segment[]
  seg: number
  segT: number
  celebrate: boolean
  ringShown: boolean
  trauma: number // camera shake, 0–1 (shake = trauma²)
  kick: number // the camera's zoom punch, 0–1
  last: { real: number; t: number; speed: number } // the previous frame (to place a swing in time)
  burst: { age: number; size: number }
  wave: number
  dust: number
  trail: Vector3[]
}

const newSide = (): Side => (Math.random() < 0.5 ? -1 : 1)

function createGame(calm: boolean): Game {
  return {
    phase: calm ? 'play' : 'intro',
    attempt: 0,
    auto: false,
    open: newSide(),
    t: calm ? T.hit : 0, // less motion: everything waits at the moment of the swing
    wait: 1.3,
    freeze: 0,
    swingAt: null,
    result: null,
    flight: [],
    seg: 0,
    segT: 0,
    celebrate: false,
    ringShown: false,
    trauma: 0,
    kick: 0,
    last: { real: 0, t: 0, speed: 1 },
    burst: { age: 9, size: 1 },
    wave: 9,
    dust: 9,
    trail: Array.from({ length: 8 }, () => v(0, -10, 0)),
  }
}

// Smooth noise for the camera shake: a few sines, different per axis
const wobble = (t: number, seed: number) =>
  Math.sin(t * 1.0 + seed * 12.9) * 0.6 +
  Math.sin(t * 2.3 + seed * 4.1) * 0.3 +
  Math.sin(t * 5.7 + seed * 7.7) * 0.1

const DUST = 12
const scratch = v(0, 0, 0)
const ahead = v(0, 0, 0)
const UP = v(0, 1, 0)
const turn = new Quaternion()

type Props = {
  calm: boolean
  take: () => Press | undefined // the first swing since the last frame (the rest are dropped)
  onEvent: (e: GameEvent) => void
}

export const SpikeGame = memo(function SpikeGame({ calm, take, onEvent }: Props) {
  const game = useRef<Game | null>(null)
  const emit = useRef(onEvent)
  useEffect(() => {
    emit.current = onEvent
  })

  const mert = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const leftArm = useRef<Group>(null)
  const ball = useRef<Group>(null)
  const ballBody = useRef<Group>(null)
  const blockers = useRef<(Group | null)[]>([])
  const mates = useRef<(Group | null)[]>([])
  const ring = useRef<Mesh>(null)
  const zone = useRef<Mesh>(null)
  const burst = useRef<Mesh>(null)
  const wave = useRef<Mesh>(null)
  const dust = useRef<(Mesh | null)[]>([])
  const trail = useRef<(Mesh | null)[]>([])
  const look = useRef(LOOK_FROM.clone())
  // the shadows of the ones who jump stay on the floor, smaller and fainter the higher they go
  const shadows = useRef<(Mesh | null)[]>([])
  const dustV = useMemo(
    () =>
      Array.from({ length: DUST }, (_, i) => {
        const a = (i / DUST) * Math.PI * 2
        return v(Math.cos(a) * 1.6, 2.2 + (i % 3) * 0.8, Math.sin(a) * 1.6)
      }),
    [],
  )
  const dustFrom = useRef(v(0, 0, 0))

  // the impact star: a flat ten-pointed burst, always facing the camera
  const star = useMemo(() => {
    const s = new Shape()
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * Math.PI * 2
      const r = i % 2 ? 0.42 : 1
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    return new ShapeGeometry(s)
  }, [])
  useEffect(() => () => star.dispose(), [star])

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera
    const g = (game.current ??= createGame(calm))
    const now = performance.now()
    const dt = Math.min(delta, 0.05)

    // ---------- 1. the story of this ball ----------
    const swing = (tSwing: number, aim: Side) => {
      const offset = offsetMs(tSwing)
      const grade = calm ? 'perfect' : gradeSwing(offset, g.attempt)
      // less motion: any swing scores, to the side asked for (a perfect one beats the block)
      const result = g.auto ? 'kill' : outcomeOf(grade, aim, g.open)
      g.swingAt = Math.min(g.t, tSwing) - 0.035 // the arm already at the ball in the freeze
      g.result = result
      g.celebrate = isPoint(result)
      onSet(Math.min(g.t, lastChance(g.attempt)), scratch)
      g.flight = flightFor(result, scratch.clone(), g.open)
      g.seg = 0
      g.segT = 0
      g.phase = 'flight'
      g.trail.forEach((p) => p.copy(scratch))
      if (!calm) {
        g.freeze = grade === 'perfect' ? 0.13 : 0.08 // hit-stop
        g.trauma = Math.min(1, g.trauma + (grade === 'perfect' ? 0.45 : 0.3))
        g.kick = 1
        g.burst = { age: 0, size: grade === 'perfect' ? 1.25 : 0.9 }
        burst.current?.position.copy(scratch)
      } else {
        // straight to the end: the ball on the floor, Mert landed
        const last = g.flight[0]
        g.flight = [{ ...last, from: last.to, dur: 0.001 }]
        g.t = T.landing + 0.2
      }
      return grade
    }

    if (g.phase === 'intro') {
      take()
      g.wait -= dt
      if (g.wait <= 0) {
        g.phase = 'play'
        emit.current({ type: 'play', attempt: 0, auto: false })
      }
    } else if (g.phase === 'play') {
      if (!g.ringShown && (calm || g.t >= T.ring)) {
        g.ringShown = true
        emit.current({ type: 'ring' })
      }
      if (g.auto && g.t >= T.hit) {
        take()
        swing(T.hit, g.open)
      } else {
        // a swing counts from the moment the ring shows; earlier presses are dropped
        const press = take()
        if (press && !g.auto && g.ringShown) {
          const since = (press.time - g.last.real) / 1000
          const tPress = calm ? T.hit : clamp(g.last.t + since * g.last.speed, 0, g.t)
          let aim: Side = g.open
          if (press.screen !== null) {
            // which side of the court is on that side of the screen (from the camera)
            const right = scratch.copy(TARGETS[1]).project(camera).x
            const left = ahead.copy(TARGETS[-1]).project(camera).x
            const screenRight: Side = right > left ? 1 : -1
            aim = (press.screen > 0 ? screenRight : -screenRight) as Side
          }
          const grade = swing(tPress, aim)
          if (calm) emit.current({ type: 'result', outcome: g.result!, grade })
          else g.flight[0].grade = grade
        } else if (!calm && g.t > lastChance(g.attempt) + 0.04) {
          // no swing in time: the ball drops
          g.result = 'miss'
          g.celebrate = false
          onSet(g.t, scratch)
          g.flight = flightFor('miss', scratch.clone(), g.open)
          g.seg = 0
          g.segT = 0
          g.phase = 'flight'
        }
      }
    } else {
      take()
    }

    // game time: frozen in the hit-stop, slow before the swing, normal after it
    const speed = calm && g.phase === 'play' ? 0 : g.swingAt === null ? speedAt(g.t) : 1
    if (g.freeze > 0) g.freeze -= dt
    else if (g.phase !== 'intro') g.t += dt * speed
    g.last = { real: now, t: g.t, speed }

    // ---------- 2. the ball ----------
    const b = ball.current
    let fast = false
    if (b) {
      if (g.phase === 'intro') b.position.copy(SETTER_HANDS)
      else if (g.phase === 'play') onSet(calm ? T.hit : g.t, b.position)
      else if (g.phase === 'flight' && g.freeze <= 0) {
        const s = g.flight[g.seg]
        g.segT += dt
        const p = Math.min(1, g.segT / s.dur)
        onCurve(s, p, b.position)
        fast = !!s.fast
        if (p >= 1) {
          // what it hit
          if (s.hit === 'floor') {
            g.wave = 0
            g.dust = 0
            dustFrom.current.copy(s.to)
            wave.current?.position.set(s.to.x, 0.04, s.to.z)
            if (!calm) g.trauma = Math.min(1, g.trauma + (g.celebrate ? 0.55 : 0.2))
          } else if (s.hit === 'hands' && !calm) {
            g.burst = { age: 0, size: 0.6 }
            burst.current?.position.copy(s.to)
            g.trauma = Math.min(1, g.trauma + 0.25)
          } else if (s.hit === 'net' && !calm) g.trauma = Math.min(1, g.trauma + 0.12)
          if (g.seg === 0 && g.result) {
            emit.current({ type: 'result', outcome: g.result, grade: s.grade ?? null })
          }
          g.seg++
          g.segT = 0
          if (g.seg >= g.flight.length) {
            g.phase = 'result'
            g.wait = g.celebrate ? 0.9 : 1.1
            if (calm) g.wait = 1.8
          }
        }
      } else if (g.phase === 'flight') {
        // the hit-stop: the ball shivers on the hand, less and less
        const k = 0.03 * (g.freeze / 0.13)
        b.position.x += (Math.random() - 0.5) * k
        b.position.y += (Math.random() - 0.5) * k
      }
      // spinning in the air; stretched along its path when it flies fast
      const body = ballBody.current
      if (body) {
        if (g.phase === 'flight' && g.freeze <= 0) body.rotation.z -= dt * 18
        if (fast) {
          const s = g.flight[g.seg] ?? g.flight[g.flight.length - 1]
          ahead.copy(s.to).sub(s.from).normalize()
          turn.setFromUnitVectors(UP, ahead)
          b.quaternion.copy(turn)
          b.scale.set(0.8, 1.35, 0.8)
        } else {
          b.quaternion.identity()
          b.scale.setScalar(1)
        }
      }
      // the trail: where the ball was, fading
      if (g.phase === 'flight' && g.freeze <= 0) {
        g.trail.pop()
        g.trail.unshift(b.position.clone())
      }
      trail.current.forEach((m, i) => {
        if (!m) return
        m.visible = g.phase === 'flight' && fast && !calm
        m.position.copy(g.trail[i])
        m.scale.setScalar(1 - i * 0.1)
        ;(m.material as MeshBasicMaterial).opacity = 0.45 * (1 - i / g.trail.length)
      })
    }

    // ---------- 3. the result, then the next ball or the end ----------
    if (g.phase === 'result') {
      g.wait -= dt
      if (g.wait <= 0) {
        if (g.celebrate) {
          g.wait = 99
          emit.current({ type: 'done' })
        } else {
          g.attempt++
          g.auto = g.attempt >= ATTEMPTS
          g.open = newSide()
          g.t = 0
          g.swingAt = null
          g.result = null
          g.flight = []
          g.ringShown = false
          g.phase = 'play'
          emit.current({ type: 'play', attempt: g.attempt, auto: g.auto })
        }
      }
    }

    // ---------- 4. Mert: run-up, plant, jump, swing, land ----------
    const t = g.t
    const m = mert.current
    if (m) {
      const run = smoothstep(t, T.approach, 1.0)
      let y = 0
      let squash = 1
      if (t > T.approach && t < 1.0) y = 0.06 * Math.abs(Math.sin(run * Math.PI * 3))
      if (t >= 1.0 && t < T.takeoff) squash = 0.88 // the plant: down before up
      if (t >= T.takeoff && t < T.landing)
        y = JUMP * Math.sin((Math.PI * (t - T.takeoff)) / (T.landing - T.takeoff))
      if (t >= T.landing && t < T.landing + 0.12) squash = 0.92
      if (g.celebrate && t > T.landing + 0.15) y = 0.22 * Math.abs(Math.sin((t - T.landing) * 7))
      m.position.set(lerp(MERT_FROM.x, MERT_AT.x, run), y, lerp(MERT_FROM.z, MERT_AT.z, run))
      m.scale.set(1, squash, 1)

      // arms turn at the shoulder: + swings back, − forward and up
      let r = lerp(0.25, 1.2, smoothstep(t, 0.7, 1.0)) // both swing back for the jump
      let l = r
      let roll = 0.12
      if (t >= T.takeoff) {
        const up = smoothstep(t, T.takeoff, T.takeoff + 0.12)
        l = lerp(1.2, -2.7, up) // the left hand points at the ball
        r = lerp(1.2, -3.75, up) // the right arm cocked behind the head
        roll = 0.3
      }
      if (g.swingAt !== null) {
        const s = t - g.swingAt
        r = lerp(-3.75, -1.0, smoothstep(s, 0, 0.09)) // the whip
        r = lerp(r, -0.4, smoothstep(s, 0.09, 0.35)) // follow-through
        l = lerp(-2.7, -0.6, smoothstep(s, 0, 0.2))
      }
      if (t >= T.landing + 0.1) {
        if (g.celebrate) {
          r = l = -2.9
          roll = 0.45
        } else {
          const down = smoothstep(t, T.landing, T.landing + 0.35)
          r = lerp(r, 0.15, down)
          l = lerp(l, 0.15, down)
        }
      }
      rightArm.current?.rotation.set(r, 0, -roll)
      leftArm.current?.rotation.set(l, 0, roll)
    }

    // the block: slides to the side it covers, jumps with Mert
    const covered = -g.open
    blockers.current.forEach((p, i) => {
      if (!p) return
      const slide = smoothstep(t, T.blockers, 1.0)
      const from = i === 0 ? HIT.z - 0.55 : HIT.z + 0.55
      const to = HIT.z + covered * (i === 0 ? 0.25 : 1.15)
      const jumpT = (t - 1.2) / 0.62
      p.position.z = lerp(from, to, slide)
      p.position.y = jumpT > 0 && jumpT < 1 ? BLOCK_JUMP * Math.sin(Math.PI * jumpT) : 0
    })
    // shadows of the jumpers: under them on the floor, smaller and fainter the higher they are
    ;[m, ...blockers.current].forEach((who, i) => {
      const sh = shadows.current[i]
      if (!who || !sh) return
      const lift = Math.max(0, who.position.y)
      sh.position.set(who.position.x, 0.03, who.position.z)
      sh.scale.setScalar(1 - lift * 0.35)
      ;(sh.material as MeshBasicMaterial).opacity = 0.5 * (1 - lift * 0.55)
    })

    // team-mates jump for joy
    mates.current.forEach((p, i) => {
      if (!p) return
      p.position.y =
        g.celebrate && t > T.landing + 0.1 ? 0.3 * Math.abs(Math.sin((t - T.landing) * 6 + i)) : 0
    })

    // ---------- 5. the hints: the closing ring, the open side ----------
    const rg = ring.current
    if (rg) {
      const showing = g.phase === 'play' && g.ringShown && !g.auto
      rg.visible = showing
      if (showing && b) {
        rg.position.copy(b.position)
        rg.quaternion.copy(camera.quaternion)
        const p = calm ? 1 : clamp((t - T.ring) / (T.hit - T.ring), 0, 1)
        rg.scale.setScalar(lerp(2.6, 0.17, p))
        const w = WINDOWS[Math.min(g.attempt, ATTEMPTS - 1)]
        const inWindow = calm || Math.abs(offsetMs(t)) <= w.good
        const mat = rg.material as MeshBasicMaterial
        mat.color.set(inWindow ? '#ffffff' : COLORS.accent)
        mat.opacity = t > T.hit && !calm ? clamp(1 - (t - T.hit) / 0.1, 0.2, 1) : 0.95
      }
    }
    const zn = zone.current
    if (zn) {
      zn.visible =
        (g.phase === 'play' && (calm || t > 0.8)) || (g.phase === 'flight' && g.seg === 0)
      zn.position.set(TARGETS[g.open].x, 0.035, TARGETS[g.open].z)
      ;(zn.material as MeshBasicMaterial).opacity = calm ? 0.32 : 0.26 + 0.1 * Math.sin(now * 0.008)
    }

    // ---------- 6. impact effects ----------
    const bs = burst.current
    if (bs) {
      g.burst.age += g.freeze > 0 ? dt * 0.35 : dt
      const a = g.burst.age / 0.22
      bs.visible = a < 1
      if (a < 1) {
        bs.quaternion.copy(camera.quaternion)
        bs.rotateZ(a * 0.6)
        bs.scale.setScalar(g.burst.size * (0.25 + a * 0.9))
        ;(bs.material as MeshBasicMaterial).opacity = 1 - a ** 4 // bright for most of its life, then gone
      }
    }
    const wv = wave.current
    if (wv) {
      g.wave += dt
      const a = g.wave / 0.5
      wv.visible = a < 1 && !calm
      wv.scale.setScalar(0.3 + a * 2.4)
      ;(wv.material as MeshBasicMaterial).opacity = 0.85 * (1 - a)
    }
    g.dust += dt
    dust.current.forEach((d, i) => {
      if (!d) return
      const s = g.dust
      d.visible = s < 0.7 && !calm
      if (!d.visible) return
      const vel = dustV[i]
      d.position.set(
        dustFrom.current.x + vel.x * s,
        Math.max(0.03, dustFrom.current.y + vel.y * s - 4.9 * s * s),
        dustFrom.current.z + vel.z * s,
      )
      d.scale.setScalar(1 - s / 0.7)
    })

    // ---------- 7. the camera ----------
    const close = smoothstep(t, 0, T.hit)
    const pos = scratch
    let fov = speed < 1 && g.swingAt === null ? 33 : 38
    if (g.phase === 'intro' || g.phase === 'play') {
      pos.lerpVectors(CAM_FROM, CAM_CLOSE, calm ? 1 : close)
      ahead.lerpVectors(LOOK_FROM, LOOK_CLOSE, calm ? 1 : close)
    } else if (g.celebrate && (g.seg > 0 || g.phase === 'result')) {
      pos.copy(CAM_WIDE)
      ahead.copy(LOOK_WIDE)
      fov = 42
    } else {
      pos.copy(CAM_CLOSE)
      ahead.lerpVectors(LOOK_CLOSE, b ? b.position : LOOK_CLOSE, 0.45)
    }
    // a phone held upright sees less of the court sideways: step back, open the lens
    if (state.size.width < state.size.height) {
      pos.sub(ahead).multiplyScalar(1.3).add(ahead)
      fov += 14
    }
    const k = calm ? 1 : 1 - Math.exp(-dt * 2.8)
    camera.position.lerp(pos, k)
    look.current.lerp(ahead, k)
    camera.lookAt(look.current)
    if (!calm) {
      const shake = g.trauma * g.trauma
      const s = now / 1000
      camera.rotation.x += 0.045 * shake * wobble(s * 23, 1)
      camera.rotation.y += 0.045 * shake * wobble(s * 21, 2)
      camera.rotation.z += 0.03 * shake * wobble(s * 19, 3)
      g.trauma = Math.max(0, g.trauma - dt * 1.5)
      g.kick = Math.max(0, g.kick - dt * 5)
    }
    camera.fov = lerp(camera.fov, fov, calm ? 1 : 1 - Math.exp(-dt * 4)) - g.kick * 0.9
    camera.updateProjectionMatrix()
  })

  return (
    <>
      <Arena />
      <group ref={mert} position={MERT_FROM} rotation-y={Math.PI / 2}>
        <Mert3D kit rightArm={rightArm} leftArm={leftArm} shadow={false} />
      </group>
      {[0, 1, 2].map((i) => (
        <FloorShadow
          key={i}
          ref={(sh: Mesh | null) => void (shadows.current[i] = sh)}
          size={1.15}
        />
      ))}
      {/* our side: the setter by the net, two behind */}
      <Player color={COLORS.team} position={[-0.65, 0, 1.75]} rotation-y={-Math.PI / 2} />
      {/* (kept out of the camera's way: one far left, one off to the right — a player right in
          front of the lens filled a corner of the screen with a head) */}
      {[
        [-6.4, -2.6],
        [-3.4, 3.4],
      ].map(([x, z], i) => (
        <group key={i} ref={(g) => void (mates.current[i] = g)} position={[x, 0, z]}>
          <Player color={COLORS.team} rotation-y={Math.PI / 2} />
        </group>
      ))}
      {/* the other team: two blockers at the net, two behind */}
      {[0, 1].map((i) => (
        <group key={i} ref={(g) => void (blockers.current[i] = g)} position={[0.75, 0, 0]}>
          <Player color="#e6edf5" block shadow={false} rotation-y={-Math.PI / 2} />
        </group>
      ))}
      <Player color="#e6edf5" position={[5.2, 0, -2.6]} rotation-y={-Math.PI / 2} />
      <Player color="#e6edf5" position={[5.8, 0, 2.4]} rotation-y={-Math.PI / 2} />

      <group ref={ball} position={SETTER_HANDS}>
        <group ref={ballBody}>
          <Ball />
        </group>
      </group>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} ref={(m) => void (trail.current[i] = m)} visible={false}>
          <sphereGeometry args={[0.11, 10, 8]} />
          <meshBasicMaterial
            color={COLORS.accent}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* the ring that closes on the ball: swing when it meets it */}
      <mesh ref={ring} visible={false} renderOrder={10}>
        <ringGeometry args={[0.86, 1, 48]} />
        <meshBasicMaterial
          color={COLORS.accent}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* the open side, glowing softly on the other team's floor */}
      <mesh ref={zone} rotation-x={-Math.PI / 2} visible={false}>
        <planeGeometry args={[3.4, 3]} />
        <meshBasicMaterial
          color={COLORS.accent}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* the impact: a star where the hand meets the ball, a ring and dust where it lands */}
      <mesh ref={burst} geometry={star} visible={false} renderOrder={11}>
        <meshBasicMaterial
          color="#fff3b0"
          blending={AdditiveBlending}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={wave} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.55, 0.7, 40]} />
        <meshBasicMaterial color="#fff6c8" transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {Array.from({ length: DUST }, (_, i) => (
        <mesh key={i} ref={(m) => void (dust.current[i] = m)} visible={false}>
          <boxGeometry args={[0.07, 0.07, 0.07]} />
          <meshBasicMaterial color="#f6d3b0" />
        </mesh>
      ))}

      <spotLight position={[-2, 10, 2]} angle={0.4} penumbra={0.5} intensity={140} distance={22} />
    </>
  )
})
