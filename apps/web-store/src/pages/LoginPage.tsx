import { useState } from 'react'
import type { Role } from '../types'
import { ROLES } from '../data'

interface Props { onLogin: (role: Role) => void }

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <header style={{ background: '#2d7a3a', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <span style={{ fontSize: 22 }}>🛍️</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Dépanneur</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>IA</span>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>Bienvenue !</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: 28, fontSize: 14 }}>Connectez-vous pour accéder à votre espace</p>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Votre rôle</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => { setSelected(r.id); setError('') }}
                  style={{ padding: '14px 10px', borderRadius: 10, border: `2px solid ${selected === r.id ? r.color : '#e8e8e8'}`, background: selected === r.id ? r.color + '10' : '#fafafa', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 22, marginBottom: 5 }}>{r.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: selected === r.id ? r.color : '#1a1a1a' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{r.description}</div>
                </button>
              ))}
            </div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Votre nom</label>
            <input value={name} onChange={e => { setName(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="ex: Jean Tremblay"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1px solid ${error && !name ? '#e53935' : '#e0e0e0'}`, fontSize: 14, outline: 'none', marginBottom: 16 }}
              onFocus={e => { e.target.style.borderColor = '#2d7a3a' }} onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
            {error && <p style={{ color: '#e53935', fontSize: 12, marginBottom: 12 }}>⚠ {error}</p>}
            <button onClick={handleSubmit}
              style={{ width: '100%', padding: '13px', background: selected ? '#2d7a3a' : '#ccc', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 15, cursor: selected ? 'pointer' : 'not-allowed', boxShadow: selected ? '0 4px 12px rgba(45,122,58,0.3)' : 'none' }}
              onMouseEnter={e => { if (selected) (e.currentTarget as HTMLElement).style.background = '#1e5c29' }}
              onMouseLeave={e => { if (selected) (e.currentTarget as HTMLElement).style.background = '#2d7a3a' }}>
              {selected ? `Entrer comme ${ROLES.find(r => r.id === selected)?.label} →` : 'Sélectionnez un rôle'}
            </button>
          </div>
          <p style={{ textAlign: 'center', color: '#bbb', fontSize: 11, marginTop: 20 }}>dépanneurIA v1.0 — © 2025 Topbrutus</p>
        </div>
      </div>
    </div>
  )
}
