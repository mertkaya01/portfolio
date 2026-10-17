import { describe, expect, it } from 'vitest'

import {
  isQuestOpen,
  transition,
  type ExperienceEvent,
  type ExperienceState,
} from './experienceMachine'

// A small quest: 3 chapters with 2, 3 and 1 beats
const SHAPE = [2, 3, 1]
const run = (state: ExperienceState, ...types: ExperienceEvent['type'][]) =>
  types.reduce((s, type) => transition(s, { type }, SHAPE), state)

const LANDING: ExperienceState = { name: 'LANDING' }

describe('experience state machine', () => {
  it('starts the quest from the landing at the first beat of the first set', () => {
    expect(run(LANDING, 'START')).toEqual({ name: 'QUEST', chapter: 0, beat: 0 })
  })

  it('walks through every beat of every chapter, then reaches the finale', () => {
    const totalBeats = SHAPE.reduce((a, b) => a + b, 0)
    let state = run(LANDING, 'START')
    const visited = [state]
    for (let i = 1; i < totalBeats; i++) {
      state = run(state, 'NEXT')
      visited.push(state)
    }
    expect(visited.map((s) => (s.name === 'QUEST' ? `${s.chapter}.${s.beat}` : s.name))).toEqual([
      '0.0',
      '0.1',
      '1.0',
      '1.1',
      '1.2',
      '2.0',
    ])
    expect(run(state, 'NEXT')).toEqual({ name: 'FINALE' })
  })

  it('goes back across chapters to the last beat of the previous one', () => {
    expect(run({ name: 'QUEST', chapter: 1, beat: 0 }, 'PREV')).toEqual({
      name: 'QUEST',
      chapter: 0,
      beat: 1,
    })
    expect(run({ name: 'FINALE' }, 'PREV')).toEqual({ name: 'QUEST', chapter: 2, beat: 0 })
  })

  it('goes back to the landing from the very first beat', () => {
    expect(run(LANDING, 'START', 'PREV')).toEqual(LANDING)
  })

  it('a spike at match point leads into the portfolio', () => {
    expect(run({ name: 'FINALE' }, 'SPIKE')).toEqual({ name: 'TRANSITION', kind: 'spike' })
    expect(run({ name: 'FINALE' }, 'SPIKE', 'TRANSITION_DONE')).toEqual({ name: 'PORTFOLIO' })
  })

  it('skip works from every quest state and never gets stuck', () => {
    const states: ExperienceState[] = [
      LANDING,
      { name: 'QUEST', chapter: 1, beat: 2 },
      { name: 'FINALE' },
      { name: 'TRANSITION', kind: 'spike' },
    ]
    for (const state of states) {
      expect(run(state, 'SKIP', 'TRANSITION_DONE')).toEqual({ name: 'PORTFOLIO' })
    }
  })

  it('ignores events a state does not expect (returns the very same object)', () => {
    const quest: ExperienceState = { name: 'QUEST', chapter: 0, beat: 0 }
    expect(transition(quest, { type: 'SPIKE' }, SHAPE)).toBe(quest)
    expect(transition(quest, { type: 'TRANSITION_DONE' }, SHAPE)).toBe(quest)
    const portfolio: ExperienceState = { name: 'PORTFOLIO' }
    expect(transition(portfolio, { type: 'NEXT' }, SHAPE)).toBe(portfolio)
    expect(transition(portfolio, { type: 'SKIP' }, SHAPE)).toBe(portfolio)
  })

  it('the portfolio can replay the quest from the start', () => {
    expect(run({ name: 'PORTFOLIO' }, 'START')).toEqual({ name: 'QUEST', chapter: 0, beat: 0 })
  })

  it('survives 1000 random events and always stays in a valid state', () => {
    const types: ExperienceEvent['type'][] = [
      'START',
      'NEXT',
      'PREV',
      'SKIP',
      'SPIKE',
      'TRANSITION_DONE',
    ]
    let state: ExperienceState = LANDING
    // a fixed pseudo-random sequence, so the test is the same on every run
    let seed = 42
    for (let i = 0; i < 1000; i++) {
      seed = (seed * 16807) % 2147483647
      state = run(state, types[seed % types.length])
      if (state.name === 'QUEST') {
        expect(state.chapter).toBeGreaterThanOrEqual(0)
        expect(state.chapter).toBeLessThan(SHAPE.length)
        expect(state.beat).toBeGreaterThanOrEqual(0)
        expect(state.beat).toBeLessThan(SHAPE[state.chapter])
      }
    }
  })

  it('knows when the quest covers the page', () => {
    expect(isQuestOpen({ name: 'QUEST', chapter: 0, beat: 0 })).toBe(true)
    expect(isQuestOpen({ name: 'FINALE' })).toBe(true)
    expect(isQuestOpen({ name: 'TRANSITION', kind: 'skip' })).toBe(true)
    expect(isQuestOpen(LANDING)).toBe(false)
    expect(isQuestOpen({ name: 'PORTFOLIO' })).toBe(false)
  })
})
