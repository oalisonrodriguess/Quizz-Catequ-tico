import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do .env com base no modo (production, development)
  // O terceiro parâmetro '' carrega todas as variáveis, não apenas as com prefixo VITE_
  // FIX: Cast `process` to `any` to resolve a TypeScript type error for `cwd`.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Expõe as variáveis de ambiente para o código do cliente de forma segura
      // Isso substitui `process.env` por um objeto contendo as variáveis carregadas
      'process.env': JSON.stringify(env)
    }
  }
})
