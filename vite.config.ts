import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/a': 'http://localhost:8080',
      '/r': 'http://localhost:8080'
    }
  }
})
