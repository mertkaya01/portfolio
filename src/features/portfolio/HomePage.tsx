import { lazy, Suspense, useEffect, useRef } from 'react'

import { isQuestOpen } from '@/app/experienceMachine'
import { useExperience } from '@/app/experienceStore'
import { Landing } from '@/features/landing/Landing'
import { QUEST_ENABLED } from '@/config/features'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useContent, useT } from '@/i18n'

import { PortfolioPage } from './PortfolioPage'

// The quest's stage is its own file, downloaded only when the quest opens
const QuestStage = lazy(() =>
  import('@/quest/engine/QuestStage').then((m) => ({ default: m.QuestStage })),
)

// Jump straight to the player card, without the smooth scroll
const jumpToPortfolio = () =>
  document.getElementById('about')?.scrollIntoView({ behavior: 'instant', block: 'start' })

// "/" — the landing and the portfolio below it, plus the quest stage on top while it is played.
export function HomePage() {
  const t = useT()
  const { profile } = useContent()
  useDocumentTitle(t.meta.title(profile.name))
  const state = useExperience((s) => s.state)
  const name = state.name

  // (Coming back in the same tab: the router's ScrollRestoration returns you to where you were,
  // and since the quest is already "seen", Skip on the landing just scrolls down.)

  const previous = useRef(name)
  useEffect(() => {
    // The transition covers the screen for a moment: put the portfolio in place behind it,
    // so the stage fades away straight onto the player card
    if (name === 'TRANSITION') jumpToPortfolio()

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
        <Suspense fallback={null}>
          <QuestStage />
        </Suspense>
      )}
    </>
  )
}
