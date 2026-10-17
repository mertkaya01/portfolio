import { useEffect } from 'react'

import { useExperience } from '@/app/experienceStore'
import { handlesOwnKeys, hasModifier } from '@/lib/keyboard'

const NEXT_KEYS = new Set(['Enter', 'ArrowRight', 'PageDown', ' '])
const PREV_KEYS = new Set(['ArrowLeft', 'Backspace', 'PageUp'])
const SKIP_KEYS = new Set(['Escape', 's', 'S'])

// The quest's keyboard: → / Enter / Space next · ← back · Esc / S skip.
// In the finale, Space / Enter spike.
export function useQuestInput() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (hasModifier(e)) return
      // Read the store at the moment of the key press, so the listener is set up only once
      const { state, send } = useExperience.getState()

      if (SKIP_KEYS.has(e.key)) {
        // For Esc this also stops the browser from closing the dialog on its own
        e.preventDefault()
        if (!e.repeat) send({ type: 'SKIP' })
        return
      }

      const next = NEXT_KEYS.has(e.key)
      if (!next && !PREV_KEYS.has(e.key)) return
      // A focused button (Back, Next, Spike…) handles its own Enter / Space — don't do it twice
      if ((e.key === 'Enter' || e.key === ' ') && handlesOwnKeys(e.target)) return

      e.preventDefault() // no page scroll on Space / PageDown
      // Holding a key down repeats it many times a second: one press = one step
      if (e.repeat) return

      if (!next) send({ type: 'PREV' })
      else if (state.name !== 'FINALE') send({ type: 'NEXT' })
      // Match point: only Space / Enter take the swing — mashing → shouldn't
      else if (e.key === ' ' || e.key === 'Enter') send({ type: 'SPIKE' })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
