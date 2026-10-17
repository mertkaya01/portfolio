import type { Certificate, Education } from '../types/content.ts'

export const education: Education[] = [
  {
    kind: 'university',
    school: 'Istanbul Kültür University',
    degree: 'B.Sc. Computer Engineering',
    location: 'Istanbul',
    start: '2022',
    end: '2026',
    details: [
      'Relevant coursework: Data Structures & Algorithms, Object-Oriented Programming, Operating Systems, Software Engineering, Embedded Systems & Arduino.',
      'Graduation project (team lead): Designing Cyber-Secure Architecture for Small-Scale Corporate Networks.',
    ],
  },
  {
    kind: 'exchange',
    school: 'Technische Hochschule Brandenburg',
    degree: 'Erasmus exchange · Computer Science and Media',
    location: 'Brandenburg an der Havel, Germany',
    start: '2025-03',
    end: '2025-08',
    details: [
      "Computer Science coursework plus master's-level business courses in an international environment.",
      'Team projects with international students.',
    ],
  },
  {
    kind: 'high-school',
    school: 'Fahreddin Kerim Gökay Anatolian High School',
    degree: 'Science track',
    location: 'Istanbul',
    start: '2017',
    end: '2021',
    details: [],
  },
]

export const certificates: Certificate[] = [
  {
    name: 'Introduction to Software Testing (participation)',
    issuer: 'BTK Akademi',
    date: '2026-06',
    file: '/certificates/btk-intro-to-software-testing.pdf',
  },
  {
    name: 'Linux Fundamentals 101 · 201 · 301 · 401',
    issuer: 'Turkcell Akademi — Geleceği Yazanlar',
    date: '2024-09',
    file: '/certificates/turkcell-linux-fundamentals-101-401.pdf',
  },
]
