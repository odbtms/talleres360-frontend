import { request } from './http';

export interface SalesReport { from: string; to: string; deliveredOrders: number; revenue: number; }
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
  audit: (orderId?: number) =>
    request<AuditEvent[]>(`/api/reports/audit${orderId ? `?orderId=${orderId}` : ''}`),
};
