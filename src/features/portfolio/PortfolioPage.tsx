import { Nav } from './Nav'
import { ContactSection } from './sections/ContactSection'
import { EducationSection } from './sections/EducationSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { HeroSection } from './sections/HeroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { SportSection } from './sections/SportSection'

// The whole portfolio — also the "skip" destination, and what visitors get without WebGL.
// (The footer lives in RootLayout so every page shares it.)
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
    </div>
  )
}
