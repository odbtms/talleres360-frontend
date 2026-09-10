import { request } from './http';

function toQuery({ status, from, to }) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (from) params.set('from', `${from}T00:00:00`);
  if (to) params.set('to', `${to}T23:59:59`);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const ordersApi = {
  list: (filters = {}) => request(`/api/orders${toQuery(filters)}`),
  get: (id) => request(`/api/orders/${id}`),
  create: (order) => request('/api/orders', { method: 'POST', body: order }),
  update: (id, order) => request(`/api/orders/${id}`, { method: 'PUT', body: order }),
  changeStatus: (id, status) => request(`/api/orders/${id}/status`, { method: 'PUT', body: { status } }),
  remove: (id) => request(`/api/orders/${id}`, { method: 'DELETE' }),
};
