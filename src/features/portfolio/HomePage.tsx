import { profile } from '@/data/profile'
import { Landing } from '@/features/landing/Landing'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

import { PortfolioPage } from './PortfolioPage'

// "/" — the landing screen, then the portfolio below it.
// Milestone 5 replaces this with the quest state machine (landing → sets → spike → portfolio).
export function HomePage() {
  useDocumentTitle(`${profile.name} — Beyond the Court`)

  return (
    <>
      <Landing />
      <PortfolioPage />
    </>
  )
}
