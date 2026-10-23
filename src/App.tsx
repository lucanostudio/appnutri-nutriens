import React, { useState } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { Dashboard } from './components/Dashboard'
import { Loader2 } from 'lucide-react'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [authView, setAuthView] = useState<'login' | 'register'>('login')

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Carregando sessão do Nutriens...</p>
      </div>
    )
  }

  // Regra: Se já estiver logado, redirecionar direto para o dashboard
  if (user) {
    return <Dashboard />
  }

  // Se não estiver logado, alterna entre Login e Cadastro
  return authView === 'login' ? (
    <Login onSwitchToRegister={() => setAuthView('register')} />
  ) : (
    <Register onSwitchToLogin={() => setAuthView('login')} />
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
