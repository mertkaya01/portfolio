import { Link, useLocation, useNavigate } from 'react-router'

import { useExperience } from '@/app/experienceStore'
import { profile } from '@/data/profile'

// Computed once when the file loads, not on every render
const YEAR = new Date().getFullYear()

export function Footer() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const send = useExperience((s) => s.send)

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
        <p>Built with React, TypeScript and Tailwind CSS</p>
        <div className="flex gap-6">
          <button type="button" onClick={replay} className="hover:text-accent">
            Replay the quest ↺
          </button>
          <Link to={{ hash: 'top' }} className="hover:text-accent">
            Back to top ↑
          </Link>
        </div>
      </div>
    </footer>
  )
}
