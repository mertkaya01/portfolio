import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'

import { Backdrop } from '@/components/Backdrop'
import { Landing } from '@/features/landing/Landing'
import { PortfolioPage } from '@/features/portfolio/PortfolioPage'

// For now: the landing screen, then the portfolio below it.
// Milestone 5 replaces this with the quest state machine (landing → sets → spike → portfolio).
function App() {
  return (
    // LazyMotion + `m.` components load only the animation features we use (smaller bundle);
    // `strict` makes it an error to accidentally use the heavier `motion.` components.
    <LazyMotion features={domAnimation} strict>
      {/* reducedMotion="user": if the visitor's system asks for less motion, skip movement */}
      <MotionConfig reducedMotion="user">
        <Backdrop />
        <Landing />
        <PortfolioPage />
      </MotionConfig>
    </LazyMotion>
  )
}

export default App
