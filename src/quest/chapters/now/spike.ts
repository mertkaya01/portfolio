// The spike at match point, as a small timing game — the rules, with no drawing in them.
//
// The setter puts the ball up; Mert runs in and jumps; as the ball reaches the point where he
// hits it, time slows down and a ring closes on the ball. The visitor swings (Space, a click or
// a tap) when the ring closes, and aims left or right — the block covers one side.
// - On time and to the open side: a kill. On time to the blocked side: blocked — unless the
//   timing was perfect, then the ball goes off the hands and out (still a point).
// - Too early: long, out. Too late: into the net. No swing at all: the ball drops.
// - A miss only means one more ball, with a wider window. After the second miss Mert takes the
//   ball himself: nobody is ever stuck at match point.

export type Side = -1 | 1 // where on the court (z): -1 / +1, the two halves the block can cover
export type Grade = 'perfect' | 'good' | 'early' | 'late'
export type Outcome = 'kill' | 'blockout' | 'blocked' | 'net' | 'out' | 'miss'

// The timeline of one ball, in game seconds (game time runs slower in the slow-motion stretch)
export const T = {
  approach: 0.25, // Mert starts his run-up
  blockers: 0.45, // the blockers start moving to the side they will cover
  takeoff: 1.12, // Mert jumps
  ring: 0.9, // the timing ring appears around the ball
  slowFrom: 1.08, // time slows down from here …
  hit: 1.5, // … the ball is at the hitting point: the ideal moment to swing
  slowTo: 1.62, // … until here (or until the swing)
  landing: 1.85, // Mert is back on the floor
}
export const SLOW = 0.3 // game speed in slow motion

// How far from the ideal moment a swing may be, in ms of real time, per attempt
export const WINDOWS = [
  { perfect: 100, good: 250 },
  { perfect: 160, good: 400 }, // the second ball is easier
]
export const ATTEMPTS = WINDOWS.length // misses before Mert takes the ball himself

// Game speed at a moment of game time (before any swing)
export const speedAt = (t: number) => (t >= T.slowFrom && t < T.slowTo ? SLOW : 1)

// Real seconds between two moments of game time, through the slow-motion stretch
export function realBetween(a: number, b: number): number {
  if (b < a) return -realBetween(b, a)
  const slowPart = Math.max(0, Math.min(b, T.slowTo) - Math.max(a, T.slowFrom))
  return b - a - slowPart + slowPart / SLOW
}

// How far a swing at game time `t` is from the ideal moment, in real ms (negative = early)
export const offsetMs = (t: number) => realBetween(T.hit, t) * 1000

// The last game moment a swing still counts on this attempt; after it the ball has dropped
export function lastChance(attempt: number) {
  const w = WINDOWS[Math.min(attempt, ATTEMPTS - 1)]
  // within the slow stretch: real ms → game seconds
  return T.hit + (w.good / 1000) * SLOW
}

export function grade(offset: number, attempt: number): Grade {
  const w = WINDOWS[Math.min(attempt, ATTEMPTS - 1)]
  if (Math.abs(offset) <= w.perfect) return 'perfect'
  if (Math.abs(offset) <= w.good) return 'good'
  return offset < 0 ? 'early' : 'late'
}

export function outcome(g: Grade, aim: Side, open: Side): Outcome {
  if (g === 'early') return 'out'
  if (g === 'late') return 'net'
  if (aim === open) return 'kill'
  return g === 'perfect' ? 'blockout' : 'blocked'
}

export const isPoint = (o: Outcome) => o === 'kill' || o === 'blockout'
