import type { EstadoNotificacion, FiltrosAuditoria } from './types';

export const TAMANO_PAGINA = 20;
export const FILTROS_AUDITORIA: FiltrosAuditoria = { orderId: '', actor: '', type: '', desde: '', hasta: '' };
export const EVENTOS: Readonly<Record<string, string>> = {
  CREADA: 'Orden creada', ACTUALIZADA: 'Orden actualizada', ACEPTADA: 'Solicitud aceptada',
  EN_REPARACION: 'En reparación', LISTA_PARA_ENTREGA: 'Lista para entrega', ENTREGADA: 'Vehículo entregado',
  CANCELADA: 'Solicitud cancelada', ELIMINADA: 'Orden eliminada', INFORME_ACTUALIZADO: 'Informe actualizado',
};
export const ESTADOS_NOTIFICACION: Record<EstadoNotificacion, string> = {
  PENDIENTE: 'Pendiente de envío', REINTENTO: 'Reintentando envío', ENVIADA: 'Enviada al proveedor',
  GENERADA: 'Ticket generado', FALLIDA: 'No se pudo enviar',
};
