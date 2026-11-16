import { useEffect, useRef } from 'react'

import { useExperience } from '@/app/experienceStore'
import { handlesOwnKeys, hasModifier } from '@/lib/keyboard'

import { finaleSwing, isSwingKey } from './finaleInput'

const NEXT_KEYS = new Set(['Enter', 'ArrowRight', 'PageDown'])
const PREV_KEYS = new Set(['ArrowLeft', 'Backspace', 'PageUp'])
const SKIP_KEYS = new Set(['Escape', 's', 'S'])
const PLAY_KEYS = new Set(['p', 'P'])

// The quest's keyboard: → / Enter next · ← back · P pause/play · Esc / S skip.
// Space is kept for one thing only: the spike at match point (Space / Enter take the swing).
export function useQuestInput({ onTogglePlay }: { onTogglePlay: () => void }) {
  const togglePlay = useRef(onTogglePlay)
  useEffect(() => {
    togglePlay.current = onTogglePlay
  })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (hasModifier(e)) return
      // while a photo is open over the quest, the keys are the photo's (Esc closes the photo,
      // not the quest) — wherever the focus happens to be
      if (document.querySelector('dialog[data-quest-photo][open]')) return
      // Read the store at the moment of the key press, so the listener is set up only once
      const { state, send } = useExperience.getState()

      if (SKIP_KEYS.has(e.key)) {
        // For Esc this also stops the browser from closing the dialog on its own
        e.preventDefault()
        if (!e.repeat) send({ type: 'SKIP' })
        return
      }
      if (PLAY_KEYS.has(e.key)) {
        if (!e.repeat && state.name === 'QUEST') togglePlay.current()
        return
      }

      // the 3D match point: its own swing keys (← → aim there instead of going back)
      const swingAt = state.name === 'FINALE' ? finaleSwing() : null
      if (swingAt && isSwingKey(e.key)) {
        if ((e.key === 'Enter' || e.key === ' ') && handlesOwnKeys(e.target)) return
        e.preventDefault()
        if (!e.repeat) swingAt(e.key, e.timeStamp)
        return
      }

      const swing = state.name === 'FINALE' && (e.key === ' ' || e.key === 'Enter')
      const next = NEXT_KEYS.has(e.key)
      if (!swing && !next && !PREV_KEYS.has(e.key)) return
      // A focused button (Back, Next, Spike…) handles its own Enter / Space — don't do it twice
      if ((e.key === 'Enter' || e.key === ' ') && handlesOwnKeys(e.target)) return

      e.preventDefault() // no page scroll on Space / PageDown
      // Holding a key down repeats it many times a second: one press = one step
      if (e.repeat) return

      if (swing) send({ type: 'SPIKE' })
      else if (!next) send({ type: 'PREV' })
      // at match point only Space / Enter take the swing — mashing → shouldn't
      else if (state.name !== 'FINALE') send({ type: 'NEXT' })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
