import React from 'react'
import { Logo } from './Logo'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export type NavTab = 'dashboard' | 'patients' | 'new-patient' | 'patient-profile'

interface SidebarProps {
  currentTab: NavTab
  onNavigate: (tab: NavTab) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { user, signOut } = useAuth()

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 shrink-0 md:min-h-screen sticky top-0 z-20">
      <div>
        {/* Logo Nutri APP */}
        <div className="pb-8 border-b border-slate-100 flex items-center justify-between">
          <Logo size="md" text="Nutri APP" />
        </div>

        {/* Navegação fixa */}
        <nav className="mt-8 space-y-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100/50'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              currentTab === 'patients' || currentTab === 'new-patient' || currentTab === 'patient-profile'
                ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100/50 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className={`w-5 h-5 ${currentTab === 'patients' || currentTab === 'new-patient' || currentTab === 'patient-profile' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Pacientes</span>
          </button>
        </nav>
      </div>

      {/* Perfil & Logout */}
      <div className="pt-6 border-t border-slate-100 mt-6 md:mt-0">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs border border-emerald-200/50">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Nutricionista'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-medium text-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  )
}

