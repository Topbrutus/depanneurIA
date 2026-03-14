import { DEFAULT_LOCALE, type SupportedLocale } from '@depaneuria/types'
import { sanitizeLocale } from './i18n'

const LOCALE_STORAGE_KEY = 'depaneuria.locale'

export const loadLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return sanitizeLocale(stored)
  } catch {
    return DEFAULT_LOCALE
  }
}

export const saveLocale = (locale: SupportedLocale) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // ignore write errors (private mode, etc.)
  }
}
