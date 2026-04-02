interface Props {
  onChoose: (mode: 'single' | 'list' | 'photo' | 'batch') => void
  onClose: () => void
}

export default function ModeChooserModal({ onChoose, onClose }: Props) {
  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 16,
  }
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400,
    boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden',
  }
  const btn: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px 20px', border: 'none', borderBottom: '1px solid #f0f0f0',
    background: '#fff', cursor: 'pointer', textAlign: 'left',
    transition: 'background 0.15s',
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={e => e.stopPropagation()}>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Ajouter des produits</h2>
            <p style={{ margin: 0, fontSize: 12, color: '#999' }}>Choisissez un mode</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e0e0e0', background: '#f5f5f5', fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>

        <button style={btn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0faf2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
          onClick={() => onChoose('single')}>
          <span style={{ fontSize: 32 }}>📦</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Entrer un produit</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Photo IA, code-barres ou saisie manuelle</div>
          </div>
        </button>

        <button style={btn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0faf2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
          onClick={() => onChoose('list')}>
          <span style={{ fontSize: 32 }}>📋</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Entrer une liste de produits</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Coller du texte ou importer un fichier</div>
          </div>
        </button>

        <button style={btn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0faf2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
          onClick={() => onChoose('photo')}>
          <span style={{ fontSize: 32 }}>📷</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Photo d'une liste papier</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>OCR — extrait automatiquement les noms</div>
          </div>
        </button>

        <button style={{ ...btn, borderBottom: 'none', background: '#fffbf0' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff8e1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fffbf0' }}
          onClick={() => onChoose('batch')}>
          <span style={{ fontSize: 32 }}>📥</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Lot de produits — scan continu</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Scanner plusieurs codes, descriptions après — sauvegardé en cas de coupure</div>
          </div>
        </button>

      </div>
    </div>
  )
}
