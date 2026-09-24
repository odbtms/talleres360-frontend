import { request } from './http';
import type { Order, OrderFilters, OrderPayload, OrderStatus, TechnicalUpdatePayload } from '../types';

function toQuery({ status = '', from = '', to = '' }: Partial<OrderFilters>) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (from) params.set('from', `${from}T00:00:00`);
  if (to) params.set('to', `${to}T23:59:59`);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const ordersApi = {
  list: (filters: Partial<OrderFilters> = {}) => request<Order[]>(`/api/orders${toQuery(filters)}`),
  get: (id: number) => request<Order>(`/api/orders/${id}`),
  create: (order: OrderPayload) => request<Order>('/api/orders', { method: 'POST', body: order }),
  update: (id: number, order: OrderPayload) => request<Order>(`/api/orders/${id}`, { method: 'PUT', body: order }),
  changeStatus: (id: number, status: OrderStatus) =>
    request<Order>(`/api/orders/${id}/status`, { method: 'PUT', body: { status } }),
  updateTechnical: (id: number, payload: TechnicalUpdatePayload) =>
    request<Order>(`/api/orders/${id}/technical`, { method: 'PUT', body: payload }),
  remove: (id: number) => request<null>(`/api/orders/${id}`, { method: 'DELETE' }),
};
