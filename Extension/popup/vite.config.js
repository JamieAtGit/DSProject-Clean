import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',         // optional: where Vite should output built files
    sourcemap: true,        // ✅ enable source maps
    emptyOutDir: true
  }
})
