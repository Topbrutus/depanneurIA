import type { Address, CustomerProfile } from '@depaneuria/types'
import type { TranslationKey, TranslationParams } from './i18n'

export type ProfileValidationErrors = Partial<Record<'name' | 'phone' | 'deliveryNotes' | 'base', string>>
export type AddressValidationErrors = Partial<Record<'label' | 'line1' | 'city' | 'postalCode' | 'instructions' | 'base', string>>

type Translator = (key: TranslationKey, params?: TranslationParams) => string

export const SERVICE_AREA_PREFIXES = ['75', '92', '93', '94']

export const normalizePhone = (phone: string): string => phone.replace(/[^\d+]/g, '')

export const validateProfile = (
  profile: Pick<CustomerProfile, 'name' | 'phone' | 'deliveryNotes'>,
  t: Translator
): ProfileValidationErrors => {
  const errors: ProfileValidationErrors = {}
  const trimmedName = profile.name.trim()
  const cleanedPhone = normalizePhone(profile.phone)

  if (!trimmedName) {
    errors.name = t('validation.nameRequired')
  }

  if (!cleanedPhone || cleanedPhone.length < 10 || cleanedPhone.length > 15 || !/^[+]?\d+$/.test(cleanedPhone)) {
    errors.phone = t('validation.phoneInvalid')
  }

  return errors
}

export type AddressInput = Omit<Address, 'id'> & { id?: string }

export const validateAddress = (address: AddressInput, t: Translator): AddressValidationErrors => {
  const errors: AddressValidationErrors = {}

  if (!address.label.trim()) {
    errors.label = t('validation.addressLabelRequired')
  }
  if (!address.line1.trim()) {
    errors.line1 = t('validation.addressLineRequired')
  }
  if (!address.city.trim()) {
    errors.city = t('validation.cityRequired')
  }
  if (!address.postalCode.trim()) {
    errors.postalCode = t('validation.postalRequired')
  }

  if (!address.line1.trim() || !address.city.trim() || !address.postalCode.trim()) {
    errors.base = t('validation.addressIncomplete')
  }

  const sanitizedPostal = address.postalCode.replace(/\s+/g, '')
  if (sanitizedPostal && sanitizedPostal.length < 4) {
    errors.postalCode = t('validation.postalIncomplete')
  }
  if (sanitizedPostal && !SERVICE_AREA_PREFIXES.some((prefix) => sanitizedPostal.startsWith(prefix))) {
    errors.postalCode = t('validation.postalUnsupported')
  }

  return errors
}
