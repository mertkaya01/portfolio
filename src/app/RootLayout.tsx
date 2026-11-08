import { useLayoutEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'

import { Backdrop } from '@/components/Backdrop'
import { Footer } from '@/features/portfolio/Footer'
import { useDocumentLanguage } from '@/i18n'

// The site has `scroll-behavior: smooth` so section links glide. But when the page itself
// changes, the router's "back to the top" (or "back to where you were") would glide too — and
// you'd watch the new page scroll by. So for a moment after each page change, scrolling is
// instant. It runs just before ScrollRestoration because it sits before it (siblings' layout
// effects run in order).
function InstantScrollOnPageChange() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    const root = document.documentElement
    root.style.scrollBehavior = 'auto'
    // Read it back: browsers apply style changes lazily, and the router scrolls right after
    // this — reading forces the new value to be applied first
    void getComputedStyle(root).scrollBehavior
    // the router may restore the position once more right after the first render
    const timer = window.setTimeout(() => (root.style.scrollBehavior = ''), 300)
    return () => window.clearTimeout(timer)
  }, [pathname])
  return null
}

// Wraps every page: the arena backdrop and the footer stay, only the page in <Outlet /> changes.
// ScrollRestoration: new page → start at the top (or at the #section in the URL);
// browser back → return to where you were.
export function RootLayout() {
  useDocumentLanguage() // <html lang> and the meta description follow the chosen language
  return (
    <>
      <Backdrop />
      <Outlet />
      <Footer />
      <InstantScrollOnPageChange />
      {/* Every freshly loaded page gets the key "default", so a typed-in URL would inherit the
          scroll position of the previous page. Use the path for those, the history key otherwise. */}
      <ScrollRestoration
        getKey={(location) => (location.key === 'default' ? location.pathname : location.key)}
      />
    </>
  )
}
