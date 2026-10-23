import React, { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { Logo } from './Logo'
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'

interface LoginProps {
  onSwitchToRegister: () => void
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.')
      return
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres.')
      return
    }

    setIsLoading(true)
    const res = await signIn({ email, password })
    setIsLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Falha ao autenticar. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-tr from-slate-50 via-emerald-50/20 to-teal-50/30">
      {/* Coluna Esquerda - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Topo: Logo */}
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Acesso Nutricionista
          </span>
        </div>

        {/* Centro: Formulário */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bem-vindo de volta!
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Acesse sua conta para gerenciar seus pacientes e planos alimentares.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/90 border border-red-200/80 text-red-700 text-sm flex items-start gap-3 shadow-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="login-email">
                E-mail profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@nutricao.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="login-password">
                  Senha
                </label>
                <span className="text-xs text-slate-400 font-medium">Mínimo 9 caracteres</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              id="btn-entrar"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando na plataforma...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Não tem conta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
            >
              Cadastre-se
            </button>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-xs text-slate-400 text-center sm:text-left flex items-center justify-between">
          <span>© 2026 Nutriens Inc. Todos os direitos reservados.</span>
          <span className="hidden sm:inline text-emerald-600/80 font-medium">Saúde & Bem-estar</span>
        </div>
      </div>

      {/* Coluna Direita - Visual e Banner (Health / Nutrition) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 flex-col justify-between text-white overflow-hidden shadow-2xl">
        {/* Glow & Pattern de Fundo */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>

        <div className="relative z-10 flex justify-end">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Plataforma Inteligente de Nutrição</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Transforme o acompanhamento dos seus pacientes com precisão e cuidado.
          </h2>
          <p className="text-emerald-100 text-base leading-relaxed mb-8">
            Centralize anamneses, planos alimentares personalizados e métricas de evolução clínica em um só lugar.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 mb-2" />
              <h4 className="font-bold text-sm">Neon Auth & RLS</h4>
              <p className="text-xs text-emerald-100/80 mt-1">Isolamento rigoroso de prontuários com segurança de nível médico.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 mb-2" />
              <h4 className="font-bold text-sm">Tempo Real</h4>
              <p className="text-xs text-emerald-100/80 mt-1">Acompanhamento contínuo e sincronização instantânea na nuvem.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-200/70 border-t border-white/10 pt-6">
          <span>Nutriens para Profissionais de Saúde</span>
          <span>Versão 2.4</span>
        </div>
      </div>
    </div>
  )
}
