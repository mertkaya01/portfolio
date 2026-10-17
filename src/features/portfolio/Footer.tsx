import { profile } from '@/data/profile'

// Computed once when the file loads, not on every render
const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-light/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 font-mono text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {YEAR} {profile.name}
        </p>
        <p>Built with React, TypeScript and Tailwind CSS</p>
        <a href="#top" className="hover:text-accent">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
