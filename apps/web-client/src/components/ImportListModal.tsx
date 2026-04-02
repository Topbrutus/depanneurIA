import { useState, useRef } from 'react'

const API = 'http://localhost:3001'
const CATEGORIES = ['Chips','Boissons','Chocolat','Populaires','Laitier','Boulangerie','Épicerie','Hygiène','Divers','Pharmacie','Confiseries','Collations']
const EMOJIS = ['🥔','🥤','🍫','🍞','🥛','🍊','🧃','🥜','🍦','🍬','💊','🧴','🔋','☕','🧀','🍯','🥚','🧈']

type Step = 'source' | 'review' | 'sequential' | 'done'

interface ProductLine {
  id: number
  name: string
  done: boolean
  skipped: boolean
}

interface Props {
  initialMode: 'list' | 'photo'
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

export default function ImportListModal({ initialMode, onClose, onProductSaved }: Props) {
  const [step, setStep]           = useState<Step>(initialMode === 'photo' ? 'source' : 'source')
  const [sourceMode, setSourceMode] = useState<'text' | 'file' | 'photo'>(initialMode === 'photo' ? 'photo' : 'text')
  const [rawText, setRawText]     = useState('')
  const [lines, setLines]         = useState<ProductLine[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [ocrPreview, setOcrPreview] = useState('')

  // Champs du formulaire séquentiel
  const [name, setName]         = useState('')
  const [price, setPrice]       = useState('')
  const [category, setCategory] = useState('Divers')
  const [emoji, setEmoji]       = useState('🥔')
  const [stock, setStock]       = useState('0')
  const [saving, setSaving]     = useState(false)

  const fileRef  = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  // ── Parsing du texte brut → liste de lignes ──────────────
  const parseText = (text: string): ProductLine[] => {
    return text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 1 && !/^[^a-zA-Z0-9àâéèêëîïôùûüç]*$/.test(l))
      .map((name, id) => ({ id, name, done: false, skipped: false }))
  }

  // ── Import fichier texte ──────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      setRawText(text)
      setLines(parseText(text))
      setStep('review')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── OCR photo ────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true); setError('')
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader()
        reader.onload = ev => {
          const arr = ev.target?.result as ArrayBuffer
          const bytes = new Uint8Array(arr)
          let bin = ''
          bytes.forEach(b => { bin += String.fromCharCode(b) })
          res(btoa(bin))
        }
        reader.onerror = rej
        reader.readAsArrayBuffer(file)
      })
      const resp = await fetch(`${API}/api/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64 }),
      })
      if (!resp.ok) throw new Error('Erreur OCR')
      const data = await resp.json()
      const text = data.lines?.join('\n') ?? ''
      setOcrPreview(text)
      setRawText(text)
      setLines(parseText(text))
      setStep('review')
    } catch (err: any) {
      setError('OCR échoué — ' + err.message)
    }
    setLoading(false)
    e.target.value = ''
  }

  // ── Valider le texte collé ────────────────────────────────
  const handlePasteConfirm = () => {
    const parsed = parseText(rawText)
    if (parsed.length === 0) { setError('Aucune ligne valide trouvée'); return }
    setLines(parsed)
    setStep('review')
  }

  // ── Démarrer la revue séquentielle ───────────────────────
  const startSequential = () => {
    const first = lines.findIndex(l => !l.done && !l.skipped)
    if (first === -1) { setStep('done'); return }
    setCurrentIdx(first)
    loadItem(first)
    setStep('sequential')
  }

  const loadItem = (idx: number) => {
    const item = lines[idx]
    if (!item) return
    setName(item.name)
    setPrice('')
    setCategory('Divers')
    setEmoji('🥔')
    setStock('0')
    setError('')
  }

  // ── Sauter un produit ─────────────────────────────────────
  const skipItem = () => {
    const updated = lines.map((l, i) => i === currentIdx ? { ...l, skipped: true } : l)
    setLines(updated)
    nextItem(updated)
  }

  // ── Sauvegarder et passer au suivant ─────────────────────
  const saveItem = async () => {
    if (!name.trim()) { setError('Le nom est requis'); return }
    if (!price || isNaN(+price) || +price <= 0) { setError('Prix invalide'); return }
    setSaving(true); setError('')
    try {
      const resp = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price),
          category,
          emoji,
          stock: parseInt(stock) || 0,
        }),
      })
      if (!resp.ok) throw new Error('Erreur API')
      const saved = await resp.json()
      onProductSaved(saved)

      const updated = lines.map((l, i) => i === currentIdx ? { ...l, done: true } : l)
      setLines(updated)
      nextItem(updated)
    } catch (err: any) {
      setError('Sauvegarde échouée — ' + err.message)
    }
    setSaving(false)
  }

  const nextItem = (updated: ProductLine[]) => {
    const next = updated.findIndex((l, i) => i > currentIdx && !l.done && !l.skipped)
    if (next === -1) {
      setStep('done')
    } else {
      setCurrentIdx(next)
      loadItem(next)
    }
  }

  const doneCount    = lines.filter(l => l.done).length
  const skippedCount = lines.filter(l => l.skipped).length
  const pending      = lines.filter(l => !l.done && !l.skipped)

  // ════════════════════════════════════════════════════════════
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>

        {/* ── Header ── */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
              {step === 'source'     && (initialMode === 'photo' ? '📷 Photo d\'une liste' : '📋 Importer une liste')}
              {step === 'review'     && `📋 Vérifier la liste`}
              {step === 'sequential' && `✏️ Produit ${currentIdx + 1} / ${lines.length}`}
              {step === 'done'       && '✅ Importation terminée'}
            </h2>
            {step === 'sequential' && (
              <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
                {doneCount} sauvegardé(s) · {skippedCount} sauté(s) · {pending.length} restant(s)
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e0e0e0', background: '#f5f5f5', fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '16px 18px' }}>

          {/* ════ ÉTAPE 1 : SOURCE ════ */}
          {step === 'source' && (
            <div>

              {/* Onglets source */}
              {initialMode === 'list' && (
                <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: '1px solid #e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
                  {(['text','file'] as const).map(m => (
                    <button key={m} onClick={() => setSourceMode(m)} style={{
                      flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      background: sourceMode === m ? '#2d7a3a' : '#f5f5f5',
                      color: sourceMode === m ? '#fff' : '#666',
                    }}>
                      {m === 'text' ? '📝 Coller du texte' : '📂 Importer un fichier'}
                    </button>
                  ))}
                </div>
              )}

              {/* Texte */}
              {sourceMode === 'text' && (
                <div>
                  <label style={labelStyle}>Une ligne = un produit</label>
                  <textarea
                    value={rawText}
                    onChange={e => { setRawText(e.target.value); setError('') }}
                    placeholder={"Lait 2% Natrel\nChips BBQ Lays\nJus d'orange..."}
                    rows={10}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace' }}
                  />
                  {error && <p style={{ color: '#e53935', fontSize: 12, marginTop: 6 }}>⚠ {error}</p>}
                  <button onClick={handlePasteConfirm} disabled={!rawText.trim()} style={{
                    marginTop: 12, width: '100%', padding: '11px',
                    background: rawText.trim() ? '#2d7a3a' : '#e0e0e0',
                    border: 'none', borderRadius: 8,
                    color: rawText.trim() ? '#fff' : '#999',
                    fontWeight: 700, fontSize: 14, cursor: rawText.trim() ? 'pointer' : 'not-allowed',
                  }}>
                    Analyser la liste →
                  </button>
                </div>
              )}

              {/* Fichier */}
              {sourceMode === 'file' && (
                <div>
                  <input ref={fileRef} type="file" accept=".txt,.csv,.text" onChange={handleFileChange} style={{ display: 'none' }} />
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{ border: '2px dashed #e0e0e0', borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2d7a3a' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e0e0e0' }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📂</div>
                    <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>Cliquer pour choisir un fichier</div>
                    <div style={{ fontSize: 12, color: '#999' }}>TXT ou CSV — une ligne = un produit</div>
                  </div>
                </div>
              )}

              {/* Photo OCR */}
              {sourceMode === 'photo' && (
                <div>
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                      <div style={{ fontWeight: 600, color: '#333' }}>Extraction en cours (OCR)...</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Tesseract analyse la photo</div>
                    </div>
                  ) : (
                    <div>
                      <div
                        onClick={() => photoRef.current?.click()}
                        style={{ border: '2px dashed #e0e0e0', borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2d7a3a' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e0e0e0' }}
                      >
                        <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                        <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>Prendre une photo ou choisir une image</div>
                        <div style={{ fontSize: 12, color: '#999' }}>La liste papier sera lue automatiquement</div>
                      </div>
                      {ocrPreview && (
                        <div style={{ marginTop: 12, background: '#f8f8f8', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6 }}>APERÇU OCR :</div>
                          <pre style={{ fontSize: 11, color: '#333', margin: 0, whiteSpace: 'pre-wrap', maxHeight: 150, overflowY: 'auto' }}>{ocrPreview}</pre>
                        </div>
                      )}
                    </div>
                  )}
                  {error && <p style={{ color: '#e53935', fontSize: 12, marginTop: 8 }}>⚠ {error}</p>}
                </div>
              )}
            </div>
          )}

          {/* ════ ÉTAPE 2 : REVIEW ════ */}
          {step === 'review' && (
            <div>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                <strong>{lines.length} produit(s)</strong> détecté(s). Modifiez ou supprimez avant de continuer.
              </p>
              <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 10, marginBottom: 14 }}>
                {lines.map((line, i) => (
                  <div key={line.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < lines.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <span style={{ fontSize: 11, color: '#bbb', minWidth: 24 }}>{i + 1}</span>
                    <input
                      value={line.name}
                      onChange={e => setLines(lines.map((l, li) => li === i ? { ...l, name: e.target.value } : l))}
                      style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 12, outline: 'none', background: '#fafafa' }}
                    />
                    <button onClick={() => setLines(lines.filter((_, li) => li !== i))} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #fee2e2', background: '#fef2f2', color: '#e53935', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
              {lines.length === 0 && (
                <p style={{ color: '#e53935', fontSize: 12 }}>⚠ Aucun produit — retournez en arrière.</p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('source')} style={{ padding: '10px 16px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer' }}>← Retour</button>
                <button onClick={startSequential} disabled={lines.length === 0} style={{
                  flex: 1, padding: '11px',
                  background: lines.length > 0 ? '#2d7a3a' : '#e0e0e0',
                  border: 'none', borderRadius: 8,
                  color: lines.length > 0 ? '#fff' : '#999',
                  fontWeight: 700, fontSize: 14, cursor: lines.length > 0 ? 'pointer' : 'not-allowed',
                }}>
                  Traiter {lines.length} produit(s) →
                </button>
              </div>
            </div>
          )}

          {/* ════ ÉTAPE 3 : SÉQUENTIEL ════ */}
          {step === 'sequential' && (
            <div>
              {/* Barre de progression */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4 }}>
                  <span>{doneCount} traité(s)</span>
                  <span>{pending.length} restant(s)</span>
                </div>
                <div style={{ height: 4, background: '#f0f0f0', borderRadius: 4 }}>
                  <div style={{ height: '100%', background: '#2d7a3a', borderRadius: 4, width: `${lines.length > 0 ? (doneCount / lines.length) * 100 : 0}%`, transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Nom */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Nom du produit *</label>
                <input value={name} onChange={e => { setName(e.target.value); setError('') }} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                  onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
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

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={skipItem} style={{ padding: '11px 16px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer' }}>
                  Sauter →
                </button>
                <button onClick={saveItem} disabled={saving} style={{
                  flex: 1, padding: '11px',
                  background: saving ? '#e0e0e0' : '#2d7a3a',
                  border: 'none', borderRadius: 8,
                  color: saving ? '#999' : '#fff',
                  fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(45,122,58,0.3)',
                }}>
                  {saving ? '⏳ Sauvegarde...' : '✓ Sauvegarder'}
                </button>
              </div>
            </div>
          )}

          {/* ════ ÉTAPE DONE ════ */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>Importation terminée</h3>
              <p style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>
                <strong style={{ color: '#2d7a3a' }}>{doneCount}</strong> produit(s) sauvegardé(s)
                {skippedCount > 0 && <> · <strong style={{ color: '#888' }}>{skippedCount}</strong> sauté(s)</>}
              </p>
              <button onClick={onClose} style={{ padding: '12px 32px', background: '#2d7a3a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
