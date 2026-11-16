// Runs after `vite build` (npm run build). Adds the files a static host needs beyond the app:
// - 404.html: Render serves it, with HTTP status 404, for any address that is not a real page
//   (render.yaml only rewrites the real ones). It is the app itself, so the visitor still gets
//   the site's own "page not found" — but search engines and link checkers see a real 404.
// - sitemap.xml and robots.txt: the pages for search engines.
// Node 24 runs TypeScript files directly by stripping the types.
import { copyFileSync, writeFileSync } from 'node:fs'

import { SITE_URL } from '../src/config/site.ts'
import { projects } from '../src/data/en/projects.ts'

const DIST = 'dist'

copyFileSync(`${DIST}/index.html`, `${DIST}/404.html`)

const pages = ['/', ...projects.map((p) => `/projects/${p.slug}`)]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync(`${DIST}/sitemap.xml`, sitemap)

writeFileSync(`${DIST}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)

console.log(`✔ 404.html, sitemap.xml (${pages.length} pages), robots.txt`)
