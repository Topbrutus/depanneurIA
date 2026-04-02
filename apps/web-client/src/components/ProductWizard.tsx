import { useState, useRef } from 'react'
import BarcodeScanner from './BarcodeScanner'

const API = 'http://localhost:3001'
const CATEGORIES = ['Chips','Boissons','Chocolat','Populaires','Laitier','Boulangerie','Épicerie','Hygiène','Divers','Pharmacie','Confiseries','Collations']

// Nouvel ordre : description → données → photo → save
type Step = 'capture' | 'recognized' | 'gen-description' | 'gen-data' | 'gen-photo' | 'save'
const STEPS: Step[] = ['capture','recognized','gen-description','gen-data','gen-photo','save']
const STEP_LABELS: Record<Step, string> = {
  'capture':         '1. Capture',
  'recognized':      '2. Reconnu',
  'gen-description': '3. Description',
  'gen-data':        '4. Données',
  'gen-photo':       '5. Photo',
  'save':            '6. Sauvegarder',
}

function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const SIZE = 500
        const canvas = document.createElement('canvas')
        canvas.width = SIZE; canvas.height = SIZE
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SIZE, SIZE)
        const ratio = img.width / img.height
        let sw, sh, sx, sy
        if (ratio > 1) { sh = img.height; sw = img.height; sx = Math.floor((img.width - sw) / 2); sy = 0 }
        else { sw = img.width; sh = img.width; sx = 0; sy = Math.floor((img.height - sh) / 2) }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface Props {
  onSave: (product: any) => void
  onClose: () => void
}

// ── Carré aperçu produit ──────────────────────────────────
function PreviewCard({ imageData, product }: { imageData: string; product: any }) {
  const hasData = product.name || product.price || imageData
  if (!hasData) return null
  return (
    <div style={{
      marginTop: 20, border: '1px solid #1e2a38', borderRadius: 10,
      background: '#060f1d', padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start'
    }}>
      <div style={{ width: 64, height: 64, borderRadius: 8, background: '#1e2a38', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imageData
          ? <img src={imageData} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
          : <svg width="40" height="40" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="45" r="44" stroke="#2d3f55" strokeWidth="2" fill="#0d1a2d" />
              <circle cx="45" cy="35" r="16" fill="#2d3f55" />
              <ellipse cx="45" cy="68" rx="24" ry="13" fill="#2d3f55" />
            </svg>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name || <span style={{ color: '#475569', fontStyle: 'italic' }}>Nom non défini</span>}
        </div>
        {product.description && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {product.category && <span style={{ fontSize: 10, background: '#1e2a38', color: '#94a3b8', borderRadius: 4, padding: '2px 6px' }}>{product.category}</span>}
          {product.price && <span style={{ fontSize: 11, fontWeight: 700, color: '#f0a500' }}>{product.price}$</span>}
          {product.quantity && <span style={{ fontSize: 10, color: '#475569' }}>{product.quantity}{product.unit}</span>}
        </div>
      </div>
    </div>
  )
}

export default function ProductWizard({ onSave, onClose }: Props) {
  const [step, setStep]           = useState<Step>('capture')
  const [imageData, setImageData] = useState('')
  const [barcode, setBarcode]     = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const fileRef   = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [product, setProduct] = useState({
    name: '', category: 'Divers', description: '', price: '',
    quantity: '', unit: 'g', emoji: '🥔', stock: '10',
  })
  const [priceAdjust, setPriceAdjust] = useState(0)
  const [basePrice, setBasePrice] = useState('')
  const [barcodeConfirmed, setBarcodeConfirmed] = useState<boolean | null>(null)
  const [showPhotoDescInput, setShowPhotoDescInput] = useState(false)
  const [photoDescInput, setPhotoDescInput] = useState('')
  const [genPhotoError, setGenPhotoError] = useState('')

  const adjustPrice = (delta: number) => {
    const next = Math.round((priceAdjust + delta) * 10) / 10
    setPriceAdjust(next)
    // Toujours calculer depuis le prix de base (marché), pas le prix déjà ajusté
    const base = parseFloat(basePrice) || parseFloat(product.price) || 0
    if (!base) return
    // Mémoriser le prix de base au premier clic si pas encore fait
    if (!basePrice) setBasePrice(product.price)
    setProduct(p => ({ ...p, price: (base * (1 + next / 100)).toFixed(2) }))
  }

  const bg     = '#0d1a2d'
  const border = '1px solid #1e2a38'
  const btnBase: React.CSSProperties = { padding: '12px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }
  const btnYes: React.CSSProperties  = { ...btnBase, background: '#2d7a3a', color: '#fff', flex: 1 }
  const btnNo: React.CSSProperties   = { ...btnBase, background: '#1e2a38', color: '#94a3b8', flex: 1 }
  const stepIdx = STEPS.indexOf(step)

  // ── Capture photo ─────────────────────────────────────────
  const handleFile = async (file: File) => {
    const data = await processImageFile(file)
    setImageData(data)
    setStep('recognized')
  }

  // ── Scan barcode ──────────────────────────────────────────
  const handleBarcode = async (code: string) => {
    setShowScanner(false)
    setBarcode(code)
    setBarcodeConfirmed(null)
    setLoadingMsg('Recherche du produit...')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/lookup-barcode?code=${code}`)
      const data = await res.json()
      if (data.name) setProduct(p => ({ ...p, ...data }))
    } catch { /* ok */ }
    setLoading(false); setLoadingMsg('')
    setStep('recognized')
  }

  // ── Générer description ───────────────────────────────────
  const genDescription = async () => {
    setLoadingMsg('Génération de la description...')
    setLoading(true)
    try {
      if (imageData) {
        // Depuis la photo
        const base64 = imageData.split(',')[1]
        const res = await fetch(`${API}/api/generate-product`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        })
        const data = await res.json()
        if (data.description) setProduct(p => ({ ...p, description: data.description }))
      } else {
        // Depuis le nom ou le barcode
        const res = await fetch(`${API}/api/generate-description`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: product.name, barcode, category: product.category })
        })
        const data = await res.json()
        if (data.description) setProduct(p => ({ ...p, description: data.description }))
      }
    } catch { /* ok */ }
    setLoading(false); setLoadingMsg('')
    setStep('gen-data')
  }

  // ── Générer données produit ───────────────────────────────
  const genData = async () => {
    if (!imageData) { setStep('gen-photo'); return }
    setLoadingMsg('Analyse du produit...')
    setLoading(true)
    try {
      const base64 = imageData.split(',')[1]
      const res = await fetch(`${API}/api/generate-product`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      })
      const data = await res.json()
      setProduct(p => ({
        ...p,
        name:        data.name        || p.name,
        category:    data.category    || p.category,
        description: data.description || p.description,
        price:       data.marketPrice || p.price,
        quantity:    data.quantity    || p.quantity,
        unit:        data.unit        || p.unit,
        emoji:       data.emoji       || p.emoji,
      }))
    } catch { /* ok */ }
    setLoading(false); setLoadingMsg('')
    setStep('gen-photo')
  }

  // ── Générer photo ─────────────────────────────────────────
  const genPhoto = async (descOverride?: string, nextStep: Step = 'save') => {
    const desc = descOverride || product.name || product.description || 'produit de dépanneur québécois'
    setLoadingMsg('Génération de la photo...')
    setGenPhotoError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/generate-image`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc })
      })
      if (!res.ok) throw new Error(`Erreur API ${res.status}`)
      const data = await res.json()
      if (data.imageData) {
        setImageData(`data:image/png;base64,${data.imageData}`)
      } else {
        setGenPhotoError('La génération n\'a pas retourné d\'image — réessayez')
      }
    } catch (e: any) {
      setGenPhotoError('Erreur génération photo : ' + e.message)
    }
    setLoading(false); setLoadingMsg('')
    setStep(nextStep)
  }

  // ── Sauvegarder ───────────────────────────────────────────
  const handleSave = () => {
    onSave({
      name: product.name || 'Produit', price: parseFloat(product.price) || 1.99,
      category: product.category, stock: parseInt(product.stock) || 10,
      emoji: product.emoji, description: product.description,
      quantity: product.quantity, unit: product.unit,
      barcode, imageData: imageData || '',
    })
    onClose()
  }

  return (
    <>
      {showScanner && <BarcodeScanner onScan={handleBarcode} onClose={() => setShowScanner(false)} />}

      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 12 }}>
        <div style={{ background: bg, border, borderRadius: 16, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', color: '#e2e8f0' }}>

          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: bg, zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>NOUVEAU PRODUIT</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0a500' }}>{STEP_LABELS[step]}</div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border, background: '#1e2a38', color: '#94a3b8', fontSize: 16, cursor: 'pointer' }}>×</button>
          </div>

          {/* Barre de progression */}
          <div style={{ display: 'flex', gap: 4, padding: '10px 18px', borderBottom: border }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIdx ? '#f0a500' : '#1e2a38', transition: 'background 0.3s' }} />
            ))}
          </div>

          <div style={{ padding: '20px 18px' }}>

            {/* ── STEP: CAPTURE ── */}
            {step === 'capture' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', margin: '0 0 6px' }}>📦 Comment ajouter le produit ?</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
                <button onClick={() => cameraRef.current?.click()} style={{ ...btnBase, background: '#1565c0', color: '#fff', padding: '14px', fontSize: 14 }}>📸 Prendre une photo</button>
                <button onClick={() => fileRef.current?.click()} style={{ ...btnBase, background: '#1e2a38', color: '#e2e8f0', padding: '14px', fontSize: 14 }}>🖼️ Choisir une image</button>
                <button onClick={() => setShowScanner(true)} style={{ ...btnBase, background: '#1e2a38', color: '#e2e8f0', padding: '14px', fontSize: 14 }}>📊 Scanner un code-barres</button>
                <button onClick={() => setStep('recognized')} style={{ ...btnBase, background: 'transparent', color: '#475569', padding: '10px', fontSize: 12, border }}>Continuer sans photo →</button>
              </div>
            )}

            {/* ── STEP: RECOGNIZED ── */}
            {step === 'recognized' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', margin: 0 }}>✅ Produit capturé</p>
                {imageData
                  ? <img src={imageData} style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 10, background: '#1e2a38', padding: 8 }} alt="" />
                  : <div style={{ width: '100%', background: '#1e2a38', borderRadius: 10, padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                      <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="45" cy="45" r="44" stroke="#2d3f55" strokeWidth="2" fill="#0d1a2d" />
                        <circle cx="45" cy="35" r="16" fill="#2d3f55" />
                        <ellipse cx="45" cy="68" rx="24" ry="13" fill="#2d3f55" />
                        <circle cx="45" cy="45" r="44" fill="url(#shimmer)" fillOpacity="0.08" />
                        <defs>
                          <radialGradient id="shimmer" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#f0a500" />
                            <stop offset="100%" stopColor="transparent" />
                          </radialGradient>
                        </defs>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '60%' }}>
                        <div style={{ height: 10, width: '80%', background: '#2d3f55', borderRadius: 5 }} />
                        <div style={{ height: 8, width: '55%', background: '#1e2a38', borderRadius: 5 }} />
                      </div>
                    </div>
                }
                {barcode && <div style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>Code-barres : <strong style={{ color: '#f0a500' }}>{barcode}</strong></div>}

                {/* Confirmation du produit scanné */}
                {barcode && product.name && barcodeConfirmed === null
                  ? <div style={{ background: '#1e2a38', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>
                        Est-ce bien <strong style={{ color: '#f0a500' }}>{product.name}</strong> ?
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setBarcodeConfirmed(true)} style={btnYes}>Oui</button>
                        <button onClick={() => setBarcodeConfirmed(false)} style={btnNo}>Non</button>
                      </div>
                    </div>
                  : barcodeConfirmed === false
                    ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Entrez le nom correct du produit :</div>
                        <input value={product.name} onChange={e => setProduct(p => ({ ...p, name: e.target.value }))}
                          placeholder="Nom du produit..."
                          style={{ width: '100%', background: '#0d1a2d', border, borderRadius: 6, padding: '8px 10px', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                        <button onClick={() => setBarcodeConfirmed(true)} style={btnYes} disabled={!product.name.trim()}>✓ Confirmer</button>
                      </div>
                    : product.name
                      ? <div style={{ textAlign: 'center', fontSize: 13, color: '#2d7a3a', fontWeight: 600 }}>✓ {product.name}</div>
                      : null
                }

                {/* Options photo + Continuer — visibles seulement si barcode confirmé (ou pas de barcode/nom) */}
                {(barcodeConfirmed === true || !barcode || !product.name) && (
                  loading
                    ? <div style={{ textAlign: 'center', color: '#f0a500', padding: 12 }}>⏳ {loadingMsg}</div>
                    : <>
                        {!imageData && !showPhotoDescInput && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button onClick={() => cameraRef.current?.click()} style={{ ...btnBase, background: '#1565c0', color: '#fff', padding: '11px', fontSize: 13 }}>
                              📸 Prendre une photo
                            </button>
                            <button onClick={() => fileRef.current?.click()} style={{ ...btnBase, background: '#1e2a38', color: '#e2e8f0', padding: '11px', fontSize: 13 }}>
                              🖼️ J'ai déjà une photo
                            </button>
                            <button onClick={() => {
                              if (barcodeConfirmed === true && (product.name || product.description)) {
                                // Barcode confirmé : générer directement, aller à gen-photo pour voir le résultat
                                const desc = [product.name, product.description].filter(Boolean).join(' — ')
                                genPhoto(desc, 'gen-photo')
                              } else {
                                // Pas de barcode ou produit inconnu : demander une description
                                setShowPhotoDescInput(true)
                                setPhotoDescInput('')
                              }
                            }} style={{ ...btnBase, background: '#7c3aed', color: '#fff', padding: '11px', fontSize: 13 }}>
                              🎨 Générer une photo avec l'IA
                            </button>
                          </div>
                        )}
                        {showPhotoDescInput && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>Décrivez le produit pour générer la photo :</div>
                            <textarea value={photoDescInput} onChange={e => setPhotoDescInput(e.target.value)}
                              placeholder="Ex: canette Coca-Cola 355ml rouge, bouteille Pepsi 2L..."
                              rows={2}
                              style={{ width: '100%', background: '#0d1a2d', border, borderRadius: 6, padding: '8px 10px', color: '#e2e8f0', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={async () => {
                                  const desc = photoDescInput.trim()
                                  if (!desc) return
                                  setProduct(p => ({ ...p, description: desc }))
                                  setShowPhotoDescInput(false)
                                  await genPhoto(desc, 'gen-description')
                                }}
                                disabled={!photoDescInput.trim()}
                                style={{ ...btnYes, flex: 1, background: photoDescInput.trim() ? '#7c3aed' : '#1e2a38', color: photoDescInput.trim() ? '#fff' : '#475569', cursor: photoDescInput.trim() ? 'pointer' : 'not-allowed' }}>
                                🎨 Générer
                              </button>
                              <button onClick={() => setShowPhotoDescInput(false)} style={{ ...btnNo, flex: 'none', padding: '12px 16px' }}>Annuler</button>
                            </div>
                          </div>
                        )}
                        {!showPhotoDescInput && (
                          <button onClick={() => setStep('gen-description')} style={btnYes}>Continuer →</button>
                        )}
                      </>
                )}
              </div>
            )}

            {/* ── STEP: GEN DESCRIPTION ── */}
            {step === 'gen-description' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {product.description
                  ? <>
                      {/* Description déjà trouvée — confirmer */}
                      <p style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', margin: 0 }}>📝 Description trouvée</p>
                      <div style={{ background: '#1e2a38', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{product.description}"
                      </div>
                      <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>Est-ce que cette description est correcte ?</p>
                      {loading
                        ? <div style={{ textAlign: 'center', color: '#f0a500', padding: 20 }}>⏳ {loadingMsg}</div>
                        : <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={async () => {
                              if (imageData) {
                                setStep('gen-photo')
                              } else {
                                await genPhoto(product.description, 'gen-photo')
                              }
                            }} style={btnYes}>Oui, générer la photo →</button>
                            <button onClick={() => setProduct(p => ({ ...p, description: '' }))} style={btnNo}>Non, corriger</button>
                          </div>
                      }
                    </>
                  : <>
                      {/* Pas de description — proposer de générer */}
                      <p style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', margin: 0 }}>📝 Générer la description ?</p>
                      <p style={{ fontSize: 11, color: '#475569', textAlign: 'center', margin: 0 }}>
                        {imageData ? 'Depuis la photo' : product.name ? `Depuis le nom : "${product.name}"` : barcode ? `Depuis le code-barres : ${barcode}` : 'Depuis les informations disponibles'}
                      </p>
                      {loading
                        ? <div style={{ textAlign: 'center', color: '#f0a500', padding: 20 }}>⏳ {loadingMsg}</div>
                        : <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={genDescription} style={btnYes}>Oui</button>
                            <button onClick={() => setStep('gen-data')} style={btnNo}>Non</button>
                          </div>
                      }
                    </>
                }
              </div>
            )}

            {/* ── STEP: GEN DATA ── */}
            {step === 'gen-data' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', margin: 0 }}>✨ Générer les données produit ?</p>
                <p style={{ fontSize: 11, color: '#475569', textAlign: 'center', margin: 0 }}>Nom · Catégorie · Prix · Quantité</p>
                {!imageData && <p style={{ fontSize: 12, color: '#e53935', textAlign: 'center', margin: 0 }}>⚠ Nécessite une photo</p>}
                {loading
                  ? <div style={{ textAlign: 'center', color: '#f0a500', padding: 20 }}>⏳ {loadingMsg}</div>
                  : <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={genData} disabled={!imageData} style={{ ...btnYes, background: imageData ? '#2d7a3a' : '#1e2a38', color: imageData ? '#fff' : '#475569', cursor: imageData ? 'pointer' : 'not-allowed' }}>Oui</button>
                      <button onClick={() => setStep('gen-photo')} style={btnNo}>Non</button>
                    </div>
                }
              </div>
            )}

            {/* ── STEP: GEN PHOTO ── */}
            {step === 'gen-photo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {genPhotoError && (
                  <div style={{ background: '#1e0a0a', border: '1px solid #e53935', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ef9a9a' }}>
                    ⚠ {genPhotoError}
                  </div>
                )}
                {imageData
                  ? <>
                      {/* Photo existe — demander si elle convient */}
                      <p style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', margin: 0 }}>🖼️ Est-ce que la photo vous convient ?</p>
                      <img src={imageData} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 10, background: '#1e2a38', padding: 8 }} alt="" />
                      {loading
                        ? <div style={{ textAlign: 'center', color: '#f0a500', padding: 12 }}>⏳ {loadingMsg}</div>
                        : <>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button onClick={() => setStep('save')} style={btnYes}>✓ Oui, parfait</button>
                              <button onClick={() => genPhoto(product.description || undefined, 'gen-photo')} style={{ ...btnBase, background: '#7c3aed', color: '#fff', flex: 1 }}>🔄 Régénérer</button>
                            </div>
                            <button onClick={() => setStep('save')} style={{ ...btnNo, textAlign: 'center', fontSize: 12, padding: '8px' }}>Passer sans photo IA →</button>
                          </>
                      }
                    </>
                  : <>
                      {/* Pas de photo — proposer de générer */}
                      <p style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', margin: 0 }}>🎨 Générer une photo avec l'IA ?</p>
                      {product.name && <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: 0 }}>Basée sur : <strong style={{ color: '#e2e8f0' }}>{product.name}</strong></p>}
                      {loading
                        ? <div style={{ textAlign: 'center', color: '#f0a500', padding: 20 }}>⏳ {loadingMsg}</div>
                        : <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => genPhoto(undefined, 'gen-photo')} style={btnYes}>Oui</button>
                            <button onClick={() => setStep('save')} style={btnNo}>Non</button>
                          </div>
                      }
                    </>
                }
              </div>
            )}

            {/* ── STEP: SAVE ── */}
            {step === 'save' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', margin: 0 }}>💾 Sauvegarder ce produit ?</p>

                {/* Photo */}
                {imageData
                  ? <img src={imageData} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 10, background: '#1e2a38', padding: 8 }} alt="" />
                  : <div style={{ width: '100%', background: '#1e2a38', borderRadius: 10, padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
                      <svg width="70" height="70" viewBox="0 0 90 90" fill="none">
                        <circle cx="45" cy="45" r="44" stroke="#2d3f55" strokeWidth="2" fill="#0d1a2d" />
                        <circle cx="45" cy="35" r="16" fill="#2d3f55" />
                        <ellipse cx="45" cy="68" rx="24" ry="13" fill="#2d3f55" />
                      </svg>
                    </div>
                }

                <div style={{ background: '#1e2a38', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Nom */}
                  <div>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 3 }}>NOM</div>
                    <input value={product.name} onChange={e => setProduct(p => ({ ...p, name: e.target.value }))}
                      placeholder="Nom du produit" style={{ width: '100%', background: '#0d1a2d', border, borderRadius: 6, padding: '7px 10px', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>

                  {/* Description */}
                  <div>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 5 }}>DESCRIPTION</div>
                    {product.description
                      ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 12, color: '#94a3b8', background: '#0d1a2d', borderRadius: 6, padding: '7px 10px', lineHeight: 1.5 }}>{product.description}</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => {}} style={{ fontSize: 11, padding: '4px 10px', background: '#2d7a3a', border: 'none', borderRadius: 6, color: '#fff', cursor: 'default' }}>✓ Garder</button>
                            <button onClick={() => setProduct(p => ({ ...p, description: '' }))} style={{ fontSize: 11, padding: '4px 10px', background: '#0d1a2d', border, borderRadius: 6, color: '#94a3b8', cursor: 'pointer' }}>✏️ Corriger</button>
                          </div>
                        </div>
                      : <textarea value={product.description} onChange={e => setProduct(p => ({ ...p, description: e.target.value }))}
                          placeholder="Entrez une description..." rows={2}
                          style={{ width: '100%', background: '#0d1a2d', border, borderRadius: 6, padding: '7px 10px', color: '#e2e8f0', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                    }
                  </div>

                  {/* Catégorie */}
                  <div>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 3 }}>CATÉGORIE</div>
                    <select value={product.category} onChange={e => setProduct(p => ({ ...p, category: e.target.value }))}
                      style={{ width: '100%', background: '#0d1a2d', border, borderRadius: 6, padding: '7px 8px', color: '#e2e8f0', fontSize: 12 }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Prix + ajustement % */}
                  <div>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 5 }}>PRIX ($)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 9, color: '#475569', marginBottom: 3 }}>PRIX MARCHÉ</div>
                        <input value={basePrice || product.price} onChange={e => { setBasePrice(e.target.value); setPriceAdjust(0); setProduct(p => ({ ...p, price: e.target.value })) }}
                          type="number" step="0.01" placeholder="1.99"
                          style={{ width: '100%', background: '#0d1a2d', border, borderRadius: 6, padding: '7px 10px', color: '#94a3b8', fontSize: 13, boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#475569', marginBottom: 3 }}>PRIX FINAL</div>
                        <input value={product.price} onChange={e => setProduct(p => ({ ...p, price: e.target.value }))}
                          type="number" step="0.01" placeholder="1.99"
                          style={{ width: '100%', background: '#0d1a2d', border, borderRadius: 6, padding: '7px 10px', color: '#f0a500', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => adjustPrice(-1)} style={{ padding: '4px 10px', background: '#0d1a2d', border, borderRadius: 6, color: '#2d7a3a', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>-1%</button>
                      <button onClick={() => adjustPrice(-0.1)} style={{ padding: '4px 8px', background: '#0d1a2d', border, borderRadius: 6, color: '#2d7a3a', fontSize: 12, cursor: 'pointer' }}>−</button>
                      <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 700, color: priceAdjust > 0 ? '#e53935' : priceAdjust < 0 ? '#2d7a3a' : '#475569' }}>
                        {priceAdjust > 0 ? '+' : ''}{priceAdjust.toFixed(1)}%
                      </div>
                      <button onClick={() => { setPriceAdjust(0); setProduct(p => ({ ...p, price: basePrice || p.price })) }} style={{ padding: '4px 8px', background: '#0d1a2d', border, borderRadius: 6, color: '#475569', fontSize: 11, cursor: 'pointer' }}>0</button>
                      <button onClick={() => adjustPrice(0.1)} style={{ padding: '4px 8px', background: '#0d1a2d', border, borderRadius: 6, color: '#e53935', fontSize: 12, cursor: 'pointer' }}>+</button>
                      <button onClick={() => adjustPrice(1)} style={{ padding: '4px 10px', background: '#0d1a2d', border, borderRadius: 6, color: '#e53935', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>+1%</button>
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 3 }}>STOCK</div>
                    <input value={product.stock} onChange={e => setProduct(p => ({ ...p, stock: e.target.value }))}
                      type="number" placeholder="10"
                      style={{ width: '100%', background: '#0d1a2d', border, borderRadius: 6, padding: '7px 10px', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSave} style={btnYes}>✓ Oui, sauvegarder</button>
                  <button onClick={onClose} style={btnNo}>Non, annuler</button>
                </div>
              </div>
            )}

            {/* ── APERÇU PRODUIT (toutes les étapes sauf capture) ── */}
            {step !== 'capture' && step !== 'save' && (
              <PreviewCard imageData={imageData} product={product} />
            )}

          </div>
        </div>
      </div>
    </>
  )
}
