import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH = /nom-du-depot/ pour GitHub Pages ; / en local.
export default defineConfig({
  plugins: [react()],
  base: '/LifeTrack-Training-Test/',
})
