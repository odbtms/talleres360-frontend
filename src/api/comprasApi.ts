import { request } from './http';
import type { Order, SolicitudRegistro } from '../types';
export interface CompraInput { solicitudId: string; nombre: string; rut: string; telefono: string; tallerId: number; productos: { productoId: number; cantidad: number }[]; }
export const comprasApi = {
  crear: (input: CompraInput) => request<Order>('/api/compras', { method: 'POST', body: input }),
  propias: () => request<Order[]>('/api/compras'),
};
export const registrosApi = {
  solicitar: (input: { nombre: string; correo: string }) => request<void>('/api/registros', { method: 'POST', body: input, anonymous: true }),
  listar: () => request<SolicitudRegistro[]>('/api/registros'),
};
