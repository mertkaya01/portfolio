import { useCallback, useEffect, useRef, type MouseEvent, type SyntheticEvent } from 'react'

import type { ExperienceState } from '@/app/experienceMachine'
import { useExperience } from '@/app/experienceStore'

import { FinalePlaceholder } from '../finale/FinalePlaceholder'

import { questChapters } from './chapters'
import { ControlsBar } from './ControlsBar'
import { ScoreboardHUD } from './ScoreboardHUD'
import { TransitionView } from './TransitionView'
import { useQuestInput } from './useQuestInput'
import { useSwipe } from './useSwipe'

// What a screen reader announces at each step
function announcement(state: ExperienceState) {
  if (state.name === 'FINALE') return 'Match point. Press Space, click or tap to spike.'
  if (state.name !== 'QUEST') return ''
  const { chapter } = questChapters[state.chapter]
  const line = chapter.beats[state.beat]
  return state.beat === 0 ? `Set ${chapter.set}, ${chapter.title}. ${line}` : line
}

// The full-screen stage the quest is played on. It is a native <dialog> opened as a modal:
// the browser then makes the page behind it inert (no focus, no clicks, hidden from screen
// readers) — a focus trap for free. It stays open through the transition, then disappears.
export function QuestStage() {
  const state = useExperience((s) => s.state)
  const send = useExperience((s) => s.send)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useQuestInput()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    // Focus the stage itself, not the first button — otherwise Enter would press "Skip"
    stageRef.current?.focus()
    return () => dialog.close()
  }, [])

  // The page behind must not scroll while the quest is played. The lock comes off as soon as
  // the transition starts: the dark stage still covers everything, so the scrollbar comes back
  // (and the page settles at its normal width) unseen — nothing shifts when the stage fades.
  const locked = state.name !== 'TRANSITION'
  useEffect(() => {
    if (!locked) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = ''
    }
  }, [locked])

  const next = () => send({ type: 'NEXT' })
  const prev = () => send({ type: 'PREV' })
  const skip = () => send({ type: 'SKIP' })
  const spike = () => send({ type: 'SPIKE' })
  const transitionDone = useCallback(() => send({ type: 'TRANSITION_DONE' }), [send])

  const swipe = useSwipe((direction) => (direction === 'left' ? next() : prev()))

  // A click or tap anywhere on the scene moves on (in the finale: spikes)
  function onSceneClick(e: MouseEvent) {
    if (swipe.justSwiped() || (e.target as Element).closest('button, a')) return
    if (window.getSelection()?.toString()) return // the visitor is selecting text
    if (state.name === 'FINALE') spike()
    else next()
  }

  // Android's back gesture asks the dialog to close: treat it like Skip
  function onCancel(e: SyntheticEvent) {
    e.preventDefault()
    skip()
  }

  const current = state.name === 'QUEST' ? questChapters[state.chapter] : undefined

  return (
    <dialog
      ref={dialogRef}
      aria-label={`The quest — the story in ${questChapters.length} sets`}
      onCancel={onCancel}
      className="m-0 size-full max-h-none max-w-none overflow-hidden border-0 bg-transparent p-0 text-light backdrop:bg-transparent"
    >
      <div
        ref={stageRef}
        tabIndex={-1}
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
        // stage-in: the dark stage fades in over the (already dark) landing
        className={`relative flex size-full touch-pan-y flex-col overscroll-contain outline-none ${
          state.name === 'TRANSITION' ? '' : 'animate-stage-in bg-night'
        }`}
      >
        {state.name === 'TRANSITION' ? (
          <TransitionView kind={state.kind} onDone={transitionDone} />
        ) : (
          <>
            <ScoreboardHUD state={state} onSkip={skip} />

            <div onClick={onSceneClick} className="relative min-h-0 flex-1 overflow-hidden">
              {current ? (
                // key: a new set mounts a fresh scene, so its entrance plays again
                <current.Scene
                  key={current.chapter.id}
                  chapter={current.chapter}
                  beat={state.name === 'QUEST' ? state.beat : 0}
                />
              ) : (
                <FinalePlaceholder onSpike={spike} />
              )}
            </div>

            <ControlsBar
              finale={state.name === 'FINALE'}
              beat={state.name === 'QUEST' ? state.beat : 0}
              beats={current?.chapter.beats.length ?? 0}
              onPrev={prev}
              onNext={next}
            />
          </>
        )}

        <p aria-live="polite" className="sr-only">
          {announcement(state)}
        </p>
      </div>
    </dialog>
  )
}
