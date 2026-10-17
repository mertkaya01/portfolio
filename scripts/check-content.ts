// Checks everything in src/data before it reaches the site.   Run:  npm run content:check
//   ✖ errors   → exit code 1: duplicate slugs, references to missing projects, bad links, missing files
//   ! warnings → worth fixing before release (e.g. a featured project without screenshots)
//   ☐ TODOs    → text that still needs your input ("TODO: …" anywhere in the data)
// Node 24 runs TypeScript files directly by stripping the types, so no build step is needed.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { certificates, education } from '../src/data/education.ts'
import { experience } from '../src/data/experience.ts'
import { profile } from '../src/data/profile.ts'
import { projects } from '../src/data/projects.ts'
import { chapters } from '../src/data/quest.ts'
import { skillGroups } from '../src/data/skills.ts'

const errors: string[] = []
const warnings: string[] = []
const todos: string[] = []

// The return type says "if true, this is a string starting with TODO:". Saying just "string"
// would make TypeScript think every non-TODO value can't be a string at all.
const isTodo = (value: unknown): value is `TODO:${string}` =>
  typeof value === 'string' && value.startsWith('TODO:')

// Walk through any value (object, array, string) and note every TODO with where it was found
function collectTodos(value: unknown, path: string) {
  if (isTodo(value)) {
    todos.push(`${path}\n      ${value.slice('TODO:'.length).trim()}`)
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => collectTodos(item, `${path}[${i}]`))
  } else if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) collectTodos(item, `${path}.${key}`)
  }
}

const content = { profile, projects, experience, education, certificates, skillGroups, chapters }
for (const [name, value] of Object.entries(content)) collectTodos(value, name)

// 1. Project slugs are unique and URL-friendly (they become /projects/<slug>)
const slugs = new Set<string>()
for (const project of projects) {
  if (slugs.has(project.slug)) errors.push(`Duplicate project slug "${project.slug}"`)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(project.slug)) {
    errors.push(`Slug "${project.slug}" must be lowercase words joined by dashes`)
  }
  slugs.add(project.slug)
}

// 2. Other files only refer to projects that exist
function checkSlug(slug: string, where: string) {
  if (!slugs.has(slug)) errors.push(`${where} refers to an unknown project "${slug}"`)
}
for (const group of skillGroups) {
  for (const skill of group.skills) {
    if (skill.evidence.length === 0) warnings.push(`Skill "${skill.name}" has no evidence project`)
    skill.evidence.forEach((slug) => checkSlug(slug, `Skill "${skill.name}"`))
  }
}
for (const job of experience) {
  job.projectSlugs.forEach((slug) => checkSlug(slug, `Experience at ${job.company}`))
}

// 3. Links: https URLs, internal pages (/projects/…), or files that exist in public/
function checkLink(href: string | undefined, where: string) {
  if (!href || isTodo(href)) return
  if (href.startsWith('/projects/')) return checkSlug(href.slice('/projects/'.length), where)
  if (href.startsWith('/')) {
    if (!existsSync(join('public', href))) errors.push(`${where}: public${href} does not exist`)
    return
  }
  if (!href.startsWith('https://')) errors.push(`${where}: "${href}" should start with https://`)
}

checkLink(profile.links.github, 'profile.links.github')
checkLink(profile.links.linkedin, 'profile.links.linkedin')
checkLink(profile.links.cv, 'profile.links.cv')
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) errors.push(`profile.email looks wrong`)

for (const project of projects) {
  const { repo, demo, paper, related = [] } = project.links
  checkLink(repo, `${project.slug} → repo`)
  checkLink(demo, `${project.slug} → demo`)
  checkLink(paper, `${project.slug} → paper`)
  related.forEach((link) => checkLink(link.href, `${project.slug} → related "${link.label}"`))
  if (!repo && !demo) warnings.push(`${project.slug}: no repo or demo link`)

  if (project.featured) {
    if (project.decisions.length === 0)
      errors.push(`${project.slug}: featured but has no decisions`)
    if (project.media.length === 0)
      warnings.push(`${project.slug}: no screenshots or demo video yet`)
    project.media.forEach((m) => checkLink(m.src, `${project.slug} → media "${m.alt}"`))
  }
}

// 4. The quest has exactly sets 1–5, in order
if (chapters.length !== 5) errors.push(`The quest needs 5 chapters, found ${chapters.length}`)
chapters.forEach((chapter, i) => {
  if (chapter.set !== i + 1) errors.push(`Chapter "${chapter.id}" should be set ${i + 1}`)
})

// ---------- Report ----------
const featured = projects.filter((p) => p.featured).length
console.log(
  `\nContent: ${projects.length} projects (${featured} featured), ${experience.length} jobs,`,
)
console.log(
  `         ${education.length} schools, ${certificates.length} certificates, ${chapters.length} chapters\n`,
)

for (const e of errors) console.log(`✖ ${e}`)
for (const w of warnings) console.log(`! ${w}`)
if (todos.length > 0) {
  console.log(`\n☐ ${todos.length} TODOs waiting for your input:`)
  for (const t of todos) console.log(`  ☐ ${t}`)
}

console.log(
  errors.length === 0
    ? `\n✔ No errors. ${warnings.length} warnings, ${todos.length} TODOs.\n`
    : `\n✖ ${errors.length} errors — fix these first.\n`,
)
process.exitCode = errors.length === 0 ? 0 : 1
