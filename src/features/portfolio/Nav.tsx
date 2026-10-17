import { useEffect, useState } from 'react'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { profile } from '@/data/profile'

const LINKS = [
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#education', label: 'Education' },
  { href: '#sport', label: 'Sport' },
  { href: '#contact', label: 'Contact' },
]

// Sticky top bar. On small screens the links fold into a menu button.
export function Nav() {
  const [open, setOpen] = useState(false)

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
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6"
      >
        <a href="#about" className="font-display text-2xl font-black tracking-tight uppercase">
          MK<span className="text-accent">·{profile.volleyball.jerseyNumber}</span>
          <span className="sr-only"> — {profile.name}, back to the start of the portfolio</span>
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-mono text-xs tracking-[0.2em] text-light/70 uppercase transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ButtonLink href={profile.links.cv} download="Mert-Kaya-CV.pdf" variant="accent">
            CV ↓
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex size-10 items-center justify-center rounded-full border border-light/20 md:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-light/10 md:hidden">
          <ul className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-3xl font-extrabold uppercase hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <ButtonLink href={profile.links.cv} download="Mert-Kaya-CV.pdf" variant="accent">
                Download CV ↓
              </ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
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
