const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');

// Punto de enganche para MSAL: cuando haya login, se registra una funcion que devuelve el access token.
let tokenProvider = async () => null;

export function setTokenProvider(provider) {
  tokenProvider = provider;
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = await tokenProvider();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.detail ?? `Error ${res.status} llamando a ${path}`);
  }
  return data;
}
