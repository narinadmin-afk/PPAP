import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: {
    host: true,
    port: 3000,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
  },
})