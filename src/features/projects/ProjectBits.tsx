import { Chip } from '@/components/ui/Chip'
import type { Project } from '@/types/content'

import { CONTEXT_LABEL, STATUS_LABEL } from './labels'

// Small pieces shared by the project cards (home page) and the project pages

export function Badges({ project }: { project: Project }) {
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

// Technology chips. With `max`, shows that many and then "+N".
export function Stack({ items, max = Infinity }: { items: string[]; max?: number }) {
  const shown = items.slice(0, max)
  const hidden = items.length - shown.length

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
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
