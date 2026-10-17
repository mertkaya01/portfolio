import { projects } from '@/data/projects'

// slug → title, to print links like "Used in Hotel Commerce Service, Marketplace"
export const projectTitle = new Map(projects.map((p) => [p.slug, p.title]))

// slug → short name, for small tags like [Hotel Commerce]
export const projectShortTitle = new Map(projects.map((p) => [p.slug, p.shortTitle]))
