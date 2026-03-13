import { useMemo, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { Address, CustomerData, CustomerSession } from '@depaneuria/types'

import AddressesPage from './routes/addresses-page'
import { CartPage } from './routes/cart-page'
import { DriverPage } from './routes/driver-page'
import LoginPage from './routes/login-page'
import NotFoundPage from './routes/not-found-page'
import { OrderFailurePage } from './routes/order-failure-page'
import { OrderSuccessPage } from './routes/order-success-page'
import { OrderTrackingPage } from './routes/order-tracking-page'
import ProfilePage from './routes/profile-page'
import { ShopPage } from './routes/shop-page'
import SignupPage from './routes/signup-page'
import StoreOpsPage from './routes/store-ops-page'
import { clearCustomer, endSession, loadCustomer, loadSession, saveCustomer, startSession } from './lib/customer-storage'
import { normalizePhone } from './lib/validation'

const Navigation = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { pathname } = useLocation()
  const linkClass = (target: string) => (pathname === target ? 'nav-link active' : 'nav-link')

  return (
    <nav className="nav">
      <Link className={linkClass('/')} to="/">
        Boutique
      </Link>
      <Link className={linkClass('/signup')} to="/signup">
        Inscription
      </Link>
      <Link className={linkClass('/login')} to="/login">
        Connexion
      </Link>
      <Link className={linkClass('/profile')} to="/profile">
        Profil
      </Link>
      <Link className={linkClass('/addresses')} to="/addresses">
        Adresses
      </Link>
      {isLoggedIn && (
        <span className="status-pill" aria-label="Session active">
          Connecté
        </span>
      )}
    </nav>
  )
}

const HomePage = ({ customer, defaultAddress }: { customer: CustomerData | null; defaultAddress: Address | null }) => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Résumé compte</p>
          <h1>Commandez plus vite, votre profil est prêt</h1>
          <p className="muted">
            Ce mini parcours client V1 garde votre profil, vos adresses et vos notes de livraison en local. À la connexion, vous revenez
            directement à la boutique.
          </p>
        </div>
      </div>

      <div className="grid">
        <div className="card hero">
          <h2>Résumé</h2>
          {customer ? (
            <>
              <p>
                <strong>{customer.profile.name}</strong> — {customer.profile.phone}
              </p>
              {defaultAddress ? (
                <div className="pill-stack">
                  <span className="pill primary">Adresse par défaut</span>
                  <p className="muted">
                    {defaultAddress.label} • {defaultAddress.line1}
                    {defaultAddress.line2 ? `, ${defaultAddress.line2}` : ''}, {defaultAddress.postalCode} {defaultAddress.city}
                  </p>
                </div>
              ) : (
                <p className="muted">Ajoutez au moins une adresse pour démarrer.</p>
              )}
              {customer.profile.deliveryNotes && <p className="note">Notes : {customer.profile.deliveryNotes}</p>}
            </>
          ) : (
            <p className="muted">Créez un profil pour réutiliser vos infos dès l&apos;ouverture du site.</p>
          )}
          <div className="cta-row">
            <Link className="btn btn-primary" to="/signup">
              Démarrer l’inscription
            </Link>
            <Link className="btn btn-secondary" to="/addresses">
              Gérer mes adresses
            </Link>
          </div>
        </div>

        <div className="card">
          <h3>Étapes clés</h3>
          <ul className="list">
            <li>Inscrivez-vous avec nom et téléphone (validation stricte).</li>
            <li>Ajoutez une adresse complète et choisissez la par défaut.</li>
            <li>Connectez-vous : redirection automatique vers la boutique.</li>
            <li>Revenez plus tard : profil et adresses sont réutilisés.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

const AppShell = () => {
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
      return { ok: false, error: 'Compte incomplet : inscrivez-vous et ajoutez une adresse avant connexion.' }
    }
    const storedPhone = normalizePhone(snapshot.profile.phone)
    const requested = normalizePhone(phone)
    if (storedPhone !== requested) {
      return { ok: false, error: 'Téléphone invalide ou compte introuvable.' }
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
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <span className="dot" aria-hidden />
            <span className="logo">depaneurIA — client</span>
          </div>
          <Navigation isLoggedIn={Boolean(session?.loggedIn)} />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<ShopPage />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/commande/succes" element={<OrderSuccessPage />} />
            <Route path="/commande/echec" element={<OrderFailurePage />} />
            <Route path="/commande/suivi" element={<OrderTrackingPage />} />
            <Route path="/operator" element={<StoreOpsPage />} />
            <Route path="/driver" element={<DriverPage />} />
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
    </BrowserRouter>
  )
}

const App = () => {
  return <AppShell />
}

export default App
