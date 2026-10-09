import type { AppRole } from '../types';

export type VistaGestion = 'dashboard' | 'orders' | 'products' | 'reports' | 'notifications' | 'audit';
export type DestinoGestion = VistaGestion | 'new-order';

export interface OpcionGestion {
  id: DestinoGestion;
  etiqueta: string;
  descripcion: string;
  roles: readonly AppRole[];
}
