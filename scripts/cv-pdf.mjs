// npm run cv
// Prints the CV (design/cv/Mert-Kaya-CV.html) to public/cv/Mert-Kaya-CV.pdf — the file the
// site's "CV" buttons download — in a headless Chrome or Edge already on this computer.
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import puppeteer from 'puppeteer-core'

const BROWSERS = [
  process.env.E2E_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)
const executablePath = BROWSERS.find((p) => existsSync(p))
if (!executablePath) throw new Error('No Chrome/Edge found — set E2E_BROWSER')

const browser = await puppeteer.launch({ executablePath, headless: true })
const page = await browser.newPage()
await page.goto(pathToFileURL(resolve('design/cv/Mert-Kaya-CV.html')).href, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.pdf({
  path: 'public/cv/Mert-Kaya-CV.pdf',
  preferCSSPageSize: true,
  printBackground: true,
})
// a rough page count (an A4 page holds about 1047 px of this layout): a warning when the CV
// no longer fits on one page
const pages = await page.evaluate(() => Math.ceil(document.body.scrollHeight / 1047))
await browser.close()
console.log(`✔ public/cv/Mert-Kaya-CV.pdf (about ${pages} page${pages > 1 ? 's' : ''})`)
