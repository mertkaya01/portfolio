import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type SyntheticEvent,
} from 'react'

import type { ExperienceState } from '@/app/experienceMachine'
import { useExperience } from '@/app/experienceStore'
import { useContent, useT } from '@/i18n'
import type { Messages } from '@/i18n/messages/en'
import type { Chapter } from '@/types/content'

import { FinalePlaceholder } from '../finale/FinalePlaceholder'

import { questChapters } from './chapters'
import { ControlsBar } from './ControlsBar'
import { finaleSwing, isInteractive } from './finaleInput'
import { arrivalFor, SET_LAYER, type Arrival } from './transitions'
import { useQuestClock } from './questClock'
import { ScoreboardHUD } from './ScoreboardHUD'
import { SetScene } from './SetScene'
import { stepDuration, stepOf, stepsIn } from './steps'
import { TransitionView } from './TransitionView'
import { useAutoplay } from './useAutoplay'
import { useQuestInput } from './useQuestInput'
import { useSwipe } from './useSwipe'

// The finale in 3D (with three.js): its own file, loaded near the end of the quest. Until it is
// there — or if it can't load — the simple finale stands in.
const loadFinale = () => import('../chapters/now/Finale3D')
const Finale3D = lazy(loadFinale)

// What a screen reader announces at each step
function announcement(state: ExperienceState, chapters: Chapter[], t: Messages) {
  if (state.name === 'FINALE') return t.quest.announceFinale
  if (state.name !== 'QUEST') return ''
  const chapter = chapters[state.chapter]
  const step = stepOf(chapter, state.beat)
  return step.kind === 'scoreboard'
    ? t.quest.announceSet(chapter.set, chapter.title, chapter.period)
    : step.scene.caption
}

// The full-screen stage the quest is played on. It is a native <dialog> opened as a modal:
// the browser then makes the page behind it inert (no focus, no clicks, hidden from screen
// readers) — a focus trap for free. It stays open through the transition, then disappears.
export function QuestStage() {
  const state = useExperience((s) => s.state)
  const direction = useExperience((s) => s.direction)
  const send = useExperience((s) => s.send)
  const t = useT()
  const { chapters } = useContent() // the sets' text in the current language
  const calm = useReducedMotion() ?? false
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

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

  const current = state.name === 'QUEST' ? questChapters[state.chapter] : undefined
  const chapterIndex = state.name === 'QUEST' ? state.chapter : -1
  const step = state.name === 'QUEST' ? state.beat : 0
  const chapter = chapterIndex >= 0 ? chapters[chapterIndex] : undefined

  // How the set on stage came on (transitions.ts) — worked out the moment the set changes, from
  // the set before it: forwards, each boundary in the style of the set coming in; backwards (or
  // with less motion asked for), a crossfade. The finale counts as one past the last set.
  const setIndex = chapterIndex >= 0 ? chapterIndex : questChapters.length
  const layerKey = current?.id ?? 'finale'
  const [arrival, setArrival] = useState<{ key: string; index: number; kind: Arrival }>({
    key: layerKey,
    index: setIndex,
    kind: 'fade',
  })
  if (arrival.key !== layerKey) {
    setArrival({
      key: layerKey,
      index: setIndex,
      kind: arrivalFor(arrival.index, setIndex, direction, calm),
    })
  }

  // The quest plays by itself: every step stays for its time, then Next
  const stepKey = `${chapterIndex}.${step}`
  const duration = chapter ? stepDuration(stepOf(chapter, step), current?.scoreboardMs) : 0
  // a scene being played with (the suitcase, a photo) holds the clock
  const held = useQuestClock((s) => s.holds.length > 0)
  const autoplay = useAutoplay({
    stepKey,
    duration,
    active: state.name === 'QUEST' && !held,
    onDone: () => send({ type: 'NEXT' }),
  })
  useEffect(() => {
    useQuestClock.getState().setPlaying(autoplay.playing)
  }, [autoplay.playing])
  useQuestInput({ onTogglePlay: autoplay.toggle })

  const swipe = useSwipe((direction) => (direction === 'left' ? next() : prev()))

  // A click or tap anywhere on the scene moves on (in the finale: spikes)
  function onSceneClick(e: MouseEvent) {
    if (swipe.justSwiped() || (e.target as Element).closest('button, a')) return
    if (isInteractive(e.target)) return // the visitor is playing with the scene
    if (window.getSelection()?.toString()) return // the visitor is selecting text
    if (state.name === 'FINALE') {
      // the 3D match point takes its own taps (where you tap is where you aim)
      if (!finaleSwing()) spike()
    } else next()
  }

  // Android's back gesture asks the dialog to close: treat it like Skip
  // (React passes a photo dialog's cancel up its tree to this one too: only our own counts —
  // Esc on an open photo closes the photo, not the quest)
  function onCancel(e: SyntheticEvent) {
    if (e.target !== e.currentTarget) return
    e.preventDefault()
    skip()
  }

  // Download this set's art and the next one's while the visitor reads, so a set never
  // arrives with an empty panel (calling the same import twice costs nothing)
  useEffect(() => {
    if (chapterIndex < 0) return
    questChapters[chapterIndex]?.preload()
    questChapters[chapterIndex + 1]?.preload()
    if (chapterIndex === questChapters.length - 1) void loadFinale() // the finale is next
  }, [chapterIndex])

  return (
    <dialog
      ref={dialogRef}
      aria-label={t.quest.dialog(questChapters.length)}
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
              {/* AnimatePresence keeps the leaving set on stage until its exit has played.
                  key = the set: changing lines inside a set changes nothing here, changing sets
                  plays the hand-over between their styles (transitions.ts).
                  initial={false}: the first set doesn't come in (the stage fades in instead). */}
              <AnimatePresence initial={false} custom={arrival.kind}>
                <m.div
                  key={layerKey}
                  custom={arrival.kind}
                  variants={SET_LAYER}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  // bg-night: while a set fades it is mixed on its own, and the grain inside needs
                  // the dark behind it in that same layer (or it shows as grey noise everywhere)
                  className="absolute inset-0 bg-night"
                >
                  {current && chapter ? (
                    <SetScene
                      chapter={chapter}
                      step={step}
                      Art={current.Art}
                      layout={current.layout}
                      ownScoreboard={current.ownScoreboard}
                      arrival={arrival.kind}
                    />
                  ) : (
                    <Suspense fallback={<FinalePlaceholder onSpike={spike} />}>
                      <Finale3D onSpike={spike} />
                    </Suspense>
                  )}
                </m.div>
              </AnimatePresence>
            </div>

            <ControlsBar
              finale={state.name === 'FINALE'}
              step={step}
              steps={chapter ? stepsIn(chapter) : 0}
              stepKey={stepKey}
              duration={duration}
              playing={autoplay.playing}
              running={autoplay.running}
              onTogglePlay={autoplay.toggle}
              onPrev={prev}
              onNext={next}
            />
          </>
        )}

        <p aria-live="polite" className="sr-only">
          {announcement(state, chapters, t)}
        </p>
      </div>
    </dialog>
  )
}
