import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { THEMES, DEFAULT_THEME, type Theme, type ThemeId } from './themes'

interface ThemeContextType {
  theme: Theme
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[DEFAULT_THEME],
  themeId: DEFAULT_THEME,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('depanneur-theme') as ThemeId) || DEFAULT_THEME
  })

  const setTheme = (id: ThemeId) => {
    setThemeId(id)
    localStorage.setItem('depanneur-theme', id)
  }

  // Appliquer la police du thème
  useEffect(() => {
    const theme = THEMES[themeId]
    document.body.style.fontFamily = theme.fontFamily
    document.body.style.background = theme.bgPrimary
    document.body.style.color = theme.textPrimary
  }, [themeId])

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
