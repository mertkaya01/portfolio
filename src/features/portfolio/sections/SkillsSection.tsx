import { useState } from 'react'

import { BurstLayer } from '@/components/ui/Burst'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { skillGroups } from '@/data/skills'
import { useBurst } from '@/hooks/useBurst'
import { projectTitle } from '@/lib/projects'
import type { Skill, SkillGroup } from '@/types/content'

const MAX_OPEN = 3 // opening a fourth card closes the one that has been open the longest

// The main stack is open; every other group is a thin card (like the spine of a book).
// Hover → it widens a little; click → it opens.
export function SkillsSection() {
  // Titles of the open groups, oldest first
  const [open, setOpen] = useState(() => skillGroups.filter((g) => g.main).map((g) => g.title))

  function toggle(title: string) {
    setOpen(
      (list) =>
        list.includes(title)
          ? list.filter((t) => t !== title) // close it
          : [...list, title].slice(-MAX_OPEN), // open it, drop the oldest if too many
    )
  }

  return (
    <Section
      id="skills"
      index="02"
      kicker="Toolbox"
      title="Skills"
      intro="My main stack is open — click a thin card to open more. No percentages or star ratings: where I used a skill in a project, it links straight to it."
    >
      <Reveal>
        <div className="flex flex-col gap-3 lg:min-h-[30rem] lg:flex-row">
          {skillGroups.map((group, i) => (
            <SkillPanel
              key={group.title}
              group={group}
              number={String(i + 1).padStart(2, '0')}
              open={open.includes(group.title)}
              onToggle={() => toggle(group.title)}
            />
          ))}
        </div>
      </Reveal>
    </Section>
  )
}

type PanelProps = { group: SkillGroup; number: string; open: boolean; onToggle: () => void }

function SkillPanel({ group, number, open, onToggle }: PanelProps) {
  const { bursts, onPointerDown } = useBurst()
  const listId = `skills-${number}`

  return (
    // On large screens open panels share the free width (grow), closed ones stay 4rem wide.
    // Animating flex-grow / flex-basis makes the cards slide open and shut.
    <div
      onPointerDown={onPointerDown}
      className={`relative overflow-hidden rounded-2xl border transition-[flex-grow,flex-basis,translate,border-color,background-color] duration-500 ease-out-expo ${
        open
          ? 'border-light/15 bg-night/40 lg:grow lg:basis-0'
          : 'border-light/10 bg-night/40 hover:-translate-y-1 hover:border-wood/50 hover:bg-shadow/70 lg:grow-0 lg:basis-16 lg:hover:basis-20'
      }`}
    >
      {open ? (
        <>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded="true"
            aria-controls={listId}
            className="group/head flex w-full items-center justify-between gap-3 px-6 pt-6 text-left"
          >
            <span className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-wood">{number}</span>
              <span className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                {group.title}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="font-mono text-lg leading-none text-muted transition-colors group-hover/head:text-accent"
            >
              −
            </span>
            <span className="sr-only">(collapse)</span>
          </button>
          {/* min-width keeps the text from reflowing while the card is still widening */}
          <ul
            id={listId}
            className="animate-rise space-y-4 p-6 pt-5 [animation-delay:120ms] lg:min-w-[15rem]"
          >
            {group.skills.map((skill) => (
              <SkillItem key={skill.name} skill={skill} />
            ))}
          </ul>
        </>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded="false"
          className="flex h-full w-full items-center gap-3 px-5 py-4 text-left lg:flex-col lg:justify-between lg:px-0 lg:py-6"
        >
          <span className="font-mono text-xs text-wood">{number}</span>
          {/* Vertical title on wide screens, like the spine of a book */}
          <span className="font-display text-xl font-extrabold tracking-tight whitespace-nowrap uppercase lg:rotate-180 lg:text-2xl lg:[writing-mode:vertical-rl]">
            {group.title}
          </span>
          <span className="ml-auto font-mono text-xs text-muted lg:ml-0">
            {group.skills.length}
            <span className="sr-only"> skills, click to open</span>
          </span>
        </button>
      )}
      <BurstLayer bursts={bursts} />
    </div>
  )
}

function SkillItem({ skill }: { skill: Skill }) {
  const evidence = skill.evidence ?? []

  return (
    <li>
      <p className="font-medium text-light">{skill.name}</p>
      {skill.detail && <p className="mt-1 text-sm leading-relaxed text-light/60">{skill.detail}</p>}
      {evidence.length > 0 && (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Used in{' '}
          {evidence.map((slug, j) => (
            <span key={slug}>
              {j > 0 && ', '}
              <a
                href={`#project-${slug}`}
                className="underline decoration-light/20 underline-offset-2 transition-colors hover:text-accent"
              >
                {projectTitle.get(slug)}
              </a>
            </span>
          ))}
        </p>
      )}
    </li>
  )
}
