import type { OrderStatus } from '../types';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  RECIBIDA: 'Recibida',
  ACEPTADA: 'Aceptada',
  EN_REPARACION: 'En reparación',
  LISTA_PARA_ENTREGA: 'Lista para entrega',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

// Mismas transiciones que OrderStatus.java en ms-talleres360-orders
export const NEXT_STATUS: Record<OrderStatus, readonly OrderStatus[]> = {
  RECIBIDA: ['ACEPTADA', 'CANCELADA'],
  ACEPTADA: ['EN_REPARACION', 'CANCELADA'],
  EN_REPARACION: ['LISTA_PARA_ENTREGA', 'CANCELADA'],
  LISTA_PARA_ENTREGA: ['ENTREGADA', 'CANCELADA'],
  ENTREGADA: [],
  CANCELADA: [],
};
