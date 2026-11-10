// Formatação de telefone / celular / WhatsApp: (99) 99999-9999 ou (99) 9999-9999
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

// Formatação inteligente de hora:
// ex: 6 -> "06:00", 630 -> "06:30", 23 -> "23:00", 2230 -> "22:30", 0 -> "00:00"
export function formatTimeString(input: string): string {
  const cleaned = input.trim()
  if (!cleaned) return ''

  // Se já tem :, normaliza
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':')
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1] || '0', 10)
    if (isNaN(h)) return ''
    const validH = Math.min(23, Math.max(0, h))
    const validM = isNaN(m) ? 0 : Math.min(59, Math.max(0, m))
    return `${String(validH).padStart(2, '0')}:${String(validM).padStart(2, '0')}`
  }

  const digits = cleaned.replace(/\D/g, '')
  if (!digits) return ''

  if (digits.length === 1 || digits.length === 2) {
    const h = Math.min(23, Math.max(0, parseInt(digits, 10)))
    return `${String(h).padStart(2, '0')}:00`
  }

  if (digits.length === 3) {
    // Ex: 630 -> 06:30
    const h = Math.min(23, Math.max(0, parseInt(digits.slice(0, 1), 10)))
    const m = Math.min(59, Math.max(0, parseInt(digits.slice(1, 3), 10)))
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  // 4 ou mais dígitos: 2230 -> 22:30
  const h = Math.min(23, Math.max(0, parseInt(digits.slice(0, 2), 10)))
  const m = Math.min(59, Math.max(0, parseInt(digits.slice(2, 4), 10)))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Cálculo de idade a partir de data de nascimento (YYYY-MM-DD)
export function calculateAge(birthDateStr: string): number | null {
  if (!birthDateStr) return null
  const birth = new Date(birthDateStr)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

// Cálculo de IMC a partir de peso (kg) e altura (cm)
export function calculateIMC(weightKg: number | null | undefined, heightCm: number | null | undefined): {
  imc: number
  classification: string
  colorClass: string
} | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null
  const heightM = heightCm / 100
  const imc = parseFloat((weightKg / (heightM * heightM)).toFixed(1))

  let classification = 'Eutrofia (Peso adequado)'
  let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200'

  if (imc < 18.5) {
    classification = 'Abaixo do peso'
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200'
  } else if (imc >= 18.5 && imc < 25) {
    classification = 'Peso adequado'
    colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200'
  } else if (imc >= 25 && imc < 30) {
    classification = 'Sobrepeso'
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200'
  } else if (imc >= 30 && imc < 35) {
    classification = 'Obesidade Grau I'
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200'
  } else if (imc >= 35 && imc < 40) {
    classification = 'Obesidade Grau II'
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200'
  } else {
    classification = 'Obesidade Grau III'
    colorClass = 'text-rose-800 bg-rose-100 border-rose-300'
  }

  return { imc, classification, colorClass }
}

