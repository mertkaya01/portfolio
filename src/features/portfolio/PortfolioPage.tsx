import { profile } from '@/data/profile'

import { Nav } from './Nav'
import { ContactSection } from './sections/ContactSection'
import { EducationSection } from './sections/EducationSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { HeroSection } from './sections/HeroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { SportSection } from './sections/SportSection'

// Computed once when the file loads, not on every render
const YEAR = new Date().getFullYear()

// The whole portfolio — also the "skip" destination, and what visitors get without WebGL
export function PortfolioPage() {
  return (
    <div id="portfolio">
      <Nav />
      <main>
        <HeroSection />
        <ProjectsSection />
        <SkillsSection />
        <ExperienceSection />
        <EducationSection />
        <SportSection />
        <ContactSection />
      </main>
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
    </div>
  )
}
