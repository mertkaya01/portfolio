import type { Chapter } from '../types/content.ts'

/*
  The five "sets" of the quest. Each beat is one short line shown on its own,
  so keep them short (one breath each). Only real events — no invented drama.
*/
export const chapters: Chapter[] = [
  {
    id: 'highschool',
    set: 1,
    title: 'High School',
    period: '2017 – 2021',
    beats: [
      'Istanbul, 2017.',
      'Fahreddin Kerim Gökay Anatolian High School — science track. Volleyball starts here.',
      'First match: I played libero. We lost badly.',
      'Early 2020: the national high-school championship in Aydın. I played middle blocker — it was hard, and it was great.',
    ],
  },
  {
    id: 'exam',
    set: 2,
    title: 'The Exam',
    period: '2021 – 2022',
    beats: [
      'A full year of preparing for the university entrance exam.',
      'Practice tests. Optical forms. Pencil marks in tiny circles.',
      'Exam day.',
      'Accepted: Computer Engineering, Istanbul Kültür University.',
    ],
  },
  {
    id: 'university',
    set: 3,
    title: 'University',
    period: '2022 – 2026',
    beats: [
      'Istanbul Kültür University · Computer Engineering.',
      'Data structures, operating systems, software engineering, embedded systems.',
      'The kid who filled in optical forms built software that reads scanned exams.',
      'Graduation project: a cyber-secure network for a small company.',
    ],
  },
  {
    id: 'erasmus',
    set: 4,
    title: 'Erasmus',
    period: '03.2025 – 08.2025',
    beats: [
      'Istanbul → Brandenburg an der Havel.',
      'Erasmus exchange at TH Brandenburg — Computer Science and Media.',
      'Team projects with international students.',
    ],
  },
  {
    id: 'now',
    set: 5,
    title: 'Tie-break',
    period: '2026',
    beats: [
      'Graduated.',
      'Internship at BTC Bilişim: a hotel platform, a marketplace and AI-powered WhatsApp bots.',
      'Now: looking for my next team.',
    ],
  },
]
