// Solo controla la interfaz. El BFF verifica el JWT, el tenant y los roles.
const PATRON_CORREO = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@(duocuc[.]cl|[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?[.]onmicrosoft[.]com)$/i;

export function normalizarCorreoPermitido(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined;
  const correo = valor.trim().toLowerCase();
  // Un UPN invitado #EXT# no es el correo real de la persona.
  if (correo.length > 150 || correo.includes('#ext#') || !PATRON_CORREO.test(correo)) return undefined;
  return correo;
}

export function obtenerCorreoPermitido(...valores: unknown[]): string | undefined {
  return valores.map(normalizarCorreoPermitido).find((correo) => correo !== undefined);
}
