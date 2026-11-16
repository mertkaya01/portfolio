// npm run test:e2e
// Browser checks of the real site, in a headless Chrome or Edge already on this computer.
//   1. dev server (quest switched on): portfolio, links, the quest from start to finish, phone
//   2. production build (like the live site): the quest is there, Skip, deep links
// Set E2E_BROWSER to a browser .exe if neither default path exists.
import { existsSync } from 'node:fs'

import puppeteer from 'puppeteer-core'
import { build, createServer, preview } from 'vite'

const BROWSERS = [
  process.env.E2E_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)
const executablePath = BROWSERS.find((p) => existsSync(p))
if (!executablePath) throw new Error('No Chrome/Edge found — set E2E_BROWSER')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const check = (name, ok, extra = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  — ${extra}` : ''}`)
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--hide-scrollbars'],
})

async function open(base, path = '/', viewport = { width: 1280, height: 900 }) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  page.problems = []
  page.on('pageerror', (e) => page.problems.push(e.message))
  page.on('console', (m) => m.type() === 'error' && page.problems.push(m.text()))
  await page.goto(base + path, { waitUntil: 'networkidle0' })
  await sleep(500)
  return page
}
const top = (page, id) =>
  page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top), id)
const quest = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('dialog')
    return {
      open: !!d?.open,
      hud: d?.querySelector('header p')?.textContent ?? '',
      transition: !!d?.querySelector('[data-transition]'),
      said: d?.querySelector('[aria-live]')?.textContent ?? '', // what a screen reader hears
      art: d?.querySelector('[role="img"]')?.getAttribute('aria-label') ?? '',
      caption: d?.querySelector('figure + div p:last-of-type')?.textContent ?? '',
      play: d?.querySelector('footer button[aria-label]')?.getAttribute('aria-label') ?? '',
    }
  })

// ---------- 1. dev server: everything on ----------
const dev = await createServer({ logLevel: 'error', server: { port: 5199, strictPort: false } })
await dev.listen()
const DEV = dev.resolvedUrls.local[0].replace(/\/$/, '')
try {
  const page = await open(DEV)

  const order = await page.evaluate(() =>
    [...document.querySelectorAll('main > section')].map((s) => s.id).join(','),
  )
  check(
    'sections in order',
    order === 'about,education,experience,projects,skills,interest,contact',
    order,
  )
  const nav = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label="Main"] ul a')]
      .map((a) => a.getAttribute('href'))
      .join(','),
  )
  check(
    'nav matches the page',
    nav === '/#education,/#experience,/#projects,/#skills,/#interest,/#contact',
    nav,
  )
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id)
    return ids.filter((id, i) => ids.indexOf(id) !== i)
  })
  check('no duplicate ids', dupes.length === 0, dupes.join(' '))
  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="#"]')]
      .map((a) => a.getAttribute('href').split('#')[1])
      .filter((id) => id && !document.getElementById(id)),
  )
  check('every #link has a target', broken.length === 0, broken.join(' '))

  // every internal project link opens a real project page
  const projectLinks = await page.evaluate(() => [
    ...new Set(
      [...document.querySelectorAll('a[href^="/projects/"]')].map((a) => a.getAttribute('href')),
    ),
  ])
  const missing = []
  for (const href of projectLinks) {
    const p = await open(DEV, href)
    if (await p.evaluate(() => document.body.textContent.includes('OUT!'))) missing.push(href)
    await p.close()
  }
  check(
    `${projectLinks.length} project links open real pages`,
    missing.length === 0,
    missing.join(' '),
  )

  // skills: every row has a level; opening one shows where it was used
  const skills = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#skills li.break-inside-avoid')]
    const unlabeled = rows.filter((r) => !/hands-on|working|familiar/i.test(r.textContent)).length
    const button = document.querySelector('#skills li button[aria-expanded]')
    button.click()
    return { rows: rows.length, unlabeled }
  })
  await sleep(200)
  const panel = await page.evaluate(() => {
    const button = document.querySelector('#skills li button[aria-expanded="true"]')
    const panel = button && document.getElementById(button.getAttribute('aria-controls'))
    return {
      open: !!panel && !panel.hidden,
      links: panel ? panel.querySelectorAll('a[href^="/projects/"]').length : 0,
    }
  })
  check(
    'skills: every technology shows a level',
    skills.rows > 30 && skills.unlabeled === 0,
    `${skills.rows} rows`,
  )
  check(
    'skills: a row opens and links its projects',
    panel.open && panel.links > 0,
    `${panel.links} links`,
  )
  check(
    'no percentages in skills',
    !(await page.evaluate(() => /d+s*%/.test(document.getElementById('skills').textContent))),
  )

  // Hotel Commerce: completed, code link only (no live demo any more), no "offline" wording
  const hotel = await open(DEV, '/projects/hotel-commerce-service')
  const hotelPage = await hotel.evaluate(() => ({
    text: document.body.textContent,
    demo: [...document.querySelectorAll('a')].some((a) => /live demo/i.test(a.textContent)),
    code: [...document.querySelectorAll('a')].some((a) =>
      a.href.includes('github.com/mertkaya01/Hotel-Commerce-Service'),
    ),
  }))
  check(
    'Hotel Commerce: completed, repo link, no demo link or "offline" wording',
    hotelPage.text.includes('Completed') &&
      hotelPage.code &&
      !hotelPage.demo &&
      !/offline|front end only/i.test(hotelPage.text),
  )
  await hotel.close()

  // the quest: Enter → set 1 → … → match point → Space → portfolio
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await sleep(300)
  await page.keyboard.press('Enter')
  await sleep(400)
  let q = await quest(page)
  check('Enter starts the quest at set 1', q.open && q.hud.includes('Set 1'), q.hud)
  check(
    'set 1 opens with its scoreboard',
    q.said === 'Set 1, High School, 07.2017 – 07.2021.' && /scoreboard/i.test(q.art),
    `${q.said} · ${q.art}`,
  )
  await page.keyboard.press('ArrowRight')
  await sleep(300)
  q = await quest(page)
  check('then the first scene, with its caption', /alarm/i.test(q.caption), q.caption)
  await page.keyboard.press('Space')
  await sleep(300)
  check('Space does not move on outside the finale', (await quest(page)).said === q.said)
  // plays by itself: the next scene comes within its time (≤ 7 s)
  const playedFrom = q.said
  for (let i = 0; i < 75 && (await quest(page)).said === playedFrom; i++) await sleep(100)
  q = await quest(page)
  check('plays by itself', q.said !== playedFrom && /bus/i.test(q.said), q.said)
  // P pauses: nothing moves for longer than any step lasts
  await page.keyboard.press('p')
  await sleep(7500)
  check(
    'P pauses it',
    (await quest(page)).said === q.said && (await quest(page)).play === 'Play',
    (await quest(page)).play,
  )
  await page.keyboard.press('p')
  const sets = new Set()
  for (let i = 0; i < 40 && !q.hud.toLowerCase().includes('match point'); i++) {
    sets.add(q.hud)
    await page.keyboard.press('ArrowRight')
    await sleep(120)
    q = await quest(page)
  }
  check(
    'all 5 sets played, match point reached',
    sets.size === 5 && q.hud.toLowerCase().includes('match point'),
  )
  // match point is a timing game now: keep swinging until the ball goes down. A miss brings
  // another ball and after the second Mert takes it himself, so this always ends.
  const finale = () =>
    page.evaluate(() => {
      const root = document.querySelector('[data-phase]')
      return { phase: root?.dataset.phase ?? '', ring: !!root?.dataset.ring }
    })
  for (let i = 0; i < 60 && !(await finale()).phase; i++) await sleep(100)
  check('match point is played in 3D', (await finale()).phase !== '')
  await page.keyboard.press('Space') // before the ball is up: nothing happens
  await sleep(300)
  check('a swing before the ball is up does nothing', !(await quest(page)).transition)
  let swung = 0
  for (let i = 0; i < 120 && !(await quest(page)).transition; i++) {
    if ((await finale()).ring) {
      await page.keyboard.press('Space')
      swung++
    }
    await sleep(250)
  }
  check(
    'Space spikes until the point → transition',
    (await quest(page)).transition,
    `${swung} swings`,
  )
  await sleep(1600)
  q = await quest(page)
  check('ends on the player card', !q.open && Math.abs((await top(page, 'about')) - 80) <= 3)

  // Esc skips from the middle of the quest
  await page.evaluate(() =>
    [...document.querySelectorAll('footer button')]
      .find((b) => b.textContent.includes('Replay'))
      ?.click(),
  )
  await sleep(400)
  // on the way: a photo by the Havel opens, and Esc closes the photo — not the quest
  for (let i = 0; i < 40 && !/Six months/.test((await quest(page)).said); i++) {
    await page.keyboard.press('ArrowRight')
    await sleep(150)
  }
  await sleep(1800) // the spots pop in
  const spot = await page.$('[aria-label^="Photo:"]')
  await spot?.click()
  await sleep(600)
  const photoOpen = await page.evaluate(
    () => !!document.querySelector('dialog[data-quest-photo]')?.open,
  )
  await page.keyboard.press('Escape')
  await sleep(500)
  const afterEsc = await page.evaluate(() => ({
    photo: !!document.querySelector('dialog[data-quest-photo]'),
    transition: !!document.querySelector('[data-transition]'),
  }))
  check(
    'a Havel photo opens; Esc closes the photo, not the quest',
    !!spot && photoOpen && !afterEsc.photo && !afterEsc.transition,
    JSON.stringify({ spot: !!spot, photoOpen, ...afterEsc }),
  )
  await page.keyboard.press('Escape')
  await sleep(1600)
  check('replay, then Esc skips to the portfolio', !(await quest(page)).open)
  check('no console errors (desktop)', page.problems.length === 0, page.problems.join(' | '))
  await page.close()

  // phone
  const phone = await open(DEV, '/', { width: 375, height: 812, isMobile: true, hasTouch: true })
  const overflow = await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  check('phone: no sideways overflow', !overflow)
  await phone.tap('#top button')
  await sleep(500)
  q = await quest(phone)
  check('phone: Start opens the quest', q.open)
  check('no console errors (phone)', phone.problems.length === 0, phone.problems.join(' | '))
  await phone.close()

  // less motion: the quest waits for the visitor instead of playing by itself
  const calm = await open(DEV)
  await calm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await calm.reload({ waitUntil: 'networkidle0' })
  await sleep(400)
  await calm.keyboard.press('Enter')
  await sleep(4500)
  q = await quest(calm)
  check(
    'reduced motion: starts paused, stays on the scoreboard',
    q.play === 'Play' && q.said.startsWith('Set 1,'),
    `${q.play} · ${q.said}`,
  )
  check('no console errors (reduced motion)', calm.problems.length === 0, calm.problems.join(' | '))
  await calm.close()

  // Turkish: the switch in the nav, everything translated, remembered after a reload
  const trPage = await open(DEV)
  await trPage.evaluate(() => document.querySelector('nav button[lang="tr"]').click())
  await sleep(400)
  const trHome = await trPage.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    nav: [...document.querySelectorAll('nav[aria-label] ul a')].map((a) => a.textContent).join(','),
    skills: document.getElementById('skills-title')?.textContent,
    dates: document.getElementById('experience').textContent,
    text: document.querySelector('main').textContent,
    meta: document.querySelector('meta[name="description"]').content,
  }))
  check(
    'TR: html lang and meta description switch',
    trHome.lang === 'tr' && trHome.meta.includes('Bilgisayar Mühendisi'),
  )
  check(
    'TR: nav in Turkish',
    trHome.nav === 'Eğitim,Deneyim,Projeler,Yetenekler,İlgi Alanları,İletişim',
    trHome.nav,
  )
  check(
    'TR: sections and dates in Turkish',
    trHome.skills === 'Yetenekler ve Teknolojiler' &&
      /Tem 2026/.test(trHome.dates) &&
      /\d ay/.test(trHome.dates),
    `${trHome.skills} · ${trHome.dates.slice(0, 120)}`,
  )
  const leftovers = [
    'Looking for',
    'Case study',
    'Skills & Technologies',
    'Where I',
    'Download CV',
    'Scouting report',
    'Open to new',
    'Built here',
    'Medals',
  ].filter((phrase) => trHome.text.includes(phrase))
  check(
    'TR: no English interface text left on the page',
    leftovers.length === 0,
    leftovers.join(' | '),
  )
  await trPage.reload({ waitUntil: 'networkidle0' })
  await sleep(400)
  check(
    'TR: the choice survives a reload',
    (await trPage.evaluate(() => document.documentElement.lang)) === 'tr',
  )
  const trProject = await open(DEV, '/projects/hotel-commerce-service')
  const trProjectText = await trProject.evaluate(() => document.body.textContent)
  check(
    'TR: project page in Turkish',
    trProjectText.includes('Koda bak') &&
      trProjectText.includes('Önemli kararlar') &&
      trProjectText.includes('Tamamlandı'),
  )
  await trProject.close()
  await trPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await sleep(300)
  await trPage.keyboard.press('Enter')
  await sleep(400)
  q = await quest(trPage)
  check(
    'TR: the quest in Turkish',
    q.hud.includes('Lise') && q.said === 'Set 1, Lise, 07.2017 – 07.2021.' && q.play === 'Duraklat',
    `${q.hud} · ${q.said} · ${q.play}`,
  )
  await trPage.keyboard.press('ArrowRight')
  await sleep(300)
  q = await quest(trPage)
  check('TR: captions in Turkish', q.caption.startsWith('Lisede sıradan bir gün'), q.caption)
  await trPage.keyboard.press('Escape')
  await sleep(1600)
  check('no console errors (Turkish)', trPage.problems.length === 0, trPage.problems.join(' | '))
  // back to English for anything that runs after this
  await trPage.evaluate(() => localStorage.removeItem('beyond-the-court:locale'))
  await trPage.close()
} finally {
  await dev.close()
}

// ---------- 2. production build: like the live site ----------
// (the dev server above set NODE_ENV=development for this process; a build would inherit it)
process.env.NODE_ENV = 'production'
await build({ logLevel: 'error', build: { outDir: 'node_modules/.e2e-dist', emptyOutDir: true } })
const prod = await preview({
  logLevel: 'error',
  preview: { port: 4199 },
  build: { outDir: 'node_modules/.e2e-dist' },
})
const PROD = prod.resolvedUrls.local[0].replace(/\/$/, '')
try {
  const page = await open(PROD)
  const doors = await page.evaluate(() => ({
    start: [...document.querySelectorAll('#top button')].some((b) =>
      b.textContent.includes('Start'),
    ),
    skip: document.querySelector('#top a')?.textContent ?? '',
    replay: [...document.querySelectorAll('footer button')].some((b) =>
      b.textContent.includes('Replay'),
    ),
  }))
  check('live build: the quest is on (Start, Replay)', doors.start && doors.replay)
  check('live build: a Skip door to the portfolio', doors.skip.includes('Skip'), doors.skip)
  await page.keyboard.press('Enter')
  await sleep(800)
  check('live build: Enter starts the quest', (await quest(page)).open)
  await page.keyboard.press('Escape')
  await sleep(1600)
  check(
    'live build: Esc skips to the portfolio',
    !(await quest(page)).open && (await top(page, 'about')) < 200,
  )
  const deep = await open(PROD, '/projects/marketplace')
  check(
    'live build: deep link to a project works',
    (await deep.evaluate(() => document.querySelector('h1')?.textContent ?? '')).length > 0,
  )
  check(
    'no console errors (live build)',
    page.problems.length + deep.problems.length === 0,
    [...page.problems, ...deep.problems].join(' | '),
  )
} finally {
  await new Promise((r) => prod.httpServer.close(r))
}

await browser.close()
const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
