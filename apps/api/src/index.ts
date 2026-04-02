import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

// Charger le .env depuis la racine du monorepo (2 niveaux au-dessus)
const envPath = path.resolve(__dirname, '../../../.env')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const [k, ...v] = line.trim().split('=')
    if (k && !k.startsWith('#') && !process.env[k]) {
      process.env[k] = v.join('=')
    }
  }
}

import './database'
import productsRouter from './routes/products'
const app = express()
const PORT = process.env.PORT || 3001
const KEY = process.env.ANTHROPIC_API_KEY ?? ''
const URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + KEY
app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')))
app.post('/api/generate-product', async (req: any, res: any) => {
  const b = req.body.imageBase64
  if (!b) return res.status(400).json({ error: 'Image requise' })
  const mime = b.startsWith('iVBOR') ? 'image/png' : 'image/jpeg'
  const prompt = `Tu es un expert en gestion d'inventaire pour dépanneurs québécois. Analyse cette image et retourne UNIQUEMENT un JSON valide, aucun texte avant ou après.
Champs obligatoires, aucun vide:
- name: nom exact du produit en français (marque + format si visible)
- category: UNE SEULE valeur parmi exactement: Chips, Boissons, Chocolat, Populaires, Laitier, Boulangerie, Épicerie, Hygiène, Divers, Pharmacie, Confiseries, Collations
- description: 1 phrase descriptive utile pour un client, max 15 mots
- quantity: nombre seulement (ex: 200, 2, 355)
- unit: une valeur parmi: g, ml, L, kg, lb, oz, unité, pack
- marketPrice: prix typique en dollars canadiens (ex: 1.99, 3.49, 5.99), jamais 0
- emoji: 1 seul emoji representant le produit
Format: {"name":"","category":"","description":"","quantity":"","unit":"","marketPrice":"","emoji":""}`
  const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: mime, data: b } }, { text: prompt }] }] }) })
  const d = await r.json()
  const t = d.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  console.log('[G]', t.slice(0,150))
  const m = t.replace(/```json/g,'').replace(/```/g,'').match(/\{[\s\S]*\}/)
  if (!m) return res.status(500).json({ error: 'Reponse invalide' })
  res.json(JSON.parse(m[0]))
})
app.post('/api/chat', async (req: any, res: any) => {
  const { system, messages } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'Messages requis' })
  const contents = []
  if (system) contents.push({ role: 'user', parts: [{ text: `[SYSTÈME]: ${system}` }] }, { role: 'model', parts: [{ text: 'Compris.' }] })
  for (const m of messages) contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })
  const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 600 } }) })
  const d = await r.json()
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Désolé, erreur de connexion.'
  res.json({ text })
})
app.post('/api/find-suppliers', async (req: any, res: any) => {
  const { productName, description, count = 5 } = req.body
  if (!productName) return res.status(400).json({ error: 'Nom requis' })
  const prompt = `Tu es un expert en approvisionnement pour dépanneurs québécois. Trouve ${count} fournisseurs réels ou typiques pour ce produit: "${productName}"${description ? ` (${description})` : ''}. Réponds en JSON seulement: {"suppliers":[{"name":"Nom du fournisseur","contact":"site web ou téléphone ou email si connu, sinon vide","notes":"spécialité ou avantage en 1 phrase"}]}. Fournisseurs canadiens ou québécois en priorité.`
  const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) })
  const d = await r.json()
  const t = d.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const m = t.replace(/```json/g,'').replace(/```/g,'').match(/\{[\s\S]*\}/)
  if (!m) return res.status(500).json({ error: 'Réponse invalide' })
  res.json(JSON.parse(m[0]))
})
app.get('/api/lookup-barcode', async (req: any, res: any) => {
  const code = req.query.code as string
  if (!code) return res.json({})
  // 1. Essayer Open Food Facts (base mondiale gratuite)
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
    const d = await r.json()
    if (d.status === 1 && d.product) {
      const p = d.product
      const name = p.product_name_fr || p.product_name || p.abbreviated_product_name || ''
      if (name) {
        return res.json({
          name,
          description: p.generic_name_fr || p.generic_name || '',
          quantity: p.quantity || '',
          unit: '',
          category: p.categories_tags?.[0]?.replace('en:','') || 'Divers',
        })
      }
    }
  } catch { /* continuer */ }
  // 2. Fallback Gemini : tenter d'identifier par le code
  try {
    const prompt = `Code-barres produit: ${code}. Si tu connais ce produit vendu au Québec/Canada, réponds JSON: {"name":"","category":"","description":"","quantity":"","unit":"","marketPrice":""}. Sinon réponds {}.`
    const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) })
    const d = await r.json()
    const t = d.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const m = t.replace(/```json/g,'').replace(/```/g,'').match(/\{[\s\S]*\}/)
    if (m) return res.json(JSON.parse(m[0]))
  } catch { /* ok */ }
  res.json({})
})
app.post('/api/generate-description', async (req: any, res: any) => {
  const { name, barcode, category } = req.body
  if (!name && !barcode) return res.status(400).json({ error: 'Nom ou code-barres requis' })
  const prompt = `Génère une description courte (1 phrase, max 15 mots) en français pour ce produit de dépanneur québécois: "${name || barcode}"${category ? ` (catégorie: ${category})` : ''}. Réponds uniquement avec la description, rien d'autre.`
  const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) })
  const d = await r.json()
  const description = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  res.json({ description })
})
app.post('/api/generate-image', async (req: any, res: any) => {
  const { description } = req.body
  if (!description) return res.status(400).json({ error: 'Description requise' })
  const IMAGEN_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${KEY}`
  const prompt = `Photo studio professionnelle du produit : ${description}. Fond blanc pur. Produit centré. Étiquette et marque visibles. Aucune main, aucune personne.`
  const r = await fetch(IMAGEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
  })
  const d = await r.json()
  console.log('[IMG]', JSON.stringify(d).slice(0, 150))
  const imageData = d.predictions?.[0]?.bytesBase64Encoded
  if (!imageData) return res.status(500).json({ error: 'Génération échouée' })
  res.json({ imageData })
})
// ── OCR : photo de liste papier → lignes de texte ────────────
app.post('/api/ocr', async (req: any, res: any) => {
  const { imageBase64 } = req.body
  if (!imageBase64) return res.status(400).json({ error: 'Image requise' })
  const { execFile } = await import('child_process')
  const { writeFileSync, readFileSync, unlinkSync, existsSync } = await import('fs')
  const os = await import('os')
  const tmpImg  = path.join(os.tmpdir(), `ocr_in_${Date.now()}.png`)
  const tmpBase = path.join(os.tmpdir(), `ocr_out_${Date.now()}`)
  try {
    writeFileSync(tmpImg, Buffer.from(imageBase64, 'base64'))
    await new Promise<void>((resolve, reject) => {
      execFile('tesseract', [tmpImg, tmpBase, '-l', 'fra+eng', '--psm', '6'], (err) => {
        if (err) reject(err); else resolve()
      })
    })
    const txt = readFileSync(`${tmpBase}.txt`, 'utf8')
    const lines = txt.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 1 && !/^[^a-zA-Z0-9àâéèêëîïôùûüç]*$/.test(l))
    res.json({ lines })
  } catch (e: any) {
    res.status(500).json({ error: 'OCR échoué : ' + e.message })
  } finally {
    if (existsSync(tmpImg)) unlinkSync(tmpImg)
    if (existsSync(`${tmpBase}.txt`)) unlinkSync(`${tmpBase}.txt`)
  }
})

app.get('/health', (req: any, res: any) => res.json({ status: 'ok' }))
app.use('/api/products', productsRouter)
app.listen(PORT, () => console.log('[api] port ' + PORT))
