import { ButtonLink } from '@/components/ui/ButtonLink'
import { Chip } from '@/components/ui/Chip'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { TiltCard } from '@/components/ui/TiltCard'
import { projects } from '@/data/projects'
import { isRealLink } from '@/lib/todo'
import type {
  CompactProject,
  FeaturedProject,
  Project,
  ProjectContext,
  ProjectStatus,
} from '@/types/content'

const CONTEXT_LABEL: Record<ProjectContext, string> = {
  internship: 'Internship',
  university: 'University',
  team: 'Team project',
  personal: 'Personal',
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  prototype: 'Prototype',
}

const STACK_ON_CARD = 6 // show this many technologies, then "+N"

// Type guards: after filtering, TypeScript knows which kind of project each list holds
const featured = projects.filter((p): p is FeaturedProject => p.featured)
const more = projects.filter((p): p is CompactProject => !p.featured)

export function ProjectsSection() {
  return (
    <Section
      id="projects"
      index="01"
      kicker="Featured work"
      title="Projects"
      intro="What I built, what my part was, and the engineering decisions I would explain in an interview."
    >
      <ul className="grid gap-6 md:grid-cols-2">
        {featured.map((project, i) => (
          <li key={project.slug}>
            <Reveal delay={(i % 2) * 100} className="h-full">
              <FeaturedCard project={project} />
            </Reveal>
          </li>
        ))}
      </ul>

      <h3 className="mt-24 font-display text-3xl font-extrabold tracking-tight uppercase">
        More projects
      </h3>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {more.map((project, i) => (
          <li key={project.slug}>
            <Reveal delay={(i % 3) * 80} className="h-full">
              <CompactCard project={project} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// Depth: inside a TiltCard, each layer floats at its own height above the card (translate-z-*).
// When the card leans, nearer layers move more than farther ones — that difference reads as depth.
function FeaturedCard({ project }: { project: FeaturedProject }) {
  const { links } = project

  return (
    <TiltCard maxTilt={8}>
      <article
        id={`project-${project.slug}`}
        className="flex h-full scroll-mt-24 flex-col rounded-2xl border border-light/10 bg-shadow/60 p-6 shadow-black/50 transition-[border-color,box-shadow] duration-300 transform-3d group-hover:border-wood/50 group-hover:shadow-2xl sm:p-8"
      >
        <div className="translate-z-6">
          <Badges project={project} />
        </div>
        <h4 className="mt-5 translate-z-12 font-display text-4xl font-extrabold tracking-tight uppercase">
          {project.title}
        </h4>
        <p className="mt-3 translate-z-8 leading-relaxed text-light/80">{project.tagline}</p>

        <dl className="mt-6 translate-z-6 space-y-3 text-sm">
          <div>
            <dt className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
              My role
            </dt>
            <dd className="mt-1 text-light/80">{project.role}</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
              Key decision
            </dt>
            <dd className="mt-1 text-light/80">{project.decisions[0].title}</dd>
          </div>
        </dl>

        <div className="translate-z-4">
          <Stack items={project.stack} />
        </div>

        <div className="mt-auto translate-z-8 pt-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {isRealLink(links.repo) && (
              <ButtonLink href={links.repo} variant="link">
                Code
              </ButtonLink>
            )}
            {isRealLink(links.demo) && (
              <ButtonLink href={links.demo} variant="link">
                Live demo
              </ButtonLink>
            )}
            <span className="ml-auto font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
              Case study · soon
            </span>
          </div>
          {isRealLink(links.demo) && links.demoNote && (
            <p className="mt-3 text-xs text-muted">{links.demoNote}</p>
          )}
        </div>
      </article>
    </TiltCard>
  )
}

function CompactCard({ project }: { project: CompactProject }) {
  const { links } = project
  const hasLinks = [links.repo, links.demo, links.paper].some(isRealLink)

  return (
    <TiltCard maxTilt={6}>
      <article
        id={`project-${project.slug}`}
        className="flex h-full scroll-mt-24 flex-col rounded-2xl border border-light/10 bg-night/40 p-5 shadow-black/50 transition-[border-color,box-shadow] duration-300 transform-3d group-hover:border-wood/40 group-hover:shadow-xl"
      >
        <p className="translate-z-4 font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
          {CONTEXT_LABEL[project.context]} · {project.period}
        </p>
        <h4 className="mt-3 translate-z-8 font-display text-2xl font-extrabold tracking-tight uppercase">
          {project.title}
        </h4>
        <p className="mt-2 translate-z-6 text-sm leading-relaxed text-light/70">
          {project.tagline}
        </p>
        <div className="translate-z-4">
          <Stack items={project.stack} max={4} />
        </div>
        <div className="mt-auto flex translate-z-6 flex-wrap gap-x-5 gap-y-2 pt-5">
          {isRealLink(links.repo) && (
            <ButtonLink href={links.repo} variant="link">
              Code
            </ButtonLink>
          )}
          {isRealLink(links.demo) && (
            <ButtonLink href={links.demo} variant="link">
              Demo
            </ButtonLink>
          )}
          {isRealLink(links.paper) && (
            <ButtonLink href={links.paper} variant="link">
              Paper
            </ButtonLink>
          )}
          {!hasLinks && <span className="font-mono text-xs text-muted">Code not public</span>}
        </div>
      </article>
    </TiltCard>
  )
}

function Badges({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip tone="wood">{CONTEXT_LABEL[project.context]}</Chip>
      <Chip tone={project.status === 'completed' ? 'accent' : 'muted'}>
        {STATUS_LABEL[project.status]}
      </Chip>
      <span className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
        {project.period}
      </span>
    </div>
  )
}

function Stack({ items, max = STACK_ON_CARD }: { items: string[]; max?: number }) {
  const shown = items.slice(0, max)
  const hidden = items.length - shown.length

  return (
    <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies">
      {shown.map((item) => (
        <li key={item}>
          <Chip>{item}</Chip>
        </li>
      ))}
      {hidden > 0 && (
        <li>
          <Chip>+{hidden}</Chip>
        </li>
      )}
    </ul>
  )
}
