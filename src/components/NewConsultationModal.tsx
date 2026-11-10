import React, { useState } from 'react'
import { X, Calendar, Weight, Ruler, Percent, FileText, Loader2, Save } from 'lucide-react'

interface NewConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (consultationData: {
    data_consulta: string
    peso?: number | null
    cintura?: number | null
    quadril?: number | null
    percentual_gordura?: number | null
    observacoes?: string | null
    proximo_retorno?: string | null
  }) => Promise<void>
}

export const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [dataConsulta, setDataConsulta] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [peso, setPeso] = useState('')
  const [cintura, setCintura] = useState('')
  const [quadril, setQuadril] = useState('')
  const [percentualGordura, setPercentualGordura] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [proximoRetorno, setProximoRetorno] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!dataConsulta) {
      setError('A data da consulta é obrigatória.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        data_consulta: dataConsulta,
        peso: peso ? parseFloat(peso.replace(',', '.')) : null,
        cintura: cintura ? parseFloat(cintura.replace(',', '.')) : null,
        quadril: quadril ? parseFloat(quadril.replace(',', '.')) : null,
        percentual_gordura: percentualGordura
          ? parseFloat(percentualGordura.replace(',', '.'))
          : null,
        observacoes: observacoes.trim() || null,
        proximo_retorno: proximoRetorno || null,
      })
      onClose()
    } catch (err: any) {
      console.error('Erro ao salvar consulta:', err)
      setError(err.message || 'Erro ao registrar consulta. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Registrar Nova Consulta
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Insira as medições antropométricas e notas do atendimento.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Data da consulta */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data da consulta <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="date"
              required
              value={dataConsulta}
              onChange={(e) => setDataConsulta(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Peso e Gordura */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Peso atual</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="400"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 72.5"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                  kg
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                <span>% de gordura (opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="80"
                  value={percentualGordura}
                  onChange={(e) => setPercentualGordura(e.target.value)}
                  placeholder="Ex: 22.0"
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Cintura e Quadril */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cintura (opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="250"
                  value={cintura}
                  onChange={(e) => setCintura(e.target.value)}
                  placeholder="Ex: 80"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                  cm
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quadril (opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="250"
                  value={quadril}
                  onChange={(e) => setQuadril(e.target.value)}
                  placeholder="Ex: 98"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                  cm
                </span>
              </div>
            </div>
          </div>

          {/* Próximo retorno */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Próximo retorno (seletor de data)</span>
            </label>
            <input
              type="date"
              value={proximoRetorno}
              onChange={(e) => setProximoRetorno(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Observações da consulta</span>
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Queixas, evolução da dieta, exames laboratoriais avaliados..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando consulta...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar consulta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

