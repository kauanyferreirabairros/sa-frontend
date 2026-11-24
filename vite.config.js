import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiUrl = env.VITE_API_URL?.trim()

  if (mode === 'production') {
    if (!apiUrl) throw new Error('Defina VITE_API_URL com a URL HTTPS da API para gerar o build de produção.')

    let parsedUrl
    try {
      parsedUrl = new URL(apiUrl)
    } catch {
      throw new Error('VITE_API_URL precisa ser uma URL HTTPS válida.')
    }

    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname === 'localhost') {
      throw new Error('VITE_API_URL em produção deve usar HTTPS e não pode apontar para localhost.')
    }
  }

  return {
    plugins: [react()],
  }
})
