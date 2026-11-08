import type { SkillGroup } from '../../types/content.ts'

// Grouped by area. Every skill has an honest level (see SkillLevel in types/content.ts):
// 'hands-on' only where several projects or the internship back it up, 'working' for one
// project, 'familiar' where there is no public project yet. `evidence` links a skill to the
// projects where it was used; `detail` says what exactly — or how far.
// The three `main` groups are the core stack and are marked "Core".
export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    summary: 'The languages I write — Java and TypeScript most of all.',
    color: 'slate',
    skills: [
      {
        name: 'Java',
        level: 'hands-on',
        evidence: ['hotel-commerce-service', 'marketplace', 'uptime-monitor'],
      },
      {
        name: 'TypeScript · JavaScript',
        level: 'hands-on',
        evidence: ['hotel-commerce-service', 'marketplace', 'hotel-ai-concierge', 'linguatype'],
      },
      {
        name: 'Python',
        level: 'hands-on',
        evidence: ['exam-verification-engine', 'data-analysis-engine'],
      },
      {
        name: 'SQL',
        level: 'hands-on',
        evidence: ['marketplace', 'hotel-commerce-service', 'data-analysis-engine'],
      },
      { name: 'C · C++', level: 'familiar', detail: 'Beginner level' },
      { name: 'R', level: 'familiar', detail: 'Beginner level' },
      { name: 'Arduino', level: 'familiar', detail: 'Embedded systems coursework' },
    ],
  },
  {
    title: 'Backend',
    summary: 'REST APIs, security and data access — mostly Java and Spring Boot.',
    color: 'cyan',
    main: true,
    skills: [
      {
        name: 'Spring Boot',
        level: 'hands-on',
        evidence: ['hotel-commerce-service', 'marketplace', 'uptime-monitor'],
      },
      {
        name: 'Spring Security · JWT',
        level: 'hands-on',
        evidence: ['hotel-commerce-service', 'marketplace'],
      },
      {
        name: 'JPA / Hibernate',
        level: 'hands-on',
        evidence: ['hotel-commerce-service', 'marketplace'],
      },
      {
        name: 'REST API design',
        level: 'hands-on',
        evidence: ['hotel-commerce-service', 'marketplace'],
      },
      {
        name: 'Node.js',
        level: 'hands-on',
        evidence: ['hotel-ai-concierge', 'hotel-whatsapp-bot', 'zenith-whatsapp-bot'],
      },
    ],
  },
  {
    title: 'Frontend',
    summary: 'Single-page apps in Angular and React.',
    color: 'amber',
    main: true,
    skills: [
      { name: 'Angular', level: 'hands-on', evidence: ['hotel-commerce-service', 'marketplace'] },
      {
        name: 'HTML · CSS',
        level: 'hands-on',
        evidence: ['hotel-commerce-service', 'marketplace', 'linguatype'],
      },
      { name: 'React', level: 'working', evidence: ['linguatype'] },
      { name: 'Tailwind CSS', level: 'working', evidence: ['linguatype'] },
    ],
  },
  {
    title: 'AI & Data',
    summary: 'Computer vision in Python, LLM agents that call real APIs, data cleaning.',
    color: 'coral',
    main: true,
    skills: [
      { name: 'OpenCV', level: 'hands-on', evidence: ['exam-verification-engine'] },
      { name: 'LLM tool calling · agents', level: 'hands-on', evidence: ['hotel-ai-concierge'] },
      { name: 'Pandas', level: 'working', evidence: ['data-analysis-engine'] },
      { name: 'Hugging Face / OpenAI API', level: 'familiar' },
      { name: 'PyTorch / TensorFlow', level: 'familiar' },
    ],
  },
  {
    title: 'Databases & Search',
    summary: 'Full-text search, relational and NoSQL databases.',
    color: 'sand',
    skills: [
      { name: 'Apache Solr', level: 'hands-on', evidence: ['hotel-commerce-service'] },
      {
        name: 'PostgreSQL · H2 · SQLite',
        level: 'hands-on',
        evidence: ['marketplace', 'hotel-commerce-service', 'data-analysis-engine'],
      },
      { name: 'MongoDB / DynamoDB', level: 'familiar' },
    ],
  },
  {
    title: 'DevOps & Tools',
    summary: 'Version control, containers, CI pipelines, deployments and automated tests.',
    color: 'sage',
    skills: [
      {
        name: 'Git · GitHub',
        level: 'hands-on',
        detail: 'Every project on this page lives in a Git repository on GitHub.',
      },
      { name: 'Docker', level: 'working', evidence: ['hotel-commerce-service'] },
      { name: 'GitHub Actions', level: 'working', evidence: ['hotel-commerce-service'] },
      { name: 'Vercel · Render', level: 'working', evidence: ['hotel-commerce-service'] },
      { name: 'JUnit 5 · Mockito', level: 'working', evidence: ['hotel-commerce-service'] },
      { name: 'Vitest', level: 'working', evidence: ['hotel-commerce-service', 'linguatype'] },
      {
        name: 'Linux',
        level: 'hands-on',
        detail: 'Linux Fundamentals 101–401 certificate; the servers of my graduation project.',
        evidence: ['capstone-secure-network'],
      },
    ],
  },
  {
    title: 'Networking & Security',
    summary: 'A segmented, monitored corporate network — my graduation project.',
    color: 'lavender',
    skills: [
      {
        name: 'Network segmentation',
        level: 'working',
        detail: 'A public Extranet (DMZ) and a private Intranet, joined only through gateways.',
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Firewall & gateway rules',
        level: 'working',
        detail: 'Border and intranet gateways that decide which traffic may cross between zones.',
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Intrusion detection',
        level: 'working',
        detail: 'Snort watching traffic at the intranet gateway for suspicious activity.',
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Proxy-based web filtering',
        level: 'working',
        detail: "A Squid proxy that mediates and filters internal users' Internet access.",
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Central authentication',
        level: 'working',
        detail: 'One identity for every user across the network with OpenLDAP.',
        evidence: ['capstone-secure-network'],
      },
      {
        name: 'Linux server administration',
        level: 'working',
        detail: 'Ubuntu Server VMs on Oracle VirtualBox, Apache web server and Dnsmasq DNS.',
        evidence: ['capstone-secure-network'],
      },
    ],
  },
  {
    title: 'Creative & AI tools',
    summary: 'Design, video editing, 3D and AI tools.',
    color: 'rose',
    skills: [
      { name: 'Adobe Photoshop', level: 'working' },
      { name: 'Adobe Premiere Pro', level: 'working' },
      { name: 'Adobe After Effects', level: 'working' },
      { name: 'Blender', level: 'working' },
      { name: 'Claude', level: 'working' },
    ],
  },
]
