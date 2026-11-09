import { bigWidth, COLS, cursor, hash, putBig, Screen, typed } from './ascii'

// The scenes of Set 3, written into the terminal frame by frame. Each takes the time since it
// appeared (t, seconds) and returns the screen's lines. Everything that matters stays in the
// middle columns (18–61), the part a phone keeps.

const PROMPT = 'mert@iku:~$ '
const centre = (text: string) => Math.round((COLS - [...text].length) / 2)

// ---------- The scoreboard: printed by a little program ----------

export function scoreboard(t: number, board: { set: number; title: string; period: string }) {
  const s = new Screen()
  const command = `./scoreboard --set ${board.set}`
  s.put(18, 2, PROMPT)
  s.type(18 + PROMPT.length, 2, command, typed(t, 0.2, 26))
  const ran = t > 0.2 + command.length / 26 + 0.25
  if (!ran) {
    s.put(18 + PROMPT.length + Math.floor(typed(t, 0.2, 26)), 2, cursor(t))
    return s.lines()
  }
  // the board, drawn row by row
  const box = { x: 17, y: 4, w: 46, h: 18 }
  const shown = Math.floor((t - 1.2) * 40)
  const frame = new Screen()
  frame.box(box.x, box.y, box.w, box.h, 'scoreboard')
  frame.put(box.x, box.y + 9, `├${'─'.repeat(box.w - 2)}┤`)
  for (let y = box.y; y < box.y + Math.min(box.h, shown); y++) s.rows[y] = [...frame.rows[y]]
  if (t > 1.6) {
    const big = `SET ${board.set}`
    putBig(s, Math.round((COLS - bigWidth(big)) / 2), box.y + 2, big)
  }
  s.type(centre(board.title), box.y + 11, board.title, typed(t, 2.0, 22))
  s.type(centre(board.period), box.y + 14, board.period, typed(t, 2.7, 18))
  s.put(18, 24, PROMPT)
  if (t > 3.3) s.put(18 + PROMPT.length, 24, cursor(t))
  return s.lines()
}

// ---------- The courses: ls, then four little screens ----------

const TREE = ['      [8]', '     /   \\', '   [3]   [10]', '   / \\      \\', ' [1] [6]    [14]']
const GIT = [
  '* 3f2a tests pass',
  '* 9c1e add detector',
  '|\\',
  '| * 4b7d feature',
  '|/',
  '* 77a0 first commit',
]
const BOARD = [
  '┌───────────────┐',
  '│ UNO     PWR ● │',
  '│ ▓▓▓▓  ┌─────┐ │',
  '│       │ MCU │ │',
  '│ ▓▓▓▓  └─────┘ │',
  '└┬─┬─┬─┬─┬─┬─┬──┘',
]

export function courses(t: number) {
  const s = new Screen()
  const command = 'ls courses/'
  s.put(18, 1, PROMPT)
  s.type(18 + PROMPT.length, 1, command, typed(t, 0.1, 24))
  if (t > 0.7) {
    s.put(18, 2, 'data-structures/       operating-systems/')
    s.put(18, 3, 'software-engineering/  embedded-systems/')
  }
  const panels = [
    { x: 17, y: 5, title: 'data structures', from: 1.0 },
    { x: 40, y: 5, title: 'operating systems', from: 1.4 },
    { x: 17, y: 16, title: 'software eng.', from: 1.8 },
    { x: 40, y: 16, title: 'embedded systems', from: 2.2 },
  ]
  for (const p of panels) if (t > p.from) s.box(p.x, p.y, 23, 11, p.title)

  // a binary search tree, one level after another
  const levels = Math.floor((t - 1.2) / 0.3)
  TREE.forEach((line, i) => {
    if (i <= levels * 2) s.put(19, 7 + i, line)
  })

  // a CPU scheduler: three processes taking turns; the time marker moves along
  if (t > 1.6) {
    const slots = ['P1', 'P1', 'P2', 'P3', 'P3', 'P1', 'P2', 'P2']
    const now = Math.min(slots.length, Math.floor((t - 1.6) * 3))
    ;['P1', 'P2', 'P3'].forEach((p, row) => {
      const bar = slots.map((owner, i) => (i < now ? (owner === p ? '█' : '░') : ' ')).join('')
      s.put(42, 7 + row * 2, `${p} ${bar}`)
    })
    s.put(45 + Math.min(now, slots.length - 1), 13, '▲')
    s.put(42, 13, 't')
  }

  // a git history, line by line
  GIT.forEach((line, i) => {
    if (t > 2.0 + i * 0.25) s.put(19, 18 + i, line)
  })

  // an Arduino with an LED on pin 13, blinking
  if (t > 2.4) {
    s.block(43, 17, BOARD)
    const on = Math.floor(t * 2) % 2 === 0
    s.put(43, 24, ` 13 ──[220Ω]── ${on ? '●' : '○'} LED`)
  }
  return s.lines()
}

// ---------- The campus: Istanbul Kültür University, drawn in characters ----------
// After the photo: two long wings with rows of windows, the glass tower in the middle, the
// university's name on both roofs, trees and the stair in front. It goes up from the ground
// row by row, then its windows light up and go dark here and there.

const SIGN = 'KÜLTÜR ÜNİVERSİTESİ' // the university's name, as on its roofs
const WING = 20 // a wing: its borders and nine windows

function campusLines(t: number) {
  const light = (col: number, row: number) =>
    hash(col * 7 + row * 13, Math.floor(t * 1.5)) > 0.25 ? '▪' : '·'
  const wing = (side: number, row: number) =>
    `║${Array.from({ length: 9 }, (_, i) => ` ${light(i + side * 9, row)}`).join('')}║`
  const glass = (row: number) => (row % 2 ? '▓▒▓▒▓' : '▒▓▒▓▒')
  const lines = [
    `${SIGN} ${' '.repeat(5)}${SIGN} `,
    `╔${'═'.repeat(WING - 2)}╗ ▄█▄ ╔${'═'.repeat(WING - 2)}╗`,
  ]
  for (let row = 0; row < 8; row++) lines.push(`${wing(0, row)}${glass(row)}${wing(1, row)}`)
  lines.push(`╟${'─'.repeat(WING - 2)}╢▓▒▓▒▓╟${'─'.repeat(WING - 2)}╢`)
  lines.push(`║${' ▐'.repeat(9)}║ ╔═╗ ║${' ▐'.repeat(9)}║`)
  lines.push(`║${' ▐'.repeat(9)}║ ║▓║ ║${' ▐'.repeat(9)}║`)
  lines.push('▀'.repeat(45))
  // trees and the stair in front
  const trees = [1, 8, 14, 30, 36, 42]
  const row = (draw: (c: number) => string) =>
    Array.from({ length: 45 }, (_, c) => draw(c)).join('')
  lines.push(row((c) => (trees.includes(c) ? '▲' : ' ')))
  lines.push(
    row((c) => (trees.some((x) => Math.abs(c - x) <= 1) ? '▲' : c >= 21 && c <= 23 ? '▁' : ' ')),
  )
  lines.push(row((c) => (trees.includes(c) ? '│' : c >= 20 && c <= 24 ? '▁' : ' ')))
  lines.push('─'.repeat(45))
  return lines
}

export function campus(t: number) {
  const s = new Screen()
  const command = 'cat campus.txt'
  s.put(18, 2, PROMPT)
  s.type(18 + PROMPT.length, 2, command, typed(t, 0.1, 24))
  if (t > 0.8) {
    const lines = campusLines(t)
    const shown = Math.floor((t - 0.8) * 16) // from the ground up
    lines.forEach((line, i) => {
      if (i >= lines.length - shown) s.put(17, 5 + i, line)
    })
  }
  return s.lines()
}

// ---------- Volleyball: the university team, a rally in stick figures ----------
// The net in the middle; Mert (number 9 on his shirt) attacks from the left: the set comes, he
// jumps and spikes, their blocker is late, the ball lands on their side, his team cheers.

const FLOOR = 22 // the floor row: feet stand on the row above it
const NET = 40
type Stick = { x: number; lift: number; arms: 'down' | 'up' | 'spike'; shirt?: string }

function stick(s: Screen, p: Stick) {
  const top = FLOOR - 3 - p.lift
  const body = p.shirt ?? '|'
  s.put(p.x - 1, top, p.arms === 'up' ? '\\o/' : p.arms === 'spike' ? ' o/' : ' o ')
  s.put(p.x - 1, top + 1, p.arms === 'down' ? `/${body}\\` : ` ${body} `)
  s.put(p.x - 1, top + 2, p.lift > 0 ? ' ^ ' : '/ \\')
}

const RALLY = 3.2
const jumpRows = (t: number, from: number, to: number) =>
  t < from || t > to ? 0 : Math.round(3 * Math.sin(((t - from) / (to - from)) * Math.PI))

export function volleyball(time: number) {
  const s = new Screen()
  const t = time % RALLY
  // the court: floor, the net with its tape, the two sides
  s.put(10, FLOOR, '▀'.repeat(61))
  for (let y = FLOOR - 7; y < FLOOR; y++) s.put(NET, y, '│')
  s.put(NET - 1, FLOOR - 8, '═╤═')

  const after = t > 1.15 && t < 2.6
  const cheer = (i: number) => (after ? Math.abs(Math.round(Math.sin((t - 1.15) * 9 + i) * 2)) : 0)
  // Mert: a few steps in, the jump, the spike
  const mertX = t < 0.45 ? 30 + Math.round(t * 8) : 34
  const mertUp = jumpRows(t, 0.45, 1.05)
  const team: Stick[] = [
    { x: 18, lift: cheer(0), arms: after ? 'up' : 'down' },
    { x: 26, lift: cheer(1), arms: t < 0.3 || after ? 'up' : 'down' }, // the setter
    {
      x: mertX,
      lift: mertUp + cheer(2),
      arms: mertUp > 0 ? 'spike' : after ? 'up' : 'down',
      shirt: '9',
    },
  ]
  const them: Stick[] = [
    { x: 44, lift: jumpRows(t, 0.7, 1.2), arms: t > 0.7 && t < 1.2 ? 'up' : 'down' },
    { x: 52, lift: 0, arms: 'down' },
    { x: 63, lift: 0, arms: 'down' },
  ]
  for (const p of [...team, ...them]) stick(s, p)

  // the ball: set high to the net, spiked down across it, a bounce
  let ball: [number, number] | null = null
  if (t < 0.75) {
    const p = t / 0.75
    ball = [
      26 + (36 - 26) * p,
      FLOOR - 5 - Math.round(8 * Math.sin(p * Math.PI)) - Math.round(3 * p),
    ]
  } else if (t < 0.95) {
    const p = (t - 0.75) / 0.2
    ball = [36 + (57 - 36) * p, FLOOR - 8 + Math.round(7 * p)]
  } else if (t < 1.3) {
    const p = (t - 0.95) / 0.35
    ball = [57 + 6 * p, FLOOR - 1 - Math.round(3 * Math.sin(p * Math.PI))]
  } else if (t < 2.6) ball = [63, FLOOR - 1]
  if (ball) s.put(Math.round(ball[0]), ball[1], '●')
  if (t > 0.93 && t < 1.1) s.put(55, FLOOR - 1, '\\*/') // the ball hits the floor
  return s.lines()
}

// ---------- The exam reader: a scanned answer sheet, read line by line ----------
// From the project: the scan is checked first, four anchors align the page, then each
// question is read.

const QUESTIONS = 8
const GAP = 2 // rows from one question to the next
const pick = (q: number) => Math.floor(hash(q, 5) * 5)

export function examReader(t: number) {
  const s = new Screen()
  const command = 'python read_exam.py scan.png'
  s.put(17, 1, PROMPT)
  s.type(17 + PROMPT.length, 1, command, typed(t, 0.1, 30))
  // the scanned page on the left, its four anchor marks in the corners
  const page = { x: 17, y: 3, w: 22, h: 21 }
  if (t > 1.0) {
    s.box(page.x, page.y, page.w, page.h, 'scan.png')
    for (const [ax, ay] of [
      [page.x + 1, page.y + 1],
      [page.x + page.w - 2, page.y + 1],
      [page.x + 1, page.y + page.h - 2],
      [page.x + page.w - 2, page.y + page.h - 2],
    ]) {
      s.put(ax, ay, '■')
    }
  }
  // the scan line moves down the page; the questions it has passed are read
  const passed = Math.max(0, (t - 1.6) * 5) // rows passed
  if (t > 1.0) {
    for (let q = 0; q < QUESTIONS; q++) {
      const row = page.y + 3 + q * GAP
      const read = row - page.y - 2 < passed
      const marks = [0, 1, 2, 3, 4]
        .map((k) => (k === pick(q) ? (read ? '[●]' : ' ● ') : ' ○ '))
        .join('')
      s.put(page.x + 1, row, `${String(q + 1).padStart(2)}${marks}`)
    }
  }
  const scanRow = page.y + 2 + Math.floor(passed)
  if (t > 1.6 && scanRow < page.y + page.h - 1) s.put(page.x + 1, scanRow, '═'.repeat(page.w - 2))

  // the log on the right: the checks, then each answer as it is read
  const log = { x: 41, y: 3 }
  ;['[ok] scan quality', '[ok] 4 anchors found', '[ok] page aligned'].forEach((line, i) => {
    if (t > 1.2 + i * 0.3) s.put(log.x, log.y + i, line)
  })
  for (let q = 0; q < QUESTIONS; q++) {
    const row = 3 + q * GAP
    if (row - 2 < passed && t > 1.6) {
      s.put(log.x, log.y + 4 + q, `Q${String(q + 1).padEnd(3)} ${'ABCDE'[pick(q)]}`)
    }
  }
  return s.lines()
}

// ---------- The capstone: the network, packets on their way ----------
// From the project: two gateways with NAT and firewalls, an Extranet and an Intranet zone,
// Snort watching for intrusions, a Squid proxy for web access, OpenLDAP for logins.

const NETWORK = [
  '            ( Internet )',
  '                 │',
  '     ┌─────────────────────────┐',
  '     │ Gateway 1 · NAT · fw    │',
  '     └─────────────────────────┘',
  '                 │',
  '  ┌──────────── EXTRANET ───────────┐',
  '  │   Apache web    ·   Dnsmasq     │',
  '  └─────────────────────────────────┘',
  '                 │',
  '     ┌─────────────────────────┐',
  '     │ Gateway 2 · NAT · fw    │',
  '     │ Snort IDS               │',
  '     └─────────────────────────┘',
  '                 │',
  '  ┌──────────── INTRANET ───────────┐',
  '  │ OpenLDAP · Squid proxy · PCs    │',
  '  └─────────────────────────────────┘',
]
const LINK_ROWS = [1, 5, 9, 14] // the rows of the vertical links
const NET_X = 20 // where the drawing starts (it is 37 wide: columns 20–56)
const NET_Y = 4

export function capstone(t: number) {
  const s = new Screen()
  s.put(17, 1, PROMPT)
  s.type(17 + PROMPT.length, 1, 'cat network.txt', typed(t, 0.1, 30))
  const shown = Math.floor((t - 0.7) * 30)
  NETWORK.forEach((line, i) => {
    if (i < shown) s.put(NET_X, NET_Y + i, line)
  })
  if (t > 1.4) {
    // packets travel down the links, one after another
    const lane = NET_X + 17
    for (let k = 0; k < 3; k++) {
      const p = (t * 0.9 + k / 3) % 1
      s.put(lane, NET_Y + LINK_ROWS[Math.floor(p * LINK_ROWS.length)], '■')
    }
    // now and then Snort raises an alert at the second gateway
    if (Math.floor(t * 1.2) % 3 === 2) s.put(NET_X + 24, NET_Y + 12, '! alert')
  }
  return s.lines()
}

// ---------- A scene not drawn yet ----------

export function pending(t: number, n: number, of: number) {
  const s = new Screen()
  s.put(18, 12, PROMPT)
  s.type(18 + PROMPT.length, 12, `./scene ${n}/${of}`, typed(t, 0.1, 20))
  const dots = '.'.repeat(Math.floor(t * 3) % 4)
  if (t > 0.8) s.put(18, 13, `loading${dots}`)
  return s.lines()
}
