import type { SkillGroup } from '../types/content.ts'

// Grouped by area. `evidence` links a skill to the projects where it was used;
// `detail` says what exactly — or how far (e.g. "beginner level", from the CV).
// The three `main` groups are the core stack: they come first and are marked "Core".
export const skillGroups: SkillGroup[] = [
  {
    title: 'Backend',
    summary: 'REST APIs, security and data access — mostly Java and Spring Boot.',
    color: 'cyan',
    main: true,
    skills: [
      { name: 'Java', evidence: ['hotel-commerce-service', 'marketplace', 'uptime-monitor'] },
      {
        name: 'Spring Boot',
        evidence: ['hotel-commerce-service', 'marketplace', 'uptime-monitor'],
      },
      { name: 'Spring Security · JWT', evidence: ['hotel-commerce-service', 'marketplace'] },
      { name: 'JPA / Hibernate · SQL', evidence: ['hotel-commerce-service', 'marketplace'] },
      { name: 'REST API design', evidence: ['hotel-commerce-service', 'marketplace'] },
      {
        name: 'Node.js',
        evidence: ['hotel-ai-concierge', 'hotel-whatsapp-bot', 'zenith-whatsapp-bot'],
      },
    ],
  },
  {
    title: 'Frontend',
    summary: 'Single-page apps in Angular and React, written in TypeScript.',
    color: 'amber',
    main: true,
    skills: [
      {
        name: 'TypeScript · JavaScript',
        evidence: ['hotel-commerce-service', 'marketplace', 'linguatype'],
      },
      { name: 'Angular', evidence: ['hotel-commerce-service', 'marketplace'] },
      { name: 'React', evidence: ['linguatype'] },
      { name: 'Tailwind CSS', evidence: ['linguatype'] },
      { name: 'HTML · CSS', evidence: ['hotel-commerce-service', 'marketplace', 'linguatype'] },
    ],
  },
  {
    title: 'AI & Computer Vision',
    summary: 'Computer vision in Python and LLM agents that call real APIs.',
    color: 'coral',
    main: true,
    skills: [
      { name: 'Python', evidence: ['exam-verification-engine', 'data-analysis-engine'] },
      { name: 'OpenCV', evidence: ['exam-verification-engine'] },
      { name: 'LLM tool calling · agents', evidence: ['hotel-ai-concierge'] },
    ],
  },
  {
    title: 'Data & Search',
    summary: 'Full-text search and relational databases.',
    color: 'sand',
    skills: [
      { name: 'Apache Solr', evidence: ['hotel-commerce-service'] },
      {
        name: 'PostgreSQL · H2 · SQLite',
        evidence: ['marketplace', 'hotel-commerce-service', 'data-analysis-engine'],
      },
      { name: 'Pandas', evidence: ['data-analysis-engine'] },
    ],
  },
  {
    title: 'Networking & Security',
    summary: 'A segmented, monitored corporate network — my graduation project.',
    color: 'lavender',
    skills: [
      {
        name: 'Network segmentation',
        detail: 'A public Extranet (DMZ) and a private Intranet, joined only through gateways.',
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Firewall & gateway rules',
        detail: 'Border and intranet gateways that decide which traffic may cross between zones.',
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Intrusion detection',
        detail: 'Snort watching traffic at the intranet gateway for suspicious activity.',
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Proxy-based web filtering',
        detail: "A Squid proxy that mediates and filters internal users' Internet access.",
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Central authentication',
        detail: 'One identity for every user across the network with OpenLDAP.',
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Linux server administration',
        detail: 'Ubuntu Server VMs on Oracle VirtualBox, Apache web server and Dnsmasq DNS.',
        evidence: ['capstone-secure-network'],
      },
    ],
  },
  {
    title: 'DevOps & Testing',
    summary: 'Containers, CI pipelines, deployments and automated tests.',
    color: 'sage',
    skills: [
      { name: 'Docker', evidence: ['hotel-commerce-service'] },
      { name: 'GitHub Actions', evidence: ['hotel-commerce-service'] },
      { name: 'Vercel · Render', evidence: ['hotel-commerce-service'] },
      { name: 'JUnit 5 · Mockito', evidence: ['hotel-commerce-service'] },
      { name: 'Vitest', evidence: ['hotel-commerce-service', 'linguatype'] },
    ],
  },
  {
    title: 'Other languages',
    summary: 'Languages I know at a beginner level.',
    color: 'slate',
    skills: [
      { name: 'C · C++', detail: 'Beginner level' },
      { name: 'R', detail: 'Beginner level' },
    ],
  },
  {
    title: 'Creative & AI tools',
    summary: 'Design, video editing, 3D and AI tools.',
    color: 'rose',
    skills: [
      { name: 'Adobe Photoshop' },
      { name: 'Adobe Premiere Pro' },
      { name: 'Adobe After Effects' },
      { name: 'Blender' },
      { name: 'Claude' },
    ],
  },
]
