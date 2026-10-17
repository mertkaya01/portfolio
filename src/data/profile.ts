import type { Profile } from '../types/content.ts'

export const profile: Profile = {
  name: 'Mert Kaya',
  headline: 'Computer Engineer · Backend & Full-stack · Applied AI',
  location: 'Istanbul, Türkiye',
  photo: { src: '/images/profile/mert-kaya.jpg', alt: 'Portrait of Mert Kaya' },
  summary:
    'Computer Engineering graduate from Istanbul Kültür University. I build full-stack systems with Spring Boot and Angular, and applied-AI tools with Python, OpenCV and LLMs. Nine years of competitive volleyball taught me how good teams work — and I am looking for my next one.',
  availability: 'Open to new opportunities',
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
    position: 'Outside Hitter',
    positionNote:
      'Outside Hitter — and whichever position the team is missing that day. Same on a dev team.',
    jerseyNumber: '9',
    startedIn: '2017',
  },
  // The Sport section: medal count (sports + math competitions) and the story behind it
  sport: {
    medals: 16,
    highlights: [
      {
        label: 'Volleyball',
        icon: 'volleyball',
        text: 'Nine seasons of competitive volleyball — today an outside hitter, #9.',
      },
      {
        label: 'High school',
        icon: 'medal',
        text: 'Volleyball and athletics throughout high school, with medals at inter-high-school tournaments.',
      },
      {
        label: 'Orienteering & athletics',
        icon: 'compass',
        text: 'Medals in orienteering and athletics, including short-distance running.',
      },
      {
        label: 'Math competitions',
        icon: 'math',
        text: 'Medals in math competitions too, including olympiad-style contests.',
      },
    ],
  },
  gaming: {
    game: 'Counter-Strike 2',
    shortName: 'CS2',
    platform: 'FACEIT',
    level: 10,
    profileUrl: 'https://www.faceit.com/en/players/Mhelling',
  },
}
