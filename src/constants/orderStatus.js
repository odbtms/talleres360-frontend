export const STATUS_LABELS = {
  RECIBIDA: 'Recibida',
  ACEPTADA: 'Aceptada',
  EN_REPARACION: 'En reparación',
  LISTA_PARA_ENTREGA: 'Lista para entrega',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

// Mismas transiciones que OrderStatus.java en ms-talleres360-orders
export const NEXT_STATUS = {
  RECIBIDA: ['ACEPTADA', 'CANCELADA'],
  ACEPTADA: ['EN_REPARACION', 'CANCELADA'],
  EN_REPARACION: ['LISTA_PARA_ENTREGA', 'CANCELADA'],
  LISTA_PARA_ENTREGA: ['ENTREGADA', 'CANCELADA'],
  ENTREGADA: [],
  CANCELADA: [],
};
