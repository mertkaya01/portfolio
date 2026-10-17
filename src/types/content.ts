// The shape of every piece of content on the site.
// Components only read these types, so content can change without touching any UI code.

/*
  Placeholders: any text that still needs Mert's input starts with "TODO:".
  `npm run content:check` lists every one of them, so nothing unfinished ships by accident.
*/

export type Link = { label: string; href: string }

export type Profile = {
  name: string
  headline: string // one line under the name
  location: string
  summary: string // 2–3 sentences for the hero / about section
  lookingFor: string[] // roles he is applying for
  email: string
  links: { github: string; linkedin: string; cv: string }
  spokenLanguages: { name: string; level: string }[]
  volleyball: {
    years: number
    position: string
    alsoPlayed: string[]
    jerseyNumber: string
    startedIn: string
  }
}

// ---------- Projects ----------

export type ProjectStatus = 'completed' | 'in-progress' | 'prototype'
export type ProjectContext = 'internship' | 'university' | 'team' | 'personal'

type ProjectBase = {
  slug: string // used in the URL: /projects/<slug>
  title: string
  tagline: string // one sentence on the card
  status: ProjectStatus
  context: ProjectContext
  role: string // what Mert did — be exact on team projects
  period: string
  stack: string[]
  links: {
    repo?: string
    demo?: string
    demoNote?: string // shown next to the demo link, e.g. when part of the demo is offline
    paper?: string
    related?: Link[]
  }
}

export type Decision = { title: string; why: string }
export type Media = { type: 'image' | 'video'; src: string; alt: string }

// A featured project gets its own case-study page, so it must have the full story.
export type FeaturedProject = ProjectBase & {
  featured: true
  problem: string
  solution: string
  decisions: Decision[] // the engineering choices worth explaining in an interview
  highlights: string[]
  limitations: string[] // honest: what it doesn't do (yet)
  media: Media[]
}

// Everything else shows as a compact card.
export type CompactProject = ProjectBase & { featured: false }

// "Discriminated union": the `featured` field tells TypeScript which shape it is,
// so it can force featured projects to include the case-study fields.
export type Project = FeaturedProject | CompactProject

// ---------- Experience, education, skills ----------

export type Experience = {
  company: string
  role: string
  location: string
  start: string // YYYY-MM
  end: string // YYYY-MM or 'present'
  bullets: string[]
  stack: string[]
  projectSlugs: string[] // projects built there (must exist in projects.ts)
}

export type Education = {
  kind: 'university' | 'exchange' | 'high-school'
  school: string
  degree: string
  location: string
  start: string // YYYY or YYYY-MM
  end: string
  details: string[]
}

export type Certificate = { name: string; issuer: string; date: string }

export type SkillGroup = {
  title: string
  // Every skill points at the projects that prove it (slugs from projects.ts).
  // No self-rated levels or percentages: evidence instead of numbers.
  skills: { name: string; evidence: string[] }[]
}

// ---------- Quest (the 5 "sets" of the story) ----------

export type ChapterId = 'highschool' | 'exam' | 'university' | 'erasmus' | 'now'

export type Chapter = {
  id: ChapterId
  set: 1 | 2 | 3 | 4 | 5
  title: string // shown on the scoreboard: "SET 2 · THE EXAM"
  period: string
  beats: string[] // short lines revealed one by one inside the chapter
}
