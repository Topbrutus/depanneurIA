import AddProductModal from '../components/AddProductModal'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { Role, CartItem, Message } from '../types'
import { PRODUCTS, CATEGORIES, ROLES, AI_SUGGESTIONS } from '../data'

interface Props {
  role: Role
  onLogout: () => void
}

export default function StorePage({ role, onLogout }: Props) {
  const [cart, setCart]           = useState<CartItem[]>([])
  const [category, setCategory]   = useState('Tous')
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropActive, setDropActive] = useState(false)
  const [aiGlowing, setAiGlowing] = useState<Set<number>>(new Set())
  const [messages, setMessages]   = useState<Message[]>([{
    role: 'assistant',
    content: "Bonjour ! 👋 Je suis dépanneurIA. Je peux trouver des produits, les ajouter au panier et répondre à vos questions. Qu'est-ce que je peux faire pour vous ?",
  }])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const chatEnd = useRef<HTMLDivElement>(null)

  const currentRole = ROLES.find(r => r.id === role)!
  const [localProducts, setLocalProducts] = useState([...PRODUCTS])
  const filtered    = localProducts.filter(p => category === 'Tous' || p.category === category)
  const cartTotal   = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount   = cart.reduce((s, i) => s + i.qty, 0)

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const addToCart = useCallback((product: typeof PRODUCTS[0], qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty }]
    })
  }, [])

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty = (id: number, delta: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0))
  const clearCart = () => setCart([])

  // Drag & Drop
  const onDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'copy'
  }
  const onDragEnd   = () => setDraggedId(null)
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDropActive(true) }
  const onDragLeave = () => setDropActive(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedId) {
      const p = localProducts.find(p => p.id === draggedId)
      if (p) addToCart(p)
    }
    setDraggedId(null)
    setDropActive(false)
  }

  // IA
  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    const inv = PRODUCTS.map(p =>
      `ID:${p.id} | "${p.name}" | ${p.category} | ${p.price}$ | stock:${p.stock}`
    ).join('\n')

    const cartCtx = cart.length
      ? cart.map(i => `${i.name} x${i.qty}`).join(', ')
      : 'vide'

    const roleDesc: Record<Role, string> = {
      client:   'un client qui fait ses courses',
      cashier:  'un caissier qui prépare les commandes',
      delivery: 'un livreur qui gère les livraisons',
      admin:    'un administrateur du système',
    }

    const system = `Tu es dépanneurIA, l'assistant IA d'un dépanneur québécois. Tu assistes ${roleDesc[role]}.

INVENTAIRE:
${inv}

PANIER ACTUEL: ${cartCtx}

Réponds en français québécois, de façon chaleureuse et concise (2-4 phrases max).
Si l'utilisateur veut ajouter des produits, inclus exactement ce bloc à la fin:
<cart_actions>{"add":[{"id":1,"qty":1}],"remove":[],"clear":false}</cart_actions>
N'inclus ce bloc QUE si une action panier est demandée.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text },
          ],
        }),
      })

      const data = await res.json()
      let raw = data.content?.[0]?.text ?? 'Désolé, une erreur est survenue.'
      let actions: Message['actions'] = []

      const match = raw.match(/<cart_actions>([\s\S]*?)<\/cart_actions>/)
      if (match) {
        raw = raw.replace(/<cart_actions>[\s\S]*?<\/cart_actions>/, '').trim()
        try {
          const parsed = JSON.parse(match[1])
          if (parsed.clear) clearCart()
          if (parsed.remove?.length) parsed.remove.forEach((r: { id: number }) => removeFromCart(r.id))
          if (parsed.add?.length) {
            const ids = new Set<number>(parsed.add.map((a: { id: number }) => a.id))
            setAiGlowing(ids)
            await new Promise(r => setTimeout(r, 700))
            parsed.add.forEach((a: { id: number; qty?: number }) => {
              const p = localProducts.find(p => p.id === a.id)
              if (p) addToCart(p, a.qty ?? 1)
            })
            setTimeout(() => setAiGlowing(new Set()), 400)
            actions = parsed.add
          }
        } catch { /* ignore parse error */ }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: raw, actions }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connexion IA indisponible. Glissez-déposez les produits directement dans le panier !',
      }])
    }
    setLoading(false)
  }

  const handleAddProduct = (data: any) => {
    const newId = Date.now()
    const newProduct = { id: newId, name: data.name, price: data.price, category: data.category, stock: data.stock, emoji: data.emoji, image: data.imageData || '' }
    if (data.imageData) localStorage.setItem('img-' + newId, data.imageData)
    setLocalProducts(prev => [...prev, newProduct])
  }

  return (

    <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-primary)', height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <header style={{
        height: 52,
        background: 'linear-gradient(90deg,#060b12,#0d1a2d)',
        borderBottom: '1px solid #f0a50035',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 10, flexShrink: 0,
        boxShadow: '0 1px 20px #f0a50015',
      }}>
        <span style={{ fontSize: 20 }}>🏪</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#f0a500', letterSpacing: '0.08em' }}>
          DÉPANNEUR<span style={{ color: '#c084fc' }}>IA</span>
        </span>
        <span style={{ fontSize: 10, color: '#2d3f55', borderLeft: '1px solid #1e2a38', paddingLeft: 10 }}>
          web-store
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            padding: '4px 12px',
            borderRadius: 6,
            border: `1px solid ${currentRole.color}`,
            background: currentRole.color + '15',
            color: currentRole.color,
            fontSize: 11,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span>{currentRole.icon}</span>
            <span>{currentRole.label}</span>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{background:"#fff",border:"none",borderRadius:6,color:"#2d7a3a",fontWeight:700,fontSize:12,padding:"4px 12px",marginRight:8}}>+ Produit</button><button onClick={onLogout} style={{
            padding: '4px 10px', borderRadius: 6,
            border: '1px solid #1e2a38', background: 'transparent',
            color: '#475569', fontSize: 11,
            transition: 'all 0.15s',
          }}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* ── 3 PANNEAUX ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px 320px', overflow: 'hidden' }}>

        {/* ═══ INVENTAIRE ═══ */}
        <div style={{ borderRight: '1px solid #1e2a38', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #1e2a38', background: '#0a0f18', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f0a500' }}>
            📦 Inventaire — {filtered.length} articles
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #1e2a38', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '2px 8px', borderRadius: 10,
                border: `1px solid ${category === cat ? '#f0a500' : '#1e2a38'}`,
                background: category === cat ? '#f0a50015' : 'transparent',
                color: category === cat ? '#f0a500' : '#475569',
                fontSize: 10, cursor: 'pointer', transition: 'all 0.15s',
              }}>{cat}</button>
            ))}
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', padding: 10,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 7, alignContent: 'start',
          }}>
            {filtered.map(p => {
              const glow    = aiGlowing.has(p.id)
              const dragged = draggedId === p.id
              const handleAddProduct = (data: any) => {
    const newId = Date.now()
    const newProduct = { id: newId, name: data.name, price: data.price, category: data.category, stock: data.stock, emoji: data.emoji, image: data.imageData || '' }
    if (data.imageData) localStorage.setItem('img-' + newId, data.imageData)
    setLocalProducts(prev => [...prev, newProduct])
  }

  return (

                <div
                  key={p.id}
                  draggable
                  onDragStart={e => onDragStart(e, p.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => addToCart(p)}
                  title="Cliquez ou glissez vers le panier"
                  style={{
                    background: glow ? '#f0a50015' : '#0d1a2d',
                    border: `1px solid ${glow ? '#f0a500' : dragged ? '#475569' : '#1e2a38'}`,
                    borderRadius: 8, padding: '10px 8px',
                    cursor: 'grab', userSelect: 'none',
                    transition: 'all 0.2s',
                    transform: dragged ? 'scale(0.93) rotate(1.5deg)' : 'scale(1)',
                    opacity: dragged ? 0.55 : 1,
                    boxShadow: glow ? '0 0 16px #f0a50044' : 'none',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{p.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{p.category}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f0a500', marginTop: 5 }}>{p.price.toFixed(2)}$</div>
                  <div style={{ fontSize: 9, color: '#2d3f55', marginTop: 1 }}>stock {p.stock}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ PANIER ═══ */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            borderRight: '1px solid #1e2a38',
            display: 'flex', flexDirection: 'column',
            background: dropActive ? '#071a0f' : '#07101a',
            transition: 'background 0.2s',
          }}
        >
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #1e2a38', background: '#0a0f18', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6 }}>
            🛒 Panier
            {cartCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#4ade8018', border: '1px solid #4ade8033', borderRadius: 8, padding: '1px 6px', fontSize: 10, color: '#4ade80' }}>
                {cartCount} art.
              </span>
            )}
          </div>

          {dropActive && (
            <div style={{ background: '#4ade8010', borderBottom: '1px dashed #4ade8044', padding: '6px', fontSize: 10, color: '#4ade80', textAlign: 'center' }}>
              ↓ Déposez ici
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', gap: 8, color: '#2d3f55' }}>
                <div style={{ fontSize: 36 }}>🛒</div>
                <div style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.7 }}>
                  Glissez des produits<br />ou cliquez dessus
                </div>
              </div>
            ) : cart.map(item => (
              <div key={item.id} style={{
                background: '#0d1a2d', border: '1px solid #1e2a38',
                borderRadius: 7, padding: '7px 8px', marginBottom: 5,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 16 }}>{item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 9, color: '#f0a500', marginTop: 1 }}>
                    {item.price.toFixed(2)}$ × {item.qty} = <strong>{(item.price * item.qty).toFixed(2)}$</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {(['−', '+'] as const).map((sym, i) => (
                    <button key={sym} onClick={() => updateQty(item.id, i === 0 ? -1 : 1)} style={{
                      width: 20, height: 20, borderRadius: 3,
                      border: '1px solid #2d3748', background: '#0d1117',
                      color: '#94a3b8', fontSize: 12, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}>{sym}</button>
                  ))}
                  <button onClick={() => removeFromCart(item.id)} style={{
                    width: 20, height: 20, borderRadius: 3,
                    border: '1px solid #f8717133', background: '#0d1117',
                    color: '#f87171', fontSize: 12, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: 0, marginLeft: 2,
                  }}>×</button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div style={{ borderTop: '1px solid #1e2a38', padding: '12px 12px', background: '#0a0f18' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: '#f0a500' }}>{cartTotal.toFixed(2)} $</span>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={clearCart} style={{
                  padding: '8px 10px', background: 'transparent',
                  border: '1px solid #1e2a38', borderRadius: 6,
                  color: '#475569', fontSize: 10,
                }}>Vider</button>
                <button style={{
                  flex: 1, padding: '8px',
                  background: `linear-gradient(135deg, ${currentRole.color}, ${currentRole.color}bb)`,
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontSize: 11, fontWeight: 700,
                  color: role === 'admin' ? '#e2e8f0' : '#000',
                  letterSpacing: '0.03em',
                }}>
                  {currentRole.actionLabel}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ ASSISTANT IA ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#07101a' }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #1e2a38', background: '#0a0f18', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 5px #4ade80', display: 'inline-block', flexShrink: 0 }} />
            🤖 Assistant IA
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '90%',
                  background: msg.role === 'user' ? '#112240' : '#0d1a2d',
                  border: `1px solid ${msg.role === 'user' ? '#1e3a6e' : '#1e2a38'}`,
                  borderRadius: msg.role === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                  padding: '8px 11px', fontSize: 11, lineHeight: 1.65, color: '#cbd5e1',
                }}>
                  {msg.content}
                  {(msg.actions?.length ?? 0) > 0 && (
                    <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid #1e2a38', fontSize: 9, color: '#4ade80' }}>
                      ✓ {msg.actions!.length} article{msg.actions!.length > 1 ? 's' : ''} ajouté{msg.actions!.length > 1 ? 's' : ''} au panier
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 4, padding: '8px 11px', background: '#0d1a2d', border: '1px solid #1e2a38', borderRadius: '10px 10px 10px 3px', maxWidth: '50%' }}>
                {[0, 1, 2].map(n => (
                  <div key={n} style={{
                    width: 5, height: 5, borderRadius: '50%', background: '#c084fc',
                    animation: `bounce 0.7s ease-in-out ${n * 0.14}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          <div style={{ padding: '6px 12px 4px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {AI_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setInput(s)} style={{
                padding: '2px 7px', borderRadius: 8,
                border: '1px solid #1e2a38', background: 'transparent',
                color: '#475569', fontSize: 9, cursor: 'pointer', transition: 'all 0.15s',
              }}>{s}</button>
            ))}
          </div>

          <div style={{ padding: '6px 12px 12px', display: 'flex', gap: 6 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Posez votre question..."
              style={{
                flex: 1, background: '#0d1a2d',
                border: '1px solid #1e2a38', borderRadius: 7,
                padding: '8px 11px', color: '#e2e8f0', fontSize: 11, outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#c084fc55' }}
              onBlur={e => { e.target.style.borderColor = '#1e2a38' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 14px',
                background: loading || !input.trim() ? '#1e2a38' : 'linear-gradient(135deg,#c084fc,#9333ea)',
                border: 'none', borderRadius: 7,
                color: loading || !input.trim() ? '#475569' : '#fff',
                fontSize: 14, transition: 'all 0.2s',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >→</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        button:active { transform: scale(0.95); }
      `}</style>
    {showAddModal && <AddProductModal onSave={handleAddProduct} onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
