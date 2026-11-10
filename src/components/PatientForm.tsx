import React, { useState, useMemo } from 'react'
import { useAuth } from '../lib/AuthContext'
import { dataClient } from '../lib/neon'
import { MultiSelectWithCustom } from './MultiSelectWithCustom'
import { 
  formatPhone, 
  formatTimeString, 
  calculateAge, 
  calculateIMC 
} from '../utils/patientUtils'
import { 
  User, 
  Stethoscope, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Save, 
  Loader2
} from 'lucide-react'

interface PatientFormProps {
  onSuccess: (newPatientId: string) => void
  onCancel: () => void
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

export const PatientForm: React.FC<PatientFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal')

  // Aba 1 - Pessoal
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [dataInicioTratamento, setDataInicioTratamento] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [sexo, setSexo] = useState<'Feminino' | 'Masculino' | 'Outro' | ''>('')
  const [telefone, setTelefone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  // Aba 2 - Clínico
  const [pesoKg, setPesoKg] = useState<string>('')
  const [alturaCm, setAlturaCm] = useState<string>('')
  const [objetivos, setObjetivos] = useState<string[]>([])
  const [objetivoTexto, setObjetivoTexto] = useState('')
  const [nivelAtividade, setNivelAtividade] = useState('')
  const [patologias, setPatologias] = useState<string[]>([])
  const [restricoes, setRestricoes] = useState<string[]>([])
  const [alergias, setAlergias] = useState<string[]>([])
  const [medicamentos, setMedicamentos] = useState('')
  const [suplementos, setSuplementos] = useState('')

  // Aba 3 - Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('')
  const [horarioAcorda, setHorarioAcorda] = useState('')
  const [horarioDorme, setHorarioDorme] = useState('')
  const [litrosAgua, setLitrosAgua] = useState<string>('')
  const [praticaAtividadeFisica, setPraticaAtividadeFisica] = useState<boolean | null>(null)
  const [atividadeFisicaDescricao, setAtividadeFisicaDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Estados de submissão e feedback
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ nome?: string }>({})

  // Cálculos dinâmicos
  const idade = useMemo(() => calculateAge(dataNascimento), [dataNascimento])

  const parsedPeso = pesoKg ? parseFloat(pesoKg.replace(',', '.')) : null
  const parsedAltura = alturaCm ? parseFloat(alturaCm.replace(',', '.')) : null
  const imcInfo = useMemo(() => calculateIMC(parsedPeso, parsedAltura), [parsedPeso, parsedAltura])

  // Handlers de formatação
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value))
  }

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatPhone(e.target.value))
  }

  const handleHorarioAcordaBlur = () => {
    if (horarioAcorda) {
      setHorarioAcorda(formatTimeString(horarioAcorda))
    }
  }

  const handleHorarioDormeBlur = () => {
    if (horarioDorme) {
      setHorarioDorme(formatTimeString(horarioDorme))
    }
  }

  const handleToggleObjetivo = (obj: string) => {
    if (objetivos.includes(obj)) {
      setObjetivos(objetivos.filter((o) => o !== obj))
    } else {
      setObjetivos([...objetivos, obj])
    }
  }

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Regra: O único campo obrigatório é o nome completo
    if (!nome.trim()) {
      setFieldErrors({ nome: 'O nome completo é obrigatório.' })
      setActiveTab('pessoal')
      return
    }
    setFieldErrors({})

    if (!user?.id) {
      setErrorMessage('Usuário não autenticado. Por favor, faça login novamente.')
      return
    }

    setSaving(true)

    try {
      const newPatientData = {
        nutricionista_id: user.id,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        telefone: telefone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        peso_inicial: parsedPeso && !isNaN(parsedPeso) ? parsedPeso : null,
        altura: parsedAltura && !isNaN(parsedAltura) ? parsedAltura : null,
        objetivos: objetivos.length > 0 ? objetivos : null,
        objetivo_texto: objetivoTexto.trim() || null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologias.length > 0 ? patologias : null,
        restricoes_alimentares: restricoes.length > 0 ? restricoes : null,
        alergias: alergias.length > 0 ? alergias : null,
        medicamentos: medicamentos.trim() || null,
        suplementos: suplementos.trim() || null,
        refeicoes_por_dia: refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null,
        horario_acorda: horarioAcorda ? formatTimeString(horarioAcorda) : null,
        horario_dorme: horarioDorme ? formatTimeString(horarioDorme) : null,
        litros_agua: litrosAgua ? parseFloat(litrosAgua.replace(',', '.')) : null,
        atividade_fisica: praticaAtividadeFisica,
        atividade_fisica_descricao: praticaAtividadeFisica ? atividadeFisicaDescricao.trim() || null : null,
        observacoes: observacoes.trim() || null,
      }

      const insertRes = await (dataClient as any)
        .from('pacientes')
        .insert(newPatientData)
        .select('id')

      if (insertRes.error) {
        throw new Error(insertRes.error.message || 'Erro ao cadastrar paciente no banco.')
      }

      const createdPatient = insertRes.data && insertRes.data[0]
      const newId = createdPatient?.id

      // Regra Prompt 5: "Preciso que ao cadastrar o Paciente eu possa colocar a data de início do tratamento, essa data ficará registrada como a primeira consulta"
      if (newId && dataInicioTratamento) {
        await (dataClient as any)
          .from('consultas')
          .insert({
            paciente_id: newId,
            data_consulta: dataInicioTratamento,
            peso: parsedPeso && !isNaN(parsedPeso) ? parsedPeso : null,
            observacoes: 'Primeira consulta (início do tratamento)',
          })
      }

      setSuccessMessage('Paciente cadastrado com sucesso!')

      // Pequeno timeout para o usuário visualizar o feedback positivo e então redirecionar
      setTimeout(() => {
        if (newId) {
          onSuccess(newId)
        } else {
          onSuccess('')
        }
      }, 1000)
    } catch (err: any) {
      console.error('Erro ao salvar paciente:', err)
      setErrorMessage(err.message || 'Ocorreu um erro ao salvar o paciente. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
      {/* Topo / Voltar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Voltar para lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cadastrar Novo Paciente
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Preencha os dados do paciente. Apenas o nome completo é obrigatório.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-sm shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salvar Paciente</span>
            </>
          )}
        </button>
      </div>

      {/* Alertas */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm animate-fade-in font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage} Redirecionando para o perfil...</span>
        </div>
      )}

      {/* Navegação de Abas */}
      <div className="mt-8 border-b border-slate-200">
        <div className="flex gap-2 sm:gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('pessoal')}
            className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'pessoal'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Pessoal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'clinico'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>2. Clínico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habitos')}
            className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'habitos'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>3. Hábitos</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
          {/* ================= ABA 1: PESSOAL ================= */}
          {activeTab === 'pessoal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Informações Pessoais
                </h3>
                <p className="text-xs text-slate-500">
                  Dados básicos de identificação e contato do paciente.
                </p>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nome completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    if (fieldErrors.nome) setFieldErrors({})
                  }}
                  placeholder="Ex: Maria Silva Santos"
                  className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm ${
                    fieldErrors.nome
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
                {fieldErrors.nome && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">
                    {fieldErrors.nome}
                  </p>
                )}
              </div>

              {/* Data de Nascimento e Idade calculada */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Data de nascimento
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Idade (calculada automaticamente)
                  </label>
                  <div className="px-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold flex items-center justify-between">
                    <span>
                      {idade !== null ? `${idade} anos` : 'Aguardando data de nascimento'}
                    </span>
                    {idade !== null && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                        Calculada
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Início do tratamento <span className="text-xs text-emerald-600 font-normal">(1ª consulta)</span>
                  </label>
                  <input
                    type="date"
                    value={dataInicioTratamento}
                    onChange={(e) => setDataInicioTratamento(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                  />
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
                      onClick={() => setSexo(sexo === s ? '' : s)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer text-center ${
                        sexo === s
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contatos: Telefone, WhatsApp e Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    placeholder="(99) 9999-9999"
                    maxLength={15}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder="(99) 99999-9999"
                    maxLength={15}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@exemplo.com"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('clinico')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Próximo: Clínico →
                </button>
              </div>
            </div>
          )}

          {/* ================= ABA 2: CLÍNICO ================= */}
          {activeTab === 'clinico' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Avaliação Clínica & Diagnóstico
                </h3>
                <p className="text-xs text-slate-500">
                  Medidas antropométricas iniciais, patologias e histórico clínico.
                </p>
              </div>

              {/* Medidas: Peso, Altura e IMC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Peso atual
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="400"
                      value={pesoKg}
                      onChange={(e) => setPesoKg(e.target.value)}
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
                      min="30"
                      max="250"
                      value={alturaCm}
                      onChange={(e) => setAlturaCm(e.target.value)}
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
                    const isSelected = objetivos.includes(obj)
                    return (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => handleToggleObjetivo(obj)}
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
                  value={objetivoTexto}
                  onChange={(e) => setObjetivoTexto(e.target.value)}
                  placeholder="Objetivo adicional ou detalhes livres (ex: reduzir colesterol, correr 5k)..."
                  className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-xs"
                />
              </div>

              {/* Nível de atividade física */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nível de atividade física
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ACTIVITY_LEVEL_OPTIONS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNivelAtividade(nivelAtividade === level ? '' : level)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        nivelAtividade === level
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patologias ou condições de saúde */}
              <MultiSelectWithCustom
                label="Patologias ou condições de saúde"
                options={PATHOLOGY_OPTIONS}
                selected={patologias}
                onChange={setPatologias}
                hasNoneOption={true}
                customPlaceholder="Digite outra condição de saúde e pressione Enter..."
              />

              {/* Restrições alimentares */}
              <MultiSelectWithCustom
                label="Restrições alimentares"
                options={RESTRICTION_OPTIONS}
                selected={restricoes}
                onChange={setRestricoes}
                hasNoneOption={true}
                customPlaceholder="Digite outra restrição alimentar e pressione Enter..."
              />

              {/* Alergias alimentares */}
              <MultiSelectWithCustom
                label="Alergias alimentares"
                options={ALLERGY_OPTIONS}
                selected={alergias}
                onChange={setAlergias}
                hasNoneOption={true}
                customPlaceholder="Digite outra alergia alimentar e pressione Enter..."
              />

              {/* Medicamentos contínuos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Medicamentos contínuos
                </label>
                <textarea
                  rows={2}
                  value={medicamentos}
                  onChange={(e) => setMedicamentos(e.target.value)}
                  placeholder="Ex: Losartana 50mg (1x ao dia pela manhã)..."
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                />
              </div>

              {/* Suplementos em uso */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Suplementos em uso
                </label>
                <textarea
                  rows={2}
                  value={suplementos}
                  onChange={(e) => setSuplementos(e.target.value)}
                  placeholder="Ex: Creatina 5g, Vitamina D 2000UI..."
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('pessoal')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm cursor-pointer"
                >
                  ← Voltar para Pessoal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('habitos')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Próximo: Hábitos →
                </button>
              </div>
            </div>
          )}

          {/* ================= ABA 3: HÁBITOS ================= */}
          {activeTab === 'habitos' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Rotina & Hábitos Diários
                </h3>
                <p className="text-xs text-slate-500">
                  Padrões de sono, hidratação e atividades do cotidiano.
                </p>
              </div>

              {/* Refeições e Água */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Quantas refeições faz por dia
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={refeicoesPorDia}
                    onChange={(e) => setRefeicoesPorDia(e.target.value)}
                    placeholder="Ex: 4"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
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
                      min="0"
                      max="15"
                      value={litrosAgua}
                      onChange={(e) => setLitrosAgua(e.target.value)}
                      placeholder="Ex: 2.5"
                      className="w-full pl-4 pr-16 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                    />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                      litros
                    </span>
                  </div>
                </div>
              </div>

              {/* Horários: Acorda e Dorme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Horário que acorda
                  </label>
                  <input
                    type="text"
                    value={horarioAcorda}
                    onChange={(e) => setHorarioAcorda(e.target.value)}
                    onBlur={handleHorarioAcordaBlur}
                    placeholder="Ex: 6 (06:00) ou 630 (06:30)"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Converte automaticamente (ex: 6 vira 06:00, 630 vira 06:30).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Horário que dorme
                  </label>
                  <input
                    type="text"
                    value={horarioDorme}
                    onChange={(e) => setHorarioDorme(e.target.value)}
                    onBlur={handleHorarioDormeBlur}
                    placeholder="Ex: 23 (23:00) ou 2230 (22:30)"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Converte automaticamente (ex: 23 vira 23:00, 2230 vira 22:30).
                  </p>
                </div>
              </div>

              {/* Pratica atividade física (sim/não) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Pratica atividade física?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPraticaAtividadeFisica(true)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer text-center ${
                      praticaAtividadeFisica === true
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPraticaAtividadeFisica(false)
                      setAtividadeFisicaDescricao('')
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer text-center ${
                      praticaAtividadeFisica === false
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Não
                  </button>
                </div>

                {/* Se sim, abre campo de texto: qual atividade e frequência semanal */}
                {praticaAtividadeFisica === true && (
                  <div className="mt-3.5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 animate-fade-in">
                    <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                      Qual atividade física e frequência semanal?
                    </label>
                    <input
                      type="text"
                      value={atividadeFisicaDescricao}
                      onChange={(e) => setAtividadeFisicaDescricao(e.target.value)}
                      placeholder="Ex: Musculação 4x na semana, corrida aos sábados"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Observações gerais */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Observações gerais
                </label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Anotações gerais sobre o paciente, histórico de dietas, preferências..."
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('clinico')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm cursor-pointer"
                >
                  ← Voltar para Clínico
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-sm shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando paciente...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Finalizar e Salvar Paciente</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
