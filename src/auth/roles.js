// Los app roles estan en api-cloud, por eso vienen en el access token (no en el id token)
export function rolesFromToken(accessToken) {
  try {
    const payload = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json).roles ?? [];
  } catch {
    return [];
  }
}

// Replica las reglas del BFF (SecurityConfig). Solo oculta botones: quien decide es el backend
export function permissionsFor(roles) {
  const has = (...allowed) => allowed.some((role) => roles.includes(role));
  return {
    canWrite: has('Admin', 'Operador'),
    canDelete: has('Admin'),
  };
}
