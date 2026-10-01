# Talleres360 — frontend

Cliente React + TypeScript + Vite. Tiene portada pública, selección de mantenciones/arreglos o diagnóstico, agenda autenticada de cinco pasos, historial del cliente, y panel de órdenes para Operador/Admin. El login usa Microsoft Entra ID con MSAL; la API se consume **siempre a través del BFF**, directamente en local o a través de API Gateway en AWS.

```text
Navegador (Vite :5173) → API Gateway /dev (AWS) → BFF :8080 → orders :8081
                                                      ├────────→ catalog :8082
                                                      └────────→ report :8083
                         o BFF :8080 directo (desarrollo local)
```

## Estructura útil

| Ruta | Responsabilidad |
| --- | --- |
| `.env.example` → `.env.local` | IDs de Entra y URL base de API específicos de tu PC. |
| `src/auth/authConfig.ts` | MSAL: tenant, SPA client ID, redirect `/redirect.html`, scope de API. |
| `src/auth/AuthGate.tsx`, `roles.ts` | Sesión y vista por rol. Los permisos reales los impone el BFF. |
| `src/api/http.ts` | URL base, Bearer token y errores HTTP. |
| `src/api/appointmentsApi.ts`, `ordersApi.ts`, `productsApi.ts`, `reportsApi.ts` | Llamadas separadas por recurso. |
| `src/features/home/` | Portada pública y elección de servicio. |
| `src/features/scheduling/` | Formulario de cinco pasos, calendario, validaciones y 20 talleres. |
| `src/features/client/` | «Mi revisión técnica» e historial. |
| `src/components/`, `src/App.tsx` | Órdenes e informe para Operador/Admin; dashboard, catálogo editable y reportes para Admin. `AdminDashboard.tsx` consulta ventas, órdenes, stock bajo y eventos. |
| `src/assets/images/` | Logo y fotografías locales. |
| `redirect.html`, `vite.config.ts` | Retorno del popup MSAL; Vite fija el puerto 5173 y lo incluye en el build. |

## 1. Preparar Microsoft Entra ID (Azure)

Se necesitan **dos registros de aplicación en el mismo tenant**. Los nombres son libres; usa, por ejemplo, `talleres360-api` y `talleres360-spa`. Los valores de abajo son identificadores, **no contraseñas**.

1. En Microsoft Entra ID → **Registros de aplicaciones**, crea el registro de la **API**. En «Información general» copia el **Id. de directorio (inquilino)** para `VITE_ENTRA_TENANT_ID` / `ENTRA_TENANT_ID`, y el **Id. de aplicación (cliente)** de la API para `VITE_API_CLIENT_ID` / `API_CLIENT_ID`.
2. En ese registro, «Exponer una API»: configura el URI de Id. de aplicación como `api://<API_CLIENT_ID>` y crea un scope delegado con valor exacto `access_as_user`. El frontend solicita `api://<API_CLIENT_ID>/access_as_user`; si cambias el URI o el nombre, también debes cambiar `src/auth/authConfig.ts`.
3. En el manifiesto del registro de API, configura `requestedAccessTokenVersion` en `2` (en algunas vistas de manifiesto el campo se muestra como `accessTokenAcceptedVersion`). El BFF espera issuer `https://login.microsoftonline.com/<TENANT_ID>/v2.0` y audiencia igual al ID de aplicación de la API.
4. En «Roles de aplicación» del registro de API, crea roles para usuarios/grupos con **valores** exactos `Cliente`, `Operador` y `Admin`. No basta con cambiar el nombre visible: `SecurityConfig.java` comprueba esos valores. En **Aplicaciones empresariales**, busca la aplicación correspondiente a la API y asigna usuarios/grupos a los roles. El correo de la cuenta cliente se usa para recuperar solo sus solicitudes.
5. Crea el segundo registro, la **SPA**. Copia su **Id. de aplicación (cliente)** para `VITE_SPA_CLIENT_ID`. En «Autenticación», agrega plataforma **Aplicación de página única (SPA)** con URI de redirección `http://localhost:5173/redirect.html`. El código calcula esta URI desde el origen actual; si publicas el sitio en otro dominio HTTPS, registra también `https://<tu-dominio>/redirect.html`. Agrega el origen de retorno de logout si tu política de registro lo requiere.
6. En la SPA, «Permisos de API» → permiso delegado de la API → `access_as_user`; concede consentimiento según las políticas de tu tenant. Registra/autoriza las cuentas de prueba según la configuración de tu organización.

No coloques un **client secret** en Vite ni en `.env.local`: el navegador lo haría público. La SPA usa un flujo público con MSAL. El BFF valida el access token; un ID token no sustituye al access token para llamar a la API.

## 2. Configurar y ejecutar en otra PC

Instala Git y Node.js compatible con las dependencias del proyecto; el repositorio contiene `package-lock.json`, por lo que se recomienda `npm ci`. Inicia también BFF y backend siguiendo sus README. Para el stack local, `talleres360-backend`, `talleres360-bff` y `talleres360-frontend` deben ser carpetas hermanas.

1. En la raíz de `talleres360-frontend/`, copia `.env.example` a `.env.local`. En Windows PowerShell: `Copy-Item .env.example .env.local`; en Linux/macOS: `cp .env.example .env.local`.
2. Edita **ese archivo**, no `src/auth/authConfig.ts` ni una página:

   ```dotenv
   VITE_ENTRA_TENANT_ID=<Id-de-directorio-tenant>
   VITE_SPA_CLIENT_ID=<Id-de-aplicación-de-la-SPA>
   VITE_API_CLIENT_ID=<Id-de-aplicación-de-la-API>
   VITE_API_BASE_URL=http://localhost:8080
   ```

   Los IDs SPA y API son **distintos**. El tenant y API client ID deben coincidir con el `.env` del BFF. El backend `infra/apps/.env` también usa esos dos valores al levantar el stack local. Si falta un ID, el sitio público abre, pero no se puede iniciar sesión. Si cambias `.env.local`, reinicia Vite.
3. Ejecuta desde `talleres360-frontend/`:

   ```bash
   npm ci
   npm run dev
   ```

4. Abre `http://localhost:5173`. Puedes ver inicio y elegir el servicio sin cuenta; **confirmar un agendamiento requiere iniciar sesión**. Cliente ve «Mi revisión técnica»; Operador atiende órdenes; Admin entra al dashboard. Usa `npm run typecheck` y `npm run build` para verificar el cliente; el resultado queda en `dist/`.

No apuntes `VITE_API_BASE_URL` a `http://localhost:8081`: ese puerto es el microservicio sin validación de token y no es la entrada de la aplicación. Tampoco apuntes a 8082 o 8083: productos y reportes pasan por el BFF.

## 3. Conectar el frontend local a tus EC2 mediante API Gateway

Primero despliega orders, catalog, report y BFF según sus README. En AWS crea/configura una HTTP API cuyo destino sea **tu EC2 BFF**. El stage de ejemplo es `dev`; si usas `$default`, quita `/dev` de la URL base. Verifica que Gateway preserve las rutas `/api/appointments`, `/api/orders`, `/api/products`, `/api/reports` y sus subrutas al reenviarlas al BFF. En el autorizador JWT usa issuer v2 de tu tenant, audiencia de la **API** y scope `access_as_user`; deja pasar `OPTIONS` para preflight. Configura CORS con el origen exacto `http://localhost:5173`, métodos `GET, POST, PUT, DELETE, OPTIONS` y encabezados `authorization, content-type`.

En `talleres360-frontend/.env.local` cambia **solo** la URL base:

```dotenv
VITE_API_BASE_URL=https://<tu-api-id>.execute-api.<tu-region>.amazonaws.com/dev
```

Reinicia `npm run dev`. No agregues `/api/orders` a la URL base: `src/api/*.ts` añade cada ruta. Si la SPA está publicada en un dominio distinto de localhost, agrega **ese origen exacto** a: URI `/redirect.html` de la SPA en Entra, CORS de API Gateway y `CORS_ALLOWED_ORIGINS` del BFF. Publica el frontend por HTTPS fuera de localhost. Las variables `VITE_*` se incorporan al build: al cambiarlas para un hosting debes ejecutar `npm run build` de nuevo y desplegar el nuevo `dist/`. No hay configuración dinámica en tiempo de ejecución.

## 4. Comprobación de extremo a extremo

1. Comprueba que Docker muestra `orders`, `catalog`, `report` y sus bases en la EC2 backend, y `bff` en la EC2 BFF. Desde BFF, `curl -i http://<IP-privada-backend>:8081/api/orders` debe obtener HTTP. Catálogo/Reportería exigen además la clave interna.
2. Desde tu PC, prueba el preflight en la ruta **completa** de Gateway (incluido stage `/dev`) usando `curl.exe` en PowerShell:

   ```powershell
   curl.exe -i -X OPTIONS "https://<tu-api-id>.execute-api.<tu-region>.amazonaws.com/dev/api/orders" -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization,content-type"
   ```

   Espera 200/204 con `access-control-allow-origin: http://localhost:5173`. Si da 403, revisa el preflight sin auth, el path del stage/integración y los orígenes CORS.
3. Inicia sesión con una cuenta con rol `Cliente`. Crea una solicitud y confirma que aparezca en «Mi revisión técnica» y en el panel Operador/Admin. Prueba también que esos roles no accedan a rutas ajenas. Si hay 401, revisa tenant/issuer/audience; con 403, revisa scope, rol y reglas de Gateway/BFF. Nunca pegues un token real en issues o capturas.

## Estado actual y límites

Los 20 talleres son una lista compartida en `src/features/scheduling/constants/workshops.ts` y validada también en el backend; no hay un microservicio de sucursales. `GET /api/appointments/availability` **no calcula ocupación real todavía**: el calendario puede mostrar fechas disponibles sin reserva de cupos.

El Operador puede crear órdenes, aceptar/cancelar solicitudes, registrar diagnóstico, trabajo realizado, fecha estimada, mano de obra y repuestos, y entregar; solo consulta el catálogo. Admin puede hacer eso, gestiona productos, precios y stock, ve ventas/auditoría y al cambiar un estado debe dejar un motivo. El formulario de ítems selecciona productos del catálogo y envía ID y cantidad; el precio lo determina el backend. El dashboard muestra órdenes registradas, entregas/ventas del período, productos activos con stock de 5 o menos y los 20 eventos de auditoría más recientes; consulta reportería, catálogo y órdenes aproximadamente cada 10 segundos. El rango visible del dashboard incluye ambos días elegidos; la API de reportes usa `[from,to)` con fechas ISO 8601, por lo que el cliente envía el día siguiente como límite superior. Los eventos llegan mediante outbox, por lo que pueden demorarse si un servicio falla.

**No está validado todavía en EC2 con esta versión.** La compilación del frontend pasó, pero sin el stack Docker activo no se comprobó el flujo completo de crear producto → crear orden → registrar trabajo → entregar → descontar stock → mostrar venta y auditoría. Haz esa prueba con cuentas Operador y Admin antes de darlo por terminado. Consulta el README backend para riesgos de consistencia y migración.

Mantén `.env.local` fuera de Git. Aunque los IDs de aplicación no sean secretos, cualquier secreto en una variable `VITE_*` queda visible en el navegador. Usa valores propios de cada tenant y de cada entorno; no copies URLs, IPs o llaves PEM del equipo de otro integrante.
