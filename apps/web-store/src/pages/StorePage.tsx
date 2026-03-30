import { useState, useRef, useCallback, useEffect } from 'react'
import AddProductModal from '../components/AddProductModal'
import type { Role, CartItem, Message } from '../types'
import { PRODUCTS, CATEGORIES, ROLES, AI_SUGGESTIONS } from '../data'

interface Props { role: Role; onLogout: () => void }

function ProductImage({ product }: { product: typeof PRODUCTS[0] }) {
  const [failed, setFailed] = useState(!product.image)
  if (failed || !product.image) {
    return <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', fontSize: 48, borderRadius: 6 }}>{product.emoji}</div>
  }
  return <img src={product.image} alt={product.name} onError={() => setFailed(true)} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', borderRadius: 6, background: '#f8f8f8', display: 'block' }} />
}

export default function StorePage({ role, onLogout }: Props) {
  const [cart, setCart]             = useState<CartItem[]>([])
  const [category, setCategory]     = useState('Produits')
  const [search, setSearch]         = useState('')
  const [draggedId, setDraggedId]   = useState<number | null>(null)
  const [dropActive, setDropActive] = useState(false)
  const [aiGlowing, setAiGlowing]   = useState<Set<number>>(new Set())
  const [messages, setMessages]     = useState<Message[]>([{ role: 'assistant', content: 'Bonjour ! Que puis-je faire pour vous ?' }])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [localProducts, setLocalProducts] = useState<typeof PRODUCTS>([...PRODUCTS])
  const chatEnd = useRef<HTMLDivElement>(null)

  const currentRole = ROLES.find(r => r.id === role)!
  const cartTotal   = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount   = cart.reduce((s, i) => s + i.qty, 0)
  const filtered    = localProducts.filter(p => (category === 'Produits' || p.category === category) && (!search || p.name.toLowerCase().includes(search.toLowerCase())))

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const addToCart = useCallback((p: typeof PRODUCTS[0], qty = 1) => {
    setCart(prev => { const ex = prev.find(i => i.id === p.id); if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i); return [...prev, { ...p, qty }] })
  }, [])
  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty = (id: number, d: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0))
  const clearCart = () => setCart([])

  const onDragStart = (e: React.DragEvent, id: number) => { setDraggedId(id); e.dataTransfer.effectAllowed = 'copy' }
  const onDragEnd   = () => setDraggedId(null)
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDropActive(true) }
  const onDragLeave = () => setDropActive(false)
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); if (draggedId) { const p = PRODUCTS.find(p => p.id === draggedId); if (p) addToCart(p) } setDraggedId(null); setDropActive(false) }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const text = input.trim(); setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    const system = `Tu es l'assistant IA d'un dépanneur québécois. Réponds en français, 2-3 phrases max, chaleureux.
PRODUITS: ${PRODUCTS.map(p => `ID:${p.id}|"${p.name}"|${p.category}|${p.price}$`).join(', ')}
PANIER: ${cart.length ? cart.map(i => `${i.name}x${i.qty}`).join(', ') : 'vide'}
Si l'utilisateur veut ajouter un produit: <cart_actions>{"add":[{"id":1,"qty":1}],"remove":[],"clear":false}</cart_actions>`
    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 600, system, messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: text }] }) })
      const data = await res.json()
      let raw    = data.content?.[0]?.text ?? 'Désolé, erreur de connexion.'
      let actions: Message['actions'] = []
      const match = raw.match(/<cart_actions>([\s\S]*?)<\/cart_actions>/)
      if (match) {
        raw = raw.replace(/<cart_actions>[\s\S]*?<\/cart_actions>/, '').trim()
        try {
          const parsed = JSON.parse(match[1])
          if (parsed.clear) clearCart()
          if (parsed.remove?.length) parsed.remove.forEach((r: { id: number }) => removeFromCart(r.id))
          if (parsed.add?.length) {
            setAiGlowing(new Set(parsed.add.map((a: { id: number }) => a.id)))
            await new Promise(r => setTimeout(r, 600))
            parsed.add.forEach((a: { id: number; qty?: number }) => { const p = PRODUCTS.find(p => p.id === a.id); if (p) addToCart(p, a.qty ?? 1) })
            setTimeout(() => setAiGlowing(new Set()), 800)
            actions = parsed.add
          }
        } catch { /* ok */ }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: raw, actions }])
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Connexion IA indisponible. Cliquez sur Ajouter !' }]) }
    setLoading(false)
  }

  const handleAddProduct = (data: Parameters<typeof AddProductModal>[0]['onSave'] extends (p: infer P) => void ? P : never) => {
    const newId = Math.max(...localProducts.map(p => p.id)) + 1
    const newProduct = { ...data, id: newId, image: data.imageData ? data.image ?? '' : '' }
    if (data.imageData) {
      // Sauvegarde dans localStorage pour persistance session
      localStorage.setItem(`product-img-${newId}`, data.imageData)
    }
    setLocalProducts(prev => [...prev, newProduct])
  }

  return (

    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <header style={{ background: '#2d7a3a', height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 10 }}>
        <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, padding: '0 4px' }}>☰</button>
        <span style={{ fontSize: 20 }}>🛍️</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Dépanneur</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>IA</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ position: 'relative', background: 'none', border: 'none', color: '#fff', fontSize: 20, padding: 4 }}>
            🛒
            {cartCount > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#e53935', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
          </button>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#fff' }}>{currentRole.icon} {currentRole.label}</div>
          {true && (
            <button onClick={() => setShowAddModal(true)} style={{ background: '#fff', border: 'none', borderRadius: 6, color: '#2d7a3a', fontWeight: 700, fontSize: 12, padding: '4px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              + Produit
            </button>
          )}
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, color: '#fff', fontSize: 11, padding: '3px 9px' }}>Déconnexion</button>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 24, padding: '8px 14px', maxWidth: 600 }}>
          <span style={{ color: '#999' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..."
            style={{ flex: 1, border: 'none', background: 'none', fontSize: 14, outline: 'none', color: '#333' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#999', fontSize: 16 }}>×</button>}
        </div>
      </div>

      <div style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid #e8e8e8', display: 'flex', gap: 4, overflowX: 'auto', flexShrink: 0 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '12px 16px', border: 'none', background: 'none', borderBottom: `3px solid ${category === cat ? '#2d7a3a' : 'transparent'}`, color: category === cat ? '#2d7a3a' : '#555', fontWeight: category === cat ? 600 : 400, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>{cat}</button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>Accueil <span style={{ margin: '0 4px' }}>›</span> <span style={{ color: '#2d7a3a', fontWeight: 600 }}>{category}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{category}</h2>
            <span style={{ fontSize: 12, color: '#999' }}>{filtered.length} produits</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {filtered.map(p => {
              const glow = aiGlowing.has(p.id); const dragged = draggedId === p.id
              const handleAddProduct = (data: Parameters<typeof AddProductModal>[0]['onSave'] extends (p: infer P) => void ? P : never) => {
    const newId = Math.max(...localProducts.map(p => p.id)) + 1
    const newProduct = { ...data, id: newId, image: data.imageData ? data.image ?? '' : '' }
    if (data.imageData) {
      // Sauvegarde dans localStorage pour persistance session
      localStorage.setItem(`product-img-${newId}`, data.imageData)
    }
    setLocalProducts(prev => [...prev, newProduct])
  }

  return (

                <div key={p.id} draggable onDragStart={e => onDragStart(e, p.id)} onDragEnd={onDragEnd}
                  style={{ background: '#fff', border: `2px solid ${glow ? '#2d7a3a' : 'transparent'}`, borderRadius: 12, padding: 12, boxShadow: glow ? '0 0 20px rgba(45,122,58,0.25), 0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)', cursor: 'grab', transition: 'all 0.2s', opacity: dragged ? 0.5 : 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>
                  <ProductImage product={{ ...p, image: p.image || localStorage.getItem(`product-img-${p.id}`) || '' }} />
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.4, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>{p.price.toFixed(2)} $</div>
                    <button onClick={() => addToCart(p)} style={{ width: '100%', padding: '8px', background: '#2d7a3a', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: '0 2px 6px rgba(45,122,58,0.3)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1e5c29' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2d7a3a' }}>Ajouter</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          style={{ width: 300, flexShrink: 0, borderLeft: '1px solid #e8e8e8', background: dropActive ? '#e8f5eb' : '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '-2px 0 8px rgba(0,0,0,0.04)', transition: 'background 0.2s' }}>

          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              🛒 Votre Panier {cartCount > 0 && <span style={{ background: '#2d7a3a', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 4 }}>{cartCount}</span>}
            </span>
            {dropActive && <span style={{ fontSize: 11, color: '#2d7a3a', fontWeight: 600 }}>↓ Déposez ici</span>}
          </div>

          <div style={{ flex: '0 0 auto', maxHeight: '42%', overflowY: 'auto', padding: '8px 12px' }}>
            {cart.length === 0
              ? <div style={{ textAlign: 'center', padding: '20px', color: '#ccc', fontSize: 13 }}>Glissez des produits ici<br />ou cliquez "Ajouter"</div>
              : cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', borderRadius: 4, fontSize: 22, flexShrink: 0 }}>{item.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: '#999' }}>x{item.qty}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{(item.price * item.qty).toFixed(2)} $</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #e0e0e0', background: '#f5f5f5', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>−</button>
                    <span style={{ fontSize: 12, minWidth: 16, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #e0e0e0', background: '#f5f5f5', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #fce4e4', background: '#fce4e4', color: '#e53935', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, marginLeft: 2 }}>×</button>
                  </div>
                </div>
              ))
            }
          </div>

          {cart.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Total :</span>
                <span style={{ fontWeight: 800, fontSize: 20 }}>{cartTotal.toFixed(2)} $</span>
              </div>
              <button style={{ width: '100%', padding: '12px', background: '#2d7a3a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 12px rgba(45,122,58,0.35)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1e5c29' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2d7a3a' }}>
                {currentRole.actionLabel}
              </button>
              <button onClick={clearCart} style={{ width: '100%', marginTop: 6, padding: '6px', background: 'none', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, color: '#999' }}>Vider le panier</button>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fafafa', borderTop: '1px solid #e8e8e8' }}>
            <div style={{ padding: '10px 14px', background: '#2d7a3a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a5d6a7', display: 'inline-block' }} />
              <span style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>Assistant</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%', padding: '8px 12px', background: msg.role === 'user' ? '#e8f5eb' : '#fff', color: '#1a1a1a', border: `1px solid ${msg.role === 'user' ? '#c8e6c9' : '#e8e8e8'}`, borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px', fontSize: 13, lineHeight: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    {msg.content}
                    {(msg.actions?.length ?? 0) > 0 && <div style={{ marginTop: 4, fontSize: 11, color: '#2d7a3a', fontWeight: 600 }}>✓ {msg.actions!.length} produit{msg.actions!.length > 1 ? 's' : ''} ajouté{msg.actions!.length > 1 ? 's' : ''}</div>}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px 12px 12px 3px', maxWidth: '50%' }}>
                  {[0,1,2].map(n => <div key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: '#2d7a3a', animation: `bounce 0.7s ease-in-out ${n*0.14}s infinite` }} />)}
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ padding: '6px 10px', display: 'flex', flexWrap: 'wrap', gap: 4, borderTop: '1px solid #efefef' }}>
              {AI_SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)} style={{ padding: '3px 8px', borderRadius: 12, border: '1px solid #e0e0e0', background: '#fff', color: '#555', fontSize: 11, cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2d7a3a'; (e.currentTarget as HTMLElement).style.color = '#2d7a3a' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e0e0e0'; (e.currentTarget as HTMLElement).style.color = '#555' }}>{s}</button>
              ))}
            </div>
            <div style={{ padding: '8px 10px 10px', display: 'flex', gap: 6 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Écrivez ou parlez..."
                style={{ flex: 1, padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 20, fontSize: 13, outline: 'none', background: '#fff' }}
                onFocus={e => { e.target.style.borderColor = '#2d7a3a' }} onBlur={e => { e.target.style.borderColor = '#e0e0e0' }} />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                style={{ width: 38, height: 38, borderRadius: '50%', background: loading || !input.trim() ? '#e0e0e0' : '#2d7a3a', border: 'none', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', boxShadow: loading || !input.trim() ? 'none' : '0 2px 8px rgba(45,122,58,0.35)' }}>→</button>
            </div>
          </div>
        </div>
      </div>
      {showAddModal && <AddProductModal onSave={handleAddProduct} onClose={() => setShowAddModal(false)} />}
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} } button:active { transform: scale(0.96) !important; }`}</style>
    </div>
  )
}
