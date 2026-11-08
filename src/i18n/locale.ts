import { create } from 'zustand'

// The site's languages. English is the default; the visitor's choice is remembered.
export type Locale = 'en' | 'tr'
export const LOCALES: readonly Locale[] = ['en', 'tr']

const KEY = 'beyond-the-court:locale'

// localStorage can be blocked (private mode, strict settings) — never let that break the page
function stored(): Locale {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'tr' || value === 'en' ? value : 'en'
  } catch {
    return 'en'
  }
}

type LocaleStore = { locale: Locale; setLocale: (locale: Locale) => void }

// One shared store: switching the language re-renders everything that shows text, while the
// page, the URL and the scroll position stay where they are.
export const useLocale = create<LocaleStore>((set) => ({
  locale: stored(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(KEY, locale)
    } catch {
      /* fine: the choice just won't survive a reload */
    }
    set({ locale })
  },
}))
