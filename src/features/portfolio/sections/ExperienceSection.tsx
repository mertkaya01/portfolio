import { m, useInView, useScroll } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router'

import { Chip } from '@/components/ui/Chip'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { projectPath } from '@/features/projects/labels'
import { useContent, useLocale, useT } from '@/i18n'
import { formatDuration, formatRange } from '@/lib/format'
import { projectTitle } from '@/lib/projects'

// A vertical timeline, newest on top. The rail is the "court line" motif again:
// it fills up as you scroll through it, and each job's light switches on as you reach it.
export function ExperienceSection() {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const { experience, profile } = useContent()
  const timelineRef = useRef<HTMLDivElement>(null)
  // 0 when the timeline's top reaches 75% of the screen → 1 when its end reaches 60%
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 75%', 'end 60%'],
  })

  return (
    <Section id="experience" index="02" kicker={t.experience.kicker} title={t.experience.title}>
      <div ref={timelineRef} className="relative ml-1.5">
        {/* The rail, and the part of it you have already "played" */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-wood/20" />
        <m.span
          aria-hidden="true"
          style={{ scaleY: scrollYProgress }}
          className="absolute inset-y-0 left-0 w-px origin-top bg-linear-to-b from-accent via-wood to-wood/60"
        />

        <ol className="space-y-10 pl-8 sm:pl-10">
          {/* "Now": where the timeline continues next */}
          <li className="relative">
            <span
              aria-hidden="true"
              className="absolute top-1.5 -left-[2.4rem] flex size-3 sm:-left-[2.9rem]"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-go" />
            </span>
            <Reveal>
              <p className="font-mono text-xs tracking-[0.2em] text-go uppercase">
                {t.experience.now}
              </p>
              <h3 className="mt-2 font-display text-3xl font-extrabold tracking-tight uppercase">
                {t.experience.nowTitle}
              </h3>
              <p className="mt-2 text-light/70">{profile.lookingFor.join(' · ')}</p>
            </Reveal>
          </li>

          {experience.map((job) => (
            <li key={job.company} className="relative">
              <TimelineDot />
              <Reveal>
                <div className="rounded-2xl border border-light/10 bg-night/40 p-6 transition-colors hover:border-wood/40 sm:p-8">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs tracking-[0.2em] text-muted uppercase">
                    <span>{formatRange(job.start, job.end, locale)}</span>
                    <Chip tone="wood">{formatDuration(job.start, job.end, locale)}</Chip>
                    <span>{job.location}</span>
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight uppercase">
                    {job.role} <span className="text-wood">· {job.company}</span>
                  </h3>
                  <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-light/80 marker:text-wood">
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  {job.stack.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={t.common.technologies}>
                      {job.stack.map((item) => (
                        <li key={item}>
                          <Chip>{item}</Chip>
                        </li>
                      ))}
                    </ul>
                  )}
                  {job.projectSlugs.length > 0 && (
                    <p className="mt-5 text-sm leading-relaxed text-muted">
                      <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase">
                        {t.experience.builtHere} ·{' '}
                      </span>
                      {job.projectSlugs.map((slug, i) => (
                        <span key={slug}>
                          {i > 0 && ', '}
                          {/* opens the project's page: the case study, or the short page */}
                          <Link
                            to={projectPath(slug)}
                            viewTransition
                            className="text-light/80 underline decoration-light/20 underline-offset-2 transition-colors hover:text-accent hover:decoration-accent focus-visible:text-accent"
                          >
                            {projectTitle.get(slug)}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

// A light on the rail that switches on when you scroll to its job
function TimelineDot() {
  const ref = useRef<HTMLSpanElement>(null)
  const lit = useInView(ref, { once: true, margin: '0px 0px -35% 0px' })

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`absolute top-8 -left-[2.4rem] size-3 rounded-full border-2 transition-all duration-700 sm:-left-[2.9rem] ${
        lit
          ? 'scale-100 border-accent bg-accent shadow-[0_0_16px_2px_rgb(255_210_63/0.45)]'
          : 'scale-75 border-wood/50 bg-night'
      }`}
    />
  )
}
