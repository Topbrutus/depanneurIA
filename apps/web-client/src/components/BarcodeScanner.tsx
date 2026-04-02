import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
      if (result) {
        setScanning(false)
        onScan(result.getText())
        reader.reset()
      }
    })

    return () => {
      reader.reset()
    }
  }, [onScan])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>📷 Scanner le code barres</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <video ref={videoRef} style={{ width: '100%', display: 'block' }} />

          {/* Ligne de scan animée */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '80%', height: 2,
              background: 'rgba(45,122,58,0.8)',
              boxShadow: '0 0 8px #2d7a3a',
              animation: 'scan 2s ease-in-out infinite',
            }} />
            {/* Cadre de visée */}
            <div style={{
              position: 'absolute',
              width: '70%', height: '50%',
              border: '2px solid rgba(255,255,255,0.6)',
              borderRadius: 8,
            }} />
          </div>
        </div>

        {error && <p style={{ color: '#f87171', marginTop: 10, fontSize: 13, textAlign: 'center' }}>{error}</p>}

        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: 12, textAlign: 'center' }}>
          {scanning ? 'Pointez la caméra vers le code barres...' : '✓ Code détecté !'}
        </p>

        {/* Saisie manuelle */}
        <div style={{ marginTop: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginBottom: 8 }}>ou entrez manuellement</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Code barres..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none' }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (val) onScan(val)
                }
              }}
            />
            <button
              style={{ padding: '8px 14px', background: '#2d7a3a', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}
              onClick={(e) => {
                const input = (e.currentTarget.previousSibling as HTMLInputElement)
                if (input?.value.trim()) onScan(input.value.trim())
              }}
            >OK</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-60px); opacity: 0.5; }
          50% { transform: translateY(60px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
