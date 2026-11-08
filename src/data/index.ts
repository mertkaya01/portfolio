import type { Locale } from '@/i18n/locale'

import * as en from './en/content'
import * as tr from './tr/content'

// All portfolio content, per language. The English files are the source; the Turkish ones
// start from them and replace only the text (links, dates and technologies stay in one place).
export type Content = typeof en
export const content: Record<Locale, Content> = { en, tr }
