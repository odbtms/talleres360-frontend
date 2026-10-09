const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

// Punto de enganche para MSAL: cuando haya login, se registra una funcion que devuelve el access token.
type TokenProvider = () => Promise<string | null>;
type RequestOptions = { method?: string; body?: unknown; signal?: AbortSignal };

let tokenProvider: TokenProvider = async () => null;

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

export async function request<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let token: string | null;
  try { token = await tokenProvider(); }
  catch { throw new Error('No se pudo validar tu sesión. Vuelve a iniciar sesión.'); }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try { res = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }); } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('No se pudo conectar con el servicio. Inténtalo nuevamente.');
  }

  if (res.status === 204) return null as T;
  const data = (await res.json().catch(() => null)) as { detail?: string } | T | null;
  if (!res.ok) {
    if (res.status === 401) throw new Error('Tu sesión venció. Cierra sesión e ingresa nuevamente.');
    if (res.status === 403) throw new Error('Tu cuenta no tiene permisos para realizar esta acción.');
    if (res.status === 400) throw new Error('No se pudo guardar. Revisa los datos ingresados.');
    if (res.status === 404) throw new Error('No encontramos el registro solicitado. Actualiza la página.');
    if (res.status === 409) throw new Error('No se pudo completar la operación: los datos o el stock cambiaron. Actualiza y revisa el estado de la solicitud.');
    throw new Error('No se pudo completar la operación. Inténtalo nuevamente.');
  }
  return data as T;
}
