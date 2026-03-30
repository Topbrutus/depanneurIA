import { useState } from 'react'
import ImageUploader from './ImageUploader'
import type { Product } from '../types'
import { CATEGORIES } from '../data'

interface Props {
  onSave:  (product: Omit<Product, 'id'> & { imageData?: string }) => void
  onClose: () => void
}

const EMOJIS = ['🥔','🥤','🍫','🍞','🥛','🍊','🍕','🧃','🍰','🥜','🍦','🍬','💊','🧴','🔋','☕','🧀','🍯']

export default function AddProductModal({ onSave, onClose }: Props) {
  const [name,     setName]     = useState('')
  const [price,    setPrice]    = useState('')
  const [category, setCategory] = useState(CATEGORIES[1])
  const [stock,    setStock]    = useState('10')
  const [emoji,    setEmoji]    = useState('🥔')
  const [imageData, setImageData] = useState<string>('')
  const [fileName,  setFileName]  = useState<string>('')
  const [errors,   setErrors]   = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())           e.name  = 'Le nom est requis'
    if (!price || isNaN(+price) || +price <= 0) e.price = 'Prix invalide'
    if (!stock || isNaN(+stock) || +stock < 0)  e.stock = 'Stock invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      name: name.trim(),
      price: parseFloat(parseFloat(price).toFixed(2)),
      category,
      stock: parseInt(stock),
      emoji,
      image: imageData ? `/images/${fileName}` : '',
      imageData: imageData || undefined,
    })
    onClose()
  }

  const fieldStyle = (hasError?: boolean) => ({
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${hasError ? '#e53935' : '#e0e0e0'}`,
    fontSize: 14, outline: 'none', background: '#fafafa',
    transition: 'border-color 0.15s',
  } as React.CSSProperties)

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#555', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  return (
    /* Fond semi-transparent */
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

        {/* En-tête */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Ajouter un produit</h2>
            <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>La photo sera convertie automatiquement</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e0e0e0', background: '#f5f5f5', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>×</button>
        </div>

        <div style={{ padding: 20 }}>

          {/* PHOTO */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>📷 Photo du produit</label>
            <ImageUploader
              productName={name || undefined}
              onImageReady={(data, fname) => { setImageData(data); setFileName(fname) }}
            />
            {!imageData && (
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                Sans photo, l'emoji sera affiché à la place
              </p>
            )}
          </div>

          {/* NOM */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nom du produit *</label>
            <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ''})) }}
              placeholder="ex: Lay's Ketchup 200g"
              style={fieldStyle(!!errors.name)}
              onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
              onBlur={e => { e.target.style.borderColor = errors.name ? '#e53935' : '#e0e0e0' }} />
            {errors.name && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>⚠ {errors.name}</p>}
          </div>

          {/* PRIX + STOCK */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Prix ($) *</label>
              <input value={price} onChange={e => { setPrice(e.target.value); setErrors(p => ({...p, price: ''})) }}
                placeholder="2.49" type="number" min="0" step="0.01"
                style={fieldStyle(!!errors.price)}
                onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                onBlur={e => { e.target.style.borderColor = errors.price ? '#e53935' : '#e0e0e0' }} />
              {errors.price && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>⚠ {errors.price}</p>}
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input value={stock} onChange={e => setStock(e.target.value)}
                placeholder="10" type="number" min="0"
                style={fieldStyle()}
                onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
            </div>
          </div>

          {/* CATÉGORIE */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Catégorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...fieldStyle(), appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23999\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}>
              {CATEGORIES.filter(c => c !== 'Produits').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* EMOJI (si pas de photo) */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Emoji (si pas de photo)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  style={{ width: 38, height: 38, borderRadius: 8, border: `2px solid ${emoji === e ? '#2d7a3a' : '#e0e0e0'}`, background: emoji === e ? '#e8f5eb' : '#fafafa', fontSize: 20, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* BOUTONS */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: '0 0 auto', padding: '12px 20px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', color: '#555', fontSize: 14 }}>
              Annuler
            </button>
            <button onClick={handleSave}
              style={{ flex: 1, padding: '12px', background: '#2d7a3a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 12px rgba(45,122,58,0.3)', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1e5c29' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2d7a3a' }}>
              ✓ Enregistrer le produit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
