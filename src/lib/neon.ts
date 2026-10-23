import { createAuthClient } from '@neondatabase/neon-js/auth'
import { createClient } from '@neondatabase/neon-js'

export const NEON_AUTH_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_AUTH_URL) ||
  'https://ep-jolly-field-b6ue5nvr.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth'

export const NEON_DATA_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_DATA_API_URL) ||
  'https://ep-jolly-field-b6ue5nvr.apirest.c-2.sa-east-1.aws.neon.tech/neondb/rest/v1'

// Cliente Neon Auth
export const authClient = createAuthClient(NEON_AUTH_URL)

// Cliente Neon Data API
export const dataClient = createClient(NEON_DATA_API_URL, {
  auth: {
    adapter: (authClient as any).adapter || authClient,
  } as any,
})
