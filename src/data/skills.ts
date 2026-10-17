import type { SkillGroup } from '../types/content.ts'

// Grouped by area, each skill backed by the projects where it was actually used.
export const skillGroups: SkillGroup[] = [
  {
    title: 'Backend',
    skills: [
      { name: 'Java', evidence: ['hotel-commerce-service', 'marketplace', 'uptime-monitor'] },
      {
        name: 'Spring Boot',
        evidence: ['hotel-commerce-service', 'marketplace', 'uptime-monitor'],
      },
      { name: 'Spring Security · JWT', evidence: ['hotel-commerce-service', 'marketplace'] },
      { name: 'JPA / Hibernate', evidence: ['hotel-commerce-service', 'marketplace'] },
      { name: 'REST API design', evidence: ['hotel-commerce-service', 'marketplace'] },
      {
        name: 'Node.js',
        evidence: ['hotel-ai-concierge', 'hotel-whatsapp-bot', 'zenith-whatsapp-bot'],
      },
      { name: 'Python', evidence: ['exam-verification-engine', 'data-analysis-engine'] },
    ],
  },
  {
    title: 'Frontend',
    skills: [
      { name: 'Angular', evidence: ['hotel-commerce-service', 'marketplace'] },
      { name: 'TypeScript', evidence: ['hotel-commerce-service', 'marketplace', 'linguatype'] },
      { name: 'React', evidence: ['linguatype'] },
      { name: 'Tailwind CSS', evidence: ['linguatype'] },
    ],
  },
  {
    title: 'Data & Search',
    skills: [
      { name: 'Apache Solr', evidence: ['hotel-commerce-service'] },
      {
        name: 'SQL · PostgreSQL · H2 · SQLite',
        evidence: ['marketplace', 'hotel-commerce-service', 'data-analysis-engine'],
      },
      { name: 'Pandas', evidence: ['data-analysis-engine'] },
    ],
  },
  {
    title: 'AI & Computer Vision',
    skills: [
      { name: 'OpenCV', evidence: ['exam-verification-engine'] },
      { name: 'LLM tool calling · agents', evidence: ['hotel-ai-concierge'] },
    ],
  },
  {
    title: 'DevOps & Testing',
    skills: [
      { name: 'Docker', evidence: ['hotel-commerce-service'] },
      { name: 'GitHub Actions', evidence: ['hotel-commerce-service'] },
      { name: 'Vercel · Render', evidence: ['hotel-commerce-service'] },
      { name: 'JUnit 5 · Mockito', evidence: ['hotel-commerce-service'] },
      { name: 'Vitest', evidence: ['hotel-commerce-service', 'linguatype'] },
    ],
  },
  {
    title: 'Networking & Security',
    skills: [
      { name: 'Ubuntu Server · Oracle VirtualBox', evidence: ['capstone-secure-network'] },
      { name: 'iptables · NAT · network zoning', evidence: ['capstone-secure-network'] },
      { name: 'Snort IDS · Squid proxy', evidence: ['capstone-secure-network'] },
      { name: 'OpenLDAP · Apache · Dnsmasq', evidence: ['capstone-secure-network'] },
    ],
  },
]
