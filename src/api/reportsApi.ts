import { request } from './http';

export interface SalesReport { from: string; to: string; deliveredOrders: number; revenue: number; }
export interface VentasDia { fecha: string; entregas: number; monto: number }
export interface TiempoDia { fecha: string; entregasMedidas: number; promedioMinutos: number }
export interface ProductoKpi { productoId: number; nombre: string; unidades: number }
export interface ReporteKpis {
  resumen: SalesReport;
  ventasPorDia: VentasDia[];
  tiemposPorDia: TiempoDia[];
  productos: ProductoKpi[];
  pedidosConDetalle: number;
  entregasMedidas: number;
  promedioMinutos: number | null;
}
export interface AuditEvent {
  eventId: string;
  orderId: number;
  type: string;
  actor: string;
  reason?: string | null;
  occurredAt: string;
  status: string;
  total: number;
}
export const reportsApi = {
  sales: (from: string, to: string) =>
    request<SalesReport>(`/api/reports/sales?${new URLSearchParams({ from, to })}`),
  kpis: (from: string, to: string, signal: AbortSignal) => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago';
    return request<ReporteKpis>(`/api/reports/kpis?${new URLSearchParams({ from, to, zone })}`, { signal });
  },
  audit: (orderId?: number) =>
    request<AuditEvent[]>(`/api/reports/audit${orderId ? `?orderId=${orderId}` : ''}`),
};
