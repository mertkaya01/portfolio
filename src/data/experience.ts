import type { Experience } from '../types/content.ts'

// Newest first. Bullets come from the CV; keep them factual.
export const experience: Experience[] = [
  {
    company: 'BTC Bilişim Hizmetleri A.Ş.',
    role: 'Intern',
    location: 'Istanbul',
    start: '2026-07',
    end: '2026-09',
    bullets: [
      'Built a full-stack hotel search & reservation service and a multi-vendor marketplace with Spring Boot and Angular.',
      'Integrated Apache Solr for full-text search, facets and price-range filtering.',
      'Built WhatsApp automation bots with Node.js, including an LLM agent that books hotels by calling the real backend through tool calling.',
      'Set up CI with GitHub Actions, containerized with Docker and deployed to Vercel and Render.',
      'Secured REST APIs with stateless JWT, role-based access control and BCrypt.',
      'Wrote unit and integration tests with JUnit 5, Mockito and Vitest.',
    ],
    stack: [
      'Java',
      'Spring Boot',
      'Angular',
      'Apache Solr',
      'PostgreSQL',
      'Node.js',
      'Docker',
      'GitHub Actions',
    ],
    projectSlugs: [
      'hotel-commerce-service',
      'hotel-ai-concierge',
      'marketplace',
      'uptime-monitor',
      'hotel-whatsapp-bot',
      'zenith-whatsapp-bot',
      'weather-currency-bot',
    ],
  },
  {
    company: 'Modakent Tekstil',
    role: 'IT Staff',
    location: 'Istanbul',
    start: '2024-08',
    end: '2025-03',
    bullets: [
      'Installed and configured the Entegra application on 20+ workstations, streamlining the invoicing and sales workflow.',
      'Managed product data via XML and Excel for multiple sales platforms (Trendyol, N11 and the company website).',
      'Set up hardware and helped users adopt new software tools.',
    ],
    stack: ['Entegra', 'XML', 'Excel'],
    projectSlugs: [],
  },
  {
    company: 'INKA Human Resources · ME Agency · BRN&NU Agency',
    role: 'Part-time Event Staff',
    location: 'Istanbul',
    start: '2021',
    end: '2025',
    bullets: [
      'Coordinated and staffed events at Volkswagen Arena, Ülker Sports Arena, Sinan Erdem, Atatürk Cultural Center, Haliç Congress Center and TÜYAP.',
      'Ran an orienteering race for visitors at Yenikapı ISTFEST with BRN&NU and MR.DIY, greeting groups and engaging attendees one on one.',
    ],
    stack: [],
    projectSlugs: [],
  },
]
