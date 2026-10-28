export type OrderStatus =
  | 'RECIBIDA'
  | 'ACEPTADA'
  | 'EN_PREPARACION'
  | 'EN_REPARACION'
  | 'LISTA_PARA_ENTREGA'
  | 'ENTREGADA'
  | 'CANCELADA';

export type AppRole = 'Admin' | 'Operador' | 'Cliente';

// Contrato de ms-talleres360-orders (OrderRequest / OrderResponse)
export interface OrderItem {
  id: number;
  productId: number;
  description: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Solo se envía producto y cantidad: el servidor obtiene el precio del catálogo.
export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface OrderPayload {
  customerName: string;
  customerEmail: string;
  customerRut: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  description: string;
  items: OrderItemInput[];
}

export interface Order {
  compraRepuestos: boolean;
  aceptacionPendiente: boolean;
  motivoRechazo: string | null;
  id: number;
  workshopId: number;
  customerName: string;
  customerEmail: string;
  customerRut: string | null;
  customerPhone: string | null;
  vehicleYear: number | null;
  serviceType: 'MAINTENANCE' | 'DIAGNOSTICS' | null;
  regionId: string | null;
  appointmentDate: string | null;
  diagnosis: string | null;
  workPerformed: string | null;
  laborCost: number;
  estimatedDeliveryDate: string | null;
  technicalUpdatedAt: string | null;
  vehiclePlate: string | null;
  vehicleModel: string | null;
  description: string | null;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  deliveredAt: string | null;
}

export interface TechnicalPayload {
  diagnosis: string;
  workPerformed: string;
  laborCost: number;
  estimatedDeliveryDate: string;
  items: OrderItemInput[];
}

export interface StockConfirmation {
  revision: number;
  confirmedRevision: number;
  pending: boolean;
  quantities: Record<string, number>;
}

export interface Product { id: number; sku: string; name: string; stock: number; price: number; active: boolean; available: boolean; categoriaId?: number | null; categoriaNombre?: string; }
export type ProductoCatalogo = Omit<Product, 'stock'>;
export interface ProductInput { sku: string; name: string; stock: number; price: number; active: boolean; categoriaId?: number | null; }
export interface Categoria { id: number; nombre: string; descripcion: string | null; activa: boolean; }
export interface CategoriaInput { nombre: string; descripcion: string; activa: boolean; }
export interface SolicitudRegistro { nombre: string; correo: string; creadaEn: string; }

export interface OrderFilters {
  status: string;
  from: string;
  to: string;
}

export interface Session {
  name: string;
  username: string;
  roles: string[];
  logout: () => Promise<void>;
}
