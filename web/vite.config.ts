import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the built site works from any static host (GitHub Pages, file open via preview)
export default defineConfig({
  plugins: [react()],
  base: './',
})
