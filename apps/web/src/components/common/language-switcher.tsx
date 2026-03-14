import { useI18n } from '../../lib/i18n-context'

export const LanguageSwitcher = () => {
  const { locale, setLocale, availableLocales, t } = useI18n()

  return (
    <label className="language-switcher">
      <span className="sr-only">{t('common.language.select')}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        aria-label={t('common.language')}
        className="language-select"
      >
        {availableLocales.map((code) => (
          <option key={code} value={code}>
            {code === 'fr' ? t('common.language.fr') : t('common.language.en')}
          </option>
        ))}
      </select>
    </label>
  )
}
