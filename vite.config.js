import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// BASE is set by the deploy workflow to "/<repo>/" for GitHub Pages
export default defineConfig({
  base: process.env.BASE || '/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
})
