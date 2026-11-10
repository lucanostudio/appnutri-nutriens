import React, { useState, useId } from 'react'
import { Plus, X } from 'lucide-react'

interface MultiSelectWithCustomProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  hasNoneOption?: boolean
  customPlaceholder?: string
}

export const MultiSelectWithCustom: React.FC<MultiSelectWithCustomProps> = ({
  label,
  options,
  selected,
  onChange,
  hasNoneOption = true,
  customPlaceholder = 'Adicionar outro item e pressionar Enter...',
}) => {
  const inputId = useId()
  const [customInput, setCustomInput] = useState('')

  const handleToggle = (opt: string) => {
    if (opt === 'Nenhum') {
      if (selected.includes('Nenhum')) {
        onChange([])
      } else {
        onChange(['Nenhum'])
      }
      return
    }

    // Se clicar em qualquer outra opção, remove "Nenhum" se presente
    const withoutNone = selected.filter((item) => item !== 'Nenhum')
    if (withoutNone.includes(opt)) {
      onChange(withoutNone.filter((item) => item !== opt))
    } else {
      onChange([...withoutNone, opt])
    }
  }

  const handleAddCustom = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()

    const trimmed = customInput.trim()
    if (!trimmed) return

    const withoutNone = selected.filter((item) => item !== 'Nenhum')
    if (!withoutNone.includes(trimmed)) {
      onChange([...withoutNone, trimmed])
    }
    setCustomInput('')
  }

  const handleRemoveItem = (itemToRemove: string) => {
    onChange(selected.filter((item) => item !== itemToRemove))
  }

  // Identificar itens que foram adicionados pelo campo livre (não estão nas opções padrão nem são "Nenhum")
  const customItems = selected.filter(
    (item) => item !== 'Nenhum' && !options.includes(item)
  )

  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {/* Opções pré-definidas */}
      <div className="flex flex-wrap gap-2">
        {hasNoneOption && (
          <button
            type="button"
            onClick={() => handleToggle('Nenhum')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              selected.includes('Nenhum')
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Nenhum
          </button>
        )}

        {options.map((opt) => {
          const isSelected = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleToggle(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Itens adicionados livremente */}
      {customItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {customItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item)}
                className="hover:text-rose-600 cursor-pointer"
                aria-label={`Remover ${item}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input para adicionar livremente */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id={inputId}
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleAddCustom}
          placeholder={customPlaceholder}
          className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          disabled={!customInput.trim()}
          className="px-3 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-medium rounded-lg text-xs border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar</span>
        </button>
      </div>
    </div>
  )
}

