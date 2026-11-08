import { useEffect } from 'react'

import { content } from '@/data'

import { useLocale, type Locale } from './locale'
import { en, type Messages } from './messages/en'
import { tr } from './messages/tr'

export { LOCALES, useLocale, type Locale } from './locale'

const MESSAGES: Record<Locale, Messages> = { en, tr }

// The interface text for the current language: const t = useT(); t.nav.sections.projects
export const useT = () => MESSAGES[useLocale((s) => s.locale)]

// The portfolio content for the current language: const { profile, projects } = useContent()
export const useContent = () => content[useLocale((s) => s.locale)]

// Keeps the document in step with the language: <html lang> (screen readers, hyphenation,
// search engines) and the meta description. Mounted once, in RootLayout.
export function useDocumentLanguage() {
  const locale = useLocale((s) => s.locale)
  useEffect(() => {
    document.documentElement.lang = locale
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', MESSAGES[locale].meta.description)
  }, [locale])
}
