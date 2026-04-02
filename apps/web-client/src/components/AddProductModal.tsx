import { useState, useRef } from 'react'
import ImageUploader from './ImageUploader'
import BarcodeScanner from './BarcodeScanner'

const CATEGORIES = ['Chips','Boissons','Chocolat','Populaires','Laitier','Boulangerie','Épicerie','Hygiène','Divers','Pharmacie','Confiseries','Collations']
const UNITS = ['g','ml','L','kg','lb','oz','unité','pack']
const EMOJIS = ['🥔','🥤','🍫','🍞','🥛','🍊','🧃','🥜','🍦','🍬','💊','🧴','🔋','☕','🧀','🍯','🥚','🧈']

interface Props {
  onSave: (product: any) => void
  onClose: () => void
  initialData?: any
  productId?: number
}

function processImage(file: File): Promise<{ dataUrl: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const SIZE = 500
        const canvas = document.createElement('canvas')
        canvas.width = SIZE; canvas.height = SIZE
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, SIZE, SIZE)
        const ratio = img.width / img.height
        let sw, sh, sx, sy
        if (ratio > 1) { sh = img.height; sw = img.height; sx = Math.floor((img.width - sw) / 2); sy = 0 }
        else { sw = img.width; sh = img.width; sx = 0; sy = Math.floor((img.height - sh) / 2) }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE)
        const baseName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/\s+/g, '-')
        resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.88), fileName: `${baseName}.jpg` })
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AddProductModal({ onSave, onClose, initialData, productId }: Props) {
  const [name, setName]               = useState(initialData?.name || '')
  const [price, setPrice]             = useState(initialData?.price?.toString() || '')
  const [marketPrice, setMarketPrice] = useState(initialData?.price?.toString() || '')
  const [priceAdjust, setPriceAdjust] = useState(0)
  const [category, setCategory]       = useState(initialData?.category || 'Chips')
  const [description, setDescription] = useState(initialData?.description || '')
  const [quantity, setQuantity]       = useState(initialData?.quantity || '')
  const [unit, setUnit]               = useState(initialData?.unit || 'g')
  const [stock, setStock]             = useState(initialData?.stock?.toString() || '10')
  const [emoji, setEmoji]             = useState(initialData?.emoji || '🥔')
  const [barcode, setBarcode]         = useState(initialData?.barcode || '')
  const [sku, setSku]                 = useState(initialData?.sku || '')
  const [imageData, setImageData]     = useState(initialData?.image && !initialData.image.startsWith('/') ? initialData.image : initialData?.image ? 'http://localhost:3001' + initialData.image : '')
  const [fileName, setFileName]       = useState('')
  const [noPhotoDesc, setNoPhotoDesc] = useState('')
  const [error, setError]             = useState('')
  const [generating, setGenerating]   = useState(false)
  const [generatingPhoto, setGeneratingPhoto] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [speaking, setSpeaking]       = useState(false)
  const [showScanner, setShowScanner]   = useState(false)
  const [tab, setTab]                   = useState<'photo'|'nophoto'>('photo')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult]   = useState<any>(null)   // résultat brut API
  const [lookupConfirmed, setLookupConfirmed] = useState(false)   // user a dit "oui"
  const [lookupNotFound, setLookupNotFound]   = useState(false)

  const switchToNoPhoto = () => {
    // Pré-remplir noPhotoDesc avec les infos déjà saisies si disponibles
    if (!noPhotoDesc.trim() && (name.trim() || description.trim())) {
      const parts = [name.trim(), description.trim(), quantity ? `${quantity} ${unit}` : ''].filter(Boolean)
      setNoPhotoDesc(parts.join(', '))
    }
    setTab('nophoto')
  }
  const [supplierCount, setSupplierCount] = useState('5')
  const [suppliers, setSuppliers]     = useState<{name:string, contact:string, notes:string}[]>([])
  const [searchingSuppliers, setSearchingSuppliers] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)

  const finalPrice = marketPrice
    ? (parseFloat(marketPrice) * (1 + priceAdjust / 100)).toFixed(2)
    : price

  // ─── Générer infos avec IA (depuis photo) ──────────────
  const generateWithAI = async () => {
    if (!imageData) { setError('Ajoutez une photo d\'abord'); return }
    setGenerating(true); setError('')
    try {
      const base64 = imageData.split(',')[1]
      const res = await fetch('http://localhost:3001/api/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      })
      if (!res.ok) throw new Error('Erreur API')
      const parsed = await res.json()
      setName(parsed.name || '')
      setCategory(parsed.category || 'Divers')
      setDescription(parsed.description || '')
      setQuantity(parsed.quantity || '')
      setUnit(parsed.unit || 'g')
      setMarketPrice(parsed.marketPrice || '')
      setPrice(parsed.marketPrice || '')
      setEmoji(parsed.emoji || '🥔')
    } catch { setError('Erreur de génération IA — réessayez') }
    setGenerating(false)
  }

  // ─── Générer photo depuis une description (string) ───────
  const generatePhotoFromText = async (desc: string) => {
    if (!desc.trim()) { setError('Aucune description disponible'); return }
    setGeneratingPhoto(true); setError('')
    try {
      const res = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc })
      })
      if (!res.ok) throw new Error('Erreur génération image')
      const data = await res.json()
      if (data.imageData) {
        setImageData(`data:image/png;base64,${data.imageData}`)
        setFileName('generated-product.png')
        setTab('photo') // bascule sur l'onglet photo pour afficher le résultat
      }
    } catch { setError('Erreur génération photo — réessayez') }
    setGeneratingPhoto(false)
  }

  const generatePhotoFromDesc = () => generatePhotoFromText(noPhotoDesc)

  // Génère depuis les infos existantes (nom + description + quantité)
  const generatePhotoFromExisting = () => {
    const desc = [name.trim(), description.trim(), quantity ? `${quantity} ${unit}` : '']
      .filter(Boolean).join(', ')
    generatePhotoFromText(desc)
  }

  // ─── Lecture vocale ────────────────────────────────────
  const speakDescription = () => {
    window.speechSynthesis.cancel()
    const text = `${name}. ${description || ''}. ${quantity ? quantity + ' ' + unit + '.' : ''} Prix : ${finalPrice} dollars.`
    setSpeaking(true)
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'fr-CA'; u.rate = 0.85; u.volume = 1
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setTimeout(() => window.speechSynthesis.speak(u), 100)
  }

  // ─── Caméra photo ──────────────────────────────────────
  const handleCameraFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const { dataUrl, fileName: fn } = await processImage(file)
    setImageData(dataUrl); setFileName(fn)
    e.target.value = ''
  }

  // ─── Lookup code barres (scan ou saisie manuelle) ─────
  const doBarcodeLookup = async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return
    setBarcode(trimmed)
    setShowScanner(false)
    setLookupResult(null)
    setLookupConfirmed(false)
    setLookupNotFound(false)
    setLookupLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/lookup-barcode?code=${trimmed}`)
      if (res.ok) {
        const data = await res.json()
        if (data.name) {
          setLookupResult(data)   // stocke sans appliquer
        } else {
          setLookupNotFound(true)
        }
      } else {
        setLookupNotFound(true)
      }
    } catch { setLookupNotFound(true) }
    setLookupLoading(false)
  }

  const handleBarcodeScan = (code: string) => doBarcodeLookup(code)

  // Applique le résultat du lookup dans le formulaire
  const confirmLookup = () => {
    if (!lookupResult) return
    setName(lookupResult.name        || '')
    setCategory(lookupResult.category  || 'Divers')
    setDescription(lookupResult.description || '')
    setQuantity(lookupResult.quantity   || '')
    setUnit(lookupResult.unit        || 'g')
    if (lookupResult.price) { setMarketPrice(String(lookupResult.price)); setPrice(String(lookupResult.price)) }
    setLookupConfirmed(true)
  }

  const rejectLookup = () => {
    setLookupResult(null)
    setLookupConfirmed(false)
    setLookupNotFound(true)
  }

  // ─── Trouver fournisseurs ──────────────────────────────
  const findSuppliers = async () => {
    if (!name.trim()) { setError('Entrez le nom du produit d\'abord'); return }
    setSearchingSuppliers(true); setError('')
    try {
      const res = await fetch('http://localhost:3001/api/find-suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name, description, count: parseInt(supplierCount) || 5 })
      })
      const data = await res.json()
      setSuppliers(data.suppliers || [])
    } catch { setError('Erreur recherche fournisseurs — réessayez') }
    setSearchingSuppliers(false)
  }

  // ─── Ajustement prix ───────────────────────────────────
  const adjustPrice = (delta: number) => {
    const next = Math.round((priceAdjust + delta) * 10) / 10
    setPriceAdjust(next)
    if (marketPrice) setPrice((parseFloat(marketPrice) * (1 + next / 100)).toFixed(2))
  }

  // ─── Enregistrer ──────────────────────────────────────
  const handleSave = () => {
    if (!name.trim()) { setError('Le nom est requis'); return }
    if (!finalPrice || isNaN(+finalPrice) || +finalPrice <= 0) { setError('Prix invalide'); return }
    onSave({
      name: name.trim(), price: parseFloat(finalPrice),
      category, stock: parseInt(stock) || 10,
      emoji, description, quantity, unit,
      barcode, sku,
      image: imageData || '',
    })
    onClose()
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13, outline: 'none', background: '#fafafa' }

  return (
    <>
      {showScanner && <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />}

      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 12 }}>
        <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '93vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>

          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{productId ? '✏️ Modifier le produit' : 'Ajouter un produit'}</h2>
              <p style={{ fontSize: 11, color: '#999', margin: 0 }}>{productId ? `ID #${productId}` : 'IA génère tout automatiquement'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, color: '#666' }}>
                <input type="checkbox" checked={soundEnabled} onChange={e => setSoundEnabled(e.target.checked)} />
                🔊
              </label>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e0e0e0', background: '#f5f5f5', fontSize: 16, cursor: 'pointer' }}>×</button>
            </div>
          </div>

          <div style={{ padding: '16px 18px' }}>

            {/* ── CODE BARRES ── */}
            <div style={{ marginBottom: 16, background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 10, padding: '12px 14px' }}>
              <label style={labelStyle}>📊 Code barres / SKU</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  value={barcode}
                  onChange={e => { setBarcode(e.target.value); setLookupResult(null); setLookupConfirmed(false); setLookupNotFound(false) }}
                  onKeyDown={e => { if (e.key === 'Enter') doBarcodeLookup(barcode) }}
                  placeholder="Code barres (saisir + Enter, ou scanner)"
                  style={{ ...inputStyle, flex: 1, background: '#fff' }}
                  onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                  onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
                <button onClick={() => doBarcodeLookup(barcode)} disabled={!barcode.trim() || lookupLoading} title="Rechercher" style={{
                  padding: '9px 12px', background: barcode.trim() && !lookupLoading ? '#1565c0' : '#e0e0e0',
                  border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14,
                }}>🔍</button>
                <button onClick={() => setShowScanner(true)} title="Scanner" style={{
                  padding: '9px 12px', background: '#2d7a3a', border: 'none', borderRadius: 8,
                  color: '#fff', cursor: 'pointer', fontSize: 16,
                }}>📷</button>
              </div>

              {/* Recherche en cours */}
              {lookupLoading && (
                <p style={{ fontSize: 12, color: '#1565c0', margin: '6px 0 0' }}>🔍 Recherche en cours...</p>
              )}

              {/* Produit trouvé — confirmation */}
              {lookupResult && !lookupConfirmed && (
                <div style={{ marginTop: 10, background: '#fff', border: '2px solid #2d7a3a', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#2d7a3a', margin: '0 0 6px' }}>✅ Produit trouvé :</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>{lookupResult.name}</p>
                  {lookupResult.description && <p style={{ fontSize: 12, color: '#555', margin: '0 0 2px' }}>{lookupResult.description}</p>}
                  <p style={{ fontSize: 12, color: '#888', margin: '0 0 10px' }}>
                    {lookupResult.category && <span style={{ marginRight: 8 }}>📂 {lookupResult.category}</span>}
                    {lookupResult.price && <span style={{ color: '#f0a500', fontWeight: 700 }}>{lookupResult.price} $</span>}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px' }}>C'est le bon produit ?</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={confirmLookup} style={{ flex: 1, padding: '9px', background: '#2d7a3a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      ✓ Oui
                    </button>
                    <button onClick={rejectLookup} style={{ flex: 1, padding: '9px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, color: '#e53935', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      ✗ Non
                    </button>
                  </div>
                </div>
              )}

              {/* Non trouvé */}
              {lookupNotFound && !lookupConfirmed && (
                <p style={{ fontSize: 12, color: '#f0a500', margin: '8px 0 0' }}>⚠ Produit non trouvé — remplissez les informations manuellement</p>
              )}

              {/* Confirmé */}
              {lookupConfirmed && (
                <p style={{ fontSize: 12, color: '#2d7a3a', margin: '8px 0 0' }}>✓ <strong>{name}</strong> — infos appliquées</p>
              )}

              <input value={sku} onChange={e => setSku(e.target.value)}
                placeholder="SKU / Code interne (optionnel)"
                style={{ ...inputStyle, background: '#fff', marginTop: 8 }}
                onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
            </div>

            {/* ── CHOIX PHOTO (visible seulement si barcode confirmé ou pas de barcode) ── */}
            {(lookupConfirmed || lookupNotFound || !barcode.trim()) && (
            <div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Photo du produit</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <button onClick={() => { cameraRef.current?.click() }} style={{ padding: '10px 6px', border: `2px solid ${tab === 'photo' ? '#2d7a3a' : '#e0e0e0'}`, borderRadius: 10, background: tab === 'photo' ? '#e8f5eb' : '#fafafa', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>📸</div>
                    Prendre une photo
                  </button>
                  <button onClick={() => setTab('photo')} style={{ padding: '10px 6px', border: `2px solid ${tab === 'photo' && imageData ? '#2d7a3a' : '#e0e0e0'}`, borderRadius: 10, background: '#fafafa', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>📁</div>
                    J'ai une photo
                  </button>
                  <button
                    onClick={() => lookupConfirmed ? generatePhotoFromExisting() : switchToNoPhoto()}
                    disabled={generatingPhoto}
                    style={{ padding: '10px 6px', border: `2px solid ${tab === 'nophoto' ? '#2d7a3a' : '#e0e0e0'}`, borderRadius: 10, background: tab === 'nophoto' ? '#e8f5eb' : '#fafafa', cursor: generatingPhoto ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, color: '#333', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{generatingPhoto ? '⏳' : '🎨'}</div>
                    {generatingPhoto ? 'Génération...' : 'Générer une photo'}
                  </button>
                </div>
              </div>

            {tab === 'photo' ? (
              /* ── AVEC PHOTO ── */
              <div style={{ marginBottom: 14 }}>
                <ImageUploader productName={name || undefined} onImageReady={(data, fname) => { setImageData(data); setFileName(fname) }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => cameraRef.current?.click()} style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafafa', fontSize: 12, cursor: 'pointer' }}>
                    📸 Prendre une photo
                  </button>
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleCameraFile} style={{ display: 'none' }} />
                  <button onClick={generateWithAI} disabled={!imageData || generating} style={{
                    flex: 1, padding: '8px',
                    background: imageData && !generating ? '#2d7a3a' : '#e0e0e0',
                    border: 'none', borderRadius: 8,
                    color: imageData && !generating ? '#fff' : '#999',
                    fontSize: 12, fontWeight: 700, cursor: imageData && !generating ? 'pointer' : 'not-allowed',
                  }}>
                    {generating ? '⏳ Génération...' : '✨ Générer avec IA'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── SANS PHOTO ── */
              <div style={{ marginBottom: 14 }}>
                {lookupConfirmed ? (
                  /* Produit confirmé — génération directe, pas besoin de décrire */
                  <div style={{ background: '#e8f5eb', border: '1px solid #c8e6c9', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#2d7a3a', fontWeight: 600, marginBottom: 4 }}>
                      ✓ Description disponible depuis le produit trouvé
                    </div>
                    <div style={{ fontSize: 12, color: '#555' }}>{name}{description ? ` — ${description}` : ''}</div>
                    <button onClick={generatePhotoFromExisting} disabled={generatingPhoto} style={{ marginTop: 10, padding: '9px 20px', background: generatingPhoto ? '#e0e0e0' : '#1565c0', border: 'none', borderRadius: 8, color: generatingPhoto ? '#999' : '#fff', fontWeight: 700, fontSize: 13, cursor: generatingPhoto ? 'not-allowed' : 'pointer' }}>
                      {generatingPhoto ? '⏳ Génération...' : '🎨 Générer la photo'}
                    </button>
                  </div>
                ) : (
                  /* Produit non trouvé ou refusé — demande description */
                  <div>
                    <label style={labelStyle}>Décrivez le produit pour générer la photo</label>
                    <textarea value={noPhotoDesc} onChange={e => setNoPhotoDesc(e.target.value)}
                  placeholder="Ex: Lait 2% Natrel 2 litres, format carton blanc et bleu, produit québécois..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                  onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={generatePhotoFromDesc} disabled={!noPhotoDesc.trim() || generatingPhoto} style={{
                    flex: 1, padding: '9px',
                    background: noPhotoDesc.trim() && !generatingPhoto ? '#1565c0' : '#e0e0e0',
                    border: 'none', borderRadius: 8,
                    color: noPhotoDesc.trim() && !generatingPhoto ? '#fff' : '#999',
                    fontSize: 12, fontWeight: 700, cursor: noPhotoDesc.trim() && !generatingPhoto ? 'pointer' : 'not-allowed',
                  }}>
                    {generatingPhoto ? '⏳ Génération photo...' : '🎨 Générer la photo'}
                  </button>
                  <button onClick={generateWithAI} disabled={!imageData || generating} style={{
                    flex: 1, padding: '9px',
                    background: imageData && !generating ? '#2d7a3a' : '#e0e0e0',
                    border: 'none', borderRadius: 8,
                    color: imageData && !generating ? '#fff' : '#999',
                    fontSize: 12, fontWeight: 700, cursor: imageData && !generating ? 'pointer' : 'not-allowed',
                  }}>
                    {generating ? '⏳...' : '✨ Générer description'}
                  </button>
                </div>
                {imageData && (
                  <div style={{ marginTop: 12 }}>
                    <img src={imageData} style={{ width: '100%', maxWidth: 500, height: 'auto', objectFit: 'contain', borderRadius: 10, display: 'block', margin: '0 auto' }} alt="Photo générée" />
                    <p style={{ fontSize: 11, color: '#2d7a3a', textAlign: 'center', marginTop: 6 }}>✓ Photo générée !</p>
                  </div>
                )}
                  </div>
                )}
              </div>
            )}
            </div>
            )}

            {/* Bouton lecture vocale */}
            {soundEnabled && (name || description) && (
              <button onClick={() => { if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false) } else { speakDescription() } }}
                style={{ width: '100%', marginBottom: 14, padding: '7px', background: speaking ? '#fce4e4' : '#e8f5eb', border: `1px solid ${speaking ? '#f87171' : '#c8e6c9'}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', color: speaking ? '#e53935' : '#2d7a3a' }}>
                {speaking ? '⏹ Arrêter la lecture' : '🔊 Lire la description'}
              </button>
            )}

            {/* Nom */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Nom du produit *</label>
              <input value={name} onChange={e => { setName(e.target.value); setError('') }}
                placeholder="ex: Lay's Ketchup 200g" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Description courte..." style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
            </div>

            {/* Quantité + Unité */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Quantité</label>
                <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="ex: 200" type="number" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                  onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
              </div>
              <div>
                <label style={labelStyle}>Unité</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Prix */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>💰 Prix</label>
              <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>PRIX MARCHÉ ($)</div>
                    <input value={marketPrice} onChange={e => { setMarketPrice(e.target.value); setPrice((parseFloat(e.target.value || '0') * (1 + priceAdjust / 100)).toFixed(2)) }}
                      placeholder="3.49" type="number" step="0.01"
                      style={{ ...inputStyle, background: '#fff' }}
                      onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                      onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>PRIX FINAL ($)</div>
                    <input value={finalPrice} onChange={e => setPrice(e.target.value)} placeholder="3.49" type="number" step="0.01"
                      style={{ ...inputStyle, background: '#fff', fontWeight: 700, color: '#2d7a3a' }}
                      onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                      onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#666' }}>Ajust. :</span>
                  <button onClick={() => adjustPrice(-0.1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>−</button>
                  <button onClick={() => adjustPrice(-1)} style={{ width: 32, height: 26, borderRadius: 6, border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 10 }}>-1%</button>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 13, color: priceAdjust > 0 ? '#e53935' : priceAdjust < 0 ? '#2d7a3a' : '#666' }}>
                    {priceAdjust > 0 ? '+' : ''}{priceAdjust.toFixed(1)}%
                  </div>
                  <button onClick={() => adjustPrice(1)} style={{ width: 32, height: 26, borderRadius: 6, border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 10 }}>+1%</button>
                  <button onClick={() => adjustPrice(0.1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>+</button>
                  <button onClick={() => { setPriceAdjust(0); if (marketPrice) setPrice(marketPrice) }} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e0e0e0', background: '#f5f5f5', cursor: 'pointer', fontSize: 10 }}>0</button>
                </div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4, textAlign: 'center' }}>
                  {priceAdjust > 0 ? `${priceAdjust.toFixed(1)}% plus cher que le marché` : priceAdjust < 0 ? `${Math.abs(priceAdjust).toFixed(1)}% moins cher` : 'Prix du marché'}
                </div>
              </div>
            </div>

            {/* Stock + Catégorie */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Stock</label>
                <input value={stock} onChange={e => setStock(e.target.value)} placeholder="10" type="number" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                  onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
              </div>
              <div>
                <label style={labelStyle}>Catégorie</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Emoji si pas de photo */}
            {!imageData && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Emoji</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)} style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${emoji === e ? '#2d7a3a' : '#e0e0e0'}`, background: emoji === e ? '#e8f5eb' : '#fafafa', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── FOURNISSEURS ── */}
            <div style={{ marginBottom: 16, background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 10, padding: '12px 14px' }}>
              <label style={labelStyle}>🏭 Meilleurs fournisseurs</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  value={supplierCount} onChange={e => setSupplierCount(e.target.value)}
                  type="number" min="1" max="50" placeholder="5"
                  style={{ ...inputStyle, width: 80, background: '#fff', textAlign: 'center', fontWeight: 700 }}
                  onFocus={e => { e.target.style.borderColor = '#2d7a3a' }}
                  onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
                <span style={{ fontSize: 12, color: '#666', alignSelf: 'center', flex: 1 }}>fournisseurs à trouver</span>
                <button onClick={findSuppliers} disabled={!name.trim() || searchingSuppliers} style={{
                  padding: '9px 14px', background: name.trim() && !searchingSuppliers ? '#e65100' : '#e0e0e0',
                  border: 'none', borderRadius: 8, color: name.trim() && !searchingSuppliers ? '#fff' : '#999',
                  fontSize: 12, fontWeight: 700, cursor: name.trim() && !searchingSuppliers ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap'
                }}>
                  {searchingSuppliers ? '⏳ Recherche...' : '🔍 Rechercher'}
                </button>
              </div>
              {suppliers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {suppliers.map((s, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', marginBottom: 2 }}>🏭 {s.name}</div>
                      {s.contact && <div style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>📞 {s.contact}</div>}
                      {s.notes && <div style={{ fontSize: 11, color: '#888' }}>{s.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p style={{ color: '#e53935', fontSize: 12, marginBottom: 10 }}>⚠ {error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ padding: '11px 18px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleSave} style={{ flex: 1, padding: '11px', background: '#2d7a3a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(45,122,58,0.3)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1e5c29' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2d7a3a' }}>
                {productId ? '✓ Enregistrer les modifications' : '✓ Enregistrer le produit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
