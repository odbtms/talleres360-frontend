import type { OpcionGestion, VistaGestion } from '../types/gestion';

export const OPCIONES_GESTION: readonly OpcionGestion[] = [
  { id: 'dashboard', etiqueta: 'Dashboard', descripcion: 'Resumen del taller', roles: ['Admin', 'Operador'] },
  { id: 'orders', etiqueta: 'Órdenes', descripcion: 'Solicitudes y trabajos', roles: ['Admin', 'Operador'] },
  { id: 'products', etiqueta: 'Productos', descripcion: 'Catálogo y existencias', roles: ['Admin'] },
  { id: 'registros', etiqueta: 'Registros', descripcion: 'Solicitudes de acceso', roles: ['Admin'] },
  { id: 'reports', etiqueta: 'Hacer reporte', descripcion: 'Ventas por período', roles: ['Admin'] },
  { id: 'notifications', etiqueta: 'Notificaciones', descripcion: 'Correos automáticos a clientes', roles: ['Operador'] },
  { id: 'audit', etiqueta: 'Auditoría', descripcion: 'Trazabilidad de órdenes', roles: ['Admin'] },
];

export const TITULOS_GESTION: Record<VistaGestion, string> = {
  dashboard: 'Dashboard',
  orders: 'Órdenes de trabajo',
  products: 'Productos y stock',
  reports: 'Reportes de ventas',
  notifications: 'Notificaciones',
  audit: 'Auditoría',
  registros: 'Solicitudes de registro',
};
