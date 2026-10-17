import { projects } from '@/data/projects'

// slug → title, to print links like "Used in Hotel Commerce Service, Marketplace"
export const projectTitle = new Map(projects.map((p) => [p.slug, p.title]))
