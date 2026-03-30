import { useRef, useState } from 'react'
interface Props {
  onImageReady: (dataUrl: string, fileName: string) => void
  currentImage?: string
  productName?: string
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
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, SIZE, SIZE)
        const ratio = img.width / img.height
        let sw, sh, sx, sy
        if (ratio > 1) { sh = img.height; sw = img.height; sx = Math.floor((img.width - sw) / 2); sy = 0 }
        else { sw = img.width; sh = img.width; sx = 0; sy = Math.floor((img.height - sh) / 2) }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE)
        const baseName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/\s+/g, '-')
        const fileName = `${baseName}.jpg`
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
        resolve({ dataUrl, fileName })
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
export default function ImageUploader({ onImageReady, currentImage, productName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>(currentImage ?? '')
  const [processing, setProcessing] = useState(false)
  const [info, setInfo] = useState<string>('')
  const [dragging, setDragging] = useState(false)
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setInfo('Seulement les images sont acceptées'); return }
    setProcessing(true); setInfo('')
    try {
      const originalSize = (file.size / 1024).toFixed(0)
      const { dataUrl, fileName } = await processImage(file)
      const base64 = dataUrl.split(',')[1]
      const newSize = Math.floor((base64.length * 3) / 4 / 1024)
      const wasConverted = !file.name.toLowerCase().match(/\.jpe?g$/)
      setPreview(dataUrl)
      setInfo(`✓ ${wasConverted ? 'PNG → JPG · ' : ''}500×500px · ${originalSize}ko → ${newSize}ko`)
      onImageReady(dataUrl, fileName)
    } catch { setInfo("Erreur lors du traitement") }
    setProcessing(false)
  }
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ''
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]; if (file) handleFile(file)
  }
  return (
    <div>
      <div onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)} onDrop={onDrop}
        style={{ border: `2px dashed ${dragging ? '#2d7a3a' : preview ? '#c8e6c9' : '#e0e0e0'}`, borderRadius: 12, padding: preview ? 8 : 24, textAlign: 'center', cursor: 'pointer', background: dragging ? '#f1faf3' : '#fafafa', transition: 'all 0.2s' }}>
        {processing ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚙️</div>
            <p style={{ color: '#2d7a3a', fontSize: 13, fontWeight: 600 }}>Conversion en cours...</p>
            <p style={{ color: '#999', fontSize: 11 }}>Recadrage 500×500 · PNG→JPG</p>
          </div>
        ) : preview ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={preview} alt="Aperçu" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e0e0e0', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 3 }}>{productName ?? 'Photo du produit'}</p>
              {info && <p style={{ fontSize: 11, color: '#2d7a3a' }}>{info}</p>}
              <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Cliquez pour changer</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 4 }}>Cliquez ou glissez une photo</p>
            <p style={{ fontSize: 12, color: '#999' }}>JPG, PNG, WebP — PNG converti en JPG automatiquement</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onInputChange} style={{ display: 'none' }} />
    </div>
  )
}
