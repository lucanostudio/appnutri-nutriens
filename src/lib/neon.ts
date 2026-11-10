import { createClient, BetterAuthVanillaAdapter } from '@neondatabase/neon-js'

export const NEON_AUTH_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_AUTH_URL) ||
  'https://ep-jolly-field-b6ue5nvr.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth'

export const NEON_DATA_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_DATA_API_URL) ||
  'https://ep-jolly-field-b6ue5nvr.apirest.c-2.sa-east-1.aws.neon.tech/neondb/rest/v1'

// Cria o adaptador BetterAuth integrado do @neondatabase/neon-js
const authAdapter = BetterAuthVanillaAdapter()

// Cliente Neon unificado (Auth + Data API com JWT automático)
export const neon = createClient({
  auth: {
    url: NEON_AUTH_URL,
    adapter: authAdapter,
  },
  dataApi: {
    url: NEON_DATA_API_URL,
  },
})

// Exporta o authClient e dataClient diretamente do neon
export const authClient = neon.auth
export const dataClient = neon
