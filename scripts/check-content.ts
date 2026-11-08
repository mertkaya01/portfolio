// Checks everything in src/data before it reaches the site.   Run:  npm run content:check
//   ✖ errors   → exit code 1: duplicate slugs, references to missing projects, bad links, missing
//                files, or a Turkish text that is missing or doesn't match the English one
//   ! warnings → worth fixing before release (e.g. a featured project without screenshots)
//   ☐ TODOs    → text that still needs your input ("TODO: …" anywhere in the data)
// Node 24 runs TypeScript files directly by stripping the types, so no build step is needed.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import * as en from '../src/data/en/content.ts'
import * as tr from '../src/data/tr/content.ts'
import { EDUCATION_TEXT } from '../src/data/tr/education.ts'
import { EXPERIENCE_TEXT } from '../src/data/tr/experience.ts'
import { PROJECT_TEXT } from '../src/data/tr/projects.ts'
import { SKILL_TEXT } from '../src/data/tr/skills.ts'
import { isTodo } from '../src/lib/todo.ts'

const errors: string[] = []
const warnings: string[] = []
const todos: string[] = []

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
for (const [lang, content] of Object.entries({ en, tr })) {
  for (const [name, value] of Object.entries(content)) collectTodos(value, `${lang}.${name}`)
}

const { profile, projects, experience, education, certificates, skillGroups, chapters } = en

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
    skill.evidence?.forEach((slug) => checkSlug(slug, `Skill "${skill.name}"`))
    // honest levels: "hands-on" must be backed by projects or a stated detail
    if (!['hands-on', 'working', 'familiar'].includes(skill.level)) {
      errors.push(`Skill "${skill.name}" needs a level: hands-on, working or familiar`)
    }
    if (skill.level === 'hands-on' && !skill.evidence?.length && !skill.detail) {
      errors.push(`Skill "${skill.name}" is hands-on but shows no projects or detail`)
    }
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
checkLink(profile.photo.src, 'profile.photo')
checkLink(profile.gaming.profileUrl, 'profile.gaming.profileUrl')
for (const cert of certificates) checkLink(cert.file, `Certificate "${cert.name}"`)
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) errors.push(`profile.email looks wrong`)

for (const [lang, list] of Object.entries({ en: projects, tr: tr.projects })) {
  for (const project of list) {
    const { repo, demo, paper, related = [] } = project.links
    checkLink(repo, `${lang} ${project.slug} → repo`)
    checkLink(demo, `${lang} ${project.slug} → demo`)
    checkLink(paper, `${lang} ${project.slug} → paper`)
    related.forEach((link) =>
      checkLink(link.href, `${lang} ${project.slug} → related "${link.label}"`),
    )
  }
}
for (const project of projects) {
  if (!project.links.repo && !project.links.demo) {
    warnings.push(`${project.slug}: no repo or demo link`)
  }
  if (project.featured) {
    if (project.decisions.length === 0) {
      errors.push(`${project.slug}: featured but has no decisions`)
    }
    if (project.media.length === 0) {
      warnings.push(`${project.slug}: no screenshots or demo video yet`)
    }
    project.media.forEach((m) => checkLink(m.src, `${project.slug} → media "${m.alt}"`))
  }
}

// 4. The quest has exactly sets 1–5, in order
if (chapters.length !== 5) errors.push(`The quest needs 5 chapters, found ${chapters.length}`)
chapters.forEach((chapter, i) => {
  if (chapter.set !== i + 1) errors.push(`Chapter "${chapter.id}" should be set ${i + 1}`)
})

// 5. Turkish: everything that exists in English has its Turkish text, with the same shape
const sameLength = (a: unknown[] | undefined, b: unknown[] | undefined, where: string) => {
  if ((a?.length ?? 0) !== (b?.length ?? 0)) {
    errors.push(`TR ${where}: ${b?.length ?? 0} items, English has ${a?.length ?? 0}`)
  }
}
for (const project of projects) {
  const text = PROJECT_TEXT[project.slug]
  if (!text) {
    errors.push(`TR project "${project.slug}" has no Turkish text`)
    continue
  }
  if (project.featured) {
    if (!text.problem || !text.solution) {
      errors.push(`TR project "${project.slug}": problem or solution missing`)
    }
    sameLength(project.decisions, text.decisions, `${project.slug} decisions`)
    sameLength(project.highlights, text.highlights, `${project.slug} highlights`)
    sameLength(project.limitations, text.limitations, `${project.slug} limitations`)
  }
  sameLength(
    project.links.related,
    text.related ?? project.links.related,
    `${project.slug} related`,
  )
}
for (const slug of Object.keys(PROJECT_TEXT)) {
  if (!slugs.has(slug)) errors.push(`TR text for unknown project "${slug}"`)
}
for (const job of experience) {
  const text = EXPERIENCE_TEXT[job.company]
  if (!text) errors.push(`TR job "${job.company}" has no Turkish text`)
  else sameLength(job.bullets, text.bullets, `${job.company} bullets`)
}
for (const school of education) {
  const text = EDUCATION_TEXT[school.school]
  if (!text) errors.push(`TR school "${school.school}" has no Turkish text`)
  else sameLength(school.details, text.details, `${school.school} details`)
}
for (const group of skillGroups) {
  const text = SKILL_TEXT[group.title]
  if (!text) {
    errors.push(`TR skill group "${group.title}" has no Turkish text`)
    continue
  }
  for (const name of Object.keys(text.skills ?? {})) {
    if (!group.skills.some((s) => s.name === name)) {
      errors.push(`TR skill "${name}" is not in the English group "${group.title}"`)
    }
  }
}
chapters.forEach((chapter, i) => {
  sameLength(chapter.beats, tr.chapters[i]?.beats, `set ${chapter.set} lines`)
})

// ---------- Report ----------
const featured = projects.filter((p) => p.featured).length
console.log(
  `\nContent: ${projects.length} projects (${featured} featured), ${experience.length} jobs,`,
)
console.log(
  `         ${education.length} schools, ${certificates.length} certificates, ${chapters.length} chapters · EN + TR\n`,
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
