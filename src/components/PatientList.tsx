import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../lib/AuthContext'
import { dataClient } from '../lib/neon'
import { Paciente } from '../types/patient'
import { 
  Search, 
  UserPlus, 
  Users, 
  Calendar, 
  Target, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react'

interface PatientListProps {
  onNewPatient: () => void
  onSelectPatient: (patientId: string) => void
}

export const PatientList: React.FC<PatientListProps> = ({
  onNewPatient,
  onSelectPatient,
}) => {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Paciente[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    if (!user?.id) return
    setErrorMessage(null)

    try {
      // 1. Buscar todos os pacientes da nutricionista logada
      const patientsRes = await (dataClient as any)
        .from('pacientes')
        .select('*')
        .eq('nutricionista_id', user.id)
        .order('nome', { ascending: true })

      if (patientsRes.error) {
        throw new Error(patientsRes.error.message || 'Erro ao carregar pacientes')
      }

      const rawPatients: Paciente[] = patientsRes.data || []

      if (rawPatients.length === 0) {
        setPatients([])
        return
      }

      // 2. Buscar consultas para determinar a data da última consulta de cada um
      const patientIds = rawPatients.map((p) => p.id)
      const consultationsRes = await (dataClient as any)
        .from('consultas')
        .select('paciente_id, data_consulta')
        .in('paciente_id', patientIds)

      const lastConsultationMap: Record<string, string> = {}
      if (!consultationsRes.error && consultationsRes.data) {
        consultationsRes.data.forEach((c: { paciente_id: string; data_consulta: string }) => {
          const currentLatest = lastConsultationMap[c.paciente_id]
          if (!currentLatest || c.data_consulta > currentLatest) {
            lastConsultationMap[c.paciente_id] = c.data_consulta
          }
        })
      }

      const enriched = rawPatients.map((p) => ({
        ...p,
        data_ultima_consulta: lastConsultationMap[p.id] || null,
      }))

      setPatients(enriched)
    } catch (err: any) {
      console.error('Erro ao buscar pacientes:', err)
      setErrorMessage(err.message || 'Não foi possível carregar os pacientes.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchPatients()
  }

  // Filtro de busca por nome
  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return patients
    return patients.filter((p) => p.nome.toLowerCase().includes(q))
  }, [patients, searchQuery])

  // Formata o objetivo para exibição
  const formatObjective = (patient: Paciente): string => {
    if (patient.objetivos && patient.objetivos.length > 0) {
      const main = patient.objetivos.join(', ')
      if (patient.objetivo_texto) {
        return `${main} (${patient.objetivo_texto})`
      }
      return main
    }
    if (patient.objetivo_texto) {
      return patient.objetivo_texto
    }
    return 'Não informado'
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-8 h-8 text-emerald-600" />
            <span>Pacientes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie seus pacientes, visualize históricos e inicie novos cadastros.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            title="Atualizar lista"
            className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={onNewPatient}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* Alerta de Erro */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchPatients}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 rounded-lg text-rose-800 font-semibold text-xs"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Barra de Busca */}
      <div className="mt-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar paciente pelo nome..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-sm shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Listagem */}
      <div className="mt-6">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          /* Estado Vazio - Regra: "Nenhum paciente cadastrado ainda" */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Nenhum paciente cadastrado ainda
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Cadastre seu primeiro paciente para começar a registrar avaliações clínicas, hábitos e evolução.
            </p>
            <button
              onClick={onNewPatient}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Paciente</span>
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Nenhum paciente encontrado
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Não encontramos resultados para &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-semibold text-sm cursor-pointer"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {filteredPatients.map((patient) => {
              const lastConsultationFormatted = patient.data_ultima_consulta
                ? new Date(patient.data_ultima_consulta).toLocaleDateString('pt-BR')
                : 'Nenhuma consulta registrada'

              return (
                <div
                  key={patient.id}
                  onClick={() => onSelectPatient(patient.id)}
                  className="group p-5 sm:px-6 hover:bg-slate-50/80 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold flex items-center justify-center text-base shrink-0 group-hover:scale-105 group-hover:bg-emerald-100 transition-all">
                      {patient.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                        {patient.nome}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[260px] sm:max-w-md">
                            {formatObjective(patient)}
                          </span>
                        </span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Última consulta: <strong className="text-slate-600 font-semibold">{lastConsultationFormatted}</strong></span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="hidden md:inline-flex text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      Ver perfil
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rodapé informativo */}
      {!loading && patients.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
          <span>
            Exibindo {filteredPatients.length} de {patients.length} paciente{patients.length !== 1 ? 's' : ''}
          </span>
          <span>Nutriens Sistema Nutricional</span>
        </div>
      )}
    </div>
  )
}
