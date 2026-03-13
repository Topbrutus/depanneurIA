import type { Address, CustomerData, CustomerProfile, CustomerSession } from '@depaneuria/types'
import { normalizePhone } from './validation'

const CUSTOMER_STORAGE_KEY = 'depaneuria:customer'
const SESSION_STORAGE_KEY = 'depaneuria:customer-session'

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const readFromStorage = <T>(key: string): T | null => {
  if (!isBrowser) return null
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('[customer-storage] Unable to parse value', error)
    return null
  }
}

const writeToStorage = (key: string, value: unknown) => {
  if (!isBrowser) return
  localStorage.setItem(key, JSON.stringify(value))
}

const now = () => new Date().toISOString()

const ensureDefaultAddressId = (addresses: Address[], requested?: string): string | undefined => {
  if (addresses.length === 0) return undefined
  if (requested && addresses.some((item) => item.id === requested)) {
    return requested
  }
  return addresses[0]?.id
}

const normalizeCustomer = (customer: CustomerData): CustomerData => {
  const defaultAddressId = ensureDefaultAddressId(customer.addresses, customer.defaultAddressId)

  return {
    ...customer,
    defaultAddressId,
    createdAt: customer.createdAt || now(),
    updatedAt: now(),
  }
}

export const loadCustomer = (): CustomerData | null => {
  const stored = readFromStorage<CustomerData>(CUSTOMER_STORAGE_KEY)
  if (!stored) return null
  return normalizeCustomer(stored)
}

export const saveCustomer = (customer: CustomerData): CustomerData => {
  const normalized = normalizeCustomer(customer)
  writeToStorage(CUSTOMER_STORAGE_KEY, normalized)
  return normalized
}

export const clearCustomer = () => {
  if (!isBrowser) return
  localStorage.removeItem(CUSTOMER_STORAGE_KEY)
}

export const loadSession = (): CustomerSession | null => readFromStorage<CustomerSession>(SESSION_STORAGE_KEY)

export const startSession = (phone: string): CustomerSession => {
  const session: CustomerSession = {
    loggedIn: true,
    phone: normalizePhone(phone),
    lastLoginAt: now(),
  }
  writeToStorage(SESSION_STORAGE_KEY, session)
  return session
}

export const endSession = () => {
  if (!isBrowser) return
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export const updateProfile = (profile: CustomerProfile): CustomerData | null => {
  const existing = loadCustomer()
  if (!existing) return null
  const updated = saveCustomer({
    ...existing,
    profile: { ...profile, phone: normalizePhone(profile.phone) },
  })
  return updated
}

export const upsertAddress = (address: Address, makeDefault = false): CustomerData | null => {
  const existing = loadCustomer()
  if (!existing) return null

  const updatedAddresses = existing.addresses.some((item) => item.id === address.id)
    ? existing.addresses.map((item) => (item.id === address.id ? address : item))
    : [...existing.addresses, address]

  const updated = saveCustomer({
    ...existing,
    addresses: updatedAddresses,
    defaultAddressId: ensureDefaultAddressId(updatedAddresses, makeDefault ? address.id : existing.defaultAddressId),
  })
  return updated
}

export const removeAddress = (addressId: string): CustomerData | null => {
  const existing = loadCustomer()
  if (!existing) return null

  const remaining = existing.addresses.filter((item) => item.id !== addressId)
  const updated = saveCustomer({
    ...existing,
    addresses: remaining,
    defaultAddressId: ensureDefaultAddressId(remaining, existing.defaultAddressId === addressId ? undefined : existing.defaultAddressId),
  })

  return updated
}

export const markDefaultAddress = (addressId: string): CustomerData | null => {
  const existing = loadCustomer()
  if (!existing) return null
  if (!existing.addresses.some((item) => item.id === addressId)) return existing

  const updated = saveCustomer({
    ...existing,
    defaultAddressId: addressId,
  })
  return updated
}
