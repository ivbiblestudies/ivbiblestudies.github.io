import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so the built SPA works from any GitHub Pages sub-path
// (e.g. https://user.github.io/fable/) without extra configuration.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist', sourcemap: false },
})
