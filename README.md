# Talleres360 — Frontend

Aplicación React + TypeScript para gestionar órdenes de trabajo, repuestos y ventas de la red Talleres360. Incluye sitio público, historial del cliente y paneles por rol. Microsoft Entra ID proporciona el inicio de sesión; todas las llamadas pasan por API Gateway y el BFF.

La rama de trabajo es `fronted`. Consume el [BFF](https://github.com/EmmanuelhxGG/talleres360-bff) y los cinco microservicios independientes de Emmanuel: [Órdenes](https://github.com/EmmanuelhxGG/ms-ordenes-talleres360), [Catálogo](https://github.com/EmmanuelhxGG/ms-catalogo-talleres360), [Reportes](https://github.com/EmmanuelhxGG/ms-reportes-talleres360), [Notificaciones](https://github.com/EmmanuelhxGG/ms-notificaciones-talleres360) y [Auditoría](https://github.com/EmmanuelhxGG/ms-auditoria-talleres360).

## Tecnologías

React 19, TypeScript 7, Vite 8 y MSAL Browser/React. Estilos CSS con variables de tema en `src/styles.css` y estilos del panel en `src/styles/gestion.css`. Las imágenes y el logo se almacenan en el proyecto. Las versiones exactas están en `package.json` y `package-lock.json`.

## Arquitectura

```text
Frontend local :5173 → API Gateway HTTPS (JWT) → BFF :8080 (JWT + rol)
                                                ├── Órdenes :8081
                                                ├── Catálogo :8082   (X-Internal-Key)
                                                ├── Reportería :8083 (X-Internal-Key)
                                                ├── Notificaciones :8084 (X-Internal-Key)
                                                └── Auditoría :8085 (X-Internal-Key)
```

En AWS, cada microservicio tiene su EC2 y PostgreSQL; BFF ocupa otra EC2. El frontend permanece local.

Para desarrollo también puede consumirse BFF directamente en `http://localhost:8080`. No se apunta el navegador a los puertos de los microservicios.

## Funciones por rol

### Sitio público y Cliente

- Inicio con presentación, fotografías y acceso al login. Header con Inicio, Agendamiento, Servicios y Nosotros; con sesión de cliente incorpora Mi revisión técnica.
- Agendamiento online para mantenciones/arreglos o diagnóstico: cinco pasos de vehículo, propietario, servicio/taller, fecha y resumen. Tres regiones y veinte talleres. El correo se muestra desde la sesión y el BFF obtiene la identidad del JWT al confirmar mediante `POST /api/appointments`.
- Calendario mensual grande: blanco disponible, gris no disponible y amarillo seleccionado. Consulta `GET /api/appointments/availability`; no inventa ocupación. El servicio actual no aplica cupos diarios ni horas de atención.
- **Mi revisión técnica** (`/mis-revisiones`) utiliza `GET /api/appointments`. El servidor entrega únicamente solicitudes de la cuenta; incluye tipo de revisión, región, taller, motivo, fechas, diagnóstico y total.

Rutas: `/`, `/agendamiento` y `/mis-revisiones`.

### Operador

Consulta y crea órdenes con RUT, teléfono y patente validados; acepta o rechaza solicitudes y avanza el trabajo hasta la entrega. En **Recibida** asigna repuestos. Después de aceptar, registra diagnóstico, trabajo realizado, mano de obra, entrega estimada y repuestos mediante `/api/orders/{id}/technical`. Consulta confirmación de stock antes de permitir la entrega. No puede eliminar.

Incluye **Notificaciones** en el menú izquierdo: tickets del taller, filtro por número de orden, mensaje desplegable, estados, paginación y actualización manual.

### Admin

Menú izquierdo con **Dashboard, Órdenes, Productos y Hacer reporte**. Además de lo del operador, elimina órdenes y administra SKU, nombre, precio, stock y estado activo de los productos.

Incluye **Auditoría**, una línea de tiempo de solo lectura con filtros por orden, usuario, tipo de evento y rango de fechas, paginación y detalle de trazabilidad. El acceso Admin sigue la sección de pantallas del caso; no requiere crear un rol Auditor adicional en Azure.

### Seguimiento de notificaciones y auditoría

Cliente dispone de **Notificaciones** en su header y en `/notificaciones`. Solo consulta avisos dirigidos al correo de su identidad autenticada. Operador consulta tickets; Admin consulta auditoría, no notificaciones. Las páginas muestran carga, ausencia de resultados y errores personalizados con opción de reintentar. Son adaptables al ancho disponible y utilizan variables del tema existente.

Este módulo utiliza los contratos paginados de `ms-notificaciones-talleres360` y `ms-auditoria-talleres360` de Emmanuel y sus rutas en `talleres360-bff`. Consume `GET /api/notifications` y `GET /api/audit` mediante la misma `VITE_API_BASE_URL`; no incorpora URLs privadas ni claves de microservicios al navegador. El BFF y los servicios aplican los permisos y el filtro por propietario; no se confía en filtrar datos ajenos después de descargarlos.

`ENVIADA` indica aceptación del proveedor SMTP, no recepción en la bandeja. `PENDIENTE` no se presenta como correo enviado. El frontend consulta información almacenada y no crea notificaciones ni modifica auditorías.

**Nueva orden permanece en la cabecera** para Admin y Operador. El menú y la sesión se mantienen al cambiar de sección.

El dashboard muestra órdenes registradas, entregas e ingresos del período, productos activos con stock de cinco o menos y los eventos recientes de auditoría. Hacer reporte consulta cantidad de entregas e ingresos de un período. Los valores proceden de los servicios conectados al BFF; el alias de auditoría del dashboard se dirige al microservicio de Auditoría en la integración de Emmanuel.

El administrador debe justificar sus cambios de estado con al menos diez caracteres. Las fechas de aceptación, entrega y actualización técnica las registra el servidor. Los formularios envían identificadores y cantidades de productos; el precio y el total definitivo los calcula Órdenes con Catálogo.

## Estructura de archivos

| Ruta | Contenido |
| --- | --- |
| `src/main.tsx` | Entrada, inicialización de autenticación y renderizado. |
| `src/App.tsx` | Composición de vistas y acciones del panel. |
| `src/auth/` | Configuración MSAL, sesión, roles, login y obtención de token. |
| `src/api/http.ts` | URL base, access token y manejo común de llamadas HTTP. |
| `src/api/ordersApi.ts` | CRUD y cambio de estado de órdenes (ms-orders). |
| `src/api/productsApi.ts`, `reportsApi.ts` | Catálogo, ventas y auditoría. |
| `src/features/home/` | Inicio, header público y página de agendamiento. |
| `src/features/scheduling/` | Formulario de cinco pasos, calendario, talleres, regiones y validaciones. |
| `src/api/appointmentsApi.ts` | Crear solicitudes, consultar las propias y disponibilidad. |
| `src/features/client/` | Mi revisión técnica. |
| `src/features/reports/` | Página, hook y tratamiento de fechas del reporte. |
| `src/features/seguimiento/` | Páginas de notificaciones y auditoría, contratos, constantes, hook cancelable y paginación compartida. |
| `src/api/seguimientoApi.ts` | Consultas de seguimiento y filtros; fechas locales convertidas a límites UTC. |
| `src/components/` | Lista, filtros, detalle y formularios de órdenes (`OrderItemsForm` asigna repuestos); productos y dashboard. |
| `src/layouts/MenuLateral.tsx` | Navegación lateral del panel. |
| `src/constants/` | Estados de órdenes y opciones de navegación por rol. |
| `src/types.ts`, `src/types/gestion.ts` | Contratos compartidos y tipos del panel. |
| `src/styles.css`, `src/styles/gestion.css` | Tema y estilos de componentes/panel. |
| `src/assets/images/` | Fotografías y logo locales. |
| `redirect.html`, `vite.config.ts` | Retorno de MSAL y configuración de Vite. |

## Configuración en otra PC

Necesitas Git, Node.js compatible con Vite 8 —por ejemplo Node 22.12 o superior de la rama 22— y npm. Si el BFF y los micros ya están funcionando en AWS, solo necesitas ejecutar este frontend en la PC.

Crea **`.env.local` en la raíz de `talleres360-frontend`**, junto a `package.json`, y pega tus valores:

```dotenv
VITE_ENTRA_TENANT_ID=<ID_DEL_TENANT>
VITE_SPA_CLIENT_ID=<ID_DEL_REGISTRO_SPA>
VITE_API_CLIENT_ID=<ID_DEL_REGISTRO_API>
VITE_API_BASE_URL=https://<API_ID>.execute-api.<REGION>.amazonaws.com
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

`VITE_API_BASE_URL` apunta a **API Gateway**, que reenvía las peticiones al BFF. Incluye el stage si tiene nombre (por ejemplo `/dev`); con `$default` no se agrega sufijo.

Gateway debe enviar `/api/...` al BFF, sin agregar el prefijo de stage. El autorizador JWT utiliza issuer `https://login.microsoftonline.com/<TENANT_ID>/v2.0`, audiencia del registro API y scope `access_as_user`.

El preflight `OPTIONS` debe responder sin exigir token. Autoriza el origen exacto `http://localhost:5173`, encabezados `authorization, content-type` y métodos `GET, POST, PUT, DELETE, OPTIONS`. El origen también se configura en `CORS_ALLOWED_ORIGINS` del BFF.

Si cambia:

- **Una IP privada de un micro:** actualiza su `ORDERS_URL`, `CATALOG_URL`, `REPORT_URL`, `NOTIFICATIONS_URL` o `AUDIT_URL` en el `.env` del BFF y las referencias correspondientes en Órdenes.
- **La dirección pública del BFF:** actualiza la integración Gateway.
- **Gateway o stage:** actualiza `VITE_API_BASE_URL`.
- **El origen del frontend:** registra su `/redirect.html` en Entra y autoriza ese origen en CORS.

## Validaciones y reglas

Las reglas las decide el backend y el front solo las refleja:

- Estados: `RECIBIDA → ACEPTADA → EN_REPARACION → LISTA_PARA_ENTREGA → ENTREGADA`; `CANCELADA` desde cualquiera antes de entregar. Una transición inválida devuelve **409** (por ejemplo, entregar sin aceptar). El detalle solo muestra los botones válidos (`src/constants/orderStatus.ts`).
- Editar datos generales en `RECIBIDA`; informe técnico en `ACEPTADA`, `EN_REPARACION` o `LISTA_PARA_ENTREGA`.
- Ítems: solo `productId` y `quantity`. El servidor obtiene precios; Catálogo confirma reservas mediante el outbox de Órdenes. La entrega espera la confirmación y no descuenta por segunda vez.
- Patente: seis caracteres alfanuméricos separados en pares. Modelo: letras, números y espacios. Nombre: letras y espacios. Teléfono: ocho números después de +56 9. RUT: dígito verificador Módulo 11; no demuestra existencia ni identidad. Fecha: desde mañana hasta noventa días.
- Permisos (BFF): solicitudes propias GET/POST Cliente; órdenes GET/POST/PUT Admin/Operador, DELETE Admin; productos GET Admin/Operador, POST/PUT Admin; reportes y auditoría Admin; notificaciones Operador/Cliente.

Una respuesta 401 requiere revisar sesión, issuer y audiencia; una 403, scope/roles. Se muestran errores personalizados sin exponer endpoints, excepciones ni mensajes internos de autenticación. El build y la comprobación de tipos no sustituyen las pruebas del flujo autenticado en AWS.
