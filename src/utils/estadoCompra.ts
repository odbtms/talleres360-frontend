import type { Order } from '../types';
export function estadoCompra(o: Order): string {
  if (o.aceptacionPendiente) return 'Confirmando stock';
  return ({ RECIBIDA: 'Pendiente de revisión', ACEPTADA: 'Aceptada · En espera', LISTA_PARA_ENTREGA: 'Lista para retirar',
    ENTREGADA: 'Entregada', CANCELADA: 'Rechazada', EN_REPARACION: 'En preparación' })[o.status];
}
