import React, { useState } from 'react'
import { Consulta } from '../types/patient'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface WeightEvolutionChartProps {
  consultas: Consulta[]
}

export const WeightEvolutionChart: React.FC<WeightEvolutionChartProps> = ({ consultas }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Filtrar apenas consultas com data e peso definidos, ordenadas cronologicamente ascendente para o gráfico
  const dataPoints = [...consultas]
    .filter((c) => c.peso !== null && c.peso !== undefined && !isNaN(Number(c.peso)))
    .sort((a, b) => (a.data_consulta > b.data_consulta ? 1 : -1))

  if (dataPoints.length === 0) {
    return (
      <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Nenhuma consulta registrada ainda
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Assim que consultas com pesagem forem registradas, o gráfico de evolução de peso aparecerá aqui.
        </p>
      </div>
    )
  }

  const weights = dataPoints.map((d) => Number(d.peso))
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  
  // Margem de visualização vertical
  const range = maxWeight - minWeight
  const yPadding = range === 0 ? 5 : Math.max(2, range * 0.15)
  const yMin = Math.max(0, Math.floor(minWeight - yPadding))
  const yMax = Math.ceil(maxWeight + yPadding)
  const yTotal = yMax - yMin || 1

  // Dimensões do SVG
  const width = 800
  const height = 260
  const padLeft = 55
  const padRight = 35
  const padTop = 30
  const padBottom = 45
  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom

  // Coordenadas dos pontos
  const points = dataPoints.map((d, index) => {
    const x = dataPoints.length === 1 
      ? padLeft + chartW / 2 
      : padLeft + (index / (dataPoints.length - 1)) * chartW
    const yVal = Number(d.peso)
    const y = padTop + chartH - ((yVal - yMin) / yTotal) * chartH
    return {
      x,
      y,
      peso: yVal,
      data: d.data_consulta,
      proximoRetorno: d.proximo_retorno,
      observacoes: d.observacoes,
    }
  })

  // Montar path SVG
  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`
  }, '')

  // Área preenchida com gradiente verde
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`
    : ''

  // Cálculo de variação total
  const firstW = weights[0]
  const lastW = weights[weights.length - 1]
  const weightDiff = lastW - firstW
  const isLoss = weightDiff < 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Evolução de Peso ao Longo do Tempo</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Histórico contínuo baseado nas pesagens registradas em consulta
          </p>
        </div>

        {/* Resumo de variação */}
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
          <div className="text-xs">
            <span className="text-slate-400">Início: </span>
            <strong className="text-slate-700">{firstW} kg</strong>
          </div>
          <span className="text-slate-300">→</span>
          <div className="text-xs">
            <span className="text-slate-400">Atual: </span>
            <strong className="text-slate-900">{lastW} kg</strong>
          </div>
          {weightDiff !== 0 && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-md ${
                isLoss
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isLoss ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              <span>{Math.abs(weightDiff).toFixed(1)} kg</span>
            </span>
          )}
          {weightDiff === 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
              <Minus className="w-3 h-3" />
              <span>Estável</span>
            </span>
          )}
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] select-none"
        >
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linhas de grade horizontais e rótulos do eixo Y */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + chartH * pct
            const val = (yMax - pct * yTotal).toFixed(0)
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-semibold"
                >
                  {val} kg
                </text>
              </g>
            )
          })}

          {/* Área sombreada sob a linha */}
          {points.length > 1 && (
            <path d={areaD} fill="url(#weightGradient)" />
          )}

          {/* Linha principal de tendência */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Pontos clicáveis / com hover */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx
            const [, month, day] = pt.data.split('-')
            const dateStr = `${day}/${month}`

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all"
              >
                {/* Linha vertical tracejada do ponto até o eixo X quando hovered */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={padTop + chartH}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Halo do ponto */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 9 : 6}
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  className="transition-all"
                />

                {/* Ponto central */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4 : 2.5}
                  fill="#059669"
                  className="transition-all"
                />

                {/* Rótulo de peso acima do ponto */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-bold ${
                    isHovered ? 'fill-emerald-800' : 'fill-slate-700'
                  }`}
                >
                  {pt.peso} kg
                </text>

                {/* Rótulo da data no eixo X */}
                <text
                  x={pt.x}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold ${
                    isHovered ? 'fill-emerald-700 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {dateStr}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Tooltip detalhado quando um ponto estiver em foco */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-950 animate-fade-in">
          <div>
            <span className="font-bold">Consulta em: </span>
            {new Date(points[hoveredIndex].data).toLocaleDateString('pt-BR')}
            <span className="mx-2">•</span>
            <span className="font-bold">Peso registrado: </span>
            {points[hoveredIndex].peso} kg
          </div>
          {points[hoveredIndex].observacoes && (
            <div className="text-slate-600 truncate max-w-md italic">
              &quot;{points[hoveredIndex].observacoes}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
