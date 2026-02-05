import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const configPath = path.resolve(__dirname, '..', 'config.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

const backendHost = process.env.BACKEND_HOST || config.server.host || '127.0.0.1'
const backendPort = Number(process.env.BACKEND_PORT || config.server.port || 3000)
const frontendPort = Number(process.env.VITE_PORT || config.frontend.port || 5173)

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: frontendPort,
    proxy: {
      '/api': {
        target: `http://${backendHost}:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
})
