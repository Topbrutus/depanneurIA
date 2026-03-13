import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Address, CustomerData, CustomerSession } from '@depaneuria/types'
import { AddressForm, type AddressFormValues } from '../components/customer/address-form'
import { FormError } from '../components/customer/form-error'
import { validateAddress, type AddressInput, type AddressValidationErrors } from '../lib/validation'

type AddressesPageProps = {
  customer: CustomerData | null
  session: CustomerSession | null
  onCustomerChange: (customer: CustomerData | null) => void
  onSessionChange: (session: CustomerSession | null) => void
}

const emptyAddress: AddressFormValues = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  postalCode: '',
  country: 'France',
  instructions: '',
  makeDefault: false,
}

const AddressesPage = ({ customer, onCustomerChange }: AddressesPageProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [values, setValues] = useState<AddressFormValues>(emptyAddress)
  const [errors, setErrors] = useState<AddressValidationErrors>({})
  const [info, setInfo] = useState<string>('')

  const defaultAddress = useMemo(() => {
    if (!customer) return null
    const fallback = customer.addresses[0] ?? null
    if (!customer.defaultAddressId) return fallback
    return customer.addresses.find((address) => address.id === customer.defaultAddressId) ?? fallback
  }, [customer])

  if (!customer) {
    return (
      <div className="page">
        <div className="card">
          <h2>Aucune adresse</h2>
          <p className="muted">Commencez par créer un profil pour ajouter vos adresses.</p>
          <Link className="btn btn-primary" to="/signup">
            Créer un profil
          </Link>
        </div>
      </div>
    )
  }

  const resetForm = () => {
    setValues(emptyAddress)
    setEditingId(null)
    setErrors({})
  }

  const handleSubmit = (formValues: AddressFormValues) => {
    const validation = validateAddress(formValues as AddressInput)
    setErrors(validation)
    setInfo('')

    if (Object.keys(validation).length > 0) {
      return
    }

    const addressId = editingId ?? crypto.randomUUID()
    const prepared: Address = {
      id: addressId,
      label: formValues.label.trim(),
      line1: formValues.line1.trim(),
      line2: formValues.line2?.trim(),
      city: formValues.city.trim(),
      postalCode: formValues.postalCode.trim(),
      country: formValues.country?.trim() || 'France',
      instructions: formValues.instructions?.trim(),
    }

    const existingAddresses = customer.addresses ?? []
    const updatedAddresses = editingId
      ? existingAddresses.map((address) => (address.id === editingId ? prepared : address))
      : [...existingAddresses, prepared]

    const defaultAddressId =
      formValues.makeDefault || !customer.defaultAddressId ? prepared.id : customer.defaultAddressId ?? prepared.id

    const updatedCustomer: CustomerData = {
      ...customer,
      addresses: updatedAddresses,
      defaultAddressId,
      updatedAt: new Date().toISOString(),
    }

    onCustomerChange(updatedCustomer)
    setInfo(editingId ? 'Adresse mise à jour.' : 'Adresse ajoutée.')
    resetForm()
  }

  const handleSetDefault = (addressId: string) => {
    if (!customer.addresses.some((address) => address.id === addressId)) return
    const updatedCustomer: CustomerData = {
      ...customer,
      defaultAddressId: addressId,
      updatedAt: new Date().toISOString(),
    }
    onCustomerChange(updatedCustomer)
    setInfo('Adresse par défaut mise à jour.')
  }

  const handleEdit = (address: Address) => {
    setEditingId(address.id)
    setValues({
      label: address.label,
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      postalCode: address.postalCode,
      country: address.country ?? 'France',
      instructions: address.instructions ?? '',
      makeDefault: customer.defaultAddressId === address.id,
    })
    setErrors({})
  }

  const handleDelete = (addressId: string) => {
    const remaining = customer.addresses.filter((address) => address.id !== addressId)
    const updatedCustomer: CustomerData = {
      ...customer,
      addresses: remaining,
      defaultAddressId: remaining.length === 0 ? undefined : remaining[0].id,
      updatedAt: new Date().toISOString(),
    }
    onCustomerChange(updatedCustomer)
    setInfo('Adresse supprimée.')
    if (editingId === addressId) {
      resetForm()
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Adresses</p>
          <h1>Gérez vos adresses de livraison</h1>
          <p className="muted">Ajoutez-en plusieurs, choisissez une adresse par défaut et conservez vos consignes.</p>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3>{editingId ? 'Modifier une adresse' : 'Ajouter une adresse'}</h3>
            {editingId && (
              <button className="link" type="button" onClick={resetForm}>
                Annuler l’édition
              </button>
            )}
          </div>
          <AddressForm
            initialValues={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            errors={errors}
            submitLabel={editingId ? 'Mettre à jour' : 'Ajouter'}
          />
          <FormError message={errors.base} />
          {info && <div className="inline-success">{info}</div>}
        </div>

        <div className="card">
          <h3>Mes adresses</h3>
          {customer.addresses.length === 0 && <p className="muted">Aucune adresse encore enregistrée.</p>}
          <ul className="address-list">
            {customer.addresses.map((address) => (
              <li key={address.id} className={customer.defaultAddressId === address.id ? 'address-card default' : 'address-card'}>
                <div>
                  <p className="muted">{address.label}</p>
                  <p>
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                  </p>
                  <p className="muted">
                    {address.postalCode} {address.city} — {address.country ?? 'France'}
                  </p>
                  {address.instructions && <p className="note">Notes : {address.instructions}</p>}
                </div>
                <div className="actions">
                  <button className="btn btn-secondary" type="button" onClick={() => handleEdit(address)}>
                    Modifier
                  </button>
                  {customer.defaultAddressId !== address.id && (
                    <button className="btn btn-ghost" type="button" onClick={() => handleSetDefault(address.id)}>
                      Définir par défaut
                    </button>
                  )}
                  <button className="btn btn-ghost" type="button" onClick={() => handleDelete(address.id)}>
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {defaultAddress && (
            <div className="pill-stack">
              <span className="pill primary">Par défaut</span>
              <p className="muted">
                {defaultAddress.label} — {defaultAddress.line1}, {defaultAddress.postalCode} {defaultAddress.city}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddressesPage
