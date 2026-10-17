import type { ProjectContext, ProjectStatus } from '@/types/content'

export const CONTEXT_LABEL: Record<ProjectContext, string> = {
  internship: 'Internship',
  university: 'University',
  team: 'Team project',
  personal: 'Personal',
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  prototype: 'Prototype',
}

// The URL of a project's own page
export const projectPath = (slug: string) => `/projects/${slug}`
