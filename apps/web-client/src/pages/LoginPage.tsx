import { useState } from 'react'
import type { Role } from '../types'
import { ROLES } from '../data'

interface Props {
  onLogin: (role: Role) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [selected, setSelected] = useState<Role | null>(null)
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')

  const handleSubmit = () => {
    if (!selected) { setError('Choisissez un rôle'); return }
    if (!name.trim()) { setError('Entrez votre nom'); return }
    onLogin(selected)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #0d1a2d 0%, #060b12 70%)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0a500', letterSpacing: '0.08em' }}>
            DÉPANNEUR<span style={{ color: '#c084fc' }}>IA</span>
          </h1>
          <p style={{ color: '#475569', marginTop: 8, fontSize: 12 }}>
            Plateforme de gestion intelligente
          </p>
        </div>

        {/* Carte login */}
        <div style={{
          background: '#0a0f18',
          border: '1px solid #1e2a38',
          borderRadius: 16,
          padding: 32,
        }}>
          <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Choisissez votre rôle
          </p>

          {/* Grille des rôles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => { setSelected(r.id); setError('') }}
                style={{
                  padding: '16px 12px',
                  borderRadius: 10,
                  border: `1px solid ${selected === r.id ? r.color : '#1e2a38'}`,
                  background: selected === r.id ? r.color + '18' : '#0d1a2d',
                  color: selected === r.id ? r.color : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{r.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.label}</div>
                <div style={{ fontSize: 10, marginTop: 3, opacity: 0.75 }}>{r.description}</div>
              </button>
            ))}
          </div>

          {/* Champ nom */}
          <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Votre nom
          </label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="ex: Jean Tremblay"
            style={{
              width: '100%',
              background: '#0d1a2d',
              border: `1px solid ${error && !name ? '#f87171' : '#1e2a38'}`,
              borderRadius: 8,
              padding: '11px 14px',
              color: '#e2e8f0',
              fontSize: 13,
              outline: 'none',
              marginBottom: 16,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = '#f0a50066' }}
            onBlur={e => { e.target.style.borderColor = error && !name ? '#f87171' : '#1e2a38' }}
          />

          {/* Erreur */}
          {error && (
            <p style={{ color: '#f87171', fontSize: 11, marginBottom: 12 }}>⚠ {error}</p>
          )}

          {/* Bouton Entrer */}
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '13px',
              background: selected
                ? `linear-gradient(135deg, ${ROLES.find(r => r.id === selected)?.color}, ${ROLES.find(r => r.id === selected)?.color}aa)`
                : '#1e2a38',
              border: 'none',
              borderRadius: 10,
              color: selected ? '#000' : '#475569',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.04em',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {selected
              ? `Entrer comme ${ROLES.find(r => r.id === selected)?.label} →`
              : 'Sélectionnez un rôle'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#2d3f55', fontSize: 10, marginTop: 20 }}>
          dépanneurIA v1.0 — © 2025 Topbrutus
        </p>
      </div>
    </div>
  )
}
