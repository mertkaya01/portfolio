// npm run og
// Draws the link preview (public/og.png, 1200 × 630): what LinkedIn, WhatsApp, Slack … show
// when someone pastes the site's address. Made from an HTML card in a headless Chrome, with the
// site's own fonts, colours and photo. Run it again after changing the name, role or photo.
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
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

const file = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, name) => file(`node_modules/@fontsource-variable/${pkg}/files/${name}`)

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: Display; src: url(${font('big-shoulders', 'big-shoulders-latin-wght-normal.woff2')}); font-weight: 100 900; }
  @font-face { font-family: Mono; src: url(${font('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')}); font-weight: 100 800; }
  @font-face { font-family: Sans; src: url(${font('inter', 'inter-latin-wght-normal.woff2')}); font-weight: 100 900; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0a0b0d; color: #e6edf5; font-family: Sans; overflow: hidden; position: relative; }
  /* the court under it all: a centre line, the attack line, the floor's warm glow */
  .court { position: absolute; inset: 0; background:
      radial-gradient(ellipse 70% 60% at 72% 110%, rgb(201 139 82 / 0.28), transparent 70%),
      radial-gradient(ellipse 50% 50% at 15% 0%, rgb(255 210 63 / 0.10), transparent 70%); }
  .line { position: absolute; background: rgb(230 237 245 / 0.08); }
  .photo { position: absolute; left: 80px; top: 95px; width: 360px; height: 440px; border-radius: 28px; overflow: hidden;
    box-shadow: 0 30px 80px rgb(0 0 0 / 0.55), 0 0 0 1px rgb(230 237 245 / 0.12); }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .nine { position: absolute; left: 392px; top: 470px; width: 92px; height: 92px; border-radius: 50%; background: #ffd23f; color: #0a0b0d;
    font: 900 60px/92px Display; text-align: center; box-shadow: 0 0 40px rgb(255 210 63 / 0.45); }
  .text { position: absolute; left: 530px; right: 50px; top: 96px; }
  .kicker { font: 600 20px Mono; letter-spacing: 0.32em; color: #c98b52; text-transform: uppercase; }
  h1 { margin-top: 16px; font: 900 124px/0.86 Display; letter-spacing: -0.01em; text-transform: uppercase; }
  h1 span { color: #ffd23f; }
  .role { margin-top: 26px; font: 500 28px/1.35 Sans; color: rgb(230 237 245 / 0.92); white-space: nowrap; }
  .meta { margin-top: 30px; display: flex; gap: 12px; }
  .chip { font: 600 16px Mono; letter-spacing: 0.06em; padding: 9px 14px; white-space: nowrap; border-radius: 999px; border: 1px solid rgb(230 237 245 / 0.18); color: rgb(230 237 245 / 0.85); }
  .chip.go { border-color: rgb(74 222 128 / 0.5); color: #4ade80; }
</style></head><body>
  <div class="court"></div>
  <div class="line" style="left:0;right:0;top:600px;height:2px"></div>
  <div class="line" style="left:500px;top:0;bottom:0;width:2px"></div>
  <div class="photo"><img src="${file('public/images/profile/mert-kaya.jpg')}"></div>
  <div class="nine">9</div>
  <div class="text">
    <p class="kicker">Beyond the court</p>
    <h1>Mert<br>Kaya<span>.</span></h1>
    <p class="role">Computer Engineer<br>Backend · Full-stack · Applied AI</p>
    <div class="meta">
      <span class="chip go">● Available now</span>
      <span class="chip">Istanbul · office / hybrid / remote</span>
    </div>
  </div>
</body></html>`

const browser = await puppeteer.launch({ executablePath, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630 })
// opened as a file, so the card may load the fonts and the photo from disk
const card = join(tmpdir(), 'mert-kaya-og-card.html')
writeFileSync(card, html)
await page.goto(pathToFileURL(card).href, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'public/og.png' })
await browser.close()
rmSync(card)
console.log('✔ public/og.png')
