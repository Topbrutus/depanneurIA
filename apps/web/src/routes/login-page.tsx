import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CustomerData, CustomerSession } from '@depaneuria/types'
import { FormError } from '../components/customer/form-error'
import { useI18n } from '../lib/i18n-context'
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
  const { t } = useI18n()
  const [phone, setPhone] = useState<string>(customer?.profile.phone ?? '')
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setInfo('')

    const cleaned = normalizePhone(phone)
    if (!cleaned || cleaned.length < 10) {
      setError(t('login.phoneError'))
      return
    }

    const result = onLogin(cleaned)
    if (!result.ok) {
      setError(result.error ?? t('login.errorFallback'))
      return
    }

    setInfo(t('login.success'))
    navigate('/')
  }

  const handleResetSession = () => {
    onSessionChange(null)
    setInfo(t('login.resetInfo'))
    setError('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('login.eyebrow')}</p>
          <h1>{t('login.title')}</h1>
          <p className="muted">{t('login.description')}</p>
        </div>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit} className="stack">
          <div className="field">
            <label htmlFor="login-phone">{t('form.phone.label')}</label>
            <input
              id="login-phone"
              name="login-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t('form.phone.placeholder')}
            />
          </div>

          <FormError message={error} />
          {info && <div className="inline-success">{info}</div>}

          <button className="btn btn-primary" type="submit">
            {t('login.submit')}
          </button>
        </form>

        <div className="card-footer">
          <button className="link" type="button" onClick={handleResetSession}>
            {t('login.reset')}
          </button>
          <span className="muted">{t('login.or')}</span>
          <Link className="link" to="/signup">
            {t('login.create')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
