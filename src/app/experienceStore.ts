import { create } from 'zustand'

import { QUEST_ENABLED } from '@/config/features'
import { chapters } from '@/data/quest'

import {
  transition,
  type ExperienceEvent,
  type ExperienceState,
  type QuestShape,
} from './experienceMachine'

// What the rules need to know about the content: the number of beats in each chapter
export const QUEST_SHAPE: QuestShape = chapters.map((c) => c.beats.length)

const SEEN_KEY = 'beyond-the-court:quest-seen'

// sessionStorage can be blocked (private mode, strict settings) — never let that break the page
function remember() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* fine: the visitor just sees the landing again next time */
  }
}
function seenThisSession() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

// Where a visit starts:
// - already finished or skipped the quest in this tab → straight to the portfolio
// - arrived with a section link like "/#skills" → the portfolio (that section)
// - otherwise → the landing
function initialState(): ExperienceState {
  // (with the quest switched off, there is nothing to play: straight to the portfolio)
  if (!QUEST_ENABLED || seenThisSession() || window.location.hash) return { name: 'PORTFOLIO' }
  return { name: 'LANDING' }
}

type ExperienceStore = {
  state: ExperienceState
  // Which way the last step went: 1 = forward (Next), -1 = back. The stage uses it to slide
  // the next set in from the right, or the previous one back in from the left.
  direction: 1 | -1
  send: (event: ExperienceEvent) => void
}

// One shared store: any component can read the state or send an event.
// (zustand: a tiny state library — and later the 3D scene can read it every frame
// without re-rendering React.)
export const useExperience = create<ExperienceStore>((set) => ({
  state: initialState(),
  direction: 1,
  send: (event) =>
    set((store) => {
      const next = transition(store.state, event, QUEST_SHAPE)
      if (next === store.state) return store // nothing changed → no re-render
      if (next.name === 'PORTFOLIO') remember()
      return { state: next, direction: event.type === 'PREV' ? -1 : 1 }
    }),
}))
