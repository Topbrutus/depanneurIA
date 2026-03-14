import type { SupportedLocale } from '@depaneuria/types'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@depaneuria/types'

import en from '../locales/en'
import fr from '../locales/fr'

export const translations = {
  fr,
  en,
} as const

export type TranslationKey = keyof typeof fr

export type TranslationParams = Record<string, string | number>

export const FALLBACK_LOCALE: SupportedLocale = DEFAULT_LOCALE

const formatTranslation = (template: string, params?: TranslationParams): string => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = params[token]
    return value === undefined || value === null ? `{${token}}` : String(value)
  })
}

export const translate = (key: TranslationKey, locale: SupportedLocale, params?: TranslationParams): string => {
  const localeMap = translations[locale] ?? translations[FALLBACK_LOCALE]
  const value = localeMap[key] ?? translations[FALLBACK_LOCALE][key]
  if (!value) return key
  return formatTranslation(value, params)
}

export const isSupportedLocale = (value: string | null | undefined): value is SupportedLocale =>
  Boolean(value && SUPPORTED_LOCALES.includes(value as SupportedLocale))

export const sanitizeLocale = (value: string | null | undefined): SupportedLocale =>
  isSupportedLocale(value) ? (value as SupportedLocale) : FALLBACK_LOCALE
