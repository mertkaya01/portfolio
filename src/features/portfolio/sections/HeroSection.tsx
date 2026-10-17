import { ButtonLink } from '@/components/ui/ButtonLink'
import { Chip } from '@/components/ui/Chip'
import { Reveal } from '@/components/ui/Reveal'
import { profile } from '@/data/profile'

import { PlayerCard } from '../PlayerCard'

// The first thing after the landing: who I am in three sentences, plus the player card
export function HeroSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:py-28">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
            {profile.headline}
          </p>
          <h2
            id="about-title"
            className="mt-4 font-display text-6xl font-black tracking-tight uppercase sm:text-7xl"
          >
            Hi, I'm Mert<span className="text-accent">.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-light/80">{profile.summary}</p>

          <p className="mt-8 font-mono text-[0.7rem] tracking-[0.25em] text-muted uppercase">
            Looking for
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.lookingFor.map((role) => (
              <li key={role}>
                <Chip tone="accent">{role}</Chip>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="#projects" variant="accent">
              See projects
            </ButtonLink>
            <ButtonLink href={profile.links.cv} download="Mert-Kaya-CV.pdf">
              Download CV ↓
            </ButtonLink>
            <ButtonLink href={profile.links.github} variant="link" className="px-2">
              GitHub
            </ButtonLink>
            <ButtonLink href={profile.links.linkedin} variant="link" className="px-2">
              LinkedIn
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={150} className="flex justify-center lg:justify-end">
          <PlayerCard />
        </Reveal>
      </div>
    </section>
  )
}
