import React from 'react'
import { useAuth } from '../lib/AuthContext'
import { Logo } from './Logo'
import { 
  Users, 
  Calendar, 
  Clock, 
  LogOut, 
  LayoutDashboard, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Fixo */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6">
        <div>
          {/* Logo Nutriens */}
          <div className="pb-8 border-b border-slate-100">
            <Logo size="md" />
          </div>

          {/* Navegação */}
          <nav className="mt-8 space-y-1.5">
            <button
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm transition-all"
            >
              <LayoutDashboard className="w-5 h-5 text-emerald-600" />
              <span>Dashboard</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-all"
            >
              <Users className="w-5 h-5 text-slate-400" />
              <span>Pacientes</span>
            </button>
          </nav>
        </div>

        {/* Perfil & Logout */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Nutricionista'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 font-medium text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do sistema</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 lg:p-10 max-w-7xl">
        {/* Header com boas-vindas */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Olá, {user?.name || 'Nutricionista'}! 👋
              </h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Bem-vindo ao seu painel clínico. Sessão autenticada via <strong className="text-emerald-700 font-semibold">Neon Auth</strong>.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>RLS Ativo e Seguro</span>
          </div>
        </header>

        {/* Prévia dos cards da próxima etapa (Prompt 3) */}
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de pacientes</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">0</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Cadastrados no sistema</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultas da semana</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">0</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Atendimentos agendados</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pacientes sem retorno</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">0</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  &gt; 30 dias sem retorno
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-base font-bold text-slate-800 mb-2">Status da Autenticação</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>• <strong>ID do Nutricionista:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{user?.id}</code></p>
              <p>• <strong>E-mail:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{user?.email}</code></p>
              <p>• <strong>Tabela public.nutricionistas:</strong> Sincronizada automaticamente via Trigger no Neon</p>
              <p>• <strong>Sessão persistente:</strong> Ativa no navegador</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
