import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../lib/AuthContext'
import { dataClient } from '../lib/neon'
import { Paciente, Consulta, PlanoAlimentar } from '../types/patient'
import { 
  formatPhone, 
  formatTimeString, 
  calculateAge, 
  calculateIMC 
} from '../utils/patientUtils'
import { MultiSelectWithCustom } from './MultiSelectWithCustom'
import { WeightEvolutionChart } from './WeightEvolutionChart'
import { NewConsultationModal } from './NewConsultationModal'
import { MealPlansSection } from './MealPlansSection'
import { 
  ArrowLeft, 
  User, 
  Activity, 
  FileText, 
  Loader2, 
  Save, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  CalendarCheck,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface PatientProfileProps {
  patientId: string
  onBack: () => void
}

const OBJECTIVE_OPTIONS = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
]

const ACTIVITY_LEVEL_OPTIONS = [
  'Sedentário',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Extremamente ativo',
]

const PATHOLOGY_OPTIONS = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
]

const RESTRICTION_OPTIONS = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
]

const ALLERGY_OPTIONS = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
]

export const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, onBack }) => {
  const { user } = useAuth()
  const [patient, setPatient] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [planos, setPlanos] = useState<PlanoAlimentar[]>([])
  const [selectedPlan, setSelectedPlan] = useState<PlanoAlimentar | null>(null)

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)
  const [isSavingPatient, setIsSavingPatient] = useState(false)

  // Controle de Seção (Prompt 5: Dados do Paciente, Consultas, Planos Alimentares)
  const [activeSection, setActiveSection] = useState<'dados' | 'consultas' | 'planos'>('dados')
  // Sub-abas da Seção 1 (Pessoal, Clínico, Hábitos)
  const [dadosSubTab, setDadosSubTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal')

  // Modal de Nova Consulta
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false)

  // ================= ESTADOS DOS CAMPOS EDITÁVEIS (SEÇÃO 1) =================
  // Aba Pessoal
  const [editNome, setEditNome] = useState('')
  const [editDataNascimento, setEditDataNascimento] = useState('')
  const [editSexo, setEditSexo] = useState<'Feminino' | 'Masculino' | 'Outro' | ''>('')
  const [editTelefone, setEditTelefone] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [editEmail, setEditEmail] = useState('')

  // Aba Clínico
  const [editPesoInicial, setEditPesoInicial] = useState<string>('')
  const [editAltura, setEditAltura] = useState<string>('')
  const [editObjetivos, setEditObjetivos] = useState<string[]>([])
  const [editObjetivoTexto, setEditObjetivoTexto] = useState('')
  const [editNivelAtividade, setEditNivelAtividade] = useState('')
  const [editPatologias, setEditPatologias] = useState<string[]>([])
  const [editRestricoes, setEditRestricoes] = useState<string[]>([])
  const [editAlergias, setEditAlergias] = useState<string[]>([])
  const [editMedicamentos, setEditMedicamentos] = useState('')
  const [editSuplementos, setEditSuplementos] = useState('')

  // Aba Hábitos
  const [editRefeicoesPorDia, setEditRefeicoesPorDia] = useState<string>('')
  const [editHorarioAcorda, setEditHorarioAcorda] = useState('')
  const [editHorarioDorme, setEditHorarioDorme] = useState('')
  const [editLitrosAgua, setEditLitrosAgua] = useState<string>('')
  const [editAtividadeFisica, setEditAtividadeFisica] = useState<boolean | null>(null)
  const [editAtividadeFisicaDescricao, setEditAtividadeFisicaDescricao] = useState('')
  const [editObservacoes, setEditObservacoes] = useState('')

  // Função para carregar todos os dados do paciente, consultas e planos
  const fetchAllData = useCallback(async () => {
    if (!patientId || !user?.id) return
    setLoading(true)
    setErrorMessage(null)

    try {
      // 1. Carregar Paciente
      const patientRes = await (dataClient as any)
        .from('pacientes')
        .select('*')
        .eq('id', patientId)
        .eq('nutricionista_id', user.id)
        .single()

      if (patientRes.error) {
        throw new Error(patientRes.error.message || 'Erro ao carregar dados do paciente')
      }

      const p: Paciente = patientRes.data
      setPatient(p)

      // Popula campos editáveis
      setEditNome(p.nome || '')
      setEditDataNascimento(p.data_nascimento || '')
      setEditSexo((p.sexo as any) || '')
      setEditTelefone(p.telefone || '')
      setEditWhatsapp(p.whatsapp || '')
      setEditEmail(p.email || '')

      setEditPesoInicial(p.peso_inicial ? String(p.peso_inicial) : '')
      setEditAltura(p.altura ? String(p.altura) : '')
      setEditObjetivos(p.objetivos || [])
      setEditObjetivoTexto(p.objetivo_texto || '')
      setEditNivelAtividade(p.nivel_atividade || '')
      setEditPatologias(p.patologias || [])
      setEditRestricoes(p.restricoes_alimentares || [])
      setEditAlergias(p.alergias || [])
      setEditMedicamentos(p.medicamentos || '')
      setEditSuplementos(p.suplementos || '')

      setEditRefeicoesPorDia(p.refeicoes_por_dia ? String(p.refeicoes_por_dia) : '')
      setEditHorarioAcorda(p.horario_acorda || '')
      setEditHorarioDorme(p.horario_dorme || '')
      setEditLitrosAgua(p.litros_agua ? String(p.litros_agua) : '')
      setEditAtividadeFisica(p.atividade_fisica ?? null)
      setEditAtividadeFisicaDescricao(p.atividade_fisica_descricao || '')
      setEditObservacoes(p.observacoes || '')

      // 2. Carregar Consultas
      const consultRes = await (dataClient as any)
        .from('consultas')
        .select('*')
        .eq('paciente_id', patientId)
        .order('data_consulta', { ascending: false })

      if (consultRes.error) {
        console.error('Erro ao buscar consultas:', consultRes.error)
      } else {
        setConsultas(consultRes.data || [])
      }

      // 3. Carregar Planos Alimentares
      const plansRes = await (dataClient as any)
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false })

      if (plansRes.error) {
        console.error('Erro ao buscar planos alimentares:', plansRes.error)
      } else {
        setPlanos(plansRes.data || [])
      }

    } catch (err: any) {
      console.error('Erro geral ao carregar dados:', err)
      setErrorMessage(err.message || 'Falha ao buscar dados do paciente.')
    } finally {
      setLoading(false)
    }
  }, [patientId, user?.id])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Cálculos dinâmicos
  const idade = useMemo(() => calculateAge(editDataNascimento), [editDataNascimento])
  const parsedPeso = editPesoInicial ? parseFloat(editPesoInicial.replace(',', '.')) : null
  const parsedAltura = editAltura ? parseFloat(editAltura.replace(',', '.')) : null
  const imcInfo = useMemo(() => calculateIMC(parsedPeso, parsedAltura), [parsedPeso, parsedAltura])

  // ================= SALVAR EDIÇÕES DO PACIENTE =================
  const handleSavePatientEdits = async () => {
    if (!editNome.trim()) {
      setErrorMessage('O nome do paciente é obrigatório.')
      return
    }

    setIsSavingPatient(true)
    setErrorMessage(null)
    setSaveSuccessMessage(null)

    try {
      const updatedData = {
        nome: editNome.trim(),
        data_nascimento: editDataNascimento || null,
        sexo: editSexo || null,
        telefone: editTelefone.trim() || null,
        whatsapp: editWhatsapp.trim() || null,
        email: editEmail.trim() || null,
        peso_inicial: parsedPeso && !isNaN(parsedPeso) ? parsedPeso : null,
        altura: parsedAltura && !isNaN(parsedAltura) ? parsedAltura : null,
        objetivos: editObjetivos.length > 0 ? editObjetivos : null,
        objetivo_texto: editObjetivoTexto.trim() || null,
        nivel_atividade: editNivelAtividade || null,
        patologias: editPatologias.length > 0 ? editPatologias : null,
        restricoes_alimentares: editRestricoes.length > 0 ? editRestricoes : null,
        alergias: editAlergias.length > 0 ? editAlergias : null,
        medicamentos: editMedicamentos.trim() || null,
        suplementos: editSuplementos.trim() || null,
        refeicoes_por_dia: editRefeicoesPorDia ? parseInt(editRefeicoesPorDia, 10) : null,
        horario_acorda: editHorarioAcorda ? formatTimeString(editHorarioAcorda) : null,
        horario_dorme: editHorarioDorme ? formatTimeString(editHorarioDorme) : null,
        litros_agua: editLitrosAgua ? parseFloat(editLitrosAgua.replace(',', '.')) : null,
        atividade_fisica: editAtividadeFisica,
        atividade_fisica_descricao: editAtividadeFisica ? editAtividadeFisicaDescricao.trim() || null : null,
        observacoes: editObservacoes.trim() || null,
      }

      const res = await (dataClient as any)
        .from('pacientes')
        .update(updatedData)
        .eq('id', patientId)

      if (res.error) {
        throw new Error(res.error.message || 'Erro ao salvar alterações no Neon')
      }

      setPatient((prev) => (prev ? { ...prev, ...updatedData } : null))
      setSaveSuccessMessage('Alterações salvas com sucesso!')

      setTimeout(() => {
        setSaveSuccessMessage(null)
      }, 4000)
    } catch (err: any) {
      console.error('Erro ao atualizar paciente:', err)
      setErrorMessage(err.message || 'Não foi possível salvar as alterações.')
    } finally {
      setIsSavingPatient(false)
    }
  }

  // ================= SALVAR NOVA CONSULTA =================
  const handleSaveConsultation = async (newConsultationData: {
    data_consulta: string
    peso?: number | null
    cintura?: number | null
    quadril?: number | null
    percentual_gordura?: number | null
    observacoes?: string | null
    proximo_retorno?: string | null
  }) => {
    const res = await (dataClient as any)
      .from('consultas')
      .insert({
        paciente_id: patientId,
        ...newConsultationData,
      })
      .select('*')

    if (res.error) {
      throw new Error(res.error.message || 'Erro ao registrar consulta')
    }

    const inserted: Consulta = res.data && res.data[0]
    if (inserted) {
      setConsultas((prev) => [inserted, ...prev])
    } else {
      // Recarrega lista completa por garantia
      const re = await (dataClient as any)
        .from('consultas')
        .select('*')
        .eq('paciente_id', patientId)
        .order('data_consulta', { ascending: false })
      if (!re.error) setConsultas(re.data || [])
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Carregando perfil e consultas do paciente...</p>
        </div>
      </div>
    )
  }

  if (errorMessage && !patient) {
    return (
      <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para pacientes</span>
        </button>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
          <h3 className="font-bold">Ops! Não foi possível encontrar o paciente</h3>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Botão Voltar e Topo */}
      <div className="pb-6 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para lista de pacientes</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-xs">
              {patient?.nome ? patient.nome.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {patient?.nome}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Paciente Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2 items-center">
                <span>{patient?.sexo || 'Sexo não informado'}</span>
                <span>•</span>
                <span>{idade !== null ? `${idade} anos` : 'Idade não informada'}</span>
                {patient?.telefone && (
                  <>
                    <span>•</span>
                    <span>{patient.telefone}</span>
                  </>
                )}
                {patient?.email && (
                  <>
                    <span>•</span>
                    <span>{patient.email}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {activeSection === 'dados' && (
            <button
              type="button"
              onClick={handleSavePatientEdits}
              disabled={isSavingPatient}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-xs shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSavingPatient ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar alterações</span>
                </>
              )}
            </button>
          )}

          {activeSection === 'consultas' && (
            <button
              type="button"
              onClick={() => setIsNewConsultationOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Consulta</span>
            </button>
          )}
        </div>
      </div>

      {/* Alertas */}
      {saveSuccessMessage && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm animate-fade-in font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navegação entre as 3 seções do perfil (Prompt 5) */}
      <div className="mt-6 border-b border-slate-200">
        <div className="flex gap-2 sm:gap-6">
          <button
            type="button"
            onClick={() => setActiveSection('dados')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeSection === 'dados'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Dados do Paciente</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('consultas')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeSection === 'consultas'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Consultas ({consultas.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('planos')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeSection === 'planos'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Planos Alimentares ({planos.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEÇÃO 1 — DADOS DO PACIENTE (EDITÁVEIS DIRETAMENTE NA PÁGINA)   */}
      {/* ============================================================== */}
      {activeSection === 'dados' && (
        <div className="mt-6 space-y-6">
          {/* Sub-abas: Pessoal, Clínico, Hábitos */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDadosSubTab('pessoal')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dadosSubTab === 'pessoal'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              1. Pessoal
            </button>
            <button
              type="button"
              onClick={() => setDadosSubTab('clinico')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dadosSubTab === 'clinico'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              2. Clínico
            </button>
            <button
              type="button"
              onClick={() => setDadosSubTab('habitos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dadosSubTab === 'habitos'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              3. Hábitos
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            {/* Sub-aba Pessoal */}
            {dadosSubTab === 'pessoal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Informações Pessoais (Editáveis)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Altere os dados desejados e clique em &quot;Salvar alterações&quot; no topo ou ao fim da página.
                  </p>
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nome completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Data de Nascimento e Idade calculada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Data de nascimento
                    </label>
                    <input
                      type="date"
                      value={editDataNascimento}
                      onChange={(e) => setEditDataNascimento(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Idade (calculada automaticamente)
                    </label>
                    <div className="px-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold flex items-center justify-between">
                      <span>{idade !== null ? `${idade} anos` : 'Aguardando data'}</span>
                      {idade !== null && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                          Calculada
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sexo
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Feminino', 'Masculino', 'Outro'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditSexo(editSexo === s ? '' : s)}
                        className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer text-center ${
                          editSexo === s
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contatos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(formatPhone(e.target.value))}
                      placeholder="(99) 9999-9999"
                      maxLength={15}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(formatPhone(e.target.value))}
                      placeholder="(99) 99999-9999"
                      maxLength={15}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="paciente@exemplo.com"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Sub-aba Clínico */}
            {dadosSubTab === 'clinico' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Avaliação Clínica (Editável)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Medidas corporais iniciais, patologias e condições de saúde.
                  </p>
                </div>

                {/* Peso, Altura, IMC */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Peso inicial
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={editPesoInicial}
                        onChange={(e) => setEditPesoInicial(e.target.value)}
                        placeholder="Ex: 70.5"
                        className="w-full pl-4 pr-12 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                      />
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                        kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Altura
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        value={editAltura}
                        onChange={(e) => setEditAltura(e.target.value)}
                        placeholder="Ex: 172"
                        className="w-full pl-4 pr-12 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                      />
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      IMC (somente leitura)
                    </label>
                    <div
                      className={`h-[42px] px-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
                        imcInfo
                          ? imcInfo.colorClass
                          : 'bg-slate-100/70 border-slate-200 text-slate-400'
                      }`}
                    >
                      {imcInfo ? (
                        <>
                          <span className="text-sm font-extrabold">{imcInfo.imc} kg/m²</span>
                          <span className="truncate ml-2">{imcInfo.classification}</span>
                        </>
                      ) : (
                        <span>Preencha peso e altura</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objetivos */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Objetivo (múltipla escolha)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {OBJECTIVE_OPTIONS.map((obj) => {
                      const isSelected = editObjetivos.includes(obj)
                      return (
                        <button
                          key={obj}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setEditObjetivos(editObjetivos.filter((o) => o !== obj))
                            } else {
                              setEditObjetivos([...editObjetivos, obj])
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {obj}
                        </button>
                      )
                    })}
                  </div>
                  <input
                    type="text"
                    value={editObjetivoTexto}
                    onChange={(e) => setEditObjetivoTexto(e.target.value)}
                    placeholder="Objetivo adicional ou detalhes livres..."
                    className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Nível de atividade */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nível de atividade física
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ACTIVITY_LEVEL_OPTIONS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEditNivelAtividade(editNivelAtividade === level ? '' : level)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                          editNivelAtividade === level
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <MultiSelectWithCustom
                  label="Patologias ou condições de saúde"
                  options={PATHOLOGY_OPTIONS}
                  selected={editPatologias}
                  onChange={setEditPatologias}
                  hasNoneOption={true}
                />

                <MultiSelectWithCustom
                  label="Restrições alimentares"
                  options={RESTRICTION_OPTIONS}
                  selected={editRestricoes}
                  onChange={setEditRestricoes}
                  hasNoneOption={true}
                />

                <MultiSelectWithCustom
                  label="Alergias alimentares"
                  options={ALLERGY_OPTIONS}
                  selected={editAlergias}
                  onChange={setEditAlergias}
                  hasNoneOption={true}
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Medicamentos contínuos
                  </label>
                  <textarea
                    rows={2}
                    value={editMedicamentos}
                    onChange={(e) => setEditMedicamentos(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Suplementos em uso
                  </label>
                  <textarea
                    rows={2}
                    value={editSuplementos}
                    onChange={(e) => setEditSuplementos(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Sub-aba Hábitos */}
            {dadosSubTab === 'habitos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Rotina & Hábitos (Editável)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ajuste o padrão diário de sono, hidratação e refeições.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Quantas refeições faz por dia
                    </label>
                    <input
                      type="number"
                      value={editRefeicoesPorDia}
                      onChange={(e) => setEditRefeicoesPorDia(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Quantidade de água por dia
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={editLitrosAgua}
                        onChange={(e) => setEditLitrosAgua(e.target.value)}
                        className="w-full pl-4 pr-16 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                      />
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                        litros
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Horário que acorda
                    </label>
                    <input
                      type="text"
                      value={editHorarioAcorda}
                      onChange={(e) => setEditHorarioAcorda(e.target.value)}
                      onBlur={() => editHorarioAcorda && setEditHorarioAcorda(formatTimeString(editHorarioAcorda))}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Horário que dorme
                    </label>
                    <input
                      type="text"
                      value={editHorarioDorme}
                      onChange={(e) => setEditHorarioDorme(e.target.value)}
                      onBlur={() => editHorarioDorme && setEditHorarioDorme(formatTimeString(editHorarioDorme))}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pratica atividade física?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditAtividadeFisica(true)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer text-center ${
                        editAtividadeFisica === true
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditAtividadeFisica(false)
                        setEditAtividadeFisicaDescricao('')
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer text-center ${
                        editAtividadeFisica === false
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Não
                    </button>
                  </div>

                  {editAtividadeFisica === true && (
                    <div className="mt-3.5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                      <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                        Qual atividade física e frequência semanal?
                      </label>
                      <input
                        type="text"
                        value={editAtividadeFisicaDescricao}
                        onChange={(e) => setEditAtividadeFisicaDescricao(e.target.value)}
                        placeholder="Ex: Musculação 4x na semana..."
                        className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Observações gerais
                  </label>
                  <textarea
                    rows={3}
                    value={editObservacoes}
                    onChange={(e) => setEditObservacoes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Botão de confirmação de edições ao rodapé */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSavePatientEdits}
                disabled={isSavingPatient}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {isSavingPatient ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando alterações...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEÇÃO 2 — CONSULTAS (GRÁFICO DE PESO + LISTA + MODAL)           */}
      {/* ============================================================== */}
      {activeSection === 'consultas' && (
        <div className="mt-6 space-y-6">
          {/* Gráfico de Evolução de Peso sempre visível em destaque */}
          <WeightEvolutionChart consultas={consultas} />

          {/* Cabeçalho da Lista de Consultas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Histórico de Consultas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registros ordenados cronologicamente do mais recente para o mais antigo
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewConsultationOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Consulta</span>
            </button>
          </div>

          {/* Lista de Consultas */}
          {consultas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                <Calendar className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Nenhuma consulta registrada ainda
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Inicie o acompanhamento clínico registrando a primeira pesagem e retorno do paciente.
              </p>
              <button
                type="button"
                onClick={() => setIsNewConsultationOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primeira Consulta</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
              {consultas.map((c) => (
                <div key={c.id} className="p-5 sm:px-6 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-sm shrink-0">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {new Date(c.data_consulta).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </h4>
                        {c.proximo_retorno && (
                          <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>
                              Próximo retorno:{' '}
                              <strong>
                                {new Date(c.proximo_retorno).toLocaleDateString('pt-BR')}
                              </strong>
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Medições resumidas */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {c.peso !== null && c.peso !== undefined && (
                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/60 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.peso} kg</span>
                        </div>
                      )}
                      {c.percentual_gordura !== null && c.percentual_gordura !== undefined && (
                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/60">
                          Gordura: <strong className="font-bold">{c.percentual_gordura}%</strong>
                        </div>
                      )}
                      {c.cintura !== null && c.cintura !== undefined && (
                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/60">
                          Cintura: <strong className="font-bold">{c.cintura} cm</strong>
                        </div>
                      )}
                      {c.quadril !== null && c.quadril !== undefined && (
                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/60">
                          Quadril: <strong className="font-bold">{c.quadril} cm</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {c.observacoes && (
                    <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">Observações: </span>
                      {c.observacoes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SEÇÃO 3 — PLANOS ALIMENTARES                                   */}
      {/* ============================================================== */}
      {activeSection === 'planos' && patient && (
        <MealPlansSection
          patient={patient}
          planos={planos}
          onSavePlan={async (conteudo) => {
            const res = await (dataClient as any)
              .from('planos_alimentares')
              .insert({
                paciente_id: patientId,
                conteudo: conteudo,
              })
              .select('*')

            if (res.error) {
              throw new Error(res.error.message || 'Erro ao salvar plano no banco.')
            }

            const inserted: PlanoAlimentar = res.data && res.data[0]
            if (inserted) {
              setPlanos((prev) => [inserted, ...prev])
            } else {
              const refetch = await (dataClient as any)
                .from('planos_alimentares')
                .select('*')
                .eq('paciente_id', patientId)
                .order('created_at', { ascending: false })
              if (!refetch.error) setPlanos(refetch.data || [])
            }
          }}
        />
      )}

      {/* Modal de Nova Consulta */}
      <NewConsultationModal
        isOpen={isNewConsultationOpen}
        onClose={() => setIsNewConsultationOpen(false)}
        onSave={handleSaveConsultation}
      />
    </div>
  )
}
