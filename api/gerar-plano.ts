import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { PlanoSemanalResponse } from '../src/types/patient'

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    plano_semanal: {
      type: SchemaType.ARRAY,
      description: 'Plano alimentar para os 7 dias da semana (Segunda-feira a Domingo)',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          dia: {
            type: SchemaType.STRING,
            description: 'Nome do dia da semana (ex: Segunda-feira)',
          },
          refeicoes: {
            type: SchemaType.OBJECT,
            properties: {
              cafe_da_manha: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '5 opções para o café da manhã',
              },
              lanche_manha: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '5 opções para o lanche da manhã',
              },
              almoco: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '5 opções para o almoço',
              },
              lanche_tarde: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '5 opções para o lanche da tarde',
              },
              jantar: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '5 opções para o jantar',
              },
            },
            required: ['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar'],
          },
        },
        required: ['dia', 'refeicoes'],
      },
    },
  },
  required: ['plano_semanal'],
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuração de CORS se necessário
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('ERRO: GEMINI_API_KEY não foi configurada nas variáveis de ambiente.')
    return res.status(500).json({
      error: 'Chave de API do Gemini não configurada no servidor.',
    })
  }

  try {
    const { paciente } = req.body || {}

    if (!paciente || !paciente.nome) {
      return res.status(400).json({ error: 'Dados do paciente ausentes ou inválidos.' })
    }

    // Formata o resumo do paciente para o prompt
    const dadosPacienteFormatados = `
- Nome: ${paciente.nome}
- Sexo: ${paciente.sexo || 'Não informado'}
- Idade: ${paciente.idade ? `${paciente.idade} anos` : 'Não informada'}
- Peso atual: ${paciente.peso_inicial ? `${paciente.peso_inicial} kg` : 'Não informado'}
- Altura: ${paciente.altura ? `${paciente.altura} cm` : 'Não informada'}
- Objetivos: ${Array.isArray(paciente.objetivos) ? paciente.objetivos.join(', ') : 'Não informado'} ${paciente.objetivo_texto ? `(${paciente.objetivo_texto})` : ''}
- Nível de atividade física: ${paciente.nivel_atividade || 'Não informado'}
- Atividade física praticada: ${paciente.atividade_fisica ? paciente.atividade_fisica_descricao || 'Sim' : 'Não'}
- Patologias/Condições de saúde: ${Array.isArray(paciente.patologias) ? paciente.patologias.join(', ') : 'Nenhuma informada'}
- Restrições alimentares: ${Array.isArray(paciente.restricoes_alimentares) ? paciente.restricoes_alimentares.join(', ') : 'Nenhuma'}
- Alergias alimentares: ${Array.isArray(paciente.alergias) ? paciente.alergias.join(', ') : 'Nenhuma'}
- Medicamentos em uso: ${paciente.medicamentos || 'Nenhum'}
- Suplementos: ${paciente.suplementos || 'Nenhum'}
- Refeições ao dia: ${paciente.refeicoes_por_dia || '5'}
- Consumo diário de água: ${paciente.litros_agua ? `${paciente.litros_agua} litros` : 'Não informado'}
- Horário da rotina: Acorda às ${paciente.horario_acorda || '07:00'} e dorme às ${paciente.horario_dorme || '23:00'}
- Observações adicionais: ${paciente.observacoes || 'Nenhuma'}
`.trim()

    const promptInterno = `Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${dadosPacienteFormatados}

# Regras Críticas de Execução:
- Você deve responder APENAS e estritamente o objeto JSON solicitado.
- Não inclua blocos de código markdown (como \`\`\`json ... \`\`\`), explicações, introduções ou textos complementares.
- Adapte o cardápio rigorosamente a quaisquer alergias ou restrições descritas nos dados.
- Utilize alimentos comuns, acessíveis e culturalmente aceitos no Brasil.
- Evite repetições monótonas de alimentos nos dias seguidos.

O formato do JSON retornado deve seguir exatamente esta estrutura:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    }
  ]
}`

    const genAI = new GoogleGenerativeAI(apiKey)

    // Usar gemini-2.5-flash ou gemini-1.5-flash com fallback
    // Conforme o prompt solicita gemini-3.8-flash ou superior; no Gen AI SDK atual testamos os modelos disponíveis
    const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro']
    let lastError: any = null
    let resultJson: any = null

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema as any,
            temperature: 0.7,
          },
        })

        const result = await model.generateContent(promptInterno)
        const responseText = result.response.text()

        // Trata parsing e possíveis quebras
        try {
          resultJson = JSON.parse(responseText)
        } catch {
          // Remove possíveis backticks se a IA escapar markdown
          const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
          resultJson = JSON.parse(cleaned)
        }

        if (resultJson && resultJson.plano_semanal && Array.isArray(resultJson.plano_semanal)) {
          break
        }
      } catch (err: any) {
        console.warn(`Tentativa com modelo ${modelName} falhou:`, err.message)
        lastError = err
      }
    }

    if (!resultJson || !resultJson.plano_semanal) {
      throw lastError || new Error('Não foi possível gerar um JSON válido com o Gemini.')
    }

    return res.status(200).json(resultJson)
  } catch (error: any) {
    console.error('Erro na geração do plano com Gemini:', error)
    return res.status(500).json({
      error: error.message || 'Erro interno ao processar a geração com IA.',
    })
  }
}

