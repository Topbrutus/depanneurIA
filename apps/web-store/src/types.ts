export type Role = 'client' | 'cashier' | 'delivery' | 'admin'

export interface Product {
  id: number
  name: string
  category: string
  price: number
  emoji: string
  stock: number
  image?: string
}

export interface CartItem extends Product {
  qty: number
}

export interface RoleConfig {
  id: Role
  label: string
  icon: string
  color: string
  description: string
  actionLabel: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  actions?: Array<{ id: number; qty: number }>
}
