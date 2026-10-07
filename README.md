# Talleres360 — Frontend

Aplicación React + TypeScript para solicitar atención de vehículos y gestionar órdenes, repuestos y ventas. Incluye sitio público, agendamiento autenticado, historial del cliente y paneles por rol. Microsoft Entra ID proporciona el inicio de sesión; todas las llamadas a servicios pasan por el BFF.

Rama de trabajo: **`fronted`**. [Repositorio](https://github.com/odbtms/talleres360-frontend).

## Tecnologías

React 19, TypeScript 7, Vite 8 y MSAL Browser/React. Estilos CSS con variables de tema en `src/styles.css` y estilos del panel en `src/styles/gestion.css`. Las imágenes y el logo se almacenan en el proyecto. Las versiones exactas están en `package.json` y `package-lock.json`.

## Arquitectura

```text
Frontend local :5173 → API Gateway HTTPS /dev → BFF :8080
                                                ├── Órdenes :8081
                                                ├── Catálogo :8082
                                                └── Reportería :8083
```

En AWS, cada microservicio tiene su EC2 y PostgreSQL; BFF ocupa otra EC2. El frontend permanece local. GitHub almacena los repositorios: no responde las peticiones de negocio.

Para desarrollo también puede consumirse BFF directamente en `http://localhost:8080`. No se apunta el navegador a los puertos de los microservicios.

## Funciones por rol

### Sitio público y Cliente

- Inicio con presentación, fotografías y acceso al login. Header persistente con Inicio, Agendamiento, Servicios y Nosotros; con sesión de cliente incorpora Mi revisión técnica.
- Agendamiento ofrece Mantenciones y arreglos o Diagnóstico. El formulario requiere sesión y se divide en vehículo, propietario, servicio/taller, fecha y resumen.
- Correo obtenido de la sesión. Selección entre 20 talleres: siete de Biobío, siete de Maule y seis de Araucanía.
- Calendario mensual: blanco disponible, gris no seleccionable y amarillo seleccionado, según las fechas y disponibilidad recibidas.
- Confirmación de solicitud y consulta del historial propio con ID, tipo, taller, región, estado, fecha de creación y resumen desplegable.
- Tras iniciar sesión, el cliente vuelve al inicio.

Rutas: `/`, `/agendamiento`, `/agendamiento/solicitud?tipo=maintenance`, `/agendamiento/solicitud?tipo=diagnostics` y `/mis-revisiones`.

Las solicitudes guardan el día de atención. La consulta de disponibilidad actualmente devuelve `occupiedDates: []`; ese resultado no representa una reserva de cupo confirmada.

### Operador

Consulta y crea órdenes; acepta o rechaza solicitudes; registra diagnóstico, trabajo realizado, fecha estimada de entrega, mano de obra y repuestos; avanza el trabajo y entrega el vehículo. El catálogo se consulta para seleccionar productos, con precio automático y cantidad validada contra existencias.

### Admin

Dispone de menú izquierdo con **Dashboard, Órdenes, Productos y Hacer reporte**. Puede gestionar órdenes, eliminar órdenes y administrar SKU, nombre, precio, stock y estado activo de productos. Las intervenciones de estado requieren un motivo.

**Nueva orden permanece en la cabecera** para Admin y Operador. El menú y la sesión se mantienen al cambiar de sección.

El dashboard muestra órdenes registradas, entregas e ingresos del período, productos activos con stock de cinco o menos y los veinte eventos recientes de auditoría. Actualiza aproximadamente cada diez segundos. Hacer reporte permite elegir un período y consultar cantidad de entregas, ingresos y fecha de generación.

## Estructura de archivos

| Ruta | Contenido |
| --- | --- |
| `src/main.tsx` | Entrada, inicialización de autenticación y renderizado. |
| `src/App.tsx` | Composición de vistas y acciones del panel. |
| `src/auth/` | Configuración MSAL, sesión, roles, login y obtención de token. |
| `src/api/http.ts` | URL base, access token y manejo común de llamadas HTTP. |
| `src/api/appointmentsApi.ts` | Solicitudes e historial del cliente. |
| `src/api/ordersApi.ts` | CRUD, estados, informe técnico y confirmación de stock. |
| `src/api/productsApi.ts`, `reportsApi.ts` | Catálogo, ventas y auditoría. |
| `src/features/home/` | Inicio, header público y selección de servicio. |
| `src/features/scheduling/` | Formulario de cinco pasos, calendario, tipos y validaciones. |
| `src/features/scheduling/constants/workshops.ts` | Regiones, nombres e IDs de los talleres. |
| `src/features/client/` | Mi revisión técnica y resumen de solicitudes. |
| `src/features/reports/` | Página, hook y tratamiento de fechas del reporte. |
| `src/components/` | Lista, filtros, detalle y formularios de órdenes; productos y dashboard. |
| `src/layouts/MenuLateral.tsx` | Navegación lateral del panel. |
| `src/constants/` | Estados de órdenes y opciones de navegación por rol. |
| `src/types.ts`, `src/types/gestion.ts` | Contratos compartidos y tipos del panel. |
| `src/styles.css`, `src/styles/gestion.css` | Tema y estilos de componentes/panel. |
| `src/assets/images/` | Fotografías y logo locales. |
| `redirect.html`, `vite.config.ts` | Retorno de MSAL y configuración de Vite. |

Los componentes muestran información y capturan acciones. Los hooks coordinan formularios y llamadas; los módulos API concentran el acceso al BFF. Los datos de negocio se conservan en los servicios, no en el estado del navegador.

## Configuración en otra PC

Necesitas Git, Node.js compatible con Vite 8 —por ejemplo Node 22.12 o superior de la rama 22— y npm. Si el BFF y los micros ya están funcionando en AWS, solo necesitas ejecutar este frontend en la PC.

Crea **`.env.local` en la raíz de `talleres360-frontend`**, junto a `package.json`, y pega tus valores:

```dotenv
VITE_ENTRA_TENANT_ID=<ID_DEL_TENANT>
VITE_SPA_CLIENT_ID=<ID_DEL_REGISTRO_SPA>
VITE_API_CLIENT_ID=<ID_DEL_REGISTRO_API>
VITE_API_BASE_URL=https://<API_ID>.execute-api.<REGION>.amazonaws.com/dev
```

| Variable | Dónde obtenerla |
| --- | --- |
| `VITE_ENTRA_TENANT_ID` | ID del directorio de Microsoft Entra ID. |
| `VITE_SPA_CLIENT_ID` | ID de aplicación del registro SPA. |
| `VITE_API_CLIENT_ID` | ID de aplicación del registro API, distinto al SPA. |
| `VITE_API_BASE_URL` | URL base del stage de API Gateway; no agregar `/api/orders` ni otra ruta. |

Guarda el archivo. Si Vite estaba ejecutándose, reinícialo para cargar los valores. Para servicios locales usa `VITE_API_BASE_URL=http://localhost:8080`.

El tenant y el ID API coinciden con `ENTRA_TENANT_ID` y `API_CLIENT_ID` del BFF. Los IDs permiten identificar las aplicaciones, pero **no pongas client secrets, claves internas, contraseñas ni PEM en variables `VITE_*`**: su contenido llega al navegador. Mantén `.env.local` fuera de Git.

## Microsoft Entra ID

El proyecto utiliza dos registros en el mismo tenant:

1. **API:** URI `api://<ID_API>`, scope delegado `access_as_user` y access tokens versión 2.
2. **Roles en la API:** valores exactos `Cliente`, `Operador` y `Admin`, asignados a las cuentas desde la aplicación empresarial correspondiente.
3. **SPA:** plataforma de página única con redirección `http://localhost:5173/redirect.html`.
4. **Permiso de la SPA:** acceso delegado al scope `api://<ID_API>/access_as_user`, con consentimiento según la política del tenant.

`src/auth/authConfig.ts` utiliza las variables para formar autoridad, scope y URI de retorno. MSAL conserva la sesión en `sessionStorage`. El token enviado a BFF es un **access token para la API**, no el ID token de inicio de sesión.

BFF valida tenant, audiencia, scope y roles. Ocultar una opción en React no sustituye esos permisos.

## Ejecutar y compilar

Desde la raíz del frontend:

```bash
npm ci
npm run dev
```

Abre **http://localhost:5173**. Vite utiliza ese puerto con `strictPort`, coherente con la redirección registrada.

Comprobación de tipos:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

El resultado queda en `dist/`. `npm run preview` permite revisar ese build; el origen utilizado también debe estar autorizado en Entra y CORS. Las variables `VITE_*` se incorporan durante la compilación: al cambiarlas en un sitio compilado hay que generar y publicar el nuevo build.

## Conexión con AWS y CORS

`VITE_API_BASE_URL` apunta a **API Gateway**, que reenvía las peticiones al BFF. Para un stage `dev` se incluye `/dev`; para `$default` se usa la URL sin ese sufijo.

Gateway debe enviar `/api/...` al BFF, sin agregar el prefijo de stage. El autorizador JWT utiliza issuer `https://login.microsoftonline.com/<TENANT_ID>/v2.0`, audiencia del registro API y scope `access_as_user`.

El preflight `OPTIONS` debe responder sin exigir token. Autoriza el origen exacto `http://localhost:5173`, encabezados `authorization, content-type` y métodos `GET, POST, PUT, DELETE, OPTIONS`. El origen también se configura en `CORS_ALLOWED_ORIGINS` del BFF.

Si cambia:

- **Una IP privada de un micro:** actualiza las URL del BFF y, para Catálogo/Reportería, también las de Órdenes.
- **La dirección pública del BFF:** actualiza la integración Gateway.
- **Gateway o stage:** actualiza `VITE_API_BASE_URL`.
- **El origen del frontend:** registra su `/redirect.html` en Entra y autoriza ese origen en CORS.

## Validaciones y stock

Patente de seis caracteres alfanuméricos, con formato por pares; modelo con letras, números y espacios; año entre 1900 y el actual + 1. RUT con Módulo 11 y K final; teléfono de ocho dígitos tras +56 9; nombre/apellido con letras, espacios, apóstrofes y guiones. El motivo tiene entre 10 y 500 caracteres y el día de atención está entre mañana y los próximos noventa días.

**Módulo 11 comprueba el dígito verificador, no la existencia oficial de una persona.** El backend vuelve a validar los datos y determina el correo autenticado.

Los repuestos se eligen del catálogo; se envían ID y cantidad, no un precio libre. Al aceptar se solicita una asignación versionada de existencias. Editar el informe ajusta esa asignación y cancelar la libera. El formulario consulta stock libre y lo ya asignado a la orden. Entregar exige que se haya confirmado la última asignación y no descuenta por segunda vez.

Los mensajes de carga/error acompañan las operaciones. Ante errores de sesión o conexión se muestran avisos comprensibles; la investigación técnica se realiza en las herramientas del navegador y los registros del servidor, sin publicar tokens.

## Comprobaciones

El 6 de octubre de 2026 pasaron TypeScript y build en el entorno local. Son comprobaciones de código, no una certificación de la infraestructura AWS.

Para revisar la conexión, inicia sesión con cada rol, consulta sus vistas autorizadas, crea una solicitud y verifica su historial, gestiona una orden y consulta su asignación de stock, entrega y revisa ventas/auditoría como Admin. Los reportes cuentan solamente órdenes entregadas; su actualización depende del envío periódico del outbox de Órdenes.

Una respuesta 401 requiere revisar sesión, issuer y audiencia; una 403, scope/roles y CORS cuando corresponda. La URL base, rutas y origen se configuran en los archivos indicados, no dentro de las páginas.
