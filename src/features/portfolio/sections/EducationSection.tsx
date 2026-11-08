import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { TiltCard } from '@/components/ui/TiltCard'
import { useContent, useLocale, useT } from '@/i18n'
import { formatDate, formatRange } from '@/lib/format'

export function EducationSection() {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const { education, certificates } = useContent()
  return (
    <Section id="education" index="01" kicker={t.education.kicker} title={t.education.title}>
      <div className="grid gap-6 lg:grid-cols-3">
        {education.map((school, i) => (
          <Reveal key={school.school} delay={i * 80} className="h-full">
            <TiltCard maxTilt={6}>
              <article className="h-full rounded-2xl border border-light/10 bg-night/40 p-6 shadow-black/50 transition-[border-color,box-shadow] duration-300 transform-3d group-hover:border-wood/40 group-hover:shadow-xl">
                <p className="translate-z-4 font-mono text-[0.65rem] tracking-[0.2em] text-accent uppercase">
                  {t.education.kinds[school.kind]}
                </p>
                <h3 className="mt-3 translate-z-10 font-display text-2xl font-extrabold tracking-tight uppercase">
                  {school.school}
                </h3>
                <div className="translate-z-6">
                  <p className="mt-1 text-light/80">{school.degree}</p>
                  <p className="mt-2 font-mono text-xs text-muted">
                    {formatRange(school.start, school.end, locale)} · {school.location}
                  </p>
                </div>
                {school.details.length > 0 && (
                  <ul className="mt-4 translate-z-4 space-y-2 text-sm leading-relaxed text-light/70">
                    {school.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </article>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <h3 className="mt-16 font-mono text-xs tracking-[0.3em] text-muted uppercase">
        {t.education.certificates}
      </h3>
      <ul className="mt-4 divide-y divide-light/10 border-y border-light/10">
        {certificates.map((cert) => (
          <li
            key={cert.name}
            className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <span className="text-light">{cert.name}</span>
            <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="font-mono text-xs text-muted">
                {cert.issuer} · {formatDate(cert.date, locale)}
              </span>
              <ButtonLink href={cert.file} variant="link" newTab>
                {t.education.view}
                <span className="sr-only">{t.education.certificateFile(cert.name)}</span>
              </ButtonLink>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
