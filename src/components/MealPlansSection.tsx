import React, { useState, useEffect } from 'react'
import { Paciente, PlanoAlimentar, PlanoSemanalResponse, DiaPlano } from '../types/patient'
import { createDefaultWeeklyPlan } from '../utils/defaultPlan'
import { 
  Sparkles, 
  Save, 
  Calendar, 
  FileText, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2, 
  Coffee, 
  Apple, 
  Utensils, 
  Sun, 
  Moon,
  Edit3
} from 'lucide-react'

interface MealPlansSectionProps {
  patient: Paciente
  planos: PlanoAlimentar[]
  onSavePlan: (conteudo: any) => Promise<void>
}

const MEAL_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  cafe_da_manha: { label: 'Café da Manhã', icon: Coffee, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  lanche_manha: { label: 'Lanche da Manhã', icon: Apple, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  almoco: { label: 'Almoço', icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  lanche_tarde: { label: 'Lanche da Tarde', icon: Sun, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  jantar: { label: 'Jantar', icon: Moon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
}

export const MealPlansSection: React.FC<MealPlansSectionProps> = ({
  patient,
  planos,
  onSavePlan,
}) => {
  // Estado do plano atualmente em edição/gerado
  const [currentPlan, setCurrentPlan] = useState<PlanoSemanalResponse | null>(null)
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0)

  // Loading dinâmico com mensagens alternadas
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Buscando dados do paciente...')
  
  // Persistência
  const [isSaving, setIsSaving] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [errorToast, setErrorToast] = useState<string | null>(null)

  // Histórico expandido
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null)

  // Ciclo de mensagens dinâmicas durante o loading da IA
  useEffect(() => {
    if (!isGenerating) return

    const messages = [
      'Buscando dados do paciente...',
      'Analisando objetivos e restrições alimentares...',
      'IA calculando cardápio saudável...',
      'Estruturando plano semanal balanceado...',
      'Finalizando distribuição de refeições...',
    ]
    let msgIndex = 0
    setLoadingMessage(messages[0])

    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length
      setLoadingMessage(messages[msgIndex])
    }, 2400)

    return () => clearInterval(interval)
  }, [isGenerating])

  // Gerar Plano com IA chamando a serverless function /api/gerar-plano
  const handleGenerateWithAI = async () => {
    setIsGenerating(true)
    setErrorToast(null)
    setSuccessToast(null)

    try {
      const response = await fetch('/api/gerar-plano', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paciente: patient }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()

      // Validação de formato
      if (!data || !data.plano_semanal || !Array.isArray(data.plano_semanal)) {
        throw new Error('A IA gerou uma resposta em formato inválido.')
      }

      setCurrentPlan(data)
      setActiveDayIndex(0)
      setSuccessToast('Plano alimentar gerado com sucesso pela IA! Revise e ajuste abaixo.')
    } catch (err: any) {
      console.error('Falha ao gerar com IA:', err)
      setErrorToast(
        'Não foi possível gerar o plano com IA no momento. Deseja tentar novamente ou criar um Plano Manual?'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // Criar Plano Manual seguindo as regras do sistema
  const handleCreateManualPlan = () => {
    const defaultPlan = createDefaultWeeklyPlan()
    setCurrentPlan(defaultPlan)
    setActiveDayIndex(0)
    setErrorToast(null)
    setSuccessToast('Plano manual criado! Você pode personalizar todas as opções abaixo.')
  }

  // Atualizar input específico de uma refeição
  const handleMealOptionChange = (
    dayIndex: number,
    mealKey: keyof DiaPlano['refeicoes'],
    optionIndex: number,
    value: string
  ) => {
    if (!currentPlan) return

    setCurrentPlan((prev) => {
      if (!prev) return null
      const updatedDays = [...prev.plano_semanal]
      const currentDay = { ...updatedDays[dayIndex] }
      const currentMeals = { ...currentDay.refeicoes }
      const currentOptions = [...currentMeals[mealKey]]

      currentOptions[optionIndex] = value
      currentMeals[mealKey] = currentOptions
      currentDay.refeicoes = currentMeals
      updatedDays[dayIndex] = currentDay

      return { ...prev, plano_semanal: updatedDays }
    })
  }

  // Persistir o plano alimentar no Neon
  const handleSavePlan = async () => {
    if (!currentPlan) return
    setIsSaving(true)
    setErrorToast(null)

    try {
      await onSavePlan(currentPlan)
      setSuccessToast('Plano alimentar salvo com sucesso no histórico!')
      setCurrentPlan(null) // Volta ao modo de exibição
    } catch (err: any) {
      console.error('Erro ao salvar plano:', err)
      setErrorToast(err.message || 'Erro ao persistir o plano alimentar no banco de dados.')
    } finally {
      setIsSaving(false)
    }
  }

  // Dias da semana do plano ativo
  const activeDay = currentPlan?.plano_semanal[activeDayIndex]

  return (
    <div className="space-y-6">
      {/* Banner de Ação / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200/80 rounded-2xl shadow-xs">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Geração Automatizada de Planos com IA</span>
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            A inteligência artificial analisa metas ({patient.objetivos?.join(', ') || 'geral'}), restrições alimentares e hábitos do paciente para formular um cardápio semanal completo.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCreateManualPlan}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            Plano Manual
          </button>

          <button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-sm shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Gerando com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>✨ Gerar Plano com IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Visual com Mensagens Dinâmicas */}
      {isGenerating && (
        <div className="p-8 bg-white border border-emerald-200 rounded-2xl shadow-xs flex flex-col items-center justify-center text-center animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
            <Sparkles className="w-7 h-7 animate-spin" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {loadingMessage}
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Conectando com o modelo Gemini para criar um cardápio 100% sob medida para {patient.nome}.
          </p>
        </div>
      )}

      {/* Toast de Sucesso */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Toast / Alerta de Erro e Resiliência com Opção de Tentar Novamente ou Criar Manual */}
      {errorToast && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorToast}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGenerateWithAI}
              className="px-3 py-1 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold rounded-lg cursor-pointer transition-colors"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={handleCreateManualPlan}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
            >
              Criar Plano Manual
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* INTERFACE DE EDIÇÃO INTERATIVA (FORMATO DE ABAS POR DIA)       */}
      {/* ============================================================== */}
      {currentPlan && !isGenerating && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Edição do Plano Semanal
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  Modo Edição
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Alterne entre os dias da semana nas abas abaixo para editar qualquer opção antes de salvar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPlan(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar Edição
              </button>

              {/* Persistência: "Salvar Plano Alimentar" só visível se houver plano gerado/carregado */}
              <button
                type="button"
                onClick={handleSavePlan}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Plano Alimentar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Abas dos Dias da Semana */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
            {currentPlan.plano_semanal.map((dia, idx) => {
              const isSelected = activeDayIndex === idx
              return (
                <button
                  key={dia.dia}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dia.dia}
                </button>
              )
            })}
          </div>

          {/* Refeições do Dia Ativo - 5 inputs para cada refeição */}
          {activeDay && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-emerald-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Cardápio de {activeDay.dia}</span>
                </span>
                <span className="text-xs text-slate-400">
                  5 opções por refeição • Editáveis individualmente
                </span>
              </div>

              <div className="space-y-5">
                {(Object.keys(MEAL_LABELS) as Array<keyof DiaPlano['refeicoes']>).map((mealKey) => {
                  const mealMeta = MEAL_LABELS[mealKey]
                  const Icon = mealMeta.icon
                  const options = activeDay.refeicoes[mealKey] || []

                  return (
                    <div
                      key={mealKey}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${mealMeta.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h5 className="text-sm font-bold text-slate-800">
                          {mealMeta.label}
                        </h5>
                      </div>

                      {/* 5 inputs para as opções da refeição */}
                      <div className="space-y-2">
                        {options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
                              #{optIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                handleMealOptionChange(
                                  activeDayIndex,
                                  mealKey,
                                  optIdx,
                                  e.target.value
                                )
                              }
                              placeholder={`Opção ${optIdx + 1} para ${mealMeta.label}...`}
                              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Botão de Salvar no rodapé da edição */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Todas as alterações em todos os dias serão gravadas juntas.
                </span>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no banco...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Plano Alimentar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* HISTÓRICO DE PLANOS ALIMENTARES SALVOS                         */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pt-2">
          <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Histórico de Planos Salvos ({planos.length})</span>
          </h4>
          <span className="text-xs text-slate-400">
            Mais recentes primeiro
          </span>
        </div>

        {planos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h5 className="text-base font-bold text-slate-800">
              Nenhum plano alimentar gerado ainda
            </h5>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Clique em &quot;✨ Gerar Plano com IA&quot; acima para criar o primeiro cardápio semanal completo deste paciente.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {planos.map((plano) => {
              const isExpanded = expandedPlanId === plano.id
              const conteudo = plano.conteudo as PlanoSemanalResponse

              return (
                <div key={plano.id} className="p-5">
                  <div
                    onClick={() => setExpandedPlanId(isExpanded ? null : plano.id)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                            Plano Alimentar Semanal
                          </p>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Salvo
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Gerado em:{' '}
                          <strong className="text-slate-600 font-medium">
                            {new Date(plano.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Carrega o plano histórico no editor para ajustes rápidos
                          if (conteudo?.plano_semanal) {
                            setCurrentPlan(conteudo)
                            setActiveDayIndex(0)
                            window.scrollTo({ top: 300, behavior: 'smooth' })
                          }
                        }}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Carregar no Editor</span>
                      </button>

                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <span>{isExpanded ? 'Ocultar' : 'Ver cardápio'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visualização Completa do Cardápio ao Expandir */}
                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-slate-100 animate-fade-in space-y-4">
                      {conteudo?.plano_semanal && Array.isArray(conteudo.plano_semanal) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {conteudo.plano_semanal.map((dia) => (
                            <div
                              key={dia.dia}
                              className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="font-extrabold text-emerald-800 text-sm">
                                  {dia.dia}
                                </span>
                              </div>

                              {(Object.keys(MEAL_LABELS) as Array<keyof DiaPlano['refeicoes']>).map((mk) => {
                                const m = MEAL_LABELS[mk]
                                const items = dia.refeicoes[mk] || []
                                return (
                                  <div key={mk} className="space-y-1">
                                    <span className="font-bold text-slate-700 block text-[11px]">
                                      {m.label}:
                                    </span>
                                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                                      {items.map((opt, i) => (
                                        <li key={i} className="truncate">
                                          {opt}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap">
                          {typeof plano.conteudo === 'string'
                            ? plano.conteudo
                            : JSON.stringify(plano.conteudo, null, 2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
