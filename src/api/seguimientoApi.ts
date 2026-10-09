import { request } from './http';
import { TAMANO_PAGINA } from '../features/seguimiento/constants';
import type { EventoAuditoria, FiltrosAuditoria, Notificacion, Pagina } from '../features/seguimiento/types';

// Fechas elegidas en la zona local del navegador; hasta es exclusivo e incluye el último día completo.
function fechaLimite(fecha: string, siguienteDia: boolean): string {
  const [ano, mes, dia] = fecha.split('-').map(Number);
  return new Date(ano, mes - 1, dia + (siguienteDia ? 1 : 0)).toISOString();
}

export const seguimientoApi = {
  notificaciones(orderId: string, page: number, signal: AbortSignal): Promise<Pagina<Notificacion>> {
    const query = new URLSearchParams({ page: String(page), size: String(TAMANO_PAGINA) });
    if (orderId) query.set('orderId', orderId);
    return request(`/api/notifications?${query}`, { signal });
  },
  auditoria(filtros: FiltrosAuditoria, page: number, signal: AbortSignal): Promise<Pagina<EventoAuditoria>> {
    const query = new URLSearchParams({ page: String(page), size: String(TAMANO_PAGINA) });
    if (filtros.orderId) query.set('orderId', filtros.orderId);
    if (filtros.actor.trim()) query.set('actor', filtros.actor.trim());
    if (filtros.type) query.set('type', filtros.type);
    if (filtros.desde) query.set('from', fechaLimite(filtros.desde, false));
    if (filtros.hasta) query.set('to', fechaLimite(filtros.hasta, true));
    return request(`/api/audit?${query}`, { signal });
  },
};
