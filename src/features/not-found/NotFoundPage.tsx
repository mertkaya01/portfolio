import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

import { DrawLine, MaskReveal, Reveal } from '@/components/ui/Reveal'
import { Nav } from '@/features/portfolio/Nav'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useContent, useT } from '@/i18n'

// Any unknown URL: in volleyball terms, the ball landed out
export function NotFoundPage() {
  const t = useT()
  const { profile } = useContent()
  useDocumentTitle(t.errors.notFoundTitle(profile.name))

  return <Screen code="404" title={t.errors.notFound} message={t.errors.notFoundMessage} />
}

// A page crashed while rendering. Shown instead of a blank screen.
export function RouteErrorPage() {
  const error = useRouteError()
  const t = useT()
  const { profile } = useContent()
  useDocumentTitle(t.errors.errorTitle(profile.name))

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />
  if (import.meta.env.DEV) console.error(error) // show the real error while developing

  return <Screen code="ERR" title={t.errors.error} message={t.errors.errorMessage} />
}

function Screen({ code, title, message }: { code: string; title: string; message: string }) {
  const t = useT()
  return (
    <>
      <Nav />
      <main
        id="top"
        className="mx-auto flex min-h-[75dvh] max-w-6xl flex-col items-center justify-center px-4 py-24 text-center"
      >
        <Reveal>
          {/* the same LED style as the scoreboard in the Interest section */}
          <p
            aria-hidden="true"
            className="font-mono text-7xl font-bold text-accent tabular-nums [text-shadow:0_0_22px_rgb(255_210_63/0.5)] sm:text-8xl"
          >
            {code}
          </p>
        </Reveal>
        <h1 className="mt-6 font-display text-6xl font-black tracking-tight uppercase sm:text-8xl">
          <MaskReveal delay={150}>{title}</MaskReveal>
        </h1>
        <DrawLine className="mx-auto mt-6 w-24 bg-wood/60" delay={350} />
        <Reveal delay={400}>
          <p className="mt-8 max-w-md text-lg text-light/70">{message}</p>
          <Link
            to="/"
            viewTransition
            className="mt-10 inline-flex rounded-full bg-accent px-6 py-3 font-mono text-xs font-semibold tracking-[0.15em] text-night uppercase transition-colors hover:bg-light"
          >
            {t.errors.back}
          </Link>
        </Reveal>
      </main>
    </>
  )
}
