import { useEffect } from 'react'
import { create } from 'zustand'

// The quest's clock, as the scenes see it.
// - A scene the visitor plays with can hold the clock: while the suitcase is still in Istanbul,
//   or a photo is open, the quest doesn't move on by itself (Next always works).
// - Scenes can ask whether the quest is playing by itself or paused (a scene that shows its
//   trick on its own when nobody plays only does so while the quest plays).
type QuestClock = {
  holds: string[]
  playing: boolean
  hold: (key: string, on: boolean) => void
  setPlaying: (playing: boolean) => void
}

export const useQuestClock = create<QuestClock>((set) => ({
  holds: [],
  playing: true,
  hold: (key, on) =>
    set((s) => ({
      holds: on
        ? s.holds.includes(key)
          ? s.holds
          : [...s.holds, key]
        : s.holds.filter((k) => k !== key),
    })),
  setPlaying: (playing) => set({ playing }),
}))

// Hold the clock while `on` (and let go when the scene goes away)
export function useHoldClock(key: string, on: boolean) {
  const hold = useQuestClock((s) => s.hold)
  useEffect(() => {
    if (!on) return
    hold(key, true)
    return () => hold(key, false)
  }, [hold, key, on])
}
