import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { LOCALES, useContent, useLocale, useT } from '@/i18n'

// Sections of the home page. Links go to "/#section", so they also work from a project page:
// the router returns to "/" without reloading, and ScrollRestoration scrolls to the section.
// Same order as the sections on the page (PortfolioPage.tsx).
const LINKS = ['education', 'experience', 'projects', 'skills', 'interest', 'contact'] as const

// Sticky top bar. On small screens the links fold into a menu button.
export function Nav() {
  const [open, setOpen] = useState(false)
  const t = useT()
  const { profile } = useContent()

  // Escape closes the mobile menu
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-light/10 bg-night/80 backdrop-blur-md">
      <nav
        aria-label={t.nav.label}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6"
      >
        <Link
          to={{ pathname: '/', hash: 'about' }}
          viewTransition
          className="font-display text-2xl font-black tracking-tight uppercase"
        >
          MK<span className="text-accent">·{profile.volleyball.jerseyNumber}</span>
          <span className="sr-only">{t.nav.brand(profile.name)}</span>
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {LINKS.map((hash) => (
            <li key={hash}>
              <Link
                to={{ pathname: '/', hash }}
                viewTransition
                className="font-mono text-xs tracking-[0.2em] text-light/70 uppercase transition-colors hover:text-accent"
              >
                {t.nav.sections[hash]}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LanguageSwitch className="hidden md:flex" />
          <ButtonLink href={profile.links.cv} download="Mert-Kaya-CV.pdf" variant="accent">
            {t.nav.cv}
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex size-10 items-center justify-center rounded-full border border-light/20 md:hidden"
          >
            <span className="sr-only">{open ? t.nav.closeMenu : t.nav.openMenu}</span>
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-light/10 md:hidden">
          <ul className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {LINKS.map((hash) => (
              <li key={hash}>
                <Link
                  to={{ pathname: '/', hash }}
                  viewTransition
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-3xl font-extrabold uppercase hover:text-accent"
                >
                  {t.nav.sections[hash]}
                </Link>
              </li>
            ))}
            <li className="flex flex-wrap items-center gap-4 pt-3">
              <ButtonLink href={profile.links.cv} download="Mert-Kaya-CV.pdf" variant="accent">
                {t.common.downloadCv}
              </ButtonLink>
              <LanguageSwitch />
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

// EN | TR. Switching re-renders the text in place: same page, same scroll position.
function LanguageSwitch({ className = '' }: { className?: string }) {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const setLocale = useLocale((s) => s.setLocale)

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className={`flex items-center rounded-full border border-light/15 p-0.5 ${className}`}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          aria-label={t.language.names[code]}
          className={`rounded-full px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-colors ${
            locale === code ? 'bg-light/10 text-light' : 'text-light/50 hover:text-light'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

// Three lines that turn into an X
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      stroke="currentColor"
      strokeWidth="2"
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  )
}
