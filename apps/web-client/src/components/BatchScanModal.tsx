import { useState, useEffect, useRef } from 'react'
import BarcodeScanner from './BarcodeScanner'

const API = 'http://localhost:3001'
const LS_KEY = 'depanneur_lot_scan'
const CATEGORIES = ['Chips','Boissons','Chocolat','Populaires','Laitier','Boulangerie','Épicerie','Hygiène','Divers','Pharmacie','Confiseries','Collations']
const EMOJIS = ['🥔','🥤','🍫','🍞','🥛','🍊','🧃','🥜','🍦','🍬','💊','🧴','🔋','☕','🧀','🍯','🥚','🧈']

interface ScannedItem {
  id: string        // timestamp unique
  barcode: string
  scannedAt: string
  // rempli après lookup
  name?: string
  price?: string
  category?: string
  emoji?: string
  stock?: string
  description?: string
  // état
  status: 'scanned' | 'completed' | 'skipped'
}

interface Props {
  onClose: () => void
  onProductSaved: (product: any) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #e0e0e0', fontSize: 13, outline: 'none',
  background: '#fafafa', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#555',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
}

function loadFromStorage(): ScannedItem[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveToStorage(items: ScannedItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

export default function BatchScanModal({ onClose, onProductSaved }: Props) {
  const [step, setStep]             = useState<'scan' | 'review'>('scan')
  const [items, setItems]           = useState<ScannedItem[]>(loadFromStorage)
  const [manualCode, setManualCode] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [beep, setBeep]             = useState(false)
  const [lookingUp, setLookingUp]   = useState<string | null>(null)

  // Revue séquentielle
  const [reviewIdx, setReviewIdx]   = useState(0)
  const [name, setName]             = useState('')
  const [price, setPrice]           = useState('')
  const [category, setCategory]     = useState('Divers')
  const [emoji, setEmoji]           = useState('🥔')
  const [stock, setStock]           = useState('0')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  // Synchronise localStorage à chaque changement
  useEffect(() => { saveToStorage(items) }, [items])

  // Focus auto sur le champ de scan
  useEffect(() => {
    if (step === 'scan') setTimeout(() => inputRef.current?.focus(), 100)
  }, [step])

  // ── Ajouter un code scanné ───────────────────────────────
  const addCode = async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return

    // BIP visuel
    setBeep(true); setTimeout(() => setBeep(false), 300)

    const newItem: ScannedItem = {
      id: Date.now().toString(),
      barcode: trimmed,
      scannedAt: new Date().toISOString(),
      status: 'scanned',
    }

    // Ajout immédiat en mémoire (avant même le lookup)
    setItems(prev => {
      const updated = [newItem, ...prev]
      saveToStorage(updated)
      return updated
    })
    setManualCode('')

    // Lookup barcode en arrière-plan
    setLookingUp(trimmed)
    try {
      const res = await fetch(`${API}/api/lookup-barcode?code=${trimmed}`)
      if (res.ok) {
        const data = await res.json()
        if (data.name) {
          setItems(prev => {
            const updated = prev.map(i => i.id === newItem.id ? {
              ...i,
              name:        data.name        || i.name,
              category:    data.category    || i.category,
              description: data.description || i.description,
              price:       data.price       ? String(data.price) : i.price,
              emoji:       data.emoji       || i.emoji,
            } : i)
            saveToStorage(updated)
            return updated
          })
        }
      }
    } catch { /* pas grave — les infos seront saisies manuellement */ }
    setLookingUp(null)
    inputRef.current?.focus()
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) addCode(manualCode)
  }

  const removeItem = (id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id)
      saveToStorage(updated)
      return updated
    })
  }

  // ── Démarrer la revue séquentielle ───────────────────────
  const startReview = () => {
    const first = items.findIndex(i => i.status === 'scanned')
    if (first === -1) return
    setReviewIdx(first)
    loadReviewItem(items[first])
    setStep('review')
  }

  const loadReviewItem = (item: ScannedItem) => {
    setName(item.name || '')
    setPrice(item.price || '')
    setCategory(item.category || 'Divers')
    setEmoji(item.emoji || '🥔')
    setStock(item.stock || '0')
    setError('')
  }

  const skipReviewItem = () => {
    setItems(prev => {
      const updated = prev.map((it, i) => i === reviewIdx ? { ...it, status: 'skipped' as const } : it)
      saveToStorage(updated)
      return updated
    })
    nextReviewItem()
  }

  const saveReviewItem = async () => {
    if (!name.trim()) { setError('Le nom est requis'); return }
    if (!price || isNaN(+price) || +price <= 0) { setError('Prix invalide'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), price: parseFloat(price),
          category, emoji, stock: parseInt(stock) || 0,
        }),
      })
      if (!res.ok) throw new Error('Erreur API')
      const saved = await res.json()
      onProductSaved(saved)

      setItems(prev => {
        const updated = prev.map((it, i) => i === reviewIdx ? {
          ...it, name, price, category, emoji, stock, status: 'completed' as const,
        } : it)
        saveToStorage(updated)
        return updated
      })
      nextReviewItem()
    } catch (e: any) {
      setError('Sauvegarde échouée — ' + e.message)
    }
    setSaving(false)
  }

  const nextReviewItem = () => {
    setItems(current => {
      const next = current.findIndex((it, i) => i > reviewIdx && it.status === 'scanned')
      if (next === -1) {
        // Tout traité
        setStep('scan')
      } else {
        setReviewIdx(next)
        loadReviewItem(current[next])
      }
      return current
    })
  }

  const clearCompleted = () => {
    setItems(prev => {
      const updated = prev.filter(i => i.status === 'scanned')
      saveToStorage(updated)
      return updated
    })
  }

  const pending   = items.filter(i => i.status === 'scanned')
  const completed = items.filter(i => i.status === 'completed')
  const skipped   = items.filter(i => i.status === 'skipped')
  const currentItem = items[reviewIdx]

  // ════════════════════════════════════════════════════════
  return (
    <>
      {showCamera && (
        <BarcodeScanner
          onScan={code => { setShowCamera(false); addCode(code) }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>

          {/* ── Header ── */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                {step === 'scan'   ? '📥 Lot — scan continu' : `✏️ Description ${reviewIdx + 1} / ${items.length}`}
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
                {pending.length} en attente · {completed.length} complété(s) · {skipped.length} sauté(s)
                {items.length > 0 && <span style={{ color: '#f0a500', fontWeight: 600 }}> · 💾 sauvegardé</span>}
              </p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e0e0e0', background: '#f5f5f5', fontSize: 16, cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ padding: '16px 18px' }}>

            {/* ════ SCAN ════ */}
            {step === 'scan' && (
              <div>
                {/* Zone de scan */}
                <div style={{
                  background: beep ? '#e8f5eb' : '#f8f9fa',
                  border: `2px solid ${beep ? '#2d7a3a' : '#e0e0e0'}`,
                  borderRadius: 12, padding: '16px', marginBottom: 14,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Scanner un code-barres ou QR
                  </div>
                  <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 8 }}>
                    <input
                      ref={inputRef}
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                      placeholder="Code-barres ou QR (scanner ou saisir)"
                      style={{ ...inputStyle, flex: 1 }}
                      autoComplete="off"
                      onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                      onBlur={e => { e.target.style.borderColor = '#e0e0e0' }}
                    />
                    <button type="submit" style={{ padding: '9px 14px', background: '#2d7a3a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                      ✓
                    </button>
                  </form>
                  <button onClick={() => setShowCamera(true)} style={{ marginTop: 8, width: '100%', padding: '8px', background: '#f0faf2', border: '1px solid #c8e6c9', borderRadius: 8, fontSize: 12, color: '#2d7a3a', fontWeight: 600, cursor: 'pointer' }}>
                    📷 Ouvrir la caméra
                  </button>
                  {beep && (
                    <div style={{ textAlign: 'center', fontSize: 13, color: '#2d7a3a', fontWeight: 700, marginTop: 8 }}>
                      BIP ✔
                    </div>
                  )}
                </div>

                {/* Liste des scans */}
                {items.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>
                        {items.length} code(s) scanné(s)
                      </span>
                      {completed.length > 0 && (
                        <button onClick={clearCompleted} style={{ fontSize: 11, color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>
                          🗑 Effacer les complétés
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 10 }}>
                      {items.map((item, i) => (
                        <div key={item.id} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px',
                          borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                          background: item.status === 'completed' ? '#f0faf2' : item.status === 'skipped' ? '#fafafa' : '#fff',
                          opacity: item.status === 'skipped' ? 0.5 : 1,
                        }}>
                          <span style={{ fontSize: 18 }}>
                            {item.status === 'completed' ? '✅' : item.status === 'skipped' ? '⏭' : lookingUp === item.barcode ? '🔍' : '📦'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Nom inconnu</span>}
                            </div>
                            <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>
                              {item.barcode}
                              {item.price && <span style={{ marginLeft: 8, color: '#f0a500', fontWeight: 600 }}>{item.price}$</span>}
                            </div>
                          </div>
                          {item.status === 'scanned' && (
                            <button onClick={() => removeItem(item.id)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #fee2e2', background: '#fef2f2', color: '#e53935', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>×</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#bbb' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                    <div style={{ fontSize: 13 }}>Aucun code scanné — commencez à scanner</div>
                  </div>
                )}

                {/* Bouton passer aux descriptions */}
                {pending.length > 0 && (
                  <button onClick={startReview} style={{
                    marginTop: 14, width: '100%', padding: '13px',
                    background: '#f0a500', border: 'none', borderRadius: 8,
                    color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(240,165,0,0.35)',
                  }}>
                    ✏️ Compléter les descriptions ({pending.length} produit{pending.length > 1 ? 's' : ''}) →
                  </button>
                )}
              </div>
            )}

            {/* ════ REVUE SÉQUENTIELLE ════ */}
            {step === 'review' && currentItem && (
              <div>
                {/* Barre de progression */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4 }}>
                    <span>{completed.length} complété(s)</span>
                    <span style={{ fontFamily: 'monospace', color: '#555' }}>{currentItem.barcode}</span>
                    <span>{pending.length} restant(s)</span>
                  </div>
                  <div style={{ height: 4, background: '#f0f0f0', borderRadius: 4 }}>
                    <div style={{ height: '100%', background: '#f0a500', borderRadius: 4, transition: 'width 0.3s', width: `${items.length > 0 ? (completed.length / items.length) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Nom — pré-rempli si lookup a trouvé */}
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Nom du produit *</label>
                  <input value={name} onChange={e => { setName(e.target.value); setError('') }} style={inputStyle}
                    placeholder="ex: Lait 2% Natrel 2L"
                    onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                    onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
                  {!name && <p style={{ fontSize: 11, color: '#f0a500', marginTop: 4 }}>⚠ Produit non trouvé automatiquement — saisir le nom</p>}
                </div>

                {/* Prix */}
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Prix ($) *</label>
                  <input value={price} onChange={e => { setPrice(e.target.value); setError('') }}
                    placeholder="ex: 1.99" type="number" step="0.01" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                    onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
                </div>

                {/* Catégorie + Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>Catégorie</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none' as any }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Stock initial</label>
                    <input value={stock} onChange={e => setStock(e.target.value)} placeholder="0" type="number" style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                      onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
                  </div>
                </div>

                {/* Emoji */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Emoji</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setEmoji(e)} style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: `2px solid ${emoji === e ? '#2d7a3a' : '#e0e0e0'}`,
                        background: emoji === e ? '#e8f5eb' : '#fafafa',
                        fontSize: 16, cursor: 'pointer',
                      }}>{e}</button>
                    ))}
                  </div>
                </div>

                {error && <p style={{ color: '#e53935', fontSize: 12, marginBottom: 10 }}>⚠ {error}</p>}

                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <button onClick={skipReviewItem} style={{ padding: '11px 16px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer' }}>
                    Sauter →
                  </button>
                  <button onClick={saveReviewItem} disabled={saving} style={{
                    flex: 1, padding: '11px',
                    background: saving ? '#e0e0e0' : '#2d7a3a',
                    border: 'none', borderRadius: 8,
                    color: saving ? '#999' : '#fff',
                    fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: saving ? 'none' : '0 4px 12px rgba(45,122,58,0.3)',
                  }}>
                    {saving ? '⏳...' : '✓ Sauvegarder'}
                  </button>
                </div>

                <button onClick={() => setStep('scan')} style={{ width: '100%', padding: '9px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#f8f8f8', color: '#555', fontSize: 12, cursor: 'pointer' }}>
                  ← Retour au scan (continuer à scanner)
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
