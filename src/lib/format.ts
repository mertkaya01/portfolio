import type { Locale } from '@/i18n/locale'

const MONTHS: Record<Locale, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
}
const PRESENT: Record<Locale, string> = { en: 'Present', tr: 'Günümüz' }

// '2026-07' → 'Jul 2026' / 'Tem 2026' · '2021' → '2021' · 'present' → 'Present' / 'Günümüz'
export function formatDate(value: string, locale: Locale = 'en') {
  if (value === 'present') return PRESENT[locale]
  const [year, month] = value.split('-')
  return month ? `${MONTHS[locale][Number(month) - 1]} ${year}` : year
}

export const formatRange = (start: string, end: string, locale: Locale = 'en') =>
  `${formatDate(start, locale)} – ${formatDate(end, locale)}`

export const isExternal = (href: string) => /^https?:\/\//.test(href)

// 'Outside Hitter (Smaçör)' → 'OH'
export const initials = (text: string) =>
  text
    .replace(/\(.*\)/, '')
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase())
    .join('')

// How long something lasted, counting both the first and the last month:
// '2026-07' → '2026-09' = '3 mos' · '2024-08' → '2025-03' = '8 mos' · '2021' → '2025' = '4 yrs'
// (Turkish: '3 ay', '4 yıl' — no plural ending after a number)
export function formatDuration(start: string, end: string, locale: Locale = 'en') {
  const now = new Date()
  const [startYear, startMonth] = start.split('-').map(Number)
  const [endYear, endMonth] =
    end === 'present' ? [now.getFullYear(), now.getMonth() + 1] : end.split('-').map(Number)
  const plural = (n: number, word: 'yr' | 'mo') =>
    locale === 'tr' ? `${n} ${word === 'yr' ? 'yıl' : 'ay'}` : `${n} ${word}${n === 1 ? '' : 's'}`

  if (!startMonth || !endMonth) return plural(endYear - startYear, 'yr')
  const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1
  if (months < 12) return plural(months, 'mo')
  const years = Math.floor(months / 12)
  const rest = months % 12
  return rest ? `${plural(years, 'yr')} ${plural(rest, 'mo')}` : plural(years, 'yr')
}
