import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Origins allowed to iframe /embed/* pages. Extend for production domains.
const EMBED_FRAME_ORIGINS = [
  "'self'",
  'http://localhost:3000',
  'https://kadchmaportal.com',
  'https://www.kadchmaportal.com',
].join(' ');

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Allow framing only from listed origins; apply to all routes because
      // the embed route is a standard SPA route (same index.html).
      'Content-Security-Policy': `frame-ancestors ${EMBED_FRAME_ORIGINS}`,
    },
  },
})
