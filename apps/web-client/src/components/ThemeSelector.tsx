import { useTheme } from '../themes/ThemeContext'
import { THEMES, type ThemeId } from '../themes/themes'

interface Props {
  onClose: () => void
}

export default function ThemeSelector({ onClose }: Props) {
  const { themeId, setTheme, theme } = useTheme()

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div style={{ background: theme.bgPanel, border: `1px solid ${theme.borderColor}`, borderRadius: 16, width: '100%', maxWidth: 420, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, margin: 0 }}>Choisir un thème</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${theme.borderColor}`, background: 'transparent', color: theme.textMuted, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.values(THEMES).map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id as ThemeId); onClose() }}
              style={{
                padding: '16px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${themeId === t.id ? theme.accent : theme.borderColor}`,
                background: themeId === t.id ? theme.accent + '15' : theme.bgCard,
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all 0.2s', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 36 }}>{t.preview}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: themeId === t.id ? theme.accent : theme.textPrimary }}>{t.name}</div>
                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 3 }}>{t.description}</div>
              </div>
              {themeId === t.id && (
                <span style={{ marginLeft: 'auto', background: theme.accent, color: theme.btnText, borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>Actif</span>
              )}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 16, textAlign: 'center' }}>
          Le thème s'applique instantanément pour tous les utilisateurs
        </p>
      </div>
    </div>
  )
}
