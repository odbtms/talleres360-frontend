// El alta solo admite Duoc. El login de cuentas ya habilitadas es otra política.
export function correoRegistro(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined;
  const correo = valor.trim().toLowerCase();
  if (correo.length > 150 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@duocuc[.]cl$/.test(correo)) return undefined;
  const local = correo.split('@')[0];
  return local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') ? correo : undefined;
}

export function obtenerCorreoRegistro(...valores: unknown[]): string | undefined {
  return valores.map(correoRegistro).find(correo => correo !== undefined);
}
