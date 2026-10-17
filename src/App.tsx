import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router'

import { router } from '@/app/router'

// Pages and URLs live in app/router.tsx; this file only adds the app-wide providers.
function App() {
  return (
    // LazyMotion + `m.` components load only the animation features we use (smaller bundle);
    // `strict` makes it an error to accidentally use the heavier `motion.` components.
    <LazyMotion features={domAnimation} strict>
      {/* reducedMotion="user": if the visitor's system asks for less motion, skip movement */}
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </LazyMotion>
  )
}

export default App
