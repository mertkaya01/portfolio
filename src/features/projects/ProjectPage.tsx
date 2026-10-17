import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { DrawLine, MaskReveal, Reveal } from '@/components/ui/Reveal'
import { TiltCard } from '@/components/ui/TiltCard'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'
import { Nav } from '@/features/portfolio/Nav'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { isRealLink } from '@/lib/todo'
import type { FeaturedProject, Link as ContentLink, Project } from '@/types/content'

import { CONTEXT_LABEL, projectPath, STATUS_LABEL } from './labels'
import { Badges, Stack } from './ProjectBits'

// "/projects/:slug" — one page per project. Featured projects get the full case study;
// the others get a short page with their summary, stack and links.
export function ProjectPage() {
  const { slug } = useParams() // the ":slug" part of the URL
  const index = projects.findIndex((p) => p.slug === slug)
  const project = projects[index] as Project | undefined

  useDocumentTitle(`${project?.title ?? 'Out of bounds'} — ${profile.name}`)

  if (!project) return <NotFoundPage />

  // Previous / next wrap around, so the last project leads back to the first
  const previous = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]

  return (
    <>
      <Nav />
      {/* key: moving from one project to another rebuilds the page, so the entrance plays again */}
      <main id="top" key={project.slug} className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6">
        <Reveal>
          <Link
            to={{ pathname: '/', hash: 'projects' }}
            viewTransition
            className="font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors hover:text-accent"
          >
            ← All projects
          </Link>
        </Reveal>

        <Header project={project} />

        {project.featured ? (
          <CaseStudy project={project} />
        ) : (
          <Reveal>
            <p className="mt-16 max-w-2xl border-l-2 border-wood/40 pl-5 text-light/60">
              A smaller project — no full case study for this one. The code and the summary above
              tell the story.
            </p>
          </Reveal>
        )}

        <Related links={project.links.related} />
        <Pager previous={previous} next={next} />
      </main>
    </>
  )
}

function Header({ project }: { project: Project }) {
  const { links } = project

  return (
    <header className="mt-10">
      <Reveal>
        <Badges project={project} />
      </Reveal>
      <h1 className="mt-6 font-display text-6xl font-black tracking-tight uppercase sm:text-8xl">
        <MaskReveal delay={100}>{project.title}</MaskReveal>
      </h1>
      <DrawLine className="mt-6 w-32 bg-wood/60" delay={350} />
      <Reveal delay={300}>
        <p className="mt-8 max-w-3xl text-xl leading-relaxed text-light/85">{project.tagline}</p>
      </Reveal>

      <Reveal delay={400}>
        <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-light/10 bg-light/10 sm:grid-cols-2 lg:grid-cols-4">
          <Fact term="My role">{project.role}</Fact>
          <Fact term="When">{project.period}</Fact>
          <Fact term="Context">{CONTEXT_LABEL[project.context]}</Fact>
          <Fact term="Status">{STATUS_LABEL[project.status]}</Fact>
        </dl>
      </Reveal>

      <Reveal delay={500}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {isRealLink(links.repo) && (
            <ButtonLink href={links.repo} variant="accent">
              View code
            </ButtonLink>
          )}
          {isRealLink(links.demo) && <ButtonLink href={links.demo}>Live demo</ButtonLink>}
          {isRealLink(links.paper) && <ButtonLink href={links.paper}>Paper</ButtonLink>}
          {!isRealLink(links.repo) && !isRealLink(links.demo) && (
            <span className="font-mono text-xs text-muted">Code not public</span>
          )}
        </div>
        {isRealLink(links.demo) && links.demoNote && (
          <p className="mt-3 text-sm text-muted">{links.demoNote}</p>
        )}
      </Reveal>

      <Reveal delay={550}>
        <div className="mt-10">
          <Stack items={project.stack} />
        </div>
      </Reveal>
    </header>
  )
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="bg-night p-5">
      <dt className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">{term}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-light/85">{children}</dd>
    </div>
  )
}

// The full story of a featured project, in numbered blocks
function CaseStudy({ project }: { project: FeaturedProject }) {
  return (
    <div className="mt-24 space-y-24">
      <div className="grid gap-16 lg:grid-cols-2">
        <Block index="01" title="The problem">
          <p className="text-lg leading-relaxed text-light/80">{project.problem}</p>
        </Block>
        <Block index="02" title="What I built">
          <p className="text-lg leading-relaxed text-light/80">{project.solution}</p>
        </Block>
      </div>

      <Block index="03" title="Key decisions">
        <p className="-mt-4 mb-8 max-w-2xl text-light/60">
          The engineering choices behind it — and why I made them.
        </p>
        <ol className="grid gap-5 md:grid-cols-2">
          {project.decisions.map((decision, i) => (
            <li key={decision.title}>
              <Reveal delay={(i % 2) * 100} className="h-full">
                <TiltCard maxTilt={6}>
                  <div className="h-full rounded-2xl border border-light/10 bg-night/40 p-6 shadow-black/50 transition-[border-color,box-shadow] duration-300 transform-3d group-hover:border-wood/40 group-hover:shadow-xl sm:p-7">
                    <span className="block translate-z-4 font-mono text-xs text-accent">
                      D{i + 1}
                    </span>
                    <h3 className="mt-3 translate-z-10 font-display text-2xl font-extrabold tracking-tight uppercase">
                      {decision.title}
                    </h3>
                    <p className="mt-3 translate-z-6 leading-relaxed text-light/75">
                      {decision.why}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            </li>
          ))}
        </ol>
      </Block>

      <div className="grid gap-16 lg:grid-cols-2">
        <Block index="04" title="Highlights">
          <ul className="list-disc space-y-3 pl-5 leading-relaxed text-light/80 marker:text-wood">
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Block>
        <Block index="05" title="Honest limitations">
          <ul className="space-y-3 leading-relaxed text-light/65">
            {project.limitations.map((item) => (
              <li key={item} className="border-l-2 border-light/15 pl-4">
                {item}
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </div>
  )
}

// A numbered block inside the case study (same entrance as the home page sections)
function Block({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section aria-label={title}>
      <Reveal>
        <p className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
          <span className="text-accent">{index}</span>
        </p>
      </Reveal>
      <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
        <MaskReveal delay={80}>{title}</MaskReveal>
      </h2>
      <DrawLine className="mt-4 mb-8 w-16 bg-wood/60" delay={250} />
      <Reveal delay={200}>{children}</Reveal>
    </section>
  )
}

// "See also" links: other project pages stay inside the app, outside links open a new tab
function Related({ links = [] }: { links?: ContentLink[] }) {
  if (links.length === 0) return null

  return (
    <Reveal>
      <div className="mt-24 border-t border-light/10 pt-8">
        <p className="font-mono text-xs tracking-[0.3em] text-muted uppercase">See also</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {links.map((link) => (
            <li key={link.href}>
              {link.href.startsWith('/') ? (
                <Link
                  to={link.href}
                  viewTransition
                  className="font-mono text-xs font-semibold tracking-[0.15em] text-light/80 uppercase underline decoration-light/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {link.label} →
                </Link>
              ) : (
                <ButtonLink href={link.href} variant="link">
                  {link.label}
                </ButtonLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}

function Pager({ previous, next }: { previous: Project; next: Project }) {
  return (
    <nav aria-label="More projects" className="mt-24 grid gap-5 sm:grid-cols-2">
      <PagerCard project={previous} label="← Previous" />
      <PagerCard project={next} label="Next →" alignRight />
    </nav>
  )
}

function PagerCard({
  project,
  label,
  alignRight = false,
}: {
  project: Project
  label: string
  alignRight?: boolean
}) {
  return (
    <TiltCard maxTilt={6}>
      <Link
        to={projectPath(project.slug)}
        viewTransition
        className={`flex h-full flex-col rounded-2xl border border-light/10 bg-night/40 p-6 transition-colors transform-3d group-hover:border-wood/50 ${alignRight ? 'sm:items-end sm:text-right' : ''}`}
      >
        <span className="translate-z-4 font-mono text-xs tracking-[0.2em] text-muted uppercase">
          {label}
        </span>
        <span className="mt-3 translate-z-10 font-display text-3xl font-extrabold tracking-tight uppercase">
          {project.title}
        </span>
        <span className="mt-2 translate-z-6 text-sm text-light/60">{project.tagline}</span>
      </Link>
    </TiltCard>
  )
}
