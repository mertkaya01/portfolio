import { AnimatePresence, m, useReducedMotion, type Variants } from 'motion/react'
import { useCallback, useEffect, useRef, type MouseEvent, type SyntheticEvent } from 'react'

import type { ExperienceState } from '@/app/experienceMachine'
import { useExperience } from '@/app/experienceStore'

import { FinalePlaceholder } from '../finale/FinalePlaceholder'

import { questChapters } from './chapters'
import { ControlsBar } from './ControlsBar'
import { ScoreboardHUD } from './ScoreboardHUD'
import { SetScene } from './SetScene'
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

// Moving between sets: the new set slides in from the side you are heading to, the old one
// slides out the other way, both fading. `direction` (1 = Next, -1 = Back) is passed in as
// "custom", so the same variants work both ways. With reduced motion the stage passes 0
// instead: no movement at all, only the fade.
const SLIDE: Variants = {
  enter: (direction: number) => ({ x: `${direction * 6}%`, opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (direction: number) => ({ x: `${direction * -6}%`, opacity: 0 }),
}
const SLIDE_TRANSITION = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } // ease-out-expo

// The full-screen stage the quest is played on. It is a native <dialog> opened as a modal:
// the browser then makes the page behind it inert (no focus, no clicks, hidden from screen
// readers) — a focus trap for free. It stays open through the transition, then disappears.
export function QuestStage() {
  const state = useExperience((s) => s.state)
  const direction = useExperience((s) => s.direction)
  const send = useExperience((s) => s.send)
  // reduced motion: the sets cross-fade in place (0 = no slide)
  const slide = useReducedMotion() ? 0 : direction
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
  const chapterIndex = state.name === 'QUEST' ? state.chapter : -1

  // Download this set's art and the next one's while the visitor reads, so a set never
  // arrives with an empty panel (calling the same import twice costs nothing)
  useEffect(() => {
    if (chapterIndex < 0) return
    questChapters[chapterIndex]?.preload()
    questChapters[chapterIndex + 1]?.preload()
  }, [chapterIndex])

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
              {/* AnimatePresence keeps the leaving set on screen until its exit has played.
                  key = the set: changing lines inside a set doesn't slide, changing sets does.
                  initial={false}: the first set doesn't slide in (the stage fades in instead). */}
              <AnimatePresence initial={false} custom={slide}>
                <m.div
                  key={current?.chapter.id ?? 'finale'}
                  custom={slide}
                  variants={SLIDE}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SLIDE_TRANSITION}
                  // bg-night: while a set fades it is mixed on its own, and the grain inside needs
                  // the dark behind it in that same layer (or it shows as grey noise everywhere)
                  className="absolute inset-0 bg-night"
                >
                  {current ? (
                    <SetScene
                      chapter={current.chapter}
                      beat={state.name === 'QUEST' ? state.beat : 0}
                      Art={current.Art}
                    />
                  ) : (
                    <FinalePlaceholder onSpike={spike} />
                  )}
                </m.div>
              </AnimatePresence>
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
