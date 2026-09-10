# Talleres360 — Frontend

SPA en React + Vite para la gestión de órdenes de trabajo. Corre en local y consume el backend (`talleres360-backend`).

## Correr

```bash
npm install
cp .env.example .env   # ajustar VITE_API_URL si hace falta
npm run dev            # http://localhost:5173
```

## Estructura

```
src/api/http.js          fetch base: URL desde VITE_API_URL + header Authorization (token de MSAL)
src/api/ordersApi.js     llamadas a /api/orders
src/constants/           estados de la orden y transiciones permitidas
src/components/          filtros, tabla, detalle, formulario
```

## Azure (Entra ID)

Registrar la app como plataforma **Single-page application** con Redirect URI `http://localhost:5173`.
El siguiente paso es agregar `@azure/msal-react` y registrar el proveedor de token con `setTokenProvider` en `src/api/http.js`.
