// The rules of the quest, as one pure function: (current state, event) → next state.
// No React, no timers, no DOM — so it is easy to test, and nobody can get stuck:
// an event that a state does not expect simply leaves the state unchanged.
//
//   LANDING ──START──► QUEST(set 1, beat 1) ─NEXT─► … ─NEXT─► FINALE ──SPIKE──► TRANSITION(spike)
//      │                    │  ▲ PREV                     │                          │
//      └──SKIP──┐           └──┴───────SKIP───────────────┴──SKIP──► TRANSITION(skip) ─DONE─► PORTFOLIO
//               └──────────────────────────────────────────────────►┘
//
// Project pages are routes (/projects/…), not states: the router already owns them.

export type ExperienceState =
  | { name: 'LANDING' }
  | { name: 'QUEST'; chapter: number; beat: number } // which set, which line inside it (0-based)
  | { name: 'FINALE' } // match point: the spike
  | { name: 'TRANSITION'; kind: 'skip' | 'spike' } // the short animation into the portfolio
  | { name: 'PORTFOLIO' }

export type ExperienceEvent =
  | { type: 'START' } // Enter on the landing, or "Replay the quest"
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SKIP' }
  | { type: 'SPIKE' }
  | { type: 'TRANSITION_DONE' }

// The only thing the rules need to know about the content: how many beats each chapter has
export type QuestShape = readonly number[]

export function transition(
  state: ExperienceState,
  event: ExperienceEvent,
  shape: QuestShape,
): ExperienceState {
  const lastChapter = shape.length - 1
  const beatsIn = (chapter: number) => Math.max(1, shape[chapter] ?? 1)

  switch (state.name) {
    case 'LANDING':
      if (event.type === 'START') return { name: 'QUEST', chapter: 0, beat: 0 }
      if (event.type === 'SKIP') return { name: 'TRANSITION', kind: 'skip' }
      return state

    case 'QUEST': {
      const { chapter, beat } = state
      switch (event.type) {
        case 'NEXT':
          if (beat < beatsIn(chapter) - 1) return { name: 'QUEST', chapter, beat: beat + 1 }
          if (chapter < lastChapter) return { name: 'QUEST', chapter: chapter + 1, beat: 0 }
          return { name: 'FINALE' }
        case 'PREV':
          if (beat > 0) return { name: 'QUEST', chapter, beat: beat - 1 }
          if (chapter > 0) {
            return { name: 'QUEST', chapter: chapter - 1, beat: beatsIn(chapter - 1) - 1 }
          }
          return { name: 'LANDING' }
        case 'SKIP':
          return { name: 'TRANSITION', kind: 'skip' }
        default:
          return state
      }
    }

    case 'FINALE':
      if (event.type === 'SPIKE') return { name: 'TRANSITION', kind: 'spike' }
      if (event.type === 'SKIP') return { name: 'TRANSITION', kind: 'skip' }
      if (event.type === 'PREV') {
        return { name: 'QUEST', chapter: lastChapter, beat: beatsIn(lastChapter) - 1 }
      }
      return state

    case 'TRANSITION':
      // a second Skip during the animation cuts it short
      if (event.type === 'TRANSITION_DONE' || event.type === 'SKIP') return { name: 'PORTFOLIO' }
      return state

    case 'PORTFOLIO':
      if (event.type === 'START') return { name: 'QUEST', chapter: 0, beat: 0 } // replay
      return state
  }
}

// The quest covers the page (full-screen stage) in these states
export const isQuestOpen = (state: ExperienceState) =>
  state.name === 'QUEST' || state.name === 'FINALE' || state.name === 'TRANSITION'
