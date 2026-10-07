export type OrderStatus =
  | 'RECIBIDA'
  | 'ACEPTADA'
  | 'EN_REPARACION'
  | 'LISTA_PARA_ENTREGA'
  | 'ENTREGADA'
  | 'CANCELADA';

export type AppRole = 'Admin' | 'Operador' | 'Cliente';

// Contrato de ms-talleres360-orders (OrderRequest / OrderResponse)
export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// El precio lo toma el front del catalogo (ms-catalog) al asignar el repuesto
export interface OrderItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderPayload {
  workshopId: number;
  customerName: string;
  customerEmail: string;
  vehiclePlate: string;
  vehicleModel: string;
  description: string;
  items: OrderItemInput[];
}

export interface Order {
  id: number;
  workshopId: number;
  customerName: string;
  customerEmail: string;
  vehiclePlate: string;
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

export interface Product { id: number; sku: string; name: string; stock: number; price: number; active: boolean; available: boolean; }
export interface ProductInput { sku: string; name: string; stock: number; price: number; active: boolean; }

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
