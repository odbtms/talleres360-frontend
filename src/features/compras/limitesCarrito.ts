import type { ProductoCatalogo } from '../../types';

export function maximoSolicitable(producto?: ProductoCatalogo): number {
  if (!producto?.active || !producto.available || !Number.isSafeInteger(producto.maximoSolicitable)) return 0;
  return Math.max(0, Math.min(1000, producto.maximoSolicitable));
}
