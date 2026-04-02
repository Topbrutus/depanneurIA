export type ThemeId = 'reel' | 'animation'

export interface Theme {
  id: ThemeId
  name: string
  description: string
  preview: string

  // Couleurs principales
  bgPrimary: string
  bgPanel: string
  bgCard: string
  borderColor: string
  textPrimary: string
  textMuted: string
  accent: string
  accentGlow: string
  btnPrimary: string
  btnText: string

  // Header
  headerBg: string
  headerText: string
  headerBorder: string

  // Catégories
  catActiveBg: string
  catActiveColor: string
  catActiveBorder: string

  // Carte produit
  cardBg: string
  cardBorder: string
  cardHoverShadow: string
  cardRadius: number
  priceFontSize: number

  // Panier
  cartBg: string
  cartBorder: string

  // Assistant
  aiBg: string
  aiBorder: string
  aiAccent: string

  // Police
  fontFamily: string
  fontMono: string
}

export const THEMES: Record<ThemeId, Theme> = {
  reel: {
    id: 'reel',
    name: 'Épicerie Réelle',
    description: 'Style propre et professionnel avec vraies photos',
    preview: '🟢',

    bgPrimary: '#f5f5f5',
    bgPanel: '#ffffff',
    bgCard: '#ffffff',
    borderColor: '#e0e0e0',
    textPrimary: '#1a1a1a',
    textMuted: '#666666',
    accent: '#2d7a3a',
    accentGlow: 'rgba(45,122,58,0.2)',
    btnPrimary: '#2d7a3a',
    btnText: '#ffffff',

    headerBg: '#2d7a3a',
    headerText: '#ffffff',
    headerBorder: '#1e5c29',

    catActiveBg: '#e8f5eb',
    catActiveColor: '#2d7a3a',
    catActiveBorder: '#2d7a3a',

    cardBg: '#ffffff',
    cardBorder: 'transparent',
    cardHoverShadow: '0 4px 16px rgba(0,0,0,0.12)',
    cardRadius: 12,
    priceFontSize: 15,

    cartBg: '#ffffff',
    cartBorder: '#e8e8e8',

    aiBg: '#fafafa',
    aiBorder: '#e8e8e8',
    aiAccent: '#2d7a3a',

    fontFamily: "'Inter', system-ui, sans-serif",
    fontMono: "'Inter', system-ui, sans-serif",
  },

  animation: {
    id: 'animation',
    name: 'Mode Jeu 3D',
    description: 'Style sombre futuriste avec illustrations',
    preview: '🎮',

    bgPrimary: '#05080f',
    bgPanel: '#08111e',
    bgCard: '#0f1e32',
    borderColor: '#1e3a5f',
    textPrimary: '#e2e8f0',
    textMuted: '#475569',
    accent: '#f0a500',
    accentGlow: 'rgba(240,165,0,0.3)',
    btnPrimary: '#f0a500',
    btnText: '#000000',

    headerBg: 'linear-gradient(90deg,#05080f,#0a1220)',
    headerText: '#f0a500',
    headerBorder: '#f0a50035',

    catActiveBg: '#f0a50015',
    catActiveColor: '#f0a500',
    catActiveBorder: '#f0a500',

    cardBg: 'linear-gradient(145deg,#0f1e32,#0a1525)',
    cardBorder: '#1e3a5f',
    cardHoverShadow: '0 10px 28px rgba(0,0,0,0.5)',
    cardRadius: 10,
    priceFontSize: 14,

    cartBg: '#07101a',
    cartBorder: '#1a3a28',

    aiBg: '#07101a',
    aiBorder: '#2a1a4a',
    aiAccent: '#a78bfa',

    fontFamily: "'Rajdhani', 'Trebuchet MS', sans-serif",
    fontMono: "'Share Tech Mono', 'Courier New', monospace",
  },
}

export const DEFAULT_THEME: ThemeId = 'reel'
