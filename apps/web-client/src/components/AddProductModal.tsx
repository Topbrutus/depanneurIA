import { useState } from 'react'
import ImageUploader from './ImageUploader'

const CATEGORIES = ['Chips', 'Boissons', 'Chocolat', 'Populaires', 'Laitier', 'Boulangerie', 'Épicerie', 'Hygiène', 'Divers']
const EMOJIS = ['🥔','🥤','🍫','🍞','🥛','🍊','🧃','🥜','🍦','🍬','💊','🧴','🔋','☕','🧀','🍯','🥚','🧈']

interface Props {
  onSave: (product: { name: string; price: number; category: string; stock: number; emoji: string; image: string; imageData?: string }) => void
  onClose: () => void
}

export default function AddProductModal({ onSave, onClose }: Props) {
  const [name, setName]         = useState('')
  const [price, setPrice]       = useState('')
  const [category, setCategory] = useState('Chips')
  const [stock, setStock]       = useState('10')
  const [emoji, setEmoji]       = useState('🥔')
  const [imageData, setImageData] = useState('')
  const [fileName, setFileName]   = useState('')
  const [error, setError]         = useState('')

  const handleSave = () => {
    if (!name.trim()) { setError('Le nom est requis'); return }
    if (!price || isNaN(+price) || +price <= 0) { setError('Prix invalide'); return }
    onSave({ name: name.trim(), price: parseFloat(parseFloat(price).toFixed(2)), category, stock: parseInt(stock) || 10, emoji, image: imageData ? `/images/${fileName}` : '', imageData: imageData || undefined })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Ajouter un produit</h2>
            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>Photo convertie automatiquement en JPG 500×500</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e0e0e0', background: '#f5f5f5', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📷 Photo</label>
            <ImageUploader productName={name || undefined} onImageReady={(data, fname) => { setImageData(data); setFileName(fname) }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom *</label>
            <input value={name} onChange={e => { setName(e.target.value); setError('') }} placeholder="ex: Lay's Ketchup 200g"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${error && !name ? '#e53935' : '#e0e0e0'}`, fontSize: 14, outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = '#2d7a3a' }} onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prix ($) *</label>
              <input value={price} onChange={e => { setPrice(e.target.value); setError('') }} placeholder="2.49" type="number" min="0" step="0.01"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#2d7a3a' }} onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stock</label>
              <input value={stock} onChange={e => setStock(e.target.value)} placeholder="10" type="number" min="0"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#2d7a3a' }} onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Catégorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, outline: 'none', background: '#fff' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 20, display: imageData ? "none" : "block" }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emoji (si pas de photo)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${emoji === e ? '#2d7a3a' : '#e0e0e0'}`, background: emoji === e ? '#e8f5eb' : '#fafafa', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e}</button>
              ))}
            </div>
          </div>
          {error && <p style={{ color: '#e53935', fontSize: 12, marginBottom: 12 }}>⚠ {error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '11px 20px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', color: '#555', fontSize: 14, cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} style={{ flex: 1, padding: '11px', background: '#2d7a3a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(45,122,58,0.3)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1e5c29' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2d7a3a' }}>
              ✓ Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
