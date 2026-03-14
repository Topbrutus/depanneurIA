import { useMemo, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { Address, CustomerData, CustomerSession } from '@depaneuria/types'

import { LanguageSwitcher } from './components/common/language-switcher'
import AddressesPage from './routes/addresses-page'
import { CartPage } from './routes/cart-page'
import { DriverPage } from './routes/driver-page'
import LoginPage from './routes/login-page'
import MockLoginPage from './routes/mock-login-page'
import NotFoundPage from './routes/not-found-page'
import { OrderFailurePage } from './routes/order-failure-page'
import { OrderSuccessPage } from './routes/order-success-page'
import { OrderTrackingPage } from './routes/order-tracking-page'
import ProfilePage from './routes/profile-page'
import { ShopPage } from './routes/shop-page'
import SignupPage from './routes/signup-page'
import StoreOpsPage from './routes/store-ops-page'
import AdminCatalogPage from './routes/admin-catalog-page'
import { clearCustomer, endSession, loadCustomer, loadSession, saveCustomer, startSession } from './lib/customer-storage'
import { I18nProvider, useI18n } from './lib/i18n-context'
import { normalizePhone } from './lib/validation'
import { TenantProvider } from './lib/tenant-context'
import { ProtectedRoute } from './components/common/protected-route'

const Navigation = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { pathname } = useLocation()
  const { t } = useI18n()
  const linkClass = (target: string) => (pathname === target ? 'nav-link active' : 'nav-link')

  return (
    <nav className="nav">
      <Link className={linkClass('/')} to="/">
        {t('nav.shop')}
      </Link>
      <Link className={linkClass('/signup')} to="/signup">
        {t('nav.signup')}
      </Link>
      <Link className={linkClass('/login')} to="/login">
        {t('nav.login')}
      </Link>
      <Link className={linkClass('/profile')} to="/profile">
        {t('nav.profile')}
      </Link>
      <Link className={linkClass('/addresses')} to="/addresses">
        {t('nav.addresses')}
      </Link>
      <Link className={linkClass('/mock-login')} to="/mock-login">
        {t('nav.mockLogin')}
      </Link>
      <Link className={linkClass('/admin/catalog')} to="/admin/catalog">
        {t('nav.adminCatalog')}
      </Link>
      <Link className={linkClass('/store-ops')} to="/store-ops">
        {t('nav.storeOps')}
      </Link>
      <Link className={linkClass('/driver')} to="/driver">
        {t('nav.driver')}
      </Link>
      {isLoggedIn && (
        <span className="status-pill" aria-label={t('nav.status.label')}>
          {t('nav.status.active')}
        </span>
      )}
    </nav>
  )
}

const HomePage = ({ customer, defaultAddress }: { customer: CustomerData | null; defaultAddress: Address | null }) => {
  const { t } = useI18n()
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1>{t('home.title')}</h1>
          <p className="muted">{t('home.description')}</p>
        </div>
      </div>

      <div className="grid">
        <div className="card hero">
          <h2>{t('home.summary.title')}</h2>
          {customer ? (
            <>
              <p>
                <strong>{customer.profile.name}</strong> — {customer.profile.phone}
              </p>
              {defaultAddress ? (
                <div className="pill-stack">
                  <span className="pill primary">{t('home.summary.defaultAddress')}</span>
                  <p className="muted">
                    {defaultAddress.label} • {defaultAddress.line1}
                    {defaultAddress.line2 ? `, ${defaultAddress.line2}` : ''}, {defaultAddress.postalCode} {defaultAddress.city}
                  </p>
                </div>
              ) : (
                <p className="muted">{t('home.summary.noAddress')}</p>
              )}
              {customer.profile.deliveryNotes && <p className="note">{t('home.summary.notes', { notes: customer.profile.deliveryNotes })}</p>}
            </>
          ) : (
            <p className="muted">{t('home.summary.noProfile')}</p>
          )}
          <div className="cta-row">
            <Link className="btn btn-primary" to="/signup">
              {t('home.cta.signup')}
            </Link>
            <Link className="btn btn-secondary" to="/addresses">
              {t('home.cta.addresses')}
            </Link>
          </div>
        </div>

        <div className="card">
          <h3>{t('home.steps.title')}</h3>
          <ul className="list">
            <li>{t('home.steps.item1')}</li>
            <li>{t('home.steps.item2')}</li>
            <li>{t('home.steps.item3')}</li>
            <li>{t('home.steps.item4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

const AppShell = () => {
  const { t } = useI18n()
  const [customer, setCustomer] = useState<CustomerData | null>(() => loadCustomer())
  const [session, setSession] = useState<CustomerSession | null>(() => loadSession())

  const defaultAddress = useMemo(() => {
    if (!customer) return null
    const fallback = customer.addresses[0] ?? null
    if (!customer.defaultAddressId) return fallback
    return customer.addresses.find((address) => address.id === customer.defaultAddressId) ?? fallback
  }, [customer])

  const handleCustomerChange = (next: CustomerData | null) => {
    if (next) {
      const normalized = saveCustomer(next)
      setCustomer(normalized)
      return
    }
    clearCustomer()
    setCustomer(null)
  }

  const handleSessionChange = (next: CustomerSession | null) => {
    if (next) {
      setSession(next)
      return
    }
    endSession()
    setSession(null)
  }

  const handleLoginWithPhone = (phone: string): { ok: boolean; error?: string } => {
    const snapshot = customer ?? loadCustomer()
    if (!snapshot || snapshot.addresses.length === 0) {
      return { ok: false, error: t('auth.login.incomplete') }
    }
    const storedPhone = normalizePhone(snapshot.profile.phone)
    const requested = normalizePhone(phone)
    if (storedPhone !== requested) {
      return { ok: false, error: t('auth.login.invalidPhone') }
    }
    const newSession = startSession(storedPhone)
    setSession(newSession)
    return { ok: true }
  }

  const handleLogout = () => {
    handleSessionChange(null)
  }

  return (
    <BrowserRouter>
      <TenantProvider>
        <div className="app-shell">
          <header className="topbar">
            <div className="brand">
              <span className="dot" aria-hidden />
              <span className="logo">{t('brand.client')}</span>
            </div>
            <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LanguageSwitcher />
              <Navigation isLoggedIn={Boolean(session?.loggedIn)} />
            </div>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<ShopPage />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/commande/succes" element={<OrderSuccessPage />} />
              <Route path="/commande/echec" element={<OrderFailurePage />} />
              <Route path="/commande/suivi" element={<OrderTrackingPage />} />
              <Route path="/mock-login" element={<MockLoginPage />} />
              <Route
                path="/store-ops"
                element={
                  <ProtectedRoute allowedRoles={['store_operator', 'admin']} redirectTo="/mock-login">
                    <StoreOpsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver"
                element={
                  <ProtectedRoute allowedRoles={['driver', 'admin']} redirectTo="/mock-login">
                    <DriverPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/catalog"
                element={
                  <ProtectedRoute allowedRoles={['admin']} redirectTo="/mock-login">
                    <AdminCatalogPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/home" element={<HomePage customer={customer} defaultAddress={defaultAddress} />} />
              <Route
                path="/signup"
                element={
                  <SignupPage
                    customer={customer}
                    session={session}
                    onCustomerChange={handleCustomerChange}
                    onSessionChange={handleSessionChange}
                  />
                }
              />
              <Route
                path="/login"
                element={
                  <LoginPage
                    customer={customer}
                    session={session}
                    onCustomerChange={handleCustomerChange}
                    onSessionChange={handleSessionChange}
                    onLogin={handleLoginWithPhone}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    customer={customer}
                    session={session}
                    onCustomerChange={handleCustomerChange}
                    onSessionChange={handleSessionChange}
                    onLogout={handleLogout}
                  />
                }
              />
              <Route
                path="/addresses"
                element={
                  <AddressesPage
                    customer={customer}
                    session={session}
                    onCustomerChange={handleCustomerChange}
                    onSessionChange={handleSessionChange}
                  />
                }
              />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
        </div>
      </TenantProvider>
    </BrowserRouter>
  )
}

const App = () => {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  )
}

export default App
