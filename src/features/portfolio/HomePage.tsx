import { Suspense, use, useEffect, useRef, type ReactElement } from 'react'

import { isQuestOpen } from '@/app/experienceMachine'
import { useExperience } from '@/app/experienceStore'
import { Landing } from '@/features/landing/Landing'
import { QUEST_ENABLED } from '@/config/features'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useContent, useT } from '@/i18n'

import { PortfolioPage } from './PortfolioPage'

// The quest's stage is its own file. It is fetched while the landing sits idle, so it is
// usually already there when Start or Skip is pressed (calling this again reuses the download).
// The download marks itself done (status / value, which React's use() reads), so a stage that
// is already here renders at once — React.lazy would still suspend for a moment, and then hold
// its fallback for ~300 ms.
let questStage: Promise<ReactElement> | undefined

function loadQuestStage() {
  if (!questStage) {
    const download = import('@/quest/engine/QuestStage').then((m) => <m.QuestStage />)
    download.then(
      (stage) => Object.assign(download, { status: 'fulfilled', value: stage }),
      () => (questStage = undefined), // failed (offline?): the next try downloads it again
    )
    questStage = download
  }
  return questStage
}

// The stage, waiting (Suspense) only if it hasn't been downloaded yet
function QuestStage() {
  return use(loadQuestStage())
}

// Skip pressed before the stage has arrived: the screen goes dark at once, the way the
// transition starts, and the page stays where it is until the transition itself takes over
const transitionCover = (
  <div aria-hidden="true" data-transition-cover className="fixed inset-0 z-50 bg-night" />
)

// "/" — the landing and the portfolio below it, plus the quest stage on top while it is played.
export function HomePage() {
  const t = useT()
  const { profile } = useContent()
  useDocumentTitle(t.meta.title(profile.name))
  const state = useExperience((s) => s.state)
  const name = state.name

  // (Coming back in the same tab: the router's ScrollRestoration returns you to where you were,
  // and since the quest is already "seen", Skip on the landing just scrolls down.)

  // Fetch the stage once the landing is on screen and the browser has nothing else to do
  useEffect(() => {
    if (!QUEST_ENABLED || useExperience.getState().state.name !== 'LANDING') return
    const preload = () => void loadQuestStage()
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(preload, { timeout: 2500 })
      return () => cancelIdleCallback(id)
    }
    const timer = window.setTimeout(preload, 1200) // Safari has no requestIdleCallback
    return () => window.clearTimeout(timer)
  }, [])

  // (The jump down to the portfolio happens inside the transition, once its dark cover is on
  // screen — so the page never visibly moves before the animation.)
  const previous = useRef(name)
  useEffect(() => {
    // When the stage is gone, move keyboard focus to the player card section, so Tab and
    // screen readers continue from there instead of the landing
    if (previous.current === 'TRANSITION' && name === 'PORTFOLIO') {
      document.getElementById('about')?.focus({ preventScroll: true })
    }
    previous.current = name
  }, [name])

  return (
    <>
      <Landing />
      <PortfolioPage />
      {QUEST_ENABLED && isQuestOpen(state) && (
        <Suspense fallback={name === 'TRANSITION' ? transitionCover : null}>
          <QuestStage />
        </Suspense>
      )}
    </>
  )
}
