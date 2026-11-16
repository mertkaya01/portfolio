import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { useContent, useT } from '@/i18n'

export function ContactSection() {
  const t = useT()
  const { profile } = useContent()
  return (
    <Section id="contact" index="06" kicker={t.contact.kicker} title={t.contact.title}>
      <Reveal>
        <p className="font-mono text-[0.7rem] tracking-[0.25em] text-muted uppercase">
          {t.contact.openTo}
        </p>
        <p className="mt-2 max-w-3xl text-lg leading-relaxed text-light/80">
          {profile.lookingFor.join(' · ')}
        </p>
        <p className="mt-2 flex items-center gap-2.5 text-light/70">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-go" />
          {profile.availability} · {profile.workModes}
        </p>
        <p className="mt-4 text-light/60">{t.contact.reach}</p>
        <a
          href={`mailto:${profile.email}`}
          // phones: small enough that the address fits on one line; it only breaks if it truly must
          className="mt-8 inline-block font-display text-[clamp(1.5rem,8.5vw,1.875rem)] font-black tracking-tight [overflow-wrap:anywhere] transition-colors hover:text-accent sm:text-6xl"
        >
          {profile.email}
        </a>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href={profile.links.linkedin} variant="accent">
            LinkedIn
          </ButtonLink>
          <ButtonLink href={profile.links.github}>GitHub</ButtonLink>
          <ButtonLink href={profile.links.cv} download="Mert-Kaya-CV.pdf">
            {t.common.downloadCv}
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  )
}
