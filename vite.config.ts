import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Replace process.env.API_KEY with the actual value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env to empty object to prevent "process is not defined" crashes
      'process.env': {} 
    }
  }
})