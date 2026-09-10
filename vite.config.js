import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Puerto fijo: debe coincidir con el Redirect URI de la app SPA en Azure (http://localhost:5173)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
