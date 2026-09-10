# Talleres360 — Frontend

SPA en React + Vite para la gestión de órdenes de trabajo. Corre en local y consume el backend (`talleres360-backend`).
Login con Microsoft Entra ID usando MSAL 5 (popup + `redirect.html`), siguiendo el tutorial del curso.

## Correr

```bash
npm install
cp .env.example .env.local   # completar IDs de Entra ID
npm run dev                  # http://localhost:5173
```

Después de cambiar `.env.local`, detener y volver a iniciar Vite.

| Variable | Origen |
|---|---|
| `VITE_ENTRA_TENANT_ID` | Entra ID > Información general > Id. de inquilino |
| `VITE_SPA_CLIENT_ID` | spa-fullstack > Id. de aplicación (cliente) |
| `VITE_API_CLIENT_ID` | api-fullstack > Id. de aplicación (cliente) |
| `VITE_API_BASE_URL` | Backend (hoy `http://localhost:8081`, luego AWS API Gateway) |

**Modo local:** si faltan los IDs de Entra ID, la pantalla de login lo avisa y permite entrar sin autenticación (solo desarrollo). Con los IDs completos, el login con Microsoft es obligatorio.

## Estructura

```
redirect.html            puente de retorno del popup de MSAL 5
src/auth/authConfig.js   configuración MSAL (clientId, authority, redirectUri, scope)
src/auth/token.js        acquireTokenSilent → fallback acquireTokenPopup
src/auth/AuthGate.jsx    muestra el login o la app; registra el token en http.js
src/auth/LoginPage.jsx   pantalla de login
src/api/http.js          fetch base + header Authorization: Bearer
src/api/ordersApi.js     llamadas a /api/orders
src/components/          filtros, tabla, detalle, formulario
```

## Azure (Entra ID)

En spa-fullstack, plataforma **Single-page application** con Redirect URIs `http://localhost:5173/redirect.html` y `http://localhost:5173`, y permiso delegado `api://<API_CLIENT_ID>/access_as_user`.
