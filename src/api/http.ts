const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

// Punto de enganche para MSAL: cuando haya login, se registra una funcion que devuelve el access token.
type TokenProvider = () => Promise<string | null>;
type RequestOptions = { method?: string; body?: unknown; signal?: AbortSignal; anonymous?: boolean };

let tokenProvider: TokenProvider = async () => null;

/** Mensajes seguros para la interfaz; no expone endpoints ni respuestas internas. */
export class ErrorApi extends Error {
  constructor(mensaje: string, public readonly estado = 0, public readonly codigo?: string) { super(mensaje); this.name = 'ErrorApi'; }
}

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

export async function request<T>(path: string, { method = 'GET', body, signal, anonymous = false }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let token: string | null;
  try { token = anonymous ? null : await tokenProvider(); }
  catch { throw new ErrorApi('No se pudo validar tu sesión. Vuelve a iniciar sesión.'); }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try { res = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }); } catch (error) {
    if (signal?.aborted) throw error;
    throw new ErrorApi('No se pudo conectar con el servicio. Comprueba tu conexión e inténtalo nuevamente.');
  }

  if (res.status === 204) return null as T;
  const data = (await res.json().catch(() => null)) as { detail?: string } | T | null;
  if (!res.ok) {
    // Solo códigos de negocio conocidos; nunca mostrar respuestas internas arbitrarias.
    const problema = data as { codigo?: unknown; productoId?: unknown; nombreProducto?: unknown } | null;
    const mensajes: Record<string, string> = {
      STOCK_INSUFICIENTE: 'No hay stock suficiente para la cantidad solicitada. Reduce la cantidad e inténtalo nuevamente.',
      PRODUCTO_NO_DISPONIBLE: 'Este producto está deshabilitado o ya no está disponible. Retíralo del carrito.',
      ACEPTACION_SIN_STOCK: 'No hay disponibilidad suficiente para aceptar esta solicitud. Permanece recibida. Puedes rechazarla indicando el motivo o reintentar cuando haya stock.',
    };
    if (res.status === 409 && typeof problema?.codigo === 'string' && Object.hasOwn(mensajes, problema.codigo)) {
      const producto = typeof problema.productoId === 'number' && Number.isSafeInteger(problema.productoId) && problema.productoId > 0 ? `Producto #${problema.productoId}: ` : '';
      const nombre = typeof problema.nombreProducto === 'string' ? problema.nombreProducto.trim().slice(0, 120) : '';
      throw new ErrorApi((nombre ? `${nombre}: ` : producto) + mensajes[problema.codigo], 409, problema.codigo);
    }
    if (res.status === 401) throw new ErrorApi('Tu sesión venció o no pudo validarse. Cierra sesión e ingresa nuevamente.', 401);
    if (res.status === 403) throw new ErrorApi('Tu cuenta no tiene permisos para consultar esta información o realizar esta acción.', 403);
    if (res.status === 400) throw new ErrorApi('No se pudo completar la solicitud. Revisa los datos ingresados.', 400);
    if (res.status === 404) throw new ErrorApi('No encontramos la información solicitada. Actualiza la página.', 404);
    if (res.status === 409) throw new ErrorApi('Los datos o la disponibilidad cambiaron. Actualiza y revisa tu solicitud.', 409);
    if (res.status >= 500) throw new ErrorApi('El servicio no está disponible temporalmente. Inténtalo nuevamente en unos momentos.', res.status);
    throw new ErrorApi('No se pudo completar la operación. Inténtalo nuevamente.', res.status);
  }
  return data as T;
}
