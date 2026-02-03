import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load configuration from central config file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const serverHost = process.env.HOST || config.server.host || 'localhost';
const serverPort = process.env.PORT || config.server.port || 3000;
const frontendPort = process.env.VITE_PORT || config.frontend.port || 5173;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: frontendPort,
    proxy: {
      '/api': {
        target: `http://${serverHost}:${serverPort}`,
        changeOrigin: true,
      },
    },
  },
})
