import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { useT } from '@/i18n'
import { isExternal } from '@/lib/format'

type Variant = 'accent' | 'outline' | 'link'

const VARIANTS: Record<Variant, string> = {
  accent: 'rounded-full bg-accent px-5 py-2.5 text-night hover:bg-light',
  outline: 'rounded-full border border-light/25 px-5 py-2.5 hover:border-accent hover:text-accent',
  link: 'text-light/80 underline decoration-light/20 underline-offset-4 hover:text-accent hover:decoration-accent',
}

type Props = {
  href: string
  children: ReactNode
  variant?: Variant
  download?: string // file name for downloads (e.g. the CV)
  newTab?: boolean // open our own files (e.g. a certificate PDF) in a new tab
  className?: string
}

// One component for every link: page anchors, other sites (new tab) and file downloads
export function ButtonLink({
  href,
  children,
  variant = 'outline',
  download,
  newTab = false,
  className = '',
}: Props) {
  const t = useT()
  const external = isExternal(href) || newTab
  const classes = `inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.15em] uppercase transition-colors ${VARIANTS[variant]} ${className}`

  // A section of this page ("#projects"): go through the router, like the nav does.
  // A plain "#" link changes the URL, but the router's scroll restoration then puts the page
  // back where it was — the link would seem to do nothing.
  if (href.startsWith('#')) {
    return (
      <Link to={{ hash: href.slice(1) }} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      download={download}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={classes}
    >
      {children}
      {external && (
        <>
          <span aria-hidden="true">↗</span>
          <span className="sr-only">{t.common.newTab}</span>
        </>
      )}
    </a>
  )
}
