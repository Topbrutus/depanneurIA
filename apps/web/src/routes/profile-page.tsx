import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CustomerData, CustomerSession } from '@depaneuria/types'
import { CustomerForm, type CustomerFormValues } from '../components/customer/customer-form'
import { startSession } from '../lib/customer-storage'
import { normalizePhone, validateProfile, type ProfileValidationErrors } from '../lib/validation'

type ProfilePageProps = {
  customer: CustomerData | null
  session: CustomerSession | null
  onCustomerChange: (customer: CustomerData | null) => void
  onSessionChange: (session: CustomerSession | null) => void
  onLogout: () => void
}

const ProfilePage = ({ customer, session, onCustomerChange, onSessionChange, onLogout }: ProfilePageProps) => {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<ProfileValidationErrors>({})
  const [info, setInfo] = useState<string>('')

  if (!customer) {
    return (
      <div className="page">
        <div className="card">
          <h2>Aucun profil trouvé</h2>
          <p className="muted">Créez un profil avant de modifier vos informations.</p>
          <Link className="btn btn-primary" to="/signup">
            Créer mon profil
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = (values: CustomerFormValues) => {
    setInfo('')
    const validation = validateProfile(values)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      return
    }

    const updated: CustomerData = {
      ...customer,
      profile: {
        ...customer.profile,
        name: values.name.trim(),
        phone: normalizePhone(values.phone),
        deliveryNotes: values.deliveryNotes?.trim(),
      },
      updatedAt: new Date().toISOString(),
    }

    onCustomerChange(updated)
    if (session?.loggedIn) {
      onSessionChange(startSession(updated.profile.phone))
    }
    setInfo('Profil mis à jour.')
  }

  const handleDeleteAccount = () => {
    onCustomerChange(null)
    onSessionChange(null)
    onLogout()
    navigate('/signup')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Profil</p>
          <h1>Vos informations client</h1>
          <p className="muted">Mettez à jour votre nom, téléphone et notes de livraison. Les changements restent en local.</p>
        </div>
      </div>

      <div className="stack">
        <CustomerForm
          initialValues={{
            name: customer.profile.name,
            phone: customer.profile.phone,
            deliveryNotes: customer.profile.deliveryNotes ?? '',
          }}
          submitLabel="Mettre à jour"
          onSubmit={handleSubmit}
          errors={errors}
        />

        {info && <div className="inline-success">{info}</div>}

        <div className="card danger-card">
          <div>
            <h3>Supprimer le compte</h3>
            <p className="muted">Réinitialise le profil, les adresses et la session locales.</p>
          </div>
          <button className="btn btn-danger" type="button" onClick={handleDeleteAccount}>
            Supprimer et repartir de zéro
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
