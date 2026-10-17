import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { profile } from '@/data/profile'

export function ContactSection() {
  return (
    <Section id="contact" index="06" kicker="Contact" title="Looking for my next team">
      <Reveal>
        <p className="font-mono text-[0.7rem] tracking-[0.25em] text-muted uppercase">Open to</p>
        <p className="mt-2 max-w-3xl text-lg leading-relaxed text-light/80">
          {profile.lookingFor.join(' · ')}
        </p>
        <p className="mt-4 text-light/60">Reach me by email or on LinkedIn.</p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-8 inline-block font-display text-4xl font-black tracking-tight break-all transition-colors hover:text-accent sm:text-6xl"
        >
          {profile.email}
        </a>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href={profile.links.linkedin} variant="accent">
            LinkedIn
          </ButtonLink>
          <ButtonLink href={profile.links.github}>GitHub</ButtonLink>
          <ButtonLink href={profile.links.cv} download="Mert-Kaya-CV.pdf">
            Download CV ↓
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  )
}
