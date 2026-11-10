import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { apiServerPlugin } from './vite-api-plugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY

  return {
    plugins: [react(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  }
})
