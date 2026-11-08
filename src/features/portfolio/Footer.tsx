import { Link, useLocation, useNavigate } from 'react-router'

import { useExperience } from '@/app/experienceStore'
import { QUEST_ENABLED } from '@/config/features'
import { useContent, useT } from '@/i18n'

// Computed once when the file loads, not on every render
const YEAR = new Date().getFullYear()

export function Footer() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const send = useExperience((s) => s.send)
  const t = useT()
  const { profile } = useContent()

  // Play the quest again — from a project page too: go home first, the stage opens there
  function replay() {
    if (pathname !== '/') navigate('/')
    send({ type: 'START' })
  }

  return (
    <footer className="border-t border-light/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 font-mono text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {YEAR} {profile.name}
        </p>
        <p>{t.footer.builtWith}</p>
        <div className="flex gap-6">
          {QUEST_ENABLED && (
            <button type="button" onClick={replay} className="hover:text-accent">
              {t.footer.replay}
            </button>
          )}
          <Link to={{ hash: 'top' }} className="hover:text-accent">
            {t.footer.backToTop}
          </Link>
        </div>
      </div>
    </footer>
  )
}
