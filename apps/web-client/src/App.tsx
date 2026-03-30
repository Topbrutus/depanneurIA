import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import StorePage from './pages/StorePage'
import type { Role } from './types'

export default function App() {
  const [role, setRole] = useState<Role | null>(null)

  if (!role) {
    return <LoginPage onLogin={setRole} />
  }

  return (
    <Routes>
      <Route path="/" element={<StorePage role={role} onLogout={() => setRole(null)} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
