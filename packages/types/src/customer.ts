export interface CustomerProfile {
  id: string
  name: string
  phone: string
  deliveryNotes?: string
}

export interface Address {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
  postalCode: string
  country?: string
  instructions?: string
}

export interface CustomerData {
  profile: CustomerProfile
  addresses: Address[]
  defaultAddressId?: string
  createdAt: string
  updatedAt: string
}

export interface CustomerSession {
  loggedIn: boolean
  phone: string
  lastLoginAt: string
}
