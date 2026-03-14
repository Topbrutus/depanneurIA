/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@depaneuria/types'

import { translate, type TranslationKey, type TranslationParams, sanitizeLocale } from './i18n'
import { loadLocale, saveLocale } from './locale-storage'

type I18nContextValue = {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (key: TranslationKey, params?: TranslationParams) => string
  availableLocales: SupportedLocale[]
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key, params) => translate(key, DEFAULT_LOCALE, params),
  availableLocales: SUPPORTED_LOCALES,
})

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => loadLocale())

  const handleSetLocale = useCallback((next: SupportedLocale) => {
    const safeLocale = sanitizeLocale(next)
    setLocaleState(safeLocale)
    saveLocale(safeLocale)
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t: (key, params) => translate(key, locale, params),
      availableLocales: SUPPORTED_LOCALES,
    }),
    [handleSetLocale, locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
