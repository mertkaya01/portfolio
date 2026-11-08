import { Chip } from '@/components/ui/Chip'
import { useT } from '@/i18n'
import type { Project } from '@/types/content'

// Small pieces shared by the project cards (home page) and the project pages

export function Badges({ project }: { project: Project }) {
  const t = useT()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip tone="wood">{t.projects.context[project.context]}</Chip>
      <Chip tone={project.status === 'completed' ? 'accent' : 'muted'}>
        {t.projects.status[project.status]}
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
  const t = useT()

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={t.common.technologies}>
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
