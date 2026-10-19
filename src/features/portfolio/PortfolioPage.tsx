import { Nav } from './Nav'
import { ContactSection } from './sections/ContactSection'
import { EducationSection } from './sections/EducationSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { HeroSection } from './sections/HeroSection'
import { InterestSection } from './sections/InterestSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'

// The whole portfolio — also the "skip" destination, and what visitors get without WebGL.
// (The footer lives in RootLayout so every page shares it.)
export function PortfolioPage() {
  return (
    <div id="portfolio">
      <Nav />
      <main>
        <HeroSection />
        {/* Section order — keep it in sync with LINKS in Nav.tsx and each section's index */}
        <EducationSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <InterestSection />
        <ContactSection />
      </main>
    </div>
  )
}
