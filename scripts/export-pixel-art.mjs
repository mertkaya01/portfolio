// npm run art:drafts
// Paints Set 1's pixel-art drafts with the scene code and saves them as PNG files:
// - public/art/set1/shotN/…    what the site loads (until Mert's own drawings replace them)
// - design/pixel-kit/drafts/…  copies to paint over in Aseprite or Photoshop
// Vite loads the TypeScript scene modules in Node, so no browser is needed.
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

import { createServer } from 'vite'

// ---- a tiny PNG encoder (RGBA, no dependencies) ----
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function png({ w, h, bytes }) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(w, 0)
  header.writeUInt32BE(h, 4)
  header[8] = 8 // bits per channel
  header[9] = 6 // RGBA
  const rows = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    Buffer.from(bytes.buffer, bytes.byteOffset + y * w * 4, w * 4).copy(rows, y * (w * 4 + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const server = await createServer({
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
})
const load = (path) => server.ssrLoadModule(`/src/quest/chapters/highschool/${path}`)

try {
  const [istanbul, school, firstMatch, aydin] = await Promise.all([
    load('istanbul.ts'),
    load('school.ts'),
    load('firstmatch.ts'),
    load('aydin.ts'),
  ])
  const files = [
    ['shot1/background.png', istanbul.paintIstanbulBackground(), true],
    ['shot2/background.png', school.paintSchoolBackground(), true],
    ['shot2/kid.png', school.paintKidSheet(), false],
    ['shot3/background.png', firstMatch.paintFirstMatchBackground(), true],
    ['shot4/background.png', aydin.paintAydinBackground(), true],
  ]
  mkdirSync('design/pixel-kit/drafts', { recursive: true })
  for (const [name, buffer, draft] of files) {
    const file = png(buffer)
    mkdirSync(`public/art/set1/${name.split('/')[0]}`, { recursive: true })
    writeFileSync(`public/art/set1/${name}`, file)
    if (draft) writeFileSync(`design/pixel-kit/drafts/${name.replace('/', '-')}`, file)
    console.log(`public/art/set1/${name}  ${buffer.w}×${buffer.h}  ${file.length} bytes`)
  }
} finally {
  await server.close()
}
