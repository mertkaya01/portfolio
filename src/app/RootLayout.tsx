import { Outlet, ScrollRestoration } from 'react-router'

import { Backdrop } from '@/components/Backdrop'
import { Footer } from '@/features/portfolio/Footer'

// Wraps every page: the arena backdrop and the footer stay, only the page in <Outlet /> changes.
// ScrollRestoration: new page → start at the top (or at the #section in the URL);
// browser back → return to where you were.
export function RootLayout() {
  return (
    <>
      <Backdrop />
      <Outlet />
      <Footer />
      {/* Every freshly loaded page gets the key "default", so a typed-in URL would inherit the
          scroll position of the previous page. Use the path for those, the history key otherwise. */}
      <ScrollRestoration
        getKey={(location) => (location.key === 'default' ? location.pathname : location.key)}
      />
    </>
  )
}
