import type { Chapter } from '../../types/content.ts'

/*
  The five "sets" of the quest. Every set opens with its scoreboard (set, title, period),
  then its scenes play one by one. A caption is one short line — one breath.
  Only real events — no invented drama. A scene's `id` names its drawing in the set's art.
*/
export const chapters: Chapter[] = [
  {
    id: 'highschool',
    set: 1,
    title: 'High School',
    period: '07.2017 – 07.2021',
    // A typical school day, told as a short montage (a representative day, not one date).
    // Each caption says what its picture shows.
    scenes: [
      { id: 'wake', caption: 'A school day, 2017–2021. The alarm goes off.' },
      // the bus needs its time: it pulls in, opens its door, leaves
      { id: 'bus', caption: 'The morning bus to school.', duration: 5600 },
      { id: 'class', caption: 'Science track — classes with friends.' },
      {
        id: 'lunch',
        caption:
          'Fahreddin Kerim Gökay Anatolian High School. Lunch break: a ball in the yard — volleyball starts here.',
      },
      {
        id: 'training',
        caption:
          'After school: training. Early 2020, Aydın — the national high-school championship, as a middle blocker.',
      },
      { id: 'night', caption: 'Home, homework, sleep. Repeat.' },
    ],
  },
  {
    id: 'exam',
    set: 2,
    title: 'University Exam',
    period: '2021 – 2022',
    scenes: [
      { id: 'prep', caption: 'A full year of preparing for the university entrance exam.' },
      { id: 'mocks', caption: 'Practice tests. Optical forms. Pencil marks in tiny circles.' },
      { id: 'exam-day', caption: 'Exam day.' },
      { id: 'accepted', caption: 'Accepted: Computer Engineering, Istanbul Kültür University.' },
    ],
  },
  {
    id: 'university',
    set: 3,
    title: 'University – CSE',
    period: '2022 – 2026',
    scenes: [
      { id: 'iku', caption: 'Istanbul Kültür University · Computer Engineering.' },
      {
        id: 'courses',
        caption: 'Data structures, operating systems, software engineering, embedded systems.',
      },
      // Mert: the university team, outside hitter, number 9 (2026-11-08)
      {
        id: 'volleyball',
        caption: 'Volleyball didn’t stop: the university team, outside hitter, number 9.',
      },
      {
        id: 'exam-reader',
        caption: 'The kid who filled in optical forms built software that reads scanned exams.',
      },
      {
        id: 'capstone',
        caption: 'Graduation project: a cyber-secure network for a small company.',
      },
    ],
  },
  {
    id: 'erasmus',
    set: 4,
    title: 'Erasmus',
    period: '03.2025 – 08.2025',
    scenes: [
      { id: 'move', caption: 'Istanbul → Brandenburg an der Havel.' },
      // Mert: "six months there — it was wonderful" (2026-11-08)
      { id: 'havel', caption: 'Six months by the Havel — and they were wonderful.' },
      {
        id: 'th-brandenburg',
        // the courses as in the education data: computer science, and master's-level business
        caption:
          'Erasmus exchange at TH Brandenburg — computer science courses, and master’s-level business courses.',
      },
      { id: 'teams', caption: 'Team projects with international students.' },
    ],
  },
  {
    id: 'now',
    set: 5,
    title: 'Tie-break',
    period: '2026',
    scenes: [
      { id: 'graduated', caption: 'Graduated.' },
      {
        id: 'internship',
        caption:
          'Internship at BTC Bilişim: a hotel platform, a marketplace and AI-powered WhatsApp bots.',
      },
      { id: 'looking', caption: 'Now: looking for my next team.' },
    ],
  },
]
