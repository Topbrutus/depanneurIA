import type { Address, CustomerProfile } from '@depaneuria/types'

export type ProfileValidationErrors = Partial<Record<'name' | 'phone' | 'deliveryNotes' | 'base', string>>
export type AddressValidationErrors = Partial<Record<'label' | 'line1' | 'city' | 'postalCode' | 'instructions' | 'base', string>>

export const SERVICE_AREA_PREFIXES = ['75', '92', '93', '94']

export const normalizePhone = (phone: string): string => phone.replace(/[^\d+]/g, '')

export const validateProfile = (profile: Pick<CustomerProfile, 'name' | 'phone' | 'deliveryNotes'>): ProfileValidationErrors => {
  const errors: ProfileValidationErrors = {}
  const trimmedName = profile.name.trim()
  const cleanedPhone = normalizePhone(profile.phone)

  if (!trimmedName) {
    errors.name = 'Nom requis.'
  }

  if (!cleanedPhone || cleanedPhone.length < 10 || cleanedPhone.length > 15 || !/^[+]?\d+$/.test(cleanedPhone)) {
    errors.phone = 'Téléphone invalide : merci d’utiliser 10 à 15 chiffres.'
  }

  return errors
}

export type AddressInput = Omit<Address, 'id'> & { id?: string }

export const validateAddress = (address: AddressInput): AddressValidationErrors => {
  const errors: AddressValidationErrors = {}

  if (!address.label.trim()) {
    errors.label = 'Libellé requis (ex : Maison, Bureau).'
  }
  if (!address.line1.trim()) {
    errors.line1 = 'Rue ou numéro requis.'
  }
  if (!address.city.trim()) {
    errors.city = 'Ville requise.'
  }
  if (!address.postalCode.trim()) {
    errors.postalCode = 'Code postal requis.'
  }

  if (!address.line1.trim() || !address.city.trim() || !address.postalCode.trim()) {
    errors.base = 'Adresse incomplète : précisez rue, ville et code postal.'
  }

  const sanitizedPostal = address.postalCode.replace(/\s+/g, '')
  if (sanitizedPostal && sanitizedPostal.length < 4) {
    errors.postalCode = 'Code postal incomplet.'
  }
  if (sanitizedPostal && !SERVICE_AREA_PREFIXES.some((prefix) => sanitizedPostal.startsWith(prefix))) {
    errors.postalCode = 'Zone non desservie pour l’instant.'
  }

  return errors
}
