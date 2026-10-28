# Talleres360 — Frontend

Aplicación React + TypeScript para gestionar solicitudes, repuestos y ventas de un único taller: Talleres360. Incluye sitio público, historial del cliente y paneles por rol. Microsoft Entra ID proporciona el inicio de sesión; todas las llamadas pasan por API Gateway y el BFF.

La rama de trabajo es `fronted`. Consume el [BFF](https://github.com/EmmanuelhxGG/talleres360-bff) y los cinco microservicios independientes de Emmanuel: [Órdenes](https://github.com/EmmanuelhxGG/ms-ordenes-talleres360), [Catálogo](https://github.com/EmmanuelhxGG/ms-catalogo-talleres360), [Reportes](https://github.com/EmmanuelhxGG/ms-reportes-talleres360), [Notificaciones](https://github.com/EmmanuelhxGG/ms-notificaciones-talleres360) y [Auditoría](https://github.com/EmmanuelhxGG/ms-auditoria-talleres360).

Documentación actualizada el **22 de octubre de 2026**. Los ejemplos de configuración
usan marcadores: no contienen IDs reales de Entra, direcciones de las instancias ni credenciales.

## Solicitudes de compra

Todos los roles llegan al inicio `/`. Inicio, Catálogo, Servicios y Nosotros son
secciones diferentes. Admin y Operador tienen un botón **Dashboard** hacia
`/dashboard` y un enlace **Ver sitio** para volver. El operador tiene indicadores
operativos; el administrador controla inventario, precios, reportes y auditoría.
`/mis-solicitudes` conserva compras y atenciones anteriores en una sola página.
No existe una opción de navegación separada llamada Atenciones anteriores.
Los errores de consulta no se presentan como resultados vacíos.

El catálogo de venta usa `GET /api/catalogo`, sin cantidades de stock en la respuesta.
Solo Admin usa `/api/products` para inventario completo y CRUD. El cliente consulta
precio de venta/disponibilidad y envía su carrito sin pagos en línea; no reserva
ni descuenta stock al enviarlo. Los listados se actualizan cada cinco segundos.

Los productos se identifican por su ID numérico automático, visible en el catálogo
y en la administración. No se solicita un SKU al crear un repuesto: Catálogo genera
una referencia interna y conserva las anteriores al editar. La auditoría del
dashboard resume las cinco solicitudes con actividad más reciente. El historial
completo pagina diez solicitudes, con un bloque por ID. Al abrir un bloque se
consultan sus movimientos, paginados dentro de esa solicitud; cada movimiento
conserva usuario, motivo e identificación desplegables. Los filtros se aplican
tanto al listado de solicitudes como a los movimientos mostrados.

Sin sesión, **Registrarse** aparece junto a **Iniciar sesión** en el encabezado.
La sección principal del inicio mantiene únicamente el acceso al catálogo.

El flujo principal no utiliza pasarela de pago. `/registro` recibe nombre y correo
únicamente `@duocuc.cl`; el envío exige autenticación Microsoft en el tenant configurado,
pero no todavía el rol Cliente. Si la cuenta no puede autenticarse, el encargado de
Entra primero debe agregarla o invitarla y permitir su acceso a la aplicación.
Las cuentas `@tu-tenant.onmicrosoft.com` ya habilitadas conservan su login y compras;
no pueden solicitar alta mediante este formulario. Ningún dominio asigna roles.
El borrador de registro se conserva en la sesión del navegador durante el login y
se retira al guardar correctamente. No se almacenan contraseñas.
La identidad debe poder autenticarse en el tenant. No hay registro anónimo ni
invitaciones automáticas desde la aplicación. La persona responsable de Entra ID
gestiona manualmente el alta y el rol **Cliente**. **Registros** permite consultar
las solicitudes locales; guardarlas no crea usuarios ni una aprobación nativa en
Entra, ni concede acceso automáticamente.

Con sesión aprobada, el cliente abre `/catalogo`, filtra categorías, añade productos
al carrito y envía la solicitud sin completar RUT, teléfono ni seleccionar taller.
El servidor obtiene nombre/correo del JWT y asigna el único taller.
`/mis-solicitudes` muestra sus compras,
precios, cantidades, total y estado. El servidor obtiene correo y precios reales;
enviar el carrito no descuenta existencias.

Operador acepta o rechaza; rechazar exige explicar el motivo. La aceptación queda pendiente hasta que
Catálogo confirme stock; después pasa a **En espera**, **Lista para retirar o
entregar** y **Entregada**. Estas compras no requieren diagnóstico de vehículo.
Admin administra productos/categorías con baja lógica y consulta ventas/auditoría.
El formulario histórico de agendamiento de cinco pasos se conserva.

Los avisos automáticos son aceptación, disponibilidad para retiro/entrega y
rechazo con motivo. El comprobante es texto dentro del correo, sin PDF ni adjuntos.
La cuenta del administrador designada como remitente se configura exclusivamente
en Notificaciones y debe estar autorizada por su proveedor. Iniciar sesión con
Entra no concede permiso para enviar correos desde esa cuenta.

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

Órdenes usa un outbox persistente: stock, ventas y auditoría se comunican por HTTP
interno; correos y tickets se publican en RabbitMQ y los procesa Notificaciones.
RabbitMQ ocupa otra EC2. Kafka no forma parte de esta versión.

Para desarrollo también puede consumirse BFF directamente en `http://localhost:8080`. No se apunta el navegador a los puertos de los microservicios.

## Funciones por rol

### Sitio público y Cliente

- Inicio con presentación, fotografías y acceso al login. Header con Inicio, Catálogo, Servicios y Nosotros. Sin sesión muestra Registrarse; con sesión de cliente muestra Mis solicitudes y Notificaciones.
- Catálogo y carrito con búsqueda, categorías, disponibilidad, cantidades y total estimado. Enviar genera una solicitud, no un pago. Mis solicitudes muestra productos, total, estado y motivo de rechazo cuando corresponde.
- Agendamiento anterior conservado para mantenciones/arreglos o diagnóstico: cinco pasos de vehículo, propietario, motivo del servicio, fecha y resumen. Se realiza en el único taller, sin elegir región o sucursal. Este formulario mecánico conserva sus validaciones de propietario; no es el carrito de compras. El BFF obtiene el correo del JWT mediante `POST /api/appointments`.
- Calendario mensual grande: blanco disponible, gris no disponible y amarillo seleccionado. Consulta `GET /api/appointments/availability`; no inventa ocupación. El servicio actual no aplica cupos diarios ni horas de atención.
- **Mi revisión técnica** (`/mis-revisiones`) utiliza `GET /api/appointments`. El servidor entrega únicamente solicitudes de la cuenta; incluye tipo de revisión, taller, motivo, fechas, diagnóstico y total. La región solo aparece en registros históricos que ya la tenían.

Rutas: `/`, `/registro`, `/catalogo`, `/mis-solicitudes`, `/notificaciones`, `/agendamiento` y `/mis-revisiones`. Cliente, Operador y Admin pueden usar el carrito y consultar sus compras propias. Las atenciones históricas y su agendamiento conservan acceso de Cliente.

### Operador

Consulta solicitudes y las gestiona: recibida, aceptada, en preparación, lista para retirar y entregada. Puede cancelar con motivo en cualquier etapa anterior a la entrega. No crea órdenes manuales ni las elimina. Como comprador usa el mismo carrito que los demás roles. Las compras mantienen los productos solicitados; las atenciones mecánicas anteriores conservan informe técnico y validaciones.

Incluye **Notificaciones** en el menú izquierdo: correos automáticos al cliente, destinatario, estado real de envío, filtro por número de orden, mensaje desplegable y paginación. Cambiar el estado genera el aviso, sin un botón adicional para enviarlo.

### Admin

Menú izquierdo con **Dashboard, Órdenes, Productos, Registros, Hacer reporte y Auditoría**. Admin consulta órdenes sin crearlas, modificarlas ni eliminarlas. Administra productos y categorías con baja lógica. El formulario nuevo pide nombre, categoría, precio y stock; el ID se asigna al guardar. Un producto activo con cinco unidades o menos aparece como stock bajo, también si se crea inicialmente con esa cantidad. Registros consulta solicitudes locales de acceso; no aprueba usuarios en Entra desde la aplicación.

Incluye **Auditoría**, una línea de tiempo de solo lectura con filtros por orden, usuario, tipo de evento y rango de fechas, paginación y detalle de trazabilidad. El acceso Admin sigue la sección de pantallas del caso; no requiere crear un rol Auditor adicional en Azure.

### Seguimiento de notificaciones y auditoría

Cliente dispone de **Notificaciones** en su header y en `/notificaciones`. Solo consulta avisos dirigidos al correo de su identidad autenticada. Operador consulta el seguimiento de correos al cliente; Admin consulta auditoría, no notificaciones. Las páginas muestran carga, ausencia de resultados y errores personalizados con opción de reintentar. Son adaptables al ancho disponible y utilizan variables del tema existente.

Este módulo utiliza los contratos paginados de `ms-notificaciones-talleres360` y `ms-auditoria-talleres360` de Emmanuel y sus rutas en `talleres360-bff`. Consume `GET /api/notifications` y `GET /api/audit` mediante la misma `VITE_API_BASE_URL`; no incorpora URLs privadas ni claves de microservicios al navegador. El BFF y los servicios aplican los permisos y el filtro por propietario; no se confía en filtrar datos ajenos después de descargarlos.

`ENVIADA` indica aceptación del proveedor SMTP, no recepción en la bandeja. `PENDIENTE` no se presenta como correo enviado. El frontend consulta información almacenada y no crea notificaciones ni modifica auditorías.

No hay botón **Nueva orden**: las solicitudes nuevas se originan en el carrito. El BFF rechaza la creación manual y la eliminación de órdenes para todos los roles.

El dashboard muestra órdenes registradas, entregas e ingresos del período, productos activos con stock de cinco o menos y los eventos recientes de auditoría. Hacer reporte consulta cantidad de entregas e ingresos de un período. Los valores proceden de los servicios conectados al BFF; el alias de auditoría del dashboard se dirige al microservicio de Auditoría en la integración de Emmanuel.

Solo Operador cambia estados. Rechazar o cancelar exige un motivo de al menos diez caracteres. Las fechas de aceptación, entrega y actualización técnica las registra el servidor. Los formularios envían identificadores y cantidades de productos; el precio y el total definitivo los calcula Órdenes con Catálogo.

## Estructura de archivos

| Ruta | Contenido |
| --- | --- |
| `src/main.tsx` | Entrada, inicialización de autenticación y renderizado. |
| `src/App.tsx` | Composición de vistas y acciones del panel. |
| `src/auth/` | Configuración MSAL, sesión, roles, login y obtención de token. |
| `src/api/http.ts` | URL base, access token y manejo común de llamadas HTTP. |
| `src/api/ordersApi.ts` | CRUD y cambio de estado de órdenes (ms-orders). |
| `src/api/comprasApi.ts`, `src/features/compras/` | Catálogo para clientes, carrito, solicitudes de compra y registro institucional. |
| `src/api/productsApi.ts`, `reportsApi.ts` | Catálogo, ventas y auditoría. |
| `src/features/home/` | Inicio, header público y página de agendamiento. |
| `src/features/scheduling/` | Formulario de cinco pasos, calendario, taller único y validaciones. |
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
VITE_API_BASE_URL=https://<API_ID>.execute-api.<REGION>.amazonaws.com/<STAGE>
```

| Variable | Dónde obtenerla |
| --- | --- |
| `VITE_ENTRA_TENANT_ID` | ID del directorio de Microsoft Entra ID. |
| `VITE_SPA_CLIENT_ID` | ID de aplicación del registro SPA. |
| `VITE_API_CLIENT_ID` | ID de aplicación del registro API, distinto al SPA. |
| `VITE_API_BASE_URL` | URL base del stage de API Gateway; no agregar `/api/orders` ni otra ruta. |

Sustituye cada marcador por el valor de tu instalación. Incluye el stage, por ejemplo `/dev`; si utiliza `$default`, elimina `/<STAGE>`. Guarda el archivo. Si Vite estaba ejecutándose, reinícialo para cargar los valores. Para servicios locales usa `VITE_API_BASE_URL=http://localhost:8080`.

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

Para incorporar una actualización publicada, conserva `.env.local`, comprueba
la rama y los cambios locales y ejecuta:

```bash
git pull --ff-only origin fronted
npm ci
npm run dev
```

El frontend local no se despliega en las EC2 de los microservicios.

## Conexión con AWS y CORS

`VITE_API_BASE_URL` apunta a **API Gateway**, que reenvía las peticiones al BFF. Incluye el stage si tiene nombre (por ejemplo `/dev`); con `$default` no se agrega sufijo.

Gateway debe enviar `/api/...` al BFF, sin agregar el prefijo de stage. El autorizador JWT utiliza issuer `https://login.microsoftonline.com/<TENANT_ID>/v2.0`, audiencia del registro API y scope `access_as_user`.

El preflight `OPTIONS` debe responder sin exigir token. Autoriza el origen exacto `http://localhost:5173`, encabezados `authorization, content-type` y métodos `GET, POST, PUT, DELETE, OPTIONS`. El origen también se configura en `CORS_ALLOWED_ORIGINS` del BFF.

Si cambia:

- **Una IP privada de un micro:** actualiza su `ORDERS_URL`, `CATALOG_URL`, `REPORT_URL`, `NOTIFICATIONS_URL` o `AUDIT_URL` en el `.env` del BFF y las referencias correspondientes en Órdenes.
- **La dirección pública del BFF:** actualiza la integración Gateway.
- **Gateway o stage:** actualiza `VITE_API_BASE_URL`.
- **El origen del frontend:** registra su `/redirect.html` en Entra y autoriza ese origen en CORS.
- **RabbitMQ:** sus direcciones solo se configuran en Órdenes, Notificaciones y el administrador del broker; no en `VITE_*`.

## Validaciones y reglas

Las reglas las decide el backend y el front solo las refleja:

- Compras: `RECIBIDA → ACEPTADA → LISTA_PARA_ENTREGA → ENTREGADA`; la intención de aceptación permanece recibida mientras confirma stock. `CANCELADA` representa el rechazo y exige motivo. No hay paso de reparación ni cobro en línea.
- Atención mecánica: `RECIBIDA → ACEPTADA → EN_REPARACION → LISTA_PARA_ENTREGA → ENTREGADA`; permite cancelar antes de entregar y exige informe para marcar lista. Una transición inválida devuelve **409**. El detalle muestra las acciones válidas para cada tipo de solicitud.
- Editar datos generales en `RECIBIDA`; informe técnico en `ACEPTADA`, `EN_REPARACION` o `LISTA_PARA_ENTREGA`.
- Ítems: solo `productId` y `quantity`. El servidor obtiene precios; Catálogo confirma reservas mediante el outbox de Órdenes. La entrega espera la confirmación y no descuenta por segunda vez.
- El carrito permite hasta 50 productos distintos, de 1 a 1000 unidades por producto, sujetos a stock. Envía UUID de solicitud, IDs y cantidades; nombre y correo proceden del JWT. No solicita RUT, teléfono, vehículo, región ni taller.
- El formulario mecánico conserva patente de seis caracteres alfanuméricos separados en pares, modelo con letras/números/espacios, teléfono de ocho dígitos y RUT Módulo 11. Ese algoritmo valida el dígito verificador, no la existencia de una persona. Fecha: desde mañana hasta noventa días.
- Permisos (BFF): compras/agendamientos propios Cliente; órdenes GET/PUT Admin/Operador, POST/DELETE Admin; productos y categorías GET Cliente/Operador/Admin, escritura Admin; reportes y auditoría Admin; notificaciones Operador/Cliente.

Una respuesta 401 requiere revisar sesión, issuer y audiencia; una 403, scope/roles. Se muestran errores personalizados sin exponer endpoints, excepciones ni mensajes internos de autenticación. El build y la comprobación de tipos no sustituyen las pruebas del flujo autenticado en AWS.

## Seguridad de la documentación y configuración

No subas `.env.local`, tokens, archivos PEM, contraseñas, capturas con credenciales ni
datos personales. Los IDs de aplicación no son contraseñas, pero este README usa
marcadores para no identificar una instalación concreta. Si un secreto ya fue
publicado, retirarlo del README no basta: revócalo o rótalo y revisa el historial de Git.
