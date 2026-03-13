import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CustomerData, CustomerSession } from '@depaneuria/types'
import { FormError } from '../components/customer/form-error'
import { normalizePhone } from '../lib/validation'

type LoginPageProps = {
  customer: CustomerData | null
  session: CustomerSession | null
  onCustomerChange: (customer: CustomerData | null) => void
  onSessionChange: (session: CustomerSession | null) => void
  onLogin: (phone: string) => { ok: boolean; error?: string }
}

const LoginPage = ({ customer, onSessionChange, onLogin }: LoginPageProps) => {
  const navigate = useNavigate()
  const [phone, setPhone] = useState<string>(customer?.profile.phone ?? '')
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setInfo('')

    const cleaned = normalizePhone(phone)
    if (!cleaned || cleaned.length < 10) {
      setError('Téléphone invalide ou incomplet.')
      return
    }

    const result = onLogin(cleaned)
    if (!result.ok) {
      setError(result.error ?? 'Connexion impossible.')
      return
    }

    setInfo('Connexion réussie. Redirection vers la boutique…')
    navigate('/')
  }

  const handleResetSession = () => {
    onSessionChange(null)
    setInfo('Session réinitialisée. Vous pouvez vous reconnecter.')
    setError('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Connexion</p>
          <h1>Reprenez votre panier</h1>
          <p className="muted">
            Vérifiez simplement votre téléphone. Si le compte est complet (nom + adresse), vous êtes redirigé vers la boutique.
          </p>
        </div>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit} className="stack">
          <div className="field">
            <label htmlFor="login-phone">Téléphone</label>
            <input
              id="login-phone"
              name="login-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+33 6 00 00 00 00"
            />
          </div>

          <FormError message={error} />
          {info && <div className="inline-success">{info}</div>}

          <button className="btn btn-primary" type="submit">
            Se connecter et aller à la boutique
          </button>
        </form>

        <div className="card-footer">
          <button className="link" type="button" onClick={handleResetSession}>
            Réinitialiser l’accès local
          </button>
          <span className="muted">ou</span>
          <Link className="link" to="/signup">
            créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
