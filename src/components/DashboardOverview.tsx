import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../lib/AuthContext'
import { dataClient } from '../lib/neon'
import { 
  Users, 
  Calendar, 
  Clock, 
  ChevronRight,
  Activity,
  AlertCircle,
  RefreshCw,
  UserCheck,
  CalendarCheck
} from 'lucide-react'

export interface OverduePatient {
  id: string
  nome: string
  email?: string
  telefone?: string
  lastConsultationDate: string
  daysSinceLastConsultation: number
}

interface DashboardOverviewProps {
  onNavigateToPatients: () => void
  onSelectPatient: (patientId: string) => void
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  onNavigateToPatients, 
  onSelectPatient 
}) => {
  const { user } = useAuth()

  // Estados dos Cards
  const [totalPatients, setTotalPatients] = useState<number>(0)
  const [weekConsultations, setWeekConsultations] = useState<number>(0)
  const [overduePatients, setOverduePatients] = useState<OverduePatient[]>([])
  
  // Estado de carregamento e erro
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Função para buscar dados em tempo real do Neon
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return
    setErrorMessage(null)

    try {
      // 1. Total de pacientes cadastrados pela nutricionista logada
      const patientsRes = await (dataClient as any)
        .from('pacientes')
        .select('id, nome, email, telefone, nutricionista_id')
        .eq('nutricionista_id', user.id)

      if (patientsRes.error) {
        console.error('Erro ao buscar pacientes:', patientsRes.error)
        throw new Error(patientsRes.error.message || 'Erro ao carregar pacientes.')
      }

      const patientsList: Array<{ id: string; nome: string; email?: string; telefone?: string }> = patientsRes.data || []
      setTotalPatients(patientsList.length)

      if (patientsList.length === 0) {
        setWeekConsultations(0)
        setOverduePatients([])
        return
      }

      const patientIds = patientsList.map(p => p.id)

      // 2. Consultas da semana atual
      const now = new Date()
      const currentDay = now.getDay() // 0 = Domingo, 1 = Segunda, ...
      const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() + diffToMonday)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      const startOfWeekStr = startOfWeek.toISOString().split('T')[0]
      const endOfWeekStr = endOfWeek.toISOString().split('T')[0]

      // Buscar consultas dos pacientes desta nutricionista
      const consultationsRes = await (dataClient as any)
        .from('consultas')
        .select('id, paciente_id, data_consulta, proximo_retorno')
        .in('paciente_id', patientIds)

      if (consultationsRes.error) {
        console.error('Erro ao buscar consultas:', consultationsRes.error)
      }

      const consultationsList: Array<{
        id: string
        paciente_id: string
        data_consulta: string
        proximo_retorno?: string | null
      }> = consultationsRes.data || []

      // Filtra consultas da semana atual
      const thisWeekCount = consultationsList.filter(c => {
        if (!c.data_consulta) return false
        const cDate = c.data_consulta.substring(0, 10)
        return cDate >= startOfWeekStr && cDate <= endOfWeekStr
      }).length

      setWeekConsultations(thisWeekCount)

      // 3. Pacientes sem retorno (> 30 dias sem consulta e sem retorno futuro)
      const todayStr = now.toISOString().split('T')[0]
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(now.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

      const consultationsByPatient: Record<string, Array<{ data_consulta: string; proximo_retorno?: string | null }>> = {}
      for (const c of consultationsList) {
        if (!consultationsByPatient[c.paciente_id]) {
          consultationsByPatient[c.paciente_id] = []
        }
        consultationsByPatient[c.paciente_id].push(c)
      }

      const overdueList: OverduePatient[] = []

      for (const p of patientsList) {
        const pConsultations = consultationsByPatient[p.id] || []
        if (pConsultations.length === 0) {
          continue
        }

        pConsultations.sort((a, b) => (b.data_consulta > a.data_consulta ? 1 : -1))
        const lastConsultation = pConsultations[0]

        const hasFutureScheduledReturn = pConsultations.some(c => {
          return c.proximo_retorno && c.proximo_retorno >= todayStr
        })

        if (lastConsultation.data_consulta < thirtyDaysAgoStr && !hasFutureScheduledReturn) {
          const lastDate = new Date(lastConsultation.data_consulta)
          const diffTime = Math.abs(now.getTime() - lastDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          overdueList.push({
            id: p.id,
            nome: p.nome,
            email: p.email,
            telefone: p.telefone,
            lastConsultationDate: lastConsultation.data_consulta,
            daysSinceLastConsultation: diffDays
          })
        }
      }

      overdueList.sort((a, b) => b.daysSinceLastConsultation - a.daysSinceLastConsultation)
      setOverduePatients(overdueList)

    } catch (err: any) {
      console.error('Falha ao processar dados do dashboard:', err)
      setErrorMessage(err.message || 'Falha ao sincronizar informações com o banco de dados.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDashboardData()
  }

  const currentDateDisplay = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Header Superior */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Online
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 capitalize">
            {currentDateDisplay}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            title="Recarregar dados"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/50 text-sm font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            onClick={onNavigateToPatients}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold transition-all shadow-xs shadow-emerald-600/20 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Ver Pacientes</span>
          </button>
        </div>
      </header>

      {/* Banner de Boas-vindas */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            Olá, Nutricionista {user?.name || ''}! 👋
          </h2>
          <p className="text-sm text-emerald-100/90 mt-1">
            Aqui está o resumo clínico e operacional dos seus atendimentos no Nutri APP.
          </p>
        </div>
      </div>

      {/* Alerta de Erro caso a conexão falhe */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-bold underline hover:text-rose-900 ml-4 shrink-0"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Grid com os 3 Cards de Informação Conforme Prompt 3 */}
      <section className="mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 — Total de pacientes */}
          <div 
            onClick={onNavigateToPatients}
            className="group bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  Card 1 • Pacientes
                </span>
                <p className="text-sm font-semibold text-slate-500 mt-3">
                  Total de pacientes cadastrados
                </p>

                {loading ? (
                  <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg mt-2"></div>
                ) : (
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight mt-1 group-hover:text-emerald-700 transition-colors">
                    {totalPatients}
                  </h3>
                )}

                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vinculados exclusivamente à sua conta</span>
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <Users className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              <span>Gerenciar e cadastrar pacientes</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2 — Consultas da semana */}
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                  Card 2 • Agenda Semanal
                </span>
                <p className="text-sm font-semibold text-slate-500 mt-3">
                  Consultas da semana
                </p>

                {loading ? (
                  <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg mt-2"></div>
                ) : (
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight mt-1">
                    {weekConsultations}
                  </h3>
                )}

                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                  <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Registradas na semana atual (seg a dom)</span>
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
              <span>Atendimentos agendados ou concluídos</span>
              <Activity className="w-4 h-4 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Card 3 — Pacientes sem retorno */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Header do Card 3 */}
          <div className="p-6 md:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Card 3 — Pacientes sem retorno
                  </h2>
                  {!loading && overduePatients.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      {overduePatients.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-slate-400 self-start sm:self-center">
              Critério: &gt; 30 dias sem retorno
            </span>
          </div>

          {/* Corpo da Lista de Pacientes Sem Retorno */}
          <div className="p-6 md:p-7">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 bg-slate-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : overduePatients.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-slate-800">
                  Nenhum paciente sem retorno no momento
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Todos os seus pacientes estão com consultas recentes ou com retornos futuros devidamente agendados.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overduePatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    className="group py-4 px-3 -mx-3 rounded-xl hover:bg-slate-50/80 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200/50 group-hover:scale-105 transition-transform">
                        {p.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {p.nome}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>
                            Última consulta: <strong className="text-slate-600 font-medium">{new Date(p.lastConsultationDate).toLocaleDateString('pt-BR')}</strong>
                          </span>
                          {p.telefone && (
                            <>
                              <span>•</span>
                              <span>{p.telefone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/60 text-amber-700 font-medium text-xs">
                        {p.daysSinceLastConsultation} dias sem consulta
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
