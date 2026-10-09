import type { OpcionGestion, VistaGestion } from '../types/gestion';

export const OPCIONES_GESTION: readonly OpcionGestion[] = [
  { id: 'dashboard', etiqueta: 'Dashboard', descripcion: 'Resumen del taller', roles: ['Admin'] },
  { id: 'orders', etiqueta: 'Órdenes', descripcion: 'Solicitudes y trabajos', roles: ['Admin', 'Operador'] },
  { id: 'products', etiqueta: 'Productos', descripcion: 'Catálogo y existencias', roles: ['Admin'] },
  { id: 'reports', etiqueta: 'Hacer reporte', descripcion: 'Ventas por período', roles: ['Admin'] },
  { id: 'notifications', etiqueta: 'Notificaciones', descripcion: 'Tickets del taller', roles: ['Operador'] },
  { id: 'audit', etiqueta: 'Auditoría', descripcion: 'Trazabilidad de órdenes', roles: ['Admin'] },
  { id: 'new-order', etiqueta: 'Nueva orden', descripcion: 'Registrar una atención', roles: ['Admin', 'Operador'] },
];

export const TITULOS_GESTION: Record<VistaGestion, string> = {
  dashboard: 'Dashboard',
  orders: 'Órdenes de trabajo',
  products: 'Productos y stock',
  reports: 'Reportes de ventas',
  notifications: 'Notificaciones',
  audit: 'Auditoría',
};
