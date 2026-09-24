const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');

// Punto de enganche para MSAL: cuando haya login, se registra una funcion que devuelve el access token.
type TokenProvider = () => Promise<string | null>;
type RequestOptions = { method?: string; body?: unknown };

let tokenProvider: TokenProvider = async () => null;

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

export async function request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = await tokenProvider();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null as T;
  const data = (await res.json().catch(() => null)) as { detail?: string } | T | null;
  if (!res.ok) {
    const detail = data && typeof data === 'object' && 'detail' in data ? data.detail : undefined;
    throw new Error(detail ?? `Error ${res.status} llamando a ${path}`);
  }
  return data as T;
}
