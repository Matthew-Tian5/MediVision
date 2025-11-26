import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 1. Load .env files (for local development)
    const env = loadEnv(mode, '.', '');
    
    // 2. CHECK BOTH SOURCES: .env file OR System Environment (GitHub Secrets)
    // This is the critical fix.
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true, 
      },
      plugins: [react()],
      define: {
        // 3. Inject the key we found into the app
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});