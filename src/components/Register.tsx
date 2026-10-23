import React, { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { Logo } from './Logo'
import { User as UserIcon, Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react'

interface RegisterProps {
  onSwitchToLogin: () => void
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail profissional.')
      return
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve conter no mínimo 9 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a senha informada.')
      return
    }

    setIsLoading(true)
    const res = await signUp({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    })
    setIsLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Não foi possível concluir o cadastro.')
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-tr from-slate-50 via-emerald-50/20 to-teal-50/30">
      {/* Coluna Esquerda - Visual e Benefícios */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-800 via-emerald-700 to-emerald-600 p-12 flex-col justify-between text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 -mt-20 -ml-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-xs font-medium">
            <HeartHandshake className="w-4 h-4 text-emerald-300" />
            <span>Junte-se a nutricionistas de alta performance</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg my-auto">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Construa uma prática clínica moderna, ágil e focada em resultados.
          </h2>
          <p className="text-emerald-100 text-base leading-relaxed mb-8">
            Com o Nutriens, você automatiza registros de anamnese, calcula métricas e organiza suas consultas com segurança de ponta a ponta.
          </p>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Privacidade Total dos Prontuários</p>
                <p className="text-xs text-emerald-100/80">Dados protegidos por Row Level Security no banco Neon PostgreSQL.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Dashboard de Retornos e Métricas</p>
                <p className="text-xs text-emerald-100/80">Nunca mais perca pacientes sem acompanhamento há mais de 30 dias.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-200/70 border-t border-white/10 pt-6">
          <span>Nutriens App</span>
          <span>Ambiente Seguro & Criptografado</span>
        </div>
      </div>

      {/* Coluna Direita - Formulário de Cadastro */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Topo: Logo */}
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
            Novo Profissional
          </span>
        </div>

        {/* Centro: Formulário */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Criar conta profissional
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Cadastre-se gratuitamente para começar a gerenciar seus atendimentos.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-red-50/90 border border-red-200/80 text-red-700 text-sm flex items-start gap-3 shadow-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="register-name">
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dra. Mariana Silva"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="register-email">
                E-mail profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mariana@nutricao.com"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="register-password">
                  Senha
                </label>
                <span className="text-xs text-slate-400 font-medium">Mín. 9 caracteres</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="register-confirm-password">
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="register-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="•••••••••"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              id="btn-criar-conta"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Criando conta e preparando clínica...</span>
                </>
              ) : (
                <>
                  <span>Criar conta</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Já tem conta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
            >
              Faça login
            </button>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-xs text-slate-400 text-center sm:text-left flex items-center justify-between">
          <span>© 2026 Nutriens Inc.</span>
          <span className="hidden sm:inline text-emerald-600/80 font-medium">Nutrição de Precisão</span>
        </div>
      </div>
    </div>
  )
}
