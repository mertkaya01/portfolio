import { describe, expect, it } from 'vitest'

import { SLOW, T, grade, isPoint, lastChance, offsetMs, outcome, realBetween } from './spike'

describe('the spike timing game', () => {
  it('counts real time through the slow-motion stretch', () => {
    expect(realBetween(0, 1)).toBeCloseTo(1) // before the slow stretch: game = real
    expect(realBetween(T.slowFrom, T.hit)).toBeCloseTo((T.hit - T.slowFrom) / SLOW)
    expect(realBetween(T.hit, T.slowFrom)).toBeCloseTo(-(T.hit - T.slowFrom) / SLOW)
  })

  it('measures a swing from the ideal moment in real ms', () => {
    expect(offsetMs(T.hit)).toBeCloseTo(0)
    expect(offsetMs(T.hit + 0.03)).toBeCloseTo(100) // 30 ms of game time in slow motion = 100 ms
    expect(offsetMs(T.hit - 0.03)).toBeCloseTo(-100)
  })

  it('grades a swing, with a wider window on the second ball', () => {
    expect(grade(0, 0)).toBe('perfect')
    expect(grade(-180, 0)).toBe('good')
    expect(grade(-300, 0)).toBe('early')
    expect(grade(300, 0)).toBe('late')
    expect(grade(140, 1)).toBe('perfect')
    expect(grade(350, 1)).toBe('good')
  })

  it('turns timing and aim into what happens to the ball', () => {
    expect(outcome('good', 1, 1)).toBe('kill')
    expect(outcome('good', -1, 1)).toBe('blocked')
    expect(outcome('perfect', -1, 1)).toBe('blockout') // a perfect swing beats the block
    expect(outcome('early', 1, 1)).toBe('out')
    expect(outcome('late', 1, 1)).toBe('net')
    expect(['kill', 'blockout'].every((o) => isPoint(o as never))).toBe(true)
    expect(isPoint('blocked')).toBe(false)
  })

  it('stops waiting once the late window has passed', () => {
    expect(offsetMs(lastChance(0))).toBeCloseTo(250)
    expect(offsetMs(lastChance(1))).toBeCloseTo(400)
  })
})
