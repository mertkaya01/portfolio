import { useId, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'

import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { projectPath } from '@/features/projects/labels'
import { useContent, useT } from '@/i18n'
import { projectBySlug } from '@/lib/projects'
import type { Experience, Skill, SkillGroup, SkillLevel } from '@/types/content'

const ALL = 'all'

// The three honest levels, from most to least experience (see SkillLevel in types/content.ts)
const LEVELS: readonly SkillLevel[] = ['hands-on', 'working', 'familiar']

// The group's muted color as a CSS variable: classes like text-(color:--tone) read it
const toneOf = (group: SkillGroup) =>
  ({ '--tone': `var(--color-tone-${group.color})` }) as CSSProperties

// Where a skill was used at work: jobs whose projects include one of the skill's projects
const jobsFor = (skill: Skill, experience: Experience[]) =>
  experience.filter((job) => skill.evidence?.some((slug) => job.projectSlugs.includes(slug)))

// All groups in one calm grid (3 columns on desktop, 2 on tablet, 1 on mobile). Each row is
// a technology and its level; click it to see where and how it was used. The filter row above
// shows one group at a time — all data comes from skills.ts, projects.ts and experience.ts.
// (The filter remembers a group by its colour, which is the same in every language.)
export function SkillsSection() {
  const t = useT()
  const { skillGroups } = useContent()
  const [filter, setFilter] = useState<string>(ALL)
  const shown = filter === ALL ? skillGroups : skillGroups.filter((g) => g.color === filter)
  const single = shown.length === 1
  const count = shown.reduce((sum, g) => sum + g.skills.length, 0)
  const total = skillGroups.reduce((sum, g) => sum + g.skills.length, 0)

  return (
    <Section
      id="skills"
      index="04"
      kicker={t.skills.kicker}
      title={t.skills.title}
      intro={t.skills.intro}
    >
      <Reveal>
        <div role="group" aria-label={t.skills.filter} className="flex flex-wrap gap-2">
          <FilterButton
            label={t.skills.all}
            active={filter === ALL}
            onClick={() => setFilter(ALL)}
          />
          {skillGroups.map((group) => (
            <FilterButton
              key={group.color}
              label={group.title}
              group={group}
              active={filter === group.color}
              onClick={() => setFilter(group.color)}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          {/* Screen readers hear what the filter changed */}
          <p
            aria-live="polite"
            className="font-mono text-[0.7rem] tracking-[0.15em] text-muted uppercase"
          >
            {filter === ALL
              ? t.skills.countAll(skillGroups.length, total)
              : t.skills.countGroup(shown[0]?.title ?? '', count)}
          </p>
          {/* What the levels mean */}
          <dl
            // the legend sits outside the cards: hands-on shows in the accent colour here
            style={{ '--tone': 'var(--color-accent)' } as CSSProperties}
            className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-light/55"
          >
            {LEVELS.map((level) => (
              <div key={level} className="flex items-center gap-2">
                <dt>
                  <LevelTag level={level} />
                </dt>
                <dd>{t.skills.levels[level].hint}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      {/* key={filter}: a new filter rebuilds the grid, so the cards fade in quietly */}
      <Reveal delay={100}>
        <div key={filter} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((group, i) => (
            <div
              key={group.color}
              className={`animate-fade-in ${single ? 'md:col-span-2 lg:col-span-3' : ''}`}
              style={{ animationDelay: `${Math.min(i, 5) * 40}ms` }}
            >
              <SkillCard group={group} wide={single} />
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}

type FilterProps = { label: string; group?: SkillGroup; active: boolean; onClick: () => void }

function FilterButton({ label, group, active, onClick }: FilterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={group ? toneOf(group) : ({ '--tone': 'var(--color-light)' } as CSSProperties)}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
        active
          ? 'border-(color:--tone)/60 bg-(color:--tone)/10 text-light'
          : 'border-light/10 text-light/65 hover:border-light/25 hover:text-light'
      }`}
    >
      {group && <span aria-hidden="true" className="size-1.5 rounded-full bg-(color:--tone)" />}
      {label}
    </button>
  )
}

// The level as three dots — ●●● hands-on, ●●○ working, ●○○ familiar — in the group's colour,
// with a small label. Easy to compare at a glance; no percentages.
const DOTS: Record<SkillLevel, number> = { 'hands-on': 3, working: 2, familiar: 1 }

function LevelTag({ level }: { level: SkillLevel }) {
  const t = useT()
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden="true" className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-1.5 rounded-full ${i <= DOTS[level] ? 'bg-(color:--tone)' : 'bg-light/15'}`}
          />
        ))}
      </span>
      <span
        className={`font-mono text-[0.6rem] tracking-[0.12em] uppercase ${level === 'hands-on' ? 'text-light/80' : 'text-muted'}`}
      >
        {t.skills.levels[level].label}
      </span>
    </span>
  )
}

function SkillCard({ group, wide }: { group: SkillGroup; wide: boolean }) {
  const t = useT()
  return (
    <article
      style={toneOf(group)}
      className="relative h-full overflow-hidden rounded-2xl border border-light/10 bg-shadow p-6 transition-colors duration-200 hover:border-light/20 sm:p-7"
    >
      {/* the group's color: a thin line along the top edge, the only colored surface */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 bg-(color:--tone) ${group.main ? 'h-0.5' : 'h-px opacity-70'}`}
      />

      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2.5 font-display text-2xl leading-none font-extrabold tracking-tight uppercase sm:text-[1.7rem]">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-(color:--tone)" />
            {group.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-light/60">{group.summary}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5 font-mono text-[0.65rem] tracking-[0.15em] uppercase">
          {group.main && <span className="text-(color:--tone)">{t.skills.core}</span>}
          <span className="text-muted">
            {group.skills.length}
            <span className="sr-only">{t.skills.technologies}</span>
          </span>
        </div>
      </header>

      {/* One area selected: the list spreads over 2–3 columns */}
      <ul
        className={`mt-6 border-t border-light/[0.07] ${
          wide ? 'gap-x-10 md:columns-2 lg:columns-3' : ''
        }`}
      >
        {group.skills.map((skill) => (
          <SkillRow key={skill.name} skill={skill} />
        ))}
      </ul>
    </article>
  )
}

// One technology: its name and level. If there is more to tell (where it was used, or a
// detail), the row is a button that opens a short panel below it.
function SkillRow({ skill }: { skill: Skill }) {
  const t = useT()
  const { experience } = useContent()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const evidence = skill.evidence ?? []
  const jobs = jobsFor(skill, experience)
  const hasMore = evidence.length > 0 || !!skill.detail

  const headline = (
    <>
      <span className="text-[0.95rem] font-medium text-light">{skill.name}</span>
      <span className="ml-auto flex shrink-0 items-center gap-2">
        <LevelTag level={skill.level} />
        {hasMore && (
          <span
            aria-hidden="true"
            className={`font-mono text-xs text-muted transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          >
            +
          </span>
        )}
      </span>
    </>
  )

  return (
    <li className="break-inside-avoid border-b border-light/[0.07] last:border-b-0">
      {hasMore ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:text-(color:--tone)"
        >
          {headline}
        </button>
      ) : (
        <p className="flex items-center gap-3 py-3">{headline}</p>
      )}

      {hasMore && (
        <div id={panelId} hidden={!open} className="animate-fade-in pb-4">
          {skill.detail && <p className="text-sm leading-relaxed text-light/65">{skill.detail}</p>}
          {jobs.length > 0 && (
            <p className="mt-2 text-sm text-light/65">
              {t.skills.atWork} {jobs.map((job) => `${job.role} · ${job.company}`).join(', ')}
            </p>
          )}
          {evidence.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {evidence.map((slug) => {
                const project = projectBySlug.get(slug)
                if (!project) return null
                return (
                  <li key={slug} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <Link
                      to={projectPath(slug)}
                      viewTransition
                      className="text-light/85 underline decoration-light/20 underline-offset-2 transition-colors hover:text-(color:--tone) hover:decoration-(color:--tone) focus-visible:text-(color:--tone)"
                    >
                      {project.shortTitle}
                    </Link>
                    <span className="font-mono text-[0.65rem] tracking-[0.1em] text-muted uppercase">
                      {t.projects.context[project.context]}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}
