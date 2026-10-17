import type { Profile } from '../types/content.ts'

export const profile: Profile = {
  name: 'Mert Kaya',
  headline: 'Computer Engineer · Backend & Full-stack · Applied AI',
  location: 'Istanbul, Türkiye',
  summary:
    'Computer Engineering graduate from Istanbul Kültür University. I build full-stack systems with Spring Boot and Angular, and applied-AI tools with Python, OpenCV and LLMs. Nine years of competitive volleyball taught me how good teams work — and I am looking for my next one.',
  lookingFor: [
    'Junior Backend Engineer',
    'Junior Full-stack Engineer',
    'Applied AI / Computer Vision',
  ],
  email: 'kaya.mert01@yandex.com',
  links: {
    github: 'https://github.com/mertkaya01',
    linkedin: 'https://www.linkedin.com/in/kayamert17/',
    cv: '/cv/Mert-Kaya-CV.pdf',
  },
  spokenLanguages: [
    { name: 'Turkish', level: 'Native' },
    { name: 'English', level: 'C1' },
    { name: 'German', level: 'A2' },
  ],
  volleyball: {
    years: 9,
    position: 'Outside Hitter (Smaçör)',
    alsoPlayed: ['Middle Blocker', 'Libero'],
    jerseyNumber: '9',
    startedIn: '2017',
  },
}
