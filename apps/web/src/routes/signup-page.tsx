import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Address, CustomerData, CustomerSession } from '@depaneuria/types'
import { AddressForm, type AddressFormValues } from '../components/customer/address-form'
import { CustomerForm, type CustomerFormValues } from '../components/customer/customer-form'
import { FormError } from '../components/customer/form-error'
import { startSession } from '../lib/customer-storage'
import { normalizePhone, validateAddress, validateProfile, type AddressInput, type AddressValidationErrors, type ProfileValidationErrors } from '../lib/validation'
import { useI18n } from '../lib/i18n-context'

type SignupPageProps = {
  customer: CustomerData | null
  session: CustomerSession | null
  onCustomerChange: (customer: CustomerData | null) => void
  onSessionChange: (session: CustomerSession | null) => void
}

const buildAddress = (values: AddressFormValues, id?: string): Address => ({
  id: id ?? crypto.randomUUID(),
  label: values.label.trim(),
  line1: values.line1.trim(),
  line2: values.line2?.trim(),
  city: values.city.trim(),
  postalCode: values.postalCode.trim(),
  country: values.country?.trim() || 'France',
  instructions: values.instructions?.trim(),
})

const SignupPage = ({ customer, onCustomerChange, onSessionChange }: SignupPageProps) => {
  const navigate = useNavigate()
  const { translations: t } = useI18n()
  const [profileValues, setProfileValues] = useState<CustomerFormValues>({
    name: customer?.profile.name ?? '',
    phone: customer?.profile.phone ?? '',
    deliveryNotes: customer?.profile.deliveryNotes ?? '',
  })
  const [addressValues, setAddressValues] = useState<AddressFormValues>({
    label: customer?.addresses[0]?.label ?? '',
    line1: customer?.addresses[0]?.line1 ?? '',
    line2: customer?.addresses[0]?.line2 ?? '',
    city: customer?.addresses[0]?.city ?? '',
    postalCode: customer?.addresses[0]?.postalCode ?? '',
    country: customer?.addresses[0]?.country ?? 'France',
    instructions: customer?.addresses[0]?.instructions ?? '',
    makeDefault: true,
  })

  const [profileErrors, setProfileErrors] = useState<ProfileValidationErrors>({})
  const [addressErrors, setAddressErrors] = useState<AddressValidationErrors>({})
  const [formError, setFormError] = useState<string>('')

  const handleProfileSubmit = (values: CustomerFormValues) => {
    setProfileValues(values)
  }

  const handleAddressSubmit = (values: AddressFormValues) => {
    setAddressValues(values)
  }

  const handleCreateProfile = () => {
    const profileValidation = validateProfile(profileValues)
    const addressValidation = validateAddress(addressValues as AddressInput)

    setProfileErrors(profileValidation)
    setAddressErrors(addressValidation)

    if (Object.keys(profileValidation).length > 0 || Object.keys(addressValidation).length > 0) {
      setFormError('Veuillez corriger les erreurs avant de continuer.')
      return
    }

    const address = buildAddress(addressValues)
    const now = new Date().toISOString()
    const newCustomer: CustomerData = {
      profile: {
        id: customer?.profile.id ?? crypto.randomUUID(),
        name: profileValues.name.trim(),
        phone: normalizePhone(profileValues.phone),
        deliveryNotes: profileValues.deliveryNotes?.trim(),
      },
      addresses: [address],
      defaultAddressId: address.id,
      createdAt: customer?.createdAt ?? now,
      updatedAt: now,
    }

    onCustomerChange(newCustomer)
    const session = startSession(newCustomer.profile.phone)
    onSessionChange(session)
    navigate('/addresses')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t.auth.signupTitle}</p>
          <h1>{t.auth.signupDescription}</h1>
          <p className="muted">
            Enregistrez un profil minimal avec nom, téléphone et une adresse complète. Toutes les données restent en local pour ce premier
            parcours V1.
          </p>
        </div>
      </div>

      <div className="stack">
        <CustomerForm
          initialValues={profileValues}
          submitLabel={t.common.save}
          onSubmit={handleProfileSubmit}
          errors={profileErrors}
          onChange={setProfileValues}
        />
        <AddressForm
          initialValues={addressValues}
          submitLabel={t.common.save}
          onSubmit={handleAddressSubmit}
          onChange={setAddressValues}
          errors={addressErrors}
          showDefaultToggle
        />
        <FormError message={formError} />
        <button className="btn btn-primary" type="button" onClick={handleCreateProfile}>
          {t.auth.signupButton}
        </button>
        <p className="muted small">
          Les validations vérifient le téléphone (10-15 chiffres), l'adresse complète et la zone desservie (75/92/93/94).
        </p>
      </div>
    </div>
  )
}

export default SignupPage
