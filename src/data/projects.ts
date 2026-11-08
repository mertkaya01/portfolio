import type { Project } from '../types/content.ts'

/*
  To add a project: copy one object, change the fields, done. The UI picks it up.
  - featured: true  → needs the full case study (problem, solution, decisions …) and gets its own page
  - featured: false → compact card only
  Images go in public/images/projects/<slug>/ and are referenced as /images/projects/<slug>/file.png
  Order here = order on the site.
*/
export const projects: Project[] = [
  // ───────────────────────────── Featured ─────────────────────────────
  {
    slug: 'hotel-commerce-service',
    shortTitle: 'Hotel Commerce',
    featured: true,
    title: 'Hotel Commerce Service',
    tagline: 'Full-stack hotel search and booking platform built on a real hotel dataset.',
    status: 'completed',
    context: 'internship',
    role: 'Solo developer — backend, search, frontend, CI and deployment.',
    period: '2026 · BTC Bilişim internship',
    stack: [
      'Java 21',
      'Spring Boot 3.5',
      'Spring Security',
      'JWT',
      'Spring Data JPA',
      'H2',
      'Apache Solr 9',
      'Angular',
      'Angular Material',
      'Docker',
      'GitHub Actions',
      'JUnit 5',
      'Mockito',
      'Vitest',
      'Swagger / OpenAPI',
      'Vercel',
      'Render',
    ],
    problem:
      'Hotel search has to feel instant across thousands of hotels — full-text, filters, facet counts and price ranges at once — while bookings must never collide and hosts must not be able to publish listings nobody has reviewed.',
    solution:
      'A Spring Boot API with H2 as the source of truth and Apache Solr as a dedicated search index, an Angular front end, and three roles: guests, hosts and a platform admin. The data comes from a real hotel dataset (TBO Hotels on Kaggle, 1M+ rows); the repo ships a ~5,000-hotel subset so it runs out of the box.',
    decisions: [
      {
        title: 'The search index is the publish gate',
        why: "A host's new hotel is saved in H2 as PENDING but not indexed. It reaches Solr only when the platform admin approves it, so unapproved hotels simply cannot be found. A unit test (HotelListingServiceTest) locks the rule in.",
      },
      {
        title: 'Separate fields for searching, filtering and sorting',
        why: 'City is stored both as a string (exact filters and facet counts) and as analyzed text (case-insensitive search), so typing "berlin" finds every hotel in Berlin. Sorting got its own fields because text fields cannot be sorted and string ratings sort alphabetically (FIVE < FOUR < ONE).',
      },
      {
        title: 'Overlapping bookings caught in one query',
        why: 'A second reservation for the same room is rejected with the classic interval check `checkIn < :checkOut AND checkOut > :checkIn` in a single JPQL query.',
      },
      {
        title: 'A search index that heals itself',
        why: 'H2 is the durable source. On startup a reindex runner rebuilds Solr if the index is missing — or if documents lack a newly added field, because counting documents alone misses schema changes.',
      },
      {
        title: 'Secure by default',
        why: "User IDs come from the verified JWT, never from the URL or body, so nobody can cancel someone else's booking. Login errors don't reveal which emails exist. Uploaded files get a generated UUID name, and content type and extension are checked separately.",
      },
    ],
    highlights: [
      'Full-text search with country / city / star facets, price-range filter, sorting and paging',
      'Reservations with date-conflict checks and cancellation; favourites',
      'Host applications reviewed and approved by the platform admin',
      'Email verification and an admin audit log of who did what, and when',
      'CI on every push; Docker Compose starts the whole stack with one command',
    ],
    limitations: [
      'Hotel photos, reviews and nightly prices are demo values (the dataset has none), so there is no price sort across all hotels.',
    ],
    media: [],
    links: {
      repo: 'https://github.com/mertkaya01/Hotel-Commerce-Service',
      demo: 'https://hotel-commerce-service.vercel.app',
      demoNote:
        'Completed, full stack: the backend — Java 21 and Spring Boot with H2 and Apache Solr — is in the GitHub repo, and one Docker Compose command runs the whole system. The live demo currently hosts only the Angular front end.',
      related: [{ label: 'Uptime Monitor', href: '/projects/uptime-monitor' }],
    },
  },
  {
    slug: 'hotel-ai-concierge',
    shortTitle: 'AI Concierge',
    featured: true,
    title: 'Hotel AI Concierge',
    tagline:
      'A WhatsApp assistant that understands free-form requests and searches the real hotel API through LLM tool calling.',
    status: 'prototype',
    context: 'internship',
    role: 'Solo developer.',
    period: '2026 · BTC Bilişim internship',
    stack: [
      'Node.js',
      'whatsapp-web.js',
      'OpenAI-compatible SDK',
      'Groq',
      'Gemini',
      'Ollama',
      'Tool calling',
    ],
    problem:
      'The first WhatsApp bot was rule-based: it asked for city, dates and guests one step at a time and fell apart as soon as someone wrote naturally — "find a 4-star place in Antalya under 2000 TL this weekend".',
    solution:
      'An LLM now reads the message and decides which tools to call — search hotels, get details, list rooms — against the real Hotel Commerce Service API, then answers in natural language. The WhatsApp layer stayed the same; only the "brain" changed.',
    decisions: [
      {
        title: 'An agent loop instead of a single prompt',
        why: 'Think → call a tool → read the result → think again → answer. The loop lives in its own module (src/ai/agent.js), separate from WhatsApp.',
      },
      {
        title: 'Every tool has two halves',
        why: 'A schema the model sees, and an executor that makes the real HTTP call to the hotel backend. The model can only act through endpoints that already exist and are already secured.',
      },
      {
        title: 'Provider-agnostic',
        why: 'An OpenAI-compatible client means switching between Groq, Gemini and a local Ollama model is a change in .env, not in code.',
      },
      {
        title: '"Never make it up"',
        why: 'The system prompt forbids answering hotel questions from memory: every hotel, price and room must come from a tool call.',
      },
    ],
    highlights: [
      'Turns free-form Turkish messages into structured hotel searches',
      'Reuses the Hotel Commerce Service backend without changing it',
      'Layered: transport · AI · conversation state · handlers',
    ],
    limitations: [
      'Conversation history is kept in memory, so it resets when the bot restarts.',
      'Runs on whatsapp-web.js, an unofficial WhatsApp Web client — fine for a demo, not for production traffic.',
    ],
    media: [],
    links: {
      repo: 'https://github.com/mertkaya01/WhatsAppHotelSearchBot-AI',
      related: [
        { label: 'Rule-based predecessor', href: '/projects/hotel-whatsapp-bot' },
        { label: 'Hotel Commerce Service', href: '/projects/hotel-commerce-service' },
      ],
    },
  },
  {
    slug: 'exam-verification-engine',
    shortTitle: 'Exam Engine',
    featured: true,
    title: 'Exam Layout Verification Engine',
    tagline:
      'Computer-vision engine that checks scanned exam papers against their templates and reports how confident it is.',
    status: 'prototype',
    context: 'team',
    role: "My part of a team exam-evaluation system: I built the layout parser and this verification engine, which was integrated into the team's FastAPI grading backend. Teammates built the Electron exam generator and the grading backend itself.",
    period: '2026 · Software Engineering course',
    stack: ['Python', 'OpenCV', 'NumPy', 'PyMuPDF', 'JSON templates'],
    problem:
      'Exams are printed, filled in by hand and scanned back — crooked, blurred or shifted. Before anything can be graded, the system must know exactly where every question box is on each scanned page, and whether the scan is good enough to trust.',
    solution:
      "The engine takes a scanned page and the exam's JSON template, checks scan quality, finds four bullseye anchors, straightens the page with a homography, then verifies each question region and detects the student's marks. It outputs an annotated image and a report with a PASS / PARTIAL / FAIL result.",
    decisions: [
      {
        title: 'Exam layouts are data, not code',
        why: 'Every exam format is described in a JSON template, so a new exam needs a new template — not new code.',
      },
      {
        title: 'Anchors and a homography',
        why: 'Four bullseye markers in the corners give a perspective transform that undoes the rotation and skew introduced by printing and scanning.',
      },
      {
        title: 'Check the scan before reading it',
        why: 'Blur, rotation and brightness are measured first, so a bad scan lowers the confidence instead of producing a confident wrong answer.',
      },
      {
        title: 'One detector per question type',
        why: 'Circle fill for multiple choice, square fill for multi-select, box content for matching and fill-in-the-blank, writing density for open-ended answers.',
      },
    ],
    highlights: [
      'PDF pages converted to 300 DPI images with PyMuPDF',
      'Tools to compare several scans and to generate rotated / blurred test variants',
      'Started as the Exam Layout Parser and grew into the verification engine',
      "Integrated into the team's FastAPI grading backend",
    ],
    limitations: ['Built and tested against the course exam templates, not other exam formats.'],
    media: [],
    links: {
      repo: 'https://github.com/mertkaya01/Exam-Validator-V1',
      related: [
        {
          label: 'Exam Layout Parser (first version)',
          href: 'https://github.com/mertkaya01/ExamLayoutParser',
        },
        {
          label: 'Team repo: exam generator (Electron)',
          href: 'https://github.com/faruksevuk/iku-exam-generator',
        },
        {
          label: 'Team repo: grading backend (FastAPI)',
          href: 'https://github.com/faruksevuk/iku-exam-backend',
        },
      ],
    },
  },
  {
    slug: 'marketplace',
    shortTitle: 'Marketplace',
    featured: true,
    title: 'Marketplace',
    tagline:
      'Multi-vendor B2C marketplace for buyers, sellers and admins, built with Spring Boot and Angular.',
    status: 'completed',
    context: 'internship',
    role: 'Solo developer.',
    period: '2026 · BTC Bilişim internship',
    stack: [
      'Java 21',
      'Spring Boot 3.5',
      'Spring Security',
      'JWT',
      'Spring Data JPA',
      'H2',
      'PostgreSQL',
      'Angular 22',
      'Signals',
      'SCSS',
      'OpenAPI / Swagger',
    ],
    problem:
      'A Trendyol-style marketplace has three kinds of users with different powers, products with variants and stock, and a checkout where price, stock and coupons must stay consistent even if something changes mid-purchase.',
    solution:
      'A layered Spring Boot API (entity → repository → service → controller, DTOs at every boundary) and an Angular 22 front end with standalone components, signals and lazy routes. Buyers shop and track orders, sellers manage products and fulfil orders, admins approve new sellers.',
    decisions: [
      {
        title: 'Refresh-token rotation with reuse detection',
        why: 'Every refresh issues a new refresh token; an old one used again is detected as reuse.',
      },
      {
        title: 'Checkout in a single transaction',
        why: 'Stock is decremented, address and prices are snapshotted and the coupon is applied together — so later price changes never rewrite past orders.',
      },
      {
        title: 'Search behind an abstraction',
        why: 'Filtering, sorting and paging use JPA Specifications behind an interface that could later be backed by Solr.',
      },
      {
        title: 'Database-agnostic by configuration',
        why: 'File-based H2 in development, PostgreSQL in production, switched by config only.',
      },
    ],
    highlights: [
      'Product variants (colour / size) with their own price and stock',
      'Cart → checkout → order tracking with a shipping timeline',
      'Seller dashboard: revenue, orders, rating, low-stock warnings',
      'Coupons, verified-buyer reviews, Q&A, dark / light theme, TR / EN',
    ],
    limitations: ['No live demo — it runs locally from the repository.'],
    media: [],
    links: { repo: 'https://github.com/mertkaya01/marketplace-website' },
  },

  // ───────────────────────────── More projects ─────────────────────────────
  {
    slug: 'uptime-monitor',
    shortTitle: 'Uptime Monitor',
    featured: false,
    title: 'Uptime Monitor',
    tagline:
      'Pings a list of services on a schedule with OpenFeign, shows up / down and latency, and keeps free-tier deployments awake.',
    status: 'completed',
    context: 'internship',
    role: 'Solo developer.',
    period: '2026',
    stack: ['Java', 'Spring Boot', 'OpenFeign', 'Scheduling'],
    links: { repo: 'https://github.com/mertkaya01/uptime-monitor' },
  },
  {
    slug: 'hotel-whatsapp-bot',
    shortTitle: 'Hotel Bot',
    featured: false,
    title: 'Hotel Reservation WhatsApp Bot',
    tagline:
      'Rule-based WhatsApp bot that walks users through a hotel search step by step and books with their own account via the Java API.',
    status: 'completed',
    context: 'internship',
    role: 'Solo developer.',
    period: '2026',
    stack: ['Node.js', 'whatsapp-web.js', 'Finite-state machine', 'REST'],
    links: { repo: 'https://github.com/mertkaya01/Hotel-Commerce-WhatsApp-Bot' },
  },
  {
    slug: 'zenith-whatsapp-bot',
    shortTitle: 'Zenith Bot',
    featured: false,
    title: 'Zenith — WhatsApp Command Bot',
    tagline:
      'Command bot built to practise clean, layered architecture: adding a command means adding one file.',
    status: 'completed',
    context: 'internship',
    role: 'Solo developer.',
    period: '2026',
    stack: ['Node.js', 'whatsapp-web.js'],
    links: { repo: 'https://github.com/mertkaya01/zenith-whatsapp-command-bot' },
  },
  {
    slug: 'weather-currency-bot',
    shortTitle: 'Weather Bot',
    featured: false,
    title: 'Weather & Currency WhatsApp Bot',
    tagline:
      'Answers weather and currency commands with live data from the free Open-Meteo and Frankfurter APIs.',
    status: 'completed',
    context: 'internship',
    role: 'Solo developer.',
    period: '2026',
    stack: ['Node.js', 'whatsapp-web.js', 'axios', 'Open-Meteo', 'Frankfurter'],
    links: {
      repo: 'https://github.com/mertkaya01/WhatsAppBot4-weather-updates-currency-transfers',
    },
  },
  {
    slug: 'capstone-secure-network',
    shortTitle: 'Capstone',
    featured: false,
    title: 'Cyber-Secure Network for a Small Company',
    tagline:
      'Graduation project: a virtualized corporate network with separate Extranet and Intranet zones — NAT and firewalls at two gateways, Snort intrusion detection, a Squid proxy filtering outbound web access and OpenLDAP for central login.',
    status: 'completed',
    context: 'university',
    role: 'Team lead — designed and built the network testbed (team of three).',
    period: '2025–2026 · Graduation project',
    stack: [
      'Oracle VirtualBox',
      'Ubuntu Server',
      'iptables',
      'Snort',
      'Squid',
      'Apache',
      'Dnsmasq',
      'OpenLDAP',
    ],
    links: {},
  },
  {
    slug: 'linguatype',
    shortTitle: 'LinguaType',
    featured: false,
    title: 'LinguaType',
    tagline: 'Monkeytype-style typing test that doubles as a bilingual EN ↔ TR vocabulary trainer.',
    status: 'in-progress',
    context: 'personal',
    role: 'Solo developer.',
    period: '2026',
    stack: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Vitest', 'Testing Library'],
    links: {}, // private: the code is not published
  },
  {
    slug: 'data-analysis-engine',
    shortTitle: 'Data Engine',
    featured: false,
    title: 'Dynamic Data Analysis Engine',
    tagline:
      'Command-line tool that cleans raw CSV data with Pandas, derives new columns and stores the results in SQLite.',
    status: 'completed',
    context: 'personal',
    role: 'Solo developer.',
    period: '2023',
    stack: ['Python', 'Pandas', 'SQLite', 'argparse'],
    links: { repo: 'https://github.com/mertkaya01/Dynamic-Data-Analysis-Engine-with-Python' },
  },
]
