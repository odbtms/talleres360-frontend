import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Puerto fijo: debe coincidir con los Redirect URI de spa-fullstack en Entra ID.
// Multipágina: redirect.html (puente de MSAL) también debe quedar en el build.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        redirect: fileURLToPath(new URL('./redirect.html', import.meta.url)),
      },
    },
  },
});
