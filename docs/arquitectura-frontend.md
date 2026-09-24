# Arquitectura del frontend Talleres360

## Propósito

Esta guía define cómo organizar el frontend de Talleres360 para mantener separadas la interfaz, las reglas de negocio, la autenticación, el estado y las llamadas HTTP.

Los objetivos son:

- Evitar URLs, roles, estados y estilos repetidos dentro de los componentes.
- Reutilizar componentes visuales sin acoplarlos al negocio.
- Mantener las páginas pequeñas y fáciles de leer.
- Facilitar pruebas y cambios futuros.
- Evitar tanto el código duplicado como la sobreingeniería.

La organización recomendada es por funcionalidad. Cada módulo de negocio conserva juntos sus componentes, hooks, servicios, tipos y constantes.

## Estructura propuesta

```text
src/
├─ app/
│  ├─ App.tsx
│  ├─ router.tsx
│  └─ providers.tsx
│
├─ assets/
│  ├─ images/
│  └─ icons/
│
├─ components/
│  ├─ ui/
│  │  ├─ Button/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Button.types.ts
│  │  │  └─ index.ts
│  │  ├─ Input/
│  │  ├─ Select/
│  │  ├─ Modal/
│  │  ├─ Alert/
│  │  ├─ Badge/
│  │  ├─ Spinner/
│  │  ├─ EmptyState/
│  │  └─ ConfirmDialog/
│  │
│  └─ feedback/
│     ├─ ErrorMessage.tsx
│     └─ LoadingScreen.tsx
│
├─ layouts/
│  ├─ AppLayout.tsx
│  ├─ AuthLayout.tsx
│  ├─ Header.tsx
│  └─ Navigation.tsx
│
├─ features/
│  ├─ auth/
│  │  ├─ components/
│  │  │  ├─ LoginButton.tsx
│  │  │  ├─ LogoutButton.tsx
│  │  │  └─ RoleGuard.tsx
│  │  ├─ hooks/
│  │  │  ├─ useAuth.ts
│  │  │  └─ useAuthorization.ts
│  │  ├─ services/
│  │  │  └─ auth.service.ts
│  │  ├─ types/
│  │  │  └─ auth.types.ts
│  │  └─ constants/
│  │     └─ roles.ts
│  │
│  └─ orders/
│     ├─ pages/
│     │  ├─ OrdersPage.tsx
│     │  └─ OrderDetailPage.tsx
│     ├─ components/
│     │  ├─ OrderList.tsx
│     │  ├─ OrderCard.tsx
│     │  ├─ OrderTable.tsx
│     │  ├─ OrderForm.tsx
│     │  ├─ OrderFilters.tsx
│     │  ├─ OrderDetail.tsx
│     │  └─ OrderStatusBadge.tsx
│     ├─ hooks/
│     │  ├─ useOrders.ts
│     │  ├─ useOrder.ts
│     │  └─ useOrderForm.ts
│     ├─ services/
│     │  └─ orders.service.ts
│     ├─ types/
│     │  ├─ order.types.ts
│     │  └─ order.dto.ts
│     ├─ constants/
│     │  ├─ order-status.ts
│     │  └─ order-options.ts
│     ├─ utils/
│     │  ├─ order-permissions.ts
│     │  └─ order-formatters.ts
│     └─ index.ts
│
├─ lib/
│  ├─ api/
│  │  ├─ http-client.ts
│  │  ├─ api-error.ts
│  │  └─ endpoints.ts
│  ├─ azure/
│  │  └─ msal-config.ts
│  └─ utils/
│     ├─ cn.ts
│     └─ date.ts
│
├─ config/
│  ├─ env.ts
│  └─ app-config.ts
│
├─ routes/
│  ├─ route-paths.ts
│  └─ ProtectedRoute.tsx
│
├─ types/
│  ├─ api.types.ts
│  └─ common.types.ts
│
├─ styles/
│  └─ globals.css
│
├─ main.tsx
└─ vite-env.d.ts
```

## Contenido y responsabilidad de cada carpeta

### `app`

Contiene el ensamblaje principal de la aplicación.

- `App.tsx` define el componente raíz.
- `router.tsx` declara las rutas y sus layouts.
- `providers.tsx` reúne proveedores globales, por ejemplo MSAL, estado remoto o manejo global de errores.

Esta carpeta no debe contener reglas del negocio de órdenes ni llamadas HTTP específicas.

### `assets`

Contiene archivos estáticos que forman parte del frontend:

- Imágenes.
- Ilustraciones.
- Iconos propios.
- Logotipos.

No se deben guardar aquí archivos de configuración, respuestas JSON ni datos que deban llegar desde la API.

### `components/ui`

Contiene componentes visuales reutilizables que no conocen el negocio de Talleres360.

Ejemplos:

- `Button`.
- `Input`.
- `Select`.
- `Modal`.
- `Alert`.
- `Badge`.
- `Spinner`.
- `EmptyState`.
- `ConfirmDialog`.

Un botón genérico debería recibir propiedades como variante, tamaño, estado de carga y estado deshabilitado. Las páginas no deberían copiar repetidamente las mismas clases de Tailwind.

Variantes razonables:

- `primary`.
- `secondary`.
- `danger`.
- `ghost`.

No se recomienda crear componentes llamados `BlueButton` o `LargeRedButton`, porque quedan acoplados a una apariencia. Tampoco corresponde poner `DeleteOrderButton` en `components/ui`, porque esa acción pertenece al dominio de órdenes.

Cada componente reutilizable puede exponer un `index.ts` para mantener imports claros:

```tsx
import { Button } from "@/components/ui/Button";
```

### `components/feedback`

Contiene componentes transversales para comunicar estados al usuario:

- Error general.
- Carga de pantalla.
- Operación exitosa.
- Estado vacío.

La lógica que determina el error permanece en los hooks o servicios. Estos componentes solo lo presentan.

### `layouts`

Define la estructura visual compartida entre páginas.

- `AppLayout` puede contener cabecera, navegación y área principal.
- `AuthLayout` organiza las vistas públicas de autenticación.
- `Header` muestra identidad, rol y cierre de sesión.
- `Navigation` muestra accesos permitidos según el usuario.

Los layouts no deberían cargar órdenes ni implementar formularios del negocio.

### `features`

Agrupa el código por funcionalidad de negocio. Esta es la carpeta principal para evitar mezclar responsabilidades.

Cada funcionalidad puede tener:

- `pages`: pantallas completas del módulo.
- `components`: partes visuales propias del módulo.
- `hooks`: coordinación de estado y operaciones.
- `services`: comunicación con servicios externos.
- `types`: modelos y contratos TypeScript.
- `constants`: valores cerrados y reutilizados.
- `utils`: funciones puras específicas del dominio.

### `features/auth`

Contiene todo lo relacionado con autenticación y autorización:

- Inicio y cierre de sesión.
- Obtención del usuario autenticado.
- Lectura de roles del token.
- Comprobación de permisos.
- Protección visual de acciones.

`RoleGuard` puede decidir si una sección debe mostrarse, pero la seguridad real siempre debe seguir validándose en el BFF. Ocultar un botón no constituye una medida de seguridad suficiente.

`roles.ts` concentra los roles válidos para evitar repetir strings como `Admin`, `Operador` y `Cliente` en distintos componentes.

### `features/orders/pages`

Contiene las páginas completas relacionadas con órdenes.

Una página debería coordinar los componentes y estados principales:

- Invocar el hook apropiado.
- Mostrar filtros.
- Mostrar listado o detalle.
- Elegir entre carga, error, vacío y contenido.
- Abrir formularios o confirmaciones.

Una página no debería construir URLs, interpretar respuestas HTTP ni contener toda la lógica de autorización.

### `features/orders/components`

Contiene componentes propios de órdenes:

- `OrderList`: selecciona la representación de una colección.
- `OrderCard`: representación compacta o móvil.
- `OrderTable`: representación tabular para pantallas amplias.
- `OrderForm`: captura datos de creación o edición.
- `OrderFilters`: filtros por estado y fecha.
- `OrderDetail`: presenta una orden seleccionada.
- `OrderStatusBadge`: representa visualmente el estado.

Estos componentes pueden usar los componentes genéricos de `components/ui`, pero no deberían duplicar botones, inputs o modales base.

### `features/orders/hooks`

Coordina servicios, estado y acciones del módulo.

- `useOrders` carga y filtra una colección de órdenes.
- `useOrder` gestiona una orden individual.
- `useOrderForm` controla el formulario y su validación.

Un hook puede exponer:

- Datos.
- Estado de carga.
- Error normalizado.
- Funciones para refrescar.
- Funciones para crear, actualizar o eliminar.

Los componentes reciben esta información y se enfocan en presentar la interfaz.

### `features/orders/services`

Centraliza las operaciones HTTP del módulo:

- Obtener órdenes.
- Obtener una orden por ID.
- Crear una orden.
- Editar una orden.
- Cambiar su estado.
- Eliminar una orden.

Los servicios reciben y devuelven datos tipados. No abren modales, no muestran alertas y no administran estado visual.

### `features/orders/types`

Organiza los contratos TypeScript del módulo.

- `order.types.ts` contiene el modelo que utiliza la interfaz.
- `order.dto.ts` contiene las estructuras de entrada y salida de la API.

Separar el modelo visual de los DTO es útil cuando el backend usa nombres o formatos que no conviene propagar por todos los componentes.

No es necesario duplicarlos si ambos contratos son realmente iguales. La separación debe responder a una diferencia real, no a una regla automática.

### `features/orders/constants`

Contiene valores cerrados o repetidos:

- Estados válidos de una orden.
- Etiquetas visibles por estado.
- Opciones de filtros.
- Transiciones permitidas.

No todos los textos deben convertirse en constantes. Un título que se usa una sola vez puede permanecer cerca del componente que lo muestra.

### `features/orders/utils`

Contiene funciones puras específicas de órdenes:

- Calcular acciones permitidas según rol y estado.
- Formatear valores para presentación.
- Convertir un DTO al modelo utilizado por la UI.

Estas funciones no deberían usar hooks de React ni realizar llamadas HTTP.

### `lib/api`

Contiene la infraestructura HTTP compartida por todas las funcionalidades.

- `http-client.ts` agrega la URL base, el token Bearer, encabezados comunes y procesamiento de respuestas.
- `api-error.ts` define un error consistente para la aplicación.
- `endpoints.ts` centraliza las rutas del backend.

La URL completa de API Gateway nunca debería aparecer dentro de una página o componente. Debe provenir de la configuración del entorno.

Ejemplos de endpoints centralizados:

```text
ORDERS: /api/orders
ORDER_BY_ID: /api/orders/:id
```

La función que necesite un ID puede construir el segmento dinámico sin repetir la ruta base.

### `lib/azure`

Contiene la configuración técnica de MSAL:

- Authority.
- Client ID de la SPA.
- Scopes solicitados.
- Redirect URI.
- Parámetros de caché.

Los componentes no deberían repetir esta configuración.

### `lib/utils`

Contiene utilidades realmente transversales:

- Combinar clases condicionales.
- Formatear fechas comunes.
- Operaciones pequeñas sin dependencia del negocio.

Si una utilidad solo tiene sentido para órdenes, debe quedarse en `features/orders/utils`.

### `config`

Centraliza la configuración general de la aplicación.

`env.ts` lee y valida las variables de Vite:

- `VITE_API_BASE_URL`.
- `VITE_ENTRA_TENANT_ID`.
- `VITE_SPA_CLIENT_ID`.
- `VITE_API_CLIENT_ID`.

El resto de la aplicación debería importar una configuración tipada en lugar de acceder repetidamente a `import.meta.env`.

`app-config.ts` puede contener valores generales no secretos, como nombre de la aplicación o configuración de paginación.

Los secretos nunca deben incluirse en variables de frontend: todo lo que compila Vite puede ser leído por el navegador.

### `routes`

Contiene las rutas y reglas de navegación.

- `route-paths.ts` centraliza rutas como `/orders` o `/login`.
- `ProtectedRoute.tsx` impide mostrar páginas protegidas sin autenticación.

Las rutas no deberían escribirse manualmente en múltiples botones y enlaces.

### `types`

Contiene tipos que se comparten entre varios módulos:

- Respuestas paginadas.
- Errores comunes.
- Identificadores.
- Tipos de utilidad.

Los tipos exclusivos de órdenes o autenticación deben quedarse dentro de sus respectivas funcionalidades.

### `styles`

Contiene estilos globales y la integración del tema de Tailwind.

Se debe usar para:

- Variables y tokens visuales.
- Estilos base de `body`.
- Tipografía general.
- Normalizaciones necesarias.

No debe convertirse en un archivo con reglas específicas para cada componente.

## Organización de Tailwind CSS

Los valores compartidos deben expresarse mediante el tema:

- Colores principales.
- Color de peligro.
- Fondos y superficies.
- Bordes.
- Radios.
- Sombras.
- Anchos máximos.
- Escala de espaciado.

Se prefieren clases semánticas y escalas existentes:

```text
bg-primary
text-primary-foreground
border-border
bg-destructive
rounded-lg
max-w-screen-xl
```

Se deben evitar valores arbitrarios repetidos:

```text
bg-[#174EA6]
w-[347px]
rounded-[13px]
text-[#212121]
```

Un valor arbitrario puede ser válido si responde a una necesidad única y comprobada. Si se repite, debe incorporarse al tema.

## Estrategia de estado

### Estado local

Debe permanecer dentro del componente cuando solo afecta a esa pieza de interfaz:

- Modal abierto o cerrado.
- Fila seleccionada.
- Valor temporal de un input.
- Pestaña activa.

### Custom hooks

Se utilizan cuando el estado coordina una funcionalidad:

- Lista de órdenes.
- Filtros.
- Carga y error.
- Creación o actualización.
- Refresco de datos.

### Estado global

Solo se justifica para información realmente transversal:

- Usuario autenticado.
- Sesión y roles.
- Preferencia global de tema.

No se debería agregar Redux, Zustand u otra librería únicamente para guardar un modal o una lista usada en una sola página.

### Estado remoto

Los datos del backend no deberían copiarse innecesariamente en distintos estados locales. Si el proyecto usa una librería como TanStack Query, esta puede administrar caché, reintentos, invalidación y sincronización.

Para el alcance actual, un custom hook con carga, error y refresco puede ser suficiente. Introducir una librería adicional solo se justifica cuando la complejidad real lo requiere.

## Flujo de comunicación recomendado

```text
OrdersPage
   ↓ usa
useOrders
   ↓ llama
orders.service
   ↓ utiliza
http-client
   ↓ envía token y request
API Gateway
```

En sentido inverso:

```text
Respuesta HTTP
   ↓
http-client normaliza éxito o error
   ↓
orders.service transforma el contrato si corresponde
   ↓
useOrders actualiza datos, carga y error
   ↓
OrdersPage y sus componentes renderizan el estado
```

## Reglas para decidir cuándo crear un componente

Se recomienda extraer un componente cuando se cumpla al menos una condición:

- Se usa en dos o más lugares.
- Tiene lógica propia.
- Tiene varias variantes.
- Dificulta leer la página principal.
- Es probable que cambie independientemente.
- Puede probarse como una unidad clara.

No se debe extraer automáticamente cada bloque de JSX. Un bloque corto, usado una sola vez y sin lógica propia puede permanecer en su página.

## Reglas para evitar hardcodeo

Evitar hardcodear significa centralizar valores que cambian, se repiten o forman parte de un contrato. No significa convertir cada texto en una constante.

Se deben centralizar:

- URL base de la API.
- Endpoints.
- IDs y configuración pública de Azure mediante variables de entorno.
- Roles.
- Estados de órdenes.
- Rutas del frontend.
- Variantes visuales repetidas.
- Mensajes de error reutilizados.
- Reglas de permisos.

Pueden permanecer cerca del componente:

- Títulos utilizados una sola vez.
- Texto explicativo específico de una vista.
- Etiquetas que no forman parte de un contrato compartido.
- Pequeñas decisiones visuales que no se repiten.

## Reglas de dependencia

Para mantener límites claros:

- `components/ui` no importa desde `features`.
- Una funcionalidad puede importar desde `components/ui`, `lib`, `config` y `types` compartidos.
- `lib/api` no importa componentes React.
- Los servicios no abren modales ni muestran notificaciones.
- Los componentes no construyen URLs completas.
- Los hooks no contienen clases Tailwind.
- Los tipos de un módulo no deben moverse a `types` globales si ningún otro módulo los utiliza.

## Exportaciones con `index.ts`

Los archivos `index.ts` pueden simplificar imports públicos de una carpeta:

```tsx
import { OrderList, OrderStatusBadge } from "@/features/orders";
```

No conviene crear archivos barril en cada subcarpeta sin necesidad. Un exceso de exportaciones indirectas puede producir dependencias circulares y dificultar localizar el origen real.

## Orden recomendado de implementación

1. Configurar aliases de importación como `@/`.
2. Crear `config/env.ts` y validar variables de entorno.
3. Centralizar el cliente HTTP y los endpoints.
4. Definir roles, estados y tipos de órdenes.
5. Extraer componentes base realmente repetidos, empezando por `Button`, `Input`, `Alert` y `Spinner`.
6. Crear los servicios de órdenes.
7. Crear los hooks de órdenes.
8. Dividir la página de órdenes en filtros, listado, detalle y formulario.
9. Aplicar permisos por rol en componentes y navegación.
10. Centralizar tokens visuales de Tailwind cuando aparezca repetición real.
11. Comprobar carga, error, vacío, éxito, responsive y accesibilidad.

## Criterios de mantenimiento

Antes de agregar un archivo nuevo, se debe responder:

- ¿Qué responsabilidad única tendrá?
- ¿Pertenece a una funcionalidad o es realmente compartido?
- ¿Existe ya un componente, tipo o constante equivalente?
- ¿La extracción reduce duplicación o solo agrega navegación?
- ¿Puede probarse sin depender de toda la aplicación?

La estructura debe crecer junto con el proyecto. No es necesario crear carpetas vacías ni componentes que todavía no tienen un uso real.

## Resumen de límites

```text
Interfaz reutilizable  → components/ui
Autenticación y roles  → features/auth
Órdenes                → features/orders
Configuración          → config
Comunicación HTTP      → lib/api
Configuración de MSAL  → lib/azure
Diseño compartido      → layouts
Rutas                  → routes
Estilos globales       → styles
```

Mantener estos límites evita que una página mezcle JSX, llamadas HTTP, autenticación, reglas de roles, transformación de datos y estilos repetidos.
