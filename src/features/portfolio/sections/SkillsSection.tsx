import { useState, type CSSProperties } from 'react'

import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { skillGroups } from '@/data/skills'
import { projectShortTitle } from '@/lib/projects'
import type { Skill, SkillGroup } from '@/types/content'

const ALL = 'all'
const TOTAL = skillGroups.reduce((sum, g) => sum + g.skills.length, 0)

// Groups whose skills come with explanations (Networking & Security) are long: on wide screens
// they take two grid columns and split their list in two, so one card doesn't stretch a whole row.
const isLong = (group: SkillGroup) => group.skills.filter((s) => s.detail).length >= 3

// The group's muted color as a CSS variable: classes like text-(color:--tone) read it
const toneOf = (group: SkillGroup) =>
  ({ '--tone': `var(--color-tone-${group.color})` }) as CSSProperties

// All groups in one calm grid (3 columns on desktop, 2 on tablet, 1 on mobile). The core
// stack comes first. The filter row above shows one group at a time — the data comes from
// skills.ts, nothing here is hard-coded per group.
export function SkillsSection() {
  const [filter, setFilter] = useState<string>(ALL)
  const shown = filter === ALL ? skillGroups : skillGroups.filter((g) => g.title === filter)
  const single = shown.length === 1
  const count = shown.reduce((sum, g) => sum + g.skills.length, 0)

  return (
    <Section
      id="skills"
      index="02"
      kicker="Toolbox"
      title="Skills & Technologies"
      intro="The tools I build with, grouped by area. Under each one are the projects where I used it — no self-rated percentages."
    >
      <Reveal>
        <div role="group" aria-label="Filter skills by area" className="flex flex-wrap gap-2">
          <FilterButton label="All" active={filter === ALL} onClick={() => setFilter(ALL)} />
          {skillGroups.map((group) => (
            <FilterButton
              key={group.title}
              label={group.title}
              group={group}
              active={filter === group.title}
              onClick={() => setFilter(group.title)}
            />
          ))}
        </div>
        {/* Screen readers hear what the filter changed */}
        <p
          aria-live="polite"
          className="mt-4 font-mono text-[0.7rem] tracking-[0.15em] text-muted uppercase"
        >
          {filter === ALL
            ? `${skillGroups.length} areas · ${TOTAL} technologies`
            : `${filter} · ${count} technologies`}
        </p>
      </Reveal>

      {/* key={filter}: a new filter rebuilds the grid, so the cards fade in quietly */}
      <Reveal delay={100}>
        <div key={filter} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((group, i) => {
            const span = single
              ? 'md:col-span-2 lg:col-span-3'
              : isLong(group)
                ? 'md:col-span-2 lg:col-span-2'
                : ''
            const columns = single ? 3 : isLong(group) ? 2 : 1
            return (
              <div
                key={group.title}
                className={`animate-fade-in ${span}`}
                style={{ animationDelay: `${Math.min(i, 5) * 40}ms` }}
              >
                <SkillCard group={group} columns={columns} />
              </div>
            )
          })}
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

function SkillCard({ group, columns }: { group: SkillGroup; columns: 1 | 2 | 3 }) {
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
          {group.main && <span className="text-(color:--tone)">Core</span>}
          <span className="text-muted">
            {group.skills.length}
            <span className="sr-only"> technologies</span>
          </span>
        </div>
      </header>

      {/* A wide card spreads its list over 2 (long group) or 3 (one area selected) columns */}
      <ul
        className={`mt-6 border-t border-light/[0.07] ${
          columns === 1
            ? 'divide-y divide-light/[0.07]'
            : `gap-x-10 md:columns-2 ${columns === 3 ? 'lg:columns-3' : ''}`
        }`}
      >
        {group.skills.map((skill) => (
          <SkillRow key={skill.name} skill={skill} inColumns={columns > 1} />
        ))}
      </ul>
    </article>
  )
}

function SkillRow({ skill, inColumns }: { skill: Skill; inColumns: boolean }) {
  const evidence = skill.evidence ?? []

  return (
    <li className={`py-3.5 ${inColumns ? 'break-inside-avoid border-b border-light/[0.07]' : ''}`}>
      {/* The technology is the headline of the row… */}
      <p className="text-[0.95rem] font-medium text-light">{skill.name}</p>
      {skill.detail && <p className="mt-1 text-sm leading-relaxed text-light/60">{skill.detail}</p>}
      {/* …the projects are a quiet second line: small, muted, separated by dots */}
      {evidence.length > 0 && (
        <p className="mt-1.5 font-mono text-[0.7rem] leading-relaxed text-muted">
          <span className="sr-only">Used in </span>
          {evidence.map((slug, i) => (
            <span key={slug}>
              {i > 0 && (
                <span aria-hidden="true" className="px-1.5 text-light/25">
                  ·
                </span>
              )}
              <a
                href={`#project-${slug}`}
                className="transition-colors hover:text-(color:--tone) focus-visible:text-(color:--tone)"
              >
                {projectShortTitle.get(slug)}
              </a>
            </span>
          ))}
        </p>
      )}
    </li>
  )
}
